/* NiceUI Bento Grid Builder — draw bento layouts, export Tailwind / React / HTML + CSS. Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-bg]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ── content ───────────────────────────────────────────── */
  const TYPES = [
    ["text", "Text"],
    ["stat", "Stat"],
    ["chart", "Chart"],
    ["icon", "Icon"],
    ["image", "Image"],
    ["cta", "Button"],
    ["empty", "Empty"],
  ];
  const STYLES = [
    ["surface", "Surface"],
    ["gradient", "Gradient"],
    ["accent", "Accent"],
    ["image", "Image"],
    ["outline", "Outline"],
  ];
  // simple icons drawn for NiceUI (24×24, stroke)
  const ICONS = {
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    sparkle: '<path d="M12 3c.8 4.5 3.7 7.4 8 8-4.3.6-7.2 3.5-8 8-.8-4.5-3.7-7.4-8-8 4.3-.6 7.2-3.5 8-8z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    rocket: '<path d="M5 15c-1 1-1.5 3.5-1.5 5.5 2 0 4.5-.5 5.5-1.5"/><path d="M9 15 6 12c2-5 6-9 13-9 0 7-4 11-9 13z"/><circle cx="14.5" cy="9.5" r="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a5.5 5.5 0 0 1 3.5 6"/>',
    code: '<path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/><path d="m14 4-4 16"/>',
    cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.5A3.75 3.75 0 0 1 17.5 18z"/>',
  };
  const DEFAULTS = {
    text: { title: "Headline goes here", text: "One short line that explains the idea." },
    stat: { value: "48.2k", label: "Monthly users" },
    chart: { title: "Revenue", value: "$12.4k" },
    icon: { icon: "zap", title: "Fast by default", text: "Edge rendering everywhere." },
    image: { title: "Product shot" },
    cta: { title: "Ready to start?", text: "Get started" },
    empty: {},
  };

  /* ── state ─────────────────────────────────────────────── */
  const DEF = { cols: 4, rowH: 140, gap: 12, radius: 20, theme: "dark", accent: "#38bdf8", mobile: "1", view: "desktop", cells: [] };
  let S = structuredClone(DEF);
  let sel = null; // selected cell id
  let tab = "tailwind";
  let nid = 1;
  const newId = () => "c" + nid++;
  const cell = (x, y, w, h, type = "text", style = "surface", props = {}) => ({ id: newId(), x, y, w, h, type, style, ...DEFAULTS[type], ...props });

  /* ── presets ───────────────────────────────────────────── */
  const P = (cols, list, extra = {}) => ({ cols, ...extra, cells: list });
  const PRESETS = [
    ["Feature bento", P(4, [
      [0, 0, 2, 2, "text", "gradient", { title: "Ship faster with AI", text: "Agents draft, test and deploy while you review each step." }],
      [2, 0, 1, 1, "stat", "surface", { value: "99.9%", label: "Uptime" }],
      [3, 0, 1, 1, "icon", "surface", { icon: "shield", title: "SOC 2", text: "Audited yearly" }],
      [2, 1, 2, 1, "chart", "surface", { title: "Weekly active", value: "48.2k" }],
      [0, 2, 1, 1, "icon", "surface", { icon: "zap", title: "Instant", text: "Edge in 40 regions" }],
      [1, 2, 2, 1, "image", "image", { title: "Built for teams" }],
      [3, 2, 1, 1, "cta", "accent", { title: "Start free", text: "Get started" }],
    ])],
    ["Product showcase", P(4, [
      [0, 0, 3, 2, "image", "image", { title: "Meet Halo One" }],
      [3, 0, 1, 1, "stat", "surface", { value: "18h", label: "Battery life" }],
      [3, 1, 1, 1, "stat", "surface", { value: "212g", label: "Weight" }],
      [0, 2, 1, 1, "icon", "surface", { icon: "sparkle", title: "Adaptive", text: "Learns your day" }],
      [1, 2, 2, 1, "text", "gradient", { title: "Quiet, until it matters", text: "Noise that fades as you focus." }],
      [3, 2, 1, 1, "cta", "accent", { title: "From $199", text: "Pre-order" }],
    ])],
    ["Portfolio", P(3, [
      [0, 0, 1, 2, "image", "image", { title: "Brand system" }],
      [1, 0, 2, 1, "text", "surface", { title: "Hi, I'm Ava", text: "Product designer crafting calm interfaces." }],
      [1, 1, 1, 1, "image", "image", { title: "Mobile app" }],
      [2, 1, 1, 1, "stat", "surface", { value: "12", label: "Years designing" }],
      [0, 2, 3, 1, "cta", "outline", { title: "Open to new projects in 2026", text: "Say hello" }],
    ], { rowH: 160 })],
    ["Dashboard", P(4, [
      [0, 0, 1, 1, "stat", "surface", { value: "$84.1k", label: "Revenue" }],
      [1, 0, 1, 1, "stat", "surface", { value: "2,401", label: "New users" }],
      [2, 0, 1, 1, "stat", "surface", { value: "4.6%", label: "Conversion" }],
      [3, 0, 1, 1, "stat", "accent", { value: "98", label: "NPS" }],
      [0, 1, 3, 2, "chart", "surface", { title: "Revenue, last 30 days", value: "$84.1k" }],
      [3, 1, 1, 2, "text", "gradient", { title: "Top channel", text: "Organic search brought 41% of signups this month." }],
    ], { rowH: 120 })],
    ["2 × 2 + wide", P(4, [
      [0, 0, 2, 2, "image", "image", { title: "Design" }],
      [2, 0, 2, 2, "text", "gradient", { title: "Two halves, one story", text: "Pair a visual with the message beside it." }],
      [0, 2, 4, 1, "cta", "surface", { title: "Start building today", text: "Get started" }],
    ])],
    ["Asymmetric hero", P(6, [
      [0, 0, 4, 2, "text", "gradient", { title: "The workspace for focused teams", text: "Docs, tasks and chat in one calm place." }],
      [4, 0, 2, 1, "stat", "surface", { value: "10k+", label: "Teams" }],
      [4, 1, 2, 1, "icon", "surface", { icon: "users", title: "Multiplayer", text: "Edit together live" }],
      [0, 2, 2, 1, "icon", "surface", { icon: "lock", title: "Private", text: "End-to-end encrypted" }],
      [2, 2, 2, 1, "icon", "surface", { icon: "globe", title: "Global", text: "Data in your region" }],
      [4, 2, 2, 1, "cta", "accent", { title: "Free for 5 seats", text: "Try it" }],
    ])],
    ["Stats strip", P(4, [
      [0, 0, 1, 1, "stat", "surface", { value: "3.2M", label: "Requests a day" }],
      [1, 0, 1, 1, "stat", "surface", { value: "42 ms", label: "p95 latency" }],
      [2, 0, 1, 1, "stat", "surface", { value: "180", label: "Countries" }],
      [3, 0, 1, 1, "stat", "surface", { value: "24/7", label: "Support" }],
      [0, 1, 4, 1, "text", "gradient", { title: "Numbers that hold up at scale", text: "Measured across every customer, every day." }],
    ], { rowH: 130 })],
    ["Mobile-first", P(2, [
      [0, 0, 2, 1, "text", "gradient", { title: "Your money, sorted", text: "Budgets that update themselves." }],
      [0, 1, 1, 1, "stat", "surface", { value: "$2,480", label: "Saved" }],
      [1, 1, 1, 1, "icon", "surface", { icon: "shield", title: "Protected", text: "Bank-grade" }],
      [0, 2, 2, 1, "chart", "surface", { title: "Spending", value: "-12%" }],
      [0, 3, 2, 1, "cta", "accent", { title: "Open an account", text: "Download" }],
    ], { mobile: "2", rowH: 130 })],
    ["Pricing", P(3, [
      [0, 0, 1, 2, "text", "surface", { title: "Starter · $0", text: "For side projects. 3 projects, community support." }],
      [1, 0, 1, 2, "text", "gradient", { title: "Pro · $19", text: "For professionals. Unlimited projects, priority support." }],
      [2, 0, 1, 2, "text", "surface", { title: "Team · $49", text: "For companies. SSO, audit logs and roles." }],
      [0, 2, 3, 1, "cta", "accent", { title: "All plans include a 14-day trial", text: "Start trial" }],
    ], { rowH: 150 })],
    ["Gallery", P(4, [
      [0, 0, 2, 2, "image", "image", { title: "Coast" }],
      [2, 0, 1, 1, "image", "image", { title: "Dune" }],
      [3, 0, 1, 2, "image", "image", { title: "Forest" }],
      [2, 1, 1, 1, "image", "image", { title: "Night" }],
      [0, 2, 1, 1, "image", "image", { title: "Glacier" }],
      [1, 2, 3, 1, "image", "image", { title: "Horizon" }],
    ])],
  ];
  function loadPreset(i) {
    const p = PRESETS[i][1];
    S = { ...S, cols: p.cols, rowH: p.rowH || 140, mobile: p.mobile || "1", cells: p.cells.map(([x, y, w, h, t, st, pr]) => cell(x, y, w, h, t, st, pr)) };
    sel = null;
  }

  /* ── geometry ──────────────────────────────────────────── */
  const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const fits = (r, ignore) => r.x >= 0 && r.y >= 0 && r.w >= 1 && r.h >= 1 && r.x + r.w <= S.cols && r.y + r.h <= MAXROWS && !S.cells.some((c) => c.id !== ignore && overlaps(r, c));
  const MAXROWS = 16;
  const usedRows = () => S.cells.reduce((m, c) => Math.max(m, c.y + c.h), 0);
  const shownRows = () => clamp(usedRows() + 1, 3, MAXROWS);
  // make every cell fit the column count, pushing clashes down
  function normalize() {
    const placed = [];
    const sorted = [...S.cells].sort((a, b) => a.y - b.y || a.x - b.x);
    for (const c of sorted) {
      c.w = clamp(c.w, 1, S.cols);
      c.x = clamp(c.x, 0, S.cols - c.w);
      while (placed.some((p) => overlaps(c, p))) c.y++;
      placed.push(c);
    }
    S.cells = S.cells.filter((c) => c.y + c.h <= MAXROWS);
  }
  const ordered = () => [...S.cells].sort((a, b) => a.y - b.y || a.x - b.x);

  /* ── history ───────────────────────────────────────────── */
  const hist = [];
  let hpos = -1;
  function commit() {
    const snap = JSON.stringify(S);
    if (hist[hpos] === snap) return;
    hist.splice(hpos + 1);
    hist.push(snap);
    if (hist.length > 80) hist.shift();
    hpos = hist.length - 1;
  }
  function jump(d) {
    const n = hpos + d;
    if (n < 0 || n >= hist.length) return;
    hpos = n;
    S = JSON.parse(hist[n]);
    if (sel && !S.cells.some((c) => c.id === sel)) sel = null;
    render();
  }

  /* ── markup shared by preview and exports ──────────────── */
  const seeded = (str) => {
    let h = 2166136261;
    for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => ((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) / 4294967296;
  };
  function spark(c) {
    const r = seeded(c.title + c.value);
    let y = 0.6;
    const pts = Array.from({ length: 12 }, (_, i) => {
      y = clamp(y + (r() - 0.42) * 0.35, 0.08, 0.92);
      return [i * (200 / 11), (1 - y) * 60];
    });
    const line = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${yy.toFixed(1)}`).join("");
    return { line, area: `${line}L200 60L0 60Z` };
  }
  // mode: "css" (plain classes, used by the preview and the HTML export) or "tw" (Tailwind)
  function inner(c, mode) {
    const T = mode === "tw";
    const dark = S.theme === "dark";
    const onAccent = c.style === "accent";
    const onImage = c.style === "image";
    const muted = T ? (onAccent ? "text-black/65" : onImage ? "text-white/80" : dark ? "text-white/60" : "text-zinc-500") : "bx-mute";
    const k = (twCls, cssCls) => (T ? twCls : cssCls);
    const svgIcon = (name, size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.zap}</svg>`;
    switch (c.type) {
      case "text":
        return `<h3 class="${k("text-xl font-semibold tracking-tight", "bx-h")}">${esc(c.title)}</h3><p class="${k("mt-2 max-w-md text-sm leading-relaxed " + muted, "bx-p")}">${esc(c.text)}</p>`;
      case "stat":
        return `<p class="${k("text-4xl font-semibold tracking-tight", "bx-num")}">${esc(c.value)}</p><p class="${k("mt-1 text-sm " + muted, "bx-p")}">${esc(c.label)}</p>`;
      case "chart": {
        const s = spark(c);
        const stroke = onAccent ? "#000" : S.accent;
        return `<div class="${k("flex items-baseline justify-between gap-3", "bx-row")}"><h3 class="${k("text-sm font-medium " + muted, "bx-p bx-p0")}">${esc(c.title)}</h3><p class="${k("text-2xl font-semibold tracking-tight", "bx-num bx-num-s")}">${esc(c.value)}</p></div><svg class="${k("mt-auto h-1/2 w-full", "bx-spark")}" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><path d="${s.area}" fill="${stroke}" fill-opacity="0.14"/><path d="${s.line}" fill="none" stroke="${stroke}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
      }
      case "icon":
        return `<span class="${k(`grid h-10 w-10 place-items-center rounded-xl ${onAccent ? "bg-black/10" : dark ? "bg-white/10" : "bg-zinc-900/5"}`, "bx-ico")}">${svgIcon(c.icon, 20)}</span><h3 class="${k("mt-auto text-base font-semibold tracking-tight", "bx-h bx-h-s")}">${esc(c.title)}</h3><p class="${k("mt-1 text-sm " + muted, "bx-p")}">${esc(c.text)}</p>`;
      case "image":
        return `<span class="${k("mt-auto inline-flex w-fit rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur", "bx-chip")}">${esc(c.title)}</span>`;
      case "cta":
        return `<h3 class="${k("text-lg font-semibold tracking-tight", "bx-h bx-h-s")}">${esc(c.title)}</h3><a href="#" class="${k(`mt-auto inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${onAccent ? "bg-black text-white" : dark ? "bg-white text-black" : "bg-zinc-900 text-white"}`, "bx-btn")}">${esc(c.text)} <span aria-hidden="true">→</span></a>`;
      default:
        return "";
    }
  }
  const twStyle = (st) => {
    const dark = S.theme === "dark";
    return {
      surface: dark ? "border border-white/10 bg-white/[0.04] text-white" : "border border-black/10 bg-white text-zinc-900 shadow-sm",
      gradient: dark ? "border border-white/10 bg-gradient-to-br from-sky-500/25 via-indigo-500/10 to-transparent text-white" : "border border-black/10 bg-gradient-to-br from-sky-100 via-indigo-50 to-white text-zinc-900",
      accent: `bg-[${S.accent}] text-black`,
      image: "bg-[radial-gradient(at_20%_20%,#38bdf8,transparent_55%),radial-gradient(at_85%_30%,#a78bfa,transparent_55%),radial-gradient(at_50%_95%,#f472b6,transparent_60%)] bg-zinc-900 text-white",
      outline: dark ? "border border-dashed border-white/20 text-white" : "border border-dashed border-black/20 text-zinc-900",
    }[st];
  };
  const mobileSpan = (c) => (S.mobile === "2" ? (c.w >= 2 ? 2 : 1) : 1);
  const mobileRows = (c) => Math.min(c.h, 2);

  // the same CSS drives the preview and the plain HTML export
  // mode: "export" (mobile base + @media desktop), "mobile" (base only), "desktop" (desktop columns, placement inline)
  function css(scope = ".bento", mode = "export") {
    const dark = S.theme === "dark";
    const fg = dark ? "#fafafa" : "#18181b";
    return `${scope} {
  display: grid;
  grid-template-columns: repeat(${S.mobile}, minmax(0, 1fr));
  grid-auto-rows: ${S.rowH}px;
  gap: ${S.gap}px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: ${fg};
}
${scope} > * { position: relative; display: flex; flex-direction: column; min-width: 0; overflow: hidden; padding: 20px; border-radius: ${S.radius}px; }
${scope} .s-surface { background: ${dark ? "rgba(255,255,255,0.04)" : "#fff"}; border: 1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};${dark ? "" : " box-shadow: 0 1px 2px rgba(0,0,0,0.05);"} }
${scope} .s-gradient { background: ${dark ? "linear-gradient(135deg, rgba(14,165,233,0.25), rgba(99,102,241,0.1) 50%, transparent)" : "linear-gradient(135deg, #e0f2fe, #eef2ff 50%, #fff)"}; border: 1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; }
${scope} .s-accent { background: ${S.accent}; color: #000; }
${scope} .s-image { background: radial-gradient(at 20% 20%, #38bdf8, transparent 55%), radial-gradient(at 85% 30%, #a78bfa, transparent 55%), radial-gradient(at 50% 95%, #f472b6, transparent 60%), #18181b; color: #fff; }
${scope} .s-outline { border: 1px dashed ${dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}; }
${scope} .bx-h { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; }
${scope} .bx-h-s { font-size: 16px; }
${scope} .bx-icoc .bx-h-s { margin-top: auto; }
${scope} .bx-p { margin: 8px 0 0; font-size: 14px; line-height: 1.55; opacity: 0.65; max-width: 28rem; }
${scope} .bx-p0 { margin: 0; font-weight: 500; }
${scope} .bx-num { margin: 0; font-size: 36px; font-weight: 600; letter-spacing: -0.03em; line-height: 1.1; }
${scope} .bx-num-s { font-size: 24px; }
${scope} .bx-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
${scope} .bx-spark { margin-top: auto; width: 100%; height: 50%; }
${scope} .bx-ico { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: ${dark ? "rgba(255,255,255,0.1)" : "rgba(24,24,27,0.05)"}; }
${scope} .s-accent .bx-ico { background: rgba(0,0,0,0.1); }
${scope} .bx-chip { margin-top: auto; width: fit-content; padding: 4px 12px; border-radius: 999px; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); color: #fff; font-size: 12px; font-weight: 500; }
${scope} .bx-btn { margin-top: auto; display: inline-flex; width: fit-content; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; font-size: 14px; font-weight: 500; text-decoration: none; background: ${dark ? "#fff" : "#18181b"}; color: ${dark ? "#000" : "#fff"}; }
${scope} .s-accent .bx-btn { background: #000; color: #fff; }
${mode === "desktop" ? `${scope} { grid-template-columns: repeat(${S.cols}, minmax(0, 1fr)); }` : ordered()
  .map((c, i) => `${scope} > :nth-child(${i + 1}) { grid-column: span ${mobileSpan(c)}; grid-row: span ${mobileRows(c)}; }`)
  .join("\n")}${mode !== "export" ? "" : `
@media (min-width: 768px) {
  ${scope} { grid-template-columns: repeat(${S.cols}, minmax(0, 1fr)); }
${ordered()
  .map((c, i) => `  ${scope} > :nth-child(${i + 1}) { grid-column: ${c.x + 1} / span ${c.w}; grid-row: ${c.y + 1} / span ${c.h}; }`)
  .join("\n")}
}`}`;
  }
  const cssClass = (c) => `s-${c.style}${c.type === "icon" ? " bx-icoc" : ""}`;

  /* ── exports ───────────────────────────────────────────── */
  const gapCls = () => ({ 0: "gap-0", 4: "gap-1", 8: "gap-2", 12: "gap-3", 16: "gap-4", 20: "gap-5", 24: "gap-6", 32: "gap-8" })[S.gap] || `gap-[${S.gap}px]`;
  const radCls = () => ({ 0: "rounded-none", 4: "rounded", 6: "rounded-md", 8: "rounded-lg", 12: "rounded-xl", 16: "rounded-2xl", 24: "rounded-3xl" })[S.radius] || `rounded-[${S.radius}px]`;
  const mobCols = () => (S.mobile === "2" ? "grid-cols-2" : "grid-cols-1");
  function twCell(c) {
    const span = mobileSpan(c);
    const mob = `${span === 2 ? "col-span-2" : "col-span-1"} ${mobileRows(c) === 2 ? "row-span-2" : "row-span-1"}`;
    const desk = `md:col-[${c.x + 1}/span_${c.w}] md:row-[${c.y + 1}/span_${c.h}]`;
    return `relative flex min-w-0 flex-col overflow-hidden p-5 ${radCls()} ${twStyle(c.style)} ${mob} ${desk}`;
  }
  const containerCls = () => `grid ${mobCols()} auto-rows-[${S.rowH}px] ${gapCls()} md:grid-cols-${S.cols}`;
  function tailwindCode() {
    return `<!-- Bento grid made with NiceUI Bento Grid Builder. Tailwind CSS, no dependencies. -->
<div class="${containerCls()}">
${ordered()
  .map((c) => `  <div class="${twCell(c)}">\n    ${inner(c, "tw")}\n  </div>`)
  .join("\n")}
</div>`;
  }
  const toJsx = (html) =>
    html
      .replace(/class="/g, 'className="')
      .replace(/stroke-width=/g, "strokeWidth=")
      .replace(/stroke-linecap=/g, "strokeLinecap=")
      .replace(/stroke-linejoin=/g, "strokeLinejoin=")
      .replace(/fill-opacity=/g, "fillOpacity=")
      .replace(/vector-effect=/g, "vectorEffect=")
      .replace(/preserveAspectRatio=/g, "preserveAspectRatio=")
      .replace(/\{/g, "&#123;")
      .replace(/\}/g, "&#125;");
  function reactCode() {
    return `// Bento grid made with NiceUI Bento Grid Builder. React + Tailwind, no dependencies.
export function BentoGrid({ className = '' }: { className?: string }) {
  return (
    <div className={\`${containerCls()} \${className}\`}>
${ordered()
  .map((c) => `      <div className="${twCell(c)}">\n        ${toJsx(inner(c, "tw"))}\n      </div>`)
  .join("\n")}
    </div>
  );
}
`;
  }
  function htmlCode(full = false) {
    const body = `<div class="bento">
${ordered()
  .map((c) => `  <div class="${cssClass(c)}">\n    ${inner(c, "css")}\n  </div>`)
  .join("\n")}
</div>`;
    const style = `<style>\n${css(".bento")}\n</style>`;
    if (!full) return `<!-- Bento grid made with NiceUI Bento Grid Builder. Plain HTML + CSS, no dependencies. -->\n${style}\n\n${body}`;
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Bento grid</title>
<style>body { margin: 0; padding: 24px; background: ${S.theme === "dark" ? "#09090b" : "#f4f4f5"}; } .wrap { max-width: 1100px; margin: 0 auto; }</style>
${style}
</head>
<body>
<div class="wrap">
${body}
</div>
</body>
</html>`;
  }
  const code = () => (tab === "react" ? reactCode() : tab === "html" ? htmlCode() : tailwindCode());

  /* ── rendering ─────────────────────────────────────────── */
  const grid = $("[data-bg-grid]");
  const frame = $("[data-bg-frame]");
  const styleEl = document.createElement("style");
  document.head.appendChild(styleEl);
  function render() {
    const mobile = S.view === "mobile";
    frame.classList.toggle("is-mobile", mobile);
    frame.dataset.theme = S.theme;
    styleEl.textContent = css(".bx", mobile ? "mobile" : "desktop");
    const rows = shownRows();
    const slotsEl = $("[data-bg-slots]");
    slotsEl.hidden = mobile;
    if (!mobile) {
      slotsEl.style.cssText = `grid-template-columns:repeat(${S.cols},minmax(0,1fr));grid-template-rows:repeat(${rows},${S.rowH}px);gap:${S.gap}px`;
      const taken = (x, y) => S.cells.some((c) => x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h);
      slotsEl.innerHTML = Array.from({ length: rows * S.cols }, (_, i) => {
        const x = i % S.cols, y = Math.floor(i / S.cols);
        return taken(x, y) ? "" : `<i style="grid-column:${x + 1};grid-row:${y + 1};border-radius:${Math.min(S.radius, 16)}px"></i>`;
      }).join("");
    }
    const cells = ordered()
      .map((c, i) => {
        const pos = mobile ? "" : `grid-column:${c.x + 1} / span ${c.w};grid-row:${c.y + 1} / span ${c.h};`;
        const label = `${TYPES.find((t) => t[0] === c.type)[1]} cell, ${c.w} by ${c.h}, column ${c.x + 1}, row ${c.y + 1}`;
        return `<div class="bx-cell ${cssClass(c)}${sel === c.id ? " is-sel" : ""}" data-cell="${c.id}" tabindex="0" role="button" aria-label="${esc(label)}" aria-pressed="${sel === c.id}" style="${pos}">${inner(c, "css")}${!mobile && sel === c.id ? '<span class="bx-h-r" data-handle="e"></span><span class="bx-h-b" data-handle="s"></span><span class="bx-h-c" data-handle="se"></span>' : ""}</div>`;
      })
      .join("");
    grid.innerHTML = `${cells}<div class="bx-ghost" data-ghost hidden></div>`;
    grid.style.gridTemplateRows = mobile ? "" : `repeat(${rows}, ${S.rowH}px)`;
    $("[data-bg-hint]").hidden = mobile || S.cells.length > 0;
    renderSide();
    renderCode();
    save();
  }
  function renderSide() {
    $$("[data-bg-set]").forEach((b) => b.setAttribute("aria-pressed", String(String(S[b.dataset.bgSet]) === b.dataset.bgVal)));
    $$("[data-bg-in]").forEach((el) => (el.value = S[el.dataset.bgIn]));
    $$("[data-bg-out]").forEach((o) => {
      const k = o.dataset.bgOut;
      o.textContent = k === "cols" ? S.cols : S[k] + "px";
    });
    $("[data-bg-undo]").disabled = hpos <= 0;
    $("[data-bg-redo]").disabled = hpos >= hist.length - 1;
    const c = S.cells.find((x) => x.id === sel);
    $("[data-bg-pos]").textContent = c ? `${c.w}×${c.h} at ${c.x + 1},${c.y + 1}` : "";
    const body = $("[data-bg-cellbody]");
    if (!c) {
      body.innerHTML = `<p class="gm-tip">Select a cell, or drag on an empty part of the grid to draw one. Arrow keys move the selected cell, Shift + arrows resize it.</p>`;
      return;
    }
    const field = (k, label, max = 80) => `<label class="bg-field"><span>${label}</span><input data-bg-field="${k}" value="${esc(c[k])}" maxlength="${max}" /></label>`;
    const fields = {
      text: field("title", "Title") + field("text", "Text", 160),
      stat: field("value", "Value", 16) + field("label", "Label"),
      chart: field("title", "Title") + field("value", "Value", 16),
      icon: `<div class="bg-icons">${Object.keys(ICONS).map((n) => `<button type="button" class="bg-icon" data-bg-icon="${n}" aria-pressed="${c.icon === n}" aria-label="${n} icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg></button>`).join("")}</div>` + field("title", "Title") + field("text", "Text"),
      image: field("title", "Caption"),
      cta: field("title", "Title") + field("text", "Button"),
      empty: "",
    }[c.type];
    body.innerHTML = `
      <span class="bg-lab">Content</span>
      <div class="bg-types">${TYPES.map(([v, l]) => `<button type="button" data-bg-type="${v}" aria-pressed="${c.type === v}">${l}</button>`).join("")}</div>
      <span class="bg-lab">Style</span>
      <div class="bg-types bg-styles">${STYLES.map(([v, l]) => `<button type="button" data-bg-style="${v}" aria-pressed="${c.style === v}">${l}</button>`).join("")}</div>
      ${fields}
      <div class="bg-cellacts">
        <button type="button" class="gm-ghost" data-bg-dup>Duplicate</button>
        <button type="button" class="gm-ghost bg-del" data-bg-del>Delete</button>
      </div>`;
  }
  const codeEl = $("[data-bg-code]");
  function renderCode() {
    $$("[data-bg-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.bgTab === tab)));
    codeEl.textContent = code();
  }
  function renderPresets() {
    $("[data-bg-presets]").innerHTML = PRESETS.map(([name, p], i) => {
      const rows = p.cells.reduce((m, c) => Math.max(m, c[1] + c[3]), 0);
      const W = 60, H = 40, g = 2;
      const cw = (W - g * (p.cols - 1)) / p.cols, rh = (H - g * (rows - 1)) / rows;
      const rects = p.cells.map(([x, y, w, h, , st]) => `<rect x="${(x * (cw + g)).toFixed(1)}" y="${(y * (rh + g)).toFixed(1)}" width="${(w * cw + (w - 1) * g).toFixed(1)}" height="${(h * rh + (h - 1) * g).toFixed(1)}" rx="2" fill="currentColor" fill-opacity="${st === "accent" ? 0.9 : st === "image" || st === "gradient" ? 0.45 : 0.22}"/>`).join("");
      return `<button type="button" class="bg-preset" data-bg-preset="${i}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${rects}</svg><b>${name}</b></button>`;
    }).join("");
  }

  /* ── pointer: draw, move, resize ───────────────────────── */
  const ghostEl = () => $("[data-ghost]");
  function metrics() {
    const r = grid.getBoundingClientRect();
    const colW = (r.width - S.gap * (S.cols - 1)) / S.cols;
    return { r, colW, pitchX: colW + S.gap, pitchY: S.rowH + S.gap };
  }
  function at(e) {
    const { r, pitchX, pitchY } = metrics();
    return { cx: clamp(Math.floor((e.clientX - r.left) / pitchX), 0, S.cols - 1), cy: clamp(Math.floor((e.clientY - r.top) / pitchY), 0, MAXROWS - 1), px: e.clientX - r.left, py: e.clientY - r.top };
  }
  let drag = null;
  function showGhost(rect, ok) {
    const g = ghostEl();
    if (!g) return;
    g.hidden = !rect;
    if (!rect) return;
    g.style.gridColumn = `${rect.x + 1} / span ${rect.w}`;
    g.style.gridRow = `${rect.y + 1} / span ${rect.h}`;
    g.classList.toggle("bad", !ok);
  }
  grid.addEventListener("pointerdown", (e) => {
    if (S.view === "mobile" || e.button !== 0) return;
    const handle = e.target.closest("[data-handle]");
    const cellEl = e.target.closest("[data-cell]");
    const p = at(e);
    if (handle && cellEl) {
      const c = S.cells.find((x) => x.id === cellEl.dataset.cell);
      drag = { kind: "resize", dir: handle.dataset.handle, c, start: { ...c } };
    } else if (cellEl) {
      const c = S.cells.find((x) => x.id === cellEl.dataset.cell);
      if (sel !== c.id) {
        sel = c.id;
        render();
      }
      drag = { kind: "move", c, start: { ...c }, ox: p.cx - c.x, oy: p.cy - c.y, moved: false };
    } else {
      sel = null;
      drag = { kind: "draw", sx: p.cx, sy: p.cy };
      render();
      showGhost({ x: p.cx, y: p.cy, w: 1, h: 1 }, fits({ x: p.cx, y: p.cy, w: 1, h: 1 }));
    }
    grid.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  grid.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = at(e);
    if (drag.kind === "draw") {
      const rect = { x: Math.min(drag.sx, p.cx), y: Math.min(drag.sy, p.cy), w: Math.abs(p.cx - drag.sx) + 1, h: Math.abs(p.cy - drag.sy) + 1 };
      drag.rect = rect;
      showGhost(rect, fits(rect));
      return;
    }
    const c = drag.c;
    let cand;
    if (drag.kind === "move") {
      cand = { x: clamp(p.cx - drag.ox, 0, S.cols - c.w), y: clamp(p.cy - drag.oy, 0, MAXROWS - c.h), w: c.w, h: c.h };
      if (cand.x !== c.x || cand.y !== c.y) drag.moved = true;
    } else {
      cand = { x: c.x, y: c.y, w: drag.dir === "s" ? c.w : clamp(p.cx - c.x + 1, 1, S.cols - c.x), h: drag.dir === "e" ? c.h : clamp(p.cy - c.y + 1, 1, MAXROWS - c.y) };
    }
    drag.cand = cand;
    const ok = fits(cand, c.id);
    drag.ok = ok;
    showGhost(cand, ok);
    const el = grid.querySelector(`[data-cell="${c.id}"]`);
    if (el) el.classList.add("is-drag");
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.kind === "draw") {
      const rect = d.rect || { x: d.sx, y: d.sy, w: 1, h: 1 };
      if (fits(rect)) {
        const c = cell(rect.x, rect.y, rect.w, rect.h, rect.w >= 2 && rect.h >= 2 ? "text" : rect.w >= 2 ? "chart" : "stat", "surface");
        S.cells.push(c);
        sel = c.id;
        commit();
      }
      render();
      return;
    }
    if (d.cand && d.ok) {
      Object.assign(d.c, d.cand);
      commit();
    }
    render();
    grid.querySelector(`[data-cell="${d.c.id}"]`)?.focus({ preventScroll: true });
  };
  grid.addEventListener("pointerup", endDrag);
  grid.addEventListener("pointercancel", endDrag);
  grid.addEventListener("click", (e) => {
    const cellEl = e.target.closest("[data-cell]");
    if (cellEl && S.view === "mobile") {
      sel = cellEl.dataset.cell;
      render();
    }
  });

  /* ── keyboard ──────────────────────────────────────────── */
  // undo / redo work anywhere on the page except while typing in a field
  document.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod || e.target.matches?.("input, textarea, select")) return;
    const k = e.key.toLowerCase();
    if (k !== "z" && k !== "y") return;
    e.preventDefault();
    jump(k === "y" || e.shiftKey ? 1 : -1);
    if (sel) grid.querySelector(`[data-cell="${sel}"]`)?.focus({ preventScroll: true });
  });
  root.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    const cellEl = e.target.closest?.("[data-cell]");
    if (!cellEl) return;
    const c = S.cells.find((x) => x.id === cellEl.dataset.cell);
    if (!c) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      sel = c.id;
      render();
      grid.querySelector(`[data-cell="${c.id}"]`)?.focus();
      return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && S.view === "desktop") {
      e.preventDefault();
      return removeCell(c.id);
    }
    if (mod && e.key.toLowerCase() === "d") {
      e.preventDefault();
      return duplicate(c.id);
    }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d || S.view === "mobile") return;
    e.preventDefault();
    sel = c.id;
    const cand = e.shiftKey ? { x: c.x, y: c.y, w: c.w + d[0], h: c.h + d[1] } : { x: c.x + d[0], y: c.y + d[1], w: c.w, h: c.h };
    if (fits(cand, c.id)) {
      Object.assign(c, cand);
      commit();
    }
    render();
    grid.querySelector(`[data-cell="${c.id}"]`)?.focus();
  });
  function removeCell(id) {
    S.cells = S.cells.filter((c) => c.id !== id);
    sel = null;
    commit();
    render();
    flash("Cell deleted · ⌘Z to undo");
  }
  function duplicate(id) {
    const c = S.cells.find((x) => x.id === id);
    if (!c) return;
    // first free spot of the same size, scanning row by row
    for (let y = 0; y < MAXROWS; y++)
      for (let x = 0; x <= S.cols - c.w; x++) {
        const r = { x, y, w: c.w, h: c.h };
        if (fits(r)) {
          const n = { ...structuredClone(c), id: newId(), x, y };
          S.cells.push(n);
          sel = n.id;
          commit();
          render();
          return;
        }
      }
    flash("No free space for a copy");
  }

  /* ── controls ──────────────────────────────────────────── */
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1700);
  };
  let typing = 0;
  root.addEventListener("input", (e) => {
    const t = e.target;
    const f = t.dataset.bgField;
    if (f) {
      const c = S.cells.find((x) => x.id === sel);
      if (!c) return;
      c[f] = t.value;
      // update just the cell and the code while typing, so the field keeps focus
      const el = grid.querySelector(`[data-cell="${c.id}"]`);
      if (el) {
        const handles = [...el.querySelectorAll("[data-handle]")].map((h) => h.outerHTML).join("");
        el.innerHTML = inner(c, "css") + handles;
      }
      renderCode();
      clearTimeout(typing);
      typing = setTimeout(() => {
        commit();
        save();
      }, 500);
      return;
    }
    const k = t.dataset.bgIn;
    if (!k) return;
    S[k] = k === "accent" ? t.value : +t.value;
    if (k === "cols") normalize();
    render();
  });
  root.addEventListener("change", (e) => {
    if (e.target.dataset.bgIn) commit();
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    const set = t.closest("[data-bg-set]");
    if (set) {
      S[set.dataset.bgSet] = set.dataset.bgVal;
      if (set.dataset.bgSet !== "view") commit();
      return render();
    }
    const pr = t.closest("[data-bg-preset]");
    if (pr) {
      loadPreset(+pr.dataset.bgPreset);
      commit();
      render();
      return flash(`${PRESETS[+pr.dataset.bgPreset][0]} layout`);
    }
    const ty = t.closest("[data-bg-type]");
    const st = t.closest("[data-bg-style]");
    const ic = t.closest("[data-bg-icon]");
    const c = S.cells.find((x) => x.id === sel);
    if (ty && c) {
      const prev = c.type;
      c.type = ty.dataset.bgType;
      if (prev !== c.type) Object.assign(c, { ...DEFAULTS[c.type], ...Object.fromEntries(Object.entries(c).filter(([k, v]) => k in DEFAULTS[c.type] && v && v !== DEFAULTS[prev]?.[k])) });
      if (c.type === "image" && c.style === "surface") c.style = "image";
      commit();
      return render();
    }
    if (st && c) {
      c.style = st.dataset.bgStyle;
      commit();
      return render();
    }
    if (ic && c) {
      c.icon = ic.dataset.bgIcon;
      commit();
      return render();
    }
    if (t.closest("[data-bg-dup]") && c) return duplicate(c.id);
    if (t.closest("[data-bg-del]") && c) return removeCell(c.id);
    if (t.closest("[data-bg-undo]")) return jump(-1);
    if (t.closest("[data-bg-redo]")) return jump(1);
    if (t.closest("[data-bg-clear]")) {
      S.cells = [];
      sel = null;
      commit();
      return render();
    }
    if (t.closest("[data-bg-random]")) {
      randomize();
      commit();
      return render();
    }
    const tb = t.closest("[data-bg-tab]");
    if (tb) {
      tab = tb.dataset.bgTab;
      return renderCode();
    }
    if (t.closest("[data-bg-copy]")) {
      const text = code();
      navigator.clipboard.writeText(text).then(
        () => flash(`Copied ${{ tailwind: "Tailwind", react: "React", html: "HTML + CSS" }[tab]} · ${text.split("\n").length} lines`),
        () => flash("Copy failed. Select the code and copy it")
      );
      return;
    }
    if (t.closest("[data-bg-dl]")) {
      const a = document.createElement("a");
      a.download = "bento-grid.html";
      a.href = URL.createObjectURL(new Blob([htmlCode(true)], { type: "text/html" }));
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      return flash("Downloaded bento-grid.html");
    }
    if (t.closest("[data-bg-share]")) {
      save(true);
      navigator.clipboard.writeText(location.href).then(
        () => flash("Share link copied"),
        () => flash("The link is in the address bar")
      );
    }
  });
  function randomize() {
    const r = Math.random;
    const cols = [3, 4, 4, 4, 5, 6][Math.floor(r() * 6)];
    S.cols = cols;
    const rows = 3 + Math.floor(r() * 2);
    S.cells = [];
    const types = ["text", "stat", "chart", "icon", "image", "cta"];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        if (S.cells.some((c) => overlaps({ x, y, w: 1, h: 1 }, c))) continue;
        let w = 1 + Math.floor(r() * Math.min(3, cols - x));
        let h = r() < 0.35 && y < rows - 1 ? 2 : 1;
        while (w > 1 && !fits({ x, y, w, h })) w--;
        if (!fits({ x, y, w, h })) h = 1;
        if (!fits({ x, y, w, h })) continue;
        const big = w * h >= 4;
        const type = big ? (r() < 0.5 ? "text" : "image") : w >= 2 ? (r() < 0.5 ? "chart" : "text") : types[Math.floor(r() * types.length)];
        const style = type === "image" ? "image" : type === "cta" ? "accent" : big ? "gradient" : r() < 0.12 ? "outline" : "surface";
        S.cells.push(cell(x, y, w, h, type, style));
      }
    sel = null;
  }

  /* ── share ─────────────────────────────────────────────── */
  let saveT = 0;
  function save(now) {
    clearTimeout(saveT);
    const write = () => {
      try {
        history.replaceState(null, "", "#b=" + btoa(unescape(encodeURIComponent(JSON.stringify({ ...S, view: "desktop" })))));
      } catch {}
    };
    if (now) write();
    else saveT = setTimeout(write, 400);
  }

  /* ── boot ──────────────────────────────────────────────── */
  let loaded = false;
  try {
    if (location.hash.startsWith("#b=")) {
      const v = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3)))));
      if (v && Array.isArray(v.cells)) {
        S = { ...structuredClone(DEF), ...v, view: "desktop" };
        S.cells.forEach((c) => {
          const n = +String(c.id).slice(1);
          if (n >= nid) nid = n + 1;
        });
        normalize();
        loaded = true;
      }
    }
  } catch {}
  if (!loaded) loadPreset(0);
  renderPresets();
  commit();
  render();
})();
