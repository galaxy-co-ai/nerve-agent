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
  // Add more templates as needed - for now we have the two most important ones
  // Documents 3-12 would follow the same pattern
}

// Helper to get total sections for a document
export function getTotalSections(docNumber: number): number {
  return DOCUMENT_TEMPLATES[docNumber]?.sections.length || 0
}

// Helper to get section info
export function getSection(docNumber: number, sectionIndex: number): DocumentSection | null {
  return DOCUMENT_TEMPLATES[docNumber]?.sections[sectionIndex] || null
}
