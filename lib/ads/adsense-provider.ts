export interface AdSenseConfig {
  clientId: string
  enabled: boolean
  testMode: boolean
}

export interface AdSenseSlot {
  slotId: string
  format: "auto" | "rectangle" | "banner" | "leaderboard" | "skyscraper"
  responsive: boolean
  size?: [number, number]
}

export class AdSenseProvider {
  private config: AdSenseConfig
  private isLoaded = false
  private loadPromise: Promise<void> | null = null

  constructor(config: AdSenseConfig) {
    this.config = config
  }

  public async initialize(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise
    }

    this.loadPromise = this.loadAdSenseScript()
    return this.loadPromise
  }

  private async loadAdSenseScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (this.isLoaded || document.querySelector('script[src*="adsbygoogle"]')) {
        this.isLoaded = true
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.config.clientId}`
      script.async = true
      script.crossOrigin = "anonymous"
      script.dataset.adClient = this.config.clientId

      script.onload = () => {
        this.isLoaded = true
        resolve()
      }

      script.onerror = () => {
        reject(new Error("Failed to load AdSense script"))
      }

      document.head.appendChild(script)
    })
  }

  public async displayAd(slot: AdSenseSlot, element: HTMLElement): Promise<void> {
    if (!this.isLoaded) {
      await this.initialize()
    }

    try {
      // Create ad element
      const adElement = document.createElement("ins")
      adElement.className = "adsbygoogle"
      adElement.style.display = "block"
      adElement.dataset.adClient = this.config.clientId
      adElement.dataset.adSlot = slot.slotId

      if (slot.format === "auto") {
        adElement.dataset.adFormat = "auto"
        adElement.dataset.fullWidthResponsive = "true"
      } else {
        if (slot.size) {
          adElement.style.width = `${slot.size[0]}px`
          adElement.style.height = `${slot.size[1]}px`
        }
      }

      // Clear existing content and append ad
      element.innerHTML = ""
      element.appendChild(adElement)

      // Push ad to AdSense
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (error) {
      console.error("AdSense display error:", error)
      throw error
    }
  }

  public isEnabled(): boolean {
    return this.config.enabled && !this.config.testMode
  }
}
