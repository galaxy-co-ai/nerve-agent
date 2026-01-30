/**
 * NERVE Design System Seed Data
 * Run this to populate the design system library with the NERVE design system
 *
 * Usage:
 * 1. Import this in a server action or API route
 * 2. Call seedNerveDesignSystem(userId)
 */

import { db } from "@/lib/db"

export async function seedNerveDesignSystem(userId: string) {
  // Check if NERVE already exists for this user
  const existing = await db.designSystem.findFirst({
    where: { slug: "nerve", userId },
  })

  if (existing) {
    console.log("NERVE design system already exists, updating...")
    return db.designSystem.update({
      where: { id: existing.id },
      data: getNerveData(),
    })
  }

  // Create new NERVE design system
  return db.designSystem.create({
    data: {
      userId,
      slug: "nerve",
      ...getNerveData(),
    },
  })
}

function getNerveData() {
  return {
    name: "NERVE",
    description: `NERVE is a premium dark-mode design system built for Nerve Agent. It features research-backed gold accents, layered shadows for depth, and tactile textures that create a hardware-inspired aesthetic. Every surface has physical presence through insets, bevels, and shadows.`,
    philosophy: `Clean, beautiful, smooth-operating hardware that defies reality with subtle, tactile texture. Precision meets soul. Not cold and clinical, not overly ornate.`,
    coverColor: "#eab308",
    version: "1.0.0",

    palette: {
      "background-layers": {
        "nerve-bg-deep": "#08080a",
        "nerve-bg-base": "#0c0c0e",
        "nerve-bg-surface": "#141416",
        "nerve-bg-elevated": "#1a1a1d",
        "nerve-bg-hover": "#222225",
        "nerve-bg-active": "#2a2a2e",
      },
      "gold-accent": {
        "nerve-gold-50": "#fefce8",
        "nerve-gold-100": "#fef9c3",
        "nerve-gold-200": "#fef08a",
        "nerve-gold-300": "#fde047",
        "nerve-gold-400": "#facc15",
        "nerve-gold-500": "#eab308",
        "nerve-gold-600": "#ca8a04",
        "nerve-gold-700": "#a16207",
        "nerve-gold-metallic": "#d4af37",
        "nerve-gold-premium": "#e5b84a",
      },
      "text": {
        "nerve-text-primary": "#f4f4f5",
        "nerve-text-secondary": "#a1a1aa",
        "nerve-text-muted": "#71717a",
        "nerve-text-faint": "#52525b",
      },
      "borders": {
        "nerve-border-subtle": "rgba(255, 255, 255, 0.05)",
        "nerve-border-default": "rgba(255, 255, 255, 0.08)",
        "nerve-border-strong": "rgba(255, 255, 255, 0.12)",
        "nerve-border-bright": "rgba(255, 255, 255, 0.18)",
      },
      "semantic": {
        "nerve-success": "#22c55e",
        "nerve-info": "#3b82f6",
        "nerve-warning": "#f59e0b",
        "nerve-error": "#ef4444",
      },
      "tags": {
        "nerve-tag-idea": "#a855f7",
        "nerve-tag-task": "#f97316",
        "nerve-tag-reference": "#3b82f6",
        "nerve-tag-insight": "#22c55e",
        "nerve-tag-decision": "#eab308",
      },
    },

    typography: {
      fonts: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
      },
      scale: {
        display: { size: "32px", weight: 700, letterSpacing: "-0.02em" },
        h1: { size: "24px", weight: 600, letterSpacing: "-0.01em" },
        h2: { size: "20px", weight: 600, letterSpacing: "-0.01em" },
        h3: { size: "16px", weight: 600 },
        body: { size: "14px", weight: 400 },
        "body-small": { size: "13px", weight: 400 },
        caption: { size: "12px", weight: 500, letterSpacing: "0.02em" },
        label: { size: "11px", weight: 600, letterSpacing: "0.05em" },
        micro: { size: "10px", weight: 500, letterSpacing: "0.05em" },
      },
    },

    primitives: [
      {
        name: "Surface Level 0 (Inset)",
        description: "Recessed areas like inputs and wells. Creates the illusion of pressing INTO the surface.",
        code: `.nerve-inset {
  background: var(--nerve-bg-deep);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--nerve-border-subtle);
}`,
      },
      {
        name: "Surface Level 1",
        description: "Cards at rest. Subtle lift - the default card state.",
        code: `.nerve-surface-1 {
  background: var(--nerve-bg-surface);
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.08),
    0 2px 2px rgba(0, 0, 0, 0.08),
    0 4px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--nerve-border-subtle);
}`,
      },
      {
        name: "Surface Level 2",
        description: "Cards on hover, dropdowns. Medium lift with more spread - indicates interactivity.",
        code: `.nerve-surface-2 {
  background: var(--nerve-bg-elevated);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--nerve-border-default);
}`,
      },
      {
        name: "Surface Level 3",
        description: "Modals, popovers, tooltips. High lift - clearly floating above the page.",
        code: `.nerve-surface-3 {
  background: var(--nerve-bg-elevated);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--nerve-border-strong);
}`,
      },
      {
        name: "Inner Highlight",
        description: "Lit from above effect - adds subtle top highlight to surfaces.",
        code: `.nerve-highlight {
  position: relative;
}
.nerve-highlight::before {
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
}`,
      },
      {
        name: "Focus Ring",
        description: "Premium double-ring with gold glow for focus states.",
        code: `.nerve-focus-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--nerve-bg-base),
    0 0 0 4px var(--nerve-gold-400),
    0 0 20px var(--nerve-gold-glow);
}`,
      },
    ],

    backgrounds: [
      {
        name: "Dot Grid",
        description: "Subtle dot pattern for content areas. 24px spacing.",
        code: `.bg-nerve-dots {
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}`,
      },
      {
        name: "Vignette",
        description: "Edge darkening for depth. Use on main content areas.",
        code: `.bg-nerve-vignette {
  position: relative;
}
.bg-nerve-vignette::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
}`,
      },
      {
        name: "Ambient Glow",
        description: "Subtle gold glow at top of page.",
        code: `.bg-nerve-ambient {
  background: radial-gradient(
    ellipse at 20% 0%,
    rgba(251, 191, 36, 0.03) 0%,
    transparent 50%
  );
}`,
      },
      {
        name: "Premium Background",
        description: "Combined ambient glow + dot grid. The full NERVE treatment.",
        code: `.bg-nerve-premium {
  background-color: #09090B;
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(251, 191, 36, 0.02) 0%, transparent 50%),
    radial-gradient(circle, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px;
}`,
      },
      {
        name: "Noise Texture",
        description: "Subtle grain overlay for tactile feel. Apply to cards and panels.",
        code: `.nerve-texture-noise {
  position: relative;
}
.nerve-texture-noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  border-radius: inherit;
  mix-blend-mode: overlay;
}`,
      },
    ],

    components: [
      {
        name: "NerveCard",
        category: "layout",
        props: "elevation: 1 | 2 | 3, variant: default | raised | glow | interactive | glass | selected",
        usage: "Cards with layered shadows and premium depth.",
        code: `import { NerveCard, NerveCardHeader, NerveCardTitle, NerveCardContent } from "@/components/nerve"

<NerveCard elevation={1} variant="interactive">
  <NerveCardHeader>
    <NerveCardTitle>Card Title</NerveCardTitle>
  </NerveCardHeader>
  <NerveCardContent>
    Content here
  </NerveCardContent>
</NerveCard>`,
      },
      {
        name: "NerveInput",
        category: "forms",
        props: "label, helperText, error, leftElement, rightElement",
        usage: "Inputs with inset well effect and gold focus glow.",
        code: `import { NerveInput } from "@/components/nerve"

<NerveInput
  label="Email"
  placeholder="Enter your email"
  leftElement={<Mail className="h-4 w-4" />}
  error="Invalid email"
/>`,
      },
      {
        name: "NerveButton",
        category: "forms",
        props: "variant: primary | secondary | ghost | outline | destructive, size: sm | md | lg | xl | icon, loading",
        usage: "Buttons with gold gradients, layered shadows, and hover glows.",
        code: `import { NerveButton } from "@/components/nerve"

<NerveButton variant="primary" size="lg">Get Started</NerveButton>
<NerveButton variant="secondary">Cancel</NerveButton>
<NerveButton variant="outline" loading>Loading...</NerveButton>`,
      },
      {
        name: "NerveBadge",
        category: "feedback",
        props: "variant: default | primary | success | warning | error | info | outline | idea | task | reference | insight | decision, size: sm | md | lg, pulse, dot",
        usage: "Badges with glow effects and tag-specific variants.",
        code: `import { NerveBadge } from "@/components/nerve"

<NerveBadge variant="idea">Idea</NerveBadge>
<NerveBadge variant="task" dot>In Progress</NerveBadge>
<NerveBadge variant="success" pulse>Live</NerveBadge>`,
      },
      {
        name: "NerveDialog",
        category: "overlay",
        props: "Standard dialog props",
        usage: "Modal dialogs with NERVE elevation and styling.",
        code: `import { NerveDialog, NerveDialogContent, NerveDialogHeader, NerveDialogTitle } from "@/components/nerve"

<NerveDialog>
  <NerveDialogTrigger>Open</NerveDialogTrigger>
  <NerveDialogContent>
    <NerveDialogHeader>
      <NerveDialogTitle>Title</NerveDialogTitle>
    </NerveDialogHeader>
    Content here
  </NerveDialogContent>
</NerveDialog>`,
      },
      {
        name: "NerveTabs",
        category: "navigation",
        props: "Standard tabs props",
        usage: "Tab navigation with NERVE styling.",
        code: `import { NerveTabs, NerveTabsList, NerveTabsTrigger, NerveTabsContent } from "@/components/nerve"

<NerveTabs defaultValue="tab1">
  <NerveTabsList>
    <NerveTabsTrigger value="tab1">Tab 1</NerveTabsTrigger>
    <NerveTabsTrigger value="tab2">Tab 2</NerveTabsTrigger>
  </NerveTabsList>
  <NerveTabsContent value="tab1">Content 1</NerveTabsContent>
  <NerveTabsContent value="tab2">Content 2</NerveTabsContent>
</NerveTabs>`,
      },
      {
        name: "NerveSelect",
        category: "forms",
        props: "Standard select props",
        usage: "Dropdown selects with NERVE styling.",
        code: `import { NerveSelect, NerveSelectContent, NerveSelectItem, NerveSelectTrigger, NerveSelectValue } from "@/components/nerve"

<NerveSelect>
  <NerveSelectTrigger>
    <NerveSelectValue placeholder="Select..." />
  </NerveSelectTrigger>
  <NerveSelectContent>
    <NerveSelectItem value="1">Option 1</NerveSelectItem>
    <NerveSelectItem value="2">Option 2</NerveSelectItem>
  </NerveSelectContent>
</NerveSelect>`,
      },
      {
        name: "NerveTextarea",
        category: "forms",
        props: "Standard textarea props",
        usage: "Textareas with inset well effect.",
        code: `import { NerveTextarea } from "@/components/nerve"

<NerveTextarea placeholder="Enter your message..." />`,
      },
      {
        name: "NerveCheckbox",
        category: "forms",
        props: "Standard checkbox props",
        usage: "Checkboxes with NERVE styling.",
        code: `import { NerveCheckbox } from "@/components/nerve"

<NerveCheckbox id="terms" />
<label htmlFor="terms">Accept terms</label>`,
      },
      {
        name: "NerveSwitch",
        category: "forms",
        props: "Standard switch props",
        usage: "Toggle switches with gold accent.",
        code: `import { NerveSwitch } from "@/components/nerve"

<NerveSwitch />`,
      },
      {
        name: "NerveAlert",
        category: "feedback",
        props: "variant: default | destructive | success | warning | info",
        usage: "Alert messages with NERVE styling.",
        code: `import { NerveAlert, NerveAlertTitle, NerveAlertDescription } from "@/components/nerve"

<NerveAlert variant="success">
  <NerveAlertTitle>Success!</NerveAlertTitle>
  <NerveAlertDescription>Your changes have been saved.</NerveAlertDescription>
</NerveAlert>`,
      },
      {
        name: "NerveTooltip",
        category: "overlay",
        props: "Standard tooltip props",
        usage: "Tooltips with NERVE elevation.",
        code: `import { NerveTooltip, NerveTooltipTrigger, NerveTooltipContent } from "@/components/nerve"

<NerveTooltip>
  <NerveTooltipTrigger>Hover me</NerveTooltipTrigger>
  <NerveTooltipContent>Tooltip content</NerveTooltipContent>
</NerveTooltip>`,
      },
      {
        name: "NerveProgress",
        category: "feedback",
        props: "value, variant: default | gold",
        usage: "Progress bars with gold accent option.",
        code: `import { NerveProgress } from "@/components/nerve"

<NerveProgress value={66} variant="gold" />`,
      },
      {
        name: "NerveSkeleton",
        category: "feedback",
        props: "Standard skeleton props",
        usage: "Loading skeletons with shimmer effect.",
        code: `import { NerveSkeleton } from "@/components/nerve"

<NerveSkeleton className="h-4 w-[250px]" />`,
      },
      {
        name: "NerveAvatar",
        category: "display",
        props: "Standard avatar props",
        usage: "Avatars with NERVE styling.",
        code: `import { NerveAvatar, NerveAvatarImage, NerveAvatarFallback } from "@/components/nerve"

<NerveAvatar>
  <NerveAvatarImage src="https://..." />
  <NerveAvatarFallback>JD</NerveAvatarFallback>
</NerveAvatar>`,
      },
    ],

    utilities: {
      glow: [
        { name: ".glow-gold-subtle", value: "Subtle gold glow (10px)" },
        { name: ".glow-gold-soft", value: "Soft gold glow (15px + 30px)" },
        { name: ".glow-gold-medium", value: "Medium gold glow (20px + 40px)" },
        { name: ".glow-gold-intense", value: "Intense gold glow (15px + 30px + 60px)" },
        { name: ".nerve-focus-ring", value: "Gold focus ring with glow" },
        { name: ".hover-glow-gold", value: "Gold glow on hover" },
      ],
      surface: [
        { name: ".nerve-inset", value: "Inset well effect" },
        { name: ".nerve-surface-1", value: "Level 1 elevation (cards at rest)" },
        { name: ".nerve-surface-2", value: "Level 2 elevation (hover, dropdowns)" },
        { name: ".nerve-surface-3", value: "Level 3 elevation (modals, popovers)" },
        { name: ".nerve-highlight", value: "Inner border 'lit from above' effect" },
      ],
      background: [
        { name: ".bg-nerve-dots", value: "Dot grid pattern (24px spacing)" },
        { name: ".bg-nerve-vignette", value: "Edge darkening effect" },
        { name: ".bg-nerve-ambient", value: "Gold ambient glow at top" },
        { name: ".bg-nerve-premium", value: "Combined: ambient glow + dot grid" },
        { name: ".nerve-texture-noise", value: "Subtle grain overlay (3% opacity)" },
      ],
      text: [
        { name: ".text-nerve-gold", value: "Gold text (--nerve-gold-400)" },
        { name: ".text-nerve-gold-bright", value: "Bright gold text (--nerve-gold-300)" },
        { name: ".text-gradient-gold", value: "Gold gradient text" },
        { name: ".text-label", value: "Uppercase label style" },
      ],
      interactive: [
        { name: ".press-effect", value: "Scale down on :active (0.98)" },
        { name: ".hover-lift", value: "Lift up on hover (-2px + shadow)" },
      ],
    },

    cssContent: `/* ═══════════════════════════════════════════════════════════
   NERVE AGENT DARK THEME
   Hardware-inspired, premium aesthetic with warm gold accents
   ═══════════════════════════════════════════════════════════ */

.dark {
  /* Background Layers */
  --nerve-bg-deep: #08080a;
  --nerve-bg-base: #0c0c0e;
  --nerve-bg-surface: #141416;
  --nerve-bg-elevated: #1a1a1d;
  --nerve-bg-hover: #222225;
  --nerve-bg-active: #2a2a2e;

  /* Border Colors */
  --nerve-border-subtle: rgba(255, 255, 255, 0.05);
  --nerve-border-default: rgba(255, 255, 255, 0.08);
  --nerve-border-strong: rgba(255, 255, 255, 0.12);
  --nerve-border-bright: rgba(255, 255, 255, 0.18);

  /* Text Colors */
  --nerve-text-primary: #f4f4f5;
  --nerve-text-secondary: #a1a1aa;
  --nerve-text-muted: #71717a;
  --nerve-text-faint: #52525b;

  /* Gold Palette */
  --nerve-gold-50: #fefce8;
  --nerve-gold-100: #fef9c3;
  --nerve-gold-200: #fef08a;
  --nerve-gold-300: #fde047;
  --nerve-gold-400: #facc15;
  --nerve-gold-500: #eab308;
  --nerve-gold-600: #ca8a04;
  --nerve-gold-700: #a16207;
  --nerve-gold-metallic: #d4af37;
  --nerve-gold-premium: #e5b84a;

  /* Glow values */
  --nerve-gold-glow-subtle: rgba(234, 179, 8, 0.08);
  --nerve-gold-glow: rgba(234, 179, 8, 0.12);
  --nerve-gold-glow-medium: rgba(234, 179, 8, 0.18);
  --nerve-gold-glow-strong: rgba(234, 179, 8, 0.25);

  /* Semantic Colors */
  --nerve-success: #22c55e;
  --nerve-info: #3b82f6;
  --nerve-warning: #f59e0b;
  --nerve-error: #ef4444;

  /* Layered Shadows */
  --nerve-shadow-1: 0 1px 1px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.08), 0 4px 4px rgba(0,0,0,0.08);
  --nerve-shadow-2: 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1);
  --nerve-shadow-3: 0 1px 2px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.08);
  --nerve-shadow-inset: inset 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.2);
}`,
  }
}

export default seedNerveDesignSystem
