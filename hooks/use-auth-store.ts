"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  username?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  isInitializing: boolean // ✅ NEW: Prevent multiple initializations
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isInitialized: false,
      isInitializing: false, // ✅ NEW: Track initialization state

      initialize: async () => {
        const state = get()

        // ✅ PREVENT MULTIPLE INITIALIZATIONS
        if (typeof window === "undefined" || state.isInitialized || state.isInitializing) {
          console.log("🚫 Skipping initialization:", {
            isServer: typeof window === "undefined",
            isInitialized: state.isInitialized,
            isInitializing: state.isInitializing,
          })
          return
        }

        console.log("🔄 Starting auth initialization...")
        set({ isInitializing: true, isLoading: true })

        const supabase = createClientComponentClient()

        try {
          // Get initial session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            console.error("❌ Error getting initial session:", error)
            set({
              isInitialized: true,
              isInitializing: false,
              isLoading: false,
            })
            return
          }

          if (session) {
            console.log("✅ Initial session found:", session.user.email)
            set({
              user: session.user,
              session,
              isLoading: false,
            })

            // Fetch profile for initial session
            await get().fetchProfile()
          } else {
            console.log("ℹ️ No initial session found")
          }

          // ✅ SET UP AUTH LISTENER (ONLY ONCE)
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("🔄 Auth state changed:", event, session?.user?.email)

            if (session) {
              set({
                user: session.user,
                session,
                isLoading: false,
              })
              await get().fetchProfile()
            } else {
              set({
                user: null,
                profile: null,
                session: null,
                isLoading: false,
              })
            }
          })

          // ✅ MARK AS INITIALIZED
          set({
            isInitialized: true,
            isInitializing: false,
            isLoading: false,
          })

          console.log("✅ Auth initialization completed successfully")

          // ✅ CLEANUP FUNCTION
          if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => {
              subscription.unsubscribe()
            })
          }
        } catch (error) {
          console.error("💥 Error initializing auth:", error)
          set({
            isInitialized: true,
            isInitializing: false,
            isLoading: false,
          })
        }
      },

      signOut: async () => {
        if (typeof window === "undefined") return

        const supabase = createClientComponentClient()

        try {
          console.log("🚪 Signing out...")
          await supabase.auth.signOut()

          set({
            user: null,
            profile: null,
            session: null,
          })

          console.log("✅ Signed out successfully")
        } catch (error) {
          console.error("❌ Error signing out:", error)
        }
      },

      fetchProfile: async () => {
        if (typeof window === "undefined") return

        const supabase = createClientComponentClient()
        const { user } = get()

        if (!user) {
          console.log("ℹ️ No user, skipping profile fetch")
          set({ profile: null })
          return
        }

        try {
          console.log("📋 Fetching profile for:", user.id)

          const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (error) {
            console.error("❌ Error fetching profile:", error)

            // If profile doesn't exist, create one
            if (error.code === "PGRST116") {
              console.log("🔄 Creating new profile...")
              const { data: newProfile, error: createError } = await supabase
                .from("profiles")
                .insert({
                  id: user.id,
                  email: user.email || "",
                  role: "user",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single()

              if (createError) {
                console.error("❌ Error creating profile:", createError)
                return
              }

              console.log("✅ Profile created:", newProfile)
              set({ profile: newProfile })
            }
            return
          }

          if (profileData) {
            console.log("✅ Profile fetched:", profileData.role)
            set({ profile: profileData })
          }
        } catch (error) {
          console.error("💥 Error in fetchProfile:", error)
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
        // ✅ DON'T PERSIST INITIALIZATION FLAGS
      }),
    },
  ),
)
