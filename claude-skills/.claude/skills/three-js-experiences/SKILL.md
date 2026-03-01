---
name: three-js-experiences
description: Build production 3D web experiences with Three.js and React Three Fiber — scenes, lighting, materials, post-processing, interaction, and performance optimization. Use when building 3D hero sections, product viewers, interactive backgrounds, or any WebGL-rendered 3D content on websites.
---

# Three.js / React Three Fiber Experiences

## Setup

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install -D @types/three
```

## Canvas Setup (The Foundation)

Every 3D experience starts with a properly configured Canvas.

```typescript
"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

export function Scene3D() {
  return (
    <div className="h-screen w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}              // Clamp pixel ratio (1 min, 2 max)
        gl={{
          antialias: true,
          alpha: true,             // Transparent background
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

**Critical settings:**
- `dpr={[1, 2]}` — Cap pixel ratio at 2. 3x displays don't need 3x rendering.
- `fov: 45` — 45-50 is natural for web. 35 for cinematic. 75+ for immersive/VR.
- `alpha: true` — Transparent canvas so it layers over HTML content.
- Always wrap scene content in `<Suspense>` for asset loading.

## Lighting — What Makes or Breaks a Scene

### Three-Point Lighting (Product/Hero Scenes)

```typescript
function Lighting() {
  return (
    <>
      {/* Key light — main illumination, warm tone */}
      <spotLight
        position={[5, 5, 5]}
        intensity={2}
        angle={Math.PI / 6}
        penumbra={0.5}
        color="#fff5e6"
        castShadow
      />

      {/* Fill light — soften shadows, cool tone */}
      <pointLight
        position={[-3, 2, -2]}
        intensity={0.5}
        color="#8090ff"
      />

      {/* Rim light — edge definition, bright */}
      <spotLight
        position={[-2, 3, -5]}
        intensity={1.5}
        angle={Math.PI / 4}
        penumbra={0.8}
      />

      {/* Ambient — baseline illumination */}
      <ambientLight intensity={0.15} />
    </>
  );
}
```

### HDRI Environment (Realistic Reflections)

```typescript
import { Environment } from "@react-three/drei";

function Lighting() {
  return (
    <Environment
      preset="studio"        // or "city", "sunset", "dawn", "night", "warehouse"
      background={false}     // Don't show as background
      environmentIntensity={0.8}
    />
  );
}
```

**When to use HDRI vs manual lights:**
- HDRI: Realistic reflections, metallic/glass materials, product visualization
- Manual: Stylized scenes, dramatic shadows, specific mood control
- Both: HDRI for reflections + manual lights for key illumination

## Materials

### MeshPhysicalMaterial (Premium Look)

```typescript
<mesh>
  <sphereGeometry args={[1, 64, 64]} />
  <meshPhysicalMaterial
    color="#1a1a2e"
    metalness={0.9}
    roughness={0.1}
    clearcoat={1}              // Lacquer-like coating
    clearcoatRoughness={0.1}
    envMapIntensity={1.5}      // Boost environment reflections
  />
</mesh>
```

### Glass/Transparent Material

```typescript
<meshPhysicalMaterial
  color="#ffffff"
  transmission={0.95}          // Transparency
  thickness={0.5}              // Refraction depth
  roughness={0.05}
  ior={1.5}                    // Index of refraction (glass = 1.5)
  envMapIntensity={1}
/>
```

See [references/materials-textures.md](references/materials-textures.md) for custom materials and texture loading.

## Animation with useFrame

```typescript
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function FloatingObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Gentle float — use sin for smooth oscillation
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    meshRef.current.rotation.y += delta * 0.2;

    // Mouse-reactive rotation
    const { x, y } = state.pointer; // Normalized -1 to 1
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      y * 0.3,
      0.05  // Smooth interpolation factor
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      -x * 0.3,
      0.05
    );
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 4]} />
      <meshPhysicalMaterial color="#4a0080" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}
```

**Critical useFrame rules:**
- Never call `setState` inside `useFrame` — it triggers React re-renders (kills performance)
- Mutate refs directly: `meshRef.current.position.y = ...`
- Use `delta` for frame-rate-independent animation
- Use `THREE.MathUtils.lerp` for smooth transitions

## Post-Processing

```typescript
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";

function PostEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.8}    // Only bright things glow
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.6}
      />
      <Noise
        opacity={0.05}              // Subtle film grain
      />
    </EffectComposer>
  );
}
```

See [references/post-processing.md](references/post-processing.md) for depth of field, color grading, chromatic aberration.

## Scroll-Linked 3D

Connect Three.js animations to scroll position using GSAP or R3F's scroll controls.

```typescript
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

function ScrollLinkedScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!meshRef.current) return;
    const progress = scroll.offset; // 0 to 1

    // Rotate based on scroll
    meshRef.current.rotation.y = progress * Math.PI * 2;

    // Scale up as user scrolls
    const scale = 1 + progress * 0.5;
    meshRef.current.scale.setScalar(scale);
  });

  return <mesh ref={meshRef}>...</mesh>;
}

// Wrap in ScrollControls
import { ScrollControls } from "@react-three/drei";

<Canvas>
  <ScrollControls pages={5} damping={0.3}>
    <ScrollLinkedScene />
  </ScrollControls>
</Canvas>
```

## Cleanup and Memory Management

**Three.js leaks memory if you don't dispose properly.**

```typescript
useEffect(() => {
  return () => {
    // Dispose geometries
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    // Dispose textures
    texture.dispose();

    // Dispose render targets
    renderTarget.dispose();
  };
}, []);
```

R3F handles most disposal automatically when components unmount, but custom textures, render targets, and loaded models need manual cleanup.

## Common Pitfalls

1. **Z-fighting** — Adjust `near` and `far` camera planes. Default is often too wide. Use `near: 0.1, far: 100` for typical scenes.
2. **Color space** — Set `texture.colorSpace = THREE.SRGBColorSpace` for color textures (diffuse, emissive). Leave linear for data textures (normal, roughness).
3. **Mobile performance** — Cap `dpr` at 1 on mobile, reduce geometry complexity, skip post-processing.
4. **Canvas sizing** — Always set explicit `height` and `width` on the Canvas container div. `h-screen w-full` is the minimum.
5. **SSR errors** — Three.js requires `window`. Use dynamic import with `ssr: false` for the Canvas component in Next.js, or wrap in a client component.

```typescript
// Next.js dynamic import for SSR safety
import dynamic from "next/dynamic";
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });
```

## Integration with Other Skills

- **Particle systems** → Use within R3F Canvas (see `particle-systems` skill)
- **Custom shaders** → ShaderMaterial in R3F (see `shader-craft` skill)
- **Scroll** → Connect to GSAP ScrollTrigger or R3F ScrollControls (see `scroll-experiences`)
- **Interaction** → Raycasting and mouse tracking (see `interactive-ui` skill)
