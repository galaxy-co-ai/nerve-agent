# Claude Skills: Studio-Quality Web Experiences

A collection of sophisticated Claude Code skills for building visually stunning, agency-quality websites with advanced animations, 3D effects, particle systems, and interactive experiences.

## What This Is

This repo equips Claude Code with deep, production-grade knowledge for building websites at the level of top creative agencies. Instead of producing basic CSS animations, Claude gains access to studio-quality patterns for Three.js, GSAP, WebGL shaders, GPU particles, and more.

Skills load **on-demand** — descriptions are always available in context, but full reference material only loads when Claude needs it. This keeps sessions fast while providing deep knowledge when building visual experiences.

## Skills Included

| Skill | What It Does |
|-------|-------------|
| `studio-quality-web` | Orchestrator — quality standards, routing to domain skills, amateur vs pro patterns |
| `gsap-motion` | GSAP timelines, ScrollTrigger, SplitText, easing, stagger patterns |
| `scroll-experiences` | Parallax, pinned sections, horizontal scroll, reveal effects, Lenis |
| `three-js-experiences` | 3D scenes, lighting, materials, post-processing, React Three Fiber |
| `particle-systems` | GPU particles, cosmic effects, flow fields, instanced rendering |
| `shader-craft` | GLSL shaders, noise functions, distortion, gradients, custom materials |
| `interactive-ui` | Custom cursors, magnetic hovers, tilt cards, micro-interactions |
| `typography-animation` | Text reveals, kinetic type, variable fonts, WebGL text |
| `page-transitions` | Route transitions, loading sequences, preloaders, asset management |
| `performance-optimization` | 60fps targets, GPU profiling, progressive enhancement, bundle optimization |

## Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/claude-skills.git ~/claude-skills

# Run the installer (symlinks skills into ~/.claude/skills/)
cd ~/claude-skills && bash install.sh
```

## Usage

Skills activate **automatically** when Claude detects relevance. You can also invoke them directly:

```
/studio-quality-web       # Get quality guidance and skill routing
/gsap-motion              # Load GSAP animation expertise
/particle-systems         # Load particle system patterns
/three-js-experiences     # Load Three.js scene patterns
/shader-craft             # Load GLSL shader knowledge
/scroll-experiences       # Load scroll-driven design patterns
/interactive-ui           # Load interactive element patterns
/typography-animation     # Load text animation patterns
/page-transitions         # Load transition patterns
/performance-optimization # Load performance expertise
```

## Updating

```bash
cd ~/claude-skills && git pull
```

Skills are symlinked, so pulling updates immediately makes them available.

## Structure

Each skill follows this pattern:

```
skill-name/
├── SKILL.md              # Entry point (~200-400 lines): philosophy, decision trees, quick reference
└── references/
    ├── pattern-1.md      # Deep reference (~200-500 lines): production code patterns
    ├── pattern-2.md      # Copy-paste-ready implementations
    └── examples/         # Complete working components (where applicable)
        └── example.tsx
```

- **SKILL.md** loads when the skill is invoked — keeps it focused on decisions and routing
- **references/** load only when Claude needs specific implementation details
- **examples/** contain complete, working React/Next.js components

## Tech Stack Focus

These skills are optimized for:
- **React 19 / Next.js 15+** with App Router
- **TypeScript** (strict mode)
- **Three.js** + React Three Fiber + Drei
- **GSAP 3** (all plugins now free)
- **Lenis** for smooth scroll
- **Tailwind CSS** for styling
- **Framer Motion** for layout animations
