"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

export interface NerveSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /**
   * Optional label to show in the middle of separator
   */
  label?: string
}

/**
 * Visual separator with optional label.
 *
 * @example
 * ```tsx
 * <NerveSeparator />
 * <NerveSeparator label="or" />
 * <NerveSeparator orientation="vertical" />
 * ```
 */
const NerveSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  NerveSeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, label, ...props },
    ref
  ) => {
    if (label) {
      return (
        <div className="flex items-center gap-4">
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation="horizontal"
            className={cn(
              "shrink-0 bg-zinc-700 flex-1",
              "h-px w-full",
              className
            )}
            {...props}
          />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            {label}
          </span>
          <SeparatorPrimitive.Root
            decorative={decorative}
            orientation="horizontal"
            className={cn(
              "shrink-0 bg-zinc-700 flex-1",
              "h-px w-full",
              className
            )}
          />
        </div>
      )
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-zinc-700",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className
        )}
        {...props}
      />
    )
  }
)

NerveSeparator.displayName = "NerveSeparator"

export { NerveSeparator }
