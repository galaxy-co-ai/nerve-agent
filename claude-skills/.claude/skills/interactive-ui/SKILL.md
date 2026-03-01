---
name: interactive-ui
description: Craft premium interactive elements — custom cursors (magnetic, morphing, trailing), hover effects (tilt cards, magnetic buttons, image distortion), loading sequences, and micro-interactions. Use when building custom cursor experiences, hover effects for portfolio grids, magnetic buttons, mouse-tracking parallax, or any mouse/touch-driven interactive element.
---

# Interactive UI Elements

## Custom Cursor Philosophy

- Use custom cursors for **experiential areas** (hero, portfolio, 3D scenes)
- Keep default cursor for **functional UI** (nav, forms, CTAs, text)
- Always maintain click affordance — user must know what's clickable
- **Hide custom cursor on touch devices** — it's meaningless without a mouse

## Custom Cursor: Dot + Ring Follower

The most common premium cursor. A small dot follows the mouse instantly while a larger ring follows with smooth delay.

```typescript
"use client";
import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide on touch devices
    if ("ontouchstart" in window) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const animate = () => {
      // Ring follows with smooth delay
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      requestAnimationFrame(animate);
    };

    // Hover state: grow ring on interactive elements
    const onMouseEnter = () => {
      ringRef.current?.classList.add("scale-150", "opacity-50");
    };
    const onMouseLeave = () => {
      ringRef.current?.classList.remove("scale-150", "opacity-50");
    };

    const interactives = document.querySelectorAll("a, button, [data-cursor-hover]");
    interactives.forEach(el => {
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mouseleave", onMouseLeave);
    });

    document.addEventListener("mousemove", onMouseMove);
    const frameId = requestAnimationFrame(animate);

    // Hide default cursor
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
      document.body.style.cursor = "";
      interactives.forEach(el => {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Dot — 8px, instant follow */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference"
      />
      {/* Ring — 40px, smooth follow */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 -ml-5 -mt-5 rounded-full border border-white/50 pointer-events-none z-[9999] mix-blend-difference transition-[transform,opacity] duration-300"
      />
    </>
  );
}
```

See [references/custom-cursor.md](references/custom-cursor.md) for magnetic cursor, morphing cursor, and trail effects.

## Magnetic Button

Button element pulls toward the mouse when hovering nearby. Premium feel.

```typescript
"use client";
import { useRef, useEffect } from "react";

export function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const maxDistance = 100; // Magnetic range in pixels
      const strength = Math.max(0, 1 - distance / maxDistance);

      if (strength > 0) {
        const moveX = deltaX * strength * 0.3;
        const moveY = deltaY * strength * 0.3;
        button.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      } else {
        button.style.transform = "translate3d(0, 0, 0)";
      }
    };

    const onMouseLeave = () => {
      button.style.transform = "translate3d(0, 0, 0)";
      button.style.transition = "transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)";
      setTimeout(() => { button.style.transition = ""; }, 500);
    };

    window.addEventListener("mousemove", onMouseMove);
    button.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      button.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <button ref={buttonRef} className={className}>
      {children}
    </button>
  );
}
```

## 3D Tilt Card

Card tilts in 3D based on mouse position. Adds depth and tactile feel.

```typescript
"use client";
import { useRef, useEffect } from "react";

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0-1
      const y = (e.clientY - rect.top) / rect.height;    // 0-1

      const rotateX = (y - 0.5) * -20;  // -10 to 10 degrees
      const rotateY = (x - 0.5) * 20;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const onMouseLeave = () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
      card.style.transition = "transform 0.5s ease-out";
      setTimeout(() => { card.style.transition = ""; }, 500);
    };

    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);

    return () => {
      card.removeEventListener("mousemove", onMouseMove);
      card.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef} className={className} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}
```

## Hover Effects

See [references/hover-effects.md](references/hover-effects.md) for image distortion on hover, color shift, and clip-path reveals.

### Image Scale + Slight Rotation on Hover

```css
.image-hover-container {
  overflow: hidden;
}

.image-hover-container img {
  transition: transform 0.6s cubic-bezier(0.33, 1, 0.68, 1);
}

.image-hover-container:hover img {
  transform: scale(1.05) rotate(1deg);
}
```

## Micro-Interactions

### Button Press Feedback

```typescript
"use client";
import { motion } from "framer-motion";

export function PressButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
```

### Toggle Switch with Spring

```typescript
"use client";
import { motion } from "framer-motion";

export function SpringToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
        checked ? "bg-green-500" : "bg-gray-600"
      }`}
      onClick={() => onChange(!checked)}
    >
      <motion.div
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
        animate={{ left: checked ? "calc(100% - 28px)" : "4px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
```

## Loading Sequences

See [references/loading-sequences.md](references/loading-sequences.md) for preloader patterns.

### Minimal Progress Bar

```typescript
"use client";
import { useEffect, useState } from "react";

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading (replace with actual asset tracking)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="w-48">
        <div className="h-px bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-white/40 text-xs mt-3 text-center font-mono">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>
    </div>
  );
}
```

## Mobile Considerations

- **No hover on mobile** — Tilt cards and magnetic buttons should be static on touch
- **Custom cursor** — Hide entirely on touch devices (`"ontouchstart" in window`)
- **Touch feedback** — Use `:active` states and haptic feedback where available
- **Reduce motion** — Check `prefers-reduced-motion` and disable all mouse-tracking effects

```typescript
useEffect(() => {
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isTouchDevice || prefersReduced) return; // No hover effects

  // ... mouse tracking code
}, []);
```

## Common Pitfalls

1. **Using `left`/`top` instead of `transform`** — Never position cursor or magnetic elements with layout properties. Always use `transform: translate3d()`.
2. **Missing pointer-events: none** — Custom cursor elements must have `pointer-events: none` or they block clicks.
3. **Z-index wars** — Set custom cursor to `z-index: 9999` and use `mix-blend-mode: difference` for visibility over all content.
4. **Memory leaks** — Always remove mousemove listeners in cleanup. Attaching to `window` without cleanup leaks.
5. **Jank on scroll** — Don't update cursor position during scroll events. Only on mousemove.
