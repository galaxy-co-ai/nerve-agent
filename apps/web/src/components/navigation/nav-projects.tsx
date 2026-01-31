"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Folder, FolderKanban, Plus } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"

// =============================================================================
// DESIGN TOKENS - Matches agent-drawer.tsx exactly
// =============================================================================
const NERVE = {
  surface: "#141416",
  recessed: "#08080a",
  edgeLight: "rgba(255,255,255,0.08)",
  gold: "#C9A84C",
  goldSubtle: "rgba(201,168,76,0.2)",
  goldGlow: "rgba(201,168,76,0.25)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "#3b82f6",
  ACTIVE: "#22c55e",
  ON_HOLD: "#f59e0b",
  COMPLETED: "#68687A",
  CANCELLED: "#ef4444",
}

export type ProjectItem = {
  name: string
  url: string
  status: string
}

export function NavProjects({ projects }: { projects: ProjectItem[] }) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const isCollapsed = state === "collapsed"

  if (isCollapsed) return null

  return (
    <SidebarGroup className="px-2 group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel
        className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: NERVE.textMuted }}
      >
        Recent Projects
      </SidebarGroupLabel>

      <SidebarMenu className="gap-1">
        {projects.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/projects/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" style={{ color: NERVE.gold }} />
                <span style={{ color: NERVE.textSecondary }}>Create Project</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          <>
            {projects.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
              const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.COMPLETED

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="h-8"
                    style={isActive ? {
                      background: `linear-gradient(180deg, ${NERVE.surface} 0%, ${NERVE.recessed} 100%)`,
                      border: `1px solid ${NERVE.goldSubtle}`,
                      boxShadow: `inset 0 2px 4px rgba(0,0,0,0.4), 0 0 12px ${NERVE.goldGlow}`,
                    } : {}}
                  >
                    <Link href={item.url}>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: statusColor }}
                      />
                      <FolderKanban
                        className="h-4 w-4"
                        style={{ color: isActive ? NERVE.gold : NERVE.textMuted }}
                      />
                      <span style={{ color: isActive ? NERVE.textPrimary : NERVE.textSecondary }}>
                        {item.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}

            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-8">
                <Link href="/projects">
                  <div className="w-2" />
                  <Folder className="h-4 w-4" style={{ color: NERVE.textMuted }} />
                  <span style={{ color: NERVE.textMuted }}>All Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
