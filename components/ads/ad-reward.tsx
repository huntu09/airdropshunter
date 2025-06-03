"use client"

import { useState } from "react"
import { useAdManager } from "@/hooks/use-ad-manager"
import { adSlots } from "@/lib/ads/config"
import { Button } from "@/components/ui/button"
import { Gift } from "lucide-react"

interface AdRewardProps {
  onRewardEarned?: (reward: { type: string; amount: number }) => void
  rewardText?: string
  className?: string
}

export function AdReward({ onRewardEarned, rewardText = "Watch ad to earn rewards", className = "" }: AdRewardProps) {
  const { adManager, isInitialized, activeProvider } = useAdManager()
  const [isLoading, setIsLoading] = useState(false)

  const showRewardAd = async () => {
    if (!isInitialized || !adManager || activeProvider !== "admob") {
      return
    }

    setIsLoading(true)
    try {
      await adManager.showRewardVideo(adSlots.mobile.reward)
      // Simulate reward (in real app, this would come from AdMob callback)
      onRewardEarned?.({ type: "coins", amount: 100 })
    } catch (error) {
      console.error("Failed to show reward ad:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Only available on mobile (AdMob)
  if (activeProvider !== "admob") {
    return null
  }

  return (
    <Button
      onClick={showRewardAd}
      disabled={isLoading}
      className={`flex items-center gap-2 ${className}`}
      variant="default"
    >
      <Gift className="w-4 h-4" />
      {isLoading ? "Loading..." : rewardText}
    </Button>
  )
}
