"use client"

import {
  ChevronRight,
  Clock,
  Code2,
  FolderKanban,
  Home,
  Layers,
  FileText,
  Phone,
  Settings,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

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
      { title: "Import", url: "/projects/import" },
    ],
  },
  {
    title: "Sprint Stack",
    url: "/sprints",
    icon: Layers,
    items: [
      { title: "All Sprints", url: "/sprints" },
      { title: "In Progress", url: "/sprints?status=in-progress" },
      { title: "Completed", url: "/sprints?status=completed" },
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
    title: "Library",
    url: "/library",
    icon: Code2,
    items: [
      { title: "Blocks", url: "/library/blocks" },
      { title: "Patterns", url: "/library/patterns" },
      { title: "Queries", url: "/library/queries" },
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
    title: "Calls",
    url: "/calls",
    icon: Phone,
    items: [
      { title: "All Calls", url: "/calls" },
      { title: "Add Call", url: "/calls/new" },
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

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navMain.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
