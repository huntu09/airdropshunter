import { SEO_CONFIG, APP_CONFIG } from "@/lib/config/environment"

export interface SearchConsoleConfig {
  verificationCode?: string
  siteUrl: string
  sitemapUrl: string
}

export const searchConsoleConfig: SearchConsoleConfig = {
  verificationCode: SEO_CONFIG.VERIFICATION.GOOGLE,
  siteUrl: APP_CONFIG.SITE_URL,
  sitemapUrl: `${APP_CONFIG.SITE_URL}/sitemap.xml`,
}

export function generateVerificationMeta(verificationCode?: string) {
  if (!verificationCode) return null

  return {
    name: "google-site-verification",
    content: verificationCode,
  }
}

export function generateSearchConsoleScript() {
  return `
    // Google Search Console verification
    console.log('Google Search Console verification ready');
    
    // Auto-submit sitemap (for development/testing)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Development mode: Sitemap available at /sitemap.xml');
    }
  `
}

export async function submitSitemapToSearchConsole(siteUrl: string, sitemapUrl: string) {
  // This is a helper function that provides the URL for manual submission
  const submissionUrl = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(siteUrl)}&sitemap_url=${encodeURIComponent(sitemapUrl)}`

  return {
    submissionUrl,
    instructions: [
      "1. Go to Google Search Console",
      "2. Select your property",
      "3. Navigate to Sitemaps section",
      "4. Add new sitemap URL: /sitemap.xml",
      "5. Click Submit",
    ],
  }
}
