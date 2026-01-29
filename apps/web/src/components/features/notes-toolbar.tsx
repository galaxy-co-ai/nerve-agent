"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Sparkles, Search } from "lucide-react"
import { AddNoteDialog } from "@/components/dialogs/add-note-dialog"
import { BrainDumpDialog } from "@/components/dialogs/brain-dump-dialog"

interface Project {
  id: string
  name: string
}

interface NotesToolbarProps {
  projects: Project[]
  noteCount: number
  defaultQuery?: string
}

export function NotesToolbar({ projects, noteCount, defaultQuery }: NotesToolbarProps) {
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [brainDumpOpen, setBrainDumpOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            <Input
              name="q"
              placeholder="Search notes..."
              defaultValue={defaultQuery}
              className="pl-9"
            />
          </form>
        </div>

        {/* Note count */}
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {noteCount} note{noteCount !== 1 ? "s" : ""}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBrainDumpOpen(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4 text-orange-400" />
            Brain Dump
          </Button>
          <Button
            size="sm"
            onClick={() => setAddNoteOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Note
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        projects={projects}
      />
      <BrainDumpDialog
        open={brainDumpOpen}
        onOpenChange={setBrainDumpOpen}
      />
    </>
  )
}
