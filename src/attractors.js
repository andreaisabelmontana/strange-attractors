// A catalogue of strange attractors. Each entry gives the system's derivative
// f(p) = (dx, dy, dz), a sensible starting point, an integration step, and a
// view scale so the cloud roughly fills the screen.

export const ATTRACTORS = {
  lorenz: {
    name: "Lorenz",
    p0: [0.1, 0, 0],
    dt: 0.005,
    scale: 11,
    center: [0, 0, 25],
    deriv: ([x, y, z]) => {
      const s = 10, r = 28, b = 8 / 3;
      return [s * (y - x), x * (r - z) - y, x * y - b * z];
    },
  },
  rossler: {
    name: "Rössler",
    p0: [0.1, 0, 0],
    dt: 0.012,
    scale: 14,
    center: [0, 0, 6],
    deriv: ([x, y, z]) => {
      const a = 0.2, b = 0.2, c = 5.7;
      return [-y - z, x + a * y, b + z * (x - c)];
    },
  },
  aizawa: {
    name: "Aizawa",
    p0: [0.1, 0, 0],
    dt: 0.01,
    scale: 130,
    center: [0, 0, 0],
    deriv: ([x, y, z]) => {
      const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
      return [
        (z - b) * x - d * y,
        d * x + (z - b) * y,
        c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x,
      ];
    },
  },
  thomas: {
    name: "Thomas",
    p0: [1.1, 1.1, -0.01],
    dt: 0.02,
    scale: 38,
    center: [0, 0, 0],
    deriv: ([x, y, z]) => {
      const b = 0.208;
      return [Math.sin(y) - b * x, Math.sin(z) - b * y, Math.sin(x) - b * z];
    },
  },
  halvorsen: {
    name: "Halvorsen",
    p0: [-1.48, -1.51, 2.04],
    dt: 0.006,
    scale: 22,
    center: [-2, -2, -2],
    deriv: ([x, y, z]) => {
      const a = 1.4;
      return [
        -a * x - 4 * y - 4 * z - y * y,
        -a * y - 4 * z - 4 * x - z * z,
        -a * z - 4 * x - 4 * y - x * x,
      ];
    },
  },
  dadras: {
    name: "Dadras",
    p0: [1.1, 2.1, -2],
    dt: 0.01,
    scale: 22,
    center: [0, 0, 0],
    deriv: ([x, y, z]) => {
      const a = 3, b = 2.7, c = 1.7, d = 2, e = 9;
      return [y - a * x + b * y * z, c * y - x * z + z, d * x * y - e * z];
    },
  },
};

// Classic 4th-order Runge–Kutta — far more stable than Euler for these stiff,
// fast-curving systems, so the trajectory stays on the attractor.
export function rk4(deriv, p, dt) {
  const k1 = deriv(p);
  const p2 = [p[0] + k1[0] * dt / 2, p[1] + k1[1] * dt / 2, p[2] + k1[2] * dt / 2];
  const k2 = deriv(p2);
  const p3 = [p[0] + k2[0] * dt / 2, p[1] + k2[1] * dt / 2, p[2] + k2[2] * dt / 2];
  const k3 = deriv(p3);
  const p4 = [p[0] + k3[0] * dt, p[1] + k3[1] * dt, p[2] + k3[2] * dt];
  const k4 = deriv(p4);
  return [
    p[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    p[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    p[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}
