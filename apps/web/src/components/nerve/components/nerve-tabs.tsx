"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

/**
 * Root tabs container
 */
const NerveTabs = TabsPrimitive.Root

/**
 * Tab list with premium styling and gold accent on active tab
 */
const NerveTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Container styling - recessed well
      "inline-flex h-10 items-center justify-center gap-1",
      "rounded-lg p-1",
      "bg-zinc-900/50",
      "border border-zinc-800",
      // Inset shadow for depth
      "shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]",
      className
    )}
    {...props}
  />
))
NerveTabsList.displayName = TabsPrimitive.List.displayName

/**
 * Individual tab trigger with glow on active state
 */
const NerveTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      "inline-flex items-center justify-center whitespace-nowrap",
      "rounded-md px-3 py-1.5",
      "text-sm font-medium",
      "transition-all duration-150 ease-out",
      // Inactive state
      "text-zinc-400",
      "hover:text-zinc-200 hover:bg-zinc-800/50",
      // Focus
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-gold-400/50",
      // Disabled
      "disabled:pointer-events-none disabled:opacity-50",
      // Active state - gold accent with glow
      "data-[state=active]:bg-zinc-800",
      "data-[state=active]:text-gold-400",
      "data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.2),0_0_10px_rgba(251,191,36,0.1)]",
      className
    )}
    {...props}
  />
))
NerveTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * Tab content panel
 */
const NerveTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4",
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-gold-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
      // Animate in
      "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0",
      "data-[state=active]:animate-in data-[state=active]:fade-in-0",
      className
    )}
    {...props}
  />
))
NerveTabsContent.displayName = TabsPrimitive.Content.displayName

export { NerveTabs, NerveTabsList, NerveTabsTrigger, NerveTabsContent }
