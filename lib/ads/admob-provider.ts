import {
  AdMob,
  type BannerAdOptions,
  type BannerAdSize,
  type BannerAdPosition,
  type InterstitialAdOptions,
  type RewardAdOptions,
} from "@capacitor-community/admob"

export interface AdMobConfig {
  appId: string
  enabled: boolean
  testMode: boolean
  testDeviceIds?: string[]
}

export interface AdMobBannerOptions {
  adId: string
  size: BannerAdSize
  position: BannerAdPosition
  margin?: number
}

export interface AdMobInterstitialOptions {
  adId: string
}

export interface AdMobRewardOptions {
  adId: string
}

export class AdMobProvider {
  private config: AdMobConfig
  private isInitialized = false

  constructor(config: AdMobConfig) {
    this.config = config
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: this.config.testDeviceIds || [],
        initializeForTesting: this.config.testMode,
      })

      this.isInitialized = true
      console.log("AdMob initialized successfully")
    } catch (error) {
      console.error("AdMob initialization failed:", error)
      throw error
    }
  }

  public async showBanner(options: AdMobBannerOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const bannerOptions: BannerAdOptions = {
      adId: this.config.testMode ? "ca-app-pub-3940256099942544/6300978111" : options.adId,
      adSize: options.size,
      position: options.position,
      margin: options.margin || 0,
      isTesting: this.config.testMode,
    }

    try {
      await AdMob.showBanner(bannerOptions)
    } catch (error) {
      console.error("AdMob banner error:", error)
      throw error
    }
  }

  public async hideBanner(): Promise<void> {
    try {
      await AdMob.hideBanner()
    } catch (error) {
      console.error("AdMob hide banner error:", error)
    }
  }

  public async showInterstitial(options: AdMobInterstitialOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const interstitialOptions: InterstitialAdOptions = {
      adId: this.config.testMode ? "ca-app-pub-3940256099942544/1033173712" : options.adId,
      isTesting: this.config.testMode,
    }

    try {
      await AdMob.prepareInterstitial(interstitialOptions)
      await AdMob.showInterstitial()
    } catch (error) {
      console.error("AdMob interstitial error:", error)
      throw error
    }
  }

  public async showRewardVideo(options: AdMobRewardOptions): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const rewardOptions: RewardAdOptions = {
      adId: this.config.testMode ? "ca-app-pub-3940256099942544/5224354917" : options.adId,
      isTesting: this.config.testMode,
    }

    try {
      await AdMob.prepareRewardVideoAd(rewardOptions)
      await AdMob.showRewardVideoAd()
    } catch (error) {
      console.error("AdMob reward video error:", error)
      throw error
    }
  }

  public isEnabled(): boolean {
    return this.config.enabled
  }
}
