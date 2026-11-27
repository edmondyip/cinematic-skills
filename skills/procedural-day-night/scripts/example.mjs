import assert from "node:assert/strict";
import { dayNight, diskWeights } from "./day-night.mjs";

const midnight = dayNight(0), wrapped = dayNight(24);
assert.ok(midnight.sun.every((v, i) => Math.abs(v - wrapped.sun[i]) < 1e-12));
assert.ok(midnight.moon.every((v, i) => Math.abs(v - wrapped.moon[i]) < 1e-12));
for (const [hour, key, rising] of [[6, "sun", true], [18, "sun", false], [20, "moon", true], [8, "moon", false]]) {
  const before = dayNight(hour - .01), after = dayNight(hour + .01);
  assert.equal(before[key][1] < 0, rising);
  assert.equal(after[key][1] > 0, rising);
  assert.ok(Math.abs(Math.hypot(...after[key]) - 1) < 1e-12);
  assert.ok(Math.hypot(...after[key].map((value, i) => value - before[key][i])) < .01);
  const high = dayNight(hour + (rising ? .13 : -.13));
  assert.ok(diskWeights(high[key], high)[key] > 0);
  const [x, y, z] = high[key];
  assert.equal(diskWeights([x, -y, z], high)[key], 0);
}
assert.equal(dayNight(12).lamps, 0);
assert.equal(dayNight(22).lamps, 1);
console.log("PASS procedural-day-night: four crossings, unit directions, disk clipping and wrap");
