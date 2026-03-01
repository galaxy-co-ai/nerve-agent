# Hover Effects

## Perspective Tilt with Highlight

Enhanced tilt card with light reflection that follows the mouse.

```typescript
"use client";
import { useRef, useEffect } from "react";

export function TiltCardWithLight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const light = lightRef.current;
    if (!card || !light) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Tilt
      const rotateX = (y - 0.5) * -15;
      const rotateY = (x - 0.5) * 15;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

      // Light follows mouse
      light.style.opacity = "1";
      light.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
    };

    const onMouseLeave = () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
      card.style.transition = "transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)";
      light.style.opacity = "0";
      setTimeout(() => { card.style.transition = ""; }, 600);
    };

    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);

    return () => {
      card.removeEventListener("mousemove", onMouseMove);
      card.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {/* Light overlay */}
      <div
        ref={lightRef}
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
      />
    </div>
  );
}
```

## Image Reveal on Hover

Image hidden behind a solid color block that slides away on hover.

```typescript
export function ImageReveal({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="group relative overflow-hidden cursor-pointer">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Sliding overlay */}
      <div className="absolute inset-0 bg-black transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:translate-x-full" />
    </div>
  );
}
```

## Border Animation on Hover

Border draws itself around an element on hover.

```css
.border-draw {
  position: relative;
  padding: 1rem 2rem;
}

.border-draw::before,
.border-draw::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 1px solid transparent;
  box-sizing: border-box;
  transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
}

.border-draw::before {
  top: 0;
  left: 0;
}

.border-draw::after {
  bottom: 0;
  right: 0;
}

.border-draw:hover::before {
  width: 100%;
  height: 100%;
  border-color: white;
  transition: width 0.3s ease, height 0.3s ease 0.3s;
}

.border-draw:hover::after {
  width: 100%;
  height: 100%;
  border-color: white;
  transition: width 0.3s ease, height 0.3s ease 0.3s;
}
```

## Text Underline Animation

Line draws under text on hover, from left to right.

```css
.animated-underline {
  position: relative;
  display: inline-block;
}

.animated-underline::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
}

.animated-underline:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

## Staggered List Hover

When hovering a list, other items dim while the hovered item highlights.

```css
.stagger-list:hover .stagger-item {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.stagger-list .stagger-item:hover {
  opacity: 1;
}
```

## Gradient Follow

Background gradient follows the mouse position.

```typescript
export function GradientFollow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      el.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(120,80,255,0.15) 0%, transparent 50%)`;
    };

    const onMouseLeave = () => {
      el.style.background = "transparent";
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div ref={ref} className="relative transition-[background] duration-300">
      {children}
    </div>
  );
}
```

## Clip-Path Shape Morph on Hover

Element morphs from one clip-path shape to another.

```css
.shape-morph {
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  transition: clip-path 0.5s cubic-bezier(0.33, 1, 0.68, 1);
}

.shape-morph:hover {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}
```

## Accessibility Considerations

All hover effects must account for users who can't hover:

```css
/* Only apply hover effects when device supports hover */
@media (hover: hover) and (pointer: fine) {
  .hover-effect:hover {
    /* ... hover styles */
  }
}

/* Reduced motion: disable animated hovers */
@media (prefers-reduced-motion: reduce) {
  .hover-effect {
    transition: none !important;
  }
}
```

For keyboard users, ensure `:focus-visible` triggers the same visual effect:

```css
.interactive-element:hover,
.interactive-element:focus-visible {
  /* Same visual treatment */
}
```
