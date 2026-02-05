"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  LucideIcon,
} from "lucide-react"
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

interface HorizontalFolderRowProps {
  folders: FolderItem[]
  totalNoteCount: number
}

export function HorizontalFolderRow({ folders, totalNoteCount }: HorizontalFolderRowProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const searchParams = useSearchParams()
  const currentFolder = searchParams.get("folder")
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [isAutoArchiving, setIsAutoArchiving] = useState(false)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftArrow(container.scrollLeft > 0)
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    )
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
      return () => {
        container.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [folders])

  const scrollBy = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return
    const scrollAmount = 200
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

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

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 -mx-6 px-6 -mt-6 pt-6 pb-4">
      <div className="relative flex items-center gap-2">
        {/* Left scroll arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scrollBy("left")}
            className="absolute left-0 z-10 h-8 w-8 flex items-center justify-center bg-gradient-to-r from-background via-background to-transparent"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-400" />
          </button>
        )}

        {/* Scrollable folder row */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* All Notes chip */}
          <FolderChip
            href="/notes"
            icon={Folder}
            label="All Notes"
            count={totalNoteCount}
            isActive={!currentFolder}
          />

          {/* Divider */}
          <div className="h-6 w-px bg-border/40 shrink-0" />

          {/* Main folders */}
          {mainFolders.map((folder) => {
            const IconComponent = ICON_MAP[folder.icon || "folder"] || Folder
            return (
              <DroppableFolderChip
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

          {/* Archive chip with auto-archive button */}
          {archiveFolder && (
            <>
              <div className="h-6 w-px bg-border/40 shrink-0" />
              <div className="flex items-center gap-1 shrink-0">
                <DroppableFolderChip
                  folder={archiveFolder}
                  href={`/notes?folder=${archiveFolder.slug}`}
                  icon={Archive}
                  label={archiveFolder.name}
                  count={archiveFolder.noteCount}
                  isActive={currentFolder === archiveFolder.slug}
                  className="opacity-60 hover:opacity-100"
                />
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

          {/* Divider before add */}
          <div className="h-6 w-px bg-border/40 shrink-0" />

          {/* New Folder button */}
          <NerveButton
            variant="ghost"
            size="sm"
            className="shrink-0 text-zinc-500 hover:text-zinc-300 h-8 px-3"
            onClick={() => setIsNewFolderOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </NerveButton>
        </div>

        {/* Right scroll arrow */}
        {showRightArrow && (
          <button
            onClick={() => scrollBy("right")}
            className="absolute right-0 z-10 h-8 w-8 flex items-center justify-center bg-gradient-to-l from-background via-background to-transparent"
          >
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </button>
        )}
      </div>

      <NewFolderModal
        open={isNewFolderOpen}
        onOpenChange={setIsNewFolderOpen}
      />
    </div>
  )
}

interface FolderChipProps {
  href: string
  icon: LucideIcon
  label: string
  count: number
  isActive: boolean
  color?: string | null
  className?: string
}

function FolderChip({
  href,
  icon: Icon,
  label,
  count,
  isActive,
  color,
  className,
}: FolderChipProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all shrink-0",
        "border",
        isActive
          ? "bg-zinc-800 text-zinc-100 border-zinc-700"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border-transparent hover:border-zinc-800",
        className
      )}
    >
      <Icon
        className="h-3.5 w-3.5 shrink-0"
        style={color ? { color } : undefined}
      />
      <span className="whitespace-nowrap">{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "text-xs tabular-nums px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
            isActive ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800/50 text-zinc-500"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

interface DroppableFolderChipProps extends FolderChipProps {
  folder: FolderItem
}

function DroppableFolderChip({
  folder,
  href,
  icon: Icon,
  label,
  count,
  isActive,
  color,
  className,
}: DroppableFolderChipProps) {
  const { isDragging } = useNotesDnd()
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
    data: {
      type: "folder",
      name: label,
    },
  })

  return (
    <div ref={setNodeRef} className="shrink-0">
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
          "border",
          isActive
            ? "bg-zinc-800 text-zinc-100 border-zinc-700"
            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border-transparent hover:border-zinc-800",
          // Drag-over state
          isDragging && "ring-1 ring-zinc-700",
          isOver && "bg-zinc-700/50 ring-2 ring-primary scale-105 border-primary",
          className
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            isOver && "scale-110"
          )}
          style={color ? { color } : undefined}
        />
        <span className="whitespace-nowrap">{label}</span>
        {count > 0 && (
          <span
            className={cn(
              "text-xs tabular-nums px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
              isActive ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800/50 text-zinc-500"
            )}
          >
            {count}
          </span>
        )}
      </Link>
    </div>
  )
}
