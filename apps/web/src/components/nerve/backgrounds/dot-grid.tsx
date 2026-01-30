"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DotGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the grid cells in pixels
   */
  gridSize?: number
  /**
   * Size of the dots in pixels
   */
  dotSize?: number
  /**
   * Opacity of the dots (0-1)
   */
  opacity?: number
  /**
   * Whether to cover the full area or just provide the pattern
   */
  overlay?: boolean
}

/**
 * Dot grid background pattern.
 * Adds a subtle reference grid, perfect for workspace/canvas areas.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <DotGrid opacity={0.03} />
 *   <YourContent />
 * </div>
 * ```
 */
export const DotGrid = React.forwardRef<HTMLDivElement, DotGridProps>(
  (
    {
      gridSize = 24,
      dotSize = 1,
      opacity = 0.03,
      overlay = true,
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          overlay && "absolute inset-0 pointer-events-none",
          className
        )}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,${opacity}) ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

DotGrid.displayName = "DotGrid"
