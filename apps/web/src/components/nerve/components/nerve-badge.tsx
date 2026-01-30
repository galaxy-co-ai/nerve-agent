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
          "bg-[var(--nerve-bg-elevated)]/80",
          "text-[var(--nerve-text-secondary)]",
          "border-[var(--nerve-border-default)]",
        ],
        /**
         * Gold/primary badge with subtle glow
         */
        primary: [
          "bg-[var(--nerve-gold-500)]/10",
          "text-[var(--nerve-gold-400)]",
          "border-[var(--nerve-gold-500)]/30",
          "shadow-[0_0_8px_var(--nerve-gold-glow-subtle)]",
        ],
        /**
         * Success badge
         */
        success: [
          "bg-[var(--nerve-success)]/10",
          "text-[var(--nerve-success)]",
          "border-[var(--nerve-success)]/30",
          "shadow-[0_0_8px_var(--nerve-success-glow)]",
        ],
        /**
         * Warning badge
         */
        warning: [
          "bg-[var(--nerve-warning)]/10",
          "text-[var(--nerve-warning)]",
          "border-[var(--nerve-warning)]/30",
          "shadow-[0_0_8px_var(--nerve-warning-glow)]",
        ],
        /**
         * Error/destructive badge
         */
        error: [
          "bg-[var(--nerve-error)]/10",
          "text-[var(--nerve-error)]",
          "border-[var(--nerve-error)]/30",
          "shadow-[0_0_8px_var(--nerve-error-glow)]",
        ],
        /**
         * Info badge
         */
        info: [
          "bg-[var(--nerve-info)]/10",
          "text-[var(--nerve-info)]",
          "border-[var(--nerve-info)]/30",
          "shadow-[0_0_8px_var(--nerve-info-glow)]",
        ],
        /**
         * Outline only - minimal
         */
        outline: [
          "bg-transparent",
          "text-[var(--nerve-text-secondary)]",
          "border-[var(--nerve-border-strong)]",
        ],
        /**
         * Idea tag (purple)
         */
        idea: [
          "bg-[var(--nerve-tag-idea)]/10",
          "text-[var(--nerve-tag-idea)]",
          "border-[var(--nerve-tag-idea)]/30",
          "shadow-[0_0_8px_var(--nerve-tag-idea-glow)]",
        ],
        /**
         * Task tag (orange)
         */
        task: [
          "bg-[var(--nerve-tag-task)]/10",
          "text-[var(--nerve-tag-task)]",
          "border-[var(--nerve-tag-task)]/30",
          "shadow-[0_0_8px_var(--nerve-tag-task-glow)]",
        ],
        /**
         * Reference tag (blue) - alias for info
         */
        reference: [
          "bg-[var(--nerve-tag-reference)]/10",
          "text-[var(--nerve-tag-reference)]",
          "border-[var(--nerve-tag-reference)]/30",
          "shadow-[0_0_8px_var(--nerve-tag-reference-glow)]",
        ],
        /**
         * Insight tag (green)
         */
        insight: [
          "bg-[var(--nerve-tag-insight)]/10",
          "text-[var(--nerve-tag-insight)]",
          "border-[var(--nerve-tag-insight)]/30",
          "shadow-[0_0_8px_var(--nerve-tag-insight-glow)]",
        ],
        /**
         * Decision tag (gold)
         */
        decision: [
          "bg-[var(--nerve-tag-decision)]/10",
          "text-[var(--nerve-tag-decision)]",
          "border-[var(--nerve-tag-decision)]/30",
          "shadow-[0_0_8px_var(--nerve-tag-decision-glow)]",
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
              variant === "success" && "bg-[var(--nerve-success)]",
              variant === "warning" && "bg-[var(--nerve-warning)]",
              variant === "error" && "bg-[var(--nerve-error)]",
              variant === "info" && "bg-[var(--nerve-info)]",
              variant === "primary" && "bg-[var(--nerve-gold-400)]",
              variant === "idea" && "bg-[var(--nerve-tag-idea)]",
              variant === "task" && "bg-[var(--nerve-tag-task)]",
              variant === "reference" && "bg-[var(--nerve-tag-reference)]",
              variant === "insight" && "bg-[var(--nerve-tag-insight)]",
              variant === "decision" && "bg-[var(--nerve-tag-decision)]",
              (!variant || variant === "default" || variant === "outline") &&
                "bg-[var(--nerve-text-muted)]"
            )}
          />
        )}
        {children}
      </span>
    )
  }
)

NerveBadge.displayName = "NerveBadge"
