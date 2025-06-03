export interface PlatformInfo {
  isWeb: boolean
  isNativeApp: boolean
  isIOS: boolean
  isAndroid: boolean
  isPWA: boolean
  isWebView: boolean
  platform: "web" | "ios" | "android" | "unknown"
}

// Build-time platform detection
export const BUILD_TARGET = process.env.BUILD_TARGET || "web"
export const IS_MOBILE_BUILD = BUILD_TARGET === "mobile"
export const IS_WEB_BUILD = BUILD_TARGET === "web"

export interface BuildConfig {
  target: "web" | "mobile"
  isStatic: boolean
  hasServerFeatures: boolean
  hasApiRoutes: boolean
  supportsSSR: boolean
}

export const getBuildConfig = (): BuildConfig => {
  return {
    target: IS_MOBILE_BUILD ? "mobile" : "web",
    isStatic: IS_MOBILE_BUILD,
    hasServerFeatures: IS_WEB_BUILD,
    hasApiRoutes: IS_WEB_BUILD,
    supportsSSR: IS_WEB_BUILD,
  }
}

export class PlatformDetector {
  private static instance: PlatformDetector
  private platformInfo: PlatformInfo

  private constructor() {
    this.platformInfo = this.detectPlatform()
  }

  public static getInstance(): PlatformDetector {
    if (!PlatformDetector.instance) {
      PlatformDetector.instance = new PlatformDetector()
    }
    return PlatformDetector.instance
  }

  private detectPlatform(): PlatformInfo {
    // Server-side safe detection
    if (typeof window === "undefined") {
      // Server-side defaults
      return {
        isWeb: true,
        isNativeApp: false,
        isIOS: false,
        isAndroid: false,
        isPWA: false,
        isWebView: false,
        platform: "web",
      }
    }

    // Client-side detection
    try {
      // Check if Capacitor is available
      let isNativeApp = false
      let capacitorPlatform = "web"

      try {
        // Dynamic import to avoid server-side issues
        if (typeof window !== "undefined" && (window as any).Capacitor) {
          const Capacitor = (window as any).Capacitor
          isNativeApp = Capacitor.isNativePlatform()
          capacitorPlatform = Capacitor.getPlatform()
        }
      } catch (capacitorError) {
        // Capacitor not available, continue with web detection
      }

      // Check for WebView indicators
      const userAgent = navigator.userAgent
      const isWebView =
        /wv|WebView/i.test(userAgent) ||
        !!(window as any).ReactNativeWebView ||
        !!(window as any).webkit?.messageHandlers

      // Check for PWA
      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

      // Determine platform
      let platform: "web" | "ios" | "android" | "unknown" = "web"
      if (isNativeApp) {
        if (capacitorPlatform === "ios") platform = "ios"
        else if (capacitorPlatform === "android") platform = "android"
      }

      return {
        isWeb: !isNativeApp && !isWebView,
        isNativeApp,
        isIOS: capacitorPlatform === "ios" || /iPad|iPhone|iPod/.test(userAgent),
        isAndroid: capacitorPlatform === "android" || /Android/.test(userAgent),
        isPWA,
        isWebView,
        platform,
      }
    } catch (error) {
      console.warn("Platform detection error:", error)

      // Fallback to web
      return {
        isWeb: true,
        isNativeApp: false,
        isIOS: false,
        isAndroid: false,
        isPWA: false,
        isWebView: false,
        platform: "web",
      }
    }
  }

  public getPlatformInfo(): PlatformInfo {
    return this.platformInfo
  }

  public isWeb(): boolean {
    return this.platformInfo.isWeb
  }

  public isNativeApp(): boolean {
    return this.platformInfo.isNativeApp
  }

  public shouldUseAdSense(): boolean {
    // Use AdSense only for pure web (not in WebView or native app)
    return this.platformInfo.isWeb && !this.platformInfo.isWebView
  }

  public shouldUseAdMob(): boolean {
    // Use AdMob only for native apps
    return this.platformInfo.isNativeApp
  }
}

// Safe instance creation with lazy initialization
let platformDetectorInstance: PlatformDetector | null = null

export const getPlatformDetector = (): PlatformDetector => {
  if (!platformDetectorInstance) {
    platformDetectorInstance = PlatformDetector.getInstance()
  }
  return platformDetectorInstance
}

// Export for backward compatibility
export const platformDetector = typeof window !== "undefined" ? PlatformDetector.getInstance() : null
