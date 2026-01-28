# Feedback Loop

## Overview

The Feedback Loop captures everything that goes wrong—and makes sure it doesn't happen again. Bugs become lessons, lessons become checklists, checklists prevent future bugs.

## Philosophy

- **Every bug teaches something** — Extract the lesson
- **Patterns emerge** — Track recurring issues across projects
- **Prevention over cure** — Pre-flight checklists catch issues early
- **Quality compounds** — Get better with every project

---

## Issue Tracking

### Issue Sources

```
ISSUE SOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auto-Created
├── Sentry errors (via webhook)
├── Client portal feedback
├── Failed deployments
└── Quality check failures

Manual
├── Self-reported bugs
├── Client-reported issues
└── Review findings
```

### Issue Structure

```typescript
interface Issue {
  id: string
  project: Project
  sprint?: Sprint
  task?: Task
  title: string
  description: string
  source: "SENTRY" | "CLIENT" | "DEPLOY" | "MANUAL"
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX"
  rootCause?: string
  resolution?: string
  timeToResolve?: number      // minutes
  lesson?: Lesson
  sentryEventId?: string
  createdAt: Date
  resolvedAt?: Date
}
```

### Issue Dashboard

```
ISSUES — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPEN                                                        3
──────────────────────────────────────────────────────────────────
🔴 CRITICAL — Payment webhook failing
   Source: Sentry • 2 hours ago
   [View →]

🟡 MEDIUM — Date picker shows wrong timezone
   Source: Client feedback • 1 day ago
   [View →]

🟢 LOW — Typo on confirmation page
   Source: Self-reported • 2 days ago
   [View →]

RESOLVED THIS SPRINT                                        7
──────────────────────────────────────────────────────────────────
✓ Form validation not showing errors (45m to resolve)
✓ Mobile nav not closing on click (20m)
✓ Image upload failing for large files (2h)
...

METRICS
──────────────────────────────────────────────────────────────────
Avg. time to resolve:    1.2 hours
Issues this sprint:      10
Resolved:               7 (70%)
From Sentry:            4
From Client:            3
```

### Sentry Integration

```
AUTO-CREATED FROM SENTRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error: Cannot read property 'id' of undefined
File: src/app/api/webhooks/stripe/route.ts:47

SENTRY DETAILS
──────────────────────────────────────────────────────────────────
Event ID: abc123...
First seen: 2 hours ago
Occurrences: 23
Users affected: 3

STACK TRACE
──────────────────────────────────────────────────────────────────
at handlePaymentIntent (route.ts:47)
at POST (route.ts:12)

[View in Sentry]  [Assign to Sprint]  [Mark as Duplicate]
```

---

## Root Cause Analysis

### Capturing Root Cause

```
RESOLVE ISSUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: Payment webhook failing

What was the root cause?
┌─────────────────────────────────────────────────────────────────┐
│ The webhook handler wasn't checking for the event type before   │
│ accessing payment_intent.id. Some Stripe events don't have      │
│ this property.                                                   │
└─────────────────────────────────────────────────────────────────┘

Category:
○ Missing validation
● Missing error handling
○ Wrong assumption
○ Integration issue
○ Performance
○ UI/UX
○ Other

How did you fix it?
┌─────────────────────────────────────────────────────────────────┐
│ Added event type checking and early return for unhandled types. │
│ Also added try/catch with proper error logging.                 │
└─────────────────────────────────────────────────────────────────┘

Create lesson from this? [✓]

[Resolve Issue]
```

---

## Lessons

### Lesson Structure

```typescript
interface Lesson {
  id: string
  issue?: Issue
  project?: Project
  title: string
  description: string
  category: string
  prevention: string          // How to prevent in future
  checklistItem?: ChecklistItem
  tags: string[]
  createdAt: Date
}
```

### Lesson View

