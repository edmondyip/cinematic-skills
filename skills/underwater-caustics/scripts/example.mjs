import assert from "node:assert/strict";
import { focusing, projectLight } from "./caustics.mjs";

const base = { x: 1, z: -1, height: 0, normal: [0, 1, 0], depth: () => 2 };
const vertical = projectLight({ ...base, sun: [0, 1, 0] });
assert.deepEqual(vertical.bed, [1, -1]);
assert.equal(vertical.distance, 2);
const glancing = projectLight({ ...base, sun: [.6, .8, 0] });
assert.ok(Math.abs(glancing.ray[0] + .6 / 1.333) < 1e-12);
assert.ok(glancing.bed[0] < 1 && glancing.distance > 2 && glancing.energy < vertical.energy);
assert.equal(projectLight({ ...base, sun: [1, 0, 0] }), null);
const patch = [[0, 0], [1, 0], [0, 1]];
assert.equal(focusing(patch, [[2, 2], [3, 2], [2, 3]]), 1);
assert.equal(focusing(patch, [[0, 0], [.5, 0], [0, .5]]), 4);
assert.equal(focusing(patch, [[0, 0], [0, 0], [0, 0]]), 5);
console.log("PASS underwater-caustics: Snell projection, area focusing and cap");
