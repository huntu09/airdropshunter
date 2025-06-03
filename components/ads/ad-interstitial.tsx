"use client"

import { useAdManager } from "@/hooks/use-ad-manager"
import { adSlots } from "@/lib/ads/config"
import { Button } from "@/components/ui/button"

interface AdInterstitialProps {
  trigger?: "manual" | "auto"
  onAdShown?: () => void
  onAdClosed?: () => void
}

export function AdInterstitial({ trigger = "manual", onAdShown, onAdClosed }: AdInterstitialProps) {
  const { adManager, isInitialized, activeProvider } = useAdManager()

  const showInterstitial = async () => {
    if (!isInitialized || !adManager || activeProvider !== "admob") {
      return
    }

    try {
      onAdShown?.()
      await adManager.showInterstitial(adSlots.mobile.interstitial)
      onAdClosed?.()
    } catch (error) {
      console.error("Failed to show interstitial ad:", error)
      onAdClosed?.()
    }
  }

  // Only available on mobile (AdMob)
  if (activeProvider !== "admob") {
    return null
  }

  if (trigger === "auto") {
    // Auto-trigger logic can be implemented here
    return null
  }

  return (
    <Button onClick={showInterstitial} variant="outline" size="sm">
      Show Ad
    </Button>
  )
}
