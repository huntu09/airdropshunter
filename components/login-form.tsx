"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Eye, EyeOff, Shield, Sparkles, Zap } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/admin-dashboard"
  const errorType = searchParams.get("error")

  // Create Supabase client
  const supabase = createClientComponentClient()

  // Handle error messages from URL params
  useEffect(() => {
    if (errorType) {
      switch (errorType) {
        case "session_error":
          setError("Session error. Please login again.")
          break
        case "no_session":
          setError("Please login to access the admin dashboard.")
          break
        case "session_expired":
          setError("Your session has expired. Please login again.")
          break
        case "middleware_error":
          setError("An error occurred. Please try again.")
          break
        case "access_denied":
          setError("You don't have permission to access this page.")
          break
        default:
          setError(null)
      }
    }
  }, [errorType])

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log("🔐 Attempting login for:", email)

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("❌ Login error:", error.message)
        throw error
      }

      if (!data.user) {
        throw new Error("No user data returned")
      }

      console.log("✅ Authentication successful for:", data.user.email)

      // Check if user is admin
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("❌ Error fetching profile:", profileError)
        throw new Error("Failed to fetch user profile")
      }

      console.log("📋 Profile data:", profileData)

      // Verify admin role
      if (profileData.role !== "admin") {
        console.error("❌ User is not admin:", profileData.role)
        setError("You don't have permission to access the admin dashboard")
        await supabase.auth.signOut()
        return
      }

      console.log("👑 Admin role confirmed, redirecting...")

      // Force page reload to ensure session cookies are set properly
      window.location.href = redirectPath
    } catch (error: any) {
      console.error("💥 Login failed:", error)
      setError(error.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e17] via-[#0f1623] to-[#1a1f2e]">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="bg-[#0f1623]/80 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* Logo/Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>

            {/* Title with Gradient */}
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-gray-400 text-base">
                Access your dashboard with secure authentication
              </CardDescription>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#0a0e17]/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12 pl-4 pr-4 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <Sparkles className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#0a0e17]/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12 pl-4 pr-12 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-500 hover:via-purple-600 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Sign In to Dashboard</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="bg-[#0a0e17]/30 rounded-lg p-4 border border-gray-800/30">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-300 font-medium">Secure Authentication</p>
                  <p className="text-gray-500 mt-1">Your credentials are protected with enterprise-grade encryption</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="text-center pt-6">
            <div className="w-full space-y-4">
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0f1623] text-gray-500">Need Help?</span>
                </div>
              </div>

              {/* Help Text */}
              <p className="text-sm text-gray-500">Contact your system administrator if you need access credentials</p>
            </div>
          </CardFooter>
        </Card>

        {/* Footer Branding */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Powered by{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-semibold">
              Airdrops Hunter
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
