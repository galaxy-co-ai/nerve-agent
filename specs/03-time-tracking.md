# Time Tracking

## Overview

Nerve Agent tracks time passively through a companion desktop app. No clicking start/stop. No forgetting to log hours. The system watches your screen activity and knows what project you're working on.

## Philosophy

- **Zero friction** — Time tracking should be invisible
- **Accurate, not invasive** — Window titles and app names only, never screenshots
- **Smart mapping** — Rules determine which project gets the time
- **Manual override** — You can always adjust

---

## Desktop Companion App

### Tech Stack
```
Electron          Cross-platform desktop app
Node.js           Main process for system access
React             Renderer (minimal UI)
SQLite            Local cache before sync
```

### What It Captures

**Captured:**
- Active window title
- Application name
- Timestamp
- Duration

**Never Captured:**
- Screenshots
- Keystrokes
- File contents
- URLs (only domain)

### System Tray

```
┌─────────────────────────────────┐
│ 🟢 Tracking: Results Roofing    │
├─────────────────────────────────┤
│ Today: 4h 23m                   │
│ This task: 1h 45m               │
├─────────────────────────────────┤
│ ○ Pause Tracking                │
│ ○ Switch Project                │
│ ○ Open Nerve Agent              │
│ ─────────────────────           │
│ ○ Settings                      │
│ ○ Quit                          │
└─────────────────────────────────┘
```

---

## Activity Detection

### Active Window Monitoring

```typescript
// Captures every 5 seconds
interface ActivityCapture {
  timestamp: Date
  appName: string        // "Visual Studio Code"
  windowTitle: string    // "scope-tracker.tsx - nerve-agent"
  domain?: string        // "github.com" (if browser)
  isIdle: boolean
}
```

### Idle Detection

- **Idle threshold:** 5 minutes of no input
- **Auto-pause:** Stops counting after idle threshold
- **Auto-resume:** Continues when activity returns
- **Long break:** Prompts for confirmation after 30+ minutes

```
WELCOME BACK                                        2:34 PM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You were away for 47 minutes.

What were you doing?
○ Still working (count the time)
○ Taking a break (don't count)
● In a meeting (log as meeting time)
○ Something else: [________________]

[Continue]
```

---

## Project Mapping

### Rule-Based Mapping

```
PROJECT: Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mapping Rules (in priority order):

1. Window title contains "results-roofing"
   Apps: VS Code, Terminal, any

2. Window title contains "resultsroofing.com"
   Apps: Chrome, Firefox, Safari, Arc

3. Domain is "github.com/yourusername/results-roofing"
   Apps: any browser

4. App is "Figma" AND file contains "Results"
   Apps: Figma

[+ Add Rule]
```

### Smart Suggestions

When unrecognized activity is detected:

```
UNMAPPED ACTIVITY                                   10 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Window: "results-api - Cursor"
App: Cursor

Which project is this?
○ Results Roofing
○ Galaxy Co
○ QuickClaims
○ Personal (don't bill)
○ Create new project...

☑️ Remember this for "results-api" in Cursor

[Assign]
```

---

## Time Entry Structure

```typescript
interface TimeEntry {
  id: string
  startTime: Date
  endTime: Date
  duration: number          // seconds
  project: Project
  task?: Task              // if mapped to active task
  source: "AUTO" | "MANUAL"
  activities: ActivityCapture[]
  isApproved: boolean
  notes?: string
}
```

---

## Daily Timeline

### Visual Timeline View

```
TODAY — Tuesday, Jan 28                            Total: 6h 12m
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9:00 ├████████████────────────────────────────────┤ 10:00
     Results Roofing (1h 00m)
     VS Code: scope-tracker.tsx

10:00├────████████████████────────────────────────┤ 11:00
     Results Roofing (45m)
     Chrome: Supabase Dashboard

11:00├████░░░░████████────────────────────────────┤ 12:00
     Meeting (15m) | Idle (15m) | Results Roofing (30m)

12:00├░░░░░░░░░░░░░░░░░░░░────────────────────────┤ 1:00
     Lunch break (not tracked)

1:00 ├████████████████████████████────────────────┤ 2:00
     Galaxy Co (1h 00m)
     VS Code: dashboard-redesign

2:00 ├████████████████████████████████████████████┤ 3:00
     Galaxy Co (1h 00m)
     Figma: Galaxy Dashboard v2

3:00 ├████████████████────────────────────────────┤ 3:30
     Results Roofing (30m)
     VS Code: scope-tracker.tsx
```

