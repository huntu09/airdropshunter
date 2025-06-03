export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator && window.workbox !== undefined) {
    const wb = window.workbox

    // Add event listeners to handle updates
    wb.addEventListener("installed", (event: any) => {
      console.log(`Service Worker installed: ${event.type}`)
      if (event.isUpdate) {
        // Show a notification to the user that an update is available
        if (confirm("New content is available! Click OK to refresh.")) {
          window.location.reload()
        }
      }
    })

    wb.addEventListener("controlling", () => {
      window.location.reload()
    })

    wb.addEventListener("activated", (event: any) => {
      console.log(`Service Worker activated: ${event.type}`)
    })

    // Register the service worker
    wb.register()
  }
}

// Function to check if app can be installed (PWA)
export function checkPwaInstallable(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false)
      return
    }

    // Check if the app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      resolve(false)
      return
    }

    // Check if installation is possible
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      // Store the event for later use
      ;(window as any).deferredPrompt = e
      resolve(true)
    })

    // If no install prompt within 3 seconds, assume not installable
    setTimeout(() => {
      if (!(window as any).deferredPrompt) {
        resolve(false)
      }
    }, 3000)
  })
}

// Function to prompt user to install the PWA
export function promptPwaInstall(): Promise<boolean> {
  return new Promise((resolve) => {
    const deferredPrompt = (window as any).deferredPrompt

    if (!deferredPrompt) {
      resolve(false)
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
        resolve(true)
      } else {
        console.log("User dismissed the install prompt")
        resolve(false)
      }
      // Clear the deferred prompt
      ;(window as any).deferredPrompt = null
    })
  })
}

// Add PWA types
declare global {
  interface Window {
    workbox: any
    deferredPrompt: any
  }
}
