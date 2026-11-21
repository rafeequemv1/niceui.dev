/*
 * Procedural scenery for the scenic heroes, painted once to a canvas and cached
 * as a data URL. Swap `src` for your own photo in production.
 */
import { useEffect, useState } from 'react';

type RGB = [number, number, number];
const hex = (h: string): RGB => {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ramp = (stops: [number, RGB][], t: number): RGB => {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [p, c] = stops[i];
    if (t <= p) {
      const [p0, c0] = stops[i - 1];
      const k = (t - p0) / (p - p0);
      return [c0[0] + (c[0] - c0[0]) * k, c0[1] + (c[1] - c0[1]) * k, c0[2] + (c[2] - c0[2]) * k];
    }
  }
  return stops[stops.length - 1][1];
};
let seed = 1;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
// smooth 1D value noise
const vnoise = (x: number, s: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i, s);
  const b = hash(i + 1, s);
  return a + (b - a) * f * f * (3 - 2 * f);
};

/* ——— Dusk dunes ——— */

const SKY: [number, RGB][] = [
  [0, hex('#132c33')],
  [0.28, hex('#24434a')],
  [0.5, hex('#5f5a52')],
  [0.68, hex('#b06a48')],
  [0.82, hex('#de8a57')],
  [1, hex('#efa36c')],
];
const SAND: [number, RGB][] = [
  [0, hex('#0f0b0a')],
  [0.16, hex('#1d1311')],
  [0.36, hex('#4a2113')],
  [0.58, hex('#9c3f19')],
  [0.78, hex('#de6527')],
  [0.92, hex('#f28a45')],
  [1, hex('#f8b27a')],
];

function paintDunes(W: number, H: number) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const img = g.createImageData(W, H);
  const d = img.data;
  // back dune crest: high on the left, sweeping down to the right
  const back = (u: number) => 0.385 - 0.03 * Math.exp(-(((u - 0.36) / 0.16) ** 2)) + 0.24 * smooth(0.42, 1.08, u) + 0.07 * Math.exp(-(((u + 0.02) / 0.14) ** 2)) + 0.006 * Math.sin(u * 23);
  // front dune: a dark shoulder bottom-left that drops away to the right
  const front = (u: number) => 0.62 + 0.05 * Math.sin(u * 2.4 + 0.6) + 0.3 * smooth(0.3, 1.0, u);

  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      let col: RGB;
      const yb = back(u);
      const yf = front(u);
      if (v < yb) {
        col = ramp(SKY, clamp(v / 0.62));
        // low sun glow on the right horizon
        const glow = Math.exp(-(((u - 0.86) / 0.32) ** 2) - (((v - 0.6) / 0.16) ** 2));
        col = [col[0] + 70 * glow, col[1] + 38 * glow, col[2] + 16 * glow];
      } else {
        const depth = v - yb;
        // lit face: brightest just under the crest toward the sun, falling into shade
        let lit = smooth(0.18, 0.95, u - 0.75 * depth + 0.05) * Math.exp(-depth * 2.1);
        lit = lit * 0.92 + 0.04;
        // wind ripples running diagonally down the slope
        const warp = vnoise(u * 9 + v * 3, 3) * 2.4;
        const rip = Math.sin(v * 210 - u * 70 + warp + Math.sin(u * 13) * 1.4);
        const fine = Math.sin(v * 560 - u * 150 + warp * 1.7);
        lit *= 1 + rip * 0.13 * smooth(0.05, 0.5, lit) + fine * 0.05;
        // a soft rim of light along the crest
        lit += Math.exp(-depth * 90) * 0.18 * smooth(0.2, 0.7, u);
        col = ramp(SAND, clamp(lit));
        if (v > yf) {
          const fd = v - yf;
          const rim = Math.exp(-fd * 120) * 0.35 * smooth(0.35, 0.9, u);
          const sh = 0.05 + rim + 0.04 * Math.sin(v * 260 - u * 40 + warp);
          col = ramp(SAND, clamp(sh));
        }
      }
      // vignette + grain
      const vig = 1 - 0.38 * ((u - 0.5) ** 2 * 1.6 + (v - 0.45) ** 2 * 1.4);
      const n = (hash(x, y) - 0.5) * 22;
      const o = (y * W + x) * 4;
      d[o] = col[0] * vig + n;
      d[o + 1] = col[1] * vig + n;
      d[o + 2] = col[2] * vig + n;
      d[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL('image/jpeg', 0.88);
}

/* ——— Spring meadow ——— */

const FLOWERS = ['#f472b6', '#fb923c', '#a78bfa', '#facc15', '#ffffff', '#f9a8d4', '#fdba74', '#c084fc'];

