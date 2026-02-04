// =============================================================================
// Animation Presets - Framer Motion variants for consistent animations
// =============================================================================

import { Variants, Transition } from "framer-motion"

// =============================================================================
// Transitions
// =============================================================================

export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
}

export const smoothTransition: Transition = {
  type: "tween",
  ease: [0.4, 0, 0.2, 1],
  duration: 0.3,
}

export const quickTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.15,
}

// =============================================================================
// Fade Variants
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: quickTransition },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -10, transition: quickTransition },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: 10, transition: quickTransition },
}

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.95, transition: quickTransition },
}

// =============================================================================
// Slide Variants
// =============================================================================

export const slideInRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: smoothTransition },
  exit: { x: "100%", opacity: 0, transition: smoothTransition },
}

export const slideInLeft: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: smoothTransition },
  exit: { x: "-100%", opacity: 0, transition: smoothTransition },
}

export const slideInBottom: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: smoothTransition },
  exit: { y: "100%", opacity: 0, transition: smoothTransition },
}

// =============================================================================
// List/Stagger Variants
// =============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
}

export const staggerFadeItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
}

// =============================================================================
// Interactive Variants
// =============================================================================

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: quickTransition,
  },
}

export const reactionPop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { duration: 0.1 },
  },
}

// =============================================================================
// Card/Panel Variants
// =============================================================================

export const cardHover = {
  rest: { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    transition: smoothTransition,
  },
  tap: { scale: 0.98 },
}

export const expandCollapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: smoothTransition,
      opacity: { delay: 0.1, duration: 0.2 },
    },
  },
}

// =============================================================================
// Page Transition Variants
// =============================================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// =============================================================================
// Modal/Dialog Variants
// =============================================================================

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: quickTransition,
  },
}

// =============================================================================
// Notification/Toast Variants
// =============================================================================

export const toastSlideIn: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: quickTransition,
  },
}

// =============================================================================
// Skeleton/Loading Variants
// =============================================================================

export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    },
  },
}

export const pulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 0.8,
    },
  },
}
