---
name: shader-craft
description: Write custom GLSL fragment and vertex shaders for noise-based effects, color gradients, image distortion, vertex displacement, and custom materials. Includes noise function library (simplex, Perlin, FBM, curl) and ShaderMaterial integration with Three.js and React Three Fiber. Use when creating animated backgrounds, image hover effects, organic textures, distortion transitions, or any visual effect requiring custom GPU shaders.
---

# GLSL Shader Craft

## Shader Pipeline Overview

```
Vertex Shader                    Fragment Shader
─────────────                    ───────────────
Input: vertex position           Input: interpolated varyings
       attributes (per-vertex)          uniforms (global)
       uniforms (global)

Process: transform positions     Process: calculate pixel color
         pass data via varyings          sample textures
                                         apply effects

Output: gl_Position              Output: gl_FragColor
        gl_PointSize (points)
        varyings → fragment
```

## Three.js ShaderMaterial Setup

```typescript
"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Your effect here
    vec3 color = vec3(uv.x, uv.y, sin(uTime) * 0.5 + 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function ShaderPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uMouse.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        }}
      />
    </mesh>
  );
}
```

## Essential Uniforms

```glsl
uniform float uTime;        // Elapsed time (seconds) — drives animation
uniform vec2 uMouse;         // Mouse position (0-1 normalized)
uniform vec2 uResolution;    // Viewport size in pixels
uniform float uScroll;       // Scroll progress (0-1)
uniform sampler2D uTexture;  // Image/video texture input
uniform float uHover;        // Hover progress (0-1, animated)
```

Update in `useFrame`:
```typescript
useFrame((state) => {
  mat.uniforms.uTime.value = state.clock.elapsedTime;
  mat.uniforms.uMouse.value.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);
});
```

## Noise Functions

Noise is the foundation of organic, natural-looking shader effects.

See [references/noise-patterns.md](references/noise-patterns.md) for complete implementations of all noise types.

### Quick Reference

| Noise Type | Visual Character | Use For |
|-----------|-----------------|---------|
| Simplex 2D | Smooth, flowing | Animated backgrounds, water |
| Simplex 3D | Smooth, volumetric | Fog, clouds, displacement |
| Perlin 2D | Classic, smooth | Terrain, natural textures |
| FBM (Fractal) | Layered detail | Clouds, smoke, realistic terrain |
| Voronoi/Cellular | Cell-like patterns | Crystal, cracked earth, organic |
| Curl | Divergence-free, flowing | Fluid motion, particle paths |

### Simplex 2D (Most Common)

```glsl
// Paste this at the top of your shader
// Full implementation in references/noise-patterns.md

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
```

### FBM (Fractal Brownian Motion)

Layer noise at different frequencies for rich detail:

```glsl
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}
```

## Common Effect Patterns

### Animated Gradient Background

```glsl
void main() {
  vec2 uv = vUv;
  float noise = snoise(uv * 3.0 + uTime * 0.2);

  vec3 color1 = vec3(0.1, 0.0, 0.2);  // Deep purple
  vec3 color2 = vec3(0.0, 0.1, 0.3);  // Deep blue
  vec3 color3 = vec3(0.2, 0.0, 0.1);  // Dark red

  float blend = uv.y + noise * 0.3;
  vec3 color = mix(color1, color2, smoothstep(0.0, 0.5, blend));
  color = mix(color, color3, smoothstep(0.5, 1.0, blend));

  gl_FragColor = vec4(color, 1.0);
}
```

### Vertex Displacement (Wavy Surface)

```glsl
// Vertex shader
varying vec2 vUv;
varying float vDisplacement;
uniform float uTime;

void main() {
  vUv = uv;

  vec3 pos = position;
  float displacement = snoise(pos.xy * 2.0 + uTime * 0.5) * 0.3;
  pos.z += displacement;
  vDisplacement = displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Mouse-Reactive Distortion

See [references/visual-effects.md](references/visual-effects.md) for image distortion, chromatic aberration, and ripple effects.

### Procedural Gradient

See [references/gradient-color.md](references/gradient-color.md) for animated gradients, color palettes, and blending.

## GLSL Quick Reference

### Math
```glsl
mix(a, b, t)          // Linear interpolation (lerp)
smoothstep(a, b, t)   // Smooth interpolation (S-curve)
step(edge, x)         // 0.0 if x < edge, 1.0 if x >= edge
clamp(x, min, max)    // Clamp to range
fract(x)              // Fractional part
mod(x, y)             // Modulo
abs(x)                // Absolute value
length(v)             // Vector length
normalize(v)          // Unit vector
dot(a, b)             // Dot product
cross(a, b)           // Cross product
```

### Coordinate Tricks
```glsl
// Center UVs (0,0 at center instead of corner)
vec2 uv = vUv - 0.5;

// Distance from center
float d = length(uv);

// Angle from center
float angle = atan(uv.y, uv.x);

// Aspect-correct UVs
vec2 uv = vUv;
uv.x *= uResolution.x / uResolution.y;

// Polar coordinates
vec2 polar = vec2(length(uv), atan(uv.y, uv.x));

// Repeat/tile UVs
vec2 tiled = fract(uv * 4.0);  // 4x4 tile
```

## Common Pitfalls

1. **Precision issues** — Always declare `precision highp float;` in fragment shaders. Medium precision causes artifacts on some devices.
2. **Branching** — Avoid `if/else` in shaders. Use `step`, `smoothstep`, `mix` instead. GPU pipelines penalize branching.
3. **Texture lookup count** — Each `texture2D` call is expensive. Minimize in fragment shaders.
4. **Uninitialized varyings** — Always set varyings in the vertex shader. Undefined behavior otherwise.
5. **Mobile compatibility** — Test on mobile GPU. Avoid complex loops, deep FBM iterations (cap at 4 on mobile).
6. **Color space** — Shader output is linear. Three.js handles conversion to sRGB via renderer settings.

## Integration with Other Skills

- **Particle systems** → Custom particle shaders use noise and effects from this skill
- **Three.js** → ShaderMaterial integrates with R3F scenes
- **Post-processing** → Custom post-processing effects use fragment shaders
- **Interactive UI** → Image hover distortion effects (see `interactive-ui` skill)
