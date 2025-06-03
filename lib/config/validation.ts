/**
 * Environment Variables Validation
 * Validates required and optional environment variables at startup
 */

import { APP_CONFIG, SEO_CONFIG, ADS_CONFIG, ANALYTICS_CONFIG } from "./environment"

export interface ValidationResult {
  isValid: boolean
  missingRequired: string[]
  missingOptional: string[]
  warnings: string[]
  errors: string[]
}

export function validateEnvironmentVariables(): ValidationResult {
  const missingRequired: string[] = []
  const missingOptional: string[] = []
  const warnings: string[] = []
  const errors: string[] = []

  // Required Variables
  if (!APP_CONFIG.SUPABASE.URL) {
    missingRequired.push("NEXT_PUBLIC_SUPABASE_URL")
    errors.push("Supabase URL is required for database connectivity")
  }

  if (!APP_CONFIG.SUPABASE.ANON_KEY) {
    missingRequired.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    errors.push("Supabase anonymous key is required for database access")
  }

  // Optional but recommended for production
  if (APP_CONFIG.NODE_ENV === "production") {
    if (!SEO_CONFIG.VERIFICATION.GOOGLE) {
      missingOptional.push("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION")
      warnings.push("Google Search Console verification not configured")
    }

    if (!ANALYTICS_CONFIG.GOOGLE_ANALYTICS.MEASUREMENT_ID) {
      missingOptional.push("NEXT_PUBLIC_GA_MEASUREMENT_ID")
      warnings.push("Google Analytics not configured - tracking disabled")
    }

    if (!ADS_CONFIG.ADSENSE.CLIENT_ID && APP_CONFIG.BUILD_TARGET === "web") {
      missingOptional.push("NEXT_PUBLIC_ADSENSE_CLIENT_ID")
      warnings.push("AdSense not configured - web ads disabled")
    }

    if (!ADS_CONFIG.ADMOB.APP_ID && APP_CONFIG.BUILD_TARGET === "mobile") {
      missingOptional.push("NEXT_PUBLIC_ADMOB_APP_ID")
      warnings.push("AdMob not configured - mobile ads disabled")
    }
  }

  // Validate URL formats
  if (APP_CONFIG.SUPABASE.URL && !APP_CONFIG.SUPABASE.URL.startsWith("https://")) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL")
  }

  if (APP_CONFIG.SITE_URL && !APP_CONFIG.SITE_URL.startsWith("http")) {
    warnings.push("NEXT_PUBLIC_SITE_URL should be a complete URL with protocol")
  }

  return {
    isValid: missingRequired.length === 0 && errors.length === 0,
    missingRequired,
    missingOptional,
    warnings,
    errors,
  }
}

export function logEnvironmentStatus(): void {
  const validation = validateEnvironmentVariables()

  console.log("🔧 Environment Configuration Status:")
  console.log(`   Build Target: ${APP_CONFIG.BUILD_TARGET}`)
  console.log(`   Environment: ${APP_CONFIG.NODE_ENV}`)
  console.log(`   Site URL: ${APP_CONFIG.SITE_URL}`)

  if (validation.isValid) {
    console.log("✅ All required environment variables are configured")
  } else {
    console.log("❌ Environment validation failed:")
    validation.errors.forEach((error) => console.log(`   ERROR: ${error}`))
    validation.missingRequired.forEach((missing) => console.log(`   MISSING: ${missing}`))
  }

  if (validation.warnings.length > 0) {
    console.log("⚠️  Warnings:")
    validation.warnings.forEach((warning) => console.log(`   ${warning}`))
  }

  // Log feature status
  console.log("🎯 Feature Status:")
  console.log(`   Analytics: ${ANALYTICS_CONFIG.GOOGLE_ANALYTICS.ENABLED ? "✅" : "❌"}`)
  console.log(`   AdSense: ${ADS_CONFIG.ADSENSE.ENABLED ? "✅" : "❌"}`)
  console.log(`   AdMob: ${ADS_CONFIG.ADMOB.ENABLED ? "✅" : "❌"}`)
  console.log(`   SEO Verification: ${Object.values(SEO_CONFIG.VERIFICATION).some((v) => v) ? "✅" : "❌"}`)
}
