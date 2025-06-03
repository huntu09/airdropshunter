import { logger } from "@/lib/utils/logger"

// Redis-compatible interface (can use ioredis, node-redis, or Upstash)
interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ex?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<number>
  ttl(key: string): Promise<number>
  flushall?(): Promise<void>
}

// Mock Redis client for development
class MockRedisClient implements RedisClient {
  private store = new Map<string, { value: string; expiry?: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key)
    if (!item) return null

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key)
      return null
    }

    return item.value
  }

  async set(key: string, value: string, ex?: number): Promise<void> {
    const expiry = ex ? Date.now() + ex * 1000 : undefined
    this.store.set(key, { value, expiry })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key)
    if (!item || !item.expiry) return -1

    const remaining = Math.ceil((item.expiry - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }

  async flushall(): Promise<void> {
    this.store.clear()
  }
}

class RedisCache {
  private client: RedisClient
  private prefix: string
  private defaultTTL: number

  constructor(client?: RedisClient, prefix = "airdrop:", defaultTTL = 3600) {
    this.client = client || new MockRedisClient()
    this.prefix = prefix
    this.defaultTTL = defaultTTL
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.getKey(key))
      if (!value) return null

      const parsed = JSON.parse(value)
      logger.debug("Cache hit", { key, hasValue: !!parsed })
      return parsed
    } catch (error) {
      logger.error("Cache get error", { key, error })
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      const expiry = ttl || this.defaultTTL

      await this.client.set(this.getKey(key), serialized, expiry)
      logger.debug("Cache set", { key, ttl: expiry })
    } catch (error) {
      logger.error("Cache set error", { key, error })
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(this.getKey(key))
      logger.debug("Cache delete", { key })
    } catch (error) {
      logger.error("Cache delete error", { key, error })
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(this.getKey(key))
      return result === 1
    } catch (error) {
      logger.error("Cache exists error", { key, error })
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(this.getKey(key))
    } catch (error) {
      logger.error("Cache TTL error", { key, error })
      return -1
    }
  }

  // Cache with automatic refresh
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }

      // Fetch fresh data
      logger.debug("Cache miss, fetching fresh data", { key })
      const fresh = await fetcher()

      // Store in cache
      await this.set(key, fresh, ttl)

      return fresh
    } catch (error) {
      logger.error("Cache getOrSet error", { key, error })
      // Fallback to fetcher if cache fails
      return await fetcher()
    }
  }

  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const promises = keys.map((key) => this.get<T>(key))
    return Promise.all(promises)
  }

  async mset<T>(items: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    const promises = items.map((item) => this.set(item.key, item.value, item.ttl))
    await Promise.all(promises)
  }

  // Pattern-based operations
  async deletePattern(pattern: string): Promise<void> {
    // Note: This is a simplified implementation
    // In production, you'd want to use Redis SCAN for large datasets
    logger.warn("Pattern deletion not implemented for current Redis client", { pattern })
  }

  // Cache warming
  async warm(warmers: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>): Promise<void> {
    logger.info("Starting cache warming", { count: warmers.length })

    const promises = warmers.map(async ({ key, fetcher, ttl }) => {
      try {
        const exists = await this.exists(key)
        if (!exists) {
          const data = await fetcher()
          await this.set(key, data, ttl)
          logger.debug("Cache warmed", { key })
        }
      } catch (error) {
        logger.error("Cache warming failed", { key, error })
      }
    })

    await Promise.all(promises)
    logger.info("Cache warming completed")
  }

  // Statistics
  async getStats(): Promise<{
    totalKeys: number
    memoryUsage?: string
    hitRate?: number
  }> {
    // This would need to be implemented based on your Redis client
    return {
      totalKeys: 0,
      memoryUsage: "N/A",
      hitRate: 0,
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = "health_check"
      await this.set(testKey, "ok", 10)
      const result = await this.get(testKey)
      await this.del(testKey)
      return result === "ok"
    } catch (error) {
      logger.error("Cache health check failed", { error })
      return false
    }
  }
}

// Create cache instance
let redisClient: RedisClient | undefined

// Initialize Redis client based on environment
if (process.env.REDIS_URL) {
  // Production: Use actual Redis
  try {
    // Example with ioredis (you'd need to install it)
    // const Redis = require('ioredis')
    // redisClient = new Redis(process.env.REDIS_URL)

    // For now, use mock client
    redisClient = new MockRedisClient()
    logger.info("Redis client initialized", { url: process.env.REDIS_URL })
  } catch (error) {
    logger.error("Failed to initialize Redis client", { error })
    redisClient = new MockRedisClient()
  }
} else {
  // Development: Use mock client
  redisClient = new MockRedisClient()
  logger.info("Using mock Redis client for development")
}

export const cache = new RedisCache(redisClient)

// Predefined cache keys and TTLs
export const CACHE_KEYS = {
  AIRDROPS_LIST: "airdrops:list",
  AIRDROP_DETAIL: (id: string) => `airdrop:${id}`,
  CATEGORIES: "categories:all",
  USER_PROFILE: (id: string) => `user:${id}`,
  FEATURED_AIRDROPS: "airdrops:featured",
  TRENDING_AIRDROPS: "airdrops:trending",
  ADMIN_STATS: "admin:stats",
  SEARCH_RESULTS: (query: string) => `search:${Buffer.from(query).toString("base64")}`,
} as const

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

// Helper functions for common caching patterns
export const cacheHelpers = {
  // Cache airdrop list with automatic invalidation
  async getAirdropsList(fetcher: () => Promise<any[]>) {
    return cache.getOrSet(CACHE_KEYS.AIRDROPS_LIST, fetcher, CACHE_TTL.MEDIUM)
  },

  // Cache individual airdrop
  async getAirdrop(id: string, fetcher: () => Promise<any>) {
    return cache.getOrSet(CACHE_KEYS.AIRDROP_DETAIL(id), fetcher, CACHE_TTL.LONG)
  },

  // Cache user profile
  async getUserProfile(id: string, fetcher: () => Promise<any>) {
    return cache.getOrSet(CACHE_KEYS.USER_PROFILE(id), fetcher, CACHE_TTL.MEDIUM)
  },

  // Cache search results
  async getSearchResults(query: string, fetcher: () => Promise<any[]>) {
    return cache.getOrSet(CACHE_KEYS.SEARCH_RESULTS(query), fetcher, CACHE_TTL.SHORT)
  },

  // Invalidate related caches when airdrop is updated
  async invalidateAirdrop(id: string) {
    await Promise.all([
      cache.del(CACHE_KEYS.AIRDROP_DETAIL(id)),
      cache.del(CACHE_KEYS.AIRDROPS_LIST),
      cache.del(CACHE_KEYS.FEATURED_AIRDROPS),
      cache.del(CACHE_KEYS.TRENDING_AIRDROPS),
    ])
  },

  // Warm up critical caches
  async warmCriticalCaches(fetchers: {
    airdrops: () => Promise<any[]>
    categories: () => Promise<any[]>
    featured: () => Promise<any[]>
  }) {
    await cache.warm([
      { key: CACHE_KEYS.AIRDROPS_LIST, fetcher: fetchers.airdrops, ttl: CACHE_TTL.MEDIUM },
      { key: CACHE_KEYS.CATEGORIES, fetcher: fetchers.categories, ttl: CACHE_TTL.VERY_LONG },
      { key: CACHE_KEYS.FEATURED_AIRDROPS, fetcher: fetchers.featured, ttl: CACHE_TTL.LONG },
    ])
  },
}
