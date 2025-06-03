import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found | Airdrops Hunter",
  description: "The page you're looking for doesn't exist. Browse our latest crypto airdrops instead.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="bg-[#1a2236]/50 border-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <CardTitle className="text-2xl font-bold mb-2">Page Not Found</CardTitle>
            <p className="text-gray-400">
              Oops! The page you're looking for seems to have drifted away into the crypto space.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Search Airdrops
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-500 text-center">
                Looking for something specific? Try our search or browse by category.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
