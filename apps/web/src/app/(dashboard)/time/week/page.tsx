export const dynamic = "force-dynamic"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { AddTimeEntryDialog } from "@/components/add-time-entry-dialog"

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export default async function TimeWeekPage() {
  const user = await requireUser()

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  // Fetch projects for the dialog
  const projects = await db.project.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, slug: true },
    orderBy: { updatedAt: "desc" },
  })

  // Get all time entries for the week grouped by day
  const timeEntries = await db.timeEntry.findMany({
    where: {
      userId: user.id,
      startTime: { gte: startOfWeek, lt: endOfWeek },
    },
    include: {
      project: { select: { name: true, slug: true, hourlyRate: true } },
      task: { select: { title: true } },
    },
    orderBy: { startTime: "desc" },
  })

  // Group entries by day
  const entriesByDay: Map<string, typeof timeEntries> = new Map()
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startOfWeek)
    dayStart.setDate(startOfWeek.getDate() + i)
    entriesByDay.set(dayStart.toDateString(), [])
  }

  for (const entry of timeEntries) {
    const dayKey = entry.startTime.toDateString()
    const existing = entriesByDay.get(dayKey) || []
    existing.push(entry)
    entriesByDay.set(dayKey, existing)
  }

  // Calculate week stats
  const weekTotal = timeEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const billableMinutes = timeEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.durationMinutes, 0)
  const weekRevenue = timeEntries
    .filter((e) => e.billable && e.project.hourlyRate)
    .reduce((sum, e) => sum + (e.durationMinutes / 60) * Number(e.project.hourlyRate), 0)

  // Project breakdown
  const projectTotals = timeEntries.reduce((acc, entry) => {
    const key = entry.project.slug
    if (!acc[key]) {
      acc[key] = { name: entry.project.name, slug: key, minutes: 0, billable: 0 }
    }
    acc[key].minutes += entry.durationMinutes
    if (entry.billable) acc[key].billable += entry.durationMinutes
    return acc
  }, {} as Record<string, { name: string; slug: string; minutes: number; billable: number }>)

  const sortedProjects = Object.values(projectTotals).sort((a, b) => b.minutes - a.minutes)

  const weekLabel = `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(endOfWeek.getTime() - 1).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/time">Time Tracking</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>This Week</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{weekLabel}</span>
          <AddTimeEntryDialog projects={projects} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Week Overview</h1>
          <p className="text-muted-foreground">
            Detailed time tracking for the current week
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(weekTotal)}</div>
              <p className="text-xs text-muted-foreground">this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billable</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(billableMinutes)}</div>
              <p className="text-xs text-muted-foreground">
                {weekTotal > 0 ? `${Math.round((billableMinutes / weekTotal) * 100)}%` : "0%"} of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${weekRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">from billable time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(Math.round(weekTotal / 7))}</div>
              <p className="text-xs text-muted-foreground">per day</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Daily entries */}
          <div className="md:col-span-2 space-y-4">
            {Array.from(entriesByDay.entries()).reverse().map(([dayKey, entries]) => {
              const dayDate = new Date(dayKey)
              const isToday = dayDate.toDateString() === today.toDateString()
              const dayTotal = entries.reduce((sum, e) => sum + e.durationMinutes, 0)

              return (
                <Card key={dayKey}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {formatDate(dayDate)}
                        {isToday && (
                          <Badge variant="outline" className="text-xs">Today</Badge>
                        )}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(dayTotal)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {entries.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No time logged
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center gap-3 rounded border p-2 text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/projects/${entry.project.slug}`}
                                  className="font-medium hover:underline truncate"
                                >
                                  {entry.project.name}
                                </Link>
                                {entry.billable && (
                                  <Badge variant="outline" className="text-xs">$</Badge>
                                )}
                              </div>
                              {entry.task && (
                                <p className="text-muted-foreground truncate">
                                  {entry.task.title}
                                </p>
                              )}
                            </div>
                            <span className="text-muted-foreground whitespace-nowrap">
                              {formatDuration(entry.durationMinutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Project breakdown */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>By Project</CardTitle>
              <CardDescription>Time distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No time tracked this week
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedProjects.map((project) => {
                    const percent = Math.round((project.minutes / weekTotal) * 100)
                    return (
                      <div key={project.slug}>
                        <div className="flex items-center justify-between mb-1">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="text-sm font-medium hover:underline truncate"
                          >
                            {project.name}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(project.minutes)}
                          </span>
                        </div>
                        <Progress value={percent} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDuration(project.billable)} billable
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
