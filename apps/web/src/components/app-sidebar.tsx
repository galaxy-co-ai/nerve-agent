import {
  Clock,
  Code2,
  FolderKanban,
  Home,
  Layers,
  FileText,
  Settings,
  Zap,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects, type ProjectItem } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
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
import { getRecentProjects } from "@/lib/actions/sidebar"

// NERVE AGENT Navigation
const navMain = [
  {
    title: "Daily Driver",
    url: "/dashboard",
    icon: Home,
    isActive: true,
    items: [
      { title: "Today", url: "/dashboard" },
      { title: "Week", url: "/dashboard/week" },
      { title: "Blockers", url: "/dashboard/blockers" },
    ],
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderKanban,
    items: [
      { title: "All Projects", url: "/projects" },
      { title: "Active", url: "/projects?status=active" },
      { title: "Planning", url: "/projects?status=planning" },
    ],
  },
  {
    title: "Sprints",
    url: "/sprints",
    icon: Layers,
    items: [
      { title: "Current Sprint", url: "/sprints/current" },
      { title: "Backlog", url: "/sprints/backlog" },
      { title: "Completed", url: "/sprints/completed" },
    ],
  },
  {
    title: "Time",
    url: "/time",
    icon: Clock,
    items: [
      { title: "Today", url: "/time" },
      { title: "This Week", url: "/time/week" },
      { title: "Reports", url: "/time/reports" },
    ],
  },
  {
    title: "Vault",
    url: "/vault",
    icon: Code2,
    items: [
      { title: "Blocks", url: "/vault/blocks" },
      { title: "Patterns", url: "/vault/patterns" },
      { title: "Queries", url: "/vault/queries" },
    ],
  },
  {
    title: "Notes",
    url: "/notes",
    icon: FileText,
    items: [
      { title: "All Notes", url: "/notes" },
      { title: "Recent", url: "/notes?sort=recent" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    items: [
      { title: "Profile", url: "/settings/profile" },
      { title: "Preferences", url: "/settings/preferences" },
      { title: "Integrations", url: "/settings/integrations" },
    ],
  },
]

export async function AppSidebar() {
  const projects = await getRecentProjects()

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
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
