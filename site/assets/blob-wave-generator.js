/* NiceUI Blob & Wave Generator — seeded SVG blobs, layered waves and backgrounds. Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-bw]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const f1 = (v) => Math.round(v * 10) / 10;

  /* ── data ──────────────────────────────────────────────── */
  const SIZES = { square: [1000, 1000], hd: [1600, 900], classic: [1600, 1200], story: [1080, 1920], banner: [1920, 520] };
  const PALETTES = [
    { name: "Sky", bg: "#020617", c: ["#38bdf8", "#6366f1", "#a78bfa"] },
    { name: "Sunset", bg: "#1c0a1f", c: ["#fb923c", "#f43f5e", "#a21caf"] },
    { name: "Mint", bg: "#04201a", c: ["#6ee7b7", "#14b8a6", "#0e7490"] },
    { name: "Candy", bg: "#fff1f5", c: ["#f9a8d4", "#c4b5fd", "#93c5fd"] },
    { name: "Ocean", bg: "#e0f2fe", c: ["#38bdf8", "#0284c7", "#1e3a8a"] },
    { name: "Ember", bg: "#0c0a09", c: ["#fbbf24", "#f97316", "#dc2626"] },
    { name: "Forest", bg: "#f0fdf4", c: ["#86efac", "#22c55e", "#14532d"] },
    { name: "Mono", bg: "#0a0a0a", c: ["#e5e5e5", "#737373", "#262626"] },
    { name: "Grape", bg: "#0f0720", c: ["#c084fc", "#7c3aed", "#4c1d95"] },
    { name: "Paper", bg: "#faf7f2", c: ["#e9d5b7", "#d4a373", "#7f5539"] },
  ];
  const KINDS = [
    ["steps", "Layered steps"],
    ["peaks", "Layered peaks"],
    ["blobs", "Blob scene"],
    ["circles", "Circle scatter"],
    ["poly", "Low poly"],
  ];
  const DEFAULT = {
    mode: "blob",
    seed: 4127,
    size: "square",
    cw: 1600,
    ch: 900,
    bPoints: 6,
    bRand: 55,
    bLayers: 1,
    bSize: 72,
    bRot: 0,
    bFill: "gradient",
    bStroke: 6,
    bAnim: false,
    bDur: 8,
    wType: "smooth",
    wLayers: 4,
    wHeight: 45,
    wFreq: 6,
    wAmp: 55,
    wDir: "bottom",
    wFade: true,
    sKind: "steps",
    sDensity: 50,
    sSoft: false,
    c1: "#38bdf8",
    c2: "#6366f1",
    c3: "#a78bfa",
    bg: "#020617",
    bgOn: false,
    inSection: true,
    pngScale: "2",
  };
  const MODE_DEFAULTS = { blob: { size: "square", bgOn: false }, waves: { size: "hd", bgOn: false }, scene: { size: "hd" } };
  let S = { ...DEFAULT };
  let tab = "svg";

  /* ── helpers ───────────────────────────────────────────── */
  const seeded = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hex2rgb = (h) => {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const mix = (a, b, t) => {
    const [x, y] = [hex2rgb(a), hex2rgb(b)];
    return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
  };
  const grad3 = (t) => (t < 0.5 ? mix(S.c1, S.c2, t * 2) : mix(S.c2, S.c3, (t - 0.5) * 2));
  const shade = (h, k) => (k >= 0 ? mix(h, "#ffffff", k) : mix(h, "#000000", -k));
  const lum = (h) => {
    const [r, g, b] = hex2rgb(h).map((v) => v / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const dims = () => (S.size === "custom" ? [clamp(Math.round(S.cw) || 1600, 100, 4000), clamp(Math.round(S.ch) || 900, 100, 4000)] : SIZES[S.size]);
  const P = (x, y) => `${f1(x)} ${f1(y)}`;

  // closed Catmull-Rom spline through points → cubic Béziers
  function closedPath(pts) {
    const n = pts.length;
    let d = `M${P(...pts[0])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`;
    }
    return d + "Z";
  }
  // open Catmull-Rom through points (end points clamped)
  function openSmooth(pts) {
    let d = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += `C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`;
    }
    return d;
  }
  function blobPts(cx, cy, r, n, rand, rnd) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * (rand / 100) * (Math.PI / n);
      const rr = r * (1 - (rand / 100) * 0.5 * rnd());
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return pts;
  }
  const linGrad = (id, stops, angle = 135) => {
    const a = (angle * Math.PI) / 180;
    const x = Math.cos(a) / 2, y = Math.sin(a) / 2;
    return `<linearGradient id="${id}" x1="${f1(0.5 - x)}" y1="${f1(0.5 - y)}" x2="${f1(0.5 + x)}" y2="${f1(0.5 + y)}">${stops.map(([c, o]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  };

  /* ── generators: return { defs, body, crop? } ──────────── */
  function genBlob(W, H) {
    const rnd = seeded(S.seed);
    const r = (Math.min(W, H) / 2) * (S.bSize / 100);
    const cx = W / 2, cy = H / 2;
    const n = S.bPoints;
    let defs = "";
    let body = "";
    const L = S.bLayers;
    if (S.bFill === "gradient") defs += linGrad("bwg", [[S.c1, 0], [S.c2, 1]], 135 + S.bRot);
    for (let j = 0; j < L; j++) {
      const k = L === 1 ? 1 : 1 - (L - 1 - j) * 0.13; // back layers are larger
      const lr = seeded(S.seed + j * 977);
      const pts = blobPts(cx, cy, r * (L === 1 ? 1 : 0.86 + (L - 1 - j) * 0.1), n, S.bRand, lr);
      const d1 = closedPath(pts);
      const op = L === 1 ? 1 : 0.28 + (0.72 * (j + 1)) / L;
      const fill = S.bFill === "gradient" ? "url(#bwg)" : S.bFill === "solid" ? (L === 1 ? S.c1 : grad3(j / Math.max(1, L - 1))) : "none";
      const stroke = S.bFill === "outline" ? ` stroke="${L === 1 ? S.c1 : grad3(j / Math.max(1, L - 1))}" stroke-width="${S.bStroke}" stroke-linejoin="round"` : "";
      let anim = "";
      if (S.bAnim) {
        const d2 = closedPath(blobPts(cx, cy, r * (L === 1 ? 1 : 0.86 + (L - 1 - j) * 0.1), n, Math.max(35, S.bRand), seeded(S.seed + 31 + j * 131)));
        anim = `<animate attributeName="d" dur="${S.bDur + j * 0.7}s" repeatCount="indefinite" values="${d1};${d2};${d1}" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>`;
      }
      void k;
      body += `<path d="${d1}" fill="${fill}"${op < 1 ? ` fill-opacity="${f1(op * 100) / 100}"` : ""}${stroke}>${anim}</path>`;
    }
    void rnd;
    if (S.bRot) body = `<g transform="rotate(${S.bRot} ${f1(cx)} ${f1(cy)})">${body}</g>`;
    return { defs, body };
  }

  function genWaves(W, H) {
    const rnd = seeded(S.seed);
    const L = S.wLayers;
    const band = H * (S.wHeight / 100);
    const top = H - band;
    const step = band / (L + 0.6);
    const amp = step * (S.wAmp / 100) * 1.2 + (L === 1 ? band * 0.25 * (S.wAmp / 100) : 0);
    const n = S.wFreq;
    const flip = S.wDir === "top";
    const Y = (y) => (flip ? H - y : y);
    let body = "";
    let minY = H;
    for (let i = 0; i < L; i++) {
      const base = top + step * (i + 0.6);
      const pts = [];
      for (let k = 0; k <= n; k++) {
        const bias = S.wType === "smooth" ? (k % 2 ? 0.55 : -0.55) : k % 2 ? 0.8 : -0.8;
        const y = base + amp * (bias + (rnd() - 0.5) * 0.9);
        pts.push([(k / n) * W, y]);
        minY = Math.min(minY, y);
      }
      let d = `M${P(0, Y(pts[0][1]))}`;
      const mp = pts.map(([x, y]) => [x, Y(y)]);
      if (S.wType === "smooth") d += openSmooth(mp);
      else if (S.wType === "peaks") d += mp.slice(1).map((p) => `L${P(...p)}`).join("");
      else for (let k = 1; k <= n; k++) d += `H${f1(mp[k][0])}V${f1(mp[k][1])}`;
      d += flip ? `V0H0Z` : `V${H}H0Z`;
      const color = L === 1 ? S.c1 : mix(S.c1, S.c2, i / (L - 1));
      const op = S.wFade && L > 1 ? 0.35 + (0.65 * (i + 1)) / L : 1;
      body += `<path d="${d}" fill="${color}"${op < 1 ? ` fill-opacity="${Math.round(op * 100) / 100}"` : ""}/>`;
    }
    const pad = 4;
    const crop = flip ? [0, 0, W, Math.min(H, H - minY + pad)] : [0, Math.max(0, minY - pad), W, H - Math.max(0, minY - pad)];
    return { defs: "", body, crop };
  }

  function genScene(W, H) {
    const rnd = seeded(S.seed);
    const dens = S.sDensity / 100;
    let body = `<rect width="${W}" height="${H}" fill="${S.bg}"/>`;
    let defs = "";
    const kind = S.sKind;
    if (kind === "steps" || kind === "peaks") {
      const L = Math.round(3 + dens * 6);
      const n = Math.round(6 + dens * 14);
      for (let i = 0; i < L; i++) {
        const base = (H * (i + 1)) / (L + 1);
        const amp = (H / (L + 1)) * 0.45;
        const pts = [];
        for (let k = 0; k <= n; k++) pts.push([(k / n) * W, base + (rnd() - 0.5) * 2 * amp]);
        let d = `M${P(0, pts[0][1])}`;
        if (kind === "steps") for (let k = 1; k <= n; k++) d += `H${f1(pts[k][0])}V${f1(pts[k][1])}`;
        else d += pts.slice(1).map((p) => `L${P(...p)}`).join("");
        d += `V${H}H0Z`;
        body += `<path d="${d}" fill="${grad3(i / Math.max(1, L - 1))}"/>`;
      }
    } else if (kind === "blobs") {
      const count = Math.round(5 + dens * 14);
      const m = Math.min(W, H);
      let g = "";
      for (let i = 0; i < count; i++) {
        const r = m * (0.06 + rnd() * 0.22);
        const cx = rnd() * W, cy = rnd() * H;
        const pts = blobPts(cx, cy, r, 5 + Math.floor(rnd() * 4), 60, rnd);
        g += `<path d="${closedPath(pts)}" fill="${[S.c1, S.c2, S.c3][i % 3]}" fill-opacity="${Math.round((0.55 + rnd() * 0.45) * 100) / 100}"/>`;
      }
      if (S.sSoft) {
        defs += `<filter id="bwblur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${f1(m * 0.06)}"/></filter>`;
        g = `<g filter="url(#bwblur)">${g}</g>`;
      }
      body += g;
    } else if (kind === "circles") {
      const count = Math.round(14 + dens * 60);
      const m = Math.min(W, H);
      for (let i = 0; i < count; i++) {
        const r = m * (0.008 + Math.pow(rnd(), 2.2) * 0.12);
        const cx = rnd() * W, cy = rnd() * H;
        const c = [S.c1, S.c2, S.c3][Math.floor(rnd() * 3)];
        const ring = rnd() < 0.3;
        body += ring
          ? `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="none" stroke="${c}" stroke-width="${f1(Math.max(1.5, r * 0.18))}" stroke-opacity="0.8"/>`
          : `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${c}" fill-opacity="${Math.round((0.5 + rnd() * 0.5) * 100) / 100}"/>`;
      }
    } else if (kind === "poly") {
      const cols = Math.round(5 + dens * 13);
      const cw = W / cols;
      const rows = Math.max(2, Math.round(H / cw));
      const rh = H / rows;
      const grid = [];
      for (let y = 0; y <= rows; y++) {
        grid.push([]);
        for (let x = 0; x <= cols; x++) {
          const jx = x === 0 || x === cols ? 0 : (rnd() - 0.5) * cw * 0.7;
          const jy = y === 0 || y === rows ? 0 : (rnd() - 0.5) * rh * 0.7;
          grid[y].push([x * cw + jx, y * rh + jy]);
        }
      }
      const tri = (a, b, c) => {
        const mx = (a[0] + b[0] + c[0]) / 3, my = (a[1] + b[1] + c[1]) / 3;
        const t = clamp((mx / W) * 0.65 + (my / H) * 0.35, 0, 1);
        const col = shade(grad3(t), (rnd() - 0.5) * 0.14);
        return `<path d="M${P(...a)}L${P(...b)}L${P(...c)}Z" fill="${col}" stroke="${col}" stroke-width="0.6" stroke-linejoin="round"/>`;
      };
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const a = grid[y][x], b = grid[y][x + 1], c = grid[y + 1][x], d = grid[y + 1][x + 1];
          if ((x + y) % 2) body += tri(a, b, d) + tri(a, d, c);
          else body += tri(a, b, c) + tri(b, d, c);
        }
    }
    return { defs, body };
  }

  function build(cropToWave = false) {
    const [W, H] = dims();
    const g = S.mode === "blob" ? genBlob(W, H) : S.mode === "waves" ? genWaves(W, H) : genScene(W, H);
    const bgRect = S.mode !== "scene" && S.bgOn ? `<rect width="${W}" height="${H}" fill="${S.bg}"/>` : "";
    let vb = [0, 0, W, H];
    if (cropToWave && g.crop) vb = g.crop.map((v) => Math.round(v));
    return { W, H, vb, defs: g.defs, body: bgRect + g.body };
  }
  function svgString(opts = {}) {
    const b = build(opts.crop);
    const [x, y, w, h] = b.vb;
    const size = opts.noSize ? "" : ` width="${w}" height="${h}"`;
    const par = opts.par ? ` preserveAspectRatio="${opts.par}"` : "";
    const extra = opts.attrs || "";
    const nl = opts.pretty ? "\n  " : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"${size}${par}${extra}>${b.defs ? nl + "<defs>" + b.defs + "</defs>" : ""}${nl}${opts.pretty ? b.body.replace(/><(path|circle|rect|g)/g, ">" + nl + "<$1") : b.body}${opts.pretty ? "\n" : ""}</svg>`;
  }
  const enc = (svg) => "data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");

  /* ── preview ───────────────────────────────────────────── */
  const stage = $("[data-bw-stage]");
  const art = $("[data-bw-art]");
  const sectionEl = $("[data-bw-section]");
  function fitArt(W, H) {
    const cs = getComputedStyle(stage);
    const aw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const ah = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const k = Math.max(0.01, Math.min(aw / W, ah / H));
    art.style.width = Math.floor(W * k) + "px";
    art.style.height = Math.floor(H * k) + "px";
  }
  new ResizeObserver(() => {
    if (!(S.mode === "waves" && S.inSection)) fitArt(...dims());
  }).observe(stage);
  function renderPreview() {
    const inSection = S.mode === "waves" && S.inSection;
    stage.classList.toggle("bw-in-section", inSection);
    sectionEl.hidden = !inSection;
    if (inSection) {
      const svg = svgString({ crop: true, noSize: true, par: "none", attrs: ` class="bw-divider ${S.wDir === "top" ? "bw-top" : ""}" aria-hidden="true"` });
      art.innerHTML = "";
      sectionEl.querySelectorAll(".bw-divider").forEach((n) => n.remove());
      sectionEl.insertAdjacentHTML("beforeend", svg);
      sectionEl.style.background = S.bgOn ? S.bg : lum(S.c1) > 0.6 ? "#0b1220" : "#f8fafc";
      sectionEl.classList.toggle("bw-light", !S.bgOn ? lum(S.c1) <= 0.6 : lum(S.bg) > 0.5);
      return;
    }
    sectionEl.querySelectorAll(".bw-divider").forEach((n) => n.remove());
    const [W, H] = dims();
    art.innerHTML = svgString({ noSize: true, attrs: ` class="bw-svg" role="img" aria-label="Generated ${S.mode === "blob" ? "blob" : S.mode === "waves" ? "waves" : "background"}"` });
    fitArt(W, H);
    art.classList.toggle("bw-checker", S.mode !== "scene" && !S.bgOn);
  }

  /* ── export ────────────────────────────────────────────── */
  const tw = (v) => v.replace(/ /g, "_");
  function reactCode() {
    const b = build(S.mode === "waves");
    const [x, y, w, h] = b.vb;
    const jsx = (s) =>
      s
        .replace(/stop-color=/g, "stopColor=")
        .replace(/fill-opacity=/g, "fillOpacity=")
        .replace(/stroke-width=/g, "strokeWidth=")
        .replace(/stroke-linejoin=/g, "strokeLinejoin=")
        .replace(/stroke-opacity=/g, "strokeOpacity=")
        .replace(/attributeName=/g, "attributeName=")
        .replace(/repeatCount=/g, "repeatCount=")
        .replace(/keyTimes=/g, "keyTimes=")
        .replace(/calcMode=/g, "calcMode=")
        .replace(/keySplines=/g, "keySplines=")
        .replace(/stdDeviation=/g, "stdDeviation=")
        .replace(/></g, ">\n        <");
    const name = S.mode === "blob" ? "Blob" : S.mode === "waves" ? "Waves" : "ShapeBackground";
    const par = S.mode === "waves" ? `\n      preserveAspectRatio="none"` : S.mode === "scene" ? `\n      preserveAspectRatio="xMidYMid slice"` : "";
    return `// Made with NiceUI Blob & Wave Generator. No dependencies.
import type { SVGProps } from 'react';

export function ${name}(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${x} ${y} ${w} ${h}"${par}
      aria-hidden="true"
      {...props}
    >
      ${b.defs ? `<defs>\n        ${jsx(b.defs)}\n      </defs>\n      ` : ""}${jsx(b.body)}
    </svg>
  );
}
`;
  }
  function code() {
    const isWave = S.mode === "waves";
    if (tab === "svg") return svgString({ pretty: true, crop: isWave });
    const uri = enc(svgString({ crop: isWave, par: isWave ? "none" : undefined }));
    if (tab === "css") {
      const pos = isWave ? (S.wDir === "top" ? "top" : "bottom") : "center";
      const sizeRule = isWave ? "100% auto" : S.mode === "scene" ? "cover" : "contain";
      return `/* Made with NiceUI Blob & Wave Generator. No dependencies. */
.shape-bg {
  background-image: url("${uri}");
  background-repeat: no-repeat;
  background-position: ${pos};
  background-size: ${sizeRule};
}`;
    }
    if (tab === "tailwind") {
      const pos = isWave ? (S.wDir === "top" ? "bg-top" : "bg-bottom") : "bg-center";
      const sz = isWave ? "bg-[length:100%_auto]" : S.mode === "scene" ? "bg-cover" : "bg-contain";
      return `<div class="bg-[url(${uri})] bg-no-repeat ${pos} ${sz}"></div>`;
    }
    if (tab === "react") return reactCode();
    // divider
    const top = S.wDir === "top";
    const svg = svgString({ crop: true, noSize: true, par: "none", pretty: true, attrs: ` class="pointer-events-none absolute inset-x-0 ${top ? "top-0" : "bottom-0"} h-auto w-full" aria-hidden="true"` });
    return `<!-- Wave divider made with NiceUI Blob & Wave Generator. No dependencies. -->
<section class="relative overflow-hidden ${top ? "pt-32" : "pb-32"}">
  <!-- your content -->
  ${svg.replace(/\n/g, "\n  ")}
</section>

<!-- Plain CSS instead of Tailwind:
section { position: relative; overflow: hidden; padding-${top ? "top" : "bottom"}: 8rem; }
section > svg { position: absolute; left: 0; right: 0; ${top ? "top" : "bottom"}: 0; width: 100%; height: auto; pointer-events: none; }
-->`;
  }
  const out = $("[data-bw-code]");
  function renderExport() {
    if (tab === "divider" && S.mode !== "waves") tab = "svg";
    $$("[data-bw-tab]").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.bwTab === tab));
      b.hidden = b.dataset.bwTab === "divider" && S.mode !== "waves";
    });
    const c = code();
    out.textContent = c.length > 14000 ? c.slice(0, 14000) + "\n… (" + Math.round(c.length / 1024) + " KB, the full code is copied)" : c;
  }
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1700);
  };
  const fileBase = () => `${S.mode === "scene" ? S.sKind : S.mode}-${S.seed}`;
  function download(name, href) {
    const a = document.createElement("a");
    a.download = name;
    a.href = href;
    a.click();
  }
  function dlSvg() {
    const url = URL.createObjectURL(new Blob([svgString({ pretty: true, crop: S.mode === "waves" })], { type: "image/svg+xml" }));
    download(fileBase() + ".svg", url);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    flash("SVG downloaded");
  }
  function dlPng() {
    const k = +S.pngScale;
    const b = build(S.mode === "waves");
    const [, , w, h] = b.vb;
    const W = Math.round(w * k), H = Math.round(h * k);
    const svg = svgString({ crop: S.mode === "waves" }).replace(/width="[^"]+" height="[^"]+"/, `width="${W}" height="${H}"`);
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      c.getContext("2d").drawImage(im, 0, 0, W, H);
      c.toBlob((blob) => {
        if (!blob) return flash("PNG export failed in this browser");
        const url = URL.createObjectURL(blob);
        download(fileBase() + (k > 1 ? "@2x" : "") + ".png", url);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        flash(`PNG downloaded · ${W} × ${H}`);
      }, "image/png");
    };
    im.onerror = () => flash("PNG export failed in this browser");
    im.src = enc(svg);
  }
  async function copyCode() {
    const text = code();
    try {
      await navigator.clipboard.writeText(text);
      flash(`Copied ${{ svg: "SVG", css: "CSS", tailwind: "Tailwind", react: "React", divider: "divider" }[tab]} · ${(text.length / 1024).toFixed(1)} KB`);
    } catch {
      flash("Copy failed. Select the code and copy it");
    }
  }
  const encodeState = () => btoa(JSON.stringify(S));
  async function share() {
    history.replaceState(null, "", "#b=" + encodeState());
    try {
      await navigator.clipboard.writeText(location.href);
      flash("Share link copied");
    } catch {
      flash("The link is in the address bar");
    }
  }

  /* ── presets ───────────────────────────────────────────── */
  const PRESETS = {
    blob: [
      ["Soft orb", { seed: 4127, bPoints: 6, bRand: 55, bLayers: 1, bFill: "gradient", palette: 0 }],
      ["Layered", { seed: 902, bPoints: 7, bRand: 60, bLayers: 3, bFill: "gradient", palette: 1 }],
      ["Pebble", { seed: 77, bPoints: 4, bRand: 30, bLayers: 1, bFill: "solid", palette: 3 }],
      ["Splash", { seed: 5531, bPoints: 11, bRand: 85, bLayers: 1, bFill: "gradient", palette: 8 }],
      ["Outline", { seed: 318, bPoints: 8, bRand: 50, bLayers: 2, bFill: "outline", bStroke: 6, palette: 2 }],
      ["Morph", { seed: 1404, bPoints: 6, bRand: 60, bLayers: 2, bFill: "gradient", bAnim: true, palette: 4 }],
    ],
    waves: [
      ["Ocean", { seed: 21, wType: "smooth", wLayers: 4, wHeight: 45, wFreq: 6, wAmp: 55, wFade: true, palette: 0 }],
      ["Calm", { seed: 8, wType: "smooth", wLayers: 1, wHeight: 30, wFreq: 3, wAmp: 50, wFade: false, palette: 4 }],
      ["Peaks", { seed: 66, wType: "peaks", wLayers: 3, wHeight: 50, wFreq: 9, wAmp: 70, wFade: true, palette: 1 }],
      ["Steps", { seed: 402, wType: "steps", wLayers: 4, wHeight: 40, wFreq: 10, wAmp: 60, wFade: true, palette: 2 }],
      ["Ribbons", { seed: 1290, wType: "smooth", wLayers: 6, wHeight: 70, wFreq: 4, wAmp: 40, wFade: true, palette: 8 }],
      ["Dunes", { seed: 314, wType: "smooth", wLayers: 3, wHeight: 55, wFreq: 5, wAmp: 80, wFade: false, palette: 9 }],
    ],
    scene: [
      ["Steps", { seed: 11, sKind: "steps", sDensity: 45, palette: 0 }],
      ["Peaks", { seed: 99, sKind: "peaks", sDensity: 55, palette: 1 }],
      ["Blob scene", { seed: 707, sKind: "blobs", sDensity: 40, sSoft: false, palette: 3 }],
      ["Aurora", { seed: 51, sKind: "blobs", sDensity: 55, sSoft: true, palette: 8 }],
      ["Confetti", { seed: 1888, sKind: "circles", sDensity: 50, palette: 5 }],
      ["Low poly", { seed: 3021, sKind: "poly", sDensity: 45, palette: 2 }],
    ],
  };
  const applyPalette = (i) => {
    const p = PALETTES[i];
    Object.assign(S, { bg: p.bg, c1: p.c[0], c2: p.c[1], c3: p.c[2] });
  };
  function presetState(p) {
    const { palette, ...rest } = p;
    const st = { ...S, ...rest };
    const pal = PALETTES[palette];
    return { ...st, bg: pal.bg, c1: pal.c[0], c2: pal.c[1], c3: pal.c[2] };
  }
  function renderPresets() {
    const keep = S;
    $("[data-bw-presets]").innerHTML = PRESETS[S.mode]
      .map(([name, p], i) => {
        S = { ...presetState(p), mode: keep.mode, size: keep.mode === "blob" ? "square" : "hd", bAnim: false };
        const showBg = keep.mode === "scene" || S.bgOn;
        const bg = keep.mode === "scene" ? "" : `background:${keep.mode === "waves" ? (lum(S.c1) > 0.6 ? "#0b1220" : "#f8fafc") : "#16171b"};`;
        const svg = svgString({ noSize: true, crop: keep.mode === "waves", par: keep.mode === "waves" ? "none" : keep.mode === "scene" ? "xMidYMid slice" : undefined });
        void showBg;
        return `<button type="button" class="bw-preset bw-preset-${keep.mode}" data-bw-preset="${i}" style="${bg}" aria-label="${name} preset">${svg}<b>${name}</b></button>`;
      })
      .join("");
    S = keep;
  }

  /* ── controls ──────────────────────────────────────────── */
  const fmt = { bPoints: String, bRand: (v) => v + "%", bLayers: String, bSize: (v) => v + "%", bRot: (v) => v + "°", bStroke: String, bDur: (v) => v + "s", wLayers: String, wHeight: (v) => v + "%", wFreq: String, wAmp: (v) => v + "%", sDensity: String };
  function sync() {
    $$("[data-bw-set]").forEach((b) => b.setAttribute("aria-pressed", String(String(S[b.dataset.bwSet]) === b.dataset.bwVal)));
    $$("[data-bw-in]").forEach((el) => {
      const k = el.dataset.bwIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else if (document.activeElement !== el) el.value = S[k];
    });
    $$("[data-bw-out]").forEach((o) => (o.textContent = fmt[o.dataset.bwOut](S[o.dataset.bwOut])));
    $$("[data-bw-only]").forEach((el) => (el.hidden = el.dataset.bwOnly !== S.mode));
    $$("[data-bw-only-fill]").forEach((el) => (el.hidden = S.bFill !== el.dataset.bwOnlyFill));
    $$("[data-bw-only-anim]").forEach((el) => (el.hidden = !S.bAnim));
    $$("[data-bw-only-kind]").forEach((el) => (el.hidden = S.sKind !== el.dataset.bwOnlyKind));
    $$("[data-bw-hide-scene]").forEach((el) => (el.hidden = S.mode === "scene"));
    $("[data-bw-custom]").hidden = S.size !== "custom";
    $$("[data-bw-kind]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.bwKind === S.sKind)));
    $$("[data-bw-pal]").forEach((b) => {
      const p = PALETTES[+b.dataset.bwPal];
      b.setAttribute("aria-pressed", String(p.c[0] === S.c1 && p.c[1] === S.c2 && p.c[2] === S.c3));
    });
    $("[data-bw-seed]").textContent = S.seed;
  }
  let saveT = 0;
  function update(full = true) {
    renderPreview();
    renderExport();
    if (full) {
      sync();
      renderPresets();
    }
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#b=" + encodeState()), 400);
  }
  function randomize() {
    S.seed = Math.floor(Math.random() * 99999);
    update(true);
  }

  $("[data-bw-kinds]").innerHTML = KINDS.map(([k, l]) => `<button type="button" class="bw-kind" data-bw-kind="${k}" aria-pressed="false">${l}</button>`).join("");
  $("[data-bw-palettes]").innerHTML = PALETTES.map((p, i) => `<button type="button" class="bw-pal" data-bw-pal="${i}" aria-pressed="false" title="${p.name}" aria-label="${p.name} palette"><i style="background:${p.bg}"></i><i style="background:${p.c[0]}"></i><i style="background:${p.c[1]}"></i><i style="background:${p.c[2]}"></i></button>`).join("");

  root.addEventListener("input", (e) => {
    const k = e.target.dataset.bwIn;
    if (!k) return;
    const el = e.target;
    if (el.type === "checkbox") S[k] = el.checked;
    else if (el.type === "color") S[k] = el.value;
    else S[k] = +el.value;
    const o = $(`[data-bw-out="${k}"]`);
    if (o && fmt[k]) o.textContent = fmt[k](S[k]);
    update(el.type === "checkbox" || e.type === "change");
  });
  root.addEventListener("change", (e) => {
    if (e.target.dataset.bwIn) update(true);
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    const set = t.closest("[data-bw-set]");
    if (set) {
      const key = set.dataset.bwSet;
      S[key] = set.dataset.bwVal;
      if (key === "mode") Object.assign(S, MODE_DEFAULTS[S.mode]);
      return update(true);
    }
    const kind = t.closest("[data-bw-kind]");
    if (kind) {
      S.sKind = kind.dataset.bwKind;
      return update(true);
    }
    const pal = t.closest("[data-bw-pal]");
    if (pal) {
      applyPalette(+pal.dataset.bwPal);
      return update(true);
    }
    const pr = t.closest("[data-bw-preset]");
    if (pr) {
      const mode = S.mode;
      S = { ...presetState(PRESETS[mode][+pr.dataset.bwPreset][1]), mode };
      return update(true);
    }
    const tb = t.closest("[data-bw-tab]");
    if (tb) {
      tab = tb.dataset.bwTab;
      return renderExport();
    }
    if (t.closest("[data-bw-random]")) return randomize();
    if (t.closest("[data-bw-copy]")) return copyCode();
    if (t.closest("[data-bw-dl-svg]")) return dlSvg();
    if (t.closest("[data-bw-dl-png]")) return dlPng();
    if (t.closest("[data-bw-share]")) return share();
  });
  // R or Space (outside form fields) regenerates
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (["input", "textarea", "select", "button"].includes(tag) || e.target.isContentEditable) {
      if (!(tag === "button" && (e.key === "r" || e.key === "R"))) return;
    }
    if (e.key === "r" || e.key === "R" || (e.key === " " && tag !== "button")) {
      e.preventDefault();
      randomize();
    }
  });

  /* ── boot ──────────────────────────────────────────────── */
  function loadHash() {
    if (!location.hash.startsWith("#b=")) return;
    try {
      const v = JSON.parse(atob(location.hash.slice(3)));
      if (v && ["blob", "waves", "scene"].includes(v.mode)) S = { ...DEFAULT, ...v };
    } catch {}
  }
  loadHash();
  update(true);
  addEventListener("hashchange", () => {
    if (location.hash.slice(3) === encodeState()) return;
    loadHash();
    update(true);
  });
})();
