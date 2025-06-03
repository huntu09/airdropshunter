import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Admin configuration
const ADMIN_CONFIG = {
  adminEmails: ["asuszenfonelivea3@gmail.com", "admin@airdropshunter.com"],
}

// Security headers configuration
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; frame-src 'self' https://pagead2.googlesyndication.com; object-src 'none';",
  },
]

export async function middleware(req: NextRequest) {
  // Clone the response so we can modify headers
  const res = NextResponse.next()

  // Apply security headers to all responses
  securityHeaders.forEach((header) => {
    res.headers.set(header.key, header.value)
  })

  const { pathname } = req.nextUrl

  // Only protect admin-dashboard routes
  if (pathname.startsWith("/admin-dashboard")) {
    console.log(`🔒 Middleware: Checking admin access for ${pathname}`)

    try {
      const supabase = createMiddlewareClient({ req, res })

      // Get session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log("🔍 Session check:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        error: sessionError?.message,
      })

      if (sessionError || !session?.user) {
        console.log("❌ No valid session, redirecting to login")
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("redirect", pathname)
        loginUrl.searchParams.set("error", "no_session")
        return NextResponse.redirect(loginUrl)
      }

      // Check if user is admin by email
      const isAdminEmail = ADMIN_CONFIG.adminEmails.includes(session.user.email || "")

      if (!isAdminEmail) {
        console.log("❌ Not admin email, checking database...")

        // Check database role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError || profile?.role !== "admin") {
          console.log("❌ Not admin, redirecting to home")
          const homeUrl = new URL("/", req.url)
          homeUrl.searchParams.set("error", "access_denied")
          return NextResponse.redirect(homeUrl)
        }
      }

      console.log("✅ Admin access granted:", session.user.email)
      return res
    } catch (error) {
      console.error("💥 Middleware error:", error)
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("redirect", pathname)
      loginUrl.searchParams.set("error", "middleware_error")
      return NextResponse.redirect(loginUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico|images/|api/).*)",
    "/admin-dashboard/:path*",
  ],
}
