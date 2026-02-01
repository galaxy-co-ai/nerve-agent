"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import {
  Inbox,
  Lightbulb,
  BookOpen,
  Scale,
  ListChecks,
  GraduationCap,
  Archive,
  Folder,
  Plus,
  MoreHorizontal,
  Trash2,
  GripVertical,
  Sparkles,
  Loader2,
  LucideIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NerveButton } from "@/components/nerve/components/nerve-button"
import { useNotesDnd } from "./dnd-context"
import { NewFolderModal } from "./new-folder-modal"
import { useToast } from "@/hooks/use-toast"

// Map icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  inbox: Inbox,
  lightbulb: Lightbulb,
  "book-open": BookOpen,
  scale: Scale,
  "list-checks": ListChecks,
  "graduation-cap": GraduationCap,
  archive: Archive,
  folder: Folder,
}

export interface FolderItem {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  isSystem: boolean
  order: number
  noteCount: number
}

interface FolderSidebarProps {
  folders: FolderItem[]
  totalNoteCount: number
}

export function FolderSidebar({ folders: initialFolders, totalNoteCount }: FolderSidebarProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const searchParams = useSearchParams()
  const currentFolder = searchParams.get("folder")
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [folders, setFolders] = useState(initialFolders)
  const [isAutoArchiving, setIsAutoArchiving] = useState(false)

  const handleAutoArchive = async () => {
    setIsAutoArchiving(true)
    try {
      const response = await fetch("/api/notes/auto-archive", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to auto-archive")
      }

      const result = await response.json()

      if (result.archivedCount === 0) {
        addToast({
          variant: "info",
          title: "No stale notes",
          description: "All your notes have been updated within the last 90 days.",
          duration: 3000,
        })
      } else {
        addToast({
          variant: "success",
          title: `Archived ${result.archivedCount} note${result.archivedCount > 1 ? "s" : ""}`,
          description: "Notes untouched for 90+ days moved to Archive.",
          duration: 4000,
        })
        router.refresh()
      }
    } catch (error) {
      addToast({
        variant: "error",
        title: "Auto-archive failed",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsAutoArchiving(false)
    }
  }

  // Separate archive from other folders
  const mainFolders = folders.filter((f) => f.slug !== "archive")
  const archiveFolder = folders.find((f) => f.slug === "archive")

  // Sensors for folder reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleFolderDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Only handle folder reordering (not note drops)
    if (active.data.current?.sortable) {
      const oldIndex = mainFolders.findIndex((f) => f.id === active.id)
      const newIndex = mainFolders.findIndex((f) => f.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newMainFolders = arrayMove(mainFolders, oldIndex, newIndex)
        const allFolders = archiveFolder
          ? [...newMainFolders, archiveFolder]
          : newMainFolders

        setFolders(allFolders)

        // Persist the new order
        try {
          const response = await fetch("/api/folders/reorder", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folderIds: allFolders.map((f) => f.id),
            }),
          })

          if (!response.ok) {
            // Revert on error
            setFolders(initialFolders)
          } else {
            router.refresh()
          }
        } catch {
          // Revert on error
          setFolders(initialFolders)
        }
      }
    }
  }

  return (
    <div className="w-56 shrink-0 border-r border-border/40 flex flex-col">
      <div className="p-4 border-b border-border/40">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Folders
        </h2>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {/* All Notes option */}
        <FolderLink
          href="/notes"
          icon={Folder}
          label="All Notes"
          count={totalNoteCount}
          isActive={!currentFolder}
        />

        <div className="h-px bg-border/40 my-2" />

        {/* Main folders - sortable */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleFolderDragEnd}
        >
          <SortableContext
            items={mainFolders.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {mainFolders.map((folder) => {
              const IconComponent = ICON_MAP[folder.icon || "folder"] || Folder
              return (
                <SortableFolderLink
                  key={folder.id}
                  folder={folder}
                  href={`/notes?folder=${folder.slug}`}
                  icon={IconComponent}
                  label={folder.name}
                  count={folder.noteCount}
                  isActive={currentFolder === folder.slug}
                  color={folder.color}
                />
              )
            })}
          </SortableContext>
        </DndContext>

        {/* Archive - separated, not sortable */}
        {archiveFolder && (
          <>
            <div className="h-px bg-border/40 my-2" />
            <div className="flex items-center gap-1">
              <div className="flex-1">
                <DroppableFolderLink
                  folder={archiveFolder}
                  href={`/notes?folder=${archiveFolder.slug}`}
                  icon={Archive}
                  label={archiveFolder.name}
                  count={archiveFolder.noteCount}
                  isActive={currentFolder === archiveFolder.slug}
                  className="opacity-60 hover:opacity-100"
                />
              </div>
              <button
                onClick={handleAutoArchive}
                disabled={isAutoArchiving}
                className={cn(
                  "p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                title="Auto-archive notes untouched for 90+ days"
              >
                {isAutoArchiving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </>
        )}
      </nav>

      {/* New Folder button */}
      <div className="p-2 border-t border-border/40">
        <NerveButton
          variant="ghost"
          size="sm"
          className="w-full justify-start text-zinc-500 hover:text-zinc-300"
          onClick={() => setIsNewFolderOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Folder
        </NerveButton>
      </div>

      <NewFolderModal
        open={isNewFolderOpen}
        onOpenChange={setIsNewFolderOpen}
      />
    </div>
  )
}

interface FolderLinkProps {
  href: string
  icon: LucideIcon
  label: string
  count: number
  isActive: boolean
  color?: string | null
  className?: string
}

function FolderLink({
  href,
  icon: Icon,
  label,
  count,
  isActive,
  color,
  className,
}: FolderLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
        className
      )}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        style={color ? { color } : undefined}
      />
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "text-xs tabular-nums",
            isActive ? "text-zinc-400" : "text-zinc-600"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

interface DroppableFolderLinkProps extends FolderLinkProps {
  folder: FolderItem
}

function DroppableFolderLink({
  folder,
  href,
  icon: Icon,
  label,
  count,
  isActive,
  color,
  className,
}: DroppableFolderLinkProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const { isDragging } = useNotesDnd()
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
    data: {
      type: "folder",
      name: label,
    },
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete folder")
      }

      const result = await response.json()

      addToast({
        variant: "success",
        title: `Deleted "${folder.name}"`,
        description: result.movedNotes > 0
          ? `${result.movedNotes} note${result.movedNotes > 1 ? "s" : ""} moved to Inbox`
          : undefined,
        duration: 3000,
      })

      setShowDeleteDialog(false)
      router.push("/notes")
      router.refresh()
    } catch (error) {
      addToast({
        variant: "error",
        title: "Failed to delete folder",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div ref={setNodeRef} className="group relative">
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
            isActive
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
            // Drag-over state
            isDragging && "ring-1 ring-zinc-700",
            isOver && "bg-zinc-700/50 ring-2 ring-primary scale-[1.02]",
            className
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isOver && "scale-110"
            )}
            style={color ? { color } : undefined}
          />
          <span className="flex-1 truncate">{label}</span>
          {count > 0 && (
            <span
              className={cn(
                "text-xs tabular-nums",
                isActive ? "text-zinc-400" : "text-zinc-600"
              )}
            >
              {count}
            </span>
          )}
        </Link>

        {/* Show menu for custom (non-system) folders */}
        {!folder.isSystem && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {folder.noteCount > 0 ? (
                <>
                  This folder contains {folder.noteCount} note{folder.noteCount > 1 ? "s" : ""}.
                  {" "}They will be moved to your Inbox.
                </>
              ) : (
                "This folder is empty and will be permanently deleted."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface SortableFolderLinkProps extends DroppableFolderLinkProps {}

function SortableFolderLink({
  folder,
  href,
  icon: Icon,
  label,
  count,
  isActive,
  color,
  className,
}: SortableFolderLinkProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const { isDragging: isNoteDragging } = useNotesDnd()

  // Droppable for note drops
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: folder.id,
    data: {
      type: "folder",
      name: label,
    },
  })

  // Sortable for folder reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: folder.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/folders/${folder.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete folder")
      }

      const result = await response.json()

      addToast({
        variant: "success",
        title: `Deleted "${folder.name}"`,
        description: result.movedNotes > 0
          ? `${result.movedNotes} note${result.movedNotes > 1 ? "s" : ""} moved to Inbox`
          : undefined,
        duration: 3000,
      })

      setShowDeleteDialog(false)
      router.push("/notes")
      router.refresh()
    } catch (error) {
      addToast({
        variant: "error",
        title: "Failed to delete folder",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Combine refs
  const setRefs = (node: HTMLDivElement | null) => {
    setDroppableRef(node)
    setSortableRef(node)
  }

  return (
    <>
      <div
        ref={setRefs}
        style={style}
        className={cn(
          "group relative",
          isSortableDragging && "opacity-50"
        )}
      >
        {/* Drag handle for reordering */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            "absolute -left-1 top-1/2 -translate-y-1/2 p-0.5 rounded",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300",
            "cursor-grab active:cursor-grabbing"
          )}
        >
          <GripVertical className="h-3 w-3" />
        </button>

        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
            isActive
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
            // Drag-over state (for note drops)
            isNoteDragging && "ring-1 ring-zinc-700",
            isOver && "bg-zinc-700/50 ring-2 ring-primary scale-[1.02]",
            className
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isOver && "scale-110"
            )}
            style={color ? { color } : undefined}
          />
          <span className="flex-1 truncate">{label}</span>
          {count > 0 && (
            <span
              className={cn(
                "text-xs tabular-nums",
                isActive ? "text-zinc-400" : "text-zinc-600"
              )}
            >
              {count}
            </span>
          )}
        </Link>

        {/* Show menu for custom (non-system) folders */}
        {!folder.isSystem && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {folder.noteCount > 0 ? (
                <>
                  This folder contains {folder.noteCount} note{folder.noteCount > 1 ? "s" : ""}.
                  {" "}They will be moved to your Inbox.
                </>
              ) : (
                "This folder is empty and will be permanently deleted."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
