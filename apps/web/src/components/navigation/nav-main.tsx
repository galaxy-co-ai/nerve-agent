"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Code2,
  FolderKanban,
  Home,
  FileText,
  Phone,
  Settings,
  LucideIcon,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  goldGlow: "rgba(201,168,76,0.25)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { title: "Daily Driver", url: "/dashboard", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Library", url: "/library", icon: Code2 },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Calls", url: "/calls", icon: Phone },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup className="px-4 py-2">
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className="h-9"
                  style={isActive ? {
                    background: `linear-gradient(180deg, ${NERVE.surface} 0%, ${NERVE.recessed} 100%)`,
                    border: `1px solid ${NERVE.goldSubtle}`,
                    boxShadow: `inset 0 2px 4px rgba(0,0,0,0.4), 0 0 12px ${NERVE.goldGlow}`,
                  } : {
                    background: "transparent",
                  }}
                >
                  <Link href={item.url}>
                    <Icon
                      className="size-4"
                      style={{ color: isActive ? NERVE.gold : NERVE.textMuted }}
                    />
                    <span style={{ color: isActive ? NERVE.textPrimary : NERVE.textSecondary }}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
