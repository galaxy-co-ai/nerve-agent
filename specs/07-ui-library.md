# Living UI Library

## Overview

Your personal, battle-tested component library. Built on shadcn/ui, customized to your style, and continuously polished. Every component tracked, every improvement queued.

## Philosophy

- **Your components, your style** — Not generic, specifically yours
- **Polish over time** — Small improvements compound
- **Know what's tested** — Usage tracking shows battle-hardened components
- **Design tokens centralized** — One source of truth for your brand

---

## Library Structure

```
UI LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENTS                                                   67
├── Primitives (12)          Button, Input, Card, etc.
├── Form (15)                Form fields, validation
├── Data Display (18)        Tables, lists, stats
├── Feedback (8)             Alerts, toasts, modals
├── Navigation (7)           Tabs, breadcrumbs, menus
└── Custom (7)               Project-specific

TOKENS                                                       32
├── Colors (12)
├── Typography (8)
├── Spacing (6)
└── Effects (6)

POLISH QUEUE                                                  5
Micro-improvements waiting to be made
```

---

## Components

### Component Catalog

```
COMPONENT CATALOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMITIVES
──────────────────────────────────────────────────────────────────
[Button]     [Input]      [Card]       [Badge]
[Avatar]     [Checkbox]   [Radio]      [Switch]
[Tooltip]    [Popover]    [Dialog]     [Sheet]

FORM
──────────────────────────────────────────────────────────────────
[Form Field]     [Select]        [Combobox]
[Date Picker]    [File Upload]   [Rich Text]
[Phone Input]    [Currency]      [Address]

DATA DISPLAY
──────────────────────────────────────────────────────────────────
[Data Table]     [Stat Card]     [Progress]
[Timeline]       [Tree View]     [Kanban]
[Calendar]       [Chart]         [Metric]

Click any component to view details
```

### Component Detail

```
COMPONENT: Button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on: shadcn/ui Button
Status: ✓ Battle-tested (used in 12 projects)

VARIANTS
──────────────────────────────────────────────────────────────────
[■ Default]  [□ Outline]  [░ Ghost]  [▓ Destructive]

SIZES
──────────────────────────────────────────────────────────────────
[sm]  [default]  [lg]  [icon]

PREVIEW
──────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│    [Save Changes]    [Cancel]    [🗑️]                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

USAGE
──────────────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button"

<Button variant="default" size="default">
  Save Changes
</Button>

CUSTOMIZATIONS FROM SHADCN
──────────────────────────────────────────────────────────────────
• Added loading state with spinner
• Custom focus ring color
• Adjusted padding for icon-only variant

[View Code]  [Copy Import]  [Add to Polish Queue]
```

---

## Variants

### Variant Management

```typescript
interface UIVariant {
  id: string
  component: UIComponent
  name: string
  description?: string
  props: object              // Variant-specific props
  preview?: string           // Screenshot
  code: string
  usageCount: number
}
```

### Creating Custom Variants

```
CREATE VARIANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component: Button
Variant Name: [Success                    ]

Description:
┌─────────────────────────────────────────────────────────────────┐
│ Green button for successful/positive actions                     │
└─────────────────────────────────────────────────────────────────┘

STYLES
──────────────────────────────────────────────────────────────────
Background: [#22c55e]     (green-500)
Text:       [#ffffff]     (white)
Hover:      [#16a34a]     (green-600)
Border:     [none]

PREVIEW
──────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│    [✓ Approved]                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

[Save Variant]
```

---

## Design Tokens

### Token Categories

```
DESIGN TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLORS
──────────────────────────────────────────────────────────────────
Primary       [■] #3b82f6     Blue-500
Secondary     [■] #64748b     Slate-500
Accent        [■] #f59e0b     Amber-500
Background    [■] #ffffff     White
Foreground    [■] #0f172a     Slate-900
Muted         [■] #f1f5f9     Slate-100
Border        [■] #e2e8f0     Slate-200
Destructive   [■] #ef4444     Red-500
Success       [■] #22c55e     Green-500

TYPOGRAPHY
──────────────────────────────────────────────────────────────────
Font Family   Inter
Font Size     14px (base)
Line Height   1.5
Heading       Font: Inter, Weight: 600

SPACING
──────────────────────────────────────────────────────────────────
Unit          4px
Padding SM    8px  (2 units)
Padding MD    16px (4 units)
Padding LG    24px (6 units)
Gap Default   16px (4 units)

EFFECTS
──────────────────────────────────────────────────────────────────
Border Radius 8px
Shadow SM     0 1px 2px rgba(0,0,0,0.05)
Shadow MD     0 4px 6px rgba(0,0,0,0.1)
Shadow LG     0 10px 15px rgba(0,0,0,0.1)
```

### Token Editor

```
EDIT TOKEN: Primary Color
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current: #3b82f6 (Blue-500)

COLOR PICKER
──────────────────────────────────────────────────────────────────
[Color picker UI]

HEX:  [#3b82f6]
RGB:  [59, 130, 246]
HSL:  [217, 91%, 60%]

PREVIEW IN CONTEXT
──────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│ [Primary Button]  [Link Text]  [Selected Tab]                   │
│ [Progress Bar ████████░░░░]  [Checkbox ☑️]                     │
└─────────────────────────────────────────────────────────────────┘

AFFECTED COMPONENTS
──────────────────────────────────────────────────────────────────
• Button (default variant)
• Link
• Checkbox
• Radio
• Switch
• Progress
• Tabs

[Save Token]  [Reset to Default]
```

