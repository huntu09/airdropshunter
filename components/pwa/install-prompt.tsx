"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { checkPwaInstallable, promptPwaInstall } from "@/lib/pwa/register-sw"

export default function PwaInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if the app has been dismissed before
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed && Date.now() - Number.parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      // If dismissed less than 7 days ago, don't show again
      setIsDismissed(true)
      return
    }

    // Check if the app can be installed
    checkPwaInstallable().then(setIsInstallable)
  }, [])

  const handleInstall = async () => {
    const installed = await promptPwaInstall()
    if (installed) {
      setIsInstallable(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  if (!isInstallable || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-16 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-blue-900/90 backdrop-blur-md p-4 rounded-lg shadow-lg z-50 border border-blue-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-white">Install App</h3>
        <button onClick={handleDismiss} className="text-gray-300 hover:text-white">
          <X size={20} />
        </button>
      </div>
      <p className="text-sm text-gray-200 mb-3">Install Airdrops Hunter for a better experience and offline access.</p>
      <div className="flex space-x-2">
        <Button onClick={handleInstall} className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Download size={16} className="mr-2" />
          Install App
        </Button>
        <Button onClick={handleDismiss} variant="outline" className="border-blue-700 text-gray-200 hover:bg-blue-800">
          Not Now
        </Button>
      </div>
    </div>
  )
}
