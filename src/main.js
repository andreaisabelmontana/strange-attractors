import { ATTRACTORS, rk4 } from "./attractors.js";

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  W = window.innerWidth; H = window.innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

const state = {
  key: "lorenz",
  trail: 9000,     // number of points retained
  substeps: 6,     // integrations per frame (speed)
  autoRotate: true,
  colorMode: "depth",
  yaw: 0.5, pitch: -0.35,
  pts: [],         // ring buffer of [x,y,z]
  p: null,
  head: 0,
};

function load(key) {
  state.key = key;
  const a = ATTRACTORS[key];
  state.p = a.p0.slice();
  state.pts = [];
  state.head = 0;
  // warm up so we start on the attractor, not the transient
  for (let i = 0; i < 400; i++) state.p = rk4(a.deriv, state.p, a.dt);
}
load("lorenz");

function project(x, y, z) {
  const a = ATTRACTORS[state.key];
  // center & scale into view units
  let px = (x - a.center[0]) * a.scale;
  let py = (y - a.center[1]) * a.scale;
  let pz = (z - a.center[2]) * a.scale;
  // rotate yaw (around Y) then pitch (around X)
  const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
  let rx = px * cy - pz * sy;
  let rz = px * sy + pz * cy;
  const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  let ry = py * cp - rz * sp;
  let rz2 = py * sp + rz * cp;
  // perspective
  const dist = 1400;
  const f = dist / (dist + rz2 + 600);
  return [W / 2 + rx * f, H / 2 + ry * f, f, rz2];
}

function step() {
  const a = ATTRACTORS[state.key];
  for (let s = 0; s < state.substeps; s++) {
    state.p = rk4(a.deriv, state.p, a.dt);
    if (state.pts.length < state.trail) state.pts.push(state.p.slice());
    else { state.pts[state.head] = state.p.slice(); state.head = (state.head + 1) % state.trail; }
  }
  if (state.autoRotate) state.yaw += 0.0026;
}

function colorFor(i, n, depthF) {
  if (state.colorMode === "depth") {
    const l = 38 + Math.max(0, Math.min(1, (depthF - 0.6) / 0.6)) * 42;
    return `hsl(${190 + (1 - depthF) * 60}, 90%, ${l}%)`;
  }
  // age gradient
  const t = i / n;
  return `hsl(${(t * 300 + 180) % 360}, 88%, 62%)`;
}

function render() {
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";

  const n = state.pts.length;
  for (let i = 0; i < n; i++) {
    const idx = (state.head + i) % n; // oldest → newest when buffer full
    const pt = state.pts[idx];
    const [sx, sy, f] = project(pt[0], pt[1], pt[2]);
    if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
    ctx.fillStyle = colorFor(i, n, f);
    const r = Math.max(0.5, f * 1.4);
    ctx.fillRect(sx, sy, r, r);
  }
  ctx.globalCompositeOperation = "source-over";
}

let running = true;
function frame() {
  if (running) step();
  render();
  requestAnimationFrame(frame);
}

// ---- controls ----
const sel = document.getElementById("attractor");
for (const [key, a] of Object.entries(ATTRACTORS)) {
  const o = document.createElement("option");
  o.value = key; o.textContent = a.name;
  sel.appendChild(o);
}
sel.value = "lorenz";
sel.addEventListener("change", () => load(sel.value));

const ui = {
  trail: document.getElementById("trail"),
  speed: document.getElementById("speed"),
  rotate: document.getElementById("rotate"),
  color: document.getElementById("color"),
};
const out = (k) => document.querySelector(`[data-out="${k}"]`);
function sync() {
  state.trail = +ui.trail.value;
  state.substeps = +ui.speed.value;
  state.autoRotate = ui.rotate.checked;
  state.colorMode = ui.color.value;
  out("trail").textContent = (+ui.trail.value).toLocaleString();
  out("speed").textContent = ui.speed.value;
}
[ui.trail, ui.speed, ui.rotate, ui.color].forEach((el) => el.addEventListener("input", sync));
sync();

document.getElementById("collapse").addEventListener("click", () =>
  document.getElementById("panel").classList.toggle("hidden"));

// drag to orbit
let drag = null;
canvas.addEventListener("mousedown", (e) => (drag = { x: e.clientX, y: e.clientY }));
window.addEventListener("mouseup", () => (drag = null));
window.addEventListener("mousemove", (e) => {
  if (!drag) return;
  state.yaw += (e.clientX - drag.x) * 0.006;
  state.pitch += (e.clientY - drag.y) * 0.006;
  drag = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  if (drag) { state.yaw += (t.clientX - drag.x) * 0.006; state.pitch += (t.clientY - drag.y) * 0.006; }
  drag = { x: t.clientX, y: t.clientY };
  e.preventDefault();
}, { passive: false });
canvas.addEventListener("touchend", () => (drag = null));

frame();

window.__attr = { state, step, render, load, ATTRACTORS };
