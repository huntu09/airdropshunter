"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, RefreshCw, Globe, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SitemapInfo {
  url: string
  status: "available" | "error" | "loading"
  lastModified?: string
  pageCount?: number
}

export default function SitemapStatus() {
  const [sitemapInfo, setSitemapInfo] = useState<SitemapInfo>({
    url: "/sitemap.xml",
    status: "loading",
  })
  const [robotsInfo, setRobotsInfo] = useState<SitemapInfo>({
    url: "/robots.txt",
    status: "loading",
  })

  const checkSitemapStatus = async () => {
    try {
      // Check sitemap
      const sitemapResponse = await fetch("/sitemap.xml")
      if (sitemapResponse.ok) {
        const sitemapText = await sitemapResponse.text()
        const urlCount = (sitemapText.match(/<url>/g) || []).length
        setSitemapInfo({
          url: "/sitemap.xml",
          status: "available",
          lastModified: new Date().toISOString(),
          pageCount: urlCount,
        })
      } else {
        setSitemapInfo((prev) => ({ ...prev, status: "error" }))
      }

      // Check robots.txt
      const robotsResponse = await fetch("/robots.txt")
      if (robotsResponse.ok) {
        setRobotsInfo({
          url: "/robots.txt",
          status: "available",
          lastModified: new Date().toISOString(),
        })
      } else {
        setRobotsInfo((prev) => ({ ...prev, status: "error" }))
      }
    } catch (error) {
      setSitemapInfo((prev) => ({ ...prev, status: "error" }))
      setRobotsInfo((prev) => ({ ...prev, status: "error" }))
    }
  }

  useEffect(() => {
    checkSitemapStatus()
  }, [])

  const copySubmissionUrls = () => {
    const urls = [
      "Google: https://search.google.com/search-console/sitemaps",
      "Bing: https://www.bing.com/webmasters/sitemaps",
      "Yandex: https://webmaster.yandex.com/site/map/",
    ].join("\n")

    navigator.clipboard.writeText(urls)
    toast({
      title: "Copied!",
      description: "Submission URLs copied to clipboard",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Sitemap & Robots Status
          </CardTitle>
          <CardDescription>Monitor your SEO files status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sitemap Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">XML Sitemap</h4>
                <Badge variant={sitemapInfo.status === "available" ? "default" : "destructive"}>
                  {sitemapInfo.status === "available" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {sitemapInfo.status}
                </Badge>
              </div>

              {sitemapInfo.status === "available" && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📄 Pages: {sitemapInfo.pageCount || 0}</p>
                  <p>🕒 Last checked: {new Date().toLocaleTimeString()}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open("/sitemap.xml", "_blank")}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={checkSitemapStatus}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Robots.txt Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Robots.txt</h4>
                <Badge variant={robotsInfo.status === "available" ? "default" : "destructive"}>
                  {robotsInfo.status === "available" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {robotsInfo.status}
                </Badge>
              </div>

              {robotsInfo.status === "available" && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>🤖 Crawling rules configured</p>
                  <p>🗺️ Sitemap reference included</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open("/robots.txt", "_blank")}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={checkSitemapStatus}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Your sitemap and robots.txt are automatically generated and updated when you add new content.
            </AlertDescription>
          </Alert>

          <Button onClick={copySubmissionUrls} variant="outline" className="w-full">
            Copy Submission URLs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
