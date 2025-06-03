import { dbHelpers, type Airdrop } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"
import { supabase } from "@/lib/supabase"

export interface AirdropFilters {
  category?: string
  status?: string
  featured?: boolean
  search?: string
  sortBy?: "newest" | "oldest" | "popular" | "ending_soon"
  page?: number
  limit?: number
}

export interface AirdropResponse {
  data: Airdrop[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Fallback data for development
const FALLBACK_FEATURED_AIRDROPS = [
  {
    id: "fallback-1",
    title: "Featured Airdrop 1",
    description: "This is a fallback featured airdrop while we fix data issues",
    logo_url: "/placeholder.svg",
    category: "DeFi",
    reward_amount: "$500",
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    participants_count: 1200,
    featured_reason: "Popular",
    status: "active",
    created_at: new Date().toISOString(),
    trend_percentage: 15,
    priority: 10,
    views_count: 5000,
  },
  {
    id: "fallback-2",
    title: "Featured Airdrop 2",
    description: "Another fallback featured airdrop for testing",
    logo_url: "/placeholder.svg",
    category: "NFT",
    reward_amount: "$1000",
    end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    participants_count: 3500,
    featured_reason: "Highest Reward",
    status: "active",
    created_at: new Date().toISOString(),
    trend_percentage: 25,
    priority: 8,
    views_count: 8000,
  },
]

const FALLBACK_TRENDING_AIRDROPS = [
  {
    id: "trending-1",
    title: "Trending Airdrop 1",
    description: "This is a fallback trending airdrop while we fix data issues",
    logo_url: "/placeholder.svg",
    category: "Gaming",
    reward_amount: "$300",
    end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    participants_count: 5000,
    featured_reason: "",
    status: "active",
    created_at: new Date().toISOString(),
    trend_percentage: 35,
    priority: 5,
    views_count: 12000,
  },
  {
    id: "trending-2",
    title: "Trending Airdrop 2",
    description: "Another fallback trending airdrop for testing",
    logo_url: "/placeholder.svg",
    category: "DeFi",
    reward_amount: "$750",
    end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    participants_count: 2800,
    featured_reason: "",
    status: "active",
    created_at: new Date().toISOString(),
    trend_percentage: 28,
    priority: 3,
    views_count: 9500,
  },
  {
    id: "trending-3",
    title: "Trending Airdrop 3",
    description: "Third fallback trending airdrop for testing",
    logo_url: "/placeholder.svg",
    category: "Launchpad",
    reward_amount: "$450",
    end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    participants_count: 1800,
    featured_reason: "",
    status: "active",
    created_at: new Date().toISOString(),
    trend_percentage: 18,
    priority: 2,
    views_count: 7200,
  },
  {
    id: "trending-4",
    title: "Trending Airdrop 4",
    description: "Fourth fallback trending airdrop for testing",
    logo_url: "/placeholder.svg",
    category: "NFT",
    reward_amount: "$250",
    end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    participants_count: 3200,
    featured_reason: "",
    status: "active",
    created_at: new Date().toISOString(),
    trend_percentage: 22,
    priority: 1,
    views_count: 6800,
  },
]

class AirdropService {
  private readonly CACHE_TTL = 300000 // 5 minutes

  async getAirdrops(filters: AirdropFilters = {}): Promise<AirdropResponse> {
    try {
      const cacheKey = `airdrops_${JSON.stringify(filters)}`

      logger.info("Fetching airdrops", { filters })

      // Use direct database call with caching
      const airdrops = await dbHelpers.airdrops.getAll({
        category: filters.category !== "all" ? filters.category : undefined,
        status: filters.status,
        featured: filters.featured,
      })

      // Apply search filter
      let filteredAirdrops = airdrops
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredAirdrops = airdrops.filter(
          (airdrop) =>
            airdrop.title.toLowerCase().includes(searchTerm) ||
            airdrop.description.toLowerCase().includes(searchTerm) ||
            airdrop.category.toLowerCase().includes(searchTerm),
        )
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredAirdrops = this.sortAirdrops(filteredAirdrops, filters.sortBy)
      }

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 12
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedAirdrops = filteredAirdrops.slice(startIndex, endIndex)

      const response: AirdropResponse = {
        data: paginatedAirdrops,
        total: filteredAirdrops.length,
        page,
        limit,
        hasMore: endIndex < filteredAirdrops.length,
      }

      logger.info("Airdrops fetched successfully", {
        total: response.total,
        page: response.page,
        returned: response.data.length,
      })

      return response
    } catch (error) {
      logger.error("Failed to fetch airdrops", { error, filters })
      throw error
    }
  }

  async getAirdropById(id: string): Promise<Airdrop> {
    try {
      logger.info("Fetching airdrop by ID", { id })

      const airdrop = await dbHelpers.airdrops.getById(id)

      // Increment view count
      await dbHelpers.airdrops.incrementViews(id).catch((error) => {
        logger.warn("Failed to increment views", { id, error })
      })

      logger.info("Airdrop fetched successfully", { id, title: airdrop.title })
      return airdrop
    } catch (error) {
      logger.error("Failed to fetch airdrop", { error, id })
      throw error
    }
  }

  async getFeaturedAirdrops(limit = 6): Promise<Airdrop[]> {
    try {
      const cacheKey = `featured_airdrops_${limit}`

      logger.info("Fetching featured airdrops with direct query", { limit })

      // Use direct query instead of RPC
      const { data, error } = await supabase
        .from("airdrops")
        .select("*")
        .eq("featured", true)
        .eq("status", "active")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit)

      // Debug log
      console.log("Featured airdrops raw response:", { data, error })

      if (error) {
        logger.error("Direct query failed for featured airdrops", { error })
        logger.warn("Using fallback data for featured airdrops")
        return FALLBACK_FEATURED_AIRDROPS.slice(0, limit)
      }

      // Handle empty data
      if (!data || data.length === 0) {
        logger.warn("No featured airdrops found, using fallback data")
        return FALLBACK_FEATURED_AIRDROPS.slice(0, limit)
      }

      // Ensure all required fields exist
      const featuredAirdrops = data.map((airdrop) => ({
        ...airdrop,
        featured_reason: airdrop.featured_reason || "Featured",
        trend_percentage: airdrop.trend_percentage || 0,
        views_count: airdrop.views_count || 0,
        participants_count: airdrop.participants_count || 0,
      }))

      logger.info("Featured airdrops fetched successfully", { count: featuredAirdrops.length })
      return featuredAirdrops
    } catch (error) {
      logger.error("Failed to fetch featured airdrops", {
        error: error instanceof Error ? error.message : JSON.stringify(error),
      })
      // Return fallback data instead of throwing
      return FALLBACK_FEATURED_AIRDROPS.slice(0, limit)
    }
  }

