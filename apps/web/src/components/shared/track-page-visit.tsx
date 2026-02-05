"use client"

import { useEffect } from "react"
import { RecentItemType } from "@/hooks/use-recent-items"

interface TrackPageVisitProps {
  id: string
  type: RecentItemType
  title: string
  href: string
  projectName?: string
}

export function TrackPageVisit({ id, type, title, href, projectName }: TrackPageVisitProps) {
  useEffect(() => {
    // Small delay to avoid tracking during navigation
    const timeout = setTimeout(() => {
      const stored = localStorage.getItem("nerve-agent-recent-items")
      let items: unknown[] = []

      if (stored) {
        try {
          items = JSON.parse(stored) as unknown[]
        } catch {
          // ignore parse errors
        }
      }

      // Remove existing item with same id and type
      const filtered = items.filter(
        (i) => {
          const item = i as { id?: string; type?: string }
          return !(item.id === id && item.type === type)
        }
      )

      // Add new item at the beginning
      const newItems = [
        { id, type, title, href, projectName, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 8)

      // Save to localStorage
      localStorage.setItem("nerve-agent-recent-items", JSON.stringify(newItems))
    }, 100)

    return () => clearTimeout(timeout)
  }, [id, type, title, href, projectName])

  return null
}
