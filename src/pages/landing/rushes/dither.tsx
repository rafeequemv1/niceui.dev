import { useEffect, useRef, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

/*
 * Ordered (Bayer 8×8) dithering on a low-resolution canvas, scaled up with crisp pixels.
 * A field maps a point (u, v in 0..1; `ar` = width / height) and time in seconds to a density in 0..1.
 * Return ACC + density to dither that cell in the accent colour instead of the ink colour.
 */
export type Field = (u: number, v: number, t: number, ar: number) => number;
export const ACC = 2;

const B8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];
const BAYER = Float32Array.from(B8, (n) => (n + 0.5) / 64);

type RGB = [number, number, number];
const rgb = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function ditherInto(img: ImageData, field: Field, t: number, ink: RGB, accent: RGB, bg: RGB | null) {
  const { width: w, height: h, data } = img;
  const ar = w / h;
  let i = 0;
  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h;
    const row = (y & 7) << 3;
    for (let x = 0; x < w; x++, i += 4) {
      let d = field((x + 0.5) / w, v, t, ar);
      let c = ink;
      if (d >= ACC) {
        d -= ACC;
        c = accent;
      }
      if (d > BAYER[row | (x & 7)]) {
        data[i] = c[0];
        data[i + 1] = c[1];
        data[i + 2] = c[2];
        data[i + 3] = 255;
      } else if (bg) {
        data[i] = bg[0];
        data[i + 1] = bg[1];
        data[i + 2] = bg[2];
        data[i + 3] = 255;
      } else data[i + 3] = 0;
    }
  }
}

const stills = new Map<string, string>();

/** Renders a field once to a data URL — used for filmstrips and thumbnails. */
export function ditherStill(key: string, field: Field, w: number, h: number, t = 2, ink = PAPER, accent = ACCENT, bg: string | null = SCREEN) {
  const hit = stills.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(w, h);
  ditherInto(img, field, t, rgb(ink), rgb(accent), bg ? rgb(bg) : null);
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL();
  stills.set(key, url);
  return url;
}

export const INK = '#0b0b0c';
export const ACCENT = '#ff4f1f';
export const PAPER = '#f3efe6';
export const SCREEN = '#0d0d0e';

type DitherProps = {
  field: Field;
  /** CSS pixels per dither cell. */
  pixel?: number;
  ink?: string;
  accent?: string;
  bg?: string;
  fps?: number;
  /** External clock in seconds (e.g. a playhead). Without it the canvas runs on wall time. */
  time?: () => number;
  /** Keep following the external clock under reduced motion, because the visitor drives it. */
  follow?: boolean;
  /** Time used for the static frame (reduced motion, or fps = 0). */
  still?: number;
  className?: string;
  style?: CSSProperties;
};

export function DitherCanvas({ field, pixel = 3, ink = INK, accent = ACCENT, bg, fps = 30, time, follow = false, still = 2, className, style }: DitherProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef(field);
  const timeRef = useRef(time);
  const redraw = useRef<() => void>(() => {});
  fieldRef.current = field;
  timeRef.current = time;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;
    const inkC = rgb(ink);
    const accC = rgb(accent);
    const bgC = bg ? rgb(bg) : null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = fps > 0 && (!reduce || (follow && !!timeRef.current));
    const start = performance.now();
    let img: ImageData | null = null;
    let raf = 0;
    let last = 0;
    let visible = false;

    const now = () => (timeRef.current ? timeRef.current() : animate ? (performance.now() - start) / 1000 + still : still);
    const draw = () => {
      if (!img) return;
      ditherInto(img, fieldRef.current, now(), inkC, accC, bgC);
      ctx.putImageData(img, 0, 0);
    };
    const size = () => {
      const r = wrap.getBoundingClientRect();
      const cols = Math.max(1, Math.ceil(r.width / pixel));
      const rows = Math.max(1, Math.ceil(r.height / pixel));
      if (canvas.width === cols && canvas.height === rows && img) return;
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.width = `${cols * pixel}px`;
      canvas.style.height = `${rows * pixel}px`;
      img = ctx.createImageData(cols, rows);
      draw();
    };
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      if (ts - last < 1000 / fps - 2) return;
      last = ts;
      draw();
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (visible && animate) raf = requestAnimationFrame(loop);
    };

    redraw.current = draw;
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        sync();
      },
      { rootMargin: '120px' },
    );
    io.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [pixel, ink, accent, bg, fps, follow, still]);

  useEffect(() => redraw.current(), [field]);

  return (
    <div ref={wrapRef} aria-hidden className={cn('pointer-events-none overflow-hidden', className)} style={style}>
      <canvas ref={canvasRef} className="block [image-rendering:pixelated]" />
    </div>
  );
}

/* ——— math ——— */

