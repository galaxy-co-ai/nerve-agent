"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveCardVariants = cva(
  // Base styles - using design system tokens
  [
    "rounded-xl",
    "transition-all duration-200 ease-out",
  ],
  {
    variants: {
      /**
       * Surface elevation level
       * Uses layered shadow technique: 1→2→4→8→16px
       * See: DESIGN_SYSTEM.md
       */
      elevation: {
        1: [
          // Level 1 - Cards at rest (3-layer shadow)
          "bg-[var(--nerve-bg-surface)]",
          "border border-[var(--nerve-border-subtle)]",
          "shadow-[0_1px_1px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.08),0_4px_4px_rgba(0,0,0,0.08)]",
        ],
        2: [
          // Level 2 - Elevated (4-layer shadow)
          "bg-[var(--nerve-bg-elevated)]",
          "border border-[var(--nerve-border-default)]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)]",
        ],
        3: [
          // Level 3 - Floating (5-layer shadow)
          "bg-[var(--nerve-bg-elevated)]",
          "border border-[var(--nerve-border-strong)]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.08),0_8px_16px_rgba(0,0,0,0.08),0_16px_32px_rgba(0,0,0,0.08)]",
        ],
      },
      /**
       * Visual treatment
       */
      variant: {
        /**
         * Standard card
         */
        default: "",
        /**
         * Card with subtle top highlight (raised feel)
         * "Lit from above" effect
         */
        raised: [
          "bg-gradient-to-b from-white/[0.03] to-transparent",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        ],
        /**
         * Card with gold glow border on hover
         * Uses design system gold glow values
         */
        glow: [
          "hover:border-[var(--nerve-gold-500)]/30",
          "hover:shadow-[0_0_20px_var(--nerve-gold-glow),0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)]",
        ],
        /**
         * Interactive card that lifts on hover
         * Elevates from Level 1 → Level 2 on hover
         */
        interactive: [
          "cursor-pointer",
          "hover:-translate-y-0.5",
          "hover:bg-[var(--nerve-bg-elevated)]",
          "hover:border-[var(--nerve-border-default)]",
          "hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)]",
          "active:scale-[0.99]",
          "active:translate-y-0",
        ],
        /**
         * Glass effect with blur
         */
        glass: [
          "bg-[var(--nerve-bg-surface)]/70",
          "backdrop-blur-xl",
          "border-white/[0.05]",
        ],
        /**
         * Selected/active card with gold accent
         */
        selected: [
          "border-l-2 border-l-[var(--nerve-gold-400)]",
          "shadow-[0_0_20px_var(--nerve-gold-glow-subtle),0_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1)]",
        ],
      },
    },
    defaultVariants: {
      elevation: 1,
      variant: "default",
    },
  }
)

export interface NerveCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof nerveCardVariants> {
  /**
   * Render as a different element
   */
  as?: React.ElementType
}

/**
 * Premium card component with elevation and tactile options.
 *
 * @example
 * ```tsx
 * <NerveCard elevation={2} variant="interactive" className="p-4">
 *   Card content
 * </NerveCard>
 * ```
 */
export const NerveCard = React.forwardRef<HTMLDivElement, NerveCardProps>(
  (
    {
      className,
      elevation,
      variant,
      as: Component = "div",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(nerveCardVariants({ elevation, variant, className }))}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

NerveCard.displayName = "NerveCard"

/**
 * Card header section
 */
export const NerveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 pb-0", className)}
    {...props}
  />
))
NerveCardHeader.displayName = "NerveCardHeader"

/**
 * Card title
 */
export const NerveCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-[var(--nerve-text-primary)]",
      className
    )}
    {...props}
  />
))
NerveCardTitle.displayName = "NerveCardTitle"

/**
 * Card description
 */
export const NerveCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--nerve-text-secondary)]", className)}
    {...props}
  />
))
NerveCardDescription.displayName = "NerveCardDescription"

/**
 * Card content section
 */
export const NerveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
))
NerveCardContent.displayName = "NerveCardContent"

/**
 * Card footer section
 */
export const NerveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-5 pt-0",
      "border-t border-[var(--nerve-border-subtle)] mt-4 pt-4",
      className
    )}
    {...props}
  />
))
NerveCardFooter.displayName = "NerveCardFooter"
