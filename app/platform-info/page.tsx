"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// Dynamic import untuk client-side only
const BuildInfo = dynamic(
  () => import("@/components/platform/build-info").then((mod) => ({ default: mod.BuildInfo })),
  {
    ssr: false,
    loading: () => <BuildInfoSkeleton />,
  },
)

function BuildInfoSkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-16" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-18" />
            <Skeleton className="h-6 w-22" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PlatformInfoPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Platform Information</h1>
          <p className="text-muted-foreground">Debug information about build configuration and runtime platform</p>
        </div>

        <Suspense fallback={<BuildInfoSkeleton />}>
          <BuildInfo />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Build Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Web Build (Current)</h4>
              <code className="bg-muted p-2 rounded block">npm run build</code>
              <p className="text-sm text-muted-foreground mt-1">
                Full Next.js build with SSR, API routes, and all web features
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Mobile Build (For Ionic)</h4>
              <code className="bg-muted p-2 rounded block">npm run build:mobile</code>
              <p className="text-sm text-muted-foreground mt-1">
                Static export optimized for Ionic AppFlow and mobile apps
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Capacitor Sync</h4>
              <code className="bg-muted p-2 rounded block">npm run cap:sync</code>
              <p className="text-sm text-muted-foreground mt-1">
                Builds mobile version and syncs with Capacitor native projects
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Platform Detection</h4>
              <p className="text-sm text-muted-foreground">
                The platform information above is detected client-side only. This ensures compatibility with server-side
                rendering while providing accurate runtime platform detection for ad serving and feature flags.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
