"use client"

import { useEffect, useRef } from "react"
import { useAdManager } from "@/hooks/use-ad-manager"
import { adSlots } from "@/lib/ads/config"

interface AdSidebarProps {
  className?: string
}

export function AdSidebar({ className = "" }: AdSidebarProps) {
  const { adManager, isInitialized, activeProvider } = useAdManager()
  const adElementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isInitialized || !adManager || activeProvider !== "adsense" || !adElementRef.current) {
      return
    }

    const showAd = async () => {
      try {
        await adManager.showBanner({
          web: {
            slot: adSlots.web.sidebar,
            element: adElementRef.current!,
          },
        })
      } catch (error) {
        console.error("Failed to show sidebar ad:", error)
      }
    }

    showAd()
  }, [isInitialized, adManager, activeProvider])

  // Only show on web (AdSense)
  if (activeProvider !== "adsense") {
    return null
  }

  return (
    <div className={`ad-sidebar ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
      <div ref={adElementRef} className="w-full flex justify-center" />
    </div>
  )
}
