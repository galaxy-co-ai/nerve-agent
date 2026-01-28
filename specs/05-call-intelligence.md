# Call Intelligence

## Overview

Drop a call transcript into Nerve Agent and instantly get a polished brief, extracted action items, logged decisions, and scheduled follow-ups. Never lose context from client conversations again.

## Philosophy

- **Capture everything** — Calls contain gold, don't let it slip away
- **Structure the chaos** — Raw transcripts become organized knowledge
- **Searchable forever** — Find "what did we decide about X?" instantly
- **Auto-generate artifacts** — Briefs you can share with clients

---

## Input Methods

### 1. Upload Transcript
```
UPLOAD CALL TRANSCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Drag and drop a transcript file or paste text

Supported formats:
• Plain text (.txt)
• Markdown (.md)
• Otter.ai export
• Zoom transcript
• Fireflies.ai export
• Raw paste

[Choose File]  or  [Paste Text]
```

### 2. Recording Integration (Future)
- Direct integration with Otter.ai
- Zoom recording auto-import
- Google Meet transcription

---

## Processing Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UPLOAD    │────▶│   PROCESS   │────▶│   REVIEW    │
│  Transcript │     │  with AI    │     │  & Approve  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     EXTRACTED:        │
              │  • Brief              │
              │  • Decisions          │
              │  • Action Items       │
              │  • Blockers           │
              │  • Follow-ups         │
              └───────────────────────┘
```

---

## Call Brief

### Generated Structure

```markdown
# Call Brief
**Project:** Results Roofing
**Date:** January 27, 2026
**Participants:** Dalton Cox, Tareq Othman
**Duration:** 47 minutes

## TL;DR
Initial project kickoff covering scope, timeline, and technical requirements.
Client wants a customer portal for tracking roofing projects with real-time
updates and payment integration.

## Key Decisions
1. **Tech Stack:** Next.js + Supabase (client approved)
2. **Payment:** Stripe integration for deposits and final payments
3. **Timeline:** 8-week development, 2-week buffer

## Action Items
### Dalton (Developer)
- [ ] Send revised proposal by Friday
- [ ] Set up staging environment
- [ ] Create initial wireframes

### Tareq (Client)
- [ ] Provide brand guidelines
- [ ] Send list of current customer pain points
- [ ] Confirm budget approval with partner

## Blockers Identified
- Need API access to existing CRM system
- Waiting on final logo files

## Next Steps
- Follow-up call scheduled: February 3, 2026
- First milestone review: February 15, 2026

## Raw Quotes
> "We need customers to see exactly where their project stands without calling us"
> — Tareq on the core problem

> "Budget isn't the constraint, timeline is. We need this before busy season."
> — Tareq on priorities
```

### Brief Preview UI

```
CALL BRIEF                                      Ready to share
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Results Roofing — January 27, 2026
Dalton Cox & Tareq Othman • 47 minutes

TL;DR
──────────────────────────────────────────────────────────────────
Initial project kickoff covering scope, timeline, and technical
requirements. Client wants a customer portal for tracking roofing
projects with real-time updates and payment integration.

KEY DECISIONS                                               3
──────────────────────────────────────────────────────────────────
✓ Tech Stack: Next.js + Supabase
✓ Payment: Stripe integration
✓ Timeline: 8 weeks + 2 week buffer

ACTION ITEMS                                                5
──────────────────────────────────────────────────────────────────
You (3)                          Client (2)
• Send revised proposal          • Provide brand guidelines
• Set up staging                 • Confirm budget
• Create wireframes

[Edit Brief]  [Copy as Markdown]  [Share with Client]
```

---

## Extracted Entities

### Decisions

```typescript
interface Decision {
  id: string
  project: Project
  callBrief: CallBrief
  title: string
  description: string
  decidedBy: string
  context: string          // Quote from transcript
  timestamp?: string       // Time in call
  category: "TECHNICAL" | "SCOPE" | "TIMELINE" | "BUDGET" | "DESIGN" | "OTHER"
  isConfirmed: boolean
}
```

**Decision View:**
```
DECISION LOG — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jan 27 — Tech Stack Decision                           TECHNICAL
──────────────────────────────────────────────────────────────────
Using Next.js with Supabase for the customer portal.

Decided by: Tareq (client approved)
Context: "Yes, that stack sounds perfect. We don't need anything
more complicated."

[View in Transcript]

Jan 27 — Payment Integration                              SCOPE
──────────────────────────────────────────────────────────────────
Stripe for deposits (50%) and final payment (50%).

Decided by: Both parties
Context: "We'll do half upfront, half on completion. Stripe works
for us."

[View in Transcript]
```

---

### Action Items

```typescript
interface ActionItem {
  id: string
  project: Project
  callBrief: CallBrief
  title: string
  description?: string
  assignedTo: "ME" | "CLIENT" | "THIRD_PARTY"
  assigneeName: string
  dueDate?: Date
  status: "PENDING" | "COMPLETE" | "CANCELLED"
  convertedToTask?: Task    // If turned into sprint task
  context: string           // Quote from transcript
}
```

**Action Items View:**
```
ACTION ITEMS — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MY ITEMS                                                    3
──────────────────────────────────────────────────────────────────
○ Send revised proposal                           Due: Jan 31
  "Can you send that over by Friday?"
  [Convert to Task]

