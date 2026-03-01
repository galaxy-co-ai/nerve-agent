# Post-Processing Effects

Post-processing applies full-screen effects after the 3D scene renders. These effects are what make Three.js scenes feel cinematic rather than clinical.

## Setup with React Three Fiber

```bash
npm install @react-three/postprocessing postprocessing
```

```typescript
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
```

## Bloom (Glow Effect)

Makes bright objects glow. Essential for neon, light sources, and emissive materials.

```typescript
<EffectComposer>
  <Bloom
    intensity={0.5}                    // Glow strength
    luminanceThreshold={0.8}          // Only bright pixels glow (0 = everything)
    luminanceSmoothing={0.9}          // Smooth the brightness cutoff
    mipmapBlur                        // Higher quality blur (recommended)
  />
</EffectComposer>
```

**Tips:**
- Set `emissiveIntensity` on materials > 1.0 for them to trigger bloom
- `luminanceThreshold: 0` makes everything glow — usually too much
- Start subtle (0.3-0.5 intensity) and increase from there

## Vignette (Darkened Edges)

Darkens the edges of the screen. Creates focus and cinematic framing.

```typescript
<Vignette
  offset={0.3}       // How far from center the darkening starts
  darkness={0.6}     // How dark the edges get
  blendFunction={BlendFunction.NORMAL}
/>
```

## Chromatic Aberration (RGB Split)

Splits RGB channels slightly for a lens/glitch effect. Use subtly.

```typescript
import { Vector2 } from "three";

<ChromaticAberration
  offset={new Vector2(0.002, 0.002)}  // Keep very subtle
  blendFunction={BlendFunction.NORMAL}
  radialModulation            // Stronger at edges
  modulationOffset={0.5}
/>
```

**Warning:** Heavy chromatic aberration looks cheap. Keep offset < 0.003.

## Depth of Field (Bokeh)

Blurs objects based on distance from a focus point. Cinematic focus effect.

```typescript
<DepthOfField
  focusDistance={0.01}      // Focus distance (normalized 0-1)
  focalLength={0.02}       // Focal length
  bokehScale={6}           // Bokeh size
/>
```

**When to use:** Product viewers (focus on product, blur background), hero scenes with depth.

## Noise / Film Grain

Adds subtle texture. Prevents banding in gradients and adds analog film feel.

```typescript
<Noise
  opacity={0.04}             // Very subtle — just barely visible
  blendFunction={BlendFunction.OVERLAY}
/>
```

## Color Grading with LUT

Apply a color lookup table for consistent color grading.

```typescript
import { LUT3DEffect } from "postprocessing";
import { LUTCubeLoader } from "three/examples/jsm/loaders/LUTCubeLoader";

// Load LUT texture
const lutTexture = await new LUTCubeLoader().loadAsync("/luts/cinematic.cube");

// Apply in custom effect
<EffectComposer>
  <LUT3DEffect lut={lutTexture} />
</EffectComposer>
```

## Complete Cinematic Stack

For a polished, cinematic look, combine effects in this order:

```typescript
<EffectComposer>
  {/* 1. Bloom — glow on bright areas */}
  <Bloom intensity={0.4} luminanceThreshold={0.8} mipmapBlur />

  {/* 2. Depth of Field — focus attention */}
  <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={4} />

  {/* 3. Chromatic Aberration — subtle lens effect */}
  <ChromaticAberration offset={new Vector2(0.001, 0.001)} radialModulation />

  {/* 4. Vignette — darken edges */}
  <Vignette offset={0.3} darkness={0.5} />

  {/* 5. Noise — film grain (always last) */}
  <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
</EffectComposer>
```

## Performance Notes

- Each effect adds a full-screen pass — expensive on high-DPI displays
- **Budget:** 2-3 effects on mid-tier, 4-5 on high-tier, 0-1 on low-tier
- Bloom with `mipmapBlur` is faster than default Bloom
- Skip DOF on mobile (most expensive effect)
- `Noise` is very cheap (just a random texture)
- Reduce canvas resolution (`dpr={1}`) before disabling effects

```typescript
const tier = useDeviceTier();

<EffectComposer enabled={tier !== "low"}>
  <Bloom intensity={0.4} luminanceThreshold={0.8} mipmapBlur />
  {tier === "high" && <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={4} />}
  <Vignette offset={0.3} darkness={0.5} />
  <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
</EffectComposer>
```
