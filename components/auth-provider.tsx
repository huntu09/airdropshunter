"use client"

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react"
import { useAuthStore } from "@/hooks/use-auth-store"

interface AuthContextType {
  user: any
  profile: any
  session: any
  isLoading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore()
  const initializeRef = useRef(false) // ✅ PREVENT MULTIPLE CALLS

  useEffect(() => {
    // ✅ ONLY INITIALIZE ONCE
    if (
      typeof window !== "undefined" &&
      !initializeRef.current &&
      !authStore.isInitialized &&
      !authStore.isInitializing
    ) {
      console.log("🚀 AuthProvider: Starting initialization")
      initializeRef.current = true
      authStore.initialize()
    }
  }, []) // ✅ EMPTY DEPENDENCY ARRAY - ONLY RUN ONCE

  // ✅ SEPARATE EFFECT FOR LOGGING (NO SIDE EFFECTS)
  useEffect(() => {
    console.log("🔍 AuthProvider state:", {
      hasUser: !!authStore.user,
      hasProfile: !!authStore.profile,
      userEmail: authStore.user?.email,
      userRole: authStore.profile?.role,
      isInitialized: authStore.isInitialized,
      isInitializing: authStore.isInitializing,
      isLoading: authStore.isLoading,
    })
  }, [authStore.user, authStore.profile, authStore.isInitialized, authStore.isInitializing, authStore.isLoading])

  const contextValue: AuthContextType = {
    user: authStore.user,
    profile: authStore.profile,
    session: authStore.session,
    isLoading: authStore.isLoading,
    isInitialized: authStore.isInitialized,
    signOut: authStore.signOut,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export default for backward compatibility
export default AuthProvider
