"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nerveAlertVariants = cva(
  // Base styles
  [
    "relative w-full",
    "rounded-lg p-4",
    "border",
    // Flex layout
    "flex items-start gap-3",
    // Transition
    "transition-all duration-200",
  ],
  {
    variants: {
      variant: {
        /**
         * Default/info alert
         */
        default: [
          "bg-zinc-800/50",
          "border-zinc-700",
          "text-zinc-300",
        ],
        /**
         * Info alert with blue accent
         */
        info: [
          "bg-blue-500/10",
          "border-blue-500/30",
          "text-blue-200",
          "[&>svg]:text-blue-400",
        ],
        /**
         * Success alert with green accent
         */
        success: [
          "bg-green-500/10",
          "border-green-500/30",
          "text-green-200",
          "[&>svg]:text-green-400",
        ],
        /**
         * Warning alert with yellow accent
         */
        warning: [
          "bg-yellow-500/10",
          "border-yellow-500/30",
          "text-yellow-200",
          "[&>svg]:text-yellow-400",
        ],
        /**
         * Error/destructive alert with red accent
         */
        error: [
          "bg-red-500/10",
          "border-red-500/30",
          "text-red-200",
          "[&>svg]:text-red-400",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const alertIcons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

export interface NerveAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof nerveAlertVariants> {
  /**
   * Alert title
   */
  title?: string
  /**
   * Show dismiss button
   */
  dismissible?: boolean
  /**
   * Callback when dismissed
   */
  onDismiss?: () => void
  /**
   * Hide the icon
   */
  hideIcon?: boolean
}

/**
 * Alert banner for notifications and feedback.
 *
 * @example
 * ```tsx
 * <NerveAlert variant="success" title="Success!">
 *   Your changes have been saved.
 * </NerveAlert>
 *
 * <NerveAlert variant="error" dismissible onDismiss={() => {}}>
 *   Something went wrong.
 * </NerveAlert>
 * ```
 */
export const NerveAlert = React.forwardRef<HTMLDivElement, NerveAlertProps>(
  (
    {
      className,
      variant = "default",
      title,
      dismissible,
      onDismiss,
      hideIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = alertIcons[variant ?? "default"]

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(nerveAlertVariants({ variant }), className)}
        {...props}
      >
        {!hideIcon && <Icon className="h-5 w-5 shrink-0 mt-0.5" />}
        <div className="flex-1 space-y-1">
          {title && (
            <h5 className="font-medium leading-none tracking-tight">{title}</h5>
          )}
          {children && (
            <div className="text-sm opacity-90">{children}</div>
          )}
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className={cn(
              "shrink-0 rounded-md p-1",
              "opacity-70 hover:opacity-100",
              "hover:bg-white/10",
              "focus:outline-none focus:ring-2 focus:ring-gold-400/50",
              "transition-all duration-150"
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    )
  }
)

NerveAlert.displayName = "NerveAlert"
