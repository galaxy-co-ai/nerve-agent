"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialKnobProps {
  /**
   * Current value (0-1)
   */
  value?: number
  /**
   * Callback when value changes
   */
  onChange?: (value: number) => void
  /**
   * Size in pixels
   */
  size?: number
  /**
   * Label text
   */
  label?: string
  /**
   * Show value as percentage
   */
  showValue?: boolean
  /**
   * Additional class names
   */
  className?: string
}

/**
 * Dial Knob - Rotary control element.
 * Classic audio plugin style knob with indicator dot.
 *
 * @example
 * ```tsx
 * <DialKnob
 *   value={0.75}
 *   onChange={setValue}
 *   size={40}
 *   label="OUTPUT"
 * />
 * ```
 */
export function DialKnob({
  value = 0.5,
  onChange,
  size = 40,
  label,
  showValue = false,
  className,
}: DialKnobProps) {
  // Convert value to angle (135° to 405° range = 270° sweep)
  const minAngle = 135
  const maxAngle = 405
  const angle = minAngle + value * (maxAngle - minAngle)

  // Indicator dot position
  const dotDistance = size * 0.32
  const dotAngle = (angle * Math.PI) / 180
  const dotX = Math.cos(dotAngle) * dotDistance
  const dotY = Math.sin(dotAngle) * dotDistance
  const dotSize = Math.max(4, size * 0.12)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onChange) return

    const knob = e.currentTarget
    const rect = knob.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const updateValue = (clientX: number, clientY: number) => {
      const dx = clientX - centerX
      const dy = clientY - centerY
      let newAngle = Math.atan2(dy, dx) * (180 / Math.PI)

      // Convert angle to 0-360 range
      if (newAngle < 0) newAngle += 360

      // Map angle to value (accounting for the 135-405 range)
      let newValue: number
      if (newAngle >= 135 && newAngle <= 360) {
        newValue = (newAngle - 135) / 270
      } else if (newAngle >= 0 && newAngle <= 45) {
        newValue = (newAngle + 225) / 270
      } else {
        return // Outside knob range
      }

      onChange(Math.max(0, Math.min(1, newValue)))
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {label && (
        <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
          {label}
        </span>
      )}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full cursor-pointer",
          "bg-white",
          "border border-[#e5e7eb]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]",
          "transition-transform duration-100",
          "hover:scale-105 active:scale-95"
        )}
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
      >
        {/* Indicator dot */}
        <div
          className="absolute rounded-full bg-[#1a1a1e]"
          style={{
            width: dotSize,
            height: dotSize,
            transform: `translate(${dotX}px, ${dotY}px)`,
          }}
        />
      </div>
      {showValue && (
        <span className="text-[10px] font-mono text-[#6b7280]">
          {Math.round(value * 100)}%
        </span>
      )}
    </div>
  )
}
