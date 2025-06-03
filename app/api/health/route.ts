import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { validateEnvironment } from "@/lib/config/environment"

export async function GET() {
  try {
    // Check environment variables
    const envStatus = validateEnvironment()

    // Check database connection
    const dbStatus = await checkDatabaseConnection()

    // Check API functionality
    const apiStatus = { status: "ok", timestamp: new Date().toISOString() }

    // Combine all checks
    const healthStatus = {
      status: envStatus.isValid && dbStatus.connected ? "healthy" : "unhealthy",
      environment: envStatus.isValid ? "valid" : "invalid",
      database: dbStatus.connected ? "connected" : "disconnected",
      api: apiStatus,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      nodeEnv: process.env.NODE_ENV,
    }

    // Return health status
    return NextResponse.json(healthStatus, {
      status: healthStatus.status === "healthy" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Helper function to check database connection
async function checkDatabaseConnection() {
  try {
    // Simple query to check if database is responsive
    const { data, error } = await supabase.from("categories").select("count").limit(1)

    return {
      connected: !error,
      error: error ? error.message : null,
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}
