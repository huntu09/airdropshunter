"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase, dbHelpers } from "@/lib/supabase"
import type { Airdrop, AirdropTask } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function TaskManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuth()
  const airdropId = params.id as string

  const [airdrop, setAirdrop] = useState<Airdrop | null>(null)
  const [tasks, setTasks] = useState<AirdropTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<AirdropTask | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    task_type: "social_follow",
    required: true,
    points_reward: 10,
    verification_method: "manual",
    task_data: {},
    sort_order: 0,
    active: true,
  })

  const taskTypes = [
    { value: "social_follow", label: "Social Follow", icon: "👥" },
    { value: "social_share", label: "Social Share", icon: "📢" },
    { value: "social_like", label: "Social Like", icon: "❤️" },
    { value: "join_discord", label: "Join Discord", icon: "💬" },
    { value: "join_telegram", label: "Join Telegram", icon: "📱" },
    { value: "visit_website", label: "Visit Website", icon: "🌐" },
    { value: "wallet_connect", label: "Wallet Connect", icon: "💰" },
    { value: "quiz", label: "Quiz", icon: "❓" },
    { value: "referral", label: "Referral", icon: "🔗" },
    { value: "custom", label: "Custom", icon: "📋" },
  ]

  const verificationMethods = [
    { value: "manual", label: "Manual Review" },
    { value: "automatic", label: "Automatic" },
    { value: "api_check", label: "API Check" },
    { value: "screenshot", label: "Screenshot Required" },
  ]

  useEffect(() => {
    fetchData()
  }, [airdropId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch airdrop using dbHelpers
      const airdropData = await dbHelpers.airdrops.getById(airdropId)

      // Fetch tasks using dbHelpers (include inactive for admin)
      const tasksData = await dbHelpers.tasks.getByAirdropId(airdropId, false)

      setAirdrop(airdropData)
      setTasks(tasksData || [])
    } catch (err: any) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const taskData = {
        ...formData,
        airdrop_id: airdropId,
        sort_order: editingTask ? editingTask.sort_order : tasks.length,
        updated_at: new Date().toISOString(),
      }

      if (editingTask) {
        const { error } = await supabase.from("airdrop_tasks").update(taskData).eq("id", editingTask.id)
        if (error) throw error

        await dbHelpers.admin.logAction("task_updated", { task_id: editingTask.id, airdrop_id: airdropId })
      } else {
        const { error } = await supabase.from("airdrop_tasks").insert([taskData])
        if (error) throw error

        await dbHelpers.admin.logAction("task_created", { airdrop_id: airdropId, task_title: taskData.title })
      }

      // Reset form and refresh data
      setFormData({
        title: "",
        description: "",
        task_type: "social_follow",
        required: true,
        points_reward: 10,
        verification_method: "manual",
        task_data: {},
        sort_order: 0,
        active: true,
      })
      setShowForm(false)
      setEditingTask(null)
      fetchData()
    } catch (err: any) {
      console.error("Error saving task:", err)
      alert("Error saving task: " + err.message)
    }
  }

  const handleEdit = (task: AirdropTask) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      task_type: task.task_type,
      required: task.required,
      points_reward: task.points_reward,
      verification_method: task.verification_method,
      task_data: task.task_data || {},
      sort_order: task.sort_order,
      active: task.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const { error } = await supabase.from("airdrop_tasks").delete().eq("id", taskId)

      if (error) throw error
      fetchData()
    } catch (err: any) {
      console.error("Error deleting task:", err)
      alert("Error deleting task: " + err.message)
    }
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingTask(null)
    setFormData({
      title: "",
      description: "",
      task_type: "social_follow",
      required: true,
      points_reward: 10,
      verification_method: "manual",
      task_data: {},
      sort_order: 0,
      active: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Airdrop
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600">{airdrop?.title}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTask ? "Edit Task" : "Create New Task"}</CardTitle>
            <CardDescription>
              {editingTask ? "Update task details" : "Add a new task for users to complete"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Follow our Twitter"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="task_type">Task Type</Label>
                  <Select
                    value={formData.task_type}
                    onValueChange={(value) => setFormData({ ...formData, task_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed instructions for completing this task"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="points_reward">Points Reward</Label>
                  <Input
                    id="points_reward"
                    type="number"
                    value={formData.points_reward}
                    onChange={(e) => setFormData({ ...formData, points_reward: Number.parseInt(e.target.value) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="verification_method">Verification Method</Label>
                  <Select
                    value={formData.verification_method}
                    onValueChange={(value) => setFormData({ ...formData, verification_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {verificationMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                  />
                  <Label htmlFor="required">Required Task</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Created</h3>
              <p className="text-gray-600 mb-4">Create your first task to get started</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {taskTypes.find((t) => t.value === task.task_type)?.icon || "📋"}
                      </span>
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={task.required ? "default" : "secondary"}>
                            {task.required ? "Required" : "Optional"}
                          </Badge>
                          <Badge variant="outline">{task.points_reward} points</Badge>
                          <Badge variant={task.active ? "default" : "secondary"}>
                            {task.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {verificationMethods.find((m) => m.value === task.verification_method)?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
