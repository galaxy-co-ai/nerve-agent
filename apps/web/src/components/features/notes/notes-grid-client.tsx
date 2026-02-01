"use client"

import { ReactNode } from "react"
import { NotesDndProvider } from "./dnd-context"
import { DraggableNoteCard, NoteForCard } from "./draggable-note-card"
import {
  NerveCard,
  NerveCardContent,
} from "@/components/nerve/components/nerve-card"
import { FileText, Pin } from "lucide-react"

interface NotesGridClientProps {
  pinnedNotes: NoteForCard[]
  regularNotes: NoteForCard[]
  sidebar: ReactNode
  toolbar: ReactNode
  filterPills: ReactNode
  folderHeader: ReactNode
  folderPickerModal: ReactNode
}

export function NotesGridClient({
  pinnedNotes,
  regularNotes,
  sidebar,
  toolbar,
  filterPills,
  folderHeader,
  folderPickerModal,
}: NotesGridClientProps) {
  const hasNotes = pinnedNotes.length > 0 || regularNotes.length > 0

  return (
    <NotesDndProvider>
      <div className="flex flex-1 min-h-0">
        {sidebar}

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 p-6 min-w-0 overflow-y-auto">
          {toolbar}
          {filterPills}
          {folderHeader}

          {!hasNotes ? (
            <NerveCard elevation={1}>
              <NerveCardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-zinc-800 p-4 mb-4">
                  <FileText className="h-8 w-8 text-zinc-500" />
                </div>
                <h3 className="font-semibold mb-2 text-zinc-100">
                  No notes yet
                </h3>
                <p className="text-zinc-400 text-sm text-center max-w-sm">
                  Start writing in the composer above. Use [[wiki links]] to connect ideas.
                </p>
              </NerveCardContent>
            </NerveCard>
          ) : (
            <div className="space-y-6">
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    Pinned
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pinnedNotes.map((note) => (
                      <DraggableNoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notes */}
              {regularNotes.length > 0 && (
                <div className="space-y-3">
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-sm font-medium text-zinc-500">All Notes</h2>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {regularNotes.map((note) => (
                      <DraggableNoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {folderPickerModal}
    </NotesDndProvider>
  )
}
