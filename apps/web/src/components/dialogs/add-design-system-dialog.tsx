"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createDesignSystem } from "@/lib/actions/design-system"

const defaultColors = [
  "#eab308", // Gold (NERVE default)
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#ef4444", // Red
  "#a855f7", // Purple
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#ec4899", // Pink
]

interface AddDesignSystemDialogProps {
  asCard?: boolean
}

export function AddDesignSystemDialog({ asCard }: AddDesignSystemDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedColor, setSelectedColor] = useState(defaultColors[0])

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      formData.set("coverColor", selectedColor)
      const result = await createDesignSystem(formData)
      setOpen(false)
      router.push(`/library/design-systems/${result.slug}`)
    } finally {
      setPending(false)
    }
  }

  const trigger = asCard ? (
    <Card className="overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:-translate-y-1 border-dashed">
      <CardContent className="aspect-square flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <Plus className="h-8 w-8 mb-2" />
        <span className="font-medium">New Design System</span>
      </CardContent>
    </Card>
  ) : (
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      New Design System
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Design System</DialogTitle>
            <DialogDescription>
              Start a new design system to organize your colors, typography, and components.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., NERVE, Minimal, Corporate"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="philosophy">Philosophy</Label>
              <Textarea
                id="philosophy"
                name="philosophy"
                placeholder="2-3 sentences describing the aesthetic vision..."
                className="min-h-[80px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                What feeling should this design system evoke?
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the design system..."
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Cover Color</Label>
              <div className="flex gap-2 flex-wrap">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="customColor" className="text-xs">Custom:</Label>
                <Input
                  id="customColor"
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">{selectedColor}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
              <Input
                id="coverImage"
                name="coverImage"
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Design System"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
