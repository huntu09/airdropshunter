import type { Metadata } from "next"
import { generateVerificationTags, defaultVerification } from "./verification"

interface MetadataParams {
  title: string
  description: string
  keywords?: string[]
  noIndex?: boolean
  noFollow?: boolean
  image?: string
  path: string
  canonical?: string
  type?: string
}

export function generateMetadata(params: MetadataParams): Metadata {
  const verificationTags = generateVerificationTags(defaultVerification)

  return {
    title: params.title,
    description: params.description,
    keywords: params.keywords?.join(", "),
    authors: [{ name: "Airdrops Hunter Team" }],
    creator: "Airdrops Hunter",
    publisher: "Airdrops Hunter",
    robots: {
      index: params.noIndex ? false : true,
      follow: params.noFollow ? false : true,
      googleBot: {
        index: params.noIndex ? false : true,
        follow: params.noFollow ? false : true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: verificationTags.reduce((acc, tag) => {
      if (tag.name === "google-site-verification") acc.google = tag.content
      if (tag.name === "msvalidate.01") acc.other = { ...acc.other, bing: tag.content }
      if (tag.name === "yandex-verification") acc.other = { ...acc.other, yandex: tag.content }
      return acc
    }, {} as any),
    alternates: {
      canonical: params.canonical || `https://airdropshunter.com${params.path}`,
    },
    openGraph: {
      type: params.type || "website",
      locale: "en_US",
      url: `https://airdropshunter.com${params.path}`,
      siteName: "Airdrops Hunter",
      title: params.title,
      description: params.description,
      images: [
        {
          url: params.image || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: params.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@airdropshunter",
      creator: "@airdropshunter",
      title: params.title,
      description: params.description,
      images: [params.image || "/og-image.jpg"],
    },
  }
}
