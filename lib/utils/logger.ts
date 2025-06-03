type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: any
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
}

interface LogOptions {
  timestamp?: boolean
  level?: boolean
  context?: boolean
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private isDevelopment = process.env.NODE_ENV === "development"
  private sessionId = this.generateSessionId()
  private defaultOptions: LogOptions = {
    timestamp: true,
    level: true,
    context: true,
  }
  private options: LogOptions

  constructor(options: LogOptions = {}) {
    this.options = { ...this.defaultOptions, ...options }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      data: this.serializeData(data), // PERBAIKAN: Proper data serialization
      sessionId: this.sessionId,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }
  }

  // PERBAIKAN: Better data serialization untuk handle Error objects
  private serializeData(data: any): any {
    if (!data) return data

    try {
      // Handle Error objects specifically
      if (data.error instanceof Error) {
        return {
          ...data,
          error: {
            message: data.error.message,
            stack: data.error.stack,
            name: data.error.name,
            cause: data.error.cause,
          },
        }
      }

      // Handle nested Error objects
      if (typeof data === "object") {
        const serialized: any = {}
        for (const [key, value] of Object.entries(data)) {
          if (value instanceof Error) {
            serialized[key] = {
              message: value.message,
              stack: value.stack,
              name: value.name,
              cause: value.cause,
            }
          } else if (typeof value === "object" && value !== null) {
            // Recursive serialization for nested objects
            serialized[key] = this.serializeData(value)
          } else {
            serialized[key] = value
          }
        }
        return serialized
      }

      // For primitive types, return as-is
      return data
    } catch (error) {
      // Fallback: return string representation
      return { serialization_error: String(data) }
    }
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = entry.level === "debug" ? "log" : entry.level
      console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.message}`, entry.data || "")
    }

    // Send to external logging service in production
    if (!this.isDevelopment && (entry.level === "error" || entry.level === "warn")) {
      this.sendToExternalService(entry).catch(console.error)
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const parts: string[] = []

    if (this.options.timestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    if (this.options.level) {
      const levelFormatted = level.toUpperCase().padEnd(5, " ")
      parts.push(`[${levelFormatted}]`)
    }

    parts.push(message)

    if (meta && this.options.context) {
      try {
        const metaStr = typeof meta === "string" ? meta : JSON.stringify(meta)
        parts.push(`- ${metaStr}`)
      } catch (e) {
        parts.push("- [Complex Object]")
      }
    }

    return parts.join(" ")
  }

  debug(message: string, data?: any): void {
    const entry = this.createLogEntry("debug", message, data)
    this.addLog(entry)
    if (process.env.NODE_ENV !== "production") {
      const formattedMessage = this.formatMessage("debug", message, data)
      console.debug(formattedMessage)
    }
  }

  info(message: string, data?: any): void {
    const entry = this.createLogEntry("info", message, data)
    this.addLog(entry)
    const formattedMessage = this.formatMessage("info", message, data)
    console.log(formattedMessage)
  }

  warn(message: string, data?: any): void {
    const entry = this.createLogEntry("warn", message, data)
    this.addLog(entry)
    const formattedMessage = this.formatMessage("warn", message, data)
    console.warn(formattedMessage)
  }

  error(message: string, data?: any): void {
    const entry = this.createLogEntry("error", message, data)
    this.addLog(entry)
    const formattedMessage = this.formatMessage("error", message, data)
    console.error(formattedMessage)

    // Also log to console.error in production for critical errors
    if (!this.isDevelopment) {
      console.error(`[ERROR] ${message}`, entry.data)
    }
  }

  // Get recent logs
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = level ? this.logs.filter((log) => log.level === level) : this.logs

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit)
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Set user context
  setUserContext(userId: string): void {
    this.logs.forEach((log) => {
      if (!log.userId) {
        log.userId = userId
      }
    })
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }

  // Send logs to external service (implement based on your needs)
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // Example: Send to your logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })

      // For now, just store in localStorage as fallback
      if (typeof window !== "undefined") {
        const existingLogs = localStorage.getItem("app_logs")
        const logs = existingLogs ? JSON.parse(existingLogs) : []
        logs.push(entry)

        // Keep only last 100 logs in localStorage
        const recentLogs = logs.slice(-100)
        localStorage.setItem("app_logs", JSON.stringify(recentLogs))
      }
    } catch (error) {
      console.error("Failed to send log to external service:", error)
    }
  }

  // Get system info for debugging
  getSystemInfo() {
    const info: any = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      environment: process.env.NODE_ENV,
    }

    if (typeof window !== "undefined") {
      info.userAgent = window.navigator.userAgent
      info.url = window.location.href
      info.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      info.memory = (performance as any).memory
        ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit,
          }
        : undefined
    }

    return info
  }
}

// Create singleton instance
export const logger = new Logger()

// PERBAIKAN: Better global error handler dengan proper serialization
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    logger.error("Global error caught", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled promise rejection", {
      reason:
        event.reason instanceof Error
          ? {
              message: event.reason.message,
              stack: event.reason.stack,
              name: event.reason.name,
            }
          : event.reason,
    })
  })
}
