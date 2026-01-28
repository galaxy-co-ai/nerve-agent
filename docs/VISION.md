# NERVE AGENT — Full Product Vision

## The Problem

You're a one-person studio. You do strategy, design, development, project management, client communication, and accounting. Every existing tool is built for teams:

- **Notion** — Infinitely flexible, which means infinitely time-consuming to set up
- **Linear** — Beautiful, but assumes you have a team with sprints and standups
- **Jira** — Enterprise bloat for enterprise teams
- **Asana/Monday** — Collaboration features you don't need
- **Trello** — Too simple, no intelligence

The result? You cobble together 12 different tools:
- Notion for docs
- Linear for tasks
- Figma for design
- GitHub for code
- Vercel for deploys
- Stripe for payments
- Google Calendar for scheduling
- Email for client updates
- Spreadsheets for finances
- Your brain for context

**The bottleneck isn't any single tool. It's the context-switching between them.**

---

## The Solution

Nerve Agent is a **project operating system** designed specifically for solo builders.

Not a flexible tool you configure endlessly. A **framework you follow**.

### Core Insight #1: You Need Structure, Not Flexibility

When you're solo, decision fatigue is real. Every "how should I organize this?" costs mental energy. Nerve Agent makes the decisions for you:

- Every project follows the same four phases
- Every project goes through the same planning documents
- Every sprint is pre-planned before code is written
- Every deploy follows the same pipeline

You don't think about process. You just execute.

### Core Insight #2: Context is Everything

The #1 problem with multiple projects is losing context. You step away from a project for two weeks, come back, and spend hours remembering where you left off.

Nerve Agent captures everything:
- Call transcripts become searchable knowledge
- Decisions are logged with reasoning
- Every commit links to a task
- Every task links to a planning document
- AI can answer "what did we decide about X?" instantly

### Core Insight #3: Automate the Bullshit

As a solo dev, you waste hours on:
- Writing status update emails
- Setting up new projects (same config every time)
- Manually tracking time
- Creating invoices from tracked time
- Following up on blocked items
- Organizing information from calls

Nerve Agent automates all of it:
- Client portal auto-generates from your sprint progress
- Agents set up repos, projects, integrations
- Screen activity auto-tracks time
- Invoices generate from tracked hours
- Follow-ups send automatically after X days
- Call transcripts become structured briefs instantly

### Core Insight #4: Quality Compounds

Most PM tools track what you're doing. Nerve Agent tracks what went wrong and makes sure it doesn't happen again.

The Feedback Loop:
- Every bug gets a root cause
- Patterns emerge across projects
- Pre-flight checklists generate automatically
- Quality metrics show trends over time

After a year, you have a personalized quality playbook built from your own history.

### Core Insight #5: Estimates Should Learn

Why do we guess every time? You've built auth flows before. You've integrated Stripe before. You've set up databases before.

Nerve Agent tracks actual time vs. estimated time for every task type. After a few projects, it knows:
- "You typically run 30% over on third-party integrations"
- "You're faster than expected on Stripe tasks"
- "First-time integrations average 1.5x your estimate"

Estimates become predictions based on data, not guesses.

---

## The User Experience

### Morning Routine

You open Nerve Agent. The Daily Driver shows you:

```
GOOD MORNING                                    Tuesday, Jan 28

TODAY'S FOCUS
┌─────────────────────────────────────────────────────────────┐
│ Results Roofing — Sprint 2                                  │
│ ○ Scope tracker view                              ~3.0 hrs  │
│ ○ Database view                                   ~2.0 hrs  │
└─────────────────────────────────────────────────────────────┘

BLOCKERS CLEARED
┌─────────────────────────────────────────────────────────────┐
│ ✓ Galaxy Co — Design feedback received                      │
│   You can now proceed with dashboard redesign               │
└─────────────────────────────────────────────────────────────┘

CLIENT WAITING
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ QuickClaims — Review pending 3 days                      │
│   Staging deployed, awaiting client approval                │
└─────────────────────────────────────────────────────────────┘

FOLLOW UP TODAY
┌─────────────────────────────────────────────────────────────┐
│ Results Roofing — API credentials (12 days waiting)         │
│ [Send Follow-up →]                                          │
└─────────────────────────────────────────────────────────────┘
```

No decision-making. Just execute.

### Starting a New Project

