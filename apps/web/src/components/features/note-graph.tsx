"use client"

import { useCallback, useMemo } from "react"
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import { useRouter } from "next/navigation"

interface NoteLink {
  id: string
  title: string
  slug: string
}

interface NoteGraphProps {
  currentNote: NoteLink
  outgoingLinks: NoteLink[] // Notes this note links to
  backlinks: NoteLink[] // Notes that link to this note
}

const nodeDefaults = {
  style: {
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
}

export function NoteGraph({ currentNote, outgoingLinks, backlinks }: NoteGraphProps) {
  const router = useRouter()

  // Calculate node positions in a circle around the center
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Current note at center
    nodes.push({
      id: currentNote.id,
      data: { label: currentNote.title, slug: currentNote.slug },
      position: { x: 250, y: 200 },
      style: {
        ...nodeDefaults.style,
        background: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        border: "2px solid hsl(var(--primary))",
      },
    })

    // All linked notes (combine and dedupe)
    const allLinkedNotes = new Map<string, { note: NoteLink; type: "outgoing" | "backlink" | "both" }>()

    outgoingLinks.forEach((note) => {
      allLinkedNotes.set(note.id, { note, type: "outgoing" })
    })

    backlinks.forEach((note) => {
      const existing = allLinkedNotes.get(note.id)
      if (existing) {
        existing.type = "both"
      } else {
        allLinkedNotes.set(note.id, { note, type: "backlink" })
      }
    })

    // Position linked notes in a circle
    const linkedNotes = Array.from(allLinkedNotes.values())
    const radius = 180
    const angleStep = (2 * Math.PI) / Math.max(linkedNotes.length, 1)

    linkedNotes.forEach(({ note, type }, index) => {
      const angle = angleStep * index - Math.PI / 2 // Start from top
      const x = 250 + radius * Math.cos(angle)
      const y = 200 + radius * Math.sin(angle)

      // Node styling based on relationship type
      let background = "hsl(var(--muted))"
      let borderColor = "hsl(var(--border))"

      if (type === "outgoing") {
        background = "hsl(var(--accent))"
        borderColor = "hsl(var(--accent-foreground) / 0.2)"
      } else if (type === "backlink") {
        background = "hsl(var(--secondary))"
        borderColor = "hsl(var(--secondary-foreground) / 0.2)"
      } else if (type === "both") {
        background = "hsl(var(--primary) / 0.2)"
        borderColor = "hsl(var(--primary))"
      }

      nodes.push({
        id: note.id,
        data: { label: note.title, slug: note.slug },
        position: { x, y },
        style: {
          ...nodeDefaults.style,
          background,
          color: "hsl(var(--foreground))",
          border: `1px solid ${borderColor}`,
        },
      })

      // Create edges
      if (type === "outgoing" || type === "both") {
        edges.push({
          id: `e-${currentNote.id}-${note.id}`,
          source: currentNote.id,
          target: note.id,
          animated: true,
          style: { stroke: "hsl(var(--primary))" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--primary))" },
        })
      }

      if (type === "backlink") {
        edges.push({
          id: `e-${note.id}-${currentNote.id}`,
          source: note.id,
          target: currentNote.id,
          animated: false,
          style: { stroke: "hsl(var(--muted-foreground))", strokeDasharray: "5,5" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--muted-foreground))" },
        })
      }
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [currentNote, outgoingLinks, backlinks])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.data.slug && node.id !== currentNote.id) {
        router.push(`/notes/${node.data.slug}`)
      }
    },
    [router, currentNote.id]
  )

  if (outgoingLinks.length === 0 && backlinks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">
          No linked notes. Use [[Note Title]] to create connections.
        </p>
      </div>
    )
  }

  return (
    <div className="h-80 w-full rounded-lg border bg-background overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--muted-foreground))" gap={16} size={1} />
        <Controls
          showZoom={false}
          showFitView={true}
          showInteractive={false}
          className="!bg-background !border-border"
        />
      </ReactFlow>
      <div className="flex gap-4 px-3 py-2 text-xs text-muted-foreground border-t">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          Current
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-accent" />
          Links to
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-secondary" />
          Links from
        </span>
      </div>
    </div>
  )
}
