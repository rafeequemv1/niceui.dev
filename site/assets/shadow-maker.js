/* NiceUI Shadow & Glass Maker — box shadows, smooth shadows, glassmorphism and
   neumorphism. Plain JavaScript, no dependencies; every export is dependency-free. */
(() => {
  const root = document.querySelector("[data-sh]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const r2 = (v) => Math.round(v * 100) / 100;

  /* ── colour helpers ─────────────────────────────────────── */
  const hex2rgb = (h) => {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const rgb2hex = (r, g, b) => "#" + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0")).join("");
  const rgba = (hex, a) => {
    const [r, g, b] = hex2rgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${r2(clamp(a, 0, 1))})`;
  };
  const mix = (hex, to, t) => {
    const a = hex2rgb(hex);
    const b = hex2rgb(to);
    return rgb2hex(...a.map((v, i) => v + (b[i] - v) * t));
  };
  const lum = (hex) => {
    const [r, g, b] = hex2rgb(hex).map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

  /* ── state ──────────────────────────────────────────────── */
  const DEFAULT = {
    mode: "shadow",
    radius: 20,
    card: "#ffffff",
    bg: "light",
    showBtn: true,
    shadow: {
      kind: "smooth",
      layers: [
        { x: 0, y: 1, blur: 2, spread: 0, color: "#0b0c0e", alpha: 0.08, inset: false },
        { x: 0, y: 8, blur: 24, spread: -6, color: "#0b0c0e", alpha: 0.18, inset: false },
      ],
      smooth: { n: 6, angle: 90, distance: 32, blur: 56, strength: 18, color: "#0b0c0e" },
    },
    glass: { blur: 16, sat: 160, tint: "#ffffff", tintA: 14, border: 28, noise: 6, art: "aurora" },
    neu: { shape: "flat", base: "#e0e5ec", distance: 14, blur: 28, intensity: 15 },
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let S = clone(DEFAULT);

  const ARTS = {
    aurora: { light: false, css: "radial-gradient(at 22% 28%, #22d3ee 0px, transparent 48%), radial-gradient(at 78% 22%, #a78bfa 0px, transparent 50%), radial-gradient(at 55% 82%, #34d399 0px, transparent 50%), radial-gradient(at 12% 85%, #0ea5e9 0px, transparent 45%), #050816" },
    sunset: { light: false, css: "radial-gradient(at 20% 25%, #fb7185 0px, transparent 50%), radial-gradient(at 82% 20%, #fdba74 0px, transparent 50%), radial-gradient(at 60% 85%, #f472b6 0px, transparent 50%), radial-gradient(at 15% 88%, #facc15 0px, transparent 40%), #1f1135" },
    ocean: { light: false, css: "radial-gradient(at 25% 30%, #0ea5e9 0px, transparent 50%), radial-gradient(at 80% 25%, #2dd4bf 0px, transparent 50%), radial-gradient(at 50% 90%, #1d4ed8 0px, transparent 55%), #020c1b" },
    candy: { light: true, css: "radial-gradient(at 20% 25%, #f9a8d4 0px, transparent 50%), radial-gradient(at 82% 22%, #93c5fd 0px, transparent 50%), radial-gradient(at 55% 85%, #bef264 0px, transparent 50%), radial-gradient(at 15% 85%, #c4b5fd 0px, transparent 45%), #fdf4ff" },
  };
  const STAGE_BG = {
    light: "#eef0f3",
    dark: "#0b0c0e",
    gradient: "radial-gradient(at 20% 20%, #e0f2fe 0px, transparent 55%), radial-gradient(at 85% 30%, #fce7f3 0px, transparent 55%), radial-gradient(at 50% 90%, #ecfccb 0px, transparent 55%), #f8fafc",
  };

  /* ── effect → CSS declarations ──────────────────────────── */
  const noiseUrl = (a) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${r2(a)} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).replace(/'/g, "%27")}")`;

  function shadowLayers() {
    const sh = S.shadow;
    if (sh.kind === "layers") return sh.layers.map((l) => ({ ...l }));
    const { n, angle, distance, blur, strength, color } = sh.smooth;
    const a = (angle * Math.PI) / 180;
    const out = [];
    // offsets and blur double each step; opacity shared across layers
    const denom = 2 ** n - 1;
    for (let i = 1; i <= n; i++) {
      const t = (2 ** i - 1) / denom;
      const off = distance * t;
      out.push({ x: r2(Math.cos(a) * off), y: r2(Math.sin(a) * off), blur: r2(blur * t), spread: 0, color, alpha: r2(((strength / 100) * 1.6) / n), inset: false });
    }
    return out;
  }
  const shadowString = (ls) => ls.map((l) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba(l.color, l.alpha)}`).join(", ");

  /** Declarations for the card as [cssProperty, value]. */
  function decls() {
    const radius = `${S.radius}px`;
    if (S.mode === "shadow") {
      return [
        ["background", S.card],
        ["border-radius", radius],
        ["box-shadow", shadowString(shadowLayers())],
      ];
    }
    if (S.mode === "glass") {
      const g = S.glass;
      const tint = rgba(g.tint, g.tintA / 100);
      const filter = `blur(${g.blur}px) saturate(${g.sat}%)`;
      return [
        ["background", g.noise > 0 ? `${noiseUrl(g.noise / 100)}, ${tint}` : tint],
        ["backdrop-filter", filter],
        ["-webkit-backdrop-filter", filter],
        ["border", `1px solid ${rgba("#ffffff", g.border / 100)}`],
        ["border-radius", radius],
        ["box-shadow", `0 8px 32px ${rgba("#000000", 0.18)}, inset 0 1px 0 ${rgba("#ffffff", (g.border / 100) * 0.9)}`],
      ];
    }
    const n = S.neu;
    const k = n.intensity / 100;
    const dark = mix(n.base, "#000000", k * 1.6);
    const light = mix(n.base, "#ffffff", k * 4);
    const d = n.distance;
    const pair = `${d}px ${d}px ${n.blur}px ${dark}, ${-d}px ${-d}px ${n.blur}px ${light}`;
    const bg =
      n.shape === "concave"
        ? `linear-gradient(145deg, ${mix(n.base, "#000000", k * 0.6)}, ${mix(n.base, "#ffffff", k * 1.4)})`
        : n.shape === "convex"
          ? `linear-gradient(145deg, ${mix(n.base, "#ffffff", k * 1.4)}, ${mix(n.base, "#000000", k * 0.6)})`
          : n.base;
    return [
      ["background", bg],
      ["border-radius", radius],
      ["box-shadow", n.shape === "pressed" ? `inset ${d}px ${d}px ${n.blur}px ${dark}, inset ${-d}px ${-d}px ${n.blur}px ${light}` : pair],
    ];
  }
  const camelCase = (p) => p.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const camel = (p) => (p.startsWith("-webkit-") ? "Webkit" + camelCase(p.slice(8)).replace(/^./, (c) => c.toUpperCase()) : camelCase(p));
  const surfaceColour = () => (S.mode === "shadow" ? S.card : S.mode === "neu" ? S.neu.base : null);
  const darkText = () => {
    if (S.mode === "glass") return ARTS[S.glass.art].light;
    return lum(surfaceColour()) > 0.4;
  };

  /* ── preview ────────────────────────────────────────────── */
  const stage = $("[data-sh-stage]");
  const art = $("[data-sh-art]");
  const card = $("[data-sh-card]");
  const btn = $("[data-sh-btn]");
  const tag = $("[data-sh-tag]");
  function applyTo(el, list, scale = 1) {
    el.removeAttribute("style");
    for (const [p, v] of list) {
      if (p === "border-radius" && scale !== 1) el.style.setProperty(p, Math.max(6, Math.round(S.radius * scale)) + "px");
      else el.style.setProperty(p, v);
    }
  }
  function renderPreview() {
    const list = decls();
    if (S.mode === "glass") art.style.background = ARTS[S.glass.art].css;
    else if (S.mode === "neu") art.style.background = S.neu.base;
    else art.style.background = STAGE_BG[S.bg];
    applyTo(card, list);
    card.classList.toggle("sh-dark-text", darkText());
    tag.textContent = S.mode === "shadow" ? (S.shadow.kind === "smooth" ? "Smooth shadow" : "Box shadow") : S.mode === "glass" ? "Glassmorphism" : "Neumorphism";
    btn.hidden = !S.showBtn;
    // the button carries the same effect, smaller
    if (S.mode === "neu") {
      const n = S.neu;
      const k = n.intensity / 100;
      const d = Math.max(2, Math.round(n.distance / 3));
      const bl = Math.max(2, Math.round(n.blur / 3));
      btn.removeAttribute("style");
      btn.style.background = n.base;
      btn.style.boxShadow = `${d}px ${d}px ${bl}px ${mix(n.base, "#000000", k * 1.6)}, ${-d}px ${-d}px ${bl}px ${mix(n.base, "#ffffff", k * 4)}`;
      btn.style.borderRadius = "999px";
    } else if (S.mode === "glass") {
      btn.removeAttribute("style");
      btn.style.background = rgba(S.glass.tint, Math.min(0.9, S.glass.tintA / 100 + 0.1));
      btn.style.border = `1px solid ${rgba("#ffffff", S.glass.border / 100)}`;
      btn.style.borderRadius = "999px";
    } else {
      btn.removeAttribute("style");
    }
    stage.classList.toggle("sh-light-stage", S.mode === "neu" ? lum(S.neu.base) > 0.4 : S.mode === "glass" ? ARTS[S.glass.art].light : S.bg !== "dark");
  }

  /* ── controls ───────────────────────────────────────────── */
  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), S);
  const set = (path, v) => {
    const ks = path.split(".");
    const last = ks.pop();
    ks.reduce((o, k) => o[k], S)[last] = v;
  };
  const FMT = {
    radius: (v) => v + "px",
    "shadow.smooth.angle": (v) => v + "°",
    "shadow.smooth.distance": (v) => v + "px",
    "shadow.smooth.blur": (v) => v + "px",
    "shadow.smooth.strength": (v) => v + "%",
    "glass.blur": (v) => v + "px",
    "glass.sat": (v) => v + "%",
    "glass.tintA": (v) => v + "%",
    "glass.border": (v) => v + "%",
    "glass.noise": (v) => v + "%",
    "neu.distance": (v) => v + "px",
    "neu.blur": (v) => v + "px",
    "neu.intensity": (v) => v + "%",
  };
  root.addEventListener("input", (e) => {
    const el = e.target;
    const path = el.dataset.shIn;
    if (path) {
      set(path, el.type === "checkbox" ? el.checked : el.type === "range" ? +el.value : el.value);
      const out = $(`[data-sh-out="${path}"]`);
      if (out) out.textContent = (FMT[path] || String)(+el.value);
      update(false);
      return;
    }
    // layer editor
    const li = el.closest("[data-sh-l]");
    if (li && el.dataset.k) {
      const L = S.shadow.layers[+li.dataset.shL];
      const k = el.dataset.k;
      L[k] = el.type === "checkbox" ? el.checked : el.type === "color" ? el.value : +el.value;
      if (k === "alpha") L.alpha = +el.value / 100;
      const o = li.querySelector(`[data-o="${k}"]`);
      if (o) o.textContent = k === "alpha" ? el.value + "%" : el.value + "px";
      update(false);
    }
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-sh-in], [data-k]")) update();
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    const m = t.closest("[data-sh-mode]");
    if (m) {
      S.mode = m.dataset.shMode;
      return update();
    }
    const s = t.closest("[data-sh-set]");
    if (s) {
      const [path, v] = s.dataset.shSet.split(":");
      set(path, v);
      if (path === "bg") S.card = v === "dark" ? "#16181c" : "#ffffff";
      return update();
    }
    if (t.closest("[data-sh-add]")) {
      S.shadow.layers.push({ x: 0, y: 12, blur: 32, spread: -8, color: "#0b0c0e", alpha: 0.2, inset: false });
      return update();
    }
    const act = t.closest("[data-act]");
    if (act) {
      const i = +act.closest("[data-sh-l]").dataset.shL;
      const L = S.shadow.layers;
      if (act.dataset.act === "del" && L.length > 1) L.splice(i, 1);
      if (act.dataset.act === "up" && i > 0) [L[i - 1], L[i]] = [L[i], L[i - 1]];
      if (act.dataset.act === "down" && i < L.length - 1) [L[i + 1], L[i]] = [L[i], L[i + 1]];
      return update();
    }
    const pr = t.closest("[data-sh-preset]");
    if (pr) {
      const p = PRESETS[+pr.dataset.shPreset];
      S = Object.assign(clone(DEFAULT), clone(p.s));
      return update();
    }
    if (t.closest("[data-sh-reset]")) {
      S = clone(DEFAULT);
      return update();
    }
    const tb = t.closest("[data-sh-tab]");
    if (tb) {
      tab = tb.dataset.shTab;
      return renderExport();
    }
    if (t.closest("[data-sh-copy]")) copyOut();
    if (t.closest("[data-sh-share]")) share();
  });

  function renderLayers() {
    const box = $("[data-sh-layers]");
    const L = S.shadow.layers;
    const sl = (k, label, min, max, v, unit = "px") => `<label class="sh-l-rng"><span>${label}<output data-o="${k}">${v}${unit}</output></span><input type="range" data-k="${k}" min="${min}" max="${max}" step="1" value="${v}" /></label>`;
    box.innerHTML = L.map(
      (l, i) => `<div class="sh-layer" data-sh-l="${i}">
        <div class="sh-l-head"><b>Layer ${i + 1}</b>
          <label class="sh-l-inset"><input type="checkbox" data-k="inset" ${l.inset ? "checked" : ""} /> Inset</label>
          <span class="sh-l-acts"><button type="button" data-act="up" aria-label="Move layer ${i + 1} up" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" data-act="down" aria-label="Move layer ${i + 1} down" ${i === L.length - 1 ? "disabled" : ""}>↓</button><button type="button" data-act="del" aria-label="Remove layer ${i + 1}" ${L.length <= 1 ? "disabled" : ""}>×</button></span>
        </div>
        <div class="sh-l-grid">
          ${sl("x", "X", -80, 80, l.x)}${sl("y", "Y", -80, 80, l.y)}${sl("blur", "Blur", 0, 160, l.blur)}${sl("spread", "Spread", -60, 60, l.spread)}
        </div>
        <div class="sh-l-col"><input type="color" data-k="color" value="${l.color}" aria-label="Layer ${i + 1} colour" />${sl("alpha", "Opacity", 0, 100, Math.round(l.alpha * 100), "%")}</div>
      </div>`
    ).join("");
  }

  function syncControls() {
    $$("[data-sh-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.shMode === S.mode)));
    $$("[data-sh-show]").forEach((el) => (el.hidden = el.dataset.shShow !== S.mode));
    $$("[data-sh-kind]").forEach((el) => (el.hidden = el.dataset.shKind !== S.shadow.kind));
    $$("[data-sh-set]").forEach((b) => {
      const [path, v] = b.dataset.shSet.split(":");
      b.setAttribute("aria-pressed", String(String(get(path)) === v));
    });
    $$("[data-sh-in]").forEach((el) => {
      const v = get(el.dataset.shIn);
      if (el.type === "checkbox") el.checked = !!v;
      else el.value = v;
      const out = $(`[data-sh-out="${el.dataset.shIn}"]`);
      if (out) out.textContent = (FMT[el.dataset.shIn] || String)(v);
    });
    renderLayers();
  }

  /* ── export ─────────────────────────────────────────────── */
  let tab = "css";
  const out = $("[data-sh-code]");
  const cls = () => (S.mode === "glass" ? "glass-card" : S.mode === "neu" ? "neu-card" : "shadow-card");
  const tw = (v) => v.replace(/\s*,\s*/g, ",").replace(/\s+/g, "_");
  const twUrl = (v) => v.replace(/url\("([^"]+)"\)/g, "url('$1')"); // quoted: the SVG contains ( )
  function code() {
    const list = decls();
    const name = cls();
    const note = S.mode === "neu" ? `/* Neumorphism needs a matching page background: ${S.neu.base} */\n` : S.mode === "glass" ? "/* Place over something colourful so the blur shows. */\n" : "";
    if (tab === "css") return `${note}.${name} {\n${list.map(([p, v]) => `  ${p}: ${v};`).join("\n")}\n}`;
    if (tab === "vars") {
      const vars = list.map(([p, v]) => [`--${name}-${p.replace(/^-webkit-/, "webkit-")}`, v]);
      return `${note}:root {\n${vars.map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}\n\n.${name} {\n${list.map(([p], i) => `  ${p}: var(${vars[i][0]});`).join("\n")}\n}`;
    }
    if (tab === "tailwind") {
      const classes = list.map(([p, v]) => {
        if (p === "border-radius") return `rounded-[${v}]`;
        if (p === "box-shadow") return `shadow-[${tw(v)}]`;
        if (p === "background" && isHex(v)) return `bg-[${v}]`;
        return `[${p}:${tw(twUrl(v))}]`;
      });
      return `${note.replace(/\/\* (.*) \*\/\n/, "<!-- $1 -->\n")}<div class="${classes.join(" ")}">\n  …\n</div>`;
    }
    // react
    const style = list.map(([p, v]) => `  ${camel(p)}: ${JSON.stringify(v)},`).join("\n");
    return `// Made with NiceUI Shadow & Glass Maker. No dependencies.
import type { CSSProperties, ReactNode } from 'react';

${note.replace(/\/\* (.*) \*\/\n/, "// $1\n")}const STYLE: CSSProperties = {
${style}
};

export function ${name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())}({ className = '', style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={className} style={{ ...STYLE, ...style }}>
      {children}
    </div>
  );
}
`;
  }
  function renderExport() {
    $$("[data-sh-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.shTab === tab)));
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
  async function copyOut() {
    const text = code();
    try {
      await navigator.clipboard.writeText(text);
      flash(`Copied ${{ css: "CSS", tailwind: "Tailwind", react: "React", vars: "CSS variables" }[tab]} · ${text.split("\n").length} lines`);
    } catch {
      flash("Copy failed — select the code and copy it");
    }
  }

  /* share link: state in the URL hash */
  const encode = () => btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  async function share() {
    history.replaceState(null, "", "#sh=" + encode());
    try {
      await navigator.clipboard.writeText(location.href);
      flash("Share link copied");
    } catch {
      flash("Link is in the address bar");
    }
  }
  function loadHash() {
    if (!location.hash.startsWith("#sh=")) return;
    try {
      const v = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(4)))));
      if (v && v.mode) S = Object.assign(clone(DEFAULT), v, { shadow: { ...clone(DEFAULT.shadow), ...(v.shadow || {}) }, glass: { ...DEFAULT.glass, ...(v.glass || {}) }, neu: { ...DEFAULT.neu, ...(v.neu || {}) } });
    } catch {}
  }

  /* ── presets ────────────────────────────────────────────── */
  const sm = (o) => ({ ...DEFAULT.shadow.smooth, ...o });
  const PRESETS = [
    { name: "Soft lift", s: { mode: "shadow", bg: "light", card: "#ffffff", shadow: { kind: "smooth", layers: DEFAULT.shadow.layers, smooth: sm({ n: 6, distance: 24, blur: 48, strength: 16 }) } } },
    { name: "Floating", s: { mode: "shadow", bg: "gradient", card: "#ffffff", radius: 24, shadow: { kind: "smooth", layers: DEFAULT.shadow.layers, smooth: sm({ n: 8, distance: 64, blur: 96, strength: 24 }) } } },
    { name: "Long cast", s: { mode: "shadow", bg: "light", card: "#ffffff", radius: 14, shadow: { kind: "smooth", layers: DEFAULT.shadow.layers, smooth: sm({ n: 7, angle: 45, distance: 72, blur: 16, strength: 26 }) } } },
    { name: "Crisp", s: { mode: "shadow", bg: "light", card: "#ffffff", radius: 12, shadow: { kind: "layers", smooth: DEFAULT.shadow.smooth, layers: [{ x: 0, y: 0, blur: 0, spread: 1, color: "#0b0c0e", alpha: 0.06, inset: false }, { x: 0, y: 1, blur: 2, spread: 0, color: "#0b0c0e", alpha: 0.08, inset: false }, { x: 0, y: 4, blur: 12, spread: -2, color: "#0b0c0e", alpha: 0.1, inset: false }] } } },
    { name: "Sky glow", s: { mode: "shadow", bg: "dark", card: "#0c1a24", radius: 20, shadow: { kind: "layers", smooth: DEFAULT.shadow.smooth, layers: [{ x: 0, y: 0, blur: 0, spread: 1, color: "#7dd3fc", alpha: 0.35, inset: false }, { x: 0, y: 16, blur: 48, spread: -8, color: "#0ea5e9", alpha: 0.55, inset: false }] } } },
    { name: "Inset well", s: { mode: "shadow", bg: "light", card: "#f1f3f6", radius: 18, shadow: { kind: "layers", smooth: DEFAULT.shadow.smooth, layers: [{ x: 0, y: 2, blur: 6, spread: 0, color: "#0b0c0e", alpha: 0.12, inset: true }, { x: 0, y: 1, blur: 0, spread: 0, color: "#ffffff", alpha: 0.9, inset: false }] } } },
    { name: "Frosted", s: { mode: "glass", radius: 22, glass: { blur: 16, sat: 160, tint: "#ffffff", tintA: 14, border: 30, noise: 6, art: "aurora" } } },
    { name: "Dark glass", s: { mode: "glass", radius: 20, glass: { blur: 22, sat: 140, tint: "#05070a", tintA: 40, border: 14, noise: 4, art: "sunset" } } },
    { name: "Ocean glass", s: { mode: "glass", radius: 26, glass: { blur: 12, sat: 180, tint: "#a5f3fc", tintA: 10, border: 36, noise: 8, art: "ocean" } } },
    { name: "Candy glass", s: { mode: "glass", radius: 24, glass: { blur: 18, sat: 150, tint: "#ffffff", tintA: 35, border: 60, noise: 5, art: "candy" } } },
    { name: "Soft clay", s: { mode: "neu", radius: 26, neu: { shape: "flat", base: "#e0e5ec", distance: 14, blur: 28, intensity: 15 } } },
    { name: "Pressed", s: { mode: "neu", radius: 24, neu: { shape: "pressed", base: "#e6e9ef", distance: 8, blur: 16, intensity: 14 } } },
    { name: "Night convex", s: { mode: "neu", radius: 28, neu: { shape: "convex", base: "#23262b", distance: 12, blur: 26, intensity: 22 } } },
  ];
  function renderPresets() {
    const keep = S;
    $("[data-sh-presets]").innerHTML = PRESETS.map((p, i) => {
      S = Object.assign(clone(DEFAULT), clone(p.s));
      const bgv = S.mode === "glass" ? ARTS[S.glass.art].css : S.mode === "neu" ? S.neu.base : STAGE_BG[S.bg];
      const st = decls()
        .map(([k, v]) => (k === "box-shadow" ? `${k}:${v.replace(/(-?\d+(?:\.\d+)?)px/g, (_, n) => r2(n / 3) + "px")}` : k === "border-radius" ? `${k}:${Math.max(4, Math.round(S.radius / 3))}px` : `${k}:${v}`))
        .join(";");
      return `<button type="button" class="gm-preset sh-preset" data-sh-preset="${i}"><span style="background:${bgv}"><i style="${st.replace(/"/g, "'")}"></i></span><b>${p.name}</b></button>`;
    }).join("");
    S = keep;
  }

  /* ── update cycle ───────────────────────────────────────── */
  let saveT = 0;
  function update(full = true) {
    renderPreview();
    if (full) syncControls();
    renderExport();
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#sh=" + encode()), 400);
  }
  renderPresets();
  loadHash();
  update();
  addEventListener("hashchange", () => {
    if (location.hash.slice(4) === encode()) return;
    loadHash();
    update();
  });
})();
