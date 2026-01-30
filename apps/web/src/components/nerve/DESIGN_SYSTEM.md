# NERVE UI Design System v2.0

> **Philosophy**: Premium audio plugin aesthetic - tactile, physical, with depth that feels like real hardware. Clean hardware that defies reality with subtle, tactile texture. Precision meets soul.

**Last Updated**: 2026-01-30
**Status**: Active Development
**Inspired by**: Modartt Piano VST, Knorr Audio Plugins

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
Every surface has physical presence. Use insets, bevels, and shadows to create clear hierarchy. Cards should float, buttons should press, inputs should recess.

### 2. Cool Pale Gold Accents
Sophisticated, desaturated gold as the signature accent. Like brushed metallic knobs on premium audio hardware. Never "highlighter yellow" or "construction sign orange."

### 3. Tactile Texture
Subtle noise, dot grids, and corner brackets prevent surfaces from feeling sterile. The UI should feel like hardware you could touch.

### 4. Ambient Energy
Soft glows bleeding from under active elements - like the warm light under active tabs in audio plugins. Active states emit subtle light.

### 5. Refined Restraint
Premium doesn't mean busy. Use effects purposefully. Clear hierarchy through contrast, not complexity.

---

## Color System

### Research-Backed Cool Pale Gold Palette
> **Key Finding**: Pure yellow-golds look cheap. The secret is using cool, desaturated golds that feel like brushed metallic surfaces - sophisticated without being muddy.
> Reference: Modartt Piano VST knobs, Knorr audio plugin accents

### Base Palette

```css
:root {
  /* ═══════════════════════════════════════════════════════════
     BACKGROUND LAYERS v2.0
     Rule: 10-12 brightness point jumps for CLEAR hierarchy
     Creates distinguishable elevation levels
     ═══════════════════════════════════════════════════════════ */
  --nerve-bg-deep: #050507;      /* (5,5,7) - Deepest insets */
  --nerve-bg-base: #0A0A0C;      /* (10,10,12) - Page background */
  --nerve-bg-surface: #141418;   /* (20,20,24) - Cards at rest */
  --nerve-bg-elevated: #1E1E22;  /* (30,30,34) - Elevated cards, dropdowns */
  --nerve-bg-hover: #28282E;     /* (40,40,46) - Hover states */
  --nerve-bg-active: #32323A;    /* (50,50,58) - Active/pressed states */

  /* Border Colors - RGBA for transparency layering */
  --nerve-border-subtle: rgba(255, 255, 255, 0.05);
  --nerve-border-default: rgba(255, 255, 255, 0.08);
  --nerve-border-strong: rgba(255, 255, 255, 0.12);
  --nerve-border-bright: rgba(255, 255, 255, 0.18);

  /* Text Colors - Refined for readability */
  --nerve-text-primary: #F0F0F2;   /* Slightly warm white */
  --nerve-text-secondary: #A0A0A8; /* More visible secondary */
  --nerve-text-muted: #68687A;     /* Cooler muted with slight blue */
  --nerve-text-faint: #404052;     /* Disabled/decorative */

  /* ═══════════════════════════════════════════════════════════
     COOL PALE GOLD PALETTE v2.0
     Sophisticated, desaturated, premium
     Inspired by: Brushed metallic knobs, champagne gold
     ═══════════════════════════════════════════════════════════ */
  --nerve-gold-50: #FDF6E8;      /* Cream highlight */
  --nerve-gold-100: #F5E6C4;     /* Light champagne */
  --nerve-gold-200: #E8D4A0;     /* Soft gold */
  --nerve-gold-300: #D4B878;     /* Medium gold */
  --nerve-gold-400: #C9A84C;     /* PRIMARY ACCENT - cool pale gold */
  --nerve-gold-500: #B8943C;     /* Rich gold */
  --nerve-gold-600: #9A7B2E;     /* Deep gold */
  --nerve-gold-700: #7A5F20;     /* Dark gold */

  /* Premium Metallic Gold - Hero accent for knobs/CTAs */
  --nerve-gold-metallic: #D4A84C;
  --nerve-gold-premium: #C9A84C;

  /* Glow values - Tuned for cool pale gold */
  --nerve-gold-glow-subtle: rgba(201, 168, 76, 0.15);
  --nerve-gold-glow: rgba(201, 168, 76, 0.25);
  --nerve-gold-glow-medium: rgba(201, 168, 76, 0.4);
  --nerve-gold-glow-strong: rgba(201, 168, 76, 0.6);

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
  --nerve-tag-task: #f97316;       /* Orange */
  --nerve-tag-reference: #3b82f6;  /* Blue */
  --nerve-tag-insight: #22c55e;    /* Green */
  --nerve-tag-decision: #C9A84C;   /* Gold */
}
```

