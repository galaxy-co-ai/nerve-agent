# Production Quality Checklist

Use this checklist before shipping any studio-quality web experience.

## Performance

- [ ] **60fps sustained** — Open Chrome DevTools Performance tab, scroll through the entire page, verify no frames exceed 16ms
- [ ] **No layout thrashing** — No width/height/top/left animations; only transform and opacity on animated elements
- [ ] **will-change used sparingly** — Applied only to elements about to animate, removed after animation completes
- [ ] **Images optimized** — WebP/AVIF format, responsive srcset, lazy loading below fold
- [ ] **3D assets compressed** — Textures in KTX2/Basis format, models in glTF/GLB with Draco compression
- [ ] **Bundle split** — Three.js and heavy animation code in separate chunks, loaded on demand
- [ ] **DPR capped** — Canvas pixel ratio capped at 2 (even on 3x displays)
- [ ] **No memory leaks** — 3D scenes dispose geometries, materials, textures on unmount; GSAP timelines killed

## Visual Quality

- [ ] **Easing is intentional** — Every animation uses a purposeful easing curve, never default `ease` or `linear`
- [ ] **Stagger feels organic** — Grid/list reveals use stagger with `from: "center"` or `from: "random"`, not just sequential
- [ ] **Colors are consistent** — Shader colors, particle colors, and UI colors all use the same palette
- [ ] **Lighting is professional** — 3D scenes use HDRI or three-point lighting, not a single directional light
- [ ] **Depth is layered** — Background, midground, foreground move at different speeds on scroll
- [ ] **Text is readable** — Animated text reaches a fully readable end state, body text is never animated per-character
- [ ] **Transitions are smooth** — No hard cuts between sections; every visual change has a transition

## Accessibility

- [ ] **prefers-reduced-motion** — All animations have a reduced/static alternative
- [ ] **Keyboard navigable** — All interactive elements work with keyboard
- [ ] **Screen reader content** — Canvas/WebGL content has text alternatives in the DOM
- [ ] **Color contrast** — Text over animated backgrounds maintains WCAG AA contrast
- [ ] **No seizure triggers** — No rapid flashing (>3 flashes per second)

## Responsive

- [ ] **Mobile tested** — All effects work or gracefully degrade on mobile Safari and Chrome
- [ ] **Touch handled** — Custom cursor hides on touch, hover effects have touch alternatives
- [ ] **Canvas resizes** — 3D canvas handles window resize without distortion or performance loss
- [ ] **Scroll direction** — Horizontal scroll sections have clear affordance on mobile
- [ ] **Viewport height** — Uses `dvh` not `vh` to handle mobile browser chrome

## Loading

- [ ] **Preloader present** — Heavy pages show a loading sequence while assets load
- [ ] **Progressive reveal** — Content appears in a choreographed sequence, not all at once
- [ ] **No FOUC** — No flash of unstyled content during page load or route transition
- [ ] **Fonts preloaded** — Web fonts loaded before text renders (no layout shift from font swap)
- [ ] **Assets preloaded** — Textures and models start loading before they scroll into view

## Code Quality

- [ ] **Cleanup on unmount** — Every useEffect with animation has a cleanup function
- [ ] **Context boundaries** — `'use client'` only on components that need it
- [ ] **Type safety** — No `any` types on animation configs or Three.js objects
- [ ] **Error boundaries** — WebGL context loss handled gracefully with fallback content
- [ ] **No console errors** — Zero warnings or errors in production build
