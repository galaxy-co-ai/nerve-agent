# Text Animation Patterns

## SplitText Setup

```typescript
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);
```

## Pattern 1: Masked Character Slide-Up (Most Professional)

Characters slide up from behind a mask. Clean, cinematic, studio-standard.

```typescript
export function MaskedReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, {
      type: "chars,lines",
      linesClass: "split-line",
    });

    // Set overflow hidden on line wrappers for mask effect
    gsap.set(".split-line", {
      overflow: "hidden",
      display: "inline-block", // Prevent line breaks within wrapper
    });

    gsap.from(split.chars, {
      y: "110%",           // Start fully below the mask
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.025,
    });
  }, { scope: ref });

  return <h1 ref={ref} className={className}>{text}</h1>;
}
```

**CSS requirement:**
```css
.split-line {
  overflow: hidden;
  display: inline-block;
  vertical-align: bottom; /* Prevents baseline jump */
}
```

## Pattern 2: Fade-Up Words

Words fade and slide up. Subtler than character animation, good for subheadings.

```typescript
export function FadeUpWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, { type: "words" });

    gsap.from(split.words, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.04,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }, { scope: ref });

  return <p ref={ref}>{text}</p>;
}
```

## Pattern 3: Line-by-Line Reveal

Lines reveal one at a time. Best for body text and descriptions.

```typescript
export function LineReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, {
      type: "lines",
      linesClass: "reveal-line",
    });

    gsap.set(".reveal-line", { overflow: "hidden" });

    // Wrap inner content for slide effect
    split.lines.forEach(line => {
      const inner = document.createElement("div");
      inner.innerHTML = line.innerHTML;
      line.innerHTML = "";
      line.appendChild(inner);

      gsap.from(inner, {
        y: "100%",
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: line,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }, { scope: ref });

  return <div ref={ref}>{children}</div>;
}
```

## Pattern 4: Typewriter Effect

Characters appear one at a time with a blinking cursor.

```typescript
export function Typewriter({ text, speed = 0.05 }: { text: string; speed?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, { type: "chars" });

    gsap.from(split.chars, {
      opacity: 0,
      duration: 0.01,       // Near-instant appearance
      stagger: speed,        // Time between each character
      ease: "none",
    });
  }, { scope: ref });

  return (
    <span ref={ref} className="relative">
      {text}
      <span className="animate-blink ml-0.5">|</span>
    </span>
  );
}
```

## Pattern 5: Scatter and Assemble

Characters start scattered randomly and animate to their correct positions.

```typescript
export function ScatterAssemble({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, { type: "chars" });

    gsap.from(split.chars, {
      x: () => gsap.utils.random(-200, 200),
      y: () => gsap.utils.random(-150, 150),
      rotation: () => gsap.utils.random(-90, 90),
      opacity: 0,
      scale: 0,
      duration: 1.2,
      ease: "power4.out",
      stagger: {
        each: 0.02,
        from: "random",
      },
    });
  }, { scope: ref });

  return <h1 ref={ref}>{text}</h1>;
}
```

## Pattern 6: Scroll-Scrubbed Text Reveal

Text reveals character by character as user scrolls. Great for hero sections.

```typescript
export function ScrollRevealText({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, { type: "chars" });

    gsap.set(split.chars, { opacity: 0.15 }); // Dimmed initial state

    gsap.to(split.chars, {
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 70%",
        end: "top 20%",
        scrub: 0.5,
      },
    });
  }, { scope: ref });

  return <h1 ref={ref} className="text-6xl font-bold">{text}</h1>;
}
```

## Handling Resize

SplitText needs to re-split when the container resizes (text reflows).

```typescript
useGSAP(() => {
  let split: SplitText;

  function initSplit() {
    // Revert previous split if exists
    if (split) split.revert();

    split = new SplitText(".responsive-text", {
      type: "lines,words",
      linesClass: "line-wrap",
    });

    gsap.from(split.words, {
      y: 30,
      opacity: 0,
      stagger: 0.03,
    });
  }

  initSplit();

  // Re-split on resize
  const ro = new ResizeObserver(() => {
    initSplit();
    ScrollTrigger.refresh();
  });
  ro.observe(containerRef.current!);

  return () => ro.disconnect();
});
```

## Accessibility

```typescript
// Always respect prefers-reduced-motion
useGSAP(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    // Simple fade instead of per-character animation
    gsap.from(".headline", { opacity: 0, duration: 0.5 });
    return;
  }

  // Full animation for users who haven't requested reduced motion
  const split = new SplitText(".headline", { type: "chars" });
  gsap.from(split.chars, {
    y: "100%",
    duration: 0.7,
    stagger: 0.025,
    ease: "power3.out",
  });
});
```
