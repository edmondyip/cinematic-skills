---
name: refracted-shadows
description: Cast contact shadows on submerged receivers through a moving water interface. Use for occluders above and below the surface, misplaced caustic shadows, or visibility weighting across folded light paths.
---

# Refracted shadows

[shadows.mjs](scripts/shadows.mjs) evaluates spherical blockers and resolves accumulated visibility. All positions, lengths and radii are in world metres. Provide an interface point, a unit ray toward the sun, a unit refracted ray toward the bed and its finite distance, and spheres as `{center: [x,y,z], radius}`. Any projection provider can supply the path. The reference uses native ES modules.

1. For each blocker, project the center-to-origin vector on both segments. Clamp the projected distance to `[0, segmentLength]` before measuring the closest distance. Glasswater defaults to a 30 m segment toward the sun and stops the submerged segment exactly at the receiver.
2. Evaluate visibility with smoothstep between `max(0, radius-soft)` and `radius+soft`. Start with `soft = .035 + .012 * min(3, bedPathMetres)`. Take the minimum over both segments and all blockers.
3. During additive projection, write open flux to R and open flux × visibility to G. At the receiver divide G by R, clamp to [0,1], fade at the map boundary, and return 1 for an empty texel. Weighting the ratio by flux keeps a weak shadow ray from canceling a stronger unobstructed ray. Apply to direct sunlight, leaving ambient/scatter intact.

In WebGL 2, use the same projection map and world bounds as the caustic pass or supply a shadow-only pass with unit source flux. Keep `origin`, `ray` and path distance in matching world space and normalize interpolated rays. Three.js integration would use a GLSL3 offscreen material and linear R/G data with additive blending. It is untested. Skip remote blockers and bound the loop or use a spatial query if the count grows.

Surface-shaped shadows that miss the receiver often use an unrefracted ray. Phantom occlusion beyond the bed indicates an infinite-ray test. Black specks in empty texels indicate division without a fallback. The spherical penumbra is a local approximation and does not cover arbitrary mesh blockers.

Run `node scripts/example.mjs`. It tests occluders on both path segments, a distinct bent path, a blocker beyond the receiver, the soft transition and weighted flux resolution.
