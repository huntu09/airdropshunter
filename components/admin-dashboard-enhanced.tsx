"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Plus,
  Eye,
  LogOut,
  Settings,
  BarChart3,
  Rocket,
  Clock,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

const stats = [
  {
    title: "Total Airdrops",
    value: "24",
    change: "+12%",
    icon: Rocket,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Active Users",
    value: "1,234",
    change: "+23%",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Total Value",
    value: "$45,678",
    change: "+8%",
    icon: DollarSign,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Engagement",
    value: "89%",
    change: "+5%",
    icon: Activity,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

const recentAirdrops = [
  {
    id: 1,
    title: "ZK Token Airdrop",
    status: "Active",
    participants: 1234,
    value: "$50",
    endDate: "2025-06-30",
    category: "DeFi",
  },
  {
    id: 2,
    title: "Galaxy NFT Airdrop",
    status: "Active",
    participants: 856,
    value: "1 NFT",
    endDate: "2025-07-15",
    category: "NFT",
  },
  {
    id: 3,
    title: "Project X Airdrop",
    status: "Pending",
    participants: 0,
    value: "$25",
    endDate: "2025-06-25",
    category: "DeFi",
  },
]

const quickActions = [
  { title: "Add New Airdrop", icon: Plus, color: "bg-blue-600 hover:bg-blue-700" },
  { title: "Review Submissions", icon: Eye, color: "bg-green-600 hover:bg-green-700" },
  { title: "Analytics Report", icon: BarChart3, color: "bg-purple-600 hover:bg-purple-700" },
  { title: "User Management", icon: Users, color: "bg-orange-600 hover:bg-orange-700" },
]

const activities = [
  { action: "New airdrop submitted", time: "2 min ago", icon: Plus, color: "text-blue-400" },
  { action: "User registered", time: "5 min ago", icon: Users, color: "text-green-400" },
  { action: "Airdrop completed", time: "1 hour ago", icon: CheckCircle, color: "text-purple-400" },
  { action: "Review pending", time: "2 hours ago", icon: Clock, color: "text-yellow-400" },
]

export default function AdminDashboardEnhanced() {
  const router = useRouter()
  const { signOut, profile } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e]">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-[#0a0e17]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-2.5 shadow-lg shadow-blue-500/20">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-gray-400 font-medium">Airdrops Hunter Management</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800 hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-600/50 text-red-400 hover:bg-red-600/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.username || profile?.email?.split("@")[0] || "Admin"}
          </h2>
          <p className="text-gray-400">Here's what's happening with your airdrops today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-[#0f1623]/80 border-gray-800/50 hover:bg-[#0f1623] transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                  <span className="text-gray-400 text-sm">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                className={`${action.color} h-20 flex flex-col items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Airdrops */}
          <div className="lg:col-span-2">
            <Card className="bg-[#0f1623]/80 border-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Recent Airdrops</CardTitle>
                <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAirdrops.map((airdrop) => (
                  <div
                    key={airdrop.id}
                    className="flex items-center justify-between p-4 bg-[#0a0e17]/50 rounded-lg border border-gray-800/30 hover:bg-[#0a0e17]/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-2">
                        <Rocket className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{airdrop.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {airdrop.category}
                          </Badge>
                          <span className="text-xs text-gray-400">{airdrop.participants} participants</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={airdrop.status === "Active" ? "default" : "secondary"}
                        className={airdrop.status === "Active" ? "bg-green-600" : "bg-yellow-600"}
                      >
                        {airdrop.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">{airdrop.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card className="bg-[#0f1623]/80 border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#0a0e17]/30 rounded-lg">
                    <div className={`p-2 rounded-lg bg-gray-800/50 ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
