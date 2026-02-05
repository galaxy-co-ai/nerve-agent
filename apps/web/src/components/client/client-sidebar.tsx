"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Settings,
  ChevronRight,
  Search,
  Phone,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCommandPalette } from "@/components/command-palette"
import { ViewModeToggle } from "@/components/navigation/view-mode-toggle"

// Design tokens - premium feel
const NERVE = {
  housing: "#1c1c1f",
  surface: "#141416",
  elevated: "#242428",
  edgeLight: "rgba(255,255,255,0.08)",
  gold: "#C9A84C",
  goldMuted: "rgba(201,168,76,0.6)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

const statusColors = {
  PLANNING: "bg-blue-500/20 text-blue-400",
  ACTIVE: "bg-green-500/20 text-green-400",
  ON_HOLD: "bg-yellow-500/20 text-yellow-400",
  COMPLETED: "bg-emerald-500/20 text-emerald-400",
}

interface ClientSidebarProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  projects: {
    id: string
    name: string
    slug: string
    status: string
    phase: string
    health: number
    accessLevel: string
    contractStatus: string
  }[]
  canToggleView?: boolean
}

export function ClientSidebar({ user, projects, canToggleView }: ClientSidebarProps) {
  const pathname = usePathname()
  const { toggle: toggleCommandPalette } = useCommandPalette()

  const navItems = [
    {
      title: "Portfolio",
      href: "/client",
      icon: LayoutDashboard,
    },
    {
      title: "Calls",
      href: "/client/calls",
      icon: Phone,
    },
    {
      title: "Messages",
      href: "/client/messages",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      href: "/client/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* User + View Toggle - matches admin sidebar */}
      <SidebarHeader
        className="p-3 space-y-2"
        style={{
          background: `linear-gradient(180deg, ${NERVE.elevated} 0%, ${NERVE.housing} 100%)`,
          borderBottom: `1px solid ${NERVE.edgeLight}`,
          borderTopRightRadius: "12px",
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-[#C9A84C]/30">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback
              className="text-sm font-semibold"
              style={{ background: NERVE.gold, color: NERVE.housing }}
            >
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate" style={{ color: NERVE.textPrimary }}>
              {user.name || "Client Portal"}
            </p>
            <p className="text-xs truncate" style={{ color: NERVE.textMuted }}>
              {user.email}
            </p>
          </div>
        </div>
        {/* View mode toggle for Admin/Dev users */}
        {canToggleView && <ViewModeToggle />}
      </SidebarHeader>

      <SidebarContent style={{ background: NERVE.housing }}>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "transition-colors",
                      pathname === item.href && "bg-[#C9A84C]/10 text-[#C9A84C]"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider" style={{ color: NERVE.textMuted }}>
            <FolderKanban className="h-3 w-3 mr-2" />
            Your Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 ? (
                <div
                  className="px-3 py-6 text-center text-sm"
                  style={{ color: NERVE.textMuted }}
                >
                  No projects yet
                </div>
              ) : (
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/client/projects/${project.slug}`}
                      className={cn(
                        "group/project transition-colors",
                        pathname === `/client/projects/${project.slug}` &&
                          "bg-[#C9A84C]/10 text-[#C9A84C]"
                      )}
                    >
                      <Link href={`/client/projects/${project.slug}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              project.health >= 80
                                ? "bg-green-500"
                                : project.health >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            )}
                          />
                          <span className="truncate">{project.name}</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0 group-data-[collapsible=icon]:hidden",
                            statusColors[project.status as keyof typeof statusColors]
                          )}
                        >
                          {project.status.toLowerCase()}
                        </Badge>
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover/project:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className="px-4 py-3"
        style={{
          background: NERVE.housing,
          borderTop: `1px solid ${NERVE.edgeLight}`,
          borderBottomRightRadius: "12px",
        }}
      >
        {/* Quick Search */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sm h-9 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
          style={{
            color: NERVE.textSecondary,
            background: NERVE.surface,
            border: `1px solid ${NERVE.edgeLight}`,
          }}
          onClick={toggleCommandPalette}
        >
          <Search className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Search...</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 group-data-[collapsible=icon]:hidden">
            ⌘K
          </kbd>
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
