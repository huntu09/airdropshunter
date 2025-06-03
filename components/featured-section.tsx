"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, ArrowRight, Flame, Crown, Zap } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { airdropService } from "@/lib/services/airdrop-service"
import { logger } from "@/lib/utils/logger"
import { monitoring } from "@/lib/utils/monitoring"

interface FeaturedAirdrop {
  id: string
  title: string
  description: string
  logo_url: string
  category: string
  reward_amount: string
  end_date: string
  participants_count: number
  featured_reason: string
  status: string
  created_at: string
}

export default function FeaturedSection() {
  const [featuredAirdrops, setFeaturedAirdrops] = useState<FeaturedAirdrop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedAirdrops = async () => {
      try {
        setLoading(true)

        // Use performance monitoring
        const { result: airdrops, duration } = await monitoring.measureAsync("fetchFeaturedAirdrops", async () => {
          return await airdropService.getFeaturedAirdrops(2)
        })

        logger.info("Featured airdrops loaded", {
          count: airdrops.length,
          duration: `${duration}ms`,
        })

        setFeaturedAirdrops(airdrops)
      } catch (error) {
        logger.error("Failed to fetch featured airdrops", { error })
        setFeaturedAirdrops([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedAirdrops()
  }, [])

  if (loading) {
    return (
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-10 w-10 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full animate-pulse"></div>
          <div className="h-10 w-64 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#0f1623]/80 to-[#1a1f2e]/60 rounded-3xl p-8 border border-gray-700/50 animate-pulse"
            >
              <div className="h-8 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl w-3/4 mb-6"></div>
              <div className="h-5 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg w-full mb-3"></div>
              <div className="h-5 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg w-2/3 mb-8"></div>
              <div className="flex gap-6 mb-8">
                <div className="h-8 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-lg w-24"></div>
                <div className="h-8 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-lg w-32"></div>
              </div>
              <div className="h-14 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl"></div>
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
        className="flex items-center justify-center gap-4 mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3 shadow-2xl shadow-yellow-500/30"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Crown className="h-8 w-8 text-white" />
        </motion.div>

        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            FEATURED AIRDROPS
          </h2>
          <div className="flex items-center justify-center gap-3">
            <Badge className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-yellow-400/50 px-4 py-2 text-sm font-bold">
              <Flame className="h-4 w-4 mr-2 animate-bounce" />
              PREMIUM PICKS
            </Badge>
            <Badge className="bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-300 border-red-400/50 px-4 py-2 text-sm font-bold">
              <Zap className="h-4 w-4 mr-2" />
              HIGH REWARDS
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Featured Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featuredAirdrops.map((airdrop, index) => (
          <motion.div
            key={airdrop.id}
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, delay: index * 0.2 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-[#0f1623]/90 via-[#1a1f2e]/80 to-[#0f1623]/90 rounded-3xl p-8 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 overflow-hidden shadow-2xl hover:shadow-yellow-500/20"
          >
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Premium Featured Badge */}
            <div className="absolute top-6 right-6 z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 text-sm font-bold shadow-lg">
                  <Crown className="h-4 w-4 mr-2" />
                  {airdrop.featured_reason}
                </Badge>
              </motion.div>
            </div>

            <div className="relative z-10">
              {/* Enhanced Header */}
              <div className="flex items-start gap-6 mb-6">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.3 }}>
                  <img
                    src={airdrop.logo_url || "/placeholder.svg"}
                    alt={`${airdrop.title} logo`}
                    className="w-20 h-20 rounded-2xl border-2 border-gray-600 group-hover:border-yellow-400/70 transition-colors shadow-xl"
                  />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3 group-hover:text-yellow-400 transition-colors">
                    {airdrop.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-blue-400 border-blue-400/50 bg-blue-500/10 px-3 py-1 text-sm font-semibold"
                  >
                    {airdrop.category}
                  </Badge>
                </div>
              </div>

              {/* Enhanced Description */}
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                {airdrop.description.length > 80 ? `${airdrop.description.substring(0, 80)}...` : airdrop.description}
              </p>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-2xl border border-green-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-black text-green-400 mb-1">{airdrop.reward_amount}</div>
                  <div className="text-xs text-green-300 font-semibold">REWARD</div>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl border border-blue-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-lg font-black">{(airdrop.participants_count / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="text-xs text-blue-300 font-semibold">HUNTERS</div>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-2xl border border-orange-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-lg font-black">
                      {(() => {
                        const endDate = new Date(airdrop.end_date)
                        const now = new Date()
                        const diffTime = endDate.getTime() - now.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays > 0 ? `${diffDays}D` : "ENDED"
                      })()}
                    </span>
                  </div>
                  <div className="text-xs text-orange-300 font-semibold">LEFT</div>
                </motion.div>
              </div>

              {/* Enhanced CTA Button */}
              <Link href={`/airdrops/${airdrop.id}`}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white font-black py-4 text-lg group/btn rounded-2xl shadow-2xl shadow-orange-500/30 border-0">
                    <Star className="mr-3 h-5 w-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                    <span>JOIN PREMIUM AIRDROP</span>
                    <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
