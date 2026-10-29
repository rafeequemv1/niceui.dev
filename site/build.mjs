// Static site generator for niceui.dev — `node build.mjs` writes everything to dist/.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { faq, items, site } from "./registry.mjs";

const OUT = "dist";
const today = new Date().toISOString().slice(0, 10);

// ─── helpers ─────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slugify = (s) => s.toLowerCase().replace(/[—–]/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const write = (path, content) => {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
};
const json = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
const hashed = (file) => {
  const src = readFileSync(join("assets", file));
  const h = createHash("sha1").update(src).digest("hex").slice(0, 10);
  const name = file.replace(/(\.\w+)$/, "." + h + "$1");
  write("assets/" + name, src);
  return "/assets/" + name;
};

const TS_KEYWORDS =
  "import|export|from|const|let|var|return|function|type|interface|extends|default|if|else|new|as|typeof|true|false|null|undefined|use client";

function highlight(code) {
  const re = new RegExp(
    [
      "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)", // 1 comment
      '("(?:[^"\\\\\\n]|\\\\.)*"|`(?:[^`\\\\]|\\\\.)*`)', // 2 string
      "(<\\/?[A-Za-z][\\w.]*|\\/?>)", // 3 jsx tag
      "\\b(" + TS_KEYWORDS + ")\\b", // 4 keyword
      "\\b(\\d+(?:\\.\\d+)?)\\b", // 5 number
      "([A-Za-z_]\\w*)(?=\\()", // 6 function call
    ].join("|"),
    "g"
  );
  let out = "";
  let last = 0;
  for (const m of code.matchAll(re)) {
    out += esc(code.slice(last, m.index));
    const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "t" : m[4] ? "k" : m[5] ? "n" : "f";
    out += '<span class="tk-' + cls + '">' + esc(m[0]) + "</span>";
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

// ─── data ────────────────────────────────────────────────────────────
for (const it of items) {
  it.slug ??= slugify(it.name);
  if (it.status !== "ready") continue;
  it.path = (it.kind === "block" ? "/blocks/" : "/components/") + it.slug;
  it.file = it.slug + ".tsx";
  it.code = readFileSync(join("registry", it.file), "utf8");
  it.target = it.kind === "block" ? "components/" + it.file : "components/ui/" + it.file;
  it.install = "npx shadcn@latest add " + site.url + "/r/" + it.slug + ".json";
}
const ready = items.filter((i) => i.status === "ready");
const soon = items.filter((i) => i.status !== "ready");
const byKind = (kind) =>
  items
    .filter((i) => i.kind === kind)
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "ready" ? -1 : 1));
const groups = [
  { title: "Components", kind: "component", list: byKind("component") },
  { title: "Blocks", kind: "block", list: byKind("block") },
  { title: "Templates", kind: "template", list: byKind("template") },
];
const readyOrder = groups.flatMap((g) => g.list.filter((i) => i.status === "ready"));

// ─── full library (React app served at /library/, manifest from scripts/library-manifest.mjs) ──
const library = existsSync("library.json") ? JSON.parse(readFileSync("library.json", "utf8")) : [];
const libSection = (id) => library.find((sec) => sec.id === id) || { id, title: id, entries: [] };
const libItems = (id, kind, category) =>
  libSection(id).entries.map((e) => ({
    name: e.name,
    kind,
    category: category || libSection(id).title,
    description: e.description,
    status: "ready",
    lib: true,
    badge: e.badge,
    sec: id,
    slug: e.slug,
    page: e.page,
    thumb: "/assets/thumbs/" + id + "--" + e.slug + ".webp",
    embed: "/library/?embed=1#/" + id + "/" + e.slug,
  }));
