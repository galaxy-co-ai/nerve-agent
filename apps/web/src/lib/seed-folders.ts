import { db } from "./db"

/**
 * Default system folders for every user's note organization
 */
export const DEFAULT_NOTE_FOLDERS = [
  { name: "Inbox", slug: "inbox", icon: "inbox", order: 0, isSystem: true },
  { name: "Ideas", slug: "ideas", icon: "lightbulb", order: 1, isSystem: true },
  { name: "Research", slug: "research", icon: "book-open", order: 2, isSystem: true },
  { name: "Decisions", slug: "decisions", icon: "scale", order: 3, isSystem: true },
  { name: "Processes", slug: "processes", icon: "list-checks", order: 4, isSystem: true },
  { name: "Learnings", slug: "learnings", icon: "graduation-cap", order: 5, isSystem: true },
  { name: "Archive", slug: "archive", icon: "archive", order: 99, isSystem: true },
] as const

/**
 * Seeds the default note folders for a user.
 * Safe to call multiple times - will skip existing folders.
 */
export async function seedNoteFoldersForUser(userId: string): Promise<void> {
  // Check if user already has folders
  const existingFolders = await db.noteFolder.findMany({
    where: { userId },
    select: { slug: true },
  })

  const existingSlugs = new Set(existingFolders.map((f) => f.slug))

  // Only create folders that don't exist
  const foldersToCreate = DEFAULT_NOTE_FOLDERS.filter(
    (folder) => !existingSlugs.has(folder.slug)
  )

  if (foldersToCreate.length === 0) {
    return // All folders already exist
  }

  await db.noteFolder.createMany({
    data: foldersToCreate.map((folder) => ({
      userId,
      name: folder.name,
      slug: folder.slug,
      icon: folder.icon,
      order: folder.order,
      isSystem: folder.isSystem,
    })),
  })
}

/**
 * Backfill default folders for all existing users who don't have them.
 * Returns the number of users that were backfilled.
 */
export async function backfillNoteFoldersForAllUsers(): Promise<number> {
  // Find users who don't have an Inbox folder (our canary)
  const usersWithoutFolders = await db.user.findMany({
    where: {
      noteFolders: {
        none: {
          slug: "inbox",
        },
      },
    },
    select: { id: true },
  })

  let backfilledCount = 0

  for (const user of usersWithoutFolders) {
    await seedNoteFoldersForUser(user.id)
    backfilledCount++
  }

  return backfilledCount
}

/**
 * Get the Inbox folder ID for a user.
 * Creates default folders if they don't exist.
 */
export async function getInboxFolderId(userId: string): Promise<string> {
  let inboxFolder = await db.noteFolder.findFirst({
    where: { userId, slug: "inbox" },
    select: { id: true },
  })

  if (!inboxFolder) {
    // Seed folders if missing
    await seedNoteFoldersForUser(userId)
    inboxFolder = await db.noteFolder.findFirst({
      where: { userId, slug: "inbox" },
      select: { id: true },
    })
  }

  if (!inboxFolder) {
    throw new Error(`Failed to create Inbox folder for user ${userId}`)
  }

  return inboxFolder.id
}
