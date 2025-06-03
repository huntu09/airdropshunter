"use client"

import { useAppStore as useZustandAppStore } from "@/lib/store/app-store"
import { useEffect } from "react"

// Hook wrapper untuk app store dengan additional functionality
export function useAppStore() {
  const store = useZustandAppStore()

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (!store.theme) {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        store.setTheme(savedTheme as "light" | "dark" | "system")
      } else {
        // Check system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        store.setTheme(prefersDark ? "dark" : "light")
      }
    }
  }, [store])

  return store
}
