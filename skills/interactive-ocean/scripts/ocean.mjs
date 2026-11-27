// Adapted from Glasswater (MIT). Coordinates are Y-up, with XZ in metres.
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));

export function createOcean({ columns = 65, rows = 49, width = 9, length = 7,
  speed = 3.1, radius = .49, cap = .36, step = 1 / 90 } = {}) {
  if (![columns, rows].every(n => Number.isInteger(n) && n >= 3) ||
      ![width, length, speed, radius, cap, step].every(n => Number.isFinite(n) && n > 0) ||
      step > .12) throw new RangeError("Invalid height-field dimensions or parameters");
  const dx = width / (columns - 1), dz = length / (rows - 1);
  const kx = (speed / dx) ** 2, kz = (speed / dz) ** 2;
  if (step ** 2 * (kx + kz + 1.3 / 4) >= 1) {
    throw new RangeError("Reduce the timestep or wave speed for this grid spacing");
  }

  let heights = new Float32Array(columns * rows), next = new Float32Array(heights.length);
  const velocity = new Float32Array(heights.length);
  let remainder = 0;
  const sponge = clamp(Math.floor(Math.min(columns, rows) / 4), 1, 13);

  function stamp(x, z, ux = 0, uz = 0, strength = 2.1) {
    const cx = (x + width / 2) / dx, cz = (z + length / 2) / dz;
    for (let j = Math.max(0, Math.floor(cz - 2.5 * radius / dz));
      j <= Math.min(rows - 1, Math.ceil(cz + 2.5 * radius / dz)); j++) {
      for (let i = Math.max(0, Math.floor(cx - 2.5 * radius / dx));
        i <= Math.min(columns - 1, Math.ceil(cx + 2.5 * radius / dx)); i++) {
        const a = (i - cx) * dx, b = (j - cz) * dz;
        const d2 = (a * a + b * b) / (radius * radius);
        const impulse = (1.5 * (a * ux + b * uz) / radius - .82) * Math.exp(-d2)
          + .31 * Math.exp(-d2 / 2.6);
        const n = j * columns + i;
        velocity[n] = clamp(velocity[n] + strength * impulse, -4.5, 4.5);
      }
    }
  }

  function stroke(a, b, seconds, force = 1) {
    const dx = b[0] - a[0], dz = b[1] - a[1], distance = Math.hypot(dx, dz);
    if (distance < .004) return;
    const gap = radius * .33;
    const count = clamp(Math.ceil(distance / gap), 1, 100);
    const strength = clamp(1.4 + distance / Math.max(seconds, .008) * .3, 1.4, 3.6)
      * force * Math.min(1, distance / count / gap);
    for (let i = 1; i <= count; i++) {
      stamp(a[0] + dx * i / count, a[1] + dz * i / count,
        dx / distance, dz / distance, strength);
    }
  }

  function advance(seconds) {
    remainder += clamp(seconds, 0, .12);
    // Tolerate floating-point error when an elapsed duration lands on a tick.
    const ticks = Math.floor(remainder / step + 1e-9);
    remainder = Math.max(0, remainder - ticks * step);
    for (let tick = 0; tick < ticks; tick++) {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < columns; i++) {
          const n = j * columns + i, h = heights[n];
          const lapX = heights[i ? n - 1 : n + 1] + heights[i < columns - 1 ? n + 1 : n - 1] - 2 * h;
          const lapZ = heights[j ? n - columns : n + columns] + heights[j < rows - 1 ? n + columns : n - columns] - 2 * h;
          const edge = Math.min(i, j, columns - 1 - i, rows - 1 - j);
          const v = (velocity[n] + step * (kx * lapX + kz * lapZ - 1.3 * h))
            * (.996 - .12 * (1 - Math.min(1, edge / sponge)));
          const candidate = h + step * v;
          next[n] = clamp(candidate, -cap, cap);
          velocity[n] = Math.abs(candidate) > cap ? .45 * v : v;
        }
      }
      [heights, next] = [next, heights];
    }
  }

  function sample(x, z) {
    const u = clamp((x + width / 2) / dx, 0, columns - 1);
    const v = clamp((z + length / 2) / dz, 0, rows - 1);
    const i = Math.min(Math.floor(u), columns - 2), j = Math.min(Math.floor(v), rows - 2);
    const f = u - i, g = v - j, n = j * columns + i;
    return (heights[n] * (1 - f) + heights[n + 1] * f) * (1 - g)
      + (heights[n + columns] * (1 - f) + heights[n + columns + 1] * f) * g;
  }

  return { columns, rows, width, length, stamp, stroke, advance, sample,
    get heights() { return heights; } };
}

const WAVES = [
  [0.14946, 0.14646, 0.39364, 1.58327, 2.51232],
  [0.14211, -0.30951, 0.40836, 1.74877, 0.73731],
  [0.13024, 0.03234, 0.62429, 1.93158, 2.19173],
  [0.09149, 0.42435, 0.6337, 2.1335, 6.12849],
  [0.08367, -0.11574, 0.92321, 2.35653, 2.42604],
  [0.06772, 0.73414, 0.86578, 2.60288, 4.41824],
  [0.07359, 0.36288, 1.33648, 2.87497, 3.99772],
  [0.06124, 1.1771, 1.21202, 3.17551, 3.45815],
  [0.06071, 1.53213, 1.37887, 3.50746, 1.08509],
  [0.0528, -1.68891, 1.86316, 3.87412, 3.91147],
  [0.01964, -0.18046, 3.06263, 4.2791, 2.09195],
  [0.01734, -0.64649, 3.68664, 4.72643, 1.93632],
  [0.01887, 0.48299, 4.54071, 5.22051, 4.40873],
  [0.01168, 4.12416, 3.74519, 5.76624, 1.79519],
  [0.01268, 4.61333, 4.99099, 6.36902, 2.05697],
  [0.01195, 3.16045, 7.66582, 7.03481, 6.25781],
];

// Drive time with a continuous phase clock, also shared with the GPU.
export function swell(x, z, clock, heading = 0, amplitude = 1) {
  const c = Math.cos(heading), s = Math.sin(heading);
  const u = c * x - s * z, v = s * x + c * z;
  let height = 0;
  for (const [a, kx, kz, omega, phase] of WAVES) {
    const p = kx * u + kz * v - omega * clock + phase;
    height += a * (Math.sin(p) - .16 * Math.cos(2 * p));
  }
  const fade = clamp((Math.hypot(x, z) - 38) / 82, 0, 1);
  return amplitude * height * (1 - fade * fade * (3 - 2 * fade));
}
