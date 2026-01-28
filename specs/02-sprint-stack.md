# Sprint Stack

## Overview

The Sprint Stack is the execution layer of Nerve Agent. Once the Planning Wizard generates your sprints, this is where you live during active development. Every task, every hour, every blocker—tracked and visible.

## Philosophy

- **Pre-planned, not reactive** — Sprints are generated from planning docs, not created on the fly
- **One task at a time** — Focus view shows only what matters right now
- **Time is truth** — Auto-tracked, not manually entered
- **Estimates learn** — AI adjusts future estimates based on actual performance

---

## Sprint Structure

### Sprint Metadata
```
Sprint {
  number: 1-N
  name: "Core Dashboard"
  phase: "SPRINT" | "REVIEW" | "COMPLETE"
  startDate: Date
  endDate: Date
  targetHours: number
  actualHours: number (auto-calculated)
  project: Project
}
```

### Task Structure
```
Task {
  title: string
  description: string
  estimatedHours: number (AI-adjusted)
  originalEstimate: number (your input)
  actualHours: number (auto-tracked)
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "COMPLETE"
  isAgentable: boolean
  agentType?: string
  blockerNotes?: string
  sprint: Sprint
  order: number
}
```

---

## Views

### Sprint Overview

```
SPRINT 2 — Core Dashboard                              Day 3 of 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROGRESS                                                    63%
[████████████████████░░░░░░░░░░░░]

HOURS                               8.5 / 13.5 hrs estimated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPLETED                                               6.0 hrs
✓ Customer portal layout                               3.5 hrs
✓ Project status components                            2.5 hrs

IN PROGRESS                                            ~3.0 hrs
● Scope tracker view                                   2.5 hrs tracked

REMAINING                                              ~4.5 hrs
○ Database view                                        ~2.0 hrs
○ Change log system                                    ~2.5 hrs

BLOCKED                                                     0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Focus View (Single Task)

```
NOW WORKING ON                                      2h 34m today
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scope tracker view
──────────────────────────────────────────────────────────────────
Build the scope tracker component that displays feature progress
with expand/collapse for sub-items.

Acceptance Criteria:
• Shows feature list with completion percentage
• Expand to see sub-features
• Links to related tasks
• Updates in real-time

Related Files:
• src/components/scope-tracker.tsx
• src/lib/scope-utils.ts

──────────────────────────────────────────────────────────────────
Estimated: ~3.0 hrs    Tracked: 2.5 hrs    Remaining: ~0.5 hrs

[Mark Complete]  [I'm Blocked]  [Take a Break]
```

### Kanban View (Optional)

```
TODO              IN PROGRESS       BLOCKED           COMPLETE
─────────────     ─────────────     ─────────────     ─────────────
○ Database        ● Scope           (empty)           ✓ Portal
  view              tracker                             layout
  ~2.0 hrs          2.5 hrs                            3.5 hrs

○ Change log                                          ✓ Status
  system                                                components
  ~2.5 hrs                                             2.5 hrs
```

---

## Adaptive Estimation

### How It Works

1. **Initial Estimate** — You provide when planning
2. **AI Adjustment** — System adjusts based on:
   - Your historical performance on similar tasks
   - Task complexity signals
   - Integration/dependency overhead
3. **Display Both** — Show original and adjusted

```
Task: Stripe Integration
Your estimate:     4.0 hrs
AI-adjusted:       5.5 hrs (+38%)

Reasoning:
• Your third-party integrations typically run 30% over
• First-time Stripe tasks average 1.4x estimate
• Similar task "PayPal Integration" took 6.2 hrs (est. 4.0)
```

### Learning Loop

After each task:
```
Task Complete: Stripe Integration

Your estimate:     4.0 hrs
AI estimate:       5.5 hrs
Actual time:       5.8 hrs

AI was 95% accurate. Updating model.

[Feedback: Was this task harder than expected?]
○ Yes, unforeseen complexity
○ No, just took the time it took
○ Yes, got distracted/interrupted
```

---

## Blockers

### Blocking a Task

```
I'M BLOCKED ON: Scope tracker view
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What's blocking you?
┌─────────────────────────────────────────────────────────────────┐
│ Waiting on API credentials from client                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Who is this blocked on?
○ Me (need to figure something out)
● Client (waiting for response)
○ Third Party (external dependency)

Expected resolution?
○ Today
● This week
○ Unknown

[Mark as Blocked]
```

### Blocker Dashboard

```
CURRENT BLOCKERS                                    2 active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Results Roofing — API Credentials           Blocked 3 days
   Waiting on: Client (Tareq)
   Last follow-up: 2 days ago
   [Send Follow-up]

⚠️ Galaxy Co — Design Approval                 Blocked 5 days
   Waiting on: Client (Sarah)
   Last follow-up: Today
   [View Email Thread]
```

---

## Agent-Able Tasks

### Identification

Tasks are flagged as agent-able when:
- Setup/configuration work (repo, project, integrations)
- Code generation from clear specs
- Repetitive patterns you've done before
- File organization/scaffolding

### Agent Execution

```
TASK: Set up Supabase project                        Agent-able ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This task can be completed automatically:
• Create Supabase project
• Configure auth settings
• Set up database tables from schema
• Add environment variables to Vercel

[Run Agent]  [Do It Manually]
```

### Agent Progress

```
AGENT RUNNING: Set up Supabase project
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Created Supabase project "results-roofing-prod"
✓ Configured email auth with magic links
✓ Applied database migrations (12 tables)
● Adding environment variables to Vercel...

[View Logs]  [Cancel]
```

---

## Sprint Transitions

### Completing a Sprint

```
SPRINT 2 COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY
Planned:    5 tasks, 13.5 hrs estimated
Completed:  5 tasks, 14.2 hrs actual
Accuracy:   95% (AI-adjusted estimates)

VELOCITY TREND
Sprint 1:   12.0 hrs estimated → 14.5 hrs actual (83%)
Sprint 2:   13.5 hrs estimated → 14.2 hrs actual (95%)
            ↑ Estimates improving!

CARRYOVER
No incomplete tasks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Start Sprint 3]  [View Sprint Report]
```

### Sprint Report (Auto-Generated)

```markdown
# Sprint 2 Report — Core Dashboard

## Summary
- **Duration:** Jan 20-24, 2026
- **Tasks Completed:** 5/5 (100%)
- **Hours:** 14.2 actual vs 13.5 estimated

## Completed Work
1. Customer portal layout (3.5 hrs)
2. Project status components (2.5 hrs)
3. Scope tracker view (3.2 hrs)
4. Database view (2.5 hrs)
5. Change log system (2.5 hrs)

## Blockers Encountered
- None

## Notes
- Scope tracker took slightly longer due to animation polish
- Estimate accuracy improved from Sprint 1

## Client Milestone
Preview deployed: staging.resultsroofing.com
```

---

## Integrations

### Time Tracking Sync
- Receives time entries from desktop app
- Maps window activity to active task
- Auto-pauses when switching away

### Daily Driver
- Surfaces today's focus task
- Shows sprint progress
- Highlights blockers

### Client Portal
- Sprint progress auto-publishes
- Client sees percentage complete
- Staging links when available

---

## Keyboard Shortcuts

```
Cmd+K          Command palette
Cmd+Enter      Mark task complete
Cmd+B          Mark as blocked
Cmd+N          Next task
Cmd+P          Previous task
Cmd+T          Toggle timer (manual override)
Cmd+/          View shortcuts
```

---

## Data Model

See `data-models.md` for complete schema. Key entities:
- `Sprint`
- `Task`
- `TimeEntry`
- `Blocker`
