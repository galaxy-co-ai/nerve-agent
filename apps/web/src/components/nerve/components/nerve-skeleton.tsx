"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface NerveSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant for common shapes
   */
  variant?: "text" | "circular" | "rectangular"
  /**
   * Width (for text and rectangular)
   */
  width?: string | number
  /**
   * Height
   */
  height?: string | number
}

/**
 * Loading skeleton with shimmer animation.
 *
 * @example
 * ```tsx
 * <NerveSkeleton className="h-4 w-[250px]" />
 * <NerveSkeleton variant="circular" width={40} height={40} />
 * <NerveSkeleton variant="text" width="80%" />
 * ```
 */
export const NerveSkeleton = React.forwardRef<HTMLDivElement, NerveSkeletonProps>(
  ({ className, variant = "rectangular", width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base animation
          "animate-pulse",
          // Surface
          "bg-zinc-800",
          // Shimmer overlay
          "relative overflow-hidden",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-transparent before:via-zinc-700/30 before:to-transparent",
          "before:animate-shimmer",
          // Variants
          variant === "circular" && "rounded-full",
          variant === "text" && "rounded h-4",
          variant === "rectangular" && "rounded-md",
          className
        )}
        style={{
          width: width,
          height: height,
          ...style,
        }}
        {...props}
      />
    )
  }
)

NerveSkeleton.displayName = "NerveSkeleton"

/**
 * Pre-composed skeleton for card loading states
 */
export function NerveSkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <NerveSkeleton className="h-32 w-full" />
      <div className="space-y-2">
        <NerveSkeleton className="h-4 w-3/4" />
        <NerveSkeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

/**
 * Pre-composed skeleton for list item loading states
 */
export function NerveSkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <NerveSkeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <NerveSkeleton className="h-4 w-1/3" />
        <NerveSkeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
