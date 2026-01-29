"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { FrameworkTab } from "./framework-tab"
import { ProgressTab } from "./progress-tab"
import { TechStackTab } from "./tech-stack-tab"
import { NotesTab } from "./notes-tab"
import type { FrameworkDoc, CheckpointWithDetails } from "@/lib/types/workspace"
import type { ProjectWorkspaceNote } from "@prisma/client"

interface WorkspaceDrawerProps {
  projectSlug: string
  frameworkDocs: FrameworkDoc[]
  checkpoints: CheckpointWithDetails[]
  techStack: string | null
  notes: ProjectWorkspaceNote[]
  onDocSelect: (docNumber: number) => void
  currentDocNumber: number | null
}

export function WorkspaceDrawer({
  projectSlug,
  frameworkDocs,
  checkpoints,
  techStack,
  notes,
  onDocSelect,
  currentDocNumber,
}: WorkspaceDrawerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("framework")

  if (isCollapsed) {
    return (
      <div className="flex h-full w-10 flex-col border-l border-border/40 bg-background">
        <Button
          variant="ghost"
          size="icon"
          className="m-1"
          onClick={() => setIsCollapsed(false)}
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-border/40 bg-background">
      <div className="flex h-12 items-center justify-between border-b border-border/40 px-3">
        <span className="text-sm font-medium">Workspace</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsCollapsed(true)}
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-2 mt-2 grid w-auto grid-cols-4">
          <TabsTrigger value="framework" className="text-xs">
            Framework
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs">
            Progress
          </TabsTrigger>
          <TabsTrigger value="tech" className="text-xs">
            Tech
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="framework" className="mt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <FrameworkTab
                frameworkDocs={frameworkDocs}
                onDocSelect={onDocSelect}
                currentDocNumber={currentDocNumber}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="progress" className="mt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <ProgressTab
                projectSlug={projectSlug}
                checkpoints={checkpoints}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tech" className="mt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <TechStackTab techStack={techStack} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="mt-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <NotesTab projectSlug={projectSlug} notes={notes} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
