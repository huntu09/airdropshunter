/**
 * Performance Monitoring Utilities
 * Tracks and reports web vitals and performance metrics
 */

import { getCLS, getFID, getLCP, getFCP, getTTFB } from "web-vitals"
import { logger } from "./logger"

// Types for performance metrics
export type MetricName = "CLS" | "FID" | "LCP" | "FCP" | "TTFB" | "INP"

export interface PerformanceMetric {
  name: MetricName
  value: number
  id: string
  delta: number
  entries: any[]
}

// Function to report metrics to analytics
function reportMetric(metric: PerformanceMetric) {
  // Log the metric
  logger.info(`Performance metric: ${metric.name}`, {
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
  })

  // Send to Google Analytics if available
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "web_vitals", {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_name: metric.name,
      metric_value: metric.value,
      metric_delta: metric.delta,
    })
  }

  // You can also send to your own analytics endpoint
  try {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      page: window.location.pathname,
      href: window.location.href,
    })

    // Use sendBeacon if available, otherwise use fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body)
    } else {
      fetch("/api/vitals", {
        body,
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    // Silent fail - don't break the user experience for metrics
    logger.error("Failed to report performance metric", { error, metric: metric.name })
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  try {
    if (typeof window !== "undefined") {
      // Core Web Vitals
      getCLS(reportMetric)
      getFID(reportMetric)
      getLCP(reportMetric)
      getFCP(reportMetric)
      getTTFB(reportMetric)

      // Custom performance marks
      if (performance && performance.mark) {
        performance.mark("app-initialized")
      }

      // Listen for route changes to measure navigation performance
      const startRouteChange = () => {
        performance.mark("route-change-start")
      }

      const endRouteChange = () => {
        performance.mark("route-change-end")
        try {
          performance.measure("route-change", "route-change-start", "route-change-end")
          const entries = performance.getEntriesByName("route-change")
          if (entries.length > 0) {
            const navigationTime = entries[0].duration
            logger.info("Route change performance", {
              duration: navigationTime,
              path: window.location.pathname,
            })
          }
        } catch (error) {
          logger.error("Error measuring route change", { error })
        }
      }

      // Add event listeners for route changes
      window.addEventListener("beforeunload", startRouteChange)
      window.addEventListener("load", endRouteChange)

      // Log resource timing data
      setTimeout(() => {
        if (performance && performance.getEntriesByType) {
          const resources = performance.getEntriesByType("resource")
          const slowResources = resources
            .filter((resource) => resource.duration > 1000)
            .map((resource) => ({
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              type: resource.initiatorType,
            }))

          if (slowResources.length > 0) {
            logger.warn("Slow resources detected", { resources: slowResources })
          }
        }
      }, 5000)
    }
  } catch (error) {
    logger.error("Failed to initialize performance monitoring", { error })
  }
}

// Track component render time
export function useComponentPerformance(componentName: string) {
  if (typeof performance === "undefined") return { trackRender: () => {} }

  const trackRender = () => {
    const startMark = `${componentName}-render-start`
    const endMark = `${componentName}-render-end`
    const measureName = `${componentName}-render-time`

    try {
      performance.mark(startMark)

      // Return function to be called after render
      return () => {
        performance.mark(endMark)
        performance.measure(measureName, startMark, endMark)

        const entries = performance.getEntriesByName(measureName)
        if (entries.length > 0) {
          const renderTime = entries[0].duration
          if (renderTime > 100) {
            // Only log slow renders
            logger.info(`Slow component render: ${componentName}`, {
              duration: renderTime,
              component: componentName,
            })
          }
        }

        // Clean up
        performance.clearMarks(startMark)
        performance.clearMarks(endMark)
        performance.clearMeasures(measureName)
      }
    } catch (error) {
      return () => {}
    }
  }

  return { trackRender }
}

// Export the initialization function
export default initPerformanceMonitoring
