export const dynamic = "force-dynamic"

import { ClientSidebar } from "@/components/client/client-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { SidebarWrapper } from "@/components/navigation/sidebar-wrapper"
import { ensureClientUser } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the client user
  const user = await ensureClientUser()

  // Fetch client's accessible projects
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

  const projects = clientAccess.map((access) => ({
    ...access.project,
    accessLevel: access.accessLevel,
    contractStatus: access.contractStatus,
  }))

  return (
    <SidebarWrapper>
      <ClientSidebar user={user} projects={projects} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarWrapper>
  )
}
