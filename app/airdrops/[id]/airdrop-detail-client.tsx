"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDate, timeRemaining, formatNumber } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Clock,
  ExternalLink,
  Share2,
  Trophy,
  Users,
  CheckCircle,
  Circle,
  AlertCircle,
  LinkIcon,
  Globe,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Heart,
  ChevronRight,
  Sparkles,
  Gift,
  Coins,
  Bell,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { airdropService } from "@/lib/services/airdrop-service"
import { logger } from "@/lib/utils/logger"
import { monitoring } from "@/lib/utils/monitoring"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

// Social Media Icons Component
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.077.077 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

interface AirdropDetailClientProps {
  airdropId: string
  initialData?: any
}

export default function AirdropDetailClient({ airdropId, initialData }: AirdropDetailClientProps) {
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [airdrop, setAirdrop] = useState(initialData || null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [userProgress, setUserProgress] = useState(0)
  const [bannerError, setBannerError] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!initialData && airdropId) {
      fetchAirdropDetail(airdropId)
    }
  }, [airdropId, user, initialData])

  const fetchAirdropDetail = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { result: airdropData, duration } = await monitoring.measureAsync("fetchAirdropDetail", async () => {
        return await airdropService.getAirdropById(id)
      })

      logger.info("Airdrop detail loaded", {
        id,
        title: airdropData.title,
        duration: `${duration}ms`,
      })

      setAirdrop(airdropData)

      const requirementsCount = Array.isArray(airdropData.requirements) ? airdropData.requirements.length : 0
      const progress = requirementsCount > 0 ? (completedTasks.length / requirementsCount) * 100 : 0
      setUserProgress(progress)
    } catch (error: any) {
      logger.error("Error fetching airdrop detail", { error, id })
      setError(error.message || "Failed to load airdrop details")
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (taskIndex: number, completed: boolean) => {
    if (!user) {
      toast.error("Please login to complete tasks")
      return
    }

    if (!airdrop) return

    const taskId = `req_${taskIndex}`

    try {
      if (completed) {
        setCompletedTasks((prev) => [...prev, taskId])
      } else {
        setCompletedTasks((prev) => prev.filter((id) => id !== taskId))
      }

      const requirementsCount = Array.isArray(airdrop.requirements) ? airdrop.requirements.length : 0
      const newCompletedCount = completed ? completedTasks.length + 1 : completedTasks.length - 1
      const newProgress = requirementsCount > 0 ? (newCompletedCount / requirementsCount) * 100 : 0
      setUserProgress(newProgress)

      toast.success(completed ? "Task completed! 🎉" : "Task marked as incomplete")
    } catch (error: any) {
      console.error("Error updating task progress:", error)

      if (completed) {
        setCompletedTasks((prev) => prev.filter((id) => id !== taskId))
      } else {
        setCompletedTasks((prev) => [...prev, taskId])
      }

      toast.error("Failed to update task")
    }
  }

  const handleCompleteAllTasks = async () => {
    if (!user || !airdrop) {
      toast.error("Please login to complete airdrop")
      return
    }

    if (completedTasks.length !== airdrop.requirements.length) {
      toast.error("Please complete all tasks first")
      return
    }

    try {
      const { data, error } = await supabase.from("user_rewards").insert({
        user_id: user.id,
        airdrop_id: airdrop.id,
        type: "airdrop_completion",
        description: `Completed airdrop: ${airdrop.title}`,
        points: 100,
        airdrop_title: airdrop.title,
        airdrop_logo: airdrop.logo_url,
        airdrop_reward: airdrop.reward_amount,
      })

      if (error) throw error

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          total_points: (user.total_points || 0) + 100,
          completed_airdrops: (user.completed_airdrops || 0) + 1,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      toast.success("🎉 Airdrop completed! Check your rewards page.")

      setTimeout(() => {
        router.push("/rewards")
      }, 2000)
    } catch (error: any) {
      console.error("Error completing airdrop:", error)
      toast.error("Failed to complete airdrop")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${airdrop.title} Airdrop`,
          text: `Check out this amazing ${airdrop.title} airdrop! Earn ${airdrop.reward_amount || "free tokens"}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
  }

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace("www.", "")
    } catch {
      return url
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>

            {/* Banner Skeleton */}
            <Skeleton className="h-80 w-full rounded-3xl" />

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !airdrop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Error Loading Airdrop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">{error || "The requested airdrop could not be found."}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/airdrops")} className="btn-gradient w-full">
              Back to Airdrops
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Calculate time remaining
  const { days, hours, expired } = timeRemaining(airdrop.end_date)
  const timeLeft = expired ? "Ended" : `${days}d ${hours}h left`

  // Format dates
  const startDate = formatDate(airdrop.start_date)
  const endDate = formatDate(airdrop.end_date)

  // Get requirements as tasks
  const requirements = Array.isArray(airdrop.requirements) ? airdrop.requirements : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Logo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-2xl">
                  {airdrop.logo_url ? (
                    <img
                      src={airdrop.logo_url || "/placeholder.svg"}
                      alt={`${airdrop.title} logo`}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">${airdrop.title.charAt(0).toUpperCase()}</div>`
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                      {airdrop.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                {airdrop.status && (
                  <div
                    className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-gray-900 shadow-lg ${
                      expired ? "bg-red-500" : airdrop.status === "active" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></div>
                )}
              </div>

              {/* Title and Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {airdrop.category_data ? (
                    <Badge className="badge-modern">{airdrop.category_data.name}</Badge>
                  ) : airdrop.category ? (
                    <Badge className="badge-modern">{airdrop.category}</Badge>
                  ) : null}

                  <Badge
                    className={`${expired ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}`}
                  >
                    {expired ? "Ended" : airdrop.status?.charAt(0).toUpperCase() + airdrop.status?.slice(1)}
                  </Badge>

                  {airdrop.reward_amount && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Coins className="w-3 h-3 mr-1" />
                      {airdrop.reward_amount}
                    </Badge>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {airdrop.title}
                </h1>

                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {airdrop.short_description || airdrop.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button onClick={handleShare} className="btn-gradient">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  <Button onClick={handleBookmark} variant="outline" className="glass-button">
                    <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current text-red-400" : ""}`} />
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>

                  {airdrop.website_url && (
                    <Button asChild variant="outline" className="glass-button">
                      <a href={airdrop.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Time Remaining Card */}
              <div className="glass-card p-6 text-center min-w-[200px]">
                <div className="flex items-center justify-center text-blue-400 mb-2">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Time Remaining</span>
                </div>
                <div className={`text-2xl font-bold ${expired ? "text-red-400" : "text-white"}`}>{timeLeft}</div>
                <div className="text-xs text-gray-400 mt-1">Ends {endDate}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Banner */}
        {airdrop.banner_url && !bannerError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative w-full h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={airdrop.banner_url || "/placeholder.svg"}
                alt={`${airdrop.title} airdrop banner`}
                className="w-full h-full object-cover"
                onError={() => setBannerError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Floating Stats */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <div className="text-lg font-bold text-white">{formatNumber(airdrop.participants_count)}</div>
                    <div className="text-xs text-gray-300">Participants</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                    <div className="text-lg font-bold text-white">{airdrop.reward_amount || "TBA"}</div>
                    <div className="text-xs text-gray-300">Reward</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <div className="text-lg font-bold text-white">{airdrop.estimated_time || "5-10 min"}</div>
                    <div className="text-xs text-gray-300">Est. Time</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Target className="w-6 h-6 mx-auto mb-2 text-green-400" />
                    <div className="text-lg font-bold text-white">{requirements.length}</div>
                    <div className="text-xs text-gray-300">Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Tabs defaultValue="tasks" className="space-y-6">
                <TabsList className="glass-card p-2 grid w-full grid-cols-3">
                  <TabsTrigger
                    value="tasks"
                    className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="rewards"
                    className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Rewards
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tasks">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        Complete Tasks to Earn Rewards
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Complete these tasks to earn points and qualify for the airdrop
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {requirements.length > 0 ? (
                        <div className="space-y-6">
                          {/* Progress Overview */}
                          <div className="glass-card p-6">
                            <div className="flex justify-between items-center mb-4">
                              <div className="text-sm text-gray-400">Your Progress</div>
                              <div className="text-sm font-medium text-white">
                                {completedTasks.length} / {requirements.length} Tasks
                              </div>
                            </div>
                            <Progress value={userProgress} className="h-3 mb-4" />
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{userProgress.toFixed(0)}% Complete</span>
                              <span className="text-blue-400 font-medium">
                                +{100 * (completedTasks.length / requirements.length)} points
                              </span>
                            </div>
                          </div>

                          {/* Tasks List */}
                          <div className="space-y-4">
                            <AnimatePresence>
                              {requirements.map((requirement, index) => {
                                const taskId = `req_${index}`
                                const isCompleted = completedTasks.includes(taskId)

                                const urlMatch = requirement.match(/(https?:\/\/[^\s]+)/i)
                                const url = urlMatch ? urlMatch[0] : null
                                const taskText = requirement.replace(/(https?:\/\/[^\s]+)/i, "").trim()

                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`glass-card p-6 transition-all duration-300 ${
                                      isCompleted
                                        ? "border-green-500/30 bg-green-500/5"
                                        : "hover:border-blue-500/30 hover:bg-blue-500/5"
                                    }`}
                                  >
                                    <div className="flex items-start gap-4">
                                      {/* Task Number/Status */}
                                      <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold flex-shrink-0 transition-all duration-300 ${
                                          isCompleted
                                            ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                            : "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                        }`}
                                      >
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                                      </div>

                                      {/* Task Content */}
                                      <div className="flex-1 min-w-0">
                                        <h3
                                          className={`font-semibold text-lg mb-3 transition-colors ${
                                            isCompleted ? "text-green-400" : "text-white"
                                          }`}
                                        >
                                          {taskText || requirement}
                                        </h3>

                                        {/* URL Button */}
                                        {url && (
                                          <div className="mb-4">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="glass-button text-blue-400 hover:text-blue-300"
                                              asChild
                                            >
                                              <a href={url} target="_blank" rel="noopener noreferrer">
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                {getDomainFromUrl(url)}
                                                <ExternalLink className="h-3 w-3 ml-2" />
                                              </a>
                                            </Button>
                                          </div>
                                        )}

                                        {/* Completion Controls */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            <Checkbox
                                              id={`task-${index}`}
                                              checked={isCompleted}
                                              onCheckedChange={(checked) => handleTaskComplete(index, !!checked)}
                                              disabled={expired}
                                              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                            />
                                            <label
                                              htmlFor={`task-${index}`}
                                              className={`text-sm font-medium leading-none cursor-pointer transition-colors ${
                                                isCompleted ? "text-green-400" : "text-gray-300"
                                              } ${expired ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                              {isCompleted ? "Completed!" : "Mark as completed"}
                                            </label>
                                          </div>

                                          {isCompleted && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="flex items-center gap-2"
                                            >
                                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Done
                                              </Badge>
                                              <span className="text-xs text-green-400 font-medium">+10 pts</span>
                                            </motion.div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                            <Circle className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">No Tasks Available</h3>
                          <p className="text-gray-400 mb-4">Tasks will be added soon. Stay tuned!</p>
                          <Button variant="outline" className="glass-button">
                            <Bell className="w-4 h-4 mr-2" />
                            Notify Me
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-white">Airdrop Details</CardTitle>
                      <CardDescription className="text-gray-400">
                        Complete information about this airdrop
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Project Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Blockchain</h4>
                          <p className="text-white font-semibold capitalize">{airdrop.blockchain || "Ethereum"}</p>
                        </div>

                        <div className="glass-card p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Difficulty</h4>
                          <Badge
                            className={`${
                              airdrop.difficulty_level === "easy"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : airdrop.difficulty_level === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                          >
                            {airdrop.difficulty_level || "Easy"}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-white mb-4">About This Project</h4>
                        <p className="text-gray-300 leading-relaxed">{airdrop.description}</p>
                      </div>

                      {/* Social Links */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Official Links</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {airdrop.website_url && (
                            <Button variant="outline" className="glass-button justify-start h-auto p-4" asChild>
                              <a href={airdrop.website_url} target="_blank" rel="noopener noreferrer">
                                <Globe className="w-5 h-5 mr-3 text-gray-400" />
                                <div className="text-left">
                                  <div className="font-medium text-white">Website</div>
                                  <div className="text-xs text-gray-400">{getDomainFromUrl(airdrop.website_url)}</div>
                                </div>
                                <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                              </a>
                            </Button>
                          )}

                          {airdrop.twitter_url && (
                            <Button
                              variant="outline"
                              className="glass-button justify-start h-auto p-4 border-blue-500/30 hover:bg-blue-500/10"
                              asChild
                            >
                              <a href={airdrop.twitter_url} target="_blank" rel="noopener noreferrer">
                                <TwitterIcon className="w-5 h-5 mr-3 text-blue-400" />
                                <div className="text-left">
                                  <div className="font-medium text-white">Twitter</div>
                                  <div className="text-xs text-gray-400">Follow for updates</div>
                                </div>
                                <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                              </a>
                            </Button>
                          )}

                          {airdrop.discord_url && (
                            <Button
                              variant="outline"
                              className="glass-button justify-start h-auto p-4 border-indigo-500/30 hover:bg-indigo-500/10"
                              asChild
                            >
                              <a href={airdrop.discord_url} target="_blank" rel="noopener noreferrer">
                                <DiscordIcon className="w-5 h-5 mr-3 text-indigo-400" />
                                <div className="text-left">
                                  <div className="font-medium text-white">Discord</div>
                                  <div className="text-xs text-gray-400">Join community</div>
                                </div>
                                <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                              </a>
                            </Button>
                          )}

                          {airdrop.telegram_url && (
                            <Button
                              variant="outline"
                              className="glass-button justify-start h-auto p-4 border-sky-500/30 hover:bg-sky-500/10"
                              asChild
                            >
                              <a href={airdrop.telegram_url} target="_blank" rel="noopener noreferrer">
                                <TelegramIcon className="w-5 h-5 mr-3 text-sky-400" />
                                <div className="text-left">
                                  <div className="font-medium text-white">Telegram</div>
                                  <div className="text-xs text-gray-400">Join channel</div>
                                </div>
                                <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rewards">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Gift className="w-5 h-5 text-yellow-400" />
                        Rewards Structure
                      </CardTitle>
                      <CardDescription className="text-gray-400">What you can earn from this airdrop</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Reward Overview */}
                      <div className="glass-card p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                          <Coins className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{airdrop.reward_amount || "TBA"}</h3>
                        <p className="text-gray-400">Total Reward Pool</p>
                      </div>

                      {/* Reward Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-card p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Reward Type</h4>
                          <p className="text-white font-semibold capitalize">{airdrop.reward_type || "Token"}</p>
                        </div>

                        <div className="glass-card p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Max Participants</h4>
                          <p className="text-white font-semibold">
                            {airdrop.max_participants ? formatNumber(airdrop.max_participants) : "Unlimited"}
                          </p>
                        </div>
                      </div>

                      {/* Distribution Info */}
                      <div className="glass-card p-6">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          Distribution Timeline
                        </h4>
                        <div className="space-y-3 text-gray-300">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>Airdrop ends: {endDate}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>Verification period: 1-2 weeks</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Token distribution: 2-4 weeks after verification</span>
                          </div>
                        </div>
                      </div>

                      {/* Bonus Info */}
                      <div className="glass-card p-6 border-yellow-500/20 bg-yellow-500/5">
                        <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Bonus Opportunities
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400" />
                            Early completion bonus: +20% rewards
                          </li>
                          <li className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400" />
                            Referral bonus: +10% for each friend
                          </li>
                          <li className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400" />
                            Community engagement: Extra points
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Right Column - Progress Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Progress Card */}
            <Card className="glass-card sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="w-5 h-5 text-blue-400" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-6">
                    {/* Progress Circle */}
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-700"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - userProgress / 100)}`}
                            className="text-blue-400 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">{Math.round(userProgress)}%</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-400 mb-2">Tasks Completed</div>
                      <div className="text-lg font-semibold text-white">
                        {completedTasks.length} / {requirements.length}
                      </div>
                    </div>

                    {/* Points Earned */}
                    <div className="glass-card p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{completedTasks.length * 10}</div>
                      <div className="text-sm text-gray-400">Points Earned</div>
                    </div>

                    {/* Complete Button */}
                    <Button
                      className="w-full btn-gradient text-lg py-6"
                      disabled={expired || requirements.length === 0 || completedTasks.length !== requirements.length}
                      onClick={handleCompleteAllTasks}
                    >
                      {expired ? (
                        "Airdrop Ended"
                      ) : completedTasks.length === requirements.length ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Complete Airdrop
                        </>
                      ) : (
                        "Complete All Tasks"
                      )}
                    </Button>

                    {/* Next Steps */}
                    {completedTasks.length === requirements.length && !expired && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4 border-green-500/20 bg-green-500/5"
                      >
                        <h4 className="font-semibold text-green-400 mb-2">🎉 Ready to Complete!</h4>
                        <p className="text-sm text-gray-300">
                          You've completed all tasks. Click the button above to finalize your participation.
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sign In Required</h3>
                    <p className="text-gray-400 mb-4 text-sm">Sign in to track your progress and earn rewards</p>
                    <Button className="w-full btn-gradient">Sign In</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Participants</span>
                  <span className="text-white font-semibold">{formatNumber(airdrop.participants_count)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Tasks</span>
                  <span className="text-white font-semibold">{requirements.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Difficulty</span>
                  <Badge className="text-xs">{airdrop.difficulty_level || "Easy"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Blockchain</span>
                  <span className="text-white font-semibold">{airdrop.blockchain || "Ethereum"}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
