---
name: gsap-motion
description: Orchestrate studio-quality animations with GSAP — timelines, ScrollTrigger, SplitText, easing, stagger patterns, and React/Next.js integration. Use when building scroll-triggered animations, text reveals, page section animations, staggered list entries, or any motion design requiring precise timing control.
---

# GSAP Motion Design

## Setup

```bash
npm install gsap
```

All GSAP plugins are free (ScrollTrigger, SplitText, MorphSVG, DrawSVG, Flip, CustomEase).

```typescript
"use client";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
```

## React / Next.js Integration

**Always use the `useGSAP` hook** (official GSAP React package). It handles cleanup automatically.

```bash
npm install @gsap/react
```

```typescript
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export function AnimatedSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // All GSAP code here — auto-cleaned on unmount
    gsap.from(".card", {
      y: 60,
      opacity: 0,
      stagger: 0.1,
      ease: "power3.out",
    });
  }, { scope: containerRef }); // Scope selectors to this container

  return (
    <div ref={containerRef}>
      <div className="card">One</div>
      <div className="card">Two</div>
      <div className="card">Three</div>
    </div>
  );
}
```

**Critical rules for React:**
- Never use `document.querySelector` — use `useRef` + scope
- Never animate in `useEffect` — use `useGSAP`
- Always add `"use client"` to animated components
- `useGSAP` auto-reverts on unmount (no manual cleanup needed)
- Pass `{ dependencies: [someState] }` to re-run animations when state changes

## Timeline Architecture

Timelines are the backbone of professional animation sequences.

```typescript
useGSAP(() => {
  const tl = gsap.timeline({
    defaults: { ease: "power3.out", duration: 0.8 }
  });

  tl.from(".hero-title", { y: 80, opacity: 0 })
    .from(".hero-subtitle", { y: 40, opacity: 0 }, "-=0.4")  // Overlap 0.4s
    .from(".hero-cta", { scale: 0.8, opacity: 0 }, "-=0.2")
    .from(".hero-image", { x: 100, opacity: 0 }, "-=0.6");
}, { scope: containerRef });
```

**Position parameter cheat sheet:**
- `"-=0.5"` — Start 0.5s before the previous animation ends (overlap)
- `"+=0.5"` — Start 0.5s after the previous animation ends (gap)
- `"<"` — Start at the same time as the previous animation
- `"<0.2"` — Start 0.2s after the previous animation starts
- `2` — Start at exactly 2 seconds on the timeline

See [references/timeline-patterns.md](references/timeline-patterns.md) for nested timelines, labels, and complex orchestration.

## Easing — The Most Important Decision

The easing curve is what makes animation feel alive or dead. **Never use default ease or linear.**

### Quick Reference
| Intent | Easing | When to use |
|--------|--------|------------|
| Entrance | `"power3.out"` | Elements appearing on screen |
| Exit | `"power2.in"` | Elements leaving the screen |
| Emphasis | `"power2.inOut"` | Hover states, section transitions |
| Playful | `"back.out(1.7)"` | Buttons, badges, small elements |
| Bouncy | `"elastic.out(1, 0.3)"` | Notifications, playful UI |
| Smooth slide | `"power4.out"` | Large panels, page transitions |
| Snappy | `"expo.out"` | Fast, decisive movements |
| Mechanical | `"steps(12)"` | Counters, progress indicators |

**The golden rule:** Use `.out` for entrances (fast start → gentle stop), `.in` for exits (gentle start → fast end), `.inOut` for continuous motions.

See [references/easing-rhythm.md](references/easing-rhythm.md) for custom eases and spring physics.

## ScrollTrigger Essentials

ScrollTrigger connects animations to scroll position.

```typescript
useGSAP(() => {
  // Basic scroll-triggered entrance
  gsap.from(".section-content", {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".section",
      start: "top 80%",     // When section's top hits 80% viewport height
      toggleActions: "play none none reverse",
    }
  });

  // Scrubbed animation (tied to scroll position)
  gsap.to(".progress-bar", {
    scaleX: 1,
    scrollTrigger: {
      trigger: ".article",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,           // 0.3s smooth lag behind scroll
    }
  });

  // Pinned section
  gsap.to(".pinned-content", {
    x: "-200%",
    ease: "none",
    scrollTrigger: {
      trigger: ".pin-section",
      start: "top top",
      end: "+=3000",         // Pin for 3000px of scroll
      scrub: 1,
      pin: true,
    }
  });
}, { scope: containerRef });
```

**Development tip:** Add `markers: true` to see trigger points visually. Remove before production.

See [references/scroll-trigger.md](references/scroll-trigger.md) for snap, batch, parallax layers, and horizontal scroll patterns.

## SplitText for Typography

```typescript
useGSAP(() => {
  const split = new SplitText(".headline", {
    type: "chars,words,lines",
    linesClass: "line-wrapper",
  });

  // Masked character reveal (most professional look)
  gsap.set(".line-wrapper", { overflow: "hidden" });
  gsap.from(split.chars, {
    y: "100%",
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.02,
  });
}, { scope: containerRef });
```

**Key settings:**
- `type: "chars"` — Split into individual characters
- `type: "words"` — Split into words
- `type: "lines"` — Split into lines (responsive!)
- Combine: `"chars,words,lines"` for all three levels
- Use `linesClass` to add overflow:hidden wrappers for masked reveals

See [references/text-animation.md](references/text-animation.md) for advanced patterns.

## Stagger Patterns

```typescript
// Sequential stagger
gsap.from(".card", { y: 40, opacity: 0, stagger: 0.1 });

// From center outward
gsap.from(".card", { y: 40, opacity: 0, stagger: { each: 0.08, from: "center" } });

// Grid stagger (2D)
gsap.from(".grid-item", {
  scale: 0,
  opacity: 0,
  stagger: {
    each: 0.05,
    from: "center",
    grid: [4, 4],        // 4x4 grid
    axis: null,          // Radial from center
  }
});

// Random stagger
gsap.from(".particle", { scale: 0, stagger: { each: 0.02, from: "random" } });
```

## Common Pitfalls

1. **Animating layout properties** — Never animate `width`, `height`, `top`, `left`, `margin`, `padding`. Use `transform` (x, y, scale, rotation) and `opacity` only.

2. **Missing cleanup in React** — Always use `useGSAP`, never `useEffect` + manual `gsap.to`. The `useGSAP` hook auto-reverts.

3. **ScrollTrigger.refresh()** — Call after dynamic content loads (images, async data) so trigger positions recalculate.

4. **GSAP + CSS transitions on same element** — These conflict. Remove CSS transitions from GSAP-animated elements.

5. **Animating in server components** — GSAP requires `"use client"`. Don't try to animate in server components.

6. **Forgetting `defaults`** — Set `defaults` on timelines to avoid repeating `ease` and `duration` on every tween.

7. **Using `delay` instead of position parameter** — In timelines, use position parameter (`"-=0.3"`) not `delay`. Delay doesn't respect timeline playback.

## Integration with Other Skills

- **Scroll experiences** → Use ScrollTrigger for section orchestration (see `scroll-experiences` skill)
- **Typography animation** → SplitText is the foundation (see `typography-animation` skill)
- **Page transitions** → GSAP timelines drive exit/enter sequences (see `page-transitions` skill)
- **Three.js** → Use `gsap.to` to animate Three.js object properties (position, rotation, material uniforms)
- **Lenis smooth scroll** → Integrate Lenis with ScrollTrigger (see `scroll-experiences` skill)
