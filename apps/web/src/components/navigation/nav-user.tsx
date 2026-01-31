"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  Settings,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
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
  gold: "#C9A84C",
  goldSubtle: "rgba(201,168,76,0.2)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

export function NavUser() {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-12"
              style={{
                background: NERVE.surface,
                border: `1px solid ${NERVE.edgeLight}`,
              }}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback
                  className="rounded-lg text-xs font-semibold"
                  style={{
                    background: `linear-gradient(145deg, ${NERVE.surface} 0%, ${NERVE.recessed} 100%)`,
                    color: NERVE.gold,
                    border: `1px solid ${NERVE.goldSubtle}`,
                  }}
                >
                  DU
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold" style={{ color: NERVE.textPrimary }}>
                  Dev User
                </span>
                <span className="truncate text-xs" style={{ color: NERVE.textMuted }}>
                  dev@nerve-agent.local
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" style={{ color: NERVE.textMuted }} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            style={{
              background: NERVE.housing,
              border: `1px solid ${NERVE.edgeLight}`,
              boxShadow: `-4px 0 24px rgba(0,0,0,0.5), inset 1px 0 0 ${NERVE.edgeLight}`,
            }}
          >
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback
                  className="rounded-lg text-xs font-semibold"
                  style={{
                    background: `linear-gradient(145deg, ${NERVE.surface} 0%, ${NERVE.recessed} 100%)`,
                    color: NERVE.gold,
                    border: `1px solid ${NERVE.goldSubtle}`,
                  }}
                >
                  DU
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold" style={{ color: NERVE.textPrimary }}>
                  Dev User
                </span>
                <span className="truncate text-xs" style={{ color: NERVE.textMuted }}>
                  dev@nerve-agent.local
                </span>
              </div>
            </div>

            <DropdownMenuSeparator style={{ background: NERVE.edgeLight }} />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/settings/profile" className="flex items-center gap-2" style={{ color: NERVE.textSecondary }}>
                  <BadgeCheck className="h-4 w-4" style={{ color: NERVE.textMuted }} />
                  Account
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings/preferences" className="flex items-center gap-2" style={{ color: NERVE.textSecondary }}>
                  <Settings className="h-4 w-4" style={{ color: NERVE.textMuted }} />
                  Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings/notifications" className="flex items-center gap-2" style={{ color: NERVE.textSecondary }}>
                  <Bell className="h-4 w-4" style={{ color: NERVE.textMuted }} />
                  Notifications
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator style={{ background: NERVE.edgeLight }} />

            <DropdownMenuItem style={{ color: NERVE.textMuted }}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
