# Verification

Verified on 27 November 2026 against corrected Glasswater commit [250daa4](https://github.com/edmondyip/glasswater/commit/250daa455f3bf66718ec52e893d963644844e00c). The six skill folders passed the Agent Skills frontmatter and naming validator. Each module and example runs from its own folder. Node.js 24.15.0 was used for verification.

| Standalone skill | Passed assertions |
| --- | --- |
| interactive-ocean | Ripple arrival 1.4 m from the stamp, equality across two elapsed-time chunkings, bounded heights and rejection of unstable grid parameters |
| underwater-caustics | Flat and oblique Snell projection, unit focusing under translation, 4× focusing after compression and a 5× cap for a collapsed triangle |
| refracted-shadows | Separate air and water blockers, unobstructed bent path, exclusion beyond the receiver, soft-edge midpoint and empty/weighted flux resolution |
| underwater-lighting | Distance and chromatic transmission, added lamp energy, depth attenuation and rejection of an emitter below the bed |
| floating-object-physics | Contact separation, restitution, momentum symmetry and convergence to the flat-water heave equilibrium |
| procedural-day-night | Periodic midnight, normalized directions and bounded direction changes across all four horizon crossings, disk clipping and night lamp gain |

## Independent WebGL 2 integration

The tide tank imported three library modules and rendered in Chromium Headless Shell 151.0.7922.77 with ANGLE Metal on an Apple M1 Max. It imports no Glasswater application code. At 48 fixed browser frames, the ripple-button run measured 0.551 summed squared grid height in m², versus 0.171 in the matched control. A float center moved 0.0369 m relative to the control. The pointer path and the visual change from daylight to 22:00 were also checked. Chromium reported no page or WebGL errors. The [screenshot](media/tide-tank.webp) is from the actual example.

## Scope

The six modules are independently reusable numerical references. The tide tank verifies the ocean, float and clock integration into a new WebGL 2 scene. The caustics, refracted shadows and underwater illumination examples verify their CPU reference math. Their offscreen WebGL 2 recipes are based on the Glasswater renderer and were not separately integrated into the tide tank. Three.js adapters, skill discovery inside running agents, Safari, Firefox, physical mobile hardware and production performance outside Glasswater remain unverified.
