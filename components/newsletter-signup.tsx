"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("newsletter_subscribers").insert([{ email: email.trim() }])

      if (insertError) {
        if (insertError.code === "23505") {
          setError("Email already subscribed")
        } else {
          throw insertError
        }
        return
      }

      setSuccess(true)
      setEmail("")
    } catch (error: any) {
      console.error("Error subscribing to newsletter:", error)
      setError("Failed to subscribe. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-[#0f1623]/80 border-gray-800/50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Successfully Subscribed!</h3>
          <p className="text-gray-400">Thank you for subscribing to our newsletter.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0f1623]/80 border-gray-800/50">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-gray-400">Get notified about new airdrops and opportunities</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
          >
            {loading ? "Subscribing..." : "Subscribe to Newsletter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
