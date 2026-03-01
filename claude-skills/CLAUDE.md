# CLAUDE.md — Working on the Skills Repo

## What This Repo Is

A collection of Claude Code skills for building studio-quality websites. Each skill provides deep, production-grade reference patterns for a specific visual/animation domain.

## Conventions

### Skill Structure
- Each skill lives in `.claude/skills/<skill-name>/`
- `SKILL.md` is the entry point (200-400 lines max)
- `references/` contains deep reference docs (200-500 lines each)
- `references/examples/` contains complete working components

### SKILL.md Format
```yaml
---
name: skill-name
description: One-line description of what this skill does and when to use it.
---
```
Followed by markdown content with:
- Philosophy / decision trees
- Quick-reference patterns
- Links to reference files
- Common pitfalls section

### Reference File Format
Each reference file should:
- Start with a brief overview of what patterns it contains
- Include complete, copy-paste-ready code blocks
- Specify required npm packages and versions
- Include "Amateur vs Pro" callouts where applicable
- End with common issues/gotchas

### Code Examples
- TypeScript + React (functional components)
- Include all imports, types, and cleanup
- Comment the *why*, not just the *what*
- Always handle cleanup (dispose, kill timelines, remove listeners)
- Always handle `prefers-reduced-motion`

## Quality Standards
- Every code pattern must be production-grade, not tutorial-level
- Every pattern must work in Next.js App Router with server/client boundaries
- Every 3D/animation pattern must include mobile fallback guidance
- Performance budgets: 60fps, <200KB JS per skill area
