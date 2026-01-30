"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AmbientGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Color of the ambient glow
   */
  color?: "gold" | "blue" | "green" | "custom"
  /**
   * Custom color RGB values (for color="custom")
   */
  customColor?: string
  /**
   * Opacity of the glow (0-1)
   * Recommended: 0.02-0.05 for subtle effect
   */
  opacity?: number
  /**
   * Position of the light source
   */
  position?: "top-left" | "top-right" | "top-center" | "center"
  /**
   * Size of the glow spread (0-1)
   */
  spread?: number
}

const colorMap: Record<string, string> = {
  gold: "251, 191, 36",
  blue: "59, 130, 246",
  green: "34, 197, 94",
}

const positionMap: Record<string, string> = {
  "top-left": "20% 0%",
  "top-right": "80% 0%",
  "top-center": "50% 0%",
  "center": "50% 50%",
}

/**
 * Ambient glow background.
 * Very subtle accent color light source that adds warmth.
 *
 * @example
 * ```tsx
 * <div className="relative bg-zinc-950">
 *   <AmbientGlow color="gold" opacity={0.03} position="top-left" />
 *   <YourContent />
 * </div>
 * ```
 */
export const AmbientGlow = React.forwardRef<HTMLDivElement, AmbientGlowProps>(
  (
    {
      color = "gold",
      customColor,
      opacity = 0.03,
      position = "top-left",
      spread = 0.5,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const rgb = color === "custom" ? customColor : colorMap[color]
    const pos = positionMap[position]
    const spreadPercent = Math.round(spread * 100)

    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 pointer-events-none",
          className
        )}
        style={{
          background: `radial-gradient(ellipse at ${pos}, rgba(${rgb},${opacity}) 0%, transparent ${spreadPercent}%)`,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

AmbientGlow.displayName = "AmbientGlow"
