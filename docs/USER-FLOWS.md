# User Flows

## Overview

Key user journeys through Nerve Agent, from starting a new project to shipping and getting paid.

---

## Flow 1: Starting a New Project

### Trigger
Client signs contract, project kicks off.

### Steps

```
1. CREATE PROJECT
   └─→ Dashboard → New Project
       • Enter project name
       • Select client (or create new)
       • Set billing type (hourly/fixed)
       • Set hourly rate or fixed amount

2. PLANNING WIZARD BEGINS
   └─→ Automatically opens Document 1
       • 8 documents, sequential
       • Can't skip ahead
       • AI assists with each section

3. COMPLETE PLANNING DOCUMENTS
   └─→ For each document (1-8):
       • Fill required sections
       • Review AI suggestions
       • Click "Approve Document"
       • Document locks, next unlocks

4. ROADMAP GENERATES
   └─→ After document 8 approved:
       • System generates project roadmap
       • All sprints pre-planned
       • Tasks with AI-adjusted estimates
       • Client timeline created

5. READY TO SPRINT
   └─→ Sprint 1 is ready to start
       • All tasks visible
       • Estimates adjusted from history
       • Agent-able tasks flagged
```

### Outcome
- Complete project documentation
- Pre-planned sprints for entire project
- Client portal automatically created
- Ready to begin Sprint 1

---

## Flow 2: Daily Work Session

### Trigger
Developer opens Nerve Agent in the morning.

### Steps

```
1. VIEW DAILY DRIVER
   └─→ Automatic landing page
       • Today's focus task displayed
       • Blockers cleared notifications
       • Client waiting items
       • Follow-ups due

2. START WORKING
   └─→ Click into today's focus task
       • Task details and acceptance criteria
       • Time tracking starts automatically
       • Desktop app detects VS Code activity

3. WORK ON TASK
   └─→ Code in VS Code/Cursor
       • Time auto-tracks based on window
       • Project detected from folder name
       • No manual tracking needed

4. COMPLETE TASK
   └─→ When done:
       • Mark task complete in Nerve Agent
       • Or use Cmd+Enter shortcut
       • Time automatically logged
       • Next task becomes focus

5. HIT A BLOCKER
   └─→ If blocked:
       • Click "I'm Blocked"
       • Describe blocker
       • Assign to: Me/Client/Third Party
       • Task moves to blocked status
       • Follow-up automatically scheduled

6. END OF DAY
   └─→ Review time tracked
       • See hours by project
       • Adjust if needed
       • Sprint progress updated
```

### Outcome
- Focused work on highest priority
- Time automatically tracked
- Blockers captured and scheduled
- Sprint progress visible

---

## Flow 3: Processing a Client Call

### Trigger
Developer finishes a call with a client.

### Steps

```
1. UPLOAD TRANSCRIPT
   └─→ Daily Driver or Project → Call Intelligence
       • Drag and drop transcript file
       • Or paste raw text
       • Select project

2. AI PROCESSES
   └─→ System analyzes transcript
       • Extracts TL;DR summary
       • Identifies decisions made
       • Extracts action items
       • Identifies blockers
       • Pulls key quotes

3. REVIEW BRIEF
   └─→ Call brief generated
       • Edit if needed
       • Add missing items
       • Correct any AI errors

4. ASSIGN ACTION ITEMS
   └─→ For each action item:
       • Confirm assignee (you/client)
       • Set due date
       • Convert to task (optional)
       • Convert to blocker (optional)

5. SHARE WITH CLIENT
   └─→ Optional:
       • Generate shareable brief
       • Send via email
       • Or publish to client portal

6. SCHEDULE FOLLOW-UPS
   └─→ System automatically:
       • Creates follow-ups for client items
       • Adds to follow-up queue
       • Will remind at appropriate intervals
```

### Outcome
- Searchable call record
- Decisions logged for future reference
- Action items tracked
- Follow-ups scheduled automatically

---

## Flow 4: Deploying to Staging

### Trigger
Sprint work ready for client review.

### Steps

