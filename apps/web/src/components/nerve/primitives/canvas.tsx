"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Show dot grid pattern
   */
  showGrid?: boolean
  /**
   * Grid dot spacing in pixels
   */
  gridSize?: number
  /**
   * Grid dot opacity (0-1)
   */
  gridOpacity?: number
  /**
   * Show corner bracket decorations
   */
  showBrackets?: boolean
  /**
   * Show crosshair lines
   */
  showCrosshairs?: boolean
  /**
   * Crosshair position (0-1 for x and y)
   */
  crosshairPosition?: { x: number; y: number }
  /**
   * Top label (e.g., "WIDTH - 67%")
   */
  labelTop?: string
  /**
   * Left label (rotated, e.g., "ENERGY - 71%")
   */
  labelLeft?: string
  /**
   * Aspect ratio (e.g., "1/1", "16/9", "4/3")
   */
  aspectRatio?: string
}

/**
 * Canvas - Dark inset workspace area.
 * The main content area inside a ChromeShell with optional grid, brackets, and crosshairs.
 *
 * @example
 * ```tsx
 * <Canvas
 *   showGrid
 *   showBrackets
 *   showCrosshairs
 *   crosshairPosition={{ x: 0.67, y: 0.29 }}
 *   labelTop="WIDTH - 67%"
 *   labelLeft="ENERGY - 71%"
 * >
 *   <Orb position={{ x: 0.67, y: 0.29 }} />
 * </Canvas>
 * ```
 */
export const Canvas = React.forwardRef<HTMLDivElement, CanvasProps>(
  (
    {
      showGrid = true,
      gridSize = 20,
      gridOpacity = 0.15,
      showBrackets = true,
      showCrosshairs = false,
      crosshairPosition = { x: 0.5, y: 0.5 },
      labelTop,
      labelLeft,
      aspectRatio,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "bg-[#0a0a0c]",
          "rounded-2xl",
          // Inset shadow effect
          "shadow-[inset_0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(0,0,0,0.4)]",
          // Subtle inner border
          "ring-1 ring-inset ring-white/[0.03]",
          className
        )}
        style={{
          aspectRatio,
          ...style,
        }}
        {...props}
      >
        {/* Dot Grid Pattern */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,${gridOpacity}) 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Top Label */}
        {labelTop && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase">
              {labelTop}
            </span>
          </div>
        )}

        {/* Left Label (rotated) */}
        {labelLeft && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <span
              className="text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase block"
              style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
            >
              {labelLeft}
            </span>
          </div>
        )}

        {/* Corner Brackets */}
        {showBrackets && (
          <>
            {/* Top Left */}
            <CornerBracket position="top-left" />
            {/* Top Right */}
            <CornerBracket position="top-right" />
            {/* Bottom Left */}
            <CornerBracket position="bottom-left" />
            {/* Bottom Right */}
            <CornerBracket position="bottom-right" />
          </>
        )}

        {/* Crosshairs */}
        {showCrosshairs && (
          <>
            {/* Vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white/10 pointer-events-none"
              style={{ left: `${crosshairPosition.x * 100}%` }}
            />
            {/* Horizontal line */}
            <div
              className="absolute left-0 right-0 h-px bg-white/10 pointer-events-none"
              style={{ top: `${crosshairPosition.y * 100}%` }}
            />
            {/* Center dot */}
            <div
              className="absolute w-2 h-2 rounded-full border border-white/20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${crosshairPosition.x * 100}%`,
                top: `${crosshairPosition.y * 100}%`,
              }}
            />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    )
  }
)

Canvas.displayName = "Canvas"

/**
 * Corner bracket decoration
 */
function CornerBracket({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const positionStyles = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4 rotate-90",
    "bottom-left": "bottom-4 left-4 -rotate-90",
    "bottom-right": "bottom-4 right-4 rotate-180",
  }

  return (
    <div
      className={cn(
        "absolute w-5 h-5 pointer-events-none",
        positionStyles[position]
      )}
      aria-hidden="true"
    >
      {/* L-shape bracket */}
      <div className="absolute top-0 left-0 w-full h-px bg-white/20" />
      <div className="absolute top-0 left-0 w-px h-full bg-white/20" />
    </div>
  )
}
