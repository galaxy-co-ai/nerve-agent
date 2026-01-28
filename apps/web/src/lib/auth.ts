import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "./db"

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  return db.user.findUnique({
    where: { id: userId },
  })
}

export async function syncUser() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) return null

  const user = await db.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email,
      name: clerkUser.fullName || clerkUser.firstName || null,
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,
      email,
      name: clerkUser.fullName || clerkUser.firstName || null,
      avatarUrl: clerkUser.imageUrl,
    },
  })

  return user
}

export async function requireUser() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  let user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    user = await syncUser()
  }

  if (!user) {
    throw new Error("Failed to sync user")
  }

  return user
}
