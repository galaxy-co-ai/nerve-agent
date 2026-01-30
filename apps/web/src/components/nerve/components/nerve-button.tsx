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
         */
        primary: [
          // Background with subtle gradient for dimension
          "bg-gradient-to-b from-gold-400 to-gold-500",
          "text-zinc-900 font-semibold",
          // Top highlight for raised effect
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.2)]",
          // Glow effect
          "shadow-[0_0_15px_rgba(251,191,36,0.2),0_1px_2px_rgba(0,0,0,0.2)]",
          // Hover: intensify glow
          "hover:shadow-[0_0_20px_rgba(251,191,36,0.35),0_0_40px_rgba(251,191,36,0.15),0_2px_4px_rgba(0,0,0,0.2)]",
          "hover:from-gold-300 hover:to-gold-400",
          // Focus: glow ring
          "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.5),0_0_20px_rgba(251,191,36,0.3)]",
        ],
        /**
         * Secondary button with subtle surface
         */
        secondary: [
          "bg-zinc-800",
          "text-zinc-100",
          "border border-zinc-700",
          // Raised effect
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.2)]",
          // Hover
          "hover:bg-zinc-700 hover:border-zinc-600",
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.2)]",
          // Focus
          "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.5)]",
        ],
        /**
         * Ghost button - minimal until hovered
         */
        ghost: [
          "bg-transparent",
          "text-zinc-400",
          // Hover
          "hover:bg-zinc-800/50 hover:text-zinc-100",
          // Focus
          "focus-visible:bg-zinc-800/50",
          "focus-visible:shadow-[0_0_0_2px_rgba(251,191,36,0.3)]",
        ],
        /**
         * Outline button with gold accent
         */
        outline: [
          "bg-transparent",
          "text-gold-400",
          "border border-gold-400/50",
          // Hover: fill with gold
          "hover:bg-gold-400/10 hover:border-gold-400",
          "hover:shadow-[0_0_10px_rgba(251,191,36,0.15)]",
          // Focus
          "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.5)]",
        ],
        /**
         * Destructive action button
         */
        destructive: [
          "bg-gradient-to-b from-red-500 to-red-600",
          "text-white font-semibold",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.2)]",
          // Glow
          "shadow-[0_0_10px_rgba(239,68,68,0.2),0_1px_2px_rgba(0,0,0,0.2)]",
          // Hover
          "hover:shadow-[0_0_15px_rgba(239,68,68,0.35),0_0_30px_rgba(239,68,68,0.15)]",
          "hover:from-red-400 hover:to-red-500",
          // Focus
          "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(239,68,68,0.5)]",
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
