"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ReadoutProps {
  /**
   * Label text (e.g., "WIDTH")
   */
  label: string
  /**
   * Value to display (e.g., "67%")
   */
  value: string | number
  /**
   * Unit suffix (e.g., "%", "ms", "dB")
   */
  unit?: string
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color variant
   */
  variant?: "default" | "muted" | "accent"
  /**
   * Additional class names
   */
  className?: string
}

/**
 * Readout - Technical value display.
 * Shows parameter values in a clean "WIDTH - 67%" format.
 *
 * @example
 * ```tsx
 * <Readout label="WIDTH" value={67} unit="%" />
 * <Readout label="ENERGY" value={71} unit="%" variant="muted" />
 * ```
 */
export function Readout({
  label,
  value,
  unit = "",
  size = "md",
  variant = "default",
  className,
}: ReadoutProps) {
  const sizeStyles = {
    sm: "text-[9px] tracking-[0.1em]",
    md: "text-[11px] tracking-[0.12em]",
    lg: "text-[13px] tracking-[0.14em]",
  }

  const variantStyles = {
    default: "text-white/50",
    muted: "text-white/30",
    accent: "text-[#c9a84c]/70",
  }

  return (
    <span
      className={cn(
        "font-medium uppercase whitespace-nowrap",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {label} — {value}{unit}
    </span>
  )
}
