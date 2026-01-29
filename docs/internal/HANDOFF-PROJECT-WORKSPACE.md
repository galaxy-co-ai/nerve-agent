# Session Handoff: Project Workspace UI

## Project Context

- **NERVE AGENT** is a "Project Operating System" for solo developers/designers
- Tech stack: Next.js 15 + React 19 + TypeScript, shadcn/ui, Prisma + PostgreSQL, Clerk auth, Anthropic Claude API, Tailwind CSS
- The project framework templates are at `C:\Users\Owner\workspace\Project_Framework\`

---

## What Was Accomplished This Session

### Framework Overhaul Complete

We completely restructured the project framework templates based on the user's actual workflow:

**New/Updated Files:**

| File | Status | Description |
|------|--------|-------------|
| `FRAMEWORK.md` | NEW | Overview of entire process with visual flow diagram |
| `CLAUDE-TEMPLATE.md` | NEW | Template for per-project CLAUDE.md files |
| `01-idea-audit-template.md` | NEW | Market validation, competitor analysis, go/no-go |
| `02-project-brief-template.md` | Renamed | Was 01 |
| `03-prd-template.md` | Renamed | Was 02 |
| `04-tad-template.md` | Renamed | Was 03 |
| `05-ai-collaboration-protocol-template.md` | NEW | Replaces Agent Crew Spec - defines how user + Claude work |
| `06-mts-template.md` | NEW | Restructured: Phases → Checkpoints → Objectives → Steps |
| `07-test-plan-template.md` | Renamed | Was 06 |
| `08-audit-checklist-template.md` | NEW | Updated for new doc structure |
| `09-decision-log-template.md` | Renamed | Was 08 |
| `10-project-pulse-template.md` | NEW | Added time tracking, session logs |
| `11-ship-checklist-template.md` | Renamed | Was 10 |
| `12-retrospective-template.md` | NEW | Post-ship learning and framework improvement |

**Deleted:**
- `04-agent-crew-spec-template.md` (replaced by AI Collaboration Protocol)

---

## The Project Workspace UI Vision

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NERVE AGENT                                     │
├─────────┬───────────────────────────────────────────────┬───────────────────┤
│         │                                               │ [Framework] [Prog]│
│         │                                               │ [Tech Stack][Notes│
│         │                                               ├───────────────────┤
│ Sidebar │         Active Document View                  │                   │
│  (nav)  │     (Claude fills out documents here)         │  Right Drawer     │
│         │                                               │  (tabbed views)   │
│         │                                               │                   │
│         │                                               │                   │
│         ├───────────────────────────────────────────────┤                   │
│         │                                               │                   │
│         │         Claude Chat Panel                     │                   │
│         │         (docked at bottom)                    │                   │
│         │                                               │                   │
└─────────┴───────────────────────────────────────────────┴───────────────────┘
```

### Right Drawer Tabs

1. **Framework** - Document tree with completion status
   - Shows all phases and their templates
   - Green checkmark when doc is complete/locked
   - Empty checkbox when pending
   - Click to open doc in main view

2. **Progress** - Live roadmap visualization
   - Phases → Checkpoints → Objectives → Steps
   - Current position highlighted
   - Auto time tracking (starts when checkpoint begins, stops when complete)
   - Shows: Estimated | Elapsed | Remaining

3. **Tech Stack** - Quick reference
   - Pulled from TAD Section "Tech Stack"
   - Editable during planning phase
   - Locked after audit passes

4. **Notes** - Scratchpad for user + Claude
   - Can be used during any session
   - Tagged by phase/checkpoint for context
   - Used later for retrospective/training

### Main View States

1. **Document View** - When working on framework docs
   - Full document rendered
   - Claude fills sections while user watches
   - Section-by-section approval flow

2. **Code View** - When implementing
   - File tree + editor
   - Claude writes code while user observes
   - Inline chat for questions

3. **Empty State** - Project just started
   - "Begin Idea Audit" CTA
   - Brief explanation of the framework

### Claude Chat Panel

- Docked at bottom of main view
- Collapsible (can minimize to a bar)
- Full conversation history
- Follows AI Collaboration Protocol patterns
- Shows current task/objective context

---

## Time Tracking Behavior

**Automatic:**
- Timer starts when user begins a checkpoint
- Timer pauses when session ends (based on Project Pulse session log)
- Timer stops when checkpoint is marked complete
- All times saved to database

**Display:**
- Current checkpoint: Elapsed | Estimated | Variance
- Per-checkpoint history in Progress tab
- Total project time in Project Pulse

---

## Database Schema Additions Needed

