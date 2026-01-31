# Session Handoff: AX Layer Phase 4

## Project Context

**NERVE AGENT** is a project operating system for solo developers — combines project management, time tracking, client portals, code intelligence, and AI assistance into a single Next.js application.

**Tech stack:** Next.js 16 + React 19 + TypeScript, Prisma + PostgreSQL (Supabase), Clerk auth, Claude API, shadcn/ui, Tailwind CSS, deployed on Vercel.

**Key pattern:** Server Components by default, AX (Agent Experience) layer provides semantic DOM attributes and state graph for AI agent interaction.

---

## What We're Building

**AX (Agent Experience) Layer** — A system that enables AI agents to understand and interact with the Nerve Agent workspace through:
1. Semantic DOM attributes (`data-ax-*`) on interactive elements
2. A JSON state graph (`#ax-state-graph`) with workspace data
3. Staleness markers showing item age and attention needs
4. Relationship maps showing entity connections
5. User patterns for behavioral intelligence
6. Action confidence scoring
7. **[Next]** Agent scratchpad for persistent memory
8. **[Next]** Quiet signals for situational awareness

---

## Work Completed

### Phase 1: Foundation (Complete)
- `AXStateGraph` interface with user, workspace, currentView
- `AXStateProvider` component with hidden state graph div
- Intent vocabulary (`AXIntent`) for all interactive elements
- Context types for element locations
- `axAttrs()` helper for type-safe attributes

### Phase 2: Staleness + Relationships (Complete)
- `computeStaleness()` with context-aware attention reasons
- `buildRelationshipMap()` for entity connections
- `AXStalenessOverview` with critical items, stuck tasks
- Entity attributes on project/task/note/call/blocker components

### Phase 3: User Patterns + Action Confidence (Complete)
**Commit:** `4296fc1` - feat(ax): add user patterns and action confidence (Phase 3)

Created 4 new files:

| File | Purpose |
|------|---------|
| `tracking.ts` | Event tracking with localStorage persistence |
| `patterns.ts` | User pattern computation from events |
| `confidence.ts` | Action confidence scoring |
| `use-ax-tracking.ts` | React hook for component integration |

**Key Features:**
- **Event Tracking**: suggestions, features, notes, navigation, shortcuts, sessions
- **User Patterns**: activity rhythms, interaction tendencies, preferences, ignored items
- **Confidence Scoring**: weighted factors (pattern 25%, history 35%, context 25%, timing 15%)
- **State Integration**: `userPatterns` in state graph, hidden DOM element with pattern attributes
- **Auto-tracking**: Navigation changes tracked automatically, session lifecycle managed

---

## Current State

- **Git:** Clean, main branch, synced with origin
- **Latest commit:** `4296fc1` - feat(ax): add user patterns and action confidence (Phase 3)
- **Vercel:** Will deploy automatically
- **No uncommitted changes**

---

## Critical Files & Locations

```
apps/web/src/lib/ax/
├── index.ts              - Exports all AX modules
├── types.ts              - AXStateGraph, AXStalenessOverview, AXEntityProps, axAttrs()
├── staleness.ts          - computeStaleness(), STALENESS_THRESHOLDS
├── relationships.ts      - buildRelationshipMap(), AXRelationshipMap
├── tracking.ts           - trackAXEvent(), event storage, session tracking [NEW]
├── patterns.ts           - computeUserPatterns(), AXUserPatterns [NEW]
├── confidence.ts         - computeActionConfidence(), AXActionConfidence [NEW]
├── use-ax-tracking.ts    - useAXTracking() hook [NEW]
├── server.ts             - fetchAXExtendedData(), fetchAXWorkspaceData()
└── state-provider.tsx    - AXStateProvider, buildStateGraph(), pattern integration

apps/web/src/app/api/ax/state/route.ts  - GET /api/ax/state endpoint
apps/web/src/app/(dashboard)/layout.tsx - Dashboard layout with AXStateProvider
```

---

## Next Steps: Phase 4

### Phase 4: AX Presence — Agent Scratchpad + Quiet Signals

This phase gives agents persistent memory and situational awareness.

#### 1. Agent Scratchpad (`apps/web/src/lib/ax/scratchpad.ts`)

A private storage layer for agents to persist notes between sessions.

```typescript
interface AXScratchpad {
  version: number;
  lastUpdated: string;

  observations: {
    id: string;
    createdAt: string;
    expiresAt: string | null;
    category: 'user' | 'project' | 'pattern' | 'context' | 'reminder';
    content: string;
    confidence: number;
    source: string;
  }[];

  pendingActions: {
    id: string;
    action: string;
    reason: string;
    triggerCondition: string;
    createdAt: string;
    priority: 'low' | 'medium' | 'high';
  }[];

  conversationMemory: {
    lastTopics: string[];
    unresolvedQuestions: string[];
    userSentiment: 'positive' | 'neutral' | 'frustrated' | 'unknown';
    lastInteractionSummary: string;
  };

  projectNotes: {
    [projectId: string]: {
      agentSummary: string;
      knownRisks: string[];
      suggestedNextSteps: string[];
      userPreferencesForProject: string[];
    };
  };

  learnedPreferences: {
    preference: string;
    learnedFrom: string;
    learnedAt: string;
    confidence: number;
  }[];
}
```

**Functions to implement:**
- `getAXScratchpad(): AXScratchpad`
- `updateAXScratchpad(updates: Partial<AXScratchpad>): void`
- `addObservation(...)`, `addPendingAction(...)`
- `getProjectNotes(projectId)`, `updateProjectNotes(projectId, notes)`
- `clearExpiredObservations()`

