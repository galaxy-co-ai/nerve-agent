"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveSwitchVariants = cva(
  // Base track styles
  [
    "peer inline-flex shrink-0 cursor-pointer items-center",
    "rounded-full border-2 border-transparent",
    "bg-zinc-700",
    // Focus ring with gold glow
    "focus-visible:outline-none",
    "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.3)]",
    // Disabled
    "disabled:cursor-not-allowed disabled:opacity-50",
    // Transition
    "transition-all duration-200",
    // Checked state - gold with glow
    "data-[state=checked]:bg-gold-400",
    "data-[state=checked]:shadow-[0_0_12px_rgba(251,191,36,0.3)]",
  ],
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const nerveThumbVariants = cva(
  // Base thumb styles
  [
    "pointer-events-none block rounded-full",
    "bg-zinc-100",
    "shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
    "ring-0",
    "transition-transform duration-200",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface NerveSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof nerveSwitchVariants> {}

/**
 * Toggle switch with gold accent and glow effect.
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <NerveSwitch id="notifications" />
 *   <NerveLabel htmlFor="notifications">Enable notifications</NerveLabel>
 * </div>
 * ```
 */
const NerveSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  NerveSwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(nerveSwitchVariants({ size }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb className={cn(nerveThumbVariants({ size }))} />
  </SwitchPrimitive.Root>
))
NerveSwitch.displayName = SwitchPrimitive.Root.displayName

export { NerveSwitch }
