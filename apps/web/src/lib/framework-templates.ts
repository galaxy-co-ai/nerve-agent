// Framework document templates with sections for AI generation

export interface DocumentSection {
  title: string
  template: string
}

export interface DocumentTemplate {
  number: number
  name: string
  description: string
  sections: DocumentSection[]
}

export const DOCUMENT_TEMPLATES: Record<number, DocumentTemplate> = {
  1: {
    number: 1,
    name: "Idea Audit",
    description: "Market validation and go/no-go decision",
    sections: [
      {
        title: "Header & Raw Idea Input",
        template: `# Idea Audit

**Idea:** [Working Title]
**Submitted By:** [Name]
**Audit Date:** [Date]
**Auditor:** Claude
**Status:** In Progress

---

## Raw Idea Input

### The Pitch
[Capture the idea as presented — unfiltered, unstructured.]

### Initial Assumptions
What do you believe to be true about this idea?
- [Assumption 1]
- [Assumption 2]
- [Assumption 3]

### Why Now?
What makes this the right time for this idea?
- [Reason 1]
- [Reason 2]

### Your Unfair Advantage
What do you have that others don't?
- [Advantage 1]
- [Advantage 2]`,
      },
      {
        title: "Problem Validation",
        template: `## Problem Validation

### Problem Statement Assessment

| Criterion | Finding | Score |
|-----------|---------|-------|
| Is this a real problem people have? | [Evidence] | /10 |
| How painful is this problem? (1=annoyance, 10=critical) | [Assessment] | /10 |
| How frequently do people encounter this? | [Frequency] | /10 |
| Are people actively seeking solutions? | [Evidence] | /10 |
| Are people paying for current solutions? | [Evidence] | /10 |

**Problem Validation Score:** [X] / 50

**Assessment:**
[2-3 sentences on whether this is a problem worth solving]`,
      },
      {
        title: "Market Analysis",
        template: `## Market Analysis

### Target Market

| Attribute | Value |
|-----------|-------|
| Primary audience | [Who specifically] |
| Market size (TAM) | [Estimate or range] |
| Serviceable market (SAM) | [Realistic reach] |
| Initial target (SOM) | [First 100-1000 users] |

### Market Trends

| Trend | Direction | Impact on Idea |
|-------|-----------|----------------|
| [Trend 1] | Growing / Stable / Declining | [How it affects viability] |
| [Trend 2] | Growing / Stable / Declining | [How it affects viability] |
| [Trend 3] | Growing / Stable / Declining | [How it affects viability] |

### Timing Assessment

| Factor | Status | Notes |
|--------|--------|-------|
| Technology readiness | Ready / Emerging / Not ready | [Details] |
| Market readiness | Ready / Emerging / Not ready | [Details] |
| Regulatory environment | Favorable / Neutral / Hostile | [Details] |
| Economic conditions | Favorable / Neutral / Hostile | [Details] |

**Market Score:** [X] / 10`,
      },
      {
        title: "Competitor Analysis",
        template: `## Competitor Analysis

### Direct Competitors

| Competitor | What They Do | Strengths | Weaknesses | Pricing |
|------------|--------------|-----------|------------|---------|
| [Name] | [Description] | [What they do well] | [Where they fail] | [Model] |
| [Name] | [Description] | [What they do well] | [Where they fail] | [Model] |
| [Name] | [Description] | [What they do well] | [Where they fail] | [Model] |

### Indirect Competitors / Alternatives

| Alternative | How People Use It | Why They'd Switch |
|-------------|-------------------|-------------------|
| [Solution] | [Current behavior] | [Your advantage] |
| [Solution] | [Current behavior] | [Your advantage] |

### Competitive Landscape Assessment

| Factor | Finding |
|--------|---------|
| Market saturation | Low / Medium / High |
| Barrier to entry | Low / Medium / High |
| Differentiation opportunity | Low / Medium / High |
| Winner-take-all dynamics | Yes / No / Partial |

**Why You Win:**
[2-3 sentences on your specific competitive advantage]

**Competitive Score:** [X] / 10`,
      },
      {
        title: "Feasibility Check",
        template: `## Feasibility Check

### Technical Feasibility

| Aspect | Assessment | Notes |
|--------|------------|-------|
| Core technology exists? | Yes / Partial / No | [Details] |
| You can build it? | Yes / With help / No | [Skills gap if any] |
| Dependencies available? | Yes / Partial / No | [APIs, services needed] |
| Scalability concerns? | None / Manageable / Blocking | [Details] |

### Resource Feasibility

| Resource | Required | Available | Gap |
|----------|----------|-----------|-----|
| Time | [Estimate] | [Your capacity] | [Shortfall] |
| Money | [Estimate] | [Your budget] | [Shortfall] |
| Skills | [List] | [Your skills] | [Missing] |
| Tools/Infrastructure | [List] | [What you have] | [Missing] |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Plan] |
| [Risk 2] | Low/Med/High | Low/Med/High | [Plan] |
| [Risk 3] | Low/Med/High | Low/Med/High | [Plan] |

**Feasibility Score:** [X] / 10`,
      },
      {
        title: "Business Model Viability",
        template: `## Business Model Viability

### Revenue Model

| Model Type | Fit | Notes |
|------------|-----|-------|
| One-time purchase | Good / Possible / Poor | [Why] |
| Subscription | Good / Possible / Poor | [Why] |
| Freemium | Good / Possible / Poor | [Why] |
| Usage-based | Good / Possible / Poor | [Why] |
| Marketplace/Commission | Good / Possible / Poor | [Why] |

**Recommended Model:** [Model] because [reason]

### Unit Economics (Estimated)

| Metric | Estimate | Confidence |
|--------|----------|------------|
| Price point | [Amount] | Low / Med / High |
| Customer acquisition cost | [Amount] | Low / Med / High |
| Lifetime value | [Amount] | Low / Med / High |
| LTV:CAC ratio | [Ratio] | Low / Med / High |
| Payback period | [Months] | Low / Med / High |

### Path to Revenue

| Milestone | Target | Confidence |
|-----------|--------|------------|
| First paying customer | [Timeframe] | Low / Med / High |
| Break-even | [Timeframe] | Low / Med / High |
| Sustainable revenue | [Timeframe] | Low / Med / High |

**Business Model Score:** [X] / 10`,
      },
      {
        title: "Audit Summary & Verdict",
        template: `## Audit Summary

### Score Card

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Problem Validation | /50 | 30% | |
| Market Analysis | /10 | 20% | |
| Competitive Position | /10 | 20% | |
| Feasibility | /10 | 15% | |
| Business Model | /10 | 15% | |
| **TOTAL** | | **100%** | **/100** |

### Strengths
- [Key strength 1]
- [Key strength 2]
- [Key strength 3]

### Concerns
- [Key concern 1]
- [Key concern 2]
- [Key concern 3]

### Critical Questions Remaining
- [Question that must be answered before proceeding]
- [Question that must be answered before proceeding]

---

## Verdict

**Total Score:** [X] / 100

**Verdict:** PROCEED | PIVOT | KILL

**Rationale:**
[3-5 sentences explaining the verdict and key factors]

**If PROCEED — Next Steps:**
1. Tighten idea into executive summary
2. User approves executive summary
3. Begin 02-Project Brief with Claude

---

## Approval

| Role | Decision | Date | Notes |
|------|----------|------|-------|
| Claude (Auditor) | PROCEED / PIVOT / KILL | [Date] | [Key rationale] |
| You (Founder) | ACCEPT / REJECT / DISCUSS | [Date] | [Your decision] |

---

**End of Idea Audit**`,
      },
    ],
  },
  2: {
    number: 2,
    name: "Project Brief",
    description: "Problem, vision, scope, and constraints",
    sections: [
      {
        title: "Header & Problem Statement",
        template: `# Project Brief

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft

---

## Problem Statement

[WHO] experiences [WHAT PROBLEM] when [SITUATION].

This causes [NEGATIVE OUTCOME] resulting in [MEASURABLE IMPACT].

Current solutions fail because [REASON].`,
      },
      {
        title: "Vision & Success Metrics",
        template: `## Vision

[ONE SENTENCE describing the end state when this project succeeds.]

When complete, users will be able to [CAPABILITY] without [CURRENT FRICTION].

---

## Success Metrics

| Metric | Current State | Target | Measurement Method |
|--------|---------------|--------|-------------------|
| [Metric 1] | [Baseline or N/A] | [Goal] | [How measured] |
| [Metric 2] | [Baseline or N/A] | [Goal] | [How measured] |
| [Metric 3] | [Baseline or N/A] | [Goal] | [How measured] |`,
      },
      {
        title: "Scope",
        template: `## Scope

### In Scope
- [Feature/capability 1]
- [Feature/capability 2]
- [Feature/capability 3]
- [Feature/capability 4]

### Out of Scope
- [Explicitly excluded item 1]
- [Explicitly excluded item 2]
- [Explicitly excluded item 3]

### Deferred to Future
- [Item for v2] — v2
- [Item for v2] — v2
- [Item for v3] — v3`,
      },
      {
        title: "Assumptions & Constraints",
        template: `## Assumptions

| Assumption | Risk if Wrong | Mitigation |
|------------|---------------|------------|
| [Assumption 1] | [Impact if false] | [Backup plan] |
| [Assumption 2] | [Impact if false] | [Backup plan] |
| [Assumption 3] | [Impact if false] | [Backup plan] |

---

## Constraints

| Type | Constraint | Rationale |
|------|------------|-----------|
| Time | [Deadline or timeline] | [Why this limit exists] |
| Budget | [Amount or "Solo/bootstrap"] | [Why this limit exists] |
| Technical | [Technical limitation] | [Why this limit exists] |
| Resource | [Resource limitation] | [Why this limit exists] |

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Problem Statement identifies specific user and quantified impact
- [ ] Vision is achievable and ties to Problem Statement
- [ ] All Success Metrics are measurable post-launch
- [ ] Scope has explicit Out of Scope items (not empty)
- [ ] All Assumptions have mitigation paths
- [ ] All Constraints have rationale
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of Project Brief**`,
      },
    ],
  },
  3: {
    number: 3,
    name: "Product Requirements Document",
    description: "User personas, stories, features, and acceptance criteria",
    sections: [
      {
        title: "Header & User Personas",
        template: `# Product Requirements Document (PRD)

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft | Locked
**Brief Reference:** [Link to Project Brief]

---

## User Personas

### Persona: [Name]

| Attribute | Description |
|-----------|-------------|
| **Role** | [Job title/description] |
| **Goals** | [What they're trying to accomplish] |
| **Pain Points** | [Current frustrations] |
| **Technical Proficiency** | Low / Medium / High |
| **Usage Frequency** | Daily / Weekly / Monthly |

---

### Persona: [Name]

| Attribute | Description |
|-----------|-------------|
| **Role** | [Job title/description] |
| **Goals** | [What they're trying to accomplish] |
| **Pain Points** | [Current frustrations] |
| **Technical Proficiency** | Low / Medium / High |
| **Usage Frequency** | Daily / Weekly / Monthly |`,
      },
      {
        title: "User Stories",
        template: `## User Stories

### Epic: [Epic Name]

---

#### Story US-001: [Title]

**As a** [persona],
**I want** [capability],
**So that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1 — binary, testable]
- [ ] [Criterion 2 — binary, testable]
- [ ] [Criterion 3 — binary, testable]

---

#### Story US-002: [Title]

**As a** [persona],
**I want** [capability],
**So that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1 — binary, testable]
- [ ] [Criterion 2 — binary, testable]

---

### Epic: [Epic Name]

---

#### Story US-003: [Title]

**As a** [persona],
**I want** [capability],
**So that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1 — binary, testable]
- [ ] [Criterion 2 — binary, testable]`,
      },
      {
        title: "Feature List",
        template: `## Feature List

### Must Have (MVP)

| ID | Feature | User Story | Complexity | Notes |
|----|---------|------------|------------|-------|
| F1 | [Feature name] | US-001 | S / M / L / XL | |
| F2 | [Feature name] | US-001 | S / M / L / XL | |
| F3 | [Feature name] | US-002 | S / M / L / XL | |

### Should Have (v1.1)

| ID | Feature | User Story | Complexity | Notes |
|----|---------|------------|------------|-------|
| F4 | [Feature name] | US-003 | S / M / L / XL | |
| F5 | [Feature name] | US-003 | S / M / L / XL | |

### Could Have (Future)

| ID | Feature | User Story | Complexity | Notes |
|----|---------|------------|------------|-------|
| F6 | [Feature name] | US-004 | S / M / L / XL | |

### Won't Have (Explicitly Excluded)

| Feature | Reason for Exclusion |
|---------|----------------------|
| [Feature name] | [Why not included] |
| [Feature name] | [Why not included] |`,
      },
      {
        title: "Acceptance Criteria Matrix",
        template: `## Acceptance Criteria Matrix

Master list of all acceptance criteria for traceability.

| Feature ID | Criterion | Test Method | Pass Definition |
|------------|-----------|-------------|-----------------|
| F1 | [Criterion from US-001] | Manual / Auto | [What constitutes pass] |
| F1 | [Criterion from US-001] | Manual / Auto | [What constitutes pass] |
| F2 | [Criterion from US-001] | Manual / Auto | [What constitutes pass] |
| F3 | [Criterion from US-002] | Manual / Auto | [What constitutes pass] |`,
      },
      {
        title: "Dependencies & Edge Cases",
        template: `## Dependencies

| Dependency | Type | Owner | Risk Level | Fallback |
|------------|------|-------|------------|----------|
| [External API/Service] | External API | [Company/Team] | Low / Med / High | [Alternative approach] |
| [Internal system] | Internal Service | [Team] | Low / Med / High | [Alternative approach] |
| [Data requirement] | Data | [Source] | Low / Med / High | [Alternative approach] |

---

## Edge Cases

| Feature ID | Edge Case | Expected Behavior |
|------------|-----------|-------------------|
| F1 | [Exception scenario] | [How system responds] |
| F1 | [Exception scenario] | [How system responds] |
| F2 | [Exception scenario] | [How system responds] |

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Every persona appears in at least one User Story
- [ ] Every User Story has ≥2 acceptance criteria
- [ ] Every Feature has an ID and traces to a User Story
- [ ] "Won't Have" section is populated (not empty)
- [ ] Every acceptance criterion has a Pass Definition
- [ ] Every dependency has a Fallback or explicit risk acceptance
- [ ] All edge cases have Expected Behavior defined
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of PRD**`,
      },
    ],
  },
  4: {
    number: 4,
    name: "Technical Architecture Document",
    description: "System architecture, tech stack, and API design",
    sections: [
      {
        title: "Header & System Overview",
        template: `# Technical Architecture Document (TAD)

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft | Locked
**PRD Reference:** [Link to PRD]

---

## System Overview

### Architecture Diagram

\`\`\`
[Include diagram showing the overall architecture]

Example structure:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│  (Next.js)  │     │  (Node.js)  │     │  (Postgres) │
└─────────────┘     └─────────────┘     └─────────────┘
\`\`\`

### System Description

[2-3 paragraphs describing the overall architecture, data flow, and key design principles.]

### Key Architectural Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| [Decision 1] | [Option A, B, C] | [Choice] | [Why this was chosen] |
| [Decision 2] | [Option A, B, C] | [Choice] | [Why this was chosen] |
| [Decision 3] | [Option A, B, C] | [Choice] | [Why this was chosen] |`,
      },
      {
        title: "Tech Stack",
        template: `## Tech Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Frontend | [Framework] | [x.x.x] | [Project-specific reason] |
| Backend | [Framework] | [x.x.x] | [Project-specific reason] |
| Database | [DB] | [x.x.x] | [Project-specific reason] |
| ORM/Query | [Tool] | [x.x.x] | [Project-specific reason] |
| Auth | [Solution] | [x.x.x] | [Project-specific reason] |
| Hosting | [Platform] | [N/A] | [Project-specific reason] |
| CI/CD | [Tool] | [N/A] | [Project-specific reason] |`,
      },
      {
        title: "Component Design",
        template: `## Component Design

---

### Component: [Name]

**ID:** C1
**Responsibility:** [Single sentence — what this component owns]

**Interfaces:**
- **Input:** [What it receives, from where]
- **Output:** [What it produces, to where]

**Dependencies:**
- [Component/service this depends on]
- [External API if applicable]

**Internal Structure:**

\`\`\`
[Diagram or description of internal design]
\`\`\`

**Key Implementation Notes:**
- [Important detail for implementer]
- [Important detail for implementer]

---

### Component: [Name]

**ID:** C2
**Responsibility:** [Single sentence — what this component owns]

**Interfaces:**
- **Input:** [What it receives, from where]
- **Output:** [What it produces, to where]

**Dependencies:**
- [Component/service this depends on]

**Internal Structure:**

\`\`\`
[Diagram or description of internal design]
\`\`\`

**Key Implementation Notes:**
- [Important detail for implementer]`,
      },
      {
        title: "Data Design",
        template: `## Data Design

### Entity Relationship Diagram

\`\`\`
[Include ERD — Mermaid, ASCII, or description]

Example:
┌──────────────┐       ┌──────────────┐
│    Users     │       │   Projects   │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ email        │  │    │ name         │
│ created_at   │  └───▶│ user_id (FK) │
└──────────────┘       │ created_at   │
                       └──────────────┘
\`\`\`

### Schema Definitions

#### Table: [Table Name]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| [column] | [type] | [constraints] | [description] |
| [column] | [type] | [constraints] | [description] |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Indexes:**
- \`idx_[table]_[column]\` — [Purpose]

---

#### Table: [Table Name]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| [column] | [type] | [constraints] | [description] |
| [foreign_key] | UUID | FK → [table].id | [relationship description] |

**Indexes:**
- \`idx_[table]_[column]\` — [Purpose]

---

### Data Flow

[Describe how data moves through the system — from user input to storage to output]`,
      },
      {
        title: "API Design",
        template: `## API Design

---

### POST /api/[resource]

**Purpose:** [What this endpoint does]
**Auth:** Required / Public / Admin-only

**Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| [field] | [type] | Yes | [description] |
| [field] | [type] | No | [description] |

**Response (201):**

\`\`\`json
{
  "id": "uuid — Created resource ID",
  "field": "type — description"
}
\`\`\`

**Error Responses:**

| Code | Condition | Response |
|------|-----------|----------|
| 400 | Invalid input | \`{ "error": "Validation failed", "details": [...] }\` |
| 401 | Not authenticated | \`{ "error": "Authentication required" }\` |
| 409 | Resource exists | \`{ "error": "Resource already exists" }\` |

---

### GET /api/[resource]/:id

**Purpose:** [What this endpoint does]
**Auth:** Required / Public / Admin-only

**Request:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Resource identifier |

**Response (200):**

\`\`\`json
{
  "id": "uuid",
  "field": "type — description"
}
\`\`\`

**Error Responses:**

| Code | Condition | Response |
|------|-----------|----------|
| 401 | Not authenticated | \`{ "error": "Authentication required" }\` |
| 404 | Not found | \`{ "error": "Resource not found" }\` |`,
      },
      {
        title: "Security & Error Handling",
        template: `## Security Model

### Authentication

| Attribute | Value |
|-----------|-------|
| Method | [JWT / Session / OAuth / etc.] |
| Provider | [Service or self-hosted] |
| Token Lifetime | [Duration] |
| Refresh Strategy | [How tokens are refreshed] |

### Authorization

| Role | Permissions |
|------|-------------|
| [Role 1] | [What they can access/do] |
| [Role 2] | [What they can access/do] |
| [Admin] | [Full access description] |

### Data Protection

| Aspect | Implementation |
|--------|----------------|
| Encryption at Rest | [Yes/No — method] |
| Encryption in Transit | [TLS version] |
| PII Handling | [Approach — masking, encryption, etc.] |
| Data Retention | [Policy] |

---

## Error Handling

### Error Categories

| Category | Example | Handling Strategy | User Message |
|----------|---------|-------------------|--------------|
| Validation | Invalid email format | Return 400, list errors | "Please check your input" |
| Authentication | Expired token | Return 401, redirect to login | "Please sign in again" |
| Authorization | Insufficient permissions | Return 403 | "You don't have access" |
| Not Found | Resource doesn't exist | Return 404 | "Not found" |
| Rate Limit | Too many requests | Return 429, include retry-after | "Please slow down" |
| System | Database connection lost | Retry 3x, log, alert | "Something went wrong" |

### Logging Strategy

| Attribute | Value |
|-----------|-------|
| Log Levels | Debug / Info / Warn / Error |
| Destination | [Service — e.g., CloudWatch, Datadog] |
| Retention | [Duration] |
| PII Handling | [Redacted / Hashed / Excluded] |

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Architecture diagram exists and matches description
- [ ] Every technology has a version and justification
- [ ] Every component has an ID (C1, C2, etc.) for MTS traceability
- [ ] Every component has clear responsibility and interfaces
- [ ] All database tables/collections are defined with all fields
- [ ] Every API endpoint is fully specified (request, response, errors)
- [ ] Security model covers auth, authorization, and data protection
- [ ] Error handling covers all categories with user messages
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of TAD**`,
      },
    ],
  },
  5: {
    number: 5,
    name: "AI Collaboration Protocol",
    description: "How you and Claude work together",
    sections: [
      {
        title: "Header & Collaboration Model",
        template: `# AI Collaboration Protocol

**Project:** [Project Name]
**Version:** 1.0
**Created:** [Date]
**Author:** [Name]
**Status:** Draft | Locked
**TAD Reference:** [Link to TAD]

---

## Overview

This document defines how you and Claude work together throughout this project. It establishes communication patterns, decision boundaries, and quality standards.

---

## Collaboration Model

### Roles

| Role | Entity | Responsibilities |
|------|--------|------------------|
| **Director** | You | Final decisions, approvals, vision, business context |
| **Executor** | Claude | Research, drafting, implementation, analysis, suggestions |

### Decision Authority

| Decision Type | Authority | Process |
|---------------|-----------|---------|
| Scope changes | Director | Claude proposes, you approve |
| Technical approach | Shared | Claude recommends, you approve major choices |
| Implementation details | Executor | Claude decides within approved approach |
| Quality standards | Director | You define, Claude enforces |
| Timeline/priorities | Director | You set, Claude advises on feasibility |

### Interaction Modes

| Mode | When Used | Claude's Behavior |
|------|-----------|-------------------|
| **Interview** | Gathering requirements | Ask questions, don't assume |
| **Draft** | Creating documents/code | Produce complete work, explain reasoning |
| **Review** | Checking your work | Identify issues, suggest improvements |
| **Execute** | Following approved plan | Work step-by-step, report progress |
| **Advise** | You're making a decision | Present options with tradeoffs, recommend |`,
      },
      {
        title: "Communication Standards",
        template: `## Communication Standards

### Claude's Communication Style

| Attribute | Standard |
|-----------|----------|
| Tone | Direct, professional, concise |
| Opinions | State them clearly, don't hedge unnecessarily |
| Disagreement | Voice concerns, explain reasoning, respect final decision |
| Uncertainty | Acknowledge when unsure, don't guess |
| Questions | Ask specific questions, not open-ended |
| Progress updates | Report what was done, what's next, any blockers |

### Interaction Patterns

**When Claude needs a decision:**
\`\`\`
DECISION NEEDED: [Brief description]

Options:
A) [Option] — [Tradeoff]
B) [Option] — [Tradeoff]

Recommendation: [A/B] because [reason]

Waiting for your choice before proceeding.
\`\`\`

**When Claude encounters a blocker:**
\`\`\`
BLOCKED: [What's blocking]

Tried: [What was attempted]
Need: [What would unblock]

Options:
1) [Workaround if any]
2) [Alternative approach]
3) [Wait for resolution]

Recommendation: [Option] because [reason]
\`\`\`

**When Claude completes a task:**
\`\`\`
COMPLETE: [Task name]

Done:
- [What was accomplished]
- [What was accomplished]

Files: [Created/modified]

Next: [What's queued next]

Ready to proceed? [Or specific question if needed]
\`\`\``,
      },
      {
        title: "Document & Code Workflow",
        template: `## Document Workflow

### How Claude Fills Out Framework Documents

1. **Claude reads** the template and any referenced documents
2. **Claude drafts** each section completely (no placeholders)
3. **Claude presents** the completed section for your review
4. **You approve** or request changes
5. **Claude revises** based on feedback
6. **Repeat** until document is complete
7. **Document locks** after passing validation checklist

### Document Completion Criteria

Before marking any document complete:

- [ ] All sections filled (no placeholders, TBDs, or empty fields)
- [ ] All validation checklist items pass
- [ ] You have explicitly approved the document
- [ ] Document status changed to "Locked"

---

## Code Workflow

### How Claude Writes Code

| Phase | Claude's Approach |
|-------|-------------------|
| **Before writing** | Understand requirements, confirm approach |
| **While writing** | Follow TAD architecture, use project patterns |
| **After writing** | Explain what was created, note any deviations |

### Quality Standards for Code

Claude follows these standards unless you specify otherwise:

| Standard | Requirement |
|----------|-------------|
| Type safety | Full TypeScript, no \`any\` |
| Error handling | All errors caught and handled appropriately |
| Security | No hardcoded secrets, validate inputs, sanitize outputs |
| Performance | No obvious inefficiencies, note any concerns |
| Testing | Tests for critical paths, note untested areas |
| Documentation | Comments for non-obvious logic only |`,
      },
      {
        title: "MTS Execution & Sessions",
        template: `## MTS Execution

### How Claude Executes Tasks

For each MTS task:

1. **Read** — Claude reads task details and acceptance criteria
2. **Confirm** — Claude confirms understanding (or asks questions)
3. **Execute** — Claude performs the work
4. **Verify** — Claude checks against acceptance criteria
5. **Report** — Claude reports completion with evidence
6. **Await** — Claude waits for your approval before next task

### Task Completion Format

\`\`\`
TASK COMPLETE: Task [#] — [Task Name]

Acceptance Criteria:
✓ [Criterion 1] — [Evidence/how verified]
✓ [Criterion 2] — [Evidence/how verified]
✓ [Criterion 3] — [Evidence/how verified]

Work Done:
- [Specific action taken]
- [Specific action taken]

Files:
- [path] — [created/modified/deleted]

Next Task: Task [#+1] — [Name]

Ready to proceed?
\`\`\`

---

## Session Management

### Starting a Session

When you begin a work session, Claude should:

1. Check Project Pulse for current state
2. Identify current/next task
3. Check for any blockers
4. Summarize: "We're at Task X, ready to [action]"

### Ending a Session

Before ending any session, Claude should:

1. Update Project Pulse with current position
2. Note any open questions or blockers
3. Summarize what was accomplished
4. Identify what's next`,
      },
      {
        title: "Escalation & Quality Gates",
        template: `## Escalation Protocol

### When Claude Should Stop and Ask

| Situation | Action |
|-----------|--------|
| Requirement is ambiguous | Stop, ask for clarification |
| Multiple valid approaches exist | Present options, ask for direction |
| Proposed work contradicts existing docs | Flag contradiction, ask how to proceed |
| Scope creep detected | Identify it, confirm if intentional |
| Technical blocker | Report blocker, propose alternatives |
| Quality compromise required | Explain tradeoff, get explicit approval |

### When Claude Should Proceed Autonomously

| Situation | Action |
|-----------|--------|
| Implementation details within approved approach | Proceed |
| Minor refactoring to follow patterns | Proceed, note in completion report |
| Fixing obvious bugs | Proceed, report fix |
| Following established project conventions | Proceed |

---

## Quality Gates

### Before Submitting Any Work

Claude verifies:

- [ ] Work matches the request/task
- [ ] Acceptance criteria are met (if applicable)
- [ ] No obvious errors or issues
- [ ] Follows project patterns and standards
- [ ] Explained clearly what was done

### Red Flags Claude Should Catch

| Red Flag | Action |
|----------|--------|
| Task seems to contradict earlier decision | Pause, flag it |
| Work is getting significantly larger than estimated | Pause, discuss |
| You're approving things without review | Gently note the risk |
| Multiple sessions without progress | Raise concern, discuss blockers |
| Scope expanding beyond original brief | Flag as potential scope creep |

---

## Validation Checklist (Pre-Lock)

Before locking this document, verify:

- [ ] Decision authority is clear for all decision types
- [ ] Communication standards are defined
- [ ] Document workflow is explicit
- [ ] Code standards are defined
- [ ] MTS execution process is clear
- [ ] Session management is defined
- [ ] Escalation triggers are listed
- [ ] No TBDs, placeholders, or "to be determined" items

---

**End of AI Collaboration Protocol**`,
      },
    ],
  },
  6: {
    number: 6,
    name: "Master Task Sequence",
    description: "Phases, checkpoints, objectives, and steps",
    sections: [
      {
        title: "Header & Summary",
        template: `# Master Task Sequence (MTS)

**Project:** [Project Name]
**Version:** 1.0
**Generated:** [Date]
**Last Modified:** [Date]
**Status:** Draft | Locked | In Progress | Complete

---

## Summary

| Metric | Count |
|--------|-------|
| Total Phases | [X] |
| Total Checkpoints | [X] |
| Total Objectives | [X] |
| Total Steps | [X] |

---

## Structure

\`\`\`
PHASE (Major project stage)
  └── CHECKPOINT (Milestone with time tracking)
        └── OBJECTIVE (Goal to achieve)
              └── STEP (Atomic action)
\`\`\`

**Definitions:**

| Level | Purpose | Granularity | Example |
|-------|---------|-------------|---------|
| Phase | Major stage of project | Days to weeks | "Foundation", "Core Features", "Ship" |
| Checkpoint | Milestone, natural pause point | Hours to days | "Database Ready", "Auth Complete" |
| Objective | Specific goal to achieve | 1-4 hours | "Create user schema", "Implement login flow" |
| Step | Single atomic action | Minutes to 1 hour | "Create migration file", "Add validation" |

---

## Generation Log

### PRD Feature → Checkpoint Mapping

| Feature ID | Feature Name | Checkpoints |
|------------|--------------|-------------|
| F1 | [Feature Name] | CP-X.X, CP-X.X |
| F2 | [Feature Name] | CP-X.X |
| F3 | [Feature Name] | CP-X.X, CP-X.X |

### TAD Component → Checkpoint Mapping

| Component ID | Component Name | Checkpoints |
|--------------|----------------|-------------|
| C1 | [Component Name] | CP-X.X |
| C2 | [Component Name] | CP-X.X, CP-X.X |
| C3 | [Component Name] | CP-X.X |`,
      },
      {
        title: "Phase 1: Foundation",
        template: `# Phase 1: Foundation

**Goal:** Project scaffolding, dependencies, and base configuration.
**Estimated Duration:** [X days/hours]

---

## Checkpoint CP-1.1: [Checkpoint Name]

**Goal:** [What's true when this checkpoint is complete]
**Source:** Infrastructure
**Estimate:** [S/M/L or hours]
**Depends On:** None

### Objective 1.1.1: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]

| Step | Action | Acceptance | Status |
|------|--------|------------|--------|
| 1.1.1.1 | [Specific action] | [How to verify] | ⬜ |
| 1.1.1.2 | [Specific action] | [How to verify] | ⬜ |
| 1.1.1.3 | [Specific action] | [How to verify] | ⬜ |

---

### Objective 1.1.2: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]

| Step | Action | Acceptance | Status |
|------|--------|------------|--------|
| 1.1.2.1 | [Specific action] | [How to verify] | ⬜ |
| 1.1.2.2 | [Specific action] | [How to verify] | ⬜ |

---

**Checkpoint CP-1.1 Complete When:**
- [ ] All objectives complete
- [ ] [Checkpoint-level acceptance criterion]

---

## Checkpoint CP-1.2: [Checkpoint Name]

**Goal:** [What's true when this checkpoint is complete]
**Source:** TAD-C1
**Estimate:** [S/M/L or hours]
**Depends On:** CP-1.1

### Objective 1.2.1: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]

| Step | Action | Acceptance | Status |
|------|--------|------------|--------|
| 1.2.1.1 | [Specific action] | [How to verify] | ⬜ |
| 1.2.1.2 | [Specific action] | [How to verify] | ⬜ |

---

**Phase 1 Complete When:**
- [ ] All checkpoints complete (CP-1.1, CP-1.2)
- [ ] [Phase-level acceptance criterion]`,
      },
      {
        title: "Phase 2: Core Features",
        template: `# Phase 2: Core Features

**Goal:** Implement MVP functionality.
**Estimated Duration:** [X days/hours]

---

## Checkpoint CP-2.1: [Checkpoint Name]

**Goal:** [What's true when this checkpoint is complete]
**Source:** PRD-F1
**Estimate:** [S/M/L or hours]
**Depends On:** CP-1.2

### Objective 2.1.1: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]

| Step | Action | Acceptance | Status |
|------|--------|------------|--------|
| 2.1.1.1 | [Specific action] | [How to verify] | ⬜ |
| 2.1.1.2 | [Specific action] | [How to verify] | ⬜ |
| 2.1.1.3 | [Specific action] | [How to verify] | ⬜ |

---

### Objective 2.1.2: [Action Verb] + [Object]

**Acceptance:** [Binary pass/fail criterion]

| Step | Action | Acceptance | Status |
|------|--------|------------|--------|
| 2.1.2.1 | [Specific action] | [How to verify] | ⬜ |
| 2.1.2.2 | [Specific action] | [How to verify] | ⬜ |

---

**Checkpoint CP-2.1 Complete When:**
- [ ] All objectives complete
- [ ] [Checkpoint-level acceptance criterion]

---

## Checkpoint CP-2.2: [Checkpoint Name]

**Goal:** [What's true when this checkpoint is complete]
**Source:** PRD-F2
**Estimate:** [S/M/L or hours]
**Depends On:** CP-2.1

[Continue pattern for all checkpoints...]

---

**Phase 2 Complete When:**
- [ ] All checkpoints complete
- [ ] [Phase-level acceptance criterion]`,
      },
      {
        title: "Phase 3 & 4: Integration & Ship",
        template: `# Phase 3: Integration

**Goal:** Connect components, end-to-end flows working.
**Estimated Duration:** [X days/hours]

---

## Checkpoint CP-3.1: [Checkpoint Name]

**Goal:** [What's true when this checkpoint is complete]
**Source:** TAD-C5
**Estimate:** [S/M/L or hours]
**Depends On:** CP-2.X

[Continue pattern...]

---

**Phase 3 Complete When:**
- [ ] All checkpoints complete
- [ ] End-to-end flow works
- [ ] All integration tests pass

---

# Phase 4: Polish & Ship

**Goal:** Testing, documentation, deployment.
**Estimated Duration:** [X days/hours]

---

## Checkpoint CP-4.1: Final Testing

**Goal:** All tests pass, no critical bugs
**Source:** Test Plan
**Estimate:** [M/L]
**Depends On:** CP-3.X

### Objective 4.1.1: Run Full Test Suite

**Acceptance:** All tests pass

| Step | Action | Acceptance | Status |
|------|--------|------------|--------|
| 4.1.1.1 | Run unit tests | All pass | ⬜ |
| 4.1.1.2 | Run integration tests | All pass | ⬜ |
| 4.1.1.3 | Run E2E tests | All pass | ⬜ |

---

## Checkpoint CP-4.2: Deploy to Production

**Goal:** Application live and healthy
**Source:** Infrastructure
**Estimate:** [M]
**Depends On:** CP-4.1

### Objective 4.2.1: Production Deployment

**Acceptance:** App accessible at production URL

| Step | Action | Acceptance | Status |
|------|--------|------------|--------|
| 4.2.1.1 | Run database migrations | Complete without error | ⬜ |
| 4.2.1.2 | Deploy application | Deployment succeeds | ⬜ |
| 4.2.1.3 | Verify health check | /health returns 200 | ⬜ |
| 4.2.1.4 | Smoke test critical path | Core flow works | ⬜ |

---

**Phase 4 Complete When:**
- [ ] All checkpoints complete
- [ ] Ship Checklist passes 100%
- [ ] Project status = SHIPPED`,
      },
      {
        title: "Time Tracking & Validation",
        template: `## Time Tracking

| Checkpoint | Estimated | Actual | Variance | Notes |
|------------|-----------|--------|----------|-------|
| CP-1.1 | [Est] | — | — | |
| CP-1.2 | [Est] | — | — | |
| CP-2.1 | [Est] | — | — | |
| CP-2.2 | [Est] | — | — | |
| CP-3.1 | [Est] | — | — | |
| CP-4.1 | [Est] | — | — | |
| CP-4.2 | [Est] | — | — | |
| **TOTAL** | **[Est]** | **—** | **—** | |

---

## Change History

Changes to MTS after initial lock are recorded here via Change Protocol.

---

### Change C001 — [Date]

**Trigger:** [What caused this change]
**Decision Log Entry:** D001
**Checkpoints Added:** [IDs or "None"]
**Checkpoints Removed:** [IDs or "None"]
**Objectives Modified:** [IDs with description or "None"]
**Steps Added/Removed:** [Count]
**Net Change:** [Summary]

---

## Validation Checklist (Pre-Lock)

Before locking MTS, verify:

- [ ] Every PRD feature maps to ≥1 checkpoint
- [ ] Every TAD component maps to ≥1 checkpoint
- [ ] Every checkpoint has a Source (PRD-F#, TAD-C#, or Infrastructure)
- [ ] Checkpoint dependencies form unbroken chain (no orphans)
- [ ] Every objective has binary acceptance criterion
- [ ] Every step is atomic (can be done in one sitting)
- [ ] No step requires Claude to invent sub-steps
- [ ] Final checkpoint is "Project Complete" with Ship Checklist as acceptance
- [ ] Time estimates provided for all checkpoints
- [ ] Summary counts match actual content
- [ ] No TBDs, placeholders, or ambiguous steps

---

**End of MTS**`,
      },
    ],
  },
  7: {
    number: 7,
    name: "Test Plan",
    description: "Test strategy, cases, and coverage",
    sections: [
      {
        title: "Test Strategy & Coverage",
        template: `# Test Plan

**Project:** [Project Name]
**Version:** 1.0
**Generated:** [Date]
**Last Updated:** [Date]
**PRD Reference:** [Link to PRD]
**MTS Reference:** [Link to MTS]

---

## Test Strategy

| Test Type | Coverage Target | Automation | Responsibility |
|-----------|-----------------|------------|----------------|
| Unit | 80%+ code coverage | Required | Developer |
| Integration | All API endpoints | Required | Developer |
| E2E | All critical paths | Required | QA/Developer |
| Performance | Key operations | As needed | QA |
| Security | Auth + data flows | Required | Security review |

### Test Priorities

1. **Critical Path** — User can complete core workflow
2. **Happy Path** — Standard use cases work
3. **Error Handling** — System fails gracefully
4. **Edge Cases** — Boundary conditions handled

---

## Coverage Matrix

| Feature ID | Feature | Unit | Integration | E2E | Status |
|------------|---------|------|-------------|-----|--------|
| F1 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |
| F2 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |
| F3 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |
| F4 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |

**Status Legend:**
- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ❌ Blocked`,
      },
      {
        title: "Test Cases by Feature",
        template: `## Test Cases by Feature

---

### Feature: F1 — [Feature Name]

**Source:** PRD-F1
**Acceptance Criteria Source:** PRD Section X.X

| Test ID | Description | Type | Input | Expected | Status |
|---------|-------------|------|-------|----------|--------|
| F1-T01 | [From acceptance criterion 1] | Unit | [Input] | [Output] | ⬜ |
| F1-T02 | [From acceptance criterion 2] | Unit | [Input] | [Output] | ⬜ |
| F1-T03 | [From acceptance criterion 3] | Integration | [Input] | [Output] | ⬜ |
| F1-T04 | [E2E for feature] | E2E | [Input] | [Output] | ⬜ |

**Edge Case Tests:**

| Test ID | Edge Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| F1-E01 | [Edge case from PRD] | [Expected behavior] | ⬜ |
| F1-E02 | [Edge case from PRD] | [Expected behavior] | ⬜ |

---

### Feature: F2 — [Feature Name]

**Source:** PRD-F2
**Acceptance Criteria Source:** PRD Section X.X

| Test ID | Description | Type | Input | Expected | Status |
|---------|-------------|------|-------|----------|--------|
| F2-T01 | [From acceptance criterion 1] | Unit | [Input] | [Output] | ⬜ |
| F2-T02 | [From acceptance criterion 2] | Unit | [Input] | [Output] | ⬜ |
| F2-T03 | [Integration test] | Integration | [Input] | [Output] | ⬜ |

**Edge Case Tests:**

| Test ID | Edge Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| F2-E01 | [Edge case] | [Expected behavior] | ⬜ |`,
      },
      {
        title: "Performance & Security Tests",
        template: `## Performance Benchmarks

| Operation | Target | Acceptable | Unacceptable | Test Method |
|-----------|--------|------------|--------------|-------------|
| [Operation 1] | < 100ms | < 500ms | > 500ms | [How measured] |
| [Operation 2] | < 1s | < 3s | > 3s | [How measured] |
| [Operation 3] | < 200ms | < 1s | > 1s | [How measured] |
| Page load | < 2s | < 4s | > 4s | Lighthouse |
| API response (p95) | < 200ms | < 500ms | > 500ms | Load test |

---

## Security Tests

| Test ID | Test | Description | Method | Status |
|---------|------|-------------|--------|--------|
| SEC-01 | Authentication bypass | Attempt access without token | Manual + Auto | ⬜ |
| SEC-02 | Token expiration | Verify expired tokens rejected | Auto | ⬜ |
| SEC-03 | SQL injection | Standard injection vectors | Auto (OWASP) | ⬜ |
| SEC-04 | XSS | Cross-site scripting vectors | Auto | ⬜ |
| SEC-05 | CSRF | Cross-site request forgery | Auto | ⬜ |
| SEC-06 | Authorization | Access resources without permission | Manual + Auto | ⬜ |
| SEC-07 | Data exposure | Verify PII not in logs/responses | Manual | ⬜ |
| SEC-08 | Rate limiting | Verify rate limits enforced | Auto | ⬜ |`,
      },
      {
        title: "Test Environment & Execution",
        template: `## Test Environment

| Environment | Purpose | Data | URL | Notes |
|-------------|---------|------|-----|-------|
| Local | Development | Mock/Seed | localhost:3000 | Individual dev |
| CI | Automated tests | Mock | N/A | GitHub Actions |
| Staging | Integration | Sanitized prod | [URL] | Pre-prod mirror |
| Production | Smoke tests only | Real | [URL] | Post-deploy verify |

### Test Data Management

| Data Type | Source | Refresh Frequency |
|-----------|--------|-------------------|
| Seed data | [Script/file location] | Per test run |
| Mock data | [Location] | Static |
| Sanitized prod | [Process] | Weekly |

---

## Regression Protocol

When bugs are found:

1. **Write failing test** that reproduces the bug
2. **Fix the bug** in code
3. **Verify test passes** after fix
4. **Test becomes permanent** — added to regression suite
5. **Log in Decision Log** if fix changes MTS

---

## Test Execution Checklist

### Before Each Sprint

- [ ] All existing tests passing
- [ ] New feature tests written for sprint scope
- [ ] Test environment healthy

### Before Ship

- [ ] 100% of test cases pass
- [ ] Security test suite pass
- [ ] Performance benchmarks met
- [ ] No critical/major bugs open

---

**End of Test Plan**`,
      },
    ],
  },
  8: {
    number: 8,
    name: "Audit Checklist",
    description: "Pre-build validation of all documents",
    sections: [
      {
        title: "Audit Summary",
        template: `# Audit Checklist

**Project:** [Project Name]
**Audit Date:** [Date]
**Auditor:** [Name]
**Version:** 1.0

---

## Audit Summary

| Category | Weight | Score | Weighted Score |
|----------|--------|-------|----------------|
| Idea Audit | 10% | /100 | |
| Project Brief | 15% | /100 | |
| PRD | 20% | /100 | |
| TAD | 20% | /100 | |
| AI Collaboration Protocol | 10% | /100 | |
| MTS | 20% | /100 | |
| Test Plan | 5% | /100 | |
| **TOTAL** | **100%** | | **[SCORE]** |

**Threshold:** 100% required to proceed to building.`,
      },
      {
        title: "Document Audits (01-04)",
        template: `## Document Audits

---

### Idea Audit (01) Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Raw idea input captured | [ ] |
| 2 | Problem validation complete with scores | [ ] |
| 3 | Market analysis complete | [ ] |
| 4 | Competitor analysis complete (≥2 competitors) | [ ] |
| 5 | Feasibility check complete | [ ] |
| 6 | Business model viability assessed | [ ] |
| 7 | Audit summary has all scores | [ ] |
| 8 | Verdict is PROCEED (not PIVOT or KILL) | [ ] |
| 9 | User has approved the verdict | [ ] |
| 10 | No TBDs or placeholders | [ ] |

**Score:** [X] / 10 = [Y]%

---

### Project Brief (02) Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Problem Statement identifies specific user | [ ] |
| 2 | Problem Statement quantifies impact | [ ] |
| 3 | Vision is ≤2 sentences | [ ] |
| 4 | ≥2 Success Metrics defined | [ ] |
| 5 | All Success Metrics are measurable | [ ] |
| 6 | In Scope section populated | [ ] |
| 7 | Out of Scope section populated (not empty) | [ ] |
| 8 | All Assumptions have Mitigation | [ ] |
| 9 | All Constraints have Rationale | [ ] |
| 10 | No TBDs or placeholders | [ ] |

**Score:** [X] / 10 = [Y]%

---

### PRD (03) Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | ≥1 User Persona defined | [ ] |
| 2 | Every User Story follows As/Want/So format | [ ] |
| 3 | Every User Story has ≥2 Acceptance Criteria | [ ] |
| 4 | Every Feature has ID and traces to User Story | [ ] |
| 5 | "Won't Have" section populated (not empty) | [ ] |
| 6 | Acceptance Criteria Matrix complete | [ ] |
| 7 | All Dependencies have Fallback | [ ] |
| 8 | All Edge Cases have Expected Behavior | [ ] |
| 9 | No TBDs or placeholders | [ ] |

**Score:** [X] / 9 = [Y]%

---

### TAD (04) Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Architecture diagram exists | [ ] |
| 2 | Every tech stack item has version and justification | [ ] |
| 3 | Every Component has ID (C1, C2, etc.) | [ ] |
| 4 | Every Component has interfaces (input/output) | [ ] |
| 5 | All database tables defined with all fields | [ ] |
| 6 | Every API endpoint fully specified | [ ] |
| 7 | Security model covers auth and authorization | [ ] |
| 8 | Error handling covers all categories | [ ] |
| 9 | No TBDs or placeholders | [ ] |

**Score:** [X] / 9 = [Y]%`,
      },
      {
        title: "Document Audits (05-07)",
        template: `### AI Collaboration Protocol (05) Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Roles defined (Director/Executor) | [ ] |
| 2 | Decision authority clear for all types | [ ] |
| 3 | Communication standards defined | [ ] |
| 4 | Document workflow explicit | [ ] |
| 5 | Code standards defined | [ ] |
| 6 | MTS execution process defined | [ ] |
| 7 | Escalation triggers defined | [ ] |
| 8 | No TBDs or placeholders | [ ] |

**Score:** [X] / 8 = [Y]%

---

### MTS (06) Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Summary section complete | [ ] |
| 2 | Every PRD Feature maps to ≥1 checkpoint | [ ] |
| 3 | Every TAD Component maps to ≥1 checkpoint | [ ] |
| 4 | Every checkpoint has Goal, Source, Estimate | [ ] |
| 5 | Checkpoint dependencies form unbroken chain | [ ] |
| 6 | Every objective has binary acceptance criterion | [ ] |
| 7 | Every step is atomic | [ ] |
| 8 | Final checkpoint is "Project Complete" | [ ] |
| 9 | Time estimates provided for all checkpoints | [ ] |
| 10 | No TBDs or placeholders | [ ] |

**Score:** [X] / 10 = [Y]%

---

### Test Plan (07) Audit

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Test strategy defined | [ ] |
| 2 | Coverage matrix complete | [ ] |
| 3 | Test cases defined for each PRD feature | [ ] |
| 4 | Edge case tests defined | [ ] |
| 5 | Performance benchmarks defined | [ ] |
| 6 | Security tests defined | [ ] |
| 7 | Test environment documented | [ ] |
| 8 | No TBDs or placeholders | [ ] |

**Score:** [X] / 8 = [Y]%`,
      },
      {
        title: "Cross-Document Validation & Verdict",
        template: `## Cross-Document Validation

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Idea Audit verdict is PROCEED | [ ] |
| 2 | PRD features trace to Project Brief scope | [ ] |
| 3 | TAD components implement PRD features | [ ] |
| 4 | MTS checkpoints cover all PRD features | [ ] |
| 5 | MTS checkpoints cover all TAD components | [ ] |
| 6 | Test Plan covers all PRD features | [ ] |
| 7 | Terminology consistent across all documents | [ ] |
| 8 | Feature IDs consistent (PRD → MTS → Test Plan) | [ ] |
| 9 | No contradictions between documents | [ ] |

**Score:** [X] / 9 = [Y]%

---

## Gap Report

| # | Document | Section | Issue | Severity | Required Fix |
|---|----------|---------|-------|----------|--------------|
| 1 | [Doc] | [Section] | [Issue description] | Critical / Major / Minor | [What to fix] |

**Severity Definitions:**
- **Critical:** Blocks execution — must fix before proceed
- **Major:** Creates risk or ambiguity — should fix before proceed
- **Minor:** Polish issue — can fix during build

---

## Final Verdict

**Total Score:** [X]%

**Verdict:** PASS | CONDITIONAL | FAIL

| Score Range | Result | Action |
|-------------|--------|--------|
| 100% | PASS | Proceed to building |
| 95-99% | CONDITIONAL | Fix minor gaps, re-audit |
| <95% | FAIL | Return to planning |

---

## Post-Audit Actions

If PASS:
- [ ] Lock all planning documents (01-07)
- [ ] Initialize Decision Log (09)
- [ ] Initialize Project Pulse (10)
- [ ] Begin MTS execution at Phase 1, Checkpoint 1.1

---

**End of Audit Checklist**`,
      },
    ],
  },
  9: {
    number: 9,
    name: "Decision Log",
    description: "Track deviations from the plan",
    sections: [
      {
        title: "Header & Purpose",
        template: `# Decision Log

**Project:** [Project Name]
**Created:** [Date]
**Last Entry:** [Date]
**Total Decisions:** [Count]

---

## Log Purpose

This document tracks every deviation from the original plan during build.

**Entry Triggers — log when:**
- Architecture changes from TAD
- Scope changes (feature added or cut)
- Tech stack changes
- Process changes
- Bug workaround affects design
- Assumption proved wrong
- Unexpected dependency discovered
- Performance issue requires redesign

**Rule:** If it changes what we planned, it goes in the log.`,
      },
      {
        title: "Decision Entry Template",
        template: `## Decision Entries

---

### Decision D001: [Title]

**Date:** [Date]
**Author:** [Who made/proposed this]
**Status:** Proposed | Approved | Implemented | Reverted

**Trigger:**
[What caused this decision to be needed? What broke or changed?]

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| Option A | [Advantages] | [Disadvantages] |
| Option B | [Advantages] | [Disadvantages] |
| Option C | [Advantages] | [Disadvantages] |

**Decision:**
[Which option was chosen]

**Rationale:**
[Why this option was selected over others]

**MTS Impact:**
- Tasks added: [Task numbers or "None"]
- Tasks removed: [Task numbers or "None"]
- Tasks modified: [Task numbers with description or "None"]

**Other Doc Impact:**

| Document | Section | Change |
|----------|---------|--------|
| [Doc name] | [Section] | [What changed] |

**Implementation Notes:**
[Any specific guidance for implementing this decision]

---

### Decision D002: [Title]

[Repeat template for additional decisions...]`,
      },
      {
        title: "Category Summary & Tracking",
        template: `## Category Summary

Track decisions by type for retrospective analysis.

| Category | Count | Decision IDs | Notes |
|----------|-------|--------------|-------|
| Architecture | 0 | — | Changes to system design |
| Scope Change | 0 | — | Features added or cut |
| Tech Stack | 0 | — | Technology swaps |
| Process | 0 | — | How we work |
| Bug Workaround | 0 | — | Design changes due to bugs |
| Assumption Failed | 0 | — | Project Brief assumptions proved wrong |
| **Total** | **0** | | |

---

## Scope Change Tracker

Running total of scope changes from original PRD.

| Decision ID | Change Description | Direction | Features Affected |
|-------------|-------------------|-----------|-------------------|
| — | No scope changes yet | — | — |

**Net Scope Change:** +0 / -0 features from original PRD

---

## Lessons Learned

Capture insights for future projects. Add as patterns emerge.

| Lesson | Decision(s) | Recommendation for Future |
|--------|-------------|---------------------------|
| [Insight] | [D### reference] | [What to do differently] |

---

## Change Protocol Compliance

Every Decision entry should follow the Change Protocol:

1. ✅ Log It — Entry created in this document
2. ⬜ Update MTS — Tasks added/removed/modified
3. ⬜ Update Project Pulse — Current state reflected
4. ⬜ Update Test Plan — If features changed
5. ⬜ Resume — Work continues from updated position

---

**End of Decision Log**`,
      },
    ],
  },
  10: {
    number: 10,
    name: "Project Pulse",
    description: "Live project status and position tracking",
    sections: [
      {
        title: "Current Position & Time",
        template: `# Project Pulse

**Project:** [Project Name]
**Last Updated:** [YYYY-MM-DD HH:MM]
**Updated By:** [Agent/Human Name]

---

## Current Position

| Field | Value |
|-------|-------|
| **Phase** | [Phase #] — [Phase Name] |
| **Checkpoint** | CP-[X.X] — [Checkpoint Name] |
| **Objective** | [X.X.X] — [Objective Name] |
| **Current Step** | [X.X.X.X] — [Step Description] |
| **Status** | In Progress / Blocked / Waiting for Review |
| **Started** | [YYYY-MM-DD HH:MM] |
| **Notes** | [Any relevant context] |

---

## Time Tracking

### Current Checkpoint

| Metric | Value |
|--------|-------|
| **Checkpoint** | CP-[X.X] — [Name] |
| **Started** | [YYYY-MM-DD HH:MM] |
| **Estimated Duration** | [X hours] |
| **Time Elapsed** | [X hours Y minutes] |
| **Time Remaining (est)** | [X hours Y minutes] |
| **Status** | On Track / Behind / Ahead |

### Session Log

| Date | Start | End | Duration | Checkpoint | Notes |
|------|-------|-----|----------|------------|-------|
| [Date] | [Time] | [Time] | [X:XX] | CP-X.X | [What was worked on] |
| [Date] | [Time] | — | — | CP-X.X | *Current session* |

### Checkpoint History

| Checkpoint | Estimated | Actual | Variance | Completed |
|------------|-----------|--------|----------|-----------|
| CP-1.1 | [Est] | [Act] | [+/-] | [Date] |
| CP-1.2 | [Est] | [Act] | [+/-] | [Date] |
| CP-2.1 | [Est] | — | — | In Progress |`,
      },
      {
        title: "Progress Overview",
        template: `## Progress Overview

### Phase Progress

| Phase | Checkpoints | Complete | Status |
|-------|-------------|----------|--------|
| Phase 1: Foundation | [X] | [Y]/[X] | Complete / In Progress / Not Started |
| Phase 2: Core Features | [X] | [Y]/[X] | Complete / In Progress / Not Started |
| Phase 3: Integration | [X] | [Y]/[X] | Complete / In Progress / Not Started |
| Phase 4: Polish & Ship | [X] | [Y]/[X] | Complete / In Progress / Not Started |

### Visual Progress

\`\`\`
Phase 1: [████████████████████] 100%
Phase 2: [████████░░░░░░░░░░░░]  40%  ← CURRENT
Phase 3: [░░░░░░░░░░░░░░░░░░░░]   0%
Phase 4: [░░░░░░░░░░░░░░░░░░░░]   0%

Overall: [██████░░░░░░░░░░░░░░]  32%
\`\`\`

---

## Last Completed

| Field | Value |
|-------|-------|
| **Checkpoint** | CP-[X.X] — [Checkpoint Name] |
| **Completed** | [YYYY-MM-DD HH:MM] |
| **Duration** | [Actual time taken] |
| **Variance** | [+/- X hours] |
| **Notes** | [Learnings, issues, or "Clean completion"] |

---

## Next Up

| Field | Value |
|-------|-------|
| **Checkpoint** | CP-[X.X] — [Checkpoint Name] |
| **First Objective** | [X.X.X] — [Objective Name] |
| **Depends On** | CP-[X.X] (current) |
| **Estimate** | [S/M/L or hours] |
| **Prep Needed** | [Setup required or "None"] |`,
      },
      {
        title: "Blockers & Health",
        template: `## Blockers

| Blocker | Blocking | Since | Owner | Status | Resolution Path |
|---------|----------|-------|-------|--------|-----------------|
| None | — | — | — | — | — |

### Blocker History

| Blocker | Duration | Resolution | Impact |
|---------|----------|------------|--------|
| [Past blocker] | [How long] | [How resolved] | [Time lost] |

---

## Recent Decisions

Last 5 decisions affecting the project. Full details in Decision Log.

| ID | Date | Summary | MTS Impact |
|----|------|---------|------------|
| — | — | No decisions yet | — |

---

## Scope Status

| Metric | Count | Trend |
|--------|-------|-------|
| Features added (since lock) | [X] | ↑ / → / ↓ |
| Features removed (since lock) | [X] | ↑ / → / ↓ |
| **Net scope change** | [+/-X] | |

---

## Health Indicators

| Indicator | Status | Notes |
|-----------|--------|-------|
| On schedule | 🟢 / 🟡 / 🔴 | [Details] |
| On scope | 🟢 / 🟡 / 🔴 | [Details] |
| Blockers | 🟢 / 🟡 / 🔴 | [X active blockers] |
| Momentum | 🟢 / 🟡 / 🔴 | [Checkpoints/week] |

**Legend:**
- 🟢 Green: On track, no concerns
- 🟡 Yellow: Minor issues, manageable
- 🔴 Red: Significant problems, needs attention`,
      },
      {
        title: "Recovery & Session Checklists",
        template: `## Quick Links

| Document | Location |
|----------|----------|
| Master Task Sequence | [Link or path] |
| Decision Log | [Link or path] |
| Test Plan | [Link or path] |
| PRD | [Link or path] |
| TAD | [Link or path] |

---

## Recovery Protocol

If you're reading this after a gap, follow this sequence:

1. **Read Current Position** — You now know exactly where you are
2. **Check Time Tracking** — Understand elapsed vs remaining
3. **Check Blockers** — If blocked, resolve before proceeding
4. **Check Recent Decisions** — Context on any changes
5. **Open MTS** — Find current checkpoint and step details
6. **Resume current step** — Or start next if current is complete

**Target:** Productive work within 5 minutes of reading this.

---

## Session Start Checklist

When starting a new work session:

- [ ] Read this Project Pulse
- [ ] Log session start time in Session Log
- [ ] Check for blockers
- [ ] Open MTS to current checkpoint
- [ ] Begin work

## Session End Checklist

Before ending any work session:

- [ ] Update Current Position section
- [ ] Log session end time in Session Log
- [ ] Update Checkpoint History if any completed
- [ ] Note any new blockers
- [ ] Update Health Indicators if changed
- [ ] Save this file

---

**End of Project Pulse**`,
      },
    ],
  },
  11: {
    number: 11,
    name: "Ship Checklist",
    description: "Pre-launch validation",
    sections: [
      {
        title: "Functional Completeness & Quality",
        template: `# Ship Checklist

**Project:** [Project Name]
**Target Ship Date:** [Date]
**Checklist Date:** [Date]
**Reviewer:** [Name]

---

## Functional Completeness

All features work as specified.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All MTS tasks marked complete | ⬜ | |
| 2 | All PRD Must-Have features implemented | ⬜ | |
| 3 | All PRD acceptance criteria verified | ⬜ | |
| 4 | All User Stories satisfied | ⬜ | |
| 5 | Project Brief success metrics achievable | ⬜ | |
| 6 | No missing functionality in critical path | ⬜ | |

**Functional Completeness:** ⬜ Pass | ⬜ Fail

---

## Quality

Product is stable and performant.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All unit tests passing | ⬜ | |
| 2 | All integration tests passing | ⬜ | |
| 3 | All E2E tests passing | ⬜ | |
| 4 | Test coverage meets target | ⬜ | Target: [X]% |
| 5 | No critical bugs open | ⬜ | |
| 6 | No major bugs open | ⬜ | |
| 7 | Performance benchmarks met | ⬜ | |
| 8 | Code review completed for all changes | ⬜ | |
| 9 | No known regressions | ⬜ | |

**Quality:** ⬜ Pass | ⬜ Fail`,
      },
      {
        title: "Documentation & Operations",
        template: `## Documentation

Users and maintainers can understand the product.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | User documentation complete | ⬜ | |
| 2 | User documentation reviewed | ⬜ | |
| 3 | API documentation complete | ⬜ | |
| 4 | API documentation matches implementation | ⬜ | |
| 5 | README up to date | ⬜ | |
| 6 | Environment setup documented | ⬜ | |
| 7 | Deployment process documented | ⬜ | |
| 8 | Known issues documented | ⬜ | |

**Documentation:** ⬜ Pass | ⬜ Fail

---

## Operational Readiness

We can run and maintain this in production.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Production environment configured | ⬜ | |
| 2 | Environment variables documented and set | ⬜ | |
| 3 | Database migrations ready | ⬜ | |
| 4 | Monitoring configured | ⬜ | Tool: [Name] |
| 5 | Alerting configured | ⬜ | Channel: [Destination] |
| 6 | Log aggregation working | ⬜ | Tool: [Name] |
| 7 | Backup procedure documented | ⬜ | |
| 8 | Backup procedure tested | ⬜ | |
| 9 | Recovery procedure documented | ⬜ | |
| 10 | Rollback procedure documented | ⬜ | |
| 11 | SSL/TLS configured | ⬜ | |
| 12 | Domain/DNS configured | ⬜ | |

**Operational Readiness:** ⬜ Pass | ⬜ Fail`,
      },
      {
        title: "Security & Final Checks",
        template: `## Security

Product is secure for production.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All security tests passing | ⬜ | |
| 2 | Authentication working correctly | ⬜ | |
| 3 | Authorization working correctly | ⬜ | |
| 4 | No sensitive data in logs | ⬜ | |
| 5 | No sensitive data in responses | ⬜ | |
| 6 | HTTPS enforced | ⬜ | |
| 7 | Security headers configured | ⬜ | |
| 8 | CORS properly configured | ⬜ | |
| 9 | Rate limiting configured | ⬜ | |
| 10 | Dependency vulnerability scan clean | ⬜ | Tool: [Name] |
| 11 | No hardcoded secrets in code | ⬜ | |
| 12 | Secrets properly managed | ⬜ | Tool: [Name] |

**Security:** ⬜ Pass | ⬜ Fail

---

## Final Checks

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Staging deployment successful | ⬜ | |
| 2 | Staging smoke tests pass | ⬜ | |
| 3 | Production deployment dry-run successful | ⬜ | |
| 4 | Decision Log reviewed for open items | ⬜ | |
| 5 | No blocking issues in backlog | ⬜ | |

**Final Checks:** ⬜ Pass | ⬜ Fail`,
      },
      {
        title: "Sign-Off & Verdict",
        template: `## Sign-Off

| Role | Name | Approved | Date | Notes |
|------|------|----------|------|-------|
| Technical Lead | [Name] | ⬜ | | |
| Product Owner | [Name] | ⬜ | | |
| QA Lead | [Name] | ⬜ | | |

---

## Ship Verdict

### Summary

| Section | Status |
|---------|--------|
| Functional Completeness | ⬜ Pass / ⬜ Fail |
| Quality | ⬜ Pass / ⬜ Fail |
| Documentation | ⬜ Pass / ⬜ Fail |
| Operational Readiness | ⬜ Pass / ⬜ Fail |
| Security | ⬜ Pass / ⬜ Fail |
| Final Checks | ⬜ Pass / ⬜ Fail |
| Sign-Off | ⬜ Complete / ⬜ Pending |

### Verdict

**All sections pass + Sign-off complete?**

- ⬜ **SHIP** — Deploy to production
- ⬜ **NO SHIP** — Address failures below

### Blocking Issues (if NO SHIP)

| Issue | Section | Owner | Target Resolution |
|-------|---------|-------|-------------------|
| [Issue] | [Section] | [Who] | [Date] |

---

## Post-Ship Actions

Complete after successful deployment:

- [ ] Production deployment confirmed
- [ ] Health checks passing
- [ ] Monitoring showing expected metrics
- [ ] First real user transaction successful
- [ ] Team notified of ship
- [ ] Project Pulse updated to "Complete"
- [ ] Retrospective scheduled

---

**End of Ship Checklist**`,
      },
    ],
  },
  12: {
    number: 12,
    name: "Retrospective",
    description: "Post-ship learning and improvement",
    sections: [
      {
        title: "Project Summary",
        template: `# Retrospective

**Project:** [Project Name]
**Ship Date:** [Date]
**Retrospective Date:** [Date]
**Facilitator:** [Name]
**Participants:** [Names]

---

## Project Summary

| Metric | Planned | Actual | Variance |
|--------|---------|--------|----------|
| Total Duration | [X days/weeks] | [Y days/weeks] | [+/- Z] |
| Checkpoints | [X] | [Y] | [+/- Z] |
| Scope Changes | 0 (baseline) | [Y] | [+Y] |
| Decision Log Entries | 0 (baseline) | [Y] | [+Y] |
| Major Blockers | 0 (baseline) | [Y] | [+Y] |

### Final Scores

| Document | Audit Score | Notes |
|----------|-------------|-------|
| Project Brief | [X]% | |
| PRD | [X]% | |
| TAD | [X]% | |
| AI Collaboration Protocol | [X]% | |
| MTS | [X]% | |
| Test Plan | [X]% | |
| Ship Checklist | [X]% | |`,
      },
      {
        title: "What Went Well / Didn't Work",
        template: `## What Went Well

Things that worked, should be repeated.

### Process

| Item | Impact | Keep Doing |
|------|--------|------------|
| [What worked] | [How it helped] | Yes / Modify / No |
| [What worked] | [How it helped] | Yes / Modify / No |

### Technical

| Item | Impact | Keep Doing |
|------|--------|------------|
| [What worked] | [How it helped] | Yes / Modify / No |
| [What worked] | [How it helped] | Yes / Modify / No |

### Collaboration

| Item | Impact | Keep Doing |
|------|--------|------------|
| [What worked] | [How it helped] | Yes / Modify / No |

---

## What Didn't Work

Things that caused friction, delays, or problems.

### Process

| Issue | Impact | Root Cause | Fix |
|-------|--------|------------|-----|
| [What didn't work] | [Time lost, frustration] | [Why it happened] | [How to prevent] |

### Technical

| Issue | Impact | Root Cause | Fix |
|-------|--------|------------|-----|
| [What didn't work] | [Impact] | [Root cause] | [Fix] |

### Collaboration

| Issue | Impact | Root Cause | Fix |
|-------|--------|------------|-----|
| [What didn't work] | [Impact] | [Root cause] | [Fix] |`,
      },
      {
        title: "Framework & Time Analysis",
        template: `## Framework Improvements

Specific changes to make to the project framework based on this project.

### Template Changes

| Template | Change | Reason | Priority |
|----------|--------|--------|----------|
| [Template name] | [Specific change] | [Why needed] | High / Med / Low |
| [Template name] | [Specific change] | [Why needed] | High / Med / Low |

### Process Changes

| Process | Change | Reason | Priority |
|---------|--------|--------|----------|
| [Process name] | [Specific change] | [Why needed] | High / Med / Low |

---

## Time Analysis

### Checkpoint Time Accuracy

| Checkpoint | Estimated | Actual | Accuracy | Notes |
|------------|-----------|--------|----------|-------|
| CP-1.1 | [Est] | [Act] | [%] | [Why variance] |
| CP-1.2 | [Est] | [Act] | [%] | [Why variance] |
| **TOTAL** | **[Est]** | **[Act]** | **[%]** | |

### Time Sinks

| Activity | Time Spent | Expected | Cause | Prevention |
|----------|------------|----------|-------|------------|
| [Activity] | [Hours] | [Hours] | [Why it took longer] | [How to avoid] |

### Time Savers

| Activity | Time Saved | How | Replicate |
|----------|------------|-----|-----------|
| [Activity] | [Hours] | [What made it fast] | [How to repeat] |`,
      },
      {
        title: "Decision & Blocker Analysis",
        template: `## Decision Log Analysis

Review of decisions made during the project.

### Good Decisions

| Decision ID | Summary | Why It Was Right |
|-------------|---------|------------------|
| D00X | [Summary] | [Positive outcome] |

### Regretted Decisions

| Decision ID | Summary | What Should Have Been Done | Lesson |
|-------------|---------|---------------------------|--------|
| D00X | [Summary] | [Better alternative] | [What to remember] |

---

## Blocker Analysis

| Blocker | Duration | Category | Root Cause | Prevention |
|---------|----------|----------|------------|------------|
| [Description] | [Time blocked] | Tech / Process / External / Decision | [Why it happened] | [How to avoid] |

### Blocker Categories Summary

| Category | Count | Total Time | Prevention Strategy |
|----------|-------|------------|---------------------|
| Technical | [X] | [Hours] | [Strategy] |
| Process | [X] | [Hours] | [Strategy] |
| External | [X] | [Hours] | [Strategy] |
| Decision | [X] | [Hours] | [Strategy] |`,
      },
      {
        title: "Action Items & Key Takeaways",
        template: `## Claude Collaboration Review

How well did the AI collaboration work?

### Effectiveness

| Aspect | Rating | Notes |
|--------|--------|-------|
| Understanding requirements | 1-5 | [Comments] |
| Quality of drafts | 1-5 | [Comments] |
| Following instructions | 1-5 | [Comments] |
| Code quality | 1-5 | [Comments] |
| Communication clarity | 1-5 | [Comments] |

---

## Action Items

Specific actions to take before starting the next project.

| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| 1 | [Specific action to improve framework] | [Who] | [When] | ⬜ |
| 2 | [Specific action] | [Who] | [When] | ⬜ |
| 3 | [Specific action] | [Who] | [When] | ⬜ |

---

## Key Takeaways

### Top 3 Things to Keep

1. [Most important thing that worked]
2. [Second most important]
3. [Third most important]

### Top 3 Things to Change

1. [Most important thing to fix]
2. [Second most important]
3. [Third most important]

### One Sentence Summary

[What did we learn from this project that we'll carry forward?]

---

**End of Retrospective**`,
      },
    ],
  },
}

// Helper to get total sections for a document
export function getTotalSections(docNumber: number): number {
  return DOCUMENT_TEMPLATES[docNumber]?.sections.length || 0
}

// Helper to get section info
export function getSection(docNumber: number, sectionIndex: number): DocumentSection | null {
  return DOCUMENT_TEMPLATES[docNumber]?.sections[sectionIndex] || null
}
