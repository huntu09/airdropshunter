import { airdropService } from "@/lib/services/airdrop-service"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata"
import { generateAirdropSchema, generateBreadcrumbSchema } from "@/lib/seo/structured-data"
import { Suspense } from "react"
import AirdropDetailClient from "./airdrop-detail-client"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const airdrop = await airdropService.getAirdropById(params.id)

    return generateSEOMetadata({
      title: `${airdrop.title} Airdrop | ${airdrop.reward_amount || "Free Tokens"} | Airdrops Hunter`,
      description: `Join ${airdrop.title} airdrop and earn ${airdrop.reward_amount || "free tokens"}. ${airdrop.description.substring(0, 120)}... Easy tasks, verified project.`,
      keywords: [airdrop.title, `${airdrop.category} airdrop`, airdrop.blockchain, "free tokens", "cryptocurrency"],
      path: `/airdrops/${params.id}`,
      image: airdrop.banner_url || airdrop.logo_url,
    })
  } catch (error) {
    return generateSEOMetadata({
      title: "Airdrop Not Found | Airdrops Hunter",
      description: "The requested airdrop could not be found. Browse our latest verified crypto airdrops.",
      path: `/airdrops/${params.id}`,
    })
  }
}

export default async function AirdropDetailPage({ params }: Props) {
  let airdrop
  try {
    airdrop = await airdropService.getAirdropById(params.id)
  } catch (error) {
    notFound()
  }

  const airdropSchema = generateAirdropSchema(airdrop)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Airdrops", url: "/airdrops" },
    { name: airdrop.title, url: `/airdrops/${params.id}` },
  ])

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(airdropSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* SEO-optimized heading */}
      <div className="sr-only">
        <h1>
          {airdrop.title} Airdrop - Earn {airdrop.reward_amount || "Free Tokens"}
        </h1>
        <p>{airdrop.description}</p>
      </div>

      <Suspense fallback={<AirdropDetailSkeleton />}>
        <AirdropDetailClient airdropId={params.id} initialData={airdrop} />
      </Suspense>
    </>
  )
}

function AirdropDetailSkeleton() {
  return (
    <div className="container mx-auto py-10" role="status" aria-label="Loading airdrop details">
      <div className="flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-40 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Banner Skeleton */}
        <div className="h-64 w-full bg-gray-700 rounded-xl animate-pulse"></div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 w-full bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-64 w-full bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
