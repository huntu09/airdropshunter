"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBuildConfig } from "@/lib/platform/build-detector"
import { features } from "@/lib/platform/feature-flags"

// Safe platform detector import
function usePlatformDetector() {
  const [platformInfo, setPlatformInfo] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Dynamic import untuk avoid server-side issues
    import("@/lib/platform/build-detector").then(({ getPlatformDetector }) => {
      try {
        const detector = getPlatformDetector()
        if (detector) {
          setPlatformInfo(detector.getPlatformInfo())
        }
      } catch (error) {
        console.warn("Platform detection error:", error)
        // Fallback platform info
        setPlatformInfo({
          isWeb: true,
          isNativeApp: false,
          isIOS: false,
          isAndroid: false,
          isPWA: false,
          isWebView: false,
          platform: "web",
        })
      }
    })
  }, [])

  return { platformInfo, mounted }
}

export function BuildInfo() {
  const { platformInfo, mounted } = usePlatformDetector()
  const buildConfig = getBuildConfig()

  if (!mounted || !platformInfo) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Loading Platform Information...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detecting platform and build configuration...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Platform Information
          <Badge variant={buildConfig.target === "web" ? "default" : "secondary"}>
            {buildConfig.target.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Build Configuration</h4>
            <ul className="text-sm space-y-1">
              <li>
                Target: <Badge variant="outline">{buildConfig.target}</Badge>
              </li>
              <li>
                Static:{" "}
                <Badge variant={buildConfig.isStatic ? "default" : "secondary"}>
                  {buildConfig.isStatic ? "Yes" : "No"}
                </Badge>
              </li>
              <li>
                SSR:{" "}
                <Badge variant={buildConfig.supportsSSR ? "default" : "secondary"}>
                  {buildConfig.supportsSSR ? "Yes" : "No"}
                </Badge>
              </li>
              <li>
                API Routes:{" "}
                <Badge variant={buildConfig.hasApiRoutes ? "default" : "secondary"}>
                  {buildConfig.hasApiRoutes ? "Yes" : "No"}
                </Badge>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Runtime Platform</h4>
            <ul className="text-sm space-y-1">
              <li>
                Platform: <Badge variant="outline">{platformInfo.platform}</Badge>
              </li>
              <li>
                Web:{" "}
                <Badge variant={platformInfo.isWeb ? "default" : "secondary"}>
                  {platformInfo.isWeb ? "Yes" : "No"}
                </Badge>
              </li>
              <li>
                Native App:{" "}
                <Badge variant={platformInfo.isNativeApp ? "default" : "secondary"}>
                  {platformInfo.isNativeApp ? "Yes" : "No"}
                </Badge>
              </li>
              <li>
                WebView:{" "}
                <Badge variant={platformInfo.isWebView ? "default" : "secondary"}>
                  {platformInfo.isWebView ? "Yes" : "No"}
                </Badge>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Active Features</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(features).map(([key, value]) => (
              <Badge key={key} variant={value ? "default" : "secondary"} className="text-xs">
                {key}: {value ? "✓" : "✗"}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Ad Configuration</h4>
          <div className="flex gap-2">
            <Badge variant={features.adSense ? "default" : "secondary"}>
              AdSense: {features.adSense ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={features.adMob ? "default" : "secondary"}>
              AdMob: {features.adMob ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> Platform detection runs client-side only to ensure server-side rendering
            compatibility. Information above reflects the current browser/app environment.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
