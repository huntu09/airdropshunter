"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Calendar,
  LinkIcon,
  Twitter,
  MessageCircle,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  Target,
  TrendingUp,
  Gift,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface UserStats {
  totalPoints: number
  completedAirdrops: number
  pendingVerifications: number
  successRate: number
  rank: number
  totalUsers: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    points: number
    date: string
  }>
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

export default function ProfilePage() {
  const { user, profile, isLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    twitter_username: "",
    discord_username: "",
    telegram_username: "",
    wallet_address: "",
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        twitter_username: profile.twitter_username || "",
        discord_username: profile.discord_username || "",
        telegram_username: profile.telegram_username || "",
        wallet_address: profile.wallet_address || "",
      })
      fetchUserStats()
      fetchAchievements()
    }
  }, [profile])

  const fetchUserStats = async () => {
    if (!user) return

    try {
      // Fetch user statistics
      const { data: userStats } = await supabase
        .from("profiles")
        .select("points, completed_airdrops")
        .eq("id", user.id)
        .single()

      // Fetch pending verifications
      const { data: pendingVerifications } = await supabase
        .from("airdrop_verifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")

      // Fetch recent activity
      const { data: recentActivity } = await supabase
        .from("user_task_progress")
        .select(`
          id,
          completed_at,
          airdrop_tasks!inner(title, points_reward),
          airdrops!inner(title)
        `)
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(5)

      // Calculate success rate
      const { data: totalSubmissions } = await supabase
        .from("airdrop_verifications")
        .select("id, status")
        .eq("user_id", user.id)

      const approvedCount = totalSubmissions?.filter((s) => s.status === "approved").length || 0
      const totalCount = totalSubmissions?.length || 0
      const successRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0

      // Get user rank (simplified)
      const { data: allUsers } = await supabase.from("profiles").select("points").order("points", { ascending: false })

      const userRank = allUsers?.findIndex((u) => u.points <= (userStats?.points || 0)) + 1 || 0

      setStats({
        totalPoints: userStats?.points || 0,
        completedAirdrops: userStats?.completed_airdrops || 0,
        pendingVerifications: pendingVerifications?.length || 0,
        successRate: Math.round(successRate),
        rank: userRank,
        totalUsers: allUsers?.length || 0,
        recentActivity:
          recentActivity?.map((activity) => ({
            id: activity.id,
            type: "task_completed",
            description: `Completed task in ${activity.airdrops.title}`,
            points: activity.airdrop_tasks.points_reward,
            date: activity.completed_at,
          })) || [],
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const fetchAchievements = async () => {
    // Mock achievements - in real app, this would come from database
    const mockAchievements: Achievement[] = [
      {
        id: "1",
        title: "First Steps",
        description: "Complete your first airdrop task",
        icon: "🎯",
        unlocked: (stats?.completedAirdrops || 0) > 0,
        progress: Math.min(stats?.completedAirdrops || 0, 1),
        maxProgress: 1,
      },
      {
        id: "2",
        title: "Point Collector",
        description: "Earn 1000 points",
        icon: "💎",
        unlocked: (stats?.totalPoints || 0) >= 1000,
        progress: Math.min(stats?.totalPoints || 0, 1000),
        maxProgress: 1000,
      },
      {
        id: "3",
        title: "Airdrop Hunter",
        description: "Complete 10 airdrops",
        icon: "🏆",
        unlocked: (stats?.completedAirdrops || 0) >= 10,
        progress: Math.min(stats?.completedAirdrops || 0, 10),
        maxProgress: 10,
      },
      {
        id: "4",
        title: "Perfect Score",
        description: "Achieve 100% success rate with 5+ submissions",
        icon: "⭐",
        unlocked: (stats?.successRate || 0) === 100 && (stats?.completedAirdrops || 0) >= 5,
        progress: stats?.successRate || 0,
        maxProgress: 100,
      },
    ]

    setAchievements(mockAchievements)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          twitter_username: formData.twitter_username,
          discord_username: formData.discord_username,
          telegram_username: formData.telegram_username,
          wallet_address: formData.wallet_address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      await refreshProfile()
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        twitter_username: profile.twitter_username || "",
        discord_username: profile.discord_username || "",
        telegram_username: profile.telegram_username || "",
        wallet_address: profile.wallet_address || "",
      })
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center my-16 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            YOUR PROFILE
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Please log in to view your profile.</p>
          <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
            Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            YOUR PROFILE
          </h1>
          <p className="text-gray-400">Manage your account and track your progress</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-blue-500/20">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl">
                        {profile?.username?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                      {profile?.full_name || profile?.username || "Anonymous User"}
                    </h2>
                    <p className="text-gray-400">@{profile?.username}</p>
                    {profile?.bio && <p className="text-gray-300 max-w-md">{profile.bio}</p>}

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                        {profile?.role === "admin" ? "Admin" : "Member"}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined {new Date(profile?.created_at || "").toLocaleDateString()}
                      </Badge>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-3 justify-center md:justify-start">
                      {profile?.twitter_username && (
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          <Twitter className="h-4 w-4" />
                        </Button>
                      )}
                      {profile?.discord_username && (
                        <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {profile?.wallet_address && (
                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-300">{stats.totalPoints.toLocaleString()}</div>
                    <div className="text-sm text-blue-400">Total Points</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-300">{stats.completedAirdrops}</div>
                    <div className="text-sm text-green-400">Completed</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-300">{stats.successRate}%</div>
                    <div className="text-sm text-yellow-400">Success Rate</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-300">#{stats.rank}</div>
                    <div className="text-sm text-purple-400">Global Rank</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="space-y-6">
            <Card className="bg-gray-900/90 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Edit Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-gray-300">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-300">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                <Separator className="bg-gray-700" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-gray-300">
                      Twitter Handle
                    </Label>
                    <Input
                      id="twitter"
                      value={formData.twitter_username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, twitter_username: e.target.value }))}
                      placeholder="@username"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discord" className="text-gray-300">
                      Discord Handle
                    </Label>
                    <Input
                      id="discord"
                      value={formData.discord_username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, discord_username: e.target.value }))}
                      placeholder="username#1234"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegram" className="text-gray-300">
                      Telegram Handle
                    </Label>
                    <Input
                      id="telegram"
                      value={formData.telegram_username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, telegram_username: e.target.value }))}
                      placeholder="@username"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-gray-300">
                    Wallet Address
                  </Label>
                  <Input
                    id="wallet"
                    value={formData.wallet_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, wallet_address: e.target.value }))}
                    placeholder="0x..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50"
                      : "bg-gray-900/50 border-gray-700"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? "text-yellow-300" : "text-gray-300"}`}>
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                        </div>
                      </div>
                      {achievement.unlocked && <Award className="h-5 w-5 text-yellow-400" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-gray-900/90 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                        <div className="bg-green-600/20 rounded-full p-2">
                          <Gift className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300">{activity.description}</p>
                          <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                          +{activity.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Complete some airdrop tasks to see your activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
