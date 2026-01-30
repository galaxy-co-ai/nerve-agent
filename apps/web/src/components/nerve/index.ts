/**
 * Nerve UI Kit
 *
 * Premium component library built on top of shadcn/ui
 * with tactile depth, glow effects, and the Nerve design system.
 *
 * @see docs/DESIGN_SYSTEM.md for usage guidelines
 */

// =============================================================================
// Primitives - Low-level building blocks
// =============================================================================

export { Surface } from "./primitives/surface"
export type { SurfaceLevel } from "./primitives/surface"

export { Glow, getGlowStyles, glowClasses } from "./primitives/glow"
export type { GlowIntensity, GlowColor } from "./primitives/glow"

export { Well } from "./primitives/well"

// =============================================================================
// Backgrounds - Premium background treatments
// =============================================================================

export { DotGrid } from "./backgrounds/dot-grid"
export { Noise } from "./backgrounds/noise"
export { Vignette } from "./backgrounds/vignette"
export { AmbientGlow } from "./backgrounds/ambient-glow"

// =============================================================================
// Components - Ready-to-use UI components
// =============================================================================

// Button
export { NerveButton } from "./components/nerve-button"
export type { NerveButtonProps } from "./components/nerve-button"

// Card
export {
  NerveCard,
  NerveCardHeader,
  NerveCardTitle,
  NerveCardDescription,
  NerveCardContent,
  NerveCardFooter,
} from "./components/nerve-card"
export type { NerveCardProps } from "./components/nerve-card"

// Toggle
export { NerveToggle } from "./components/nerve-toggle"
export type { NerveToggleProps } from "./components/nerve-toggle"

// Input
export { NerveInput } from "./components/nerve-input"
export type { NerveInputProps } from "./components/nerve-input"

// Textarea
export { NerveTextarea } from "./components/nerve-textarea"
export type { NerveTextareaProps } from "./components/nerve-textarea"

// Tabs
export {
  NerveTabs,
  NerveTabsList,
  NerveTabsTrigger,
  NerveTabsContent,
} from "./components/nerve-tabs"

// Select
export {
  NerveSelect,
  NerveSelectGroup,
  NerveSelectValue,
  NerveSelectTrigger,
  NerveSelectContent,
  NerveSelectLabel,
  NerveSelectItem,
  NerveSelectSeparator,
} from "./components/nerve-select"

// Badge
export { NerveBadge } from "./components/nerve-badge"
export type { NerveBadgeProps } from "./components/nerve-badge"

// Dialog
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
} from "./components/nerve-dialog"

// Tooltip
export {
  NerveTooltip,
  NerveTooltipTrigger,
  NerveTooltipContent,
  NerveTooltipProvider,
  NerveTooltipArrow,
} from "./components/nerve-tooltip"

// Progress
export { NerveProgress } from "./components/nerve-progress"
export type { NerveProgressProps } from "./components/nerve-progress"

// Avatar
export {
  NerveAvatar,
  NerveAvatarImage,
  NerveAvatarFallback,
} from "./components/nerve-avatar"
export type { NerveAvatarProps } from "./components/nerve-avatar"

// Separator
export { NerveSeparator } from "./components/nerve-separator"
export type { NerveSeparatorProps } from "./components/nerve-separator"

// Skeleton
export {
  NerveSkeleton,
  NerveSkeletonCard,
  NerveSkeletonListItem,
} from "./components/nerve-skeleton"
export type { NerveSkeletonProps } from "./components/nerve-skeleton"

// Alert
export { NerveAlert } from "./components/nerve-alert"
export type { NerveAlertProps } from "./components/nerve-alert"
