import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import {
  generateStandupNotes,
  generateWeeklySummary,
  generateClientUpdate,
  generateFollowUpEmail,
  analyzeBlocker,
} from "@/lib/agent/generators"

// POST: Execute an agent action
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { actionId, projectId, blockerId } = await request.json()

    if (!actionId) {
      return NextResponse.json(
        { error: "actionId is required" },
        { status: 400 }
      )
    }

    let result: { type: string; content: unknown }

    switch (actionId) {
      case "standup-notes": {
        // Get recent tasks and blockers
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)

        const [completedTasks, inProgressTasks, blockers] = await Promise.all([
          db.task.findMany({
            where: {
              completedAt: { gte: yesterday },
              sprint: { project: { userId: user.id } },
            },
            select: { title: true },
            take: 10,
          }),
          db.task.findMany({
            where: {
              status: "IN_PROGRESS",
              sprint: { project: { userId: user.id } },
            },
            select: { title: true },
            take: 10,
          }),
          db.blocker.findMany({
            where: {
              status: "ACTIVE",
              project: { userId: user.id },
            },
            select: { title: true },
            take: 5,
          }),
        ])

        const notes = await generateStandupNotes({
          completedYesterday: completedTasks.map((t) => t.title),
          inProgressToday: inProgressTasks.map((t) => t.title),
          blockers: blockers.map((b) => b.title),
        })

        result = { type: "standup-notes", content: notes }
        break
      }

      case "weekly-summary": {
        // Get project-specific or all-projects summary
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const projectFilter = projectId
          ? { id: projectId, userId: user.id }
          : { userId: user.id }

        const [tasksCompleted, blockersResolved, timeLogged, completedTasks] =
          await Promise.all([
            db.task.count({
              where: {
                completedAt: { gte: weekAgo },
                sprint: { project: projectFilter },
              },
            }),
            db.blocker.count({
              where: {
                status: "RESOLVED",
                resolvedAt: { gte: weekAgo },
                project: projectFilter,
              },
            }),
            db.timeEntry.aggregate({
              where: {
                userId: user.id,
                startTime: { gte: weekAgo },
                ...(projectId ? { projectId } : {}),
              },
              _sum: { durationMinutes: true },
            }),
            db.task.findMany({
              where: {
                completedAt: { gte: weekAgo },
                sprint: { project: projectFilter },
              },
              select: { title: true },
              take: 5,
              orderBy: { completedAt: "desc" },
            }),
          ])

        const project = projectId
          ? await db.project.findUnique({
              where: { id: projectId },
              select: { name: true },
            })
          : null

        const summary = await generateWeeklySummary({
          projectName: project?.name || "All Projects",
          tasksCompleted,
          hoursLogged: Math.round((timeLogged._sum.durationMinutes || 0) / 60),
          blockersResolved,
          highlights: completedTasks.map((t) => t.title),
        })

        result = { type: "weekly-summary", content: summary }
        break
      }

      case "client-update": {
        if (!projectId) {
          return NextResponse.json(
            { error: "projectId is required for client update" },
            { status: 400 }
          )
        }

        const project = await db.project.findFirst({
          where: { id: projectId, userId: user.id },
          include: {
            client: { select: { name: true } },
          },
        })

        if (!project) {
          return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const [recentTasks, upcomingTasks, blockers] = await Promise.all([
          db.task.findMany({
            where: {
              completedAt: { gte: weekAgo },
              sprint: { projectId },
            },
            select: { title: true },
            take: 5,
          }),
          db.task.findMany({
            where: {
              status: { in: ["TODO", "IN_PROGRESS"] },
              sprint: { projectId },
            },
            select: { title: true },
            take: 5,
          }),
          db.blocker.findMany({
            where: {
              status: "ACTIVE",
              projectId,
              waitingOn: "client",
            },
            select: { title: true },
          }),
        ])

        const email = await generateClientUpdate({
          clientName: project.client?.name || "Client",
          projectName: project.name,
          recentProgress: recentTasks.map((t) => t.title),
          upcomingWork: upcomingTasks.map((t) => t.title),
          blockers: blockers.map((b) => b.title),
        })

        result = { type: "client-update", content: email }
        break
      }

      case "blocker-analysis": {
        if (!blockerId) {
          return NextResponse.json(
            { error: "blockerId is required for blocker analysis" },
            { status: 400 }
          )
        }

        const blocker = await db.blocker.findFirst({
          where: { id: blockerId, project: { userId: user.id } },
          include: {
            project: { select: { name: true, description: true } },
          },
        })

        if (!blocker) {
          return NextResponse.json({ error: "Blocker not found" }, { status: 404 })
        }

        const daysSinceCreated = Math.floor(
          (Date.now() - blocker.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        const analysis = await analyzeBlocker({
          title: blocker.title,
          description: blocker.description || "",
          daysSinceCreated,
          waitingOn: blocker.waitingOn,
          projectContext: blocker.project.description || undefined,
        })

        result = { type: "blocker-analysis", content: analysis }
        break
      }

      case "followup-drafts": {
        // Get all stale blockers and draft follow-ups
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        const staleBlockers = await db.blocker.findMany({
          where: {
            status: "ACTIVE",
            createdAt: { lte: threeDaysAgo },
            project: { userId: user.id },
          },
          include: {
            project: { select: { name: true } },
          },
          take: 5,
        })

        const drafts = await Promise.all(
          staleBlockers.map(async (blocker) => {
            const daysSinceCreated = Math.floor(
              (Date.now() - blocker.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )

            const email = await generateFollowUpEmail({
              blockerTitle: blocker.title,
              blockerDescription: blocker.description || "",
              daysSinceCreated,
              waitingOn: blocker.waitingOn,
              previousFollowUps: blocker.followUpCount,
            })

            return {
              blockerId: blocker.id,
              blockerTitle: blocker.title,
              projectName: blocker.project.name,
              email,
            }
          })
        )

        result = { type: "followup-drafts", content: drafts }
        break
      }

      case "scope-check": {
        if (!projectId) {
          return NextResponse.json(
            { error: "projectId is required for scope check" },
            { status: 400 }
          )
        }

        // Get project with sprints and tasks
        const project = await db.project.findFirst({
          where: { id: projectId, userId: user.id },
          include: {
            sprints: {
              include: {
                tasks: {
                  select: { title: true, status: true, scope: true },
                },
              },
            },
          },
        })

        if (!project) {
          return NextResponse.json({ error: "Project not found" }, { status: 404 })
        }

        // Count tasks by scope type
        const allTasks = project.sprints.flatMap((s) => s.tasks)
        const scopeStats = {
          original: allTasks.filter((t) => !t.scope || t.scope === "ORIGINAL").length,
          added: allTasks.filter((t) => t.scope === "ADDED").length,
          removed: allTasks.filter((t) => t.scope === "REMOVED").length,
        }

        const scopeDrift =
          scopeStats.added > 0 || scopeStats.removed > 0
            ? `Scope has drifted: +${scopeStats.added} tasks added, -${scopeStats.removed} removed from original plan.`
            : "No scope drift detected."

        result = {
          type: "scope-check",
          content: {
            projectName: project.name,
            totalTasks: allTasks.length,
            scopeStats,
            assessment: scopeDrift,
          },
        }
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${actionId}` },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Agent action error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute action" },
      { status: 500 }
    )
  }
}
