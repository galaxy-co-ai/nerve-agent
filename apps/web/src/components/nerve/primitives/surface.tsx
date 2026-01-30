"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Surface elevation levels for the Nerve depth system.
 * Each level gains lighter background, more shadow, and optional glow.
 */
export type SurfaceLevel = 0 | 1 | 2 | 3

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Elevation level (0-3)
   * - 0: Base canvas (zinc-950)
   * - 1: Raised surface (zinc-900)
   * - 2: Card/panel (zinc-800)
   * - 3: Modal/popover (zinc-700)
   */
  level?: SurfaceLevel
  /**
   * Apply raised effect with top highlight and enhanced shadow
   */
  raised?: boolean
  /**
   * Apply tactile press effect on click
   */
  pressable?: boolean
  /**
   * Apply hover lift effect
   */
  hoverable?: boolean
  /**
   * Render as a different element
   */
  as?: React.ElementType
}

const levelStyles: Record<SurfaceLevel, string> = {
  0: "bg-zinc-950",
  1: "bg-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
  2: "bg-zinc-800 shadow-[0_2px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]",
  3: "bg-zinc-700 shadow-[0_4px_8px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]",
}

/**
 * Surface primitive for elevation system.
 * Use this as the base for all elevated containers.
 *
 * @example
 * ```tsx
 * <Surface level={2} raised hoverable className="p-4 rounded-lg">
 *   Card content
 * </Surface>
 * ```
 */
export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      level = 1,
      raised = false,
      pressable = false,
      hoverable = false,
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
          // Base level styles
          levelStyles[level],
          // Raised effect: top highlight + enhanced shadow
          raised && [
            "bg-gradient-to-b from-white/[0.03] to-transparent",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.3)]",
          ],
          // Pressable effect
          pressable && [
            "transition-transform duration-100 ease-out",
            "active:scale-[0.98]",
            "cursor-pointer",
          ],
          // Hoverable lift effect
          hoverable && [
            "transition-all duration-200 ease-out",
            "hover:-translate-y-0.5",
            "hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]",
          ],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Surface.displayName = "Surface"