export const clamp = (x: number, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const LATTICE = (() => {
  const a = new Float32Array(256 * 256);
  let s = 1337;
  for (let i = 0; i < a.length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    a[i] = s / 4294967296;
  }
  return a;
})();

export const hash = (x: number, y = 0) => LATTICE[(x & 255) | ((y & 255) << 8)];

export function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

export const fbm = (x: number, y: number) => noise(x, y) * 0.62 + noise(x * 2.1 + 17, y * 2.1 + 9) * 0.38;

/* ——— scenes: densities are luminance, drawn as light dots on a dark screen ——— */

export const scenes: Record<SceneId, Field> = {
  portrait(u, v, t, ar) {
    const x = (u - 0.5) * ar;
    const cx = 0.12 + Math.sin(t * 0.55) * 0.006;
    const hy = 0.42 + Math.sin(t * 2.3) * 0.004;
    const dx = x - cx;
    const dy = v - hy;
    const head = (dx / 0.122) ** 2 + (dy / 0.162) ** 2;
    const hair = (dx / 0.138) ** 2 + ((dy + 0.03) / 0.165) ** 2;
    const body = (dx / 0.52) ** 2 + ((v - 1.06) / 0.3) ** 2;
    const neck = Math.abs(dx) < 0.045 && dy > 0.1 && v < 0.8;
    const lit = 0.9 - clamp((dx + 0.26) / 0.52) * 0.78;
    if (hair < 1 && dy < -0.07 + (dx / 0.115) ** 2 * 0.12) return hair > 0.82 && dx > 0.02 ? 0.36 : dx < -0.05 ? 0.1 : 0.03;
    if (head < 1) {
      const eye = Math.min(((dx + 0.042) / 0.017) ** 2 + ((dy + 0.004) / 0.009) ** 2, ((dx - 0.038) / 0.017) ** 2 + ((dy + 0.004) / 0.009) ** 2);
      if (eye < 1) return 0.02;
      const open = 0.003 + 0.007 * Math.abs(Math.sin(t * 8.5) * Math.sin(t * 3.1));
      if ((dx / 0.03) ** 2 + ((dy - 0.085) / open) ** 2 < 1) return 0.02;
      if (dx > 0.004 && dx < 0.02 && dy > 0.01 && dy < 0.055) return lit * 0.4;
      return lit + (head > 0.74 && dx > 0.02 ? 0.36 : 0);
    }
    if (neck) return lit * 0.4;
    if (body < 1) {
      if (Math.abs(dx) < 0.06 - (v - 0.74) * 0.4 && v < 0.9) return 0.03;
      return lit * 0.62 + (body > 0.9 && dx > 0 ? 0.3 : 0);
    }
    let L = 0.1 * Math.exp(-((x - 0.4) ** 2 + (v - 0.35) ** 2) * 14);
    for (const [bx, by, br] of BOKEH) {
      const d = Math.hypot(x - bx, v - by);
      if (d < br) L += d > br * 0.84 ? 0.3 : 0.16;
    }
    if (x > 0.54 && x < 0.8 && v > 0.08 && v < 0.6 && Math.sin(v * 64) > 0.1) L += 0.12;
    return L;
  },

  coast(u, v, t, ar) {
    const x = u * ar;
    const hz = 0.58;
    const sx = 0.64 * ar;
    const sy = 0.47;
    const ds = Math.hypot(x - sx, v - sy);
    if (v < hz) {
      if (ds < 0.08) return ACC + 0.97;
      let L = 0.46 * smooth(0.05, hz, v) ** 2 + 0.34 * Math.exp(-ds * 7);
      if (v > 0.2 && v < 0.4 && noise(x * 1.6 + t * 0.05, v * 9) > 0.7) L += 0.12;
      return L;
    }
    const depth = (v - hz) / (1 - hz);
    const ripple = Math.sin(6 / (depth + 0.08) + t * 1.4 + Math.sin(x * 6 + t * 0.8) * 0.8);
    const half = 0.02 + depth * 0.13;
    if (Math.abs(x - sx) < half * (0.65 + 0.35 * Math.sin(v * 80 + t * 3)) && ripple > -0.2) return ACC + 0.8 - depth * 0.35;
    return 0.2 * (1 - depth) ** 2 + (ripple > 0.8 ? 0.22 * (1 - depth * 0.6) : 0);
  },

  city(u, v, t, ar) {
    const x = u * ar + t * 0.025;
    const md = Math.hypot(u * ar - 0.26 * ar, v - 0.2);
    if (md < 0.058) return 0.94 - (noise(u * 50, v * 50) > 0.72 ? 0.3 : 0);
    const W = 0.12;
    const col = Math.floor(x / W);
    const fx = x / W - col;
    const top = 1 - (0.3 + hash(col, 3) * 0.44);
    if (v > top) {
      if (fx < 0.08) return 0.01;
      const floor = Math.floor((v - top) * 24);
      const wy = (v - top) * 24 - floor;
      const wx = fx * 4 - Math.floor(fx * 4);
      if (wx > 0.32 && wx < 0.74 && wy > 0.32 && wy < 0.76 && fx > 0.14) {
        const id = (col * 31 + floor * 7 + Math.floor(fx * 4)) & 255;
        if (hash(id, Math.floor(t * 0.3 + hash(id, 9) * 10)) < 0.62) return 0.03;
        return hash(id, 5) > 0.95 ? ACC + 0.95 : 0.78;
      }
      return 0.03 + hash(col, 4) * 0.05 + (fx > 0.9 ? 0.08 : 0);
    }
    return 0.14 * v * v + 0.18 * Math.exp(-(top - v) * 16) + 0.34 * Math.exp(-md * 16);
  },

  peaks(u, v, t, ar) {
    const x = u * ar;
    for (let k = 2; k >= 0; k--) {
      const n = fbm(x * (1.3 + k * 0.8) + t * 0.025 * (k + 1) + k * 7.3, k * 3.1);
      const r = 0.5 + k * 0.13 - (1 - Math.abs(2 * n - 1)) * (0.3 - k * 0.05);
      if (v > r) return [0.4, 0.17, 0][k] + 0.34 * Math.exp(-(v - r) * 38) + (k === 2 ? 0.04 * noise(x * 24, v * 24) : 0);
    }
    const sd = Math.hypot(x - 0.3 * ar, v - 0.2);
    if (sd < 0.068) return ACC + 0.97;
    return 0.5 * smooth(0, 0.62, v) ** 2 + 0.32 * Math.exp(-sd * 6);
  },

  reel(u, v, t, ar) {
    const x = (u - 0.5) * ar;
    const y = v - 0.5;
    const r = Math.hypot(x, y);
    if (r > 0.43) {
      if (y > 0.18 && y < 0.26 && x > 0.2) return Math.sin(x * 120 - t * 30) > 0.3 ? 0.55 : 0.18;
      return 0.08 * Math.exp(-r * 2);
    }
    if (r > 0.4) return 0.92;
    if (r < 0.045) return 0.05;
    if (r < 0.085) return r < 0.06 ? ACC + 0.95 : 0.85;
    const rot = t * 0.9;
    const px = x * Math.cos(rot) + y * Math.sin(rot);
    const py = y * Math.cos(rot) - x * Math.sin(rot);
    const a = Math.atan2(py, px);
    const seg = (Math.PI * 2) / 5;
    const c = Math.round(a / seg) * seg;
    const hx = Math.cos(c) * 0.245;
    const hy = Math.sin(c) * 0.245;
    if (Math.hypot(px - hx, py - hy) < 0.1) return 0.05;
    return 0.42 + 0.3 * Math.cos(a * 2) * 0.5 + (Math.sin(r * 200) > 0.6 ? 0.12 : 0);
  },
};

export type SceneId = 'portrait' | 'coast' | 'city' | 'peaks' | 'reel';

/* ——— ambient fields: dark dots on the white page ——— */

/** A drifting halftone cloud with an accent core — sits behind the hero editor. */
export const halo: Field = (u, v, t, ar) => {
  const x = (u - 0.5) * ar;
  const y = v - 0.56;
  const r = Math.sqrt(x * x * 0.3 + y * y * 2.6);
  if (r > 1.06) return 0;
  const n = fbm(x * 1.7 + t * 0.045, y * 2.8 - t * 0.035);
  const d = 0.78 - r + (n - 0.5) * 0.55;
  if (d > 0.52 && n > 0.6) return ACC + Math.min(0.7, (d - 0.5) * 2.4);
  return Math.max(0, d * 0.62);
};

/** Sun rising over a calm sea, for the closing call to action. */
export const sunrise: Field = (u, v, t, ar) => {
  const x = (u - 0.5) * ar;
  const hz = 0.52;
  const sy = 0.5 - 0.05 * (0.5 + 0.5 * Math.sin(t * 0.25));
  const ds = Math.hypot(x, v - sy);
  if (v < hz) {
    if (ds < 0.2) return ACC + 0.98;
    return 0.06 + 0.46 * smooth(0, hz, v) ** 2 + 0.4 * Math.exp(-(ds - 0.2) * 4);
  }
  const depth = (v - hz) / (1 - hz);
  const ripple = Math.sin(5 / (depth + 0.06) + t * 1.2 + Math.sin(x * 5 + t * 0.7) * 0.9);
  if (Math.abs(x) < (0.12 + depth * 0.3) * (0.7 + 0.3 * Math.sin(v * 70 + t * 2.5)) && ripple > -0.3) return ACC + 0.85 - depth * 0.4;
  return 0.2 * (1 - depth) ** 1.5 + (ripple > 0.78 ? 0.25 * (1 - depth * 0.5) : 0);
};

const BOKEH: [number, number, number][] = [
  [-0.62, 0.22, 0.05],
  [-0.48, 0.34, 0.035],
  [-0.74, 0.46, 0.028],
  [-0.3, 0.16, 0.022],
];
