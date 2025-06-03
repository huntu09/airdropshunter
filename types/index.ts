// Centralized type definitions for the application

// Airdrop related types
export interface AirdropDetail {
  id: string
  title: string
  description: string
  short_description?: string
  logo_url?: string
  category: string
  status: string
  start_date: string
  end_date: string
  reward_amount: string
  reward_type?: string
  blockchain?: string
  difficulty_level?: string
  estimated_time?: string
  participants_count: number
  max_participants?: number
  featured: boolean
  requirements?: string[]
  website_url?: string
  twitter_url?: string
  discord_url?: string
  telegram_url?: string
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  description?: string
  points_reward: number
  task_type: string
  required: boolean
  url?: string
  completed: boolean
  active: boolean
  sort_order: number
  task_data?: any
}

// User related types
export interface UserProfile {
  id: string
  email: string
  username: string
  full_name?: string
  role: "user" | "admin" | "moderator"
  avatar_url?: string
  wallet_address?: string
  points: number
  completed_airdrops: number
  created_at: string
}

// Category related types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  active: boolean
  sort_order: number
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Form types
export interface AirdropFormData {
  title: string
  description: string
  short_description: string
  category: string
  status: "pending" | "active" | "completed" | "cancelled"
  reward_amount: string
  reward_type: string
  blockchain: string
  difficulty_level: string
  estimated_time: string
  start_date: string
  end_date: string
  logo_url: string
  banner_url: string
  website_url: string
  twitter_url: string
  discord_url: string
  telegram_url: string
  requirements: string
  featured: boolean
  max_participants: string
  priority: string
}
