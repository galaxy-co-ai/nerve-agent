---
name: studio-quality-web
description: Guides building studio-quality websites with advanced visual effects including Three.js 3D scenes, GPU particle systems, GSAP animations, WebGL shaders, scroll-driven experiences, page transitions, interactive elements, and typography animation. Use when building visually stunning websites, agency-quality experiences, or any project requiring advanced motion and visual effects.
---

# Studio-Quality Web Experiences

## Philosophy

The gap between amateur and professional web experiences comes down to five things:

1. **Intentional motion** — Every animation has a purpose: entrance, emphasis, narrative, or feedback. Nothing moves "just because."
2. **Timing and easing** — Professional sites use carefully chosen easing curves. Default `ease` or `linear` is almost never correct. The right easing makes motion feel physical and alive.
3. **Layered depth** — Multiple visual layers (background particles, midground content, foreground UI) with different scroll speeds create spatial richness.
4. **Restraint** — The best sites animate fewer things with more polish, rather than animating everything. One stunning hero effect beats ten mediocre ones.
5. **Performance as quality** — A beautiful animation that stutters is worse than no animation. 60fps is non-negotiable.

## Quality Benchmarks

### Performance Targets
- Frame rate: sustained **60fps** during all animations
- First Contentful Paint: **< 1.5s**
- Largest Contentful Paint: **< 2.5s**
- Total Blocking Time: **< 200ms**
- Cumulative Layout Shift: **< 0.1**
- GPU memory: **< 256MB** for 3D scenes
- Draw calls: **< 100** for complex 3D scenes

### Visual Quality Targets
- All animations use appropriate easing (never linear unless intentional)
- Scroll-driven animations are silky smooth (no jank, no jumps)
- 3D scenes have proper lighting (minimum three-point or HDRI)
- Particle systems use GPU computation (never CPU loops for >1000 particles)
- Text reveals complete fully (no partially visible characters)
- All effects respect `prefers-reduced-motion`
- Mobile has graceful degradation (simpler effects, not broken effects)

## Skill Routing — When to Use What

### "Build a 3D hero section"
→ Load **three-js-experiences** for scene setup, lighting, materials
→ Load **performance-optimization** if complex scene

### "Create particle effects (black hole, nebula, stardust)"
→ Load **particle-systems** for GPU particle architecture
→ Load **shader-craft** if custom particle shaders needed

### "Build scroll-driven animations"
→ Load **gsap-motion** for ScrollTrigger orchestration
→ Load **scroll-experiences** for section architecture and parallax

### "Animate text / headlines"
→ Load **typography-animation** for text reveals and kinetic type
→ Uses GSAP SplitText under the hood (see **gsap-motion** for GSAP basics)

### "Add page transitions / loading screen"
→ Load **page-transitions** for route transitions and preloaders
→ Load **gsap-motion** for the actual animation orchestration

### "Custom cursor / hover effects"
→ Load **interactive-ui** for cursor, hover, and micro-interaction patterns

### "Fix frame rate / performance issues"
→ Load **performance-optimization** for profiling and optimization

### "Build a full agency-style site"
→ Start with **scroll-experiences** for page architecture
→ Add **gsap-motion** for animation orchestration
→ Add **three-js-experiences** or **particle-systems** for hero impact
→ Add **typography-animation** for headline reveals
→ Add **interactive-ui** for cursor and hover polish
→ Add **page-transitions** for route transitions
→ Finish with **performance-optimization** for final polish

## The Professional Polish Checklist

See [references/quality-checklist.md](references/quality-checklist.md) for the complete audit checklist.

Quick version:
- [ ] All animations use intentional easing curves
- [ ] Scroll animations are scrubbed (not triggered), where appropriate
- [ ] 3D scenes dispose properly on unmount
- [ ] Particle count adapts to device capability
- [ ] Text animations handle resize/reflow
- [ ] Custom cursor hides on touch devices
- [ ] Loading sequence masks asset loading
- [ ] `prefers-reduced-motion` provides graceful alternative
- [ ] Mobile layout works without scroll-dependent effects
- [ ] No layout thrashing in scroll handlers

## Amateur vs Professional — Common Gaps

See [references/amateur-vs-pro.md](references/amateur-vs-pro.md) for detailed comparisons.

| Amateur | Professional |
|---------|-------------|
| CSS `transition: all 0.3s ease` | GSAP with specific properties and custom easing |
| Particle.js / tsparticles (CPU-bound) | Custom Three.js InstancedMesh or GPGPU particles |
| `scroll` event listener with direct DOM manipulation | GSAP ScrollTrigger with scrub and pin |
| Default Three.js lighting (single directional) | Three-point lighting or HDRI environment map |
| Text fades in as a block | SplitText with per-character stagger and masked reveal |
| Linear interpolation for mouse tracking | Spring physics or lerped dampening |
| Same experience on mobile and desktop | Progressive enhancement with capability tiers |
| Animations trigger once on scroll | Animations scrub with scroll position for precise control |
| WebGL canvas as afterthought (fixed size) | Responsive canvas with DPR capping and resize handling |

## Tech Stack Recommendations

See [references/tech-stack-decisions.md](references/tech-stack-decisions.md) for detailed guidance.

### Core Libraries
- **GSAP 3** — Animation orchestration, ScrollTrigger, SplitText (all free now)
- **Three.js** — 3D rendering, particle systems, custom shaders
- **React Three Fiber (R3F)** — React wrapper for Three.js
- **Drei** — R3F utilities (controls, helpers, abstractions)
- **Lenis** — Smooth scroll (replaces Locomotive Scroll)
- **Framer Motion** — Layout animations, AnimatePresence, simple transitions

### When to Use What
| Need | Use | Not |
|------|-----|-----|
| Complex timeline animations | GSAP | Framer Motion |
| Scroll-driven animation | GSAP ScrollTrigger | Intersection Observer |
| Layout/mount animations | Framer Motion | GSAP |
| 3D scenes | Three.js / R3F | CSS 3D transforms |
| Particle effects (>1000) | Three.js InstancedMesh / GPGPU | Canvas 2D / DOM elements |
| Particle effects (<100) | Framer Motion or CSS | Three.js (overkill) |
| Smooth scroll | Lenis | CSS scroll-behavior |
| Text splitting | GSAP SplitText | Manual DOM splitting |
| Route transitions | View Transitions API + GSAP | Framer Motion (limited) |
| Mouse parallax | Direct transform + lerp | Libraries (unnecessary overhead) |
