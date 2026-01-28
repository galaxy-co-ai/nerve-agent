# Daily Driver

## Overview

Your morning command center. One view that tells you exactly what needs your attention today—no digging through projects, no mental load. Just execute.

## Philosophy

- **Curated, not comprehensive** — Show what matters, hide the rest
- **Zero decision fatigue** — Don't ask what to work on, tell you
- **Surface the important** — Blockers cleared, clients waiting, follow-ups due
- **Context at a glance** — Everything you need without clicking

---

## Daily View

### Morning Dashboard

```
GOOD MORNING                                    Tuesday, Jan 28, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TODAY'S FOCUS
┌─────────────────────────────────────────────────────────────────────┐
│ Results Roofing — Sprint 2                                          │
│                                                                      │
│ ● Scope tracker view                                     ~3.0 hrs   │
│   Build the scope tracker component that displays feature progress  │
│                                                                      │
│ ○ Database view                                          ~2.0 hrs   │
│   If you finish the scope tracker                                   │
│                                                                      │
│ Sprint ends: Friday (3 days)                                        │
│ [Open Sprint →]                                                     │
└─────────────────────────────────────────────────────────────────────┘

BLOCKERS CLEARED                                                    1
┌─────────────────────────────────────────────────────────────────────┐
│ ✓ Galaxy Co — Design feedback received                              │
│   Sarah approved the dashboard mockups. You can proceed.            │
│   [Start Dashboard Task →]                                          │
└─────────────────────────────────────────────────────────────────────┘

CLIENT WAITING                                                      2
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ QuickClaims — Review pending 3 days                              │
│   Staging deployed, awaiting client approval                        │
│   [View Portal Feedback →]                                          │
│                                                                      │
│ ⏳ Galaxy Co — Invoice pending 5 days                               │
│   $6,750 — Sent Jan 23, due Feb 7                                  │
│   [View Invoice →]                                                  │
└─────────────────────────────────────────────────────────────────────┘

FOLLOW UP TODAY                                                     2
┌─────────────────────────────────────────────────────────────────────┐
│ Results Roofing — API credentials                    12 days        │
│ [Send Follow-up →]  [Mark Received →]                               │
│                                                                      │
│ Results Roofing — Brand guidelines                    5 days        │
│ [Send Follow-up →]  [Mark Received →]                               │
└─────────────────────────────────────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────
TIME TODAY                                              0h 0m tracked
YESTERDAY                                              6h 45m tracked
```

---

## Sections

### Today's Focus

The single most important thing to work on.

```typescript
interface TodaysFocus {
  project: Project
  sprint: Sprint
  primaryTask: Task
  secondaryTask?: Task        // If you finish early
  sprintDeadline: Date
  hoursRemaining: number
}
```

**Logic for selecting focus:**
1. Active sprint with nearest deadline
2. Next incomplete task in sprint order
3. If blocked, show next unblocked task

```
TODAY'S FOCUS — Selection Logic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority Order:
1. ⚠️ Overdue sprint tasks
2. 🔴 Critical priority tasks
3. ● Current sprint, next in queue
4. ○ Upcoming sprint prep

Skip if:
• Task is blocked
• Waiting on client
• Marked for later
```

### Blockers Cleared

Things that were stuck but aren't anymore—momentum opportunities.

```
BLOCKERS CLEARED                                          2 today
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Galaxy Co — Design feedback received
  Was blocked: 5 days
  What changed: Sarah approved mockups via portal
  Impact: Dashboard task can now proceed
  [Start Task →]

✓ Results Roofing — CRM API docs received
  Was blocked: 12 days
  What changed: Tareq uploaded credentials
  Impact: Integration work can begin
  [View Credentials →]
```

### Client Waiting

Where YOU are the bottleneck—don't leave clients hanging.

```
CLIENT WAITING                                                  3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEEDS RESPONSE
──────────────────────────────────────────────────────────────────
⚠️ QuickClaims — Portal feedback                       3 days
   Client left 2 comments on staging preview
   [Respond →]

AWAITING APPROVAL
──────────────────────────────────────────────────────────────────
⏳ Galaxy Co — Sprint 2 review                         1 day
   Staging ready, waiting for client sign-off
   [Send Reminder →]

INVOICE PENDING
──────────────────────────────────────────────────────────────────
💰 Galaxy Co — Invoice #2026-014                       5 days
   $6,750 — Sent Jan 23, due Feb 7
   [View →]
```

