"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAdManager } from "@/hooks/use-ad-manager"

interface AdContextType {
  isInitialized: boolean
  platform: "web" | "mobile" | "unknown"
  adProvider: "adsense" | "admob" | null
  showAd: (type: string) => void
  hideAd: (type: string) => void
}

const AdContext = createContext<AdContextType | undefined>(undefined)

export function AdProvider({ children }: { children: React.ReactNode }) {
  const adManager = useAdManager()
  const [adsenseLoaded, setAdsenseLoaded] = useState(false)

  useEffect(() => {
    // Only load AdSense on client side for web platform
    if (typeof window === "undefined") return
    if (adManager.adProvider !== "adsense") return
    if (adsenseLoaded) return

    try {
      // Load AdSense script
      const script = document.createElement("script")
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
      script.async = true
      script.crossOrigin = "anonymous"
      script.dataset.adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""

      script.onload = () => {
        setAdsenseLoaded(true)
        console.log("AdSense loaded successfully")
      }

      script.onerror = () => {
        console.error("Failed to load AdSense")
      }

      document.head.appendChild(script)
    } catch (error) {
      console.error("Error loading AdSense:", error)
    }
  }, [adManager.adProvider, adsenseLoaded])

  const showAd = (type: string) => {
    // Implementation for showing ads
    console.log(`Showing ${type} ad on ${adManager.platform}`)
  }

  const hideAd = (type: string) => {
    // Implementation for hiding ads
    console.log(`Hiding ${type} ad on ${adManager.platform}`)
  }

  const contextValue: AdContextType = {
    isInitialized: adManager.isInitialized,
    platform: adManager.platform,
    adProvider: adManager.adProvider,
    showAd,
    hideAd,
  }

  return <AdContext.Provider value={contextValue}>{children}</AdContext.Provider>
}

export function useAd() {
  const context = useContext(AdContext)
  if (context === undefined) {
    throw new Error("useAd must be used within an AdProvider")
  }
  return context
}
