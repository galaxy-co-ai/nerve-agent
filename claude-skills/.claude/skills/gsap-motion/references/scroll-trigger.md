# ScrollTrigger Advanced Patterns

## Configuration Reference

```typescript
ScrollTrigger.create({
  trigger: ".element",       // Element that triggers the animation
  start: "top 80%",         // "triggerPosition viewportPosition"
  end: "bottom 20%",        // When to end
  scrub: true,              // Link animation to scroll position
  pin: true,                // Pin the trigger element
  snap: 1 / 5,              // Snap to 5 equal sections
  markers: true,            // Debug markers (remove in production!)
  toggleActions: "play pause resume reverse",
  // Actions for: onEnter, onLeave, onEnterBack, onLeaveBack
  // Values: "play", "pause", "resume", "reverse", "restart", "reset", "complete", "none"
  onEnter: () => {},
  onLeave: () => {},
  onEnterBack: () => {},
  onLeaveBack: () => {},
  onUpdate: (self) => {
    console.log("progress:", self.progress); // 0-1
    console.log("direction:", self.direction); // 1 or -1
  },
});
```

## Start/End Position Syntax

```typescript
// Format: "triggerPoint viewportPoint"

start: "top top"        // Trigger's top hits viewport top
start: "top 80%"        // Trigger's top hits 80% down viewport
start: "top center"     // Trigger's top hits viewport center
start: "center center"  // Trigger's center hits viewport center
start: "top bottom"     // Trigger's top enters viewport (bottom edge)
start: "top bottom-=100" // 100px before trigger enters viewport

end: "bottom top"       // Trigger's bottom exits viewport (top edge)
end: "+=500"            // 500px after start position
end: "+=200%"           // 200% of trigger height after start
```

## Scrub Patterns

```typescript
// Boolean scrub — instant link to scroll
scrub: true

// Smooth scrub — 0.5s smoothing lag
scrub: 0.5

// Higher values = smoother but more latency
scrub: 1    // Good for slow, cinematic animations
scrub: 0.3  // Good for responsive, direct animations
```

## Pin Patterns

### Basic Pin
```typescript
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".pinned-section",
      start: "top top",
      end: "+=2000",
      scrub: 1,
      pin: true,
      anticipatePin: 1,   // Prevents jump when pinning starts
    }
  });

  tl.from(".step-1", { opacity: 0, y: 40 })
    .to(".step-1", { opacity: 0 }, "+=0.5")
    .from(".step-2", { opacity: 0, y: 40 })
    .to(".step-2", { opacity: 0 }, "+=0.5")
    .from(".step-3", { opacity: 0, y: 40 });
});
```

### Horizontal Scroll via Pin
```typescript
useGSAP(() => {
  const container = document.querySelector(".horizontal-container");
  const panels = gsap.utils.toArray<HTMLElement>(".panel");
  const totalWidth = panels.length * window.innerWidth;

  gsap.to(panels, {
    x: -(totalWidth - window.innerWidth),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: () => `+=${totalWidth}`,
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,
    }
  });
});
```

## Snap

```typescript
// Snap to sections
snap: {
  snapTo: 1 / 4,           // Snap to quarters
  duration: { min: 0.2, max: 0.5 },
  ease: "power2.inOut",
  delay: 0.1,              // Wait before snapping
}

// Snap to array of progress values
snap: {
  snapTo: [0, 0.25, 0.5, 0.75, 1],
  duration: 0.3,
}

// Snap to labels on a timeline
snap: {
  snapTo: "labels",
  duration: 0.5,
}
```

## Batch (Staggered Scroll Reveals)

```typescript
// Reveal elements as they enter the viewport, with stagger
useGSAP(() => {
  ScrollTrigger.batch(".card", {
    onEnter: (batch) => {
      gsap.from(batch, {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: "power3.out",
      });
    },
    start: "top 85%",
  });
});
```

## Parallax Layers

```typescript
useGSAP(() => {
  // Background moves slowly
  gsap.to(".parallax-bg", {
    y: -200,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    }
  });

  // Midground moves at medium speed
  gsap.to(".parallax-mid", {
    y: -100,
    ease: "none",
    scrollTrigger: {
      trigger: ".parallax-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    }
  });

  // Foreground stays with scroll (default behavior)
});
```

## Progress-Based Effects

```typescript
useGSAP(() => {
  ScrollTrigger.create({
    trigger: ".article",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      // Update reading progress bar
      gsap.set(".reading-progress", { scaleX: self.progress });

      // Change header style at 10% scroll
      if (self.progress > 0.1) {
        gsap.to(".header", { backgroundColor: "rgba(0,0,0,0.9)", duration: 0.3 });
      } else {
        gsap.to(".header", { backgroundColor: "transparent", duration: 0.3 });
      }
    }
  });
});
```

## Refresh and Dynamic Content

```typescript
// After images load or dynamic content changes
useEffect(() => {
  const images = document.querySelectorAll("img");
  let loaded = 0;
  images.forEach(img => {
    if (img.complete) {
      loaded++;
    } else {
      img.addEventListener("load", () => {
        loaded++;
        if (loaded === images.length) {
          ScrollTrigger.refresh(); // Recalculate all positions
        }
      });
    }
  });
}, []);

// After route change in Next.js
useEffect(() => {
  ScrollTrigger.refresh();
}, [pathname]);
```

## Common Issues

1. **Trigger positions wrong** — Always call `ScrollTrigger.refresh()` after dynamic content loads
2. **Pin spacing off** — Use `pinSpacing: false` when stacking pinned sections, or `anticipatePin: 1`
3. **Flickering on pin** — Add `will-change: transform` to the pinned element's CSS
4. **Mobile scroll jank** — Reduce scrub value (use `0.3` instead of `1`) and simplify animations
5. **Stale closures in callbacks** — Use `gsap.utils.toArray` instead of `querySelectorAll` for GSAP context
