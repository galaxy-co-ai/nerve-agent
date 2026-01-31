"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PillToggleOption {
  value: string
  label: string
}

interface PillToggleProps {
  /**
   * Options to display
   */
  options: PillToggleOption[]
  /**
   * Currently selected value
   */
  value: string
  /**
   * Callback when selection changes
   */
  onChange: (value: string) => void
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg"
  /**
   * Additional class names
   */
  className?: string
}

/**
 * Pill Toggle - Segmented control with sliding indicator.
 * Used for mode selection like SOFT/MEDIUM/HARD in the KNORR design.
 *
 * @example
 * ```tsx
 * <PillToggle
 *   options={[
 *     { value: 'soft', label: 'SOFT' },
 *     { value: 'medium', label: 'MEDIUM' },
 *     { value: 'hard', label: 'HARD' },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 * />
 * ```
 */
export function PillToggle({
  options,
  value,
  onChange,
  size = "md",
  className,
}: PillToggleProps) {
  const selectedIndex = options.findIndex((opt) => opt.value === value)

  const sizeStyles = {
    sm: {
      container: "h-8 p-1 rounded-full text-xs",
      option: "px-3 py-1",
      indicator: "rounded-full",
    },
    md: {
      container: "h-10 p-1.5 rounded-full text-sm",
      option: "px-5 py-1.5",
      indicator: "rounded-full",
    },
    lg: {
      container: "h-12 p-2 rounded-full text-base",
      option: "px-6 py-2",
      indicator: "rounded-full",
    },
  }

  const styles = sizeStyles[size]

  return (
    <div
      className={cn(
        "relative flex items-center bg-[#1a1a1e]",
        styles.container,
        // Subtle inner shadow
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]",
        // Outer ring
        "ring-1 ring-white/[0.05]",
        className
      )}
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          "absolute bg-white transition-all duration-200 ease-out",
          styles.indicator
        )}
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          height: "calc(100% - 6px)",
          left: `calc(${(selectedIndex * 100) / options.length}% + 3px)`,
          top: "3px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      />

      {/* Options */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative z-10 flex-1 text-center font-semibold tracking-wide transition-colors duration-200",
            styles.option,
            option.value === value
              ? "text-[#0a0a0c]"
              : "text-white/60 hover:text-white/80"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
