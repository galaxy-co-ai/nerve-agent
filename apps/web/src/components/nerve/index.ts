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

export { NerveButton } from "./components/nerve-button"
export type { NerveButtonProps } from "./components/nerve-button"

export {
  NerveCard,
  NerveCardHeader,
  NerveCardTitle,
  NerveCardDescription,
  NerveCardContent,
  NerveCardFooter,
} from "./components/nerve-card"
export type { NerveCardProps } from "./components/nerve-card"

export { NerveToggle } from "./components/nerve-toggle"
export type { NerveToggleProps } from "./components/nerve-toggle"

export { NerveInput } from "./components/nerve-input"
export type { NerveInputProps } from "./components/nerve-input"
