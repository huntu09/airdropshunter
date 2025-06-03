import { createClient } from "@supabase/supabase-js"
import { auditTrail } from "./audit-trail"
import { ValidationService } from "./validation"
import { supabase, createSupabaseClient, createBrowserClient } from "./supabase-singleton"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client instance (singleton pattern)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Export the singleton instance
export { supabase, createSupabaseClient, createBrowserClient }

// Legacy exports for backward compatibility
export const createClientLegacy = createSupabaseClient
export default supabase

// Updated and standardized interfaces
export interface UserProfile {
  id: string
  email: string
  username: string
  full_name?: string
  role: "user" | "admin" | "moderator"
  status: "active" | "banned" | "pending"
  created_at: string
  updated_at?: string
  avatar_url?: string
  bio?: string
  wallet_address?: string
  twitter_handle?: string
  discord_handle?: string
  telegram_handle?: string
  points: number
  completed_airdrops: number
  referral_code?: string
  referred_by?: string
}

export interface Airdrop {
  id: string
  title: string
  description: string
  short_description?: string
  category: string
  status: "pending" | "active" | "completed" | "cancelled"
  reward_amount: string
  reward_type: "token" | "nft" | "other"
  blockchain: string
  difficulty_level: "easy" | "medium" | "hard"
  estimated_time: string
  start_date: string
  end_date: string
  logo_url?: string
  banner_url?: string
  website_url?: string
  twitter_url?: string
  discord_url?: string
  telegram_url?: string
  requirements?: string[]
  max_participants: number
  participants_count: number
  featured: boolean
  views_count: number
  priority: number
  created_by: string
  created_at: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  active: boolean
  sort_order: number
  created_at: string
}

export interface AirdropTask {
  id: string
  airdrop_id: string
  title: string
  description?: string
  task_type:
    | "social_follow"
    | "social_like"
    | "social_share"
    | "join_discord"
    | "join_telegram"
    | "visit_website"
    | "connect_wallet"
    | "hold_token"
    | "custom"
  required: boolean
  points_reward: number
  verification_method: "automatic" | "manual" | "api"
  task_data?: any
  sort_order: number
  active: boolean
  created_at: string
  updated_at?: string
}

export interface UserTaskProgress {
  id: string
  user_id: string
  airdrop_id: string
  task_id: string
  completed_at?: string
  submission_data?: any
  verification_status: "pending" | "approved" | "rejected"
  created_at: string
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
}

