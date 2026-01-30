"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const NerveDialog = DialogPrimitive.Root
const NerveDialogTrigger = DialogPrimitive.Trigger
const NerveDialogPortal = DialogPrimitive.Portal
const NerveDialogClose = DialogPrimitive.Close

/**
 * Backdrop overlay with blur and fade
 */
const NerveDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-zinc-950/80 backdrop-blur-sm",
      // Animation
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
  />
))
NerveDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * Dialog content panel with elevation and glow
 */
const NerveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <NerveDialogPortal>
    <NerveDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Positioning
        "fixed left-[50%] top-[50%] z-50",
        "translate-x-[-50%] translate-y-[-50%]",
        "w-full max-w-lg",
        // Surface level 3 (modal)
        "bg-zinc-800",
        "border border-zinc-700",
        "rounded-xl",
        // Elevation shadow + subtle gold ambient
        "shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_60px_rgba(251,191,36,0.03)]",
        // Padding
        "p-6",
        // Animation
        "duration-200",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-4 top-4",
          "rounded-md p-1",
          "text-zinc-500",
          "opacity-70 hover:opacity-100",
          "hover:bg-zinc-700/50",
          "focus:outline-none focus:ring-2 focus:ring-gold-400/50",
          "transition-all duration-150",
          "disabled:pointer-events-none"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </NerveDialogPortal>
))
NerveDialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * Dialog header container
 */
const NerveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
NerveDialogHeader.displayName = "NerveDialogHeader"

/**
 * Dialog footer for actions
 */
const NerveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "mt-6 pt-4 border-t border-zinc-700",
      className
    )}
    {...props}
  />
)
NerveDialogFooter.displayName = "NerveDialogFooter"

/**
 * Dialog title
 */
const NerveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      "text-zinc-100",
      className
    )}
    {...props}
  />
))
NerveDialogTitle.displayName = DialogPrimitive.Title.displayName

/**
 * Dialog description
 */
const NerveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-zinc-400 mt-2", className)}
    {...props}
  />
))
NerveDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  NerveDialog,
  NerveDialogPortal,
  NerveDialogOverlay,
  NerveDialogClose,
  NerveDialogTrigger,
  NerveDialogContent,
  NerveDialogHeader,
  NerveDialogFooter,
  NerveDialogTitle,
  NerveDialogDescription,
}
