---
name: page-transitions
description: Implement smooth page transitions, loading sequences, and asset preloading for websites. Includes route transitions in Next.js App Router, preloader screens, reveal sequences after page load, and choreographed exit/enter animations. Use when building route transitions, preloader screens, or any page-to-page transition effect.
---

# Page Transitions & Loading Sequences

## Transition Architecture

Every page transition follows this state machine:

```
IDLE → EXITING → LOADING → ENTERING → IDLE
```

1. **EXITING** — Current page animates out
2. **LOADING** — Route changes, new page assets load
3. **ENTERING** — New page animates in
4. **IDLE** — Interactive, ready

## Next.js App Router Transitions

### View Transitions API (Simplest, Modern)

The native View Transitions API provides cross-fade transitions with minimal code.

```typescript
// app/layout.tsx
"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function TransitionLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    if (!document.startViewTransition) {
      router.push(href);
      return;
    }

    document.startViewTransition(() => {
      router.push(href);
    });
  }, [href, router]);

  return <a href={href} onClick={handleClick}>{children}</a>;
}
```

```css
/* globals.css */
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-in;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

### GSAP-Powered Route Transitions (Full Control)

For complex, multi-step transitions with timeline control.

```typescript
"use client";
import { createContext, useContext, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface TransitionContextType {
  navigateTo: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({ navigateTo: () => {} });

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  const navigateTo = useCallback((href: string) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isTransitioning.current = false;
      },
    });

    // EXIT: Overlay slides in
    tl.to(overlayRef.current, {
      scaleY: 1,
      transformOrigin: "bottom",
      duration: 0.5,
      ease: "power3.inOut",
    });

    // NAVIGATE: Change route at midpoint
    tl.call(() => {
      router.push(href);
    });

    // Brief hold
    tl.to({}, { duration: 0.2 });

    // ENTER: Overlay slides out
    tl.to(overlayRef.current, {
      scaleY: 0,
      transformOrigin: "top",
      duration: 0.5,
      ease: "power3.inOut",
    });
  }, [router]);

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}
      {/* Transition overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black z-50 pointer-events-none"
        style={{ transform: "scaleY(0)" }}
      />
    </TransitionContext.Provider>
  );
}

export const useTransition = () => useContext(TransitionContext);
```

Usage:
```typescript
const { navigateTo } = useTransition();

<button onClick={() => navigateTo("/about")}>About</button>
```

## Transition Patterns

### Crossfade (Simplest)
```typescript
// Exit: fade out current page
gsap.to(".page-content", { opacity: 0, duration: 0.3 });
// Enter: fade in new page
gsap.from(".page-content", { opacity: 0, duration: 0.3 });
```

### Slide
```typescript
// Exit: slide current page left
gsap.to(".page-content", { x: "-100%", duration: 0.5, ease: "power3.inOut" });
// Enter: slide new page from right
gsap.from(".page-content", { x: "100%", duration: 0.5, ease: "power3.inOut" });
```

### Curtain Wipe
```typescript
// Overlay div expands, covers screen, then reveals new page
const tl = gsap.timeline();
tl.to(".curtain", { scaleY: 1, transformOrigin: "bottom", duration: 0.5, ease: "power3.inOut" })
  .call(() => router.push(href))
  .to({}, { duration: 0.1 })
  .to(".curtain", { scaleY: 0, transformOrigin: "top", duration: 0.5, ease: "power3.inOut" });
```

### Staggered Element Exit/Enter
```typescript
// Exit: elements stagger out
gsap.to(".page-element", {
  y: -30,
  opacity: 0,
  stagger: 0.05,
  duration: 0.3,
  ease: "power2.in",
  onComplete: () => router.push(href),
});

// Enter (on new page mount):
gsap.from(".page-element", {
  y: 30,
  opacity: 0,
  stagger: 0.08,
  duration: 0.5,
  ease: "power3.out",
  delay: 0.1,
});
```

## Loading Sequences

### Asset-Aware Preloader

Track real loading progress for Three.js textures, images, and fonts.

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";

interface PreloaderProps {
  assets: string[];      // URLs to preload
  onComplete: () => void;
}

export function Preloader({ assets, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let loaded = 0;

    const updateProgress = () => {
      loaded++;
      const pct = (loaded / assets.length) * 100;
      setProgress(pct);

      // Animate progress bar smoothly
      gsap.to(progressRef.current, {
        scaleX: pct / 100,
        duration: 0.3,
        ease: "power2.out",
      });

      if (loaded === assets.length) {
        // Minimum display time prevents flash
        setTimeout(() => {
          gsap.to(".preloader", {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete,
          });
        }, 500);
      }
    };

    // Preload images
    assets.forEach(url => {
      if (url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = url;
      } else {
        // For other assets, fetch them
        fetch(url).then(updateProgress).catch(updateProgress);
      }
    });
  }, [assets, onComplete]);

  return (
    <div className="preloader fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="w-48 space-y-4">
        {/* Logo or brand mark */}
        <div className="text-center text-white/60 text-sm font-mono tracking-widest">
          LOADING
        </div>

        {/* Progress bar */}
        <div className="h-px bg-white/10 overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-white origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Percentage */}
        <div className="text-center text-white/30 text-xs font-mono">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}
```

### Three.js Asset Preloader

```typescript
import * as THREE from "three";

export function preloadTextures(urls: string[]): Promise<THREE.Texture[]> {
  const loader = new THREE.TextureLoader();
  const manager = new THREE.LoadingManager();

  return new Promise((resolve) => {
    const textures: THREE.Texture[] = [];

    manager.onLoad = () => resolve(textures);

    urls.forEach(url => {
      loader.load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        textures.push(texture);
      });
    });
  });
}
```

## First-Visit vs Return-Visit

```typescript
export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const visited = sessionStorage.getItem("hasVisited");
    if (visited) {
      setIsFirstVisit(false);
    } else {
      sessionStorage.setItem("hasVisited", "true");
    }
  }, []);

  return isFirstVisit;
}

// Usage: show full preloader on first visit, skip on return
const isFirstVisit = useFirstVisit();

if (isFirstVisit) {
  return <Preloader assets={[...]} onComplete={() => setLoaded(true)} />;
}
```

## Common Pitfalls

1. **Scroll position** — Reset scroll to top after route transition: `window.scrollTo(0, 0)`
2. **GSAP cleanup** — Kill transition timelines on unmount to prevent ghost animations
3. **Double navigation** — Guard against clicking a link during an active transition
4. **Flash of content** — Set initial page opacity to 0 and animate in, preventing visible layout
5. **Audio/video** — Pause media on page exit, don't let it play during transition
6. **3D scene disposal** — Dispose Three.js scenes before navigating away to prevent memory leaks
7. **Back button** — Transitions must work with browser back/forward navigation, not just click events

## Integration

- **GSAP** → All transition animations use GSAP timelines (see `gsap-motion`)
- **Three.js** → Preload textures and models before reveal (see `three-js-experiences`)
- **Loading** → Use real asset loading progress, not fake timers
