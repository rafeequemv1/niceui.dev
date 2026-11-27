/* NiceUI Pattern Maker — seamless SVG background patterns. Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-pm]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const r2 = (v) => Math.round(v * 100) / 100;

  const DEFAULT = { type: "dots", size: 24, stroke: 1.5, rot: 0, fg: "#7dd3fc", fgA: 0.4, fg2: "#a78bfa", bg: "#020617", bgOn: true, mask: "radial", anim: false };
  let S = { ...DEFAULT };
  let tab = "css";

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
  };
  function hex2rgb(h) {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  const TWO = new Set(["crosshatch", "checker", "rings", "cubes"]);

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

  /* ── preview ────────────────────────────────────────────── */
  const stage = $("[data-pm-stage]");
  const layer = $("[data-pm-layer]");
  let kfEl = null;
  function renderPreview() {
    stage.style.backgroundColor = S.bgOn ? S.bg : "transparent";
    stage.classList.toggle("pm-transparent", !S.bgOn);
    const [lr, lg, lb] = hex2rgb(S.bg);
    stage.classList.toggle("pm-light", S.bgOn && 0.2126 * lr + 0.7152 * lg + 0.0722 * lb > 150);
    layer.style.backgroundImage = imageUrl();
    layer.style.backgroundSize = sizeVal();
    layer.style.backgroundRepeat = rotated() ? "no-repeat" : "repeat";
    const m = MASKS[S.mask];
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
    $$("[data-pm-sw]").forEach((el) => {
      S = { ...keep, type: el.dataset.pmSw, rot: 0, size: el.dataset.pmSw === "graph" || el.dataset.pmSw === "topo" ? 10 : 14, stroke: Math.min(keep.stroke, 2), fgA: Math.max(0.45, keep.fgA) };
      el.style.backgroundColor = keep.bgOn ? keep.bg : "#000";
      el.style.backgroundImage = `url("${enc(svgTile())}")`;
      el.style.backgroundSize = `${tile().w}px ${tile().h}px`;
    });
    S = keep;
  }

  /* ── export ─────────────────────────────────────────────── */
  const tw = (v) => v.replace(/\s*,\s*/g, ",").replace(/ /g, "_");
  function code() {
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
    $$("[data-pm-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.pmTab === tab)));
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
      flash(`Copied ${{ css: "CSS", tailwind: "Tailwind", svg: "SVG", react: "React" }[tab]} · ${text.split("\n").length} lines`);
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
      // fade
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
      }
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
  ];
  const presetsEl = $("[data-pm-presets]");
  function renderPresets() {
    const keep = S;
    presetsEl.innerHTML = PRESETS.map(([name, p], i) => {
      S = { ...DEFAULT, ...p, rot: 0, anim: false };
      const bg = `background-color:${S.bg};background-image:url(&quot;${enc(svgTile())}&quot;);background-size:${tile().w}px ${tile().h}px`;
      return `<button type="button" class="gm-preset" data-pm-preset="${i}"><span style="${bg}"></span><b>${name}</b></button>`;
    }).join("");
    S = keep;
  }

  /* ── controls ───────────────────────────────────────────── */
  const fmt = { size: (v) => v + "px", stroke: (v) => String(v), rot: (v) => v + "°", fgA: (v) => v + "%" };
  function syncControls() {
    $$("[data-pm-type]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.pmType === S.type)));
    $$("[data-pm-mask]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pmMask === S.mask)));
    $$("[data-pm-in]").forEach((el) => {
      const k = el.dataset.pmIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else if (k === "fgA") el.value = Math.round(S.fgA * 100);
      else el.value = S[k];
    });
    $$("[data-pm-out]").forEach((o) => {
      const k = o.dataset.pmOut;
      o.textContent = fmt[k](k === "fgA" ? Math.round(S.fgA * 100) : S[k]);
    });
    $("[data-pm-two]").hidden = !TWO.has(S.type);
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
    else if (k === "fgA") S.fgA = +e.target.value / 100;
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
    const t = e.target.closest("[data-pm-type]");
    if (t) {
      S.type = t.dataset.pmType;
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
      const types = Object.keys(GEN);
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
        fgA: 0.3 + Math.random() * 0.35,
        mask: ["none", "radial", "top", "bottom", "sides"][Math.floor(Math.random() * 5)],
      };
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
    const types = Object.keys(GEN);
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
      if (v && GEN[v.type]) S = { ...DEFAULT, ...v };
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
