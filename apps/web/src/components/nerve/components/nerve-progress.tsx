"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveProgressVariants = cva(
  // Base track styles
  [
    "relative w-full overflow-hidden",
    "rounded-full",
    "bg-zinc-800",
    "border border-zinc-700",
    // Inset shadow for depth
    "shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]",
  ],
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const nerveProgressIndicatorVariants = cva(
  // Base indicator styles
  [
    "h-full w-full flex-1",
    "transition-all duration-300 ease-out",
    "rounded-full",
  ],
  {
    variants: {
      variant: {
        /**
         * Default gold progress with glow
         */
        default: [
          "bg-gradient-to-r from-gold-500 to-gold-400",
          "shadow-[0_0_10px_rgba(251,191,36,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
        ],
        /**
         * Success green
         */
        success: [
          "bg-gradient-to-r from-green-600 to-green-500",
          "shadow-[0_0_10px_rgba(34,197,94,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
        ],
        /**
         * Warning yellow
         */
        warning: [
          "bg-gradient-to-r from-yellow-600 to-yellow-500",
          "shadow-[0_0_10px_rgba(234,179,8,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
        ],
        /**
         * Error red
         */
        error: [
          "bg-gradient-to-r from-red-600 to-red-500",
          "shadow-[0_0_10px_rgba(239,68,68,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
        ],
        /**
         * Subtle/muted
         */
        muted: [
          "bg-zinc-600",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NerveProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof nerveProgressVariants>,
    VariantProps<typeof nerveProgressIndicatorVariants> {
  /**
   * Show percentage label
   */
  showLabel?: boolean
  /**
   * Indeterminate loading state (animated)
   */
  indeterminate?: boolean
}

/**
 * Progress bar with glow effect and semantic colors.
 *
 * @example
 * ```tsx
 * <NerveProgress value={65} variant="success" />
 * <NerveProgress value={30} variant="warning" showLabel />
 * <NerveProgress indeterminate />
 * ```
 */
export const NerveProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  NerveProgressProps
>(
  (
    {
      className,
      value,
      size,
      variant,
      showLabel,
      indeterminate,
      ...props
    },
    ref
  ) => {
    const percentage = value ?? 0

    return (
      <div className="relative">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(nerveProgressVariants({ size }), className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              nerveProgressIndicatorVariants({ variant }),
              indeterminate && "animate-progress-indeterminate"
            )}
            style={{
              transform: indeterminate
                ? undefined
                : `translateX(-${100 - percentage}%)`,
            }}
          />
        </ProgressPrimitive.Root>
        {showLabel && !indeterminate && (
          <span className="absolute right-0 -top-6 text-xs text-zinc-400 tabular-nums">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

NerveProgress.displayName = "NerveProgress"
