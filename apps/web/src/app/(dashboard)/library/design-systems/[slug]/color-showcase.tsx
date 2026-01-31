"use client"

import * as React from "react"
import { useState } from "react"
import { Power } from "lucide-react"

interface ColorShowcaseProps {
  palette: Record<string, Record<string, string>>
}

/**
 * ColorShowcase - Premium hardware-inspired design system preview.
 * Inspired by high-end audio plugin interfaces (KNORR style).
 */
export function ColorShowcase({ palette }: ColorShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>("tags")
  const [isOn, setIsOn] = useState(true)
  const [outputValue, setOutputValue] = useState(0.75)
  const [mode, setMode] = useState<"colors" | "typography" | "components">("colors")

  // Extract palette categories
  const tags = palette["tags"] || {}
  const text = palette["text"] || {}
  const borders = palette["borders"] || {}
  const semantic = palette["semantic"] || {}
  const gold = palette["gold-accent"] || {}
  const backgrounds = palette["background-layers"] || {}

  // Fallback values
  const goldPrimary = gold["nerve-gold-400"] || "#C9A84C"
  const goldLight = gold["nerve-gold-300"] || "#D4B878"
  const goldDark = gold["nerve-gold-500"] || "#B8943C"

  // Calculate orb position based on selected category
  const categoryPositions: Record<string, { x: number; y: number }> = {
    tags: { x: 0.67, y: 0.29 },
    text: { x: 0.35, y: 0.45 },
    borders: { x: 0.78, y: 0.55 },
    semantic: { x: 0.25, y: 0.72 },
    "gold-accent": { x: 0.55, y: 0.38 },
    "background-layers": { x: 0.45, y: 0.68 },
  }

  const orbPos = categoryPositions[activeCategory] || { x: 0.5, y: 0.5 }

  return (
    <div className="space-y-4">
      {/* Chrome Shell Container */}
      <div
        className="relative p-5 rounded-[24px] bg-[#f8f8fa]"
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-2 py-2 mb-4">
          {/* Power Button */}
          <button
            onClick={() => setIsOn(!isOn)}
            className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              border: `2px solid ${isOn ? goldPrimary : "#9ca3af"}`,
              boxShadow: isOn ? `0 0 12px ${goldPrimary}40` : "none",
            }}
          >
            <Power
              size={18}
              strokeWidth={2.5}
              style={{ color: isOn ? goldPrimary : "#9ca3af" }}
            />
          </button>

          {/* Logo/Title */}
          <span className="text-xl font-bold tracking-[0.2em] text-[#1a1a1e]">
            NERVE
          </span>

          {/* Output Knob */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
              Output
            </span>
            <DialKnob value={outputValue} onChange={setOutputValue} />
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            backgroundColor: "#0a0a0c",
            boxShadow: "inset 0 2px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(0,0,0,0.4)",
            aspectRatio: "16/10",
          }}
        >
          {/* Dot Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Corner Brackets */}
          <CornerBracket position="top-left" />
          <CornerBracket position="top-right" />
          <CornerBracket position="bottom-left" />
          <CornerBracket position="bottom-right" />

          {/* Top Label */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase">
              {activeCategory.replace("-", " ").replace("nerve ", "")} — {Object.keys(palette[activeCategory] || {}).length} colors
            </span>
          </div>

          {/* Left Label */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <span
              className="text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase block"
              style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
            >
              Intensity — {Math.round(orbPos.y * 100)}%
            </span>
          </div>

          {/* Crosshairs */}
          <div
            className="absolute top-0 bottom-0 w-px bg-white/10 pointer-events-none transition-all duration-300"
            style={{ left: `${orbPos.x * 100}%` }}
          />
          <div
            className="absolute left-0 right-0 h-px bg-white/10 pointer-events-none transition-all duration-300"
            style={{ top: `${orbPos.y * 100}%` }}
          />

          {/* Center crosshair dot */}
          <div
            className="absolute w-2 h-2 rounded-full border border-white/20 pointer-events-none transition-all duration-300"
            style={{
              left: `${orbPos.x * 100}%`,
              top: `${orbPos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Glowing Orb */}
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: `${orbPos.x * 100}%`,
              top: `${orbPos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <GlowingOrb color={goldPrimary} lightColor={goldLight} />
          </div>

          {/* Category Hotspots (clickable regions) */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
            {Object.keys(palette).slice(0, 6).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                style={{
                  background: activeCategory === category ? "rgba(255,255,255,0.02)" : "transparent",
                }}
              >
                <span className="text-[9px] text-white/30 uppercase tracking-wider">
                  {category.replace("-", " ").replace("nerve ", "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pill Toggle Footer */}
        <div className="mt-4">
          <div
            className="relative flex items-center h-12 p-1.5 rounded-full"
            style={{
              backgroundColor: "#1a1a1e",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            {/* Sliding indicator */}
            <div
              className="absolute bg-white rounded-full transition-all duration-200 ease-out"
              style={{
                width: "calc(33.333% - 4px)",
                height: "calc(100% - 6px)",
                left: mode === "colors" ? "3px" : mode === "typography" ? "calc(33.333% + 1px)" : "calc(66.666% - 1px)",
                top: "3px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />

            {/* Options */}
            {[
              { value: "colors", label: "COLORS" },
              { value: "typography", label: "TYPOGRAPHY" },
              { value: "components", label: "COMPONENTS" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMode(option.value as typeof mode)}
                className="relative z-10 flex-1 text-center font-semibold text-sm tracking-wide transition-colors duration-200"
                style={{
                  color: option.value === mode ? "#0a0a0c" : "rgba(255,255,255,0.5)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Palette Strip */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: "#0c0c0e",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="px-5 py-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/30 whitespace-nowrap flex-shrink-0">
              {activeCategory.replace("-", " ").replace("nerve ", "")}
            </span>
            <div className="flex flex-wrap gap-2 flex-1">
              {Object.entries(palette[activeCategory] || {}).map(([name, value]) => (
                <ColorChip key={name} name={name} value={value} />
              ))}
            </div>
            <span className="text-[10px] text-white/20 whitespace-nowrap flex-shrink-0">
              Click to copy
            </span>
          </div>
        </div>
      </div>

      {/* Quick Category Buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(palette).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              backgroundColor: activeCategory === category ? goldPrimary : "rgba(255,255,255,0.05)",
              color: activeCategory === category ? "#0a0a0c" : "rgba(255,255,255,0.6)",
              boxShadow: activeCategory === category ? `0 2px 8px ${goldPrimary}40` : "none",
            }}
          >
            {category.replace("-", " ").replace("nerve ", "").toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Corner bracket decoration
 */
function CornerBracket({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const positionStyles = {
    "top-left": "top-5 left-5",
    "top-right": "top-5 right-5 rotate-90",
    "bottom-left": "bottom-5 left-5 -rotate-90",
    "bottom-right": "bottom-5 right-5 rotate-180",
  }

  return (
    <div className={`absolute w-6 h-6 pointer-events-none ${positionStyles[position]}`}>
      <div className="absolute top-0 left-0 w-full h-px bg-white/20" />
      <div className="absolute top-0 left-0 w-px h-full bg-white/20" />
    </div>
  )
}

/**
 * Glowing orb element
 */
function GlowingOrb({ color, lightColor }: { color: string; lightColor: string }) {
  const size = 48
  const satelliteSize = 10

  return (
    <div className="relative" style={{ width: size * 2, height: size * 2 }}>
      {/* Outer glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 1.8,
          height: size * 1.8,
          background: `radial-gradient(circle, ${color}80 0%, transparent 70%)`,
          filter: "blur(12px)",
        }}
      />

      {/* Main orb */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${lightColor} 0%, ${color} 50%, ${color}cc 100%)`,
          boxShadow: `
            inset -4px -4px 12px rgba(0,0,0,0.4),
            inset 2px 2px 8px rgba(255,255,255,0.3),
            0 0 20px ${color}80,
            0 0 40px ${color}40
          `,
        }}
      >
        {/* Highlight */}
        <div
          className="absolute rounded-full bg-white/50"
          style={{
            width: size * 0.25,
            height: size * 0.15,
            top: size * 0.15,
            left: size * 0.2,
            filter: "blur(2px)",
            transform: "rotate(-30deg)",
          }}
        />
      </div>

      {/* Satellite */}
      <div
        className="absolute rounded-full border-2"
        style={{
          width: satelliteSize,
          height: satelliteSize,
          borderColor: `${color}80`,
          backgroundColor: "transparent",
          top: size * 0.3,
          right: size * 0.3,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </div>
  )
}

/**
 * Dial Knob control
 */
function DialKnob({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const size = 36
  const minAngle = 135
  const maxAngle = 405
  const angle = minAngle + value * (maxAngle - minAngle)

  const dotDistance = size * 0.32
  const dotAngle = (angle * Math.PI) / 180
  const dotX = Math.cos(dotAngle) * dotDistance
  const dotY = Math.sin(dotAngle) * dotDistance

  return (
    <div
      className="relative flex items-center justify-center rounded-full cursor-pointer bg-white border border-[#e5e7eb] hover:scale-105 active:scale-95 transition-transform"
      style={{
        width: size,
        height: size,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <div
        className="absolute rounded-full bg-[#1a1a1e]"
        style={{
          width: 4,
          height: 4,
          transform: `translate(${dotX}px, ${dotY}px)`,
        }}
      />
    </div>
  )
}

/**
 * Color chip with copy functionality
 */
function ColorChip({ name, value }: { name: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const displayName = name
    .replace("nerve-", "")
    .replace("tag-", "")
    .replace("text-", "")
    .replace("border-", "")
    .replace("bg-", "")
    .replace("gold-", "")
    .replace(/-/g, " ")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-all duration-150 cursor-pointer hover:scale-[1.02] active:scale-95"
    >
      <div
        className="w-4 h-4 rounded-sm shadow-inner flex-shrink-0 transition-all duration-150 group-hover:scale-110"
        style={{ backgroundColor: value, boxShadow: `0 0 0 1px rgba(255,255,255,0.1)` }}
      />
      <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors capitalize">
        {copied ? "Copied!" : displayName}
      </span>
    </button>
  )
}
