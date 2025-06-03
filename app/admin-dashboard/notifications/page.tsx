"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Bell, Plus, Search, Send, Eye, Edit, Trash2, Users, CheckCircle, Clock, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  target_type: "all" | "users" | "admins" | "specific"
  target_users?: string[]
  status: "draft" | "sent" | "scheduled"
  scheduled_at?: string
  sent_at?: string
  created_at: string
  created_by: string
  read_count: number
  total_recipients: number
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info" as const,
    target_type: "all" as const,
    target_users: [] as string[],
    scheduled_at: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      // Simulasi data karena table mungkin belum ada
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Welcome to Airdrops Hunter!",
          message: "Thank you for joining our platform. Start exploring amazing airdrops today!",
          type: "info",
          target_type: "users",
          status: "sent",
          sent_at: "2024-01-30T10:00:00Z",
          created_at: "2024-01-30T09:00:00Z",
          created_by: "admin",
          read_count: 1250,
          total_recipients: 1500,
        },
        {
          id: "2",
          title: "New Airdrop Alert: DeFi Token",
          message: "A new high-value DeFi airdrop is now available. Don't miss out!",
          type: "success",
          target_type: "all",
          status: "sent",
          sent_at: "2024-01-29T15:30:00Z",
          created_at: "2024-01-29T14:00:00Z",
          created_by: "admin",
          read_count: 2100,
          total_recipients: 2500,
        },
        {
          id: "3",
          title: "Maintenance Notice",
          message: "Scheduled maintenance will occur on Feb 1st from 2-4 AM UTC.",
          type: "warning",
          target_type: "all",
          status: "scheduled",
          scheduled_at: "2024-02-01T01:00:00Z",
          created_at: "2024-01-28T12:00:00Z",
          created_by: "admin",
          read_count: 0,
          total_recipients: 2500,
        },
        {
          id: "4",
          title: "Security Update Required",
          message: "Please update your password for enhanced security.",
          type: "error",
          target_type: "users",
          status: "draft",
          created_at: "2024-01-27T16:00:00Z",
          created_by: "admin",
          read_count: 0,
          total_recipients: 0,
        },
      ]

      setNotifications(mockNotifications)
    } catch (error: any) {
      console.error("Error fetching notifications:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch notifications",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Title and message are required",
        })
        return
      }

      // Simulasi create notification
      const notification: Notification = {
        id: Date.now().toString(),
        ...newNotification,
        status: newNotification.scheduled_at ? "scheduled" : "draft",
        created_at: new Date().toISOString(),
        created_by: "admin",
        read_count: 0,
        total_recipients: newNotification.target_type === "all" ? 2500 : 1500,
      }

      setNotifications([notification, ...notifications])
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        target_type: "all",
        target_users: [],
        scheduled_at: "",
      })
      setShowCreateModal(false)

      toast({
        title: "Success",
        description: "Notification created successfully",
      })
    } catch (error: any) {
      console.error("Error creating notification:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create notification",
      })
    }
  }

  const handleSendNotification = async (id: string) => {
    try {
      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, status: "sent" as const, sent_at: new Date().toISOString() } : n,
        ),
      )

      toast({
        title: "Success",
        description: "Notification sent successfully",
      })
    } catch (error: any) {
      console.error("Error sending notification:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      })
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      setNotifications(notifications.filter((n) => n.id !== id))
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting notification:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification",
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter
    const matchesType = typeFilter === "all" || notification.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === "sent").length,
    scheduled: notifications.filter((n) => n.status === "scheduled").length,
    draft: notifications.filter((n) => n.status === "draft").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage system notifications and announcements</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Enter notification message"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target">Target Audience</Label>
                  <Select
                    value={newNotification.target_type}
                    onValueChange={(value: any) => setNewNotification({ ...newNotification, target_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="users">Regular Users</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="scheduled">Schedule (Optional)</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={newNotification.scheduled_at}
                  onChange={(e) => setNewNotification({ ...newNotification, scheduled_at: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNotification}>Create Notification</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notification</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">{notification.message}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(notification.type)}>{notification.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {notification.target_type === "all" && <Users className="h-4 w-4" />}
                        {notification.target_type === "users" && <Users className="h-4 w-4" />}
                        {notification.target_type === "admins" && <Users className="h-4 w-4" />}
                        <span className="capitalize">{notification.target_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.status === "sent" && (
                        <div className="text-sm">
                          <div>
                            {notification.read_count}/{notification.total_recipients}
                          </div>
                          <div className="text-gray-500">
                            {Math.round((notification.read_count / notification.total_recipients) * 100)}% read
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {notification.sent_at && <div>Sent: {new Date(notification.sent_at).toLocaleDateString()}</div>}
                        {notification.scheduled_at && notification.status === "scheduled" && (
                          <div>Scheduled: {new Date(notification.scheduled_at).toLocaleDateString()}</div>
                        )}
                        {notification.status === "draft" && (
                          <div>Created: {new Date(notification.created_at).toLocaleDateString()}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {notification.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleSendNotification(notification.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600 mb-4">Create your first notification to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