### Editing Time

```
EDIT TIME ENTRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Start: [9:00 AM  ▾]    End: [10:00 AM ▾]
Project: [Results Roofing ▾]
Task: [Scope tracker view ▾]

Activities during this period:
• VS Code: scope-tracker.tsx (45m)
• Chrome: Tailwind docs (10m)
• Terminal: npm run dev (5m)

Notes:
┌─────────────────────────────────────────────────────────────────┐
│ Implemented expand/collapse functionality                        │
└─────────────────────────────────────────────────────────────────┘

[Save Changes]  [Delete Entry]
```

---

## Weekly Summary

```
WEEKLY TIME SUMMARY                              Jan 22-28, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL BILLABLE                                         32.5 hrs
TOTAL NON-BILLABLE                                      4.0 hrs

BY PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results Roofing         ████████████████████    18.5 hrs  $2,775
Galaxy Co               ████████████            12.0 hrs  $1,800
QuickClaims             ████                     2.0 hrs    $300
─────────────────────────────────────────────────────────────────
Personal                ██                       4.0 hrs     —

BY DAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mon   ████████████████████████████████████      8.0 hrs
Tue   ██████████████████████████████            6.5 hrs
Wed   ████████████████████████████████████████  8.5 hrs
Thu   ████████████████████████████              6.0 hrs
Fri   ██████████████                            3.5 hrs
Sat   ░░░░░░░░░░                                0.0 hrs
Sun   ░░░░░░░░░░                                0.0 hrs
```

---

## Sync Architecture

### Local → Cloud Sync

```
Desktop App                    Nerve Agent API
    │                               │
    ├──── Capture activity ────────►│
    │     (every 30 seconds)        │
    │                               │
    │◄──── Mapping rules ───────────┤
    │     (on change)               │
    │                               │
    ├──── Time entries ────────────►│
    │     (every 5 minutes)         │
    │                               │
    │◄──── Active task ─────────────┤
    │     (for display)             │
```

### Offline Support

- Activities cached locally in SQLite
- Syncs when connection restored
- Conflict resolution: latest wins, flagged for review

---

## Privacy & Security

### Data Principles

1. **Local first** — All processing happens on your machine
2. **Minimal sync** — Only aggregated time entries sync to cloud
3. **No screenshots** — Ever. Period.
4. **No keylogging** — Only window titles and app names
5. **You control rules** — You decide what maps where

### Data Retention

```
Local (Desktop):     30 days of activity detail
Cloud (Nerve Agent): Aggregated time entries only
                     No raw activity data stored
```

### Security

- API key stored in system keychain
- HTTPS for all sync
- Rate limiting on sync endpoints

---

## Settings

### Desktop App Settings

```
TIME TRACKING SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Capture interval:     [5 seconds ▾]
Idle threshold:       [5 minutes ▾]
Long break threshold: [30 minutes ▾]

Sync frequency:       [5 minutes ▾]

Launch on startup:    [✓]
Show in menu bar:     [✓]
Show notifications:   [✓]

EXCLUDED APPS (never track)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 1Password
• Messages
• FaceTime
[+ Add App]

PRIVACY MODE APPS (track time but not titles)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Mail
• Slack
[+ Add App]
```

---

## Integrations

### Sprint Stack
- Time auto-assigned to active task
- Task estimates vs actual comparison
- Sprint hour totals

### Financial
- Billable hours → revenue calculation
- Per-project profitability
- Invoice generation

### Daily Driver
- Today's total hours
- Per-project breakdown
- Focus time metrics

---

## Data Model

See `data-models.md` for complete schema. Key entities:
- `TimeEntry`
- `ProjectMappingRule`
