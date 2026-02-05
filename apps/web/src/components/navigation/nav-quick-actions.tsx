"use client"

import { Search } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

// =============================================================================
// DESIGN TOKENS - Matches agent-drawer.tsx exactly
// =============================================================================
const NERVE = {
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

export function NavQuickActions() {
  const handleSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleSearch}
          tooltip="Search (⌘K)"
          className="h-9"
          data-ax-intent="quick:search"
          data-ax-context="quick-actions"
        >
          <Search
            className="size-4"
            style={{ color: NERVE.textMuted }}
          />
          <span style={{ color: NERVE.textSecondary }}>
            Search
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
