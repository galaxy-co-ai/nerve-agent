"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const nerveAvatarVariants = cva(
  // Base styles
  [
    "relative flex shrink-0 overflow-hidden",
    "rounded-full",
    // Border and surface
    "bg-zinc-800",
    "border-2 border-zinc-700",
  ],
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
      },
      /**
       * Show glow ring (for active/online status)
       */
      glow: {
        true: [
          "border-gold-400/50",
          "shadow-[0_0_12px_rgba(251,191,36,0.3)]",
        ],
        false: "",
      },
      /**
       * Status indicator color for ring
       */
      status: {
        online: "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]",
        away: "border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)]",
        busy: "border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
        offline: "border-zinc-600",
      },
    },
    defaultVariants: {
      size: "md",
      glow: false,
    },
  }
)

export interface NerveAvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof nerveAvatarVariants> {}

/**
 * Avatar root container
 */
const NerveAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  NerveAvatarProps
>(({ className, size, glow, status, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(nerveAvatarVariants({ size, glow, status }), className)}
    {...props}
  />
))
NerveAvatar.displayName = AvatarPrimitive.Root.displayName

/**
 * Avatar image
 */
const NerveAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
NerveAvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * Fallback when no image (initials or icon)
 */
const NerveAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center",
      "rounded-full",
      "bg-zinc-700",
      "text-zinc-300 font-medium",
      className
    )}
    {...props}
  />
))
NerveAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { NerveAvatar, NerveAvatarImage, NerveAvatarFallback }
