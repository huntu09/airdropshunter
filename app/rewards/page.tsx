"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trophy,
  Star,
  Award,
  Crown,
  Medal,
  Zap,
  ShoppingCart,
  Flame,
  ChevronUp,
  ChevronDown,
  Share2,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

interface UserReward {
  id: string
  user_id: string
  type: string
  points: number
  description: string
  created_at: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "participation" | "social" | "milestone" | "special"
  rarity: "bronze" | "silver" | "gold" | "platinum"
  unlocked: boolean
  progress: number
  maxProgress: number
  points_reward: number
  unlock_condition: string
}

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: "crypto" | "nft" | "merchandise" | "premium"
  image_url: string
  stock: number
  limited: boolean
  available: boolean
}

interface LeaderboardEntry {
  id: string
  username: string
  avatar_url?: string
  points: number
  rank: number
  change: number
  achievements_count: number
}

interface UserLevel {
  current_level: number
  current_xp: number
  xp_to_next: number
  total_xp: number
  level_benefits: string[]
}

export default function RewardsPage() {
  const { user, profile } = useAuth()
  const [rewards, setRewards] = useState<UserReward[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [achievementFilter, setAchievementFilter] = useState("all")
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all-time")
  const [shopCategory, setShopCategory] = useState("all")
  const [dailyStreak, setDailyStreak] = useState(0)
  const [dailyChallenges, setDailyChallenges] = useState([])

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchRewards(),
        fetchAchievements(),
        fetchShopItems(),
        fetchLeaderboard(),
        fetchUserLevel(),
        fetchDailyStreak(),
        fetchDailyChallenges(),
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from("user_rewards")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    setRewards(data || [])
  }

  const fetchAchievements = async () => {
    // Mock achievements data - in real app, this would come from database
    const mockAchievements: Achievement[] = [
      {
        id: "1",
        title: "First Steps",
        description: "Complete your first airdrop task",
        icon: "🎯",
        category: "participation",
        rarity: "bronze",
        unlocked: (profile?.completed_airdrops || 0) > 0,
        progress: Math.min(profile?.completed_airdrops || 0, 1),
        maxProgress: 1,
        points_reward: 100,
        unlock_condition: "Complete 1 airdrop task",
      },
      {
        id: "2",
        title: "Point Collector",
        description: "Earn 1000 points",
        icon: "💎",
        category: "milestone",
        rarity: "silver",
        unlocked: (profile?.total_points || 0) >= 1000,
        progress: Math.min(profile?.total_points || 0, 1000),
        maxProgress: 1000,
        points_reward: 200,
        unlock_condition: "Earn 1000 total points",
      },
      {
        id: "3",
        title: "Airdrop Hunter",
        description: "Complete 10 airdrops",
        icon: "🏆",
        category: "participation",
        rarity: "gold",
        unlocked: (profile?.completed_airdrops || 0) >= 10,
        progress: Math.min(profile?.completed_airdrops || 0, 10),
        maxProgress: 10,
        points_reward: 500,
        unlock_condition: "Complete 10 airdrops",
      },
      {
        id: "4",
        title: "Social Butterfly",
        description: "Share 5 airdrops on social media",
        icon: "🦋",
        category: "social",
        rarity: "bronze",
        unlocked: false,
        progress: 2,
        maxProgress: 5,
        points_reward: 150,
        unlock_condition: "Share 5 airdrops",
      },
      {
        id: "5",
        title: "Legendary Hunter",
        description: "Complete 100 airdrops",
        icon: "👑",
        category: "participation",
        rarity: "platinum",
        unlocked: false,
        progress: profile?.completed_airdrops || 0,
        maxProgress: 100,
        points_reward: 2000,
        unlock_condition: "Complete 100 airdrops",
      },
      {
        id: "6",
        title: "Streak Master",
        description: "Maintain a 30-day login streak",
        icon: "🔥",
        category: "special",
        rarity: "gold",
        unlocked: false,
        progress: dailyStreak,
        maxProgress: 30,
        points_reward: 1000,
        unlock_condition: "Login for 30 consecutive days",
      },
    ]

    setAchievements(mockAchievements)
  }

  const fetchShopItems = async () => {
    // Mock shop items - in real app, this would come from database
    const mockShopItems: ShopItem[] = [
      {
        id: "1",
        name: "Premium Badge",
        description: "Exclusive premium badge for your profile",
        price: 1000,
        category: "premium",
        image_url: "/placeholder.svg?height=100&width=100",
        stock: 999,
        limited: false,
        available: true,
      },
      {
        id: "2",
        name: "0.01 ETH",
        description: "Ethereum cryptocurrency reward",
        price: 5000,
        category: "crypto",
        image_url: "/placeholder.svg?height=100&width=100",
        stock: 10,
        limited: true,
        available: true,
      },
      {
        id: "3",
        name: "Exclusive NFT",
        description: "Limited edition AirdropHunter NFT",
        price: 10000,
        category: "nft",
        image_url: "/placeholder.svg?height=100&width=100",
        stock: 5,
        limited: true,
        available: true,
      },
      {
        id: "4",
        name: "T-Shirt",
        description: "Official AirdropHunter merchandise",
        price: 2000,
        category: "merchandise",
        image_url: "/placeholder.svg?height=100&width=100",
        stock: 50,
        limited: false,
        available: true,
      },
    ]

    setShopItems(mockShopItems)
  }

  const fetchLeaderboard = async () => {
    // Mock leaderboard data - in real app, this would come from database
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: "1",
        username: "CryptoHunter",
        avatar_url: "/placeholder.svg?height=40&width=40",
        points: 25000,
        rank: 1,
        change: 0,
        achievements_count: 15,
      },
      {
        id: "2",
        username: "AirdropMaster",
        avatar_url: "/placeholder.svg?height=40&width=40",
        points: 22000,
        rank: 2,
        change: 1,
        achievements_count: 12,
      },
      {
        id: "3",
        username: "TokenCollector",
        avatar_url: "/placeholder.svg?height=40&width=40",
        points: 20000,
        rank: 3,
        change: -1,
        achievements_count: 10,
      },
    ]

    setLeaderboard(mockLeaderboard)
  }

  const fetchUserLevel = async () => {
    const totalXP = profile?.total_points || 0
    const currentLevel = Math.floor(totalXP / 1000) + 1
    const currentXP = totalXP % 1000
    const xpToNext = 1000 - currentXP

    setUserLevel({
      current_level: currentLevel,
      current_xp: currentXP,
      xp_to_next: xpToNext,
      total_xp: totalXP,
      level_benefits: ["Increased point multiplier", "Exclusive achievements", "Priority support", "Special badge"],
    })
  }

  const fetchDailyStreak = async () => {
    // Mock daily streak - in real app, this would come from database
    setDailyStreak(7)
  }

  const fetchDailyChallenges = async () => {
    // Mock daily challenges - in real app, this would come from database
    setDailyChallenges([])
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "bronze":
        return "from-amber-600 to-amber-800"
      case "silver":
        return "from-gray-400 to-gray-600"
      case "gold":
        return "from-yellow-400 to-yellow-600"
      case "platinum":
        return "from-purple-400 to-purple-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "bronze":
        return "border-amber-500/50"
      case "silver":
        return "border-gray-400/50"
      case "gold":
        return "border-yellow-400/50"
      case "platinum":
        return "border-purple-400/50"
      default:
        return "border-gray-400/50"
    }
  }

  const handlePurchaseItem = async (item: ShopItem) => {
    if (!user || (profile?.total_points || 0) < item.price) {
      toast.error("Insufficient points!")
      return
    }

    try {
      // In real app, this would make API call to purchase item
      toast.success(`Successfully purchased ${item.name}!`)

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch (error) {
      toast.error("Purchase failed!")
    }
  }

  const filteredAchievements = achievements.filter(
    (achievement) => achievementFilter === "all" || achievement.category === achievementFilter,
  )

  const filteredShopItems = shopItems.filter((item) => shopCategory === "all" || item.category === shopCategory)

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
          <p className="text-gray-400 mb-4">Please login to view your rewards</p>
          <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center my-16 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4"
        >
          <Trophy className="h-4 w-4" />
          <span>Rewards & Achievements</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200"
        >
          REWARDS CENTER
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          Track your progress, unlock achievements, and redeem amazing rewards!
        </motion.p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-auto min-w-full bg-gray-800/50">
            <TabsTrigger value="overview" className="px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="px-4">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="shop" className="px-4">
              Shop
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="px-4">
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="level" className="px-4">
              Level
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-300">{profile?.total_points?.toLocaleString() || 0}</div>
                  <div className="text-sm text-blue-400">Total Points</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-300">{userLevel?.current_level || 1}</div>
                  <div className="text-sm text-green-400">Current Level</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-300">
                    {achievements.filter((a) => a.unlocked).length}
                  </div>
                  <div className="text-sm text-yellow-400">Achievements</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="h-5 w-5 text-red-400" />
                    <div className="text-2xl font-bold text-red-300">{dailyStreak}</div>
                  </div>
                  <div className="text-sm text-red-400">Day Streak</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Level Progress */}
          {userLevel && (
            <Card className="bg-[#0f1623]/80 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Level {userLevel.current_level}</span>
                  <span className="text-gray-300">Level {userLevel.current_level + 1}</span>
                </div>
                <Progress value={(userLevel.current_xp / 1000) * 100} className="h-3" />
                <div className="text-center text-sm text-gray-400">
                  {userLevel.current_xp} / 1000 XP ({userLevel.xp_to_next} XP to next level)
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Achievements */}
          <Card className="bg-[#0f1623]/80 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements
                  .filter((a) => a.unlocked)
                  .slice(0, 3)
                  .map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} p-4 rounded-lg border ${getRarityBorder(achievement.rarity)}`}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl">{achievement.icon}</div>
                        <h3 className="font-semibold text-white">{achievement.title}</h3>
                        <p className="text-sm text-gray-200">{achievement.description}</p>
                        <Badge className="bg-white/20 text-white">+{achievement.points_reward} pts</Badge>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Achievements</h2>
            <Select value={achievementFilter} onValueChange={setAchievementFilter}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="participation">Participation</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} border ${getRarityBorder(achievement.rarity)}`
                        : "bg-gray-900/50 border-gray-700"
                    } relative overflow-hidden`}
                  >
                    {achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div>
                          <h3 className={`font-bold text-lg ${achievement.unlocked ? "text-white" : "text-gray-300"}`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${achievement.unlocked ? "text-gray-100" : "text-gray-400"}`}>
                            {achievement.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={
                              achievement.unlocked ? "border-white text-white" : "border-gray-600 text-gray-400"
                            }
                          >
                            {achievement.rarity}
                          </Badge>
                          <Badge
                            className={achievement.unlocked ? "bg-white/20 text-white" : "bg-gray-600/20 text-gray-400"}
                          >
                            +{achievement.points_reward} pts
                          </Badge>
                        </div>

                        {!achievement.unlocked && (
                          <p className="text-xs text-gray-500 italic">{achievement.unlock_condition}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Points Shop</h2>
              <p className="text-gray-400">Your balance: {profile?.total_points?.toLocaleString() || 0} points</p>
            </div>
            <Select value={shopCategory} onValueChange={setShopCategory}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="nft">NFT</SelectItem>
                <SelectItem value="merchandise">Merchandise</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShopItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700 overflow-hidden">
                  <div className="aspect-square bg-gray-800 flex items-center justify-center">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      {item.limited && (
                        <Badge variant="destructive" className="text-xs">
                          Limited
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-yellow-400">{item.price.toLocaleString()} pts</div>
                      {item.limited && <div className="text-sm text-gray-400">{item.stock} left</div>}
                    </div>

                    <Button
                      onClick={() => handlePurchaseItem(item)}
                      disabled={!item.available || (profile?.total_points || 0) < item.price}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {(profile?.total_points || 0) < item.price ? "Insufficient Points" : "Purchase"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
            <div className="flex gap-2">
              <Select value={leaderboardPeriod} onValueChange={setLeaderboardPeriod}>
                <SelectTrigger className="w-[140px] bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="border-gray-600">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="bg-[#0f1623]/80 border-gray-800/50">
            <CardContent className="p-0">
              <div className="space-y-1">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 ${
                      entry.rank <= 3 ? "bg-gradient-to-r from-yellow-900/20 to-transparent" : "hover:bg-gray-800/30"
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1
                            ? "bg-yellow-500 text-black"
                            : entry.rank === 2
                              ? "bg-gray-400 text-black"
                              : entry.rank === 3
                                ? "bg-amber-600 text-black"
                                : "bg-gray-700 text-white"
                        }`}
                      >
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? (
                            <Crown className="h-4 w-4" />
                          ) : entry.rank === 2 ? (
                            <Medal className="h-4 w-4" />
                          ) : (
                            <Award className="h-4 w-4" />
                          )
                        ) : (
                          entry.rank
                        )}
                      </div>

                      <img
                        src={entry.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                        alt={entry.username}
                        className="w-10 h-10 rounded-full"
                      />

                      <div>
                        <div className="font-semibold text-white">{entry.username}</div>
                        <div className="text-sm text-gray-400">{entry.achievements_count} achievements</div>
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-yellow-400">{entry.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">points</div>
                      </div>

                      {entry.change !== 0 && (
                        <div className={`flex items-center ${entry.change > 0 ? "text-green-400" : "text-red-400"}`}>
                          {entry.change > 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          <span className="text-sm">{Math.abs(entry.change)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Level Tab */}
        <TabsContent value="level" className="space-y-6">
          {userLevel && (
            <>
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white text-2xl font-bold"
                >
                  {userLevel.current_level}
                </motion.div>
                <h2 className="text-3xl font-bold text-white">Level {userLevel.current_level}</h2>
                <p className="text-gray-400">Total XP: {userLevel.total_xp.toLocaleString()}</p>
              </div>

              <Card className="bg-[#0f1623]/80 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-center">
                    Progress to Level {userLevel.current_level + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Level {userLevel.current_level}</span>
                    <span>{userLevel.current_xp} / 1000 XP</span>
                    <span>Level {userLevel.current_level + 1}</span>
                  </div>
                  <Progress value={(userLevel.current_xp / 1000) * 100} className="h-4" />
                  <div className="text-center text-gray-400">{userLevel.xp_to_next} XP needed for next level</div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f1623]/80 border-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Level Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userLevel.level_benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
