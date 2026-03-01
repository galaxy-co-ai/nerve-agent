---
name: scroll-experiences
description: Build scroll-driven web experiences — parallax layers, pinned sections, horizontal scroll, progressive reveals, smooth scroll with Lenis, and narrative pacing. Use when building agency homepages, product landing pages, case study presentations, or any long-form page where scroll position drives visual storytelling.
---

# Scroll-Driven Experiences

## Architecture: Section Types

Every scroll-driven page is composed of these section types:

| Section Type | What It Does | Scroll Behavior |
|-------------|-------------|-----------------|
| **Hero** | Full-viewport opening impact | Static or subtle parallax |
| **Narrative Pin** | Pinned section with scrubbed animation | Pin + scrub timeline |
| **Parallax Layers** | Multi-depth movement | Different speed per layer |
| **Horizontal Scroll** | Sideways content within vertical scroll | Pin + horizontal translate |
| **Reveal Sequence** | Content appears progressively | Staggered triggers |
| **Stats/Counter** | Animated numbers | Count on scroll enter |
| **Breathing Space** | Full-viewport with minimal content | Clean break between dense sections |

## Smooth Scroll with Lenis

Lenis replaces native scroll with momentum-based smooth scrolling. Required for professional scroll experiences.

```bash
npm install lenis
```

```typescript
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}
```

Place this in your root layout, wrapping the page content.

## Parallax Layers

Create depth with elements moving at different speeds relative to scroll.

```typescript
useGSAP(() => {
  // Layer 1: Far background (slowest)
  gsap.to(".parallax-far", {
    y: -300,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  // Layer 2: Mid background
  gsap.to(".parallax-mid", {
    y: -150,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  // Layer 3: Foreground content moves with scroll (no transform needed)

  // Layer 4: Overlay elements (fastest, opposite direction for depth)
  gsap.to(".parallax-near", {
    y: 50,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}, { scope: containerRef });
```

**Speed ratios for natural depth:**
- Far background: 0.3x scroll speed (`y: -300` over full section)
- Mid background: 0.6x scroll speed (`y: -150`)
- Content: 1.0x (normal scroll)
- Near overlay: 1.2x (slight forward movement)

See [references/parallax-layers.md](references/parallax-layers.md) for advanced patterns.

## Pinned Sections

Pin a section while scroll-driven animation plays within it.

```typescript
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".feature-showcase",
      start: "top top",
      end: "+=3000",        // Pin for 3000px of scroll
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  // Step 1: Show feature 1
  tl.from(".feature-1", { opacity: 0, y: 40, duration: 1 })
    .to({}, { duration: 0.5 })  // Hold for half a scroll-unit
    .to(".feature-1", { opacity: 0, duration: 0.5 })

  // Step 2: Show feature 2
    .from(".feature-2", { opacity: 0, y: 40, duration: 1 })
    .to({}, { duration: 0.5 })
    .to(".feature-2", { opacity: 0, duration: 0.5 })

  // Step 3: Show feature 3
    .from(".feature-3", { opacity: 0, y: 40, duration: 1 });
}, { scope: containerRef });
```

See [references/pin-sections.md](references/pin-sections.md) for multi-step pins and sticky sidebars.

## Horizontal Scroll

Convert vertical scroll into horizontal movement for a section.

```typescript
export function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray<HTMLElement>(".h-panel");
    const totalWidth = panels.reduce((sum, el) => sum + el.offsetWidth, 0);

    gsap.to(panels, {
      x: () => -(totalWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: () => `+=${totalWidth}`,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      <div ref={wrapperRef} className="overflow-hidden">
        <div className="flex">
          {children}
        </div>
      </div>
    </div>
  );
}

// Usage
<HorizontalScroll>
  <div className="h-panel w-screen flex-shrink-0">Panel 1</div>
  <div className="h-panel w-screen flex-shrink-0">Panel 2</div>
  <div className="h-panel w-screen flex-shrink-0">Panel 3</div>
</HorizontalScroll>
```

See [references/horizontal-scroll.md](references/horizontal-scroll.md) for progress indicators and snapping.

## Reveal Patterns

See [references/reveal-patterns.md](references/reveal-patterns.md) for the full collection.

### Clip-Path Circle Reveal
```typescript
gsap.from(".reveal-element", {
  clipPath: "circle(0% at 50% 50%)",
  duration: 1.2,
  ease: "power3.inOut",
  scrollTrigger: {
    trigger: ".reveal-element",
    start: "top 70%",
  },
});
// Set final state in CSS: clip-path: circle(100% at 50% 50%);
```

### Staggered Card Reveal
```typescript
ScrollTrigger.batch(".card", {
  onEnter: (batch) => {
    gsap.from(batch, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
    });
  },
  start: "top 85%",
});
```

## Pacing and Rhythm

### Rules for Section Pacing
1. **Alternate density** — Dense animated section → breathing space → dense section
2. **One focus per section** — Never animate more than 3 elements simultaneously
3. **Progressive complexity** — Start simple (fade-ups), build to complex (pinned sequences)
4. **Consistent scroll speed** — Don't pin one section for 5000px and the next for 500px. Keep pin durations proportional.

### Section Length Guidelines
- Hero: 100vh (viewport height)
- Breathing space: 50-100vh
- Pinned narrative: 200-400vh equivalent scroll distance
- Horizontal scroll: 200-300vh equivalent
- Reveal sections: natural content height

## Mobile Considerations

```typescript
useGSAP(() => {
  const isMobile = window.innerWidth < 768;

  ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => {
      // Desktop: full parallax experience
      gsap.to(".parallax-bg", {
        y: -200,
        scrollTrigger: { trigger: ".section", scrub: true },
      });
    },
    "(max-width: 767px)": () => {
      // Mobile: simpler reveals, no parallax
      gsap.from(".content", {
        y: 30,
        opacity: 0,
        scrollTrigger: {
          trigger: ".section",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    },
  });
});
```

**Mobile rules:**
- Remove parallax (causes jank on mobile Safari)
- Simplify to fade-up reveals
- Reduce pin duration
- Avoid horizontal scroll on narrow viewports
- Test on real devices (simulator is unreliable for scroll performance)

## Common Pitfalls

1. **Scroll jank** — Never read layout properties (offsetTop, getBoundingClientRect) in scroll handlers. Let ScrollTrigger handle position calculations.
2. **Pin spacing issues** — When stacking pinned sections, use `pinSpacing: false` on all but the first, or wrap each in a container.
3. **Lenis + ScrollTrigger conflict** — Always connect them via `lenis.on("scroll", ScrollTrigger.update)`. Without this, ScrollTrigger positions will be wrong.
4. **Dynamic content** — Call `ScrollTrigger.refresh()` after images load, fonts render, or async content appears.
5. **Overlong pins** — A pinned section that requires scrolling for 10 seconds feels broken. Keep pin scroll distances reasonable (2000-4000px max).
