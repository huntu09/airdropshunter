import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.airdropshunter.app",
  appName: "Airdrops Hunter",
  webDir: "dist-mobile",
  bundledWebRuntime: false,

  server: {
    androidScheme: "https",
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },

    StatusBar: {
      style: "dark",
      backgroundColor: "#1a1a1a",
    },

    AdMob: {
      appId: {
        android: process.env.NEXT_PUBLIC_ADMOB_APP_ID || "ca-app-pub-3940256099942544~3347511713", // Test ID
        ios:
          process.env.NEXT_PUBLIC_ADMOB_APP_ID_IOS ||
          process.env.NEXT_PUBLIC_ADMOB_APP_ID ||
          "ca-app-pub-3940256099942544~1458002511", // Test ID
      },
      testingDevices: ["YOUR_DEVICE_ID_HERE"], // Add your device ID for testing
    },

    CapacitorHttp: {
      enabled: true,
    },

    App: {
      launchUrl: "https://airdropshunter.com",
    },
  },

  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },

  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
  },
}

export default config
