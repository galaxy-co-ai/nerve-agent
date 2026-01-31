"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Power } from "lucide-react"

interface PowerButtonProps {
  /**
   * Whether the power is on
   */
  isOn?: boolean
  /**
   * Callback when toggled
   */
  onToggle?: (isOn: boolean) => void
  /**
   * Size in pixels
   */
  size?: number
  /**
   * Color when active
   */
  activeColor?: string
  /**
   * Additional class names
   */
  className?: string
}

/**
 * Power Button - Circular toggle control with power icon.
 * Hardware-inspired power control seen in audio plugins.
 *
 * @example
 * ```tsx
 * <PowerButton
 *   isOn={enabled}
 *   onToggle={setEnabled}
 *   size={44}
 *   activeColor="#3b82f6"
 * />
 * ```
 */
export function PowerButton({
  isOn = true,
  onToggle,
  size = 44,
  activeColor = "#3b82f6",
  className,
}: PowerButtonProps) {
  const iconSize = size * 0.45
  const strokeWidth = size * 0.05

  return (
    <button
      onClick={() => onToggle?.(!isOn)}
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "transition-all duration-200",
        "hover:scale-105 active:scale-95",
        className
      )}
      style={{
        width: size,
        height: size,
        border: `${strokeWidth}px solid ${isOn ? activeColor : "#6b7280"}`,
        boxShadow: isOn
          ? `0 0 12px ${activeColor}40, inset 0 0 8px ${activeColor}20`
          : "none",
      }}
    >
      <Power
        size={iconSize}
        strokeWidth={2.5}
        className="transition-colors duration-200"
        style={{ color: isOn ? activeColor : "#6b7280" }}
      />
    </button>
  )
}
