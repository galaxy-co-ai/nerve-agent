---
name: particle-systems
description: Create GPU-accelerated particle systems — cosmic effects (black holes, nebulae, stardust), fluid dynamics, text morphing, flow fields, and atmospheric particles. Handles 100k+ particles at 60fps using Three.js InstancedMesh and GPGPU techniques. Use when building particle backgrounds, cosmic effects, atmospheric elements, or any system requiring thousands of animated points.
---

# GPU Particle Systems

## Architecture Decision Tree

Choose your approach based on particle count:

| Count | Technique | GPU Load | Complexity |
|-------|-----------|----------|------------|
| < 100 | DOM elements + CSS/Framer Motion | Minimal | Low |
| 100 - 1,000 | THREE.Points + BufferGeometry | Low | Low |
| 1k - 50k | InstancedMesh + vertex shader | Medium | Medium |
| 50k - 100k | InstancedMesh + full shader animation | High | High |
| 100k - 1M+ | GPGPU (FBO ping-pong) | Very High | Very High |

**Rule:** If you need more than 1,000 particles, use Three.js. If more than 50,000, move all physics to the GPU via shaders.

## Basic: THREE.Points (up to 1,000)

```typescript
"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SimpleParticles({ count = 500 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
```

## Intermediate: InstancedMesh with Shader Animation (1k-100k)

This is the sweet spot for most web experiences. GPU handles all particle movement.

```typescript
"use client";
import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 30000;

// Vertex shader: GPU-driven particle animation
const vertexShader = `
  attribute vec3 aVelocity;
  attribute float aSize;
  attribute float aLife;
  attribute float aOffset;

  uniform float uTime;
  uniform float uDpr;

  varying float vLife;
  varying float vAlpha;

  void main() {
    vLife = aLife;

    // Animate position on GPU
    vec3 pos = position;
    float t = uTime + aOffset;

    // Circular orbit
    float angle = t * aVelocity.x;
    float radius = aLife * 3.0;
    pos.x += cos(angle) * radius;
    pos.z += sin(angle) * radius;

    // Vertical oscillation
    pos.y += sin(t * aVelocity.y) * aLife * 0.5;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Size attenuation
    gl_PointSize = aSize * uDpr * (200.0 / -mvPos.z);

    // Fade with distance
    vAlpha = smoothstep(50.0, 5.0, -mvPos.z) * aLife;
  }
`;

const fragmentShader = `
  varying float vLife;
  varying float vAlpha;

  void main() {
    // Soft circle
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.1, d) * vAlpha;

    if (alpha < 0.01) discard;

    // Warm color based on life
    vec3 color = mix(vec3(1.0, 0.4, 0.1), vec3(1.0, 0.9, 0.7), vLife);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function GpuParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, velocities, sizes, lives, offsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const lives = new Float32Array(PARTICLE_COUNT);
    const offsets = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random positions in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5) * 5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      velocities[i * 3] = (Math.random() - 0.5) * 2;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;

      sizes[i] = Math.random() * 3 + 1;
      lives[i] = Math.random();
      offsets[i] = Math.random() * 100;
    }

    return { positions, velocities, sizes, lives, offsets };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aVelocity" count={PARTICLE_COUNT} array={velocities} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aLife" count={PARTICLE_COUNT} array={lives} itemSize={1} />
        <bufferAttribute attach="attributes-aOffset" count={PARTICLE_COUNT} array={offsets} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uDpr: { value: Math.min(window.devicePixelRatio, 2) },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
```

## Advanced: GPGPU Particle Simulation (100k+)

For complex physics with hundreds of thousands of particles, simulation runs entirely on the GPU using Frame Buffer Objects (FBOs).

See [references/gpu-particles.md](references/gpu-particles.md) for the complete GPGPU setup.

## Effect Recipes

### Black Hole Spiral
See [references/cosmic-effects.md](references/cosmic-effects.md)

The key physics: particles spiral inward with increasing angular velocity as they approach the center, stretching along their velocity vector. Color shifts from cool (far) to hot (near center).

```glsl
// Core spiral physics (vertex shader)
float dist = length(pos.xz);
float angle = atan(pos.z, pos.x);

// Angular velocity increases as distance decreases (Kepler's law)
float angularVel = 1.0 / (dist * dist + 0.1);
angle += uTime * angularVel * aVelocity.x;

// Spiral inward
float newRadius = max(dist - uTime * 0.01 * aVelocity.y, 0.05);

pos.x = cos(angle) * newRadius;
pos.z = sin(angle) * newRadius;

// Vertical compression near center
pos.y *= smoothstep(0.0, 2.0, dist);
```

### Stardust Background
See [references/cosmic-effects.md](references/cosmic-effects.md)

Gently twinkling stars with subtle drift. Perfect for dark backgrounds.

### Flow Field Particles
See [references/physics-motion.md](references/physics-motion.md)

Particles follow a noise-based velocity field, creating organic flowing motion.

### Text Morphing Particles
See [references/physics-motion.md](references/physics-motion.md)

Particles form text shapes and transition between formations.

## Performance Guidelines

| Particle Count | Target FPS | DPR Cap | Technique |
|---------------|------------|---------|-----------|
| < 10k | 60fps | 2 | Points + shader |
| 10k - 50k | 60fps | 2 | Instanced + shader |
| 50k - 100k | 60fps | 1.5 | Instanced + shader |
| 100k+ | 60fps | 1 | GPGPU |

**Mobile targets:**
- Reduce particle count to 20-30% of desktop
- Cap DPR at 1
- Simplify shader (fewer texture lookups, simpler math)
- Consider static image fallback on very low-end devices

```typescript
// Device-aware particle count
function getParticleCount(base: number): number {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const memory = (navigator as any).deviceMemory || 4;

  if (isMobile) return Math.floor(base * 0.2);
  if (memory <= 2) return Math.floor(base * 0.3);
  if (memory <= 4) return Math.floor(base * 0.6);
  return base;
}
```

## Common Pitfalls

1. **Additive blending washout** — `AdditiveBlending` makes overlapping particles very bright. Reduce individual particle alpha to compensate.
2. **Point size on mobile** — `gl_PointSize` is clamped to `gl_PointSizeRange`. On some mobile GPUs, max is 64px. Use instanced quads for large particles.
3. **Depth sorting** — Transparent particles need `depthWrite: false`. If order matters, sort by distance to camera each frame (expensive — avoid if possible).
4. **Memory leaks** — Dispose BufferGeometry and ShaderMaterial on unmount.
5. **CPU bottleneck** — Never loop over particles in JavaScript each frame. All per-particle computation must be in shaders.

## Integration with Other Skills

- **Custom shaders** → Use `shader-craft` skill for noise functions and visual effects in particle shaders
- **Scroll** → Tie particle density or behavior to scroll position using uniforms
- **Three.js** → Particles live within R3F Canvas (see `three-js-experiences` for scene setup)
- **Performance** → See `performance-optimization` for GPU profiling