const libGuides = libSection("intro").entries.filter((e) => e.slug !== "home");
const libCount = library.filter((sec) => sec.id !== "intro").reduce((n, sec) => n + sec.entries.length, 0);
// Roadmap items the full library already ships are hidden from "Soon".
const covered = new Set(["Accordion", "Alert", "Dialog", "Tooltip", "Tabs", "Toast", "Checkbox", "Radio Group", "Select", "OTP Input", "File Upload", "Data Table", "Date Picker", "Carousel", "Number Ticker", "Text Reveal", "AI Prompt Input", "Chat Bubble", "Sign In", "Dashboard Shell"]);
const roadmap = soon.filter((i) => !covered.has(i.name));
const byName = (a, b) => a.name.localeCompare(b.name);
// When the library and the site both ship an item with the same name, keep the site's page (it has install + registry JSON).
const ownNames = new Set(ready.map((i) => i.name.toLowerCase()));
const dedupe = (list) => list.filter((i) => !i.lib || !ownNames.has(i.name.toLowerCase()));
// AI Agents are grouped so the category reads like a kit, not a pile.
const AI_GROUPS = [
  { id: "chat", title: "Chat & composers", blurb: "Threads, bubbles, composers, suggestions, widgets and palettes.", slugs: ["chat-app", "message-bubble", "prompt-input", "command-composer", "prompt-suggestions", "streaming-response", "response-branches", "code-block", "chat-widget", "ai-sidebar", "ai-command-palette"] },
  { id: "reasoning", title: "Reasoning, models & sources", blurb: "Thinking, model choice, context limits and answers with citations.", slugs: ["reasoning", "agent-loading", "model-selector", "model-compare", "context-usage", "citations", "answer-engine"] },
  { id: "tools", title: "Tools & approvals", blurb: "Tool calls, human-in-the-loop, generative UI, code runs and diffs.", slugs: ["tool-result", "tool-approval", "clarifying-question", "mcp-tool-picker", "generative-ui", "code-interpreter", "file-diff", "diff-suggestion"] },
  { id: "agents", title: "Agents at work", blurb: "Plans, live activity, browser and research agents, handoffs and queues.", slugs: ["agent-activity", "todo-list", "plan-review", "browser-agent", "research-progress", "agent-terminal", "parallel-agents", "agent-handoff", "agent-queue"] },
  { id: "build", title: "Build, trace & memory", blurb: "Agent builders, workflows, traces, knowledge, memory, checkpoints and artifacts.", slugs: ["agent-builder", "agent-flow", "agent-trace", "knowledge-base", "memory-panel", "checkpoints", "artifact-panel"] },
  { id: "media", title: "Voice, media & motion", blurb: "Voice orbs, image generation and animated AI visuals.", slugs: ["voice-orb", "image-generation", "network-pulse", "feature-tabs"] },
];
const aiItems = libItems("ai", "ai").sort(byName);
const aiSections = AI_GROUPS.map((sub) => ({ ...sub, items: sub.slugs.map((s) => aiItems.find((i) => i.slug === s)).filter(Boolean) })).filter((sub) => sub.items.length);
const aiRest = aiItems.filter((i) => !AI_GROUPS.some((sub) => sub.slugs.includes(i.slug)));
if (aiRest.length) aiSections.push({ id: "more", title: "More", blurb: "Everything else for AI products.", items: aiRest });
for (const sub of aiSections) for (const it of sub.items) it.category = sub.title;
const navGroups = [
  { title: "AI Agents", list: aiSections.flatMap((sub) => sub.items) },
  { title: "Components", list: dedupe([...ready.filter((i) => i.kind === "component"), ...libItems("components", "component")]).sort(byName).concat(roadmap.filter((i) => i.kind === "component").sort(byName)) },
  { title: "Blocks", list: dedupe([...ready.filter((i) => i.kind === "block"), ...libItems("blocks", "block"), ...libItems("footers", "block", "Footers")]).sort(byName).concat(roadmap.filter((i) => i.kind === "block").sort(byName)) },
  { title: "Marketing", list: libItems("marketing", "marketing") },
  { title: "Landing Pages", list: libItems("landing", "landing") },
  { title: "Dashboards", list: libItems("examples", "dashboard", "Dashboards") },
  { title: "Templates", list: [...libItems("apps", "template", "App templates"), ...roadmap.filter((i) => i.kind === "template")] },
];
const catDesc = {
  Components: "Buttons, inputs, overlays, motion primitives and everything in between.",
  "AI Agents": "Every kind of AI agent interface in one place: chat, reasoning, tool calls and approvals, browser and research agents, traces, workflows, memory and voice.",
  Blocks: "Composed, production-ready sections: search, uploads, wallets, menus, footers and more.",
  Marketing: "Heroes, feature grids, bento, logo clouds, testimonials, pricing, FAQ, CTAs, footers, changelog, team and blog — every section a marketing site needs.",
  "Landing Pages": "Complete, animated landing pages you can ship as-is.",
  Dashboards: "Full dashboard templates for analytics, finance, commerce and infrastructure.",
  Templates: "Whole applications and starters.",
};
for (const g of navGroups) {
  g.slug = slugify(g.title);
  g.path = "/c/" + g.slug;
  g.desc = catDesc[g.title] || "";
  for (const it of g.list) {
    it.group = g;
    if (it.lib) it.path = g.path + "/" + it.slug;
  }
}
const groupOf = (it) => navGroups.find((g) => g.list.includes(it));
const totalReady = navGroups.reduce((n, g) => n + g.list.filter((i) => i.status === "ready").length, 0);

// ─── assets ──────────────────────────────────────────────────────────
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const CSS = hashed("styles.css");
const JS = hashed("app.js");
cpSync("assets/favicon.svg", join(OUT, "favicon.svg"));
if (existsSync("assets/og.png")) cpSync("assets/og.png", join(OUT, "og.png"));
if (existsSync("assets/thumbs")) cpSync("assets/thumbs", join(OUT, "assets/thumbs"), { recursive: true });

// ─── layout ──────────────────────────────────────────────────────────
const icon = {
  github:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg>',
  search:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  spark:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  arrow:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  ext: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
};
const mark =
  '<svg class="mark" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" stroke-opacity=".22"/><path d="M5 17a9 9 0 0 1 18 0" fill="none" stroke="#7dd3fc" stroke-width="1.6" stroke-linecap="round"/><circle cx="14" cy="17" r="2" fill="#7dd3fc"/></svg>';

