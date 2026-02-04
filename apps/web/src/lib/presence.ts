// =============================================================================
// User Presence - Real-time Status System
// =============================================================================
//
// Auto-status based on activity:
// - ONLINE: Active in last 15 min
// - AWAY: No activity 15-60 min
// - OFFLINE: No activity 60+ min
// - DEEP_WORK: 2hr+ uninterrupted work (auto-detected)
//
// Presence is updated on user actions and broadcast via Pusher
//
// =============================================================================

import { PresenceStatus } from "@prisma/client"
import { db } from "@/lib/db"
import { getPusher } from "@/lib/pusher"

// =============================================================================
// Constants
// =============================================================================

const ONLINE_THRESHOLD_MS = 15 * 60 * 1000 // 15 minutes
const AWAY_THRESHOLD_MS = 60 * 60 * 1000 // 60 minutes
const DEEP_WORK_THRESHOLD_MS = 2 * 60 * 60 * 1000 // 2 hours

// =============================================================================
// Status Calculation
// =============================================================================

interface PresenceContext {
  lastActivityAt: Date
  focusStartedAt: Date | null
  workingHoursStart?: string // "09:00"
  workingHoursEnd?: string // "17:00"
  manualStatus?: PresenceStatus
}

/**
 * Calculate presence status based on activity and context
 */
export function calculatePresenceStatus(context: PresenceContext): PresenceStatus {
  // Manual overrides take precedence (except CUSTOM which we check separately)
  if (context.manualStatus && context.manualStatus !== PresenceStatus.ONLINE) {
    return context.manualStatus
  }

  const now = new Date()
  const timeSinceActivity = now.getTime() - context.lastActivityAt.getTime()

  // Check after hours (outside working hours)
  if (context.workingHoursStart && context.workingHoursEnd) {
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 60 + currentMinute

    const [startHour, startMin] = context.workingHoursStart.split(":").map(Number)
    const [endHour, endMin] = context.workingHoursEnd.split(":").map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (currentTime < startTime || currentTime > endTime) {
      return PresenceStatus.AFTER_HOURS
    }
  }

  // Check deep work (2hr+ uninterrupted)
  if (context.focusStartedAt) {
    const focusDuration = now.getTime() - context.focusStartedAt.getTime()
    if (focusDuration >= DEEP_WORK_THRESHOLD_MS && timeSinceActivity < ONLINE_THRESHOLD_MS) {
      return PresenceStatus.DEEP_WORK
    }
  }

  // Standard activity-based status
  if (timeSinceActivity < ONLINE_THRESHOLD_MS) {
    return PresenceStatus.ONLINE
  }

  if (timeSinceActivity < AWAY_THRESHOLD_MS) {
    return PresenceStatus.AWAY
  }

  return PresenceStatus.OFFLINE
}

// =============================================================================
// Presence Updates
// =============================================================================

interface UpdatePresenceParams {
  userId: string
  projectId?: string | null
  area?: string | null // "API", "Frontend", "Design", etc.
  taskId?: string | null
  customStatus?: string | null
  manualStatus?: PresenceStatus
}

/**
 * Update user presence and broadcast to clients
 */
export async function updatePresence(params: UpdatePresenceParams): Promise<void> {
  const { userId, projectId, area, taskId, customStatus, manualStatus } = params

  // Get user's working hours
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      workingHoursStart: true,
      workingHoursEnd: true,
      presence: true,
    },
  })

  const now = new Date()

  // Determine if this continues a focus session
  const existingPresence = user?.presence
  let focusStartedAt: Date | null = existingPresence?.focusStartedAt ?? null

  // Start new focus session if coming from offline/away to online
  if (!focusStartedAt && existingPresence?.status !== PresenceStatus.ONLINE) {
    focusStartedAt = now
  }

  // Calculate new status
  const newStatus = manualStatus || calculatePresenceStatus({
    lastActivityAt: now,
    focusStartedAt,
    workingHoursStart: user?.workingHoursStart,
    workingHoursEnd: user?.workingHoursEnd,
    manualStatus,
  })

  // Reset focus if going offline/away
  if (newStatus === PresenceStatus.OFFLINE || newStatus === PresenceStatus.AWAY) {
    focusStartedAt = null
  }

  // Upsert presence record
  const presence = await db.userPresence.upsert({
    where: { userId },
    create: {
      userId,
      status: newStatus,
      customStatus: customStatus || null,
      currentProjectId: projectId || null,
      currentArea: area || null,
      currentTaskId: taskId || null,
      lastActivityAt: now,
      focusStartedAt: focusStartedAt || null,
    },
    update: {
      status: newStatus,
      ...(customStatus !== undefined && { customStatus: customStatus || null }),
      ...(projectId !== undefined && { currentProjectId: projectId || null }),
      ...(area !== undefined && { currentArea: area || null }),
      ...(taskId !== undefined && { currentTaskId: taskId || null }),
      lastActivityAt: now,
      focusStartedAt: focusStartedAt || null,
    },
    include: {
      user: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
    },
  })

  // Get project name for broadcast
  let projectName: string | null = null
  if (presence.currentProjectId) {
    const project = await db.project.findUnique({
      where: { id: presence.currentProjectId },
      select: { name: true },
    })
    projectName = project?.name || null
  }

  // Broadcast presence update via Pusher
  await broadcastPresenceUpdate({
    userId,
    status: newStatus,
    customStatus: presence.customStatus,
    projectId: presence.currentProjectId,
    projectName,
    area: presence.currentArea,
    userName: presence.user.name,
    avatarUrl: presence.user.avatarUrl,
    lastActivityAt: now,
  })
}

