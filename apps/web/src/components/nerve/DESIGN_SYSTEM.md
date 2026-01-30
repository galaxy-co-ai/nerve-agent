# NERVE UI Design System

> **Philosophy**: Clean, beautiful, smooth-operating hardware that defies reality with subtle, tactile texture. Precision meets soul. Not cold and clinical, not overly ornate.

**Last Updated**: 2026-01-30
**Status**: Active Development

---

## Table of Contents
1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Depth & Elevation](#depth--elevation)
6. [Effects & Textures](#effects--textures)
7. [Component Patterns](#component-patterns)
8. [Implementation Checklist](#implementation-checklist)

---

## Design Principles

### 1. Depth Through Layers
Every surface has physical presence. Use insets, bevels, and shadows to create hierarchy. Nothing is truly flat.

### 2. Warm Premium Accents
Gold/amber as the signature accent color. Creates warmth against cool dark backgrounds. Used for active states, focus rings, and emphasis.

### 3. Tactile Texture
Subtle noise and grain prevent surfaces from feeling sterile. The UI should feel like you could touch it.

### 4. Ambient Energy
Soft glows on interactive elements create life. Active states emit subtle light. The interface responds with warmth.

### 5. Refined Restraint
Premium doesn't mean busy. Use effects purposefully. White space is a feature, not a bug.

---

## Color System

### Research-Backed Gold Palette
> **Key Finding**: Pure yellow-golds look cheap. The secret is using desaturated,
> balanced golds that lean slightly warm without becoming orange or muddy.
> Source: [Figma Colors](https://www.figma.com/colors/gold/), [SchemeColor](https://www.schemecolor.com/luxury-black-and-gold.php)

### Base Palette

```css
:root {
  /* Background Layers (darkest to lightest)
     Rule: Add 8-10 brightness points per level for consistent "color distance"
     Never use pure black - it makes shadows invisible */
  --nerve-bg-deep: #08080a;        /* Deepest background - near black with warmth */
  --nerve-bg-base: #0c0c0e;        /* Main background */
  --nerve-bg-surface: #141416;     /* Card/surface background */
  --nerve-bg-elevated: #1a1a1d;    /* Elevated surfaces, hover cards */
  --nerve-bg-hover: #222225;       /* Hover states */
  --nerve-bg-active: #2a2a2e;      /* Active/pressed states */

  /* Border Colors - RGBA for transparency layering */
  --nerve-border-subtle: rgba(255, 255, 255, 0.05);
  --nerve-border-default: rgba(255, 255, 255, 0.08);
  --nerve-border-strong: rgba(255, 255, 255, 0.12);
  --nerve-border-bright: rgba(255, 255, 255, 0.18);

  /* Text Colors - Avoid pure white on dark (too harsh) */
  --nerve-text-primary: #f4f4f5;   /* Primary text - slightly warm */
  --nerve-text-secondary: #a1a1aa; /* Secondary text */
  --nerve-text-muted: #71717a;     /* Muted/timestamps */
  --nerve-text-faint: #52525b;     /* Very subtle text */

  /* ═══════════════════════════════════════════════════════════
     REFINED GOLD PALETTE - Research-backed, tested on dark
     These values avoid the "dingy yellow" and "muddy orange" problem
     Rule: Desaturate accent colors ~20% for dark mode
     ═══════════════════════════════════════════════════════════ */
  --nerve-gold-50: #fefce8;        /* Lightest - for subtle backgrounds */
  --nerve-gold-100: #fef9c3;
  --nerve-gold-200: #fef08a;
  --nerve-gold-300: #fde047;       /* Light gold - great for text on dark */
  --nerve-gold-400: #facc15;       /* Bright gold - primary accent */
  --nerve-gold-500: #eab308;       /* Standard gold - buttons, active states */
  --nerve-gold-600: #ca8a04;       /* Rich gold - hover states */
  --nerve-gold-700: #a16207;       /* Deep gold - pressed states */

  /* Premium Metallic Gold (from research - not too yellow, not orange) */
  --nerve-gold-metallic: #d4af37;  /* Classic metallic gold */
  --nerve-gold-premium: #e5b84a;   /* Our custom blend - warm but clean */

  /* Glow values - carefully tuned opacity for ambient effect */
  --nerve-gold-glow-subtle: rgba(234, 179, 8, 0.08);
  --nerve-gold-glow: rgba(234, 179, 8, 0.12);
  --nerve-gold-glow-medium: rgba(234, 179, 8, 0.18);
  --nerve-gold-glow-strong: rgba(234, 179, 8, 0.25);

  /* Semantic Colors */
  --nerve-success: #22c55e;
  --nerve-success-glow: rgba(34, 197, 94, 0.15);

  --nerve-info: #3b82f6;
  --nerve-info-glow: rgba(59, 130, 246, 0.15);

  --nerve-warning: #f59e0b;
  --nerve-warning-glow: rgba(245, 158, 11, 0.15);

  --nerve-error: #ef4444;
  --nerve-error-glow: rgba(239, 68, 68, 0.15);

  /* Tag-Specific Colors */
  --nerve-tag-idea: #a855f7;       /* Purple */
  --nerve-tag-idea-glow: rgba(168, 85, 247, 0.15);

  --nerve-tag-task: #f97316;       /* Orange */
  --nerve-tag-task-glow: rgba(249, 115, 22, 0.15);

  --nerve-tag-reference: #3b82f6;  /* Blue */
  --nerve-tag-reference-glow: rgba(59, 130, 246, 0.15);

  --nerve-tag-insight: #22c55e;    /* Green */
  --nerve-tag-insight-glow: rgba(34, 197, 94, 0.15);

  --nerve-tag-decision: #eab308;   /* Yellow */
  --nerve-tag-decision-glow: rgba(234, 179, 8, 0.15);
}
```

### Usage Guidelines

| Context | Color Token |
|---------|-------------|
| Page background | `--nerve-bg-deep` or `--nerve-bg-base` |
| Card background | `--nerve-bg-surface` |
| Hover states | `--nerve-bg-hover` |
| Primary actions | `--nerve-gold-500` |
| Focus rings | `--nerve-gold-400` with glow |
| Active indicators | `--nerve-gold-400` |
| Card borders | `--nerve-border-subtle` |
| Dividers | `--nerve-border-default` |

---

## Typography

### Font Stack
```css
--nerve-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--nerve-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Scale & Weights

| Name | Size | Weight | Letter Spacing | Use Case |
|------|------|--------|----------------|----------|
| Display | 32px | 700 | -0.02em | Page titles |
| Heading 1 | 24px | 600 | -0.01em | Section headers |
| Heading 2 | 20px | 600 | -0.01em | Card titles |
| Heading 3 | 16px | 600 | 0 | Subsections |
| Body | 14px | 400 | 0 | Default text |
| Body Small | 13px | 400 | 0 | Secondary info |
| Caption | 12px | 500 | 0.02em | Timestamps, labels |
| Label | 11px | 600 | 0.05em | Uppercase labels |
| Micro | 10px | 500 | 0.05em | Badges, tags |

### Label Style (Uppercase)
For labels, use uppercase with increased letter-spacing:
```css
.nerve-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--nerve-text-muted);
}
```

---

## Spacing & Layout

### Spacing Scale
```css
--nerve-space-1: 4px;
--nerve-space-2: 8px;
--nerve-space-3: 12px;
--nerve-space-4: 16px;
--nerve-space-5: 20px;
--nerve-space-6: 24px;
--nerve-space-8: 32px;
--nerve-space-10: 40px;
--nerve-space-12: 48px;
--nerve-space-16: 64px;
```

### Border Radius
```css
--nerve-radius-sm: 6px;      /* Buttons, badges */
--nerve-radius-md: 10px;     /* Inputs, small cards */
--nerve-radius-lg: 14px;     /* Cards, panels */
--nerve-radius-xl: 20px;     /* Large containers */
--nerve-radius-full: 9999px; /* Pills, avatars */
```

### Grid
- Card grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Gap: 16px (--nerve-space-4)
- Card minimum width: 280px

---

## Depth & Elevation

### Research: Layered Shadow Technique
> **Key Finding**: Single shadows look flat and artificial. Premium depth comes from
> stacking multiple shadows with progressively larger offsets and blur radii.
> Each layer doubles: 1px → 2px → 4px → 8px → 16px
> Source: [Josh W. Comeau](https://www.joshwcomeau.com/css/designing-shadows/), [Tobias Ahlin](https://tobiasahlin.com/blog/layered-smooth-box-shadows/)

### Elevation Levels

**Level 0 - Inset (Wells, inputs, recessed areas)**
Creates the illusion of pressing INTO the surface.
```css
.nerve-inset {
  background: var(--nerve-bg-deep);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--nerve-border-subtle);
}
```

**Level 1 - Surface (Cards at rest)**
Subtle lift - the "default" card state.
```css
.nerve-surface-1 {
  background: var(--nerve-bg-surface);
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.08),
    0 2px 2px rgba(0, 0, 0, 0.08),
    0 4px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--nerve-border-subtle);
}
```

**Level 2 - Elevated (Cards on hover, dropdowns)**
Medium lift with more spread - indicates interactivity.
```css
.nerve-surface-2 {
  background: var(--nerve-bg-elevated);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--nerve-border-default);
}
```

**Level 3 - Floating (Modals, popovers, tooltips)**
High lift - clearly floating above the page.
```css
.nerve-surface-3 {
  background: var(--nerve-bg-elevated);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--nerve-border-strong);
}
```

### Shadow Opacity Guidelines
| Context | Opacity per layer |
|---------|-------------------|
| Subtle lift | 0.08 |
| Medium lift | 0.10 |
| Strong lift | 0.12 |
| Dramatic | 0.15 |

**Performance Note**: Layered shadows do 5x more work than single shadows.
Test on lower-end devices. For lists with many cards, consider reducing layers.

### Inner Border Highlight
Add subtle top highlight to create "lit from above" effect:
```css
.nerve-surface-highlight {
  position: relative;
}
.nerve-surface-highlight::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 50%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
```

---

## Effects & Textures

### Ambient Glow (for active/focus states)
```css
.nerve-glow-gold {
  box-shadow:
    0 0 20px var(--nerve-gold-glow),
    0 0 40px var(--nerve-gold-glow);
}

