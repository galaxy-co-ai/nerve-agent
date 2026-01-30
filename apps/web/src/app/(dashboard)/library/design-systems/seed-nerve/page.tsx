import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { seedNerveDesignSystem } from "@/lib/seed/seed-nerve-design-system"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SeedNerveButton } from "./seed-button"

export default async function SeedNervePage() {
  const user = await requireUser()

  async function seedNerve() {
    "use server"
    const user = await requireUser()
    await seedNerveDesignSystem(user.id)
    redirect("/library/design-systems/nerve")
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Seed NERVE Design System</CardTitle>
          <CardDescription>
            This will create the NERVE design system in your library with all colors, components, primitives, and utilities pre-populated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeedNerveButton action={seedNerve} />
        </CardContent>
      </Card>
    </div>
  )
}
