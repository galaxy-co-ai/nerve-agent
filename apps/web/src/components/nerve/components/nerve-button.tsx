"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveButtonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-md text-sm font-medium",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    // Tactile press effect
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        /**
         * Primary gold button with glow effect
         * Uses design system gold palette
         */
        primary: [
          // Background with subtle gradient for dimension
          "bg-gradient-to-b from-[var(--nerve-gold-400)] to-[var(--nerve-gold-500)]",
          "text-[var(--nerve-bg-deep)] font-semibold",
          // Top highlight for raised effect + layered shadow
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_1px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_15px_var(--nerve-gold-glow)]",
          // Hover: intensify glow
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),0_0_25px_var(--nerve-gold-glow-medium),0_0_50px_var(--nerve-gold-glow-subtle)]",
          "hover:from-[var(--nerve-gold-300)] hover:to-[var(--nerve-gold-400)]",
          // Focus: glow ring
          "focus-visible:shadow-[0_0_0_2px_var(--nerve-bg-base),0_0_0_4px_var(--nerve-gold-400),0_0_20px_var(--nerve-gold-glow)]",
        ],
        /**
         * Secondary button with subtle surface
         */
        secondary: [
          "bg-[var(--nerve-bg-elevated)]",
          "text-[var(--nerve-text-primary)]",
          "border border-[var(--nerve-border-default)]",
          // Raised effect with layered shadow
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_1px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08)]",
          // Hover
          "hover:bg-[var(--nerve-bg-hover)] hover:border-[var(--nerve-border-strong)]",
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)]",
          // Focus
          "focus-visible:shadow-[0_0_0_2px_var(--nerve-bg-base),0_0_0_4px_var(--nerve-gold-400)]",
        ],
        /**
         * Ghost button - minimal until hovered
         */
        ghost: [
          "bg-transparent",
          "text-[var(--nerve-text-secondary)]",
          // Hover
          "hover:bg-[var(--nerve-bg-hover)] hover:text-[var(--nerve-text-primary)]",
          // Focus
          "focus-visible:bg-[var(--nerve-bg-hover)]",
          "focus-visible:shadow-[0_0_0_2px_var(--nerve-gold-glow-medium)]",
        ],
        /**
         * Outline button with gold accent
         */
        outline: [
          "bg-transparent",
          "text-[var(--nerve-gold-400)]",
          "border border-[var(--nerve-gold-500)]/50",
          // Hover: fill with gold
          "hover:bg-[var(--nerve-gold-500)]/10 hover:border-[var(--nerve-gold-400)]",
          "hover:shadow-[0_0_15px_var(--nerve-gold-glow)]",
          // Focus
          "focus-visible:shadow-[0_0_0_2px_var(--nerve-bg-base),0_0_0_4px_var(--nerve-gold-400)]",
        ],
        /**
         * Destructive action button
         */
        destructive: [
          "bg-gradient-to-b from-[var(--nerve-error)] to-red-600",
          "text-white font-semibold",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_1px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_0_10px_var(--nerve-error-glow)]",
          // Hover
          "hover:shadow-[0_0_20px_rgba(239,68,68,0.35),0_0_40px_rgba(239,68,68,0.15)]",
          "hover:from-red-400 hover:to-[var(--nerve-error)]",
          // Focus
          "focus-visible:shadow-[0_0_0_2px_var(--nerve-bg-base),0_0_0_4px_var(--nerve-error)]",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-sm",
        xl: "h-12 px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface NerveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof nerveButtonVariants> {
  /**
   * Render as child element (for composition with Link, etc.)
   */
  asChild?: boolean
  /**
   * Show loading spinner
   */
  loading?: boolean
}

/**
 * Premium button component with glow effects and tactile feel.
 *
 * @example
 * ```tsx
 * <NerveButton variant="primary" size="lg">
 *   Get Started
 * </NerveButton>
 * ```
 */
export const NerveButton = React.forwardRef<HTMLButtonElement, NerveButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(nerveButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

NerveButton.displayName = "NerveButton"