```
1. INITIATE DEPLOY
   └─→ Sprint Stack → Deploy to Staging
       • Or use Agent Actions

2. PRE-FLIGHT CHECKS
   └─→ Automated checks run:
       • TypeScript compilation
       • ESLint/formatting
       • Tests pass
       • Build succeeds

3. MANUAL CHECKLIST
   └─→ Pre-deploy checklist appears:
       • Generated from past lessons
       • Check each item
       • All must be complete

4. DEPLOY EXECUTES
   └─→ Vercel deployment:
       • Preview URL generated
       • Changelog auto-created
       • Source maps uploaded to Sentry

5. CLIENT NOTIFIED
   └─→ Automatic notification:
       • Email sent to client
       • Portal updated with preview link
       • Test accounts provided

6. AWAIT FEEDBACK
   └─→ Client reviews in portal:
       • Can leave feedback on preview
       • Feedback creates issues automatically
       • You're notified of new feedback
```

### Outcome
- Staging deployed with checks passed
- Client automatically notified
- Feedback collected in one place
- Issues tracked from feedback

---

## Flow 5: Handling a Production Error

### Trigger
Sentry catches an error in production.

### Steps

```
1. ERROR CAPTURED
   └─→ Sentry webhook fires
       • Issue auto-created in Nerve Agent
       • Severity assigned (Critical/High/Medium/Low)
       • Linked to project

2. NOTIFICATION
   └─→ If critical:
       • Push notification sent
       • Appears in Daily Driver
       • Highlighted as urgent

3. INVESTIGATE
   └─→ Click into issue:
       • See Sentry details
       • Stack trace
       • Affected users
       • Link to Sentry event

4. FIX AND RESOLVE
   └─→ After fixing:
       • Document root cause
       • Describe resolution
       • Mark as resolved

5. CREATE LESSON
   └─→ System prompts:
       • "Create lesson from this?"
       • Lesson captures prevention
       • Suggests checklist item

6. UPDATE CHECKLIST
   └─→ If lesson created:
       • Add to appropriate checklist
       • Pre-deploy or code review
       • Prevents future occurrence
```

### Outcome
- Error tracked from detection to resolution
- Root cause documented
- Lesson learned captured
- Checklist updated to prevent recurrence

---

## Flow 6: Generating and Sending Invoice

### Trigger
Sprint completed, time to bill.

### Steps

```
1. OPEN FINANCIAL
   └─→ Financial → Create Invoice
       • Select project
       • Select date range

2. REVIEW BILLABLE TIME
   └─→ System shows:
       • All time entries in period
       • Grouped by task/sprint
       • Calculated at project rate

3. ADJUST IF NEEDED
   └─→ Optional adjustments:
       • Add line items
       • Remove non-billable
       • Add discount

4. PREVIEW INVOICE
   └─→ See formatted invoice:
       • Professional layout
       • All line items
       • Payment terms

5. SEND INVOICE
   └─→ Via Stripe:
       • Invoice created in Stripe
       • Email sent to client
       • Payment link included

6. TRACK PAYMENT
   └─→ When client pays:
       • Webhook updates status
       • Receipt auto-sent
       • Dashboard updated
       • Shows in Daily Driver
```

### Outcome
- Invoice generated from tracked time
- Sent via Stripe with payment link
- Payment tracked automatically
- No manual reconciliation

---

## Flow 7: Setting Up a New Project (with Agents)

### Trigger
Planning complete, Sprint 1 includes setup tasks.

### Steps

```
1. VIEW SPRINT 1
   └─→ Sprint Stack shows setup tasks:
       • Create GitHub repository ⚡
       • Initialize Next.js project ⚡
       • Set up Vercel ⚡
       • Configure Supabase ⚡
       • (⚡ = Agent-able)

2. RUN AGENT
   └─→ Click "Run Agent" on first task
       • Agent preview shows actions
       • Review what will be created
       • Click confirm

3. AGENT EXECUTES
   └─→ Watch progress:
       • Creates GitHub repo
       • Initializes project
       • Installs dependencies
       • Connects to Vercel
       • All automated

4. REPEAT FOR SETUP TASKS
   └─→ Run agents for remaining setup:
       • Each task takes 1-3 minutes
       • Instead of 1-2 hours manual

5. VERIFY SETUP
   └─→ Agent completion summary:
       • Links to all created resources
       • Env vars configured
       • Clone command ready

6. START DEVELOPMENT
   └─→ Clone repo and begin:
       • All infrastructure ready
       • Standard config applied
       • Ready for feature work
```

