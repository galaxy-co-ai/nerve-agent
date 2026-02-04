import { ensureClientUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { PortfolioOverview } from "@/components/client/portfolio-overview"

export default async function ClientPortfolioPage() {
  const user = await ensureClientUser()

  // Fetch client's accessible projects with details
  const clientAccess = await db.clientProjectAccess.findMany({
    where: {
      client: {
        email: user.email,
      },
    },
    include: {
      project: {
        include: {
          sprints: {
            select: {
              id: true,
              number: true,
              status: true,
            },
          },
          deliverables: {
            where: { clientVisible: true },
            select: {
              id: true,
              status: true,
              progressPercent: true,
            },
          },
          blockers: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
          activityEvents: {
            where: { visibleToClient: true },
            orderBy: { occurredAt: "desc" },
            take: 5,
            select: {
              id: true,
              eventType: true,
              title: true,
              clientMessage: true,
              occurredAt: true,
            },
          },
        },
      },
    },
  })

  // Transform data for the component
  const projects = clientAccess.map((access) => {
    const project = access.project
    const totalSprints = project.sprints.length
    const completedSprints = project.sprints.filter((s) => s.status === "COMPLETED").length
    const currentSprint = project.sprints.find((s) => s.status === "IN_PROGRESS")

    // Calculate overall progress from deliverables
    const totalProgress = project.deliverables.reduce((sum, d) => sum + d.progressPercent, 0)
    const avgProgress = project.deliverables.length > 0 ? Math.round(totalProgress / project.deliverables.length) : 0

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      status: project.status,
      phase: project.phase,
      health: project.health,
      targetEndDate: project.targetEndDate,
      accessLevel: access.accessLevel,
      contractStatus: access.contractStatus,
      progress: avgProgress,
      sprints: {
        current: currentSprint?.number || null,
        total: totalSprints,
        completed: completedSprints,
      },
      blockerCount: project.blockers.length,
      recentActivity: project.activityEvents.map((e) => ({
        id: e.id,
        type: e.eventType,
        title: e.clientMessage || e.title,
        occurredAt: e.occurredAt,
      })),
    }
  })

  // Aggregate stats
  const stats = {
    activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
    onTrack: projects.filter((p) => p.health >= 80).length,
    atRisk: projects.filter((p) => p.health < 50).length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  }

  // Aggregate recent activity across all projects
  const recentActivity = projects
    .flatMap((p) =>
      p.recentActivity.map((a) => ({
        ...a,
        projectName: p.name,
        projectSlug: p.slug,
      }))
    )
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 10)

  return (
    <PortfolioOverview
      user={user}
      projects={projects}
      stats={stats}
      recentActivity={recentActivity}
    />
  )
}
