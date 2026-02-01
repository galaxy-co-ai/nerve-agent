"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import { useNoteOrganization } from "@/hooks/use-note-organization"
import { NerveCard, NerveCardHeader, NerveCardTitle } from "@/components/nerve/components/nerve-card"
import { GripVertical } from "lucide-react"

interface DraggedNote {
  id: string
  title: string
}

interface NotesDndContextValue {
  isDragging: boolean
  draggedNote: DraggedNote | null
}

const NotesDndContext = createContext<NotesDndContextValue>({
  isDragging: false,
  draggedNote: null,
})

export function useNotesDnd() {
  return useContext(NotesDndContext)
}

interface NotesDndProviderProps {
  children: ReactNode
}

export function NotesDndProvider({ children }: NotesDndProviderProps) {
  const [draggedNote, setDraggedNote] = useState<DraggedNote | null>(null)
  const { moveToFolder } = useNoteOrganization()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === "note") {
      setDraggedNote({
        id: active.id as string,
        title: active.data.current.title,
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedNote(null)

    if (!over) return

    // Check if dropped on a folder
    if (over.data.current?.type === "folder") {
      const noteId = active.id as string
      const folderId = over.id as string

      try {
        await moveToFolder(noteId, folderId, false)
      } catch (error) {
        console.error("Failed to move note:", error)
      }
    }
  }

  return (
    <NotesDndContext.Provider value={{ isDragging: !!draggedNote, draggedNote }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {draggedNote && (
            <NerveCard elevation={3} className="w-64 opacity-90 rotate-2 shadow-2xl">
              <NerveCardHeader className="p-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-zinc-500" />
                  <NerveCardTitle className="text-sm line-clamp-1">
                    {draggedNote.title}
                  </NerveCardTitle>
                </div>
              </NerveCardHeader>
            </NerveCard>
          )}
        </DragOverlay>
      </DndContext>
    </NotesDndContext.Provider>
  )
}
