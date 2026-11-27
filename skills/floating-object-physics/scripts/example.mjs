import assert from "node:assert/strict";
import { resolveFloatCollisions, stepFloats } from "./floats.mjs";

const body = (x, vx) => ({ x, y: 0, z: 0, r: .3, x0: x, z0: 0, vx, vy: 0, vz: 0 });
const a = body(-.2, 1), b = body(.2, -1);
resolveFloatCollisions([a, b]);
assert.ok(b.x - a.x >= .603999999);
assert.ok(Math.abs(b.vx - a.vx - .44) < 1e-12);
assert.ok(Math.abs(a.vx + b.vx) < 1e-12);
const floating = body(0, 0);
for (let i = 0; i < 360; i++) stepFloats([floating], () => .35, 1 / 90);
assert.ok(Math.abs(floating.y - (.35 + .48 * floating.r)) < 1e-5);
console.log("PASS floating-object-physics: separation, restitution and heave equilibrium");
