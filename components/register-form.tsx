"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        router.push("/register/success")
      }
    } catch (error: any) {
      setError(error.message || "Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username" className="text-white font-medium">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleInputChange}
            className="pl-10 bg-[#0a0e17]/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
            placeholder="Choose a username"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10 bg-[#0a0e17]/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10 bg-[#0a0e17]/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
            placeholder="Create a password"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-400">Password must be at least 6 characters</p>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-6 text-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all duration-300"
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        By signing up, you agree to our{" "}
        <a href="/terms" className="text-blue-400 hover:text-blue-300">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-blue-400 hover:text-blue-300">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}
