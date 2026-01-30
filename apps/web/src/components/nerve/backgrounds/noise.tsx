"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface NoiseProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Opacity of the noise texture (0-1)
   * Recommended: 0.02-0.05 for subtle effect
   */
  opacity?: number
  /**
   * Blend mode for the noise
   */
  blendMode?: "overlay" | "soft-light" | "multiply" | "normal"
}

// Base64 encoded noise SVG for performance
const noiseSvg = `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E`

/**
 * Noise texture overlay.
 * Adds subtle grain that prevents "digital flatness".
 *
 * @example
 * ```tsx
 * <div className="relative bg-zinc-950">
 *   <Noise opacity={0.02} />
 *   <YourContent />
 * </div>
 * ```
 */
export const Noise = React.forwardRef<HTMLDivElement, NoiseProps>(
  (
    {
      opacity = 0.02,
      blendMode = "overlay",
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
          "absolute inset-0 pointer-events-none",
          className
        )}
        style={{
          backgroundImage: `url("${noiseSvg}")`,
          backgroundRepeat: "repeat",
          opacity,
          mixBlendMode: blendMode,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

Noise.displayName = "Noise"
