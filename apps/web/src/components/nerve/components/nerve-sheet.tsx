"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const NerveSheet = SheetPrimitive.Root
const NerveSheetTrigger = SheetPrimitive.Trigger
const NerveSheetClose = SheetPrimitive.Close
const NerveSheetPortal = SheetPrimitive.Portal

/**
 * Sheet overlay backdrop
 */
const NerveSheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
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
NerveSheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const nerveSheetVariants = cva(
  [
    "fixed z-50 gap-4 p-6",
    "bg-zinc-900 border-zinc-800",
    "shadow-[0_0_50px_rgba(0,0,0,0.5)]",
    "transition ease-in-out",
    "data-[state=open]:animate-in data-[state=open]:duration-300",
    "data-[state=closed]:animate-out data-[state=closed]:duration-200",
  ],
  {
    variants: {
      side: {
        top: [
          "inset-x-0 top-0 border-b",
          "data-[state=open]:slide-in-from-top",
          "data-[state=closed]:slide-out-to-top",
        ],
        bottom: [
          "inset-x-0 bottom-0 border-t",
          "data-[state=open]:slide-in-from-bottom",
          "data-[state=closed]:slide-out-to-bottom",
        ],
        left: [
          "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          "data-[state=open]:slide-in-from-left",
          "data-[state=closed]:slide-out-to-left",
        ],
        right: [
          "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          "data-[state=open]:slide-in-from-right",
          "data-[state=closed]:slide-out-to-right",
        ],
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

export interface NerveSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof nerveSheetVariants> {}

/**
 * Sheet content panel that slides in from edge
 */
const NerveSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  NerveSheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <NerveSheetPortal>
    <NerveSheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(nerveSheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close
        className={cn(
          "absolute right-4 top-4",
          "rounded-md p-1",
          "text-zinc-500",
          "opacity-70 hover:opacity-100",
          "hover:bg-zinc-800",
          "focus:outline-none focus:ring-2 focus:ring-gold-400/50",
          "transition-all duration-150",
          "disabled:pointer-events-none"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </NerveSheetPortal>
))
NerveSheetContent.displayName = SheetPrimitive.Content.displayName

/**
 * Sheet header
 */
const NerveSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
)
NerveSheetHeader.displayName = "NerveSheetHeader"

/**
 * Sheet footer
 */
const NerveSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
NerveSheetFooter.displayName = "NerveSheetFooter"

/**
 * Sheet title
 */
const NerveSheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-zinc-100", className)}
    {...props}
  />
))
NerveSheetTitle.displayName = SheetPrimitive.Title.displayName

/**
 * Sheet description
 */
const NerveSheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-zinc-400", className)}
    {...props}
  />
))
NerveSheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  NerveSheet,
  NerveSheetPortal,
  NerveSheetOverlay,
  NerveSheetTrigger,
  NerveSheetClose,
  NerveSheetContent,
  NerveSheetHeader,
  NerveSheetFooter,
  NerveSheetTitle,
  NerveSheetDescription,
}
