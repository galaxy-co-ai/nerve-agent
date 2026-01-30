"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveBadgeVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center",
    "rounded-full px-2.5 py-0.5",
    "text-xs font-medium",
    "transition-all duration-150",
    "border",
  ],
  {
    variants: {
      variant: {
        /**
         * Default neutral badge
         */
        default: [
          "bg-zinc-800/80",
          "text-zinc-300",
          "border-zinc-700",
        ],
        /**
         * Gold/primary badge with subtle glow
         */
        primary: [
          "bg-gold-400/10",
          "text-gold-400",
          "border-gold-400/30",
          "shadow-[0_0_8px_rgba(251,191,36,0.1)]",
        ],
        /**
         * Success badge
         */
        success: [
          "bg-green-500/10",
          "text-green-400",
          "border-green-500/30",
          "shadow-[0_0_8px_rgba(34,197,94,0.1)]",
        ],
        /**
         * Warning badge
         */
        warning: [
          "bg-yellow-500/10",
          "text-yellow-400",
          "border-yellow-500/30",
          "shadow-[0_0_8px_rgba(234,179,8,0.1)]",
        ],
        /**
         * Error/destructive badge
         */
        error: [
          "bg-red-500/10",
          "text-red-400",
          "border-red-500/30",
          "shadow-[0_0_8px_rgba(239,68,68,0.1)]",
        ],
        /**
         * Info badge
         */
        info: [
          "bg-blue-500/10",
          "text-blue-400",
          "border-blue-500/30",
          "shadow-[0_0_8px_rgba(59,130,246,0.1)]",
        ],
        /**
         * Outline only - minimal
         */
        outline: [
          "bg-transparent",
          "text-zinc-400",
          "border-zinc-600",
        ],
      },
      size: {
        sm: "text-[10px] px-2 py-0",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
      /**
       * Add pulsing glow animation for attention
       */
      pulse: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      pulse: false,
    },
  }
)

export interface NerveBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof nerveBadgeVariants> {
  /**
   * Optional dot indicator before text
   */
  dot?: boolean
}

/**
 * Status badge with semantic colors and optional glow.
 *
 * @example
 * ```tsx
 * <NerveBadge variant="success">Completed</NerveBadge>
 * <NerveBadge variant="warning" dot>In Progress</NerveBadge>
 * <NerveBadge variant="error" pulse>Failed</NerveBadge>
 * ```
 */
export const NerveBadge = React.forwardRef<HTMLSpanElement, NerveBadgeProps>(
  ({ className, variant, size, pulse, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(nerveBadgeVariants({ variant, size, pulse }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "mr-1.5 h-1.5 w-1.5 rounded-full",
              variant === "success" && "bg-green-400",
              variant === "warning" && "bg-yellow-400",
              variant === "error" && "bg-red-400",
              variant === "info" && "bg-blue-400",
              variant === "primary" && "bg-gold-400",
              (!variant || variant === "default" || variant === "outline") &&
                "bg-zinc-400"
            )}
          />
        )}
        {children}
      </span>
    )
  }
)

NerveBadge.displayName = "NerveBadge"
