"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveCardVariants = cva(
  // Base styles
  [
    "rounded-xl",
    "border border-zinc-800/50",
    "transition-all duration-200 ease-out",
  ],
  {
    variants: {
      /**
       * Surface elevation level
       */
      elevation: {
        1: [
          "bg-zinc-900",
          "shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
        ],
        2: [
          "bg-zinc-800",
          "shadow-[0_2px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]",
        ],
        3: [
          "bg-zinc-700",
          "shadow-[0_4px_8px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]",
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
         */
        raised: [
          "bg-gradient-to-b from-white/[0.02] to-transparent",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        ],
        /**
         * Card with glow border on hover
         */
        glow: [
          "hover:border-gold-400/30",
          "hover:shadow-[0_0_20px_rgba(251,191,36,0.1),0_4px_8px_rgba(0,0,0,0.3)]",
        ],
        /**
         * Interactive card that lifts on hover
         */
        interactive: [
          "cursor-pointer",
          "hover:-translate-y-0.5",
          "hover:shadow-[0_8px_16px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)]",
          "hover:border-zinc-700",
          "active:scale-[0.99]",
          "active:translate-y-0",
        ],
        /**
         * Glass effect with blur
         */
        glass: [
          "bg-zinc-900/70",
          "backdrop-blur-xl",
          "border-white/[0.05]",
        ],
      },
    },
    defaultVariants: {
      elevation: 2,
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
      "text-lg font-semibold leading-none tracking-tight text-zinc-100",
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
    className={cn("text-sm text-zinc-400", className)}
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
      "border-t border-zinc-800/50 mt-4 pt-4",
      className
    )}
    {...props}
  />
))
NerveCardFooter.displayName = "NerveCardFooter"
