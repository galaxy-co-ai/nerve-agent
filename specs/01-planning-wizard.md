# Planning Wizard

## Overview

The Planning Wizard is a guided framework of 8 documents that must be completed in order before development begins. The system prevents moving to the Sprint phase until all documents are approved.

## Philosophy

- **No blank pages** — Every document has guided prompts
- **Required fields** — Nothing gets skipped
- **Approval gates** — Explicit sign-off before moving on
- **AI-assisted** — Pull from call briefs, transcripts, past projects

## The 8 Documents

### 1. Project Brief
**Purpose:** Capture the who, what, and why.

**Sections:**
- Client Information
  - Company name
  - Primary contact
  - Contact email
  - Communication preferences
- Project Overview
  - Project name
  - One-sentence description
  - Problem being solved
- Success Criteria
  - How will we know this project succeeded?
  - Key metrics
- Constraints
  - Budget range
  - Timeline constraints
  - Technical constraints
  - Other limitations

**AI Assist:**
- Pre-fill from call briefs
- Suggest success criteria based on project type

---

### 2. Technical Discovery
**Purpose:** Understand the technical landscape.

**Sections:**
- Tech Stack Decisions
  - Frontend framework
  - Backend approach
  - Database choice
  - Hosting platform
- Existing Systems
  - Current tech the client uses
  - Systems we need to integrate with
  - Data migration needs
- Dependencies
  - Third-party services required
  - External APIs
  - Credentials we'll need
- Risks & Unknowns
  - Technical risks identified
  - Areas of uncertainty
  - Spike tasks needed

**AI Assist:**
- Suggest tech stack based on project type
- Flag common integration gotchas

---

### 3. Scope Definition
**Purpose:** Define exactly what's in and what's out.

**Sections:**
- Features In Scope
  - Core features (must have)
  - Secondary features (should have)
- Features Out of Scope
  - Explicitly excluded features
  - Future phase candidates
- Deliverables
  - What exactly will be delivered
  - Format of deliverables
- Definition of Done
  - What does "complete" look like
  - Acceptance criteria

**AI Assist:**
- Compare to similar past projects
- Flag scope creep risks

---

### 4. Information Architecture
**Purpose:** Map out the structure.

**Sections:**
- Sitemap
  - Page hierarchy
  - Navigation structure
- User Flows
  - Key user journeys
  - Decision points
- Data Models
  - Core entities
  - Relationships
  - Key fields
- States & Transitions
  - Important state machines
  - Status flows

**AI Assist:**
- Suggest common patterns for project type
- Generate initial data model from description

---

### 5. Design System & UI Specs
**Purpose:** Define the visual language.

**Sections:**
- Design Direction
  - Mood/aesthetic
  - Reference sites
  - Client brand guidelines
- Component Needs
  - Components required from UI Library
  - Custom components needed
- Design Tokens
  - Colors (override defaults?)
  - Typography
  - Spacing
- Responsive Strategy
  - Breakpoints
  - Mobile-first or desktop-first
  - Critical mobile considerations

**AI Assist:**
- Pull components from UI Library
- Suggest tokens based on brand colors

---

### 6. Integration Mapping
**Purpose:** Document all third-party integrations.

**Sections:**
- Integration List
  - Service name
  - Purpose
  - API type (REST, GraphQL, Webhook)
  - Documentation URL
- Credentials Needed
  - What credentials required
  - Who provides them
  - Status (have/need)
- API Contracts
  - Key endpoints we'll use
  - Data formats
  - Rate limits
- Webhook Requirements
  - Webhooks we need to receive
  - Webhooks we need to send
- Fallback Plans
  - What if integration is unavailable
  - Graceful degradation

**AI Assist:**
- Pre-fill common integration patterns
- Link to Vault blocks for known integrations

---

### 7. Timeline & Milestones
**Purpose:** Plan the delivery schedule.

**Sections:**
- Phases
  - Phase breakdown
  - Phase descriptions
- Milestones
  - Key checkpoints
  - Client review points
- Sprint Allocation
  - Estimated sprints per phase
  - Review sprint estimates with AI
- Delivery Dates
  - Target dates
  - Hard deadlines
  - Buffer built in

**AI Assist:**
- Generate sprint breakdown from scope
- Adjust estimates based on historical data
- Flag unrealistic timelines

---

### 8. Risk Register
**Purpose:** Identify and plan for risks.

**Sections:**
- Technical Risks
  - Risk description
  - Likelihood (Low/Medium/High)
  - Impact (Low/Medium/High)
  - Mitigation strategy
- External Risks
  - Client-dependent risks
  - Third-party risks
  - Timeline risks
- Fallback Plans
  - If X happens, we'll do Y
- Monitoring
  - How we'll detect issues early

**AI Assist:**
- Suggest risks based on project type
- Pull lessons from similar past projects

---

## Workflow

### Document Status Flow
```
NOT_STARTED → IN_PROGRESS → BLOCKED → COMPLETE
                    ↓           ↑
                    └───────────┘
```

### Approval Flow
Each document requires explicit approval:
1. Complete all required fields
2. Review AI suggestions
3. Click "Approve Document"
4. Document locks (editable only via explicit unlock)

### Blocking Rules
- Cannot start doc N until doc N-1 is approved
- Cannot generate Sprint Stack until all 8 approved
- Blocked status requires blocker notes

---

## UI Design

### Progress View
```
PROJECT PLANNING                                    Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 1. Project Brief                              COMPLETE
✓ 2. Technical Discovery                        COMPLETE
✓ 3. Scope Definition                           COMPLETE
✓ 4. Information Architecture                   COMPLETE
○ 5. Design System & UI Specs                   IN PROGRESS
○ 6. Integration Mapping                        BLOCKED
○ 7. Timeline & Milestones                      NOT STARTED
○ 8. Risk Register                              NOT STARTED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLANNING PROGRESS                                          50%
[████████████████░░░░░░░░░░░░░░░░]

⚠️  Cannot generate Sprint Stack until all documents complete
```

### Document Editor
- Split view: prompts on left, inputs on right
- Auto-save
- AI assist button per section
- Approval button at bottom
- Blocker notes field (when blocked)

---

## Output

When all 8 documents are approved, system generates:

1. **Project Roadmap**
   - Visual timeline of all phases
   - Milestone markers
   - Dependency arrows

2. **Sprint Stack**
   - All sprints pre-planned
   - Tasks with AI-adjusted estimates
   - Agent-able tasks flagged

3. **Client Timeline**
   - Simplified view for client portal
   - Key dates and milestones

4. **Risk Monitoring Checklist**
   - Risks to watch
   - Check-in schedule
