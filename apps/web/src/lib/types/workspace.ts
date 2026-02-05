import type {
  ProjectFrameworkDoc,
  ProjectCheckpoint,
  ProjectObjective,
  ProjectStep,
  CheckpointSession,
  FrameworkDocType,
  FrameworkDocStatus,
  CheckpointStatus,
  ObjectiveStatus,
  StepStatus,
} from "@prisma/client"

// Re-export enums for client use
export type {
  FrameworkDocType,
  FrameworkDocStatus,
  CheckpointStatus,
  ObjectiveStatus,
  StepStatus,
}

// Framework document with type info
export interface FrameworkDoc extends ProjectFrameworkDoc {
  docType: FrameworkDocType
  status: FrameworkDocStatus
}

// Checkpoint with nested data
export interface CheckpointWithDetails extends ProjectCheckpoint {
  objectives: ObjectiveWithSteps[]
  sessions: CheckpointSession[]
}

// Objective with steps
export interface ObjectiveWithSteps extends ProjectObjective {
  steps: ProjectStep[]
}

// Document metadata (for the Framework tab tree)
export interface FrameworkDocMeta {
  number: number
  type: FrameworkDocType
  name: string
  phase: number
  description: string
}

// All framework documents metadata
export const FRAMEWORK_DOCS: FrameworkDocMeta[] = [
  {
    number: 1,
    type: "IDEA_AUDIT",
    name: "Idea Audit",
    phase: 1,
    description: "Market validation and go/no-go decision",
  },
  {
    number: 2,
    type: "PROJECT_BRIEF",
    name: "Project Brief",
    phase: 2,
    description: "Problem, vision, scope, and constraints",
  },
  {
    number: 3,
    type: "PRD",
    name: "PRD",
    phase: 2,
    description: "Personas, user stories, features, acceptance criteria",
  },
  {
    number: 4,
    type: "TAD",
    name: "TAD",
    phase: 2,
    description: "Architecture, tech stack, components, APIs",
  },
  {
    number: 5,
    type: "AI_COLLAB_PROTOCOL",
    name: "AI Collaboration Protocol",
    phase: 2,
    description: "How you and Claude work together",
  },
  {
    number: 6,
    type: "MTS",
    name: "MTS",
    phase: 2,
    description: "Master Task Sequence: phases, checkpoints, objectives, steps",
  },
  {
    number: 7,
    type: "TEST_PLAN",
    name: "Test Plan",
    phase: 2,
    description: "Test strategy, coverage matrix, test cases",
  },
  {
    number: 8,
    type: "AUDIT_CHECKLIST",
    name: "Audit Checklist",
    phase: 3,
    description: "Verify all docs are 100% complete",
  },
  {
    number: 9,
    type: "DECISION_LOG",
    name: "Decision Log",
    phase: 4,
    description: "Track deviations during build",
  },
  {
    number: 10,
    type: "PROJECT_PULSE",
    name: "Project Pulse",
    phase: 4,
    description: "Current state for session resumption",
  },
  {
    number: 11,
    type: "SHIP_CHECKLIST",
    name: "Ship Checklist",
    phase: 5,
    description: "Final verification before deploy",
  },
  {
    number: 12,
    type: "RETROSPECTIVE",
    name: "Retrospective",
    phase: 6,
    description: "Post-ship learning and framework improvements",
  },
]

// Phase names
export const PHASE_NAMES: Record<number, string> = {
  1: "Validation",
  2: "Planning",
  3: "Validation Gate",
  4: "Execution",
  5: "Ship",
  6: "Learn",
}

// Helper to get docs by phase
export function getDocsByPhase(phase: number): FrameworkDocMeta[] {
  return FRAMEWORK_DOCS.filter((doc) => doc.phase === phase)
}

// Time formatting
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

// Calculate progress percentage
export function calculateProgress(checkpoints: CheckpointWithDetails[]): number {
  if (checkpoints.length === 0) return 0
  const completed = checkpoints.filter((c) => c.status === "COMPLETE").length
  return Math.round((completed / checkpoints.length) * 100)
}
