"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"
import { NerveButton } from "./nerve-button"

const NerveAlertDialog = AlertDialogPrimitive.Root
const NerveAlertDialogTrigger = AlertDialogPrimitive.Trigger
const NerveAlertDialogPortal = AlertDialogPrimitive.Portal

/**
 * Alert dialog overlay backdrop
 */
const NerveAlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50",
      "bg-zinc-950/80 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
NerveAlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * Alert dialog content panel
 */
const NerveAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NerveAlertDialogPortal>
    <NerveAlertDialogOverlay />
    <AlertDialogPrimitive.Content
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
        // Elevation shadow
        "shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
        // Padding
        "p-6",
        // Animation
        "duration-200",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        className
      )}
      {...props}
    />
  </NerveAlertDialogPortal>
))
NerveAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/**
 * Alert dialog header
 */
const NerveAlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
)
NerveAlertDialogHeader.displayName = "NerveAlertDialogHeader"

/**
 * Alert dialog footer for actions
 */
const NerveAlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "mt-6",
      className
    )}
    {...props}
  />
)
NerveAlertDialogFooter.displayName = "NerveAlertDialogFooter"

/**
 * Alert dialog title
 */
const NerveAlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-zinc-100", className)}
    {...props}
  />
))
NerveAlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

/**
 * Alert dialog description
 */
const NerveAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-zinc-400", className)}
    {...props}
  />
))
NerveAlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

/**
 * Alert dialog cancel action
 */
const NerveAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel asChild>
    <NerveButton
      ref={ref}
      variant="secondary"
      className={cn("mt-2 sm:mt-0", className)}
      {...props}
    />
  </AlertDialogPrimitive.Cancel>
))
NerveAlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

/**
 * Alert dialog confirm action (destructive by default)
 */
const NerveAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> & {
    variant?: "primary" | "destructive"
  }
>(({ className, variant = "destructive", ...props }, ref) => (
  <AlertDialogPrimitive.Action asChild>
    <NerveButton ref={ref} variant={variant} className={className} {...props} />
  </AlertDialogPrimitive.Action>
))
NerveAlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

export {
  NerveAlertDialog,
  NerveAlertDialogPortal,
  NerveAlertDialogOverlay,
  NerveAlertDialogTrigger,
  NerveAlertDialogContent,
  NerveAlertDialogHeader,
  NerveAlertDialogFooter,
  NerveAlertDialogTitle,
  NerveAlertDialogDescription,
  NerveAlertDialogAction,
  NerveAlertDialogCancel,
}
