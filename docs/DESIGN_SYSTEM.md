# Nerve Agent Design System

> **Version:** 1.0.0
> **Last Updated:** January 2026
> **Status:** Active

This document is the source of truth for all visual and interaction design decisions in Nerve Agent. Contributors must follow these guidelines to maintain consistency and quality.

---

## Table of Contents

1. [Brand Foundation](#brand-foundation)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Sizing](#spacing--sizing)
5. [Elevation & Depth](#elevation--depth)
6. [Glow System](#glow-system)
7. [Backgrounds](#backgrounds)
8. [Animation](#animation)
9. [Component Library](#component-library)
10. [Contributor Guidelines](#contributor-guidelines)

---

## Brand Foundation

### Personality

Nerve Agent embodies four core traits:

| Trait | Meaning | Design Implication |
|-------|---------|-------------------|
| **Intuitive** | Feels obvious, zero learning curve | Clear visual hierarchy, consistent patterns |
| **Agile** | Fast, responsive, lightweight | Snappy animations, no bloat, instant feedback |
| **Decisive** | Opinionated, makes choices for you | Bold typography, clear CTAs, confident layouts |
| **Collaborative** | Works with you, not against you | Warm accent color, helpful states, clear communication |

### Design Principles

1. **Depth over flatness** — Surfaces have dimension. Shadows, glows, and layers create hierarchy.
2. **Light as interface** — Accent colors emit light. Active states glow. The UI feels alive.
3. **Tactile quality** — Controls feel physical. Buttons press, toggles slide, cards lift.
4. **Disciplined restraint** — Generous whitespace. Few colors. Every element earns its place.
5. **Dark canvas, bright moments** — Deep blacks as foundation, accent color pops with intention.

### The Nerve Feel

Imagine high-end audio software meets a premium fintech dashboard. Professional, precise, powerful — but warm enough that you want to use it daily.

---

## Color System

### Philosophy

Colors are divided into two categories:
- **Locked colors**: Brand identity, cannot be changed by users
- **Switchable colors**: User-selectable accent (gold is default)

### Nerve Gold (Primary Accent)

Gold was chosen for its association with value, precision, and premium quality. The key to gold that doesn't look brown: **high luminosity + glow emission**.

```
NERVE GOLD PALETTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Token           Hex        Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
gold-50         #FFFBEB    Subtle backgrounds, tints
gold-100        #FEF3C7    Light highlights
gold-200        #FDE68A    Disabled states (with opacity)
gold-300        #FCD34D    Light accents, borders
gold-400        #FBBF24    ★ PRIMARY - buttons, active states
gold-500        #F59E0B    Hover states
gold-600        #D97706    Pressed/active states
gold-700        #B45309    Dark accents
gold-800        #92400E    Text on light backgrounds
gold-900        #78350F    Darkest accent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Neutral Palette (Locked)

Based on Zinc for its subtle warmth compared to pure gray.

```
NEUTRAL PALETTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Token           Hex        Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
zinc-950        #09090B    Base canvas, deepest black
zinc-900        #18181B    Elevated surfaces (level 1)
zinc-800        #27272A    Cards, panels (level 2)
zinc-700        #3F3F46    Borders, dividers
zinc-600        #52525B    Subtle borders, disabled icons
zinc-500        #71717A    Placeholder text, muted icons
zinc-400        #A1A1AA    Secondary text
zinc-300        #D4D4D8    Primary text (on dark)
zinc-200        #E4E4E7    Emphasized text
zinc-100        #F4F4F5    Headings, high emphasis
zinc-50         #FAFAFA    Maximum contrast text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Semantic Colors (Locked)

```
SEMANTIC COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose         Base       Glow/Light            Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Success         #22C55E    rgba(34,197,94,0.3)   Completed, positive
Warning         #EAB308    rgba(234,179,8,0.3)   Attention needed
Error           #EF4444    rgba(239,68,68,0.3)   Failed, destructive
Info            #3B82F6    rgba(59,130,246,0.3)  Informational
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Color Usage Rules

**DO:**
- Use gold-400 as the primary action color
- Apply glow effects to active/focused gold elements
- Use zinc scale for all neutral needs
- Maintain 4.5:1 contrast ratio minimum for text

**DON'T:**
- Mix gold with other warm colors (red, orange)
- Use pure black (#000000) — always use zinc-950
- Use pure white (#FFFFFF) for large areas — use zinc-50/100
- Create new grays outside the zinc scale

---

## Typography

### Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Type Scale

```
TYPE SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Token        Size     Line Height   Weight    Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
text-xs      12px     16px          400       Captions, metadata
text-sm      14px     20px          400       Secondary text, labels
text-base    16px     24px          400       Body text
text-lg      18px     28px          500       Emphasized body
text-xl      20px     28px          600       Section headers
text-2xl     24px     32px          600       Card titles
text-3xl     30px     36px          700       Page headers
text-4xl     36px     40px          700       Hero numbers
text-5xl     48px     48px          700       Dashboard metrics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Typography Rules

**DO:**
- Use uppercase + letter-spacing (0.05em) for small labels
- Use tabular numbers for data/metrics (font-variant-numeric: tabular-nums)
- Maintain consistent line-height ratios

**DON'T:**
- Use more than 3 font weights on a single screen
- Go below 12px for any text
- Use italics (except for code comments)

---

## Spacing & Sizing

### Base Unit

All spacing derives from a 4px base unit.

```
SPACING SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Token    Value    Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0.5      2px      Hairline gaps
1        4px      Tight spacing
1.5      6px      Compact elements
2        8px      Default gap
3        12px     Component padding
4        16px     Card padding
5        20px     Section gaps
6        24px     Large gaps
8        32px     Section margins
10       40px     Page sections
12       48px     Major divisions
16       64px     Hero spacing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Border Radius

```
RADIUS SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Token        Value    Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
radius-sm    4px      Small elements, tags
radius-md    6px      Buttons, inputs
radius-lg    8px      Cards, panels
radius-xl    12px     Modals, large cards
radius-2xl   16px     Feature sections
radius-full  9999px   Pills, avatars
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Elevation & Depth

### Philosophy

Nerve Agent uses a **layered surface system**. Each elevation level gains:
- Lighter background tone
- More prominent shadow
- Increased glow intensity (for interactive elements)

### Surface Levels

```
ELEVATION SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level   Background   Shadow                                Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0       zinc-950     none                                  Page canvas
1       zinc-900     0 1px 2px rgba(0,0,0,0.3)            Sidebar, nav
2       zinc-800     0 2px 4px rgba(0,0,0,0.3),           Cards, panels
                     0 1px 2px rgba(0,0,0,0.2)
3       zinc-700     0 4px 8px rgba(0,0,0,0.3),           Popovers, modals
                     0 2px 4px rgba(0,0,0,0.2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tactile Depth Techniques

**Raised surfaces:**
```css
.surface-raised {
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.05) inset,  /* top highlight */
    0 2px 4px rgba(0,0,0,0.3);              /* drop shadow */
}
```

**Recessed/well areas:**
```css
.surface-well {
  background: rgba(0,0,0,0.2);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.3) inset,        /* inner shadow */
    0 -1px 0 rgba(255,255,255,0.02) inset;  /* bottom edge */
}
```

**Interactive lift (hover):**
```css
.surface-lift:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(0,0,0,0.3),
    0 2px 4px rgba(0,0,0,0.2);
}
```

---

## Glow System

### Philosophy

Glow is what separates Nerve Agent from flat UIs. Accent colors **emit light** — they don't just sit on the surface.

### Glow Intensities

```
GLOW LEVELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level     Box-Shadow                                    Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
subtle    0 0 10px rgba(251,191,36,0.1)                Idle state
soft      0 0 15px rgba(251,191,36,0.2),               Hover
          0 0 30px rgba(251,191,36,0.1)
medium    0 0 20px rgba(251,191,36,0.3),               Focus, active
          0 0 40px rgba(251,191,36,0.15)
intense   0 0 15px rgba(251,191,36,0.4),               Emphasis, alerts
          0 0 30px rgba(251,191,36,0.25),
          0 0 60px rgba(251,191,36,0.1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Glow Application Rules

**DO:**
- Apply glow to primary action buttons
- Intensify glow on hover/focus
- Use glow on status indicators
- Animate glow transitions (200-300ms)

**DON'T:**
- Apply glow to every element
- Use glow on static/decorative elements
- Make glow so intense it bleeds into adjacent content
- Use glow on text (only containers/surfaces)

### Focus Rings

Replace default browser focus with glowing rings:

```css
.focus-glow:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--background),
    0 0 0 4px rgba(251,191,36,0.5),
    0 0 20px rgba(251,191,36,0.3);
}
```

---

## Backgrounds

### Philosophy

Backgrounds should be solid but *alive*. Subtle techniques add depth without distraction.

### Available Treatments

**1. Noise Texture**
Adds subtle grain that prevents "digital flatness":
```css
.bg-noise {
  background-image: url("data:image/svg+xml,..."); /* noise SVG */
  background-blend-mode: overlay;
  opacity: 0.02;
}
```

**2. Dot Grid**
Subtle reference grid, especially for canvas/workspace areas:
```css
.bg-dot-grid {
  background-image: radial-gradient(
    circle,
    rgba(255,255,255,0.03) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

**3. Vignette**
Subtle edge darkening that draws focus to center:
```css
.bg-vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0,0,0,0.3) 100%
  );
  pointer-events: none;
}
```

**4. Ambient Glow**
Very subtle accent color light source:
```css
.bg-ambient {
  background:
    radial-gradient(
      ellipse at 20% 0%,
      rgba(251,191,36,0.03) 0%,
      transparent 50%
    ),
    var(--bg-base);
}
```

### Background Rules

**DO:**
- Combine treatments subtly (noise + vignette)
- Use dot grid for workspace/canvas areas
- Keep opacity extremely low (0.02-0.05)

**DON'T:**
- Use gradient color transitions
- Make textures visible at a glance
- Apply textures to small components

---

## Animation

### Philosophy

Animation serves function, not decoration. Every motion should:
1. Provide feedback
2. Guide attention
3. Create continuity

### Timing Standards

```
ANIMATION DURATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duration    Easing                    Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
100ms       ease-out                  Micro-feedback (opacity)
150ms       ease-out                  Button press, toggle
200ms       ease-in-out               State transitions
300ms       ease-in-out               Panel open/close
400ms       cubic-bezier(0.4,0,0.2,1) Modal entry
500ms       spring                    Page transitions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Micro-Interactions

**Button Press:**
```css
.btn:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}
```

**Card Hover:**
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: /* elevated shadow */;
  transition: all 200ms ease-out;
}
```

**Glow Pulse (for attention):**
```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.2); }
  50% { box-shadow: 0 0 30px rgba(251,191,36,0.4); }
}
```

### Animation Rules

**DO:**
- Use Framer Motion for complex orchestration
- Prefer CSS transitions for simple state changes
- Use spring physics for natural feel
- Animate glow intensity on state changes

**DON'T:**
- Animate on first paint (no entry animations on page load)
- Use animation duration > 500ms
- Animate multiple properties with different timings
- Use bounce/elastic easing (feels cheap)

---

## Component Library

### Architecture

Nerve Agent uses a layered component system:

```
src/components/
├── ui/                    # Base shadcn/ui (DO NOT MODIFY)
├── nerve/                 # Nerve UI Kit (premium layer)
│   ├── primitives/        # Low-level building blocks
│   │   ├── surface.tsx    # Elevation surfaces
│   │   ├── glow.tsx       # Glow wrapper
│   │   └── well.tsx       # Recessed areas
│   ├── components/        # Ready-to-use components
│   │   ├── nerve-button.tsx
│   │   ├── nerve-card.tsx
│   │   ├── nerve-toggle.tsx
│   │   ├── nerve-input.tsx
│   │   └── nerve-tabs.tsx
│   ├── backgrounds/       # Background components
│   │   ├── dot-grid.tsx
│   │   ├── noise.tsx
│   │   └── vignette.tsx
│   └── index.ts           # Clean exports
```

### Library Allowlist

**Core (always use):**
- `shadcn/ui` — Base component library
- `@radix-ui/*` — Accessible primitives (shadcn foundation)
- `framer-motion` — Animation
- `lucide-react` — Icons

**Approved Extensions:**
- `cmdk` — Command palette
- `sonner` — Toast notifications
- `vaul` — Drawer component
- `react-day-picker` — Date selection
- `recharts` — Charts (when needed)
- `@tanstack/react-table` — Data tables (when needed)

**Banned:**
- Material UI, Chakra UI, Ant Design (style clash)
- Lottie, GSAP (heavy animation)
- Any component library with its own design language

### Component Creation Rules

When creating new components:

1. **Check shadcn first** — Can you extend an existing component?
2. **Use Nerve primitives** — Build on Surface, Glow, Well
3. **Follow naming convention** — `nerve-{component}.tsx`
4. **Export from index** — Add to `nerve/index.ts`
5. **Document props** — JSDoc comments required

---

## Contributor Guidelines

### The Golden Rule

> If it doesn't feel premium, don't ship it.

### Do's

- **DO** use the Nerve UI Kit components
- **DO** follow the color system exactly
- **DO** add glow to interactive accent-colored elements
- **DO** maintain generous whitespace
- **DO** test on dark backgrounds
- **DO** consider keyboard navigation
- **DO** use semantic HTML

### Don'ts

- **DON'T** introduce new colors outside the system
- **DON'T** use flat design (add depth!)
- **DON'T** create one-off component styles
- **DON'T** use animations > 500ms
- **DON'T** put glow on everything
- **DON'T** use light mode styles (dark first)
- **DON'T** add dependencies without approval

### Code Style

```tsx
// Component template
import { cn } from "@/lib/utils"
import { Surface } from "@/components/nerve/primitives/surface"

interface NerveComponentProps {
  // Props with JSDoc
}

export function NerveComponent({ className, ...props }: NerveComponentProps) {
  return (
    <Surface
      level={2}
      className={cn(
        "base-styles-here",
        className
      )}
      {...props}
    />
  )
}
```

### Pull Request Checklist

Before submitting UI changes:

- [ ] Colors match design system tokens
- [ ] Glow applied to interactive primary elements
- [ ] Animation durations within spec
- [ ] Proper elevation/depth applied
- [ ] Works with keyboard navigation
- [ ] No console errors
- [ ] TypeScript passes

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial design system |

---

*"Sharp, premium, alive. If the UI doesn't glow, it doesn't go."*
