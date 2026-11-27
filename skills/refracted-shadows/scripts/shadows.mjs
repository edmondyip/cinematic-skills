// Glasswater (MIT): soft closest approach along two finite path segments.
function visibility(origin, direction, length, sphere, softness) {
  const d = sphere.center.map((value, i) => value - origin[i]);
  const along = d.reduce((sum, value, i) => sum + value * direction[i], 0);
  const t = Math.max(0, Math.min(length, along));
  const radius = Math.hypot(...d.map((value, i) => value - direction[i] * t));
  const inner = Math.max(0, sphere.radius - softness);
  const f = Math.max(0, Math.min(1, (radius - inner) / (sphere.radius + softness - inner)));
  return f * f * (3 - 2 * f);
}

export function pathVisibility({ origin, sun, ray, distance, spheres, airDistance = 30 }) {
  const softness = .035 + .012 * Math.min(3, distance);
  let visible = 1;
  for (const sphere of spheres) {
    visible = Math.min(visible,
      visibility(origin, sun, airDistance, sphere, softness),
      visibility(origin, ray, distance, sphere, softness));
  }
  return visible;
}

export function resolveVisibility(openFlux, visibleFlux) {
  return openFlux <= 1e-3 ? 1 : Math.max(0, Math.min(1, visibleFlux / openFlux));
}