const ico = (d) => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const catIcon = {
  Components: ico('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  "AI Agents": ico('<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
  Blocks: ico('<path d="M12 3 3 7.5l9 4.5 9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>'),
  Marketing: ico('<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
  "Landing Pages": ico('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h8M10 16h4"/>'),
  Dashboards: ico('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  Templates: ico('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M9 10h12"/>'),
};

const pvControls = `<div class="pv-ctrls">
  <div class="pv-ctrl" role="group" aria-label="Preview theme"><button data-pv-theme="dark" class="on" aria-label="Dark preview" title="Dark"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button><button data-pv-theme="light" aria-label="Light preview" title="Light"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></div>
  <div class="pv-ctrl" role="group" aria-label="Preview size"><button data-pv-vp="desktop" class="on" aria-label="Desktop" title="Desktop"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg></button><button data-pv-vp="tablet" aria-label="Tablet" title="Tablet · 768px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/></svg></button><button data-pv-vp="mobile" aria-label="Mobile" title="Mobile · 375px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg></button></div>
</div>`;

function sidebar(activePath) {
  const link = (href, label, extra = "") =>
    `<a href="${href}" class="sb-item${href === activePath ? " on" : ""}"${href === activePath ? ' aria-current="page"' : ""}><span>${esc(label)}</span>${extra}</a>`;
  let html = `<div class="sb-group"><p class="sb-label">Getting started</p>${link("/", "Introduction")}${link("/docs/installation", "Installation")}${link("/#mcp", "Connect your agent", '<em class="tag-ai">MCP</em>')}${link("/llms.txt", "llms.txt", '<em class="tag-ai">AI</em>')}${libGuides.map((e) => link("/library/#/intro/" + e.slug, e.name === "OpenUI" ? "Design system" : e.name)).join("")}</div>`;
  html += `<div class="sb-group sb-cats"><p class="sb-label">Library</p>`;
  for (const g of navGroups) {
    const n = g.list.filter((i) => i.status === "ready").length;
    const on = activePath === g.path || g.list.some((i) => i.path === activePath);
    html += `<a href="${g.path}" class="sb-cat-link${on ? " on" : ""}"${activePath === g.path ? ' aria-current="page"' : ""}><span class="sb-cat-ico">${catIcon[g.title] || ""}</span><span class="sb-cat-t">${g.title}</span><span class="sb-cat-n">${n}</span></a>`;
  }
  html += "</div>";
  return html;
}

const searchData = json(
  [...ready, ...navGroups.flatMap((g) => g.list.filter((i) => i.lib)), ...roadmap].map((i) => ({ n: i.name, k: i.kind, c: i.category, p: i.path || null }))
);

function layout({ title, description, path, main, ld, md }) {
  const url = site.url + (path === "/" ? "" : path);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${site.name}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${site.url}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${site.url}/og.png" />
<meta name="theme-color" content="#000000" />
<meta name="color-scheme" content="dark" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />${md ? `\n<link rel="alternate" type="text/markdown" href="${md}" />` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" />
<link rel="stylesheet" href="${CSS}" />
<script defer data-site="truvwhp1" data-domain="niceui.dev" src="https://piqo.app/piqo.js"></script>
<script type="application/ld+json">${json(ld)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <button class="top-menu" data-menu aria-label="Open navigation">${icon.menu}</button>
  <a href="/" class="brand" aria-label="NiceUI home">${mark}<span>niceui</span></a>
  <button class="top-search" data-search-open aria-label="Search components">${icon.search}<span>Search components…</span><kbd>⌘K</kbd></button>
  <nav class="top-r" aria-label="Site">
    <a class="top-link top-tab" href="/#mcp">${icon.spark} Connect agent</a>
    <a class="top-link hide-sm" href="/docs/installation">Docs</a>
    <a class="top-link hide-sm" href="/llms.txt">llms.txt</a>
    <a class="top-icon" href="${site.github}" target="_blank" rel="noopener" aria-label="GitHub">${icon.github}</a>
  </nav>
</header>
<div class="shell">
  <aside class="sb" id="sidebar" aria-label="Library">
    <nav>${sidebar(path)}</nav>
  </aside>
  <div class="sb-scrim" data-menu-close></div>
  <main id="main" class="main">
${main}
    <footer class="foot">
      <div class="foot-brand">${mark}<span>niceui</span><span class="dim">· Free UI, MIT licensed.</span></div>
      <nav aria-label="Footer"><a href="/#mcp">MCP</a><a href="/docs/installation">Installation</a><a href="/llms.txt">llms.txt</a><a href="/r/registry.json">Registry</a><a href="/sitemap.xml">Sitemap</a><a href="${site.github}" target="_blank" rel="noopener">GitHub</a><a href="${site.x}" target="_blank" rel="noopener">X</a></nav>
    </footer>
  </main>
</div>
<div class="search" data-search hidden>
  <div class="search-box" role="dialog" aria-modal="true" aria-label="Search">
    <div class="search-in">${icon.search}<input data-search-input placeholder="Search components, blocks, templates…" aria-label="Search" autocomplete="off" /><kbd>esc</kbd></div>
    <ul class="search-list" data-search-list role="listbox"></ul>
  </div>
</div>
<div class="toast" data-toast role="status" aria-live="polite"></div>
<script type="application/json" id="search-data">${searchData}</script>
<script src="${JS}" defer></script>
</body>
</html>
`;
}

// ─── shared fragments ────────────────────────────────────────────────
const org = { "@type": "Organization", "@id": site.url + "/#org", name: site.name, url: site.url, logo: site.url + "/favicon.svg" };
const website = { "@type": "WebSite", "@id": site.url + "/#website", name: site.name, url: site.url, description: site.description, publisher: { "@id": site.url + "/#org" }, inLanguage: "en" };

const card = (it) => `
        <a class="card${it.wide ? " wide" : ""}" href="${it.path}" data-kind="${it.kind}">
          <div class="card-stage"><div class="card-scale" style="--s:${it.thumb || 1}" inert>${it.preview}</div></div>
          <div class="card-meta"><span class="card-name">${esc(it.name)}</span><span class="card-cat">${esc(it.category)}</span></div>
        </a>`;

const soonCard = (it) => `
        <div class="soon-card" data-kind="${it.kind}"><span>${esc(it.name)}</span><span class="soon-meta">${esc(it.category)}<em>Soon</em></span></div>`;

const faqHtml = faq
  .map((f, i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary><h3>${esc(f.q)}</h3><span class="faq-x" aria-hidden="true"></span></summary><p>${esc(f.a)}</p></details>`)
  .join("");


// ─── MCP onboarding content ─────────────────────────────────────────
const MCP_REGISTRY = `{
  "registries": {
    "@niceui": "${site.url}/r/{name}.json"
  }
}`;
const MCP_CLIENTS = [
  { id: "claude", name: "Claude Code", file: "Run in your project", code: "claude mcp add shadcn -- npx shadcn@latest mcp" },
  { id: "cursor", name: "Cursor", file: ".cursor/mcp.json", code: `{
  "mcpServers": {
    "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] }
  }
}` },
  { id: "vscode", name: "VS Code", file: ".vscode/mcp.json", code: `{
  "servers": {
    "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] }
  }
}` },
  { id: "codex", name: "Codex", file: "~/.codex/config.toml", code: `[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]` },
];
const MCP_PROMPTS = ["Add the @niceui/hero-horizon block to my landing page", "Install @niceui/command-palette and wire it to ⌘K", "Show me every component in the @niceui registry"];

// ─── home ────────────────────────────────────────────────────────────
{
  const main = `
    <section class="intro">
      <p class="kicker"><span class="dot"></span>Free &amp; open source <span class="sep">/</span> ${totalReady} components &amp; templates <span class="sep">/</span> ${roadmap.length} on the way</p>
      <h1>Interfaces,<br /><em>nicely</em> made.</h1>
      <p class="lede">The free library for AI agent interfaces, plus premium React &amp; Tailwind components, blocks and templates. Preview, copy, or install with the shadcn CLI. No account. No paywall.</p>
      <div class="cta">
        <a class="btn btn-sky" href="#library">Browse library ${icon.arrow}</a>
        <button class="btn btn-cmd" data-copy="npx shadcn@latest add ${site.url}/r/button.json"><span class="sky">$</span> npx shadcn add niceui.dev/r/button.json ${icon.copy}</button>
      </div>
      <div class="horizon" aria-hidden="true"><div class="arc"></div><div class="arc-glow"></div></div>
    </section>

    <section class="ai-kit" aria-labelledby="ai-kit-h">
      <div class="sec-title"><p class="kicker"><span class="dot"></span>AI agent UI · ${aiItems.length} components</p><h2 id="ai-kit-h">Every interface an <em>AI agent</em> needs.</h2><p class="mute">Chat and composers, reasoning, tool calls and approvals, browser and research agents, traces, workflows, memory and voice. Live, interactive and free.</p></div>
      <div class="ex-grid">${aiSections
        .map((sub) => `<a class="ex-tile" href="/c/ai-agents#ai-${sub.id}"><div class="ex-top"><b>${esc(sub.title)}</b><span>${sub.items.length}</span></div><p>${sub.items.slice(0, 6).map((i) => esc(i.name)).join(" · ")}</p><span class="ex-go">Browse ${icon.arrow}</span></a>`)
        .join("")}
      </div>
      <div class="ai-kit-cta"><a class="btn btn-sky" href="/c/ai-agents">Browse all ${aiItems.length} AI components ${icon.arrow}</a></div>
    </section>

    <section id="mcp" class="mcp" aria-labelledby="mcp-h">
      <div class="mcp-head">
        <p class="kicker"><span class="dot"></span>MCP · for AI agents</p>
        <h2 id="mcp-h">Connect your <em>agent.</em></h2>
        <p class="mute">Give Claude Code, Cursor, VS Code or Codex direct access to NiceUI through the shadcn MCP server. Ask for a component in plain English — your agent finds it, installs it and wires it up.</p>
      </div>
      <div class="mcp-steps">
        <div class="mcp-step">
          <span class="step-n">01</span>
          <h3>Add the registry</h3>
          <p class="mute">In <code class="inline">components.json</code>:</p>
          <div class="code-wrap"><button class="icon-btn code-copy" data-copy="${esc(MCP_REGISTRY)}" aria-label="Copy registry config">${icon.copy}</button><pre class="code"><code>${highlight(MCP_REGISTRY)}</code></pre></div>
        </div>
        <div class="mcp-step" data-tabs>
          <span class="step-n">02</span>
          <h3>Connect your client</h3>
          <div class="tabs mcp-tabs" role="tablist">${MCP_CLIENTS.map((c, i) => `<button role="tab" class="tab${i === 0 ? " on" : ""}" data-tab="${c.id}" aria-selected="${i === 0}">${c.name}</button>`).join("")}</div>
          ${MCP_CLIENTS.map((c, i) => `<div class="panel" data-panel="${c.id}"${i === 0 ? "" : " hidden"}><p class="mute mcp-file">${c.file}</p><div class="code-wrap"><button class="icon-btn code-copy" data-copy="${esc(c.code)}" aria-label="Copy ${c.name} config">${icon.copy}</button><pre class="code"><code>${highlight(c.code)}</code></pre></div></div>`).join("")}
        </div>
        <div class="mcp-step">
          <span class="step-n">03</span>
          <h3>Just ask</h3>
          <div class="mcp-prompts">${MCP_PROMPTS.map((t) => `<button class="mcp-prompt" data-copy="${esc(t)}"><span>“${esc(t)}”</span>${icon.copy}</button>`).join("")}</div>
          <p class="mute small-note">No MCP? Point any assistant at <a class="ul" href="/llms.txt">niceui.dev/llms.txt</a>.</p>
        </div>
      </div>
    </section>

    <section id="library" class="lib" aria-labelledby="lib-h">
      <div class="lib-head">
        <h2 id="lib-h">Library</h2>
        <div class="chips" role="tablist" aria-label="Filter">
          <button class="chip on" data-filter="all">All</button>
          <button class="chip" data-filter="component">Components</button>
          <button class="chip" data-filter="block">Blocks</button>
        </div>
      </div>
      <div class="cards">${[...ready.filter((i) => i.slug === "hero-horizon"), ...readyOrder.filter((i) => i.kind === "component"), ...readyOrder.filter((i) => i.kind === "block" && i.slug !== "hero-horizon")].map(card).join("")}
      </div>
    </section>

    <section class="explore" aria-labelledby="ex-h">
      <div class="sec-title"><h2 id="ex-h">The <em>whole</em> library</h2><p class="mute">${libCount} more live components, AI agent interfaces, blocks, landing pages and dashboards — open any of them.</p></div>
      <div class="ex-grid">${navGroups
        .filter((g) => g.list.some((i) => i.lib))
        .map((g) => {
          const live = g.list.filter((i) => i.status === "ready");
          return `<a class="ex-tile" href="${g.path}"><div class="ex-top"><b>${g.title}</b><span>${live.length}</span></div><p>${live.slice(0, 5).map((i) => esc(i.name)).join(" · ")}</p><span class="ex-go">Browse ${icon.arrow}</span></a>`;
        })
        .join("")}
      </div>
    </section>

    <section class="roadmap" aria-labelledby="road-h">
      <div class="sec-title"><h2 id="road-h">On the <em>roadmap</em></h2><p class="mute">${roadmap.length} more in the works. Shipping weekly.</p></div>
      <div class="soon-grid">${roadmap.map(soonCard).join("")}
      </div>
    </section>

    <section class="faq" aria-labelledby="faq-h">
      <div class="sec-title"><h2 id="faq-h">Questions, <em>answered</em></h2></div>
      <div class="faq-list">${faqHtml}</div>
    </section>`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      {
        "@type": "CollectionPage",
        "@id": site.url + "/#page",
        url: site.url,
        name: "NiceUI — Free React & Tailwind components",
        description: site.description,
        isPartOf: { "@id": site.url + "/#website" },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: ready.length,
          itemListElement: readyOrder.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: site.url + it.path })),
        },
      },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  write(
    "index.html",
    layout({
      title: "NiceUI — Free React & Tailwind UI components, blocks and templates",
      description: site.description,
      path: "/",
      main,
      ld,
      md: "/index.md",
    })
  );
}

// ─── component & block pages ─────────────────────────────────────────
readyOrder.forEach((it, idx) => {
  const prev = readyOrder[idx - 1];
  const next = readyOrder[idx + 1];
  const section = it.kind === "block" ? "Blocks" : "Components";
  const prompt = `Add the "${it.name}" component from NiceUI (${site.url}${it.path}) to my React + Tailwind CSS project.

Save it as ${it.target}. It has no dependencies beyond React and Tailwind CSS.

\`\`\`tsx
${it.code.trim()}
\`\`\`

Example usage:

\`\`\`tsx
${it.usage.trim()}
\`\`\``;

  const main = `
    <article class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Library</a><span>/</span><a href="${groupOf(it).path}">${groupOf(it).title}</a><span>/</span><span aria-current="page">${esc(it.name)}</span></nav>
      <header class="doc-head">
        <h1>${esc(it.name)}</h1>
        <p class="lede">${esc(it.description)}</p>
        <div class="doc-tags"><span>React</span><span>Tailwind CSS</span><span>TypeScript</span><span>${esc(it.category)}</span><span class="t-sky">MIT · Free</span></div>
      </header>

      <div class="frame pv" data-tabs data-pv>
        <div class="frame-bar">
          <div class="tabs" role="tablist">
            <button role="tab" class="tab on" data-tab="preview" aria-selected="true">Preview</button>
            <button role="tab" class="tab" data-tab="code" aria-selected="false">Code</button>
          </div>
          <div class="frame-actions">
            ${pvControls}
            <button class="act" data-copy-key="prompt" title="Copy a ready-made prompt for Claude, Cursor or v0">${icon.spark}<span>Copy prompt</span></button>
            <button class="act" data-copy-key="code">${icon.copy}<span>Copy code</span></button>
          </div>
        </div>
        <div class="panel stage${it.kind === "block" ? " stage-block" : ""}" data-panel="preview"><div class="pv-vp">${it.preview}</div></div>
        <div class="panel" data-panel="code" hidden><div class="code-file">${it.target}</div><pre class="code"><code>${highlight(it.code.trim())}</code></pre></div>
      </div>

      <section class="doc-sec" aria-labelledby="install-h">
        <h2 id="install-h">Installation</h2>
        <div class="steps">
          <div class="step"><span class="step-n">01</span><div><p>Install with the shadcn CLI.</p>
            <div class="cmdline"><code><span class="sky">$</span> ${esc(it.install)}</code><button class="icon-btn" data-copy="${esc(it.install)}" aria-label="Copy install command">${icon.copy}</button></div>
          </div></div>
          <div class="step"><span class="step-n">02</span><div><p>Or copy the source manually into <code class="inline">${it.target}</code>. No extra dependencies.</p></div></div>
        </div>
      </section>

      <section class="doc-sec" aria-labelledby="usage-h">
        <h2 id="usage-h">Usage</h2>
        <div class="code-wrap"><button class="icon-btn code-copy" data-copy-key="usage" aria-label="Copy usage">${icon.copy}</button><pre class="code"><code>${highlight(it.usage.trim())}</code></pre></div>
      </section>

      <section class="doc-sec" aria-labelledby="ai-h">
        <h2 id="ai-h">For AI assistants</h2>
        <p class="mute">This page is also available as <a class="ul" href="${it.path}.md">Markdown</a> and as a <a class="ul" href="/r/${it.slug}.json">shadcn registry item</a>. Use <b>Copy prompt</b> to hand the full source to Claude, Cursor or v0.</p>
      </section>

      <nav class="pager" aria-label="Pagination">
        ${prev ? `<a href="${prev.path}" class="pg"><span class="dim">Previous</span><b>${esc(prev.name)}</b></a>` : "<span></span>"}
        ${next ? `<a href="${next.path}" class="pg pg-next"><span class="dim">Next</span><b>${esc(next.name)}</b></a>` : "<span></span>"}
      </nav>
    </article>
    <script type="application/json" id="page-data">${json({ code: it.code.trim(), usage: it.usage.trim(), prompt })}</script>`;

  const url = site.url + it.path;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      {
        "@type": "SoftwareSourceCode",
        "@id": url + "#code",
        name: it.name + " — React & Tailwind component",
        description: it.description,
        url,
        programmingLanguage: "TypeScript",
        runtimePlatform: "React",
        codeSampleType: "full solution",
        keywords: it.keywords.join(", "),
        license: "https://opensource.org/licenses/MIT",
        isAccessibleForFree: true,
        dateModified: today,
        author: { "@id": site.url + "/#org" },
        isPartOf: { "@id": site.url + "/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Library", item: site.url },
          { "@type": "ListItem", position: 2, name: groupOf(it).title, item: site.url + groupOf(it).path },
          { "@type": "ListItem", position: 3, name: it.name, item: url },
        ],
      },
    ],
  };

  write(
    it.path.slice(1) + ".html",
    layout({
      title: `${it.name} — Free React & Tailwind ${it.kind === "block" ? "Block" : "Component"} | NiceUI`,
      description: it.description + " Free, MIT licensed, copy-paste or install with the shadcn CLI.",
      path: it.path,
      main,
      ld,
      md: it.path + ".md",
    })
  );

  write(
    it.path.slice(1) + ".md",
    `# ${it.name}\n\n> ${it.description}\n\n- Category: ${it.category}\n- Type: ${it.kind}\n- License: MIT (free)\n- Page: ${url}\n\n## Installation\n\n\`\`\`bash\n${it.install}\n\`\`\`\n\nOr copy the source below into \`${it.target}\`.\n\n## Source\n\n\`\`\`tsx\n${it.code.trim()}\n\`\`\`\n\n## Usage\n\n\`\`\`tsx\n${it.usage.trim()}\n\`\`\`\n`
  );

  write(
    "r/" + it.slug + ".json",
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema/registry-item.json",
        name: it.slug,
        type: it.kind === "block" ? "registry:block" : "registry:ui",
        title: it.name,
        description: it.description,
        files: [
          {
            path: (it.kind === "block" ? "registry/blocks/" : "registry/ui/") + it.file,
            type: it.kind === "block" ? "registry:component" : "registry:ui",
            content: it.code,
          },
        ],
      },
      null,
      2
    )
  );
});

