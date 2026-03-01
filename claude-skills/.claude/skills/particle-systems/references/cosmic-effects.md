# Cosmic Particle Effects

## Black Hole Spiral

The signature effect: particles spiral into a central singularity with increasing velocity, color-shifting from cool to hot, with accretion disk dynamics.

```typescript
"use client";
import { useRef, useMemo } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 50000;

const vertexShader = `
  attribute float aSize;
  attribute float aLife;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aOrbitRadius;

  uniform float uTime;
  uniform float uDpr;

  varying float vLife;
  varying float vTemp;

  void main() {
    float t = uTime * 0.3 + aOffset;

    // Current radius — spirals inward over time
    float radius = aOrbitRadius * (1.0 - fract(t * aSpeed * 0.05));
    radius = max(radius, 0.02); // Don't collapse to zero

    // Angular velocity increases as radius decreases (Kepler's 3rd law)
    float angularVel = 1.0 / (radius * radius + 0.01);
    float angle = t * angularVel * aSpeed + aOffset * 6.28;

    // Position in accretion disk plane
    vec3 pos = vec3(
      cos(angle) * radius,
      sin(t * 2.0 + aOffset) * radius * 0.05, // Thin disk with slight wobble
      sin(angle) * radius
    );

    // Temperature increases near center (for color)
    vTemp = smoothstep(2.0, 0.1, radius);
    vLife = aLife;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Size: larger near center (hotter = brighter)
    float sizeFactor = mix(0.5, 2.0, vTemp);
    gl_PointSize = aSize * sizeFactor * uDpr * (150.0 / -mvPos.z);
  }
`;

const fragmentShader = `
  varying float vLife;
  varying float vTemp;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, d);

    if (alpha < 0.01) discard;

    // Color: cool blue (far) → orange → white-hot (near center)
    vec3 coolColor = vec3(0.2, 0.4, 1.0);    // Blue
    vec3 warmColor = vec3(1.0, 0.5, 0.1);    // Orange
    vec3 hotColor = vec3(1.0, 0.95, 0.9);    // White-hot

    vec3 color = mix(coolColor, warmColor, smoothstep(0.0, 0.6, vTemp));
    color = mix(color, hotColor, smoothstep(0.6, 1.0, vTemp));

    alpha *= vLife * mix(0.3, 1.0, vTemp);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function BlackHoleSpiral() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const buffers = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const lives = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT);
    const orbits = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Start positions don't matter much — shader overrides
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      sizes[i] = Math.random() * 2 + 0.5;
      lives[i] = Math.random() * 0.7 + 0.3;
      speeds[i] = Math.random() * 0.8 + 0.2;
      offsets[i] = Math.random() * 100;
      orbits[i] = Math.random() * 4 + 0.5; // Initial orbit radius
    }

    return { positions, sizes, lives, speeds, offsets, orbits };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={buffers.positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={COUNT} array={buffers.sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aLife" count={COUNT} array={buffers.lives} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={COUNT} array={buffers.speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aOffset" count={COUNT} array={buffers.offsets} itemSize={1} />
        <bufferAttribute attach="attributes-aOrbitRadius" count={COUNT} array={buffers.orbits} itemSize={1} />
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

// Usage in a scene
export function BlackHoleScene() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas
        camera={{ position: [0, 3, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false }}
      >
        <color attach="background" args={["#000000"]} />
        <BlackHoleSpiral />
      </Canvas>
    </div>
  );
}
```

### Enhancements for the black hole:
- Add a central bright point (small sphere with emissive material + bloom)
- Add gravitational lensing effect via post-processing distortion shader
- Add jet streams along the poles (vertical particle emission)
- Connect to scroll to control accretion rate

## Stardust / Star Field Background

Gentle twinkling stars. Perfect as a background layer.

```typescript
const COUNT = 10000;

const vertexShader = `
  attribute float aSize;
  attribute float aPhase;

  uniform float uTime;
  uniform float uDpr;

  varying float vAlpha;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Twinkle: smooth oscillation per star
    float twinkle = sin(uTime * 1.5 + aPhase) * 0.4 + 0.6;
    vAlpha = twinkle;

    gl_PointSize = aSize * uDpr * twinkle * (300.0 / -mvPos.z);
  }
`;

const fragmentShader = `
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);

    // Sharp star with soft glow halo
    float core = smoothstep(0.15, 0.0, d);
    float glow = smoothstep(0.5, 0.0, d) * 0.3;
    float alpha = (core + glow) * vAlpha;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(1.0, 0.98, 0.95, alpha);
  }
`;

export function Starfield() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const buffers = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Distribute on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 20 + Math.random() * 30;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = Math.random() * 2 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, sizes, phases };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={buffers.positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={COUNT} array={buffers.sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" count={COUNT} array={buffers.phases} itemSize={1} />
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
      />
    </points>
  );
}
```

## Nebula Cloud

Volumetric-looking cloud of gas using large, soft, overlapping particles.

```typescript
// Key differences from star particles:
// - Fewer particles (5000-10000) but much larger
// - Low opacity with additive blending for volumetric look
// - Multiple color layers for depth
// - Very soft edges (large smoothstep radius)

const fragmentShader = `
  varying float vLife;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);

    // Very soft, cloud-like falloff
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= alpha; // Extra softness
    alpha *= 0.08;  // Very low opacity — many particles overlap

    if (alpha < 0.001) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Colors: use 2-3 nebula tones
// Purple nebula: vec3(0.4, 0.1, 0.6), vec3(0.1, 0.2, 0.5), vec3(0.7, 0.1, 0.3)
// Blue nebula: vec3(0.1, 0.3, 0.7), vec3(0.0, 0.5, 0.8), vec3(0.2, 0.1, 0.5)
// Fire nebula: vec3(0.8, 0.2, 0.0), vec3(1.0, 0.6, 0.1), vec3(0.5, 0.0, 0.1)
```

## Warp Speed / Hyperspace

Particles streak toward the camera creating a tunnel effect.

```glsl
// Vertex shader for warp effect
void main() {
  vec3 pos = position;

  // Move particles toward camera
  float t = fract(uTime * 0.2 + aOffset);
  pos.z = mix(20.0, -5.0, t);  // Far to near

  // Stretch along Z as they get closer (motion blur effect)
  float stretch = smoothstep(0.0, 1.0, 1.0 - t) * 2.0;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  // Size increases dramatically as particles approach
  gl_PointSize = aSize * uDpr * (1.0 + stretch * 3.0) * (50.0 / -mvPos.z);

  vAlpha = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.8, t);
}
```

## Scroll Integration

Connect cosmic effects to scroll for narrative control:

```typescript
// Pass scroll progress as uniform
useFrame(() => {
  const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  materialRef.current.uniforms.uScroll.value = scrollProgress;
});

// In shader: control accretion rate with scroll
// float accretionSpeed = mix(0.01, 0.1, uScroll);
// float particleBrightness = mix(0.3, 1.0, uScroll);
```
