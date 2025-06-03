"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Rocket, Menu, X, User, LogOut, Settings, Bell, Search } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, profile, signOut, isLoading } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setShowUserMenu(false)
  }, [pathname])

  // Don't show navbar on admin pages
  if (pathname.startsWith("/admin-dashboard")) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/search" },
    { name: "Categories", href: "/categories" },
    { name: "Rewards", href: "/rewards" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card border-b border-white/10 shadow-2xl" : "bg-transparent"
      }`}
    >
      <div className="container-modern">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-3 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                  <Rocket className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  AIRDROPS
                </span>
                <span className="text-xs font-bold text-gray-400 tracking-widest group-hover:text-blue-400 transition-colors">
                  HUNTER
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    pathname === item.href
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth & Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/search">
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass-card border-white/10 text-gray-300 hover:text-white hover:bg-white/10 w-10 h-10 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 glass-card border-white/10 px-3 py-2 text-white hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg">
                      {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-sm font-medium">{profile?.username || "User"}</div>
                    {profile?.role === "admin" && <div className="text-xs text-purple-400">Admin</div>}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 glass-card border border-white/10 rounded-2xl shadow-2xl py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{profile?.username || "User"}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        {profile?.role === "admin" && (
                          <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                            Administrator
                          </Badge>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile Settings
                        </Link>

                        <Link
                          href="/rewards"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Bell className="h-4 w-4 mr-3" />
                          Notifications
                        </Link>

                        {profile?.role === "admin" && (
                          <Link
                            href="/admin-dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/login">
                    <Button variant="ghost" className="glass-card border-white/10 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register">
                    <Button className="btn-gradient shadow-lg hover:shadow-xl">Get Started</Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="glass-card border-white/10 p-2 text-gray-300 hover:text-white focus:outline-none"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="glass-card border border-white/10 rounded-2xl mt-4 p-4">
                <div className="space-y-2">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                          pathname === item.href
                            ? "text-blue-400 bg-blue-500/10 border border-blue-500/30"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Auth */}
                <div className="border-t border-white/10 pt-4 mt-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                          {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{profile?.username || "User"}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        Profile Settings
                      </Link>

                      {profile?.role === "admin" && (
                        <Link
                          href="/admin-dashboard"
                          className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link href="/login" className="block">
                        <Button
                          variant="ghost"
                          className="w-full glass-card border-white/10 text-white hover:bg-white/10"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" className="block">
                        <Button className="w-full btn-gradient">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </motion.nav>
  )
}
