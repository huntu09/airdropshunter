import { Capacitor } from "@capacitor/core"

export interface PlatformInfo {
  isWeb: boolean
  isNativeApp: boolean
  isIOS: boolean
  isAndroid: boolean
  isPWA: boolean
  isWebView: boolean
  platform: "web" | "ios" | "android" | "unknown"
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
    // Check if running in Capacitor (native app)
    const isNativeApp = Capacitor.isNativePlatform()
    const capacitorPlatform = Capacitor.getPlatform()

    // Check for WebView indicators
    const userAgent = typeof window !== "undefined" ? navigator.userAgent : ""
    const isWebView =
      /wv|WebView/i.test(userAgent) || !!(window as any).ReactNativeWebView || !!(window as any).webkit?.messageHandlers

    // Check for PWA
    const isPWA =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true)

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

export const platformDetector = PlatformDetector.getInstance()
