import { supabase } from "./supabase"

export interface AuditLog {
  id: string
  user_id: string
  user_email: string
  action: string
  resource_type: string
  resource_id: string
  old_values?: any
  new_values?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface AuditTrailOptions {
  userId: string
  userEmail: string
  action: string
  resourceType: string
  resourceId: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}

class AuditTrailService {
  async log(options: AuditTrailOptions): Promise<void> {
    try {
      const auditLog = {
        user_id: options.userId,
        user_email: options.userEmail,
        action: options.action,
        resource_type: options.resourceType,
        resource_id: options.resourceId,
        old_values: options.oldValues || null,
        new_values: options.newValues || null,
        ip_address: options.ipAddress || null,
        user_agent: options.userAgent || null,
        created_at: new Date().toISOString(),
      }

      // Try to insert into audit_logs table
      const { error } = await supabase.from("audit_logs").insert(auditLog)

      if (error) {
        // If table doesn't exist, log to console for now
        console.log("Audit Log (Table not found):", auditLog)
        return
      }

      console.log("Audit log recorded:", auditLog)
    } catch (error) {
      console.error("Failed to record audit log:", error)
      // Don't throw error to avoid breaking main functionality
    }
  }

  async getLogs(filters?: {
    userId?: string
    resourceType?: string
    action?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<AuditLog[]> {
    try {
      let query = supabase.from("audit_logs").select("*").order("created_at", { ascending: false })

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId)
      }

      if (filters?.resourceType) {
        query = query.eq("resource_type", filters.resourceType)
      }

      if (filters?.action) {
        query = query.eq("action", filters.action)
      }

      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching audit logs:", error)
        return this.getMockAuditLogs()
      }

      return data || []
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      return this.getMockAuditLogs()
    }
  }

  private getMockAuditLogs(): AuditLog[] {
    return [
      {
        id: "1",
        user_id: "admin-1",
        user_email: "admin@example.com",
        action: "CREATE",
        resource_type: "airdrop",
        resource_id: "airdrop-123",
        old_values: null,
        new_values: { title: "New DeFi Airdrop", status: "pending" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0...",
        created_at: "2024-01-30T10:00:00Z",
      },
      {
        id: "2",
        user_id: "admin-1",
        user_email: "admin@example.com",
        action: "UPDATE",
        resource_type: "airdrop",
        resource_id: "airdrop-123",
        old_values: { status: "pending" },
        new_values: { status: "active" },
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0...",
        created_at: "2024-01-30T11:00:00Z",
      },
      {
        id: "3",
        user_id: "admin-1",
        user_email: "admin@example.com",
        action: "DELETE",
        resource_type: "user",
        resource_id: "user-456",
        old_values: { email: "spam@example.com", status: "banned" },
        new_values: null,
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0...",
        created_at: "2024-01-30T09:00:00Z",
      },
    ]
  }

  // Helper methods for common actions
  async logAirdropCreate(userId: string, userEmail: string, airdropId: string, airdropData: any) {
    await this.log({
      userId,
      userEmail,
      action: "CREATE",
      resourceType: "airdrop",
      resourceId: airdropId,
      newValues: airdropData,
    })
  }

  async logAirdropUpdate(userId: string, userEmail: string, airdropId: string, oldData: any, newData: any) {
    await this.log({
      userId,
      userEmail,
      action: "UPDATE",
      resourceType: "airdrop",
      resourceId: airdropId,
      oldValues: oldData,
      newValues: newData,
    })
  }

  async logAirdropDelete(userId: string, userEmail: string, airdropId: string, airdropData: any) {
    await this.log({
      userId,
      userEmail,
      action: "DELETE",
      resourceType: "airdrop",
      resourceId: airdropId,
      oldValues: airdropData,
    })
  }

  async logUserAction(userId: string, userEmail: string, action: string, targetUserId: string, changes?: any) {
    await this.log({
      userId,
      userEmail,
      action,
      resourceType: "user",
      resourceId: targetUserId,
      newValues: changes,
    })
  }

  async logVerificationAction(
    userId: string,
    userEmail: string,
    verificationId: string,
    action: string,
    reason?: string,
  ) {
    await this.log({
      userId,
      userEmail,
      action: `VERIFICATION_${action.toUpperCase()}`,
      resourceType: "verification",
      resourceId: verificationId,
      newValues: { reason },
    })
  }
}

export const auditTrail = new AuditTrailService()

// Helper hook for getting user info
export function useAuditInfo() {
  // This would typically get current user info from auth context
  return {
    userId: "current-admin-id",
    userEmail: "admin@example.com",
    ipAddress: "192.168.1.1",
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Server",
  }
}
