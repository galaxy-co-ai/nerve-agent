export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { ClientSidebar } from "@/components/client/client-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarWrapper } from "@/components/navigation/sidebar-wrapper"
import { getCurrentUser, getOrgContext, hasRoleLevel } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, orgCtx] = await Promise.all([getCurrentUser(), getOrgContext()])

  if (!user) {
    redirect("/sign-in")
  }

  // Admin and Development roles see all projects
  // Member role sees only projects they have explicit access to
  let projects

  if (hasRoleLevel(orgCtx.orgRole, "org:development")) {
    // Admin/Development: fetch all projects
    const allProjects = await db.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        phase: true,
        health: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    projects = allProjects.map((project) => ({
      ...project,
      accessLevel: "FULL" as const,
      contractStatus: "ACTIVE" as const,
    }))
  } else {
    // Member: fetch only projects with explicit access
    const clientAccess = await db.clientProjectAccess.findMany({
      where: {
        client: {
          email: user.email,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            phase: true,
            health: true,
          },
        },
      },
    })

    projects = clientAccess.map((access) => ({
      ...access.project,
      accessLevel: access.accessLevel,
      contractStatus: access.contractStatus,
    }))
  }

  // Determine if user can toggle view mode (Admin/Development only)
  const canToggleView = hasRoleLevel(orgCtx.orgRole, "org:development")

  return (
    <SidebarWrapper>
      <ClientSidebar user={user} projects={projects} canToggleView={canToggleView} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarWrapper>
  )
}
