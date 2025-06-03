import { ADS_CONFIG } from "@/lib/config/environment"
import { trackAdEvent } from "@/lib/analytics/google-analytics"

// AdSense Auto Ads Configuration
export class AdSenseAutoAds {
  private static instance: AdSenseAutoAds
  private isInitialized = false
  private adsbygoogle: any[] = []

  static getInstance(): AdSenseAutoAds {
    if (!AdSenseAutoAds.instance) {
      AdSenseAutoAds.instance = new AdSenseAutoAds()
    }
    return AdSenseAutoAds.instance
  }

  // Initialize AdSense Auto Ads
  async initialize(): Promise<void> {
    if (this.isInitialized || !ADS_CONFIG.ADSENSE.ENABLED) {
      return
    }

    try {
      // Load AdSense script
      await this.loadAdSenseScript()

      // Configure Auto Ads
      this.configureAutoAds()

      this.isInitialized = true
      console.log("✅ AdSense Auto Ads initialized")

      // Track initialization
      trackAdEvent("adsense_initialized", "auto_ads")
    } catch (error) {
      console.error("❌ Failed to initialize AdSense Auto Ads:", error)
    }
  }

  // Load AdSense script
  private loadAdSenseScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already loaded
      if (document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.ADSENSE.CLIENT_ID}`
      script.async = true
      script.crossOrigin = "anonymous"

      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load AdSense script"))

      document.head.appendChild(script)
    })
  }

  // Configure Auto Ads
  private configureAutoAds(): void {
    if (typeof window !== "undefined") {
      // Initialize adsbygoogle array
      window.adsbygoogle = window.adsbygoogle || []

      // Configure Auto Ads
      window.adsbygoogle.push({
        google_ad_client: ADS_CONFIG.ADSENSE.CLIENT_ID,
        enable_page_level_ads: true,
        overlays: {
          bottom: true, // Enable bottom overlay ads
        },
        auto_ad_settings: {
          page_level_ads: {
            ads_density: "medium", // low, medium, high
            page_loading_strategy: "delayed", // immediate, delayed
          },
        },
      })

      console.log("🎯 AdSense Auto Ads configured")
    }
  }

  // Manual ad placement for specific slots
  createAdUnit(containerId: string, slot: string, format: "auto" | "rectangle" | "banner" = "auto"): void {
    if (!ADS_CONFIG.ADSENSE.ENABLED) return

    const container = document.getElementById(containerId)
    if (!container) {
      console.warn(`Container ${containerId} not found for ad placement`)
      return
    }

    // Create ad element
    const adElement = document.createElement("ins")
    adElement.className = "adsbygoogle"
    adElement.style.display = "block"
    adElement.setAttribute("data-ad-client", ADS_CONFIG.ADSENSE.CLIENT_ID)
    adElement.setAttribute("data-ad-slot", slot)

    // Set ad format
    if (format === "auto") {
      adElement.setAttribute("data-ad-format", "auto")
      adElement.setAttribute("data-full-width-responsive", "true")
    } else if (format === "rectangle") {
      adElement.setAttribute("data-ad-format", "rectangle")
      adElement.style.width = "300px"
      adElement.style.height = "250px"
    } else if (format === "banner") {
      adElement.setAttribute("data-ad-format", "banner")
      adElement.style.width = "728px"
      adElement.style.height = "90px"
    }

    // Add to container
    container.appendChild(adElement)

    // Push to adsbygoogle
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
        trackAdEvent("ad_unit_created", format, 0)
      }
    } catch (error) {
      console.error("Failed to create ad unit:", error)
    }
  }

  // Refresh ads (for SPA navigation)
  refreshAds(): void {
    if (!this.isInitialized) return

    try {
      // Clear existing ads
      const existingAds = document.querySelectorAll(".adsbygoogle")
      existingAds.forEach((ad) => {
        if (ad.getAttribute("data-adsbygoogle-status") === "done") {
          ad.removeAttribute("data-adsbygoogle-status")
        }
      })

      // Reinitialize
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }

      trackAdEvent("ads_refreshed", "auto_ads")
    } catch (error) {
      console.error("Failed to refresh ads:", error)
    }
  }
}

// Global adsbygoogle declaration
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

// Export singleton instance
export const adSenseAutoAds = AdSenseAutoAds.getInstance()