// Retry helper function
export async function withRetry<T>(operation: () => Promise<T>, retries = RETRY_CONFIG.maxRetries): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    if (retries > 0 && (error.code === "PGRST301" || error.message?.includes("timeout"))) {
      const delay = Math.min(RETRY_CONFIG.baseDelay * (RETRY_CONFIG.maxRetries - retries + 1), RETRY_CONFIG.maxDelay)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

// Enhanced database helper functions with validation and audit trail
export const dbHelpers = {
  // User related functions
  users: {
    async getProfile(userId: string) {
      return withRetry(async () => {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
        if (error) throw error
        return data as UserProfile
      })
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>, auditInfo?: any) {
      return withRetry(async () => {
        // Validate updates
        const validation = ValidationService.validateUser({ ...updates })
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(", ")}`)
        }

        // Get old values for audit trail
        const oldData = await this.getProfile(userId)

        const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()
        if (error) throw error

        // Log audit trail
        if (auditInfo) {
          await auditTrail.logUserAction(auditInfo.userId, auditInfo.userEmail, "UPDATE", userId, {
            old: oldData,
            new: updates,
          })
        }

        return data as UserProfile
      })
    },
  },

  // Airdrop related functions with enhanced validation
  airdrops: {
    async getAll(filters?: { category?: string; status?: string; featured?: boolean }) {
      return withRetry(async () => {
        let query = supabase.from("airdrops").select("*, logo_url, banner_url")

        if (filters?.category) {
          query = query.eq("category", filters.category)
        }

        if (filters?.status) {
          query = query.eq("status", filters.status)
        }

        if (filters?.featured !== undefined) {
          query = query.eq("featured", filters.featured)
        }

        const { data, error } = await query
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false })
        if (error) throw error
        return data as Airdrop[]
      })
    },

    async getById(id: string) {
      return withRetry(async () => {
        const { data, error } = await supabase.from("airdrops").select("*, logo_url, banner_url").eq("id", id).single()
        if (error) throw error
        return data as Airdrop
      })
    },

    async create(airdropData: Partial<Airdrop>, auditInfo?: any) {
      return withRetry(async () => {
        // Validate airdrop data
        const validation = ValidationService.validateAirdrop(airdropData)
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(", ")}`)
        }

        // Check for duplicates
        const duplicateCheck = await ValidationService.checkDuplicateAirdrop(airdropData.title!)
        if (duplicateCheck.isDuplicate) {
          throw new Error("An airdrop with this title already exists")
        }

        const { data, error } = await supabase.from("airdrops").insert(validation.data).select().single()
        if (error) throw error

        // Log audit trail
        if (auditInfo) {
          await auditTrail.logAirdropCreate(auditInfo.userId, auditInfo.userEmail, data.id, validation.data)
        }

        return data as Airdrop
      })
    },

    async update(id: string, updates: Partial<Airdrop>, auditInfo?: any) {
      return withRetry(async () => {
        // Validate updates
        const validation = ValidationService.validateAirdrop(updates)
        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(", ")}`)
        }

        // Get old values for audit trail
        const oldData = await this.getById(id)

        const { data, error } = await supabase.from("airdrops").update(validation.data).eq("id", id).select().single()
        if (error) throw error

        // Log audit trail
        if (auditInfo) {
          await auditTrail.logAirdropUpdate(auditInfo.userId, auditInfo.userEmail, id, oldData, validation.data)
        }

        return data as Airdrop
      })
    },

    async delete(id: string, auditInfo?: any) {
      return withRetry(async () => {
        // Get data before deletion for audit trail
        const oldData = await this.getById(id)

        const { error } = await supabase.from("airdrops").delete().eq("id", id)
        if (error) throw error

        // Log audit trail
        if (auditInfo) {
          await auditTrail.logAirdropDelete(auditInfo.userId, auditInfo.userEmail, id, oldData)
        }

        return true
      })
    },

    async incrementViews(id: string) {
      return withRetry(async () => {
        const { error } = await supabase.rpc("increment_airdrop_views", { airdrop_id_param: id })
        if (error) throw error
        return true
      })
    },
  },

  // Category related functions
  categories: {
    async getAll(activeOnly = true) {
      return withRetry(async () => {
        let query = supabase.from("categories").select("*")

        if (activeOnly) {
          query = query.eq("active", true)
        }

        const { data, error } = await query.order("sort_order")
        if (error) throw error
        return data as Category[]
      })
    },

    async getBySlug(slug: string) {
      return withRetry(async () => {
        const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()
        if (error) throw error
        return data as Category
      })
    },

    async getByName(name: string) {
      return withRetry(async () => {
        const { data, error } = await supabase.from("categories").select("*").eq("name", name).single()
        if (error) throw error
        return data as Category
      })
    },
  },

  // Task related functions
  tasks: {
    async getByAirdropId(airdropId: string, activeOnly = true) {
      return withRetry(async () => {
        let query = supabase.from("airdrop_tasks").select("*").eq("airdrop_id", airdropId)

        if (activeOnly) {
          query = query.eq("active", true)
        }

        const { data, error } = await query.order("sort_order")
        if (error) throw error
        return data as AirdropTask[]
      })
    },

    async getUserProgress(userId: string, airdropId: string) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from("user_task_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("airdrop_id", airdropId)
          .not("completed_at", "is", null)

        if (error) throw error
        return data as UserTaskProgress[]
      })
    },

    async completeTask(userId: string, airdropId: string, taskId: string, submissionData?: any) {
      return withRetry(async () => {
        const { data, error } = await supabase
          .from("user_task_progress")
          .upsert({
            user_id: userId,
            airdrop_id: airdropId,
            task_id: taskId,
            completed_at: new Date().toISOString(),
            submission_data: submissionData,
            verification_status: "pending",
          })
          .select()
          .single()

        if (error) throw error
        return data as UserTaskProgress
      })
    },
  },

  // Enhanced verification processing with audit trail
  async processVerification(verificationId: string, status: "approved" | "rejected", reason?: string, auditInfo?: any) {
    return withRetry(async () => {
      const { data, error } = await supabase
        .from("airdrop_verifications")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          review_reason: reason,
        })
        .eq("id", verificationId)
        .select()
        .single()

      if (error) throw error

      // Log audit trail
      if (auditInfo) {
        await auditTrail.logVerificationAction(auditInfo.userId, auditInfo.userEmail, verificationId, status, reason)
      }

      return data
    })
  },

  // Admin related functions
  admin: {
    async getStats() {
      return withRetry(async () => {
        const { data, error } = await supabase.rpc("get_admin_stats")
        if (error) throw error
        return data
      })
    },

    async logAction(action: string, details?: any) {
      return withRetry(async () => {
        const { data, error } = await supabase.rpc("log_admin_action", {
          action_type: action,
          action_details: details,
        })
        if (error) throw error
        return data
      })
    },
  },
}
