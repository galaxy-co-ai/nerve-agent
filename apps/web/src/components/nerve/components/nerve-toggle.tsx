"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export interface NerveToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  /**
   * Size of the toggle
   */
  size?: "sm" | "md" | "lg"
  /**
   * Label for the toggle
   */
  label?: string
  /**
   * Description text below the label
   */
  description?: string
}

const sizeConfig = {
  sm: {
    track: "h-4 w-7",
    thumb: "h-3 w-3",
    translate: "translate-x-3",
  },
  md: {
    track: "h-5 w-9",
    thumb: "h-4 w-4",
    translate: "translate-x-4",
  },
  lg: {
    track: "h-6 w-11",
    thumb: "h-5 w-5",
    translate: "translate-x-5",
  },
}

/**
 * Premium toggle switch with glow effect and tactile feel.
 *
 * @example
 * ```tsx
 * <NerveToggle
 *   label="Enable notifications"
 *   description="Receive alerts about important updates"
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 * />
 * ```
 */
export const NerveToggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  NerveToggleProps
>(({ className, size = "md", label, description, ...props }, ref) => {
  const config = sizeConfig[size]
  const id = React.useId()

  const toggle = (
    <SwitchPrimitives.Root
      id={id}
      className={cn(
        // Track base styles
        "peer inline-flex shrink-0 cursor-pointer items-center",
        "rounded-full border-2 border-transparent",
        "transition-all duration-200 ease-out",
        // Recessed well effect when off
        "bg-zinc-800",
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
        // Focus state with glow
        "focus-visible:outline-none",
        "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.5),inset_0_2px_4px_rgba(0,0,0,0.3)]",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Active/checked state
        "data-[state=checked]:bg-gold-500",
        "data-[state=checked]:shadow-[0_0_15px_rgba(251,191,36,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]",
        // Size
        config.track,
        className
      )}
      ref={ref}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          // Thumb base
          "pointer-events-none block rounded-full",
          "bg-zinc-100",
          // 3D effect with gradient and shadow
          "bg-gradient-to-b from-white to-zinc-200",
          "shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.8)]",
          // Smooth transition
          "transition-all duration-200 ease-out",
          "data-[state=unchecked]:translate-x-0.5",
          // Checked position
          `data-[state=checked]:${config.translate}`,
          // Checked state: slight glow reflection
          "data-[state=checked]:shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.8),0_0_8px_rgba(251,191,36,0.2)]",
          // Size
          config.thumb
        )}
      />
    </SwitchPrimitives.Root>
  )

  // If no label, just return the toggle
  if (!label) {
    return toggle
  }

  // With label and optional description
  return (
    <div className="flex items-start gap-3">
      {toggle}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-zinc-200 cursor-pointer",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          )}
        >
          {label}
        </label>
        {description && (
          <span className="text-xs text-zinc-500">{description}</span>
        )}
      </div>
    </div>
  )
})

NerveToggle.displayName = "NerveToggle"
