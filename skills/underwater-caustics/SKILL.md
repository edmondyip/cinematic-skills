---
name: underwater-caustics
description: Project water-surface normals onto a seabed to create moving caustic networks. Use for world-space light focusing, wrong-depth caustic drift, or expensive caustic passes in WebGL 2 and other real-time renderers.
---

# Underwater caustics

Use [caustics.mjs](scripts/caustics.mjs) as a CPU reference. Provide world XZ metres, surface height, an upward unit normal, a unit surface-to-sun direction and `depth(x,z)` as positive seabed depth below y=0. The projection returns bed XZ, a refracted unit ray, its origin, path length and unfocused energy. The module depends only on ES modules.

1. Sample the same height and slopes as the water, with the shortest wavelength filtered for the projection mesh. Forward-project each vertex using GLSL `refract(-sun, normal, 1.0/1.333)`. Clamp the vertical denominator to 0.18. Refine distance against the bed depth at the projected hit three times, mixing 72% of the new estimate per step. This approximation suits gently varying beds.
2. Draw the warped grid into a world-space map. V15 projects a 257 × 257 grid over 40 m into a 512 × 512 map over 32 m. Under WebGL 2 use additive `ONE, ONE` blending and disable depth testing so folded facets contribute. Interpolate surface XZ as a varying. In the fragment shader compute `abs(det(mat2(dFdx(sourceXZ), dFdy(sourceXZ)))) / texelMetres²`. This estimates source-to-bed area ratio. Clamp focusing to 5, multiply by incidence and `exp(-0.15 * pathMetres)`, and fade source and receiver map edges.
3. Sample at the refracted view ray’s seabed hit. Glasswater encodes flux at 0.115 scale in RGBA8. Watch saturation if several projected facets overlap. Use a blendable linear target supported by the renderer if you need more headroom.
4. Start at a 30 Hz pass budget. Recompute on light, depth or optical setting changes. V15 skips the pass when the light elevation component reaches 0.10 and fades contribution through 0.30. Optional two-channel accumulation for shadow visibility is specified by the refracted-shadows skill.

With Three.js, the same vertex/fragment math can run on an additive offscreen mesh in a WebGLRenderTarget. Use GLSL3 and linear data sampling, then restore the previous render target and viewport. This adapter is untested. The reference module can be used without a renderer.

A camera-locked texture usually means sampling screen UV rather than bed XZ. Pinholes, sparkle and blown-out pixels call for a resolution-aware normal filter, capped focusing, and a target with adequate range. Strong undercuts or grazing rays need a different intersection method. This is geometric focusing with approximate attenuation.

Run `node scripts/example.mjs`. It checks vertical and oblique Snell projection, a translated flat patch at unit focusing, a compressed patch at 4× and the degenerate-triangle cap.
