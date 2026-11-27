---
name: interactive-ocean
description: Implement or tune pointer-driven water ripples and procedural swells in a real-time 3D scene. Use for height-field water, continuous wake strokes, non-repeating waves, or unstable and aliased water surfaces.
---

# Interactive ocean

Use [ocean.mjs](scripts/ocean.mjs) for two independent layers. The analytic swell supplies large-scale motion. A local height grid responds to pointer impulses. Inputs are world XZ metres, seconds, and heading in radians. Outputs are a height sampler and a row-major Float32 grid. The module needs native JavaScript ES modules.

1. Pick the water plane in world space. Stamp isolated hits and resample drags every `0.33 × radius`; reset the previous hit when the pointer leaves the surface or begins orbiting. Supply normalized XZ direction to a directional stamp.
2. Advance the damped wave equation at a fixed step. Glasswater uses a 184 × 168 near grid over 26 × 24 m, speed 3.1 m/s, step 1/90 s, stamp radius 0.49 m and height cap 0.36 m. Start with the smaller module defaults for a test scene. Keep `dt²((c/dx)² + (c/dz)² + 1.3/4) < 1`. Tune edge damping before increasing the cap.
3. Add `swell(x,z,clock,heading,amplitude)` and `ocean.sample(x,z)` for rendering and physics. Share the phase clock and wave coefficients across CPU and GPU. V15 mixes 16 directions/frequencies and a second harmonic to break repetitive parallel bands. Attenuate unresolved normal detail with footprint filtering.
4. If needed, layer a larger, coarser grid and crossfade by world position. Keep foam history in a separate ping-pong texture, decayed with elapsed seconds. V15 updates foam at roughly 30 Hz and softens the visible threshold with `fwidth(mask)` plus a minimum width. Evaluate grain and masks at their resolved frequencies.

For WebGL 2, upload the current `ocean.heights` after stepping. Use a vertex-sampled R32F texture with nearest or manual interpolation, or pack a signed normalized height into two RGBA8 channels with the same decode in every pass. The height array swaps on step, so read the getter after advancing. For a small Three.js mesh, build a plane rotated into XZ, displace its position attribute and mark it dirty. Recompute normals only when needed. The Three.js path is untested.

Exploding waves usually mean a timestep or spacing violation. Visible rings bouncing off invisible walls call for a thicker absorbing rim. Stripe repetition calls for better directional variation. Foam flicker at distance calls for a wider filtered threshold and less high-frequency energy. Profile grid stepping, texture uploads and shader passes separately.

Run `node scripts/example.mjs` from this skill. It verifies wave arrival, fixed-step equivalence, finite bounded heights and unstable-grid rejection. This is a single-height surface with artistic swells and no breaking-wave or fluid-volume model. The module omits Glasswater’s moving obstacle mask.
