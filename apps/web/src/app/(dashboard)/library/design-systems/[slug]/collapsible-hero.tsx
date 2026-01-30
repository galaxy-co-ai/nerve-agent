"use client"

import * as React from "react"
import { useRef, useState, useEffect, useLayoutEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface CollapsibleHeroProps {
  name: string
  version: string
  philosophy?: string | null
  description?: string | null
  coverColor?: string | null
  coverImage?: string | null
  stats: { components: number; primitives: number; backgrounds: number; usageCount?: number }
}

// Use useLayoutEffect on client, useEffect during SSR
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export function CollapsibleHero({
  name,
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
      // Collapse over first 150px of scroll
      const progress = Math.min(1, Math.max(0, scrollTop / 150))
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

  // Interpolated values
  const imageSize = 192 - scrollProgress * 112 // 192px -> 80px
  const descOpacity = 1 - scrollProgress * 1.5 // Fade faster
  const statsTranslateY = scrollProgress * -60 // Move up

  const gradientBg = coverImage
    ? `url(${coverImage})`
    : `linear-gradient(135deg, ${coverColor || "#eab308"} 0%, ${adjustColor(coverColor || "#eab308", -30)} 100%)`

  return (
    <div ref={containerRef} className="p-6 pb-2 transition-all duration-100">
      <div className="flex gap-6">
        {/* Cover Image - Shrinks */}
        <div
          className="rounded-lg shadow-lg flex-shrink-0 transition-all duration-100 ease-out"
          style={{
            width: imageSize,
            height: imageSize,
            minWidth: 80,
            backgroundColor: coverColor || "#eab308",
            backgroundImage: gradientBg,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <Badge variant="outline" className="mt-2">v{version}</Badge>
            </div>
            <Button className="shrink-0">
              <Sparkles className="mr-2 h-4 w-4" />
              Add to Project
            </Button>
          </div>

          {/* Philosophy & Description - Fades out */}
          <div
            className="overflow-hidden transition-all duration-100"
            style={{
              opacity: descOpacity,
              maxHeight: descOpacity > 0.1 ? 200 : 0,
            }}
          >
            {philosophy && (
              <p className="text-base text-muted-foreground mt-3 italic line-clamp-2">
                &ldquo;{philosophy}&rdquo;
              </p>
            )}
            {description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          {/* Stats - Moves up */}
          <div
            className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground transition-transform duration-100"
            style={{ transform: `translateY(${statsTranslateY}px)` }}
          >
            <span>{stats.components} components</span>
            <span className="text-border">•</span>
            <span>{stats.primitives} primitives</span>
            <span className="text-border">•</span>
            <span>{stats.backgrounds} backgrounds</span>
            {stats.usageCount != null && stats.usageCount > 0 && (
              <>
                <span className="text-border">•</span>
                <span>Used {stats.usageCount} times</span>
              </>
            )}
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
