---
name: underwater-lighting
description: Shade submerged geometry through water and attach visible underwater light to floating objects. Use for depth readability, coloured attenuation, or lamps that appear stuck to a water surface.
---

# Underwater lighting

The [reference module](scripts/lighting.mjs) takes the actual bed hit, upward unit receiver normal, linear RGB albedo and ambient light, camera-to-bed water path length, RGB absorption per metre and a list of lamps as `{center, radius, color, power}`. It returns linear RGB. Use any geometry or ray-intersection provider. Native ES modules suffice.

1. Trace the refracted view ray to shaped bathymetry and compute the actual water distance. For still water use `refract(-view, normal, 1.0/1.333)`; for a smoothly varying depth function, iterate the receiver intersection like the caustics pass. Shade the bed and its normal, not a depth tint at surface UV.
2. Apply Beer–Lambert transmission `exp(-sigma * distance)` by channel. V15 interpolates between `[1.45,.52,.28]` and `[.69,.10,.075]` with clarity. Add broad in-scatter as `scatter * (1-T)` and tone-map after lighting and reflection composition.
3. Place each emitter at `center.y - .87 * radius`. Use a downward cosine for emission, receiver cosine for incidence, and softened falloff `4.8 / (d² + radius² + .12)` at default power. Attenuate the emitter-to-bed path, then attenuate the shaded bed again over the bed-to-interface path. Avoid applying one distance twice.
4. In WebGL 2, keep ray and lamps in world space and calculate this at the bed sample. Porting to Three.js can use a ShaderMaterial or a material extension with world positions and linear colors. A standard point light alone omits the optical paths. The adapter is untested.

A glowing surface decal comes from lighting at the wrong hit point. Flat depth perception calls for a bed normal, geometry and chromatic attenuation. Stabilize near-field intensity with the finite-radius term. Reject receivers above emitters and cap range and lamp count. Glasswater checks only four emitters and skips lamp work at long view distances. This model omits volumetric shadows and multiple scattering.

Run `node scripts/example.mjs`. It checks attenuation with distance, the relative red/blue response, a lamp adding flux below its cap, the channel ordering, and a rejected emitter behind the receiver.
