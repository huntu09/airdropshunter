import type { MetadataRoute } from "next"
import { generateSitemapEntries } from "@/lib/seo/sitemap"
import { APP_CONFIG } from "@/lib/config/environment"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries = await generateSitemapEntries()

    return entries.map((entry) => ({
      url: entry.url,
      lastModified: entry.lastModified || new Date(),
      changeFrequency: entry.changeFrequency || "weekly",
      priority: entry.priority || 0.5,
    }))
  } catch (error) {
    console.error("Error generating sitemap:", error)

    // Fallback to static pages only using centralized config
    return [
      {
        url: APP_CONFIG.SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${APP_CONFIG.SITE_URL}/categories`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${APP_CONFIG.SITE_URL}/submit`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ]
  }
}
