"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChromeShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg"
  /**
   * Whether to show the header bar with controls
   */
  showHeader?: boolean
  /**
   * Left header content (e.g., power button)
   */
  headerLeft?: React.ReactNode
  /**
   * Center header content (e.g., title/logo)
   */
  headerCenter?: React.ReactNode
  /**
   * Right header content (e.g., output knob)
   */
  headerRight?: React.ReactNode
  /**
   * Footer content (e.g., pill toggle)
   */
  footer?: React.ReactNode
}

/**
 * Chrome Shell - Premium hardware-inspired outer container.
 * Creates the white "housing" look seen in high-end audio plugins.
 *
 * @example
 * ```tsx
 * <ChromeShell
 *   showHeader
 *   headerLeft={<PowerButton />}
 *   headerCenter={<Logo />}
 *   headerRight={<OutputKnob />}
 *   footer={<PillToggle options={['SOFT', 'MEDIUM', 'HARD']} />}
 * >
 *   <Canvas>...</Canvas>
 * </ChromeShell>
 * ```
 */
export const ChromeShell = React.forwardRef<HTMLDivElement, ChromeShellProps>(
  (
    {
      size = "lg",
      showHeader = true,
      headerLeft,
      headerCenter,
      headerRight,
      footer,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "p-3 rounded-2xl",
      md: "p-4 rounded-[20px]",
      lg: "p-5 rounded-[24px]",
    }

    const headerPadding = {
      sm: "px-3 py-2",
      md: "px-4 py-3",
      lg: "px-5 py-4",
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base shell
          "relative",
          "bg-[#f8f8fa]",
          sizeStyles[size],
          // Premium shadow and depth
          "shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)]",
          // Subtle inner highlight
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-b before:from-white/80 before:to-transparent before:pointer-events-none",
          "before:opacity-50",
          // Outer subtle border
          "ring-1 ring-black/[0.04]",
          className
        )}
        {...props}
      >
        {/* Header */}
        {showHeader && (
          <div
            className={cn(
              "flex items-center justify-between",
              headerPadding[size],
              "mb-3"
            )}
          >
            <div className="flex items-center gap-2">
              {headerLeft}
            </div>
            <div className="flex-1 flex justify-center">
              {headerCenter}
            </div>
            <div className="flex items-center gap-2">
              {headerRight}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="relative">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-3">
            {footer}
          </div>
        )}
      </div>
    )
  }
)

ChromeShell.displayName = "ChromeShell"