```
LESSON LEARNED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always validate webhook event types

WHAT HAPPENED
──────────────────────────────────────────────────────────────────
Stripe webhook handler crashed because it assumed all events had
a payment_intent.id property. Some events (like checkout.session)
have different structures.

PROJECT: Results Roofing
ISSUE: Payment webhook failing
CATEGORY: Missing error handling

PREVENTION
──────────────────────────────────────────────────────────────────
1. Check event.type before accessing type-specific properties
2. Use early returns for unhandled event types
3. Wrap webhook handlers in try/catch
4. Log unhandled event types for monitoring

ADDED TO CHECKLIST
──────────────────────────────────────────────────────────────────
☑️ "Webhook handlers validate event type before processing"
   Added to: Integration Checklist

TAGS
──────────────────────────────────────────────────────────────────
#stripe #webhooks #error-handling #integration
```

### Lessons Library

```
LESSONS LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Search: [stripe                                           ]

RESULTS (5)
──────────────────────────────────────────────────────────────────
Always validate webhook event types
#stripe #webhooks #error-handling
From: Results Roofing • Jan 2026

Test Stripe webhooks locally with CLI
#stripe #testing #development
From: Galaxy Co • Dec 2025

Handle Stripe API version mismatches
#stripe #api #versioning
From: QuickClaims • Nov 2025

Verify webhook signatures in production
#stripe #security #webhooks
From: Multiple projects

Use idempotency keys for Stripe operations
#stripe #reliability #payments
From: Galaxy Co • Oct 2025
```

---

## Pre-Flight Checklists

### Checklist Structure

```typescript
interface ChecklistItem {
  id: string
  checklist: Checklist
  text: string
  description?: string
  lesson?: Lesson            // Source lesson
  isAutoGenerated: boolean
  order: number
}

interface Checklist {
  id: string
  name: string
  description: string
  type: "PRE_DEPLOY" | "PRE_SPRINT" | "CODE_REVIEW" | "INTEGRATION" | "CUSTOM"
  items: ChecklistItem[]
  projectType?: string       // "Next.js", "React Native", etc.
}
```

### Checklist Types

```
CHECKLISTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRE-DEPLOY                                               12 items
──────────────────────────────────────────────────────────────────
Run before every production deployment

PRE-SPRINT                                                8 items
──────────────────────────────────────────────────────────────────
Run at sprint start to ensure setup is complete

CODE REVIEW                                              15 items
──────────────────────────────────────────────────────────────────
Self-review checklist before committing

INTEGRATIONS
──────────────────────────────────────────────────────────────────
├── Stripe Checklist (9 items)
├── Clerk Checklist (6 items)
├── Supabase Checklist (7 items)
└── Sentry Checklist (5 items)

[+ Create Custom Checklist]
```

### Pre-Deploy Checklist

```
PRE-DEPLOY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: Results Roofing
Deploying to: Production

AUTOMATED CHECKS
──────────────────────────────────────────────────────────────────
✓ TypeScript: No errors
✓ ESLint: Passed
✓ Tests: 45/45 passing
✓ Build: Successful
✓ Lighthouse: Performance 92, Accessibility 100

MANUAL CHECKS
──────────────────────────────────────────────────────────────────
☐ All environment variables set in production
  [Learned from: Galaxy Co env var incident]

☐ Database migrations applied to production
  [Learned from: Results Roofing schema mismatch]

☐ Webhook URLs updated to production endpoints
  [Learned from: QuickClaims webhook failure]

☐ Error tracking verified in Sentry

☐ Smoke tested critical user flows

☐ Client notified of deployment

──────────────────────────────────────────────────────────────────
3 of 6 manual checks complete

[All Checks Complete → Deploy]
```

### Auto-Generated Checklist Items

When a lesson is created, the system suggests checklist items:

```
LESSON CREATED: Always validate webhook event types

SUGGESTED CHECKLIST ITEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on this lesson, add to checklist:

"Webhook handlers validate event type before processing"

Add to:
○ Pre-Deploy Checklist
● Integration Checklist (Stripe)
○ Code Review Checklist
○ Don't add

[Add to Checklist]  [Skip]
```

---

## Quality Metrics

### Metrics Dashboard

