# Tech Stack Decision Guide

## Animation Libraries

### GSAP 3 (Primary animation engine)
**Use for:** Timeline orchestration, scroll-driven animation, text splitting, complex sequences
**Install:** `npm install gsap`
**All plugins are free** (as of 2024 — ScrollTrigger, SplitText, MorphSVG, DrawSVG, etc.)

```typescript
// Registration (do once, typically in a layout component)
"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
```

**Key plugins:**
- `ScrollTrigger` — Scroll-driven animations (pin, scrub, snap)
- `SplitText` — Split text into chars/words/lines for animation
- `Flip` — State-to-state layout transitions
- `MorphSVG` — SVG shape morphing
- `DrawSVG` — SVG stroke animation
- `CustomEase` — Design custom easing curves

### Three.js + React Three Fiber (3D)
**Use for:** 3D scenes, particle systems, custom shaders, post-processing
**Install:** `npm install three @react-three/fiber @react-three/drei @react-three/postprocessing`

```typescript
import { Canvas } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
```

**Key packages:**
- `@react-three/fiber` — React renderer for Three.js
- `@react-three/drei` — Utilities (controls, materials, helpers, text)
- `@react-three/postprocessing` — Post-processing effects
- `three-stdlib` — Extra Three.js utilities

### Lenis (Smooth scroll)
**Use for:** Smooth, momentum-based scrolling
**Install:** `npm install lenis`

```typescript
"use client";
import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

### Framer Motion (Layout animations)
**Use for:** Mount/unmount animations, layout transitions, simple hover effects
**Install:** `npm install framer-motion`

Use Framer Motion when you need:
- `AnimatePresence` for exit animations
- `layout` prop for automatic layout transitions
- Simple declarative animations in JSX
- Gesture-based animations (drag, hover, tap)

**Do NOT use Framer Motion for:**
- Complex timelines (use GSAP)
- Scroll-driven animations (use GSAP ScrollTrigger)
- 3D effects (use Three.js)
- Performance-critical animations with many elements (use GSAP)

## Decision Matrix

| Scenario | Library | Why |
|----------|---------|-----|
| Hero text reveal with staggered characters | GSAP + SplitText | Precise timing control, masked reveals |
| Scroll-pinned section with scrubbed animation | GSAP ScrollTrigger | Scrub, pin, snap built-in |
| 3D product viewer with rotation | R3F + Drei | OrbitControls, Environment, PresentationControls |
| Background particle field | Three.js InstancedMesh | GPU-accelerated, custom shaders |
| Cosmic black hole effect | Three.js + custom GLSL | Full GPU control needed |
| Page route transition | View Transitions API + GSAP | Native browser support + timeline control |
| Component mount/unmount | Framer Motion AnimatePresence | Handles exit animations natively |
| Accordion/tab content swap | Framer Motion layout | Smooth height animation |
| Smooth page scroll | Lenis | Momentum, touch support, GSAP integration |
| Custom cursor | Vanilla JS + RAF | No library needed, simple lerp |
| Image hover distortion | Three.js ShaderMaterial | GPU fragment shader for effect |
| Number counter on scroll | GSAP ScrollTrigger | Scrubbed counter tied to scroll |
| SVG path drawing | GSAP DrawSVG | Stroke animation with timeline |
| Parallax layers | GSAP ScrollTrigger | Speed-based scroll offset |
| Loading progress bar | GSAP + THREE.LoadingManager | Track real asset loading |

## Version Compatibility (as of 2026)

| Package | Version | Notes |
|---------|---------|-------|
| three | r170+ | Use latest stable |
| @react-three/fiber | 9.x | Requires React 19 |
| @react-three/drei | 9.x+ | Match with R3F version |
| gsap | 3.12+ | All plugins free |
| lenis | 1.1+ | Replaces Locomotive Scroll |
| framer-motion | 12.x | Supports React 19 |
| next | 15+ | App Router, View Transitions |

## Package Installation Template

For a full studio-quality site, start with:

```bash
# Core animation
npm install gsap lenis

# 3D (only if needed)
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing

# Layout animations (optional)
npm install framer-motion
```