function paintMeadow(W: number, H: number) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  seed = 7;
  // sky
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#3f8fe6');
  sky.addColorStop(0.35, '#74b3f0');
  sky.addColorStop(0.62, '#bfe0f8');
  sky.addColorStop(0.75, '#e6f3fb');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  // haze clouds
  g.filter = `blur(${Math.round(W / 40)}px)`;
  for (let i = 0; i < 7; i++) {
    g.fillStyle = `rgba(255,255,255,${0.18 + rnd() * 0.2})`;
    g.beginPath();
    g.ellipse(rnd() * W, H * (0.2 + rnd() * 0.35), W * (0.12 + rnd() * 0.18), H * (0.04 + rnd() * 0.05), 0, 0, Math.PI * 2);
    g.fill();
  }
  g.filter = 'none';

  // hills, back to front
  const layers = [
    { base: 0.6, amp: 0.05, f: 1.6, ph: 0.4, top: '#9cc9a2', bot: '#86b98e', blur: 4, flowers: 260, size: 1.1 },
    { base: 0.66, amp: 0.06, f: 2.3, ph: 2.1, top: '#7dbb6c', bot: '#5d9f4c', blur: 2, flowers: 700, size: 1.6 },
    { base: 0.73, amp: 0.07, f: 1.4, ph: 4.2, top: '#62ad48', bot: '#3e8a2c', blur: 1, flowers: 1400, size: 2.4 },
    { base: 0.84, amp: 0.1, f: 1.1, ph: 1.0, top: '#4f9e36', bot: '#2c6e1f', blur: 0, flowers: 2400, size: 3.6 },
  ];
  layers.forEach((L, li) => {
    const ridge = (u: number) => H * (L.base - L.amp * (Math.sin(u * L.f * Math.PI + L.ph) * 0.6 + Math.sin(u * L.f * 2.7 + L.ph * 2) * 0.4));
    g.filter = L.blur ? `blur(${L.blur}px)` : 'none';
    const grad = g.createLinearGradient(0, H * (L.base - L.amp), 0, H);
    grad.addColorStop(0, L.top);
    grad.addColorStop(1, L.bot);
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) g.lineTo(x, ridge(x / W));
    g.lineTo(W, H);
    g.closePath();
    g.fill();
    // grass strokes
    g.lineWidth = 0.6 + li * 0.35;
    for (let i = 0; i < L.flowers * 1.4; i++) {
      const x = rnd() * W;
      const top = ridge(x / W);
      const y = top + Math.pow(rnd(), 1.3) * (H - top);
      const len = (2 + rnd() * 5) * (0.6 + li * 0.45) * (0.6 + (y / H) * 0.8);
      g.strokeStyle = rnd() > 0.5 ? 'rgba(170,220,120,0.35)' : 'rgba(30,80,20,0.3)';
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (rnd() - 0.5) * 2, y - len);
      g.stroke();
    }
    // flowers, denser and larger toward the viewer
    for (let i = 0; i < L.flowers; i++) {
      const x = rnd() * W;
      const top = ridge(x / W);
      const t = Math.pow(rnd(), 0.8);
      const y = top + 4 + t * (H - top);
      const r = L.size * (0.5 + rnd() * 0.8) * (0.7 + (y / H) * 0.6);
      const col = FLOWERS[Math.floor(rnd() * FLOWERS.length)];
      g.globalAlpha = 0.75 + rnd() * 0.25;
      g.fillStyle = col;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  });
  // out-of-focus foreground blooms in the corners
  g.filter = `blur(${Math.round(W / 140)}px)`;
  for (let i = 0; i < 70; i++) {
    const side = rnd() > 0.5 ? rnd() * 0.22 : 0.78 + rnd() * 0.22;
    const x = side * W;
    const y = H * (0.82 + rnd() * 0.2);
    g.globalAlpha = 0.85;
    g.fillStyle = FLOWERS[Math.floor(rnd() * FLOWERS.length)];
    g.beginPath();
    g.arc(x, y, W * (0.006 + rnd() * 0.01), 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  g.filter = 'none';
  // light grain
  const img = g.getImageData(0, 0, W, H);
  const dd = img.data;
  for (let i = 0; i < dd.length; i += 4) {
    const n = (rnd() - 0.5) * 10;
    dd[i] += n;
    dd[i + 1] += n;
    dd[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL('image/jpeg', 0.88);
}

const cache = new Map<string, string>();

/** Paints a scene after first paint and returns its data URL (empty until ready). */
export function useScene(kind: 'dunes' | 'meadow', w = 1440, h = 900) {
  const key = `${kind}-${w}-${h}`;
  const [src, setSrc] = useState(() => cache.get(key) ?? '');
  useEffect(() => {
    if (src) return;
    const id = window.setTimeout(() => {
      const url = kind === 'dunes' ? paintDunes(w, h) : paintMeadow(w, h);
      cache.set(key, url);
      setSrc(url);
    }, 30);
    return () => window.clearTimeout(id);
  }, [key, kind, w, h, src]);
  return src;
}
