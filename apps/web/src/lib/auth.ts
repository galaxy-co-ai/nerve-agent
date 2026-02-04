import { db } from "./db"
import { seedNoteFoldersForUser } from "./seed-folders"
import { UserRole } from "@prisma/client"

// Dev user - consistent across sessions (role: DEV)
const DEV_USER = {
  id: "dev_user_001",
  email: "dev@nerve-agent.local",
  name: "Dev User",
  avatarUrl: null,
  role: "DEV" as UserRole,
  invitedByUserId: null,
  defaultView: "daily",
  theme: "dark",
  weekStartsOn: 1,
  workingHoursStart: "09:00",
  workingHoursEnd: "17:00",
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Demo client user for testing client portal
const DEMO_CLIENT = {
  id: "demo_client_001",
  email: "investor@demo.local",
  name: "Demo Investor",
  avatarUrl: null,
  role: "CLIENT" as UserRole,
  invitedByUserId: "dev_user_001",
  defaultView: "daily",
  theme: "dark",
  weekStartsOn: 1,
  workingHoursStart: "09:00",
  workingHoursEnd: "17:00",
  createdAt: new Date(),
  updatedAt: new Date(),
}

async function ensureDevUser() {
  // Try to find existing dev user
  let user = await db.user.findUnique({
    where: { id: DEV_USER.id },
  })

  if (!user) {
    // Create if doesn't exist
    try {
      user = await db.user.create({
        data: {
          id: DEV_USER.id,
          email: DEV_USER.email,
          name: DEV_USER.name,
        },
      })
      // Seed default note folders for new user
      await seedNoteFoldersForUser(user.id)
    } catch {
      // If create fails (race condition), try to fetch again
      user = await db.user.findUnique({
        where: { id: DEV_USER.id },
      })
    }
  }

  return user || DEV_USER
}

export async function getCurrentUser() {
  return ensureDevUser()
}

export async function syncUser() {
  return ensureDevUser()
}

export async function requireUser() {
  return ensureDevUser()
}

// ============================================================================
// Role-based auth utilities (Client Portal v2)
// ============================================================================

/**
 * Get user with role information
 */
export async function getUserWithRole() {
  const user = await ensureDevUser()
  return user
}

/**
 * Require user to have DEV role
 */
export async function requireDevUser() {
  const user = await ensureDevUser()
  if (user.role !== "DEV") {
    throw new Error("Unauthorized: DEV role required")
  }
  return user
}

/**
 * Get client user (for testing client portal)
 */
export async function ensureClientUser() {
  let user = await db.user.findUnique({
    where: { id: DEMO_CLIENT.id },
  })

  if (!user) {
    try {
      user = await db.user.create({
        data: {
          id: DEMO_CLIENT.id,
          email: DEMO_CLIENT.email,
          name: DEMO_CLIENT.name,
          role: DEMO_CLIENT.role,
          invitedByUserId: DEMO_CLIENT.invitedByUserId,
        },
      })
    } catch {
      user = await db.user.findUnique({
        where: { id: DEMO_CLIENT.id },
      })
    }
  }

  return user || DEMO_CLIENT
}

/**
 * Require user to have CLIENT role
 */
export async function requireClientUser() {
  const user = await ensureClientUser()
  if (user.role !== "CLIENT") {
    throw new Error("Unauthorized: CLIENT role required")
  }
  return user
}

/**
 * Check if current user has access to a project (for clients)
 */
export async function checkProjectAccess(userId: string, projectId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) return false

  // DEV users have access to all their projects
  if (user.role === "DEV") {
    const project = await db.project.findFirst({
      where: { id: projectId, userId },
    })
    return !!project
  }

  // CLIENT users need explicit access
  const access = await db.clientProjectAccess.findFirst({
    where: {
      projectId,
      client: {
        // Client email must match user email
        email: (await db.user.findUnique({ where: { id: userId } }))?.email,
      },
    },
  })
  return !!access
}
