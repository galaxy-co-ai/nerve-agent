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

// Chrome/Hardware-inspired primitives
export { ChromeShell } from "./primitives/chrome-shell"
export { Canvas } from "./primitives/canvas"

// =============================================================================
// Controls - Hardware-inspired interactive elements
// =============================================================================

export { Orb } from "./controls/orb"
export { PillToggle } from "./controls/pill-toggle"
export { PowerButton } from "./controls/power-button"
export { DialKnob } from "./controls/dial-knob"
export { Readout } from "./controls/readout"

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

// Checkbox
export { NerveCheckbox } from "./components/nerve-checkbox"
export type { NerveCheckboxProps } from "./components/nerve-checkbox"

// Switch
export { NerveSwitch } from "./components/nerve-switch"
export type { NerveSwitchProps } from "./components/nerve-switch"

// Label
export { NerveLabel } from "./components/nerve-label"
export type { NerveLabelProps } from "./components/nerve-label"

// Dropdown Menu
export {
  NerveDropdownMenu,
  NerveDropdownMenuTrigger,
  NerveDropdownMenuContent,
  NerveDropdownMenuItem,
  NerveDropdownMenuCheckboxItem,
  NerveDropdownMenuRadioItem,
  NerveDropdownMenuLabel,
  NerveDropdownMenuSeparator,
  NerveDropdownMenuShortcut,
  NerveDropdownMenuGroup,
  NerveDropdownMenuPortal,
  NerveDropdownMenuSub,
  NerveDropdownMenuSubContent,
  NerveDropdownMenuSubTrigger,
  NerveDropdownMenuRadioGroup,
} from "./components/nerve-dropdown-menu"

// Toast
export {
  NerveToastProvider,
  NerveToastViewport,
  NerveToast,
  NerveToastTitle,
  NerveToastDescription,
  NerveToastClose,
  NerveToastAction,
} from "./components/nerve-toast"
export type { NerveToastProps } from "./components/nerve-toast"

// Popover
export {
  NervePopover,
  NervePopoverTrigger,
  NervePopoverContent,
  NervePopoverAnchor,
  NervePopoverClose,
  NervePopoverArrow,
} from "./components/nerve-popover"

// Sheet
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
} from "./components/nerve-sheet"
export type { NerveSheetContentProps } from "./components/nerve-sheet"

// Alert Dialog
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
} from "./components/nerve-alert-dialog"
