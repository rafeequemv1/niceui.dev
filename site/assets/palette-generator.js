/* NiceUI Palette Generator — OKLCH palettes, image extraction, Tailwind scales, contrast. Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-pg]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ── colour maths: sRGB ⇄ OKLab ⇄ OKLCH ───────────────── */
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  const hexToRgb = (h) => {
    h = h.replace("#", "");
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    const v = parseInt(h, 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  function rgbToOklab([r, g, b]) {
    [r, g, b] = [r, g, b].map((v) => toLin(v / 255));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  function oklabToLinRgb([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  }
  const lchToLab = ([L, C, h]) => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];
  const labToLch = ([L, a, b]) => [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
  const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);
  // OKLCH → hex, reducing chroma until the colour fits in sRGB
  function oklch(L, C, h) {
    L = clamp(L, 0, 1);
    let lo = 0, hi = Math.max(0, C);
    let rgb = oklabToLinRgb(lchToLab([L, hi, h]));
    if (!inGamut(rgb)) {
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (inGamut(oklabToLinRgb(lchToLab([L, mid, h])))) lo = mid;
        else hi = mid;
      }
      rgb = oklabToLinRgb(lchToLab([L, lo, h]));
    }
    return rgbToHex(...rgb.map((v) => toGam(clamp(v, 0, 1)) * 255));
  }
  const hexToLch = (hex) => labToLch(rgbToOklab(hexToRgb(hex)));
  const lum = (hex) => {
    const [r, g, b] = hexToRgb(hex).map((v) => toLin(v / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const textOn = (hex) => (contrast(hex, "#ffffff") >= contrast(hex, "#0b0c0e") ? "#ffffff" : "#0b0c0e");
  function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }
  const fmtOklch = (hex) => {
    const [L, C, h] = hexToLch(hex);
    return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${C < 0.002 ? 0 : h.toFixed(1)})`;
  };

  /* ── colour names (rough, for labels) ─────────────────── */
  function nameOf(hex) {
    const [L, C, h] = hexToLch(hex);
    const tone = L > 0.9 ? "Pale " : L > 0.75 ? "Light " : L < 0.3 ? "Deep " : L < 0.45 ? "Dark " : "";
    if (C < 0.025) return L > 0.96 ? "White" : L < 0.18 ? "Black" : tone + (C < 0.012 ? "Grey" : "Stone");
    const hues = [[20, "Rose"], [40, "Coral"], [60, "Orange"], [80, "Amber"], [100, "Gold"], [115, "Lime"], [140, "Green"], [165, "Emerald"], [190, "Teal"], [215, "Cyan"], [240, "Sky"], [265, "Blue"], [285, "Indigo"], [305, "Violet"], [330, "Purple"], [350, "Pink"], [361, "Red"]];
    let n = "Red";
    for (const [lim, nm] of hues) if (h < lim) { n = nm; break; }
    if (C < 0.06 && (n === "Orange" || n === "Amber" || n === "Gold")) n = L > 0.6 ? "Sand" : "Brown";
    return tone + n;
  }

  /* ── state + history ──────────────────────────────────── */
  const LIB = JSON.parse(document.getElementById("pg-library")?.textContent || "[]");
  let S = { colors: ["#0ea5e9", "#6366f1", "#f472b6", "#fbbf24", "#0f172a"], locks: [false, false, false, false, false], mode: "auto", sel: 0 };
  let past = [], future = [];
  const snap = () => JSON.stringify({ colors: S.colors, locks: S.locks });
  function commit() {
    past.push(snap());
    if (past.length > 80) past.shift();
    future = [];
  }
  function undo() {
    if (!past.length) return flash("Nothing to undo");
    future.push(snap());
    Object.assign(S, JSON.parse(past.pop()));
    S.sel = clamp(S.sel, 0, S.colors.length - 1);
    render();
  }
  function redo() {
    if (!future.length) return flash("Nothing to redo");
    past.push(snap());
    Object.assign(S, JSON.parse(future.pop()));
    S.sel = clamp(S.sel, 0, S.colors.length - 1);
    render();
  }

  /* ── generation in OKLCH ──────────────────────────────── */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function lightSpread(n, lo, hi) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(hi - ((hi - lo) * i) / Math.max(1, n - 1) + rnd(-0.03, 0.03));
    return out;
  }
  function generate(mode = S.mode) {
    const n = S.colors.length;
    const lockedIdx = S.locks.map((l, i) => (l ? i : -1)).filter((i) => i >= 0);
    const anchor = lockedIdx.length ? hexToLch(S.colors[lockedIdx[0]]) : null;
    const m = mode === "auto" ? pick(["analogous", "analogous", "complementary", "split", "triadic", "monochromatic", "pastel", "vivid", "earthy", "tetradic"]) : mode;
    const h0 = anchor && anchor[1] > 0.03 ? anchor[2] : rnd(0, 360);
    let hues, Ls, Cs;
    const cyc = (offs) => Array.from({ length: n }, (_, i) => (h0 + offs[i % offs.length] + rnd(-6, 6) + 360) % 360);
    switch (m) {
      case "analogous": hues = Array.from({ length: n }, (_, i) => (h0 + (i - (n - 1) / 2) * rnd(14, 24) + 360) % 360); Ls = lightSpread(n, 0.3, 0.92); Cs = Ls.map(() => rnd(0.08, 0.17)); break;
      case "monochromatic": hues = cyc([0]); Ls = lightSpread(n, 0.22, 0.96); Cs = Ls.map((L) => (0.05 + 0.15 * Math.sin(Math.PI * L)) * rnd(0.8, 1.1)); break;
      case "complementary": hues = Array.from({ length: n }, (_, i) => (h0 + (i % 2 ? 180 : 0) + rnd(-10, 10) + 360) % 360); Ls = lightSpread(n, 0.28, 0.93); Cs = Ls.map(() => rnd(0.07, 0.16)); break;
      case "split": hues = cyc([0, 150, 210]); Ls = lightSpread(n, 0.3, 0.92); Cs = Ls.map(() => rnd(0.08, 0.16)); break;
      case "triadic": hues = cyc([0, 120, 240]); Ls = lightSpread(n, 0.32, 0.9); Cs = Ls.map(() => rnd(0.09, 0.17)); break;
      case "tetradic": hues = cyc([0, 90, 180, 270]); Ls = lightSpread(n, 0.32, 0.9); Cs = Ls.map(() => rnd(0.08, 0.16)); break;
      case "pastel": hues = Array.from({ length: n }, (_, i) => (h0 + (i * 360) / n * rnd(0.35, 0.6) + 360) % 360); Ls = hues.map(() => rnd(0.84, 0.95)); Cs = hues.map(() => rnd(0.04, 0.09)); break;
      case "vivid": hues = Array.from({ length: n }, (_, i) => (h0 + (i * 360) / n * rnd(0.5, 0.9) + 360) % 360); Ls = hues.map(() => rnd(0.58, 0.78)); Cs = hues.map(() => rnd(0.17, 0.26)); break;
      case "earthy": hues = Array.from({ length: n }, () => rnd(35, 120)); Ls = lightSpread(n, 0.28, 0.9); Cs = Ls.map(() => rnd(0.03, 0.09)); break;
      case "dark": hues = cyc([0, 0, 20, 0, 180]); Ls = lightSpread(n, 0.14, 0.42); Cs = Ls.map(() => rnd(0.02, 0.06)); { const k = Math.floor(rnd(1, n)); Ls[k] = rnd(0.68, 0.8); Cs[k] = rnd(0.14, 0.2); } break;
      default: hues = cyc([0]); Ls = lightSpread(n, 0.3, 0.9); Cs = Ls.map(() => 0.1);
    }
    const out = S.colors.map((c, i) => (S.locks[i] ? c : oklch(clamp(Ls[i], 0.08, 0.98), Cs[i], hues[i])));
    return out;
  }
  function doGenerate() {
    commit();
    S.colors = generate();
    render();
  }

  /* ── columns ──────────────────────────────────────────── */
  const colsEl = $("[data-pg-cols]");
  const ICON = {
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    unlock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    drag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    pick: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>',
    scale: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 10h12M4 14h8M4 18h4"/></svg>',
  };
  function renderCols() {
    colsEl.innerHTML = S.colors
      .map((c, i) => {
        const t = textOn(c);
        const locked = S.locks[i];
        return `<div class="pg-col${i === S.sel ? " sel" : ""}${locked ? " locked" : ""}" role="listitem" tabindex="0" data-i="${i}" style="--c:${c};--t:${t}" aria-label="Colour ${i + 1}, ${c}, ${nameOf(c)}${locked ? ", locked" : ""}">
          <div class="pg-col-tools">
            <button type="button" class="pg-tb" data-pg-lock="${i}" aria-pressed="${locked}" aria-label="${locked ? "Unlock" : "Lock"} colour ${i + 1}" title="${locked ? "Unlock" : "Lock"} (L)">${locked ? ICON.lock : ICON.unlock}</button>
            <button type="button" class="pg-tb" data-pg-copyhex="${i}" aria-label="Copy ${c}" title="Copy hex (C)">${ICON.copy}</button>
            <label class="pg-tb" title="Pick colour"><input type="color" value="${c}" data-pg-pick="${i}" aria-label="Pick colour ${i + 1}" />${ICON.pick}</label>
            <button type="button" class="pg-tb" data-pg-scale="${i}" aria-label="Tailwind scale for colour ${i + 1}" title="Tailwind scale">${ICON.scale}</button>
            <span class="pg-tb pg-drag" draggable="true" data-pg-drag="${i}" aria-hidden="true" title="Drag to reorder (Alt + arrows)">${ICON.drag}</span>
            ${S.colors.length > 2 ? `<button type="button" class="pg-tb" data-pg-del="${i}" aria-label="Remove colour ${i + 1}" title="Remove">${ICON.x}</button>` : ""}
          </div>
          <div class="pg-col-info">
            <input class="pg-hex" value="${c.slice(1).toUpperCase()}" maxlength="7" spellcheck="false" data-pg-hex="${i}" aria-label="Hex for colour ${i + 1}" />
            <span class="pg-name">${nameOf(c)}</span>
          </div>
        </div>`;
      })
      .join("");
    $("[data-pg-count]").textContent = S.colors.length;
  }

  /* ── roles for the UI preview & theme exports ─────────── */
  function roles() {
    const info = S.colors.map((c) => {
      const [L, C] = hexToLch(c);
      return { c, L, C };
    });
    const byL = [...info].sort((a, b) => b.L - a.L);
    const bg = byL[0].c;
    const text = byL[byL.length - 1].c;
    const mids = info.filter((x) => x.c !== bg && x.c !== text);
    const pool = mids.length ? mids : info;
    const primary = [...pool].sort((a, b) => b.C - a.C)[0].c;
    const rest = pool.filter((x) => x.c !== primary);
    const accent = (rest.length ? [...rest].sort((a, b) => b.C - a.C)[0] : pool[0]).c;
    const surface = byL[1] && byL[1].c !== primary ? byL[1].c : oklch(Math.max(0, byL[0].L - 0.04), hexToLch(bg)[1], hexToLch(bg)[2]);
    return { bg, surface, primary, accent, text };
  }

  /* ── tabs: preview / contrast / scale / image ─────────── */
  let tab = "preview";
  function renderPreview() {
    const r = roles();
    const muted = contrast(r.text, r.bg) > 7 ? r.text + "b3" : r.text;
    const bars = [62, 88, 46, 74, 100, 58, 80];
    const barCols = S.colors.filter((c) => contrast(c, r.bg) > 1.35);
    if (!barCols.length) barCols.push(r.primary);
    $('[data-pg-pane="preview"]').innerHTML = `
      <div class="pg-ui" style="--bg:${r.bg};--sf:${r.surface};--pr:${r.primary};--ac:${r.accent};--tx:${r.text};--mu:${muted};--on-pr:${textOn(r.primary)};--on-ac:${textOn(r.accent)}">
        <div class="pg-ui-hero">
          <div class="pg-ui-nav"><b>◆ Acme</b><span>Product</span><span>Pricing</span><span>Docs</span><i>Sign in</i></div>
          <span class="pg-ui-badge">New · Version 2.0</span>
          <p class="pg-ui-h">Ship faster with a palette that works.</p>
          <p class="pg-ui-p">Every colour has a job: background, surface, primary action, accent and text.</p>
          <div class="pg-ui-btns"><span class="pg-ui-b1">Get started</span><span class="pg-ui-b2">Live demo</span></div>
        </div>
        <div class="pg-ui-dash">
          <div class="pg-ui-card"><span>Revenue</span><b>$48.2k</b><em>+12.4%</em></div>
          <div class="pg-ui-card"><span>Active users</span><b>9,341</b><em class="ac">+3.1%</em></div>
          <div class="pg-ui-card pg-ui-chart"><span>This week</span><div class="pg-ui-bars">${bars.map((h, i) => `<i style="height:${h}%;background:${barCols[i % barCols.length]}"></i>`).join("")}</div></div>
        </div>
        <ul class="pg-roles">${Object.entries({ Background: r.bg, Surface: r.surface, Primary: r.primary, Accent: r.accent, Text: r.text })
          .map(([k, v]) => `<li><i style="background:${v}"></i>${k}<code>${v}</code></li>`)
          .join("")}</ul>
      </div>`;
  }
  const badge = (ratio) => (ratio >= 7 ? '<em class="aaa">AAA</em>' : ratio >= 4.5 ? '<em class="aa">AA</em>' : ratio >= 3 ? '<em class="lg">AA large</em>' : '<em class="no">Fail</em>');
  function renderContrast() {
    const cs = S.colors;
    const head = `<tr><th scope="col"><span class="sr-only">Text on background</span></th>${cs.map((c) => `<th scope="col"><i style="background:${c}"></i>${c.toUpperCase()}</th>`).join("")}</tr>`;
    const rows = cs
      .map(
        (fg) =>
          `<tr><th scope="row"><i style="background:${fg}"></i>${fg.toUpperCase()}</th>${cs
            .map((bg) => {
              if (fg === bg) return `<td class="same">—</td>`;
              const r = contrast(fg, bg);
              return `<td style="background:${bg};color:${fg}" title="${fg} on ${bg}: ${r.toFixed(2)}:1"><b>${r.toFixed(2)}</b>${badge(r)}</td>`;
            })
            .join("")}</tr>`
      )
      .join("");
    const best = cs
      .map((c) => {
        const t = textOn(c);
        const r = contrast(c, t);
        return `<li style="background:${c};color:${t}"><b>Aa</b><span>${t === "#ffffff" ? "White" : "Black"} text · ${r.toFixed(1)}:1</span></li>`;
      })
      .join("");
    $('[data-pg-pane="contrast"]').innerHTML = `<div class="pg-contrast"><div class="pg-ctable-wrap"><table class="pg-ctable"><caption class="sr-only">WCAG contrast: rows are text colours, columns are backgrounds</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div><div><p class="pg-small">Best text colour on each swatch</p><ul class="pg-best">${best}</ul><p class="pg-small mute">AA needs 4.5:1 for body text and 3:1 for large text; AAA needs 7:1.</p></div></div>`;
  }
  // Tailwind-style 50–950 scale built in OKLCH around one colour
  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const TL = [0.971, 0.936, 0.885, 0.808, 0.704, 0.637, 0.577, 0.505, 0.444, 0.393, 0.282];
  const TC = [0.14, 0.3, 0.52, 0.78, 0.95, 1, 0.98, 0.88, 0.75, 0.62, 0.45];
  function scaleFor(hex) {
    const [L, C, h] = hexToLch(hex);
    let k = 0;
    TL.forEach((t, i) => {
      if (Math.abs(t - L) < Math.abs(TL[k] - L)) k = i;
    });
    const dL = L - TL[k];
    const peak = C / TC[k];
    return STEPS.map((step, i) => {
      if (i === k) return { step, hex: hex.toLowerCase(), base: true };
      const fall = Math.max(0, 1 - Math.abs(i - k) / 4);
      return { step, hex: oklch(clamp(TL[i] + dL * fall, 0.08, 0.985), peak * TC[i], h) };
    });
  }
  let scaleName = "";
  function renderScale() {
    const c = S.colors[S.sel] || S.colors[0];
    const sc = scaleFor(c);
    const nm = scaleName || nameOf(c).split(" ").pop().toLowerCase();
    const v3 = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${nm}: {\n${sc.map((s) => `          ${s.step}: '${s.hex}',`).join("\n")}\n        },\n      },\n    },\n  },\n};`;
    const v4 = `/* Tailwind v4: app.css */\n@theme {\n${sc.map((s) => `  --color-${nm}-${s.step}: ${fmtOklch(s.hex)};`).join("\n")}\n}`;
    $('[data-pg-pane="scale"]').innerHTML = `
      <div class="pg-scale-head">
        <span class="pg-scale-sw" style="background:${c}"></span>
        <label class="pg-scale-name"><span>Name</span><input value="${esc(nm)}" data-pg-sname maxlength="20" spellcheck="false" /></label>
        <span class="pg-small mute">Built from colour ${S.sel + 1}. Click the scale icon on any colour to switch.</span>
      </div>
      <div class="pg-scale">${sc.map((s) => `<button type="button" class="pg-step${s.base ? " base" : ""}" style="background:${s.hex};color:${textOn(s.hex)}" data-copy-hex="${s.hex}" title="Copy ${s.hex}"><b>${s.step}</b><span>${s.hex}</span></button>`).join("")}</div>
      <div class="pg-scale-out">
        <div><div class="pg-scale-bar"><span>Tailwind v3 config</span><button type="button" class="btn btn-cmd" data-copy-text="v3">Copy</button></div><pre class="gm-code"><code>${esc(v3)}</code></pre></div>
        <div><div class="pg-scale-bar"><span>Tailwind v4 @theme</span><button type="button" class="btn btn-cmd" data-copy-text="v4">Copy</button></div><pre class="gm-code"><code>${esc(v4)}</code></pre></div>
      </div>`;
    $('[data-pg-pane="scale"]')._texts = { v3, v4 };
  }
  function renderTab() {
    $$("[data-pg-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.pgTab === tab)));
    $$("[data-pg-pane]").forEach((p) => (p.hidden = p.dataset.pgPane !== tab));
    if (tab === "preview") renderPreview();
    if (tab === "contrast") renderContrast();
    if (tab === "scale") renderScale();
  }

  /* ── image → palette (k-means in OKLab) ───────────────── */
  let imgPixels = null; // { lab: Float32Array, xy: Uint16Array, n, w, h }
  function loadImage(file) {
    if (!file || !file.type.startsWith("image/")) return flash("That file is not an image");
    const url = URL.createObjectURL(file);
    const im = $("[data-pg-img]");
    im.onload = () => {
      const c = document.createElement("canvas");
      const k = Math.min(1, 140 / Math.max(im.naturalWidth, im.naturalHeight));
      c.width = Math.max(1, Math.round(im.naturalWidth * k));
      c.height = Math.max(1, Math.round(im.naturalHeight * k));
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(im, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const lab = [], xy = [];
      for (let y = 0; y < c.height; y++)
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          if (d[i + 3] < 128) continue;
          lab.push(...rgbToOklab([d[i], d[i + 1], d[i + 2]]));
          xy.push(x, y);
        }
      imgPixels = { lab: Float32Array.from(lab), xy: Uint16Array.from(xy), n: lab.length / 3, w: c.width, h: c.height };
      $("[data-pg-img-wrap]").hidden = false;
      $("[data-pg-img-empty]").hidden = true;
      $("[data-pg-reextract]").hidden = false;
      $("[data-pg-new-img]").hidden = false;
      tab = "image";
      renderTab();
      extract();
    };
    im.src = url;
  }
  function extract() {
    if (!imgPixels || !imgPixels.n) return;
    const k = +$("[data-pg-k]").value;
    const { lab, xy, n } = imgPixels;
    const P = (i) => [lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2]];
    const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    // k-means++ seeding
    const cents = [P(Math.floor(Math.random() * n))];
    const dist = new Float32Array(n).fill(Infinity);
    while (cents.length < k) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        dist[i] = Math.min(dist[i], d2(P(i), cents[cents.length - 1]));
        sum += dist[i];
      }
      let r = Math.random() * sum;
      let j = 0;
      for (; j < n - 1 && (r -= dist[j]) > 0; j++);
      cents.push(P(j));
    }
    const asg = new Uint8Array(n);
    for (let it = 0; it < 14; it++) {
      const acc = cents.map(() => [0, 0, 0, 0]);
      for (let i = 0; i < n; i++) {
        const p = P(i);
        let best = 0, bd = Infinity;
        for (let c = 0; c < k; c++) {
          const dd = d2(p, cents[c]);
          if (dd < bd) { bd = dd; best = c; }
        }
        asg[i] = best;
        const a = acc[best];
        a[0] += p[0]; a[1] += p[1]; a[2] += p[2]; a[3]++;
      }
      acc.forEach((a, c) => {
        if (a[3]) cents[c] = [a[0] / a[3], a[1] / a[3], a[2] / a[3]];
      });
    }
    const counts = cents.map((_, c) => asg.reduce((s, v) => s + (v === c), 0));
    const order = cents.map((_, c) => c).filter((c) => counts[c] > 0).sort((a, b) => counts[b] - counts[a]);
    const marks = order.map((c) => {
      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) {
        if (asg[i] !== c) continue;
        const dd = d2(P(i), cents[c]);
        if (dd < bd) { bd = dd; best = i; }
      }
      return [xy[best * 2] / imgPixels.w, xy[best * 2 + 1] / imgPixels.h];
    });
    const hexes = order.map((c) => {
      const rgb = oklabToLinRgb(cents[c]).map((v) => toGam(clamp(v, 0, 1)) * 255);
      return rgbToHex(...rgb);
    });
    commit();
    S.colors = hexes.slice(0, 10);
    S.locks = S.colors.map(() => false);
    S.sel = 0;
    $("[data-pg-marks]").innerHTML = marks.map(([x, y], i) => `<i style="left:${x * 100}%;top:${y * 100}%;background:${hexes[i]}" title="${hexes[i]}"></i>`).join("");
    render();
    flash(`Found ${hexes.length} colours`);
  }

  /* ── exports ──────────────────────────────────────────── */
  let xtab = "css";
  const hslStr = (hex) => {
    const [h, s, l] = rgbToHsl(hexToRgb(hex));
    return `${h} ${s}% ${l}%`;
  };
  function exportCode() {
    const cs = S.colors;
    const r = roles();
    const names = cs.map((c, i) => `color-${i + 1}`);
    if (xtab === "css")
      return `/* Palette made with NiceUI Palette Generator */\n:root {\n${cs.map((c, i) => `  --${names[i]}: ${c}; /* ${nameOf(c)} */`).join("\n")}\n\n  /* roles */\n  --background: ${r.bg};\n  --surface: ${r.surface};\n  --primary: ${r.primary};\n  --accent: ${r.accent};\n  --foreground: ${r.text};\n}`;
    if (xtab === "tailwind")
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${cs.map((c, i) => `          ${(i + 1) * 100}: '${c}',`).join("\n")}\n        },\n        background: '${r.bg}',\n        surface: '${r.surface}',\n        primary: '${r.primary}',\n        accent: '${r.accent}',\n        foreground: '${r.text}',\n      },\n    },\n  },\n};`;
    if (xtab === "shadcn") {
      const muted = oklch(clamp(hexToLch(r.bg)[0] - 0.05, 0, 1), Math.min(0.02, hexToLch(r.bg)[1]), hexToLch(r.bg)[2]);
      const border = oklch(clamp(hexToLch(r.bg)[0] - 0.1, 0, 1), Math.min(0.025, hexToLch(r.bg)[1]), hexToLch(r.bg)[2]);
      return `/* shadcn/ui theme (globals.css) */\n@layer base {\n  :root {\n    --background: ${hslStr(r.bg)};\n    --foreground: ${hslStr(r.text)};\n    --card: ${hslStr(r.surface)};\n    --card-foreground: ${hslStr(r.text)};\n    --popover: ${hslStr(r.bg)};\n    --popover-foreground: ${hslStr(r.text)};\n    --primary: ${hslStr(r.primary)};\n    --primary-foreground: ${hslStr(textOn(r.primary))};\n    --secondary: ${hslStr(r.surface)};\n    --secondary-foreground: ${hslStr(r.text)};\n    --muted: ${hslStr(muted)};\n    --muted-foreground: ${hslStr(oklch(0.55, 0.02, hexToLch(r.text)[2]))};\n    --accent: ${hslStr(r.accent)};\n    --accent-foreground: ${hslStr(textOn(r.accent))};\n    --border: ${hslStr(border)};\n    --input: ${hslStr(border)};\n    --ring: ${hslStr(r.primary)};\n    --radius: 0.75rem;\n  }\n}`;
    }
    if (xtab === "json")
      return JSON.stringify(
        cs.map((c) => {
          const rgb = hexToRgb(c);
          return { hex: c, name: nameOf(c), rgb: `rgb(${rgb.join(", ")})`, hsl: `hsl(${rgbToHsl(rgb).map((v, i) => (i ? v + "%" : v)).join(", ")})`, oklch: fmtOklch(c) };
        }),
        null,
        2
      );
    return `// Palette made with NiceUI Palette Generator\n${cs.map((c, i) => `$${names[i]}: ${c};`).join("\n")}\n\n$palette: (\n${cs.map((c, i) => `  "${i + 1}": $${names[i]},`).join("\n")}\n);`;
  }
  const codeEl = $("[data-pg-code]");
  function renderExport() {
    $$("[data-pg-x]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.pgX === xtab)));
    codeEl.textContent = exportCode();
  }
  function paletteSvg(w = 1600, h = 800) {
    const cs = S.colors;
    const cw = w / cs.length;
    const fs = Math.round(Math.min(cw * 0.15, 36));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${cs
      .map((c, i) => {
        const t = textOn(c);
        return `<rect x="${i * cw}" y="0" width="${cw + 0.5}" height="${h}" fill="${c}"/><text x="${i * cw + cw / 2}" y="${h - fs * 2.6}" fill="${t}" font-family="ui-monospace, Menlo, monospace" font-size="${fs}" font-weight="600" text-anchor="middle">${c.toUpperCase()}</text><text x="${i * cw + cw / 2}" y="${h - fs * 1.4}" fill="${t}" fill-opacity="0.7" font-family="system-ui, sans-serif" font-size="${Math.round(fs * 0.62)}" text-anchor="middle">${esc(nameOf(c))}</text>`;
      })
      .join("")}</svg>`;
  }
  const download = (name, href) => {
    const a = document.createElement("a");
    a.download = name;
    a.href = href;
    a.click();
  };
  const fileName = () => "palette-" + S.colors.map((c) => c.slice(1)).join("-");
  function downloadPng() {
    const svg = paletteSvg();
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = 1600;
      c.height = 800;
      c.getContext("2d").drawImage(im, 0, 0);
      download(fileName() + ".png", c.toDataURL("image/png"));
      flash("PNG downloaded · 1600 × 800");
    };
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ── library ──────────────────────────────────────────── */
  let libTag = "all";
  function renderLibrary() {
    const tags = ["all", ...new Set(LIB.flatMap((p) => p[2]))];
    $("[data-pg-tags]").innerHTML = tags.map((t) => `<button type="button" data-pg-libtag="${t}" aria-pressed="${t === libTag}">${t === "all" ? "All" : t[0].toUpperCase() + t.slice(1)}</button>`).join("");
    const list = LIB.filter((p) => libTag === "all" || p[2].includes(libTag));
    $("[data-pg-lib]").innerHTML = list
      .map(([slug, name, , colors]) => `<button type="button" class="pg-libp" data-pg-load="${slug}"><span class="pg-libsw">${colors.map((c) => `<i style="background:${c}"></i>`).join("")}</span><b>${esc(name)}</b></button>`)
      .join("");
  }

  /* ── share / toast ────────────────────────────────────── */
  const toastEl = document.querySelector("[data-toast]");
  function flash(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1600);
  }
  async function copyText(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      flash("Copy failed. Select the text and copy it");
    }
  }
  const hashOf = () => "#p=" + S.colors.map((c) => c.slice(1)).join("-") + (S.locks.some(Boolean) ? "&l=" + S.locks.map((l) => (l ? 1 : 0)).join("") : "") + (S.mode !== "auto" ? "&m=" + S.mode : "");
  let hashT = 0;
  function render() {
    renderCols();
    renderTab();
    renderExport();
    $("[data-pg-undo]").disabled = !past.length;
    $("[data-pg-redo]").disabled = !future.length;
    $("[data-pg-mode]").value = S.mode;
    clearTimeout(hashT);
    hashT = setTimeout(() => history.replaceState(null, "", hashOf()), 250);
  }

  /* ── events ───────────────────────────────────────────── */
  const validHex = (v) => {
    v = v.trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(v)) v = [...v].map((c) => c + c).join("");
    return /^[0-9a-f]{6}$/i.test(v) ? "#" + v.toLowerCase() : null;
  };
  function setColor(i, hex, record = true) {
    if (record) commit();
    S.colors[i] = hex;
    render();
  }
  function move(i, j) {
    if (j < 0 || j >= S.colors.length || i === j) return;
    commit();
    const [c] = S.colors.splice(i, 1);
    const [l] = S.locks.splice(i, 1);
    S.colors.splice(j, 0, c);
    S.locks.splice(j, 0, l);
    S.sel = j;
    render();
    colsEl.querySelector(`[data-i="${j}"]`)?.focus();
  }
  function add() {
    if (S.colors.length >= 10) return flash("10 colours is the maximum");
    commit();
    const i = S.sel + 1;
    const a = hexToLch(S.colors[S.sel]);
    const b = hexToLch(S.colors[i] || S.colors[S.sel]);
    let dh = b[2] - a[2];
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    const mid = S.colors[i] ? oklch((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + dh / 2 + 360) % 360) : oklch(clamp(a[0] - 0.12, 0.1, 0.95), a[1], a[2]);
    S.colors.splice(i, 0, mid);
    S.locks.splice(i, 0, false);
    S.sel = i;
    render();
  }
  function remove(i) {
    if (S.colors.length <= 2) return flash("Keep at least 2 colours");
    commit();
    S.colors.splice(i, 1);
    S.locks.splice(i, 1);
    S.sel = clamp(S.sel >= i ? S.sel - 1 : S.sel, 0, S.colors.length - 1);
    render();
  }

  root.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-pg-generate]")) return doGenerate();
    if (t.closest("[data-pg-undo]")) return undo();
    if (t.closest("[data-pg-redo]")) return redo();
    if (t.closest("[data-pg-add]")) return add();
    if (t.closest("[data-pg-remove-last]")) return remove(S.colors.length - 1);
    const lk = t.closest("[data-pg-lock]");
    if (lk) {
      const i = +lk.dataset.pgLock;
      S.locks[i] = !S.locks[i];
      return render();
    }
    const cp = t.closest("[data-pg-copyhex]");
    if (cp) return copyText(S.colors[+cp.dataset.pgCopyhex], `Copied ${S.colors[+cp.dataset.pgCopyhex]}`);
    const sc = t.closest("[data-pg-scale]");
    if (sc) {
      S.sel = +sc.dataset.pgScale;
      scaleName = "";
      tab = "scale";
      return render();
    }
    const del = t.closest("[data-pg-del]");
    if (del) return remove(+del.dataset.pgDel);
    const col = t.closest(".pg-col");
    if (col && !t.closest("input,button,label")) {
      S.sel = +col.dataset.i;
      $$(".pg-col").forEach((c) => c.classList.toggle("sel", +c.dataset.i === S.sel));
      if (tab === "scale") renderScale();
    }
    const tb = t.closest("[data-pg-tab]");
    if (tb) {
      tab = tb.dataset.pgTab;
      return renderTab();
    }
    const xt = t.closest("[data-pg-x]");
    if (xt) {
      xtab = xt.dataset.pgX;
      return renderExport();
    }
    if (t.closest("[data-pg-copy]")) return copyText(exportCode(), `Copied ${{ css: "CSS variables", tailwind: "Tailwind config", shadcn: "shadcn theme", json: "JSON", scss: "SCSS" }[xtab]}`);
    if (t.closest("[data-pg-png]")) return downloadPng();
    if (t.closest("[data-pg-svg]")) {
      download(fileName() + ".svg", URL.createObjectURL(new Blob([paletteSvg()], { type: "image/svg+xml" })));
      return flash("SVG downloaded");
    }
    if (t.closest("[data-pg-share]")) {
      history.replaceState(null, "", hashOf());
      return copyText(location.href, "Share link copied");
    }
    const ch = t.closest("[data-copy-hex]");
    if (ch) return copyText(ch.dataset.copyHex, `Copied ${ch.dataset.copyHex}`);
    const ct = t.closest("[data-copy-text]");
    if (ct) return copyText($('[data-pg-pane="scale"]')._texts[ct.dataset.copyText], ct.dataset.copyText === "v3" ? "Copied Tailwind v3 config" : "Copied Tailwind v4 theme");
    const cb = t.closest("[data-pg-cb]");
    if (cb) {
      $$("[data-pg-cb]").forEach((b) => b.setAttribute("aria-pressed", String(b === cb)));
      const v = cb.dataset.pgCb;
      $("[data-pg-sim]").style.filter = v === "none" ? "" : `url(#pg-cb-${v})`;
      return flash(v === "none" ? "Normal vision" : `Simulating ${v}`);
    }
    const lt = t.closest("[data-pg-libtag]");
    if (lt) {
      libTag = lt.dataset.pgLibtag;
      return renderLibrary();
    }
    const ld = t.closest("[data-pg-load]");
    if (ld) {
      const p = LIB.find((x) => x[0] === ld.dataset.pgLoad);
      commit();
      S.colors = [...p[3]];
      S.locks = S.colors.map(() => false);
      S.sel = 0;
      render();
      return flash(`Loaded ${p[1]}`);
    }
    if (t.closest("[data-pg-reextract]")) return extract();
  });
  root.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("[data-pg-hex]")) {
      const v = validHex(t.value);
      if (v) setColor(+t.dataset.pgHex, v);
      else {
        t.value = S.colors[+t.dataset.pgHex].slice(1).toUpperCase();
        flash("Enter a hex colour like 0EA5E9");
      }
    }
    if (t.matches("[data-pg-pick]")) setColor(+t.dataset.pgPick, t.value);
    if (t.matches("[data-pg-mode]")) {
      S.mode = t.value;
      doGenerate();
    }
    if (t.matches("[data-pg-file],[data-pg-file2]")) {
      loadImage(t.files?.[0]);
      t.value = "";
    }
    if (t.matches("[data-pg-k]")) extract();
  });
  root.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches("[data-pg-pick]")) {
      // live preview while dragging the picker, committed on change
      const i = +t.dataset.pgPick;
      const col = colsEl.querySelector(`[data-i="${i}"]`);
      if (col) {
        col.style.setProperty("--c", t.value);
        col.style.setProperty("--t", textOn(t.value));
      }
    }
    if (t.matches("[data-pg-k]")) $("[data-pg-k-out]").textContent = t.value;
    if (t.matches("[data-pg-sname]")) {
      scaleName = t.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "brand";
      const pane = $('[data-pg-pane="scale"]');
      const sel = t.selectionStart;
      renderScale();
      const inp = pane.querySelector("[data-pg-sname]");
      inp.focus();
      inp.setSelectionRange(sel, sel);
    }
  });
  root.addEventListener("keydown", (e) => {
    if (e.target.matches("[data-pg-hex]") && e.key === "Enter") e.target.blur();
  });
  // global shortcuts (ignored while typing)
  addEventListener("keydown", (e) => {
    const typing = e.target.closest?.("input, textarea, select, [contenteditable]");
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "z" && !typing) {
      e.preventDefault();
      return e.shiftKey ? redo() : undo();
    }
    if (mod && e.key.toLowerCase() === "y" && !typing) {
      e.preventDefault();
      return redo();
    }
    if (typing || mod || e.altKey && !e.target.closest?.(".pg-col")) return;
    if (e.code === "Space" && !e.target.closest?.("button, a, label")) {
      e.preventDefault();
      return doGenerate();
    }
    const col = e.target.closest?.(".pg-col");
    if (!col) return;
    const i = +col.dataset.i;
    if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowUp")) return e.preventDefault(), move(i, i - 1);
    if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowDown")) return e.preventDefault(), move(i, i + 1);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") return e.preventDefault(), colsEl.querySelector(`[data-i="${i + 1}"]`)?.focus();
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") return e.preventDefault(), colsEl.querySelector(`[data-i="${i - 1}"]`)?.focus();
    if (e.key.toLowerCase() === "l") {
      S.locks[i] = !S.locks[i];
      render();
      colsEl.querySelector(`[data-i="${i}"]`)?.focus();
      return flash(S.locks[i] ? "Locked" : "Unlocked");
    }
    if (e.key.toLowerCase() === "c") return copyText(S.colors[i], `Copied ${S.colors[i]}`);
    if (e.key === "Delete" || e.key === "Backspace") return remove(i);
    if (e.code === "Space") {
      e.preventDefault();
      doGenerate();
      colsEl.querySelector(`[data-i="${i}"]`)?.focus();
    }
  });
  colsEl.addEventListener("focusin", (e) => {
    const col = e.target.closest(".pg-col");
    if (col && +col.dataset.i !== S.sel) {
      S.sel = +col.dataset.i;
      $$(".pg-col").forEach((c) => c.classList.toggle("sel", +c.dataset.i === S.sel));
      if (tab === "scale") renderScale();
    }
  });
  // drag to reorder
  let dragFrom = -1;
  colsEl.addEventListener("dragstart", (e) => {
    const h = e.target.closest("[data-pg-drag]");
    if (!h) return;
    dragFrom = +h.dataset.pgDrag;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(dragFrom));
    const col = h.closest(".pg-col");
    col.classList.add("dragging");
    e.dataTransfer.setDragImage(col, 20, 20);
  });
  colsEl.addEventListener("dragover", (e) => {
    if (dragFrom < 0) return;
    e.preventDefault();
    $$(".pg-col").forEach((c) => c.classList.toggle("over", c === e.target.closest(".pg-col")));
  });
  colsEl.addEventListener("drop", (e) => {
    if (dragFrom < 0) return;
    e.preventDefault();
    const to = e.target.closest(".pg-col");
    const f = dragFrom;
    dragFrom = -1;
    if (to) move(f, +to.dataset.i);
    else render();
  });
  colsEl.addEventListener("dragend", () => {
    dragFrom = -1;
    $$(".pg-col").forEach((c) => c.classList.remove("dragging", "over"));
  });
  // image drop / paste
  const drop = $("[data-pg-drop]");
  drop.addEventListener("dragover", (e) => {
    if (dragFrom >= 0) return;
    e.preventDefault();
    drop.classList.add("over");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    if (dragFrom >= 0) return;
    e.preventDefault();
    drop.classList.remove("over");
    loadImage(e.dataTransfer?.files?.[0]);
  });
  addEventListener("paste", (e) => {
    const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/"));
    if (f) {
      e.preventDefault();
      loadImage(f);
    }
  });

  /* ── boot ─────────────────────────────────────────────── */
  function loadHash() {
    const h = new URLSearchParams(location.hash.slice(1));
    const p = h.get("p");
    if (!p) return false;
    const cs = p.split("-").map((x) => validHex(x)).filter(Boolean).slice(0, 10);
    if (cs.length < 2) return false;
    S.colors = cs;
    const l = h.get("l") || "";
    S.locks = cs.map((_, i) => l[i] === "1");
    const m = h.get("m");
    if (m && $(`[data-pg-mode] option[value="${m}"]`)) S.mode = m;
    S.sel = 0;
    return true;
  }
  if (!loadHash()) {
    S.colors = generate("analogous");
  }
  renderLibrary();
  render();
  addEventListener("hashchange", () => {
    if (location.hash === hashOf()) return;
    if (loadHash()) {
      past = [];
      future = [];
      render();
    }
  });
})();
