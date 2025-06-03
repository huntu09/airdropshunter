"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, Rocket, Eye, Calendar, DollarSign, Activity, Globe } from "lucide-react"

// Tambahkan import untuk toast dan dbHelpers
import { toast } from "@/hooks/use-toast"
import { dbHelpers } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

// Tambahkan import ExportData
import ExportData from "@/components/admin/export-data"

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)

  // Tambahkan state untuk data real
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Ganti useEffect untuk mengambil data real
  useEffect(() => {
    // Fetch real data
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)

        // Get admin stats
        const stats = await dbHelpers.admin.getStats().catch((err) => {
          console.error("Error fetching admin stats:", err)
          return null
        })

        // Get user growth data
        const { data: userGrowth, error: userError } = await supabase
          .from("profiles")
          .select("created_at")
          .order("created_at", { ascending: true })

        if (userError) throw userError

        // Get airdrop performance data
        const { data: airdropPerf, error: airdropError } = await supabase
          .from("airdrops")
          .select("title, participants_count, reward_amount")
          .order("participants_count", { ascending: false })
          .limit(5)

        if (airdropError) throw airdropError

        // Get category distribution
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("name, airdrops(id)")

        if (categoryError) throw categoryError

        // Process user growth data by month
        const usersByMonth = userGrowth?.reduce((acc: any, user: any) => {
          const date = new Date(user.created_at)
          const month = date.toLocaleString("default", { month: "short" })

          if (!acc[month]) acc[month] = 0
          acc[month]++
          return acc
        }, {})

        const userGrowthData = Object.entries(usersByMonth || {}).map(([month, users]) => ({
          month,
          users,
        }))

        // Process airdrop performance data
        const airdropPerformanceData =
          airdropPerf?.map((airdrop) => ({
            name: airdrop.title,
            participants: airdrop.participants_count,
            value: Number.parseInt(airdrop.reward_amount) || 0,
          })) || []

        // Process category data
        const categoryColors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"]
        const categoryDistribution =
          categoryData?.map((category, index) => ({
            name: category.name,
            value: (category.airdrops || []).length,
            color: categoryColors[index % categoryColors.length],
          })) || []

        // Set analytics data
        setAnalyticsData({
          stats: stats || {
            total_users: 0,
            active_users: 0,
            total_airdrops: 0,
            total_value: 0,
            page_views: 0,
          },
          userGrowthData: userGrowthData,
          airdropPerformanceData: airdropPerformanceData,
          categoryData: categoryDistribution,
          trafficData: [
            { source: "Direct", visitors: 2340, percentage: 45 },
            { source: "Social Media", visitors: 1560, percentage: 30 },
            { source: "Search", visitors: 780, percentage: 15 },
            { source: "Referral", visitors: 520, percentage: 10 },
          ], // Traffic data still mock for now
        })
      } catch (err: any) {
        console.error("Error fetching analytics data:", err)
        toast({
          title: "Error loading analytics",
          description: err.message || "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  // Mock data for charts
  // const userGrowthData = [
  //   { month: "Jan", users: 120 },
  //   { month: "Feb", users: 180 },
  //   { month: "Mar", users: 250 },
  //   { month: "Apr", users: 320 },
  //   { month: "May", users: 450 },
  //   { month: "Jun", users: 580 },
  // ]

  // const airdropPerformanceData = [
  //   { name: "ZK Token", participants: 1234, value: 50000 },
  //   { name: "Galaxy NFT", participants: 856, value: 25000 },
  //   { name: "Project X", participants: 642, value: 15000 },
  //   { name: "DeFi Boost", participants: 423, value: 12000 },
  //   { name: "Layer 2", participants: 298, value: 8000 },
  // ]

  // const categoryData = [
  //   { name: "DeFi", value: 35, color: "#3B82F6" },
  //   { name: "NFT", value: 25, color: "#8B5CF6" },
  //   { name: "Gaming", value: 20, color: "#10B981" },
  //   { name: "Layer 1", value: 12, color: "#F59E0B" },
  //   { name: "Other", value: 8, color: "#EF4444" },
  // ]

  const trafficData = [
    { source: "Direct", visitors: 2340, percentage: 45 },
    { source: "Social Media", visitors: 1560, percentage: 30 },
    { source: "Search", visitors: 780, percentage: 15 },
    { source: "Referral", visitors: 520, percentage: 10 },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Track performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <ExportData table="airdrops" buttonText="Export Airdrops" />
          <ExportData table="profiles" buttonText="Export Users" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Page Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.stats.page_views?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Updated in real-time
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.stats.active_users?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active this month
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Airdrops</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.stats.total_airdrops?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  All time
                </p>
              </div>
              <Rocket className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${analyticsData?.stats.total_value?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Estimated value
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.userGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Airdrop Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.categoryData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(analyticsData?.categoryData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Airdrops */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Top Performing Airdrops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.airdropPerformanceData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participants" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficData.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{source.visitors.toLocaleString()}</span>
                    <Badge variant="outline">{source.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">156</p>
              <p className="text-sm text-gray-500">New users this week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">23</p>
              <p className="text-sm text-gray-500">Airdrops launched this month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">89%</p>
              <p className="text-sm text-gray-500">User engagement rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
