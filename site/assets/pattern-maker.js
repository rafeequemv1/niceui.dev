/* NiceUI Pattern Maker — seamless SVG background patterns. Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-pm]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const r2 = (v) => Math.round(v * 100) / 100;

  const DEFAULT = { type: "dots", size: 24, stroke: 1.5, rot: 0, fg: "#7dd3fc", fgA: 0.4, fg2: "#a78bfa", bg: "#020617", bgOn: true, mask: "radial", anim: false, speed: 0.5, scale: 1, px: 4, grain: 0.1, dither: false };
  let S = { ...DEFAULT };
  let tab = "css";

  // 8×8 Bayer threshold matrix (values 0..63), built recursively
  const BAYER = (() => {
    let m = [[0]];
    for (let n = 1; n < 8; n *= 2) {
      const k = [];
      for (let y = 0; y < 2 * n; y++) {
        k.push([]);
        for (let x = 0; x < 2 * n; x++) k[y].push(4 * m[y % n][x % n] + [[0, 2], [3, 1]][Math.floor(y / n)][Math.floor(x / n)]);
      }
      m = k;
    }
    return m;
  })();
  // small deterministic RNG so tiles are identical on every render
  const seeded = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ── tile generators: return { w, h, body } in user units ─ */
  const F = () => `fill="${S.fg}" fill-opacity="${r2(S.fgA)}"`;
  const K = (a = 1) => `fill="none" stroke="${S.fg}" stroke-opacity="${r2(S.fgA * a)}" stroke-width="${S.stroke}"`;
  const K2 = () => `fill="none" stroke="${S.fg2}" stroke-opacity="${r2(S.fgA)}" stroke-width="${S.stroke}"`;
  const GEN = {
    dots: (s) => ({ w: s, h: s, body: `<circle cx="${s / 2}" cy="${s / 2}" r="${r2(Math.max(0.4, S.stroke))}" ${F()}/>` }),
    grid: (s) => ({ w: s, h: s, body: `<path d="M${s} 0H0V${s}" ${K()}/>` }),
    graph: (s) => {
      const W = s * 5;
      let d = "";
      for (let i = 1; i < 5; i++) d += `M${i * s} 0V${W}M0 ${i * s}H${W}`;
      return { w: W, h: W, body: `<path d="${d}" fill="none" stroke="${S.fg}" stroke-opacity="${r2(S.fgA * 0.45)}" stroke-width="${r2(Math.max(0.5, S.stroke * 0.5))}"/><path d="M${W} 0H0V${W}" ${K()}/>` };
    },
    diagonal: (s) => ({ w: s, h: s, body: `<path d="M-1 1L1 -1M0 ${s}L${s} 0M${s - 1} ${s + 1}L${s + 1} ${s - 1}" ${K()}/>` }),
    crosshatch: (s) => ({ w: s, h: s, body: `<path d="M-1 1L1 -1M0 ${s}L${s} 0M${s - 1} ${s + 1}L${s + 1} ${s - 1}" ${K()}/><path d="M-1 ${s - 1}L1 ${s + 1}M0 0L${s} ${s}M${s - 1} -1L${s + 1} 1" ${K2()}/>` }),
    checker: (s) => ({ w: s * 2, h: s * 2, body: `<rect width="${s}" height="${s}" ${F()}/><rect x="${s}" y="${s}" width="${s}" height="${s}" fill="${S.fg2}" fill-opacity="${r2(S.fgA)}"/>` }),
    hexagons: (s) => {
      const r = s / 2;
      const W = r2(Math.sqrt(3) * r);
      return { w: W, h: 3 * r, body: `<path d="M${W / 2} 0L${W} ${r / 2}L${W} ${1.5 * r}L${W / 2} ${2 * r}L0 ${1.5 * r}L0 ${r / 2}ZM${W / 2} ${2 * r}V${3 * r}" ${K()}/>` };
    },
    triangles: (s) => {
      const h = r2(s * 0.866);
      return { w: s, h, body: `<path d="M0 ${h}L${s / 2} 0L${s} ${h}M0 ${h}H${s}M0 0H${s}" ${K()}/>` };
    },
    waves: (s) => ({ w: s * 2, h: s, body: `<path d="M0 ${s / 2}Q${s / 2} 0 ${s} ${s / 2}T${s * 2} ${s / 2}" ${K()}/>` }),
    zigzag: (s) => ({ w: s, h: s / 2, body: `<path d="M0 ${s / 2 - S.stroke}L${s / 2} ${S.stroke}L${s} ${s / 2 - S.stroke}" ${K()} stroke-linejoin="round"/>` }),
    plus: (s) => {
      const k = r2(s * 0.18);
      return { w: s, h: s, body: `<path d="M${s / 2} ${s / 2 - k}V${s / 2 + k}M${s / 2 - k} ${s / 2}H${s / 2 + k}" ${K()} stroke-linecap="round"/>` };
    },
    rings: (s) => ({ w: s, h: s, body: `<circle cx="${s / 2}" cy="${s / 2}" r="${r2(s * 0.34)}" ${K()}/><circle cx="${s / 2}" cy="${s / 2}" r="${r2(s * 0.14)}" ${K2()}/>` }),
    cubes: (s) => {
      const r = s / 2;
      const W = r2(Math.sqrt(3) * r);
      const cube = (x, y) =>
        `<path d="M${x + W / 2} ${y}L${x + W} ${y + r / 2}L${x + W / 2} ${y + r}L${x} ${y + r / 2}Z" ${F()}/>` +
        `<path d="M${x} ${y + r / 2}L${x + W / 2} ${y + r}L${x + W / 2} ${y + 2 * r}L${x} ${y + 1.5 * r}Z" fill="${S.fg2}" fill-opacity="${r2(S.fgA)}"/>` +
        `<path d="M${x + W / 2} ${y + r}L${x + W} ${y + r / 2}L${x + W} ${y + 1.5 * r}L${x + W / 2} ${y + 2 * r}Z" fill="${S.fg}" fill-opacity="${r2(S.fgA * 0.45)}"/>`;
      return { w: W, h: 3 * r, body: cube(0, 0) + cube(-W / 2, 1.5 * r) + cube(W / 2, 1.5 * r) + cube(-W / 2, -1.5 * r) + cube(W / 2, -1.5 * r) };
    },
    topo: (s) => {
      // wavy contour lines: periodic in x (one wavelength per tile) and in y (phases repeat every 5 lines)
      const W = s * 6;
      const gap = s * 0.9;
      const H = r2(gap * 5);
      let d = "";
      for (let i = -1; i <= 5; i++) {
        const ph = ((i % 5) + 5) % 5;
        const y0 = i * gap;
        let line = "";
        for (let x = 0; x <= W; x += W / 48) {
          const t = (x / W) * Math.PI * 2;
          const y = y0 + Math.sin(t + ph * 1.3) * gap * 0.35 + Math.sin(2 * t + ph * 0.7) * gap * 0.12;
          line += (x === 0 ? "M" : "L") + r2(x) + " " + r2(y);
        }
        d += line;
      }
      return { w: W, h: H, body: `<path d="${d}" ${K()} stroke-linejoin="round"/>` };
    },
    noise: (s) => {
      const T = Math.max(96, s * 4);
      const freq = r2(clamp(1.4 - s / 100, 0.3, 1.3));
      const [r, g, b] = hex2rgb(S.fg).map((v) => r2(v / 255));
      return {
        w: T,
        h: T,
        body: `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${r2(S.fgA * 1.6)} 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/>`,
      };
    },
    /* ── dither & print textures ── */
    bayer: (s) => {
      // ordered (Bayer 8×8) dither of soft round blobs: the classic 1-bit look
      const p = Math.max(1, Math.round(s / 8));
      const N = 32;
      let d = "";
      for (let y = 0; y < N; y++) {
        let run = -1;
        for (let x = 0; x <= N; x++) {
          const v = 0.5 - 0.25 * (Math.cos((2 * Math.PI * (x + 0.5)) / N) + Math.cos((2 * Math.PI * (y + 0.5)) / N));
          const on = x < N && v > (BAYER[y % 8][x % 8] + 0.5) / 64;
          if (on && run < 0) run = x;
          if (!on && run >= 0) {
            d += `M${run * p} ${y * p}h${(x - run) * p}v${p}h${-(x - run) * p}z`;
            run = -1;
          }
        }
      }
      return { w: N * p, h: N * p, body: `<path d="${d}" ${F()} shape-rendering="crispEdges"/>` };
    },
    shade: (s) => {
      // a flat Bayer shade; Stroke / dot sets the density
      const p = Math.max(1, Math.round(s / 8));
      const lvl = clamp(S.stroke / 8, 0.06, 0.94);
      let d = "";
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((BAYER[y][x] + 0.5) / 64 < lvl) d += `M${x * p} ${y * p}h${p}v${p}h${-p}z`;
      return { w: 8 * p, h: 8 * p, body: `<path d="${d}" ${F()} shape-rendering="crispEdges"/>` };
    },
    halftone: (s) => {
      // print-style dots that swell and shrink along a diagonal wave
      const N = 8;
      let b = "";
      for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
          const v = 0.5 + 0.5 * Math.cos((2 * Math.PI * (i + j)) / N);
          const r = r2(s * 0.47 * Math.sqrt(0.06 + 0.94 * v));
          b += `<circle cx="${i * s + s / 2}" cy="${j * s + s / 2}" r="${r}"/>`;
        }
      return { w: N * s, h: N * s, body: `<g ${F()}>${b}</g>` };
    },
    stipple: (s) => {
      // blue-noise-like dots (dart throwing on a torus, so the tile wraps cleanly)
      const T = s * 5;
      const min = s * 0.5;
      const rnd = seeded(7);
      const pts = [];
      for (let k = 0; k < 900 && pts.length < 140; k++) {
        const x = rnd() * T,
          y = rnd() * T;
        if (pts.every(([a, c]) => Math.hypot(Math.min(Math.abs(a - x), T - Math.abs(a - x)), Math.min(Math.abs(c - y), T - Math.abs(c - y))) >= min)) pts.push([x, y, rnd()]);
      }
      const R = Math.max(0.4, S.stroke * 0.8);
      const dot = (x, y, k) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(R * (0.6 + 0.6 * k))}"/>`;
      let b = "";
      for (const [x, y, k] of pts) {
        b += dot(x, y, k);
        // copies across the edges so dots near the seam are not clipped
        const r = R * 1.2;
        if (x < r) b += dot(x + T, y, k);
        if (x > T - r) b += dot(x - T, y, k);
        if (y < r) b += dot(x, y + T, k);
        if (y > T - r) b += dot(x, y - T, k);
      }
      return { w: T, h: T, body: `<g ${F()}>${b}</g>` };
    },
    engrave: (s) => {
      // engraving lines whose weight swells like a banknote
      const g = Math.max(3, r2(s / 3));
      const W = s * 6;
      const rows = 6;
      let d = "";
      for (let i = 0; i < rows + 1; i++) {
        const y0 = i * g;
        const top = [],
          bot = [];
        for (let k = 0; k <= 36; k++) {
          const x = (k / 36) * W;
          const v = 0.5 + 0.5 * Math.sin((2 * Math.PI * x) / W + (i % rows) * (Math.PI / 3));
          const th = Math.min(g * 0.9, S.stroke * (0.25 + 1.5 * v));
          top.push(`${r2(x)} ${r2(y0 - th / 2)}`);
          bot.unshift(`${r2(x)} ${r2(y0 + th / 2)}`);
        }
        d += `M${top.join("L")}L${bot.join("L")}Z`;
      }
      return { w: W, h: r2(g * rows), body: `<path d="${d}" ${F()}/>` };
    },
    pixels: (s) => {
      // LED dot matrix: dim cells with a scatter of lit ones in the second colour
      const N = 8;
      const q = r2(clamp(S.stroke * 2, 1, s * 0.8));
      const o = r2((s - q) / 2);
      const rnd = seeded(11);
      let dim = "",
        lit = "";
      for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
          const cell = `<rect x="${r2(i * s + o)}" y="${r2(j * s + o)}" width="${q}" height="${q}" rx="${r2(q * 0.2)}"/>`;
          if (rnd() < 0.22) lit += cell;
          else dim += cell;
        }
      return { w: N * s, h: N * s, body: `<g fill="${S.fg}" fill-opacity="${r2(S.fgA * 0.45)}">${dim}</g><g fill="${S.fg2}" fill-opacity="${r2(Math.min(1, S.fgA * 1.8))}">${lit}</g>` };
    },
  };
  function hex2rgb(h) {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  const TWO = new Set(["crosshatch", "checker", "rings", "cubes", "pixels"]);

  /* ── SVG + CSS builders ─────────────────────────────────── */
  const tile = () => GEN[S.type](S.size);
  // tile SVG (repeats seamlessly). With rotation, a full-size SVG with a rotated <pattern> instead.
  function svgTile(pretty = false) {
    const t = tile();
    const nl = pretty ? "\n  " : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}">${nl}${t.body}${pretty ? "\n" : ""}</svg>`;
  }
  function svgRotated(w, h) {
    const t = tile();
    return `<svg xmlns="http://www.w3.org/2000/svg"${w ? ` width="${w}" height="${h}"` : ""}><defs><pattern id="p" width="${t.w}" height="${t.h}" patternUnits="userSpaceOnUse" patternTransform="rotate(${S.rot})">${t.body}</pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`;
  }
  const rotated = () => S.rot % 180 !== 0;
  const enc = (svg) => "data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
  const imageUrl = () => `url("${enc(rotated() ? svgRotated() : svgTile())}")`;
  const sizeVal = () => (rotated() ? "100% 100%" : `${tile().w}px ${tile().h}px`);
  const MASKS = {
    none: "",
    radial: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
    top: "linear-gradient(to top, #000 35%, transparent)",
    bottom: "linear-gradient(to bottom, #000 35%, transparent)",
    sides: "linear-gradient(to right, transparent, #000 25%, #000 75%, transparent)",
  };
  const anim = () => S.anim && !rotated();
  const keyframes = () => `@keyframes pattern-pan {\n  to { background-position: ${tile().w * 4}px ${tile().h * 4}px; }\n}`;

  /* ── WebGL shader backgrounds ───────────────────────────── */
  // Each shader is a scalar field (0..1) mapped onto bg → colour A → colour B,
  // with optional paper grain and Bayer ordered dithering on top.
  const isSh = () => S.type.startsWith("sh-");
  const SH_HEAD = `precision highp float;
uniform vec2 uR;
uniform float uT, uScale, uPx, uDither, uGrain;
uniform vec3 uA, uB, uC;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
vec2 toP(vec2 fc) { return (fc - 0.5 * uR) / min(uR.x, uR.y) * uScale * 2.0; }
float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer8(vec2 a) { return bayer2(a * 0.25) * 0.0625 + bayer2(a * 0.5) * 0.25 + bayer2(a); }
`;
  const SH_FIELD = {
    "sh-grain": `float field(vec2 fc) {
  vec2 p = toP(fc) * 0.6;
  float t = uT * 0.15;
  float f = fbm(p + vec2(t, -t * 0.7));
  f = fbm(p * 1.2 + f * 1.8 + vec2(-t * 0.6, t * 0.5));
  return smoothstep(0.2, 0.85, f);
}`,
    "sh-dither": `float field(vec2 fc) {
  vec2 p = toP(fc) * 0.7;
  float t = uT * 0.12;
  float f = fbm(p * 1.3 + vec2(t, t * 0.4) + fbm(p * 0.7 - t) * 1.4);
  return smoothstep(0.22, 0.82, f);
}`,
    "sh-halftone": `float field(vec2 fc) {
  float cell = uPx * 3.0;
  mat2 R = mat2(0.8253, -0.5646, 0.5646, 0.8253);
  vec2 q = R * fc;
  vec2 id = floor(q / cell);
  vec2 g = q / cell - id - 0.5;
  vec2 p = toP((id + 0.5) * cell * R) * 0.7;
  float t = uT * 0.15;
  float v = smoothstep(0.25, 0.8, fbm(p + vec2(t, -t * 0.6) + fbm(p * 0.5 + t * 0.3)));
  float r = sqrt(v) * 0.62;
  float aa = 1.2 / cell;
  return (1.0 - smoothstep(r - aa, r + aa, length(g))) * (0.55 + 0.45 * v);
}`,
    "sh-dots": `float field(vec2 fc) {
  float cell = uPx * 3.0;
  vec2 id = floor(fc / cell);
  vec2 g = fc / cell - id - 0.5;
  vec2 p = toP((id + 0.5) * cell);
  float w = 0.5 + 0.5 * sin(length(p) * 3.0 - uT * 1.6 + fbm(p * 0.6 + uT * 0.1) * 3.0);
  float r = 0.08 + 0.34 * w;
  float aa = 1.2 / cell;
  return (1.0 - smoothstep(r - aa, r + aa, length(g))) * (0.3 + 0.7 * w);
}`,
    "sh-warp": `float field(vec2 fc) {
  vec2 p = toP(fc) * 0.5;
  float t = uT * 0.12;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.8), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.6));
  return smoothstep(0.22, 0.72, fbm(p + 3.0 * r));
}`,
    "sh-blobs": `float field(vec2 fc) {
  vec2 p = toP(fc) / uScale;
  float s = 0.0;
  for (int i = 0; i < 6; i++) {
    float k = float(i);
    vec2 c = vec2(sin(uT * (0.23 + k * 0.11) + k * 2.4), sin(uT * (0.19 + k * 0.09) + k * 4.1 + 1.3)) * vec2(1.0, 0.6);
    vec2 d = p - c;
    s += 0.022 / (uScale * uScale) / dot(d, d);
  }
  return smoothstep(0.75, 1.25, s) * 0.8 + clamp(s * 0.15, 0.0, 0.2);
}`,
    "sh-cells": `vec2 hash2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
float field(vec2 fc) {
  vec2 p = toP(fc) * 1.2;
  vec2 i = floor(p), f = fract(p);
  float F1 = 8.0, F2 = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = 0.5 + 0.4 * sin(uT * 0.5 + 6.2831 * hash2(i + g));
    float d = length(g + o - f);
    if (d < F1) { F2 = F1; F1 = d; } else if (d < F2) { F2 = d; }
  }
  float e = 1.0 - smoothstep(0.02, 0.08, F2 - F1);
  return clamp(0.1 + (1.0 - F1) * 0.45 + e * 0.65, 0.0, 1.0);
}`,
    "sh-contours": `float field(vec2 fc) {
  vec2 p = toP(fc) * 0.6;
  float f = fbm(p + vec2(uT * 0.05, -uT * 0.03)) * 9.0;
  float l = abs(fract(f) - 0.5);
  float line = 1.0 - smoothstep(0.035, 0.09, l);
  return line * (0.55 + 0.45 * smoothstep(3.0, 6.0, f));
}`,
  };
  const SH_MAIN = `
void main() {
  vec2 fc = gl_FragCoord.xy;
  if (uDither > 0.5) fc = (floor(fc / uPx) + 0.5) * uPx;
  float v = field(fc) + (hash(floor(fc)) - 0.5) * uGrain;
  if (uDither > 0.5) v = floor(clamp(v, 0.0, 1.0) * 3.0 + bayer8(gl_FragCoord.xy / uPx)) / 3.0;
  v = clamp(v, 0.0, 1.0);
  gl_FragColor = vec4(mix(mix(uA, uB, clamp(v / 0.6, 0.0, 1.0)), uC, clamp((v - 0.6) / 0.4, 0.0, 1.0)), 1.0);
}`;
  const shFrag = (type) => SH_HEAD + SH_FIELD[type] + SH_MAIN;
  const SH_VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  // one GL context per canvas; programs compiled lazily per shader type
  function glFor(canvas) {
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    if (!gl) return null;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const progs = {};
    const prog = (type) => {
      if (progs[type]) return progs[type];
      const mk = (t, src) => {
        const s = gl.createShader(t);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(type, gl.getShaderInfoLog(s));
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, mk(gl.VERTEX_SHADER, SH_VERT));
      gl.attachShader(p, mk(gl.FRAGMENT_SHADER, shFrag(type)));
      gl.linkProgram(p);
      const u = {};
      for (const n of ["uR", "uT", "uScale", "uPx", "uDither", "uGrain", "uA", "uB", "uC"]) u[n] = gl.getUniformLocation(p, n);
      return (progs[type] = { p, u, a: gl.getAttribLocation(p, "a") });
    };
    return {
      gl,
      draw(type, st, w, h, t, dpr) {
        const { p, u, a } = prog(type);
        gl.useProgram(p);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        gl.viewport(0, 0, w, h);
        gl.uniform2f(u.uR, w, h);
        gl.uniform1f(u.uT, t);
        gl.uniform1f(u.uScale, st.scale);
        gl.uniform1f(u.uPx, st.px * dpr);
        gl.uniform1f(u.uDither, st.dither ? 1 : 0);
        gl.uniform1f(u.uGrain, st.grain);
        gl.uniform3fv(u.uA, hex2rgb(st.bg).map((v) => v / 255));
        gl.uniform3fv(u.uB, hex2rgb(st.fg).map((v) => v / 255));
        gl.uniform3fv(u.uC, hex2rgb(st.fg2).map((v) => v / 255));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    };
  }
  const canvas = $("[data-pm-canvas]");
  let glc;
  let playing = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let clock = 7;
  let lastT = performance.now();
  let dirty = true;
  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    if (isSh()) {
      if (glc === undefined) glc = glFor(canvas);
      if (glc) {
        if (playing) clock += dt * S.speed * 2;
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(1.5, devicePixelRatio || 1);
        const w = Math.max(2, Math.round(r.width * dpr)),
          h = Math.max(2, Math.round(r.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          dirty = true;
        }
        if (playing || dirty) glc.draw(S.type, S, w, h, clock, dpr);
        dirty = false;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // swatch thumbnails for the shader types, drawn once per colour change on a shared offscreen canvas
  let thumbGl;
  function shaderThumb(type, st) {
    if (thumbGl === undefined) {
      const c = document.createElement("canvas");
      c.width = 172;
      c.height = 88;
      thumbGl = glFor(c);
    }
    if (!thumbGl) return "";
    thumbGl.draw(type, { ...st, scale: 1, px: 2.5 }, 172, 88, 7, 1);
    return `url("${thumbGl.gl.canvas.toDataURL("image/png")}")`;
  }

  /* ── preview ────────────────────────────────────────────── */
  const stage = $("[data-pm-stage]");
  const layer = $("[data-pm-layer]");
  let kfEl = null;
  function renderPreview() {
    stage.style.backgroundColor = S.bgOn ? S.bg : "transparent";
    stage.classList.toggle("pm-transparent", !S.bgOn);
    const [lr, lg, lb] = hex2rgb(S.bg);
    stage.classList.toggle("pm-light", S.bgOn && 0.2126 * lr + 0.7152 * lg + 0.0722 * lb > 150);
    const m = MASKS[S.mask];
    const sh = isSh();
    layer.hidden = sh;
    canvas.hidden = !sh;
    if (sh) {
      stage.style.backgroundColor = S.bg;
      stage.classList.remove("pm-transparent");
      canvas.style.maskImage = m || "none";
      canvas.style.webkitMaskImage = m || "none";
      dirty = true;
      return;
    }
    layer.style.backgroundImage = imageUrl();
    layer.style.backgroundSize = sizeVal();
    layer.style.backgroundRepeat = rotated() ? "no-repeat" : "repeat";
    layer.style.maskImage = m || "none";
    layer.style.webkitMaskImage = m || "none";
    if (!kfEl) {
      kfEl = document.createElement("style");
      document.head.appendChild(kfEl);
    }
    kfEl.textContent = keyframes();
    layer.style.animation = anim() ? "pattern-pan 24s linear infinite" : "none";
  }
  function renderSwatches() {
    const keep = S;
    const SW = { graph: 10, topo: 10, bayer: 8, shade: 12, halftone: 7, stipple: 9, pixels: 8, engrave: 12 };
    $$("[data-pm-sw]").forEach((el) => {
      const ty = el.dataset.pmSw;
      if (ty.startsWith("sh-")) {
        el.style.backgroundImage = shaderThumb(ty, { ...keep, bg: keep.bg, dither: keep.dither || ty === "sh-dither" });
        el.style.backgroundSize = "cover";
        return;
      }
      S = { ...keep, type: ty, rot: 0, size: SW[ty] || 14, stroke: ty === "shade" ? keep.stroke : Math.min(keep.stroke, 2), fgA: Math.max(0.45, keep.fgA) };
      el.style.backgroundColor = keep.bgOn ? keep.bg : "#000";
      el.style.backgroundImage = `url("${enc(svgTile())}")`;
      el.style.backgroundSize = `${tile().w}px ${tile().h}px`;
    });
    S = keep;
  }

  /* ── export ─────────────────────────────────────────────── */
  const tw = (v) => v.replace(/\s*,\s*/g, ",").replace(/ /g, "_");
  const SH_NAMES = { "sh-grain": "Grain gradient", "sh-dither": "Dither flow", "sh-halftone": "Halftone wave", "sh-dots": "Dot ripple", "sh-warp": "Silk warp", "sh-blobs": "Metaballs", "sh-cells": "Voronoi", "sh-contours": "Contours" };
  const n3 = (h) => hex2rgb(h).map((v) => +(v / 255).toFixed(3));
  // the WebGL setup shared by the React and HTML exports
  function shSetup(ts, ind) {
    const nn = ts ? "!" : "";
    const lines = [
      `const gl = canvas.getContext('webgl');`,
      `if (!gl) return;`,
      `const make = (type${ts ? ": number" : ""}, src${ts ? ": string" : ""}) => { const s = gl.createShader(type)${nn}; gl.shaderSource(s, src); gl.compileShader(s); return s; };`,
      `const prog = gl.createProgram()${nn};`,
      `gl.attachShader(prog, make(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));`,
      `gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG));`,
      `gl.linkProgram(prog);`,
      `gl.useProgram(prog);`,
      `gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());`,
      `gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);`,
      `const loc = gl.getAttribLocation(prog, 'a');`,
      `gl.enableVertexAttribArray(loc);`,
      `gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);`,
      `const u = (n${ts ? ": string" : ""}) => gl.getUniformLocation(prog, n);`,
      `gl.uniform3fv(u('uA'), SETTINGS.colors[0]);`,
      `gl.uniform3fv(u('uB'), SETTINGS.colors[1]);`,
      `gl.uniform3fv(u('uC'), SETTINGS.colors[2]);`,
      `gl.uniform1f(u('uScale'), SETTINGS.scale);`,
      `gl.uniform1f(u('uDither'), SETTINGS.dither ? 1 : 0);`,
      `gl.uniform1f(u('uGrain'), SETTINGS.grain);`,
      `const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;`,
      `let t = 7;`,
      `let last = performance.now();`,
      `let raf = 0;`,
      `const draw = () => {`,
      `  const dpr = Math.min(1.5, window.devicePixelRatio || 1);`,
      `  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));`,
      `  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));`,
      `  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }`,
      `  gl.viewport(0, 0, w, h);`,
      `  gl.uniform2f(u('uR'), w, h);`,
      `  gl.uniform1f(u('uPx'), SETTINGS.px * dpr);`,
      `  gl.uniform1f(u('uT'), t);`,
      `  gl.drawArrays(gl.TRIANGLES, 0, 3);`,
      `};`,
      `const frame = (now${ts ? ": number" : ""}) => {`,
      `  t += (Math.min(50, now - last) / 1000) * SETTINGS.speed * 2;`,
      `  last = now;`,
      `  draw();`,
      `  raf = requestAnimationFrame(frame);`,
      `};`,
      `if (still) draw();`,
      `else raf = requestAnimationFrame(frame);`,
      `const ro = new ResizeObserver(() => { if (still) draw(); });`,
      `ro.observe(canvas);`,
    ];
    return lines.map((l) => ind + l).join("\n");
  }
  function shaderCode() {
    const name = SH_NAMES[S.type];
    const m = MASKS[S.mask];
    const settings = `{ speed: ${r2(S.speed)}, scale: ${r2(S.scale)}, px: ${S.px}, grain: ${r2(S.grain)}, dither: ${S.dither}, colors: [${[S.bg, S.fg, S.fg2].map((c) => JSON.stringify(n3(c))).join(", ")}] }`;
    const frag = shFrag(S.type);
    if (tab === "react")
      return `'use client';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

// ${name} shader background made with NiceUI Pattern Maker. Raw WebGL, no dependencies.
const SETTINGS = ${settings};
const FRAG = \`${frag}\`;

export function ShaderBackground({ className = '', style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
${shSetup(true, "    ")}
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return (
    <div className={className} style={{ position: 'relative', backgroundColor: '${S.bg}', ...style }}>
      <canvas
        ref={ref}
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none'${m ? `, WebkitMaskImage: '${m}', maskImage: '${m}'` : ""} }}
      />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}
`;
    return `<!-- ${name} shader background made with NiceUI Pattern Maker. Raw WebGL, no dependencies. -->
<div style="position: relative; min-height: 100vh; background-color: ${S.bg};">
  <canvas id="shader-bg" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none;${m ? ` -webkit-mask-image: ${m}; mask-image: ${m};` : ""}"></canvas>
  <div style="position: relative;"><!-- your content --></div>
</div>
<script>
(() => {
  const SETTINGS = ${settings};
  const FRAG = \`${frag}\`;
  const canvas = document.getElementById('shader-bg');
${shSetup(false, "  ")}
})();
</script>`;
  }
  const TABS_SH = ["react", "html"];
  const fixTab = () => {
    if (isSh() && !TABS_SH.includes(tab)) tab = "react";
    if (!isSh() && tab === "html") tab = "css";
  };
  function code() {
    fixTab();
    if (isSh()) return shaderCode();
    const img = imageUrl();
    const size = sizeVal();
    const rep = rotated() ? "no-repeat" : "repeat";
    const m = MASKS[S.mask];
    const a = anim();
    if (tab === "css") {
      const layerRules = `  background-image: ${img};\n  background-size: ${size};\n  background-repeat: ${rep};${m ? `\n  -webkit-mask-image: ${m};\n  mask-image: ${m};` : ""}${a ? "\n  animation: pattern-pan 24s linear infinite;" : ""}`;
      const head = `/* Made with NiceUI Pattern Maker. No dependencies. */\n`;
      const kf = a ? `\n\n${keyframes()}` : "";
      if (!m) return `${head}.pattern {\n${S.bgOn ? `  background-color: ${S.bg};\n` : ""}${layerRules}\n}${kf}`;
      return `${head}.pattern {\n  position: relative;${S.bgOn ? `\n  background-color: ${S.bg};` : ""}\n}\n\n/* The pattern layer, faded with a mask */\n.pattern::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n${layerRules}\n}${kf}`;
    }
    if (tab === "tailwind") {
      const url = `bg-[url(${enc(rotated() ? svgRotated() : svgTile())})]`;
      const sz = `bg-[length:${tw(size)}]`;
      const repC = rotated() ? "bg-no-repeat" : "bg-repeat";
      const anC = a ? " animate-[pattern-pan_24s_linear_infinite]" : "";
      const kfNote = a ? `\n<!-- Add the keyframes to your CSS:\n${keyframes()}\n-->` : "";
      if (!m) return `<div class="${S.bgOn ? `bg-[${S.bg}] ` : ""}${url} ${sz} ${repC}${anC}"></div>${kfNote}`;
      return `<div class="relative ${S.bgOn ? `bg-[${S.bg}]` : ""}">\n  <div aria-hidden="true" class="pointer-events-none absolute inset-0 ${url} ${sz} ${repC} [mask-image:${tw(m)}]${anC}"></div>\n  <!-- your content -->\n</div>${kfNote}`;
    }
    if (tab === "svg") return rotated() ? svgRotated(1920, 1080).replace("><defs>", ">\n  <defs>").replace("</defs>", "</defs>\n  ").replace("</svg>", "\n</svg>") : svgTile(true);
    // react
    return `// Made with NiceUI Pattern Maker. No dependencies.
import type { CSSProperties, ReactNode } from 'react';

const PATTERN = \`${img}\`;${a ? `\nconst KEYFRAMES = \`${keyframes().replace(/\n/g, " ")}\`;` : ""}

export function Pattern({ className = '', style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={className} style={{ position: 'relative', ${S.bgOn ? `backgroundColor: '${S.bg}', ` : ""}...style }}>${a ? "\n      <style>{KEYFRAMES}</style>" : ""}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: PATTERN,
          backgroundSize: '${size}',
          backgroundRepeat: '${rep}',${m ? `\n          WebkitMaskImage: '${m}',\n          maskImage: '${m}',` : ""}${a ? "\n          animation: 'pattern-pan 24s linear infinite'," : ""}
        }}
      />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}
`;
  }
  const out = $("[data-pm-code]");
  function renderExport() {
    fixTab();
    $$("[data-pm-tab]").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.pmTab === tab));
      b.hidden = isSh() ? !TABS_SH.includes(b.dataset.pmTab) : b.dataset.pmTab === "html";
    });
    out.textContent = code();
  }
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1600);
  };
  async function copyCode() {
    const text = code();
    try {
      await navigator.clipboard.writeText(text);
      flash(`Copied ${{ css: "CSS", tailwind: "Tailwind", svg: "SVG", react: "React", html: "HTML" }[tab]} · ${text.split("\n").length} lines`);
    } catch {
      flash("Copy failed — select the code and copy it");
    }
  }
  const download = (name, href) => {
    const a = document.createElement("a");
    a.download = name;
    a.href = href;
    a.click();
  };
  function downloadSvg() {
    const svg = rotated() ? svgRotated(1920, 1080) : svgTile(true);
    download(`pattern-${S.type}.svg`, URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })));
    flash(rotated() ? "SVG downloaded · 1920 × 1080" : "SVG tile downloaded");
  }
  function downloadPng() {
    if (isSh()) return shaderPng();
    const W = 1920,
      H = 1080;
    const img = new Image();
    img.onload = () => {
      const pat = document.createElement("canvas");
      pat.width = W;
      pat.height = H;
      const pg = pat.getContext("2d");
      if (rotated()) pg.drawImage(img, 0, 0, W, H);
      else {
        pg.fillStyle = pg.createPattern(img, "repeat");
        pg.fillRect(0, 0, W, H);
      }
      fade(pg, W, H);
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g2 = c.getContext("2d");
      if (S.bgOn) {
        g2.fillStyle = S.bg;
        g2.fillRect(0, 0, W, H);
      }
      g2.drawImage(pat, 0, 0);
      download(`pattern-${S.type}.png`, c.toDataURL("image/png"));
      flash("PNG downloaded · 1920 × 1080");
    };
    img.onerror = () => flash("PNG export failed in this browser");
    img.src = enc(rotated() ? svgRotated(W, H) : svgTile());
  }
  let pngGl;
  function shaderPng() {
    const W = 1920,
      H = 1080;
    if (pngGl === undefined) {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      pngGl = glFor(c);
    }
    if (!pngGl) return flash("WebGL is not available in this browser");
    pngGl.draw(S.type, S, W, H, clock, 1);
    const pat = document.createElement("canvas");
    pat.width = W;
    pat.height = H;
    const pg = pat.getContext("2d");
    pg.drawImage(pngGl.gl.canvas, 0, 0);
    fade(pg, W, H);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g2 = c.getContext("2d");
    g2.fillStyle = S.bg;
    g2.fillRect(0, 0, W, H);
    g2.drawImage(pat, 0, 0);
    download(`shader-${S.type.slice(3)}.png`, c.toDataURL("image/png"));
    flash("PNG downloaded · 1920 × 1080 (current frame)");
  }
  function fade(pg, W, H) {
      const m = S.mask;
      if (m !== "none") {
        pg.globalCompositeOperation = "destination-in";
        let g;
        if (m === "radial") {
          g = pg.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
          g.addColorStop(0.3, "#000");
          g.addColorStop(0.75, "rgba(0,0,0,0)");
        } else if (m === "sides") {
          g = pg.createLinearGradient(0, 0, W, 0);
          g.addColorStop(0, "rgba(0,0,0,0)");
          g.addColorStop(0.25, "#000");
          g.addColorStop(0.75, "#000");
          g.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          g = m === "top" ? pg.createLinearGradient(0, H, 0, 0) : pg.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0.35, "#000");
          g.addColorStop(1, "rgba(0,0,0,0)");
        }
        pg.fillStyle = g;
        pg.fillRect(0, 0, W, H);
        pg.globalCompositeOperation = "source-over";
      }
  }
  const encodeState = () => btoa(JSON.stringify(S));
  async function share() {
    history.replaceState(null, "", "#p=" + encodeState());
    try {
      await navigator.clipboard.writeText(location.href);
      flash("Share link copied");
    } catch {
      flash("Link is in the address bar");
    }
  }

  /* ── presets ────────────────────────────────────────────── */
  const PRESETS = [
    ["Night dots", { type: "dots", size: 22, stroke: 1.4, fg: "#7dd3fc", fgA: 0.5, bg: "#020617", mask: "radial" }],
    ["Blueprint", { type: "graph", size: 16, stroke: 1, fg: "#93c5fd", fgA: 0.5, bg: "#0b2447", mask: "none" }],
    ["Hex lab", { type: "hexagons", size: 30, stroke: 1, fg: "#a5f3fc", fgA: 0.3, bg: "#04131a", mask: "radial" }],
    ["Topo map", { type: "topo", size: 26, stroke: 1, fg: "#d6c7a1", fgA: 0.55, bg: "#1c1a14", mask: "none" }],
    ["Paper grain", { type: "noise", size: 40, stroke: 1, fg: "#5b4a33", fgA: 0.22, bg: "#f4efe4", mask: "none" }],
    ["Soft checker", { type: "checker", size: 18, stroke: 1, fg: "#e9d5ff", fg2: "#bae6fd", fgA: 0.35, bg: "#ffffff", mask: "none" }],
    ["Retro waves", { type: "waves", size: 28, stroke: 2, fg: "#fb7185", fgA: 0.55, bg: "#1f1135", mask: "bottom" }],
    ["Isometric", { type: "cubes", size: 36, stroke: 1, fg: "#38bdf8", fg2: "#0369a1", fgA: 0.35, bg: "#020617", mask: "radial" }],
    ["Ink hatch", { type: "crosshatch", size: 12, stroke: 0.8, fg: "#111827", fg2: "#111827", fgA: 0.35, bg: "#f8fafc", mask: "none" }],
    ["Plus grid", { type: "plus", size: 26, stroke: 1.5, fg: "#ffffff", fgA: 0.22, bg: "#0a0a0a", mask: "top" }],
    ["Zigzag pop", { type: "zigzag", size: 24, stroke: 2.5, fg: "#fde047", fgA: 0.7, bg: "#7c3aed", mask: "none" }],
    ["Ripple rings", { type: "rings", size: 40, stroke: 1.2, fg: "#34d399", fg2: "#a7f3d0", fgA: 0.4, bg: "#022c22", mask: "sides" }],
    ["1-bit glow", { type: "bayer", size: 24, fg: "#7dd3fc", fgA: 0.55, bg: "#020617", mask: "radial" }],
    ["Halftone pop", { type: "halftone", size: 14, fg: "#f43f5e", fgA: 0.9, bg: "#fff1e6", mask: "none" }],
    ["Banknote", { type: "engrave", size: 18, stroke: 1.6, fg: "#14532d", fgA: 0.5, bg: "#ecfccb", mask: "none" }],
    ["Paper gradient", { type: "sh-grain", fg: "#38bdf8", fg2: "#f0abfc", bg: "#0b1020", speed: 0.4, scale: 1, grain: 0.18, dither: false, mask: "none" }],
    ["Dither sky", { type: "sh-dither", fg: "#0ea5e9", fg2: "#e0f2fe", bg: "#020617", speed: 0.5, scale: 1, px: 3, grain: 0, dither: true, mask: "none" }],
    ["Print wave", { type: "sh-halftone", fg: "#111827", fg2: "#1d4ed8", bg: "#f5f0e6", speed: 0.5, scale: 1, px: 5, grain: 0.06, dither: false, mask: "none" }],
  ];
  const presetsEl = $("[data-pm-presets]");
  function renderPresets() {
    const keep = S;
    presetsEl.innerHTML = PRESETS.map(([name, p], i) => {
      S = { ...DEFAULT, ...p, rot: 0, anim: false };
      const bg = isSh() ? `background-color:${S.bg};background-image:${shaderThumb(S.type, S).replace(/"/g, "&quot;")};background-size:cover` : `background-color:${S.bg};background-image:url(&quot;${enc(svgTile())}&quot;);background-size:${tile().w}px ${tile().h}px`;
      return `<button type="button" class="gm-preset" data-pm-preset="${i}"><span style="${bg}"></span><b>${name}</b></button>`;
    }).join("");
    S = keep;
  }

  /* ── controls ───────────────────────────────────────────── */
  const fmt = { size: (v) => v + "px", stroke: (v) => String(v), rot: (v) => v + "°", fgA: (v) => v + "%", speed: (v) => (v / 100).toFixed(2), scale: (v) => (v / 100).toFixed(2), px: (v) => v + "px", grain: (v) => v + "%" };
  const PCT = new Set(["fgA", "speed", "scale", "grain"]); // stored as 0..1, shown as 0..100
  const catOf = (t) => $(`[data-pm-type="${t}"]`)?.dataset.pmInCat || "pattern";
  let cat = "pattern";
  function syncControls() {
    $$("[data-pm-type]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.pmType === S.type)));
    $$("[data-pm-mask]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pmMask === S.mask)));
    $$("[data-pm-in]").forEach((el) => {
      const k = el.dataset.pmIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else if (PCT.has(k)) el.value = Math.round(S[k] * 100);
      else el.value = S[k];
    });
    $$("[data-pm-out]").forEach((o) => {
      const k = o.dataset.pmOut;
      o.textContent = fmt[k](PCT.has(k) ? Math.round(S[k] * 100) : S[k]);
    });
    const sh = isSh();
    $("[data-pm-two]").hidden = !sh && !TWO.has(S.type);
    $$("[data-pm-sh-only]").forEach((el) => (el.hidden = !sh));
    $$("[data-pm-pat-only]").forEach((el) => (el.hidden = sh));
    cat = catOf(S.type);
    $$("[data-pm-cat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pmCat === cat)));
    $$("[data-pm-in-cat]").forEach((b) => (b.hidden = b.dataset.pmInCat !== cat));
    $("[data-pm-play]").textContent = playing ? "Pause" : "Play";
    $('[data-pm-in="anim"]').disabled = rotated();
    $('[data-pm-in="anim"]').closest("label").title = rotated() ? "Pan works on unrotated patterns" : "";
  }
  let saveT = 0;
  function update(full = true) {
    renderPreview();
    renderExport();
    if (full) {
      syncControls();
      renderSwatches();
    }
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#p=" + encodeState()), 400);
  }
  root.addEventListener("input", (e) => {
    const k = e.target.dataset.pmIn;
    if (!k) return;
    if (e.target.type === "checkbox") S[k] = e.target.checked;
    else if (PCT.has(k)) S[k] = +e.target.value / 100;
    else if (k === "fg" || k === "fg2" || k === "bg") S[k] = e.target.value;
    else S[k] = +e.target.value;
    const o = $(`[data-pm-out="${k}"]`);
    if (o) o.textContent = fmt[k](+e.target.value);
    update(e.target.type === "checkbox" || e.type === "change");
  });
  root.addEventListener("change", (e) => {
    if (e.target.dataset.pmIn) update(true);
    if (e.target.matches("[data-pm-show-card]")) $("[data-pm-card]").hidden = !e.target.checked;
  });
  root.addEventListener("click", (e) => {
    const ct = e.target.closest("[data-pm-cat]");
    if (ct && ct.dataset.pmCat !== cat) {
      S.type = $(`[data-pm-in-cat="${ct.dataset.pmCat}"]`).dataset.pmType;
      S.dither = S.type === "sh-dither";
      update();
    }
    if (e.target.closest("[data-pm-play]")) {
      playing = !playing;
      e.target.closest("[data-pm-play]").textContent = playing ? "Pause" : "Play";
    }
    const t = e.target.closest("[data-pm-type]");
    if (t) {
      S.type = t.dataset.pmType;
      S.dither = S.type === "sh-dither";
      update();
    }
    const m = e.target.closest("[data-pm-mask]");
    if (m) {
      S.mask = m.dataset.pmMask;
      update();
    }
    const tb = e.target.closest("[data-pm-tab]");
    if (tb) {
      tab = tb.dataset.pmTab;
      renderExport();
    }
    const pr = e.target.closest("[data-pm-preset]");
    if (pr) {
      S = { ...DEFAULT, ...PRESETS[+pr.dataset.pmPreset][1] };
      update();
    }
    if (e.target.closest("[data-pm-reset]")) {
      S = { ...DEFAULT };
      update();
    }
    if (e.target.closest("[data-pm-random]")) {
      const types = $$(`[data-pm-in-cat="${cat}"]`).map((b) => b.dataset.pmType);
      const h = Math.floor(Math.random() * 360);
      const dark = Math.random() < 0.6;
      const hsl = (hh, s, l) => {
        const c = document.createElement("canvas").getContext("2d");
        c.fillStyle = `hsl(${hh} ${s}% ${l}%)`;
        return c.fillStyle;
      };
      S = {
        ...S,
        type: types[Math.floor(Math.random() * types.length)],
        size: 12 + Math.round(Math.random() * 30),
        stroke: [0.8, 1, 1.5, 2][Math.floor(Math.random() * 4)],
        fg: hsl(h, 85, dark ? 70 : 40),
        fg2: hsl(h + 60, 80, dark ? 65 : 45),
        bg: hsl(h + 180, dark ? 50 : 30, dark ? 7 : 96),
        bgOn: true,
        fgA: r2(0.3 + Math.random() * 0.35),
        mask: ["none", "radial", "top", "bottom", "sides"][Math.floor(Math.random() * 5)],
        speed: r2(0.3 + Math.random() * 0.5),
        scale: r2(0.7 + Math.random() * 0.8),
        px: 2 + Math.floor(Math.random() * 6),
        dither: Math.random() < 0.3,
      };
      if (S.type === "sh-dither") S.dither = true;
      update();
    }
    if (e.target.closest("[data-pm-copy]")) copyCode();
    if (e.target.closest("[data-pm-dl-svg]")) downloadSvg();
    if (e.target.closest("[data-pm-dl-png]")) downloadPng();
    if (e.target.closest("[data-pm-share]")) share();
  });
  // arrow keys move between pattern types
  $("[data-pm-types]").addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const types = $$(`[data-pm-in-cat="${cat}"]`).map((b) => b.dataset.pmType);
    const i = (types.indexOf(S.type) + (e.key === "ArrowRight" ? 1 : -1) + types.length) % types.length;
    S.type = types[i];
    update();
    $(`[data-pm-type="${S.type}"]`).focus();
  });

  /* ── boot ───────────────────────────────────────────────── */
  function loadHash() {
    if (!location.hash.startsWith("#p=")) return;
    try {
      const v = JSON.parse(atob(location.hash.slice(3)));
      if (v && (GEN[v.type] || SH_FIELD[v.type])) S = { ...DEFAULT, ...v };
    } catch {}
  }
  loadHash();
  renderPresets();
  update();
  addEventListener("hashchange", () => {
    if (location.hash.slice(3) === encodeState()) return;
    loadHash();
    update();
  });
})();
