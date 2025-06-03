"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, CheckCircle, AlertCircle, ExternalLink, Copy, Globe } from "lucide-react"
import { SEO_CONFIG, APP_CONFIG } from "@/lib/config/environment"

interface SearchConsoleStatus {
  verified: boolean
  sitemapSubmitted: boolean
  indexedPages: number
  lastCrawl: string | null
}

export default function GoogleSearchConsole() {
  const [status, setStatus] = useState<SearchConsoleStatus>({
    verified: false,
    sitemapSubmitted: false,
    indexedPages: 0,
    lastCrawl: null,
  })
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    // Check verification status
    const isVerified = !!SEO_CONFIG.VERIFICATION.GOOGLE
    setStatus((prev) => ({
      ...prev,
      verified: isVerified,
    }))
  }, [])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const verificationCode = SEO_CONFIG.VERIFICATION.GOOGLE
  const siteUrl = APP_CONFIG.SITE_URL
  const sitemapUrl = `${siteUrl}/sitemap.xml`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full p-2">
          <Search className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Google Search Console</h2>
          <p className="text-gray-400 text-sm">Monitor SEO health dan search performance</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a2236]/50 border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Verification</p>
                <p className="text-white font-semibold">{status.verified ? "Verified" : "Not Verified"}</p>
              </div>
              {status.verified ? (
                <CheckCircle className="h-8 w-8 text-green-400" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2236]/50 border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sitemap</p>
                <p className="text-white font-semibold">{status.sitemapSubmitted ? "Submitted" : "Pending"}</p>
              </div>
              {status.sitemapSubmitted ? (
                <CheckCircle className="h-8 w-8 text-green-400" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2236]/50 border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Indexed Pages</p>
                <p className="text-white font-semibold">{status.indexedPages}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Setup */}
      {!status.verified && (
        <Card className="bg-[#1a2236]/50 border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              Setup Google Search Console Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-900/20 border-yellow-800/50">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                Verification diperlukan untuk monitoring SEO performance dan submit sitemap.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Step 1: Add Meta Tag</h4>
                <p className="text-gray-400 text-sm mb-2">Tambahkan environment variable berikut di deployment Anda:</p>
                <div className="bg-[#0a0e17]/50 p-3 rounded-lg border border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 text-sm">NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION", "env")}
                      className="text-gray-400 hover:text-white"
                    >
                      {copied === "env" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Step 2: Get Verification Code</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => window.open("https://search.google.com/search-console", "_blank")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Google Search Console
                  </Button>
                  <p className="text-gray-400 text-sm">
                    1. Add property: <code className="text-blue-400">{siteUrl}</code>
                    <br />
                    2. Choose "HTML tag" verification method
                    <br />
                    3. Copy verification code dan set sebagai environment variable
                    <br />
                    4. Deploy ulang aplikasi Anda
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sitemap Submission */}
      <Card className="bg-[#1a2236]/50 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Sitemap Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">Sitemap URL Anda:</p>
            <div className="bg-[#0a0e17]/50 p-3 rounded-lg border border-gray-800/50">
              <div className="flex items-center justify-between">
                <code className="text-blue-400 text-sm">{sitemapUrl}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(sitemapUrl, "sitemap")}
                  className="text-gray-400 hover:text-white"
                >
                  {copied === "sitemap" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => window.open(sitemapUrl, "_blank")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Sitemap
            </Button>

            {status.verified && (
              <Button
                onClick={() =>
                  window.open(
                    `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(siteUrl)}`,
                    "_blank",
                  )
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Submit Sitemap to Google
              </Button>
            )}
          </div>

          <Alert className="bg-blue-900/20 border-blue-800/50">
            <Search className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>Manual Steps:</strong>
              <br />
              1. Go to Google Search Console → Sitemaps
              <br />
              2. Add new sitemap: <code>/sitemap.xml</code>
              <br />
              3. Click Submit
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-[#1a2236]/50 border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => window.open("https://search.google.com/search-console/performance", "_blank")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white justify-start"
            >
              <Search className="h-4 w-4 mr-2" />
              Performance Report
            </Button>

            <Button
              onClick={() => window.open("https://search.google.com/search-console/coverage", "_blank")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white justify-start"
            >
              <Globe className="h-4 w-4 mr-2" />
              Coverage Report
            </Button>

            <Button
              onClick={() => window.open("https://search.google.com/test/rich-results", "_blank")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white justify-start"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Rich Results Test
            </Button>

            <Button
              onClick={() => window.open("https://pagespeed.web.dev/", "_blank")}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white justify-start"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              PageSpeed Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
