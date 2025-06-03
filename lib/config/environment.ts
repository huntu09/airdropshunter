/**
 * Environment Configuration
 * Centralized management of all environment variables
 */

// Core Application Settings
export const APP_CONFIG = {
  // Site Information
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://airdropshunter.com",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "/api",

  // Build Configuration
  BUILD_TARGET: process.env.BUILD_TARGET || "web", // 'web' | 'mobile'
  NODE_ENV: process.env.NODE_ENV || "development",

  // Supabase Configuration (using actual environment variables)
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
} as const

// SEO & Webmaster Tools Configuration
export const SEO_CONFIG = {
  VERIFICATION: {
    GOOGLE: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    BING: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    YANDEX: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || "",
    PINTEREST: process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION || "",
  },
} as const

// Advertising Configuration
export const ADS_CONFIG = {
  // Google AdSense (Web)
  ADSENSE: {
    CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
    ENABLED: process.env.NODE_ENV === "production" && !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    SLOTS: {
      BANNER: process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT || "",
      SIDEBAR: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || "",
      ARTICLE: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT || "",
    },
  },

  // Google AdMob (Mobile)
  ADMOB: {
    APP_ID: process.env.NEXT_PUBLIC_ADMOB_APP_ID || "",
    APP_ID_IOS: process.env.NEXT_PUBLIC_ADMOB_APP_ID_IOS || process.env.NEXT_PUBLIC_ADMOB_APP_ID || "",
    ENABLED: process.env.NODE_ENV === "production" && !!process.env.NEXT_PUBLIC_ADMOB_APP_ID,
    TEST_DEVICES: process.env.NEXT_PUBLIC_ADMOB_TEST_DEVICES?.split(",") || [],
    AD_UNITS: {
      BANNER: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || "",
      INTERSTITIAL: process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID || "",
      REWARD: process.env.NEXT_PUBLIC_ADMOB_REWARD_ID || "",
    },
  },
} as const

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS: {
    MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
    ENABLED: process.env.NODE_ENV === "production" && !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
} as const

// Monitoring Configuration (Server-side only)
export const MONITORING_CONFIG = {
  ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  MONITORING_ENDPOINT: process.env.MONITORING_ENDPOINT || "",
  REDIS_URL: process.env.REDIS_URL || "",
} as const

// Feature Flags based on environment
export const FEATURES = {
  // Core Features
  AUTHENTICATION: true,
  REAL_TIME_UPDATES: true,
  ADMIN_PANEL: true,

  // Platform-specific Features
  WEB_PUSH_NOTIFICATIONS: APP_CONFIG.BUILD_TARGET === "web",
  NATIVE_PUSH_NOTIFICATIONS: APP_CONFIG.BUILD_TARGET === "mobile",

  // Ad Features
  ADSENSE: ADS_CONFIG.ADSENSE.ENABLED && APP_CONFIG.BUILD_TARGET === "web",
  ADMOB: ADS_CONFIG.ADMOB.ENABLED && APP_CONFIG.BUILD_TARGET === "mobile",

  // SEO Features
  SEO_OPTIMIZATION: true,
  STRUCTURED_DATA: true,
  SITEMAP_GENERATION: true,

  // Development Features
  DEBUG_MODE: APP_CONFIG.NODE_ENV === "development",
  PERFORMANCE_MONITORING: APP_CONFIG.NODE_ENV === "production",
} as const

// Validation function to check required environment variables
export function validateEnvironment(): { isValid: boolean; missingVars: string[]; warnings: string[] } {
  const missingVars: string[] = []
  const warnings: string[] = []

  // Check required variables
  if (!APP_CONFIG.SUPABASE.URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!APP_CONFIG.SUPABASE.ANON_KEY) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  // Check optional but recommended variables
  if (!SEO_CONFIG.VERIFICATION.GOOGLE)
    warnings.push("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION not set - Google Search Console verification disabled")
  if (!ADS_CONFIG.ADSENSE.CLIENT_ID.includes("pub-"))
    warnings.push("NEXT_PUBLIC_ADSENSE_CLIENT_ID not properly configured - AdSense disabled")
  if (!ADS_CONFIG.ADMOB.APP_ID.includes("pub-"))
    warnings.push("NEXT_PUBLIC_ADMOB_APP_ID not properly configured - AdMob disabled")

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  }
}

// Helper function to get environment info
export function getEnvironmentInfo() {
  return {
    buildTarget: APP_CONFIG.BUILD_TARGET,
    nodeEnv: APP_CONFIG.NODE_ENV,
    siteUrl: APP_CONFIG.SITE_URL,
    features: FEATURES,
    ads: {
      adsenseEnabled: FEATURES.ADSENSE,
      admobEnabled: FEATURES.ADMOB,
    },
    seo: {
      googleVerified: !!SEO_CONFIG.VERIFICATION.GOOGLE,
      bingVerified: !!SEO_CONFIG.VERIFICATION.BING,
    },
  }
}

// Export individual configs for backward compatibility
export { APP_CONFIG as appConfig }
export { SEO_CONFIG as seoConfig }
export { ADS_CONFIG as adsConfig }
export { FEATURES as features }
