"use client"

import * as React from "react"
import { useRef, useState, useEffect, useLayoutEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Eye } from "lucide-react"

interface CollapsibleHeroProps {
  name: string
  slug: string
  version: string
  /** @ai-context Philosophy statement for AI agents to understand design system intent */
  philosophy?: string | null
  /** @ai-context Full description for AI agents - not displayed in UI */
  description?: string | null
  coverColor?: string | null
  coverImage?: string | null
  stats: { components: number; primitives: number; backgrounds: number; usageCount?: number }
}

// Use useLayoutEffect on client, useEffect during SSR
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export function CollapsibleHero({
  name,
  slug,
  version,
  philosophy,
  description,
  coverColor,
  coverImage,
  stats,
}: CollapsibleHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    // Find the scroll container with data attribute
    const scrollContainer = element.closest("[data-scroll-container]") as HTMLElement | null

    const handleScroll = () => {
      // Get scroll position from the scroll container, fall back to window
      const scrollTop = scrollContainer?.scrollTop ?? window.scrollY
      // Collapse over first 80px of scroll (smaller hero = faster collapse)
      const progress = Math.min(1, Math.max(0, scrollTop / 80))
      setScrollProgress(progress)
    }

    // Initial check
    handleScroll()

    // Listen on scroll container if found, otherwise window
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Interpolated values - smaller image (120px -> 64px)
  const imageSize = 120 - scrollProgress * 56
  const statsOpacity = 1 - scrollProgress * 1.5

  const gradientBg = coverImage
    ? `url(${coverImage})`
    : `linear-gradient(135deg, ${coverColor || "#eab308"} 0%, ${adjustColor(coverColor || "#eab308", -30)} 100%)`

  return (
    <div ref={containerRef} className="px-6 pt-5 pb-3 transition-all duration-100">
      {/* Hidden AI context - philosophy and description available for AI agents */}
      {(philosophy || description) && (
        <div className="sr-only" aria-hidden="true" data-ai-context>
          {philosophy && <p data-philosophy>{philosophy}</p>}
          {description && <p data-description>{description}</p>}
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* Cover Image - Smaller, shrinks on scroll */}
        <div
          className="rounded-lg shadow-lg flex-shrink-0 transition-all duration-100 ease-out"
          style={{
            width: imageSize,
            height: imageSize,
            minWidth: 64,
            backgroundColor: coverColor || "#eab308",
            backgroundImage: gradientBg,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Info - Compact layout */}
        <div className="flex-1 min-w-0 py-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Title + Version inline */}
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{name}</h1>
                <Badge variant="outline" className="text-xs">v{version}</Badge>
              </div>

              {/* Stats directly below title */}
              <div
                className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground transition-opacity duration-100"
                style={{ opacity: statsOpacity }}
              >
                <span>{stats.components} components</span>
                <span className="text-border">•</span>
                <span>{stats.primitives} primitives</span>
                <span className="text-border">•</span>
                <span>{stats.backgrounds} backgrounds</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {slug === "nerve" && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/library/design-systems/nerve/showcase">
                    <Eye className="mr-2 h-4 w-4" />
                    Live Preview
                  </Link>
                </Button>
              )}
              <Button size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Add to Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}
