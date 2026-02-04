import { notFound, redirect } from "next/navigation"
import { getCurrentUser, getOrgContext, hasRoleLevel } from "@/lib/auth"
import { db } from "@/lib/db"
import { ProjectDetail } from "@/components/client/project-detail"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ClientProjectPage({ params }: PageProps) {
  const { slug } = await params
  const [user, orgCtx] = await Promise.all([getCurrentUser(), getOrgContext()])

  if (!user) {
    redirect("/sign-in")
  }

  // Check access based on role
  const isPrivileged = hasRoleLevel(orgCtx.orgRole, "org:development")

  // Fetch the project with all details
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      sprints: {
        orderBy: { number: "asc" },
        select: {
          id: true,
          number: true,
          name: true,
          status: true,
          estimatedHours: true,
          actualHours: true,
          plannedStartDate: true,
          plannedEndDate: true,
          actualStartDate: true,
          actualEndDate: true,
        },
      },
      deliverables: {
        where: { clientVisible: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          progressPercent: true,
          demoUrl: true,
          screenshots: true,
          dueDate: true,
          completedAt: true,
        },
      },
      blockers: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          title: true,
          description: true,
          waitingOn: true,
          createdAt: true,
        },
      },
      activityEvents: {
        where: { visibleToClient: true },
        orderBy: { occurredAt: "desc" },
        take: 20,
        select: {
          id: true,
          eventType: true,
          title: true,
          clientMessage: true,
          occurredAt: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // If not privileged, verify explicit access
  let accessLevel = "FULL"
  let contractStatus = "ACTIVE"

  if (!isPrivileged) {
    const access = await db.clientProjectAccess.findFirst({
      where: {
        project: { slug },
        client: { email: user.email },
      },
    })

    if (!access) {
      notFound()
    }

    accessLevel = access.accessLevel
    contractStatus = access.contractStatus
  }

  // Calculate stats
  const totalSprints = project.sprints.length
  const completedSprints = project.sprints.filter((s) => s.status === "COMPLETED").length
  const currentSprint = project.sprints.find((s) => s.status === "IN_PROGRESS")

  const totalProgress =
    project.deliverables.length > 0
      ? Math.round(
          project.deliverables.reduce((sum, d) => sum + d.progressPercent, 0) /
            project.deliverables.length
        )
      : 0

  const projectData = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    status: project.status,
    phase: project.phase,
    health: project.health,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    developer: project.user,
    contractStatus,
    accessLevel,
    stats: {
      progress: totalProgress,
      currentSprint: currentSprint?.number || null,
      totalSprints,
      completedSprints,
      blockerCount: project.blockers.length,
    },
    sprints: project.sprints.map((sprint) => ({
      ...sprint,
      estimatedHours: sprint.estimatedHours.toNumber(),
      actualHours: sprint.actualHours.toNumber(),
    })),
    milestones: project.deliverables.map((d) => ({
      ...d,
      screenshots: d.screenshots as string[],
    })),
    blockers: project.blockers,
    activity: project.activityEvents.map((e) => ({
      id: e.id,
      type: e.eventType,
      title: e.clientMessage || e.title,
      occurredAt: e.occurredAt,
    })),
  }

  return <ProjectDetail project={projectData} currentUserId={user.id} />
}
