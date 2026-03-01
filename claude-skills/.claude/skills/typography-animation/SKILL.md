---
name: typography-animation
description: Animate typography with character reveals, word-by-word entrances, kinetic type, variable font morphing, and WebGL text rendering. Use when building animated headlines, text reveal sequences, kinetic type compositions, or any typography-driven motion design on the web.
---

# Typography Animation

## Text Reveal Hierarchy

Not all text should animate the same way. Match the animation to the text's role:

| Text Role | Animation Type | Granularity | Duration |
|-----------|---------------|-------------|----------|
| Hero headline | Masked character slide-up | Per character | 0.6-1.0s total |
| Section heading | Fade-up words | Per word | 0.5-0.8s total |
| Subheading | Fade-up | Per word or whole | 0.4-0.6s |
| Body text | Fade or line reveal | Per line or block | 0.3-0.5s |
| Caption/label | Simple fade | Whole element | 0.3s |

**Rule:** Never animate body text per-character. It's unreadable and distracting.

## Setup

```bash
npm install gsap @gsap/react
```

```typescript
"use client";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);
```

## Pattern 1: Masked Character Reveal (Studio Standard)

The most professional text reveal. Characters slide up from behind a mask line-by-line.

```typescript
export function HeadlineReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set(ref.current, { opacity: 1 });
      return;
    }

    const split = new SplitText(ref.current, {
      type: "chars,lines",
      linesClass: "overflow-hidden inline-block align-bottom",
    });

    gsap.from(split.chars, {
      y: "110%",
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.025,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }, { scope: ref });

  return <h2 ref={ref} className="opacity-0">{children}</h2>;
}
```

**Why this works:** The `overflow-hidden` on line wrappers creates a mask. Characters start below the mask (`y: 110%`) and slide up. The stagger creates a cascading left-to-right reveal. `power3.out` gives a fast start and gentle settle.

## Pattern 2: Scroll-Scrubbed Word Reveal

Words go from dim to bright as user scrolls through them. Great for long hero text.

```typescript
export function ScrollRevealText({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, { type: "words" });

    gsap.set(split.words, { opacity: 0.15 });

    gsap.to(split.words, {
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

  return <p ref={ref} className="text-4xl md:text-6xl font-bold leading-tight">{children}</p>;
}
```

## Pattern 3: Staggered Paragraph Lines

Lines reveal with a stagger, creating a curtain-like effect. Best for body text or pull quotes.

```typescript
export function LineByLineReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const split = new SplitText(ref.current, {
      type: "lines",
      linesClass: "overflow-hidden",
    });

    gsap.from(split.lines, {
      y: "100%",
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
      },
    });
  }, { scope: ref });

  return <div ref={ref}>{children}</div>;
}
```

## Pattern 4: Rotation Entrance

Characters rotate in from below. More dramatic, good for impact headlines.

```typescript
useGSAP(() => {
  const split = new SplitText(".rotate-headline", {
    type: "chars,lines",
    linesClass: "overflow-hidden inline-block [perspective:400px]",
  });

  gsap.from(split.chars, {
    rotateX: -90,
    y: "50%",
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.03,
    transformOrigin: "bottom center",
  });
}, { scope: containerRef });
```

## Variable Font Animation

Animate font axes (weight, width, slant) for morphing text effects.

```css
/* Requires a variable font */
@font-face {
  font-family: "InterVariable";
  src: url("/fonts/InterVariable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}
```

```typescript
// Animate font weight on hover
export function WeightHover({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const split = new SplitText(el, { type: "chars" });

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      split.chars.forEach((char: HTMLElement, i: number) => {
        const charRect = char.getBoundingClientRect();
        const charCenterX = charRect.left + charRect.width / 2 - rect.left;
        const distance = Math.abs(mouseX - charCenterX);
        const weight = Math.max(100, 900 - distance * 3);

        gsap.to(char, {
          fontWeight: weight,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    };

    const onMouseLeave = () => {
      gsap.to(split.chars, {
        fontWeight: 400,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <span ref={ref} style={{ fontFamily: "InterVariable", fontWeight: 400 }}>
      {children}
    </span>
  );
}
```

## WebGL Text

For 3D text effects, shader-based distortion, or particle text, render text in Three.js.

```typescript
import { Text } from "@react-three/drei";

// High-quality text rendering in 3D
function WebGLTitle() {
  return (
    <Text
      font="/fonts/Inter-Bold.woff"
      fontSize={1}
      color="white"
      anchorX="center"
      anchorY="middle"
      maxWidth={10}
    >
      STUDIO QUALITY
    </Text>
  );
}
```

For shader-based text effects (dissolve, distortion):
```typescript
import { Text } from "@react-three/drei";

function ShaderText() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <Text font="/fonts/Inter-Bold.woff" fontSize={1}>
      DISSOLVE
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={dissolveFragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
      />
    </Text>
  );
}
```

## Handling Resize

SplitText creates DOM elements based on current text layout. When the window resizes, text reflows and the split becomes invalid.

```typescript
useGSAP(() => {
  let split: ReturnType<typeof SplitText>;
  let animation: gsap.core.Tween;

  function createAnimation() {
    // Kill previous
    if (animation) animation.kill();
    if (split) split.revert();

    // Re-split
    split = new SplitText(".responsive-text", { type: "chars,lines" });

    // Re-animate
    animation = gsap.from(split.chars, {
      y: "100%",
      duration: 0.7,
      stagger: 0.02,
      ease: "power3.out",
    });
  }

  createAnimation();

  // Debounced resize handler
  let resizeTimeout: number;
  const onResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(createAnimation, 200);
  };

  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
});
```

## Accessibility

**Non-negotiable rules:**

1. **All text must remain in the DOM** — Don't replace text with canvas-only rendering. SplitText keeps text in the DOM.
2. **Screen readers** — SplitText wraps characters in `<div>` elements. Add `aria-label` on the parent with the full text.
3. **prefers-reduced-motion** — Use simple opacity fade instead of per-character animations.
4. **Final readable state** — Every text animation must reach a fully readable end state. No perpetual motion on body text.

```typescript
// Accessible text animation pattern
<h2 ref={ref} aria-label="Studio Quality Typography">
  Studio Quality Typography
</h2>
```

## Common Pitfalls

1. **Font loading flash** — SplitText runs before fonts load, causing wrong line breaks. Wait for `document.fonts.ready` before splitting.
2. **Line break changes** — Responsive text reflows at different widths. Use the resize handler above.
3. **Too many characters** — Don't animate more than ~50 characters with per-char stagger. It takes too long. Use words or lines for longer text.
4. **CSS conflicts** — `letter-spacing`, `word-spacing`, and `text-align: justify` can break SplitText positioning. Test carefully.
5. **React hydration** — SplitText modifies DOM, which can cause React hydration mismatches. Always run in `useGSAP` (client-only).