// ─── category pages + library item pages ────────────────────────────
const thumbCard = (it) => `
        <a class="card" href="${it.path}" data-kind="${it.kind}">
          <div class="card-stage card-thumb"><img src="${it.thumb}" alt="${esc(it.name)} preview" loading="lazy" decoding="async" width="640" height="400" /></div>
          <div class="card-meta"><span class="card-name">${esc(it.name)}${it.badge === "New" ? ' <em class="tag-new">New</em>' : ""}</span><span class="card-cat">${esc(it.category)}</span></div>
        </a>`;
const aiCategoryBody = () => `
      <nav class="ai-nav" aria-label="AI Agents sections">${aiSections.map((sub) => `<a class="ai-nav-chip" href="#ai-${sub.id}">${esc(sub.title)}<span>${sub.items.length}</span></a>`).join("")}</nav>
      ${aiSections
        .map(
          (sub) => `
      <section class="ai-sub" id="ai-${sub.id}" aria-labelledby="ai-${sub.id}-h">
        <div class="ai-sub-head"><h2 id="ai-${sub.id}-h">${esc(sub.title)}</h2><span class="ai-sub-n">${sub.items.length}</span><p class="mute">${esc(sub.blurb)}</p></div>
        <div class="cards">${sub.items.map(thumbCard).join("")}
        </div>
      </section>`
        )
        .join("")}`;
