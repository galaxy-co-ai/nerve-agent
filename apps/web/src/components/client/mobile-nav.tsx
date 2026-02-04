// =============================================================================
// Mobile Navigation - Bottom nav bar for client portal on mobile
// =============================================================================

"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  FolderKanban,
  Clock,
  MessageSquare,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

// =============================================================================
// Types
// =============================================================================

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  matchPaths?: string[]
}

// =============================================================================
// Nav Items
// =============================================================================

const NAV_ITEMS: NavItem[] = [
  {
    href: "/client",
    label: "Overview",
    icon: Home,
    matchPaths: ["/client", "/client/overview"],
  },
  {
    href: "/client/projects",
    label: "Projects",
    icon: FolderKanban,
    matchPaths: ["/client/projects"],
  },
  {
    href: "/client/time",
    label: "Time",
    icon: Clock,
    matchPaths: ["/client/time"],
  },
  {
    href: "/client/feedback",
    label: "Feedback",
    icon: MessageSquare,
    matchPaths: ["/client/feedback"],
  },
  {
    href: "/client/menu",
    label: "More",
    icon: Menu,
    matchPaths: ["/client/menu", "/client/settings"],
  },
]

// =============================================================================
// Mobile Bottom Nav
// =============================================================================

export function MobileBottomNav({ className }: { className?: string }) {
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((p) => pathname.startsWith(p))
    }
    return pathname === item.href
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden",
        className
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5 relative z-10", active && "text-primary")} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}

// =============================================================================
// Mobile Header
// =============================================================================

interface MobileHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  action?: React.ReactNode
  className?: string
}

export function MobileHeader({
  title,
  subtitle,
  backHref,
  action,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden",
        className
      )}
    >
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-top)]" />

      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
          )}
          <div>
            <h1 className="text-lg font-semibold leading-none">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}

// =============================================================================
// Mobile Page Wrapper
// =============================================================================

interface MobilePageWrapperProps {
  children: React.ReactNode
  header?: React.ReactNode
  showBottomNav?: boolean
  className?: string
}

export function MobilePageWrapper({
  children,
  header,
  showBottomNav = true,
  className,
}: MobilePageWrapperProps) {
  return (
    <div className="min-h-screen md:min-h-0">
      {header}
      <main
        className={cn(
          "pb-20 md:pb-0", // Bottom padding for mobile nav
          className
        )}
      >
        {children}
      </main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  )
}

// =============================================================================
// Pull to Refresh (Optional)
// =============================================================================

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const startY = React.useRef(0)

  const threshold = 80

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshing || containerRef.current?.scrollTop !== 0) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true)
      await onRefresh()
      setRefreshing(false)
    }
    setPullDistance(0)
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
        style={{ top: -40 }}
        animate={{ y: pullDistance, opacity: pullDistance / threshold }}
      >
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: refreshing ? 360 : pullDistance * 3 }}
          transition={refreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : undefined}
        />
      </motion.div>

      {/* Content */}
      <motion.div animate={{ y: refreshing ? 40 : 0 }}>
        {children}
      </motion.div>
    </div>
  )
}

// =============================================================================
// Responsive Container (hides on desktop, shows on mobile or vice versa)
// =============================================================================

export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <div className="md:hidden">{children}</div>
}

export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <div className="hidden md:block">{children}</div>
}
