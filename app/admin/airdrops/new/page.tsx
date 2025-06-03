"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, X, AlertCircle, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import AdminLayout from "@/components/admin/admin-layout"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FileUpload from "@/components/admin/file-upload"

interface AirdropFormData {
  title: string
  description: string
  category: string
  status: string
  reward_amount: string
  reward_type: string
  blockchain: string
  estimated_value: number
  website_url: string
  twitter_url: string
  discord_url: string
  telegram_url: string
  requirements: string[]
  difficulty_level: string
  featured: boolean
  priority: number
  end_date: string
  logo_url: string
}

const categories = [
  { value: "defi", label: "DeFi" },
  { value: "nft", label: "NFT" },
  { value: "gaming", label: "Gaming" },
  { value: "layer2", label: "Layer 2" },
  { value: "metaverse", label: "Metaverse" },
  { value: "launchpad", label: "Launchpad" },
]

const blockchains = [
  { value: "ethereum", label: "Ethereum" },
  { value: "polygon", label: "Polygon" },
  { value: "bsc", label: "BSC" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
  { value: "solana", label: "Solana" },
]

const rewardTypes = [
  { value: "token", label: "Token" },
  { value: "nft", label: "NFT" },
  { value: "points", label: "Points" },
  { value: "whitelist", label: "Whitelist" },
]

const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export default function NewAirdropPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState("")

  const [formData, setFormData] = useState<AirdropFormData>({
    title: "",
    description: "",
    category: "defi",
    status: "pending",
    reward_amount: "",
    reward_type: "token",
    blockchain: "ethereum",
    estimated_value: 0,
    website_url: "",
    twitter_url: "",
    discord_url: "",
    telegram_url: "",
    requirements: [],
    difficulty_level: "easy",
    featured: false,
    priority: 0,
    end_date: "",
    logo_url: "",
  })

  const handleInputChange = (field: keyof AirdropFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      const updated = [...requirements, newRequirement.trim()]
      setRequirements(updated)
      setFormData((prev) => ({ ...prev, requirements: updated }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    const updated = requirements.filter((_, i) => i !== index)
    setRequirements(updated)
    setFormData((prev) => ({ ...prev, requirements: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.title.trim()) throw new Error("Title is required")
      if (!formData.description.trim()) throw new Error("Description is required")
      if (!formData.end_date) throw new Error("End date is required")
      if (!formData.reward_amount.trim()) throw new Error("Reward amount is required")

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Insert airdrop
      const { data, error } = await supabase
        .from("airdrops")
        .insert([
          {
            ...formData,
            created_by: user.id,
            requirements: formData.requirements,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Log admin action
      await supabase.rpc("log_admin_action", {
        action_type: "airdrop_created",
        target_type_param: "airdrop",
        target_id_param: data.id,
        new_data_param: formData,
      })

      router.push(`/admin/airdrops/${data.id}`)
    } catch (error: any) {
      console.error("Error creating airdrop:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild className="border-gray-700 hover:bg-gray-800">
            <Link href="/admin/airdrops">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Airdrops
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Airdrop</h1>
            <p className="text-gray-400">Create a new airdrop opportunity</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-[#0f1623]/80 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="e.g., ZK Token Airdrop"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-300">
                    Category *
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-md text-white"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white"
                  placeholder="Describe the airdrop opportunity..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300 mb-3 block">Logo Upload</Label>
                <FileUpload
                  onUpload={(url) => handleInputChange("logo_url", url)}
                  currentFile={formData.logo_url}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>
            </CardContent>
          </Card>

          {/* Reward Information */}
          <Card className="bg-[#0f1623]/80 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">Reward Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reward_amount" className="text-gray-300">
                    Reward Amount *
                  </Label>
                  <Input
                    id="reward_amount"
                    value={formData.reward_amount}
                    onChange={(e) => handleInputChange("reward_amount", e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="e.g., 100 TOKENS"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reward_type" className="text-gray-300">
                    Reward Type *
                  </Label>
                  <select
                    id="reward_type"
                    value={formData.reward_type}
                    onChange={(e) => handleInputChange("reward_type", e.target.value)}
                    className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-md text-white"
                    required
                  >
                    {rewardTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="estimated_value" className="text-gray-300">
                    Estimated Value (USD)
                  </Label>
                  <Input
                    id="estimated_value"
                    type="number"
                    step="0.01"
                    value={formData.estimated_value}
                    onChange={(e) => handleInputChange("estimated_value", Number.parseFloat(e.target.value) || 0)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blockchain" className="text-gray-300">
                    Blockchain *
                  </Label>
                  <select
                    id="blockchain"
                    value={formData.blockchain}
                    onChange={(e) => handleInputChange("blockchain", e.target.value)}
                    className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-md text-white"
                    required
                  >
                    {blockchains.map((chain) => (
                      <option key={chain.value} value={chain.value}>
                        {chain.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="difficulty_level" className="text-gray-300">
                    Difficulty Level
                  </Label>
                  <select
                    id="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={(e) => handleInputChange("difficulty_level", e.target.value)}
                    className="w-full p-2 bg-gray-800/50 border border-gray-700 rounded-md text-white"
                  >
                    {difficultyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="end_date" className="text-gray-300">
                  End Date *
                </Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-[#0f1623]/80 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website_url" className="text-gray-300">
                    Website URL
                  </Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange("website_url", e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_url" className="text-gray-300">
                    Twitter URL
                  </Label>
                  <Input
                    id="twitter_url"
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => handleInputChange("twitter_url", e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="discord_url" className="text-gray-300">
                    Discord URL
                  </Label>
                  <Input
                    id="discord_url"
                    type="url"
                    value={formData.discord_url}
                    onChange={(e) => handleInputChange("discord_url", e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="https://discord.gg/invite"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram_url" className="text-gray-300">
                    Telegram URL
                  </Label>
                  <Input
                    id="telegram_url"
                    type="url"
                    value={formData.telegram_url}
                    onChange={(e) => handleInputChange("telegram_url", e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white"
                    placeholder="https://t.me/channel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="bg-[#0f1623]/80 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white"
                  placeholder="Add a requirement..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="outline" className="border-gray-700">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {requirements.map((req, index) => (
                  <Badge key={index} variant="outline" className="text-gray-300 pr-1">
                    {req}
                    <button type="button" onClick={() => removeRequirement(index)} className="ml-2 hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-[#0f1623]/80 border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Featured Airdrop</Label>
                  <p className="text-gray-400 text-sm">Show this airdrop in featured section</p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange("featured", checked)}
                />
              </div>
              <div>
                <Label htmlFor="priority" className="text-gray-300">
                  Priority (0-10)
                </Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", Number.parseInt(e.target.value) || 0)}
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Airdrop
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
