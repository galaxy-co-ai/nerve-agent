# Parallax Layer Patterns

## CSS-Based Parallax (Lightweight)

For simple parallax without GSAP. Uses CSS `perspective` and `translateZ`.

```css
.parallax-container {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  perspective: 1px;
  perspective-origin: center center;
}

.parallax-layer {
  position: absolute;
  inset: 0;
}

.parallax-layer--back {
  transform: translateZ(-2px) scale(3);  /* Moves slower, scale compensates */
}

.parallax-layer--mid {
  transform: translateZ(-1px) scale(2);
}

.parallax-layer--front {
  transform: translateZ(0);              /* Normal speed */
}
```

**Limitation:** Only works within a single scroll container, not the main page scroll.

## GSAP Parallax — Full-Page Sections

```typescript
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ParallaxSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current!;

    // Background image: moves at 0.3x scroll speed
    gsap.to(section.querySelector(".bg-image"), {
      yPercent: -30,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    // Floating decorations: different speeds for depth
    gsap.utils.toArray<HTMLElement>(".floating-element").forEach((el, i) => {
      const speed = 50 + (i * 30);
      const direction = i % 2 === 0 ? -1 : 1;

      gsap.to(el, {
        y: speed * direction,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    // Content text: slight upward drift
    gsap.to(section.querySelector(".content"), {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef} className="relative h-[150vh] overflow-hidden">
      {/* Background layer */}
      <div className="bg-image absolute inset-0 -top-[20%] -bottom-[20%]">
        <img src="/bg.jpg" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Floating decorations */}
      <div className="floating-element absolute top-[20%] left-[10%] w-20 h-20 rounded-full bg-white/10" />
      <div className="floating-element absolute top-[40%] right-[15%] w-16 h-16 rounded-full bg-white/5" />
      <div className="floating-element absolute top-[60%] left-[60%] w-24 h-24 rounded-full bg-white/8" />

      {/* Content */}
      <div className="content relative z-10 flex items-center justify-center h-screen">
        <h2 className="text-6xl font-bold text-white">Parallax Section</h2>
      </div>
    </div>
  );
}
```

**Key technique:** Make the background image container taller than the section (via `-top-[20%] -bottom-[20%]`), then move it within that extra space. This prevents gaps at top/bottom during parallax movement.

## Multi-Layer Depth Scene

```typescript
export function DepthScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const layers = [
      { selector: ".depth-5", speed: -200 },  // Farthest, slowest
      { selector: ".depth-4", speed: -150 },
      { selector: ".depth-3", speed: -100 },
      { selector: ".depth-2", speed: -50 },
      { selector: ".depth-1", speed: 0 },      // Content layer, normal
      { selector: ".depth-0", speed: 30 },      // Foreground, slight opposite
    ];

    layers.forEach(({ selector, speed }) => {
      const el = containerRef.current?.querySelector(selector);
      if (!el || speed === 0) return;

      gsap.to(el, {
        y: speed,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <div className="depth-5 absolute inset-0">{/* Stars/sky */}</div>
      <div className="depth-4 absolute inset-0">{/* Mountains */}</div>
      <div className="depth-3 absolute inset-0">{/* Trees */}</div>
      <div className="depth-2 absolute inset-0">{/* Fog */}</div>
      <div className="depth-1 absolute inset-0">{/* Content */}</div>
      <div className="depth-0 absolute inset-0">{/* Foreground particles */}</div>
    </div>
  );
}
```

## Image Parallax on Scroll

```typescript
// Image moves within its container as user scrolls
export function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      containerRef.current?.querySelector("img"),
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="overflow-hidden h-[60vh]">
      <img
        src={src}
        alt={alt}
        className="w-full h-[130%] object-cover"  // Taller than container
      />
    </div>
  );
}
```

## Mobile Considerations

On mobile, parallax should be simplified or removed:

```typescript
useGSAP(() => {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  if (isMobile) {
    // Simple fade-in instead of parallax
    gsap.from(".content", {
      opacity: 0,
      y: 20,
      scrollTrigger: {
        trigger: ".section",
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
    return;
  }

  // Full parallax for desktop
  // ... parallax code here
});
```

**Why disable on mobile:**
- Mobile Safari has aggressive scroll optimization that breaks parallax
- Touch scrolling has different physics than wheel scrolling
- GPU memory is limited on mobile — fewer composited layers is better
- Small screens don't benefit from depth effects as much