  async getTrendingAirdrops(limit = 6): Promise<Airdrop[]> {
    try {
      const cacheKey = `trending_airdrops_${limit}`

      logger.info("Fetching trending airdrops with direct query", { limit })

      // Use direct query instead of RPC
      const { data, error } = await supabase
        .from("airdrops")
        .select("*")
        .eq("status", "active")
        .order("views_count", { ascending: false })
        .order("participants_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit)

      // Debug log
      console.log("Trending airdrops raw response:", { data, error })

      if (error) {
        logger.error("Direct query failed for trending airdrops", { error })
        logger.warn("Using fallback data for trending airdrops")
        return FALLBACK_TRENDING_AIRDROPS.slice(0, limit)
      }

      // Handle empty data
      if (!data || data.length === 0) {
        logger.warn("No trending airdrops found, using fallback data")
        return FALLBACK_TRENDING_AIRDROPS.slice(0, limit)
      }

      // Ensure all required fields exist
      const trendingAirdrops = data.map((airdrop) => ({
        ...airdrop,
        trend_percentage: airdrop.trend_percentage || Math.floor(Math.random() * 30) + 10,
        views_count: airdrop.views_count || 0,
        participants_count: airdrop.participants_count || 0,
      }))

      logger.info("Trending airdrops fetched successfully", { count: trendingAirdrops.length })
      return trendingAirdrops
    } catch (error) {
      logger.error("Failed to fetch trending airdrops", {
        error: error instanceof Error ? error.message : JSON.stringify(error),
      })
      // Return fallback data instead of throwing
      return FALLBACK_TRENDING_AIRDROPS.slice(0, limit)
    }
  }

  async createAirdrop(airdropData: Partial<Airdrop>): Promise<Airdrop> {
    try {
      logger.info("Creating airdrop", { title: airdropData.title })

      const airdrop = await dbHelpers.airdrops.create(airdropData)

      logger.info("Airdrop created successfully", { id: airdrop.id, title: airdrop.title })
      return airdrop
    } catch (error) {
      logger.error("Failed to create airdrop", { error, airdropData })
      throw error
    }
  }

  async updateAirdrop(id: string, updates: Partial<Airdrop>): Promise<Airdrop> {
    try {
      logger.info("Updating airdrop", { id, updates: Object.keys(updates) })

      const airdrop = await dbHelpers.airdrops.update(id, updates)

      logger.info("Airdrop updated successfully", { id, title: airdrop.title })
      return airdrop
    } catch (error) {
      logger.error("Failed to update airdrop", { error, id, updates })
      throw error
    }
  }

  async deleteAirdrop(id: string): Promise<void> {
    try {
      logger.info("Deleting airdrop", { id })

      await dbHelpers.airdrops.delete(id)

      logger.info("Airdrop deleted successfully", { id })
    } catch (error) {
      logger.error("Failed to delete airdrop", { error, id })
      throw error
    }
  }

  private sortAirdrops(airdrops: Airdrop[], sortBy: string): Airdrop[] {
    switch (sortBy) {
      case "newest":
        return airdrops.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return airdrops.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "popular":
        return airdrops.sort((a, b) => b.views_count - a.views_count)
      case "ending_soon":
        return airdrops.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
      default:
        return airdrops
    }
  }
}

export const airdropService = new AirdropService()
