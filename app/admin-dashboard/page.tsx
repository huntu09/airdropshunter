"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface Stats {
  totalUsers: number
  totalAirdrops: number
  activeAirdrops: number
  totalParticipants: number
}

const AdminDashboard = () => {
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAirdrops: 0,
    activeAirdrops: 0,
    totalParticipants: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null)

        // Get admin statistics using the correct SQL function name
        const { data: statsData, error: statsError } = await supabase.rpc("get_admin_stats")

        if (statsError) {
          console.error("Supabase RPC Error:", statsError)
          toast({
            variant: "destructive",
            title: "Error fetching stats",
            description: statsError.message,
          })
          throw statsError
        }

        console.log("Stats data received:", statsData)

        if (statsData) {
          setStats({
            totalUsers: statsData.total_users || 0,
            totalAirdrops: statsData.total_airdrops || 0,
            activeAirdrops: statsData.active_airdrops || 0,
            totalParticipants: statsData.total_participants || 0,
          })
          toast({
            variant: "success",
            title: "Dashboard updated",
            description: "Latest statistics loaded successfully",
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch stats")

        // Fallback to manual queries if RPC fails
        try {
          toast({
            variant: "warning",
            title: "Using fallback data",
            description: "Some features may be limited",
          })

          const [usersResult, airdropsResult, participantsResult] = await Promise.all([
            supabase.from("profiles").select("id", { count: "exact", head: true }),
            supabase.from("airdrops").select("id", { count: "exact", head: true }),
            supabase.from("airdrop_participants").select("id", { count: "exact", head: true }),
          ])

          setStats({
            totalUsers: usersResult.count || 0,
            totalAirdrops: airdropsResult.count || 0,
            activeAirdrops: 0, // Will need separate query for active only
            totalParticipants: participantsResult.count || 0,
          })

          setError(null) // Clear error if fallback works
        } catch (fallbackError) {
          console.error("Fallback query failed:", fallbackError)
          toast({
            variant: "destructive",
            title: "Data retrieval failed",
            description: "Please try again later",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (error && stats.totalUsers === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-5">Admin Dashboard</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">
              <p className="font-semibold">Error loading dashboard:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-5">Admin Dashboard</h1>

      {error && (
        <Card className="mb-5 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="text-yellow-800">
              <p className="text-sm">⚠️ Using fallback data due to: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Airdrops</CardTitle>
            <CardDescription>Total number of airdrops created</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalAirdrops.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Airdrops</CardTitle>
            <CardDescription>Currently running airdrops</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeAirdrops.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Participants</CardTitle>
            <CardDescription>Total participants in all airdrops</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
