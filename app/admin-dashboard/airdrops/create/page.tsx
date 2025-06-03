"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, AlertCircle, Plus, X } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import FileUpload from "@/components/admin/file-upload"
import { useAuth } from "@/components/auth-provider"

interface AirdropFormData {
  title: string
  description: string
  short_description: string
  category: string
  status: "pending" | "active" | "completed" | "cancelled"
  reward_amount: string
  reward_type: "token" | "nft" | "other"
  blockchain: string
  difficulty_level: "easy" | "medium" | "hard"
  estimated_time: string
  start_date: string
  end_date: string
  logo_url: string
  banner_url: string
  website_url: string
  twitter_url: string
  discord_url: string
  telegram_url: string
  requirements: string[]
  max_participants: number
  featured: boolean
  priority: number
  featured_reason: string
}

export default function CreateAirdropPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState<AirdropFormData>({
    title: "",
    description: "",
    short_description: "",
    category: "",
    status: "pending",
    reward_amount: "",
    reward_type: "token",
    blockchain: "ethereum",
    difficulty_level: "easy",
    estimated_time: "5-10 minutes",
    start_date: "",
    end_date: "",
    logo_url: "",
    banner_url: "",
    website_url: "",
    twitter_url: "",
    discord_url: "",
    telegram_url: "",
    requirements: [],
    max_participants: 1000,
    featured: false,
    priority: 0,
    featured_reason: "",
  })

  const blockchains = [
    "ethereum",
    "binance-smart-chain",
    "polygon",
    "avalanche",
    "solana",
    "arbitrum",
    "optimism",
    "fantom",
  ]

  const { user, profile, isInitialized } = useAuth()

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from("categories").select("name, slug").eq("active", true)
        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Fallback categories
        setCategories([
          { name: "DeFi", slug: "defi" },
          { name: "NFT", slug: "nft" },
          { name: "Gaming", slug: "gaming" },
          { name: "Layer 1", slug: "layer1" },
          { name: "Layer 2", slug: "layer2" },
          { name: "AI", slug: "ai" },
          { name: "Social", slug: "social" },
          { name: "Other", slug: "other" },
        ])
      }
    }
    fetchCategories()
  }, [])

  const handleInputChange = (field: keyof AirdropFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError(null)
  }

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => (i === index ? value : req)),
    }))
  }

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.title.trim()) errors.push("Title is required")
    if (formData.title.length > 200) errors.push("Title must be less than 200 characters")

    if (!formData.description.trim()) errors.push("Description is required")
    if (formData.description.length < 50) errors.push("Description must be at least 50 characters")

    if (!formData.category) errors.push("Category is required")
    if (!formData.reward_amount.trim()) errors.push("Reward amount is required")
    if (!formData.end_date) errors.push("End date is required")

    // Date validation
    const startDate = formData.start_date ? new Date(formData.start_date) : new Date()
    const endDate = new Date(formData.end_date)
    const now = new Date()

    if (endDate <= now) errors.push("End date must be in the future")
    if (startDate >= endDate) errors.push("End date must be after start date")

    // URL validation
    const urlFields = ["website_url", "twitter_url", "discord_url", "telegram_url"]
    urlFields.forEach((field) => {
      const value = formData[field as keyof AirdropFormData] as string
      if (value && !isValidUrl(value)) {
        errors.push(`${field.replace("_", " ")} must be a valid URL`)
      }
    })

    if (formData.max_participants < 1) {
      errors.push("Max participants must be at least 1")
    }

    if (errors.length > 0) {
      setError(errors.join(". "))
      return false
    }

    return true
  }

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Check auth state from context instead of supabase.auth.getUser()
    if (!user || !profile) {
      setError("You must be logged in to create an airdrop")
      return
    }

    if (profile.role !== "admin") {
      setError("You don't have permission to create airdrops")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const airdropData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim() || null,
        category: formData.category,
        status: formData.status,
        reward_amount: formData.reward_amount.trim(),
        reward_type: formData.reward_type,
        blockchain: formData.blockchain,
        difficulty_level: formData.difficulty_level,
        estimated_time: formData.estimated_time,
        start_date: formData.start_date || new Date().toISOString(),
        end_date: formData.end_date,
        logo_url: formData.logo_url.trim() || null,
        banner_url: formData.banner_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        twitter_url: formData.twitter_url.trim() || null,
        discord_url: formData.discord_url.trim() || null,
        telegram_url: formData.telegram_url.trim() || null,
        requirements: formData.requirements.filter((req) => req.trim() !== ""),
        max_participants: formData.max_participants,
        featured: formData.featured,
        priority: formData.priority,
        featured_reason: formData.featured_reason.trim() || null,
        created_by: user.id,
        participants_count: 0,
        views_count: 0,
      }

      const { error: insertError } = await supabase.from("airdrops").insert([airdropData])
      if (insertError) throw insertError

      router.push("/admin-dashboard/airdrops")
    } catch (error: any) {
      console.error("Error creating airdrop:", error)
      setError(error.message || "Failed to create airdrop")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if not authenticated
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Required</h1>
          <p className="text-gray-600 mt-2">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  // Show error if not admin
  if (profile.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin-dashboard/airdrops">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Airdrops
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Airdrop</h1>
          <p className="text-gray-500 dark:text-gray-400">Create a new airdrop campaign</p>
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

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., ZK Token Airdrop"
                    disabled={loading}
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
                        <SelectItem key={category.slug} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Short Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange("short_description", e.target.value)}
                    placeholder="e.g., Get free ZK tokens by completing simple tasks"
                    disabled={loading}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the airdrop, its purpose, and how users can participate..."
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Reward Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reward Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Reward Amount */}
                <div className="space-y-2">
                  <Label htmlFor="reward_amount">Reward Amount *</Label>
                  <Input
                    id="reward_amount"
                    value={formData.reward_amount}
                    onChange={(e) => handleInputChange("reward_amount", e.target.value)}
                    placeholder="e.g., $50, 100 TOKENS, 1 NFT"
                    disabled={loading}
                  />
                </div>

                {/* Reward Type */}
                <div className="space-y-2">
                  <Label htmlFor="reward_type">Reward Type</Label>
                  <Select
                    value={formData.reward_type}
                    onValueChange={(value: any) => handleInputChange("reward_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="token">Token</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Blockchain */}
                <div className="space-y-2">
                  <Label htmlFor="blockchain">Blockchain</Label>
                  <Select value={formData.blockchain} onValueChange={(value) => handleInputChange("blockchain", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blockchains.map((blockchain) => (
                        <SelectItem key={blockchain} value={blockchain}>
                          {blockchain.charAt(0).toUpperCase() + blockchain.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Campaign Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campaign Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value: any) => handleInputChange("difficulty_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Time */}
                <div className="space-y-2">
                  <Label htmlFor="estimated_time">Estimated Time</Label>
                  <Input
                    id="estimated_time"
                    value={formData.estimated_time}
                    onChange={(e) => handleInputChange("estimated_time", e.target.value)}
                    placeholder="e.g., 5-10 minutes"
                    disabled={loading}
                  />
                </div>

                {/* Max Participants */}
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => handleInputChange("max_participants", Number.parseInt(e.target.value) || 1000)}
                    placeholder="1000"
                    disabled={loading}
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Featured and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Airdrop</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (0-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", Number.parseInt(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>

                {/* Featured Reason - New field */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="featured_reason">Featured Reason</Label>
                  <Select
                    value={formData.featured_reason}
                    onValueChange={(value) => handleInputChange("featured_reason", value)}
                    disabled={!formData.featured || loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Highest Reward">Highest Reward</SelectItem>
                      <SelectItem value="Trending">Trending</SelectItem>
                      <SelectItem value="Most Popular">Most Popular</SelectItem>
                      <SelectItem value="Editor's Choice">Editor's Choice</SelectItem>
                      <SelectItem value="Limited Time">Limited Time</SelectItem>
                      <SelectItem value="Exclusive">Exclusive</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* URLs & Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">URLs & Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo</Label>
                  <FileUpload
                    onUpload={(url) => handleInputChange("logo_url", url)}
                    currentFile={formData.logo_url}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                  />
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <Label htmlFor="banner_url">Banner</Label>
                  <FileUpload
                    onUpload={(url) => handleInputChange("banner_url", url)}
                    currentFile={formData.banner_url}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>

                {/* Website URL */}
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange("website_url", e.target.value)}
                    placeholder="https://example.com"
                    disabled={loading}
                  />
                </div>

                {/* Twitter URL */}
                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <Input
                    id="twitter_url"
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => handleInputChange("twitter_url", e.target.value)}
                    placeholder="https://twitter.com/example"
                    disabled={loading}
                  />
                </div>

                {/* Discord URL */}
                <div className="space-y-2">
                  <Label htmlFor="discord_url">Discord URL</Label>
                  <Input
                    id="discord_url"
                    type="url"
                    value={formData.discord_url}
                    onChange={(e) => handleInputChange("discord_url", e.target.value)}
                    placeholder="https://discord.gg/example"
                    disabled={loading}
                  />
                </div>

                {/* Telegram URL */}
                <div className="space-y-2">
                  <Label htmlFor="telegram_url">Telegram URL</Label>
                  <Input
                    id="telegram_url"
                    type="url"
                    value={formData.telegram_url}
                    onChange={(e) => handleInputChange("telegram_url", e.target.value)}
                    placeholder="https://t.me/example"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>

              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    disabled={loading}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeRequirement(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create Airdrop"}
              </Button>
              <Link href="/admin-dashboard/airdrops">
                <Button type="button" variant="outline" disabled={loading}>
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
