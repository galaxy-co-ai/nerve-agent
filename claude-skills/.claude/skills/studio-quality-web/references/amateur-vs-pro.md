# Amateur vs Professional: What Separates Them

This document details the specific differences between amateur and professional web experiences, with code examples showing the right way to do things.

## 1. Animation Easing

### Amateur
```css
.element {
  transition: all 0.3s ease;
}
```
Everything uses the same generic easing. Motion feels robotic and lifeless.

### Professional
```typescript
// Different easing for different intentions
gsap.to(element, {
  y: 0,
  opacity: 1,
  duration: 1.2,
  ease: "power3.out",        // Entrance: fast start, gentle landing
});

gsap.to(element, {
  scale: 1.05,
  duration: 0.6,
  ease: "power2.inOut",      // Emphasis: smooth both ways
});

gsap.to(element, {
  y: -20,
  duration: 0.8,
  ease: "back.out(1.7)",     // Playful: slight overshoot
});
```
Each animation has an easing curve chosen for its purpose. Motion feels physical and intentional.

## 2. Scroll Animations

### Amateur
```typescript
// Intersection Observer with CSS class toggle
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible'); // Binary: hidden → visible
    }
  });
});
```
Elements pop in abruptly when they enter the viewport. No control over timing.

### Professional
```typescript
// GSAP ScrollTrigger with scrub for scroll-linked animation
gsap.to(".hero-image", {
  y: -100,
  scale: 1.1,
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom top",
    scrub: 0.5,              // Smooth 0.5s lag behind scroll position
    pin: true,               // Pin section while animating
  }
});

// Staggered reveal for content sections
gsap.from(".content-block", {
  y: 60,
  opacity: 0,
  stagger: 0.15,
  scrollTrigger: {
    trigger: ".content-section",
    start: "top 80%",
    toggleActions: "play none none reverse",
  }
});
```
Elements animate in direct relationship to scroll position. Feels connected and responsive.

## 3. Particle Effects

### Amateur
```typescript
// tsparticles / particles.js — CPU-bound, limited customization
import Particles from "react-tsparticles";

<Particles options={{
  particles: {
    number: { value: 80 },
    move: { speed: 1 },
    size: { value: 3 },
  }
}} />
```
Generic floating dots. CPU-bound so limited to ~200 particles before jank. No depth, no physics.

### Professional
```typescript
// Three.js InstancedMesh — GPU-accelerated, 100k+ particles
const COUNT = 50000;
const mesh = new THREE.InstancedMesh(
  new THREE.PlaneGeometry(0.02, 0.02),
  new THREE.ShaderMaterial({
    vertexShader: `
      attribute vec3 aVelocity;
      attribute float aLife;
      uniform float uTime;
      varying float vLife;

      void main() {
        vLife = aLife;
        vec3 pos = position + instanceMatrix[3].xyz;
        // Spiral motion with gravity
        float angle = uTime * aVelocity.x + aLife * 6.28;
        float radius = aLife * 2.0;
        pos.x += cos(angle) * radius;
        pos.z += sin(angle) * radius;
        pos.y -= uTime * aVelocity.y * 0.5; // gravity
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aLife * 4.0;
      }
    `,
    fragmentShader: `
      varying float vLife;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float alpha = smoothstep(0.5, 0.1, d) * vLife;
        gl_FragColor = vec4(1.0, 0.9, 0.7, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  }),
  COUNT
);
```
50,000 particles spiraling with gravity, GPU-accelerated, custom shader for glow. Runs at 60fps.

## 4. Text Animation

### Amateur
```css
.text {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}
.text.visible {
  opacity: 1;
  transform: translateY(0);
}
```
Entire text block fades up as one unit. Generic, forgettable.

### Professional
```typescript
// Per-character masked reveal with stagger
const split = new SplitText(".headline", { type: "chars" });

// Wrap each char in overflow:hidden container
split.chars.forEach(char => {
  const wrapper = document.createElement("span");
  wrapper.style.overflow = "hidden";
  wrapper.style.display = "inline-block";
  char.parentNode.insertBefore(wrapper, char);
  wrapper.appendChild(char);
});

gsap.from(split.chars, {
  y: "100%",              // Slide up from below the mask
  duration: 0.8,
  ease: "power3.out",
  stagger: 0.03,          // 30ms between each character
  scrollTrigger: {
    trigger: ".headline",
    start: "top 80%",
  }
});
```
Each character slides up from behind a mask with staggered timing. Cinematic, memorable.

## 5. Three.js Lighting

### Amateur
```typescript
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 0);
scene.add(light);
```
Single white directional light from above. Flat, no depth, looks like a tech demo.

### Professional
```typescript
// HDRI environment for realistic global illumination
const envMap = new RGBELoader().load('/studio.hdr');
scene.environment = envMap;

// Key light — main illumination
const keyLight = new THREE.SpotLight(0xfff5e6, 2);
keyLight.position.set(5, 5, 5);
keyLight.angle = Math.PI / 6;
keyLight.penumbra = 0.5;     // Soft edge falloff
scene.add(keyLight);

// Fill light — soften shadows
const fillLight = new THREE.PointLight(0x8090ff, 0.5);
fillLight.position.set(-3, 2, -2);
scene.add(fillLight);

// Rim light — edge definition
const rimLight = new THREE.SpotLight(0xffffff, 1.5);
rimLight.position.set(-2, 3, -5);
scene.add(rimLight);

// Contact shadows for grounding
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.ShadowMaterial({ opacity: 0.3 })
);
```
Three-point lighting with HDRI environment. Objects look real, shadows are soft, scene has depth.

## 6. Mouse Interaction

### Amateur
```typescript
document.addEventListener('mousemove', (e) => {
  element.style.left = e.clientX + 'px';
  element.style.top = e.clientY + 'px';
});
```
Element snaps to mouse position. No smoothness, no personality. Layout property animation causes jank.

### Professional
```typescript
// Lerped following with spring-like smoothness
let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animate() {
  // Lerp toward target — 0.1 = smooth trailing, 0.3 = responsive
  currentX += (mouseX - currentX) * 0.1;
  currentY += (mouseY - currentY) * 0.1;

  cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  requestAnimationFrame(animate);
}
animate();
```
Cursor trails behind the mouse with smooth interpolation. Uses `transform` instead of layout properties. Feels physical and polished.

## 7. Responsive Motion

### Amateur
Same animations on all devices. Mobile gets the same heavy 3D scene, same particle count. Result: 15fps on phones, battery drain, user frustration.

### Professional
```typescript
// Progressive enhancement with capability detection
function getDeviceTier(): 'low' | 'mid' | 'high' {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  if (!gl) return 'low';

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : '';

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 2;

  if (isMobile || cores <= 2 || memory <= 2) return 'low';
  if (cores <= 4 || memory <= 4) return 'mid';
  return 'high';
}

// Use tier to adjust experience
const tier = getDeviceTier();
const particleCount = { low: 5000, mid: 25000, high: 100000 }[tier];
const dpr = { low: 1, mid: 1.5, high: 2 }[tier];
const enablePostProcessing = tier === 'high';
const enableParallax = tier !== 'low';
```
Each device gets the best experience it can handle. Mobile is still beautiful, just simpler.
