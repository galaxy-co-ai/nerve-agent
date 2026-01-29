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
import { Settings } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { ProjectWorkspace } from "@/components/workspace/project-workspace"
import type { FrameworkDoc, CheckpointWithDetails } from "@/lib/types/workspace"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function WorkspacePage({ params }: PageProps) {
  const { slug } = await params
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug, userId: user.id },
    include: {
      frameworkDocs: {
        orderBy: { docNumber: "asc" },
      },
      checkpoints: {
        orderBy: [{ phase: "asc" }, { checkpointId: "asc" }],
        include: {
          objectives: {
            orderBy: { objectiveId: "asc" },
            include: {
              steps: {
                orderBy: { stepId: "asc" },
              },
            },
          },
          sessions: {
            orderBy: { startedAt: "desc" },
            take: 5,
          },
        },
      },
      workspaceNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Extract tech stack from TAD if it exists
  const tadDoc = project.frameworkDocs.find((d) => d.docNumber === 4)
  let techStack: string | null = null

  if (tadDoc?.content) {
    // Simple extraction - look for tech stack section
    const techMatch = tadDoc.content.match(
      /(?:## Tech Stack|### Tech Stack|# Tech Stack)([\s\S]*?)(?=\n#|$)/i
    )
    if (techMatch) {
      techStack = techMatch[1].trim()
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${slug}`}>
                {project.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Workspace</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/projects/${slug}`}>
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ProjectWorkspace
          projectSlug={slug}
          projectName={project.name}
          frameworkDocs={project.frameworkDocs as FrameworkDoc[]}
          checkpoints={project.checkpoints as CheckpointWithDetails[]}
          techStack={techStack}
          notes={project.workspaceNotes}
        />
      </div>
    </div>
  )
}
