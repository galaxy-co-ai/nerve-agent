// =============================================================================
// Desktop API - Tasks
// =============================================================================
// GET active tasks, PATCH task updates

import { NextRequest, NextResponse } from "next/server"
import { getActiveTasksForDesktop, syncTasks } from "@/lib/actions/desktop-sync"

// Helper to extract auth token from either header format
function getAuthToken(request: NextRequest): string | null {
  // Try X-Nerve-Token first (desktop client format)
  const nerveToken = request.headers.get("X-Nerve-Token")
  if (nerveToken) return nerveToken

  // Fall back to Authorization: Bearer format
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "")
  }

  return null
}

// GET - Fetch active tasks for desktop
export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    // Optional project filter via query param
    const { searchParams } = new URL(request.url)
    const project = searchParams.get("project")

    // If project slug provided, we need to look up the project ID
    // For now, pass undefined - the desktop client can filter client-side
    const tasks = await getActiveTasksForDesktop(authToken, undefined)

    // Filter by project slug if provided
    let filteredTasks = tasks
    if (project) {
      filteredTasks = tasks.filter(t => t.sprint.project.slug === project)
    }

    return NextResponse.json({ tasks: filteredTasks })
  } catch (error) {
    console.error("Get tasks error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to get tasks", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// PATCH - Bulk update tasks (alternative to POST at /sync/tasks)
export async function PATCH(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tasks } = body as {
      tasks: Array<{
        id: string
        status?: "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED"
        actualHours?: number
        completedAt?: string
      }>
    }

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Missing or invalid tasks array" },
        { status: 400 }
      )
    }

    // Convert date strings to Date objects
    const processedTasks = tasks.map((task) => ({
      ...task,
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }))

    const result = await syncTasks(authToken, processedTasks)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Task update error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Update failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
