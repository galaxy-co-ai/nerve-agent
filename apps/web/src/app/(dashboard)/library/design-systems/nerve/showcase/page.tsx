"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Check, Sparkles, Box, Layers, ToggleRight, Palette } from "lucide-react"

// Import all NERVE components
import {
  // Primitives
  Surface,
  Glow,
  Well,
  ChromeShell,
  Canvas,
  // Backgrounds
  DotGrid,
  Noise,
  Vignette,
  AmbientGlow,
  // Components
  NerveButton,
  NerveCard,
  NerveCardHeader,
  NerveCardTitle,
  NerveCardDescription,
  NerveCardContent,
  NerveBadge,
  NerveInput,
  NerveTextarea,
  NerveCheckbox,
  NerveSwitch,
  NerveProgress,
  NerveAlert,
  NerveSeparator,
  NerveSkeleton,
  NerveLabel,
  NerveTabs,
  NerveTabsList,
  NerveTabsTrigger,
  NerveTabsContent,
  // Controls
  PowerButton,
  PillToggle,
  DialKnob,
  Readout,
  Orb,
} from "@/components/nerve"

// Copy button helper
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// Component showcase wrapper
function ShowcaseItem({
  name,
  description,
  code,
  children
}: {
  name: string
  description: string
  code: string
  children: React.ReactNode
}) {
  return (
    <NerveCard elevation={1} className="overflow-hidden">
      <NerveCardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <NerveCardTitle className="text-base">{name}</NerveCardTitle>
          <CopyCode code={code} />
        </div>
        <NerveCardDescription className="text-xs">{description}</NerveCardDescription>
      </NerveCardHeader>
      <NerveCardContent className="pt-0">
        {/* Live Preview */}
        <div className="rounded-lg bg-[var(--nerve-bg-deep)] border border-[var(--nerve-border-subtle)] p-6 flex items-center justify-center min-h-[100px] gap-4 flex-wrap">
          {children}
        </div>
        {/* Code */}
        <pre className="mt-3 text-[11px] text-zinc-500 bg-[var(--nerve-bg-deep)]/50 rounded-md p-3 overflow-x-auto border border-[var(--nerve-border-subtle)]">
          <code>{code}</code>
        </pre>
      </NerveCardContent>
    </NerveCard>
  )
}

// Section header
function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-5 w-5 text-[var(--nerve-gold-400)]" />
        <h2 className="text-xl font-semibold text-[var(--nerve-text-primary)]">{title}</h2>
      </div>
      <p className="text-sm text-[var(--nerve-text-muted)]">{description}</p>
    </div>
  )
}

