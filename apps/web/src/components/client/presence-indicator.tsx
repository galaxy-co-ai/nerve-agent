"use client"

import { usePresence } from "@/hooks/use-presence"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// =============================================================================
// Presence Indicator - Shows dev status in client portal
// =============================================================================

interface PresenceIndicatorProps {
  userId: string
  size?: "sm" | "md" | "lg"
  showDetails?: boolean
  className?: string
}

export function PresenceIndicator({
  userId,
  size = "md",
  showDetails = true,
  className,
}: PresenceIndicatorProps) {
  const { presence, isLoading } = usePresence(userId)

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-3 animate-pulse", className)}>
        <div
          className={cn(
            "rounded-full bg-muted",
            size === "sm" && "h-8 w-8",
            size === "md" && "h-10 w-10",
            size === "lg" && "h-12 w-12"
          )}
        />
        {showDetails && (
          <div className="space-y-1">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
        )}
      </div>
    )
  }

  if (!presence) {
    return null
  }

  const statusColors: Record<string, string> = {
    ONLINE: "bg-green-500",
    AWAY: "bg-yellow-500",
    OFFLINE: "bg-gray-400",
    DEEP_WORK: "bg-purple-500",
    IN_MEETING: "bg-blue-500",
    AFTER_HOURS: "bg-gray-300",
    CUSTOM: "bg-indigo-500",
  }

  const sizeClasses = {
    sm: {
      avatar: "h-8 w-8",
      dot: "h-2.5 w-2.5 right-0 bottom-0",
      text: "text-sm",
      subtext: "text-xs",
    },
    md: {
      avatar: "h-10 w-10",
      dot: "h-3 w-3 right-0 bottom-0",
      text: "text-base",
      subtext: "text-sm",
    },
    lg: {
      avatar: "h-12 w-12",
      dot: "h-3.5 w-3.5 right-0 bottom-0",
      text: "text-lg",
      subtext: "text-sm",
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Avatar className={classes.avatar}>
          <AvatarImage src={presence.avatarUrl || undefined} />
          <AvatarFallback>
            {presence.userName?.charAt(0)?.toUpperCase() || "D"}
          </AvatarFallback>
        </Avatar>
        {/* Status dot */}
        <span
          className={cn(
            "absolute block rounded-full ring-2 ring-background",
            classes.dot,
            statusColors[presence.status] || "bg-gray-400"
          )}
        />
      </div>

      {showDetails && (
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium truncate", classes.text)}>
            {presence.userName || "Developer"}
          </p>
          <p className={cn("text-muted-foreground truncate", classes.subtext)}>
            {presence.message}
          </p>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Compact Status Badge - Just the status without avatar
// =============================================================================

interface StatusBadgeProps {
  userId: string
  className?: string
}

export function StatusBadge({ userId, className }: StatusBadgeProps) {
  const { presence, isLoading } = usePresence(userId)

  if (isLoading || !presence) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        presence.status === "ONLINE" && "bg-green-100 text-green-700",
        presence.status === "AWAY" && "bg-yellow-100 text-yellow-700",
        presence.status === "OFFLINE" && "bg-gray-100 text-gray-600",
        presence.status === "DEEP_WORK" && "bg-purple-100 text-purple-700",
        presence.status === "IN_MEETING" && "bg-blue-100 text-blue-700",
        presence.status === "AFTER_HOURS" && "bg-gray-100 text-gray-500",
        className
      )}
    >
      <span>{presence.display.emoji}</span>
      <span>{presence.display.label}</span>
    </span>
  )
}

// =============================================================================
// Dev Status Card - Full status display for client dashboard
// =============================================================================

interface DevStatusCardProps {
  userId: string
  className?: string
}

export function DevStatusCard({ userId, className }: DevStatusCardProps) {
  const { presence, isLoading } = usePresence(userId)

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-card p-4 animate-pulse",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!presence) {
    return (
      <div className={cn("rounded-lg border bg-card p-4", className)}>
        <p className="text-muted-foreground text-sm">
          Developer status unavailable
        </p>
      </div>
    )
  }

  // Calculate time since last activity
  const timeSinceActivity = formatTimeSince(presence.lastActivityAt)

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-start gap-4">
        <PresenceIndicator userId={userId} size="lg" showDetails={false} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{presence.userName || "Developer"}</h3>
            <StatusBadge userId={userId} />
          </div>

          <p className="text-muted-foreground text-sm mt-1">
            {presence.message}
          </p>

          <p className="text-xs text-muted-foreground mt-2">
            Last active: {timeSinceActivity}
          </p>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Utilities
// =============================================================================

function formatTimeSince(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
