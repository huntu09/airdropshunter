import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import AirdropList from "@/components/airdrop-list"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const categories = {
  defi: {
    name: "DeFi",
    description: "Decentralized Finance protocols and platforms",
    icon: "💰",
    color: "from-green-400 to-emerald-600",
  },
  nft: {
    name: "NFT",
    description: "Non-Fungible Token marketplaces and collections",
    icon: "🎨",
    color: "from-purple-400 to-pink-600",
  },
  gaming: {
    name: "Gaming",
    description: "Blockchain games and gaming platforms",
    icon: "🎮",
    color: "from-blue-400 to-cyan-600",
  },
  launchpad: {
    name: "Launchpad",
    description: "Token launch platforms and IDO projects",
    icon: "🚀",
    color: "from-orange-400 to-red-600",
  },
}

type CategoryPageProps = {
  params: {
    category: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryData = categories[params.category as keyof typeof categories]

  if (!categoryData) {
    return {
      title: "Category Not Found | Airdrops Hunter",
    }
  }

  return {
    title: `${categoryData.name} Airdrops | Airdrops Hunter`,
    description: `Discover the latest ${categoryData.name.toLowerCase()} airdrops. ${categoryData.description}`,
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryData = categories[params.category as keyof typeof categories]

  if (!categoryData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/categories">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Categories
            </Button>
          </Link>
          <span className="text-gray-600">/</span>
          <Badge variant="secondary" className="bg-blue-900/20 text-blue-400">
            {categoryData.name}
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{categoryData.icon}</div>
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${categoryData.color} bg-clip-text text-transparent`}
          >
            {categoryData.name} Airdrops
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{categoryData.description}</p>
        </div>

        {/* Airdrops List */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#1a2236]/50 border border-gray-800/50 rounded-lg p-6 animate-pulse">
                  <div className="h-16 w-16 bg-gray-700 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          }
        >
          <AirdropList category={params.category} />
        </Suspense>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({
    category,
  }))
}
