"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface VignetteProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Intensity of the vignette darkening (0-1)
   */
  intensity?: number
  /**
   * Size of the clear center area (0-1, where 0 is full vignette)
   */
  spread?: number
}

/**
 * Vignette overlay.
 * Subtle edge darkening that draws focus to the center.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <Vignette intensity={0.3} />
 *   <YourContent />
 * </div>
 * ```
 */
export const Vignette = React.forwardRef<HTMLDivElement, VignetteProps>(
  (
    {
      intensity = 0.3,
      spread = 0.5,
      className,
      style,
      ...props
    },
    ref
  ) => {
    // Calculate the transparent stop position based on spread
    const transparentStop = Math.round(spread * 100)

    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 pointer-events-none",
          className
        )}
        style={{
          background: `radial-gradient(ellipse at center, transparent ${transparentStop}%, rgba(0,0,0,${intensity}) 100%)`,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

Vignette.displayName = "Vignette"
