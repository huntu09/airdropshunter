"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function UpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && window.workbox !== undefined) {
      const wb = window.workbox

      // Add event listener for new updates
      wb.addEventListener("waiting", () => {
        setShowUpdatePrompt(true)
      })
    }
  }, [])

  const handleUpdate = () => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && window.workbox !== undefined) {
      // Send message to service worker to skip waiting
      window.workbox.messageSkipWaiting()
      setShowUpdatePrompt(false)
    }
  }

  if (!showUpdatePrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-900/90 backdrop-blur-md p-4 rounded-lg shadow-lg z-50 border border-blue-700">
      <h3 className="font-bold text-white mb-2">Update Available</h3>
      <p className="text-sm text-gray-200 mb-3">
        A new version of Airdrops Hunter is available. Update now for the latest features and improvements.
      </p>
      <Button onClick={handleUpdate} className="w-full bg-blue-600 hover:bg-blue-700">
        <RefreshCw size={16} className="mr-2" />
        Update Now
      </Button>
    </div>
  )
}
