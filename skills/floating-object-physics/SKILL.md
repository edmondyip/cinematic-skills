---
name: floating-object-physics
description: Float and collide small spherical props on a procedural water surface. Use for buoyancy approximations, tethered drift, jittery floating objects, or overlapping floats without a rigid-body engine.
---

# Floating object physics

[floats.mjs](scripts/floats.mjs) mutates body records `{x,y,z,r,x0,z0,vx,vy,vz}` in metres and metres per second. Supply any `waterHeight(x,z)` and a small fixed `dt` in seconds. `x0,z0` are drift anchors. The module has no renderer dependency.

1. Average four samples around the body over `e=max(.2,1.15*r)` for a stable float target, and central-difference the same samples for slope. Initialize y at the target to avoid a startup bounce.
2. Accelerate vertically toward `meanHeight + .48*r` with stiffness 32 and damping 7. Drift downhill with gain 3.2, anchor stiffness .14 and drag .85. Update velocities before positions. Start around 1/90 s and substep frame spikes.
3. Solve horizontal sphere contacts after integration. Target separation is radii sum + .004 m. Distribute overlap correction by inverse mass `1/r³`, then apply normal impulse with restitution .22 only to approaching pairs. Glasswater uses six pair passes. Update render positions after correction.

For WebGL 2, send positions/radii as uniforms for small sets or instance attributes for larger sets. Three.js can copy results into mesh positions or instance transforms. That adapter is untested. The sampler must match displayed heights.

Jitter calls for footprint averaging and a smaller step. Persistent overlap calls for correction on each step and separation checks. Fast props can tunnel because this is discrete collision detection. Complexity is quadratic in body count per pass, so reserve this method for a small set or add a broad phase. No angular dynamics, displacement buoyancy, mesh collision or torques are modeled.

Run `node scripts/example.mjs`. It checks separation and restitution for a head-on pair and finite convergence toward the flat-water equilibrium.