```
QUALITY METRICS — All Projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUGS SHIPPED TO PRODUCTION
──────────────────────────────────────────────────────────────────
Last 30 days:     3 bugs
Last 90 days:    12 bugs
Trend:           ↓ 25% fewer than previous quarter

TIME TO RESOLVE
──────────────────────────────────────────────────────────────────
Average:          1.8 hours
Critical bugs:    0.5 hours (target: <1 hour) ✓
High severity:    2.1 hours (target: <4 hours) ✓

BY CATEGORY (Last 90 days)
──────────────────────────────────────────────────────────────────
Missing validation     ████████          8
Integration issues     ██████            6
Error handling         ████              4
Wrong assumptions      ███               3
UI/UX                 ██                2

LESSONS CREATED
──────────────────────────────────────────────────────────────────
This month:       4
Total:           47
Checklist items: 23

CHECKLIST EFFECTIVENESS
──────────────────────────────────────────────────────────────────
Pre-deploy checklist catches: ~3 issues/month
Estimated bugs prevented:     ~2/month
```

### Project Quality Score

```
PROJECT QUALITY — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUALITY SCORE                                              87/100

BREAKDOWN
──────────────────────────────────────────────────────────────────
Bugs shipped:        3 (target: <5)         ✓ 95/100
Time to resolve:     1.2 hrs avg            ✓ 90/100
Test coverage:       78%                    ~ 78/100
Client issues:       2                      ✓ 85/100

COMPARED TO AVERAGE
──────────────────────────────────────────────────────────────────
Your avg bugs/project:     4.2
This project:              3     ↓ 28% better

ISSUES BY SPRINT
──────────────────────────────────────────────────────────────────
Sprint 1:  ██       2 issues
Sprint 2:  █        1 issue
Sprint 3:  (in progress)
```

---

## Prevention Engine

### Pattern Detection

```
RECURRING ISSUE DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Missing error handling" issues have occurred 4 times in the
last 3 months across different projects.

PATTERN
──────────────────────────────────────────────────────────────────
• Galaxy Co: API error not caught (Nov)
• QuickClaims: Form submission crash (Nov)
• Results Roofing: Webhook failure (Jan)
• Results Roofing: Upload error (Jan)

SUGGESTED ACTION
──────────────────────────────────────────────────────────────────
Add to Code Review Checklist:
"All async operations have try/catch with user-friendly errors"

[Add to Checklist]  [Dismiss]
```

### Smart Suggestions

```
STARTING SPRINT 3 — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WATCH OUT FOR
──────────────────────────────────────────────────────────────────
Based on Sprint 3 tasks and your history:

⚠️ "Stripe Connect Integration" task
   Your Stripe integrations average 1.5x estimate.
   Last 3 Stripe issues were error handling related.

   Review: Stripe Integration Checklist (9 items)
   [Open Checklist →]

⚠️ "Email notifications" task
   2 past issues with email template rendering.

   Lesson: "Test email templates in multiple clients"
   [View Lesson →]
```

---

## Client Feedback Loop

### Feedback from Portal

```
CLIENT FEEDBACK — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From: Tareq Othman
Page: Customer Dashboard Preview
Date: January 28, 2026

FEEDBACK
──────────────────────────────────────────────────────────────────
"The date on the project timeline is showing January 27 instead
of January 28. Timezone issue maybe?"

SCREENSHOT ATTACHED
[View Screenshot →]

AUTO-CATEGORIZED
──────────────────────────────────────────────────────────────────
Category: Bug Report
Severity: Medium (suggested)
Related: Date/time handling

[Create Issue]  [Reply to Client]  [Mark as Noted]
```

---

## Data Model

See `data-models.md` for complete schema. Key entities:
- `Issue`
- `Lesson`
- `Checklist`
- `ChecklistItem`
- `QualityMetric`

---

## Integrations

### Sentry
- Webhook creates issues automatically
- Links to Sentry event for details
- Stack trace included

### Client Portal
- Feedback creates issues
- Client sees issue status
- Resolution notifications

### Sprint Stack
- Issues assigned to sprints
- Impact on sprint progress
- Time tracked for fixes

### Daily Driver
- Open issues surfaced
- Critical issues prioritized
