import { logger } from "./logger"

interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

interface ErrorMetric {
  error: Error
  context?: any
  timestamp: Date
  userId?: string
  url?: string
}

interface MeasureResult<T> {
  result: T
  duration: number
}

class MonitoringService {
  private metrics: PerformanceMetric[] = []
  private errors: ErrorMetric[] = []
  private maxMetrics = 1000
  private maxErrors = 500

  // PERBAIKAN: Fix return format untuk match dengan component expectations
  async measureAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<MeasureResult<T>> {
    const startTime = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - startTime

      // Record success metric
      this.recordMetric(`${name}_duration`, duration, { ...tags, status: "success" })

      // PERBAIKAN: Return object dengan result dan duration (sesuai destructuring di component)
      return { result, duration }
    } catch (error) {
      const duration = performance.now() - startTime

      // Record error metric
      this.recordMetric(`${name}_duration`, duration, { ...tags, status: "error" })
      this.recordError(error as Error, { function: name, ...tags })

      // PERBAIKAN: Throw error dengan proper format
      throw error
    }
  }

  // Measure synchronous function execution time
  measure<T>(name: string, fn: () => T, tags?: Record<string, string>): MeasureResult<T> {
    const startTime = performance.now()

    try {
      const result = fn()
      const duration = performance.now() - startTime
      this.recordMetric(`${name}_duration`, duration, { ...tags, status: "success" })

      // PERBAIKAN: Consistent return format
      return { result, duration }
    } catch (error) {
      const duration = performance.now() - startTime
      this.recordMetric(`${name}_duration`, duration, { ...tags, status: "error" })
      this.recordError(error as Error, { function: name, ...tags })
      throw error
    }
  }

  // Performance monitoring
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      tags,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    logger.debug("Performance metric recorded", { name, value, tags })
  }

  // PERBAIKAN: Better error recording dengan proper serialization
  recordError(error: Error, context?: any): void {
    const errorMetric: ErrorMetric = {
      error,
      context,
      timestamp: new Date(),
      userId: context?.userId,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }

    this.errors.push(errorMetric)

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // PERBAIKAN: Proper error serialization untuk logger
    logger.error("Error recorded", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
    })
  }

  // Web Vitals monitoring (browser only)
  initWebVitals(): void {
    if (typeof window === "undefined") return

    try {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric("lcp", entry.startTime, { type: "web_vital" })
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] })

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime
          this.recordMetric("fid", fid, { type: "web_vital" })
        }
      }).observe({ entryTypes: ["first-input"] })

      // Cumulative Layout Shift
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.recordMetric("cls", clsValue, { type: "web_vital" })
      }).observe({ entryTypes: ["layout-shift"] })
    } catch (error) {
      logger.warn("Failed to initialize Web Vitals monitoring", { error: (error as Error).message })
    }
  }

  // Resource timing monitoring
  monitorResourceTiming(): void {
    if (typeof window === "undefined") return

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          this.recordMetric("resource_load_time", resource.duration, {
            type: "resource",
            name: resource.name,
            initiatorType: resource.initiatorType,
          })
        }
      }).observe({ entryTypes: ["resource"] })
    } catch (error) {
      logger.warn("Failed to initialize resource timing monitoring", { error: (error as Error).message })
    }
  }

  // Memory monitoring (if available)
  monitorMemory(): void {
    if (typeof window === "undefined" || !(performance as any).memory) return

    try {
      setInterval(() => {
        const memory = (performance as any).memory
        this.recordMetric("memory_used", memory.usedJSHeapSize, { type: "memory" })
        this.recordMetric("memory_total", memory.totalJSHeapSize, { type: "memory" })
      }, 30000) // Every 30 seconds
    } catch (error) {
      logger.warn("Failed to initialize memory monitoring", { error: (error as Error).message })
    }
  }

  // Get metrics summary
  getMetricsSummary(timeRange?: number): Record<string, any> {
    const cutoff = timeRange ? Date.now() - timeRange : 0
    const recentMetrics = this.metrics.filter((m) => m.timestamp.getTime() > cutoff)

    const summary: Record<string, any> = {}

    // Group by metric name
    const grouped = recentMetrics.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = []
        }
        acc[metric.name].push(metric.value)
        return acc
      },
      {} as Record<string, number[]>,
    )

    // Calculate statistics for each metric
    for (const [name, values] of Object.entries(grouped)) {
      summary[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99),
      }
    }

    return summary
  }

  // Get error summary
  getErrorSummary(timeRange?: number): Record<string, any> {
    const cutoff = timeRange ? Date.now() - timeRange : 0
    const recentErrors = this.errors.filter((e) => e.timestamp.getTime() > cutoff)

    const grouped = recentErrors.reduce(
      (acc, error) => {
        const key = error.error.message
        if (!acc[key]) {
          acc[key] = {
            count: 0,
            lastSeen: error.timestamp,
            contexts: [],
          }
        }
        acc[key].count++
        acc[key].lastSeen = error.timestamp
        acc[key].contexts.push(error.context)
        return acc
      },
      {} as Record<string, any>,
    )

    return grouped
  }

  // Calculate percentile
  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  // Export data for external monitoring
  exportData() {
    return {
      metrics: this.metrics,
      errors: this.errors.map((e) => ({
        message: e.error.message,
        stack: e.error.stack,
        name: e.error.name,
        context: e.context,
        timestamp: e.timestamp,
        userId: e.userId,
        url: e.url,
      })),
      summary: this.getMetricsSummary(),
      errorSummary: this.getErrorSummary(),
      timestamp: new Date().toISOString(),
    }
  }

  // Clear old data
  cleanup(maxAge = 3600000): void {
    // 1 hour default
    const cutoff = Date.now() - maxAge

    this.metrics = this.metrics.filter((m) => m.timestamp.getTime() > cutoff)
    this.errors = this.errors.filter((e) => e.timestamp.getTime() > cutoff)

    logger.info("Monitoring data cleaned up", {
      metricsRemaining: this.metrics.length,
      errorsRemaining: this.errors.length,
    })
  }
}

// Create singleton instance
export const monitoring = new MonitoringService()

// Initialize monitoring in browser
if (typeof window !== "undefined") {
  monitoring.initWebVitals()
  monitoring.monitorResourceTiming()
  monitoring.monitorMemory()

  // Cleanup old data every hour
  setInterval(() => {
    monitoring.cleanup()
  }, 3600000)
}
