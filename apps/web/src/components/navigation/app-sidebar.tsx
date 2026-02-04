"use client"

import { NavMain } from "@/components/navigation/nav-main"
import { NavUser } from "@/components/navigation/nav-user"
import { NavQuickActions } from "@/components/navigation/nav-quick-actions"
import { ViewModeToggle } from "@/components/navigation/view-mode-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// =============================================================================
// DESIGN TOKENS - Matches agent-drawer.tsx exactly
// =============================================================================
const NERVE = {
  housing: "#1c1c1f",
  surface: "#141416",
  recessed: "#08080a",
  elevated: "#242428",
  edgeLight: "rgba(255,255,255,0.08)",
  edgeDark: "rgba(0,0,0,0.4)",
  gold: "#C9A84C",
  goldMuted: "rgba(201,168,76,0.6)",
  goldSubtle: "rgba(201,168,76,0.2)",
  goldGlow: "rgba(201,168,76,0.25)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* User at top */}
      <SidebarHeader
        className="p-3 space-y-2"
        style={{
          background: `linear-gradient(180deg, ${NERVE.elevated} 0%, ${NERVE.housing} 100%)`,
          borderBottom: `1px solid ${NERVE.edgeLight}`,
          borderTopRightRadius: "12px",
        }}
      >
        <NavUser />
        <ViewModeToggle />
      </SidebarHeader>

      {/* Main nav in middle, pushed to bottom */}
      <SidebarContent style={{ background: NERVE.housing }} className="justify-end">
        <NavMain />
      </SidebarContent>

      {/* Quick actions at bottom */}
      <SidebarFooter
        className="px-4 py-3"
        style={{
          background: NERVE.housing,
          borderTop: `1px solid ${NERVE.edgeLight}`,
          borderBottomRightRadius: "12px",
        }}
      >
        <NavQuickActions />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
