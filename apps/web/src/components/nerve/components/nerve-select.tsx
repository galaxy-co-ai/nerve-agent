"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const NerveSelect = SelectPrimitive.Root
const NerveSelectGroup = SelectPrimitive.Group
const NerveSelectValue = SelectPrimitive.Value

/**
 * Select trigger button with glow focus state
 */
const NerveSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      "flex h-10 w-full items-center justify-between gap-2",
      "rounded-md px-3 py-2",
      "text-sm",
      // Surface styling
      "bg-zinc-900",
      "border border-zinc-700",
      "text-zinc-100",
      // Raised effect
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_1px_2px_rgba(0,0,0,0.2)]",
      // Placeholder
      "placeholder:text-zinc-500",
      // Hover
      "hover:border-zinc-600",
      "hover:bg-zinc-800/50",
      // Focus with gold glow
      "focus:outline-none",
      "focus:border-gold-400/50",
      "focus:shadow-[0_0_0_2px_rgba(9,9,11,1),0_0_0_4px_rgba(251,191,36,0.3),0_0_15px_rgba(251,191,36,0.1)]",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Transition
      "transition-all duration-150",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-zinc-500" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
NerveSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * Scroll up button in dropdown
 */
const NerveSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      "text-zinc-400",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
NerveSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

/**
 * Scroll down button in dropdown
 */
const NerveSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      "text-zinc-400",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
NerveSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

/**
 * Dropdown content panel with elevation
 */
const NerveSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // Positioning
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden",
        // Surface level 3 (popover)
        "bg-zinc-800",
        "border border-zinc-700",
        "rounded-lg",
        // Elevation shadow
        "shadow-[0_4px_8px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]",
        // Animation
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <NerveSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <NerveSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
NerveSelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * Label for option groups
 */
const NerveSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5",
      "text-xs font-medium text-zinc-500 uppercase tracking-wider",
      className
    )}
    {...props}
  />
))
NerveSelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * Individual select option with gold highlight
 */
const NerveSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // Base
      "relative flex w-full cursor-pointer select-none items-center",
      "rounded-md py-2 pl-8 pr-2",
      "text-sm text-zinc-300",
      "outline-none",
      // Hover/focus
      "focus:bg-zinc-700/50 focus:text-zinc-100",
      // Selected
      "data-[state=checked]:text-gold-400",
      // Disabled
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Transition
      "transition-colors duration-100",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-gold-400" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
NerveSelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * Separator between option groups
 */
const NerveSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-zinc-700", className)}
    {...props}
  />
))
NerveSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  NerveSelect,
  NerveSelectGroup,
  NerveSelectValue,
  NerveSelectTrigger,
  NerveSelectContent,
  NerveSelectLabel,
  NerveSelectItem,
  NerveSelectSeparator,
  NerveSelectScrollUpButton,
  NerveSelectScrollDownButton,
}