You don't start building. You start the Planning Wizard.

Eight documents, same order every time:
1. Project Brief
2. Technical Discovery
3. Scope Definition
4. Information Architecture
5. Design System & UI Specs
6. Integration Mapping
7. Timeline & Milestones
8. Risk Register

Each document has guided prompts. You never stare at a blank page.

When all eight are complete, the system generates:
- Complete project roadmap
- Every sprint pre-planned with tasks and estimates
- Client-facing timeline
- Risk monitoring checklist

You know exactly what you're building in Sprint 1, 5, and 12 before writing a single line of code.

### Executing a Sprint

You're in Sprint 2. The view shows:

```
SPRINT 2 — Core Dashboard                         Day 3 of 5

TODAY'S FOCUS
○ Scope tracker view                              ~3.0 hrs

COMPLETED THIS SPRINT                              6.0 hrs
✓ Customer portal layout                          3.5 hrs
✓ Project status components                       2.5 hrs

REMAINING                                         ~7.5 hrs
○ Scope tracker view                              ~3.0 hrs
○ Database view                                   ~2.0 hrs
○ Change log system                               ~2.5 hrs

TIME TODAY                          2h 34m (auto-tracked)
```

Time tracking just works. You're in VS Code working on the project, it knows. You switch to Slack, it pauses. No clicking start/stop.

### Agent Actions

You're setting up a new project. Sprint 1 has the usual tasks:
- Create GitHub repository
- Initialize Next.js project
- Set up Vercel
- Configure Supabase
- Set up Sentry

You've done this 20 times. Instead of doing it manually, you click "Run Agent" on each task.

The agent:
- Creates the repo with your standard structure
- Initializes Next.js with your exact config
- Connects to Vercel with your env var patterns
- Sets up Supabase with your auth config
- Configures Sentry with your project structure

Toast: "GitHub repository created" with a link. Done in 2 minutes instead of 2 hours.

### After a Call

You had a 2-hour call with Tareq about Results Roofing. You drop the transcript into Nerve Agent.

Instantly generated:
- Polished call brief (shareable)
- Action items extracted (assigned to you or client)
- Decisions logged (searchable forever)
- Blockers identified and tracked
- Follow-up reminders scheduled

Three weeks later, you ask: "What did we decide about the payment structure?"

Instant answer with the exact quote and timestamp.

### Client Communication

You never write a status update email. The client has a portal:

```
https://nerve.yourdomain.com/portal/results-roofing
```

They see:
- Current sprint progress (auto-updated)
- What you're waiting on from them
- Staging link to preview
- Place to leave feedback

Feedback they leave auto-creates tickets for you.

### Shipping

Preview is ready. One click deploys to staging. Client is auto-notified.

They approve. One click ships to production. Changelog auto-generates from commits.

Error in production? Sentry catches it, creates a ticket automatically, assigns it to the current sprint.

### End of Project

Project ships. The Feedback Loop captures:
- Quality metrics (bugs shipped, time to fix)
- Lessons learned (auto-generated from resolved issues)
- Reusable blocks saved to Vault
- Time data feeds into future estimates

Next project, you're faster. More accurate. Higher quality.

---

## The Compound Effect

After 6 months:
- Your estimates are accurate to within 10%
- You have a Vault of 50+ reusable blocks
- Your UI Library is polished and battle-tested
- Pre-flight checklists prevent 80% of bugs you used to ship
- Clients love the portal (you haven't written a status email in months)
- You've saved 10+ hours per project on setup via agents

After a year:
- You can take on more projects (less overhead per project)
- Your quality reputation grows (fewer bugs, faster fixes)
- Your velocity increases (reusable blocks, accurate planning)
- Context-switching is painless (everything is in one place)

**Nerve Agent doesn't just manage projects. It makes you better at your craft.**

---

## The Aesthetic

- **Dark mode default** — Light mode for client portals
- **Keyboard-first** — Mouse is optional, `Cmd+K` everything
- **Dense but breathable** — Lots of info, no clutter
- **Fast as fuck** — Optimistic UI, edge caching, feels instant
- **shadcn/ui Pro** — Clean, minimal, consistent
- **Opinionated** — Not infinitely customizable, just *right*

---

## Why "Nerve Agent"?

The nerve center of your operation. The agent that handles the tedious work.

Your nervous system for building products.