### Usage Guidelines

| Context | Color Token |
|---------|-------------|
| Page background | `--nerve-bg-base` |
| Card background | `--nerve-bg-surface` |
| Elevated cards/hover | `--nerve-bg-elevated` |
| Hover states | `--nerve-bg-hover` |
| Active/pressed | `--nerve-bg-active` |
| Primary actions | `--nerve-gold-400` with gradient |
| Focus rings | `--nerve-gold-400` with glow |
| Active indicators | Gold ambient glow |
| Card borders | `--nerve-border-subtle` or `--nerve-border-default` |
| Dividers | `--nerve-border-default` |

---

## Typography

### Font Stack (Geist)
```css
--nerve-font-sans: 'Geist Variable', -apple-system, BlinkMacSystemFont, sans-serif;
--nerve-font-mono: 'Geist Mono Variable', 'JetBrains Mono', monospace;
```

### Scale & Weights

| Name | Size | Weight | Letter Spacing | Use Case |
|------|------|--------|----------------|----------|
| Display | 40px | 600 | -0.02em | Hero text |
| Heading 1 | 28px | 600 | -0.01em | Page titles |
| Heading 2 | 20px | 600 | -0.01em | Section headers |
| Heading 3 | 16px | 600 | 0 | Card titles |
| Body | 15px | 400 | 0 | Default text |
| Body Small | 14px | 400 | 0 | Secondary info |
| Label | 11px | 500 | 0.1em | **ALL CAPS** - Audio plugin style |
| Label Small | 10px | 500 | 0.12em | **ALL CAPS** - Micro labels |
| Code | 14px | 400 | 0 | Monospace |

### Label Style (Audio Plugin Style)
For labels, use uppercase with wide letter-spacing (like audio plugin controls):
```css
.text-label {
  font-size: 0.6875rem;   /* 11px */
  font-weight: 500;
  letter-spacing: 0.1em;
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

---

## Depth & Elevation

### Research: More Dramatic Shadows for Clear Hierarchy
> **v2.0 Change**: Increased shadow opacity and spread for clearly distinguishable elevation levels. Inspired by floating hardware panels in audio plugins.

### Shadow System

```css
/* More dramatic shadows for clear hierarchy */
--nerve-shadow-1: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
--nerve-shadow-2: 0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3);
--nerve-shadow-3: 0 8px 16px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3);
--nerve-shadow-4: 0 16px 32px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.3);

/* Inset shadow for wells/recessed areas */
--nerve-shadow-inset: inset 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(0,0,0,0.3);
```

### Bevel/Edge System (Hardware Feel)
```css
/* Top highlight (lit from above) */
--nerve-bevel-highlight: inset 0 1px 0 rgba(255,255,255,0.08);

/* Bottom shadow (physical depth) */
--nerve-bevel-shadow: inset 0 -1px 0 rgba(0,0,0,0.2);

/* Full bevel (carved hardware feel) */
--nerve-bevel-full:
  inset 0 1px 0 rgba(255,255,255,0.08),
  inset 0 -1px 0 rgba(0,0,0,0.2);
