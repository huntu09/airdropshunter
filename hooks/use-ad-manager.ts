"use client"

import { useState, useEffect } from "react"
import { getPlatformDetector } from "@/lib/platform/build-detector"

export interface AdManagerState {
  isInitialized: boolean
  platform: "web" | "mobile" | "unknown"
  adProvider: "adsense" | "admob" | null
  error: string | null
}

export function useAdManager() {
  const [state, setState] = useState<AdManagerState>({
    isInitialized: false,
    platform: "unknown",
    adProvider: null,
    error: null,
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    try {
      const detector = getPlatformDetector()
      const platformInfo = detector.getPlatformInfo()

      let platform: "web" | "mobile" | "unknown" = "unknown"
      let adProvider: "adsense" | "admob" | null = null

      if (detector.shouldUseAdSense()) {
        platform = "web"
        adProvider = "adsense"
      } else if (detector.shouldUseAdMob()) {
        platform = "mobile"
        adProvider = "admob"
      } else {
        platform = platformInfo.isWeb ? "web" : "mobile"
        adProvider = platform === "web" ? "adsense" : "admob"
      }

      setState({
        isInitialized: true,
        platform,
        adProvider,
        error: null,
      })
    } catch (error) {
      console.error("Ad manager initialization error:", error)
      setState({
        isInitialized: true,
        platform: "web",
        adProvider: "adsense",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }, [])

  return state
}
