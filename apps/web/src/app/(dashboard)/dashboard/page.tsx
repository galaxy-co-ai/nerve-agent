export const dynamic = "force-dynamic"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, Users, CheckCircle2, Zap, Plus, ArrowRight, FileText, Code2 } from "lucide-react"
import { CompleteTaskButton } from "@/components/shared/complete-task-button"
import { DashboardInsights } from "@/components/features/dashboard-insights"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

// Inline types to avoid Prisma generate issues on Vercel
type RecentProject = {
  id: string
  name: string
  slug: string
  clientName: string
  _count: { blockers: number }
}

type InProgressTaskWithRelations = {
  id: string
  title: string
  description: string | null
  status: string
  sprint: {
    number: number
    project: {
      id: string
      name: string
      slug: string
    }
  }
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default async function DashboardPage() {
  const user = await requireUser()

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  // Fetch all stats in parallel
  const timeEntriesTodayPromise = db.timeEntry.aggregate({
    where: {
      userId: user.id,
      startTime: { gte: startOfDay, lt: endOfDay },
    },
    _sum: { durationMinutes: true },
  })

  const activeBlockersPromise = db.blocker.count({
    where: {
      status: "ACTIVE",
      project: { userId: user.id },
    },
  })

  const clientBlockersPromise = db.blocker.count({
    where: {
      status: "ACTIVE",
      waitingOn: "client",
      project: { userId: user.id },
    },
  })

  const completedTasksTodayPromise = db.task.count({
    where: {
      status: "COMPLETED",
      completedAt: { gte: startOfDay, lt: endOfDay },
      sprint: { project: { userId: user.id } },
    },
  })

  const inProgressTaskPromise = db.task.findFirst({
    where: {
      status: "IN_PROGRESS",
      sprint: { project: { userId: user.id } },
    },
    include: {
      sprint: {
        include: { project: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const recentProjectsPromise = db.project.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    take: 3,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          blockers: { where: { status: "ACTIVE" } },
        },
      },
    },
  })

  // For insights: count all in-progress tasks
  const inProgressTaskCountPromise = db.task.count({
    where: {
      status: "IN_PROGRESS",
      sprint: { project: { userId: user.id } },
    },
  })

  // For insights: old active blockers that may need follow-up (created > 3 days ago)
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  const overdueBlockersPromise = db.blocker.findMany({
    where: {
      status: "ACTIVE",
      createdAt: { lt: threeDaysAgo },
      project: { userId: user.id },
    },
    take: 3,
    orderBy: { createdAt: "asc" },
    include: {
      project: { select: { name: true } },
    },
  })

  // Execute all promises in parallel with explicit types
  const [
    timeEntriesToday,
    activeBlockers,
    clientBlockers,
    completedTasksToday,
    inProgressTask,
    recentProjects,
    inProgressTaskCount,
    overdueBlockers,
  ] = await Promise.all([
    timeEntriesTodayPromise,
    activeBlockersPromise,
    clientBlockersPromise,
    completedTasksTodayPromise,
    inProgressTaskPromise as Promise<InProgressTaskWithRelations | null>,
    recentProjectsPromise as Promise<RecentProject[]>,
    inProgressTaskCountPromise,
    overdueBlockersPromise,
  ])

  const totalMinutes = timeEntriesToday._sum.durationMinutes || 0
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const todayFormatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Daily Driver</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto text-sm text-muted-foreground">{todayFormatted}</div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Welcome Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {user.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-muted-foreground">
              Here's what needs your attention today.{" "}
              <span className="hidden sm:inline">
                Press{" "}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>{" "}
                to jump anywhere.
              </span>
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hours}h {minutes}m</div>
              <p className="text-xs text-muted-foreground">
                {totalMinutes === 0 ? "Start tracking to see progress" : "Keep it up!"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Blockers</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${activeBlockers > 0 ? "text-yellow-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBlockers}</div>
              <p className="text-xs text-muted-foreground">
                {activeBlockers === 0 ? "All clear" : "Need attention"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting on Client</CardTitle>
              <Users className={`h-4 w-4 ${clientBlockers > 0 ? "text-blue-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientBlockers}</div>
              <p className="text-xs text-muted-foreground">
                {clientBlockers === 0 ? "No pending items" : "Follow up needed"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle2 className={`h-4 w-4 ${completedTasksToday > 0 ? "text-green-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasksToday}</div>
              <p className="text-xs text-muted-foreground">
                {completedTasksToday === 0 ? "Get started" : "Tasks completed"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights - actionable intelligence */}
        <DashboardInsights
          inProgressTaskCount={inProgressTaskCount}
          activeBlockers={activeBlockers}
          overdueBlockers={overdueBlockers.map((b) => ({
            id: b.id,
            description: b.description,
            projectName: b.project.name,
          }))}
          totalMinutesToday={totalMinutes}
          completedToday={completedTasksToday}
        />

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Focus Task */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <CardTitle>Today's Focus</CardTitle>
              </div>
              <CardDescription>Your most important task for today</CardDescription>
            </CardHeader>
            <CardContent>
              {inProgressTask ? (
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{inProgressTask.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {inProgressTask.sprint.project.name} &middot; Sprint {inProgressTask.sprint.number}
                      </p>
                      {inProgressTask.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {inProgressTask.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <CompleteTaskButton
                        taskId={inProgressTask.id}
                        task={{
                          id: inProgressTask.id,
                          title: inProgressTask.title,
                          sprint: {
                            number: inProgressTask.sprint.number,
                            project: {
                              id: inProgressTask.sprint.project.id,
                              name: inProgressTask.sprint.project.name,
                              slug: inProgressTask.sprint.project.slug,
                            },
                          },
                        }}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projects/${inProgressTask.sprint.project.slug}`}>
                          View <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-12 text-center">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No focus task set</p>
                    <p className="text-sm text-muted-foreground">
                      Create a project and add tasks to get started
                    </p>
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <Link href="/projects">
                        View Projects
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Your current work in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">No active projects</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project: RecentProject) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">{project.clientName}</div>
                        </div>
                        {project._count.blockers > 0 && (
                          <span className="text-sm text-yellow-500">
                            {project._count.blockers} blocker{project._count.blockers !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href="/projects">
                      View all projects
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Project
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/time">
                    <Clock className="mr-2 h-4 w-4" />
                    Log Time Entry
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/notes">
                    <FileText className="mr-2 h-4 w-4" />
                    New Note
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/library">
                    <Code2 className="mr-2 h-4 w-4" />
                    Browse Library
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
