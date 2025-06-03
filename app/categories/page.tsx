import { Suspense } from "react"
import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata"
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data"
import CategoryGrid from "@/components/category-grid"

export const metadata: Metadata = generateSEOMetadata({
  title: "Crypto Airdrop Categories | DeFi, NFT, Gaming & More | Airdrops Hunter",
  description:
    "Browse crypto airdrops by category. Find DeFi, NFT, Gaming, and Launchpad airdrops. Discover the best opportunities in each blockchain sector.",
  keywords: ["crypto categories", "DeFi airdrops", "NFT airdrops", "gaming airdrops", "launchpad airdrops"],
  path: "/categories",
})

export default function CategoriesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
  ])

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="min-h-screen bg-[#0a0e17] text-white">
        <div className="container mx-auto px-4 py-8">
          {/* SEO-optimized heading */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Crypto Airdrop Categories
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover the best cryptocurrency airdrops organized by category. Find opportunities in DeFi, NFTs, Gaming,
              and more.
            </p>
          </header>

          <Suspense fallback={<CategoryGridSkeleton />}>
            <CategoryGrid />
          </Suspense>
        </div>
      </div>
    </>
  )
}

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading categories">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#1a2236]/50 border border-gray-800/50 rounded-lg p-6 animate-pulse">
          <div className="h-16 w-16 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  )
}
