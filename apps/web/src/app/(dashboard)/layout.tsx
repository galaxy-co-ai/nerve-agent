export const dynamic = "force-dynamic"

import { AppSidebar } from "@/components/navigation/app-sidebar"
import { CommandPalette } from "@/components/shared/command-palette"
import { QuickNoteDialog } from "@/components/dialogs/quick-note-dialog"
import { QuickTimeDialog } from "@/components/dialogs/quick-time-dialog"
import { AgentDrawer } from "@/components/agent/agent-drawer"
import { TimerWrapper } from "@/components/timer/timer-wrapper"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarWrapper } from "@/components/navigation/sidebar-wrapper"
import { syncUser, requireUser } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Sync user on dashboard access
  await syncUser()
  const user = await requireUser()

  // Fetch data for command palette search
  const [projects, notes, inProgressTasks] = await Promise.all([
    db.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, slug: true },
      take: 10,
    }),
    db.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true },
      take: 10,
    }),
    db.task.findMany({
      where: {
        status: "IN_PROGRESS",
        sprint: { project: { userId: user.id } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        sprint: {
          select: {
            number: true,
            project: { select: { name: true, slug: true } },
          },
        },
      },
    }),
  ])

  return (
    <TimerWrapper>
      <SidebarWrapper>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
        <CommandPalette projects={projects} notes={notes} inProgressTasks={inProgressTasks} />
        <QuickNoteDialog />
        <QuickTimeDialog />
        <AgentDrawer />
      </SidebarWrapper>
    </TimerWrapper>
  )
}
