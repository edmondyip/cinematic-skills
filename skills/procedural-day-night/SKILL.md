---
name: procedural-day-night
description: Drive continuous animated sun, moon, ambient sky and night lights in a real-time scene. Use for time-of-day transitions, stuck reflections, horizon bands, or abrupt celestial visibility changes.
---

# Procedural day/night

[day-night.mjs](scripts/day-night.mjs) maps scene hours to unit sun/moon directions, daylight, twilight and lamp gains. `diskWeights` takes an original unit view or reflection ray and those outputs, and returns sun and moon weights. Inputs use Y-up space. The ES module needs no renderer.

1. Advance a continuous scene clock, then use the same directions for sky, direct lights, specular reflections and caustic projection. V15 uses two art-directed sinusoidal paths with sun crossings at 06:00/18:00 and moon crossings at 20:00/08:00. Use a periodic clock, including at midnight. Daylight smoothsteps over the sun’s Y component from −0.14 to 0.16. Twilight fades between 0.12 and 0.67. Night lamps use one minus daylight.
2. Compute atmosphere, including broad celestial halos, independently of disk radiance. Fog samples atmosphere on the original view ray. Evaluate disks on the actual sky or reflected ray. Use `smoothstep(0,.002,ray.y)` to clip the disks softly at the horizon. Using a direction flattened to the horizon reproduces the V15 bright-band bug when fog samples a disk.
3. Keep direct glitter separate. Use a finite-width specular lobe and fade direct-sun and direct-moon contributions over elevation Y ranges 0–0.025 and 0–0.03. If using a solar flare, fade it before the sun crosses the horizon; V15 ramps up over Y=0–0.12 and also fades offscreen.
4. Feed uniforms once per frame or when the clock changes. Skip daytime-dependent offscreen passes at low sun. Apply exposure in linear color before tone mapping.

In WebGL 2, wire the returned directions into atmosphere and material uniforms and port `diskWeights` to GLSL for per-ray evaluation. A Three.js adapter can use DirectionalLight for direct light and a GLSL3 sky and fog material that share this clock. Built-in flat fog alone cannot reproduce a directional atmosphere. The adapter is untested.

Run `node scripts/example.mjs` to check 24-hour wrapping, normalized directions, all four crossings, and disk visibility above and below the horizon. In a renderer, inspect fixed-camera frames just before, during and after each crossing. The reference models artistic trajectories and visibility. It does not estimate geographical solar positions or atmospheric scattering from physical inputs.
