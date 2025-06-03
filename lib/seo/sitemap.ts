import { supabase } from "@/lib/supabase"

export interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
}

export async function generateSitemapEntries(): Promise<SitemapEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airdropshunter.com"

  try {
    // Static pages
    const staticPages: SitemapEntry[] = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/submit`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${baseUrl}/faq`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      },
    ]

    // Dynamic pages - Airdrops
    let airdropPages: SitemapEntry[] = []
    try {
      const { data: airdrops, error } = await supabase
        .from("airdrops")
        .select("id, updated_at, status")
        .eq("status", "active")
        .limit(1000)

      if (!error && airdrops) {
        airdropPages = airdrops.map((airdrop) => ({
          url: `${baseUrl}/airdrops/${airdrop.id}`,
          lastModified: new Date(airdrop.updated_at || new Date()),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
      }
    } catch (airdropError) {
      console.warn("Failed to fetch airdrops for sitemap:", airdropError)
      // Continue without airdrop pages
    }

    // Dynamic pages - Categories
    let categoryPages: SitemapEntry[] = []
    try {
      const { data: categories, error } = await supabase.from("categories").select("slug").eq("active", true).limit(100)

      if (!error && categories) {
        categoryPages = categories.map((category) => ({
          url: `${baseUrl}/categories/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }))
      }
    } catch (categoryError) {
      console.warn("Failed to fetch categories for sitemap:", categoryError)
      // Continue without category pages
    }

    return [...staticPages, ...airdropPages, ...categoryPages]
  } catch (error) {
    console.error("Error generating sitemap entries:", error)

    // Return minimal static pages as fallback
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/submit`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ]
  }
}
