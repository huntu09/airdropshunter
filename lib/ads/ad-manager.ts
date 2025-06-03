import { platformDetector } from "./platform-detector"
import { AdSenseProvider, type AdSenseConfig, type AdSenseSlot } from "./adsense-provider"
import {
  AdMobProvider,
  type AdMobConfig,
  type AdMobBannerOptions,
  type AdMobInterstitialOptions,
  type AdMobRewardOptions,
} from "./admob-provider"

export interface AdManagerConfig {
  adsense: AdSenseConfig
  admob: AdMobConfig
}

export class AdManager {
  private static instance: AdManager
  private adsenseProvider: AdSenseProvider | null = null
  private admobProvider: AdMobProvider | null = null
  private config: AdManagerConfig

  private constructor(config: AdManagerConfig) {
    this.config = config
    this.initializeProviders()
  }

  public static getInstance(config?: AdManagerConfig): AdManager {
    if (!AdManager.instance && config) {
      AdManager.instance = new AdManager(config)
    }
    return AdManager.instance
  }

  private initializeProviders(): void {
    if (platformDetector.shouldUseAdSense()) {
      this.adsenseProvider = new AdSenseProvider(this.config.adsense)
      console.log("Initialized AdSense provider for web platform")
    }

    if (platformDetector.shouldUseAdMob()) {
      this.admobProvider = new AdMobProvider(this.config.admob)
      console.log("Initialized AdMob provider for mobile platform")
    }
  }

  public async initialize(): Promise<void> {
    const promises: Promise<void>[] = []

    if (this.adsenseProvider) {
      promises.push(this.adsenseProvider.initialize())
    }

    if (this.admobProvider) {
      promises.push(this.admobProvider.initialize())
    }

    await Promise.all(promises)
  }

  // Banner Ads
  public async showBanner(options: {
    web?: { slot: AdSenseSlot; element: HTMLElement }
    mobile?: AdMobBannerOptions
  }): Promise<void> {
    if (platformDetector.shouldUseAdSense() && this.adsenseProvider && options.web) {
      await this.adsenseProvider.displayAd(options.web.slot, options.web.element)
    } else if (platformDetector.shouldUseAdMob() && this.admobProvider && options.mobile) {
      await this.admobProvider.showBanner(options.mobile)
    }
  }

  public async hideBanner(): Promise<void> {
    if (platformDetector.shouldUseAdMob() && this.admobProvider) {
      await this.admobProvider.hideBanner()
    }
  }

  // Interstitial Ads (Mobile only)
  public async showInterstitial(options: AdMobInterstitialOptions): Promise<void> {
    if (platformDetector.shouldUseAdMob() && this.admobProvider) {
      await this.admobProvider.showInterstitial(options)
    }
  }

  // Reward Video Ads (Mobile only)
  public async showRewardVideo(options: AdMobRewardOptions): Promise<void> {
    if (platformDetector.shouldUseAdMob() && this.admobProvider) {
      await this.admobProvider.showRewardVideo(options)
    }
  }

  // Utility methods
  public getPlatformInfo() {
    return platformDetector.getPlatformInfo()
  }

  public isAdSenseEnabled(): boolean {
    return !!this.adsenseProvider?.isEnabled()
  }

  public isAdMobEnabled(): boolean {
    return !!this.admobProvider?.isEnabled()
  }

  public getActiveProvider(): "adsense" | "admob" | "none" {
    if (this.adsenseProvider?.isEnabled()) return "adsense"
    if (this.admobProvider?.isEnabled()) return "admob"
    return "none"
  }
}
