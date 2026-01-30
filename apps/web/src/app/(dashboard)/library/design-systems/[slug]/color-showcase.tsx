"use client"

import * as React from "react"
import { useState, useRef } from "react"
import {
  Lightbulb,
  CheckSquare,
  Sparkles,
  GitBranch,
  BookMarked,
  Info,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

// Category metadata
const CATEGORY_META: Record<string, { label: string }> = {
  tags: { label: "Tags" },
  text: { label: "Typography" },
  borders: { label: "Borders" },
  semantic: { label: "Semantic" },
  "gold-accent": { label: "Accent" },
  "background-layers": { label: "Surfaces" },
}

// Tag icons mapping
const TAG_ICONS: Record<string, React.ReactNode> = {
  "nerve-tag-idea": <Lightbulb className="h-3 w-3" />,
  "nerve-tag-task": <CheckSquare className="h-3 w-3" />,
  "nerve-tag-insight": <Sparkles className="h-3 w-3" />,
  "nerve-tag-decision": <GitBranch className="h-3 w-3" />,
  "nerve-tag-reference": <BookMarked className="h-3 w-3" />,
}

interface ColorShowcaseProps {
  palette: Record<string, Record<string, string>>
}

export function ColorShowcase({ palette }: ColorShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<string>("tags")

  return (
    <div>
      <div
        ref={containerRef}
        className="relative rounded-xl border border-border/50 bg-[var(--nerve-bg-surface,#141416)]"
      >
        <div className="p-6">
          <ShowcaseScene palette={palette} onCategorySelect={setActiveCategory} />
        </div>

        {/* Color Values Strip - shows colors for selected category */}
        <div className="border-t border-border/30 bg-[var(--nerve-bg-base,#0c0c0e)] px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 whitespace-nowrap flex-shrink-0">
              {CATEGORY_META[activeCategory]?.label || activeCategory}
            </span>
            <div className="flex flex-wrap gap-2 flex-1">
              {Object.entries(palette[activeCategory] || {}).map(([name, value]) => (
                <ColorChip key={name} name={name} value={value} category={activeCategory} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground/40 whitespace-nowrap flex-shrink-0">
              Click to copy
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ShowcaseSceneProps {
  palette: Record<string, Record<string, string>>
  onCategorySelect: (category: string) => void
}

function ShowcaseScene({ palette, onCategorySelect }: ShowcaseSceneProps) {
  const tags = palette["tags"] || {}
  const text = palette["text"] || {}
  const borders = palette["borders"] || {}
  const semantic = palette["semantic"] || {}
  const gold = palette["gold-accent"] || {}
  const backgrounds = palette["background-layers"] || {}

  // New design system fallback values (v2.0 - cool pale gold)
  const goldFallbacks = {
    "nerve-gold-300": "#D4B878",
    "nerve-gold-400": "#C9A84C",
    "nerve-gold-500": "#B8943C",
  }
  const bgFallbacks = {
    "nerve-bg-deep": "#050507",
    "nerve-bg-base": "#0A0A0C",
    "nerve-bg-surface": "#141418",
    "nerve-bg-elevated": "#1E1E22",
    "nerve-bg-hover": "#28282E",
    "nerve-bg-active": "#32323A",
  }
  const textFallbacks = {
    "nerve-text-primary": "#F0F0F2",
    "nerve-text-secondary": "#A0A0A8",
    "nerve-text-muted": "#68687A",
  }
  const borderFallbacks = {
    "nerve-border-subtle": "rgba(255,255,255,0.05)",
    "nerve-border-default": "rgba(255,255,255,0.08)",
    "nerve-border-strong": "rgba(255,255,255,0.12)",
    "nerve-border-bright": "rgba(255,255,255,0.18)",
  }

  // Interactive state for toggle
  const [toggleOn, setToggleOn] = useState(true)
  // Interactive state for checkbox
  const [checkboxChecked, setCheckboxChecked] = useState(true)
  // Interactive state for radio
  const [radioSelected, setRadioSelected] = useState<"a" | "b">("a")
  // Button hover states
  const [primaryHover, setPrimaryHover] = useState(false)
  const [secondaryHover, setSecondaryHover] = useState(false)
  const [ghostHover, setGhostHover] = useState(false)

  return (
    <div className="space-y-6">
      {/* Row 1: Tags + Semantic (badges row) */}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {/* Tags */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Tags</span>
          <div className="flex flex-wrap gap-3">
            {Object.entries(tags).map(([name, color]) => (
              <button
                key={name}
                onClick={() => onCategorySelect("tags")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 hover:scale-105"
                style={{
                  backgroundColor: `${color}25`,
                  color: color,
                  border: `1px solid ${color}50`,
                  boxShadow: `0 0 12px ${color}20`,
                }}
              >
                {TAG_ICONS[name]}
                {name.replace("nerve-tag-", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-8"
          style={{ backgroundColor: borders["nerve-border-subtle"] || borderFallbacks["nerve-border-subtle"] }}
        />

        {/* Semantic */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Status</span>
          <div className="flex flex-wrap gap-3">
            <StatusBadge icon={<Info className="h-3 w-3" />} label="Info" color={semantic["nerve-info"] || "#3b82f6"} onClick={() => onCategorySelect("semantic")} />
            <StatusBadge icon={<CheckCircle className="h-3 w-3" />} label="Success" color={semantic["nerve-success"] || "#22c55e"} onClick={() => onCategorySelect("semantic")} />
            <StatusBadge icon={<AlertTriangle className="h-3 w-3" />} label="Warning" color={semantic["nerve-warning"] || "#f59e0b"} onClick={() => onCategorySelect("semantic")} />
            <StatusBadge icon={<AlertCircle className="h-3 w-3" />} label="Error" color={semantic["nerve-error"] || "#ef4444"} onClick={() => onCategorySelect("semantic")} />
          </div>
        </div>
      </div>

      {/* Row 2: UI Components showcase */}
      <div
        className="p-5 rounded-lg"
        style={{
          backgroundColor: backgrounds["nerve-bg-elevated"] || bgFallbacks["nerve-bg-elevated"],
          border: `1px solid ${borders["nerve-border-default"] || borderFallbacks["nerve-border-default"]}`,
        }}
      >
        <div className="flex flex-wrap items-center gap-8">
          {/* Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Buttons</span>
            <div className="flex items-center gap-2">
              {/* Primary */}
              <button
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-95"
                onClick={() => onCategorySelect("gold-accent")}
                onMouseEnter={() => setPrimaryHover(true)}
                onMouseLeave={() => setPrimaryHover(false)}
                style={{
                  background: primaryHover
                    ? `linear-gradient(135deg, ${gold["nerve-gold-300"] || goldFallbacks["nerve-gold-300"]}, ${gold["nerve-gold-400"] || goldFallbacks["nerve-gold-400"]})`
                    : `linear-gradient(135deg, ${gold["nerve-gold-400"] || goldFallbacks["nerve-gold-400"]}, ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]})`,
                  color: "#050507",
                  boxShadow: primaryHover
                    ? `0 4px 12px ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]}60, 0 0 20px ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]}25, inset 0 1px 0 rgba(255,255,255,0.25)`
                    : `0 2px 8px ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
              >
                Primary
              </button>
              {/* Secondary */}
              <button
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 active:scale-95"
                onClick={() => onCategorySelect("background-layers")}
                onMouseEnter={() => setSecondaryHover(true)}
                onMouseLeave={() => setSecondaryHover(false)}
                style={{
                  backgroundColor: secondaryHover ? (backgrounds["nerve-bg-active"] || bgFallbacks["nerve-bg-active"]) : (backgrounds["nerve-bg-hover"] || bgFallbacks["nerve-bg-hover"]),
                  color: text["nerve-text-primary"] || textFallbacks["nerve-text-primary"],
                  border: `1px solid ${secondaryHover ? (borders["nerve-border-strong"] || borderFallbacks["nerve-border-strong"]) : (borders["nerve-border-default"] || borderFallbacks["nerve-border-default"])}`,
                }}
              >
                Secondary
              </button>
              {/* Ghost */}
              <button
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 active:scale-95"
                onClick={() => onCategorySelect("text")}
                onMouseEnter={() => setGhostHover(true)}
                onMouseLeave={() => setGhostHover(false)}
                style={{
                  backgroundColor: ghostHover ? (backgrounds["nerve-bg-hover"] || bgFallbacks["nerve-bg-hover"]) : "transparent",
                  color: ghostHover ? (text["nerve-text-primary"] || textFallbacks["nerve-text-primary"]) : (text["nerve-text-secondary"] || textFallbacks["nerve-text-secondary"]),
                }}
              >
                Ghost
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-8" style={{ backgroundColor: borders["nerve-border-subtle"] || borderFallbacks["nerve-border-subtle"] }} />

          {/* Toggle/Switch */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Toggle</span>
            <button
              onClick={() => { setToggleOn(!toggleOn); onCategorySelect("semantic"); }}
              className="w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-200 cursor-pointer"
              style={{ backgroundColor: toggleOn ? (semantic["nerve-success"] || "#22c55e") : (backgrounds["nerve-bg-active"] || bgFallbacks["nerve-bg-active"]) }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                style={{ marginLeft: toggleOn ? "auto" : "0", opacity: toggleOn ? 1 : 0.8 }}
              />
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-8" style={{ backgroundColor: borders["nerve-border-subtle"] || borderFallbacks["nerve-border-subtle"] }} />

          {/* Checkbox/Radio */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Inputs</span>
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <button
                onClick={() => { setCheckboxChecked(!checkboxChecked); onCategorySelect("gold-accent"); }}
                className="w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: checkboxChecked ? (gold["nerve-gold-400"] || goldFallbacks["nerve-gold-400"]) : (backgrounds["nerve-bg-hover"] || bgFallbacks["nerve-bg-hover"]),
                  border: checkboxChecked ? "none" : `1px solid ${borders["nerve-border-strong"] || borderFallbacks["nerve-border-strong"]}`,
                  boxShadow: checkboxChecked ? `0 0 8px ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]}40` : "none",
                }}
              >
                {checkboxChecked && (
                  <svg className="w-3 h-3 text-[#050507]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              {/* Radio A */}
              <button
                onClick={() => { setRadioSelected("a"); onCategorySelect("gold-accent"); }}
                className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: radioSelected === "a" ? (gold["nerve-gold-400"] || goldFallbacks["nerve-gold-400"]) : (backgrounds["nerve-bg-hover"] || bgFallbacks["nerve-bg-hover"]),
                  border: radioSelected === "a" ? "none" : `1px solid ${borders["nerve-border-strong"] || borderFallbacks["nerve-border-strong"]}`,
                  boxShadow: radioSelected === "a" ? `0 0 8px ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]}40` : "none",
                }}
              >
                {radioSelected === "a" && <div className="w-1.5 h-1.5 rounded-full bg-[#050507]" />}
              </button>
              {/* Radio B */}
              <button
                onClick={() => { setRadioSelected("b"); onCategorySelect("gold-accent"); }}
                className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: radioSelected === "b" ? (gold["nerve-gold-400"] || goldFallbacks["nerve-gold-400"]) : (backgrounds["nerve-bg-hover"] || bgFallbacks["nerve-bg-hover"]),
                  border: radioSelected === "b" ? "none" : `1px solid ${borders["nerve-border-strong"] || borderFallbacks["nerve-border-strong"]}`,
                  boxShadow: radioSelected === "b" ? `0 0 8px ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]}40` : "none",
                }}
              >
                {radioSelected === "b" && <div className="w-1.5 h-1.5 rounded-full bg-[#050507]" />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden xl:block w-px h-8" style={{ backgroundColor: borders["nerve-border-subtle"] || borderFallbacks["nerve-border-subtle"] }} />

          {/* Border samples */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">Borders</span>
            <div className="flex items-center gap-1.5">
              {[
                { key: "nerve-border-subtle", fallback: borderFallbacks["nerve-border-subtle"] },
                { key: "nerve-border-default", fallback: borderFallbacks["nerve-border-default"] },
                { key: "nerve-border-strong", fallback: borderFallbacks["nerve-border-strong"] },
                { key: "nerve-border-bright", fallback: borderFallbacks["nerve-border-bright"] },
              ].map(({ key, fallback }, i) => (
                <button
                  key={key}
                  onClick={() => onCategorySelect("borders")}
                  className="w-6 h-6 rounded transition-transform duration-150 hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                    border: `${i < 2 ? 1 : 2}px solid ${borders[key] || fallback}`,
                  }}
                  title={key.replace("nerve-", "")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Gold Accent (hero element) */}
      <div className="px-1">
        <div className="flex items-center gap-6">
          {/* Primary button */}
          <button
            onClick={() => onCategorySelect("gold-accent")}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95 hover:shadow-[0_4px_16px_var(--nerve-gold-glow-medium),0_0_24px_var(--nerve-gold-glow-subtle)]"
            style={{
              background: `linear-gradient(135deg, ${gold["nerve-gold-300"] || goldFallbacks["nerve-gold-300"]}, ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]})`,
              color: "#050507",
              boxShadow: `0 4px 12px ${gold["nerve-gold-500"] || goldFallbacks["nerve-gold-500"]}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            Primary Action
          </button>

          {/* Gold scale */}
          <div className="flex-1 flex rounded-lg overflow-hidden h-10" onClick={() => onCategorySelect("gold-accent")}>
            {Object.entries(gold).slice(0, 8).map(([name, color]) => (
              <div
                key={name}
                className="flex-1 transition-transform hover:scale-y-110 cursor-pointer"
                style={{ backgroundColor: color }}
                title={name.replace("nerve-", "")}
              />
            ))}
          </div>

          {/* Link example */}
          <p className="hidden lg:block text-sm whitespace-nowrap">
            <span style={{ color: text["nerve-text-muted"] || textFallbacks["nerve-text-muted"] }}>Need help? </span>
            <button
              onClick={() => onCategorySelect("text")}
              className="underline underline-offset-2 cursor-pointer transition-colors duration-150 hover:text-white"
              style={{ color: gold["nerve-gold-400"] || goldFallbacks["nerve-gold-400"] }}
            >
              View docs
            </button>
          </p>
        </div>
      </div>

      {/* Row 4: Surface Layers */}
      <div className="flex rounded-lg overflow-hidden h-14 border border-white/5">
        {[
          { name: "Deep", key: "nerve-bg-deep", fallback: bgFallbacks["nerve-bg-deep"] },
          { name: "Base", key: "nerve-bg-base", fallback: bgFallbacks["nerve-bg-base"] },
          { name: "Surface", key: "nerve-bg-surface", fallback: bgFallbacks["nerve-bg-surface"] },
          { name: "Elevated", key: "nerve-bg-elevated", fallback: bgFallbacks["nerve-bg-elevated"] },
          { name: "Hover", key: "nerve-bg-hover", fallback: bgFallbacks["nerve-bg-hover"] },
          { name: "Active", key: "nerve-bg-active", fallback: bgFallbacks["nerve-bg-active"] },
        ].map(({ name, key, fallback }) => (
          <button
            key={key}
            onClick={() => onCategorySelect("background-layers")}
            className="flex-1 flex items-center justify-center group relative cursor-pointer transition-all duration-150 hover:flex-[1.2]"
            style={{ backgroundColor: backgrounds[key] || fallback }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: text["nerve-text-muted"] || textFallbacks["nerve-text-muted"] }}
            >
              {name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium cursor-pointer transition-all duration-150 hover:scale-105"
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}35`,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function ColorChip({ name, value, category }: { name: string; value: string; category: string }) {
  const [copied, setCopied] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Strip category prefix from name for cleaner display
  const displayName = name
    .replace("nerve-", "")
    .replace("tag-", "")
    .replace("text-", "")
    .replace("border-", "")
    .replace("bg-", "")
    .replace("gold-", "")
    .replace("info", "Info")
    .replace("success", "Success")
    .replace("warning", "Warning")
    .replace("error", "Error")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const handleCopy = async () => {
    setIsPressed(true)
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setIsPressed(false), 150)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`
          group flex items-center gap-2 px-2 py-1.5 rounded-md
          hover:bg-white/5
          transition-all duration-150 cursor-pointer
          ${isPressed ? 'scale-95' : 'hover:scale-[1.02]'}
        `}
      >
        <div
          className={`
            w-4 h-4 rounded-sm shadow-inner flex-shrink-0
            transition-all duration-150
            ${isPressed ? 'scale-90' : 'group-hover:scale-110'}
            group-hover:shadow-[0_0_8px_currentColor]
          `}
          style={{ backgroundColor: value, color: value }}
        />
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <span className="group-hover:hidden">{displayName}</span>
          <code className="hidden group-hover:inline font-mono text-[11px]">{value}</code>
        </span>
      </button>

      {/* Micro toast */}
      <div
        className={`
          absolute -top-8 left-1/2 -translate-x-1/2
          px-2 py-1 rounded-md text-[10px] font-medium
          bg-[var(--nerve-success,#22c55e)] text-black
          shadow-lg shadow-[var(--nerve-success,#22c55e)]/30
          transition-all duration-200 pointer-events-none whitespace-nowrap
          ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
        `}
      >
        Copied!
      </div>
    </div>
  )
}
