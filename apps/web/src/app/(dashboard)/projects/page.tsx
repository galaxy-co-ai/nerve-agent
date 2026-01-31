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
import { H2, Muted } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderKanban, Upload } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
}

const phaseLabels: Record<string, string> = {
  PLAN: "Plan",
  SPRINT: "Sprint",
  SHIP: "Ship",
  SUPPORT: "Support",
}

export default async function ProjectsPage() {
  const user = await requireUser()

  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          sprints: true,
          blockers: { where: { status: "ACTIVE" } },
        },
      },
    },
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/projects/import" data-ax-intent="import:codebase" data-ax-context="header-action">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/projects/new" data-ax-intent="create:project" data-ax-context="header-action">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <H2>Projects</H2>
          <Muted>Manage your active and upcoming projects.</Muted>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                Create your first project to start tracking time, managing sprints, and organizing your work.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/projects/import" data-ax-intent="import:codebase" data-ax-context="empty-state">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Codebase
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/projects/new" data-ax-intent="create:project" data-ax-context="empty-state">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                data-ax-intent="navigate:project-detail"
                data-ax-context="list-item"
              >
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription>{project.clientName}</CardDescription>
                      </div>
                      <Badge variant="outline" className={statusColors[project.status]}>
                        {project.status.toLowerCase().replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Phase: {phaseLabels[project.phase]}</span>
                      <span>{project._count.sprints} sprints</span>
                      {project._count.blockers > 0 && (
                        <span className="text-yellow-500">
                          {project._count.blockers} blocker{project._count.blockers !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
