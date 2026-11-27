import assert from "node:assert/strict";
import { pathVisibility, resolveVisibility } from "./shadows.mjs";

const ray = [-.6, -.8, 0], sun = [0, 1, 0];
const vis = (center) => pathVisibility({ origin: [0, 0, 0], sun, ray, distance: 2, spheres: [{ center, radius: .2 }] });
assert.equal(vis([0, 1, 0]), 0);
assert.equal(vis([-.6, -.8, 0]), 0);
assert.equal(vis([0, -.8, 0]), 1);
assert.equal(vis([-1.8, -2.4, 0]), 1);
assert.ok(Math.abs(vis([0, 1, .2]) - .5) < 1e-12);
assert.equal(resolveVisibility(0, 0), 1);
assert.equal(resolveVisibility(4, 3), .75);
console.log("PASS refracted-shadows: both ray segments, finite reach, penumbra and flux ratio");
