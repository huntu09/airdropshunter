"use client"

import { Home, Search, Trophy, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

const navItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "search", label: "Explore", icon: Search, href: "/search" },
  { id: "submit", label: "Submit", icon: Plus, href: "/submit" },
  { id: "rewards", label: "Rewards", icon: Trophy, href: "/rewards" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  // Hide on admin, login, and register pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
    >
      <div className="glass-card border-t border-white/10 shadow-2xl">
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 min-w-[60px] group touch-target",
                    isActive ? "text-blue-400" : "text-gray-400 hover:text-gray-300",
                  )}
                >
                  {/* Active Background */}
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative z-10">
                    <item.icon
                      className={cn(
                        "h-6 w-6 mb-1 transition-all duration-300",
                        isActive ? "text-blue-400 drop-shadow-lg" : "text-gray-400 group-hover:text-gray-300",
                      )}
                    />
                  </motion.div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-xs font-medium transition-all duration-300 relative z-10",
                      isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-300",
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active Dot */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
