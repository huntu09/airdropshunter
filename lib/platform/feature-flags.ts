import { getBuildConfig } from "./build-detector"
import { platformDetector } from "../ads/platform-detector"

/**
 * Feature flags based on build target and runtime platform
 */

const buildConfig = getBuildConfig()

export const features = {
  // Server-side features (only available in web builds)
  serverSideRendering: buildConfig.hasServerFeatures,
  apiRoutes: buildConfig.hasApiRoutes,
  imageOptimization: buildConfig.target === "web",

  // Client-side features (available in both)
  authentication: true,
  supabaseIntegration: true,
  realTimeUpdates: true,

  // Platform-specific features
  webPushNotifications: buildConfig.target === "web",
  nativePushNotifications: buildConfig.target === "mobile",

  // Ad features (runtime detection)
  get adSense() {
    return platformDetector.shouldUseAdSense()
  },

  get adMob() {
    return platformDetector.shouldUseAdMob()
  },

  // PWA features
  serviceWorker: true,
  offlineSupport: true,
  installPrompt: buildConfig.target === "web",
}

export const getFeatureFlag = (feature: keyof typeof features): boolean => {
  return features[feature] as boolean
}
