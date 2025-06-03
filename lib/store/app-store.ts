import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AppState {
  theme: "light" | "dark" | "system"
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    title: string
    message: string
    timestamp: Date
    read: boolean
  }>
  searchHistory: string[]
  favoriteAirdrops: string[]
  recentlyViewed: string[]
}

interface AppActions {
  setTheme: (theme: "light" | "dark" | "system") => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<AppState["notifications"][0], "id" | "timestamp" | "read">) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  addToSearchHistory: (query: string) => void
  clearSearchHistory: () => void
  toggleFavoriteAirdrop: (airdropId: string) => void
  addToRecentlyViewed: (airdropId: string) => void
  clearRecentlyViewed: () => void
}

type AppStore = AppState & AppActions

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "system",
      sidebarOpen: false,
      notifications: [],
      searchHistory: [],
      favoriteAirdrops: [],
      recentlyViewed: [],

      // Actions
      setTheme: (theme) => {
        set({ theme })
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (sidebarOpen) => {
        set({ sidebarOpen })
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
        }))
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      addToSearchHistory: (query) => {
        if (!query.trim()) return

        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((item) => item !== query)].slice(0, 10), // Keep only last 10 searches
        }))
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] })
      },

      toggleFavoriteAirdrop: (airdropId) => {
        set((state) => ({
          favoriteAirdrops: state.favoriteAirdrops.includes(airdropId)
            ? state.favoriteAirdrops.filter((id) => id !== airdropId)
            : [...state.favoriteAirdrops, airdropId],
        }))
      },

      addToRecentlyViewed: (airdropId) => {
        set((state) => ({
          recentlyViewed: [airdropId, ...state.recentlyViewed.filter((id) => id !== airdropId)].slice(0, 20), // Keep only last 20 viewed
        }))
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] })
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        searchHistory: state.searchHistory,
        favoriteAirdrops: state.favoriteAirdrops,
        recentlyViewed: state.recentlyViewed,
      }),
    },
  ),
)
