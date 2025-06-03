import { Suspense } from "react"
import type { Metadata } from "next"
import HeroSection from "@/components/hero-section"
import SearchSection from "@/components/search-section"
import FeaturedSection from "@/components/featured-section"
import TrendingSection from "@/components/trending-section"
import AirdropList from "@/components/airdrop-list"
import NewsletterSignup from "@/components/newsletter-signup"
import { ErrorBoundary } from "@/components/error-boundary"
import { AdBanner } from "@/components/ads/ad-banner"
import { AdSidebar } from "@/components/ads/ad-sidebar"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata"
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Best Crypto Airdrops 2024 | Free Token Opportunities | Airdrops Hunter",
  description:
    "Discover the latest cryptocurrency airdrops and earn free tokens. Join thousands of users finding profitable airdrop opportunities daily. Verified projects, easy tasks, real rewards.",
  keywords: [
    "crypto airdrops",
    "free tokens",
    "cryptocurrency",
    "airdrop hunter",
    "token distribution",
    "DeFi airdrops",
    "NFT airdrops",
    "blockchain rewards",
  ],
  path: "/",
})

export default function Home() {
  const breadcrumbSchema = generateBreadcrumbSchema([{ name: "Home", url: "/" }])

  const faqSchema = generateFAQSchema([
    {
      question: "What are crypto airdrops?",
      answer:
        "Crypto airdrops are free token distributions by blockchain projects to promote their platform and reward early adopters.",
    },
    {
      question: "How do I participate in airdrops?",
      answer:
        "Simply browse our verified airdrops, complete the required tasks, and receive free tokens directly to your wallet.",
    },
    {
      question: "Are airdrops safe?",
      answer:
        "We verify all airdrops before listing them. Always use a separate wallet and never share your private keys.",
    },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* Enhanced Page Layout */}
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-[#0f1623] to-[#1a1f2e]">
        {/* SEO-optimized heading structure */}
        <div className="sr-only">
          <h1>Best Crypto Airdrops 2024 - Free Token Opportunities</h1>
          <p>
            Discover verified cryptocurrency airdrops, earn free tokens, and join the best DeFi, NFT, and blockchain
            projects. Updated daily with new opportunities.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            {/* Hero Section - Full Width */}
            <ErrorBoundary>
              <HeroSection />
            </ErrorBoundary>

            {/* Content Container */}
            <div className="container mx-auto px-4 py-8">
              {/* Search Section */}
              <ErrorBoundary>
                <SearchSection />
              </ErrorBoundary>

              {/* 🎯 BANNER AD AFTER HERO */}
              <AdBanner className="my-12" />

              {/* Featured Airdrops */}
              <ErrorBoundary>
                <Suspense fallback={<FeaturedSectionSkeleton />}>
                  <section aria-labelledby="featured-heading">
                    <h2 id="featured-heading" className="sr-only">
                      Featured Crypto Airdrops
                    </h2>
                    <FeaturedSection />
                  </section>
                </Suspense>
              </ErrorBoundary>

              {/* 🎯 BANNER AD BETWEEN SECTIONS */}
              <AdBanner className="my-12" />

              {/* Trending Airdrops */}
              <ErrorBoundary>
                <Suspense fallback={<TrendingSectionSkeleton />}>
                  <section aria-labelledby="trending-heading">
                    <h2 id="trending-heading" className="sr-only">
                      Trending Crypto Airdrops
                    </h2>
                    <TrendingSection />
                  </section>
                </Suspense>
              </ErrorBoundary>

              {/* All Airdrops */}
              <ErrorBoundary>
                <Suspense fallback={<AirdropListSkeleton />}>
                  <section aria-labelledby="all-airdrops-heading">
                    <h2 id="all-airdrops-heading" className="sr-only">
                      All Crypto Airdrops
                    </h2>
                    <AirdropList />
                  </section>
                </Suspense>
              </ErrorBoundary>

              {/* 🎯 BANNER AD BEFORE NEWSLETTER */}
              <AdBanner className="my-12" />

              {/* Newsletter Signup */}
              <ErrorBoundary>
                <section aria-labelledby="newsletter-heading">
                  <h2 id="newsletter-heading" className="sr-only">
                    Subscribe to Airdrop Updates
                  </h2>
                  <NewsletterSignup />
                </section>
              </ErrorBoundary>
            </div>
          </div>

          {/* 🎯 SIDEBAR WITH ADS (DESKTOP ONLY) */}
          <aside className="hidden lg:block w-80 sticky top-0 h-screen overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Sidebar Ad */}
              <AdSidebar />

              {/* Enhanced Quick Stats */}
              <div className="bg-gradient-to-br from-[#0f1623]/90 to-[#1a1f2e]/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  🔥 LIVE STATS
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-2xl border border-blue-500/30">
                    <span className="text-gray-300 font-semibold">Active Airdrops</span>
                    <span className="text-blue-400 font-black text-xl">127</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/10 rounded-2xl border border-green-500/30">
                    <span className="text-gray-300 font-semibold">Total Value</span>
                    <span className="text-green-400 font-black text-xl">$2.4M</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/10 rounded-2xl border border-purple-500/30">
                    <span className="text-gray-300 font-semibold">Participants</span>
                    <span className="text-purple-400 font-black text-xl">45.2K</span>
                  </div>
                </div>
              </div>

              {/* Another Sidebar Ad */}
              <AdSidebar />

              {/* Enhanced Quick Links */}
              <div className="bg-gradient-to-br from-[#0f1623]/90 to-[#1a1f2e]/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <h3 className="text-2xl font-black mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  ⚡ QUICK ACCESS
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "🎯 DeFi Airdrops", count: "45" },
                    { name: "🎨 NFT Drops", count: "32" },
                    { name: "🎮 Gaming Tokens", count: "28" },
                    { name: "🚀 New Launches", count: "19" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl hover:from-gray-700/60 hover:to-gray-600/40 transition-all duration-300 cursor-pointer border border-gray-600/30 hover:border-gray-500/50"
                    >
                      <span className="text-gray-300 font-medium">{item.name}</span>
                      <span className="text-blue-400 font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

// Enhanced Skeleton loaders with better design
function FeaturedSectionSkeleton() {
  return (
    <div className="mb-20" role="status" aria-label="Loading featured airdrops">
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="h-12 w-12 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full animate-pulse"></div>
        <div className="h-12 w-80 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#0f1623]/80 to-[#1a1f2e]/60 rounded-3xl p-8 border border-gray-700/50 animate-pulse"
          >
            <div className="h-8 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl w-3/4 mb-6"></div>
            <div className="h-6 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-xl w-full mb-3"></div>
            <div className="h-6 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-xl w-2/3 mb-8"></div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="h-16 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-2xl"></div>
              <div className="h-16 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-2xl"></div>
              <div className="h-16 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-2xl"></div>
            </div>
            <div className="h-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendingSectionSkeleton() {
  return (
    <div className="mb-20" role="status" aria-label="Loading trending airdrops">
      <div className="flex items-center gap-4 mb-12">
        <div className="h-12 w-12 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full animate-pulse"></div>
        <div className="h-12 w-80 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-[#0f1623]/80 to-[#1a1f2e]/60 rounded-2xl p-6 border border-gray-700/50 animate-pulse"
          >
            <div className="h-16 w-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl mb-6"></div>
            <div className="h-6 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl w-3/4 mb-4"></div>
            <div className="h-5 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg w-full mb-6"></div>
            <div className="h-12 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AirdropListSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading airdrops">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl animate-pulse"></div>
        <div className="h-10 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl animate-pulse"></div>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-[#0f1623]/80 to-[#1a1f2e]/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 animate-pulse"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl w-64"></div>
                <div className="h-6 bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg w-80"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-lg w-20"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-lg w-32"></div>
                </div>
              </div>
            </div>
            <div className="h-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl w-40"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