○ Set up staging environment                      Due: Feb 3
  "We'll need somewhere to preview the work"
  [Convert to Task]

○ Create initial wireframes                       Due: Feb 3
  [Convert to Task]

CLIENT ITEMS                                                2
──────────────────────────────────────────────────────────────────
⏳ Provide brand guidelines                       Due: Jan 30
   Waiting 3 days • [Send Reminder]

⏳ Confirm budget with partner                    Due: Jan 29
   Waiting 4 days • [Send Reminder]
```

---

### Blockers

```typescript
interface Blocker {
  id: string
  project: Project
  source: "CALL" | "TASK" | "MANUAL"
  callBrief?: CallBrief
  task?: Task
  title: string
  description: string
  blockedOn: "ME" | "CLIENT" | "THIRD_PARTY"
  blockerName: string
  status: "ACTIVE" | "RESOLVED"
  createdAt: Date
  resolvedAt?: Date
  daysBlocked: number
  followUps: FollowUp[]
}
```

---

## Knowledge Search

### Natural Language Queries

```
ASK ABOUT THIS PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ What did we decide about the payment structure?                  │
└─────────────────────────────────────────────────────────────────┘

ANSWER
──────────────────────────────────────────────────────────────────
You decided on a 50/50 payment structure using Stripe:
- 50% deposit upfront before work begins
- 50% on project completion

This was agreed in the January 27 call. Tareq confirmed: "We'll do
half upfront, half on completion. Stripe works for us."

Source: Call Brief — Jan 27, 2026 [View →]
```

### Search Across All Projects

```
KNOWLEDGE SEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ stripe integration                                               │
└─────────────────────────────────────────────────────────────────┘

RESULTS
──────────────────────────────────────────────────────────────────

Results Roofing — Jan 27 Call
"Stripe for deposits and final payments"
[View Decision →]

Galaxy Co — Dec 15 Call
"We need Stripe Connect for marketplace payments"
[View Decision →]

QuickClaims — Nov 20 Call
"Standard Stripe checkout, nothing fancy"
[View Decision →]

Vault: Stripe Integration Pattern
Reusable code block for Stripe checkout
[View Block →]
```

---

## Follow-Up System

### Automated Reminders

```
FOLLOW-UP QUEUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERDUE                                                         2
──────────────────────────────────────────────────────────────────
⚠️ Results Roofing — Brand guidelines              5 days waiting
   Client: Tareq Othman
   Last follow-up: 2 days ago
   [Send Follow-up]  [Mark Received]

⚠️ Galaxy Co — API documentation                   7 days waiting
   Client: Sarah Chen
   No follow-up sent yet
   [Send Follow-up]  [Mark Received]

UPCOMING                                                        1
──────────────────────────────────────────────────────────────────
○ QuickClaims — Contract signature                 Due tomorrow
  Client: Mike Johnson
  [Send Reminder Early]
```

### Follow-Up Email Template

```
SEND FOLLOW-UP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To: tareq@resultsroofing.com
Subject: Quick follow-up: Brand guidelines

──────────────────────────────────────────────────────────────────
Hi Tareq,

Hope you're doing well! Just wanted to follow up on the brand
guidelines we discussed in our call last week.

Once I have those, I can start on the initial wireframes and
make sure everything aligns with your brand.

No rush if you're still gathering materials — just let me know
if you need anything from my end.

Best,
Dalton
──────────────────────────────────────────────────────────────────

[Send]  [Edit]  [Schedule for Tomorrow]
```

---

## AI Processing

### Claude Integration

```typescript
// Prompt structure for call processing
const processCallPrompt = `
You are analyzing a call transcript for a software development project.

Extract the following:
1. A concise TL;DR (2-3 sentences)
2. All decisions made (who decided, what was decided, context)
3. Action items (who, what, when if mentioned)
4. Blockers or dependencies identified
5. Key quotes worth preserving
6. Any follow-up dates mentioned

Format as structured JSON.

Transcript:
${transcript}
`;
```

### Processing Status

```
PROCESSING CALL TRANSCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████████████░░░░░░░░░░░░]  Analyzing...

✓ Parsed transcript (4,523 words)
✓ Identified participants
● Extracting decisions...
○ Extracting action items
○ Identifying blockers
○ Generating summary

Estimated: ~30 seconds remaining
```

---

## Sharing

### Client-Shareable Brief

```
SHARE OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Include in shared brief:
☑️ TL;DR Summary
☑️ Key Decisions
☑️ Action Items (client's items only)
☐ Action Items (all items)
☐ Raw Quotes
☐ Full Transcript

Format:
○ Web link (expires in 7 days)
● PDF download
○ Markdown

[Generate Shareable Brief]
```

### Shareable Link

```
https://nerve.app/brief/abc123

CALL BRIEF — Results Roofing
January 27, 2026

[Polished, branded view of the brief]
```

---

## Data Model

See `data-models.md` for complete schema. Key entities:
- `CallTranscript`
- `CallBrief`
- `Decision`
- `ActionItem`
- `Blocker`
- `FollowUp`

---

## Integrations

### Sprint Stack
- Action items can convert to tasks
- Blockers sync to task blockers

### Daily Driver
- Pending follow-ups surface
- Client waiting items shown

### Client Portal
- Shared briefs appear in portal
- Client can view their action items

### Vault
- Decisions searchable in knowledge base
- Context queries pull from all calls