.nerve-glow-gold-strong {
  box-shadow:
    0 0 15px var(--nerve-gold-glow-strong),
    0 0 30px var(--nerve-gold-glow),
    0 0 45px var(--nerve-gold-glow);
}
```

### Focus Ring
```css
.nerve-focus-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--nerve-bg-base),
    0 0 0 4px var(--nerve-gold-400),
    0 0 20px var(--nerve-gold-glow);
}
```

### Noise Texture
Apply subtle noise overlay for tactile feel:
```css
.nerve-texture-noise {
  position: relative;
}
.nerve-texture-noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise pattern */
  opacity: 0.03;
  pointer-events: none;
  border-radius: inherit;
}
```

### Dot Grid Background
For content areas needing subtle pattern:
```css
.nerve-bg-dots {
  background-image: radial-gradient(
    circle at center,
    var(--nerve-border-subtle) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

### Vignette
Subtle edge darkening for depth:
```css
.nerve-vignette {
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);
}
```

### Gradient Backgrounds
```css
.nerve-bg-gradient {
  background: linear-gradient(
    180deg,
    var(--nerve-bg-base) 0%,
    var(--nerve-bg-deep) 100%
  );
}

.nerve-bg-gradient-radial {
  background: radial-gradient(
    ellipse at top center,
    var(--nerve-bg-surface) 0%,
    var(--nerve-bg-deep) 70%
  );
}
```

---

## Component Implementations

### NerveCard

**Location:** `src/components/nerve/components/nerve-card.tsx`

**Usage:**
```tsx
import { NerveCard, NerveCardHeader, NerveCardTitle, NerveCardContent } from "@/components/nerve/components/nerve-card"

<NerveCard elevation={1} variant="interactive">
  <NerveCardHeader>
    <NerveCardTitle>Card Title</NerveCardTitle>
  </NerveCardHeader>
  <NerveCardContent>
    Content here
  </NerveCardContent>
</NerveCard>
```

**Props:**
| Prop | Values | Description |
|------|--------|-------------|
| `elevation` | `1`, `2`, `3` | Shadow depth level (1=rest, 2=hover, 3=floating) |
| `variant` | `default`, `raised`, `glow`, `interactive`, `glass`, `selected` | Visual treatment |

**Elevation shadows (layered technique):**
- Level 1: `0 1px 1px, 0 2px 2px, 0 4px 4px` at 0.08 opacity
- Level 2: `0 1px 2px, 0 2px 4px, 0 4px 8px, 0 8px 16px` at 0.10 opacity
- Level 3: `0 1px 2px, 0 2px 4px, 0 4px 8px, 0 8px 16px, 0 16px 32px` at 0.08 opacity

---

### NerveInput

**Location:** `src/components/nerve/components/nerve-input.tsx`

**Usage:**
```tsx
import { NerveInput } from "@/components/nerve/components/nerve-input"

<NerveInput
  label="Email"
  placeholder="Enter your email"
  leftElement={<Mail className="h-4 w-4" />}
  error="Invalid email"
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Label above input |
| `helperText` | `string` | Helper text below input |
| `error` | `string` | Error message (also sets error styling) |
| `leftElement` | `ReactNode` | Icon/element on left |
| `rightElement` | `ReactNode` | Icon/element on right |

**Key styling:**
- **Inset well effect:** `shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(0,0,0,0.3)]`
- **Focus glow ring:** `0 0 0 2px var(--nerve-bg-base), 0 0 0 4px var(--nerve-gold-400), 0 0 20px var(--nerve-gold-glow)`
- Background transitions from `--nerve-bg-deep` (rest) → `--nerve-bg-base` (focus/hover)

---

### NerveButton

**Location:** `src/components/nerve/components/nerve-button.tsx`

**Usage:**
```tsx
import { NerveButton } from "@/components/nerve/components/nerve-button"

<NerveButton variant="primary" size="lg">Get Started</NerveButton>
<NerveButton variant="secondary">Cancel</NerveButton>
<NerveButton variant="outline" loading>Loading...</NerveButton>
```

**Props:**
| Prop | Values | Description |
|------|--------|-------------|
| `variant` | `primary`, `secondary`, `ghost`, `outline`, `destructive` | Button style |
| `size` | `sm`, `md`, `lg`, `xl`, `icon`, `icon-sm`, `icon-lg` | Button size |
| `loading` | `boolean` | Show loading spinner |
| `asChild` | `boolean` | Render as Slot for composition |

**Primary button styling:**
- Gold gradient: `from-[var(--nerve-gold-400)] to-[var(--nerve-gold-500)]`
- Top highlight: `inset 0 1px 0 rgba(255,255,255,0.25)`
- Ambient glow: `0 0 15px var(--nerve-gold-glow)`
- Hover intensifies glow to `--nerve-gold-glow-medium`

---

### NerveBadge

**Location:** `src/components/nerve/components/nerve-badge.tsx`

**Usage:**
```tsx
import { NerveBadge } from "@/components/nerve/components/nerve-badge"

<NerveBadge variant="idea">Idea</NerveBadge>
<NerveBadge variant="task" dot>In Progress</NerveBadge>
<NerveBadge variant="success" pulse>Live</NerveBadge>
```

**Props:**
| Prop | Values | Description |
|------|--------|-------------|
| `variant` | `default`, `primary`, `success`, `warning`, `error`, `info`, `outline`, `idea`, `task`, `reference`, `insight`, `decision` | Badge color/style |
| `size` | `sm`, `md`, `lg` | Badge size |
| `pulse` | `boolean` | Pulsing animation for attention |
| `dot` | `boolean` | Show colored dot indicator |

**Tag-specific variants (use CSS variables):**
- `idea`: Purple (`--nerve-tag-idea`)
- `task`: Orange (`--nerve-tag-task`)
- `reference`: Blue (`--nerve-tag-reference`)
- `insight`: Green (`--nerve-tag-insight`)
- `decision`: Gold (`--nerve-tag-decision`)

Each has matching glow: `shadow-[0_0_8px_var(--nerve-tag-{name}-glow)]`

---

## Component Patterns (Visual Reference)

### Card
```
┌─────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Top highlight
│                                 │
│  Title                   [Tag]  │
│  Secondary info                 │
│                                 │
│  Content text here that can     │
│  span multiple lines...         │
│                                 │
│  Timestamp                      │
│                                 │
└─────────────────────────────────┘
   ▓▓▓ shadow underneath ▓▓▓
```

### Input / Search
```
┌──────────────────────────────────┐
│ ▼                                │ ← Inset effect
│  🔍  Search notes...             │
│                                  │
└──────────────────────────────────┘
```

### Button (Primary)
```
┌─────────────────┐
│                 │ ← Top highlight
│   + New Note    │
│                 │
└─────────────────┘
    ▓▓ shadow ▓▓
```

### Badge / Tag
```
┌───────────┐
│   Idea    │ ← Colored background with glow
└───────────┘
```

### Toggle / Segmented Control (NOT YET IMPLEMENTED)
```
┌─────────────────────────────────┐
│ ▼ inset background              │
│  ┌──────┐                       │
│  │ All  │  Idea   Task   Ref    │ ← Active has gold accent
│  └──────┘                       │
└─────────────────────────────────┘
```
**Needs research:** Animation style, active indicator treatment, shadow layering

---

## Implementation Checklist

### Phase 1: Foundation
- [x] Research premium UI techniques (Josh W. Comeau shadows, gold colors)
- [x] Document refined gold palette (desaturated, balanced)
- [x] Document layered shadow technique (1→2→4→8→16 pattern)
- [x] Update CSS variables in globals.css with new values
- [x] Create/update Surface primitive with elevation levels
- [x] Update NerveCard with new depth system
- [x] Add noise texture utility

### Phase 2: Core Components
- [x] NerveInput - inset well effect with gold focus glow
- [x] NerveButton - primary with gold gradient, layered shadows, hover glow
- [x] NerveBadge - glow effects, tag-specific variants (idea, task, reference, insight, decision)
- [ ] NerveToggle / SegmentedControl

### Phase 3: Page Layouts
- [ ] Background gradients + texture
- [ ] Vignette effect on main content
- [ ] Header/toolbar refinements

### Phase 4: Polish
- [ ] Micro-interactions (hover, focus transitions)
- [ ] Loading states
- [ ] Empty states

### Phase 5: Documentation
- [ ] Storybook stories for each component
- [ ] Usage guidelines
- [ ] Do's and Don'ts

---

## Reference Inspirations

1. **Modartt Pianoteq** - Gold accents, layered depth, premium feel
2. **KNORR** - Clean contrast, dot grid, glowing orb, pill controls
3. **Zynaptiq Intensity** - Hardware warmth, gold arcs, tactile surfaces

---

## CSS Utility Classes (globals.css)

### Surface/Elevation
| Class | Description |
|-------|-------------|
| `.nerve-inset` | Inset well effect (for inputs, recessed areas) |
| `.nerve-surface-1` | Level 1 elevation (cards at rest) |
| `.nerve-surface-2` | Level 2 elevation (cards on hover, dropdowns) |
| `.nerve-surface-3` | Level 3 elevation (modals, popovers) |
| `.nerve-highlight` | Inner border "lit from above" effect |
| `.surface-well` | Recessed surface |
| `.surface-well-deep` | Deeper recessed surface |

### Glow Effects
| Class | Description |
|-------|-------------|
| `.glow-gold-subtle` | Subtle gold glow (10px) |
| `.glow-gold-soft` | Soft gold glow (15px + 30px) |
| `.glow-gold-medium` | Medium gold glow (20px + 40px) |
| `.glow-gold-intense` | Intense gold glow (15px + 30px + 60px) |
| `.nerve-focus-ring:focus-visible` | Gold focus ring with glow |
| `.hover-glow-gold:hover` | Gold glow on hover |

### Background Treatments
| Class | Description |
|-------|-------------|
| `.bg-nerve-dots` | Dot grid pattern (24px spacing) |
| `.bg-nerve-vignette` | Edge darkening effect |
| `.bg-nerve-ambient` | Gold ambient glow at top |
| `.bg-nerve-premium` | Combined: ambient glow + dot grid |
| `.nerve-texture-noise` | Subtle grain overlay (3% opacity) |
| `.nerve-texture-noise-strong` | Stronger grain (5% opacity) |

### Gold Colors
| Class | Description |
|-------|-------------|
| `.text-nerve-gold` | Gold text (--nerve-gold-400) |
| `.text-nerve-gold-bright` | Bright gold text (--nerve-gold-300) |
| `.bg-nerve-gold` | Gold background (--nerve-gold-500) |
| `.bg-nerve-gold-gradient` | Gold gradient background |
| `.border-nerve-gold` | Gold border |

### Interactive Effects
| Class | Description |
|-------|-------------|
| `.press-effect` | Scale down on `:active` (0.98) |
| `.hover-lift` | Lift up on hover (-2px + shadow) |

---

## Notes for Future Sessions

When continuing this work:
1. Read this document first to re-establish context
2. Check the Implementation Checklist for progress
3. Test changes on the Notes page as the reference implementation
4. Update this document as decisions are made

**Key Aesthetic Reminder**: "Clean hardware that defies reality with tactile warmth"
