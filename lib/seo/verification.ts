export interface VerificationMeta {
  google?: string
  bing?: string
  yandex?: string
  pinterest?: string
}

export function generateVerificationTags(verification: VerificationMeta) {
  const tags: Array<{ name: string; content: string }> = []

  if (verification.google) {
    tags.push({
      name: "google-site-verification",
      content: verification.google,
    })
  }

  if (verification.bing) {
    tags.push({
      name: "msvalidate.01",
      content: verification.bing,
    })
  }

  if (verification.yandex) {
    tags.push({
      name: "yandex-verification",
      content: verification.yandex,
    })
  }

  if (verification.pinterest) {
    tags.push({
      name: "p:domain_verify",
      content: verification.pinterest,
    })
  }

  return tags
}

// Update the verification configuration to use the new environment variables
export const defaultVerification: VerificationMeta = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
  yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || "",
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION || "",
}

// Add validation function
export function validateVerificationCodes(): { isValid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) missing.push("Google")
  if (!process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) missing.push("Bing")
  if (!process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION) missing.push("Yandex")
  if (!process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION) missing.push("Pinterest")

  return {
    isValid: missing.length === 0,
    missing,
  }
}
