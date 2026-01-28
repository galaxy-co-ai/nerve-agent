"use client"

import Link from "next/link"
import {
  Folder,
  FolderKanban,
  MoreHorizontal,
  Plus,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export type ProjectItem = {
  name: string
  url: string
  status: string
}

const statusColors: Record<string, string> = {
  PLANNING: "text-blue-500",
  ACTIVE: "text-green-500",
  ON_HOLD: "text-yellow-500",
  COMPLETED: "text-gray-400",
  CANCELLED: "text-red-500",
}

export function NavProjects({ projects }: { projects: ProjectItem[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-sidebar-foreground/70">
              <Link href="/projects/new">
                <Plus className="h-4 w-4" />
                <span>Create Project</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          <>
            {projects.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <FolderKanban className={`h-4 w-4 ${statusColors[item.status] || ""}`} />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-sidebar-foreground/70">
                <Link href="/projects">
                  <Folder className="h-4 w-4" />
                  <span>All Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
