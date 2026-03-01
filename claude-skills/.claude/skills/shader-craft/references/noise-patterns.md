# GLSL Noise Function Library

Copy-paste these noise functions into your shaders. Include only the types you need to minimize shader compilation time.

## Simplex 2D

The workhorse. Smooth, efficient, no grid artifacts.

```glsl
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

**Range:** -1.0 to 1.0
**Use for:** Animated backgrounds, displacement, flow fields, organic motion

## Simplex 3D

For volumetric effects and time-animated noise (pass `vec3(uv, time)`).

```glsl
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise3(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
```

**Use for:** Clouds, fog, 3D displacement, time-varying noise

## FBM (Fractal Brownian Motion)

Layer noise at multiple octaves for rich, natural-looking detail.

```glsl
// Requires snoise() or snoise3() above

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float lacunarity = 2.0;    // Frequency multiplier per octave
  float persistence = 0.5;   // Amplitude multiplier per octave

  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= lacunarity;
    amplitude *= persistence;
  }
  return value;
}

// 3D version
float fbm3(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise3(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

**Parameters to tune:**
- **Octaves (loop count):** More = more detail. 4-6 for backgrounds, 6-8 for terrain.
- **Lacunarity:** How quickly frequency increases. 2.0 is standard.
- **Persistence:** How quickly amplitude decreases. 0.5 is standard. Lower = smoother.

**Use for:** Clouds, terrain, organic textures, water surfaces

## Voronoi / Cellular Noise

Creates cell-like patterns. Good for crystal, cracked surfaces, organic cells.

```glsl
vec2 voronoi(vec2 p) {
  vec2 n = floor(p);
  vec2 f = fract(p);

  float minDist = 1.0;
  float secondMinDist = 1.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(
        fract(sin(dot(n + g, vec2(12.9898, 78.233))) * 43758.5453),
        fract(sin(dot(n + g, vec2(93.9898, 67.345))) * 24634.6345)
      );

      vec2 diff = g + o - f;
      float dist = length(diff);

      if (dist < minDist) {
        secondMinDist = minDist;
        minDist = dist;
      } else if (dist < secondMinDist) {
        secondMinDist = dist;
      }
    }
  }

  return vec2(minDist, secondMinDist);
}

// Usage:
// vec2 v = voronoi(uv * 8.0);
// float cells = v.x;                    // Distance to nearest cell center
// float edges = v.y - v.x;             // Edge detection (cell borders)
// float pattern = smoothstep(0.0, 0.05, edges); // Sharp cell edges
```

**Use for:** Crystal, cracked earth, biological cells, Voronoi diagrams

## Curl Noise

Divergence-free noise field — particles following curl noise never bunch up or create voids. Perfect for fluid-like motion.

```glsl
// Requires snoise() above

vec2 curlNoise2D(vec2 p) {
  float e = 0.01;

  float n1 = snoise(vec2(p.x, p.y + e));
  float n2 = snoise(vec2(p.x, p.y - e));
  float n3 = snoise(vec2(p.x + e, p.y));
  float n4 = snoise(vec2(p.x - e, p.y));

  float dx = (n1 - n2) / (2.0 * e);
  float dy = (n3 - n4) / (2.0 * e);

  return vec2(dx, -dy);
}

// 3D version (requires snoise3)
vec3 curlNoise3D(vec3 p) {
  float e = 0.01;

  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  float n1 = snoise3(p + dy) - snoise3(p - dy);
  float n2 = snoise3(p + dz) - snoise3(p - dz);
  float n3 = snoise3(p + dz) - snoise3(p - dz);
  float n4 = snoise3(p + dx) - snoise3(p - dx);
  float n5 = snoise3(p + dx) - snoise3(p - dx);
  float n6 = snoise3(p + dy) - snoise3(p - dy);

  return normalize(vec3(n1 - n2, n3 - n4, n5 - n6));
}
```

**Use for:** Fluid simulation, smoke, particle flow fields

## Domain Warping

Feed noise output back as input coordinates for surreal, organic shapes.

```glsl
float domainWarp(vec2 p) {
  vec2 q = vec2(
    fbm(p + vec2(1.3, 1.7)),
    fbm(p + vec2(8.3, 2.8))
  );

  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(5.2, 1.3) + 0.15 * uTime),
    fbm(p + 4.0 * q + vec2(3.7, 9.2) + 0.126 * uTime)
  );

  return fbm(p + 4.0 * r);
}
```

**Use for:** Abstract backgrounds, alien landscapes, psychedelic effects

## Performance Notes

- **Simplex 2D:** ~20 GPU instructions. Very fast. Use freely.
- **Simplex 3D:** ~40 GPU instructions. Fast. Fine for per-vertex.
- **FBM (6 octaves):** ~120 GPU instructions. Moderate. Limit in fragment shaders at high resolution.
- **Voronoi:** ~50 GPU instructions (depends on neighborhood size). Moderate.
- **Curl:** 6x noise evaluations. Expensive. Best in vertex shaders or at lower resolution.
- **Domain Warp:** 3-4x FBM cost. Expensive. Use at lower resolution or fewer octaves.

**Mobile optimization:** Reduce FBM to 3-4 octaves. Use simpler noise where possible.
