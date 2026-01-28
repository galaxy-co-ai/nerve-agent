export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  DollarSign,
  Layers,
  MoreHorizontal,
  Pencil,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ChevronRight,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { updateProjectStatus, deleteProject } from "@/lib/actions/projects"
import { resolveBlocker, deleteBlocker } from "@/lib/actions/blockers"
import { AddSprintDialog } from "@/components/add-sprint-dialog"
import { AddBlockerDialog } from "@/components/add-blocker-dialog"
import { PortalSettings } from "@/components/portal-settings"
import { TrackPageVisit } from "@/components/track-page-visit"

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
}

const phaseLabels: Record<string, string> = {
  PLAN: "Planning",
  SPRINT: "Sprinting",
  SHIP: "Shipping",
  SUPPORT: "Support",
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug, userId: user.id },
    include: {
      sprints: {
        orderBy: { number: "asc" },
      },
      blockers: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
      timeEntries: {
        orderBy: { startTime: "desc" },
        take: 5,
      },
      _count: {
        select: {
          sprints: true,
          blockers: { where: { status: "ACTIVE" } },
          timeEntries: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Calculate total hours
  const totalMinutes = project.timeEntries.reduce((acc: number, entry) => acc + entry.durationMinutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  // Calculate revenue if hourly rate is set
  const revenue = project.hourlyRate
    ? (totalMinutes / 60) * Number(project.hourlyRate)
    : null

  const deleteProjectWithSlug = deleteProject.bind(null, slug)

  return (
    <>
      <TrackPageVisit
        id={project.id}
        type="project"
        title={project.name}
        href={`/projects/${slug}`}
      />
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${slug}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <form action={updateProjectStatus.bind(null, slug, "ACTIVE")}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <Play className="mr-2 h-4 w-4" />
                    Set Active
                  </button>
                </DropdownMenuItem>
              </form>
              <form action={updateProjectStatus.bind(null, slug, "ON_HOLD")}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <Pause className="mr-2 h-4 w-4" />
                    Put On Hold
                  </button>
                </DropdownMenuItem>
              </form>
              <form action={updateProjectStatus.bind(null, slug, "COMPLETED")}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </button>
                </DropdownMenuItem>
              </form>
              <DropdownMenuSeparator />
              <form action={deleteProjectWithSlug}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer text-red-500">
                    Delete Project
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant="outline" className={statusColors[project.status]}>
                {project.status.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.clientName}</p>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Current Phase</div>
            <div className="font-medium">{phaseLabels[project.phase]}</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours}h {remainingMinutes}m</div>
              <p className="text-xs text-muted-foreground">
                {project._count.timeEntries} entries
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenue !== null ? `$${revenue.toFixed(2)}` : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {project.hourlyRate ? `$${Number(project.hourlyRate)}/hr` : "No rate set"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sprints</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project._count.sprints}</div>
              <p className="text-xs text-muted-foreground">
                {project.sprints.filter((s) => s.status === "COMPLETED").length} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blockers</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project._count.blockers}</div>
              <p className="text-xs text-muted-foreground">
                {project._count.blockers === 0 ? "All clear" : "Need attention"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sprints */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sprints</CardTitle>
                <CardDescription>Manage project sprints and tasks</CardDescription>
              </div>
              <AddSprintDialog
                projectSlug={slug}
                nextSprintNumber={project.sprints.length > 0 ? project.sprints[project.sprints.length - 1].number + 1 : 1}
              />
            </CardHeader>
            <CardContent>
              {project.sprints.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No sprints yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add your first sprint to start organizing work
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {project.sprints.map((sprint) => (
                    <Link
                      key={sprint.id}
                      href={`/projects/${slug}/sprints/${sprint.number}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">
                          Sprint {sprint.number}: {sprint.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Number(sprint.estimatedHours)}h estimated · {Number(sprint.actualHours)}h tracked
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {sprint.status.toLowerCase().replace("_", " ")}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Blockers</CardTitle>
                <CardDescription>Issues waiting for resolution</CardDescription>
              </div>
              <AddBlockerDialog projectSlug={slug} />
            </CardHeader>
            <CardContent>
              {project.blockers.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No active blockers</p>
                    <p className="text-sm text-muted-foreground">
                      Great! Nothing is blocking progress
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.blockers.map((blocker) => (
                    <div
                      key={blocker.id}
                      className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{blocker.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Waiting on: {blocker.waitingOn}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-yellow-500/20 text-yellow-500">
                          {blocker.type.toLowerCase()}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <form action={resolveBlocker.bind(null, blocker.id)}>
                              <DropdownMenuItem asChild>
                                <button type="submit" className="w-full cursor-pointer">
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark Resolved
                                </button>
                              </DropdownMenuItem>
                            </form>
                            <DropdownMenuSeparator />
                            <form action={deleteBlocker.bind(null, blocker.id)}>
                              <DropdownMenuItem asChild>
                                <button type="submit" className="w-full cursor-pointer text-red-500">
                                  Delete
                                </button>
                              </DropdownMenuItem>
                            </form>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Client Portal Settings */}
        <PortalSettings
          projectSlug={slug}
          portalEnabled={project.portalEnabled}
          portalToken={project.portalToken}
          portalLastAccess={project.portalLastAccess}
        />
      </div>
    </>
  )
}
