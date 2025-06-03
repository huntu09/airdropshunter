import { logger } from "@/lib/utils/logger"
import { alertManager } from "./alerts"

interface MetricData {
  timestamp: Date
  value: number
  tags?: Record<string, string>
}

interface AggregatedMetrics {
  errorRate: number
  avgResponseTime: number
  requestCount: number
  dbConnectionFailed: boolean
  trafficSpike: number
  authFailureRate: number
  memoryUsage: number
  cpuUsage: number
}

class MetricsCollector {
  private metrics: Map<string, MetricData[]> = new Map()
  private readonly maxDataPoints = 1000
  private readonly aggregationInterval = 60000 // 1 minute

  constructor() {
    // Start periodic aggregation
    setInterval(() => {
      this.aggregateAndCheck()
    }, this.aggregationInterval)
  }

  record(metricName: string, value: number, tags?: Record<string, string>) {
    const data: MetricData = {
      timestamp: new Date(),
      value,
      tags,
    }

    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, [])
    }

    const metricData = this.metrics.get(metricName)!
    metricData.unshift(data)

    // Keep only recent data points
    if (metricData.length > this.maxDataPoints) {
      metricData.splice(this.maxDataPoints)
    }

    logger.debug(`Metric recorded: ${metricName}`, { value, tags })
  }

  increment(metricName: string, tags?: Record<string, string>) {
    this.record(metricName, 1, tags)
  }

  timing(metricName: string, duration: number, tags?: Record<string, string>) {
    this.record(metricName, duration, tags)
  }

  gauge(metricName: string, value: number, tags?: Record<string, string>) {
    this.record(metricName, value, tags)
  }

  private aggregateAndCheck() {
    try {
      const aggregated = this.getAggregatedMetrics()

      // Log aggregated metrics
      logger.info("Metrics aggregated", aggregated)

      // Check alert rules
      alertManager.checkRules(aggregated)

      // Send to external monitoring (if configured)
      this.sendToExternalMonitoring(aggregated)
    } catch (error) {
      logger.error("Error in metrics aggregation", { error })
    }
  }

  private getAggregatedMetrics(): AggregatedMetrics {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)

    return {
      errorRate: this.calculateErrorRate(oneMinuteAgo),
      avgResponseTime: this.calculateAverage("response_time", oneMinuteAgo),
      requestCount: this.countMetrics("request", oneMinuteAgo),
      dbConnectionFailed: this.hasRecentMetric("db_connection_error", oneMinuteAgo),
      trafficSpike: this.calculateTrafficSpike(oneMinuteAgo),
      authFailureRate: this.calculateAuthFailureRate(oneMinuteAgo),
      memoryUsage: this.getLatestValue("memory_usage") || 0,
      cpuUsage: this.getLatestValue("cpu_usage") || 0,
    }
  }

  private calculateErrorRate(since: Date): number {
    const errors = this.countMetrics("error", since)
    const requests = this.countMetrics("request", since)
    return requests > 0 ? errors / requests : 0
  }

  private calculateAverage(metricName: string, since: Date): number {
    const data = this.getMetricsSince(metricName, since)
    if (data.length === 0) return 0

    const sum = data.reduce((acc, d) => acc + d.value, 0)
    return sum / data.length
  }

  private countMetrics(metricName: string, since: Date): number {
    return this.getMetricsSince(metricName, since).length
  }

  private hasRecentMetric(metricName: string, since: Date): boolean {
    return this.getMetricsSince(metricName, since).length > 0
  }

  private calculateTrafficSpike(since: Date): number {
    const currentRequests = this.countMetrics("request", since)
    const previousPeriod = new Date(since.getTime() - 60000)
    const previousRequests = this.countMetrics("request", previousPeriod)

    return previousRequests > 0 ? currentRequests / previousRequests : 1
  }

  private calculateAuthFailureRate(since: Date): number {
    const failures = this.countMetrics("auth_failure", since)
    const attempts = this.countMetrics("auth_attempt", since)
    return attempts > 0 ? failures / attempts : 0
  }

  private getLatestValue(metricName: string): number | null {
    const data = this.metrics.get(metricName)
    return data && data.length > 0 ? data[0].value : null
  }

  private getMetricsSince(metricName: string, since: Date): MetricData[] {
    const data = this.metrics.get(metricName) || []
    return data.filter((d) => d.timestamp >= since)
  }

  private async sendToExternalMonitoring(metrics: AggregatedMetrics) {
    if (process.env.MONITORING_ENDPOINT) {
      try {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            metrics,
            source: "airdropshunter",
          }),
        })
      } catch (error) {
        logger.error("Failed to send metrics to external monitoring", { error })
      }
    }
  }

  // Public methods for getting metrics
  getMetrics(metricName: string, limit = 100): MetricData[] {
    const data = this.metrics.get(metricName) || []
    return data.slice(0, limit)
  }

  getAllMetrics(): Record<string, MetricData[]> {
    const result: Record<string, MetricData[]> = {}
    for (const [key, value] of this.metrics.entries()) {
      result[key] = value.slice(0, 100) // Limit for performance
    }
    return result
  }

  getSystemMetrics() {
    if (typeof window !== "undefined" && "performance" in window) {
      // Browser metrics
      const memory = (performance as any).memory
      if (memory) {
        this.gauge("memory_usage", memory.usedJSHeapSize / memory.jsHeapSizeLimit)
      }

      // Navigation timing
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navigation) {
        this.timing("page_load_time", navigation.loadEventEnd - navigation.fetchStart)
      }
    }
  }
}

export const metricsCollector = new MetricsCollector()

// Helper functions for common metrics
export const metrics = {
  recordRequest: (path: string, method: string, statusCode: number, duration: number) => {
    metricsCollector.increment("request", { path, method, status: statusCode.toString() })
    metricsCollector.timing("response_time", duration, { path, method })

    if (statusCode >= 400) {
      metricsCollector.increment("error", { path, method, status: statusCode.toString() })
    }
  },

  recordAuth: (success: boolean, method: string) => {
    metricsCollector.increment("auth_attempt", { method })
    if (!success) {
      metricsCollector.increment("auth_failure", { method })
    }
  },

  recordDbOperation: (operation: string, success: boolean, duration: number) => {
    metricsCollector.timing("db_operation_time", duration, { operation })
    metricsCollector.increment("db_operation", { operation, success: success.toString() })

    if (!success) {
      metricsCollector.increment("db_connection_error", { operation })
    }
  },

  recordAirdropAction: (action: string, airdropId: string, userId?: string) => {
    metricsCollector.increment("airdrop_action", { action, airdrop_id: airdropId })
  },

  recordPageView: (path: string, userAgent?: string) => {
    metricsCollector.increment("page_view", { path })

    // Detect mobile vs desktop
    if (userAgent) {
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
      metricsCollector.increment("page_view_device", { device: isMobile ? "mobile" : "desktop" })
    }
  },
}
