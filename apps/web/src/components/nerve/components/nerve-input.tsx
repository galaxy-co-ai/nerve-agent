"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface NerveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label for the input
   */
  label?: string
  /**
   * Helper text below the input
   */
  helperText?: string
  /**
   * Error message (also sets error state)
   */
  error?: string
  /**
   * Left icon/element
   */
  leftElement?: React.ReactNode
  /**
   * Right icon/element
   */
  rightElement?: React.ReactNode
}

/**
 * Premium input field with well effect and glow focus.
 *
 * @example
 * ```tsx
 * <NerveInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   leftElement={<Mail className="h-4 w-4" />}
 * />
 * ```
 */
export const NerveInput = React.forwardRef<HTMLInputElement, NerveInputProps>(
  (
    {
      className,
      type,
      label,
      helperText,
      error,
      leftElement,
      rightElement,
      disabled,
      ...props
    },
    ref
  ) => {
    const id = React.useId()
    const hasError = !!error

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium mb-1.5",
              hasError ? "text-red-400" : "text-zinc-300",
              disabled && "opacity-50"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {leftElement}
            </div>
          )}

          <input
            id={id}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              "flex h-10 w-full rounded-lg px-3 py-2",
              "text-sm text-zinc-100 placeholder:text-zinc-500",
              // Well/recessed effect
              "bg-zinc-900/50",
              "border border-zinc-700/50",
              "shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]",
              // Transition
              "transition-all duration-200 ease-out",
              // Focus state with gold glow
              "focus:outline-none",
              "focus:border-gold-400/50",
              "focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2),0_0_0_3px_rgba(251,191,36,0.15),0_0_15px_rgba(251,191,36,0.1)]",
              // Hover
              "hover:border-zinc-600",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-50",
              "disabled:hover:border-zinc-700/50",
              // Error state
              hasError && [
                "border-red-500/50",
                "focus:border-red-500/50",
                "focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2),0_0_0_3px_rgba(239,68,68,0.15),0_0_15px_rgba(239,68,68,0.1)]",
              ],
              // Padding adjustments for icons
              leftElement && "pl-10",
              rightElement && "pr-10",
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {rightElement}
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              hasError ? "text-red-400" : "text-zinc-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

NerveInput.displayName = "NerveInput"
