# Reveal Patterns

Production-ready scroll reveal patterns. Each pattern is self-contained and ready to use.

## Fade Up (The Default)

The most common and most professional reveal. Simple, clean, effective.

```typescript
useGSAP(() => {
  ScrollTrigger.batch(".fade-up", {
    onEnter: (batch) => {
      gsap.from(batch, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
      });
    },
    start: "top 85%",
  });
});
```

## Clip-Path Circle Reveal

Circle expands from center to reveal content. Great for images and hero sections.

```typescript
useGSAP(() => {
  gsap.from(".circle-reveal", {
    clipPath: "circle(0% at 50% 50%)",
    duration: 1.5,
    ease: "power3.inOut",
    scrollTrigger: {
      trigger: ".circle-reveal",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
});
```

```css
.circle-reveal {
  clip-path: circle(100% at 50% 50%);
}
```

## Clip-Path Inset Reveal

Rectangle opens from center. Clean, geometric reveal for cards and panels.

```typescript
useGSAP(() => {
  gsap.from(".inset-reveal", {
    clipPath: "inset(50% 50% 50% 50%)",  // Collapsed to center point
    duration: 1.2,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".inset-reveal",
      start: "top 75%",
    },
  });
});
```

```css
.inset-reveal {
  clip-path: inset(0% 0% 0% 0%);  /* Fully open */
}
```

## Sliding Overlay Reveal

A colored overlay slides away to reveal content beneath.

```typescript
export function OverlayReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    // Overlay slides in
    tl.from(ref.current?.querySelector(".overlay"), {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 0.6,
      ease: "power3.inOut",
    });

    // Content fades in while overlay slides out
    tl.from(ref.current?.querySelector(".content"), {
      opacity: 0,
      duration: 0.01,
    });

    tl.to(ref.current?.querySelector(".overlay"), {
      scaleX: 0,
      transformOrigin: "right center",
      duration: 0.6,
      ease: "power3.inOut",
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="relative overflow-hidden">
      <div className="content">{children}</div>
      <div className="overlay absolute inset-0 bg-white" />
    </div>
  );
}
```

## Scale and Fade

Element scales up from slightly smaller. Adds dimension without being flashy.

```typescript
useGSAP(() => {
  gsap.from(".scale-reveal", {
    scale: 0.9,
    opacity: 0,
    duration: 1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".scale-reveal",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
});
```

## Staggered Grid Reveal

Grid items reveal from center outward. Great for portfolio grids.

```typescript
useGSAP(() => {
  const items = gsap.utils.toArray<HTMLElement>(".grid-item");

  gsap.from(items, {
    y: 60,
    opacity: 0,
    scale: 0.95,
    duration: 0.8,
    ease: "power3.out",
    stagger: {
      each: 0.06,
      from: "center",
      grid: "auto",
    },
    scrollTrigger: {
      trigger: ".grid-container",
      start: "top 80%",
    },
  });
});
```

## Counter Animation

Numbers count up as they scroll into view. For stats sections.

```typescript
export function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const obj = { value: 0 };

    gsap.to(obj, {
      value: end,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.value).toLocaleString() + suffix;
        }
      },
    });
  }, { scope: ref });

  return <span ref={ref}>0{suffix}</span>;
}

// Usage
<AnimatedCounter end={1500} suffix="+" />
<AnimatedCounter end={98} suffix="%" />
```

## Image Sequence on Scroll

Play through a series of images as user scrolls (like Apple product pages).

```typescript
export function ImageSequence({ frames, count }: { frames: string[]; count: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const images: HTMLImageElement[] = [];
    const obj = { frame: 0 };

    // Preload all frames
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = frames[i];
      images.push(img);
    }

    images[0].onload = () => {
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      render();
    };

    function render() {
      const index = Math.min(Math.round(obj.frame), count - 1);
      if (images[index]?.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[index], 0, 0);
      }
    }

    gsap.to(obj, {
      frame: count - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: canvas,
        start: "top top",
        end: "+=3000",
        scrub: 0.5,
        pin: true,
      },
      onUpdate: render,
    });
  });

  return <canvas ref={canvasRef} className="w-full h-screen object-contain" />;
}
```

## Accessibility

All reveal animations should respect `prefers-reduced-motion`:

```typescript
useGSAP(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    // Make everything visible immediately
    gsap.set(".fade-up, .scale-reveal, .circle-reveal", {
      opacity: 1,
      y: 0,
      scale: 1,
      clipPath: "none",
    });
    return;
  }

  // Full animations here...
});
```
