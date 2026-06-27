import test from "node:test";
import assert from "node:assert/strict";
import {
  rk4,
  trajectory,
  isFiniteState,
  lorenzDeriv,
  lorenzFixedPoints,
  ATTRACTORS,
  LORENZ,
} from "../src/attractors.js";

// Max-norm distance between two state vectors.
function maxErr(a, b) {
  let m = 0;
  for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i]));
  return m;
}

// --- Integrator accuracy: y' = y  =>  y(t) = e^t -------------------------------
// RK4 is globally 4th-order, so over a fixed interval its error must be tiny.
test("RK4 reproduces e^t (y'=y) to 4th-order accuracy", () => {
  const f = ([y]) => [y]; // dy/dt = y
  const dt = 0.01;
  const T = 1.0;
  const steps = Math.round(T / dt);
  let p = [1];
  for (let i = 0; i < steps; i++) p = rk4(f, p, dt);
  const exact = Math.exp(T); // e ≈ 2.718281828...
  const err = Math.abs(p[0] - exact);
  // RK4 global error here is ~1e-9; assert well under 1e-7.
  assert.ok(err < 1e-7, `error ${err} too large`);
});

// Second integrator witness: y' = -y => y(t) = e^{-t}, exercises a decaying mode.
test("RK4 reproduces e^{-t} (y'=-y) to tight tolerance", () => {
  const f = ([y]) => [-y];
  const dt = 0.01;
  const T = 2.0;
  const steps = Math.round(T / dt);
  let p = [1];
  for (let i = 0; i < steps; i++) p = rk4(f, p, dt);
  const err = Math.abs(p[0] - Math.exp(-T));
  assert.ok(err < 1e-7, `error ${err} too large`);
});

// --- 4th-order convergence: halving dt cuts global error ~16x -------------------
// Global error of a 4th-order method scales like dt^4, so dt -> dt/2 should
// shrink the error by a factor of 2^4 = 16.
test("halving the step size reduces RK4 global error by ~16x", () => {
  const f = ([y]) => [y];
  const T = 1.0;
  const integrate = (dt) => {
    const steps = Math.round(T / dt);
    let p = [1];
    for (let i = 0; i < steps; i++) p = rk4(f, p, dt);
    return Math.abs(p[0] - Math.exp(T));
  };
  const coarse = integrate(0.02);
  const fine = integrate(0.01);
  const ratio = coarse / fine;
  // Expect ~16; allow a generous band for floating-point and constant factors.
  assert.ok(ratio > 14 && ratio < 18, `convergence ratio ${ratio} not ~16`);
});

// --- Lorenz fixed points: RHS is exactly zero there ----------------------------
// C± = (±sqrt(b(r-1)), ±sqrt(b(r-1)), r-1) are equilibria, so f(C±) = 0.
test("Lorenz nonzero fixed points have zero derivative", () => {
  for (const fp of lorenzFixedPoints()) {
    const d = lorenzDeriv(fp);
    assert.ok(maxErr(d, [0, 0, 0]) < 1e-12, `f(${fp}) = ${d}, not 0`);
  }
});

test("Lorenz fixed points match the closed form ±sqrt(b(r-1)), r-1", () => {
  const c = Math.sqrt(LORENZ.beta * (LORENZ.rho - 1));
  const [cp, cm] = lorenzFixedPoints();
  assert.ok(maxErr(cp, [c, c, LORENZ.rho - 1]) < 1e-12);
  assert.ok(maxErr(cm, [-c, -c, LORENZ.rho - 1]) < 1e-12);
});

// --- Long Lorenz run: deterministic, finite, bounded ---------------------------
test("Lorenz integration is deterministic over a long run", () => {
  const a = ATTRACTORS.lorenz;
  const t1 = trajectory(a.deriv, a.p0, a.dt, 20000, 400);
  const t2 = trajectory(a.deriv, a.p0, a.dt, 20000, 400);
  assert.deepEqual(t1.at(-1), t2.at(-1)); // bit-for-bit identical
});

test("long Lorenz trajectory stays finite and bounded in the attractor region", () => {
  const a = ATTRACTORS.lorenz;
  const traj = trajectory(a.deriv, a.p0, a.dt, 50000, 400);
  let bound = 0;
  for (const p of traj) {
    assert.ok(isFiniteState(p), `non-finite state ${p}`);
    bound = Math.max(bound, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
  }
  // The classic Lorenz attractor lives roughly in |x|,|y| < 30, 0 < z < 55.
  // A loose box of 60 confirms it never escapes / blows up.
  assert.ok(bound < 60, `trajectory left the attractor region: max |coord| = ${bound}`);
  // And it must actually move (not a stuck fixed point or all-zeros).
  assert.ok(bound > 1, `trajectory collapsed: max |coord| = ${bound}`);
});

// --- Every catalogued system integrates cleanly --------------------------------
test("every catalogued attractor produces a finite trajectory", () => {
  for (const [key, a] of Object.entries(ATTRACTORS)) {
    const traj = trajectory(a.deriv, a.p0, a.dt, 5000, 200);
    for (const p of traj) {
      assert.ok(isFiniteState(p), `${key} produced non-finite state ${p}`);
    }
  }
});
