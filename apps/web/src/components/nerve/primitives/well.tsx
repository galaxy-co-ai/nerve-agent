"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface WellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Depth of the recessed area
   * - shallow: Subtle recess
   * - medium: Standard well
   * - deep: Pronounced recess
   */
  depth?: "shallow" | "medium" | "deep"
  /**
   * Render as a different element
   */
  as?: React.ElementType
}

const depthStyles = {
  shallow: [
    "bg-black/10",
    "shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]",
  ],
  medium: [
    "bg-black/20",
    "shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(0,0,0,0.2)]",
  ],
  deep: [
    "bg-black/30",
    "shadow-[inset_0_3px_6px_rgba(0,0,0,0.4),inset_0_1px_3px_rgba(0,0,0,0.3)]",
  ],
}

/**
 * Well primitive for recessed/sunken areas.
 * Creates the illusion of depth below the surface.
 *
 * @example
 * ```tsx
 * <Well depth="medium" className="p-4 rounded-lg">
 *   Input or content that sits below the surface
 * </Well>
 * ```
 */
export const Well = React.forwardRef<HTMLDivElement, WellProps>(
  (
    {
      depth = "medium",
      as: Component = "div",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          // Base well styles
          "relative",
          // Depth-specific styles
          depthStyles[depth],
          // Bottom edge highlight for depth
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px",
          "after:bg-gradient-to-r after:from-transparent after:via-white/[0.03] after:to-transparent",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Well.displayName = "Well"
