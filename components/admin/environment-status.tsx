"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"
import { validateEnvironment, getEnvironmentInfo } from "@/lib/config/environment"

export function EnvironmentStatus() {
  const [envStatus, setEnvStatus] = useState<{
    isValid: boolean
    missingVars: string[]
    warnings: string[]
  } | null>(null)

  const [envInfo, setEnvInfo] = useState<any>(null)

  useEffect(() => {
    const status = validateEnvironment()
    const info = getEnvironmentInfo()
    setEnvStatus(status)
    setEnvInfo(info)
  }, [])

  if (!envStatus || !envInfo) {
    return <div>Loading environment status...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {envStatus.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Environment Status
          </CardTitle>
          <CardDescription>Current environment configuration and validation status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Build Target</p>
              <Badge variant="outline">{envInfo.buildTarget}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Environment</p>
              <Badge variant={envInfo.nodeEnv === "production" ? "default" : "secondary"}>{envInfo.nodeEnv}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">AdSense</p>
              <Badge variant={envInfo.ads.adsenseEnabled ? "default" : "secondary"}>
                {envInfo.ads.adsenseEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">AdMob</p>
              <Badge variant={envInfo.ads.admobEnabled ? "default" : "secondary"}>
                {envInfo.ads.admobEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {/* Missing Variables */}
          {envStatus.missingVars.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Missing Required Variables:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {envStatus.missingVars.map((varName) => (
                    <li key={varName} className="font-mono text-sm">
                      {varName}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {envStatus.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuration Warnings:</strong>
                <ul className="mt-2 space-y-1">
                  {envStatus.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">
                      {warning}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* SEO Status */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">SEO Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {envInfo.seo.googleVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Google Search Console</span>
              </div>
              <div className="flex items-center gap-2">
                {envInfo.seo.bingVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Bing Webmaster Tools</span>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Active Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(envInfo.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2">
                  {enabled ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="text-xs">{feature.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Environment Variables Guide
          </CardTitle>
          <CardDescription>Required and optional environment variables for your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2">✅ Required (Already Set)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                <div>NEXT_PUBLIC_SUPABASE_URL</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-blue-600 mb-2">🔧 SEO & Webmaster Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                <div>NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION</div>
                <div>NEXT_PUBLIC_BING_SITE_VERIFICATION</div>
                <div>NEXT_PUBLIC_YANDEX_SITE_VERIFICATION</div>
                <div>NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-yellow-600 mb-2">💰 Advertising (AdSense)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                <div>NEXT_PUBLIC_ADSENSE_CLIENT_ID</div>
                <div>NEXT_PUBLIC_ADSENSE_BANNER_SLOT</div>
                <div>NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT</div>
                <div>NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-purple-600 mb-2">📱 Mobile Advertising (AdMob)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                <div>NEXT_PUBLIC_ADMOB_APP_ID</div>
                <div>NEXT_PUBLIC_ADMOB_APP_ID_IOS</div>
                <div>NEXT_PUBLIC_ADMOB_BANNER_ID</div>
                <div>NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID</div>
                <div>NEXT_PUBLIC_ADMOB_REWARD_ID</div>
                <div>NEXT_PUBLIC_ADMOB_TEST_DEVICES</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-600 mb-2">⚙️ General Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                <div>NEXT_PUBLIC_SITE_URL</div>
                <div>NEXT_PUBLIC_API_URL</div>
                <div>BUILD_TARGET</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
