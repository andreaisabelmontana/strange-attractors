# Strange Attractors

A 3D explorer for **chaotic strange attractors** — the eerily structured shapes
traced by simple deterministic systems that never quite repeat. Six classic
systems, integrated in real time with RK4 and orbitable in 3D.

**▶ Live:** https://andreaisabelmontana.github.io/strange-attractors/

> **Not an original idea.** This recreates the concept of an existing project — I
> didn't invent it. I rebuilt it from scratch, my own way, out of curiosity about
> how it actually works (and tried to make it a little better along the way).

## The systems

Each attractor is a set of three coupled ordinary differential equations
`f(x, y, z) = (ẋ, ẏ, ż)`. Tiny differences in starting conditions diverge
exponentially — the hallmark of chaos — yet the trajectory stays forever on a
fixed, fractal-dimensioned shape.

| System | Notes |
| --- | --- |
| **Lorenz** | σ=10, ρ=28, β=8/3 — the original butterfly |
| **Rössler** | a=b=0.2, c=5.7 — a single folded band |
| **Aizawa** | a sphere wrapped by a spiralling tube |
| **Thomas** | cyclically symmetric, sine-driven |
| **Halvorsen** | three-fold symmetric whorl |
| **Dadras** | fast multi-wing scroll |

## The integrator

The path is advanced with classic **4th-order Runge–Kutta (RK4)** rather than
Euler. RK4 evaluates the slope four times per step and combines them so the
local truncation error is O(dt⁵) and the **global error is O(dt⁴)** — far more
stable than Euler on these stiff, fast-curving systems, where Euler visibly
drifts off the attractor.

The integration core (`src/attractors.js`) is **framework-free** — pure math, no
canvas, no Three.js — so it can be tested in isolation:

```js
import { rk4, trajectory, lorenzDeriv, ATTRACTORS } from "./src/attractors.js";

// one RK4 step of any system in any dimension
const next = rk4(lorenzDeriv, [0.1, 0, 0], 0.005);

// a whole trajectory, discarding the transient
const path = trajectory(ATTRACTORS.lorenz.deriv, [0.1, 0, 0], 0.005, 20000, 400);
```

## Properties under test

The test suite (`test/attractors.test.js`, Node's built-in runner) checks the
math, not the pixels:

- **Integrator accuracy.** RK4 reproduces the analytic solution of `y' = y`
  (`eᵗ`) and `y' = -y` (`e⁻ᵗ`) to within `1e-7` over a fixed interval.
- **4th-order convergence.** Halving the step size shrinks the global error on
  the linear test by a factor of ≈16 (= 2⁴), the signature of a 4th-order method.
- **Lorenz fixed points.** The nonzero equilibria
  `C± = (±√(β(ρ−1)), ±√(β(ρ−1)), ρ−1)` have an exactly zero right-hand side
  (`f(C±) = 0` to `1e-12`), and match their closed form.
- **Determinism & boundedness.** A 50k-step Lorenz run is bit-for-bit
  reproducible, stays finite (no NaN/Inf), and never leaves the known attractor
  region (`|coord| < 60`) while still actually moving.
- **Whole catalogue.** Every one of the six systems integrates to a finite
  trajectory.

## Run it

```bash
# the demo: it's a static page, just open it (or serve the folder)
python -m http.server     # then visit http://localhost:8000

# the tests: Node 24+, no dependencies
node --test
```

Real output:

```
✔ RK4 reproduces e^t (y'=y) to 4th-order accuracy
✔ RK4 reproduces e^{-t} (y'=-y) to tight tolerance
✔ halving the step size reduces RK4 global error by ~16x
✔ Lorenz nonzero fixed points have zero derivative
✔ Lorenz fixed points match the closed form ±sqrt(b(r-1)), r-1
✔ Lorenz integration is deterministic over a long run
✔ long Lorenz trajectory stays finite and bounded in the attractor region
✔ every catalogued attractor produces a finite trajectory
ℹ tests 8
ℹ pass 8
ℹ fail 0
```

## Layout

```
index.html
styles.css
src/attractors.js   # system RHS definitions + RK4 step + trajectory generator (no UI)
src/main.js         # ring-buffer trajectory, 3D projection, render loop, controls
test/attractors.test.js
package.json
```

The demo is vanilla JS + Canvas 2D with a hand-rolled 3D projection (yaw/pitch
rotation + perspective). No build step, no dependencies.

## License

MIT — see [LICENSE](LICENSE).