const anyCard = (it) => (it.lib ? thumbCard(it) : card({ ...it, wide: false, thumb: it.thumb && it.thumb < 0.6 ? 0.36 : it.thumb }));

for (const g of navGroups) {
  const live = g.list.filter((i) => i.status === "ready");
  const later = g.list.filter((i) => i.status !== "ready");
  const main = `
    <section class="doc cat-page">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Library</a><span>/</span><span aria-current="page">${g.title}</span></nav>
      <header class="doc-head cat-head">
        <div class="cat-title"><span class="sb-cat-ico big">${catIcon[g.title] || ""}</span><h1>${g.title}</h1><span class="cat-count">${live.length}</span></div>
        <p class="lede">${esc(g.desc)}</p>
      </header>
      ${g.title === "AI Agents" ? aiCategoryBody() : `<div class="cards">${live.map(anyCard).join("")}
      </div>`}
      ${later.length ? `<div class="sec-title cat-soon"><h2>Coming <em>soon</em></h2></div><div class="soon-grid">${later.map(soonCard).join("")}</div>` : ""}
    </section>`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      {
        "@type": "CollectionPage",
        name: g.title + " — NiceUI",
        url: site.url + g.path,
        description: g.desc,
        mainEntity: { "@type": "ItemList", numberOfItems: live.length, itemListElement: live.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: site.url + it.path })) },
      },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Library", item: site.url }, { "@type": "ListItem", position: 2, name: g.title, item: site.url + g.path }] },
    ],
  };
  const catTitle = g.title === "AI Agents" ? `AI agent UI components — ${live.length} free React & Tailwind interfaces | NiceUI` : `${g.title} — ${live.length} free React & Tailwind ${g.title.toLowerCase()} | NiceUI`;
  write(g.path.slice(1) + ".html", layout({ title: catTitle, description: g.desc + " Free and open source.", path: g.path, main, ld }));

  live.forEach((it, idx) => {
    if (!it.lib) return;
    const prev = live[idx - 1];
    const next = live[idx + 1];
    const itemMain = `
    <article class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Library</a><span>/</span><a href="${g.path}">${g.title}</a><span>/</span><span aria-current="page">${esc(it.name)}</span></nav>
      <header class="doc-head">
        <h1>${esc(it.name)}${it.badge === "New" ? ' <em class="tag-new big">New</em>' : ""}</h1>
        <p class="lede">${esc(it.description)}</p>
        <div class="doc-tags"><span>React</span><span>Tailwind CSS</span><span>TypeScript</span><span>${esc(g.title)}</span><span class="t-sky">MIT · Free</span></div>
      </header>
      <div class="pv pv-lib" data-pv>
      <div class="pv-bar"><span class="pv-bar-t">Live preview</span>${pvControls}</div>
      <div class="embed-frame${it.page ? " embed-page" : ""}">
        <div class="embed-loading" aria-hidden="true"><img src="${it.thumb}" alt="" /></div>
        <iframe src="${it.embed}" title="${esc(it.name)} live preview" loading="lazy" data-autosize></iframe>
      </div>
      </div>
      <nav class="pager" aria-label="Pagination">
        ${prev ? `<a href="${prev.path}" class="pg"><span class="dim">Previous</span><b>${esc(prev.name)}</b></a>` : "<span></span>"}
        ${next ? `<a href="${next.path}" class="pg pg-next"><span class="dim">Next</span><b>${esc(next.name)}</b></a>` : "<span></span>"}
      </nav>
    </article>`;
    const url = site.url + it.path;
    const itemLd = {
      "@context": "https://schema.org",
      "@graph": [
        org,
        website,
        { "@type": "SoftwareSourceCode", name: it.name + " — React & Tailwind", description: it.description, url, programmingLanguage: "TypeScript", runtimePlatform: "React", license: "https://opensource.org/licenses/MIT", isAccessibleForFree: true, image: site.url + it.thumb },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Library", item: site.url }, { "@type": "ListItem", position: 2, name: g.title, item: site.url + g.path }, { "@type": "ListItem", position: 3, name: it.name, item: url }] },
      ],
    };
    write(it.path.slice(1) + ".html", layout({ title: `${it.name} — Free React & Tailwind ${g.title.replace(/s$/, "")} | NiceUI`, description: it.description + " Free, MIT licensed.", path: it.path, main: itemMain, ld: itemLd }));
  });
}

