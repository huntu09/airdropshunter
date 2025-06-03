"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, CheckCircle, AlertCircle, Search, Globe, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { generateSitemapSubmissionInstructions, generateWebmasterSubmissionUrls } from "@/lib/seo/webmaster-tools"
// Add the verification status component at the top
import VerificationStatus from "./verification-status"
// Add the sitemap status component
import SitemapStatus from "./sitemap-status"

export default function SearchConsoleSetup() {
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  const submissionUrls = generateWebmasterSubmissionUrls()
  const instructions = generateSitemapSubmissionInstructions()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const sitemapUrl = "https://airdropshunter.com/sitemap.xml"
  const robotsUrl = "https://airdropshunter.com/robots.txt"

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Search className="h-8 w-8 text-blue-500" />
          Search Console Setup
        </h1>
        <p className="text-muted-foreground">Complete guide to submit your site to search engines</p>
      </div>
      {/* Add this before the existing tabs */}
      <div className="mb-6">
        <VerificationStatus />
      </div>
      // Add this after the verification status
      <div className="mb-6">
        <SitemapStatus />
      </div>
      <Tabs defaultValue="google" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="bing">Bing</TabsTrigger>
          <TabsTrigger value="yandex">Yandex</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Google Search Console
              </CardTitle>
              <CardDescription>Submit your site to Google for better search visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Follow these steps to verify your site with Google Search Console</AlertDescription>
              </Alert>

              <div className="space-y-3">
                {instructions.google.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>

              {/* Update the verification code input section to show current status */}
              <div className="space-y-3">
                <Label htmlFor="verification">Current Google Verification Status</Label>
                {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Google verification code is configured! Meta tag is automatically added to all pages.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ Google verification code not set. Add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to environment
                      variables.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="verification">Verification Meta Tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="verification"
                    placeholder="Enter your Google verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(`<meta name="google-site-verification" content="${verificationCode}" />`)
                    }
                    disabled={!verificationCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {verificationCode && (
                  <div className="p-3 bg-muted rounded-md">
                    <code className="text-sm">
                      {`<meta name="google-site-verification" content="${verificationCode}" />`}
                    </code>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Sitemap URL</Label>
                <div className="flex gap-2">
                  <Input value={sitemapUrl} readOnly />
                  <Button variant="outline" onClick={() => copyToClipboard(sitemapUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => window.open(sitemapUrl, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={() => window.open(submissionUrls.googleSearchConsole, "_blank")} className="w-full">
                Open Google Search Console
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Bing Webmaster Tools
              </CardTitle>
              <CardDescription>Submit your site to Bing for Microsoft search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {instructions.bing.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => window.open(submissionUrls.bingWebmasterTools, "_blank")} className="w-full">
                Open Bing Webmaster Tools
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yandex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-500" />
                Yandex Webmaster
              </CardTitle>
              <CardDescription>Submit your site to Yandex for Russian search market</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {instructions.yandex.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => window.open(submissionUrls.yandexWebmaster, "_blank")} className="w-full">
                Open Yandex Webmaster
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.open("/sitemap.xml", "_blank")} className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Sitemap
            </Button>
            <Button variant="outline" onClick={() => window.open("/robots.txt", "_blank")} className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Robots.txt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
