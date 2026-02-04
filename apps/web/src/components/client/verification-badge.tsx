"use client"

import { CheckCircle, Clock, ExternalLink } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// =============================================================================
// Verification Badge - Shows blockchain verification status for time entries
// =============================================================================

interface VerificationBadgeProps {
  status: "unverified" | "hashed" | "anchored"
  txUrl?: string | null
  anchoredAt?: Date | null
  className?: string
  showLabel?: boolean
}

export function VerificationBadge({
  status,
  txUrl,
  anchoredAt,
  className,
  showLabel = false,
}: VerificationBadgeProps) {
  if (status === "unverified") {
    return null // Don't show anything for unverified entries
  }

  const isAnchored = status === "anchored"

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        isAnchored ? "text-green-600" : "text-yellow-600",
        className
      )}
    >
      {isAnchored ? (
        <CheckCircle className="h-3.5 w-3.5" />
      ) : (
        <Clock className="h-3.5 w-3.5" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isAnchored ? "Verified" : "Pending"}
        </span>
      )}
    </span>
  )

  // If anchored and has URL, make it clickable
  if (isAnchored && txUrl) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1 hover:underline",
                "text-green-600 hover:text-green-700",
                className
              )}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {showLabel && (
                <span className="text-xs font-medium">Verified</span>
              )}
              <ExternalLink className="h-3 w-3" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">
              Verified on Polygon
              {anchoredAt && (
                <>
                  <br />
                  {anchoredAt.toLocaleDateString()}
                </>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Otherwise just show the badge with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">
            {isAnchored
              ? "Blockchain verified"
              : "Will be verified in daily batch"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// =============================================================================
// Time Entry Row with Verification
// =============================================================================

interface VerifiedTimeEntryProps {
  startTime: Date
  endTime: Date | null
  durationMinutes: number
  description?: string | null
  projectName?: string
  verificationHash?: string | null
  anchoredAt?: Date | null
  anchorTxHash?: string | null
}

export function VerifiedTimeEntry({
  startTime,
  endTime,
  durationMinutes,
  description,
  projectName,
  verificationHash,
  anchoredAt,
  anchorTxHash,
}: VerifiedTimeEntryProps) {
  // Determine verification status
  const status: "unverified" | "hashed" | "anchored" = anchorTxHash
    ? "anchored"
    : verificationHash
      ? "hashed"
      : "unverified"

  const txUrl = anchorTxHash
    ? `https://polygonscan.com/tx/${anchorTxHash}`
    : null

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    if (hours === 0) return `${remainingMins}m`
    if (remainingMins === 0) return `${hours}h`
    return `${hours}h ${remainingMins}m`
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        <VerificationBadge
          status={status}
          txUrl={txUrl}
          anchoredAt={anchoredAt ? new Date(anchoredAt) : null}
        />
        <div>
          <p className="text-sm font-medium">
            {formatTime(startTime)} - {endTime ? formatTime(endTime) : "now"}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        {projectName && (
          <span className="text-muted-foreground">{projectName}</span>
        )}
        <span className="font-mono font-medium">
          {formatDuration(durationMinutes)}
        </span>
      </div>
    </div>
  )
}

// =============================================================================
// Daily Summary with Verification Stats
// =============================================================================

interface DailyVerificationSummaryProps {
  date: Date
  totalHours: number
  verifiedCount: number
  pendingCount: number
  unverifiedCount: number
  polygonscanUrl?: string | null
}

export function DailyVerificationSummary({
  date,
  totalHours,
  verifiedCount,
  pendingCount,
  unverifiedCount,
  polygonscanUrl,
}: DailyVerificationSummaryProps) {
  const totalEntries = verifiedCount + pendingCount + unverifiedCount
  const verifiedPercent =
    totalEntries > 0 ? Math.round((verifiedCount / totalEntries) * 100) : 0

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
      <div>
        <p className="font-medium">
          {date.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {totalHours.toFixed(1)} hrs total
        </p>
      </div>

      <div className="flex items-center gap-4">
        {polygonscanUrl ? (
          <a
            href={polygonscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 hover:underline"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{verifiedPercent}% verified</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : pendingCount > 0 ? (
          <span className="flex items-center gap-1.5 text-sm text-yellow-600">
            <Clock className="h-4 w-4" />
            <span>Pending verification</span>
          </span>
        ) : null}
      </div>
    </div>
  )
}
