# Session Handoff: NERVE AGENT

**Date:** January 29, 2026
**Last Commit:** `dbf73fa` - fix: Add missing scroll-area and tabs UI components

---

## Project Context

**NERVE AGENT** is a "Project Operating System" for solo developers - an opinionated framework combining project management, time tracking, client portals, code intelligence, and AI assistance into a single application.

**Tech Stack:**
- Next.js 15 + React 19 + TypeScript
- shadcn/ui + Tailwind CSS + Radix + Framer Motion
- Prisma + PostgreSQL (Neon)
- Clerk authentication
- Claude API (Anthropic)
- Vercel hosting

**Repo:** `C:\Users\Owner\workspace\nerve-agent`

---

## Current State Assessment

### What's Built and Working

| Feature | Status | Notes |
|---------|--------|-------|
| Core dashboard | Done | Icon rail sidebar + floating dock UI |
| Projects CRUD | Done | Create, edit, list projects |
| Sprint/Task management | Done | Basic sprint stack with tasks |
| Time tracking | Done | Manual entries, editing |
| Notes system | Done | AI auto-title, tag suggestions, wiki links |
| Call Intelligence | Done | Transcript upload, AI processing, action items |
| Follow-up queue | Done | Created from calls, scheduling |
| Client portal | Done | Magic links, feedback collection |
| AI Focus Wizard | Done | Daily planning assistant |
| AI Q&A | Done | Context-aware questions |
| Library | Done | Code snippets with search |
| **Project Workspace UI** | **New** | Full UI scaffolded, needs integration |

### Project Workspace Components (New)

```
apps/web/src/components/workspace/
├── project-workspace.tsx    # Main layout with split view
├── document-generator.tsx   # AI document generation UI
├── document-viewer.tsx      # Markdown document viewer
├── workspace-drawer.tsx     # Right drawer container
├── workspace-chat.tsx       # Chat panel with Claude
├── framework-tab.tsx        # Document tree with status
├── progress-tab.tsx         # Checkpoint/objective tracking
├── tech-stack-tab.tsx       # Tech stack reference
├── notes-tab.tsx            # Scratchpad notes
└── index.ts                 # Exports
```

### Database Schema (Framework-related)

Already migrated and ready:
- `ProjectFrameworkDoc` - 12 document templates per project
- `ProjectCheckpoint` - MTS checkpoints with time tracking
- `CheckpointSession` - Work session logging
- `ProjectObjective` - Objectives within checkpoints
- `ProjectStep` - Steps within objectives
- `ProjectWorkspaceNote` - Scratchpad notes

### API Routes (Workspace)

```
/api/projects/[slug]/framework/           # CRUD for framework docs
/api/projects/[slug]/framework/generate/  # AI document generation
/api/projects/[slug]/checkpoints/         # Checkpoint management
/api/projects/[slug]/checkpoints/[id]/sessions/   # Session tracking
/api/projects/[slug]/checkpoints/[id]/objectives/ # Objectives
/api/projects/[slug]/checkpoints/[id]/steps/      # Steps
/api/projects/[slug]/workspace-notes/     # Scratchpad
```

---

## Items Needing Attention

### 1. Build Issue (FIXED)
- **Problem:** Missing `scroll-area` and `tabs` UI components
- **Solution:** Added components and dependencies in commit `dbf73fa`
- **Status:** Pushed, awaiting Vercel redeploy

### 2. Workspace Integration Testing
The workspace UI components are scaffolded but need real-world testing:
- Test document generation flow end-to-end
- Verify checkpoint time tracking auto-start/stop
- Test session persistence across page navigations
- Verify drawer tab state management

### 3. Framework Templates Need Content
The 12 framework document templates exist in `C:\Users\Owner\workspace\Project_Framework\` but aren't yet integrated into the AI generation prompts. The document generator needs to:
- Load template content as system prompts
- Guide Claude to fill each section
- Support section-by-section approval

### 4. Missing Entry Point
No clear "Start Workspace" button on the main project page. Users need a way to enter the workspace from `/projects/[slug]`.

### 5. Potential Type Issues
The workspace types are defined but may have mismatches:
- `lib/types/workspace.ts` - Verify all types match Prisma schema
- Document status enums need to match database

---

## Next Sprint: Workspace Polish & Integration

### Objective
Make the Project Workspace fully functional for real project planning workflows.

### Tasks

#### Phase 1: Entry & Navigation (Est: 2-3 hrs)
1. Add "Open Workspace" button on project detail page
2. Add workspace to project sidebar navigation
3. Create empty state for new projects (no docs yet)
4. Add "Begin Planning" CTA that starts Idea Audit

#### Phase 2: Document Generation Flow (Est: 4-6 hrs)
1. Integrate framework templates into generation prompts
2. Build section-by-section generation UI
3. Add "Approve Section" / "Regenerate" controls
4. Implement document locking when complete
5. Test with real project data

#### Phase 3: Progress Tracking (Est: 3-4 hrs)
1. Wire up checkpoint auto-start when user begins work
2. Implement session pause/resume
3. Add time display (Estimated | Elapsed | Variance)
4. Test session persistence

#### Phase 4: Chat Integration (Est: 2-3 hrs)
1. Connect workspace chat to Claude API
2. Add context awareness (current doc/checkpoint)
3. Implement chat history persistence
4. Add "Ask about this document" quick action

#### Phase 5: Testing & Polish (Est: 2-3 hrs)
1. End-to-end test full workflow
2. Fix edge cases and error states
3. Add loading states and transitions
4. Mobile responsiveness check

---

## Key Files to Reference

**Workspace components:**
- `src/components/workspace/project-workspace.tsx` - Main container
- `src/components/workspace/document-generator.tsx` - AI generation

**Existing AI patterns:**
- `src/components/features/ai-focus-wizard.tsx` - AI component pattern
- `src/components/features/ai-qa.tsx` - Conversation pattern
- `src/app/api/ai/focus-plan/route.ts` - Claude API pattern

**Framework templates:**
- `C:\Users\Owner\workspace\Project_Framework\FRAMEWORK.md` - Overview
- `C:\Users\Owner\workspace\Project_Framework\01-idea-audit-template.md` - First doc

**Vision docs:**
- `docs/VISION.md` - Product vision
- `docs/USER-FLOWS.md` - User journeys
- `HANDOFF-PROJECT-WORKSPACE.md` - Previous handoff with UI mockups

---

## Environment Setup

```bash
cd C:\Users\Owner\workspace\nerve-agent\apps\web

# Install dependencies
npm install

# Run dev server
npm run dev

# Database commands
npx prisma studio      # View data
npx prisma db push     # Push schema
npx prisma generate    # Regenerate client

# Validate before commit
npm run validate       # Full (tsc + build)
npm run validate:quick # TypeScript only
```

---

## User Preferences

- UI: Minimal, dark mode, keyboard-first
- No emojis unless requested
- Opinionated > flexible - make decisions for user
- Keep code simple, don't over-engineer
- Time tracking should be automatic
- Docked chat preferred over floating

---

## Design Principle

> "No decision-making. Just execute."

The workspace should surface exactly what to work on with zero friction. Framework documents eliminate ambiguity. The UI makes following the framework effortless.

---

## Quick Start for New Session

1. Read this handoff
2. Check Vercel deployment status (should be green now)
3. Run `npm run dev` and navigate to a project workspace
4. Pick a task from Phase 1 above
5. Reference existing patterns in the codebase

---

**End of Handoff**
