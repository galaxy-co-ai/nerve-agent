"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface NerveTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Error state styling
   */
  error?: boolean
}

/**
 * Multi-line text input with premium styling and glow focus.
 *
 * @example
 * ```tsx
 * <NerveTextarea
 *   placeholder="Enter your notes..."
 *   rows={4}
 * />
 * ```
 */
export const NerveTextarea = React.forwardRef<
  HTMLTextAreaElement,
  NerveTextareaProps
>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles
        "flex min-h-[80px] w-full",
        "rounded-md px-3 py-2",
        "text-sm text-zinc-100",
        // Surface styling
        "bg-zinc-900",
        "border border-zinc-700",
        // Raised effect
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_1px_2px_rgba(0,0,0,0.2)]",
        // Placeholder
        "placeholder:text-zinc-500",
        // Hover
        "hover:border-zinc-600",
        // Focus with gold glow
        "focus-visible:outline-none",
        "focus-visible:border-gold-400/50",
        "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.3),0_0_15px_rgba(251,191,36,0.1)]",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-900/50",
        // Error state
        error && [
          "border-red-500/50",
          "focus-visible:border-red-500/50",
          "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(239,68,68,0.3),0_0_15px_rgba(239,68,68,0.1)]",
        ],
        // Transition
        "transition-all duration-150",
        // Resize handle
        "resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

NerveTextarea.displayName = "NerveTextarea"
