"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Lock, Trash2, Download } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  airdropUpdates: boolean
  taskReminders: boolean
  weeklyDigest: boolean
  securityAlerts: boolean
}

interface PrivacySettings {
  profileVisibility: "public" | "private"
  showStats: boolean
  showActivity: boolean
  showAchievements: boolean
}

export default function ProfileSettings() {
  const { user, profile, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    airdropUpdates: true,
    taskReminders: true,
    weeklyDigest: false,
    securityAlerts: true,
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    showStats: true,
    showActivity: true,
    showAchievements: true,
  })

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // In a real app, you'd save these to a user_settings table
      const { error } = await supabase
        .from("profiles")
        .update({
          settings: {
            notifications,
            privacy,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Settings saved successfully!")
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    if (!user) return

    try {
      // Fetch all user data
      const { data: userData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      const { data: activityData } = await supabase.from("user_task_progress").select("*").eq("user_id", user.id)

      const exportData = {
        profile: userData,
        activity: activityData,
        exportDate: new Date().toISOString(),
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `airdropshunter-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Data exported successfully!")
    } catch (error: any) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    }
  }

  const deleteAccount = async () => {
    if (!user) return

    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")

    if (!confirmed) return

    try {
      // In a real app, you'd have a proper account deletion flow
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success("Account deletion initiated. You have been logged out.")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account")
    }
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="bg-gray-900/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Email Notifications</Label>
              <p className="text-sm text-gray-400">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(value) => handleNotificationChange("emailNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Push Notifications</Label>
              <p className="text-sm text-gray-400">Receive browser push notifications</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(value) => handleNotificationChange("pushNotifications", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Airdrop Updates</Label>
              <p className="text-sm text-gray-400">Get notified about new airdrops</p>
            </div>
            <Switch
              checked={notifications.airdropUpdates}
              onCheckedChange={(value) => handleNotificationChange("airdropUpdates", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Task Reminders</Label>
              <p className="text-sm text-gray-400">Reminders for incomplete tasks</p>
            </div>
            <Switch
              checked={notifications.taskReminders}
              onCheckedChange={(value) => handleNotificationChange("taskReminders", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Weekly Digest</Label>
              <p className="text-sm text-gray-400">Weekly summary of your activity</p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={(value) => handleNotificationChange("weeklyDigest", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Security Alerts</Label>
              <p className="text-sm text-gray-400">Important security notifications</p>
            </div>
            <Switch
              checked={notifications.securityAlerts}
              onCheckedChange={(value) => handleNotificationChange("securityAlerts", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-gray-900/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Profile Visibility</Label>
              <p className="text-sm text-gray-400">Who can see your profile</p>
            </div>
            <Badge variant={privacy.profileVisibility === "public" ? "default" : "secondary"}>
              {privacy.profileVisibility === "public" ? "Public" : "Private"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Show Statistics</Label>
              <p className="text-sm text-gray-400">Display your points and achievements</p>
            </div>
            <Switch checked={privacy.showStats} onCheckedChange={(value) => handlePrivacyChange("showStats", value)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Show Activity</Label>
              <p className="text-sm text-gray-400">Display your recent activity</p>
            </div>
            <Switch
              checked={privacy.showActivity}
              onCheckedChange={(value) => handlePrivacyChange("showActivity", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Show Achievements</Label>
              <p className="text-sm text-gray-400">Display your unlocked achievements</p>
            </div>
            <Switch
              checked={privacy.showAchievements}
              onCheckedChange={(value) => handlePrivacyChange("showAchievements", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Security */}
      <Card className="bg-gray-900/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Data & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Export Data</Label>
              <p className="text-sm text-gray-400">Download all your data</p>
            </div>
            <Button variant="outline" onClick={exportData} className="border-gray-600">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-red-400">Delete Account</Label>
              <p className="text-sm text-gray-400">Permanently delete your account</p>
            </div>
            <Button variant="destructive" onClick={deleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
