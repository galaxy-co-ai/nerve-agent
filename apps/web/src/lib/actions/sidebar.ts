"use server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function getRecentProjects() {
  const user = await getCurrentUser()
  if (!user) return []

  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      name: true,
      slug: true,
      status: true,
    },
  })

  return projects.map((p) => ({
    name: p.name,
    url: `/projects/${p.slug}`,
    status: p.status,
  }))
}
