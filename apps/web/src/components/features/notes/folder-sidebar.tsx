"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
  LucideIcon,
} from "lucide-react"
import { NerveButton } from "@/components/nerve/components/nerve-button"

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

export function FolderSidebar({ folders, totalNoteCount }: FolderSidebarProps) {
  const searchParams = useSearchParams()
  const currentFolder = searchParams.get("folder")

  // Separate archive from other folders
  const mainFolders = folders.filter((f) => f.slug !== "archive")
  const archiveFolder = folders.find((f) => f.slug === "archive")

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

        {/* Main folders */}
        {mainFolders.map((folder) => {
          const IconComponent = ICON_MAP[folder.icon || "folder"] || Folder
          return (
            <FolderLink
              key={folder.id}
              href={`/notes?folder=${folder.slug}`}
              icon={IconComponent}
              label={folder.name}
              count={folder.noteCount}
              isActive={currentFolder === folder.slug}
              color={folder.color}
            />
          )
        })}

        {/* Archive - separated */}
        {archiveFolder && (
          <>
            <div className="h-px bg-border/40 my-2" />
            <FolderLink
              href={`/notes?folder=${archiveFolder.slug}`}
              icon={Archive}
              label={archiveFolder.name}
              count={archiveFolder.noteCount}
              isActive={currentFolder === archiveFolder.slug}
              className="opacity-60 hover:opacity-100"
            />
          </>
        )}
      </nav>

      {/* New Folder button */}
      <div className="p-2 border-t border-border/40">
        <NerveButton
          variant="ghost"
          size="sm"
          className="w-full justify-start text-zinc-500 hover:text-zinc-300"
          disabled // TODO: Implement new folder dialog
        >
          <Plus className="h-4 w-4 mr-2" />
          New Folder
        </NerveButton>
      </div>
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
