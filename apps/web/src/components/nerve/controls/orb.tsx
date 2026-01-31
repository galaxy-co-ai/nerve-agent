"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type OrbColor = "gold" | "blue" | "green" | "purple" | "red"

interface OrbProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the orb in pixels
   */
  size?: number
  /**
   * Color variant
   */
  color?: OrbColor
  /**
   * Glow intensity (0-1)
   */
  glowIntensity?: number
  /**
   * Show satellite indicator
   */
  showSatellite?: boolean
  /**
   * Satellite angle in degrees
   */
  satelliteAngle?: number
  /**
   * Animated pulse effect
   */
  pulse?: boolean
  /**
   * Interactive (shows hover effects)
   */
  interactive?: boolean
}

const orbColors: Record<OrbColor, { core: string; glow: string; satellite: string }> = {
  gold: {
    core: "linear-gradient(135deg, #e8d5a3 0%, #c9a84c 30%, #a07d2a 70%, #8b6914 100%)",
    glow: "rgba(201, 168, 76, 0.6)",
    satellite: "#c9a84c",
  },
  blue: {
    core: "linear-gradient(135deg, #a8d4ff 0%, #4a90d9 30%, #2563eb 70%, #1d4ed8 100%)",
    glow: "rgba(59, 130, 246, 0.6)",
    satellite: "#3b82f6",
  },
  green: {
    core: "linear-gradient(135deg, #a8f5c4 0%, #4ade80 30%, #22c55e 70%, #16a34a 100%)",
    glow: "rgba(34, 197, 94, 0.6)",
    satellite: "#22c55e",
  },
  purple: {
    core: "linear-gradient(135deg, #d4a8ff 0%, #a855f7 30%, #9333ea 70%, #7c3aed 100%)",
    glow: "rgba(168, 85, 247, 0.6)",
    satellite: "#a855f7",
  },
  red: {
    core: "linear-gradient(135deg, #ffa8a8 0%, #f87171 30%, #ef4444 70%, #dc2626 100%)",
    glow: "rgba(239, 68, 68, 0.6)",
    satellite: "#ef4444",
  },
}

/**
 * Orb - Glowing 3D sphere control element.
 * The hero interactive element inspired by KNORR's XY pad orb.
 *
 * @example
 * ```tsx
 * <Orb
 *   size={48}
 *   color="gold"
 *   glowIntensity={0.8}
 *   showSatellite
 *   interactive
 * />
 * ```
 */
export const Orb = React.forwardRef<HTMLDivElement, OrbProps>(
  (
    {
      size = 40,
      color = "gold",
      glowIntensity = 0.7,
      showSatellite = true,
      satelliteAngle = 45,
      pulse = false,
      interactive = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const colors = orbColors[color]
    const satelliteSize = Math.max(8, size * 0.2)
    const satelliteDistance = size * 0.7

    // Calculate satellite position
    const satelliteX = Math.cos((satelliteAngle * Math.PI) / 180) * satelliteDistance
    const satelliteY = Math.sin((satelliteAngle * Math.PI) / 180) * satelliteDistance

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center",
          interactive && "cursor-pointer",
          pulse && "animate-pulse-glow",
          className
        )}
        style={{
          width: size * 2,
          height: size * 2,
          ...style,
        }}
        {...props}
      >
        {/* Outer glow */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-300",
            interactive && "group-hover:scale-110"
          )}
          style={{
            width: size * 1.5,
            height: size * 1.5,
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            opacity: glowIntensity,
            filter: "blur(8px)",
          }}
        />

        {/* Main orb */}
        <div
          className={cn(
            "relative rounded-full transition-transform duration-200",
            interactive && "hover:scale-105 active:scale-95"
          )}
          style={{
            width: size,
            height: size,
            background: colors.core,
            boxShadow: `
              inset -${size * 0.1}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.4),
              inset ${size * 0.05}px ${size * 0.05}px ${size * 0.2}px rgba(255,255,255,0.3),
              0 0 ${size * 0.4}px ${colors.glow},
              0 0 ${size * 0.8}px ${colors.glow}
            `,
          }}
        >
          {/* Highlight */}
          <div
            className="absolute rounded-full bg-white/40"
            style={{
              width: size * 0.25,
              height: size * 0.15,
              top: size * 0.15,
              left: size * 0.2,
              filter: "blur(2px)",
              transform: "rotate(-30deg)",
            }}
          />
        </div>

        {/* Satellite indicator */}
        {showSatellite && (
          <div
            className="absolute rounded-full border-2 transition-all duration-200"
            style={{
              width: satelliteSize,
              height: satelliteSize,
              borderColor: `${colors.satellite}80`,
              backgroundColor: "transparent",
              transform: `translate(${satelliteX}px, ${-satelliteY}px)`,
              boxShadow: `0 0 6px ${colors.glow}`,
            }}
          />
        )}
      </div>
    )
  }
)

Orb.displayName = "Orb"
