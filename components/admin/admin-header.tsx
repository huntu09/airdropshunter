"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Tambahkan import NotificationCenter
import NotificationCenter from "./notification-center"

interface AdminHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function AdminHeader({ sidebarOpen, setSidebarOpen }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  // Generate breadcrumb from pathname
  const generateBreadcrumb = () => {
    const paths = pathname.split("/").filter(Boolean)

    return (
      <div className="flex items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Admin</span>
        {paths.slice(1).map((path, index) => {
          // Format the path (capitalize first letter, replace hyphens with spaces)
          const formattedPath = path.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

          return (
            <span key={path}>
              <span className="mx-2 text-gray-400">/</span>
              <span
                className={
                  index === paths.slice(1).length - 1
                    ? "text-gray-800 dark:text-white font-medium"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                {formattedPath}
              </span>
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
      <div className="px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:block">{generateBreadcrumb()}</div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>

            {/* Notifications */}
            <NotificationCenter />
          </div>
        </div>
      </div>
    </header>
  )
}
