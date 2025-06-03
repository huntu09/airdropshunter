"use client"

import { useEffect, useRef } from "react"
import { useAdManager } from "@/hooks/use-ad-manager"
import { adSlots } from "@/lib/ads/config"
import type { BannerAdSize, BannerAdPosition } from "@capacitor-community/admob"

interface AdBannerProps {
  className?: string
  size?: "banner" | "large" | "rectangle"
  position?: BannerAdPosition
}

export function AdBanner({ className = "", size = "banner", position = "BOTTOM_CENTER" }: AdBannerProps) {
  const { adManager, isInitialized, activeProvider } = useAdManager()
  const adElementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isInitialized || !adManager) return

    const showAd = async () => {
      try {
        if (activeProvider === "adsense" && adElementRef.current) {
          // Show AdSense banner
          await adManager.showBanner({
            web: {
              slot: adSlots.web.banner,
              element: adElementRef.current,
            },
          })
        } else if (activeProvider === "admob") {
          // Show AdMob banner
          const bannerSize: BannerAdSize =
            size === "large" ? "LARGE_BANNER" : size === "rectangle" ? "MEDIUM_RECTANGLE" : "BANNER"

          await adManager.showBanner({
            mobile: {
              ...adSlots.mobile.banner,
              size: bannerSize,
              position,
            },
          })
        }
      } catch (error) {
        console.error("Failed to show banner ad:", error)
      }
    }

    showAd()

    // Cleanup for mobile ads
    return () => {
      if (activeProvider === "admob" && adManager) {
        adManager.hideBanner().catch(console.error)
      }
    }
  }, [isInitialized, adManager, activeProvider, size, position])

  // For web (AdSense), render container element
  if (activeProvider === "adsense") {
    return (
      <div className={`ad-banner ${className}`}>
        <div ref={adElementRef} className="w-full flex justify-center" />
      </div>
    )
  }

  // For mobile (AdMob), ads are rendered natively
  // Return null or placeholder
  if (activeProvider === "admob") {
    return null // AdMob renders natively
  }

  // No ads or loading
  return null
}