### CSS Variables Output

```css
/* Generated from UI Library tokens */
:root {
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 215 16% 47%;
  --secondary-foreground: 0 0% 100%;
  --accent: 38 92% 50%;
  --accent-foreground: 0 0% 100%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --destructive: 0 84% 60%;
  --success: 142 71% 45%;
  --radius: 0.5rem;
}
```

---

## Polish Queue

### Queue Overview

```
POLISH QUEUE                                            5 items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Small improvements to make when you have time

HIGH PRIORITY
──────────────────────────────────────────────────────────────────
1. Button — Add subtle scale animation on press
   Added: 2 weeks ago

2. Data Table — Improve empty state design
   Added: 1 week ago

NORMAL
──────────────────────────────────────────────────────────────────
3. Select — Add search/filter for long lists
   Added: 3 days ago

4. Card — Add hover state with shadow lift
   Added: 3 days ago

5. Toast — Adjust timing for longer messages
   Added: Yesterday

[+ Add to Queue]
```

### Polish Item Detail

```
POLISH ITEM: Button Animation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component: Button
Priority: High
Added: January 14, 2026

DESCRIPTION
──────────────────────────────────────────────────────────────────
Add a subtle scale animation (0.98) on press for better tactile
feedback. Similar to iOS button press effect.

NOTES
──────────────────────────────────────────────────────────────────
• Use Framer Motion for consistency
• Should be subtle, not distracting
• Consider reduced motion preference

REFERENCE
──────────────────────────────────────────────────────────────────
[Link to inspiration]

[Mark Complete]  [Remove from Queue]  [Edit]
```

### Adding Polish Items

```
ADD TO POLISH QUEUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component: [Select ▾]

What needs improvement?
┌─────────────────────────────────────────────────────────────────┐
│ When there are many options, it's hard to find the one you      │
│ want. Add a search/filter input at the top of the dropdown.     │
└─────────────────────────────────────────────────────────────────┘

Priority: ○ High  ● Normal  ○ Low

Reference URL (optional):
[https://ui.shadcn.com/docs/components/combobox               ]

[Add to Queue]
```

---

## Usage Tracking

### Component Usage

```typescript
interface UIComponentUsage {
  component: UIComponent
  project: Project
  file: string
  count: number
  lastUsed: Date
}
```

### Usage Dashboard

```
COMPONENT USAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOST USED (All Time)
──────────────────────────────────────────────────────────────────
1. Button                    487 uses    12 projects
2. Card                      312 uses    11 projects
3. Input                     298 uses    12 projects
4. Badge                     156 uses     9 projects
5. Data Table                 89 uses     7 projects

BATTLE-TESTED ✓
──────────────────────────────────────────────────────────────────
Used in 5+ projects with no reported issues:
Button, Card, Input, Badge, Avatar, Checkbox, Dialog, Toast

NEEDS ATTENTION
──────────────────────────────────────────────────────────────────
Components with issues reported:
• Date Picker — Timezone handling (Issue #23)
• File Upload — Large file progress (Issue #31)

UNUSED (Consider Removing)
──────────────────────────────────────────────────────────────────
• Accordion (0 uses, added 6 months ago)
• Carousel (0 uses, added 4 months ago)
```

---

## Theming

### Theme Support

```
THEMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEFAULT THEME
──────────────────────────────────────────────────────────────────
Your standard dark mode theme used across projects

LIGHT MODE
──────────────────────────────────────────────────────────────────
Light variant for client portals and documentation

CLIENT OVERRIDES
──────────────────────────────────────────────────────────────────
Results Roofing    Primary: #e63946 (their brand red)
Galaxy Co          Primary: #7c3aed (purple)
QuickClaims        Primary: #059669 (green)

[Create New Theme]
```

### Per-Project Customization

```
PROJECT THEME: Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on: Default Theme

OVERRIDES
──────────────────────────────────────────────────────────────────
Primary       [■] #e63946     → Brand Red
Accent        [■] #1d3557     → Brand Navy

All other tokens inherited from Default Theme

[Edit Overrides]  [Reset to Default]
```

---

## Export & Sync

### Export Options

```
EXPORT UI LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Export Format:
● shadcn/ui structure (components/ui/)
○ Standalone package
○ Figma tokens (JSON)
○ Tailwind config only

Include:
☑️ All components
☑️ Design tokens
☑️ Custom variants
☐ Usage data
☐ Polish queue

[Export to ZIP]  [Push to GitHub]
```

### Sync with Project

```
SYNC TO PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: Results Roofing

CHANGES DETECTED
──────────────────────────────────────────────────────────────────
Library → Project:
+ Button: Loading state added
+ Tokens: New success color
~ Card: Padding adjustment

Project → Library:
? Custom DateRangePicker found
  [Add to Library]  [Ignore]

[Sync Changes]  [Preview Diff]
```

---

## Data Model

See `data-models.md` for complete schema. Key entities:
- `UIComponent`
- `UIVariant`
- `UIToken`
- `PolishItem`

---

## Integrations

### Agent Actions
- Agents use components from library
- New projects get library automatically

### Vault
- Custom components can be saved to Vault
- Component patterns linked to code blocks

### Projects
- Per-project theme overrides
- Usage tracking per project
