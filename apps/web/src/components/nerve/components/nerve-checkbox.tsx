"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveCheckboxVariants = cva(
  // Base styles
  [
    "peer shrink-0",
    "rounded-[4px]",
    "border border-zinc-600",
    "bg-zinc-900",
    // Focus ring with gold glow
    "focus-visible:outline-none",
    "focus-visible:border-gold-400/50",
    "focus-visible:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.3)]",
    // Disabled
    "disabled:cursor-not-allowed disabled:opacity-50",
    // Transition
    "transition-all duration-150",
    // Checked state
    "data-[state=checked]:bg-gold-400 data-[state=checked]:border-gold-400",
    "data-[state=checked]:shadow-[0_0_8px_rgba(251,191,36,0.3)]",
    // Indeterminate state
    "data-[state=indeterminate]:bg-gold-400 data-[state=indeterminate]:border-gold-400",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface NerveCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof nerveCheckboxVariants> {}

/**
 * Checkbox input with gold accent and glow effect.
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <NerveCheckbox id="terms" />
 *   <NerveLabel htmlFor="terms">Accept terms</NerveLabel>
 * </div>
 * ```
 */
const NerveCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  NerveCheckboxProps
>(({ className, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(nerveCheckboxVariants({ size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-zinc-900")}
    >
      {props.checked === "indeterminate" ? (
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      ) : (
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
NerveCheckbox.displayName = CheckboxPrimitive.Root.displayName

export { NerveCheckbox }
