"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavItemProps {
  href: string
  icon: LucideIcon
  title: string
  description?: string
  isCollapsed?: boolean
  className?: string
}

export function NavItem({ href, icon: Icon, title, description, isCollapsed = false, className }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  const content = (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 h-10",
        isActive && "bg-muted font-medium",
        isCollapsed && "h-9 w-9 p-0 justify-center",
        className,
      )}
      asChild
    >
      <Link href={href}>
        <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
        {!isCollapsed && <span className="truncate">{title}</span>}
      </Link>
    </Button>
  )

  if (isCollapsed && description) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            <div>
              <div className="font-medium">{title}</div>
              {description && <div className="text-xs text-muted-foreground">{description}</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}
