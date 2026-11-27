import assert from "node:assert/strict";
import { createOcean, swell } from "./ocean.mjs";

const stepped = createOcean(), grouped = createOcean();
stepped.stamp(0, 0);
grouped.stamp(0, 0);
assert.equal(stepped.sample(0, 0), 0);
for (let i = 0; i < 45; i++) stepped.advance(1 / 90);
for (let i = 0; i < 15; i++) grouped.advance(3 / 90);
assert.deepEqual(stepped.heights, grouped.heights);
assert.ok(Math.abs(stepped.sample(1.4, 0)) > .005);
stepped.stroke([-1, 0], [1, 0], .13);
stepped.advance(.03);
assert.ok(stepped.heights.every(h => Number.isFinite(h) && Math.abs(h) <= .360001));
assert.throws(() => createOcean({ speed: 80 }), /timestep/);
assert.notEqual(swell(1, 2, 0), swell(1, 2, 1));
console.log("PASS interactive-ocean: propagation, fixed steps, bounds and stability");
