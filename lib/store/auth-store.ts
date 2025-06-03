import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Session } from "@supabase/supabase-js"
import type { UserProfile } from "@/lib/supabase"

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  error: string | null
  isAdmin: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAuth: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      error: null,
      isAdmin: false,

      // Actions
      setUser: (user) => {
        set({ user })
      },

      setProfile: (profile) => {
        set({
          profile,
          isAdmin: profile?.role === "admin",
        })
      },

      setSession: (session) => {
        set({ session })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setError: (error) => {
        set({ error })
      },

      clearAuth: () => {
        set({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          error: null,
          isAdmin: false,
        })
      },

      updateProfile: (updates) => {
        const currentProfile = get().profile
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...updates }
          set({
            profile: updatedProfile,
            isAdmin: updatedProfile.role === "admin",
          })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
    },
  ),
)