### Follow-Up Queue

Automated nudge system for things clients owe you.

```
FOLLOW-UP QUEUE                                               4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DUE TODAY
──────────────────────────────────────────────────────────────────
Results Roofing — API credentials                    12 days
Last follow-up: 5 days ago
[Send Follow-up →]  [Mark Received →]

Results Roofing — Brand guidelines                    5 days
Last follow-up: None sent
[Send Follow-up →]  [Mark Received →]

UPCOMING
──────────────────────────────────────────────────────────────────
Galaxy Co — Contract renewal                         Due in 3 days
QuickClaims — Final payment                          Due in 5 days
```

---

## Time Summary

### Today's Time

```
TIME TRACKING — Today
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRACKED TODAY                                         4h 23m
──────────────────────────────────────────────────────────────────
Results Roofing    ████████████████████    3h 15m    74%
Galaxy Co          ██████████              1h 08m    26%

CURRENT SESSION
──────────────────────────────────────────────────────────────────
● Results Roofing — Scope tracker view
  Started: 2:15 PM (47 minutes ago)

TIMELINE
──────────────────────────────────────────────────────────────────
9:00  ████████████████████  Results Roofing (2h 30m)
11:30 ░░░░░░                 Break (30m)
12:00 ██████████████        Galaxy Co (1h 08m)
1:00  ░░░░░░░░░░░░          Lunch (1h)
2:00  ████████              Results Roofing (45m)
```

### Weekly Overview

```
THIS WEEK                                            22h 15m / 40h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mon   ████████████████████████████████████████      8h 00m
Tue   ████████████████████                          4h 23m  (today)
Wed   (planned: 8h)
Thu   (planned: 8h)
Fri   (planned: 6h)

BY PROJECT
──────────────────────────────────────────────────────────────────
Results Roofing    ████████████████████████    14h 30m
Galaxy Co          ████████████████             7h 45m
```

---

## Quick Actions

### Command Palette

```
Cmd+K — QUICK ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[                                                              ]

RECENT
──────────────────────────────────────────────────────────────────
→ Results Roofing — Scope tracker view
→ Galaxy Co — Dashboard redesign
→ Create invoice

QUICK ACTIONS
──────────────────────────────────────────────────────────────────
→ Switch project
→ Start new task
→ Log time manually
→ Create invoice
→ Send follow-up

NAVIGATION
──────────────────────────────────────────────────────────────────
→ Go to Sprint Stack
→ Go to Vault
→ Go to Financial
```

### Keyboard Shortcuts

```
KEYBOARD SHORTCUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVIGATION
Cmd+K          Command palette
Cmd+1          Daily Driver
Cmd+2          Sprint Stack
Cmd+3          Vault
Cmd+4          Financial

ACTIONS
Cmd+Enter      Complete current task
Cmd+B          Mark task blocked
Cmd+T          Toggle timer
Cmd+I          Quick invoice
Cmd+F          Send follow-up

SEARCH
Cmd+P          Search projects
Cmd+/          Search everything
```

---

## Notifications

### Notification Types

```
NOTIFICATIONS — Today
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEW
──────────────────────────────────────────────────────────────────
🔔 Blocker cleared: Galaxy Co design feedback
   10 minutes ago

🔔 Client feedback: QuickClaims — 2 new comments
   1 hour ago

🔔 Payment received: Galaxy Co — $6,750
   3 hours ago

EARLIER
──────────────────────────────────────────────────────────────────
Sprint 1 completed: Results Roofing
Yesterday at 5:30 PM

Follow-up due: Results Roofing API credentials
Yesterday at 9:00 AM
```

### Push Notifications (Desktop)

```
┌─────────────────────────────────────────────┐
│ 🟢 Blocker Cleared                          │
│ Galaxy Co — Design feedback received        │
│ Dashboard task can now proceed              │
│                                             │
│ [Open Task]  [Dismiss]                      │
└─────────────────────────────────────────────┘
```

---

## Customization

### Dashboard Settings