```

### Elevation Classes

**Level 0 - Inset (Wells, inputs, recessed areas)**
```css
.nerve-inset {
  background: var(--nerve-bg-deep);
  box-shadow: var(--nerve-shadow-inset);
  border: 1px solid rgba(0,0,0,0.3);
}
```

**Level 1 - Surface (Cards at rest)**
```css
.nerve-surface-1 {
  background: var(--nerve-bg-surface);
  box-shadow: var(--nerve-shadow-1);
  border: 1px solid var(--nerve-border-subtle);
}
```

**Level 2 - Elevated (Cards on hover, dropdowns)**
```css
.nerve-surface-2 {
  background: var(--nerve-bg-elevated);
  box-shadow: var(--nerve-shadow-2);
  border: 1px solid var(--nerve-border-default);
}
```

**Level 3 - Floating (Modals, popovers)**
```css
.nerve-surface-3 {
  background: var(--nerve-bg-elevated);
  box-shadow: var(--nerve-shadow-3);
  border: 1px solid var(--nerve-border-strong);
}
```

---

## Effects & Textures

### Ambient Glow (Like Light Bleeding from Under Active Tabs)
```css
.glow-gold-ambient {
  box-shadow:
    0 4px 12px rgba(201, 168, 76, 0.4),
    0 0 20px rgba(201, 168, 76, 0.15);
}

.glow-gold-subtle {
  box-shadow: 0 0 12px rgba(201, 168, 76, 0.15);
}

.glow-gold-medium {
  box-shadow:
    0 0 20px rgba(201, 168, 76, 0.4),
    0 0 40px rgba(201, 168, 76, 0.25);
}
```

### Focus Ring
```css
.nerve-focus-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--nerve-bg-base),
    0 0 0 4px var(--nerve-gold-400),
    0 0 16px var(--nerve-gold-glow);
}
```

### Dot Grid Background (from Knorr reference)
```css
.nerve-dots {
  background-image: radial-gradient(
    rgba(255,255,255,0.08) 1px,
    transparent 1px
  );
  background-size: 16px 16px;
}
```

### Corner Brackets (from Knorr reference)
```css
.nerve-brackets::before,
.nerve-brackets::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  pointer-events: none;
}
.nerve-brackets::before {
  top: 8px; left: 8px;
  border-right: none; border-bottom: none;
}
.nerve-brackets::after {
  bottom: 8px; right: 8px;
  border-left: none; border-top: none;
}
```

### Vignette (Depth Around Edges)
```css
.nerve-vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  pointer-events: none;
}
```

### Noise Texture
```css
.nerve-texture-noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

---

## Component Patterns

### Primary Button (Gold Gradient with Glow)
```css
.nerve-btn-primary {
  background: linear-gradient(135deg, var(--nerve-gold-300), var(--nerve-gold-500));
  color: #050507;
  box-shadow:
    0 4px 12px rgba(201, 168, 76, 0.5),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.nerve-btn-primary:hover {
  box-shadow:
    0 4px 16px rgba(201, 168, 76, 0.6),
    0 0 24px rgba(201, 168, 76, 0.25),
    inset 0 1px 0 rgba(255,255,255,0.25);
}
```

### Secondary Button
```css
.nerve-btn-secondary {
  background: var(--nerve-bg-hover);
  color: var(--nerve-text-primary);
  border: 1px solid var(--nerve-border-default);
}

.nerve-btn-secondary:hover {
  background: var(--nerve-bg-active);
  border-color: var(--nerve-border-strong);
}
```

### Input Well
```css
.nerve-input {
  background: var(--nerve-bg-deep);
  box-shadow: var(--nerve-shadow-inset);
  border: 1px solid rgba(0,0,0,0.3);
}

.nerve-input:focus {
  box-shadow:
    var(--nerve-shadow-inset),
    0 0 0 2px var(--nerve-bg-base),
    0 0 0 4px var(--nerve-gold-400),
    0 0 16px var(--nerve-gold-glow);
}
```

### Toggle/Switch
```css
/* Track */
.nerve-toggle {
  background: var(--nerve-bg-active);
}
.nerve-toggle[data-state="checked"] {
  background: var(--nerve-success);
}

/* Thumb */
.nerve-toggle-thumb {
  background: white;
  box-shadow: var(--nerve-shadow-1);
}
```

### Checkbox/Radio (Gold Accent)
```css
.nerve-checkbox[data-state="checked"] {
  background: var(--nerve-gold-400);
  box-shadow: 0 0 8px rgba(201, 168, 76, 0.4);
}
```

---

## CSS Utility Classes (globals.css)

### Surface/Elevation
| Class | Description |
|-------|-------------|
| `.nerve-inset` | Inset well effect (inputs, recessed areas) |
| `.nerve-surface-1` | Level 1 elevation (cards at rest) |
| `.nerve-surface-2` | Level 2 elevation (hover, dropdowns) |
| `.nerve-surface-3` | Level 3 elevation (modals, popovers) |

