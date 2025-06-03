"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { AirdropCard } from "@/components/airdrop-card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

interface AirdropListProps {
  searchQuery?: string
  category?: string
  sortBy?: string
}

export default function AirdropList({ searchQuery = "", category = "all", sortBy = "newest" }: AirdropListProps) {
  const [airdrops, setAirdrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchAirdrops(true)
  }, [searchQuery, category, sortBy])

  const fetchAirdrops = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(1)
      } else {
        setRefreshing(true)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      let query = supabase.from("airdrops").select("*").in("status", ["active", "completed"])

      // Apply category filter
      if (category && category !== "all") {
        query = query.eq("category", category)
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false })
          break
        case "ending-soon":
          query = query.order("end_date", { ascending: true })
          break
        case "popular":
          query = query.order("participants_count", { ascending: false })
          break
        case "reward-high":
          query = query.order("reward_amount", { ascending: false })
          break
        case "reward-low":
          query = query.order("reward_amount", { ascending: true })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }

      // Pagination
      const limit = 10
      const from = reset ? 0 : (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error } = await query

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Transform data for compatibility
      const transformedData =
        data?.map((airdrop) => ({
          id: airdrop.id,
          title: airdrop.title,
          description: airdrop.description,
          logo: airdrop.logo_url || "/placeholder.svg?height=48&width=48",
          logo_url: airdrop.logo_url,
          banner_url: airdrop.banner_url,
          category: airdrop.category,
          logoBackground: `bg-gradient-to-br from-blue-500 to-blue-700`,
          endDate: airdrop.end_date,
          participants_count: airdrop.participants_count || 0,
          reward_amount: airdrop.reward_amount,
          status: airdrop.status,
        })) || []

      if (reset) {
        setAirdrops(transformedData)
      } else {
        setAirdrops((prev) => [...prev, ...transformedData])
      }

      setHasMore(data?.length === limit)

      // Fallback to sample data if no results
      if (transformedData.length === 0 && reset) {
        setAirdrops(getSampleAirdrops())
        toast({
          title: "Info",
          description: "No airdrops found. Showing sample data.",
        })
      }
    } catch (error) {
      console.error("Error fetching airdrops:", error)

      if (reset) {
        setAirdrops(getSampleAirdrops())
        toast({
          title: "Database Error",
          description: "Failed to load airdrops. Using sample data.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadMore = () => {
    setPage((prev) => prev + 1)
    fetchAirdrops(false)
  }

  const handleRefresh = () => {
    fetchAirdrops(true)
  }

  const getSampleAirdrops = () => [
    {
      id: 1,
      title: "ZK Token Airdrop",
      description: "Earn up to $50 in ZK tokens by completing simple tasks on zkSync Era network",
      logo: "/placeholder.svg?height=48&width=48",
      category: "Layer 2",
      logoBackground: "bg-gradient-to-br from-blue-500 to-blue-700",
      endDate: "2025-06-30",
      participants_count: 12450,
      reward_amount: "$50",
      status: "active",
    },
    {
      id: 2,
      title: "Galaxy NFT Airdrop",
      description: "Claim a unique Galaxy NFT and earn rewards for early participation",
      logo: "/placeholder.svg?height=48&width=48",
      category: "NFT",
      logoBackground: "bg-gradient-to-br from-purple-500 to-purple-800",
      endDate: "2025-07-15",
      participants_count: 8920,
      reward_amount: "$75",
      status: "active",
    },
    {
      id: 3,
      title: "Project X DeFi Rewards",
      description: "Get free tokens from Project X by providing liquidity and staking",
      logo: "/placeholder.svg?height=48&width=48",
      category: "DeFi",
      logoBackground: "bg-gradient-to-br from-cyan-500 to-blue-700",
      endDate: "2025-06-25",
      participants_count: 15670,
      reward_amount: "$100",
      status: "active",
    },
  ]

  // Filter airdrops based on search and category
  const filteredAirdrops = airdrops.filter((airdrop) => {
    const matchesSearch =
      !searchQuery ||
      airdrop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airdrop.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = category === "all" || airdrop.category.toLowerCase() === category.toLowerCase()

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">All Airdrops</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#0f1623]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 animate-pulse"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-700 rounded w-48"></div>
                  <div className="h-4 bg-gray-700 rounded w-64"></div>
                  <div className="flex gap-3">
                    <div className="h-6 bg-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              </div>
              <div className="h-12 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : category !== "all"
                ? `${category} Airdrops`
                : "All Airdrops"}
          </h2>
          <p className="text-gray-400 mt-1">
            {filteredAirdrops.length} airdrop{filteredAirdrops.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-gray-700 text-gray-300 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Results */}
      {filteredAirdrops.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No airdrops found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? `No airdrops match your search "${searchQuery}"`
              : `No airdrops available in ${category} category`}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Airdrop Cards */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredAirdrops.map((airdrop, index) => (
              <AirdropCard key={airdrop.id} airdrop={airdrop} index={index} />
            ))}
          </motion.div>

          {/* Load More Button */}
          {hasMore && filteredAirdrops.length >= 10 && (
            <div className="text-center pt-8">
              <Button
                onClick={loadMore}
                disabled={refreshing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Airdrops"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
