"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { EnvironmentStatus } from "@/components/admin/environment-status"

interface AdminSettings {
  site_name: string
  site_description: string
  maintenance_mode: boolean
  enable_signups: boolean
  enable_airdrops: boolean
  admin_email: string
  support_email: string
  max_airdrops_per_user: number
  default_points_per_task: number
  welcome_message: string
  terms_and_conditions: string
  privacy_policy: string
  social_links: {
    twitter?: string
    discord?: string
    telegram?: string
    website?: string
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({
    site_name: "Airdrops Hunter",
    site_description: "Discover and participate in the best crypto airdrops",
    maintenance_mode: false,
    enable_signups: true,
    enable_airdrops: true,
    admin_email: "",
    support_email: "",
    max_airdrops_per_user: 10,
    default_points_per_task: 10,
    welcome_message: "Welcome to Airdrops Hunter!",
    terms_and_conditions: "",
    privacy_policy: "",
    social_links: {
      twitter: "",
      discord: "",
      telegram: "",
      website: "",
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("admin_settings").select("*").single()

      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, we'll create default ones later
          console.log("No settings found, using defaults")
        } else {
          throw error
        }
      }

      if (data) {
        // Parse JSON fields if needed
        const socialLinks =
          typeof data.social_links === "string" ? JSON.parse(data.social_links) : data.social_links || {}

        setSettings({
          ...settings,
          ...data,
          social_links: socialLinks,
        })
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err)
      setError(err.message || "Failed to load settings")
      toast({
        variant: "destructive",
        title: "Error loading settings",
        description: err.message || "Failed to load settings",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof AdminSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
    setSuccess(null)
  }

  const handleSocialLinkChange = (field: keyof typeof settings.social_links, value: string) => {
    setSettings((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [field]: value,
      },
    }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare data for saving
      const settingsData = {
        ...settings,
        social_links: settings.social_links,
        updated_at: new Date().toISOString(),
      }

      // Check if settings exist
      const { count, error: countError } = await supabase
        .from("admin_settings")
        .select("*", { count: "exact", head: true })

      if (countError) throw countError

      let saveError
      if (count && count > 0) {
        // Update existing settings
        const { error } = await supabase.from("admin_settings").update(settingsData).eq("id", 1)
        saveError = error
      } else {
        // Insert new settings
        const { error } = await supabase.from("admin_settings").insert([{ ...settingsData, id: 1 }])
        saveError = error
      }

      if (saveError) throw saveError

      setSuccess("Settings saved successfully!")
      toast({
        variant: "success",
        title: "Settings saved",
        description: "Your changes have been applied successfully",
      })
    } catch (err: any) {
      console.error("Error saving settings:", err)
      setError(err.message || "Failed to save settings")
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: err.message || "Failed to save settings",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Configure your application settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic configuration for your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={settings.site_name}
                      onChange={(e) => handleInputChange("site_name", e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_email">Admin Email</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={settings.admin_email}
                      onChange={(e) => handleInputChange("admin_email", e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleInputChange("site_description", e.target.value)}
                    disabled={saving}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => handleInputChange("support_email", e.target.value)}
                    disabled={saving}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Settings</CardTitle>
                <CardDescription>Enable or disable application features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">When enabled, only admins can access the site</p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange("maintenance_mode", checked)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Signups</h4>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.enable_signups}
                    onCheckedChange={(checked) => handleInputChange("enable_signups", checked)}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Airdrops</h4>
                    <p className="text-sm text-gray-500">Allow users to participate in airdrops</p>
                  </div>
                  <Switch
                    checked={settings.enable_airdrops}
                    onCheckedChange={(checked) => handleInputChange("enable_airdrops", checked)}
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max_airdrops_per_user">Max Airdrops Per User</Label>
                    <Input
                      id="max_airdrops_per_user"
                      type="number"
                      value={settings.max_airdrops_per_user}
                      onChange={(e) => handleInputChange("max_airdrops_per_user", Number.parseInt(e.target.value) || 0)}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_points_per_task">Default Points Per Task</Label>
                    <Input
                      id="default_points_per_task"
                      type="number"
                      value={settings.default_points_per_task}
                      onChange={(e) =>
                        handleInputChange("default_points_per_task", Number.parseInt(e.target.value) || 0)
                      }
                      disabled={saving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>Manage site content and legal documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome_message">Welcome Message</Label>
                  <Textarea
                    id="welcome_message"
                    value={settings.welcome_message}
                    onChange={(e) => handleInputChange("welcome_message", e.target.value)}
                    disabled={saving}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
                  <Textarea
                    id="terms_and_conditions"
                    value={settings.terms_and_conditions}
                    onChange={(e) => handleInputChange("terms_and_conditions", e.target.value)}
                    disabled={saving}
                    rows={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy_policy">Privacy Policy</Label>
                  <Textarea
                    id="privacy_policy"
                    value={settings.privacy_policy}
                    onChange={(e) => handleInputChange("privacy_policy", e.target.value)}
                    disabled={saving}
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Configure your social media links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={settings.social_links.twitter || ""}
                      onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                      placeholder="https://twitter.com/youraccount"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discord">Discord URL</Label>
                    <Input
                      id="discord"
                      type="url"
                      value={settings.social_links.discord || ""}
                      onChange={(e) => handleSocialLinkChange("discord", e.target.value)}
                      placeholder="https://discord.gg/yourinvite"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram URL</Label>
                    <Input
                      id="telegram"
                      type="url"
                      value={settings.social_links.telegram || ""}
                      onChange={(e) => handleSocialLinkChange("telegram", e.target.value)}
                      placeholder="https://t.me/yourchannel"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={settings.social_links.website || ""}
                      onChange={(e) => handleSocialLinkChange("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                      disabled={saving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment" className="space-y-4">
            <EnvironmentStatus />
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
