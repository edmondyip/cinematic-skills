import assert from "node:assert/strict";
import { absorption, shadeBed, transmission } from "./lighting.mjs";

const sigma = absorption(.7);
const near = transmission(sigma, 1), deep = transmission(sigma, 3);
assert.ok(deep.every((value, i) => value < near[i]));
assert.ok(deep[0] < deep[1] && deep[1] < deep[2]);
const base = { point: [0, -2, 0], normal: [0, 1, 0], albedo: [1, 1, 1],
  ambient: [.03, .03, .03], viewDistance: 2, sigma };
const lamp = { center: [0, 0, 0], radius: .3, color: [1, 1, 1] };
const off = shadeBed({ ...base, lamps: [] });
const on = shadeBed({ ...base, lamps: [lamp] });
const deeper = shadeBed({ ...base, viewDistance: 4, lamps: [lamp] });
assert.ok(on.every((value, i) => value > off[i] && value > deeper[i]));
assert.ok(on[0] < on[1] && on[1] < on[2]);
assert.deepEqual(shadeBed({ ...base, lamps: [{ ...lamp, center: [0, -3, 0] }] }), off);
console.log("PASS underwater-lighting: chromatic attenuation, lamp contribution and range direction");