// ─── installation docs ───────────────────────────────────────────────
{
  const steps = [
    ["Set up Tailwind CSS", "NiceUI components are styled with Tailwind CSS v3 or v4. Any React framework works — Next.js, Vite, Remix or Astro."],
    ["Initialise shadcn (optional)", "If you have not used the shadcn CLI in this project yet, run the init command once. It configures the components path alias."],
    ["Add a component", "Every component page shows its install command. The CLI downloads the source straight into your project."],
    ["Make it yours", "The code now lives in your repo. Edit anything — there is no package to update and no lock-in."],
  ];
  const cmds = ["npm install tailwindcss", "npx shadcn@latest init", "npx shadcn@latest add " + site.url + "/r/button.json", ""];
  const main = `
    <article class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Library</a><span>/</span><span aria-current="page">Installation</span></nav>
      <header class="doc-head">
        <h1>Installation</h1>
        <p class="lede">NiceUI is not a package. You copy components into your project — by hand or with the shadcn CLI — and own the code from there.</p>
      </header>
      <div class="steps big">
        ${steps
          .map(
            ([t, d], i) => `<div class="step"><span class="step-n">0${i + 1}</span><div><h2 class="step-t">${t}</h2><p class="mute">${d}</p>${
              cmds[i] ? `<div class="cmdline"><code><span class="sky">$</span> ${esc(cmds[i])}</code><button class="icon-btn" data-copy="${esc(cmds[i])}" aria-label="Copy command">${icon.copy}</button></div>` : ""
            }</div></div>`
          )
          .join("")}
      </div>
      <section class="doc-sec">
        <h2>Fonts used in previews</h2>
        <p class="mute">Previews use <b>Geist</b> and <b>Instrument Serif</b> (for italic accents via Tailwind's <code class="inline">font-serif</code>). Add them through <code class="inline">next/font</code> or Google Fonts, or swap in your own.</p>
      </section>
      <section class="doc-sec">
        <h2>For AI assistants</h2>
        <p class="mute">Point your assistant at <a class="ul" href="/llms.txt">/llms.txt</a> for an index, or <a class="ul" href="/llms-full.txt">/llms-full.txt</a> for every component's full source in one file. The registry index lives at <a class="ul" href="/r/registry.json">/r/registry.json</a>.</p>
      </section>
    </article>`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      {
        "@type": "HowTo",
        name: "How to install NiceUI components",
        description: "Install free NiceUI React and Tailwind components with the shadcn CLI or by copying the source.",
        step: steps.map(([t, d], i) => ({ "@type": "HowToStep", position: i + 1, name: t, text: d + (cmds[i] ? " Command: " + cmds[i] : "") })),
      },
    ],
  };
  write("docs/installation.html", layout({ title: "Installation — NiceUI", description: "How to install free NiceUI React and Tailwind components with the shadcn CLI or by copying the source.", path: "/docs/installation", main, ld, md: "/docs/installation.md" }));
  write(
    "docs/installation.md",
    "# Installation\n\nNiceUI is not a package. Copy components into your project by hand or with the shadcn CLI.\n\n" +
      steps.map(([t, d], i) => `## ${i + 1}. ${t}\n\n${d}\n` + (cmds[i] ? "\n```bash\n" + cmds[i] + "\n```\n" : "")).join("\n")
  );
}

