/* NiceUI Theme Generator — shadcn / Tailwind themes from one brand colour.
   Plain JavaScript, no dependencies. Colours are computed in OKLCH. */
(() => {
  const root = document.querySelector("[data-tg]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── colour maths: sRGB <-> OKLab <-> OKLCH ───────────────── */
  const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  const hexToRgb = (h) => {
    const v = parseInt(h.slice(1), 16);
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  };
  const rgbToHex = (r, g, b) => "#" + [r, g, b].map((x) => Math.round(clamp(x, 0, 1) * 255).toString(16).padStart(2, "0")).join("");
  function rgbToOklch([r, g, b]) {
    [r, g, b] = [toLin(r), toLin(g), toLin(b)];
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const C = Math.hypot(A, B);
    let H = (Math.atan2(B, A) * 180) / Math.PI;
    if (H < 0) H += 360;
    return { l: L, c: C, h: C < 1e-4 ? 0 : H };
  }
  function oklchToRgbRaw({ l, c, h }) {
    const a = c * Math.cos((h * Math.PI) / 180);
    const b = c * Math.sin((h * Math.PI) / 180);
    const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
      toGam(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
      toGam(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
      toGam(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
    ];
  }
  const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);
  /** Fit an OKLCH colour into sRGB by lowering chroma (keeps lightness and hue). */
  function fit(col) {
    let c = col.c;
    let rgb = oklchToRgbRaw({ ...col, c });
    if (inGamut(rgb)) return { ...col, rgb };
    let lo = 0,
      hi = c;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToRgbRaw({ ...col, c: mid }))) lo = mid;
      else hi = mid;
    }
    return { ...col, c: lo, rgb: oklchToRgbRaw({ ...col, c: lo }).map((v) => clamp(v, 0, 1)) };
  }
  const C = (l, c, h) => fit({ l: clamp(l, 0, 1), c: Math.max(0, c), h: ((h % 360) + 360) % 360 });
  const hexOf = (col) => rgbToHex(...col.rgb);
  const oklchStr = (col) => `oklch(${+col.l.toFixed(3)} ${+col.c.toFixed(3)} ${+col.h.toFixed(1)})`;
  function hslOf(col) {
    const [r, g, b] = col.rgb;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return `${+h.toFixed(1)} ${+(s * 100).toFixed(1)}% ${+(l * 100).toFixed(1)}%`;
  }
  const lum = (col) => {
    const [r, g, b] = col.rgb.map(toLin);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  /** Pick a readable foreground for a fill: near white or near black. */
  const fgFor = (bg, h, nc) => {
    const light = C(0.985, nc * 0.4, h);
    const dark = C(0.21, nc * 1.2, h);
    return ratio(bg, light) >= ratio(bg, dark) ? light : dark;
  };

  /* ── state ────────────────────────────────────────────────── */
  const BASES = { slate: [257, 0.025], gray: [264, 0.014], zinc: [286, 0.007], neutral: [0, 0], stone: [56, 0.009], tinted: [null, 0.018] };
  const FONTS = {
    geist: { sans: '"Geist", ui-sans-serif, system-ui, sans-serif', heading: '"Geist", ui-sans-serif, system-ui, sans-serif' },
    inter: { sans: '"Inter", ui-sans-serif, system-ui, sans-serif', heading: '"Inter", ui-sans-serif, system-ui, sans-serif' },
    system: { sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', heading: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
    serif: { sans: '"Geist", ui-sans-serif, system-ui, sans-serif', heading: '"Instrument Serif", Georgia, serif' },
  };
  const DEFAULT = { brand: "#0ea5e9", base: "zinc", radius: 0.625, contrast: 0, font: "geist", mode: "dark" };
  let S = { ...DEFAULT };
  let tab = "v4";

  /* ── theme generation ─────────────────────────────────────── */
  function generate() {
    const b = rgbToOklch(hexToRgb(S.brand));
    const [bh0, bc] = BASES[S.base];
    const nh = bh0 === null ? b.h : bh0;
    const nc = bh0 === null ? Math.min(0.022, b.c * 0.12 + 0.006) : bc;
    const k = S.contrast; // -1 .. 1
    const N = (l, cMul = 1) => C(l, nc * cMul, nh);

    // 50–950 brand scale, chroma peaks around 500–600
    const L = { 50: 0.975, 100: 0.945, 200: 0.895, 300: 0.82, 400: 0.735, 500: 0.655, 600: 0.565, 700: 0.485, 800: 0.405, 900: 0.335, 950: 0.26 };
    const peak = Math.max(b.c, 0.02);
    const scale = Object.fromEntries(Object.entries(L).map(([n, l]) => [n, C(l, peak * (1 - Math.abs(l - 0.6) * 1.15), b.h)]));

    const chartH = [0, 140, 200, 70, 300].map((d) => b.h + d);
    const make = (dark) => {
      const t = {};
      if (!dark) {
        t.background = N(1 - 0.006 * (1 - k), 0.3);
        t.foreground = N(0.145 - 0.04 * k, 1.4);
        t.card = N(1, 0.2);
        t.popover = N(1, 0.2);
        const pl = clamp(b.l, 0.45, 0.66);
        t.primary = C(pl, b.c, b.h);
        t.secondary = N(0.965 - 0.01 * k, 0.8);
        t.muted = N(0.965 - 0.01 * k, 0.8);
        t["muted-foreground"] = N(0.556 - 0.07 * k, 1.6);
        t.accent = C(0.96, Math.min(0.04, b.c * 0.3), b.h);
        t.destructive = C(0.577, 0.245, 27.3);
        t.border = N(0.922 - 0.03 * k, 1);
        t.input = N(0.922 - 0.03 * k, 1);
      } else {
        t.background = N(0.145 - 0.03 * k, 1.2);
        t.foreground = N(0.985, 0.3);
        t.card = N(0.185 - 0.03 * k, 1.2);
        t.popover = N(0.185 - 0.03 * k, 1.2);
        const pl = clamp(b.l, 0.62, 0.8);
        t.primary = C(pl, b.c, b.h);
        t.secondary = N(0.269 + 0.02 * k, 1);
        t.muted = N(0.269 + 0.02 * k, 1);
        t["muted-foreground"] = N(0.708 + 0.06 * k, 1.2);
        t.accent = C(0.3, Math.min(0.06, b.c * 0.45 + 0.01), b.h);
        t.destructive = C(0.704, 0.191, 22.2);
        t.border = N(0.275 + 0.05 * k, 1);
        t.input = N(0.32 + 0.05 * k, 1);
      }
      t["card-foreground"] = t.foreground;
      t["popover-foreground"] = t.foreground;
      t["primary-foreground"] = fgFor(t.primary, b.h, nc);
      t["secondary-foreground"] = dark ? t.foreground : N(0.205, 1.4);
      t["accent-foreground"] = dark ? t.foreground : N(0.205, 1.4);
      t["destructive-foreground"] = fgFor(t.destructive, 27, 0);
      t.ring = C(t.primary.l, t.primary.c * 0.9, b.h);
      chartH.forEach((h, i) => (t["chart-" + (i + 1)] = C(dark ? 0.69 : 0.63, Math.max(0.12, Math.min(0.2, b.c + 0.02)), h)));
      return t;
    };
    return { light: make(false), dark: make(true), scale };
  }
  const ORDER = ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground", "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground", "accent", "accent-foreground", "destructive", "destructive-foreground", "border", "input", "ring", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

  /* ── exports ──────────────────────────────────────────────── */
  const radius = () => `${+S.radius.toFixed(3)}rem`;
  const block = (sel, t, fmt, extra = "") => `${sel} {\n${extra}${ORDER.map((n) => `  --${n}: ${fmt(t[n])};`).join("\n")}\n}`;
  const V4_THEME = () =>
    `@theme inline {\n  --radius-sm: calc(var(--radius) - 4px);\n  --radius-md: calc(var(--radius) - 2px);\n  --radius-lg: var(--radius);\n  --radius-xl: calc(var(--radius) + 4px);\n${ORDER.map((n) => `  --color-${n}: var(--${n});`).join("\n")}\n}`;
  function code(T) {
    const font = FONTS[S.font];
    if (tab === "v4")
      return `/* shadcn/ui v4 theme (Tailwind v4, OKLCH) — made with NiceUI Theme Generator */\n${block(":root", T.light, oklchStr, `  --radius: ${radius()};\n`)}\n\n${block(".dark", T.dark, oklchStr)}\n\n${V4_THEME()}`;
    if (tab === "v3")
      return `/* shadcn/ui v3 theme (Tailwind v3, HSL) — made with NiceUI Theme Generator */\n@layer base {\n${block("  :root", T.light, hslOf, `  --radius: ${radius()};\n`).replace(/\n {2}--/g, "\n    --").replace(/\n}$/, "\n  }")}\n\n${block("  .dark", T.dark, hslOf).replace(/\n {2}--/g, "\n    --").replace(/\n}$/, "\n  }")}\n}`;
    if (tab === "tw3") {
      const pair = (n) => `{ DEFAULT: 'hsl(var(--${n}))', foreground: 'hsl(var(--${n}-foreground))' }`;
      return `// tailwind.config.js (Tailwind v3) — pair with the shadcn v3 CSS variables
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: ${pair("card")},
        popover: ${pair("popover")},
        primary: ${pair("primary")},
        secondary: ${pair("secondary")},
        muted: ${pair("muted")},
        accent: ${pair("accent")},
        destructive: ${pair("destructive")},
        chart: { 1: 'hsl(var(--chart-1))', 2: 'hsl(var(--chart-2))', 3: 'hsl(var(--chart-3))', 4: 'hsl(var(--chart-4))', 5: 'hsl(var(--chart-5))' },
        brand: {
${Object.entries(T.scale).map(([n, c]) => `          ${n}: '${hexOf(c)}',`).join("\n")}
        },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      fontFamily: { sans: [${font.sans.split(", ").map((f) => `'${f.replace(/"/g, "")}'`).join(", ")}], heading: [${font.heading.split(", ").map((f) => `'${f.replace(/"/g, "")}'`).join(", ")}] },
    },
  },
};`;
    }
    if (tab === "tw4")
      return `/* Tailwind v4 — brand scale, fonts and radius as theme variables */\n@import "tailwindcss";\n\n@theme {\n${Object.entries(T.scale).map(([n, c]) => `  --color-brand-${n}: ${oklchStr(c)};`).join("\n")}\n  --font-sans: ${font.sans};\n  --font-heading: ${font.heading};\n  --radius: ${radius()};\n}\n\n/* Semantic tokens (light / dark) */\n${block(":root", T.light, oklchStr)}\n\n${block(".dark", T.dark, oklchStr)}\n\n${V4_THEME()}`;
    const j = (t) => Object.fromEntries(ORDER.map((n) => [n, hexOf(t[n])]));
    return JSON.stringify({ name: "NiceUI theme", brand: S.brand, radius: radius(), fonts: font, light: j(T.light), dark: j(T.dark), brandScale: Object.fromEntries(Object.entries(T.scale).map(([n, c]) => [n, hexOf(c)])) }, null, 2);
  }

  /* ── render ───────────────────────────────────────────────── */
  const pv = $("[data-tg-pv]");
  const codeEl = $("[data-tg-code]");
  const LABELS = { v4: "shadcn v4 CSS", v3: "shadcn v3 CSS", tw3: "Tailwind v3 config", tw4: "Tailwind v4 @theme", json: "JSON tokens" };
  let T = null;
  function render() {
    T = generate();
    const t = T[S.mode];
    ORDER.forEach((n) => pv.style.setProperty("--" + n, oklchStr(t[n])));
    pv.style.setProperty("--radius", radius());
    pv.style.setProperty("--font-sans", FONTS[S.font].sans);
    pv.style.setProperty("--font-heading", FONTS[S.font].heading);
    pv.dataset.mode = S.mode;
    // brand scale strip
    $("[data-tg-scale]").innerHTML = Object.entries(T.scale)
      .map(([n, c]) => `<button type="button" class="tg-sw" style="background:${hexOf(c)}" data-copy-hex="${hexOf(c)}" title="brand-${n} ${hexOf(c)}" aria-label="Copy brand-${n} ${hexOf(c)}"><span>${n}</span></button>`)
      .join("");
    // contrast checks
    const pairs = [
      ["Text on background", t.foreground, t.background],
      ["Primary button", t["primary-foreground"], t.primary],
      ["Muted text", t["muted-foreground"], t.background],
      ["Accent", t["accent-foreground"], t.accent],
      ["Destructive", t["destructive-foreground"], t.destructive],
    ];
    $("[data-tg-checks]").innerHTML = pairs
      .map(([n, fg, bg]) => {
        const r = ratio(fg, bg);
        const grade = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large" : "Fail";
        return `<div class="tg-cr"><span class="tg-cr-s" style="background:${hexOf(bg)};color:${hexOf(fg)}">Aa</span><span class="tg-cr-n">${n}</span><b>${r.toFixed(2)}</b><em class="tg-g tg-g-${grade.replace(" ", "").toLowerCase()}">${grade}</em></div>`;
      })
      .join("");
    // token list
    $("[data-tg-tokens]").innerHTML = ORDER.map((n) => `<button type="button" class="tg-tok" data-copy-hex="${hexOf(t[n])}" title="Copy ${hexOf(t[n])}"><i style="background:${hexOf(t[n])}"></i><span>${n}</span><code>${hexOf(t[n])}</code></button>`).join("");
    $$("[data-tg-mode-label]").forEach((e) => (e.textContent = S.mode));
    // controls
    $("[data-tg-brand]").value = S.brand;
    if (document.activeElement !== $("[data-tg-hex]")) $("[data-tg-hex]").value = S.brand;
    $$("[data-tg-base]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tgBase === S.base)));
    $$("[data-tg-font]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tgFont === S.font)));
    $$("[data-tg-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tgMode === S.mode)));
    $$("[data-tg-preset]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.c === S.brand && b.dataset.b === S.base)));
    $("[data-tg-radius]").value = S.radius;
    $('[data-tg-out="radius"]').textContent = radius();
    $('[data-tg-out="contrast"]').textContent = (S.contrast > 0 ? "+" : "") + S.contrast.toFixed(1);
    $("input[data-tg-contrast]").value = S.contrast;
    $$("[data-tg-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tgTab === tab)));
    $("[data-tg-copy-label]").textContent = LABELS[tab];
    codeEl.textContent = code(T);
    clearTimeout(render.t);
    render.t = setTimeout(() => history.replaceState(null, "", "#t=" + encode()), 300);
  }

  /* ── share link ───────────────────────────────────────────── */
  const encode = () => btoa(JSON.stringify(S));
  function loadHash() {
    try {
      if (location.hash.startsWith("#t=")) {
        const v = JSON.parse(atob(location.hash.slice(3)));
        if (/^#[0-9a-f]{6}$/i.test(v.brand)) S = { ...DEFAULT, ...v };
      }
    } catch {}
  }

  /* ── feedback ─────────────────────────────────────────────── */
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1600);
  };
  const copyText = async (text, msg) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      flash("Copy failed — select the text and copy it");
    }
  };

  /* ── events ───────────────────────────────────────────────── */
  const rnd = (a, b) => a + Math.random() * (b - a);
  root.addEventListener("click", (e) => {
    const t = e.target;
    const b = t.closest("[data-tg-base]");
    if (b) S.base = b.dataset.tgBase;
    const f = t.closest("[data-tg-font]");
    if (f) S.font = f.dataset.tgFont;
    const m = t.closest("[data-tg-mode]");
    if (m) S.mode = m.dataset.tgMode;
    const p = t.closest("[data-tg-preset]");
    if (p) {
      S.brand = p.dataset.c;
      S.base = p.dataset.b;
    }
    if (t.closest("[data-tg-random]")) {
      const h = rnd(0, 360);
      const col = C(rnd(0.52, 0.7), rnd(0.12, 0.22), h);
      S.brand = hexOf(col);
      S.base = ["slate", "gray", "zinc", "neutral", "stone", "tinted"][Math.floor(rnd(0, 6))];
      S.radius = [0, 0.25, 0.5, 0.625, 0.75, 1][Math.floor(rnd(0, 6))];
    }
    const x = t.closest("[data-tg-tab]");
    if (x) tab = x.dataset.tgTab;
    if (t.closest("[data-tg-copy]")) return copyText(codeEl.textContent, `Copied ${LABELS[tab]} · ${codeEl.textContent.split("\n").length} lines`);
    if (t.closest("[data-tg-share]")) {
      const url = location.origin + location.pathname + "#t=" + encode();
      history.replaceState(null, "", "#t=" + encode());
      return copyText(url, "Share link copied");
    }
    const hx = t.closest("[data-copy-hex]");
    if (hx) return copyText(hx.dataset.copyHex, `Copied ${hx.dataset.copyHex}`);
    if (b || f || m || p || x || t.closest("[data-tg-random]")) render();
  });
  $("[data-tg-brand]").addEventListener("input", (e) => {
    S.brand = e.target.value;
    render();
  });
  $("[data-tg-hex]").addEventListener("input", (e) => {
    let v = e.target.value.trim();
    if (!v.startsWith("#")) v = "#" + v;
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      S.brand = v.toLowerCase();
      render();
    }
  });
  $("[data-tg-radius]").addEventListener("input", (e) => {
    S.radius = +e.target.value;
    render();
  });
  $("input[data-tg-contrast]").addEventListener("input", (e) => {
    S.contrast = +e.target.value;
    render();
  });
  addEventListener("hashchange", () => {
    if (location.hash.slice(3) === encode()) return;
    loadHash();
    render();
  });

  loadHash();
  render();
})();
