# Easing & Rhythm Guide

## GSAP Built-in Eases — Visual Reference

```
power1.out    ████████░░  Subtle deceleration. Barely noticeable.
power2.out    ███████░░░  Standard deceleration. Good default for UI.
power3.out    ██████░░░░  Strong deceleration. Great for entrances.
power4.out    █████░░░░░  Very strong. Hero-level entrances.
expo.out      ████░░░░░░  Extreme. Snappy, decisive movement.

power1.in     ░░████████  Subtle acceleration.
power2.in     ░░░███████  Standard acceleration. Good for exits.
power3.in     ░░░░██████  Strong acceleration. Dramatic exits.

power2.inOut  ░░░████░░░  Smooth both ways. Section transitions.
power3.inOut  ░░░░███░░░  Strong version. Elegant, cinematic.

back.out(1.7) ██████▓░░░  Overshoot then settle. Playful.
back.in(1.7)  ░░░▓██████  Pull back then fly. Dramatic exits.

elastic.out(1, 0.3)  ██████░▓░▓░  Spring/bounce. Fun, energetic.

bounce.out    ██░█░▓░▓░   Ball bounce. Use sparingly.

circ.out      █████░░░░░  Circular motion feel. Natural.
sine.out      ████████░░  Gentle, wave-like. Very smooth.
sine.inOut    ░░██████░░  Breathing, pulsing motions.
```

## Easing Decision Framework

### By Animation Purpose

**Entrance (element appearing):**
- Default choice: `power3.out`
- Subtle entrance: `power2.out`
- Dramatic entrance: `power4.out` or `expo.out`
- Playful entrance: `back.out(1.7)`
- Bouncy entrance: `elastic.out(1, 0.3)`

**Exit (element leaving):**
- Default choice: `power2.in`
- Quick dismiss: `power3.in`
- Dramatic exit: `back.in(1.7)` (pulls back, then flies away)

**Continuous motion (looping, background):**
- Breathing/pulse: `sine.inOut`
- Orbit/rotation: `none` (constant speed)
- Gentle float: `power1.inOut`

**UI feedback:**
- Button press: `power3.out` (quick response)
- Toggle switch: `back.out(1.4)` (slight overshoot)
- Error shake: `power2.inOut` (3x yoyo)

**Scroll-scrubbed:**
- Always use `ease: "none"` — the scroll position IS the easing
- The smoothness comes from `scrub: 0.3` (lag), not from easing

### By Element Size

**Large elements (hero images, full-screen overlays):**
- Use `power4.out` or `expo.out` — strong easing matches the scale
- Duration: 1.0-1.5s

**Medium elements (cards, sections, panels):**
- Use `power3.out` — balanced feel
- Duration: 0.6-1.0s

**Small elements (buttons, badges, icons):**
- Use `back.out(1.7)` or `elastic.out(1, 0.5)` — playfulness suits small scale
- Duration: 0.3-0.6s

**Text (characters, words):**
- Use `power3.out` for masked reveals
- Duration: 0.5-0.8s per character group
- Stagger: 0.02-0.05s between characters

## Custom Eases

```typescript
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);

// Create a custom ease from SVG path data
CustomEase.create("myEase", "M0,0 C0.1,0.8 0.2,1 1,1");

// Use it
gsap.to(".element", { x: 100, ease: "myEase" });
```

**Design custom eases at:** https://gsap.com/docs/v3/Eases/CustomEase/

## Stagger Timing

### Stagger by Speed

```typescript
// `each` — fixed time between each element
stagger: { each: 0.05 }   // 50ms between each (fast, crisp)
stagger: { each: 0.1 }    // 100ms (default, balanced)
stagger: { each: 0.2 }    // 200ms (slow, dramatic)

// `amount` — total stagger spread time
stagger: { amount: 0.5 }  // All items within 0.5s (fast for many items)
stagger: { amount: 1.0 }  // All items within 1s (balanced)
stagger: { amount: 2.0 }  // All items within 2s (dramatic cascade)
```

**Rule of thumb:**
- Use `each` when you want consistent rhythm regardless of item count
- Use `amount` when you want the total duration controlled

### Stagger Direction

```typescript
// Default: left to right / top to bottom
stagger: { each: 0.08, from: "start" }

// Center outward (great for grids, symmetric layouts)
stagger: { each: 0.05, from: "center" }

// Edges inward
stagger: { each: 0.05, from: "edges" }

// Right to left / bottom to top
stagger: { each: 0.08, from: "end" }

// Random (organic, natural feeling)
stagger: { each: 0.05, from: "random" }

// From a specific index
stagger: { each: 0.05, from: 3 }  // Ripple from 4th element
```

### Grid Stagger (2D)

```typescript
gsap.from(".grid-item", {
  scale: 0,
  opacity: 0,
  duration: 0.5,
  ease: "back.out(1.7)",
  stagger: {
    each: 0.04,
    from: "center",
    grid: "auto",      // Auto-detect grid dimensions
    axis: null,         // Radial pattern (null = both axes)
  }
});
```

## Rhythm Patterns

### Accordion Rhythm (fast → slow → fast)
```typescript
const tl = gsap.timeline();
tl.from(".item-1", { y: 40, opacity: 0, duration: 0.4 })
  .from(".item-2", { y: 40, opacity: 0, duration: 0.6 }, "-=0.2")
  .from(".item-3", { y: 40, opacity: 0, duration: 0.8 }, "-=0.3")  // Slowest
  .from(".item-4", { y: 40, opacity: 0, duration: 0.6 }, "-=0.3")
  .from(".item-5", { y: 40, opacity: 0, duration: 0.4 }, "-=0.2");
```

### Cascade with Overlap
```typescript
const tl = gsap.timeline();
const items = gsap.utils.toArray(".item");

items.forEach((item, i) => {
  tl.from(item, {
    y: 60,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  }, i * 0.12); // Each starts 120ms after the previous
});
```

### Breathing Animation
```typescript
gsap.to(".breathing-element", {
  scale: 1.05,
  duration: 2,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});
```
