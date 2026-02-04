// =============================================================================
// Client Portal Skeletons - Loading states for all client components
// =============================================================================

"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// =============================================================================
// Project Card Skeleton
// =============================================================================

export function ProjectCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Milestone Card Skeleton
// =============================================================================

export function MilestoneCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-4 p-4 rounded-lg border", className)}>
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  )
}

// =============================================================================
// Activity Feed Skeleton
// =============================================================================

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityItemSkeleton key={i} />
      ))}
    </div>
  )
}

// =============================================================================
// Time Entry Skeleton
// =============================================================================

export function TimeEntrySkeleton() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

export function TimeEntryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <TimeEntrySkeleton key={i} />
      ))}
    </div>
  )
}

// =============================================================================
// Comment Skeleton
// =============================================================================

export function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function CommentThreadSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  )
}

// =============================================================================
// Presence Card Skeleton
// =============================================================================

export function PresenceCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full" />
        </div>
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </Card>
  )
}

// =============================================================================
// Stats Card Skeleton
// =============================================================================

export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  )
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

// =============================================================================
// Dashboard Skeleton (Full Page)
// =============================================================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Stats Grid */}
      <StatsGridSkeleton />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
          <div className="space-y-4">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Card className="p-4">
            <ActivityFeedSkeleton count={5} />
          </Card>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Client Portal Skeleton (Full Page)
// =============================================================================

export function ClientPortalSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header with presence */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <PresenceCardSkeleton className="w-64" />
      </div>

      {/* Stats */}
      <StatsGridSkeleton count={4} />

      {/* Milestones */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          <MilestoneCardSkeleton />
          <MilestoneCardSkeleton />
          <MilestoneCardSkeleton />
        </div>
      </div>

      {/* Time & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <TimeEntryListSkeleton count={4} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <ActivityFeedSkeleton count={4} />
          </div>
        </Card>
      </div>
    </div>
  )
}

// =============================================================================
// Table Skeleton
// =============================================================================

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-md border", className)}>
      {/* Header */}
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Form Skeleton
// =============================================================================

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  )
}
