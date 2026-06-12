# Strange Attractors

A 3D explorer for **chaotic strange attractors** — the eerily structured shapes traced by simple deterministic systems that never quite repeat. Six classic systems, integrated in real time and orbitable in 3D.

**▶ Live:** https://andreaisabelmontana.github.io/strange-attractors/

## Systems

Lorenz · Rössler · Aizawa · Thomas · Halvorsen · Dadras

Each is a set of three coupled ordinary differential equations. Tiny differences in starting conditions diverge exponentially — the hallmark of chaos — yet the trajectory stays forever on a fixed, fractal-dimensioned shape.

## Features

- **RK4 integration** (4th-order Runge–Kutta) keeps the path stable on these stiff, fast-curving systems where Euler would drift off
- **Drag to orbit** in 3D; optional auto-rotate
- Adjustable trajectory length (1.5k–30k points) and integration speed
- Colour by **depth** (perspective glow) or by **age** along the curve
- Additive blending for a luminous, long-exposure look

## Tech

Vanilla JS + Canvas 2D with a hand-rolled 3D projection (yaw/pitch rotation + perspective). No build step, no dependencies.

```
index.html
styles.css
src/attractors.js   # system definitions + RK4 integrator
src/main.js         # ring-buffer trajectory, projection, render loop, controls
```

## License

MIT — see [LICENSE](LICENSE).