// =============================================================================
// Presence Broadcasting
// =============================================================================

interface PresencePayload {
  userId: string
  status: PresenceStatus
  customStatus: string | null
  projectId: string | null
  projectName: string | null
  area: string | null
  userName: string | null
  avatarUrl: string | null
  lastActivityAt: Date
}

/**
 * Broadcast presence update to all subscribed clients
 */
async function broadcastPresenceUpdate(payload: PresencePayload): Promise<void> {
  const pusher = getPusher()

  // Broadcast to presence channel (clients watching this user)
  await pusher.trigger(`presence-${payload.userId}`, "status:changed", {
    ...payload,
    lastActivityAt: payload.lastActivityAt.toISOString(),
  })
}

// =============================================================================
// Presence Queries
// =============================================================================

/**
 * Get current presence for a user
 */
export async function getPresence(userId: string) {
  const presence = await db.userPresence.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          avatarUrl: true,
          workingHoursStart: true,
          workingHoursEnd: true,
        },
      },
    },
  })

  if (!presence) {
    return null
  }

  // Recalculate status in case it's stale
  const currentStatus = calculatePresenceStatus({
    lastActivityAt: presence.lastActivityAt,
    focusStartedAt: presence.focusStartedAt,
    workingHoursStart: presence.user.workingHoursStart,
    workingHoursEnd: presence.user.workingHoursEnd,
  })

  return {
    ...presence,
    calculatedStatus: currentStatus,
  }
}

/**
 * Get presence for multiple users (e.g., for a project team)
 */
export async function getMultiplePresence(userIds: string[]) {
  const presences = await db.userPresence.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
    },
  })

  return presences.map((p) => ({
    ...p,
    calculatedStatus: calculatePresenceStatus({
      lastActivityAt: p.lastActivityAt,
      focusStartedAt: p.focusStartedAt,
    }),
  }))
}

// =============================================================================
// Status Display Utilities
// =============================================================================

/**
 * Get display info for a presence status
 */
export function getStatusDisplay(status: PresenceStatus): {
  emoji: string
  label: string
  color: string
} {
  switch (status) {
    case PresenceStatus.ONLINE:
      return { emoji: "🟢", label: "Online", color: "text-green-500" }
    case PresenceStatus.AWAY:
      return { emoji: "🟡", label: "Away", color: "text-yellow-500" }
    case PresenceStatus.OFFLINE:
      return { emoji: "🔴", label: "Offline", color: "text-gray-500" }
    case PresenceStatus.DEEP_WORK:
      return { emoji: "🎯", label: "Deep Work", color: "text-purple-500" }
    case PresenceStatus.IN_MEETING:
      return { emoji: "📞", label: "In Meeting", color: "text-blue-500" }
    case PresenceStatus.AFTER_HOURS:
      return { emoji: "💤", label: "After Hours", color: "text-gray-400" }
    case PresenceStatus.CUSTOM:
      return { emoji: "✨", label: "Custom", color: "text-indigo-500" }
    default:
      return { emoji: "⚪", label: "Unknown", color: "text-gray-400" }
  }
}

/**
 * Format presence for client display
 */
export function formatPresenceMessage(presence: {
  status: PresenceStatus
  customStatus: string | null
  currentProjectId: string | null
  projectName?: string | null
  currentArea: string | null
}): string {
  const { emoji, label } = getStatusDisplay(presence.status)

  if (presence.customStatus) {
    return `${emoji} ${presence.customStatus}`
  }

  if (presence.projectName && presence.currentArea) {
    return `${emoji} Working on ${presence.projectName} → ${presence.currentArea}`
  }

  if (presence.projectName) {
    return `${emoji} Working on ${presence.projectName}`
  }

  return `${emoji} ${label}`
}
