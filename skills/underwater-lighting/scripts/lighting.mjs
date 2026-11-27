// Glasswater (MIT): compute in linear RGB and tone-map after accumulation.
export function absorption(clarity) {
  const c = Math.max(0, Math.min(1, clarity));
  return [1.45, .52, .28].map((turbid, i) => turbid * (1 - c) + [.69, .10, .075][i] * c);
}

export function transmission(sigma, metres) {
  return sigma.map(channel => Math.exp(-channel * metres));
}

export function shadeBed({ point, normal, albedo, ambient, viewDistance, sigma, lamps }) {
  const light = [...ambient];
  for (const { center, radius, color, power = 4.8 } of lamps) {
    const delta = [center[0] - point[0], center[1] - radius * .87 - point[1], center[2] - point[2]];
    const d2 = delta[0] ** 2 + delta[1] ** 2 + delta[2] ** 2;
    if (delta[1] <= 0 || d2 >= 100) continue;
    const d = Math.sqrt(Math.max(.0025, d2));
    const incidence = Math.max(0, (delta[0] * normal[0] + delta[1] * normal[1] + delta[2] * normal[2]) / d);
    const emission = delta[1] / d;
    const irradiance = power * incidence * emission / (d2 + radius ** 2 + .12);
    const trans = transmission(sigma, d);
    for (let i = 0; i < 3; i++) light[i] += color[i] * trans[i] * irradiance;
  }
  const view = transmission(sigma, viewDistance);
  return light.map((value, i) => value * albedo[i] * view[i]);
}
