import { z } from "zod"

// Enhanced validation schemas
export const airdropSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters")
      .regex(/^[a-zA-Z0-9\s\-_]+$/, "Title contains invalid characters"),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must be less than 1000 characters"),

    short_description: z.string().max(200, "Short description must be less than 200 characters").optional(),

    category: z.string().min(1, "Category is required"),

    status: z.enum(["pending", "active", "completed", "cancelled"]),

    reward_amount: z
      .string()
      .min(1, "Reward amount is required")
      .regex(/^[\d\s\w$]+$/, "Invalid reward amount format"),

    reward_type: z.enum(["token", "nft", "other"]),

    blockchain: z.string().min(1, "Blockchain is required"),

    difficulty_level: z.enum(["easy", "medium", "hard"]),

    estimated_time: z.string().min(1, "Estimated time is required"),

    start_date: z.string().datetime("Invalid start date format"),

    end_date: z.string().datetime("Invalid end date format"),

    max_participants: z
      .number()
      .min(1, "Must allow at least 1 participant")
      .max(1000000, "Maximum participants exceeded"),

    website_url: z.string().url("Invalid website URL").optional().or(z.literal("")),

    twitter_url: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),

    discord_url: z.string().url("Invalid Discord URL").optional().or(z.literal("")),

    telegram_url: z.string().url("Invalid Telegram URL").optional().or(z.literal("")),

    featured: z.boolean(),

    priority: z.number().min(0, "Priority cannot be negative").max(10, "Priority cannot exceed 10"),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  })

export const userSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .optional(),

  role: z.enum(["user", "admin", "moderator"]),

  status: z.enum(["active", "banned", "pending"]),

  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),

  wallet_address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address")
    .optional()
    .or(z.literal("")),

  twitter_handle: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{1,15}$/, "Invalid Twitter handle")
    .optional()
    .or(z.literal("")),

  discord_handle: z
    .string()
    .regex(/^.{3,32}#[0-9]{4}$/, "Invalid Discord handle format")
    .optional()
    .or(z.literal("")),

  telegram_handle: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{5,32}$/, "Invalid Telegram handle")
    .optional()
    .or(z.literal("")),
})

export const notificationSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),

    message: z
      .string()
      .min(10, "Message must be at least 10 characters")
      .max(1000, "Message must be less than 1000 characters"),

    type: z.enum(["info", "success", "warning", "error"]),

    target_type: z.enum(["all", "users", "admins", "specific"]),

    target_users: z.array(z.string()).optional(),

    scheduled_at: z.string().datetime("Invalid scheduled date format").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.target_type === "specific" && (!data.target_users || data.target_users.length === 0)) {
        return false
      }
      return true
    },
    {
      message: "Target users must be specified when target type is 'specific'",
      path: ["target_users"],
    },
  )
  .refine(
    (data) => {
      if (data.scheduled_at && data.scheduled_at !== "") {
        return new Date(data.scheduled_at) > new Date()
      }
      return true
    },
    {
      message: "Scheduled date must be in the future",
      path: ["scheduled_at"],
    },
  )

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),

  description: z.string().max(500, "Description must be less than 500 characters").optional(),

  task_type: z.enum([
    "social_follow",
    "social_like",
    "social_share",
    "join_discord",
    "join_telegram",
    "visit_website",
    "connect_wallet",
    "hold_token",
    "custom",
  ]),

  required: z.boolean(),

  points_reward: z.number().min(1, "Points reward must be at least 1").max(10000, "Points reward cannot exceed 10,000"),

  verification_method: z.enum(["automatic", "manual", "api"]),

  task_data: z.record(z.any()).optional(),

  sort_order: z.number().min(0, "Sort order cannot be negative"),

  active: z.boolean(),
})

// Validation helper functions
export class ValidationService {
  static validateAirdrop(data: any) {
    try {
      return {
        success: true,
        data: airdropSchema.parse(data),
        errors: null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        errors: error.errors || [{ message: error.message }],
      }
    }
  }

  static validateUser(data: any) {
    try {
      return {
        success: true,
        data: userSchema.parse(data),
        errors: null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        errors: error.errors || [{ message: error.message }],
      }
    }
  }

  static validateNotification(data: any) {
    try {
      return {
        success: true,
        data: notificationSchema.parse(data),
        errors: null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        errors: error.errors || [{ message: error.message }],
      }
    }
  }

  static validateTask(data: any) {
    try {
      return {
        success: true,
        data: taskSchema.parse(data),
        errors: null,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        errors: error.errors || [{ message: error.message }],
      }
    }
  }

  // Sanitization helpers
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+=/gi, "") // Remove event handlers
  }

  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      // Only allow http and https protocols
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol")
      }
      return parsed.toString()
    } catch {
      throw new Error("Invalid URL format")
    }
  }

  // Duplicate detection
  static async checkDuplicateAirdrop(title: string, excludeId?: string) {
    // This would check against database
    // For now, return mock result
    return {
      isDuplicate: false,
      existingId: null,
    }
  }

  static async checkDuplicateUser(email: string, username: string, excludeId?: string) {
    // This would check against database
    // For now, return mock result
    return {
      emailExists: false,
      usernameExists: false,
    }
  }

  // Rate limiting helpers
  static checkRateLimit(userId: string, action: string): boolean {
    // This would implement actual rate limiting
    // For now, always return true
    return true
  }
}

// Form validation hook
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (data: any) => {
    try {
      const result = schema.parse(data)
      return { success: true, data: result, errors: {} }
    } catch (error: any) {
      const errors: Record<string, string> = {}

      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join(".")
          errors[path] = err.message
        })
      }

      return { success: false, data: null, errors }
    }
  }

  return { validate }
}
