"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { Airdrop, AirdropTask, UserTaskProgress } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Users, Target, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function AirdropDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const airdropId = params.id as string

  const [airdrop, setAirdrop] = useState<Airdrop | null>(null)
  const [tasks, setTasks] = useState<AirdropTask[]>([])
  const [progress, setProgress] = useState<UserTaskProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Validate UUID format
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  useEffect(() => {
    // Check if the id is "create" or other non-UUID strings
    if (airdropId === "create") {
      router.replace("/admin-dashboard/airdrops/create")
      return
    }

    // Check if the id is a valid UUID
    if (!isValidUUID(airdropId)) {
      setError("Invalid airdrop ID format")
      setLoading(false)
      return
    }

    fetchAirdropDetails()
  }, [airdropId, router])

  const fetchAirdropDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch airdrop details using dbHelpers
      const airdropData = await dbHelpers.airdrops.getById(airdropId)

      // Fetch tasks using dbHelpers
      const tasksData = await dbHelpers.tasks.getByAirdropId(airdropId, false) // Include inactive tasks for admin

      // Fetch progress stats - fix the completed column issue
      const { data: progressData, error: progressError } = await supabase
        .from("user_task_progress")
        .select("*")
        .eq("airdrop_id", airdropId)

      if (progressError) throw progressError

      setAirdrop(airdropData)
      setTasks(tasksData || [])
      setProgress(progressData || [])
    } catch (err: any) {
      console.error("Error fetching airdrop details:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "social_follow":
        return "👥"
      case "social_share":
        return "📢"
      case "join_discord":
        return "💬"
      case "join_telegram":
        return "📱"
      case "wallet_connect":
        return "💰"
      case "quiz":
        return "❓"
      default:
        return "📋"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading airdrop details...</p>
        </div>
      </div>
    )
  }

  if (error || !airdrop) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Airdrop</h3>
          <p className="text-gray-600 mb-4">{error || "Airdrop not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const completedUsers = progress.filter((p) => p.completed_at !== null).length
  const averageCompletion =
    progress.length > 0 ? progress.reduce((sum, p) => sum + p.completion_percentage, 0) / progress.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Airdrops
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{airdrop.title}</h1>
            <p className="text-gray-600">Airdrop Details & Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(airdrop.status)}>
            {airdrop.status.charAt(0).toUpperCase() + airdrop.status.slice(1)}
          </Badge>
          <Link href={`/admin-dashboard/airdrops/${airdropId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-bold">{airdrop.participants_count}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold">{averageCompletion.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="participants">Participants ({airdrop.participants_count})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Airdrop Info */}
            <Card>
              <CardHeader>
                <CardTitle>Airdrop Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{airdrop.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{airdrop.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reward</label>
                    <p className="text-gray-900">{airdrop.reward_amount}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <p className="text-gray-900">{new Date(airdrop.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <p className="text-gray-900">{new Date(airdrop.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Requirements</label>
                  <p className="text-gray-900">{airdrop.requirements}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage this airdrop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/admin-dashboard/airdrops/${airdropId}/tasks`}>
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Tasks
                  </Button>
                </Link>
                <Link href={`/admin-dashboard/verification?airdrop=${airdropId}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review Submissions
                  </Button>
                </Link>
                <Link href={`/admin-dashboard/airdrops/${airdropId}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Airdrop
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tasks Management</h3>
            <Link href={`/admin-dashboard/airdrops/${airdropId}/tasks`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </Link>
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Yet</h3>
                <p className="text-gray-600 mb-4">Create tasks for users to complete</p>
                <Link href={`/admin-dashboard/airdrops/${airdropId}/tasks`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTaskTypeIcon(task.task_type)}</span>
                        <div>
                          <h4 className="font-semibold">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.required ? "default" : "secondary"}>
                          {task.required ? "Required" : "Optional"}
                        </Badge>
                        <Badge variant="outline">{task.points_reward} pts</Badge>
                        <Badge variant={task.active ? "default" : "secondary"}>
                          {task.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <h3 className="text-lg font-semibold">Participant Progress</h3>

          {progress.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Participants Yet</h3>
                <p className="text-gray-600">Waiting for users to join this airdrop</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {progress.map((userProgress) => (
                <Card key={userProgress.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">User Progress</h4>
                        <p className="text-sm text-gray-600">
                          {userProgress.completed_tasks} of {userProgress.total_tasks} tasks completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {userProgress.completion_percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">{userProgress.total_points_earned} points</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${userProgress.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