```
DAILY DRIVER SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTIONS TO SHOW
──────────────────────────────────────────────────────────────────
☑️ Today's Focus
☑️ Blockers Cleared
☑️ Client Waiting
☑️ Follow-Up Queue
☑️ Time Summary
☐ Recent Activity
☐ Upcoming Deadlines

NOTIFICATIONS
──────────────────────────────────────────────────────────────────
Notify me when:
☑️ Blocker is cleared
☑️ Client leaves feedback
☑️ Payment received
☑️ Sprint deadline approaching (1 day)
☐ Task completed
☐ Time goal reached

DEFAULTS
──────────────────────────────────────────────────────────────────
Default project:     [Most recent ▾]
Work day start:      [9:00 AM ▾]
Work day end:        [6:00 PM ▾]
Target daily hours:  [8 hours ▾]
```

---

## Weekly Planning

### Week View

```
WEEK OF JANUARY 27, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                Mon    Tue    Wed    Thu    Fri    Total
──────────────────────────────────────────────────────────────────
Results         4h     3h     4h     4h     2h     17h
Galaxy          4h     1h     4h     4h     4h     17h
QuickClaims     —      —      —      —      2h      2h
──────────────────────────────────────────────────────────────────
Total           8h     4h     8h     8h     8h     36h

MILESTONES THIS WEEK
──────────────────────────────────────────────────────────────────
Fri — Results Roofing Sprint 2 ends
Sat — Galaxy Co milestone review

FOLLOW-UPS DUE
──────────────────────────────────────────────────────────────────
Tue — Results Roofing: API credentials
Wed — Results Roofing: Brand guidelines
```

### Weekly Review

```
WEEKLY REVIEW — January 20-26, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACCOMPLISHMENTS
──────────────────────────────────────────────────────────────────
✓ Results Roofing Sprint 1 completed
✓ Galaxy Co milestone 2 delivered
✓ 3 invoices sent ($11,250)
✓ 2 payments received ($7,500)

TIME TRACKED
──────────────────────────────────────────────────────────────────
Total:        38.5 hours
Billable:     35.0 hours (91%)
Target:       40.0 hours

BLOCKERS RESOLVED
──────────────────────────────────────────────────────────────────
3 blockers resolved
2 blockers still active

LOOKING AHEAD
──────────────────────────────────────────────────────────────────
• Results Roofing Sprint 2 (ends Friday)
• Galaxy Co design review (Thursday)
• QuickClaims final delivery (next week)
```

---

## Data Sources

The Daily Driver aggregates from:

```
DATA SOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TODAY'S FOCUS
← Sprint Stack (active sprint, current task)

BLOCKERS CLEARED
← Sprint Stack (blocker status changes)
← Client Portal (feedback received)
← Call Intelligence (action items completed)

CLIENT WAITING
← Client Portal (pending feedback)
← Invoices (unpaid)
← Sprint Stack (pending reviews)

FOLLOW-UP QUEUE
← Call Intelligence (action items)
← Blockers (client-dependent)

TIME SUMMARY
← Time Tracking (auto-tracked entries)
```

---

## Mobile View

### Simplified Mobile Dashboard

```
┌─────────────────────────────────────┐
│ NERVE AGENT            Tue, Jan 28 │
├─────────────────────────────────────┤
│                                     │
│ TODAY                               │
│ ┌─────────────────────────────────┐ │
│ │ ● Scope tracker view            │ │
│ │   Results Roofing               │ │
│ │   ~3.0 hrs                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ATTENTION NEEDED              3    │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️ Client feedback waiting      │ │
│ │ ⏳ 2 follow-ups due             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ TIME TODAY                  4h 23m │
│ [████████████████░░░░░░░░]         │
│                                     │
├─────────────────────────────────────┤
│ 🏠  📋  ⏱️  💰  ⚙️                │
└─────────────────────────────────────┘
```

---

## Data Model

The Daily Driver doesn't have its own data model—it aggregates from:
- `Sprint` and `Task`
- `Blocker`
- `ActionItem` and `FollowUp`
- `TimeEntry`
- `PortalFeedback`
- `Invoice`

---

## Integrations

### All Systems Feed Daily Driver

- **Sprint Stack** → Today's focus, sprint progress
- **Time Tracking** → Hours tracked today
- **Call Intelligence** → Follow-up queue
- **Client Portal** → Pending feedback
- **Financial** → Outstanding invoices
- **Feedback Loop** → Open issues (critical only)
