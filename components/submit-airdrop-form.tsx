"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface FormData {
  title: string
  description: string
  short_description: string
  category: string
  blockchain: string
  difficulty_level: string
  estimated_time: string
  reward_amount: string
  reward_type: string
  max_participants: string
  start_date: string
  end_date: string
  website_url: string
  twitter_url: string
  discord_url: string
  telegram_url: string
  logo_url: string
  banner_url: string
  requirements: string[]
  featured: boolean
  priority: number
}

export default function SubmitAirdropForm() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    short_description: "",
    category: "",
    blockchain: "ethereum",
    difficulty_level: "medium",
    estimated_time: "30 minutes",
    reward_amount: "",
    reward_type: "tokens",
    max_participants: "",
    start_date: "",
    end_date: "",
    website_url: "",
    twitter_url: "",
    discord_url: "",
    telegram_url: "",
    logo_url: "",
    banner_url: "",
    requirements: [""],
    featured: false,
    priority: 1,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsSubmitted(true)
      toast.success("Airdrop submitted successfully! We'll review it within 24 hours.")
    } catch (error) {
      toast.error("Failed to submit airdrop. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-[#1a2236]/50 border-gray-800/50 text-center">
        <CardContent className="p-12">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Submission Successful!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for submitting your airdrop. Our team will review it within 24 hours and notify you of the status.
          </p>
          <Button
            onClick={() => {
              setIsSubmitted(false)
              setFormData({
                title: "",
                description: "",
                short_description: "",
                category: "",
                blockchain: "ethereum",
                difficulty_level: "medium",
                estimated_time: "30 minutes",
                reward_amount: "",
                reward_type: "tokens",
                max_participants: "",
                start_date: "",
                end_date: "",
                website_url: "",
                twitter_url: "",
                discord_url: "",
                telegram_url: "",
                logo_url: "",
                banner_url: "",
                requirements: [""],
                featured: false,
                priority: 1,
              })
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit Another Airdrop
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card className="bg-[#1a2236]/50 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
          <CardDescription className="text-gray-400">Provide basic details about your airdrop project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Project Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., ZkSync Era Airdrop"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="bg-[#0a0e17]/50 border-gray-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="launchpad">Launchpad</SelectItem>
                  <SelectItem value="layer2">Layer 2</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description" className="text-white">
              Short Description *
            </Label>
            <Input
              id="short_description"
              value={formData.short_description}
              onChange={(e) => handleInputChange("short_description", e.target.value)}
              placeholder="Brief one-line description (max 100 characters)"
              maxLength={100}
              className="bg-[#0a0e17]/50 border-gray-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Full Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Detailed description of your airdrop project..."
              rows={4}
              className="bg-[#0a0e17]/50 border-gray-700 text-white"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="bg-[#1a2236]/50 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Technical Details</CardTitle>
          <CardDescription className="text-gray-400">Specify blockchain and technical requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="blockchain" className="text-white">
                Blockchain *
              </Label>
              <Select value={formData.blockchain} onValueChange={(value) => handleInputChange("blockchain", value)}>
                <SelectTrigger className="bg-[#0a0e17]/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                  <SelectItem value="bsc">BSC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty_level" className="text-white">
                Difficulty Level *
              </Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => handleInputChange("difficulty_level", value)}
              >
                <SelectTrigger className="bg-[#0a0e17]/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_time" className="text-white">
                Estimated Time *
              </Label>
              <Select
                value={formData.estimated_time}
                onValueChange={(value) => handleInputChange("estimated_time", value)}
              >
                <SelectTrigger className="bg-[#0a0e17]/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 minutes">15 minutes</SelectItem>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2+ hours">2+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Information */}
      <Card className="bg-[#1a2236]/50 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Reward Information</CardTitle>
          <CardDescription className="text-gray-400">Details about the airdrop rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reward_amount" className="text-white">
                Reward Amount *
              </Label>
              <Input
                id="reward_amount"
                value={formData.reward_amount}
                onChange={(e) => handleInputChange("reward_amount", e.target.value)}
                placeholder="e.g., 100 TOKENS"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward_type" className="text-white">
                Reward Type *
              </Label>
              <Select value={formData.reward_type} onValueChange={(value) => handleInputChange("reward_type", value)}>
                <SelectTrigger className="bg-[#0a0e17]/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tokens">Tokens</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="whitelist">Whitelist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants" className="text-white">
                Max Participants
              </Label>
              <Input
                id="max_participants"
                value={formData.max_participants}
                onChange={(e) => handleInputChange("max_participants", e.target.value)}
                placeholder="e.g., 10000"
                type="number"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-white">
                Start Date *
              </Label>
              <Input
                id="start_date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                type="datetime-local"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-white">
                End Date *
              </Label>
              <Input
                id="end_date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                type="datetime-local"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="bg-[#1a2236]/50 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Requirements</CardTitle>
          <CardDescription className="text-gray-400">List the tasks users need to complete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={requirement}
                onChange={(e) => updateRequirement(index, e.target.value)}
                placeholder={`Requirement ${index + 1}`}
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
              />
              {formData.requirements.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeRequirement(index)}
                  className="border-gray-700 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addRequirement}
            className="border-gray-700 text-gray-400 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </CardContent>
      </Card>

      {/* Links */}
      <Card className="bg-[#1a2236]/50 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Links & Media</CardTitle>
          <CardDescription className="text-gray-400">Provide project links and media assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="website_url" className="text-white">
                Website URL *
              </Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => handleInputChange("website_url", e.target.value)}
                placeholder="https://yourproject.com"
                type="url"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_url" className="text-white">
                Twitter URL
              </Label>
              <Input
                id="twitter_url"
                value={formData.twitter_url}
                onChange={(e) => handleInputChange("twitter_url", e.target.value)}
                placeholder="https://twitter.com/yourproject"
                type="url"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord_url" className="text-white">
                Discord URL
              </Label>
              <Input
                id="discord_url"
                value={formData.discord_url}
                onChange={(e) => handleInputChange("discord_url", e.target.value)}
                placeholder="https://discord.gg/yourproject"
                type="url"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram_url" className="text-white">
                Telegram URL
              </Label>
              <Input
                id="telegram_url"
                value={formData.telegram_url}
                onChange={(e) => handleInputChange("telegram_url", e.target.value)}
                placeholder="https://t.me/yourproject"
                type="url"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url" className="text-white">
                Logo URL *
              </Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                placeholder="https://yourproject.com/logo.png"
                type="url"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner_url" className="text-white">
                Banner URL
              </Label>
              <Input
                id="banner_url"
                value={formData.banner_url}
                onChange={(e) => handleInputChange("banner_url", e.target.value)}
                placeholder="https://yourproject.com/banner.png"
                type="url"
                className="bg-[#0a0e17]/50 border-gray-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          {isSubmitting ? "Submitting..." : "Submit Airdrop"}
        </Button>
      </div>
    </form>
  )
}
