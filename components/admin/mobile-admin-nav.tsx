"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Rocket, Users, BarChart2, Settings, Bell, CheckSquare, FileText, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function MobileAdminNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard, badge: null },
    { name: "Airdrops", href: "/admin-dashboard/airdrops", icon: Rocket, badge: null },
    { name: "Verification", href: "/admin-dashboard/verification", icon: CheckSquare, badge: "3" },
    { name: "Users", href: "/admin-dashboard/users", icon: Users, badge: null },
    { name: "Analytics", href: "/admin-dashboard/analytics", icon: BarChart2, badge: null },
    { name: "Notifications", href: "/admin-dashboard/notifications", icon: Bell, badge: "2" },
    { name: "Reports", href: "/admin-dashboard/reports", icon: FileText, badge: null },
    { name: "Settings", href: "/admin-dashboard/settings", icon: Settings, badge: null },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg md:hidden">
        <div className="grid grid-cols-5">
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 relative ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}

          {/* More Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center justify-center py-2 h-auto">
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh]">
              <div className="grid grid-cols-2 gap-4 mt-6">
                {navigation.slice(4).map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 p-4 rounded-lg border ${
                        isActive
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-6 w-6" />
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden" />
    </>
  )
}
