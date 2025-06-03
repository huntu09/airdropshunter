"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VerificationStatus {
  platform: string
  isConfigured: boolean
  verificationCode?: string
  submissionUrl: string
  color: string
}

export default function VerificationStatus() {
  const [verificationStatuses, setVerificationStatuses] = useState<VerificationStatus[]>([])

  useEffect(() => {
    const statuses: VerificationStatus[] = [
      {
        platform: "Google Search Console",
        isConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        verificationCode: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        submissionUrl: "https://search.google.com/search-console/welcome",
        color: "blue",
      },
      {
        platform: "Bing Webmaster Tools",
        isConfigured: !!process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
        verificationCode: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
        submissionUrl: "https://www.bing.com/webmasters",
        color: "orange",
      },
      {
        platform: "Yandex Webmaster",
        isConfigured: !!process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
        verificationCode: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
        submissionUrl: "https://webmaster.yandex.com",
        color: "red",
      },
      {
        platform: "Pinterest",
        isConfigured: !!process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION,
        verificationCode: process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION,
        submissionUrl: "https://help.pinterest.com/en/business/article/claim-your-website",
        color: "pink",
      },
    ]

    setVerificationStatuses(statuses)
  }, [])

  const configuredCount = verificationStatuses.filter((status) => status.isConfigured).length
  const totalCount = verificationStatuses.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Verification Status
          </CardTitle>
          <CardDescription>
            {configuredCount}/{totalCount} search engines configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configuredCount === totalCount ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 All search engines are properly configured! Your site is ready for submission.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {totalCount - configuredCount} search engine(s) still need configuration.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {verificationStatuses.map((status) => (
          <Card key={status.platform}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{status.platform}</CardTitle>
                <Badge variant={status.isConfigured ? "default" : "secondary"}>
                  {status.isConfigured ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {status.isConfigured ? "Configured" : "Not Set"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {status.isConfigured ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Verification code configured</p>
                  <div className="p-2 bg-muted rounded text-xs font-mono break-all">
                    {status.verificationCode?.substring(0, 20)}...
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Environment variable not set. Add your verification code to enable this platform.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(status.submissionUrl, "_blank")}
                className="w-full"
              >
                Open {status.platform}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">For configured platforms:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Visit the webmaster tools</li>
              <li>• Add your site property</li>
              <li>• Verify using HTML meta tag (already configured)</li>
              <li>
                • Submit sitemap: <code className="bg-muted px-1 rounded">sitemap.xml</code>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">For unconfigured platforms:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Get verification code from webmaster tools</li>
              <li>• Add to environment variables in Vercel</li>
              <li>• Redeploy your application</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
