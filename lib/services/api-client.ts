import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { cache } from "@/lib/utils/cache"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  cache?: boolean
  cacheKey?: string
  cacheTTL?: number
  retries?: number
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = []
  private responseInterceptors: Array<(response: any) => any> = []

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || ""
    this.defaultHeaders = {
      "Content-Type": "application/json",
    }
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig) {
    this.requestInterceptors.push(interceptor)
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: (response: any) => any) {
    this.responseInterceptors.push(interceptor)
  }

  // Apply request interceptors
  private applyRequestInterceptors(config: RequestConfig): RequestConfig {
    return this.requestInterceptors.reduce((acc, interceptor) => interceptor(acc), config)
  }

  // Apply response interceptors
  private applyResponseInterceptors(response: any): any {
    return this.responseInterceptors.reduce((acc, interceptor) => interceptor(acc), response)
  }

  // Generic request method
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const startTime = Date.now()
    const requestId = Math.random().toString(36).substr(2, 9)

    try {
      // Apply request interceptors
      const processedConfig = this.applyRequestInterceptors(config)

      // Check cache first
      if (processedConfig.cache && processedConfig.method === "GET") {
        const cacheKey = processedConfig.cacheKey || `${endpoint}_${JSON.stringify(config)}`
        const cachedData = cache.get<T>(cacheKey)
        if (cachedData) {
          logger.info("Cache hit", { endpoint, requestId, cacheKey })
          return cachedData
        }
      }

      // Prepare request
      const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`
      const headers = { ...this.defaultHeaders, ...processedConfig.headers }

      // Add auth header if available
      const session = await supabase.auth.getSession()
      if (session.data.session?.access_token) {
        headers.Authorization = `Bearer ${session.data.session.access_token}`
      }

      const requestOptions: RequestInit = {
        method: processedConfig.method || "GET",
        headers,
        signal: processedConfig.timeout ? AbortSignal.timeout(processedConfig.timeout) : undefined,
      }

      if (processedConfig.body && processedConfig.method !== "GET") {
        requestOptions.body = JSON.stringify(processedConfig.body)
      }

      logger.info("API Request", {
        requestId,
        method: requestOptions.method,
        url,
        headers: Object.keys(headers),
      })

      // Make request with retries
      let lastError: Error
      const maxRetries = processedConfig.retries || 3

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, requestOptions)
          const duration = Date.now() - startTime

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new ApiError(
              errorData.message || `HTTP ${response.status}`,
              response.status,
              errorData.code,
              errorData,
            )
          }

          const data = await response.json()
          const processedData = this.applyResponseInterceptors(data)

          // Cache successful GET requests
          if (processedConfig.cache && processedConfig.method === "GET") {
            const cacheKey = processedConfig.cacheKey || `${endpoint}_${JSON.stringify(config)}`
            const ttl = processedConfig.cacheTTL || 300000 // 5 minutes default
            cache.set(cacheKey, processedData, ttl)
          }

          logger.info("API Response", {
            requestId,
            status: response.status,
            duration,
            cached: false,
          })

          return processedData
        } catch (error) {
          lastError = error as Error

          if (attempt < maxRetries && this.shouldRetry(error as Error)) {
            const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delay))
            logger.warn("API Request retry", { requestId, attempt: attempt + 1, error: lastError.message })
            continue
          }

          break
        }
      }

      // Log final error
      logger.error("API Request failed", {
        requestId,
        error: lastError.message,
        duration: Date.now() - startTime,
      })

      throw lastError
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(error instanceof Error ? error.message : "Unknown error", 0, "NETWORK_ERROR", error)
    }
  }

  private shouldRetry(error: Error): boolean {
    if (error instanceof ApiError) {
      // Retry on server errors but not client errors
      return error.status >= 500 || error.status === 0
    }

    // Retry on network errors
    return error.name === "TypeError" || error.message.includes("fetch")
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: Omit<RequestConfig, "method">): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" })
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "POST", body })
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "PUT", body })
  }

  async patch<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "PATCH", body })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, "method">): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Add default interceptors
apiClient.addRequestInterceptor((config) => {
  // Add timestamp to prevent caching issues
  if (config.method === "GET") {
    config.headers = {
      ...config.headers,
      "X-Request-Time": Date.now().toString(),
    }
  }
  return config
})

apiClient.addResponseInterceptor((response) => {
  // Transform response if needed
  return response
})
