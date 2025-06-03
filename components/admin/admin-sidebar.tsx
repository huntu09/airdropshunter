"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Rocket,
  Users,
  BarChart2,
  Bell,
  FileText,
  Settings,
  X,
  LogOut,
  RocketIcon,
  CheckSquare,
  Search,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { NavItem } from "@/components/ui/nav-item"

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const { signOut, profile } = useAuth()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin-dashboard",
      icon: LayoutDashboard,
      description: "Overview and analytics",
    },
    {
      name: "Airdrops",
      href: "/admin-dashboard/airdrops",
      icon: Rocket,
      description: "Manage airdrops",
    },
    {
      name: "Verification",
      href: "/admin-dashboard/verification",
      icon: CheckSquare,
      description: "Verify submissions",
    },
    {
      name: "Users",
      href: "/admin-dashboard/users",
      icon: Users,
      description: "User management",
    },
    {
      name: "Analytics",
      href: "/admin-dashboard/analytics",
      icon: BarChart2,
      description: "Performance metrics",
    },
    {
      name: "SEO Management",
      href: "/admin-dashboard/seo",
      icon: Search,
      description: "Search engine optimization",
    },
    {
      name: "Notifications",
      href: "/admin-dashboard/notifications",
      icon: Bell,
      description: "System notifications",
    },
    {
      name: "Reports",
      href: "/admin-dashboard/reports",
      icon: FileText,
      description: "Generate reports",
    },
    {
      name: "Settings",
      href: "/admin-dashboard/settings",
      icon: Settings,
      description: "System settings",
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <Link href="/admin-dashboard" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-2">
              <RocketIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800 dark:text-white">Admin</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Dashboard</span>
            </div>
          </Link>
          <button
            className="p-1 rounded-md md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.name}
                description={item.description}
                isCollapsed={false}
              />
            ))}
          </div>
        </div>

        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {profile?.email?.[0]?.toUpperCase() || "A"}
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {profile?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile?.email || "admin@example.com"}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