### Outcome
- Complete project infrastructure in minutes
- Standard setup applied consistently
- No manual configuration errors
- Ready to write feature code

---

## Flow 8: End of Sprint Review

### Trigger
Sprint deadline reached.

### Steps

```
1. SPRINT COMPLETES
   └─→ All tasks done (or deadline hit)
       • Sprint marked complete
       • Summary generated

2. REVIEW METRICS
   └─→ Sprint report shows:
       • Tasks completed vs planned
       • Hours actual vs estimated
       • Estimate accuracy
       • Blockers encountered

3. UPDATE ESTIMATES
   └─→ System learns:
       • Updates estimate model
       • Factors your velocity
       • Adjusts future sprints

4. CLIENT NOTIFICATION
   └─→ Portal updated:
       • Sprint progress shows 100%
       • Deliverables listed
       • Next sprint preview

5. STAGING DEPLOY
   └─→ If not already deployed:
       • Prompt to deploy latest
       • Client can review completed work

6. START NEXT SPRINT
   └─→ Click "Start Sprint N+1"
       • Tasks already planned
       • Estimates already adjusted
       • Ready to execute
```

### Outcome
- Sprint documented and closed
- Estimates improved for future
- Client sees progress
- Next sprint ready to start

---

## Flow 9: Reusing Code from Vault

### Trigger
Starting a feature you've built before.

### Steps

```
1. RECOGNIZE PATTERN
   └─→ Task: "Implement Stripe payments"
       • You've done this before
       • Check Vault first

2. SEARCH VAULT
   └─→ Vault → Search "stripe"
       • Find "Stripe Checkout Flow" block
       • See tech stack matches
       • Review files included

3. COPY TO PROJECT
   └─→ Click "Copy to Project"
       • Select target project
       • Review file destinations
       • See dependencies to install

4. INSTALL
   └─→ System copies files:
       • Places in correct locations
       • Runs npm install
       • Adds env var placeholders

5. CUSTOMIZE
   └─→ Adjust for this project:
       • Update product names
       • Adjust webhook logic
       • Add project-specific features

6. TRACK TIME SAVINGS
   └─→ Task completes faster:
       • Actual time < estimate
       • Vault usage logged
       • Pattern confirmed as useful
```

### Outcome
- Hours of work reduced to minutes
- Consistent implementation
- Battle-tested code reused
- Velocity increased

---

## Flow 10: Client Portal Feedback Loop

### Trigger
Client reviews staging and leaves feedback.

### Steps

```
1. CLIENT ACCESSES PORTAL
   └─→ Magic link email
       • Click to access
       • No password needed

2. VIEWS PROGRESS
   └─→ Portal dashboard:
       • Sprint progress
       • Milestone timeline
       • Pending items

3. OPENS STAGING PREVIEW
   └─→ Click staging link:
       • Embedded preview
       • Or opens in new tab

4. LEAVES FEEDBACK
   └─→ Feedback widget:
       • Click on preview to pin
       • Or describe in text
       • Attach screenshot
       • Categorize (bug/suggestion/question)

5. DEVELOPER NOTIFIED
   └─→ Notification in Daily Driver:
       • "Client feedback: 2 new comments"
       • Appears in Client Waiting section

6. RESPOND TO FEEDBACK
   └─→ View and respond:
       • Acknowledge feedback
       • Create issue if bug
       • Mark resolved when fixed

7. CLIENT SEES RESOLUTION
   └─→ Portal updates:
       • Feedback shows response
       • Status shows resolved
       • Trust maintained
```

### Outcome
- Feedback captured where it happens
- No email threads to track
- Issues automatically tracked
- Client feels heard and informed
