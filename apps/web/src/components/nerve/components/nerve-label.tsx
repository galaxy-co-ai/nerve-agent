"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveLabelVariants = cva(
  [
    "text-sm font-medium leading-none",
    "text-zinc-300",
    // Peer disabled styling
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  ],
  {
    variants: {
      /**
       * Visual weight of the label
       */
      variant: {
        default: "",
        muted: "text-zinc-500 font-normal",
        error: "text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NerveLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof nerveLabelVariants> {
  /**
   * Show required asterisk
   */
  required?: boolean
  /**
   * Optional description text below label
   */
  description?: string
}

/**
 * Accessible form label with optional required indicator.
 *
 * @example
 * ```tsx
 * <NerveLabel htmlFor="email" required>
 *   Email address
 * </NerveLabel>
 * <NerveInput id="email" type="email" />
 *
 * <NerveLabel htmlFor="bio" description="Brief description about yourself">
 *   Biography
 * </NerveLabel>
 * ```
 */
const NerveLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  NerveLabelProps
>(({ className, variant, required, description, children, ...props }, ref) => (
  <div className="space-y-1">
    <LabelPrimitive.Root
      ref={ref}
      className={cn(nerveLabelVariants({ variant }), className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-400" aria-hidden="true">
          *
        </span>
      )}
    </LabelPrimitive.Root>
    {description && (
      <p className="text-xs text-zinc-500">{description}</p>
    )}
  </div>
))
NerveLabel.displayName = LabelPrimitive.Root.displayName

export { NerveLabel }