// ─── 404 ─────────────────────────────────────────────────────────────
write(
  "404.html",
  layout({
    title: "Not found — NiceUI",
    description: "This page does not exist.",
    path: "/404",
    main: `<section class="intro nf"><p class="kicker"><span class="dot"></span>404</p><h1>Nothing <em>here</em>.</h1><p class="lede">That page drifted past the horizon. Try the library instead.</p><div class="cta"><a class="btn btn-sky" href="/">Back to library ${icon.arrow}</a></div></section>`,
    ld: { "@context": "https://schema.org", ...website },
  }).replace('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />', '<meta name="robots" content="noindex" />')
);

// ─── registry index, llms, sitemap, robots, manifest ────────────────
write(
  "r/registry.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "niceui",
      homepage: site.url,
      items: readyOrder.map((it) => ({
        name: it.slug,
        type: it.kind === "block" ? "registry:block" : "registry:ui",
        title: it.name,
        description: it.description,
        files: [{ path: (it.kind === "block" ? "registry/blocks/" : "registry/ui/") + it.file, type: it.kind === "block" ? "registry:component" : "registry:ui" }],
      })),
    },
    null,
    2
  )
);

const llmsList = (kind) =>
  readyOrder
    .filter((i) => i.kind === kind)
    .map((i) => `- [${i.name}](${site.url}${i.path}.md): ${i.description}`)
    .join("\n");

