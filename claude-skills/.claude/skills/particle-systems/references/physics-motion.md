# Particle Physics & Motion Patterns

## Flow Fields (Noise-Driven Motion)

Particles follow a velocity field generated from noise. Creates organic, fluid-like motion.

```glsl
// In vertex shader: apply flow field force
vec3 pos = position;
float t = uTime + aOffset;

// Sample noise to get flow direction
float noiseX = snoise(vec2(pos.x * 0.3 + t * 0.1, pos.y * 0.3));
float noiseY = snoise(vec2(pos.y * 0.3 + t * 0.1, pos.z * 0.3));
float noiseZ = snoise(vec2(pos.z * 0.3 + t * 0.1, pos.x * 0.3));

// Apply flow force
pos += vec3(noiseX, noiseY, noiseZ) * aSpeed * 0.5;

// Fade and reset particles that drift too far
float dist = length(pos);
if (dist > 5.0) {
  pos *= 5.0 / dist; // Wrap back
}
```

## Attractor Physics

Particles are attracted to one or more points. The core physics for gravitational effects.

```glsl
// Single point attractor
uniform vec3 uAttractor; // Position of attractor
uniform float uStrength; // Attraction strength

void main() {
  vec3 pos = position;

  // Vector from particle to attractor
  vec3 toAttractor = uAttractor - pos;
  float dist = length(toAttractor);

  // Gravitational force: F = G * m / r^2
  float force = uStrength / (dist * dist + 0.5); // +0.5 prevents singularity

  // Apply force as velocity
  vec3 velocity = normalize(toAttractor) * force;
  pos += velocity * 0.016; // Delta time approximation

  // ... rest of vertex shader
}
```

### Multiple Attractors

```glsl
// Define 3 attractors that orbit
vec3 attractors[3];
attractors[0] = vec3(cos(uTime) * 2.0, sin(uTime * 0.7), 0.0);
attractors[1] = vec3(-cos(uTime * 0.8) * 2.0, 0.0, sin(uTime));
attractors[2] = vec3(0.0, cos(uTime * 1.2) * 2.0, -sin(uTime * 0.5));

vec3 totalForce = vec3(0.0);
for (int i = 0; i < 3; i++) {
  vec3 dir = attractors[i] - pos;
  float dist = length(dir);
  totalForce += normalize(dir) * 0.5 / (dist * dist + 0.3);
}

pos += totalForce * aSpeed;
```

## Repulsion / Explosion

Particles repel from a point (click to explode, mouse repel, etc).

```glsl
uniform vec3 uRepulsor;
uniform float uRepulsorStrength;

void main() {
  vec3 pos = position;

  vec3 fromRepulsor = pos - uRepulsor;
  float dist = length(fromRepulsor);

  // Repulsion force (inverse square, capped)
  float force = uRepulsorStrength / (dist * dist + 0.5);
  force = min(force, 2.0); // Cap to prevent extreme velocities

  pos += normalize(fromRepulsor) * force * 0.016;

  // ... rest of shader
}
```

## Mouse Interaction

```typescript
// Track mouse position in 3D space
const mouseRef = useRef(new THREE.Vector3());

useFrame((state) => {
  // Project mouse to a plane at z=0
  const mouse3D = new THREE.Vector3(state.pointer.x, state.pointer.y, 0);
  mouse3D.unproject(state.camera);
  const dir = mouse3D.sub(state.camera.position).normalize();
  const distance = -state.camera.position.z / dir.z;
  mouseRef.current.copy(state.camera.position).add(dir.multiplyScalar(distance));

  // Pass to shader
  materialRef.current.uniforms.uMouse3D.value.copy(mouseRef.current);
});
```

```glsl
// In shader: particles flee from mouse
uniform vec3 uMouse3D;

vec3 fromMouse = pos - uMouse3D;
float mouseDist = length(fromMouse);
float mouseForce = smoothstep(2.0, 0.0, mouseDist) * 0.5;
pos += normalize(fromMouse) * mouseForce;
```

## Text / Shape Morphing

Particles transition between formations (scattered → text → shape → scattered).

```typescript
// Create target positions from text
function getTextPositions(text: string, count: number): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "white";
  ctx.font = "bold 80px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);

  const imageData = ctx.getImageData(0, 0, 512, 128);
  const positions = new Float32Array(count * 3);
  const validPixels: [number, number][] = [];

  // Find all filled pixels
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 512; x++) {
      if (imageData.data[(y * 512 + x) * 4 + 3] > 128) {
        validPixels.push([x, y]);
      }
    }
  }

  // Assign particles to pixel positions
  for (let i = 0; i < count; i++) {
    const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];
    positions[i * 3] = (pixel[0] / 512 - 0.5) * 8;       // X: -4 to 4
    positions[i * 3 + 1] = -(pixel[1] / 128 - 0.5) * 2;  // Y: -1 to 1
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;   // Z: slight depth
  }

  return positions;
}
```

```glsl
// Vertex shader: morph between scattered and formed positions
attribute vec3 aTargetPosition;  // Text/shape target
uniform float uMorphProgress;    // 0 = scattered, 1 = formed

void main() {
  vec3 scatteredPos = position; // Random starting positions
  vec3 formedPos = aTargetPosition;

  // Smooth morph with slight overshoot
  float t = smoothstep(0.0, 1.0, uMorphProgress);
  vec3 pos = mix(scatteredPos, formedPos, t);

  // Add subtle noise when not fully formed
  float noiseFactor = 1.0 - t;
  pos += vec3(
    snoise(pos.xy + uTime) * noiseFactor * 0.2,
    snoise(pos.yz + uTime) * noiseFactor * 0.2,
    snoise(pos.xz + uTime) * noiseFactor * 0.1
  );

  // ... rest of shader
}
```

```typescript
// Animate morph with GSAP
const morphProgress = useRef({ value: 0 });

useGSAP(() => {
  gsap.to(morphProgress.current, {
    value: 1,
    duration: 2,
    ease: "power3.inOut",
    scrollTrigger: {
      trigger: ".text-section",
      start: "top center",
      end: "bottom center",
      scrub: 1,
    },
  });
});

useFrame(() => {
  materialRef.current.uniforms.uMorphProgress.value = morphProgress.current.value;
});
```

## Turbulence

Add chaotic but organic-looking motion using curl noise.

```glsl
// Curl noise provides divergence-free (fluid-like) motion
vec3 curlNoise(vec3 p) {
  float e = 0.1;

  float n1 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));
  float n2 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
  float n3 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));

  float n4 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));
  float n6 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));

  return normalize(vec3(n1 - n4, n2 - n5, n3 - n6));
}

// Apply to particle
vec3 curl = curlNoise(pos * 0.5 + uTime * 0.1);
pos += curl * aSpeed * 0.02;
```
