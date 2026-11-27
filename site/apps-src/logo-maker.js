// NiceUI Logo Maker. Text is outlined with opentype.js (MIT) so every export is pure vector.
import { parse } from "opentype.js";

const root = document.querySelector("[data-lm]");
if (root) boot();

function boot() {
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const r2 = (v) => Math.round(v * 100) / 100;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ── data ──────────────────────────────────────────────── */
  const PALETTES = [
    ["#0ea5e9", "#6366f1"], ["#f97316", "#ef4444"], ["#10b981", "#06b6d4"], ["#8b5cf6", "#ec4899"],
    ["#111827", "#4b5563"], ["#eab308", "#f97316"], ["#2563eb", "#1e3a8a"], ["#e11d48", "#9f1239"],
    ["#14b8a6", "#0f766e"], ["#84cc16", "#16a34a"], ["#a855f7", "#6366f1"], ["#f43f5e", "#fb923c"],
  ];
  // Geometric marks drawn for NiceUI in a 100×100 box. "F" is the mark colour.
  const SHAPES = {
    orbit: `<path fill="F" fill-rule="evenodd" d="M50 8a42 42 0 1 1 0 84a42 42 0 1 1 0-84zm0 17a25 25 0 1 0 0 50a25 25 0 1 0 0-50z"/><circle fill="F" cx="50" cy="50" r="11"/>`,
    arc: `<path fill="none" stroke="F" stroke-width="14" stroke-linecap="round" d="M14 64a36 36 0 0 1 72 0"/><circle fill="F" cx="50" cy="64" r="11"/>`,
    venn: `<circle fill="F" cx="36" cy="50" r="30"/><circle fill="F" fill-opacity=".55" cx="64" cy="50" r="30"/>`,
    bars: `<rect fill="F" x="10" y="16" width="80" height="18" rx="9"/><rect fill="F" fill-opacity=".7" x="10" y="41" width="58" height="18" rx="9"/><rect fill="F" fill-opacity=".45" x="10" y="66" width="36" height="18" rx="9"/>`,
    spark: `<path fill="F" d="M50 4c3 25 21 43 46 46c-25 3-43 21-46 46c-3-25-21-43-46-46c25-3 43-21 46-46z"/>`,
    tiles: `<rect fill="F" x="10" y="10" width="36" height="36" rx="10"/><rect fill="F" fill-opacity=".55" x="54" y="10" width="36" height="36" rx="18"/><rect fill="F" fill-opacity=".55" x="10" y="54" width="36" height="36" rx="18"/><rect fill="F" x="54" y="54" width="36" height="36" rx="10"/>`,
    chevrons: `<path fill="none" stroke="F" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" d="M18 22l32 26l32-26"/><path fill="none" stroke="F" stroke-opacity=".55" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" d="M18 54l32 26l32-26"/>`,
    wave: `<path fill="none" stroke="F" stroke-width="11" stroke-linecap="round" d="M10 38c10-14 20-14 30 0s20 14 30 0s14-10 20-6"/><path fill="none" stroke="F" stroke-opacity=".55" stroke-width="11" stroke-linecap="round" d="M10 66c10-14 20-14 30 0s20 14 30 0s14-10 20-6"/>`,
    petals: `<ellipse fill="F" cx="50" cy="28" rx="15" ry="22"/><ellipse fill="F" fill-opacity=".7" cx="72" cy="50" rx="22" ry="15"/><ellipse fill="F" cx="50" cy="72" rx="15" ry="22"/><ellipse fill="F" fill-opacity=".7" cx="28" cy="50" rx="22" ry="15"/>`,
    cube: `<path fill="F" d="M50 8l38 21v42L50 92L12 71V29z" fill-opacity=".35"/><path fill="F" d="M50 8l38 21L50 50L12 29z"/><path fill="F" fill-opacity=".7" d="M50 50l38-21v42L50 92z"/>`,
    pinwheel: `<path fill="F" d="M50 50V10a40 40 0 0 1 40 40z"/><path fill="F" fill-opacity=".6" d="M50 50h40a40 40 0 0 1-40 40z"/><path fill="F" d="M50 50v40a40 40 0 0 1-40-40z"/><path fill="F" fill-opacity=".6" d="M50 50H10a40 40 0 0 1 40-40z"/>`,
    toggle: `<rect fill="F" fill-opacity=".35" x="6" y="28" width="88" height="44" rx="22"/><circle fill="F" cx="72" cy="50" r="17"/>`,
    prism: `<path fill="F" d="M50 8L92 86H8z" fill-opacity=".45"/><path fill="F" d="M50 8L92 86H50z"/>`,
    blob: `<path fill="F" d="M70 14c14 8 22 26 18 42s-16 30-34 32s-38-8-42-26s6-34 20-44s24-12 38-4z"/>`,
    hex: `<path fill="F" fill-rule="evenodd" d="M50 6l38 22v44L50 94L12 72V28zm0 22L31 39v22l19 11l19-11V39z"/>`,
    bolt: `<path fill="F" d="M58 6L18 56h28l-6 38l42-52H54z"/>`,
    stack: `<path fill="F" fill-opacity=".45" d="M50 58L10 38l40-20l40 20z" transform="translate(0 22)"/><path fill="F" fill-opacity=".7" d="M50 58L10 38l40-20l40 20z" transform="translate(0 11)"/><path fill="F" d="M50 58L10 38l40-20l40 20z"/>`,
    quote: `<path fill="F" d="M14 52c0-20 12-34 30-38l3 9c-10 4-15 11-15 19h13v32H14zm46 0c0-20 12-34 30-38l3 9c-10 4-15 11-15 19h13v32H60z"/>`,
  };
  const CONTAINERS = {
    none: null,
    circle: `<circle cx="50" cy="50" r="50"/>`,
    rounded: `<rect width="100" height="100" rx="24"/>`,
    squircle: `<path d="M50 0C88 0 100 12 100 50S88 100 50 100S0 88 0 50S12 0 50 0z"/>`,
    hexagon: `<path d="M50 0l43.3 25v50L50 100L6.7 75V25z"/>`,
    diamond: `<rect x="14.6" y="14.6" width="70.7" height="70.7" rx="14" transform="rotate(45 50 50)"/>`,
  };
  const NICE_ICONS = ["sparkles", "zap", "rocket", "leaf", "flame", "mountain", "compass", "feather", "orbit", "atom", "gem", "hexagon", "infinity", "layers", "aperture", "bird", "sun", "moon", "wind", "anchor", "shield", "cloud", "waves", "flower-2", "crown", "key-round", "globe", "brain", "bot", "cpu", "heart", "star", "target", "trophy", "box", "triangle"];

  let FONTS = [];
  const fontCache = new Map(); // "id-w" -> opentype Font
  const fontLoading = new Map();
  let ICONS = null; // [[name, [[tag, attrs]...]]]
  let iconMap = null;

  const DEFAULT = {
    name: "Lumen",
    tagline: "",
    mark: "shape",
    shape: "orbit",
    icon: "sparkles",
    mono: "L",
    container: "squircle",
    style: "fill",
    markSize: 100,
    font: "sora",
    weight: 600,
    case: "as",
    track: -2,
    layout: "side",
    gap: 22,
    c1: "#0ea5e9",
    c2: "#6366f1",
    ink: "#0b0c0e",
    grad: true,
    tintText: false,
    stage: "light",
    variant: "color",
  };
  let S = { ...DEFAULT };
  let tab = "svg";

  /* ── fonts ─────────────────────────────────────────────── */
  const fontUrl = (id, w) => `/assets/logo-fonts/${id}-${w}.woff`;
  function loadFont(id, w) {
    const key = id + "-" + w;
    if (fontCache.has(key)) return Promise.resolve(fontCache.get(key));
    if (fontLoading.has(key)) return fontLoading.get(key);
    const p = fetch(fontUrl(id, w))
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        const f = parse(buf);
        fontCache.set(key, f);
        return f;
      });
    fontLoading.set(key, p);
    return p;
  }
  const fontMeta = (id) => FONTS.find((f) => f.id === id) || FONTS[0];
  const nearestWeight = (id, w) => fontMeta(id).weights.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
  // UI previews of each family use CSS @font-face with the same files
  function cssFonts() {
    const st = document.createElement("style");
    st.textContent = FONTS.map((f) => f.weights.map((w) => `@font-face{font-family:"lm-${f.id}";src:url(${fontUrl(f.id, w)}) format("woff");font-weight:${w};font-display:swap}`).join("")).join("");
    document.head.appendChild(st);
  }

  /* ── text → vector outline ─────────────────────────────── */
  function textPath(font, text, size, trackEm) {
    const scale = size / font.unitsPerEm;
    const glyphs = font.stringToGlyphs(text);
    let x = 0;
    let d = "";
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    glyphs.forEach((g, i) => {
      const p = g.getPath(x, 0, size);
      const bb = p.getBoundingBox();
      if (bb.x1 < bb.x2) {
        x0 = Math.min(x0, bb.x1); x1 = Math.max(x1, bb.x2);
        y0 = Math.min(y0, bb.y1); y1 = Math.max(y1, bb.y2);
      }
      d += p.toPathData(2);
      x += (g.advanceWidth || 0) * scale;
      if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * scale + trackEm * size;
    });
    if (x0 === Infinity) { x0 = 0; x1 = x; y0 = -size * 0.7; y1 = 0; }
    const cap = ((font.tables.os2 && font.tables.os2.sCapHeight) || font.ascender * 0.72) * scale;
    return { d, x0, x1, y0, y1, w: x1 - x0, cap };
  }
  const applyCase = (t) => (S.case === "upper" ? t.toUpperCase() : S.case === "lower" ? t.toLowerCase() : t);

  /* ── mark ──────────────────────────────────────────────── */
  // returns { body, defs } drawn in a 100×100 box
  function markSvg(colors, monoGlyph) {
    const { mark, fg, bg, grad } = colors;
    const fill = grad ? "url(#lm-g)" : mark;
    const box = CONTAINERS[S.container];
    const contained = !!box;
    let inner = "";
    const glyphColor = !contained ? fill : S.style === "fill" ? fg : fill;
    const scale = contained ? 0.56 : 1;
    const off = (100 - 100 * scale) / 2;
    if (S.mark === "shape") inner = `<g transform="translate(${off} ${off}) scale(${scale})">${SHAPES[S.shape].replace(/"F"/g, `"${glyphColor}"`)}</g>`;
    if (S.mark === "icon" && iconMap?.has(S.icon)) {
      const els = iconMap.get(S.icon).map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${esc(v)}"`).join(" ")}/>`).join("");
      const k = (100 * scale) / 24;
      inner = `<g transform="translate(${off} ${off}) scale(${r2(k)})" fill="none" stroke="${glyphColor}" stroke-width="${contained ? 2 : 2.25}" stroke-linecap="round" stroke-linejoin="round">${els}</g>`;
    }
    if (S.mark === "mono" && monoGlyph) {
      const t = monoGlyph;
      const target = contained ? 46 : 78;
      const k = Math.min(target / Math.max(1, t.w), target / Math.max(1, t.cap));
      const x = 50 - (t.x0 + t.w / 2) * k;
      const y = 50 + (t.cap / 2) * k;
      inner = `<path fill="${glyphColor}" transform="translate(${r2(x)} ${r2(y)}) scale(${r2(k)})" d="${t.d}"/>`;
    }
    let cont = "";
    if (contained && S.style === "fill" && fg === "knockout") {
      // one-colour version: the glyph is cut out of the container
      const white = box.replace(/^<(\w+)/, '<$1 fill="#fff"');
      const hole = inner.replace(/(fill|stroke)="knockout"/g, '$1="#000"');
      return { body: `<mask id="lm-k" maskUnits="userSpaceOnUse" x="-2" y="-2" width="104" height="104">${white}${hole}</mask><rect x="-2" y="-2" width="104" height="104" fill="${fill}" mask="url(#lm-k)"/>`, bg };
    }
    if (contained) {
      if (S.style === "fill") cont = box.replace(/^<(\w+)/, `<$1 fill="${fill}"`);
      else if (S.style === "soft") cont = box.replace(/^<(\w+)/, `<$1 fill="${mark}" fill-opacity="0.14"`);
      else cont = `<g transform="translate(3 3) scale(.94)">${box.replace(/^<(\w+)/, `<$1 fill="none" stroke="${fill}" stroke-width="6.4"`)}</g>`;
    }
    return { body: cont + inner, bg };
  }

  /* ── compose the full logo ─────────────────────────────── */
  // variant: color | black | white; returns { svg, w, h, parts }
  function compose(opts = {}) {
    const variant = opts.variant || "color";
    const onDark = opts.onDark ?? false;
    const fid = S.font;
    const w = nearestWeight(fid, S.weight);
    const font = fontCache.get(fid + "-" + w);
    const tagW = fontMeta(fid).weights[0];
    const tagFont = fontCache.get(fid + "-" + tagW) || font;
    if (!font) return null;
    let mark = S.c1, accent = S.c2, ink = S.ink, fg = "#ffffff";
    let grad = S.grad;
    if (variant !== "color") {
      const c = variant === "black" ? "#0b0c0e" : "#ffffff";
      mark = accent = ink = c;
      fg = "knockout";
      grad = false;
    } else if (onDark && lum(ink) < 0.5) ink = "#f5f5f4";
    const layout = opts.layout || S.layout;
    const showMark = S.mark !== "none" && layout !== "word";
    const showWord = layout !== "mark";
    const size = 64;
    const word = showWord ? textPath(font, applyCase(S.name || " "), size, S.track / 100) : null;
    const tag = showWord && S.tagline && layout !== "mark" ? textPath(tagFont, S.tagline, size * 0.3, 0.02) : null;
    const monoGlyph = S.mark === "mono" ? textPath(font, (S.mono || (S.name || "A")[0]).slice(0, 2), 100, 0) : null;
    const M = (layout === "stack" ? 96 : 72) * (S.markSize / 100) * (showWord ? 1 : 1.6);
    const gap = S.gap;
    let parts = [];
    let W, H;
    const textColor = S.tintText && variant === "color" ? (grad ? "url(#lm-g2)" : mark) : ink;
    const tagColor = variant === "color" ? ink : ink;
    const wordSvg = (x, y) => (word ? `<path fill="${textColor}" transform="translate(${r2(x - word.x0)} ${r2(y)})" d="${word.d}"/>` : "");
    const tagSvg = (x, y, anchor = "start") => {
      if (!tag) return "";
      const tx = anchor === "middle" ? x - tag.w / 2 - tag.x0 : x - tag.x0;
      return `<path fill="${tagColor}" fill-opacity="${variant === "color" ? 0.6 : 0.75}" transform="translate(${r2(tx)} ${r2(y)})" d="${tag.d}"/>`;
    };
    const markG = (x, y, s) => {
      if (!showMark) return "";
      const m = markSvg({ mark, fg, bg: null, grad }, monoGlyph);
      return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s / 100)})">${m.body}</g>`;
    };
    // track the vertical extent of everything so descenders and tall glyphs are never clipped
    let top = 0, bottom = 0;
    const ext = (a, b) => {
      top = Math.min(top, a);
      bottom = Math.max(bottom, b);
    };
    if (layout !== "stack") {
      const textH = word ? word.cap : 0;
      const tagGap = size * 0.28;
      const blockH = textH + (tag ? tagGap + (tag.y1 - tag.y0) : 0);
      const H0 = Math.max(showMark ? M : 0, blockH);
      const my = (H0 - M) / 2;
      const tx = showMark ? M + gap : 0;
      const baseline = (H0 - blockH) / 2 + textH;
      if (showMark) {
        parts.push(markG(0, my, M));
        ext(my, my + M);
      }
      if (word) {
        parts.push(wordSvg(tx, baseline));
        ext(baseline + word.y0, baseline + word.y1);
      }
      if (tag) {
        const ty = baseline + tagGap - tag.y0;
        parts.push(tagSvg(tx, ty));
        ext(ty + tag.y0, ty + tag.y1);
      }
      W = showWord ? tx + Math.max(word ? word.w : 0, tag ? tag.w : 0) : M;
    } else {
      const textW = Math.max(word ? word.w : 0, tag ? tag.w : 0);
      W = Math.max(showMark ? M : 0, textW);
      const baseline = (showMark ? M + gap : 0) + (word ? word.cap : 0);
      if (showMark) {
        parts.push(markG((W - M) / 2, 0, M));
        ext(0, M);
      }
      if (word) {
        parts.push(`<path fill="${textColor}" transform="translate(${r2(W / 2 - word.w / 2 - word.x0)} ${r2(baseline)})" d="${word.d}"/>`);
        ext(baseline + word.y0, baseline + word.y1);
      }
      if (tag) {
        const ty = baseline + size * 0.3 - tag.y0;
        parts.push(tagSvg(W / 2, ty, "middle"));
        ext(ty + tag.y0, ty + tag.y1);
      }
    }
    H = bottom - top;
    const pad = opts.pad ?? 0;
    const defs = grad ? `<defs><linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mark}"/><stop offset="1" stop-color="${accent}"/></linearGradient><linearGradient id="lm-g2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${mark}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>` : "";
    const vw = r2(W + pad * 2), vh = r2(H + pad * 2);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(-pad)} ${r2(top - pad)} ${vw} ${vh}" width="${vw}" height="${vh}">${defs}${parts.join("")}</svg>`;
    return { svg, w: vw, h: vh };
  }
  // app icon / favicon: mark centred in a filled tile
  function appIcon(sizePx, opts = {}) {
    const mark = S.c1, accent = S.c2;
    const monoFont = fontCache.get(S.font + "-" + nearestWeight(S.font, S.weight));
    const monoGlyph = S.mark === "mono" || S.mark === "none" ? textPath(monoFont, (S.mono || (S.name || "A")[0]).slice(0, S.mark === "none" ? 1 : 2), 100, 0) : null;
    const save = { container: S.container, style: S.style, mark: S.mark };
    S.container = opts.bare ? "none" : "none";
    S.style = "fill";
    if (S.mark === "none") S.mark = "mono";
    const m = markSvg({ mark: "#ffffff", fg: "#ffffff", grad: false }, monoGlyph);
    Object.assign(S, save);
    const radius = opts.round ?? 22;
    const tile = S.grad ? `<defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mark}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="100" height="100" rx="${radius}" fill="url(#t)"/>` : `<rect width="100" height="100" rx="${radius}" fill="${mark}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${sizePx}" height="${sizePx}">${tile}<g transform="translate(18 18) scale(.64)">${m.body}</g></svg>`;
  }
  const lum = (h) => {
    const v = parseInt(h.slice(1), 16);
    const c = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => x / 255);
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  /* ── render ────────────────────────────────────────────── */
  const canvasEl = $("[data-lm-canvas]");
  const ctxEl = $("[data-lm-contexts]");
  let pending = 0;
  async function render() {
    const id = ++pending;
    const w = nearestWeight(S.font, S.weight);
    try {
      await Promise.all([loadFont(S.font, w), loadFont(S.font, fontMeta(S.font).weights[0])]);
    } catch {
      canvasEl.innerHTML = `<p class="lm-note">Could not load the font. Check your connection.</p>`;
      return;
    }
    if (S.mark === "icon" && !iconMap) await loadIcons();
    if (id !== pending) return;
    const stage = $("[data-lm-stage]");
    stage.dataset.bg = S.stage;
    const onDark = S.stage !== "light";
    const main = compose({ variant: S.stage === "brand" ? "white" : "color", onDark });
    if (!main) return;
    canvasEl.innerHTML = main.svg.replace("<svg ", `<svg class="lm-svg" role="img" aria-label="${esc(S.name)} logo" `);
    stage.style.setProperty("--brand", S.grad ? `linear-gradient(135deg, ${S.c1}, ${S.c2})` : S.c1);
    renderContexts();
    renderExport();
    saveHash();
  }
  function renderContexts() {
    const light = compose({ variant: "color" }).svg;
    const dark = compose({ variant: "color", onDark: true }).svg;
    const mono = compose({ variant: "white" }).svg;
    const icon = appIcon(64);
    const fav = appIcon(16, { round: 26 });
    const name = esc(S.name || "Brand");
    ctxEl.innerHTML = `
      <figure class="lm-ctx lm-ctx-light"><div class="lm-ctx-art">${light}</div><figcaption>Light</figcaption></figure>
      <figure class="lm-ctx lm-ctx-dark"><div class="lm-ctx-art">${dark}</div><figcaption>Dark</figcaption></figure>
      <figure class="lm-ctx lm-ctx-brand" style="background:${S.grad ? `linear-gradient(135deg,${S.c1},${S.c2})` : S.c1}"><div class="lm-ctx-art">${mono}</div><figcaption>On brand</figcaption></figure>
      <figure class="lm-ctx lm-ctx-app"><div class="lm-app">${icon}<span>${name}</span></div><figcaption>App icon</figcaption></figure>
      <figure class="lm-ctx lm-ctx-tab"><div class="lm-tab"><span class="lm-tab-fav">${fav}</span><span class="lm-tab-t">${name}: Home</span><span class="lm-tab-x">×</span></div><div class="lm-nav"><span class="lm-nav-logo">${light}</span><i></i><i></i><i></i><b>Sign up</b></div><figcaption>Browser &amp; header</figcaption></figure>`;
  }

  /* ── export ────────────────────────────────────────────── */
  const pretty = (svg) => svg.replace(/></g, ">\n  <").replace(/\n {2}<\/svg>/, "\n</svg>");
  function reactCode() {
    const c = compose({ variant: "color" });
    const w = compose({ variant: "white" });
    const k = compose({ variant: "black" });
    const inner = (svg) => svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    const vb = c.svg.match(/viewBox="([^"]+)"/)[1];
    const jsx = (s) => s.replace(/fill-rule=/g, "fillRule=").replace(/fill-opacity=/g, "fillOpacity=").replace(/stroke-width=/g, "strokeWidth=").replace(/stroke-linecap=/g, "strokeLinecap=").replace(/stroke-linejoin=/g, "strokeLinejoin=").replace(/stroke-opacity=/g, "strokeOpacity=").replace(/stop-color=/g, "stopColor=");
    const comp = (S.name || "Brand").replace(/[^a-zA-Z0-9]/g, "") || "Brand";
    return `// ${S.name || "Brand"} logo made with NiceUI Logo Maker. No dependencies.
type Variant = 'color' | 'black' | 'white';

export function ${comp}Logo({ height = 32, variant = 'color', className }: { height?: number; variant?: Variant; className?: string }) {
  const width = (height * ${c.w}) / ${c.h};
  return (
    <svg viewBox="${vb}" width={width} height={height} className={className} role="img" aria-label="${esc(S.name)}">
      {variant === 'color' && <>${jsx(inner(c.svg))}</>}
      {variant === 'black' && <>${jsx(inner(k.svg))}</>}
      {variant === 'white' && <>${jsx(inner(w.svg))}</>}
    </svg>
  );
}
`;
  }
  const faviconTags = () => `<!-- Favicon pack made with NiceUI Logo Maker -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
<link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="${S.c1}" />`;
  function exportCode() {
    if (tab === "react") return reactCode();
    if (tab === "html") return faviconTags();
    return pretty(compose({ variant: S.variant, pad: 0 }).svg);
  }
  function renderExport() {
    $$("[data-lm-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.lmTab === tab)));
  }
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  };
  const slug = () => (S.name || "logo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "logo";
  function svgToPng(svg, width, height, bg) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        const x = c.getContext("2d");
        if (bg) {
          x.fillStyle = bg;
          x.fillRect(0, 0, width, height);
        }
        x.drawImage(im, 0, 0, width, height);
        c.toBlob((b) => (b ? resolve(b) : reject()), "image/png");
      };
      im.onerror = reject;
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }
  const sized = (svg, w, h) => svg.replace(/width="[^"]+" height="[^"]+"/, `width="${w}" height="${h}"`);
  function pngOf(variant, widthPx, pad = 0) {
    const c = compose({ variant, pad });
    const h = Math.round((widthPx * c.h) / c.w);
    return svgToPng(sized(c.svg, widthPx, h), widthPx, h);
  }
  function dl(name, blob) {
    const a = document.createElement("a");
    a.download = name;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  // store-only ZIP writer
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return (u8) => {
      let c = 0xffffffff;
      for (let i = 0; i < u8.length; i++) c = t[(c ^ u8[i]) & 255] ^ (c >>> 8);
      return (c ^ 0xffffffff) >>> 0;
    };
  })();
  async function zip(files) {
    const enc = new TextEncoder();
    const chunks = [], central = [];
    let offset = 0;
    for (const f of files) {
      const data = typeof f.data === "string" ? enc.encode(f.data) : new Uint8Array(await f.data.arrayBuffer());
      const name = enc.encode(f.name);
      const crc = CRC(data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, name.length, true);
      chunks.push(new Uint8Array(local.buffer), name, data);
      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true);
      cen.setUint16(4, 20, true);
      cen.setUint16(6, 20, true);
      cen.setUint32(16, crc, true);
      cen.setUint32(20, data.length, true);
      cen.setUint32(24, data.length, true);
      cen.setUint16(28, name.length, true);
      cen.setUint32(42, offset, true);
      central.push(new Uint8Array(cen.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const cenSize = central.reduce((a, c) => a + c.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, cenSize, true);
    end.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: "application/zip" });
  }
  async function downloadKit() {
    flash("Building your kit…");
    const n = slug();
    const markOnly = (variant) => compose({ variant, layout: "mark" }).svg;
    const wordOnly = (variant) => compose({ variant, layout: "word" }).svg;
    const files = [
      { name: `${n}-logo.svg`, data: pretty(compose({ variant: "color" }).svg) },
      { name: `${n}-logo-black.svg`, data: pretty(compose({ variant: "black" }).svg) },
      { name: `${n}-logo-white.svg`, data: pretty(compose({ variant: "white" }).svg) },
      { name: `${n}-logo-on-dark.svg`, data: pretty(compose({ variant: "color", onDark: true }).svg) },
      { name: `${n}-logo@2x.png`, data: await pngOf("color", 1600) },
      { name: `${n}-logo-white@2x.png`, data: await pngOf("white", 1600) },
    ];
    if (S.mark !== "none") files.push({ name: `${n}-mark.svg`, data: pretty(markOnly("color")) }, { name: `${n}-mark.png`, data: await svgToPng(sized(markOnly("color"), 1024, 1024), 1024, 1024) });
    files.push({ name: `${n}-wordmark.svg`, data: pretty(wordOnly("color")) });
    const ic = (px, round) => svgToPng(appIcon(px, { round }), px, px);
    files.push(
      { name: "favicon/favicon.svg", data: appIcon(32, { round: 24 }) },
      { name: "favicon/favicon-16.png", data: await ic(16, 26) },
      { name: "favicon/favicon-32.png", data: await ic(32, 24) },
      { name: "favicon/apple-touch-icon.png", data: await ic(180, 0) },
      { name: "favicon/icon-192.png", data: await ic(192, 22) },
      { name: "favicon/icon-512.png", data: await ic(512, 22) },
      { name: "favicon/site.webmanifest", data: JSON.stringify({ name: S.name, short_name: S.name, icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }], theme_color: S.c1, background_color: "#ffffff", display: "standalone" }, null, 2) },
      { name: "favicon/head-tags.html", data: faviconTags() },
      { name: "README.txt", data: `${S.name} logo kit, made with NiceUI Logo Maker (https://niceui.dev/apps/logo-maker).\n\nFont: ${fontMeta(S.font).label} (SIL Open Font License). Text is outlined, so no font install is needed.\n${S.mark === "icon" ? `Icon: "${S.icon}" from Lucide (ISC licence).\n` : ""}\nPut the files in /favicon at your site root and paste head-tags.html into <head>.\n` }
    );
    dl(`${n}-logo-kit.zip`, await zip(files));
    flash(`Downloaded ${files.length} files`);
  }

  /* ── controls ──────────────────────────────────────────── */
  async function loadIcons() {
    if (ICONS) return;
    try {
      ICONS = await fetch("/apps/icon-studio-icons.json").then((r) => r.json());
    } catch {
      ICONS = [];
    }
    iconMap = new Map(ICONS);
    renderIcons();
  }
  function iconSvg(name, size = 22) {
    const els = iconMap?.get(name);
    if (!els) return "";
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${els.map(([t, a]) => `<${t} ${Object.entries(a).map(([k, v]) => `${k}="${esc(v)}"`).join(" ")}/>`).join("")}</svg>`;
  }
  function renderIcons() {
    const box = $("[data-lm-icons]");
    if (!ICONS) return;
    const q = ($("[data-lm-search]").value || "").trim().toLowerCase();
    const list = q ? ICONS.filter(([n]) => n.includes(q)).slice(0, 120).map(([n]) => n) : NICE_ICONS.filter((n) => iconMap.has(n));
    box.innerHTML = list.length ? list.map((n) => `<button type="button" class="lm-cell" data-lm-icon="${n}" aria-pressed="${S.icon === n}" title="${n}" aria-label="${n}">${iconSvg(n)}</button>`).join("") : `<p class="lm-note">No icons match “${esc(q)}”.</p>`;
  }
  function renderStatic() {
    $("[data-lm-shapes]").innerHTML = Object.entries(SHAPES).map(([id, body]) => `<button type="button" class="lm-cell" data-lm-shape="${id}" aria-pressed="false" title="${id}" aria-label="${id} mark"><svg viewBox="0 0 100 100" width="24" height="24" aria-hidden="true">${body.replace(/"F"/g, '"currentColor"')}</svg></button>`).join("");
    $("[data-lm-containers]").innerHTML = Object.entries(CONTAINERS).map(([id, body]) => `<button type="button" class="lm-cell lm-cont" data-lm-container="${id}" aria-pressed="false" title="${id}" aria-label="${id} container">${body ? `<svg viewBox="-4 -4 108 108" width="22" height="22" aria-hidden="true">${body.replace(/^<(\w+)/, '<$1 fill="none" stroke="currentColor" stroke-width="8"')}</svg>` : "∅"}</button>`).join("");
    $("[data-lm-palettes]").innerHTML = PALETTES.map(([a, b], i) => `<button type="button" class="lm-pal" data-lm-pal="${i}" aria-label="Palette ${i + 1}" style="background:linear-gradient(135deg,${a},${b})"></button>`).join("");
    $("[data-lm-fonts]").innerHTML = FONTS.map((f) => `<button type="button" class="lm-font" data-lm-font="${f.id}" aria-pressed="false" style="font-family:'lm-${f.id}';font-weight:${f.weights[Math.min(1, f.weights.length - 1)]}"><b>${esc(f.label)}</b><i>${f.cat}</i></button>`).join("");
  }
  function sync() {
    $$("[data-lm-set]").forEach((b) => b.setAttribute("aria-pressed", String(String(S[b.dataset.lmSet]) === b.dataset.lmVal)));
    $$("[data-lm-text]").forEach((el) => {
      if (document.activeElement !== el) el.value = S[el.dataset.lmText] || "";
    });
    $$("[data-lm-in]").forEach((el) => {
      const k = el.dataset.lmIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else el.value = S[k];
    });
    $$("[data-lm-out]").forEach((o) => {
      const k = o.dataset.lmOut;
      o.textContent = k === "markSize" ? S[k] + "%" : String(S[k]);
    });
    $$("[data-lm-only]").forEach((el) => (el.hidden = !el.dataset.lmOnly.split(" ").includes(S.mark)));
    $$("[data-lm-shape]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lmShape === S.shape)));
    $$("[data-lm-icon]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lmIcon === S.icon)));
    $$("[data-lm-container]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lmContainer === S.container)));
    $$("[data-lm-font]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lmFont === S.font)));
    const meta = fontMeta(S.font);
    $("[data-lm-weights]").innerHTML = meta.weights.length > 1 ? `<div class="gm-seg lm-seg" role="group" aria-label="Weight" style="grid-template-columns:repeat(${meta.weights.length},1fr)">${meta.weights.map((w) => `<button type="button" data-lm-weight="${w}" aria-pressed="${nearestWeight(S.font, S.weight) === w}" style="font-weight:${w}">${{ 400: "Regular", 500: "Medium", 600: "Semibold", 700: "Bold", 800: "Heavy" }[w] || w}</button>`).join("")}</div>` : "";
    $(".lm-export .lm-seg").hidden = tab !== "svg";
  }
  let saveT = 0;
  function saveHash() {
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#l=" + btoa(unescape(encodeURIComponent(JSON.stringify(S))))), 400);
  }
  let rT = 0;
  const update = (now = false) => {
    sync();
    clearTimeout(rT);
    if (now) render();
    else rT = setTimeout(render, 60);
  };

  root.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.lmText) {
      S[t.dataset.lmText] = t.value;
      if (t.dataset.lmText === "name" && S.mark === "mono") S.mono = (t.value.trim()[0] || "A").toUpperCase();
      return update();
    }
    if (t.matches("[data-lm-search]")) return renderIcons();
    const k = t.dataset.lmIn;
    if (!k) return;
    S[k] = t.type === "checkbox" ? t.checked : t.type === "color" ? t.value : +t.value;
    update();
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    const set = t.closest("[data-lm-set]");
    if (set) {
      S[set.dataset.lmSet] = set.dataset.lmVal;
      if (set.dataset.lmSet === "mark" && S.mark === "icon") loadIcons();
      if (set.dataset.lmSet === "mark" && S.mark === "mono" && !S.mono) S.mono = (S.name[0] || "A").toUpperCase();
      return update(true);
    }
    const pick = (attr, key) => {
      const el = t.closest(`[data-lm-${attr}]`);
      if (!el) return false;
      S[key] = el.dataset["lm" + attr[0].toUpperCase() + attr.slice(1)];
      update(true);
      return true;
    };
    if (pick("shape", "shape") || pick("icon", "icon") || pick("container", "container")) return;
    const fo = t.closest("[data-lm-font]");
    if (fo) {
      S.font = fo.dataset.lmFont;
      S.weight = nearestWeight(S.font, S.weight);
      return update(true);
    }
    const we = t.closest("[data-lm-weight]");
    if (we) {
      S.weight = +we.dataset.lmWeight;
      return update(true);
    }
    const pa = t.closest("[data-lm-pal]");
    if (pa) {
      [S.c1, S.c2] = PALETTES[+pa.dataset.lmPal];
      return update(true);
    }
    const tb = t.closest("[data-lm-tab]");
    if (tb) {
      tab = tb.dataset.lmTab;
      renderExport();
      sync();
      return;
    }
    if (t.closest("[data-lm-inspire]")) return inspire();
    if (t.closest("[data-lm-zip]")) return downloadKit().catch(() => flash("Export failed in this browser"));
    if (t.closest("[data-lm-svg]")) return dl(`${slug()}-logo${S.variant === "color" ? "" : "-" + S.variant}.svg`, new Blob([pretty(compose({ variant: S.variant }).svg)], { type: "image/svg+xml" }));
    if (t.closest("[data-lm-png]")) return pngOf(S.variant, 1600).then((b) => (dl(`${slug()}-logo@2x.png`, b), flash("PNG downloaded · 1600 px wide")));
    if (t.closest("[data-lm-copy]")) {
      const code = exportCode();
      navigator.clipboard.writeText(code).then(
        () => flash(`Copied ${{ svg: "SVG", react: "React component", html: "favicon tags" }[tab]}`),
        () => flash("Copy failed")
      );
    }
  });
  function inspire() {
    const rnd = (a) => a[Math.floor(Math.random() * a.length)];
    const f = rnd(FONTS.filter((x) => x.cat !== "Script" || Math.random() < 0.3));
    const [c1, c2] = rnd(PALETTES);
    const mark = rnd(["shape", "shape", "icon", "mono"]);
    Object.assign(S, {
      font: f.id,
      weight: rnd(f.weights.length > 1 ? f.weights.slice(1) : f.weights),
      mark,
      shape: rnd(Object.keys(SHAPES)),
      icon: rnd(NICE_ICONS),
      container: rnd(["none", "none", "circle", "rounded", "squircle", "hexagon"]),
      style: rnd(["fill", "fill", "soft", "outline"]),
      c1,
      c2,
      grad: Math.random() < 0.55,
      case: rnd(["as", "as", "lower", "upper"]),
      track: f.cat === "Mono" ? 0 : rnd([-4, -2, 0, 2, 8]),
      layout: rnd(["side", "side", "side", "stack"]),
    });
    if (mark === "icon") loadIcons();
    if (mark === "mono") S.mono = (S.name[0] || "A").toUpperCase();
    update(true);
  }

  /* ── boot ──────────────────────────────────────────────── */
  fetch("/assets/logo-fonts/fonts.json")
    .then((r) => r.json())
    .then((list) => {
      FONTS = list;
      try {
        if (location.hash.startsWith("#l=")) {
          const v = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3)))));
          if (v && FONTS.some((f) => f.id === v.font)) S = { ...DEFAULT, ...v };
        }
      } catch {}
      cssFonts();
      renderStatic();
      if (S.mark === "icon") loadIcons();
      else setTimeout(loadIcons, 1500);
      update(true);
    });
}
