"use client"

import Link from "next/link"
import { useRecentItems, RecentItemType } from "@/hooks/use-recent-items"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { FolderKanban, FileText, CheckSquare, Code2, History } from "lucide-react"

const typeIcons: Record<RecentItemType, React.ReactNode> = {
  project: <FolderKanban className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  library: <Code2 className="h-4 w-4" />,
}

export function SidebarRecentItems() {
  const { items } = useRecentItems()

  if (items.length === 0) {
    return null
  }

  // Only show the 5 most recent items
  const recentItems = items.slice(0, 5)

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel className="text-xs flex items-center gap-1">
        <History className="h-3 w-3" />
        Recent
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {recentItems.map((item) => (
            <SidebarMenuItem key={`${item.type}-${item.id}`}>
              <SidebarMenuButton asChild size="sm">
                <Link href={item.href} className="flex items-center gap-2">
                  {typeIcons[item.type]}
                  <span className="truncate flex-1">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
