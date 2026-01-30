"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const NerveToastProvider = ToastPrimitive.Provider

/**
 * Viewport container for toasts
 */
const NerveToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4",
      "sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col",
      "md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
NerveToastViewport.displayName = ToastPrimitive.Viewport.displayName

const nerveToastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-center gap-3",
    "overflow-hidden rounded-lg p-4",
    "border",
    "shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
    // Animation
    "transition-all",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-zinc-800 border-zinc-700",
          "text-zinc-100",
        ],
        success: [
          "bg-green-500/10 border-green-500/30",
          "text-green-200",
          "[&>svg]:text-green-400",
        ],
        error: [
          "bg-red-500/10 border-red-500/30",
          "text-red-200",
          "[&>svg]:text-red-400",
        ],
        warning: [
          "bg-yellow-500/10 border-yellow-500/30",
          "text-yellow-200",
          "[&>svg]:text-yellow-400",
        ],
        info: [
          "bg-blue-500/10 border-blue-500/30",
          "text-blue-200",
          "[&>svg]:text-blue-400",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const toastIcons = {
  default: null,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

export interface NerveToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof nerveToastVariants> {}

/**
 * Toast notification with semantic variants.
 */
const NerveToast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  NerveToastProps
>(({ className, variant, children, ...props }, ref) => {
  const Icon = toastIcons[variant ?? "default"]

  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(nerveToastVariants({ variant }), className)}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 shrink-0" />}
      {children}
    </ToastPrimitive.Root>
  )
})
NerveToast.displayName = ToastPrimitive.Root.displayName

/**
 * Toast action button
 */
const NerveToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center",
      "rounded-md px-3",
      "border border-zinc-600 bg-transparent",
      "text-sm font-medium text-zinc-200",
      "hover:bg-zinc-700",
      "focus:outline-none focus:ring-2 focus:ring-gold-400/50",
      "disabled:pointer-events-none disabled:opacity-50",
      "transition-colors",
      // Group variant overrides
      "group-[.success]:border-green-500/30 group-[.success]:hover:bg-green-500/10",
      "group-[.error]:border-red-500/30 group-[.error]:hover:bg-red-500/10",
      "group-[.warning]:border-yellow-500/30 group-[.warning]:hover:bg-yellow-500/10",
      className
    )}
    {...props}
  />
))
NerveToastAction.displayName = ToastPrimitive.Action.displayName

/**
 * Toast close button
 */
const NerveToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2",
      "rounded-md p-1",
      "text-zinc-500",
      "opacity-0 group-hover:opacity-100",
      "hover:text-zinc-100 hover:bg-zinc-700/50",
      "focus:outline-none focus:ring-2 focus:ring-gold-400/50",
      "transition-all",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
NerveToastClose.displayName = ToastPrimitive.Close.displayName

/**
 * Toast title
 */
const NerveToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
NerveToastTitle.displayName = ToastPrimitive.Title.displayName

/**
 * Toast description
 */
const NerveToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
NerveToastDescription.displayName = ToastPrimitive.Description.displayName

export {
  NerveToastProvider,
  NerveToastViewport,
  NerveToast,
  NerveToastTitle,
  NerveToastDescription,
  NerveToastClose,
  NerveToastAction,
}

export type { NerveToastProps }
