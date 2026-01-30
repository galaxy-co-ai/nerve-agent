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
              hasError ? "text-[var(--nerve-error)]" : "text-[var(--nerve-text-secondary)]",
              disabled && "opacity-50"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nerve-text-muted)]">
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
              "text-sm text-[var(--nerve-text-primary)] placeholder:text-[var(--nerve-text-muted)]",
              // Inset well effect - pressed into surface
              "bg-[var(--nerve-bg-deep)]",
              "border border-[var(--nerve-border-subtle)]",
              "shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(0,0,0,0.3)]",
              // Transition
              "transition-all duration-200 ease-out",
              // Focus state with gold glow ring
              "focus:outline-none",
              "focus:border-[var(--nerve-gold-400)]/50",
              "focus:bg-[var(--nerve-bg-base)]",
              "focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0_0_2px_var(--nerve-bg-base),0_0_0_4px_var(--nerve-gold-400),0_0_20px_var(--nerve-gold-glow)]",
              // Hover
              "hover:border-[var(--nerve-border-default)]",
              "hover:bg-[var(--nerve-bg-base)]",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-50",
              "disabled:hover:border-[var(--nerve-border-subtle)]",
              "disabled:hover:bg-[var(--nerve-bg-deep)]",
              // Error state
              hasError && [
                "border-[var(--nerve-error)]/50",
                "focus:border-[var(--nerve-error)]/50",
                "focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_0_0_2px_var(--nerve-bg-base),0_0_0_4px_var(--nerve-error),0_0_20px_var(--nerve-error-glow)]",
              ],
              // Padding adjustments for icons
              leftElement && "pl-10",
              rightElement && "pr-10",
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nerve-text-muted)]">
              {rightElement}
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              hasError ? "text-[var(--nerve-error)]" : "text-[var(--nerve-text-muted)]"
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