export default function NerveShowcasePage() {
  const [switchOn, setSwitchOn] = useState(true)
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  const [powerOn, setPowerOn] = useState(true)
  const [pillValue, setPillValue] = useState<"left" | "right">("left")
  const [dialValue, setDialValue] = useState(0.65)

  return (
    <div className="min-h-screen bg-[var(--nerve-bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--nerve-border-subtle)] bg-[var(--nerve-bg-base)]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/library/design-systems/nerve"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-[var(--nerve-gold-400)]">NERVE Component Showcase</h1>
              <p className="text-sm text-zinc-500">Live preview of all NERVE UI components</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-16">

        {/* ============================================ */}
        {/* BUTTONS */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={Box}
            title="Buttons"
            description="Primary actions with gold glow, secondary options, and utility variants"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ShowcaseItem
              name="Button Variants"
              description="Primary with gold glow, secondary, ghost, outline, and destructive"
              code={`<NerveButton variant="primary">Primary</NerveButton>
<NerveButton variant="secondary">Secondary</NerveButton>
<NerveButton variant="ghost">Ghost</NerveButton>
<NerveButton variant="outline">Outline</NerveButton>
<NerveButton variant="destructive">Delete</NerveButton>`}
            >
              <NerveButton variant="primary">Primary</NerveButton>
              <NerveButton variant="secondary">Secondary</NerveButton>
              <NerveButton variant="ghost">Ghost</NerveButton>
              <NerveButton variant="outline">Outline</NerveButton>
              <NerveButton variant="destructive">Delete</NerveButton>
            </ShowcaseItem>

            <ShowcaseItem
              name="Button Sizes"
              description="Small, medium, large, and extra large"
              code={`<NerveButton size="sm">Small</NerveButton>
<NerveButton size="md">Medium</NerveButton>
<NerveButton size="lg">Large</NerveButton>
<NerveButton size="xl">Extra Large</NerveButton>`}
            >
              <NerveButton size="sm">Small</NerveButton>
              <NerveButton size="md">Medium</NerveButton>
              <NerveButton size="lg">Large</NerveButton>
              <NerveButton size="xl">Extra Large</NerveButton>
            </ShowcaseItem>

            <ShowcaseItem
              name="Loading State"
              description="Button with spinner animation"
              code={`<NerveButton loading>Saving...</NerveButton>
<NerveButton variant="secondary" loading>Loading</NerveButton>`}
            >
              <NerveButton loading>Saving...</NerveButton>
              <NerveButton variant="secondary" loading>Loading</NerveButton>
            </ShowcaseItem>
          </div>
        </section>

        {/* ============================================ */}
        {/* BADGES */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={Palette}
            title="Badges"
            description="Status indicators with semantic colors and subtle glows"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ShowcaseItem
              name="Semantic Badges"
              description="Status colors for success, warning, error, and info states"
              code={`<NerveBadge variant="primary">Primary</NerveBadge>
<NerveBadge variant="success">Success</NerveBadge>
<NerveBadge variant="warning">Warning</NerveBadge>
<NerveBadge variant="error">Error</NerveBadge>
<NerveBadge variant="info">Info</NerveBadge>`}
            >
              <NerveBadge variant="primary">Primary</NerveBadge>
              <NerveBadge variant="success">Success</NerveBadge>
              <NerveBadge variant="warning">Warning</NerveBadge>
              <NerveBadge variant="error">Error</NerveBadge>
              <NerveBadge variant="info">Info</NerveBadge>
            </ShowcaseItem>

            <ShowcaseItem
              name="Tag Badges"
              description="For categorizing notes, ideas, and decisions"
              code={`<NerveBadge variant="idea">Idea</NerveBadge>
<NerveBadge variant="task">Task</NerveBadge>
<NerveBadge variant="reference">Reference</NerveBadge>
<NerveBadge variant="insight">Insight</NerveBadge>
<NerveBadge variant="decision">Decision</NerveBadge>`}
            >
              <NerveBadge variant="idea">Idea</NerveBadge>
              <NerveBadge variant="task">Task</NerveBadge>
              <NerveBadge variant="reference">Reference</NerveBadge>
              <NerveBadge variant="insight">Insight</NerveBadge>
              <NerveBadge variant="decision">Decision</NerveBadge>
            </ShowcaseItem>

            <ShowcaseItem
              name="With Dot Indicator"
              description="Add a colored dot for additional visual cue"
              code={`<NerveBadge variant="success" dot>Live</NerveBadge>
<NerveBadge variant="warning" dot>Pending</NerveBadge>
<NerveBadge variant="error" dot>Failed</NerveBadge>`}
            >
              <NerveBadge variant="success" dot>Live</NerveBadge>
              <NerveBadge variant="warning" dot>Pending</NerveBadge>
              <NerveBadge variant="error" dot>Failed</NerveBadge>
            </ShowcaseItem>

            <ShowcaseItem
              name="Sizes"
              description="Small, medium, and large badge sizes"
              code={`<NerveBadge size="sm" variant="primary">Small</NerveBadge>
<NerveBadge size="md" variant="primary">Medium</NerveBadge>
<NerveBadge size="lg" variant="primary">Large</NerveBadge>`}
            >
              <NerveBadge size="sm" variant="primary">Small</NerveBadge>
              <NerveBadge size="md" variant="primary">Medium</NerveBadge>
              <NerveBadge size="lg" variant="primary">Large</NerveBadge>
            </ShowcaseItem>
          </div>
        </section>

        {/* ============================================ */}
        {/* CARDS */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={Layers}
            title="Cards"
            description="Layered surfaces with elevation and interactive variants"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ShowcaseItem
              name="Elevation Levels"
              description="1 = at rest, 2 = elevated, 3 = floating"
              code={`<NerveCard elevation={1}>Level 1</NerveCard>
<NerveCard elevation={2}>Level 2</NerveCard>
<NerveCard elevation={3}>Level 3</NerveCard>`}
            >
              <div className="flex gap-3 w-full justify-center">
                <NerveCard elevation={1} className="p-4 text-center text-sm">
                  <span className="text-zinc-400">Level 1</span>
                </NerveCard>
                <NerveCard elevation={2} className="p-4 text-center text-sm">
                  <span className="text-zinc-300">Level 2</span>
                </NerveCard>
                <NerveCard elevation={3} className="p-4 text-center text-sm">
                  <span className="text-zinc-200">Level 3</span>
                </NerveCard>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Interactive Card"
              description="Lifts on hover, press effect on click"
              code={`<NerveCard elevation={1} variant="interactive">
  Hover me
</NerveCard>`}
            >
              <NerveCard elevation={1} variant="interactive" className="p-6 text-center">
                <span className="text-zinc-300">Hover me</span>
              </NerveCard>
            </ShowcaseItem>

            <ShowcaseItem
              name="Glow Card"
              description="Gold glow border on hover"
              code={`<NerveCard elevation={1} variant="glow">
  Gold glow on hover
</NerveCard>`}
            >
              <NerveCard elevation={1} variant="glow" className="p-6 text-center">
                <span className="text-zinc-300">Gold glow on hover</span>
              </NerveCard>
            </ShowcaseItem>

            <ShowcaseItem
              name="Selected Card"
              description="Gold left border accent"
              code={`<NerveCard elevation={1} variant="selected">
  Selected state
</NerveCard>`}
            >
              <NerveCard elevation={1} variant="selected" className="p-6 text-center">
                <span className="text-zinc-300">Selected state</span>
              </NerveCard>
            </ShowcaseItem>

            <ShowcaseItem
              name="Glass Card"
              description="Translucent with backdrop blur"
              code={`<NerveCard elevation={1} variant="glass">
  Glass effect
</NerveCard>`}
            >
              <NerveCard elevation={1} variant="glass" className="p-6 text-center">
                <span className="text-zinc-300">Glass effect</span>
              </NerveCard>
            </ShowcaseItem>

            <ShowcaseItem
              name="Full Card Structure"
              description="Header, title, description, content"
              code={`<NerveCard elevation={2}>
  <NerveCardHeader>
    <NerveCardTitle>Title</NerveCardTitle>
    <NerveCardDescription>Description</NerveCardDescription>
  </NerveCardHeader>
  <NerveCardContent>Content</NerveCardContent>
</NerveCard>`}
            >
              <NerveCard elevation={2} className="w-full max-w-[200px]">
                <NerveCardHeader>
                  <NerveCardTitle className="text-sm">Card Title</NerveCardTitle>
                  <NerveCardDescription className="text-xs">Description here</NerveCardDescription>
                </NerveCardHeader>
                <NerveCardContent className="pt-0">
                  <p className="text-xs text-zinc-400">Card content goes here.</p>
                </NerveCardContent>
              </NerveCard>
            </ShowcaseItem>
          </div>
        </section>

        {/* ============================================ */}
        {/* FORM CONTROLS */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={ToggleRight}
            title="Form Controls"
            description="Inputs, toggles, and form elements with inset well effect"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ShowcaseItem
              name="Input"
              description="Text input with inset well styling"
              code={`<NerveInput placeholder="Enter text..." />
<NerveInput placeholder="With label" label="Email" />`}
            >
              <div className="w-full max-w-[280px] space-y-3">
                <NerveInput placeholder="Enter text..." />
                <NerveInput placeholder="you@example.com" label="Email" />
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Textarea"
              description="Multi-line text input"
              code={`<NerveTextarea placeholder="Enter message..." />`}
            >
              <div className="w-full max-w-[280px]">
                <NerveTextarea placeholder="Enter your message..." className="min-h-[80px]" />
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Switch"
              description="Toggle with gold accent when active"
              code={`<NerveSwitch checked={on} onCheckedChange={setOn} />`}
            >
              <div className="flex items-center gap-4">
                <NerveSwitch checked={switchOn} onCheckedChange={setSwitchOn} />
                <span className="text-sm text-zinc-400">{switchOn ? "On" : "Off"}</span>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Checkbox"
              description="Checkbox with gold check"
              code={`<NerveCheckbox checked={checked} onCheckedChange={setChecked} />`}
            >
              <div className="flex items-center gap-3">
                <NerveCheckbox
                  id="demo-checkbox"
                  checked={checkboxChecked}
                  onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                />
                <NerveLabel htmlFor="demo-checkbox">Accept terms</NerveLabel>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Progress"
              description="Progress bar with semantic variants"
              code={`<NerveProgress value={66} />
<NerveProgress value={66} variant="success" />`}
            >
              <div className="w-full max-w-[280px] space-y-4">
                <NerveProgress value={66} />
                <NerveProgress value={66} variant="success" />
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Skeleton"
              description="Loading placeholder with shimmer"
              code={`<NerveSkeleton className="h-4 w-[200px]" />
<NerveSkeleton className="h-10 w-10 rounded-full" />`}
            >
              <div className="space-y-3">
                <NerveSkeleton className="h-4 w-[200px]" />
                <div className="flex items-center gap-3">
                  <NerveSkeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <NerveSkeleton className="h-3 w-[120px]" />
                    <NerveSkeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              </div>
            </ShowcaseItem>
          </div>
        </section>

        {/* ============================================ */}
        {/* ALERTS */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={Sparkles}
            title="Feedback"
            description="Alerts, separators, and status indicators"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ShowcaseItem
              name="Alerts"
              description="Contextual feedback messages"
              code={`<NerveAlert variant="default">Default alert</NerveAlert>
<NerveAlert variant="success">Success!</NerveAlert>
<NerveAlert variant="warning">Warning</NerveAlert>
<NerveAlert variant="error">Error</NerveAlert>`}
            >
              <div className="w-full space-y-2">
                <NerveAlert variant="default">Default alert message</NerveAlert>
                <NerveAlert variant="success">Changes saved successfully</NerveAlert>
                <NerveAlert variant="warning">Please review before continuing</NerveAlert>
                <NerveAlert variant="error">Something went wrong</NerveAlert>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Separator"
              description="Visual divider between sections"
              code={`<NerveSeparator />
<NerveSeparator orientation="vertical" />`}
            >
              <div className="w-full space-y-4">
                <p className="text-sm text-zinc-400">Content above</p>
                <NerveSeparator />
                <p className="text-sm text-zinc-400">Content below</p>
              </div>
            </ShowcaseItem>
          </div>
        </section>

        {/* ============================================ */}
        {/* HARDWARE CONTROLS */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={ToggleRight}
            title="Hardware Controls"
            description="Premium, tactile controls inspired by audio plugins and hardware"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ShowcaseItem
              name="Power Button"
              description="Circular toggle with glow effect"
              code={`<PowerButton
  isOn={on}
  onToggle={setOn}
  activeColor="#facc15"
/>`}
            >
              <div className="flex items-center gap-4">
                <PowerButton
                  isOn={powerOn}
                  onToggle={setPowerOn}
                  activeColor="#facc15"
                  size={48}
                />
                <span className="text-sm text-zinc-400">{powerOn ? "On" : "Off"}</span>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Pill Toggle"
              description="Two-option toggle switch"
              code={`<PillToggle
  value={value}
  onChange={setValue}
  options={[
    { value: "left", label: "Option A" },
    { value: "right", label: "Option B" }
  ]}
/>`}
            >
              <PillToggle
                value={pillValue}
                onChange={(v) => setPillValue(v as "left" | "right")}
                options={[
                  { value: "left", label: "Suggest" },
                  { value: "right", label: "Storm" }
                ]}
              />
            </ShowcaseItem>

            <ShowcaseItem
              name="Dial Knob"
              description="Rotary control for 0-1 values"
              code={`<DialKnob
  value={0.65}
  onChange={setValue}
  size={64}
  showValue
/>`}
            >
              <div className="flex items-center gap-4">
                <DialKnob
                  value={dialValue}
                  onChange={setDialValue}
                  size={64}
                  showValue
                />
                <Readout value={Math.round(dialValue * 100)} label="Value" unit="%" />
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Orb"
              description="Glowing indicator orb"
              code={`<Orb color="gold" size={24} pulse />
<Orb color="green" size={24} />
<Orb color="red" size={24} />`}
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Orb color="gold" size={24} pulse />
                  <span className="text-xs text-zinc-500">Pulsing</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Orb color="green" size={24} />
                  <span className="text-xs text-zinc-500">Static</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Orb color="red" size={24} />
                  <span className="text-xs text-zinc-500">Error</span>
                </div>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Readout"
              description="Numeric display with label"
              code={`<Readout value={42} label="Tasks" />
<Readout value={98.5} label="Health" unit="%" />`}
            >
              <div className="flex items-center gap-6">
                <Readout value={42} label="Tasks" />
                <Readout value={98.5} label="Health" unit="%" />
              </div>
            </ShowcaseItem>
          </div>
        </section>

        {/* ============================================ */}
        {/* TABS */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={Layers}
            title="Tabs"
            description="Tabbed navigation with gold underline"
          />
          <div className="grid gap-4">
            <ShowcaseItem
              name="Tabs"
              description="Segmented content navigation"
              code={`<NerveTabs defaultValue="tab1">
  <NerveTabsList>
    <NerveTabsTrigger value="tab1">Overview</NerveTabsTrigger>
    <NerveTabsTrigger value="tab2">Details</NerveTabsTrigger>
    <NerveTabsTrigger value="tab3">Settings</NerveTabsTrigger>
  </NerveTabsList>
  <NerveTabsContent value="tab1">...</NerveTabsContent>
</NerveTabs>`}
            >
              <div className="w-full">
                <NerveTabs defaultValue="tab1">
                  <NerveTabsList>
                    <NerveTabsTrigger value="tab1">Overview</NerveTabsTrigger>
                    <NerveTabsTrigger value="tab2">Details</NerveTabsTrigger>
                    <NerveTabsTrigger value="tab3">Settings</NerveTabsTrigger>
                  </NerveTabsList>
                  <NerveTabsContent value="tab1">
                    <p className="text-sm text-zinc-400 p-4">Overview content goes here.</p>
                  </NerveTabsContent>
                  <NerveTabsContent value="tab2">
                    <p className="text-sm text-zinc-400 p-4">Details content goes here.</p>
                  </NerveTabsContent>
                  <NerveTabsContent value="tab3">
                    <p className="text-sm text-zinc-400 p-4">Settings content goes here.</p>
                  </NerveTabsContent>
                </NerveTabs>
              </div>
            </ShowcaseItem>
          </div>
        </section>

        {/* ============================================ */}
        {/* PRIMITIVES */}
        {/* ============================================ */}
        <section>
          <SectionHeader
            icon={Layers}
            title="Primitives"
            description="Low-level building blocks for custom components"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ShowcaseItem
              name="Surface"
              description="Elevation wrapper with level prop"
              code={`<Surface level={1}>Content</Surface>
<Surface level={2}>Elevated</Surface>
<Surface level={3}>Floating</Surface>`}
            >
              <div className="flex gap-3">
                <Surface level={1} className="p-4 rounded-lg">
                  <span className="text-xs text-zinc-400">Level 1</span>
                </Surface>
                <Surface level={2} className="p-4 rounded-lg">
                  <span className="text-xs text-zinc-300">Level 2</span>
                </Surface>
                <Surface level={3} className="p-4 rounded-lg">
                  <span className="text-xs text-zinc-200">Level 3</span>
                </Surface>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Glow"
              description="Wrapper that adds glow effect"
              code={`<Glow intensity="subtle" color="gold">
  <div>Glowing content</div>
</Glow>`}
            >
              <div className="flex gap-4">
                <Glow intensity="subtle" color="gold">
                  <div className="p-3 rounded-lg bg-[var(--nerve-bg-elevated)] text-xs text-zinc-300">Subtle</div>
                </Glow>
                <Glow intensity="medium" color="gold">
                  <div className="p-3 rounded-lg bg-[var(--nerve-bg-elevated)] text-xs text-zinc-300">Medium</div>
                </Glow>
                <Glow intensity="intense" color="gold">
                  <div className="p-3 rounded-lg bg-[var(--nerve-bg-elevated)] text-xs text-zinc-300">Intense</div>
                </Glow>
              </div>
            </ShowcaseItem>

            <ShowcaseItem
              name="Well"
              description="Inset/recessed container"
              code={`<Well className="p-4">
  Recessed content area
</Well>`}
            >
              <Well className="p-4 rounded-lg w-full max-w-[200px]">
                <span className="text-xs text-zinc-400">Inset well area</span>
              </Well>
            </ShowcaseItem>

            <ShowcaseItem
              name="Chrome Shell"
              description="Premium outer container"
              code={`<ChromeShell>
  <div className="p-4">Content</div>
</ChromeShell>`}
            >
              <ChromeShell className="w-full max-w-[200px]">
                <div className="p-4 text-xs text-zinc-300 text-center">Chrome container</div>
              </ChromeShell>
            </ShowcaseItem>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-[var(--nerve-border-subtle)]">
          <p className="text-sm text-zinc-500">
            NERVE Design System • Use these components for consistent UI across the app
          </p>
          <Link
            href="/library/design-systems/nerve"
            className="text-[var(--nerve-gold-400)] hover:text-[var(--nerve-gold-300)] text-sm mt-2 inline-block"
          >
            ← Back to NERVE Design System
          </Link>
        </footer>
      </main>
    </div>
  )
}
