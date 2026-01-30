"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/features/copy-button"
import {
  Lightbulb,
  CheckSquare,
  Sparkles,
  GitBranch,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

// Category metadata with icons and descriptions
// Keys use hyphens to match database palette structure
const CATEGORY_META: Record<string, { label: string; description: string; icon?: React.ReactNode }> = {
  tags: {
    label: "Tags",
    description: "Categorize and organize content with semantic color coding",
  },
  text: {
    label: "Typography",
    description: "Text hierarchy from primary emphasis to subtle hints",
  },
  borders: {
    label: "Borders",
    description: "Define boundaries and separate content layers",
  },
  semantic: {
    label: "Semantic",
    description: "Communicate status, feedback, and system states",
  },
  "gold-accent": {
    label: "Accent",
    description: "Brand identity and interactive element highlights",
  },
  "background-layers": {
    label: "Surfaces",
    description: "Create depth and visual hierarchy through layering",
  },
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
  const categories = Object.keys(palette)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeCategory = categories[activeIndex]
  const containerRef = useRef<HTMLDivElement>(null)

  // Navigation
  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % categories.length)
  }, [categories.length])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + categories.length) % categories.length)
  }, [categories.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goNext, goPrev])

  const meta = CATEGORY_META[activeCategory] || { label: activeCategory, description: "" }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{meta.label}</h3>
          <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Previous category"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "bg-[var(--nerve-gold-400,#facc15)] w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to ${CATEGORY_META[cat]?.label || cat}`}
              />
            ))}
          </div>
          <button
            onClick={goNext}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Next category"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Showcase Card */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-border/50 bg-[var(--nerve-bg-surface,#141416)] overflow-hidden"
      >
        {/* The Living Showcase */}
        <div className="p-8">
          <ShowcaseScene
            palette={palette}
            activeCategory={activeCategory}
          />
        </div>

        {/* Color Values Strip */}
        <div className="border-t border-border/30 bg-[var(--nerve-bg-base,#0c0c0e)] p-4">
          <div className="flex flex-wrap gap-3">
            {Object.entries(palette[activeCategory] || {}).map(([name, value]) => (
              <ColorChip key={name} name={name} value={value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// The actual showcase scene with all elements
interface ShowcaseSceneProps {
  palette: Record<string, Record<string, string>>
  activeCategory: string
}

function ShowcaseScene({ palette, activeCategory }: ShowcaseSceneProps) {
  // Extract colors from palette (keys use hyphens to match DB structure)
  const tags = palette["tags"] || {}
  const text = palette["text"] || {}
  const borders = palette["borders"] || {}
  const semantic = palette["semantic"] || {}
  const gold = palette["gold-accent"] || {}
  const backgrounds = palette["background-layers"] || {}

  // Muted state for non-active categories
  const getMutedClass = (category: string) =>
    activeCategory !== category ? "opacity-40 saturate-50 transition-all duration-500" : "transition-all duration-500"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Card with Tags, Text, Borders */}
      <div className="space-y-4">
        {/* Simulated Note Card */}
        <div
          className={cn(
            "rounded-lg p-5 transition-all duration-500",
            getMutedClass("background-layers")
          )}
          style={{
            backgroundColor: backgrounds["nerve-bg-elevated"] || "#1a1a1d",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: borders["nerve-border-default"] || "rgba(255,255,255,0.08)",
          }}
        >
          {/* Tags Row */}
          <div className={cn("flex flex-wrap gap-2 mb-4", getMutedClass("tags"))}>
            {Object.entries(tags).map(([name, color]) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: `${color}40`,
                }}
              >
                {TAG_ICONS[name]}
                {name.replace("nerve-tag-", "")}
              </span>
            ))}
          </div>

          {/* Text Hierarchy */}
          <div className={cn("space-y-2", getMutedClass("text"))}>
            <h4
              className="text-lg font-semibold"
              style={{ color: text["nerve-text-primary"] || "#f4f4f5" }}
            >
              Project Planning Session
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: text["nerve-text-secondary"] || "#a1a1aa" }}
            >
              Reviewed the sprint backlog and identified key priorities for the upcoming release cycle.
            </p>
            <p
              className="text-xs"
              style={{ color: text["nerve-text-muted"] || "#71717a" }}
            >
              Last updated 2 hours ago
            </p>
            <p
              className="text-xs"
              style={{ color: text["nerve-text-faint"] || "#52525b" }}
            >
              Created by Dev User
            </p>
          </div>

          {/* Border Showcase - Visual boxes showing border weights */}
          <div className={cn("mt-4 pt-4", getMutedClass("borders"))}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Subtle", key: "nerve-border-subtle", fallback: "rgba(255,255,255,0.05)", width: 1 },
                { name: "Default", key: "nerve-border-default", fallback: "rgba(255,255,255,0.08)", width: 1 },
                { name: "Strong", key: "nerve-border-strong", fallback: "rgba(255,255,255,0.12)", width: 2 },
                { name: "Bright", key: "nerve-border-bright", fallback: "rgba(255,255,255,0.18)", width: 2 },
              ].map(({ name, key, fallback, width }) => (
                <div
                  key={key}
                  className="rounded-lg p-4 flex flex-col items-center justify-center gap-1"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    border: `${width}px solid ${borders[key] || fallback}`,
                  }}
                >
                  <span className="text-xs font-medium text-muted-foreground">{name}</span>
                  <span className="text-[10px] text-muted-foreground/60">{width}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Semantic States, Gold Accent, Backgrounds */}
      <div className="space-y-4">
        {/* Semantic Status Row */}
        <div className={cn("flex flex-wrap gap-3", getMutedClass("semantic"))}>
          <StatusBadge
            icon={<Info className="h-3.5 w-3.5" />}
            label="Info"
            color={semantic["nerve-info"] || "#3b82f6"}
          />
          <StatusBadge
            icon={<CheckCircle className="h-3.5 w-3.5" />}
            label="Success"
            color={semantic["nerve-success"] || "#22c55e"}
          />
          <StatusBadge
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            label="Warning"
            color={semantic["nerve-warning"] || "#f59e0b"}
          />
          <StatusBadge
            icon={<AlertCircle className="h-3.5 w-3.5" />}
            label="Error"
            color={semantic["nerve-error"] || "#ef4444"}
          />
        </div>

        {/* Gold Accent Showcase */}
        <div className={cn("space-y-3", getMutedClass("gold-accent"))}>
          {/* Button */}
          <button
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              background: `linear-gradient(135deg, ${gold["nerve-gold-400"] || "#facc15"}, ${gold["nerve-gold-500"] || "#eab308"})`,
              color: "#0c0c0e",
              boxShadow: `0 0 20px ${gold["nerve-gold-500"] || "#eab308"}30`,
            }}
          >
            Primary Action
          </button>

          {/* Link Text */}
          <p className="text-sm">
            <span style={{ color: text["nerve-text-secondary"] || "#a1a1aa" }}>
              Need help?{" "}
            </span>
            <span
              className="underline underline-offset-2 cursor-pointer"
              style={{ color: gold["nerve-gold-400"] || "#facc15" }}
            >
              View documentation
            </span>
          </p>

          {/* Gold Scale Gradient */}
          <div className="flex rounded-lg overflow-hidden h-8">
            {Object.entries(gold).slice(0, 8).map(([name, color]) => (
              <div
                key={name}
                className="flex-1 transition-transform hover:scale-y-125"
                style={{ backgroundColor: color }}
                title={name}
              />
            ))}
          </div>
        </div>

        {/* Background Layers - Visual progression from darkest to lightest */}
        <div className={cn("space-y-3", getMutedClass("background-layers"))}>
          {/* Gradient strip showing all layers */}
          <div className="flex rounded-lg overflow-hidden h-12 border border-white/5">
            {[
              { name: "Deep", key: "nerve-bg-deep", fallback: "#08080a" },
              { name: "Base", key: "nerve-bg-base", fallback: "#0c0c0e" },
              { name: "Surface", key: "nerve-bg-surface", fallback: "#141416" },
              { name: "Elevated", key: "nerve-bg-elevated", fallback: "#1a1a1d" },
              { name: "Hover", key: "nerve-bg-hover", fallback: "#222225" },
              { name: "Active", key: "nerve-bg-active", fallback: "#2a2a2e" },
            ].map(({ name, key, fallback }) => (
              <div
                key={key}
                className="flex-1 flex items-center justify-center transition-transform hover:scale-105 relative group"
                style={{ backgroundColor: backgrounds[key] || fallback }}
                title={name}
              >
                <span
                  className="text-[9px] font-medium opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ color: text["nerve-text-muted"] || "#71717a" }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
          {/* Stacked preview */}
          <div className="relative h-24">
            <div
              className="absolute inset-x-0 bottom-0 h-20 rounded-lg border border-white/5"
              style={{ backgroundColor: backgrounds["nerve-bg-deep"] || "#08080a" }}
            />
            <div
              className="absolute inset-x-4 bottom-2 h-16 rounded-lg border border-white/5"
              style={{ backgroundColor: backgrounds["nerve-bg-surface"] || "#141416" }}
            />
            <div
              className="absolute inset-x-8 bottom-4 h-12 rounded-lg shadow-lg border border-white/8 flex items-center justify-center"
              style={{ backgroundColor: backgrounds["nerve-bg-elevated"] || "#1a1a1d" }}
            >
              <span
                className="text-[10px] font-medium"
                style={{ color: text["nerve-text-muted"] || "#71717a" }}
              >
                Layered Content
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Status badge component
function StatusBadge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: `${color}30`,
      }}
    >
      {icon}
      {label}
    </div>
  )
}

// Color chip with copy functionality
function ColorChip({ name, value }: { name: string; value: string }) {
  const displayName = name
    .replace("nerve-", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/30 transition-colors">
      <div
        className="w-4 h-4 rounded-sm shadow-inner flex-shrink-0"
        style={{ backgroundColor: value }}
      />
      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{displayName}</span>
      <code className="text-[10px] font-mono text-muted-foreground/70 hidden group-hover:inline">
        {value}
      </code>
      <CopyButton text={value} className="h-5 w-5 opacity-0 group-hover:opacity-100" iconOnly />
    </div>
  )
}
