"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowRight, Eye, FlameIcon as Fire, Zap, Users, Clock } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { airdropService } from "@/lib/services/airdrop-service"
import { logger } from "@/lib/utils/logger"
import { monitoring } from "@/lib/utils/monitoring"

interface TrendingAirdrop {
  id: string
  title: string
  description: string
  logo_url: string
  category: string
  reward_amount: string
  participants_count: number
  trend_percentage: number
  end_date: string
  status: string
  created_at: string
}

export default function TrendingSection() {
  const [trendingAirdrops, setTrendingAirdrops] = useState<TrendingAirdrop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingAirdrops = async () => {
      try {
        setLoading(true)

        // Use performance monitoring
        const { result: airdrops, duration } = await monitoring.measureAsync("fetchTrendingAirdrops", async () => {
          return await airdropService.getTrendingAirdrops(4)
        })

        logger.info("Trending airdrops loaded", {
          count: airdrops.length,
          duration: `${duration}ms`,
        })

        setTrendingAirdrops(airdrops)
      } catch (error) {
        logger.error("Failed to fetch trending airdrops", { error })
        setTrendingAirdrops([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingAirdrops()
  }, [])

  if (loading) {
    return (
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-10 w-10 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full animate-pulse"></div>
          <div className="h-10 w-64 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#0f1623]/80 to-[#1a1f2e]/60 rounded-2xl p-6 border border-gray-700/50 animate-pulse"
            >
              <div className="h-16 w-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-full mb-6"></div>
              <div className="h-6 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg w-3/4 mb-4"></div>
              <div className="h-4 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg w-full mb-6"></div>
              <div className="h-10 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-20">
      {/* Enhanced Section Header */}
      <motion.div
        className="flex items-center justify-between mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 shadow-2xl shadow-green-500/30"
            animate={{
              boxShadow: [
                "0 0 20px rgba(34, 197, 94, 0.3)",
                "0 0 40px rgba(34, 197, 94, 0.5)",
                "0 0 20px rgba(34, 197, 94, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Fire className="h-8 w-8 text-white" />
          </motion.div>

          <div>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              TRENDING NOW
            </h2>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-green-400/50 px-4 py-2 text-sm font-bold">
                <Eye className="h-4 w-4 mr-2" />
                MOST VIEWED
              </Badge>
              <Badge className="bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-300 border-red-400/50 px-4 py-2 text-sm font-bold">
                <TrendingUp className="h-4 w-4 mr-2 animate-bounce" />
                HOT
              </Badge>
            </div>
          </div>
        </div>

        <Link href="/search?sort=popular" className="hidden md:block">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="border-2 border-green-400/50 text-green-300 hover:bg-green-500/20 hover:border-green-300 px-6 py-3 font-bold rounded-2xl backdrop-blur-sm"
            >
              View All
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Enhanced Trending Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trendingAirdrops.map((airdrop, index) => (
          <motion.div
            key={airdrop.id}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.03 }}
            className="group relative bg-gradient-to-br from-[#0f1623]/90 via-[#1a1f2e]/80 to-[#0f1623]/90 rounded-2xl p-6 border border-gray-700/50 hover:border-green-400/50 transition-all duration-500 overflow-hidden shadow-xl hover:shadow-green-500/20"
          >
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Enhanced Trend Indicator */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-2 rounded-full border border-green-400/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-black">+{airdrop.trend_percentage || "15"}%</span>
              </motion.div>
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600 bg-gray-800/50 px-2 py-1">
                #{index + 1}
              </Badge>
            </div>

            {/* Enhanced Logo & Title */}
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.3 }}>
                <img
                  src={airdrop.logo_url || "/placeholder.svg"}
                  alt={`${airdrop.title} logo`}
                  className="w-16 h-16 rounded-xl border-2 border-gray-600 group-hover:border-green-400/70 transition-colors shadow-lg"
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-white text-lg truncate group-hover:text-green-400 transition-colors mb-2">
                  {airdrop.title}
                </h3>
                <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/50 bg-blue-500/10 px-2 py-1">
                  {airdrop.category}
                </Badge>
              </div>
            </div>

            {/* Enhanced Description */}
            <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed relative z-10">
              {airdrop.description}
            </p>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
              <motion.div
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl p-3 border border-green-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-green-400 font-black text-lg">{airdrop.reward_amount}</div>
                <div className="text-green-300 text-xs font-semibold">REWARD</div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl p-3 border border-blue-500/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-1 text-blue-400 font-black text-lg">
                  <Users className="h-4 w-4" />
                  {(airdrop.participants_count / 1000).toFixed(1)}K
                </div>
                <div className="text-blue-300 text-xs font-semibold">HUNTERS</div>
              </motion.div>
            </div>

            {/* Time Left Indicator */}
            <motion.div
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/10 rounded-xl p-3 border border-orange-500/30 mb-6 relative z-10"
              whileHover={{ scale: 1.02 }}
            >
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-black text-sm">
                {(() => {
                  const endDate = new Date(airdrop.end_date)
                  const now = new Date()
                  const diffTime = endDate.getTime() - now.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  return diffDays > 0 ? `${diffDays} DAYS LEFT` : "ENDED"
                })()}
              </span>
            </motion.div>

            {/* Enhanced CTA Button */}
            <Link href={`/airdrops/${airdrop.id}`} className="relative z-10">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-3 rounded-xl shadow-lg shadow-green-500/30 border-0 group/btn"
                >
                  <Zap className="mr-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                  JOIN NOW
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Mobile View All Button */}
      <div className="md:hidden mt-8 text-center">
        <Link href="/search?sort=popular">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="border-2 border-green-400/50 text-green-300 hover:bg-green-500/20 hover:border-green-300 px-8 py-4 font-bold rounded-2xl backdrop-blur-sm"
            >
              View All Trending
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}
