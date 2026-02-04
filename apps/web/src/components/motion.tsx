// =============================================================================
// Motion Components - Animated wrappers using Framer Motion
// =============================================================================

"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionProps } from "framer-motion"
import {
  fadeIn,
  fadeInUp,
  fadeInScale,
  staggerContainer,
  staggerItem,
  popIn,
  slideInRight,
  slideInBottom,
  pageTransition,
  cardHover,
} from "@/lib/animations"
import { cn } from "@/lib/utils"

// =============================================================================
// Types
// =============================================================================

type MotionDivProps = React.HTMLAttributes<HTMLDivElement> & MotionProps

// =============================================================================
// Basic Animated Containers
// =============================================================================

export function FadeIn({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeInUp({
  children,
  className,
  delay = 0,
  ...props
}: MotionDivProps & { delay?: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={delay}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeInScale({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      variants={fadeInScale}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function PopIn({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      variants={popIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// Slide Containers
// =============================================================================

export function SlideInRight({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      variants={slideInRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SlideInBottom({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div
      variants={slideInBottom}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// Page Transition Wrapper
// =============================================================================

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// Staggered List
// =============================================================================

interface StaggeredListProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 0.05,
}: StaggeredListProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredItem({
  children,
  className,
  ...props
}: MotionDivProps) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  )
}

// =============================================================================
// Animated Card (with hover effect)
// =============================================================================

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}

export function AnimatedCard({
  children,
  className,
  interactive = true,
  onClick,
}: AnimatedCardProps) {
  if (!interactive) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn("cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// Animated Presence Wrapper (for conditional rendering)
// =============================================================================

interface AnimatedPresenceWrapperProps {
  children: React.ReactNode
  show: boolean
  mode?: "sync" | "wait" | "popLayout"
}

export function AnimatedPresenceWrapper({
  children,
  show,
  mode = "sync",
}: AnimatedPresenceWrapperProps) {
  return (
    <AnimatePresence mode={mode}>
      {show && children}
    </AnimatePresence>
  )
}

// =============================================================================
// Animated Counter
// =============================================================================

interface AnimatedCounterProps {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={className}
    >
      {value}
    </motion.span>
  )
}

// =============================================================================
// Pulse Indicator (for real-time status)
// =============================================================================

interface PulseIndicatorProps {
  color?: "green" | "yellow" | "red" | "blue"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PulseIndicator({
  color = "green",
  size = "md",
  className,
}: PulseIndicatorProps) {
  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  }

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  return (
    <span className={cn("relative inline-flex", className)}>
      <motion.span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75",
          colorClasses[color]
        )}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.75, 0, 0.75],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span
        className={cn(
          "relative inline-flex rounded-full",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
    </span>
  )
}

// =============================================================================
// Skeleton with Shimmer
// =============================================================================

interface ShimmerSkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function ShimmerSkeleton({
  className,
  width,
  height,
}: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        className
      )}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["−100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

// =============================================================================
// Loading Dots
// =============================================================================

export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  )
}

// =============================================================================
// Progress Ring
// =============================================================================

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({
  progress,
  size = 40,
  strokeWidth = 4,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      className={cn("transform -rotate-90", className)}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted opacity-20"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-primary"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
        }}
      />
    </svg>
  )
}