### Glow Effects
| Class | Description |
|-------|-------------|
| `.glow-gold-subtle` | Subtle gold glow (12px) |
| `.glow-gold-soft` | Soft gold glow (16px + 32px) |
| `.glow-gold-medium` | Medium gold glow (20px + 40px) |
| `.glow-gold-intense` | Intense gold glow (multi-layer) |
| `.glow-gold-ambient` | Ambient underglow (under tabs style) |
| `.nerve-focus-ring:focus-visible` | Gold focus ring |
| `.hover-glow-gold:hover` | Gold glow on hover |

### Background Treatments
| Class | Description |
|-------|-------------|
| `.nerve-dots` | Dot grid pattern (16px spacing) |
| `.nerve-vignette` | Edge darkening overlay |
| `.nerve-brackets` | Corner bracket decorations |
| `.nerve-brackets-full` | All four corner brackets |
| `.bg-nerve-ambient` | Gold ambient glow at top |
| `.bg-nerve-premium` | Combined: ambient + dots |
| `.nerve-texture-noise` | Subtle grain (3% opacity) |
| `.nerve-texture-noise-strong` | Stronger grain (5% opacity) |

### Gold Colors
| Class | Description |
|-------|-------------|
| `.text-nerve-gold` | Gold text (--nerve-gold-400) |
| `.text-nerve-gold-bright` | Bright gold (--nerve-gold-300) |
| `.bg-nerve-gold-gradient` | Gold gradient background |
| `.bg-nerve-gold-metallic` | Brushed metallic gold |
| `.border-nerve-gold` | Gold border |

### Typography
| Class | Description |
|-------|-------------|
| `.text-label` | Audio plugin style (11px, uppercase, 0.1em tracking) |
| `.text-label-sm` | Smaller label (10px) |
| `.text-label-lg` | Larger label (12px) |
| `.text-display` | Hero text (40px, semibold) |
| `.text-gradient-gold` | Gold gradient text |

### Interactive Effects
| Class | Description |
|-------|-------------|
| `.press-effect` | Scale down on `:active` (0.98) |
| `.hover-lift` | Lift up on hover (-2px + shadow) |

---

## Implementation Checklist

### Phase 1: Foundation ✅
- [x] Research premium UI techniques (audio plugin aesthetic)
- [x] Document cool pale gold palette
- [x] Document increased shadow contrast
- [x] Update CSS variables in globals.css
- [x] Update Tailwind config with new values
- [x] Install Geist fonts

### Phase 2: Core Components
- [x] ColorShowcase - Reflect new tokens
- [ ] NerveButton - Gold gradient with ambient glow
- [ ] NerveInput - Inset well with gold focus
- [ ] NerveBadge - Updated glow effects
- [ ] NerveToggle / SegmentedControl

### Phase 3: Textures & Effects
- [x] Dot grid background (nerve-dots)
- [x] Corner brackets (nerve-brackets)
- [x] Vignette overlay (nerve-vignette)
- [x] Noise texture (nerve-texture-noise)

### Phase 4: Site-Wide Rollout
- [ ] Apply to sidebar
- [ ] Apply to all pages
- [ ] Update shadcn components to use Nerve tokens

### Phase 5: Polish
- [ ] Micro-interactions (hover, focus transitions)
- [ ] Loading states with shimmer
- [ ] Empty states

---

## Reference Inspirations

1. **Modartt Pianoteq** - Brushed metallic knobs, warm gold accents, inset controls
2. **Knorr Audio Plugin** - Dot grid, corner brackets, glowing orb, pill controls
3. **Premium Hardware Feel** - Beveled edges, carved surfaces, ambient light

---

## Notes for Future Sessions

When continuing this work:
1. Read this document first to re-establish context
2. Check the Implementation Checklist for progress
3. Test changes at `/library/design-systems/nerve`
4. Verify gold appears sophisticated (not yellow/orange)
5. Verify surface layers are clearly distinguishable

**Key Aesthetic Reminder**: "Premium audio plugin aesthetic - tactile hardware that emits subtle warmth"
