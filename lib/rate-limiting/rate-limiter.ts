import { logger } from "@/lib/utils/logger"

interface RateLimitRule {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  check(identifier: string, rule: RateLimitRule): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = identifier

    let entry = this.store.get(key)

    // Create new entry or reset if window expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + rule.windowMs,
      }
      this.store.set(key, entry)
    }

    // Check if limit exceeded
    if (entry.count >= rule.maxRequests) {
      logger.warn("Rate limit exceeded", {
        identifier,
        count: entry.count,
        limit: rule.maxRequests,
        resetTime: entry.resetTime,
      })

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment counter
    entry.count++

    return {
      allowed: true,
      remaining: rule.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  reset(identifier: string) {
    this.store.delete(identifier)
  }

  getStats() {
    return {
      totalKeys: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
        resetTime: new Date(entry.resetTime).toISOString(),
      })),
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Predefined rate limit rules
export const RATE_LIMIT_RULES = {
  // API endpoints
  API_GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: "Too many API requests, please try again later",
  },

  API_AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many authentication attempts, please try again later",
  },

  API_ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: "Too many admin requests, please slow down",
  },

  // User actions
  AIRDROP_SUBMISSION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: "Too many airdrop submissions, please wait before submitting more",
  },

  TASK_COMPLETION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: "Too many task completions, please slow down",
  },

  // Security
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: "Too many password reset attempts, please try again later",
  },

  CONTACT_FORM: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: "Too many contact form submissions, please try again later",
  },
} as const

// Helper functions
export function createRateLimitKey(type: string, identifier: string): string {
  return `${type}:${identifier}`
}

export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for production behind proxy)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  return forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown"
}

// Middleware helper for Next.js API routes
export function withRateLimit(rule: RateLimitRule, keyGenerator?: (req: Request) => string) {
  return function rateLimitMiddleware(handler: Function) {
    return async (req: Request, ...args: any[]) => {
      const identifier = keyGenerator ? keyGenerator(req) : getClientIdentifier(req)
      const result = rateLimiter.check(identifier, rule)

      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: rule.message || "Rate limit exceeded",
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": rule.maxRequests.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.resetTime.toString(),
              "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            },
          },
        )
      }

      // Add rate limit headers to successful responses
      const response = await handler(req, ...args)

      if (response instanceof Response) {
        response.headers.set("X-RateLimit-Limit", rule.maxRequests.toString())
        response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
        response.headers.set("X-RateLimit-Reset", result.resetTime.toString())
      }

      return response
    }
  }
}
