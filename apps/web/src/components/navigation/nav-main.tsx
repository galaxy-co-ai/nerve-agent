"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Daily Driver", url: "/dashboard", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Sprint Stack", url: "/sprints", icon: Layers },
  { title: "Time", url: "/time", icon: Clock },
  { title: "Library", url: "/library", icon: Code2 },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Calls", url: "/calls", icon: Phone },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(isActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                >
                  <Link href={item.url}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
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
