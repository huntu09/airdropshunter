import { ADS_CONFIG, APP_CONFIG } from "@/lib/config/environment"
import type { AdManagerConfig } from "./ad-manager"

export const adConfig: AdManagerConfig = {
  adsense: {
    clientId: ADS_CONFIG.ADSENSE.CLIENT_ID,
    enabled: ADS_CONFIG.ADSENSE.ENABLED,
    testMode: APP_CONFIG.NODE_ENV === "development",
  },
  admob: {
    appId: ADS_CONFIG.ADMOB.APP_ID,
    enabled: ADS_CONFIG.ADMOB.ENABLED,
    testMode: APP_CONFIG.NODE_ENV === "development",
    testDeviceIds: ADS_CONFIG.ADMOB.TEST_DEVICES,
  },
}

// Ad slot configurations using centralized config
export const adSlots = {
  web: {
    banner: {
      slotId: ADS_CONFIG.ADSENSE.SLOTS.BANNER,
      format: "auto" as const,
      responsive: true,
    },
    sidebar: {
      slotId: ADS_CONFIG.ADSENSE.SLOTS.SIDEBAR,
      format: "rectangle" as const,
      responsive: true,
      size: [300, 250] as [number, number],
    },
    article: {
      slotId: ADS_CONFIG.ADSENSE.SLOTS.ARTICLE,
      format: "auto" as const,
      responsive: true,
    },
  },
  mobile: {
    banner: {
      adId: ADS_CONFIG.ADMOB.AD_UNITS.BANNER,
      size: "BANNER" as const,
      position: "BOTTOM_CENTER" as const,
    },
    interstitial: {
      adId: ADS_CONFIG.ADMOB.AD_UNITS.INTERSTITIAL,
    },
    reward: {
      adId: ADS_CONFIG.ADMOB.AD_UNITS.REWARD,
    },
  },
}
