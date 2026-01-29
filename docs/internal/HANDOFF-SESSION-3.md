# HANDOFF-SESSION-3.md — Workspace Integration & Onboarding UX

**Date:** January 29, 2025
**Commits this session:** `51c53b5`, `be891de`
**Context:** Continuing NERVE AGENT development with focus on framework templates and first-time user experience.

---

## COMPLETED THIS SESSION

### 1. Framework Templates Integration (Phase 2) ✅
**Commit:** `51c53b5`

Added all 12 document templates to `src/lib/framework-templates.ts`:
- 01 Idea Audit (7 sections)
- 02 Project Brief (4 sections)
- 03 PRD (5 sections)
- 04 TAD (6 sections)
- 05 AI Collaboration Protocol (5 sections)
- 06 MTS (5 sections)
- 07 Test Plan (4 sections)
- 08 Audit Checklist (4 sections)
- 09 Decision Log (3 sections)
- 10 Project Pulse (4 sections)
- 11 Ship Checklist (4 sections)
- 12 Retrospective (5 sections)

**Result:** AI document generation now works for ALL 12 framework documents.

### 2. Checkpoint Time Tracking (Phase 3) ✅
**Commit:** `be891de`

Updated `src/components/workspace/progress-tab.tsx` with:
- Start/Pause button for current checkpoint
- Live timer (ticks every second when recording)
- Pulsing "Recording" indicator
- Time cards: Estimated | Actual | Variance
- Auto-resume from active session on page reload
- Color-coded variance (green=under, red=over estimate)
- Session counter

**API routes already existed:** `/api/projects/[slug]/checkpoints/[id]/sessions`

### 3. Project Ideas Bank (Started)
**File:** `src/lib/project-ideas.ts`

Created 50 curated project ideas from:
- [Upsilon IT - 50+ Micro SaaS Ideas](https://www.upsilonit.com/blog/micro-saas-ideas-to-build)
- [Eleken - 100 SaaS Solopreneur Ideas](https://www.eleken.co/blog-posts/solopreneur-ideas)

Categories: saas, developer, productivity, health, education, marketplace, ecommerce, creative, finance

Helper functions:
- `getRandomIdeas(exclude)` - Get 3 random ideas
- `getIdeasByCategory(category)` - Filter by category

---

## MAJOR UX INSIGHT THIS SESSION

### The Onboarding Problem

Current first-time user flow has **3 discovery moments where users bounce:**

```
1. Sign up
2. Dashboard → Wall of zeros, no guidance  ← BOUNCE
3. Find "Projects" in sidebar              ← BOUNCE
4. See empty state, click "Create Project"
5. Fill out form
6. Land on project page
7. Find "Workspace" button                 ← BOUNCE
8. Empty workspace, figure out "Start with AI"
```

### The Solution: AI Co-Founder Launchpad

**Philosophy shift:** The AI isn't a tool, it's a co-founder. "What are **WE** building?"

**New architecture:**
- **Dashboard** = Micro launchpad (entry point, not where you live)
- **Projects page** = The real home (current Daily Driver energy)

**First-time user experience:**
```
┌─────────────────────────────────────────────────────────────┐
│     Welcome to NERVE AGENT                                  │
│     Let's get your first project started.                   │
│                                                             │
│     🤖 What are we building?                                │
│                                                             │
│     [Fitness tracker] [Invoicing tool] [Recipe app]         │
│                                        🔄 Shuffle           │
│                                                             │
│     ─────────────── or ───────────────                      │
│                                                             │
│     [Describe your project idea...]                         │
│                                                             │
│     ─────────────── or ───────────────                      │
│                                                             │
│     [🎯 Try a sample project (MyStride.ai)]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## TEST PROJECT: MyStride.ai

**For dogfooding NERVE AGENT** (not a user example):

> MyStride.ai is AI training intelligence for distance runners. We predict injuries before they happen, synthesize personalized training plans from proven coaches, and connect all your running data—Garmin, Strava, Spotify—into one intelligent system that actually coaches you.

Use this to test the full framework flow ourselves.

---

## NEXT SESSION PRIORITIES

### 1. Build the Onboarding Launchpad (HIGH)

Create new component: `src/components/features/onboarding-launchpad.tsx`
- Detects new user (0 projects)
- Shows on dashboard instead of stats
- Displays 3 random project idea chips
- Shuffle button to refresh ideas
- "Describe your own" text input
- "Try sample project" option
- AI co-founder energy ("What are WE building?")

Integrate into `src/app/(dashboard)/dashboard/page.tsx`:
```tsx
if (projectCount === 0) {
  return <OnboardingLaunchpad />
}
// existing dashboard...
```

### 2. Quick Project Creation Flow

When user clicks an idea chip or submits their own:
1. AI asks 2-3 clarifying questions (conversational)
2. Creates project with name + client
3. Redirects to Workspace
4. Workspace shows "Ready to begin?" with Idea Audit ready

### 3. AI Personality

The AI should feel like a co-founder:
- Uses "we" language
- Direct, opinionated, helpful
- Not sterile corporate vibes
- Reference: Moltbot personality

### 4. MyStride.ai Dogfooding

After launchpad is built:
1. Create MyStride.ai through the new flow
2. Experience the Idea Audit generation
3. Fix friction points as we find them
4. Complete first 3 framework docs

---

## KEY FILES

| File | Purpose |
|------|---------|
| `src/lib/framework-templates.ts` | All 12 doc templates for AI generation |
| `src/lib/project-ideas.ts` | 50 curated startup ideas |
| `src/components/workspace/progress-tab.tsx` | Time tracking UI |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard (needs onboarding) |
| `src/app/(dashboard)/projects/new/page.tsx` | Project creation form |

---

## GIT STATUS

```
Untracked: HANDOFF-SESSION-2.md (previous handoff)
Untracked: HANDOFF-SESSION-3.md (this file)
Clean: All work committed and pushed
```

---

## QUICK START NEXT SESSION

```bash
cd C:\Users\Owner\workspace\nerve-agent\apps\web

# Read handoffs
cat HANDOFF-SESSION-3.md

# Check current state
npm run typecheck

# Key task: Build onboarding launchpad
# Start with: src/components/features/onboarding-launchpad.tsx
```

---

**End of Handoff**
