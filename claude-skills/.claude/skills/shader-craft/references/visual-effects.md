# Shader Visual Effects

## Image Hover Distortion

Distort an image on hover using a shader. The classic agency portfolio effect.

```typescript
"use client";
import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Distortion centered on mouse position
    float dist = distance(uv, uMouse);
    float distortion = smoothstep(0.3, 0.0, dist) * uHover;

    // Ripple effect
    float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.02 * distortion;

    uv += vec2(ripple);

    // Chromatic aberration on distorted area
    float aberration = distortion * 0.01;
    float r = texture2D(uTexture, uv + vec2(aberration, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(aberration, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

function DistortionPlane({ imageUrl }: { imageUrl: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const hoverTarget = useRef(0);

  useEffect(() => {
    new THREE.TextureLoader().load(imageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [imageUrl]);

  useFrame((state) => {
    if (!materialRef.current) return;

    // Smooth hover transition
    const hover = materialRef.current.uniforms.uHover.value;
    materialRef.current.uniforms.uHover.value += (hoverTarget.current - hover) * 0.1;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uMouse.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    );
  });

  if (!texture) return null;

  return (
    <mesh
      onPointerEnter={() => { hoverTarget.current = 1; }}
      onPointerLeave={() => { hoverTarget.current = 0; }}
    >
      <planeGeometry args={[1.6, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: texture },
          uHover: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uTime: { value: 0 },
        }}
      />
    </mesh>
  );
}
```

## Chromatic Aberration

RGB channel splitting for lens/glitch effect.

```glsl
uniform sampler2D uTexture;
uniform float uIntensity; // 0.0 - 0.05

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 center = vec2(0.5);

  // Direction from center for radial aberration
  vec2 dir = uv - center;
  float dist = length(dir);

  // Stronger at edges
  float strength = uIntensity * dist;

  float r = texture2D(uTexture, uv + dir * strength).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - dir * strength).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
```

## Ripple Effect

Concentric ripples emanating from a point (click, touch).

```glsl
uniform float uTime;
uniform vec2 uRippleCenter;
uniform float uRippleTime; // Time since ripple started

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  float dist = distance(uv, uRippleCenter);
  float elapsed = uTime - uRippleTime;

  // Expanding ring
  float rippleRadius = elapsed * 0.5;
  float rippleWidth = 0.1;
  float ripple = smoothstep(rippleRadius - rippleWidth, rippleRadius, dist)
               - smoothstep(rippleRadius, rippleRadius + rippleWidth, dist);

  // Decay over time
  ripple *= max(0.0, 1.0 - elapsed * 0.5);

  // Distort UVs
  vec2 displacement = normalize(uv - uRippleCenter) * ripple * 0.02;
  uv += displacement;

  vec4 color = texture2D(uTexture, uv);
  gl_FragColor = color;
}
```

## Glitch Effect

Digital glitch with horizontal offset and color corruption.

```glsl
uniform float uTime;
uniform float uIntensity; // 0.0 - 1.0

varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;

  // Random horizontal offset for certain rows
  float glitchLine = step(0.98, random(vec2(floor(uv.y * 50.0), floor(uTime * 10.0))));
  float offset = (random(vec2(uTime, floor(uv.y * 20.0))) - 0.5) * 0.1 * uIntensity * glitchLine;

  uv.x += offset;

  // Color channel separation
  float r = texture2D(uTexture, uv + vec2(0.01 * uIntensity * glitchLine, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(0.01 * uIntensity * glitchLine, 0.0)).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
```

## Dissolve/Reveal Transition

Noise-based reveal that dissolves one image into another or into transparency.

```glsl
uniform sampler2D uTexture;
uniform float uProgress; // 0.0 (hidden) to 1.0 (fully visible)
uniform float uTime;

varying vec2 vUv;

// Include snoise from noise-patterns.md

void main() {
  vec2 uv = vUv;

  // Noise-based threshold
  float noise = snoise(uv * 4.0 + uTime * 0.1) * 0.5 + 0.5;

  // Edge glow
  float edge = smoothstep(uProgress - 0.05, uProgress, noise)
             - smoothstep(uProgress, uProgress + 0.05, noise);

  // Main reveal
  float reveal = smoothstep(uProgress - 0.02, uProgress + 0.02, noise);

  vec4 texColor = texture2D(uTexture, uv);
  vec3 edgeColor = vec3(1.0, 0.5, 0.0); // Orange edge glow

  vec3 finalColor = mix(texColor.rgb, edgeColor, edge * 2.0);
  float alpha = reveal;

  gl_FragColor = vec4(finalColor, alpha);
}
```

## Gradient Mesh (Animated Background)

Dynamic gradient that shifts and flows.

```glsl
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Define gradient colors
  vec3 c1 = vec3(0.05, 0.0, 0.15);  // Deep purple
  vec3 c2 = vec3(0.0, 0.05, 0.2);   // Deep blue
  vec3 c3 = vec3(0.15, 0.0, 0.05);  // Dark red
  vec3 c4 = vec3(0.0, 0.1, 0.1);    // Teal

  // Animated blend positions
  float n1 = snoise(uv * 2.0 + uTime * 0.1) * 0.5 + 0.5;
  float n2 = snoise(uv * 1.5 + vec2(uTime * 0.08, 0.0)) * 0.5 + 0.5;

  // Multi-stop gradient
  vec3 gradient = mix(c1, c2, smoothstep(0.0, 0.4, uv.y + n1 * 0.2));
  gradient = mix(gradient, c3, smoothstep(0.3, 0.7, uv.x + n2 * 0.3));
  gradient = mix(gradient, c4, smoothstep(0.6, 1.0, uv.y + n1 * 0.15));

  // Subtle noise texture
  float grain = (random(uv + uTime) - 0.5) * 0.02;

  gl_FragColor = vec4(gradient + grain, 1.0);
}
```

## Performance Tips

- **Fragment shader cost scales with pixel count.** On a 4K display, a full-screen shader runs 8M+ times per frame.
- **Reduce resolution** for heavy effects: render to a smaller FBO and upscale.
- **Minimize texture lookups** — each `texture2D` is a cache miss.
- **Use `step`/`smoothstep` instead of `if/else`** — GPU pipelines penalize branching.
- **Pre-compute on CPU** — pass constants as uniforms, don't recompute in the shader.
