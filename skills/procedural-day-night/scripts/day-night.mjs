// Glasswater (MIT): art-directed directions and a soft horizon crossing.
const clamp01 = value => Math.max(0, Math.min(1, value));
const smooth = (a, b, value) => {
  const x = clamp01((value - a) / (b - a));
  return x * x * (3 - 2 * x);
};

function direction(x, y) {
  const z = -Math.sqrt(Math.max(.01, 1 - x * x - y * y));
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
}

export function dayNight(hour, lampsEnabled = true) {
  const a = (hour - 6) * Math.PI / 12, m = (hour - 20) * Math.PI / 12;
  const sun = direction(.32 * Math.cos(a), .965 * Math.sin(a));
  const moon = direction(-.46 * Math.cos(m), .43 * Math.sin(m));
  const daylight = smooth(-.14, .16, sun[1]);
  return { sun, moon, daylight, twilight: 1 - clamp01((sun[1] - .12) / .55),
    lamps: lampsEnabled ? 1 - daylight : 0 };
}

export function diskWeights(viewRay, { sun, moon, daylight }) {
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const clip = smooth(0, .002, viewRay[1]);
  return {
    sun: clip * smooth(-.03, .025, sun[1]) * smooth(.99965, .99992, dot(viewRay, sun)),
    moon: clip * smooth(-.025, .025, moon[1]) * smooth(.99972, .99986, dot(viewRay, moon)) * (1 - .88 * daylight),
  };
}