**DOM exposure:**
```html
<div id="ax-scratchpad" data-ax-type="scratchpad" aria-hidden="true" style="display: none;">
  <script type="application/json" id="ax-scratchpad-read"><!-- JSON --></script>
  <textarea id="ax-scratchpad-write" data-ax-writable="true" style="display: none;"></textarea>
</div>
```

**Write listener:** MutationObserver on textarea, validate/merge/persist on changes.

#### 2. Quiet Signals (`apps/web/src/lib/ax/quiet-signals.ts`)

Real-time signals about user state for timing suggestions.

```typescript
interface AXQuietSignals {
  time: {
    currentHour: number;
    isQuietHours: boolean;
    isTypicalActiveTime: boolean;
    minutesSinceLastActivity: number;
  };

  flow: {
    isInFlow: boolean;
    flowStartedAt: string | null;
    flowDuration: number;
    actionVelocity: number;
    flowType: 'coding' | 'writing' | 'reviewing' | 'navigating' | 'unknown' | null;
  };

  interruptibility: {
    level: 'available' | 'focused' | 'deep-focus' | 'away';
    canInterrupt: boolean;
    shouldDefer: boolean;
    deferUntil: string | null;
    reason: string;
  };

  session: {
    startedAt: string;
    duration: number;
    pagesVisited: string[];
    actionsPerformed: number;
    isNewSession: boolean;
    isEndingSession: boolean;
  };

  attention: {
    currentFocus: string | null;
    focusDuration: number;
    recentFocusHistory: { entityId: string; duration: number }[];
    isMultitasking: boolean;
  };
}
```

**Flow detection thresholds:**
```typescript
const FLOW_THRESHOLDS = {
  minActionsForFlow: 5,
  flowWindowMinutes: 3,
  velocityForDeepFocus: 4, // actions/min
  velocityForFocus: 2
};
```

**DOM exposure on body:**
```html
<body
  data-ax-interruptibility="focused"
  data-ax-can-interrupt="true"
  data-ax-flow-state="true"
  data-ax-flow-type="writing"
  data-ax-flow-duration="12"
  data-ax-minutes-idle="0"
  data-ax-is-quiet-hours="false"
>
```

**Real-time updates:** 10-second interval + debounced updates on user actions.

#### 3. State Graph Extensions

Add to `AXStateGraph`:
```typescript
interface AXStateGraph {
  // ... existing ...
  scratchpad: {
    observationCount: number;
    pendingActionCount: number;
    hasUnresolvedQuestions: boolean;
    lastUserSentiment: string;
    recentObservations: AXScratchpad['observations']; // last 5
  };
  quietSignals: AXQuietSignals;
}
```

#### 4. Files to Create/Modify

**New files:**
- `apps/web/src/lib/ax/scratchpad.ts` — Scratchpad storage and management
- `apps/web/src/lib/ax/quiet-signals.ts` — Signal computation and flow detection

**Files to modify:**
- `apps/web/src/lib/ax/types.ts` — Add scratchpad and quietSignals to state graph
- `apps/web/src/lib/ax/state-provider.tsx` — Add scratchpad DOM, quiet signal updates
- `apps/web/src/lib/ax/index.ts` — Export new modules

---

## Environment & Setup

```bash
cd C:/Users/Owner/workspace/nerve-agent/apps/web

# Install deps
pnpm install

# Run dev server
pnpm dev

# Run validation (required before commit)
pnpm validate

# TypeScript only
pnpm typecheck
```

**Verify AX works:**
```bash
# Check state graph via API
curl -H "Cookie: <session>" https://nerve-agent.vercel.app/api/ax/state | jq '.userPatterns'

# Check DOM in browser console
JSON.parse(document.getElementById('ax-state-graph').textContent).userPatterns
document.getElementById('ax-user-patterns').dataset
```

---

## Gotchas & Warnings

- **Pre-commit hooks:** Husky runs typecheck + lint before commit; pre-push runs full build
- **localStorage limits:** Scratchpad should auto-prune old observations (implement TTL)
- **State graph debouncing:** 150ms debounce on updates in provider
- **Quiet signals interval:** Don't update too frequently (10s minimum)
- **Flow detection:** Uses recent events from tracking system — ensure tracking is running

---

## User Preferences

- **Autonomous execution:** Don't ask questions — make decisions and execute
- **No time estimates:** Never predict how long tasks will take
- **Quality bar:** Production-ready code, no TODOs left behind
- **Commit style:** Conventional commits with Co-Authored-By footer
- **Run validation:** Always run `pnpm validate` before committing
- **Push after commit:** Push completed work to remote

---

## Full AX System Summary

After all 4 phases, Nerve Agent will have:

| Layer | Purpose | Key Data |
|-------|---------|----------|
| **State Graph** | What exists | Projects, tasks, notes, calls, inbox |
| **Intent Signals** | What actions do | `data-ax-intent` on all interactives |
| **Staleness** | What's old | Stale levels, attention reasons |
| **Relationships** | What's connected | Entity links, blocker impact |
| **User Patterns** | Who the user is | Preferences, rhythms, tendencies |
| **Confidence** | How sure to be | Scores, reasoning, behavior hints |
| **Scratchpad** | Agent memory | Observations, pending actions, learned prefs |
| **Quiet Signals** | When to engage | Flow state, interruptibility, timing |

The agent becomes fully *situated* — aware of state, history, relationships, user patterns, and the right moment to act.

---

## Request for Phase 4

Implement the Agent Scratchpad and Quiet Signals as described above. The AX layer currently has read capabilities (state graph, patterns, confidence). Phase 4 adds:
1. **Agent memory** — Scratchpad for persistent observations and pending actions
2. **Situational awareness** — Flow detection, interruptibility levels, timing signals

Start with `scratchpad.ts`, then `quiet-signals.ts`, then integrate into state provider.