write(
  "llms.txt",
  `# ${site.name}

> ${site.description}

NiceUI components are plain React + Tailwind CSS source files with no runtime dependencies. Install any item with \`npx shadcn@latest add ${site.url}/r/<name>.json\`, or copy the source from its page. Every page has a Markdown twin at the same URL plus \`.md\`.

## Docs

- [Installation](${site.url}/docs/installation.md): How to add NiceUI components to a React project.
- [Registry index](${site.url}/r/registry.json): shadcn-compatible registry of all ready items.
- [Full library](${site.url}/library/): Interactive app with landing pages, AI agent interfaces, motion components, blocks and dashboard templates.

## AI agent UI

${aiSections.map((sub) => `### ${sub.title}\n\n${sub.items.map((i) => `- [${i.name}](${site.url}${i.path}): ${i.description}`).join("\n")}`).join("\n\n")}

## Components

${llmsList("component")}

## Blocks

${llmsList("block")}

## Optional

- [Full source](${site.url}/llms-full.txt): Every component's full source and usage in one file.
- Coming soon: ${soon.map((i) => i.name).join(", ")}.
`
);

write(
  "llms-full.txt",
  `# ${site.name} — full source\n\n> ${site.description}\n\n` +
    readyOrder
      .map(
        (it) =>
          `---\n\n## ${it.name}\n\n${it.description}\n\nURL: ${site.url}${it.path}\nInstall: \`${it.install}\`\nFile: \`${it.target}\`\n\n\`\`\`tsx\n${it.code.trim()}\n\`\`\`\n\nUsage:\n\n\`\`\`tsx\n${it.usage.trim()}\n\`\`\`\n`
      )
      .join("\n")
);

write(
  "index.md",
  `# ${site.name} — ${site.tagline}\n\n${site.description}\n\n## Library\n\n${readyOrder.map((i) => `- [${i.name}](${site.url}${i.path}) — ${i.description}`).join("\n")}\n\n## FAQ\n\n${faq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}\n`
);

const urls = [
  { loc: site.url + "/", priority: "1.0", freq: "weekly" },
  { loc: site.url + "/docs/installation", priority: "0.7", freq: "monthly" },
  ...readyOrder.map((it) => ({ loc: site.url + it.path, priority: "0.8", freq: "monthly" })),
  ...navGroups.map((g) => ({ loc: site.url + g.path, priority: "0.9", freq: "weekly" })),
  ...navGroups.flatMap((g) => g.list.filter((i) => i.lib).map((it) => ({ loc: site.url + it.path, priority: "0.7", freq: "monthly" }))),
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`
);

const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "meta-externalagent"];
write(
  "robots.txt",
  `# niceui.dev — humans, search engines and AI assistants are all welcome.\nUser-agent: *\nAllow: /\nDisallow: /404\n\n# AI crawlers: explicitly allowed. See /llms.txt for a curated index.\n${aiBots.map((b) => `User-agent: ${b}`).join("\n")}\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`
);

write(
  "site.webmanifest",
  JSON.stringify({ name: site.name, short_name: site.name, start_url: "/", display: "standalone", background_color: "#000000", theme_color: "#000000", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] }, null, 2)
);

const sources = ["build.mjs", "registry.mjs", "../vercel.json", "../package.json", ...["styles.css", "app.js", "favicon.svg", "og.png"].map((f) => "assets/" + f), ...ready.map((i) => "registry/" + i.file)];
write(
  "build-info.json",
  JSON.stringify({ built: new Date().toISOString(), ready: ready.length, soon: soon.length, sources: Object.fromEntries(sources.map((f) => [f, existsSync(f) ? createHash("sha1").update(readFileSync(f)).digest("hex").slice(0, 12) : null])) }, null, 2)
);

console.log(`Built ${ready.length} ready items, ${soon.length} coming soon → ${OUT}/`);
