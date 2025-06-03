import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "N/A"

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  try {
    return new Date(date).toLocaleDateString("en-US", options || defaultOptions)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

/**
 * Safely access nested object properties
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, fallback: T[K]): T[K] {
  if (!obj) return fallback
  return obj[key] ?? fallback
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Formats a number with commas
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0"
  return num.toLocaleString()
}

/**
 * Calculates time remaining from now until a future date
 */
export function timeRemaining(endDate: string | Date | null | undefined): {
  days: number
  hours: number
  expired: boolean
} {
  if (!endDate) return { days: 0, hours: 0, expired: true }

  const end = new Date(endDate)
  const now = new Date()

  if (end <= now) return { days: 0, hours: 0, expired: true }

  const diffMs = end.getTime() - now.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return { days, hours, expired: false }
}

/**
 * Creates a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

/**
 * Handles API errors consistently
 */
export function handleApiError(error: any): { message: string; status: number } {
  console.error("API Error:", error)

  if (error.status) {
    return {
      message: error.message || "An error occurred",
      status: error.status,
    }
  }

  return {
    message: error.message || "An unexpected error occurred",
    status: 500,
  }
}
