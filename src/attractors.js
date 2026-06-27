// The Lorenz system's three classic parameters and its right-hand side, shared
// by the catalogue below and exported so tests can reason about it analytically.
export const LORENZ = { sigma: 10, rho: 28, beta: 8 / 3 };

export function lorenzDeriv([x, y, z], { sigma, rho, beta } = LORENZ) {
  return [sigma * (y - x), x * (rho - z) - y, x * y - beta * z];
}

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
    deriv: (p) => lorenzDeriv(p),
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
// fast-curving systems, so the trajectory stays on the attractor. Works in any
// dimension: `deriv` and `p` are arrays of the same length.
export function rk4(deriv, p, dt) {
  const n = p.length;
  const k1 = deriv(p);
  const p2 = new Array(n);
  for (let i = 0; i < n; i++) p2[i] = p[i] + (k1[i] * dt) / 2;
  const k2 = deriv(p2);
  const p3 = new Array(n);
  for (let i = 0; i < n; i++) p3[i] = p[i] + (k2[i] * dt) / 2;
  const k3 = deriv(p3);
  const p4 = new Array(n);
  for (let i = 0; i < n; i++) p4[i] = p[i] + k3[i] * dt;
  const k4 = deriv(p4);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = p[i] + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }
  return out;
}

// Generate a trajectory by integrating `deriv` from `p0` for `steps` RK4 steps
// of size `dt`. With `discard` > 0 the first `discard` steps are integrated but
// not recorded — this skips the transient so the returned path sits on the
// attractor. Returns an array of state vectors (the initial recorded point
// first), length steps + 1.
export function trajectory(deriv, p0, dt, steps, discard = 0) {
  let p = p0.slice();
  for (let i = 0; i < discard; i++) p = rk4(deriv, p, dt);
  const out = [p.slice()];
  for (let i = 0; i < steps; i++) {
    p = rk4(deriv, p, dt);
    out.push(p.slice());
  }
  return out;
}

// True when every component of a state vector is a finite number (no NaN/Inf).
export function isFiniteState(p) {
  for (let i = 0; i < p.length; i++) {
    if (!Number.isFinite(p[i])) return false;
  }
  return true;
}

// The Lorenz system's two nonzero fixed points
// C± = (±sqrt(b(r-1)), ±sqrt(b(r-1)), r-1), exposed so both the demo and the
// tests can reason about the system analytically.
export function lorenzFixedPoints({ rho, beta } = LORENZ) {
  const c = Math.sqrt(beta * (rho - 1));
  return [
    [c, c, rho - 1],
    [-c, -c, rho - 1],
  ];
}
