import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest, NextResponse } from "next/server"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single, consistent Supabase client
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "supabase-auth",
      flowType: "pkce",
    },
  })
}

// Export singleton instance
export const supabase = createSupabaseClient()

// For middleware - creates a client with consistent config
export function createConsistentMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient({ req, res })
}

// For client components - creates a client with consistent config
export function createConsistentClientClient() {
  return createClientComponentClient()
}

// Browser-safe client creation
export function createBrowserClient() {
  if (typeof window === "undefined") {
    // Return a mock client for SSR
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      }),
    }
  }

  return createClientComponentClient()
}
