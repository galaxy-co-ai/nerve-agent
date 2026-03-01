---
name: performance-optimization
description: Optimize web experiences for sustained 60fps with GPU profiling, draw call reduction, progressive enhancement, capability-based device tiers, bundle optimization, and performance monitoring. Use when debugging frame drops, reducing bundle size, implementing device-tier fallbacks, profiling GPU performance, or optimizing any visually complex website.
---

# Performance Optimization

## Performance Budget

These are non-negotiable targets for studio-quality sites:

| Metric | Target | Tool |
|--------|--------|------|
| Frame rate | **60fps sustained** (16.67ms/frame) | Chrome DevTools Performance |
| First Contentful Paint | **< 1.5s** | Lighthouse |
| Largest Contentful Paint | **< 2.5s** | Lighthouse |
| Total Blocking Time | **< 200ms** | Lighthouse |
| Cumulative Layout Shift | **< 0.1** | Lighthouse |
| JS Bundle (initial) | **< 150KB gzipped** | Webpack Bundle Analyzer |
| Three.js + scene | **< 500KB gzipped** total | Webpack Bundle Analyzer |
| GPU memory | **< 256MB** for 3D scenes | Chrome Task Manager |
| Draw calls | **< 100** per frame | Three.js renderer.info |
| Texture memory | **< 128MB** | Spector.js |

## The 60fps Rule

60fps = 16.67ms per frame. Your entire frame budget includes:
- JavaScript execution
- Style recalculation
- Layout
- Paint
- Composite

**Target < 12ms** to leave headroom for garbage collection and compositor.

### What Breaks 60fps (Most Common)

1. **Layout thrashing** — Reading then writing DOM properties in a loop
2. **Animating layout properties** — `width`, `height`, `top`, `left`, `margin`
3. **Too many draw calls** — Each Three.js mesh = 1 draw call
4. **Unoptimized shaders** — Complex fragment shaders on full-screen quads
5. **GC pauses** — Creating objects in animation loops
6. **Forced reflow** — Reading `offsetWidth` after modifying styles

### What's Free (Compositor-Only Properties)

These animate on the GPU compositor thread, not the main thread:
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness, etc.)

**Always animate these. Never animate anything else.**

## Progressive Enhancement

### Device Tier Detection

```typescript
export function getDeviceTier(): "low" | "mid" | "high" {
  // Check WebGL support
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) return "low";

  // Check GPU
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()
    : "";

  // Known low-end GPUs
  const isLowEndGPU = /mali-[gt]|adreno\s?(3|4|5[0-2])|intel\s?hd/i.test(renderer);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 2;

  if (isLowEndGPU || (isMobile && memory <= 2)) return "low";
  if (isMobile || cores <= 4 || memory <= 4) return "mid";
  return "high";
}
```

### Tier-Based Configuration

```typescript
const tier = getDeviceTier();

const config = {
  low: {
    particleCount: 2000,
    dpr: 1,
    postProcessing: false,
    shadows: false,
    parallax: false,
    smoothScroll: false,
  },
  mid: {
    particleCount: 15000,
    dpr: 1.5,
    postProcessing: false,
    shadows: true,
    parallax: true,
    smoothScroll: true,
  },
  high: {
    particleCount: 80000,
    dpr: 2,
    postProcessing: true,
    shadows: true,
    parallax: true,
    smoothScroll: true,
  },
}[tier];
```

### React Context for Device Tier

```typescript
"use client";
import { createContext, useContext, useState, useEffect } from "react";

type Tier = "low" | "mid" | "high";

const TierContext = createContext<Tier>("mid");

export function TierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>("mid");

  useEffect(() => {
    setTier(getDeviceTier());
  }, []);

  return <TierContext.Provider value={tier}>{children}</TierContext.Provider>;
}

export const useDeviceTier = () => useContext(TierContext);

// Usage in components:
function ParticleBackground() {
  const tier = useDeviceTier();

  if (tier === "low") return <StaticBackground />;  // CSS gradient fallback

  return <ParticleCanvas count={tier === "high" ? 50000 : 15000} />;
}
```

## Three.js Optimization

### Reduce Draw Calls

