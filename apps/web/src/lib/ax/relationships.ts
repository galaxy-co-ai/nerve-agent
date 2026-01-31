/**
 * AX Relationship Mapping
 *
 * Provides relational awareness for the AX layer, enabling agents to
 * trace connections between workspace entities.
 */

// =============================================================================
// TYPES
// =============================================================================

export type AXRelationshipType =
  | "belongs-to"
  | "blocks"
  | "blocked-by"
  | "references"
  | "generated-from"
  | "related-to"
  | "parent-of"
  | "child-of"

export interface AXRelationship {
  type: AXRelationshipType
  entity: string // e.g., "project", "task", "blocker"
  id: string
  name?: string
  inferred?: boolean
  confidence?: number
}

export interface AXRelationshipMap {
  byProject: Record<
    string,
    {
      tasks: string[]
      blockers: string[]
      notes: string[]
      calls: string[]
    }
  >
  blockerImpact: Record<
    string,
    {
      blockedTasks: string[]
      projectId: string
    }
  >
  recentConnections: Array<{
    from: { entity: string; id: string; name?: string }
    to: { entity: string; id: string; name?: string }
    type: AXRelationshipType
    timestamp: string
  }>
}

// =============================================================================
// FUNCTIONS
// =============================================================================

interface EntityWithProject {
  id: string
  projectId?: string | null
  project?: { id: string; name: string; slug: string } | null
}

interface TaskEntity extends EntityWithProject {
  blockers?: Array<{ id: string; title: string }>
}

interface BlockerEntity {
  id: string
  projectId: string
  project?: { id: string; name: string; slug: string }
  tasks?: Array<{ id: string; title: string }>
}

interface NoteEntity extends EntityWithProject {
  wikiLinks?: string[]
}

/**
 * Build relationships for a single entity
 */
export function buildEntityRelationships(
  entity: EntityWithProject | TaskEntity | BlockerEntity | NoteEntity,
  type: string
): AXRelationship[] {
  const relationships: AXRelationship[] = []

  // Project relationship
  if ("project" in entity && entity.project) {
    relationships.push({
      type: "belongs-to",
      entity: "project",
      id: entity.project.id,
      name: entity.project.name,
    })
  } else if ("projectId" in entity && entity.projectId) {
    relationships.push({
      type: "belongs-to",
      entity: "project",
      id: entity.projectId,
    })
  }

  // Task-specific relationships
  if (type === "task" && "blockers" in entity && entity.blockers) {
    for (const blocker of entity.blockers) {
      relationships.push({
        type: "blocked-by",
        entity: "blocker",
        id: blocker.id,
        name: blocker.title,
      })
    }
  }

  // Blocker-specific relationships
  if (type === "blocker" && "tasks" in entity && entity.tasks) {
    for (const task of entity.tasks) {
      relationships.push({
        type: "blocks",
        entity: "task",
        id: task.id,
        name: task.title,
      })
    }
  }

  // Note wiki links (inferred relationships)
  if (type === "note" && "wikiLinks" in entity && entity.wikiLinks) {
    for (const link of entity.wikiLinks) {
      relationships.push({
        type: "references",
        entity: "note",
        id: link, // This would need resolution to actual note ID
        inferred: true,
        confidence: 0.8,
      })
    }
  }

  return relationships
}

export interface WorkspaceData {
  projects: Array<{
    id: string
    name: string
    slug: string
    updatedAt: Date
  }>
  tasks: Array<{
    id: string
    title: string
    projectId: string
    sprintId: string
    updatedAt: Date
    blockers?: Array<{ id: string; title: string }>
  }>
  blockers: Array<{
    id: string
    title: string
    projectId: string
    tasks?: Array<{ id: string; title: string }>
    createdAt: Date
  }>
  notes: Array<{
    id: string
    title: string
    projectId: string | null
    updatedAt: Date
  }>
  calls: Array<{
    id: string
    title: string
    projectId: string
    createdAt: Date
  }>
}

/**
 * Build a complete relationship map for the workspace
 */
export function buildRelationshipMap(workspace: WorkspaceData): AXRelationshipMap {
  const byProject: AXRelationshipMap["byProject"] = {}
  const blockerImpact: AXRelationshipMap["blockerImpact"] = {}
  const recentConnections: AXRelationshipMap["recentConnections"] = []

  // Initialize project maps
  for (const project of workspace.projects) {
    byProject[project.id] = {
      tasks: [],
      blockers: [],
      notes: [],
      calls: [],
    }
  }

  // Map tasks to projects
  for (const task of workspace.tasks) {
    if (byProject[task.projectId]) {
      byProject[task.projectId].tasks.push(task.id)
    }
  }

  // Map blockers to projects and track impact
  for (const blocker of workspace.blockers) {
    if (byProject[blocker.projectId]) {
      byProject[blocker.projectId].blockers.push(blocker.id)
    }

    // Track which tasks each blocker impacts
    blockerImpact[blocker.id] = {
      blockedTasks: blocker.tasks?.map((t) => t.id) || [],
      projectId: blocker.projectId,
    }

    // Add to recent connections if blocker is blocking tasks
    if (blocker.tasks && blocker.tasks.length > 0) {
      for (const task of blocker.tasks) {
        recentConnections.push({
          from: { entity: "blocker", id: blocker.id, name: blocker.title },
          to: { entity: "task", id: task.id, name: task.title },
          type: "blocks",
          timestamp: blocker.createdAt.toISOString(),
        })
      }
    }
  }

  // Map notes to projects
  for (const note of workspace.notes) {
    if (note.projectId && byProject[note.projectId]) {
      byProject[note.projectId].notes.push(note.id)
    }
  }

  // Map calls to projects
  for (const call of workspace.calls) {
    if (byProject[call.projectId]) {
      byProject[call.projectId].calls.push(call.id)
    }
  }

  // Sort recent connections by timestamp (most recent first)
  recentConnections.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Keep only the 20 most recent connections
  const trimmedConnections = recentConnections.slice(0, 20)

  return {
    byProject,
    blockerImpact,
    recentConnections: trimmedConnections,
  }
}
