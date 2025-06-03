"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase, withRetry, dbHelpers } from "@/lib/supabase"
import type { Airdrop } from "@/lib/supabase"

interface AirdropFormData {
  title: string
  description: string
  short_description: string
  category: string
  value: string
  status: "pending" | "active" | "completed" | "cancelled"
  start_date: string
  end_date: string
  logo_url: string
  banner_url: string
  website_url: string
  twitter_url: string
  discord_url: string
  telegram_url: string
  requirements: string
  reward_amount: string
  reward_type: string
  blockchain: string
  difficulty_level: string
  estimated_time: string
  estimated_value: string
  max_participants: string
  priority: string
  featured: boolean
}

export default function EditAirdropPage() {
  const params = useParams()
  const router = useRouter()
  const airdropId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState<Airdrop | null>(null)
  const [formData, setFormData] = useState<AirdropFormData>({
    title: "",
    description: "",
    short_description: "",
    category: "",
    value: "",
    status: "pending",
    start_date: "",
    end_date: "",
    logo_url: "",
    banner_url: "",
    website_url: "",
    twitter_url: "",
    discord_url: "",
    telegram_url: "",
    requirements: "",
    reward_amount: "",
    reward_type: "token",
    blockchain: "ethereum",
    difficulty_level: "easy",
    estimated_time: "5-10 minutes",
    estimated_value: "",
    max_participants: "1000",
    priority: "0",
    featured: false,
  })

  const categories = ["DeFi", "NFT", "Gaming", "Layer 1", "Layer 2", "AI", "Social", "Other"]
  const rewardTypes = ["token", "nft", "other"]
  const blockchains = ["ethereum", "binance-smart-chain", "polygon", "avalanche", "solana"]
  const difficultyLevels = ["easy", "medium", "hard"]
  const priorities = ["0", "1", "2", "3", "4", "5"]

  useEffect(() => {
    fetchAirdropData()
  }, [airdropId])

  const fetchAirdropData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await dbHelpers.airdrops.getById(airdropId)
      setOriginalData(data)

      // Populate form with existing data
      setFormData({
        title: data.title || "",
        description: data.description || "",
        short_description: data.short_description || "",
        category: data.category || "",
        value: data.value || "",
        status: data.status || "pending",
        start_date: data.start_date ? new Date(data.start_date).toISOString().split("T")[0] : "",
        end_date: data.end_date ? new Date(data.end_date).toISOString().split("T")[0] : "",
        logo_url: data.logo_url || "",
        banner_url: data.banner_url || "",
        website_url: data.website_url || "",
        twitter_url: data.twitter_url || "",
        discord_url: data.discord_url || "",
        telegram_url: data.telegram_url || "",
        requirements: data.requirements || "",
        reward_amount: data.reward_amount || "",
        reward_type: data.reward_type || "token",
        blockchain: data.blockchain || "ethereum",
        difficulty_level: data.difficulty_level || "easy",
        estimated_time: data.estimated_time || "5-10 minutes",
        estimated_value: data.estimated_value?.toString() || "",
        max_participants: data.max_participants?.toString() || "1000",
        priority: data.priority?.toString() || "0",
        featured: data.featured || false,
      })
    } catch (err: any) {
      console.error("Error fetching airdrop:", err)
      setError(err.message || "Failed to load airdrop data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof AirdropFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Title is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return false
    }
    if (!formData.category) {
      setError("Category is required")
      return false
    }
    if (!formData.reward_amount.trim()) {
      setError("Reward amount is required")
      return false
    }
    if (!formData.end_date) {
      setError("End date is required")
      return false
    }
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError("End date must be after start date")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim() || null,
        category: formData.category,
        value: formData.value.trim() || null,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date,
        logo_url: formData.logo_url.trim() || null,
        banner_url: formData.banner_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        twitter_url: formData.twitter_url.trim() || null,
        discord_url: formData.discord_url.trim() || null,
        telegram_url: formData.telegram_url.trim() || null,
        requirements: formData.requirements.trim() || null,
        reward_amount: formData.reward_amount.trim(),
        reward_type: formData.reward_type,
        blockchain: formData.blockchain,
        difficulty_level: formData.difficulty_level,
        estimated_time: formData.estimated_time,
        estimated_value: formData.estimated_value ? Number.parseFloat(formData.estimated_value) : null,
        max_participants: Number.parseInt(formData.max_participants) || 1000,
        priority: Number.parseInt(formData.priority) || 0,
        featured: formData.featured,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await withRetry(async () => {
        return await supabase.from("airdrops").update(updateData).eq("id", airdropId)
      })

      if (updateError) throw updateError

      // Log admin action
      await dbHelpers.admin.logAction("airdrop_updated", {
        airdrop_id: airdropId,
        changes: updateData,
      })

      setSuccess("Airdrop updated successfully!")

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/admin-dashboard/airdrops/${airdropId}`)
      }, 2000)
    } catch (error: any) {
      console.error("Error updating airdrop:", error)
      setError(error.message || "Failed to update airdrop")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading airdrop data...</p>
        </div>
      </div>
    )
  }

  if (error && !originalData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Airdrop</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin-dashboard/airdrops/${airdropId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Airdrop</h1>
          <p className="text-gray-500 dark:text-gray-400">Update airdrop information</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Airdrop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., ZK Token Airdrop"
                  disabled={saving}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reward Amount */}
              <div className="space-y-2">
                <Label htmlFor="reward_amount">Reward Amount *</Label>
                <Input
                  id="reward_amount"
                  value={formData.reward_amount}
                  onChange={(e) => handleInputChange("reward_amount", e.target.value)}
                  placeholder="e.g., $50, 100 TOKENS, 1 NFT"
                  disabled={saving}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Featured Toggle */}
              <div className="space-y-2">
                <Label htmlFor="featured">Featured</Label>
                <Select
                  value={formData.featured.toString()}
                  onValueChange={(value) => handleInputChange("featured", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the airdrop..."
                rows={4}
                disabled={saving}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href={`/admin-dashboard/airdrops/${airdropId}`}>
                <Button type="button" variant="outline" disabled={saving}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
