"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const NervePopover = PopoverPrimitive.Root
const NervePopoverTrigger = PopoverPrimitive.Trigger
const NervePopoverAnchor = PopoverPrimitive.Anchor
const NervePopoverClose = PopoverPrimitive.Close

/**
 * Popover content panel with premium styling
 */
const NervePopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 overflow-hidden",
        "rounded-lg p-4",
        // Surface level 3
        "bg-zinc-800 border border-zinc-700",
        // Elevation shadow with subtle gold ambient
        "shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_40px_rgba(251,191,36,0.02)]",
        // Text
        "text-zinc-200",
        // Animation
        "outline-none",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
NervePopoverContent.displayName = PopoverPrimitive.Content.displayName

/**
 * Arrow pointing to trigger
 */
const NervePopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn("fill-zinc-800", className)}
    {...props}
  />
))
NervePopoverArrow.displayName = PopoverPrimitive.Arrow.displayName

export {
  NervePopover,
  NervePopoverTrigger,
  NervePopoverContent,
  NervePopoverAnchor,
  NervePopoverClose,
  NervePopoverArrow,
}
