"use client"

import { useState, useEffect, useCallback } from "react"

export type RecentItemType = "project" | "note" | "task" | "library"

export interface RecentItem {
  id: string
  type: RecentItemType
  title: string
  href: string
  projectName?: string
  timestamp: number
}

const STORAGE_KEY = "nerve-agent-recent-items"
const MAX_ITEMS = 8

export function useRecentItems() {
  const [items, setItems] = useState<RecentItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentItem[]
        setItems(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Add an item to recent history
  const addItem = useCallback((item: Omit<RecentItem, "timestamp">) => {
    setItems((prev) => {
      // Remove existing item with same id and type
      const filtered = prev.filter(
        (i) => !(i.id === item.id && i.type === item.type)
      )

      // Add new item at the beginning
      const newItems = [
        { ...item, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS)

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))

      return newItems
    })
  }, [])

  // Clear all recent items
  const clearItems = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { items, addItem, clearItems }
}

// Hook to track page visits
export function useTrackPageVisit(item: Omit<RecentItem, "timestamp"> | null) {
  const { addItem } = useRecentItems()

  useEffect(() => {
    if (item) {
      addItem(item)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, item?.type]) // Only track when id or type changes
}
