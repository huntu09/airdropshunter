"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"

interface RealTimeNotification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  action_url?: string
}

interface ActivityFeedItem {
  id: string
  user_id: string
  action: string
  details: string
  timestamp: Date
  type: "user_action" | "system_event" | "achievement"
  metadata?: any
}

interface RealTimeContextType {
  notifications: RealTimeNotification[]
  activityFeed: ActivityFeedItem[]
  unreadCount: number
  isConnected: boolean
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<RealTimeNotification, "id" | "timestamp">) => void
  clearNotifications: () => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([])
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Add new notification
  const addNotification = useCallback(
    (notification: Omit<RealTimeNotification, "id" | "timestamp">) => {
      const newNotification: RealTimeNotification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)) // Keep only last 50

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === "error" ? "destructive" : "default",
      })

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: newNotification.id,
        })
      }
    },
    [toast],
  )

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Initialize real-time subscriptions
  useEffect(() => {
    let mounted = true

    const initializeRealTime = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user || !mounted) return

        setIsConnected(true)

        // Subscribe to user-specific notifications
        const notificationChannel = supabase
          .channel("user-notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!mounted) return
              const notification = payload.new as any
              addNotification({
                title: notification.title,
                message: notification.message,
                type: notification.type || "info",
                read: false,
                action_url: notification.action_url,
              })
            },
          )
          .subscribe()

        // Subscribe to activity feed
        const activityChannel = supabase
          .channel("activity-feed")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "activity_feed",
            },
            (payload) => {
              if (!mounted) return
              const activity = payload.new as any
              setActivityFeed((prev) => [activity, ...prev].slice(0, 100)) // Keep last 100
            },
          )
          .subscribe()

        // Subscribe to airdrop verification updates
        const verificationChannel = supabase
          .channel("verification-updates")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "airdrop_verifications",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!mounted) return
              const verification = payload.new as any
              if (verification.status === "approved") {
                addNotification({
                  title: "Task Approved! 🎉",
                  message: "Your task submission has been approved. Points have been added to your account.",
                  type: "success",
                  action_url: "/profile",
                })
              } else if (verification.status === "rejected") {
                addNotification({
                  title: "Task Rejected",
                  message: "Your task submission was rejected. Please check the requirements and try again.",
                  type: "warning",
                  action_url: `/airdrops/${verification.airdrop_id}`,
                })
              }
            },
          )
          .subscribe()

        // Subscribe to user rewards updates
        const rewardsChannel = supabase
          .channel("rewards-updates")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_rewards",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!mounted) return
              const oldRecord = payload.old as any
              const newRecord = payload.new as any

              if (newRecord.total_points > oldRecord.total_points) {
                const pointsEarned = newRecord.total_points - oldRecord.total_points
                addNotification({
                  title: "Points Earned! 🏆",
                  message: `You earned ${pointsEarned} points! Total: ${newRecord.total_points}`,
                  type: "success",
                  action_url: "/profile",
                })
              }
            },
          )
          .subscribe()

        // Cleanup function
        return () => {
          notificationChannel.unsubscribe()
          activityChannel.unsubscribe()
          verificationChannel.unsubscribe()
          rewardsChannel.unsubscribe()
        }
      } catch (error) {
        console.error("Real-time initialization error:", error)
        setIsConnected(false)
      }
    }

    const cleanup = initializeRealTime()

    return () => {
      mounted = false
      cleanup?.then((cleanupFn) => cleanupFn?.())
    }
  }, [supabase, addNotification])

  // Load initial notifications
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Load recent notifications
        const { data: notificationsData } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        if (notificationsData) {
          const formattedNotifications = notificationsData.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || "info",
            timestamp: new Date(n.created_at),
            read: n.read || false,
            action_url: n.action_url,
          }))
          setNotifications(formattedNotifications)
        }

        // Load recent activity
        const { data: activityData } = await supabase
          .from("activity_feed")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)

        if (activityData) {
          setActivityFeed(
            activityData.map((a) => ({
              ...a,
              timestamp: new Date(a.created_at),
            })),
          )
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }

    loadInitialData()
  }, [supabase])

  const value: RealTimeContextType = {
    notifications,
    activityFeed,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
  }

  return <RealTimeContext.Provider value={value}>{children}</RealTimeContext.Provider>
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error("useRealTime must be used within a RealTimeProvider")
  }
  return context
}
