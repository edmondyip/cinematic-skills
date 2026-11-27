// Adapted from Glasswater (MIT). World units are metres and seconds.
export function resolveFloatCollisions(items) {
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        let a = items[i],
          b = items[j],
          dx = b.x - a.x,
          dz = b.z - a.z,
          d = Math.hypot(dx, dz),
          target = a.r + b.r + 0.004;
        if (d >= target) continue;
        let nx = d > 1e-7 ? dx / d : 1,
          nz = d > 1e-7 ? dz / d : 0,
          ia = 1 / a.r ** 3,
          ib = 1 / b.r ** 3,
          sum = ia + ib,
          cor = (target - d) / sum;
        a.x -= nx * cor * ia;
        a.z -= nz * cor * ia;
        b.x += nx * cor * ib;
        b.z += nz * cor * ib;
        let vn = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
        if (vn < 0) {
          let impulse = (-1.22 * vn) / sum;
          a.vx -= impulse * ia * nx;
          a.vz -= impulse * ia * nz;
          b.vx += impulse * ib * nx;
          b.vz += impulse * ib * nz;
        }
      }
  }
}
export function stepFloats(floats, waterH, dt) {
  for (const b of floats) {
    let e = Math.max(0.2, b.r * 1.15),
      h =
        (waterH(b.x + e, b.z) +
          waterH(b.x - e, b.z) +
          waterH(b.x, b.z + e) +
          waterH(b.x, b.z - e)) *
        0.25,
      dx = (waterH(b.x + e, b.z) - waterH(b.x - e, b.z)) / (2 * e),
      dz = (waterH(b.x, b.z + e) - waterH(b.x, b.z - e)) / (2 * e);
    b.vx += (-dx * 3.2 - (b.x - b.x0) * 0.14 - b.vx * 0.85) * dt;
    b.vz += (-dz * 3.2 - (b.z - b.z0) * 0.14 - b.vz * 0.85) * dt;
    b.x += b.vx * dt;
    b.z += b.vz * dt;
    let target = h + b.r * 0.48;
    b.vy += ((target - b.y) * 32 - b.vy * 7) * dt;
    b.y += b.vy * dt;
  }
  resolveFloatCollisions(floats);
}
