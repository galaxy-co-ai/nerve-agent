# GSAP Timeline Patterns

## Nested Timelines

Break complex sequences into composable functions that return timelines.

```typescript
function heroEntrance() {
  const tl = gsap.timeline();
  tl.from(".hero-bg", { scale: 1.2, duration: 1.5, ease: "power2.out" })
    .from(".hero-title", { y: 80, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8")
    .from(".hero-subtitle", { y: 40, opacity: 0, duration: 0.6 }, "-=0.4");
  return tl;
}

function navEntrance() {
  const tl = gsap.timeline();
  tl.from(".nav-logo", { x: -20, opacity: 0, duration: 0.5 })
    .from(".nav-link", { y: -10, opacity: 0, stagger: 0.08 }, "-=0.3");
  return tl;
}

function ctaEntrance() {
  const tl = gsap.timeline();
  tl.from(".cta-button", { scale: 0.8, opacity: 0, ease: "back.out(1.7)" })
    .from(".cta-subtext", { opacity: 0 }, "-=0.2");
  return tl;
}

// Master timeline composes the sub-timelines
useGSAP(() => {
  const master = gsap.timeline({ defaults: { ease: "power3.out" } });
  master
    .add(heroEntrance())
    .add(navEntrance(), "-=0.6")    // Overlap with hero
    .add(ctaEntrance(), "-=0.3");
});
```

## Labels for Modular Timelines

```typescript
const tl = gsap.timeline();

tl.addLabel("start")
  .from(".bg", { opacity: 0, duration: 1 })
  .addLabel("contentIn")
  .from(".title", { y: 60, opacity: 0 })
  .from(".body", { y: 40, opacity: 0 }, "-=0.3")
  .addLabel("ctaIn")
  .from(".cta", { scale: 0.9, opacity: 0 });

// Jump to a label
tl.play("contentIn");

// Add animations at a label
tl.from(".decoration", { rotation: -10, opacity: 0 }, "contentIn");
```

## Playback Control

```typescript
const tl = gsap.timeline({ paused: true });

tl.to(".modal-overlay", { opacity: 1, duration: 0.3 })
  .from(".modal-content", { y: 40, scale: 0.95, duration: 0.4, ease: "power3.out" });

// Open modal
function openModal() { tl.play(); }

// Close modal (plays in reverse)
function closeModal() { tl.reverse(); }

// Restart
function restartAnimation() { tl.restart(); }

// Seek to specific time
tl.seek(0.5);

// Progress (0-1)
tl.progress(0.5); // Jump to halfway
```

## Timeline with ScrollTrigger

```typescript
useGSAP(() => {
  // Create timeline first, then attach ScrollTrigger
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".story-section",
      start: "top top",
      end: "+=4000",
      scrub: 1,
      pin: true,
    }
  });

  tl.to(".scene-1", { opacity: 0, duration: 1 })
    .from(".scene-2", { opacity: 0, scale: 0.8, duration: 1 })
    .to(".scene-2-text", { y: -100, duration: 2 })
    .to(".scene-2", { opacity: 0, duration: 1 })
    .from(".scene-3", { opacity: 0, y: 100, duration: 1 });
});
```

## Responsive Timelines

```typescript
useGSAP(() => {
  // Different animations at different breakpoints
  ScrollTrigger.matchMedia({
    // Desktop
    "(min-width: 768px)": function() {
      gsap.from(".card", {
        x: -100,
        opacity: 0,
        stagger: 0.15,
        scrollTrigger: { trigger: ".cards", start: "top 80%" }
      });
    },
    // Mobile
    "(max-width: 767px)": function() {
      gsap.from(".card", {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: { trigger: ".cards", start: "top 90%" }
      });
    }
  });
});
```

## Callbacks and Events

```typescript
const tl = gsap.timeline({
  onStart: () => console.log("Timeline started"),
  onComplete: () => console.log("Timeline complete"),
  onUpdate: () => {
    // Fires every frame — use for syncing external state
    const progress = tl.progress();
  },
  onReverseComplete: () => console.log("Reverse complete"),
});

// Per-tween callbacks
tl.to(".element", {
  x: 100,
  onStart: () => element.classList.add("animating"),
  onComplete: () => element.classList.remove("animating"),
});
```

## Repeating and Yoyo

```typescript
// Infinite loop with yoyo
gsap.to(".pulse", {
  scale: 1.1,
  duration: 1,
  ease: "power1.inOut",
  repeat: -1,        // Infinite
  yoyo: true,        // Reverse on each repeat
});

// Repeat with delay between
gsap.to(".notification", {
  y: -5,
  duration: 0.3,
  ease: "power2.out",
  repeat: 2,
  yoyo: true,
  repeatDelay: 0.1,
});
```

## Timeline Defaults

```typescript
// Set defaults to reduce repetition
const tl = gsap.timeline({
  defaults: {
    ease: "power3.out",
    duration: 0.8,
    opacity: 0,  // All "from" tweens will animate from opacity: 0
  }
});

// These inherit the defaults
tl.from(".title", { y: 80 })           // Also has opacity: 0, ease, duration
  .from(".subtitle", { y: 40 }, "-=0.4")
  .from(".cta", { scale: 0.9 }, "-=0.2");
```
