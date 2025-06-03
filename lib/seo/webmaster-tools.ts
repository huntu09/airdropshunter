export interface WebmasterToolsConfig {
  googleSearchConsole: {
    verificationCode?: string
    propertyUrl: string
    sitemapUrl: string
  }
  bingWebmasterTools: {
    verificationCode?: string
    siteUrl: string
  }
  yandexWebmaster: {
    verificationCode?: string
    siteUrl: string
  }
}

export const webmasterConfig: WebmasterToolsConfig = {
  googleSearchConsole: {
    verificationCode: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    propertyUrl: "https://airdropshunter.com",
    sitemapUrl: "https://airdropshunter.com/sitemap.xml",
  },
  bingWebmasterTools: {
    verificationCode: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
    siteUrl: "https://airdropshunter.com",
  },
  yandexWebmaster: {
    verificationCode: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
    siteUrl: "https://airdropshunter.com",
  },
}

export function generateWebmasterSubmissionUrls() {
  return {
    googleSearchConsole: "https://search.google.com/search-console/welcome",
    bingWebmasterTools: "https://www.bing.com/webmasters",
    yandexWebmaster: "https://webmaster.yandex.com",
    baiduWebmaster: "https://ziyuan.baidu.com/site/index",
  }
}

export function generateSitemapSubmissionInstructions() {
  return {
    google: [
      "1. Go to Google Search Console (https://search.google.com/search-console)",
      "2. Add property: https://airdropshunter.com",
      "3. Verify ownership using HTML meta tag",
      "4. Go to Sitemaps section",
      "5. Submit sitemap URL: sitemap.xml",
      "6. Monitor indexing status",
    ],
    bing: [
      "1. Go to Bing Webmaster Tools (https://www.bing.com/webmasters)",
      "2. Add site: https://airdropshunter.com",
      "3. Verify using meta tag",
      "4. Submit sitemap in Sitemaps section",
      "5. Monitor crawl status",
    ],
    yandex: [
      "1. Go to Yandex Webmaster (https://webmaster.yandex.com)",
      "2. Add site: https://airdropshunter.com",
      "3. Verify ownership",
      "4. Submit sitemap URL",
      "5. Check indexing reports",
    ],
  }
}
