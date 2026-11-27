// CPU reference for the Glasswater (MIT) forward-projection pass.
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function projectLight({ x, z, height, normal, sun, depth }) {
  // Inputs are unit vectors. sun points from the surface toward the light.
  const cosine = dot(normal, sun);
  if (sun[1] <= .1 || cosine <= 0) return null;
  const eta = 1 / 1.333;
  const k = Math.sqrt(1 - eta * eta * (1 - cosine * cosine));
  const ray = sun.map((value, i) => -eta * value + (eta * cosine - k) * normal[i]);
  if (ray[1] >= 0) return null;
  const down = Math.max(.18, -ray[1]);
  const path = (bx, bz) => Math.max(.02, (height + depth(bx, bz)) / down);
  let distance = path(x, z);
  for (let i = 0; i < 3; i++) {
    distance = .28 * distance + .72 * path(x + ray[0] * distance, z + ray[2] * distance);
  }
  return {
    bed: [x + ray[0] * distance, z + ray[2] * distance],
    origin: [x, height, z],
    ray,
    distance,
    energy: cosine / sun[1] * Math.exp(-.15 * distance),
  };
}

export function focusing(source, projected) {
  const area = ([a, b, c]) => Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  return Math.min(5, area(source) / Math.max(1e-9, area(projected)));
}
