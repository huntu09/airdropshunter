"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white py-2 px-4 text-center z-50 flex items-center justify-center">
      <WifiOff size={16} className="mr-2" />
      <span>You are currently offline. Some features may be limited.</span>
    </div>
  )
}
