export const dynamic = "force-dynamic"

import { AppSidebar } from "@/components/app-sidebar"
import { ClaudeChat } from "@/components/claude-chat"
import { CommandPalette } from "@/components/command-palette"
import { QuickNoteDialog } from "@/components/quick-note-dialog"
import { QuickTimeDialog } from "@/components/quick-time-dialog"
import { TimerWrapper } from "@/components/timer-wrapper"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
        <ClaudeChat />
        <CommandPalette projects={projects} notes={notes} inProgressTasks={inProgressTasks} />
        <QuickNoteDialog />
        <QuickTimeDialog />
      </SidebarProvider>
    </TimerWrapper>
  )
}
