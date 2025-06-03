"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
  user_id: string | null
}

// Mock notifications for fallback
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Welcome to Admin Dashboard",
    message: "Your admin dashboard is now ready to use!",
    type: "success" as const,
    read: false,
    created_at: new Date().toISOString(),
    user_id: null,
  },
  {
    id: "2",
    title: "New User Registration",
    message: "A new user has registered: test@example.com",
    type: "info" as const,
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_id: null,
  },
  {
    id: "3",
    title: "Verification Pending",
    message: "There are 3 pending verifications waiting for review",
    type: "warning" as const,
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user_id: null,
  },
]

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [useLocalMode, setUseLocalMode] = useState(false)

  useEffect(() => {
    fetchNotifications()

    // Set up real-time subscription only if not in local mode
    if (!useLocalMode) {
      try {
        const channel = supabase
          .channel("admin-notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: "user_id=is.null",
            },
            (payload) => {
              // Add new notification to state
              const newNotification = payload.new as Notification
              setNotifications((prev) => [newNotification, ...prev])
              setUnreadCount((count) => count + 1)

              // Show toast for new notification
              toast({
                title: newNotification.title,
                description: newNotification.message,
                variant: newNotification.type === "error" ? "destructive" : "default",
              })
            },
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        console.error("Error setting up realtime:", err)
        setUseLocalMode(true)
      }
    }
  }, [useLocalMode])

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .is("user_id", null)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error fetching notifications:", error)
        throw error
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
      setUseLocalMode(false)
    } catch (err: any) {
      console.error("Error fetching notifications:", err)

      // Fallback to mock data
      console.log("Using mock notifications as fallback")
      setNotifications(MOCK_NOTIFICATIONS)
      setUnreadCount(MOCK_NOTIFICATIONS.filter((n) => !n.read).length)
      setUseLocalMode(true)

      // Show toast about fallback mode
      toast({
        title: "Using local notifications",
        description: "Could not connect to notification service. Using local mode.",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    if (useLocalMode) {
      // Update local state only
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((count) => Math.max(0, count - 1))
      return
    }

    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id).is("user_id", null)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((count) => Math.max(0, count - 1))
    } catch (err: any) {
      console.error("Error marking notification as read:", err)

      // Fallback to local mode
      setUseLocalMode(true)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((count) => Math.max(0, count - 1))
    }
  }

  const markAllAsRead = async () => {
    if (useLocalMode) {
      // Update local state only
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      return
    }

    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds)
        .is("user_id", null)

      if (error) throw error

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)

      toast({
        title: "Notifications cleared",
        description: "All notifications marked as read",
      })
    } catch (err: any) {
      console.error("Error marking all as read:", err)

      // Fallback to local mode
      setUseLocalMode(true)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50">
          <Card className="overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 flex items-center justify-between">
              <h3 className="font-medium">
                Notifications
                {useLocalMode && <span className="text-xs text-amber-500 ml-2">(Local Mode)</span>}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                    Mark all as read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-5 w-5 border-b-2 border-gray-500 rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b last:border-b-0 flex items-start gap-3 ${
                        notification.read ? "bg-white dark:bg-gray-900" : "bg-blue-50 dark:bg-gray-800"
                      }`}
                    >
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{notification.message}</p>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs h-6 mt-1 px-2"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