```prisma
model ProjectFrameworkDoc {
  id          String   @id @default(cuid())
  projectId   String
  docNumber   Int      // 01-12
  docName     String   // "idea-audit", "project-brief", etc.
  content     String   @db.Text
  status      String   @default("draft") // draft | locked
  lockedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project     Project  @relation(fields: [projectId], references: [id])
}

model ProjectCheckpoint {
  id            String   @id @default(cuid())
  projectId     String
  checkpointId  String   // "CP-1.1", "CP-2.3", etc.
  name          String
  phase         Int
  status        String   @default("pending") // pending | in_progress | complete
  estimatedTime Int?     // minutes
  actualTime    Int?     // minutes
  startedAt     DateTime?
  completedAt   DateTime?

  project       Project  @relation(fields: [projectId], references: [id])
  sessions      CheckpointSession[]
  objectives    ProjectObjective[]
}

model CheckpointSession {
  id            String   @id @default(cuid())
  checkpointId  String
  startedAt     DateTime
  endedAt       DateTime?
  duration      Int?     // minutes
  notes         String?

  checkpoint    ProjectCheckpoint @relation(fields: [checkpointId], references: [id])
}

model ProjectObjective {
  id            String   @id @default(cuid())
  checkpointId  String
  objectiveId   String   // "1.1.1", "2.3.2", etc.
  name          String
  acceptance    String
  status        String   @default("pending")

  checkpoint    ProjectCheckpoint @relation(fields: [checkpointId], references: [id])
  steps         ProjectStep[]
}

model ProjectStep {
  id            String   @id @default(cuid())
  objectiveId   String
  stepId        String   // "1.1.1.1", "2.3.2.4", etc.
  action        String
  acceptance    String
  status        String   @default("pending") // pending | complete
  completedAt   DateTime?

  objective     ProjectObjective @relation(fields: [objectiveId], references: [id])
}

model ProjectNote {
  id            String   @id @default(cuid())
  projectId     String
  checkpointId  String?  // optional association
  author        String   // "user" or "claude"
  content       String   @db.Text
  createdAt     DateTime @default(now())

  project       Project  @relation(fields: [projectId], references: [id])
}
```

---

## Implementation Order

### Phase 1: Data Layer
1. Add Prisma schema changes
2. Run migrations
3. Create API routes for CRUD operations

### Phase 2: Right Drawer
1. Create drawer component with 4 tabs
2. Implement Framework tab (doc tree)
3. Implement Progress tab (roadmap view)
4. Implement Tech Stack tab
5. Implement Notes tab

### Phase 3: Main View
1. Create document viewer component
2. Integrate with Claude API for document completion
3. Add section-by-section approval flow

### Phase 4: Chat Panel
1. Create docked chat component
2. Connect to existing Claude API patterns
3. Add context awareness (current checkpoint/doc)

### Phase 5: Time Tracking
1. Implement auto-start/stop logic
2. Add session logging
3. Build time display components

---

## Key Files to Reference

**Existing patterns:**
- `apps/web/src/components/features/ai-focus-wizard.tsx` - AI component pattern
- `apps/web/src/components/features/ai-qa.tsx` - Claude conversation pattern
- `apps/web/src/app/api/ai/focus-plan/route.ts` - Claude API route pattern
- `apps/web/src/app/(dashboard)/projects/[slug]/page.tsx` - Current project page (to be redesigned)

**Vision docs:**
- `docs/VISION.md` - Full product vision
- `docs/USER-FLOWS.md` - User journey documentation
- `specs/02-sprint-stack.md` - Sprint execution spec
- `specs/11-daily-driver.md` - Daily workspace patterns

**Framework templates:**
- `C:\Users\Owner\workspace\Project_Framework\` - All 14 template files

---

## User Preferences (from interview)

- UI style: Minimal, dark mode, keyboard-first, "dense but breathable"
- No emojis unless explicitly requested
- Opinionated over flexible - make decisions for the user
- Code style: Keep it simple, don't over-engineer
- The floating chat being draggable is NOT essential - docked panel is preferred
- Time tracking should be automatic, not manual

---

## Critical Design Principle

From the vision doc:
> "No decision-making. Just execute."

The workspace should surface exactly what the user needs to work on, with zero friction to start. The framework documents eliminate all ambiguity. The UI should make following the framework effortless.

---

## Next Steps for New Session

1. Read this handoff
2. Review the new framework templates (especially FRAMEWORK.md for the flow)
3. Read the NERVE AGENT vision docs
4. Start with Phase 1: Data Layer (Prisma schema)
5. Build the UI incrementally

---

## Environment & Setup

```bash
cd C:\Users\Owner\workspace\nerve-agent\apps\web

# Install deps (if needed)
npm install

# Run dev server
npm run dev

# Prisma commands
npx prisma studio      # View database
npx prisma db push     # Push schema changes
npx prisma generate    # Regenerate client

# Validate before commit
npm run typecheck
npm run validate
```

---

**End of Handoff**
