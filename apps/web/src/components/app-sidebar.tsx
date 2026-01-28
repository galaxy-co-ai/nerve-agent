import { Zap } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { SidebarTimer } from "@/components/sidebar-timer"
import { SidebarCurrentWork } from "@/components/sidebar-current-work"
import { SidebarRecentItems } from "@/components/sidebar-recent-items"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { getRecentProjects, getInProgressTasks } from "@/lib/actions/sidebar"

export async function AppSidebar() {
  const [projects, inProgressTasks] = await Promise.all([
    getRecentProjects(),
    getInProgressTasks(),
  ])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-black">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NERVE AGENT</span>
                  <span className="truncate text-xs text-muted-foreground">Project OS</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarTimer />
        <SidebarCurrentWork tasks={inProgressTasks} />
        <NavMain />
        <SidebarRecentItems />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
