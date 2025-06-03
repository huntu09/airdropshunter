// Google Analytics 4 Configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX"

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== "undefined" && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX") {
    // Load gtag script
    const script = document.createElement("script")
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments)
    }
    window.gtag = gtag

    gtag("js", new Date())
    gtag("config", GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
      // Enhanced measurement for ads
      enhanced_measurement_settings: {
        scrolls: true,
        outbound_clicks: true,
        site_search: true,
        video_engagement: true,
        file_downloads: true,
      },
      // Custom dimensions for airdrop tracking
      custom_map: {
        custom_parameter_1: "airdrop_category",
        custom_parameter_2: "user_type",
        custom_parameter_3: "ad_revenue",
      },
    })

    console.log("✅ Google Analytics 4 initialized")
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    })
  }
}

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track airdrop interactions
export const trackAirdropEvent = (action: string, airdropId: string, category?: string) => {
  trackEvent(action, "airdrop", `${airdropId}-${category || "general"}`)
}

// Track ad interactions
export const trackAdEvent = (action: string, adType: string, revenue?: number) => {
  trackEvent(action, "advertising", adType, revenue)
}

// Track user engagement
export const trackUserEngagement = (action: string, duration?: number) => {
  trackEvent(action, "engagement", undefined, duration)
}

// Enhanced ecommerce tracking for ad revenue
export const trackAdRevenue = (revenue: number, adUnit: string, platform: "web" | "mobile") => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: `ad_${Date.now()}`,
      value: revenue,
      currency: "USD",
      items: [
        {
          item_id: adUnit,
          item_name: `Ad Revenue - ${platform}`,
          category: "advertising",
          quantity: 1,
          price: revenue,
        },
      ],
    })
  }
}

// Track search queries
export const trackSearch = (searchTerm: string, results: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "search", {
      search_term: searchTerm,
      results: results,
    })
  }
}

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent(success ? "form_submit_success" : "form_submit_error", "forms", formName)
}

// Track user registration
export const trackUserRegistration = (method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "sign_up", {
      method: method,
    })
  }
}

// Track user login
export const trackUserLogin = (method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "login", {
      method: method,
    })
  }
}

// Declare global gtag function
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
