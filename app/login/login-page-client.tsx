"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, Settings, ArrowRight, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"
import LoginForm from "@/components/login-form"

interface LoginState {
  email: string
  password: string
  isLoading: boolean
  error: string | null
  success: boolean
  userRole: string | null
  userEmail: string | null
}

export default function LoginPageClient() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, setState] = useState<LoginState>({
    email: "",
    password: "",
    isLoading: false,
    error: null,
    success: false,
    userRole: null,
    userEmail: null,
  })

  // Check if user is already logged in
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("Existing session found, checking profile...")

        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, email")
          .eq("id", session.user.id)
          .single()

        if (profileData) {
          setState((prev) => ({
            ...prev,
            success: true,
            userRole: profileData.role,
            userEmail: profileData.email,
          }))
        }
      }
    } catch (error) {
      console.log("No existing session or error checking:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setState((prev) => ({
      ...prev,
      [name]: value,
      error: null,
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!state.email || !state.password) {
      setState((prev) => ({ ...prev, error: "Please fill in all fields" }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log("🔐 Attempting login...")

      // Step 1: Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: state.email.trim().toLowerCase(),
        password: state.password,
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: authError.message.includes("Invalid login credentials")
            ? "Invalid email or password"
            : authError.message,
        }))
        return
      }

      if (!authData.user) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Login failed - no user data",
        }))
        return
      }

      console.log("✅ Authentication successful!")

      // Step 2: Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", authData.user.id)
        .single()

      if (profileError) {
        console.error("⚠️ Profile error:", profileError)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          success: true,
          userRole: "user",
          userEmail: authData.user.email || state.email,
        }))
        return
      }

      console.log("✅ Profile fetched:", profileData)

      // Step 3: Success!
      setState((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        userRole: profileData.role,
        userEmail: profileData.email,
      }))
    } catch (error: any) {
      console.error("💥 Unexpected error:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred. Please try again.",
      }))
    }
  }

  // Success screen with enhanced design
  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e]">
          {/* Success Celebration Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-[#0f1623]/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/50 shadow-2xl">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              {/* Success Title */}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
                Welcome Back! 🎉
              </h1>

              {/* User Info */}
              <div className="space-y-2">
                <p className="text-gray-300 text-lg">
                  Hello, <span className="font-semibold text-white">{state.userEmail}</span>
                </p>
                <div className="inline-flex items-center space-x-2 bg-[#0a0e17]/50 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">
                    Logged in as{" "}
                    <span className="text-white font-medium capitalize">
                      {state.userRole}
                      {state.userRole === "admin" && " 👑"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {state.userRole === "admin" ? (
                <>
                  {/* Admin Dashboard Button */}
                  <Button
                    className="w-full h-14 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-500 hover:via-purple-600 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => {
                      console.log("Navigating to admin dashboard...")
                      window.location.href = "/admin-dashboard"
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Settings className="h-5 w-5" />
                      <span>Open Admin Dashboard</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </Button>

                  {/* Home Button */}
                  <Button
                    variant="outline"
                    className="w-full h-12 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600 rounded-xl transition-all duration-200"
                    onClick={() => (window.location.href = "/")}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Home className="h-4 w-4" />
                      <span>Visit Homepage</span>
                    </div>
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-500 hover:via-blue-600 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  onClick={() => (window.location.href = "/")}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Home className="h-5 w-5" />
                    <span>Explore Airdrops</span>
                    <Sparkles className="h-5 w-5" />
                  </div>
                </Button>
              )}

              {/* Back to Login */}
              <div className="text-center pt-6">
                <button
                  onClick={() =>
                    setState({
                      email: "",
                      password: "",
                      isLoading: false,
                      error: null,
                      success: false,
                      userRole: null,
                      userEmail: null,
                    })
                  }
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200 flex items-center justify-center space-x-1 mx-auto"
                >
                  <span>← Switch Account</span>
                </button>
              </div>
            </div>

            {/* Success Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
              <p className="text-xs text-gray-500">Session secured with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Login form
  return <LoginForm />
}
