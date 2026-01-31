export const dynamic = "force-dynamic"

import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  NerveCard,
  NerveCardContent,
  NerveCardDescription,
  NerveCardHeader,
  NerveCardTitle,
  NerveButton,
  NerveBadge,
  NerveSeparator,
} from "@/components/nerve"
import { H2 } from "@/components/ui/typography"
import { Plus, FolderKanban, Upload } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { axEntityAttrs, computeStaleness } from "@/lib/ax"

// Map project status to NerveBadge variants
const statusVariants: Record<string, "info" | "success" | "warning" | "default" | "error"> = {
  PLANNING: "info",
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "default",
  CANCELLED: "error",
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
        <NerveSeparator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex gap-2">
          <NerveButton asChild size="sm" variant="outline">
            <Link href="/projects/import" data-ax-intent="import:codebase" data-ax-context="header-action">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </NerveButton>
          <NerveButton asChild size="sm">
            <Link href="/projects/new" data-ax-intent="create:project" data-ax-context="header-action">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </NerveButton>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <H2>Projects</H2>
          <p className="text-zinc-400">Manage your active and upcoming projects.</p>
        </div>

        {projects.length === 0 ? (
          <NerveCard elevation={1}>
            <NerveCardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-zinc-800 p-4 mb-4">
                <FolderKanban className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="font-semibold mb-2 text-zinc-100">No projects yet</h3>
              <p className="text-zinc-400 text-sm mb-4 text-center max-w-sm">
                Create your first project to start tracking time, managing sprints, and organizing your work.
              </p>
              <div className="flex gap-2">
                <NerveButton asChild variant="outline">
                  <Link href="/projects/import" data-ax-intent="import:codebase" data-ax-context="empty-state">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Codebase
                  </Link>
                </NerveButton>
                <NerveButton asChild>
                  <Link href="/projects/new" data-ax-intent="create:project" data-ax-context="empty-state">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Link>
                </NerveButton>
              </div>
            </NerveCardContent>
          </NerveCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const staleness = computeStaleness(project.updatedAt, {
                hasBlockers: project._count.blockers > 0,
              })
              const relationships = [
                { type: "parent-of", entity: "sprint", id: "", name: `${project._count.sprints} sprints` },
              ]
              return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                data-ax-intent="navigate:project-detail"
                data-ax-context="list-item"
                {...axEntityAttrs("project", project.id, staleness, relationships)}
              >
                <NerveCard variant="interactive" elevation={1} className="h-full">
                  <NerveCardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <NerveCardTitle className="text-base">{project.name}</NerveCardTitle>
                        <NerveCardDescription>{project.clientName}</NerveCardDescription>
                      </div>
                      <NerveBadge variant={statusVariants[project.status]} dot>
                        {project.status.toLowerCase().replace("_", " ")}
                      </NerveBadge>
                    </div>
                  </NerveCardHeader>
                  <NerveCardContent>
                    {project.description && (
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span>Phase: {phaseLabels[project.phase]}</span>
                      <span>{project._count.sprints} sprints</span>
                      {project._count.blockers > 0 && (
                        <NerveBadge variant="warning" size="sm">
                          {project._count.blockers} blocker{project._count.blockers !== 1 ? "s" : ""}
                        </NerveBadge>
                      )}
                    </div>
                  </NerveCardContent>
                </NerveCard>
              </Link>
            )})}
          </div>
        )}
      </div>
    </>
  )
}
