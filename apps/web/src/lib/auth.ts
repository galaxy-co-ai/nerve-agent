import { db } from "./db"

// Dev user - consistent across sessions
const DEV_USER = {
  id: "dev_user_001",
  email: "dev@nerve-agent.local",
  name: "Dev User",
  avatarUrl: null,
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