```typescript
// BAD: 100 separate meshes = 100 draw calls
for (let i = 0; i < 100; i++) {
  scene.add(new THREE.Mesh(geometry, material));
}

// GOOD: InstancedMesh = 1 draw call
const mesh = new THREE.InstancedMesh(geometry, material, 100);
for (let i = 0; i < 100; i++) {
  const matrix = new THREE.Matrix4();
  matrix.setPosition(positions[i]);
  mesh.setMatrixAt(i, matrix);
}
scene.add(mesh);
```

### Texture Optimization

```typescript
// Use KTX2 compressed textures (10x smaller, GPU-native)
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath("/basis/");
ktx2Loader.load("/textures/diffuse.ktx2", (texture) => {
  material.map = texture;
});

// Mipmap settings
texture.generateMipmaps = true;
texture.minFilter = THREE.LinearMipmapLinearFilter;

// Limit texture size on lower-end devices
const maxTextureSize = tier === "low" ? 1024 : tier === "mid" ? 2048 : 4096;
```

### Geometry Optimization

```typescript
// LOD (Level of Detail) — swap geometry based on distance
const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);     // Close: full detail
lod.addLevel(medDetailMesh, 10);     // Medium distance: simplified
lod.addLevel(lowDetailMesh, 30);     // Far: very simple
scene.add(lod);

// Dispose unused geometries
function cleanup(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
```

### Monitor with renderer.info

```typescript
useFrame(() => {
  const info = gl.info;
  console.log({
    drawCalls: info.render.calls,
    triangles: info.render.triangles,
    textures: info.memory.textures,
    geometries: info.memory.geometries,
  });
});
```

## Bundle Optimization

### Dynamic Import for Heavy Libraries

```typescript
// Three.js scene loaded only when needed
const Scene3D = dynamic(() => import("@/components/Scene3D"), {
  ssr: false,
  loading: () => <div className="h-screen bg-black" />,
});

// GSAP loaded only when animations are needed
async function initAnimations() {
  const { gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  // ... setup animations
}
```

### Tree-Shake Three.js

```typescript
// BAD: imports entire Three.js
import * as THREE from "three";

// GOOD: import only what you need (in non-shader code)
import { Scene, PerspectiveCamera, WebGLRenderer, Mesh } from "three";

// Note: in R3F components, `import * as THREE` is often needed for types.
// The tree-shaking happens at the R3F level.
```

### Intersection Observer for Lazy Loading

```typescript
function useLazyLoad(ref: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }  // Start loading 200px before visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

// Usage
function HeavySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useLazyLoad(ref);

  return (
    <div ref={ref}>
      {isVisible ? <ParticleScene /> : <div className="h-screen bg-black" />}
    </div>
  );
}
```

## Profiling Checklist

1. **Chrome DevTools → Performance tab** — Record page scroll, look for frames > 16ms
2. **Chrome DevTools → Rendering** → Check "Frame Rendering Stats" for live FPS overlay
3. **stats.js** — Drop-in FPS/MS/MB overlay for development
4. **Three.js renderer.info** — Draw calls, triangles, texture count
5. **Spector.js** — Inspect every WebGL draw call, shader, and texture
6. **Lighthouse** — Core Web Vitals, accessibility, best practices
7. **Chrome Task Manager** — GPU memory usage per tab

### Quick stats.js Setup

```typescript
import Stats from "stats.js";

useEffect(() => {
  if (process.env.NODE_ENV !== "development") return;

  const stats = new Stats();
  stats.showPanel(0); // 0: FPS, 1: MS, 2: MB
  document.body.appendChild(stats.dom);

  function animate() {
    stats.begin();
    // ... your render loop
    stats.end();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  return () => document.body.removeChild(stats.dom);
}, []);
```

## Common Performance Mistakes

1. **Creating objects in animation loops** — Pre-allocate vectors, matrices, colors outside the loop. Reuse them.
2. **Calling `getBoundingClientRect` in scroll handlers** — Cache the result. This triggers layout.
3. **Not disposing Three.js resources** — Geometries, materials, textures, render targets all leak GPU memory.
4. **Full-screen fragment shaders** — A 4K display runs the fragment shader 8M+ times per frame. Simplify or render at lower resolution.
5. **`will-change` on everything** — This creates compositor layers. Each costs GPU memory. Only use on actively animating elements, remove after.
6. **Large images** — Serve WebP/AVIF, use responsive `srcset`, lazy load below fold.
7. **Synchronous font loading** — Causes layout shift. Preload critical fonts with `<link rel="preload">`.
