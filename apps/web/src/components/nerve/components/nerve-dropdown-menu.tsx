"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const NerveDropdownMenu = DropdownMenuPrimitive.Root
const NerveDropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const NerveDropdownMenuGroup = DropdownMenuPrimitive.Group
const NerveDropdownMenuPortal = DropdownMenuPrimitive.Portal
const NerveDropdownMenuSub = DropdownMenuPrimitive.Sub
const NerveDropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

/**
 * Trigger for submenu
 */
const NerveDropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2",
      "rounded-md px-2 py-1.5",
      "text-sm text-zinc-300",
      "outline-none",
      "focus:bg-zinc-700/50 focus:text-zinc-100",
      "data-[state=open]:bg-zinc-700/50",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
NerveDropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

/**
 * Submenu content panel
 */
const NerveDropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden",
      "rounded-lg p-1",
      "bg-zinc-800 border border-zinc-700",
      "shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
      // Animation
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
))
NerveDropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

/**
 * Main dropdown content panel
 */
const NerveDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden",
        "rounded-lg p-1",
        // Surface level 3
        "bg-zinc-800 border border-zinc-700",
        // Elevation shadow with subtle gold ambient
        "shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_40px_rgba(251,191,36,0.02)]",
        // Animation
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
  </DropdownMenuPrimitive.Portal>
))
NerveDropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

/**
 * Menu item
 */
const NerveDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
    destructive?: boolean
  }
>(({ className, inset, destructive, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-md px-2 py-1.5",
      "text-sm outline-none",
      "transition-colors duration-100",
      // Default styling
      destructive
        ? "text-red-400 focus:bg-red-500/10 focus:text-red-300"
        : "text-zinc-300 focus:bg-zinc-700/50 focus:text-zinc-100",
      // Disabled
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
NerveDropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

/**
 * Checkbox item
 */
const NerveDropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center",
      "rounded-md py-1.5 pl-8 pr-2",
      "text-sm text-zinc-300 outline-none",
      "focus:bg-zinc-700/50 focus:text-zinc-100",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-gold-400" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
NerveDropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

/**
 * Radio item
 */
const NerveDropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center",
      "rounded-md py-1.5 pl-8 pr-2",
      "text-sm text-zinc-300 outline-none",
      "focus:bg-zinc-700/50 focus:text-zinc-100",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-gold-400 text-gold-400" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
NerveDropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

/**
 * Section label
 */
const NerveDropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5",
      "text-xs font-medium text-zinc-500 uppercase tracking-wider",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
NerveDropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

/**
 * Separator between groups
 */
const NerveDropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-zinc-700", className)}
    {...props}
  />
))
NerveDropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

/**
 * Keyboard shortcut hint
 */
const NerveDropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-zinc-500", className)}
      {...props}
    />
  )
}
NerveDropdownMenuShortcut.displayName = "NerveDropdownMenuShortcut"

export {
  NerveDropdownMenu,
  NerveDropdownMenuTrigger,
  NerveDropdownMenuContent,
  NerveDropdownMenuItem,
  NerveDropdownMenuCheckboxItem,
  NerveDropdownMenuRadioItem,
  NerveDropdownMenuLabel,
  NerveDropdownMenuSeparator,
  NerveDropdownMenuShortcut,
  NerveDropdownMenuGroup,
  NerveDropdownMenuPortal,
  NerveDropdownMenuSub,
  NerveDropdownMenuSubContent,
  NerveDropdownMenuSubTrigger,
  NerveDropdownMenuRadioGroup,
}
