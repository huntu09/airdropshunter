"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight, Users, Award, Clock, ExternalLink, Star } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

interface Airdrop {
  id: number | string
  title: string
  description: string
  logo: string
  logo_url?: string
  banner_url?: string
  category: string
  logoBackground?: string
  endDate: string
  participants_count?: number
  reward_amount?: string
  status?: string
  difficulty?: string
  rating?: number
}

interface AirdropCardProps {
  airdrop: Airdrop
  index: number
}

function AirdropCard({ airdrop, index }: AirdropCardProps) {
  // Format the end date
  const endDate = new Date(airdrop.endDate)
  const formattedDate = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // Calculate days remaining
  const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isEndingSoon = daysRemaining <= 7 && daysRemaining > 0

  // Truncate description if too long
  const truncatedDescription =
    airdrop.description.length > 120 ? `${airdrop.description.substring(0, 120)}...` : airdrop.description

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "from-green-500 to-emerald-500"
      case "upcoming":
        return "from-yellow-500 to-orange-500"
      case "completed":
        return "from-blue-500 to-indigo-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-500/20 border-green-500/30"
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
      case "hard":
        return "text-red-400 bg-red-500/20 border-red-500/30"
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      {/* Main Card */}
      <div className="glass-card p-6 h-full card-hover relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Ending Soon Badge */}
        {isEndingSoon && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              Ending Soon
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-3 shadow-lg group-hover:shadow-xl transition-shadow">
              {airdrop.logo_url ? (
                <Image
                  src={airdrop.logo_url || "/placeholder.svg"}
                  alt={`${airdrop.title} logo`}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">${airdrop.title.charAt(0).toUpperCase()}</div>`
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {airdrop.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Status Indicator */}
            {airdrop.status && (
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r ${getStatusColor(airdrop.status)} border-2 border-gray-900 shadow-lg`}
              ></div>
            )}
          </div>

          {/* Title and Category */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
              {airdrop.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="badge-modern text-xs">{airdrop.category}</Badge>
              {airdrop.difficulty && (
                <Badge className={`text-xs border ${getDifficultyColor(airdrop.difficulty)}`}>
                  {airdrop.difficulty}
                </Badge>
              )}
              {airdrop.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-400">{airdrop.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">{truncatedDescription}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center text-blue-400 mb-1">
              <Calendar className="w-4 h-4 mr-1" />
            </div>
            <div className="text-xs text-gray-400 mb-1">Ends</div>
            <div className="text-sm font-semibold text-white">{formattedDate}</div>
          </div>

          <div className="glass-card p-3 text-center">
            <div className="flex items-center justify-center text-green-400 mb-1">
              <Award className="w-4 h-4 mr-1" />
            </div>
            <div className="text-xs text-gray-400 mb-1">Reward</div>
            <div className="text-sm font-semibold text-white">{airdrop.reward_amount || "TBA"}</div>
          </div>
        </div>

        {/* Participants */}
        {airdrop.participants_count && (
          <div className="flex items-center justify-center gap-2 mb-6 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">{airdrop.participants_count.toLocaleString()} participants</span>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/airdrops/${airdrop.id}`} className="block">
          <Button className="w-full btn-gradient group/btn text-base py-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <span>View Details</span>
            <div className="flex items-center ml-2">
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </div>
          </Button>
        </Link>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </motion.div>
  )
}

export default AirdropCard
export { AirdropCard }
