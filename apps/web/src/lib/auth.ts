import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { seedNoteFoldersForUser } from "./seed-folders"

// Organization roles (matches Clerk Dashboard config)
// Admin - you + investor (full dashboard access)
// Development - investor's dev team (technical access)
// Member - clients (read-only portal)
export type OrgRole = "org:admin" | "org:development" | "org:member"

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<OrgRole, number> = {
  "org:admin": 3,
  "org:development": 2,
  "org:member": 1,
}

/**
 * Get current authenticated user from Clerk and sync to database
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Find or create user in database
  let user = await db.user.findUnique({
    where: { id: clerkUser.id },
  })

  if (!user) {
    user = await db.user.create({
      data: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.username ?? "User",
        avatarUrl: clerkUser.imageUrl,
      },
    })

    // Seed default folders for new user
    await seedNoteFoldersForUser(user.id)
  }

  return user
}

/**
 * Require authenticated user - throws if not authenticated
 */
export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized: Authentication required")
  }

  return user
}

/**
 * Sync Clerk user data to database (call after profile updates)
 */
export async function syncUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const user = await db.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name:
        clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.username ?? "User",
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name:
        clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.username ?? "User",
      avatarUrl: clerkUser.imageUrl,
    },
  })

  return user
}

// ============================================================================
// Organization & Role utilities
// ============================================================================

/**
 * Get current user's organization context
 */
export async function getOrgContext() {
  const { userId, orgId, orgRole, orgSlug } = await auth()

  return {
    userId,
    orgId,
    orgRole: orgRole as OrgRole | null,
    orgSlug,
  }
}

/**
 * Require user to be in an organization
 */
export async function requireOrg() {
  const ctx = await getOrgContext()

  if (!ctx.userId) {
    throw new Error("Unauthorized: Authentication required")
  }

  if (!ctx.orgId) {
    throw new Error("Unauthorized: Organization membership required")
  }

  return ctx
}

/**
 * Check if user has at least the specified role level
 */
export function hasRoleLevel(userRole: OrgRole | null, requiredRole: OrgRole): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Require user to have at least the specified role
 */
export async function requireRole(minimumRole: OrgRole) {
  const ctx = await requireOrg()

  if (!hasRoleLevel(ctx.orgRole, minimumRole)) {
    throw new Error(`Unauthorized: ${minimumRole} or higher required`)
  }

  return ctx
}

// ============================================================================
// Convenience functions for common role checks
// ============================================================================

/**
 * Require admin role (you + investor - full access)
 */
export async function requireAdmin() {
  return requireRole("org:admin")
}

/**
 * Require development role or higher (dev team+)
 */
export async function requireDeveloper() {
  return requireRole("org:development")
}

/**
 * Require member role or higher (everyone in org)
 */
export async function requireMember() {
  return requireRole("org:member")
}

// ============================================================================
// Project access utilities
// ============================================================================

/**
 * Check if current user has access to a project
 * - Owner/Admin/Development: all projects in org
 * - Member: only projects they have explicit access to
 */
export async function checkProjectAccess(projectId: string): Promise<boolean> {
  const ctx = await getOrgContext()

  if (!ctx.userId || !ctx.orgId) return false

  // Owner, Admin, Development can access all org projects
  if (hasRoleLevel(ctx.orgRole, "org:development")) {
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        // Project must belong to someone in the org
        // For now, check if it belongs to the current user or they have access
      },
    })
    return !!project
  }

  // Members need explicit ClientProjectAccess
  const user = await getCurrentUser()
  if (!user) return false

  const access = await db.clientProjectAccess.findFirst({
    where: {
      projectId,
      client: {
        email: user.email,
      },
    },
  })

  return !!access
}

/**
 * Require access to a specific project
 */
export async function requireProjectAccess(projectId: string) {
  const hasAccess = await checkProjectAccess(projectId)

  if (!hasAccess) {
    throw new Error("Unauthorized: Project access required")
  }

  return true
}

// ============================================================================
// User info with role context
// ============================================================================

/**
 * Get user with their current org role
 */
export async function getUserWithRole() {
  const [user, ctx] = await Promise.all([getCurrentUser(), getOrgContext()])

  if (!user) return null

  return {
    ...user,
    orgId: ctx.orgId,
    orgRole: ctx.orgRole,
    orgSlug: ctx.orgSlug,
  }
}
