"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"
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
  const [outputValue] = useState(0.75)
  const [intensity, setIntensity] = useState(0.65) // Orb slider intensity
  const [mode, setMode] = useState<"colors" | "typography" | "primitives" | "components" | "backgrounds" | "css">("colors")

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
          {/* Left: Intensity Slider with Orb */}
          <IntensitySlider
            value={intensity}
            onChange={setIntensity}
            color={goldPrimary}
            lightColor={goldLight}
          />

          {/* Center: Logo/Title - Engraved with gold glow based on intensity */}
          <span
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.25em] sm:tracking-[0.3em]"
            style={{
              color: "#151517",
              textShadow: `
                0 -1px 1px rgba(0,0,0,0.6),
                0 1px 1px rgba(255,255,255,0.1),
                0 2px 3px rgba(0,0,0,0.4),
                0 0 ${20 + intensity * 30}px rgba(201, 168, 76, ${intensity * 0.4}),
                0 0 ${10 + intensity * 20}px rgba(201, 168, 76, ${intensity * 0.3})
              `,
            }}
          >
            NERVE UI
          </span>

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

          {/* Left Label - Instrument style */}
          <div className="absolute left-3 sm:left-4 md:left-5 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
            <span
              className="text-[9px] sm:text-[10px] font-medium tracking-[0.15em] text-white/35 uppercase block"
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

          {/* Glowing Orb - responsive size */}
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: `${orbPos.x * 100}%`,
              top: `${orbPos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Small screens */}
            <div className="block sm:hidden">
              <GlowingOrb color={goldPrimary} lightColor={goldLight} size={32} />
            </div>
            {/* Medium screens */}
            <div className="hidden sm:block md:hidden">
              <GlowingOrb color={goldPrimary} lightColor={goldLight} size={40} />
            </div>
            {/* Large screens */}
            <div className="hidden md:block">
              <GlowingOrb color={goldPrimary} lightColor={goldLight} size={48} />
            </div>
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
 * Orb element - Physical ball bearing / polished metal sphere
 */
function GlowingOrb({ color, lightColor, size = 48 }: { color: string; lightColor: string; size?: number }) {
  const satelliteSize = Math.max(10, size * 0.25)

  return (
    <div className="relative" style={{ width: size * 2, height: size * 2 }}>
      {/* Subtle ambient shadow on surface */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 1.4,
          height: size * 0.4,
          marginTop: size * 0.6,
          background: `radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)`,
          filter: "blur(8px)",
        }}
      />

      {/* Main orb - polished metal/glass sphere */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size,
          height: size,
          background: `
            radial-gradient(ellipse 40% 25% at 30% 20%, rgba(255,255,255,0.7) 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 50% 50%, ${lightColor} 0%, ${color} 35%, #1a1500 100%)
          `,
          boxShadow: `
            inset -8px -8px 20px rgba(0,0,0,0.6),
            inset 4px 4px 10px rgba(255,255,255,0.15),
            0 4px 12px rgba(0,0,0,0.5),
            0 2px 4px rgba(0,0,0,0.3)
          `,
        }}
      >
        {/* Primary specular highlight - sharp */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.22,
            height: size * 0.12,
            top: size * 0.12,
            left: size * 0.2,
            background: "rgba(255,255,255,0.9)",
            filter: "blur(1px)",
            transform: "rotate(-25deg)",
          }}
        />
        {/* Secondary highlight - softer */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.35,
            height: size * 0.2,
            top: size * 0.08,
            left: size * 0.15,
            background: "rgba(255,255,255,0.25)",
            filter: "blur(4px)",
            transform: "rotate(-25deg)",
          }}
        />
        {/* Rim light - bottom edge catch */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.5,
            height: size * 0.15,
            bottom: size * 0.08,
            right: size * 0.1,
            background: "rgba(255,255,255,0.08)",
            filter: "blur(3px)",
          }}
        />
      </div>

      {/* Satellite ring - metal ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: satelliteSize,
          height: satelliteSize,
          border: `2px solid ${color}`,
          backgroundColor: "rgba(0,0,0,0.3)",
          top: size * 0.3,
          right: size * 0.25,
          boxShadow: `
            inset 1px 1px 2px rgba(255,255,255,0.2),
            0 2px 4px rgba(0,0,0,0.4)
          `,
        }}
      />
    </div>
  )
}

/**
 * Intensity Slider with draggable orb
 */
function IntensitySlider({
  value,
  onChange,
  color,
  lightColor,
}: {
  value: number
  onChange: (v: number) => void
  color: string
  lightColor: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const orbSize = 28
      const padding = 4
      const trackWidth = rect.width - orbSize - padding * 2
      const x = clientX - rect.left - orbSize / 2 - padding
      const newValue = Math.max(0, Math.min(1, x / trackWidth))
      onChange(newValue)
    },
    [onChange]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleMove(e.clientX)

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const orbSize = 28
  const padding = 4

  return (
    <div
      ref={trackRef}
      className="relative h-9 sm:h-10 w-24 sm:w-32 rounded-full cursor-pointer"
      style={{
        backgroundColor: "#0a0a0c",
        boxShadow: `
          inset 0 2px 6px rgba(0,0,0,0.8),
          inset 0 1px 2px rgba(0,0,0,0.5),
          0 1px 0 rgba(255,255,255,0.05)
        `,
        border: "1px solid rgba(0,0,0,0.3)",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Orb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          left: `calc(${padding}px + ${value} * (100% - ${orbSize + padding * 2}px))`,
          width: orbSize,
          height: orbSize,
          transform: `translateY(-50%) scale(${isDragging ? 1.05 : 1})`,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 40% 25% at 30% 20%, rgba(255,255,255,0.7) 0%, transparent 50%),
              radial-gradient(ellipse 100% 100% at 50% 50%, ${lightColor} 0%, ${color} 35%, #1a1500 100%)
            `,
            boxShadow: `
              inset -4px -4px 10px rgba(0,0,0,0.6),
              inset 2px 2px 6px rgba(255,255,255,0.15),
              0 2px 8px rgba(0,0,0,0.5)
            `,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: "30%",
              height: "18%",
              top: "15%",
              left: "20%",
              background: "rgba(255,255,255,0.8)",
              filter: "blur(1px)",
              transform: "rotate(-25deg)",
            }}
          />
        </div>
      </div>
    </div>
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
