"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
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
  const [isOn, setIsOn] = useState(true) // Master power - controls switch + NERVE UI glow
  const [outputValue] = useState(0.75)
  const [mode, setMode] = useState<"colors" | "typography" | "primitives" | "components" | "backgrounds" | "css">("colors")

  // Gold accent color for neon glow
  const gold = palette["gold-accent"] || {}
  const goldPrimary = gold["nerve-gold-400"] || "#C9A84C"

  return (
    <div className="space-y-4">
      {/* Chrome Shell Container - Dark Matte Metal Housing */}
      <div
        className="relative p-2.5 sm:p-3 md:p-4 rounded-[16px] sm:rounded-[20px] md:rounded-[24px]"
        style={{
          backgroundColor: "#1c1c1f",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "1px solid rgba(0,0,0,0.4)",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(0,0,0,0.3)",
          boxShadow: `
            0 25px 50px -12px rgba(0,0,0,0.5),
            0 12px 24px -8px rgba(0,0,0,0.4),
            0 4px 8px -2px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.05)
          `,
        }}
      >
        {/* Subtle brushed metal highlight */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.1) 100%)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-1 sm:px-2 py-2 sm:py-3 mb-1.5">
          {/* Left: Glow Toggle Switch - linked to master power */}
          <GlowSwitch isOn={isOn} onToggle={() => setIsOn(!isOn)} />

          {/* Center: Logo/Title - Neon sign effect with warm-up and flicker */}
          <NeonText isOn={isOn} color={goldPrimary} />

          {/* Right: Output + Power */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="hidden sm:inline text-[9px] font-semibold tracking-[0.1em] text-white/40 uppercase">
                Out
              </span>
              <DialKnob value={outputValue} />
            </div>
            <button
              onClick={() => setIsOn(!isOn)}
              className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                border: `2px solid ${isOn ? goldPrimary : "rgba(255,255,255,0.2)"}`,
                backgroundColor: "#0f0f11",
                boxShadow: isOn
                  ? `0 0 16px ${goldPrimary}40, inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)`
                  : "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <Power
                size={16}
                strokeWidth={2.5}
                style={{ color: isOn ? goldPrimary : "rgba(255,255,255,0.4)" }}
              />
            </button>
          </div>
        </div>

        {/* Canvas Area - Recessed into dark metal housing */}
        <div className="relative rounded-xl" style={{ padding: "2px" }}>
          {/* Outer bezel - dark metal recess */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: `linear-gradient(180deg,
                rgba(0,0,0,0.5) 0%,
                rgba(0,0,0,0.2) 30%,
                rgba(255,255,255,0.02) 70%,
                rgba(255,255,255,0.04) 100%
              )`,
            }}
          />
          {/* Inner screen */}
          <div
            className="relative overflow-hidden rounded-[10px]"
            style={{
              backgroundColor: "#08080a",
              boxShadow: `
                inset 0 3px 12px rgba(0,0,0,0.9),
                inset 0 1px 3px rgba(0,0,0,0.6),
                inset 0 0 0 1px rgba(0,0,0,0.5)
              `,
              height: "clamp(280px, 40vh, 400px)",
            }}
          >
          {/* Dot Grid - Enhanced visibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Corner Brackets */}
          <CornerBracket position="top-left" />
          <CornerBracket position="top-right" />
          <CornerBracket position="bottom-left" />
          <CornerBracket position="bottom-right" />

          {/* Top Label - Instrument style */}
          <div className="absolute top-3 sm:top-4 md:top-5 left-1/2 -translate-x-1/2 z-10">
            <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.15em] text-white/35 uppercase">
              {activeCategory.replace("-", " ").replace("nerve ", "")} — {Object.keys(palette[activeCategory] || {}).length}
            </span>
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
        </div>

        {/* Pill Toggle Footer - Hardware segmented control (6 categories) */}
        {/* Recessed channel in dark metal housing */}
        <div
          className="mt-2 sm:mt-2.5 rounded-full"
          style={{
            padding: "2px",
            background: `linear-gradient(180deg,
              rgba(0,0,0,0.4) 0%,
              rgba(0,0,0,0.2) 40%,
              rgba(255,255,255,0.02) 100%
            )`,
          }}
        >
          <div
            className="relative flex items-center h-10 sm:h-11 p-1 sm:p-1.5 rounded-full"
            style={{
              backgroundColor: "#0f0f11",
              boxShadow: `
                inset 0 2px 6px rgba(0,0,0,0.6),
                inset 0 -1px 0 rgba(255,255,255,0.03)
              `,
              border: "1px solid rgba(0,0,0,0.3)",
            }}
          >
            {/* Sliding indicator - 6 segments, tactile motion */}
            <div
              className="absolute"
              style={{
                width: "calc(16.666% - 5px)",
                height: "calc(100% - 8px)",
                borderRadius: "9999px",
                backgroundColor: "#2a2a2e",
                left: (() => {
                  const positions = {
                    colors: "4px",
                    typography: "calc(16.666% + 0.5px)",
                    primitives: "calc(33.333% - 1px)",
                    components: "calc(50% - 2.5px)",
                    backgrounds: "calc(66.666% - 4px)",
                    css: "calc(83.333% - 5.5px)",
                  }
                  return positions[mode]
                })(),
                top: "4px",
                boxShadow: `
                  0 2px 6px rgba(0,0,0,0.4),
                  inset 0 1px 0 rgba(255,255,255,0.08),
                  inset 0 -1px 0 rgba(0,0,0,0.2)
                `,
                transition: "left 350ms cubic-bezier(0.25, 1.15, 0.5, 1)",
              }}
            />

            {/* Options - 6 categories */}
            {[
              { value: "colors", label: "COLORS", short: "CLR" },
              { value: "typography", label: "TYPE", short: "TYP" },
              { value: "primitives", label: "PRIM", short: "PRM" },
              { value: "components", label: "COMP", short: "CMP" },
              { value: "backgrounds", label: "BG", short: "BG" },
              { value: "css", label: "CSS", short: "CSS" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setMode(option.value as typeof mode)}
                className="relative z-10 flex-1 text-center font-semibold text-[9px] sm:text-[10px] md:text-xs tracking-[0.05em] transition-colors duration-200"
                style={{
                  color: option.value === mode ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                }}
              >
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Palette Strip */}
      <div
        className="rounded-lg sm:rounded-xl border overflow-hidden"
        style={{
          backgroundColor: "#0c0c0e",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="px-3 py-3 sm:px-4 sm:py-3 md:px-5 md:py-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-white/30 whitespace-nowrap flex-shrink-0">
              {activeCategory.replace("-", " ").replace("nerve ", "")}
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-2 flex-1 overflow-hidden">
              {Object.entries(palette[activeCategory] || {}).map(([name, value]) => (
                <ColorChip key={name} name={name} value={value} />
              ))}
            </div>
            <span className="hidden sm:inline text-[10px] text-white/20 whitespace-nowrap flex-shrink-0">
              Click to copy
            </span>
          </div>
        </div>
      </div>

      {/* Quick Category Buttons */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {Object.keys(palette).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-150"
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
 * Corner bracket decoration - Chunky hardware style with rounded corners
 */
function CornerBracket({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const positionStyles = {
    "top-left": "top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6",
    "top-right": "top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6",
    "bottom-left": "bottom-4 left-4 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6",
    "bottom-right": "bottom-4 right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6",
  }

  // SVG path for each corner - creates L-shape with rounded outer corner
  const pathData = {
    "top-left": "M 0 20 L 0 4 Q 0 0 4 0 L 20 0",
    "top-right": "M 0 0 L 16 0 Q 20 0 20 4 L 20 20",
    "bottom-left": "M 0 0 L 0 16 Q 0 20 4 20 L 20 20",
    "bottom-right": "M 20 0 L 20 16 Q 20 20 16 20 L 0 20",
  }

  return (
    <div className={`absolute pointer-events-none ${positionStyles[position]}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
      >
        <path
          d={pathData[position]}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

/**
 * Glow Toggle Switch - Controls NERVE UI text glow
 * Styled to match the pill indicator at the bottom
 */
function GlowSwitch({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  const padding = 3

  // Handle sizes to fit perfectly in track (track height - padding*2)
  // Track: 36px (h-9) mobile, 40px (h-10) sm+
  const handleSizeMobile = 30
  const handleSizeSm = 34

  return (
    <button
      onClick={onToggle}
      className="relative h-9 sm:h-10 w-16 sm:w-20 rounded-full cursor-pointer transition-colors duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        backgroundColor: "#0a0a0c",
        boxShadow: `
          inset 0 2px 6px rgba(0,0,0,0.8),
          inset 0 1px 2px rgba(0,0,0,0.5),
          0 1px 0 rgba(255,255,255,0.05)
        `,
        border: "1px solid rgba(0,0,0,0.3)",
      }}
    >
      {/* Toggle Handle - Dark matte metal circle (matches pill indicator) */}
      {/* Mobile size */}
      <div
        className="absolute top-1/2 rounded-full sm:hidden"
        style={{
          width: handleSizeMobile,
          height: handleSizeMobile,
          left: isOn
            ? `calc(100% - ${handleSizeMobile + padding}px)`
            : `${padding}px`,
          transform: "translateY(-50%)",
          backgroundColor: "#2a2a2e",
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
          transition: "left 300ms cubic-bezier(0.25, 1.15, 0.5, 1)",
        }}
      />
      {/* SM+ size */}
      <div
        className="absolute top-1/2 rounded-full hidden sm:block"
        style={{
          width: handleSizeSm,
          height: handleSizeSm,
          left: isOn
            ? `calc(100% - ${handleSizeSm + padding}px)`
            : `${padding}px`,
          transform: "translateY(-50%)",
          backgroundColor: "#2a2a2e",
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
          transition: "left 300ms cubic-bezier(0.25, 1.15, 0.5, 1)",
        }}
      />
    </button>
  )
}

/**
 * NeonText - Premium neon sign effect with warm-up animation and flicker
 * Simulates a real neon tube warming up and stabilizing
 */
function NeonText({ isOn, color }: { isOn: boolean; color: string }) {
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevIsOn = useRef(isOn)

  useEffect(() => {
    // Only animate on turn-on transition (was off, now on)
    if (isOn && !prevIsOn.current) {
      setIsAnimating(true)

      // Warm-up sequence: gradually increase intensity with flickers
      const sequence = [
        { intensity: 0.15, delay: 0 },      // Initial dim glow
        { intensity: 0.25, delay: 150 },    // Warming...
        { intensity: 0.4, delay: 300 },     // Getting brighter
        { intensity: 0.6, delay: 500 },     // Almost there
        { intensity: 0.2, delay: 700 },     // First flicker OFF
        { intensity: 0.85, delay: 780 },    // Flicker back ON
        { intensity: 0.3, delay: 920 },     // Second flicker OFF
        { intensity: 1, delay: 1000 },      // Full power ON
        { intensity: 0.92, delay: 1100 },   // Tiny settle flicker
        { intensity: 1, delay: 1150 },      // Stable
      ]

      sequence.forEach(({ intensity, delay }) => {
        setTimeout(() => setGlowIntensity(intensity), delay)
      })

      setTimeout(() => setIsAnimating(false), 1200)
    } else if (!isOn && prevIsOn.current) {
      // Turn off - quick fade
      setGlowIntensity(0)
    } else if (isOn && !isAnimating) {
      // Already on and not animating - ensure full intensity
      setGlowIntensity(1)
    }

    prevIsOn.current = isOn
  }, [isOn, isAnimating])

  // Initialize on mount
  useEffect(() => {
    if (isOn) setGlowIntensity(1)
  }, [])

  // Neon glow - premium tight edge glow, minimal spread
  const neonGlow = glowIntensity > 0
    ? `
        /* Engraved base - always visible */
        0 -1px 1px rgba(0,0,0,0.6),
        0 1px 1px rgba(255,255,255,0.06),
        0 2px 3px rgba(0,0,0,0.4),
        /* Ultra-tight tube edge */
        0 0 ${1 * glowIntensity}px ${color},
        0 0 ${2 * glowIntensity}px ${color},
        /* Crisp inner halo */
        0 0 ${4 * glowIntensity}px rgba(201, 168, 76, ${0.9 * glowIntensity}),
        /* Minimal outer glow */
        0 0 ${6 * glowIntensity}px rgba(201, 168, 76, ${0.4 * glowIntensity})
      `
    : `
        0 -1px 1px rgba(0,0,0,0.6),
        0 1px 1px rgba(255,255,255,0.06),
        0 2px 3px rgba(0,0,0,0.4)
      `

  // Text color shifts from dark engraved to lit neon
  const textColor = glowIntensity > 0
    ? `rgba(212, 184, 120, ${0.3 + glowIntensity * 0.7})`  // Gold-lit
    : "#151517"  // Dark engraved

  return (
    <span
      className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.35em] sm:tracking-[0.4em]"
      style={{
        color: textColor,
        textShadow: neonGlow,
        transition: isAnimating ? "none" : "all 300ms ease-out",
      }}
    >
      NERVE UI
    </span>
  )
}

/**
 * Dial Knob control - Dark matte metal style
 */
function DialKnob({ value }: { value: number }) {
  const minAngle = 135
  const maxAngle = 405
  const angle = minAngle + value * (maxAngle - minAngle)

  const dotDistance = 10
  const dotAngle = (angle * Math.PI) / 180
  const dotX = Math.cos(dotAngle) * dotDistance
  const dotY = Math.sin(dotAngle) * dotDistance

  return (
    <div
      className="relative flex items-center justify-center rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform w-8 h-8 sm:w-9 sm:h-9"
      style={{
        backgroundColor: "#0f0f11",
        border: "2px solid rgba(255,255,255,0.15)",
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.4),
          0 1px 2px rgba(0,0,0,0.2),
          inset 0 1px 0 rgba(255,255,255,0.05)
        `,
      }}
    >
      <div
        className="absolute rounded-full bg-white/80 w-1.5 h-1.5"
        style={{
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
