import type { MetadataRoute } from "next"
import { APP_CONFIG } from "@/lib/config/environment"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = APP_CONFIG.SITE_URL || "https://airdropshunter.com"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-dashboard/", "/api/", "/_next/", "/private/", "/login", "/register", "/profile", "/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl.replace(/^https?:\/\//, ""),
  }
}
