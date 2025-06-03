import { logger } from "@/lib/utils/logger"

export interface Alert {
  id: string
  type: "error" | "warning" | "info" | "critical"
  title: string
  message: string
  timestamp: Date
  resolved: boolean
  metadata?: any
}

export interface AlertRule {
  id: string
  name: string
  condition: (metrics: any) => boolean
  severity: "low" | "medium" | "high" | "critical"
  cooldown: number // minutes
  enabled: boolean
}

class AlertManager {
  private alerts: Alert[] = []
  private rules: AlertRule[] = []
  private lastTriggered: Map<string, Date> = new Map()

  constructor() {
    this.setupDefaultRules()
  }

  private setupDefaultRules() {
    this.rules = [
      {
        id: "high_error_rate",
        name: "High Error Rate",
        condition: (metrics) => metrics.errorRate > 0.05, // 5%
        severity: "high",
        cooldown: 15,
        enabled: true,
      },
      {
        id: "low_performance",
        name: "Low Performance",
        condition: (metrics) => metrics.avgResponseTime > 3000, // 3s
        severity: "medium",
        cooldown: 30,
        enabled: true,
      },
      {
        id: "database_connection_failed",
        name: "Database Connection Failed",
        condition: (metrics) => metrics.dbConnectionFailed,
        severity: "critical",
        cooldown: 5,
        enabled: true,
      },
      {
        id: "unusual_traffic",
        name: "Unusual Traffic Pattern",
        condition: (metrics) => metrics.trafficSpike > 5, // 5x normal
        severity: "medium",
        cooldown: 60,
        enabled: true,
      },
      {
        id: "auth_failures",
        name: "High Authentication Failures",
        condition: (metrics) => metrics.authFailureRate > 0.1, // 10%
        severity: "high",
        cooldown: 10,
        enabled: true,
      },
    ]
  }

  checkRules(metrics: any) {
    for (const rule of this.rules) {
      if (!rule.enabled) continue

      // Check cooldown
      const lastTriggered = this.lastTriggered.get(rule.id)
      if (lastTriggered) {
        const cooldownMs = rule.cooldown * 60 * 1000
        if (Date.now() - lastTriggered.getTime() < cooldownMs) {
          continue
        }
      }

      // Check condition
      if (rule.condition(metrics)) {
        this.triggerAlert(rule, metrics)
      }
    }
  }

  private triggerAlert(rule: AlertRule, metrics: any) {
    const alert: Alert = {
      id: `${rule.id}_${Date.now()}`,
      type: this.severityToType(rule.severity),
      title: rule.name,
      message: this.generateAlertMessage(rule, metrics),
      timestamp: new Date(),
      resolved: false,
      metadata: { rule: rule.id, metrics },
    }

    this.alerts.unshift(alert)
    this.lastTriggered.set(rule.id, new Date())

    // Log alert
    logger.warn(`Alert triggered: ${rule.name}`, {
      alertId: alert.id,
      severity: rule.severity,
      metrics,
    })

    // Send notifications
    this.sendNotification(alert)

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000)
    }
  }

  private severityToType(severity: string): Alert["type"] {
    switch (severity) {
      case "critical":
        return "error"
      case "high":
        return "error"
      case "medium":
        return "warning"
      case "low":
        return "info"
      default:
        return "info"
    }
  }

  private generateAlertMessage(rule: AlertRule, metrics: any): string {
    switch (rule.id) {
      case "high_error_rate":
        return `Error rate is ${(metrics.errorRate * 100).toFixed(2)}% (threshold: 5%)`
      case "low_performance":
        return `Average response time is ${metrics.avgResponseTime}ms (threshold: 3000ms)`
      case "database_connection_failed":
        return "Database connection failed. Check database status."
      case "unusual_traffic":
        return `Traffic spike detected: ${metrics.trafficSpike}x normal volume`
      case "auth_failures":
        return `Authentication failure rate is ${(metrics.authFailureRate * 100).toFixed(2)}% (threshold: 10%)`
      default:
        return `Alert condition met for ${rule.name}`
    }
  }

  private async sendNotification(alert: Alert) {
    try {
      // Send to external services (email, Slack, etc.)
      if (process.env.NODE_ENV === "production") {
        // Example: Send to webhook
        if (process.env.ALERT_WEBHOOK_URL) {
          await fetch(process.env.ALERT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `🚨 ${alert.title}: ${alert.message}`,
              severity: alert.type,
              timestamp: alert.timestamp,
            }),
          })
        }

        // Example: Send email for critical alerts
        if (alert.type === "error" && process.env.ADMIN_EMAIL) {
          // Implement email sending logic
          console.log(`Would send email to ${process.env.ADMIN_EMAIL}`)
        }
      }

      // Always log to console in development
      if (process.env.NODE_ENV === "development") {
        console.warn(`🚨 ALERT: ${alert.title} - ${alert.message}`)
      }
    } catch (error) {
      logger.error("Failed to send alert notification", { error, alert })
    }
  }

  getAlerts(limit = 50): Alert[] {
    return this.alerts.slice(0, limit)
  }

  getUnresolvedAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.resolved)
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
      logger.info(`Alert resolved: ${alert.title}`, { alertId })
    }
  }

  addRule(rule: AlertRule) {
    this.rules.push(rule)
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) {
      Object.assign(rule, updates)
    }
  }

  getRules(): AlertRule[] {
    return [...this.rules]
  }
}

export const alertManager = new AlertManager()
