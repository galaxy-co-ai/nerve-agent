export const dynamic = "force-dynamic"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { H2, Muted } from "@/components/ui/typography"
import { Clock, AlertTriangle, Users, CheckCircle2 } from "lucide-react"
import { DashboardInsights } from "@/components/features/dashboard-insights"
import { AiFocusWizard } from "@/components/features/ai-focus-wizard"
import { AiQa } from "@/components/features/ai-qa"
import { OnboardingLaunchpad } from "@/components/features/onboarding-launchpad"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default async function DashboardPage() {
  const user = await requireUser()

  // Check if user has any projects (for onboarding)
  const projectCount = await db.project.count({
    where: { userId: user.id },
  })

  // Show onboarding launchpad for new users
  if (projectCount === 0) {
    return <OnboardingLaunchpad />
  }

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

  // Execute all promises in parallel
  const [
    timeEntriesToday,
    activeBlockers,
    clientBlockers,
    completedTasksToday,
    inProgressTaskCount,
    overdueBlockers,
  ] = await Promise.all([
    timeEntriesTodayPromise,
    activeBlockersPromise,
    clientBlockersPromise,
    completedTasksTodayPromise,
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
      <header className="flex h-16 shrink-0 items-center border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-bold tracking-tight">NERVE AGENT</h1>
        </div>
        <div className="text-sm text-muted-foreground">{todayFormatted}</div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Welcome Section */}
        <div>
          <H2>
            {getGreeting()}, {user.name?.split(" ")[0] || "there"}
          </H2>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* AI Focus Wizard */}
          <AiFocusWizard />

          {/* AI Q&A */}
          <AiQa />
        </div>
      </div>
    </>
  )
}
