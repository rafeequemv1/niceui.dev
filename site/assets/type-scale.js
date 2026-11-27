/* NiceUI Type Scale Generator — fluid clamp() type and spacing scales.
   Plain JavaScript, no dependencies. Every export is dependency-free too. */
(() => {
  const root = document.querySelector("[data-ts]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];

  /* ── state ──────────────────────────────────────────────── */
  const DEFAULT = { vwMin: 360, vwMax: 1280, baseMin: 16, baseMax: 18, ratioMin: 1.2, ratioMax: 1.25, down: 2, up: 6, names: "tw", font: "geist", lhBody: 1.6, lhHead: 1.1, track: true, spacing: true };
  const PRESETS = [
    ["Default", {}],
    ["Editorial", { baseMin: 17, baseMax: 20, ratioMin: 1.2, ratioMax: 1.333, up: 6, font: "serif", lhBody: 1.7, lhHead: 1.15 }],
    ["Compact UI", { baseMin: 14, baseMax: 15, ratioMin: 1.125, ratioMax: 1.2, down: 2, up: 5, font: "system", lhBody: 1.5, lhHead: 1.2 }],
    ["Display", { baseMin: 16, baseMax: 19, ratioMin: 1.25, ratioMax: 1.5, up: 7, lhHead: 1.0 }],
    ["Docs", { baseMin: 15, baseMax: 17, ratioMin: 1.2, ratioMax: 1.2, up: 5, font: "system", lhBody: 1.65 }],
    ["Golden", { baseMin: 17, baseMax: 20, ratioMin: 1.333, ratioMax: 1.618, up: 6, lhHead: 1.05 }],
  ];
  let S = { ...DEFAULT };
  let view = "specimen";
  let tab = "css";
  let vw = 1280;

  const FONTS = {
    geist: '"Geist", ui-sans-serif, system-ui, sans-serif',
    system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    serif: '"Instrument Serif", ui-serif, Georgia, Cambria, "Times New Roman", serif',
    mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  };
  const SPACE = [["3xs", 0.25], ["2xs", 0.5], ["xs", 0.75], ["s", 1], ["m", 1.5], ["l", 2], ["xl", 3], ["2xl", 4], ["3xl", 6]];

  /* ── maths ──────────────────────────────────────────────── */
  const r4 = (n) => String(+n.toFixed(4));
  const clampNum = (v, a, b) => Math.min(b, Math.max(a, v));
  // A fluid value from minPx (at vwMin) to maxPx (at vwMax).
  function fluid(minPx, maxPx) {
    const span = Math.max(1, S.vwMax - S.vwMin);
    const slope = (maxPx - minPx) / span;
    const intercept = minPx - slope * S.vwMin;
    const lo = Math.min(minPx, maxPx);
    const hi = Math.max(minPx, maxPx);
    const css = (unit) => {
      if (Math.abs(slope) < 1e-6) return `${r4(minPx / 16)}rem`;
      const sv = slope * 100;
      return `clamp(${r4(lo / 16)}rem, ${r4(intercept / 16)}rem ${sv >= 0 ? "+" : "-"} ${r4(Math.abs(sv))}${unit}, ${r4(hi / 16)}rem)`;
    };
    return { minPx, maxPx, lo, hi, css, at: (w) => clampNum(intercept + slope * w, lo, hi) };
  }
  const stepName = (i) => {
    if (S.names === "step") return `step-${i}`;
    if (S.names === "tw") {
      if (i === 0) return "base";
      if (i < 0) return ["sm", "xs", "2xs"][-i - 1];
      return ["lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl"][i - 1];
    }
    if (i === 0) return "body";
    if (i < 0) return ["small", "x-small", "2x-small"][-i - 1];
    const fromTop = S.up - i; // 0 = largest
    if (fromTop < 6) return "h" + (fromTop + 1);
    return ["large", "x-large", "2x-large"][i - 1] || "step-" + i;
  };
  const varName = (i) => `--step-${i}`;
  function steps() {
    const out = [];
    for (let i = S.up; i >= -S.down; i--) {
      const f = fluid(S.baseMin * Math.pow(S.ratioMin, i), S.baseMax * Math.pow(S.ratioMax, i));
      const lh = i <= 0 ? S.lhBody : i >= 3 ? S.lhHead : S.lhBody + (S.lhHead - S.lhBody) * (i / 3);
      const ls = S.track && i >= 2 ? -Math.min(0.04, 0.01 * (i - 1)) : S.track && i <= -2 ? 0.01 : 0;
      out.push({ i, name: stepName(i), v: varName(i), f, lh: +lh.toFixed(2), ls: +ls.toFixed(3) });
    }
    return out;
  }
  const spaces = () => SPACE.map(([n, m]) => ({ name: n, v: `--space-${n}`, f: fluid(S.baseMin * m, S.baseMax * m) }));

  /* ── exports ────────────────────────────────────────────── */
  const header = () => `Fluid type scale · ${S.vwMin}px → ${S.vwMax}px · ${S.baseMin}px → ${S.baseMax}px · ratio ${S.ratioMin} → ${S.ratioMax}. Made with NiceUI Type Scale Generator.`;
  const ems = (n) => (n === 0 ? "0" : `${n}em`);
  function code() {
    const st = steps();
    const sp = S.spacing ? spaces() : [];
    if (tab === "css" || tab === "classes") {
      const vars = [...st.map((s) => `  ${s.v}: ${s.f.css("vw")};`), ...(sp.length ? ["", ...sp.map((s) => `  ${s.v}: ${s.f.css("vw")};`)] : [])].join("\n");
      let css = `/* ${header()} */\n:root {\n${vars}\n}`;
      if (tab === "classes") {
        css += "\n\n" + st.map((s) => `.text-${s.name} {\n  font-size: var(${s.v});\n  line-height: ${s.lh};\n  letter-spacing: ${ems(s.ls)};\n}`).join("\n\n");
        if (sp.length) css += "\n\n" + sp.map((s) => `.p-${s.name} { padding: var(${s.v}); }\n.gap-${s.name} { gap: var(${s.v}); }\n.mt-${s.name} { margin-top: var(${s.v}); }`).join("\n");
      }
      return css;
    }
    if (tab === "tw3") {
      const fs = st.map((s) => `        '${s.name}': ['${s.f.css("vw")}', { lineHeight: '${s.lh}', letterSpacing: '${ems(s.ls)}' }],`).join("\n");
      const spc = sp.map((s) => `        '${s.name}': '${s.f.css("vw")}',`).join("\n");
      return `// ${header()}\n/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      fontSize: {\n${fs}\n      },${sp.length ? `\n      spacing: {\n${spc}\n      },` : ""}\n    },\n  },\n};`;
    }
    if (tab === "tw4") {
      const t = st.map((s) => `  --text-${s.name}: ${s.f.css("vw")};\n  --text-${s.name}--line-height: ${s.lh};\n  --text-${s.name}--letter-spacing: ${ems(s.ls)};`).join("\n");
      const spc = sp.map((s) => `  --spacing-${s.name}: ${s.f.css("vw")};`).join("\n");
      return `/* ${header()} */\n@theme {\n${t}${sp.length ? "\n\n" + spc : ""}\n}`;
    }
    const json = {
      viewport: { min: S.vwMin, max: S.vwMax },
      base: { min: S.baseMin, max: S.baseMax },
      ratio: { min: S.ratioMin, max: S.ratioMax },
      fontSize: Object.fromEntries(st.map((s) => [s.name, { value: s.f.css("vw"), min: `${r4(s.f.lo / 16)}rem`, max: `${r4(s.f.hi / 16)}rem`, lineHeight: s.lh, letterSpacing: ems(s.ls) }])),
      ...(sp.length ? { spacing: Object.fromEntries(sp.map((s) => [s.name, { value: s.f.css("vw"), min: `${r4(s.f.lo / 16)}rem`, max: `${r4(s.f.hi / 16)}rem` }])) } : {}),
    };
    return JSON.stringify(json, null, 2);
  }
  const TAB_LABEL = { css: "CSS", classes: "classes", tw3: "Tailwind v3 config", tw4: "Tailwind v4 theme", json: "JSON" };

  /* ── preview ────────────────────────────────────────────── */
  const stage = $("[data-ts-stage]");
  const frame = $("[data-ts-frame]");
  const doc = $("[data-ts-doc]");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function renderPreview() {
    const st = steps();
    const sp = spaces();
    // container units in the preview, so the slider drives the sizes
    const vars = [...st.map((s) => `${s.v}:${s.f.css("cqi")}`), ...sp.map((s) => `${s.v}:${s.f.css("cqi")}`)].join(";");
    doc.setAttribute("style", `${vars};font-family:${FONTS[S.font]}`);
    const by = (i) => st.find((s) => s.i === i) || st[0];
    const T = (i, tag, text, cls = "") => {
      const s = by(i);
      return `<${tag} class="${cls}" style="font-size:var(${s.v});line-height:${s.lh};letter-spacing:${ems(s.ls)}">${text}</${tag}>`;
    };
    if (view === "specimen") {
      doc.innerHTML = `<div class="ts-spec">${st
        .map(
          (s) => `<div class="ts-row${s.i === 0 ? " is-base" : ""}"><div class="ts-meta"><b>${esc(s.name)}</b><span>${Math.round(s.f.at(vw) * 10) / 10}px</span><code>${esc(s.f.css("vw"))}</code></div><div class="ts-sample" style="font-size:var(${s.v});line-height:${s.lh};letter-spacing:${ems(s.ls)}">${s.i >= 3 ? "Fluid type, set once" : s.i >= 1 ? "Headings that scale with the screen" : "Body text stays readable at every width, from a small phone to a wide desktop monitor."}</div></div>`
        )
        .join("")}</div>`;
    } else if (view === "page") {
      const top = S.up;
      doc.innerHTML = `<div class="ts-page">
        <header class="ts-hero" style="padding-block:var(--space-2xl) var(--space-xl)">
          ${T(-1, "p", "Typography · Fluid scale", "ts-eyebrow")}
          ${T(top, "h1", "Words that fit every screen")}
          ${T(1, "p", "One scale, written once with clamp(), grows smoothly from phones to wide monitors without a single breakpoint.", "ts-lead")}
          <div class="ts-btns" style="margin-top:var(--space-l);gap:var(--space-xs)"><span class="ts-btn">Get started</span><span class="ts-btn ts-btn-2">Read the docs</span></div>
        </header>
        <article class="ts-art" style="gap:var(--space-s)">
          ${T(Math.max(2, top - 2), "h2", "Why fluid typography")}
          ${T(0, "p", "Fixed font sizes jump at breakpoints, which makes headings feel too big on tablets and too small on large screens. A fluid scale interpolates between a minimum and a maximum, so every step keeps its proportion at any width.")}
          ${T(Math.max(1, top - 4), "h3", "Built on a ratio")}
          ${T(0, "p", "Each step is the base size multiplied by a ratio. A smaller ratio on phones keeps big headings from overflowing, while a larger ratio on desktop adds drama.")}
          ${T(-1, "p", "Tip: keep body text at 16px or more on the smallest screen.", "ts-caption")}
        </article>
      </div>`;
    } else {
      doc.innerHTML = `<div class="ts-spaces">${sp
        .map((s) => `<div class="ts-sp"><b>${s.name}</b><span class="ts-sp-bar" style="width:var(${s.v});height:var(${s.v})"></span><span class="ts-sp-px">${Math.round(s.f.at(vw) * 10) / 10}px</span><code>${esc(s.f.css("vw"))}</code></div>`)
        .join("")}</div>${S.spacing ? "" : `<p class="ts-off">The spacing scale is turned off, so it won't be exported. Turn it on in the Spacing panel.</p>`}`;
    }
    fit();
  }
  // show the doc at the chosen viewport width, zoomed to fit the stage
  function fit() {
    frame.style.width = vw + "px";
    const avail = stage.clientWidth - 2;
    const z = Math.min(1, avail / vw);
    frame.style.zoom = String(z);
    $("[data-ts-vw-out]").textContent = `${vw}px${z < 1 ? ` · shown at ${Math.round(z * 100)}%` : ""}`;
    $("[data-ts-marks]").textContent = vw < S.vwMin ? `Below ${S.vwMin}px: sizes stay at their minimum` : vw > S.vwMax ? `Above ${S.vwMax}px: sizes stay at their maximum` : `Fluid between ${S.vwMin}px and ${S.vwMax}px`;
  }
  addEventListener("resize", fit);

  /* ── controls ───────────────────────────────────────────── */
  const RATIO_VALUES = ["1.067", "1.125", "1.2", "1.25", "1.333", "1.414", "1.5", "1.618"];
  const customRatio = { ratioMin: false, ratioMax: false };
  function syncControls() {
    for (const el of $$("[data-ts-in]")) {
      const k = el.dataset.tsIn;
      if (k.endsWith("Sel")) {
        const key = k.slice(0, -3);
        const v = String(S[key]);
        el.value = customRatio[key] || !RATIO_VALUES.includes(v) ? "custom" : v;
        const custom = $(`[data-ts-in="${key}"]`);
        custom.hidden = el.value !== "custom";
        continue;
      }
      if (el.type === "checkbox") el.checked = !!S[k];
      else if (document.activeElement !== el) el.value = S[k];
      const out = $(`[data-ts-out="${k}"]`);
      if (out) out.textContent = Number(S[k]).toFixed(2);
    }
    $$("[data-ts-seg]").forEach((b) => b.setAttribute("aria-pressed", String(S[b.dataset.tsSeg] === b.dataset.v)));
    const warn = $("[data-ts-warn]");
    const smallest = S.baseMin * Math.pow(S.ratioMin, -S.down);
    const msgs = [];
    if (S.baseMin < 16) msgs.push(`Body text is ${S.baseMin}px on small screens. 16px or more reads better and matches browser defaults.`);
    if (smallest < 11) msgs.push(`The smallest step is ${smallest.toFixed(1)}px on small screens. Keep captions and labels at 11–12px or more.`);
    warn.hidden = !msgs.length;
    warn.textContent = msgs.join(" ");
    const vwIn = $("[data-ts-vw]");
    vwIn.min = String(Math.min(320, S.vwMin));
    vwIn.max = String(Math.max(1920, S.vwMax + 200));
  }
  function renderExport() {
    $$("[data-ts-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tsTab === tab)));
    $("[data-ts-code]").textContent = code();
    $("[data-ts-copy-label]").textContent = `Copy ${TAB_LABEL[tab]}`;
  }
  let saveT = 0;
  function update() {
    syncControls();
    renderPreview();
    renderExport();
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#ts=" + encode()), 300);
  }

  const LIMITS = { vwMin: [240, 2400], vwMax: [400, 2560], baseMin: [8, 40], baseMax: [8, 48], ratioMin: [1.01, 2], ratioMax: [1.01, 2], down: [0, 3], up: [1, 9], lhBody: [1, 2.2], lhHead: [0.8, 1.6] };
  root.addEventListener("input", (e) => {
    const el = e.target.closest("[data-ts-in]");
    if (el) {
      const k = el.dataset.tsIn;
      if (k.endsWith("Sel")) {
        const key = k.slice(0, -3);
        customRatio[key] = el.value === "custom";
        if (el.value !== "custom") S[key] = +el.value;
        $(`[data-ts-in="${key}"]`).hidden = el.value !== "custom";
      } else if (el.type === "checkbox") S[k] = el.checked;
      else {
        const v = parseFloat(el.value);
        if (!Number.isFinite(v)) return;
        const [a, b] = LIMITS[k] || [-Infinity, Infinity];
        S[k] = clampNum(v, a, b);
        if (k === "down" || k === "up") S[k] = Math.round(S[k]);
      }
      if (S.vwMax <= S.vwMin + 50) {
        if (k === "vwMin") S.vwMax = S.vwMin + 50;
        else S.vwMin = Math.max(240, S.vwMax - 50);
      }
      update();
      return;
    }
    if (e.target.matches("[data-ts-vw]")) {
      vw = +e.target.value;
      renderPreview();
    }
  });
  root.addEventListener("click", (e) => {
    const sg = e.target.closest("[data-ts-seg]");
    if (sg) {
      S[sg.dataset.tsSeg] = sg.dataset.v;
      update();
    }
    const v = e.target.closest("[data-ts-view]");
    if (v) {
      view = v.dataset.tsView;
      $$("[data-ts-view]").forEach((b) => b.setAttribute("aria-selected", String(b === v)));
      renderPreview();
    }
    const t = e.target.closest("[data-ts-tab]");
    if (t) {
      tab = t.dataset.tsTab;
      renderExport();
    }
    const p = e.target.closest("[data-ts-preset]");
    if (p) {
      S = { ...DEFAULT, ...PRESETS[+p.dataset.tsPreset][1] };
      $$("[data-ts-preset]").forEach((b) => b.setAttribute("aria-pressed", String(b === p)));
      update();
    }
    if (e.target.closest("[data-ts-reset]")) {
      S = { ...DEFAULT };
      update();
    }
    if (e.target.closest("[data-ts-copy]")) copyCode();
    if (e.target.closest("[data-ts-share]")) share();
  });

  /* ── copy, share, toast ─────────────────────────────────── */
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
      flash(`Copied ${TAB_LABEL[tab]} · ${text.split("\n").length} lines`);
    } catch {
      flash("Copy failed — select the code and copy it");
    }
  }
  const encode = () => btoa(JSON.stringify(S));
  async function share() {
    const url = location.origin + location.pathname + "#ts=" + encode();
    history.replaceState(null, "", "#ts=" + encode());
    try {
      await navigator.clipboard.writeText(url);
      flash("Share link copied");
    } catch {
      flash("Link is in the address bar");
    }
  }
  function load() {
    try {
      if (location.hash.startsWith("#ts=")) {
        const v = JSON.parse(atob(location.hash.slice(4)));
        if (v && typeof v === "object") S = { ...DEFAULT, ...v };
      }
    } catch {}
  }

  $("[data-ts-presets]").innerHTML = PRESETS.map(([n, p], i) => {
    const s = { ...DEFAULT, ...p };
    return `<button type="button" class="ts-preset" data-ts-preset="${i}" aria-pressed="false"><span class="ts-preset-aa" style="font-family:${FONTS[s.font].replace(/"/g, "'")}">Aa</span><b>${n}</b><i>${s.ratioMin} → ${s.ratioMax}</i></button>`;
  }).join("");
  load();
  // phones start at their own width so the preview is readable; wider screens start at the max viewport
  vw = innerWidth < 700 ? clampNum(Math.round(stage.clientWidth - 2) || 360, 320, S.vwMax) : clampNum(S.vwMax, 320, 1920);
  $("[data-ts-vw]").value = String(vw);
  update();
  new ResizeObserver(fit).observe(stage);
})();
