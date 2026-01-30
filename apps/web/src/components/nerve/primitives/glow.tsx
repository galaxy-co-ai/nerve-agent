"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Glow intensity levels for the Nerve glow system.
 */
export type GlowIntensity = "none" | "subtle" | "soft" | "medium" | "intense"

/**
 * Glow color variants.
 */
export type GlowColor = "gold" | "success" | "warning" | "error" | "info"

interface GlowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Glow intensity level
   * - none: No glow
   * - subtle: Barely visible glow
   * - soft: Light glow for hover states
   * - medium: Standard active glow
   * - intense: Maximum emphasis
   */
  intensity?: GlowIntensity
  /**
   * Glow color variant
   */
  color?: GlowColor
  /**
   * Animate glow on hover (increases intensity)
   */
  hoverGlow?: boolean
  /**
   * Animate glow with pulse effect
   */
  pulse?: boolean
  /**
   * Render as a different element
   */
  as?: React.ElementType
}

const glowColors: Record<GlowColor, { base: string; glow: string }> = {
  gold: {
    base: "251, 191, 36",    // gold-400
    glow: "251, 191, 36",
  },
  success: {
    base: "34, 197, 94",     // green-500
    glow: "34, 197, 94",
  },
  warning: {
    base: "234, 179, 8",     // yellow-500
    glow: "234, 179, 8",
  },
  error: {
    base: "239, 68, 68",     // red-500
    glow: "239, 68, 68",
  },
  info: {
    base: "59, 130, 246",    // blue-500
    glow: "59, 130, 246",
  },
}

// Generate glow shadow based on intensity and color
const getGlowShadow = (intensity: GlowIntensity, colorRgb: string): string => {
  switch (intensity) {
    case "none":
      return "none"
    case "subtle":
      return `0 0 10px rgba(${colorRgb}, 0.1)`
    case "soft":
      return `0 0 15px rgba(${colorRgb}, 0.2), 0 0 30px rgba(${colorRgb}, 0.1)`
    case "medium":
      return `0 0 20px rgba(${colorRgb}, 0.3), 0 0 40px rgba(${colorRgb}, 0.15)`
    case "intense":
      return `0 0 15px rgba(${colorRgb}, 0.4), 0 0 30px rgba(${colorRgb}, 0.25), 0 0 60px rgba(${colorRgb}, 0.1)`
    default:
      return "none"
  }
}

// Get next intensity level for hover
const getHoverIntensity = (intensity: GlowIntensity): GlowIntensity => {
  switch (intensity) {
    case "none":
      return "subtle"
    case "subtle":
      return "soft"
    case "soft":
      return "medium"
    case "medium":
      return "intense"
    case "intense":
      return "intense"
    default:
      return "soft"
  }
}

/**
 * Glow primitive for adding light emission effects.
 * Wrap interactive elements to give them the Nerve "alive" feel.
 *
 * @example
 * ```tsx
 * <Glow intensity="soft" color="gold" hoverGlow>
 *   <Button>Click me</Button>
 * </Glow>
 * ```
 */
export const Glow = React.forwardRef<HTMLDivElement, GlowProps>(
  (
    {
      intensity = "soft",
      color = "gold",
      hoverGlow = false,
      pulse = false,
      as: Component = "div",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const colorRgb = glowColors[color].glow
    const baseShadow = getGlowShadow(intensity, colorRgb)
    const hoverShadow = hoverGlow
      ? getGlowShadow(getHoverIntensity(intensity), colorRgb)
      : baseShadow

    return (
      <Component
        ref={ref}
        className={cn(
          "transition-shadow duration-200 ease-out",
          pulse && "animate-glow-pulse",
          className
        )}
        style={{
          boxShadow: baseShadow,
          "--glow-color": colorRgb,
          "--glow-hover-shadow": hoverShadow,
          ...style,
        } as React.CSSProperties}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          if (hoverGlow) {
            e.currentTarget.style.boxShadow = hoverShadow
          }
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          if (hoverGlow) {
            e.currentTarget.style.boxShadow = baseShadow
          }
        }}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Glow.displayName = "Glow"

/**
 * Utility function to generate glow CSS properties.
 * Use this when you need glow in custom components without the wrapper.
 */
export function getGlowStyles(
  intensity: GlowIntensity = "soft",
  color: GlowColor = "gold"
) {
  const colorRgb = glowColors[color].glow
  return {
    boxShadow: getGlowShadow(intensity, colorRgb),
    transition: "box-shadow 200ms ease-out",
  }
}

/**
 * CSS class names for glow effects (for use with cn()).
 */
export const glowClasses = {
  gold: {
    subtle: "shadow-[0_0_10px_rgba(251,191,36,0.1)]",
    soft: "shadow-[0_0_15px_rgba(251,191,36,0.2),0_0_30px_rgba(251,191,36,0.1)]",
    medium: "shadow-[0_0_20px_rgba(251,191,36,0.3),0_0_40px_rgba(251,191,36,0.15)]",
    intense: "shadow-[0_0_15px_rgba(251,191,36,0.4),0_0_30px_rgba(251,191,36,0.25),0_0_60px_rgba(251,191,36,0.1)]",
  },
  success: {
    subtle: "shadow-[0_0_10px_rgba(34,197,94,0.1)]",
    soft: "shadow-[0_0_15px_rgba(34,197,94,0.2),0_0_30px_rgba(34,197,94,0.1)]",
    medium: "shadow-[0_0_20px_rgba(34,197,94,0.3),0_0_40px_rgba(34,197,94,0.15)]",
    intense: "shadow-[0_0_15px_rgba(34,197,94,0.4),0_0_30px_rgba(34,197,94,0.25),0_0_60px_rgba(34,197,94,0.1)]",
  },
  error: {
    subtle: "shadow-[0_0_10px_rgba(239,68,68,0.1)]",
    soft: "shadow-[0_0_15px_rgba(239,68,68,0.2),0_0_30px_rgba(239,68,68,0.1)]",
    medium: "shadow-[0_0_20px_rgba(239,68,68,0.3),0_0_40px_rgba(239,68,68,0.15)]",
    intense: "shadow-[0_0_15px_rgba(239,68,68,0.4),0_0_30px_rgba(239,68,68,0.25),0_0_60px_rgba(239,68,68,0.1)]",
  },
} as const
