// Static site generator for niceui.dev — `node build.mjs` writes everything to dist/.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { faq, items, site } from "./registry.mjs";
import { ITEM_SEO, TAGS, POPULAR, INDEXNOW_KEY } from "./seo.mjs";
import { GUIDES, COMPARE } from "./guides.mjs";
import { makePure } from "../scripts/pure.mjs";
import { FAMILIES, GRADIENTS, gradientCss, gradientTailwind, gradientColours } from "./gradients.mjs";

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
// Full source of every library entry (written by scripts/library-manifest.mjs).
const libSrc = existsSync("library-src.json") ? JSON.parse(readFileSync("library-src.json", "utf8")) : {};
// Installed layout: src/components/x → components/niceui/x, src/pages/x → components/niceui/pages/x.
const regPath = (p) => p.replace(/^src\/components\//, "components/niceui/").replace(/^src\/pages\//, "components/niceui/pages/");
const regContent = (c) => c.replace(/(['"])@\/components\//g, "$1@/components/niceui/").replace(/(['"])@\/pages\//g, "$1@/components/niceui/pages/");
const extDeps = (files) =>
  [...new Set(files.flatMap((f) => [...f.content.matchAll(/from\s+['"]([^'"./@][^'"]*|@[^/'"][^'"]*)['"]/g)].map((m) => m[1].split("/").slice(0, m[1].startsWith("@") ? 2 : 1).join("/"))))].filter((d) => d !== "react" && d !== "react-dom");
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
    theme: e.theme || "dark",
    sec: id,
    slug: e.slug,
    page: e.page,
    thumb: "/assets/thumbs/" + id + "--" + e.slug + ".webp",
    embed: "/library/?embed=1#/" + id + "/" + e.slug,
    rid: id + "-" + e.slug,
    files: (libSrc[id + "/" + e.slug] || []).map((f) => ({ path: regPath(f.path), content: regContent(f.content) })),
    full: e.page ? "/library/?embed=1&full=1#/" + id + "/" + e.slug : null,
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
  { id: "chat", title: "Chat & composers", blurb: "Threads, bubbles, composers, suggestions, widgets and palettes.", slugs: ["chat-app", "message-bubble", "prompt-input", "command-composer", "prompt-suggestions", "streaming-response", "response-branches", "code-block", "chat-widget", "ai-sidebar", "ai-command-palette", "inline-ai-edit", "ghost-autocomplete", "ask-ai-toolbar", "attachment-dropzone"] },
  { id: "thinking", title: "Thinking & status", blurb: "Small, elegant thinking indicators: grid flicker, orbs, rings, waves, terminal spinners, status text and avatar rings.", slugs: ["grid-flicker", "thinking-orbs", "thinking-rings", "dot-wave", "scan-line", "braille-spinner", "thinking-text", "scramble-status", "rotating-status", "agent-status-ring", "thinking-states", "gradient-blob", "agent-loading"] },
  { id: "reasoning", title: "Reasoning, models & sources", blurb: "Thinking, model choice, context limits and answers with citations.", slugs: ["reasoning", "model-selector", "model-compare", "context-usage", "citations", "answer-engine"] },
  { id: "tools", title: "Tools & approvals", blurb: "Tool calls, human-in-the-loop, generative UI, code runs and diffs.", slugs: ["tool-result", "tool-approval", "clarifying-question", "mcp-tool-picker", "generative-ui", "code-interpreter", "file-diff", "diff-suggestion", "tool-permissions", "sandbox-allowlist"] },
  { id: "errors", title: "Errors & recovery", blurb: "Rate limits, failed tools, reconnecting, full context, refusals and spend caps, designed calmly.", slugs: ["rate-limit-notice", "tool-failure-retry", "connection-status", "context-full", "refusal-message", "spend-cap"] },
  { id: "agents", title: "Agents at work", blurb: "Plans, live activity, browser and research agents, handoffs and queues.", slugs: ["agent-activity", "todo-list", "plan-review", "browser-agent", "research-progress", "agent-terminal", "parallel-agents", "agent-handoff", "agent-queue", "task-dock", "done-toast", "run-history"] },
  { id: "build", title: "Build, trace & memory", blurb: "Agent builders, workflows, traces, knowledge, memory, checkpoints and artifacts.", slugs: ["agent-builder", "agent-flow", "agent-trace", "knowledge-base", "memory-panel", "checkpoints", "artifact-panel"] },
  { id: "media", title: "Voice, media & motion", blurb: "Voice orbs (dithered, 3D dot globe, wireframe grid) that react to a live mic, plus image generation and animated AI visuals.", slugs: ["voice-orb", "dither-orb", "dot-globe", "grid-orb", "voice-conversation", "push-to-talk", "audio-recorder", "image-generation", "network-pulse", "feature-tabs"] },
];
const CRM_GROUPS = [
  { id: "records", title: "Records & tables", blurb: "Data grids, filters and saved views, imports and relation pickers.", slugs: ["record-table", "filter-bar", "csv-import", "relation-picker"] },
  { id: "pipeline", title: "Pipeline & deals", blurb: "Kanban pipelines, deal cards, lead scores and sales dashboards.", slugs: ["pipeline-board", "deal-card", "lead-score", "sales-dashboard"] },
  { id: "profiles", title: "Profiles & activity", blurb: "Person and company records, activity timelines and tasks.", slugs: ["person-profile", "company-card", "activity-timeline", "crm-tasks"] },
  { id: "engage", title: "Email & outreach", blurb: "Composers, inbox threads and multi-step outreach sequences.", slugs: ["email-composer", "email-threads", "sequence-builder"] },
];
const groupSections = (items, groups, label) => {
  const secs = groups.map((sub) => ({ ...sub, items: sub.slugs.map((s) => items.find((i) => i.slug === s)).filter(Boolean) })).filter((sub) => sub.items.length);
  const rest = items.filter((i) => !groups.some((sub) => sub.slugs.includes(i.slug)));
  if (rest.length) secs.push({ id: "more", title: "More", blurb: `Everything else for ${label}.`, items: rest });
  for (const sub of secs) for (const it of sub.items) it.category = sub.title;
  return secs;
};
const aiItems = libItems("ai", "ai").sort(byName);
const aiSections = groupSections(aiItems, AI_GROUPS, "AI products");
const crmItems = libItems("crm", "crm").sort(byName);
const crmSections = groupSections(crmItems, CRM_GROUPS, "CRM apps");
const GALLERY_GROUPS = [
  { id: "3d", title: "3D carousels", blurb: "Coverflow, rings, card stacks, parallax sliders and tilting cards.", slugs: ["coverflow-carousel", "ring-carousel", "stack-carousel", "parallax-carousel", "tilt-gallery", "gallery-wall"] },
  { id: "grids", title: "Grids & viewers", blurb: "Masonry, bento, lightbox, filmstrip and before/after viewers.", slugs: ["masonry-gallery", "bento-gallery", "lightbox", "filmstrip-viewer", "before-after"] },
  { id: "reels", title: "Showcase & reels", blurb: "Showreel players, reel grids, project cards, infinite canvases, pixel transitions and polaroids.", slugs: ["showreel-player", "reel-grid", "project-cards", "canvas-gallery", "pixel-transition", "polaroid-stack"] },
  { id: "motion", title: "Motion & scroll", blurb: "Marquees, expanding panels, scroll stacks and hover reveals.", slugs: ["marquee-gallery", "expanding-panels", "scroll-stack-gallery", "hover-reveal-list"] },
  { id: "reveal", title: "Scroll & reveal", blurb: "Image trails, scroll reveals, zoom parallax, horizontal scroll, image-in-text and curtain transitions.", slugs: ["image-trail", "scroll-reveal-images", "zoom-parallax", "horizontal-scroll-gallery", "text-mask-image", "curtain-reveal"] },
];
const EFFECT_GROUPS = [
  { id: "backgrounds", title: "Backgrounds", blurb: "Aurora, animated grids, meteors, particles and border beams.", slugs: ["aurora-background", "animated-grid", "meteors", "particles", "border-beam", "noise-gradient", "beams-background"] },
  { id: "text", title: "Text effects", blurb: "Typewriter, scramble, gradient text, number tickers and rotating words.", slugs: ["typewriter-text", "scramble-text", "gradient-text", "number-ticker", "word-rotate"] },
  { id: "buttons", title: "Buttons & cards", blurb: "Shiny, rainbow, magnetic and ripple buttons, and spotlight cards.", slugs: ["shiny-button", "rainbow-button", "magnetic-button", "ripple-button", "spotlight-card"] },
  { id: "pointer", title: "Cursor & pointer", blurb: "Custom cursors, cursor trails, underline hovers, confetti and a 3D icon cloud.", slugs: ["custom-cursor", "cursor-trail", "underline-animation", "confetti", "icon-cloud"] },
];
const effectItems = libItems("effects", "effect").sort(byName);
const effectSections = groupSections(effectItems, EFFECT_GROUPS, "effects");
const APP_GROUPS = [
  { id: "auth", title: "Authentication", blurb: "Sign in, sign up, one-time codes, magic links and password reset.", slugs: ["sign-in", "sign-up", "otp-verify", "magic-link", "password-reset"] },
  { id: "pages", title: "App pages", blurb: "Settings, onboarding, notifications, empty states, data tables and multi-step forms.", slugs: ["settings-page", "onboarding-flow", "notification-inbox", "data-table", "multi-step-form", "empty-states"] },
];
const appItems = libItems("application", "application").sort(byName);
const appSections = groupSections(appItems, APP_GROUPS, "apps");
const chartItems = libItems("charts", "chart").sort(byName);
const commerceItems = libItems("commerce", "commerce").sort(byName);
const designItems = libItems("design", "design");
const galleryItems = libItems("gallery", "gallery").sort(byName);
const gallerySections = groupSections(galleryItems, GALLERY_GROUPS, "image galleries");
const navGroups = [
  { title: "AI Agents", list: aiSections.flatMap((sub) => sub.items) },
  { title: "CRM", list: crmSections.flatMap((sub) => sub.items) },
  { title: "Application", list: appSections.flatMap((sub) => sub.items) },
  { title: "Charts", list: chartItems },
  { title: "E-commerce", list: commerceItems },
  { title: "Design Tools", list: designItems },
  { title: "Gallery", list: gallerySections.flatMap((sub) => sub.items) },
  { title: "Effects", list: effectSections.flatMap((sub) => sub.items) },
  ...(library.some((sec) => sec.id === "patterns") ? [{ title: "Patterns", list: libItems("patterns", "pattern", "Patterns & backgrounds") }] : []),
  { title: "Components", list: dedupe([...ready.filter((i) => i.kind === "component"), ...libItems("components", "component")]).sort(byName).concat(roadmap.filter((i) => i.kind === "component").sort(byName)) },
  { title: "Blocks", list: dedupe([...ready.filter((i) => i.kind === "block"), ...libItems("blocks", "block"), ...libItems("footers", "block", "Footers")]).sort(byName).concat(roadmap.filter((i) => i.kind === "block").sort(byName)) },
  { title: "Marketing", list: libItems("marketing", "marketing") },
  { title: "Landing Pages", list: libItems("landing", "landing") },
  { title: "Dashboards", list: libItems("examples", "dashboard", "Dashboards") },
  { title: "Templates", list: [...libItems("apps", "template", "App templates"), ...roadmap.filter((i) => i.kind === "template")] },
];
const catDesc = {
  Patterns: "Background patterns for React and Tailwind: dot patterns, grid patterns, flickering grids, retro grids, warp tunnels and hexagons. Drop one behind any section.",
  Components: "Buttons, inputs, overlays, motion primitives and everything in between.",
  "AI Agents": "Every kind of AI agent interface in one place: chat, reasoning, tool calls and approvals, browser and research agents, traces, workflows, memory and voice.",
  Application: "The screens every SaaS needs: sign in and sign up, one-time codes, settings, onboarding, notifications, data tables and multi-step forms.",
  Charts: "Hand-built SVG charts with tooltips, legends and draw-in motion: line, area, bar, donut, radar and KPI cards.",
  "E-commerce": "Product cards and detail pages, cart drawer, checkout and reviews for online stores.",
  "Design Tools": "A light, precise control kit for creative tools: segmented pills, in-track sliders, unit inputs, toggle rows, export menus, swatch rails and canvas toolbars, plus a full badge-maker app.",
  Effects: "Animated backgrounds and text effects: aurora, grids, meteors, particles, border beams, typewriter, scramble, gradient text, number tickers and word rotators.",
  Gallery: "Premium image galleries and carousels: 3D coverflow, rings and card stacks, masonry, bento, lightbox, filmstrips, before/after sliders and scroll-driven motion.",
  CRM: "Everything a modern CRM needs: record tables, filters and views, pipeline boards, deal cards, profiles, activity timelines, tasks, email and outreach, plus a complete CRM app template.",
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

// One-click copy: every library item as one self-contained .tsx (React + Tailwind only).
const pureCache = new Map();
let pureStats = { single: 0, multi: 0 };
const pureOf = (it) => {
  if (pureCache.has(it)) return pureCache.get(it);
  const raw = libSrc[it.sec + "/" + it.slug] || [];
  let out = null;
  if (raw.length) {
    const r = makePure({ name: it.name, url: site.url + it.path, files: raw });
    if (r.pure) {
      out = { code: r.pure, single: true };
      pureStats.single++;
    } else {
      // can't merge safely: one copy with every file, clearly separated
      const body = it.files.map((f) => `// ── file: ${f.path} ${"─".repeat(Math.max(4, 56 - f.path.length))}\n${f.content.trim()}\n`).join("\n");
      out = { code: `// ${it.name} — NiceUI (MIT) · ${site.url}${it.path}\n// This item spans ${it.files.length} files. Save each section below at the path in its header.\n// Needs React, Tailwind CSS and lucide-react, plus the NiceUI theme from ${site.url}/r/niceui-base.json.\n\n${body}`, single: false };
      pureStats.multi++;
    }
    write(`r/${it.rid}.tsx`, out.code);
  }
  pureCache.set(it, out);
  return out;
};
const pureName = (it) => it.name.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase()) + ".tsx";

// ─── search helpers: item keys, tag pages, popular searches ─────────
const keyOf = (it) => (it.lib ? `${it.sec}/${it.slug}` : `site/${it.slug}`);
const allItems = (() => {
  const seen = new Set();
  const out = [];
  for (const g of navGroups)
    for (const it of g.list)
      if (it.status === "ready" && it.path && !seen.has(it.path)) {
        seen.add(it.path);
        out.push(it);
      }
  return out;
})();
const byKey = new Map(allItems.map((it) => [keyOf(it), it]));
const unknownSeo = Object.keys(ITEM_SEO).filter((k) => !byKey.has(k));
if (unknownSeo.length) console.log(`seo: ${unknownSeo.length} ITEM_SEO keys have no item yet (${unknownSeo.slice(0, 6).join(", ")}${unknownSeo.length > 6 ? ", …" : ""})`);
const firstMatch = (t, it) => t.match.findIndex((rx) => rx.test(keyOf(it)));
const tagPages = TAGS.map((t) => ({
  ...t,
  path: "/s/" + t.slug,
  // most specific pattern first, then library order
  items: allItems.filter((it) => firstMatch(t, it) >= 0).sort((a, b) => firstMatch(t, a) - firstMatch(t, b)),
})).filter((t) => t.items.length >= 3);
const tagBySlug = new Map(tagPages.map((t) => [t.slug, t]));
const tagsOf = (it) => tagPages.filter((t) => t.items.includes(it));
const akaLine = (seo) => (seo && seo.terms ? `\n        <p class="aka">Often searched as ${seo.terms.map((t) => `<span>${esc(t)}</span>`).join("")}</p>` : "");
const popularLinks = (cls = "pop-links") => `<nav class="${cls}" aria-label="Popular searches">${POPULAR.map((s) => tagBySlug.get(s)).filter(Boolean).map((t) => `<a href="${t.path}">${esc(t.h1)}</a>`).join("")}</nav>`;

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
  Patterns: ico('<circle cx="5" cy="5" r="1.2"/><circle cx="12" cy="5" r="1.2"/><circle cx="19" cy="5" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/><circle cx="5" cy="19" r="1.2"/><circle cx="12" cy="19" r="1.2"/><circle cx="19" cy="19" r="1.2"/>'),
  "Design Tools": ico('<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>'),
  Application: ico('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>'),
  Charts: ico('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>'),
  "E-commerce": ico('<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>'),
  Effects: ico('<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>'),
  Gallery: ico('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  CRM: ico('<path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7.5" r="3.5"/><path d="M22 20v-1.5a4 4 0 0 0-3-3.87"/><path d="M16 4.13a4 4 0 0 1 0 7.75"/>'),
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
  let html = `<div class="sb-group"><p class="sb-label">Getting started</p>${link("/", "Introduction")}${link("/browse", "All components")}${link("/guides", "Guides & articles")}${link("/gradients", "Gradients")}${link("/gradient-maker", "Gradient maker", '<em class="tag-ai">New</em>')}${link("/docs/installation", "Installation")}${link("/changelog", "Changelog")}${link("/saved", "Saved", '<em class="tag-ai" data-saved-count hidden></em>')}${link("/#mcp", "Connect your agent", '<em class="tag-ai">MCP</em>')}${link("/llms.txt", "llms.txt", '<em class="tag-ai">AI</em>')}${libGuides.map((e) => link("/library/#/intro/" + e.slug, e.name === "OpenUI" ? "Design system" : e.name)).join("")}</div>`;
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

function layout({ title, description, path, main, ld, md, home, image }) {
  const ogImg = image ? site.url + image : site.url + "/og.png";
  const ogW = image ? 640 : 1200;
  const ogH = image ? 400 : 630;
  const url = site.url + (path === "/" ? "" : path);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<script>try{if(localStorage.getItem("niceui-theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}</script>
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
<meta property="og:image" content="${ogImg}" />
<meta property="og:image:width" content="${ogW}" />
<meta property="og:image:height" content="${ogH}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${ogImg}" />
<meta name="theme-color" content="#000000" />
<meta name="color-scheme" content="dark light" />
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
<body${home ? ' class="home"' : ""}>
<a class="skip" href="#main">Skip to content</a>
${home ? `${home.header}
<main id="main" class="h-main">
${main}
</main>
${home.footer}
` : `<header class="top">
  <button class="top-menu" data-menu aria-label="Open navigation">${icon.menu}</button>
  <a href="/" class="brand" aria-label="NiceUI home">${mark}<span>niceui</span></a>
  <button class="top-search" data-search-open aria-label="Search components">${icon.search}<span>Search components…</span><kbd>⌘K</kbd></button>
  <nav class="top-r" aria-label="Site">
    <a class="top-link top-tab" href="/#mcp">${icon.spark} Connect agent</a>
    <a class="top-link hide-sm" href="/docs/installation">Docs</a>
    <a class="top-link hide-sm" href="/llms.txt">llms.txt</a>
    <button class="top-icon theme-toggle" data-theme-toggle aria-label="Switch to light theme" title="Light or dark theme"><svg class="i-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="i-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
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
      ${popularLinks("pop-links foot-pop")}
      <nav aria-label="Footer"><a href="/guides">Guides</a><a href="/#mcp">MCP</a><a href="/docs/installation">Installation</a><a href="/llms.txt">llms.txt</a><a href="/r/registry.json">Registry</a><a href="/sitemap.xml">Sitemap</a><a href="${site.github}" target="_blank" rel="noopener">GitHub</a><a href="${site.x}" target="_blank" rel="noopener">X</a></nav>
    </footer>
  </main>
</div>
`}
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
// A standalone marketing homepage: mega menu header, two-tone hero, a drifting
// wall of real thumbnails, and sections built from the live library data.
const allLib = navGroups.flatMap((g) => g.list.filter((i) => i.lib));
const byThumb = new Map(allLib.map((i) => [i.sec + "--" + i.slug, i]));
const hasThumb = (i) => i && existsSync("assets/thumbs/" + i.sec + "--" + i.slug + ".webp");
const pick = (key) => {
  const i = byThumb.get(key);
  return hasThumb(i) ? i : null;
};
const firstThumb = (list) => list.find((i) => i.lib && hasThumb(i));
const gByTitle = (t) => navGroups.find((g) => g.title === t);
const live = (g) => g.list.filter((i) => i.status === "ready");

const mkIco = {
  install: ico('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>'),
  mcp: ico('<path d="M8 3v4M16 3v4M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>'),
  llms: ico('<path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6"/>'),
  registry: ico('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  changelog: ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  saved: ico('<path d="M6 3h12v18l-6-4-6 4z"/>'),
  github: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg>',
  code: ico('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>'),
  terminal: ico('<path d="m4 7 5 5-5 5M12 19h8"/>'),
  bot: ico('<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/>'),
  contrast: ico('<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>'),
  check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
};

/* Preview card inside a mega menu pane (swapped by app.js on hover). */
const mkPreview = (it, title, meta) =>
  it
    ? `<div class="mk-pv" data-native="${it.theme}"><div class="mk-pv-img"><img src="${it.thumb}" alt="" width="640" height="400" loading="lazy" decoding="async" /></div><p class="mk-pv-meta">${esc(meta)}</p><p class="mk-pv-t">${esc(title)}</p></div>`
    : "";
const pvAttrs = (it, title, meta) => (it ? ` data-pv="${it.thumb}" data-pv-native="${it.theme}" data-pv-t="${esc(title)}" data-pv-m="${esc(meta)}"` : "");

const libGroups = navGroups.filter((g) => live(g).some((i) => i.lib));
const half = Math.ceil(libGroups.length / 2);
const libLink = (g) => {
  const t = firstThumb(live(g));
  const n = live(g).length;
  return `<a class="mk-link" href="${g.path}"${pvAttrs(t, g.desc || g.title, n + " live")}><span class="mk-ico">${catIcon[g.title] || ""}</span><span class="mk-lt">${g.title}</span><span class="mk-n">${n}</span></a>`;
};
const libFirst = firstThumb(live(libGroups[0]));

const aiLink = (sub) => {
  const t = firstThumb(sub.items);
  return `<a class="mk-row" href="/c/ai-agents#ai-${sub.id}"${pvAttrs(t, sub.title, sub.items.length + " components")}><span class="mk-rt">${esc(sub.title)}<span class="mk-n">${sub.items.length}</span></span><span class="mk-rd">${esc(sub.blurb)}</span></a>`;
};

const tplRows = [
  { g: gByTitle("Landing Pages"), t: "Landing pages", d: "Complete, animated pages you can ship as-is" },
  { g: gByTitle("Templates"), t: "App templates", d: "CRM, store, docs, portfolio, blog and more" },
  { g: gByTitle("Dashboards"), t: "Dashboards", d: "Analytics, finance, commerce and ops" },
  { g: gByTitle("Marketing"), t: "Marketing sections", d: "Heroes, pricing, testimonials, mega menus" },
].filter((r) => r.g);
const tplLink = (r) => {
  const t = firstThumb(live(r.g));
  return `<a class="mk-row" href="${r.g.path}"${pvAttrs(t, r.t, live(r.g).length + " ready")}><span class="mk-rt">${r.t}<span class="mk-n">${live(r.g).length}</span></span><span class="mk-rd">${r.d}</span></a>`;
};

const resRows = [
  { href: "/docs/installation", ic: mkIco.install, t: "Installation", d: "Set up the shadcn CLI in a minute" },
  { href: "/#mcp", ic: mkIco.mcp, t: "Connect your agent", d: "MCP for Claude Code, Cursor, VS Code, Codex" },
  { href: "/llms.txt", ic: mkIco.llms, t: "llms.txt", d: "The whole library, readable by any AI" },
  { href: "/r/registry.json", ic: mkIco.registry, t: "Registry", d: "Every item as shadcn registry JSON" },
  { href: "/gradient-maker", ic: mkIco.contrast, t: "Gradient Maker", d: "Mesh, conic & shader gradients, one-click code" },
  { href: "/gradients", ic: mkIco.contrast, t: "Gradients", d: "Copy-paste CSS & Tailwind gradients" },
  { href: "/changelog", ic: mkIco.changelog, t: "Changelog", d: "What shipped, week by week" },
  { href: "/saved", ic: mkIco.saved, t: "Saved", d: "Your bookmarked components" },
];

const MENU = [
  {
    label: "Library",
    pane: `<div class="mk-pane-in mk-grid"><div><p class="mk-h mk-h-row">Browse by category<a href="/browse">View all ${totalReady} →</a></p><div class="mk-cols"><div>${libGroups.slice(0, half).map(libLink).join("")}</div><div>${libGroups.slice(half).map(libLink).join("")}</div></div></div>${mkPreview(libFirst, libGroups[0].desc || libGroups[0].title, live(libGroups[0]).length + " live")}</div>`,
    sheet: libGroups.map((g) => `<a href="${g.path}"><span class="mk-ico">${catIcon[g.title] || ""}</span>${g.title}<span class="mk-n">${live(g).length}</span></a>`).join(""),
  },
  {
    label: "AI Agents",
    pane: `<div class="mk-pane-in mk-grid"><div><p class="mk-h">${aiItems.length} AI agent interfaces</p><div class="mk-rows2">${aiSections.map(aiLink).join("")}</div></div>${mkPreview(firstThumb(aiSections[0].items), aiSections[0].title, aiSections[0].items.length + " components")}</div>`,
    sheet: aiSections.map((s) => `<a href="/c/ai-agents#ai-${s.id}">${esc(s.title)}<span class="mk-n">${s.items.length}</span></a>`).join(""),
  },
  {
    label: "Templates",
    pane: `<div class="mk-pane-in mk-grid"><div class="mk-rows">${tplRows.map(tplLink).join("")}</div>${mkPreview(firstThumb(live(tplRows[0].g)), tplRows[0].t, live(tplRows[0].g).length + " ready")}</div>`,
    sheet: tplRows.map((r) => `<a href="${r.g.path}">${r.t}<span class="mk-n">${live(r.g).length}</span></a>`).join(""),
  },
  {
    label: "Resources",
    pane: `<div class="mk-pane-in"><div class="mk-rows mk-res">${resRows.map((r) => `<a class="mk-row mk-row-ic" href="${r.href}"><span class="mk-rico">${r.ic}</span><span><span class="mk-rt">${r.t}</span><span class="mk-rd">${r.d}</span></span></a>`).join("")}</div></div>`,
    sheet: resRows.map((r) => `<a href="${r.href}">${r.t}</a>`).join(""),
  },
];

const homeHeader = `<header class="mk-top" data-mk>
  <div class="mk-bar">
    <a href="/" class="mk-brand" aria-label="NiceUI home">${mark}<span>niceui</span></a>
    <nav class="mk-nav" aria-label="Primary">
      ${MENU.map((m, i) => `<button class="mk-trig" data-mk-trig="${i}" aria-expanded="false" aria-controls="mk-panel">${m.label}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`).join("")}
      <a class="mk-trig" href="/docs/installation" data-mk-plain>Docs</a>
    </nav>
    <div class="mk-r">
      <button class="mk-search" data-search-open aria-label="Search components">${icon.search}<span>Search</span><kbd>⌘K</kbd></button>
      <button class="top-icon theme-toggle" data-theme-toggle aria-label="Switch to light theme" title="Light or dark theme"><svg class="i-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="i-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
      <a class="top-icon mk-hide-sm" href="${site.github}" target="_blank" rel="noopener" aria-label="GitHub">${icon.github}</a>
      <a class="mk-cta mk-hide-sm" href="/browse">Browse library</a>
      <button class="mk-burger" data-mk-sheet aria-expanded="false" aria-label="Open menu">${icon.menu}</button>
    </div>
    <div class="mk-panel" id="mk-panel" data-mk-panel role="region" aria-label="Menu">
      ${MENU.map((m, i) => `<div class="mk-pane" data-mk-pane="${i}" aria-hidden="true">${m.pane}</div>`).join("")}
    </div>
  </div>
  <div class="mk-sheet" data-mk-sheet-panel hidden>
    ${MENU.map((m) => `<details class="mk-acc"><summary>${m.label}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="mk-acc-in">${m.sheet}</div></details>`).join("")}
    <a class="mk-sheet-link" href="/docs/installation">Docs</a>
    <a class="btn btn-sky mk-sheet-cta" href="/browse">Browse all components ${icon.arrow}</a>
  </div>
</header>`;

/* The drifting wall: four columns of real thumbnails. */
const WALL = [
  ["landing--saas-landing", "ai--dot-globe", "marketing--hero-dusk", "apps--crm-app", "gallery--coverflow-carousel", "crm--pipeline-board", "effects--aurora-background", "blocks--dynamic-island"],
  ["ai--chat-app", "marketing--hero-meadow", "charts--area-chart", "apps--ai-assistant", "ai--dither-orb", "commerce--product-detail", "gallery--parallax-carousel", "components--cylinder-carousel"],
  ["landing--ui-library-landing", "ai--agent-trace", "gallery--bento-gallery", "marketing--pricing-tiers", "ai--grid-orb", "effects--beams-background", "examples--analytics", "marketing--mega-menu"],
  ["landing--agent-platform-landing", "ai--browser-agent", "apps--store", "marketing--testimonial-wall", "gallery--ring-carousel", "ai--reasoning", "crm--sales-dashboard", "landing--studio-landing"],
].map((col) => col.map(pick).filter(Boolean));
const wallTile = (it, k) =>
  `<a class="wall-tile${k % 3 === 1 ? " tall" : ""}" href="${it.path}" data-native="${it.theme}" tabindex="-1"><img src="${it.thumb}" alt="" width="640" height="400" loading="${k < 3 ? "eager" : "lazy"}" decoding="async" /><span class="wall-cap"><b>${esc(it.name)}</b><em>${esc(it.category)}</em></span></a>`;
const wallHtml = `<div class="wall" aria-label="A selection of NiceUI components">${WALL.map((col, ci) => `<div class="wall-col wc${ci}"><div class="wall-track">${[...col, ...col].map((it, k) => wallTile(it, k)).join("")}</div></div>`).join("")}</div>`;

const STACK = ["React", "Next.js", "Tailwind CSS", "TypeScript", "shadcn/ui", "Vite", "Claude Code", "Cursor", "VS Code", "Codex"];
const FEATURES = [
  { ic: mkIco.code, t: "The whole source", d: "Every file, every line. Copy it, read it in a minute, change it in five." },
  { ic: mkIco.terminal, t: "One-line installs", d: "Any item drops into your project with the shadcn CLI. No package to keep updated." },
  { ic: mkIco.bot, t: "Built for AI agents", d: "MCP, llms.txt and registry JSON, so your coding agent can find and install it." },
  { ic: mkIco.contrast, t: "Light and dark", d: "Every preview works in both themes, with tokens that follow your Tailwind setup." },
];
const TPL = ["landing--ui-library-landing", "landing--agent-platform-landing", "apps--crm-app", "landing--video-editor-landing"].map(pick).filter(Boolean);

const homeMain = `
<section class="h-hero">
  <div class="h-glow" aria-hidden="true"></div>
  <div class="h-wrap h-center">
    <p class="h-tag"><span class="dot"></span>Free &amp; open source <span class="sep">/</span> React + Tailwind</p>
    <h1 class="h-title"><span>Interfaces, <em>nicely</em> made.</span><span class="h-second">Free to copy. Ready to ship.</span></h1>
    <p class="h-lede">NiceUI is a free library of ${totalReady} React and Tailwind components, blocks and templates, with the most complete set of AI agent interfaces anywhere. Preview, copy the source, or install with the shadcn CLI. No account. No paywall.</p>
    <div class="h-cta">
      <a class="btn btn-sky h-btn" href="/browse">Browse the library ${icon.arrow}</a>
      <button class="btn btn-cmd h-btn" data-copy="npx shadcn@latest add ${site.url}/r/button.json"><span class="sky">$</span> npx shadcn add niceui.dev/r/button.json ${icon.copy}</button>
    </div>
    <p class="h-meta"><b>${totalReady} live</b> · new every week · MIT licensed</p>
  </div>
  ${wallHtml}
</section>

<section class="h-stack" aria-label="Works with">
  <p class="h-eyebrow">Drops into the stack you already use</p>
  <div class="h-marq"><div class="h-marq-track">${[...STACK, ...STACK].map((s) => `<span><i></i>${s}</span>`).join("")}</div></div>
</section>

<section class="h-sec h-wrap" aria-labelledby="why-h">
  <div class="h-head h-center"><p class="h-tag">Why NiceUI</p><h2 id="why-h">Real code, not a black box.<span class="h-second">Bend it however you like.</span></h2><p class="h-sub">Plain React and Tailwind you own outright. No runtime, no lock-in, no licence keys.</p></div>
  <div class="h-feats">${FEATURES.map((f) => `<div class="h-feat"><span class="h-feat-ic">${f.ic}</span><h3>${f.t}</h3><p>${f.d}</p></div>`).join("")}</div>
</section>

<section class="h-sec h-wrap" aria-labelledby="ai-h">
  <div class="h-head h-split"><div><p class="h-tag"><span class="dot"></span>AI agent UI · ${aiItems.length} components</p><h2 id="ai-h">Every interface an AI agent needs.<span class="h-second">Live, interactive and free.</span></h2></div><a class="h-more" href="/c/ai-agents">All ${aiItems.length} AI components ${icon.arrow}</a></div>
  <div class="h-ai">${aiSections
    .map((sub) => {
      const t = firstThumb(sub.items);
      return `<a class="h-ai-card" href="/c/ai-agents#ai-${sub.id}">${t ? `<span class="h-ai-img" data-native="${t.theme}"><img src="${t.thumb}" alt="" width="640" height="400" loading="lazy" decoding="async" /></span>` : ""}<span class="h-ai-t"><b>${esc(sub.title)}</b><i>${sub.items.length}</i></span><span class="h-ai-d">${sub.items.slice(0, 4).map((i) => esc(i.name)).join(" · ")}</span></a>`;
    })
    .join("")}</div>
</section>

<section class="h-sec h-wrap" aria-labelledby="tpl-h">
  <div class="h-head h-split"><div><h2 id="tpl-h">Whole pages,<span class="h-second">already put together.</span></h2><p class="h-sub">Landing pages and full app templates, nav to footer. Every one ships with its source.</p></div><a class="h-more" href="/c/landing-pages">Browse templates ${icon.arrow}</a></div>
  <div class="h-tpl">${TPL.map((it) => `<a class="h-tpl-card" href="${it.path}"><span class="h-tpl-img" data-native="${it.theme}"><img src="${it.thumb}" alt="${esc(it.name)} preview" width="640" height="400" loading="lazy" decoding="async" /><span class="h-tpl-go">Open ${icon.arrow}</span></span><span class="h-tpl-meta"><b>${esc(it.name)}</b><em>${esc(it.category)}</em></span></a>`).join("")}</div>
</section>

<section id="mcp" class="h-sec h-wrap" aria-labelledby="mcp-h">
  <div class="h-panel">
    <div class="h-head"><p class="h-tag"><span class="dot"></span>MCP · for AI agents</p><h2 id="mcp-h">Describe it.<span class="h-second">Your agent installs it.</span></h2><p class="h-sub">Give Claude Code, Cursor, VS Code or Codex direct access to NiceUI through the shadcn MCP server. Ask for a component in plain English and your agent finds it, installs it and wires it up.</p></div>
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
  </div>
</section>

<section id="explore" class="h-sec h-wrap" aria-labelledby="ex-h">
  <div class="h-head h-center"><h2 id="ex-h">The whole library.<span class="h-second">${libGroups.length} categories, one click away.</span></h2><p class="h-sub">Or see <a class="ul" href="/browse">all ${totalReady} on one page</a>, with search and filters.</p></div>
  <div class="h-cats">${libGroups
    .map((g) => `<a class="h-cat" href="${g.path}"><span class="h-cat-ic">${catIcon[g.title] || ""}</span><span class="h-cat-t"><b>${g.title}</b><i>${live(g).length}</i></span><span class="h-cat-d">${esc(g.desc || live(g).slice(0, 4).map((i) => i.name).join(" · "))}</span></a>`)
    .join("")}</div>
</section>

<section class="h-sec h-wrap h-narrow" aria-labelledby="free-h">
  <div class="h-head h-center"><p class="h-tag">Pricing</p><h2 id="free-h">Free. All of it.<span class="h-second">No tiers, no trial, no catch.</span></h2></div>
  <div class="h-free">
    <div class="h-free-l"><p class="h-free-k">Everything</p><p class="h-free-p">$0<span>forever</span></p><p class="h-free-n">MIT licensed. Use it in personal and client work.</p><a class="btn btn-sky" href="/browse">Start building ${icon.arrow}</a></div>
    <ul class="h-free-r">${[`All ${totalReady} components, blocks and templates`, `${aiItems.length} AI agent interfaces`, "Full source for every item", "shadcn CLI and registry JSON", "MCP and llms.txt for your agent", "Light and dark previews", "New drops every week"].map((f) => `<li>${mkIco.check}${f}</li>`).join("")}</ul>
  </div>
  <p class="h-free-foot">Like it? <a class="ul" href="${site.github}" target="_blank" rel="noopener">Star NiceUI on GitHub</a> — it keeps the lights on.</p>
</section>

<section class="h-sec h-wrap h-narrow" aria-labelledby="faq-h">
  <div class="h-head h-center"><h2 id="faq-h">Questions, answered.</h2></div>
  <div class="faq-list">${faqHtml}</div>
</section>

<section class="h-wrap h-cta-wrap">
  <div class="h-cta-card">
    <h2>Ship the next screen<span class="h-second">before the coffee cools.</span></h2>
    <p>${totalReady} components, blocks and templates. Free, today and tomorrow.</p>
    <a class="h-cta-btn" href="/browse">Browse all ${totalReady} ${icon.arrow}</a>
  </div>
</section>`;

const footCols = [
  ["Library", libGroups.slice(0, 7).map((g) => [g.title, g.path])],
  ["AI agents", aiSections.slice(0, 6).map((s) => [s.title, "/c/ai-agents#ai-" + s.id])],
  ["Resources", [["Gradient Maker", "/gradient-maker"], ["Gradients", "/gradients"], ["Installation", "/docs/installation"], ["Connect your agent", "/#mcp"], ["llms.txt", "/llms.txt"], ["Registry", "/r/registry.json"], ["Changelog", "/changelog"], ["Sitemap", "/sitemap.xml"]]],
  ["Guides", [["All guides", "/guides"], ...GUIDES.slice(0, 4).map((g) => [g.h1, "/guides/" + g.slug])]],
  ["Project", [["GitHub", site.github], ["X", site.x], ["Saved", "/saved"]]],
];
const homeFooter = `<footer class="h-foot h-wrap">
  <div class="h-foot-grid">
    <div class="h-foot-brand"><a href="/" class="mk-brand">${mark}<span>niceui</span></a><p>Interfaces, nicely made. Free React and Tailwind UI, MIT licensed.</p></div>
    ${footCols.map(([h, links]) => `<div><p class="h-foot-h">${h}</p><ul>${links.map(([t, href]) => `<li><a href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ""}>${esc(t)}</a></li>`).join("")}</ul></div>`).join("")}
  </div>
  <div class="h-foot-pop"><p class="h-foot-h">Popular searches</p>${popularLinks()}</div>
  <div class="h-foot-bar"><span>© 2026 NiceUI</span><span>Made for people who ship.</span></div>
  <p class="h-foot-word" aria-hidden="true">niceui</p>
</footer>`;

{
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
          numberOfItems: libGroups.length,
          itemListElement: libGroups.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.title, url: site.url + g.path })),
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
      main: homeMain,
      ld,
      md: "/index.md",
      home: { header: homeHeader, footer: homeFooter },
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
        <p class="lede">${esc(it.description)}</p>${akaLine(ITEM_SEO["site/" + it.slug])}
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
      title: ITEM_SEO["site/" + it.slug] ? `${ITEM_SEO["site/" + it.slug].title} for React & Tailwind | NiceUI` : `${it.name} — Free React & Tailwind ${it.kind === "block" ? "Block" : "Component"} | NiceUI`,
      description: (ITEM_SEO["site/" + it.slug] ? `Free ${ITEM_SEO["site/" + it.slug].terms[0]} for React and Tailwind CSS. ` : "") + it.description + " Free, MIT licensed, copy-paste or install with the shadcn CLI.",
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
        <div class="card-box">${pureOf(it) ? `<button class="card-copy" data-copy-url="/r/${it.rid}.tsx" data-copy-name="${esc(it.name)}" aria-label="Copy ${esc(it.name)} code" title="Copy code">${icon.copy}<span>Copy</span></button>` : ""}<a class="card" href="${it.path}" data-kind="${it.kind}" data-native="${it.theme}">
          <div class="card-stage card-thumb"><img src="${it.thumb}" alt="${esc(it.name)} preview" loading="lazy" decoding="async" width="640" height="400" /></div>
          <div class="card-meta"><span class="card-name">${esc(it.name)}${it.badge === "New" ? ' <em class="tag-new">New</em>' : ""}</span><span class="card-cat">${esc(it.category)}</span></div>
        </a></div>`;
const designFeature = () => {
  const t = navGroups.find((g) => g.title === "Templates")?.list.find((i) => i.slug === "badge-maker");
  return t
    ? `<a class="crm-feature" href="${t.path}"><img src="${t.thumb}" alt="Badge Maker template preview" loading="lazy" decoding="async" width="640" height="400" /><div class="crm-feature-copy"><p class="kicker"><span class="dot"></span>Full template</p><h2>Badge Maker</h2><p class="mute">${esc(t.description)}</p><span class="ex-go">Open the template ${icon.arrow}</span></div></a>`
    : "";
};
const crmTemplate = () => navGroups.find((g) => g.title === "Templates")?.list.find((i) => i.slug === "crm-app");
const crmFeature = () => {
  const t = crmTemplate();
  return t
    ? `<a class="crm-feature" href="${t.path}"><img src="${t.thumb}" alt="CRM App template preview" loading="lazy" decoding="async" width="640" height="400" /><div class="crm-feature-copy"><p class="kicker"><span class="dot"></span>Full template</p><h2>CRM App</h2><p class="mute">${esc(t.description)}</p><span class="ex-go">Open the template ${icon.arrow}</span></div></a>`
    : "";
};
const groupedBody = (sections, prefix, label) => `
      <nav class="ai-nav" aria-label="${label} sections">${sections.map((sub) => `<a class="ai-nav-chip" href="#${prefix}-${sub.id}">${esc(sub.title)}<span>${sub.items.length}</span></a>`).join("")}</nav>
      ${sections
        .map(
          (sub) => `
      <section class="ai-sub" id="${prefix}-${sub.id}" aria-labelledby="${prefix}-${sub.id}-h">
        <div class="ai-sub-head"><h2 id="${prefix}-${sub.id}-h">${esc(sub.title)}</h2><span class="ai-sub-n">${sub.items.length}</span><p class="mute">${esc(sub.blurb)}</p></div>
        <div class="cards">${sub.items.map(thumbCard).join("")}
        </div>
      </section>`
        )
        .join("")}`;
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
const libCode = (it) => {
  if (!it.files?.length) return "";
  const cmd = `npx shadcn@latest add ${site.url}/r/${it.rid}.json`;
  const deps = extDeps(it.files);
  const prompt = `Add the "${it.name}" component from NiceUI to my React + Tailwind project. Install it with \`${cmd}\` (this also installs the NiceUI theme: colours, shadows and animations). Docs: ${site.url}${it.path}. Then use it where it fits and adapt the copy to my product.`;
  const base = (p) => p.split("/").pop();
  return `
      ${(() => {
        const p = pureOf(it);
        if (!p) return "";
        const lines = p.code.split("\n").length;
        return `<section class="quick-copy" aria-label="Copy code">
        <div class="qc-l"><b>${p.single ? "One file. Nothing to install." : `${it.files.length} files in one copy`}</b><span>${p.single ? `Pure React + Tailwind CSS · icons and animations inlined · ${lines} lines` : `React + Tailwind CSS + lucide-react · ${lines} lines`}</span></div>
        <div class="qc-r"><button class="btn btn-sky qc-btn" data-copy-url="/r/${it.rid}.tsx" data-copy-name="${esc(it.name)}">${icon.copy} Copy code</button><a class="btn btn-cmd qc-dl" href="/r/${it.rid}.tsx" download="${pureName(it)}">Download .tsx</a></div>
      </section>`;
      })()}
      <section class="doc-sec" aria-labelledby="install-h">
        <h2 id="install-h">Installation</h2>
        <div class="steps">
          <div class="step"><span class="step-n">01</span><div><p>Install with the shadcn CLI. The NiceUI theme comes along the first time.</p>
            <div class="cmdline"><code><span class="sky">$</span> ${esc(cmd)}</code><button class="icon-btn" data-copy="${esc(cmd)}" aria-label="Copy install command">${icon.copy}</button></div>
          </div></div>
          <div class="step"><span class="step-n">02</span><div><p>Or copy the source below${it.files.length > 1 ? ` (${it.files.length} files)` : ""}. Dependencies: ${deps.length ? deps.map((d) => `<code class="inline">${esc(d)}</code>`).join(" ") : "none"}.</p>
            <button class="btn btn-cmd src-prompt" data-copy="${esc(prompt)}">${icon.spark} Copy prompt for your AI agent</button>
          </div></div>
        </div>
      </section>
      <section class="doc-sec" aria-labelledby="src-h">
        <h2 id="src-h">Source</h2>
        <div data-tabs>
          ${it.files.length > 1 ? `<div class="tabs src-files" role="tablist">${it.files.map((f, i) => `<button role="tab" class="tab${i ? "" : " on"}" data-tab="f${i}" aria-selected="${!i}">${esc(base(f.path))}</button>`).join("")}</div>` : ""}
          ${it.files.map((f, i) => `<div class="panel" data-panel="f${i}"${i ? " hidden" : ""}><div class="code-wrap"><div class="code-file">${esc(f.path)}</div><button class="icon-btn code-copy" data-copy="${esc(f.content)}" aria-label="Copy ${esc(base(f.path))}">${icon.copy}</button><pre class="code"><code>${highlight(f.content.trim())}</code></pre></div></div>`).join("")}
        </div>
      </section>`;
};
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
      ${g.title === "AI Agents" ? aiCategoryBody() : g.title === "CRM" ? crmFeature() + groupedBody(crmSections, "crm", "CRM") : g.title === "Gallery" ? groupedBody(gallerySections, "gal", "Gallery") : g.title === "Design Tools" ? designFeature() + `<div class="cards">${live.map(anyCard).join("")}</div>` : g.title === "Application" ? groupedBody(appSections, "app", "Application") : g.title === "Effects" ? groupedBody(effectSections, "fx", "Effects") : `<div class="cards">${live.map(anyCard).join("")}
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
  const catTitle = g.title === "AI Agents" ? `AI agent UI components — ${live.length} free React & Tailwind interfaces | NiceUI` : g.title === "Gallery" ? `Image gallery & 3D carousel components — ${live.length} free React & Tailwind | NiceUI` : g.title === "CRM" ? `CRM UI components — ${live.length} free React & Tailwind blocks and a full CRM template | NiceUI` : `${g.title} — ${live.length} free React & Tailwind ${g.title.toLowerCase()} | NiceUI`;
  write(g.path.slice(1) + ".html", layout({ title: catTitle, description: g.desc + " Free and open source.", path: g.path, main, ld }));

  live.forEach((it, idx) => {
    if (!it.lib) return;
    const prev = live[idx - 1];
    const next = live[idx + 1];
    const seo = ITEM_SEO[keyOf(it)];
    const itemTags = tagsOf(it);
    // related: nearest neighbours in the same category, then items sharing a topic
    const pool = [...live.slice(Math.max(0, idx - 3), idx), ...live.slice(idx + 1, idx + 4), ...itemTags.flatMap((t) => t.items)];
    const related = [...new Set(pool)].filter((x) => x !== it && x.lib).slice(0, 6);
    const term = seo?.terms?.[0];
    const itemFaq = seo
      ? [
          [`How do I add this ${term} to a React app?`, `Install ${it.name} with the shadcn CLI (npx shadcn@latest add ${site.url}/r/${it.rid}.json) or copy the source from this page. It is plain React and Tailwind CSS, so it works in Next.js, Vite, Remix and Astro.`],
          [`Is this ${term} free to use?`, `Yes. ${it.name} is free and MIT licensed, so you can use it in personal, commercial and client projects.`],
          [`Can I customise the ${term}?`, `Yes. The full source lives in your project after you install it, so you can change colours, timing and markup. It uses Tailwind classes and works in light and dark themes.`],
        ]
      : [];
    const itemMain = `
    <article class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Library</a><span>/</span><a href="${g.path}">${g.title}</a><span>/</span><span aria-current="page">${esc(it.name)}</span></nav>
      <header class="doc-head">
        <h1>${esc(it.name)}${it.badge === "New" ? ' <em class="tag-new big">New</em>' : ""}</h1>
        <p class="lede">${esc(it.description)}</p>${akaLine(seo)}
        <div class="doc-tags"><span>React</span><span>Tailwind CSS</span><span>TypeScript</span><span>${esc(g.title)}</span><span class="t-sky">MIT · Free</span><button class="save-btn" data-save="${it.path}" aria-pressed="false"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg><span>Save</span></button></div>
      </header>
      <div class="pv pv-lib" data-pv>
      <div class="pv-bar"><span class="pv-bar-t">Live preview</span>${it.page ? `<a class="pv-open" href="/preview/${g.slug}/${it.slug}">Open full page <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ""}${pvControls}</div>
      <div class="embed-frame${it.page ? " embed-page" : ""}" data-native="${it.theme}">
        <div class="embed-loading" aria-hidden="true"><img src="${it.thumb}" alt="" /></div>
        <iframe src="${it.embed}" title="${esc(it.name)} live preview" loading="lazy" allow="microphone" data-autosize></iframe>
      </div>
      </div>
      ${libCode(it)}
      ${itemFaq.length ? `<section class="doc-sec"><h2>FAQ</h2><div class="faq-list">${itemFaq.map(([q, a], i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary><h3>${esc(q)}</h3><span class="faq-x" aria-hidden="true"></span></summary><p>${esc(a)}</p></details>`).join("")}</div></section>` : ""}
      ${related.length ? `<section class="doc-sec related"><h2>Related components</h2><div class="cards">${related.map(anyCard).join("")}</div>${itemTags.length ? `<p class="rel-tags">Browse more: ${itemTags.map((t) => `<a href="${t.path}">${esc(t.h1)}</a>`).join("")}</p>` : ""}</section>` : ""}
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
        ...(itemFaq.length ? [{ "@type": "FAQPage", mainEntity: itemFaq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
      ],
    };
    const itemTitle = seo ? `${seo.title} for React & Tailwind | NiceUI` : `${it.name} — Free React & Tailwind ${g.title.replace(/s$/, "")} | NiceUI`;
    const itemDesc = seo ? `Free ${term} for React and Tailwind CSS. ${it.description}` : it.description + " Free, MIT licensed.";
    write(it.path.slice(1) + ".html", layout({ title: itemTitle, description: itemDesc, path: it.path, main: itemMain, ld: itemLd, image: existsSync("assets/thumbs/" + it.sec + "--" + it.slug + ".webp") ? it.thumb : undefined }));
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
  // Changelog + saved items
  const CHANGES = [
    ["2026-10-30", "Application, Charts and E-commerce", "Sign-in and account screens, settings, onboarding, notifications, data tables and forms; hand-built SVG charts; product, cart, checkout and review components."],
    ["2026-10-30", "Full source and one-command install everywhere", "Every library page now shows its complete source and a shadcn install command, with a shared NiceUI theme item."],
    ["2026-10-30", "New templates and effects", "Portfolio, Blog, Store and Docs templates; shiny, rainbow, magnetic and ripple buttons, spotlight cards and more backgrounds."],
    ["2026-10-30", "Effects and Gallery", "Animated backgrounds and text effects, plus 15 image galleries and 3D carousels."],
    ["2026-10-30", "Full-page previews and light theme", "Every template opens in its own full-page preview; the whole site and every component can be viewed in white."],
    ["2026-10-30", "CRM", "15 CRM components and a complete CRM app template."],
    ["2026-10-29", "AI Agents: 46 components", "25 new agent interfaces, grouped into six sections."],
    ["2026-10-29", "AI video editor landing page", "A white editorial landing page with a working editor in the hero."],
    ["2026-10-29", "Marketing sections", "24 heroes, feature grids, testimonials, pricing, FAQ, CTAs and footers."],
  ];
  write(
    "changelog.html",
    layout({
      title: "Changelog — NiceUI",
      description: "What's new in NiceUI: new components, categories and templates.",
      path: "/changelog",
      ld: { "@context": "https://schema.org", "@graph": [org, website] },
      main: `
    <article class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Library</a><span>/</span><span aria-current="page">Changelog</span></nav>
      <header class="doc-head"><h1>Changelog</h1><p class="lede">New components, categories and templates, newest first.</p></header>
      <ol class="changes">${CHANGES.map(([d, t, b]) => `<li><time datetime="${d}">${new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time><div><h2>${esc(t)}</h2><p class="mute">${esc(b)}</p></div></li>`).join("")}</ol>
    </article>`,
    })
  );
  write(
    "saved.html",
    layout({
      title: "Saved — NiceUI",
      description: "Components and templates you saved on this device.",
      path: "/saved",
      ld: { "@context": "https://schema.org", "@graph": [org, website] },
      main: `
    <article class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Library</a><span>/</span><span aria-current="page">Saved</span></nav>
      <header class="doc-head"><h1>Saved</h1><p class="lede">Items you saved with the Save button. They live in this browser only.</p></header>
      <ul class="saved-list" data-saved-list></ul>
      <p class="mute saved-empty" data-saved-empty hidden>Nothing saved yet. Open any component and press <b>Save</b>.</p>
    </article>`,
    })
  );

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

// ─── full-page previews for landing pages, dashboards and templates ──
for (const g of navGroups)
  for (const it of g.list.filter((i) => i.lib && i.page)) {
    write(
      `preview/${g.slug}/${it.slug}.html`,
      `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<script>try{if(localStorage.getItem("niceui-theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}</script>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(it.name)} — full preview | NiceUI</title>
<meta name="description" content="${esc(it.description)}" />
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="${site.url}${it.path}" />
<meta name="theme-color" content="#000000" />
<meta name="color-scheme" content="dark light" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" />
<link rel="stylesheet" href="${CSS}" />
<script defer data-site="truvwhp1" data-domain="niceui.dev" src="https://piqo.app/piqo.js"></script>
</head>
<body class="fp-body">
<div class="fp" data-pv>
  <header class="fp-bar">
    <a class="fp-back" href="${it.path}" aria-label="Back to ${esc(it.name)}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg><span>Back</span></a>
    <span class="fp-sep"></span>
    <span class="fp-name">${esc(it.name)}</span>
    <span class="fp-cat">${esc(g.title)}</span>
    ${pvControls}
    <a class="fp-raw top-icon" href="${it.full}" target="_blank" rel="noopener" aria-label="Open without the toolbar" title="Open without the toolbar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 4h6v6M20 4l-8 8M10 5H5v14h14v-5"/></svg></a>
  </header>
  <main class="fp-stage" data-native="${it.theme}">
    <iframe src="${it.full}" allow="microphone" title="${esc(it.name)} full preview"></iframe>
  </main>
</div>
<script src="${JS}" defer></script>
</body>
</html>
`
    );
  }

// ─── shadcn registry items for every library entry ───────────────────
const tailwindTheme = (await import("../tailwind.config.js")).default.theme;
write(
  "r/niceui-base.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "niceui-base",
      type: "registry:lib",
      title: "NiceUI base",
      description: "The cn() helper and the NiceUI Tailwind theme (ink and brand colours, shadows, keyframes) that every NiceUI library component uses.",
      tailwind: { config: { theme: tailwindTheme } },
      files: [{ path: "lib/cn.ts", type: "registry:lib", target: "lib/cn.ts", content: readFileSync("../src/lib/cn.ts", "utf8") }],
    },
    null,
    2
  )
);
for (const g of navGroups)
  for (const it of g.list.filter((i) => i.lib && i.files?.length))
    write(
      `r/${it.rid}.json`,
      JSON.stringify(
        {
          $schema: "https://ui.shadcn.com/schema/registry-item.json",
          name: it.rid,
          type: it.files.length > 1 ? "registry:block" : "registry:component",
          title: it.name,
          description: it.description,
          dependencies: extDeps(it.files),
          registryDependencies: [site.url + "/r/niceui-base.json"],
          files: it.files.map((f, i) => ({ path: f.path, type: "registry:component", target: f.path, content: i === 0 && /\.(tsx?|jsx?)$/.test(f.path) ? `// ${it.name} from NiceUI (MIT): ${site.url}${it.path}\n` + f.content : f.content })),
        },
        null,
        2
      )
    );

// ─── /browse: every live item on one page, filterable ───────────────
{
  const seen = new Set();
  const groups = navGroups.filter((g) => g.list.some((i) => i.status === "ready"));
  const items = [];
  for (const g of groups)
    for (const it of g.list)
      if (it.status === "ready" && it.path && !seen.has(it.path)) {
        seen.add(it.path);
        items.push({ it, g });
      }
  const cardHtml = items
    .map(({ it, g }, i) => {
      const hay = `${it.name} ${it.category || ""} ${g.title} ${(it.description || "").slice(0, 140)}`.toLowerCase().replace(/"/g, "");
      return anyCard(it).replace(/^\s*<(?:div|a) /, (m) => `${m}data-br data-g="${g.slug}" data-i="${i}" data-n="${esc(it.name.toLowerCase())}" data-new="${it.badge === "New" ? 1 : 0}" data-h="${esc(hay)}" `);
    })
    .join("");
  const chip = (slug, label, n, on) => `<button class="br-chip${on ? " on" : ""}" data-br-cat="${slug}" aria-pressed="${on}">${label}<span>${n}</span></button>`;
  const main = `
    <section class="doc br-page">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">All components</span></nav>
      <header class="doc-head br-head">
        <h1>All components</h1>
        <p class="lede">Every live NiceUI component, block, template and landing page in one place: ${items.length} of them, free and open source. Search, filter by category, or sort by what's new.</p>
      </header>
      <div class="br-bar" data-br-bar>
        <label class="br-search">${icon.search}<input type="search" data-br-q placeholder="Filter ${items.length} items…" aria-label="Filter components" autocomplete="off" /></label>
        <div class="br-sort" role="group" aria-label="Sort">
          <button class="on" data-br-sort="cat" aria-pressed="true">Category</button><button data-br-sort="new" aria-pressed="false">New</button><button data-br-sort="az" aria-pressed="false">A–Z</button>
        </div>
      </div>
      <div class="br-chips" role="group" aria-label="Category">${chip("all", "All", items.length, true)}${groups.map((g) => chip(g.slug, g.title, items.filter((x) => x.g === g).length, false)).join("")}</div>
      <div class="br-pop"><span>Popular:</span>${popularLinks()}</div>
      <p class="br-count" data-br-count aria-live="polite">${items.length} items</p>
      <div class="cards br-grid" data-br-grid>${cardHtml}
      </div>
      <div class="br-empty" data-br-empty hidden><p>Nothing matches <b data-br-term></b>.</p><button class="btn btn-cmd" data-br-reset>Clear filters</button></div>
    </section>`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      {
        "@type": "CollectionPage",
        name: "All components — NiceUI",
        url: site.url + "/browse",
        description: "Every free React and Tailwind component, block and template in NiceUI.",
        mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.map(({ it }, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: site.url + it.path })) },
      },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site.url }, { "@type": "ListItem", position: 2, name: "All components", item: site.url + "/browse" }] },
    ],
  };
  write(
    "browse.html",
    layout({
      title: `All components — ${items.length} free React & Tailwind components, blocks and templates | NiceUI`,
      description: `Browse all ${items.length} free NiceUI components, AI agent interfaces, blocks, landing pages and templates. Search, filter by category and copy the source.`,
      path: "/browse",
      main,
      ld,
    })
  );
}

// ─── topic pages (/s/…), guides (/guides/…) and comparisons (/compare/…) ─
const faqBlock = (list) =>
  list.length
    ? `<section class="doc-sec"><h2>FAQ</h2><div class="faq-list">${list.map(([q, a], i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary><h3>${esc(q)}</h3><span class="faq-x" aria-hidden="true"></span></summary><p>${esc(a)}</p></details>`).join("")}</div></section>`
    : "";
const faqLd = (list) => (list.length ? [{ "@type": "FAQPage", mainEntity: list.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []);
const crumbsLd = (trail) => ({ "@type": "BreadcrumbList", itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: site.url + path })) });

/* Turn guide body placeholders into components, topic links and code blocks. */
const renderBody = (html) =>
  html
    .replace(/\{\{cards:([^}]+)\}\}/g, (_, keys) => {
      const list = keys.split(",").map((k) => byKey.get(k.trim())).filter(Boolean);
      return list.length ? `<div class="cards g-cards">${list.map(anyCard).join("")}</div>` : "";
    })
    .replace(/\{\{tags:([^}]+)\}\}/g, (_, slugs) => `<nav class="pop-links">${slugs.split(",").map((s) => tagBySlug.get(s.trim())).filter(Boolean).map((t) => `<a href="${t.path}">${esc(t.h1)}</a>`).join("")}</nav>`)
    .replace(/\{\{code:(\w+)\}\}([\s\S]*?)\{\{\/code\}\}/g, (_, lang, code) => `<div class="code-wrap g-code"><span class="g-lang">${lang}</span><button class="icon-btn code-copy" data-copy="${esc(code)}" aria-label="Copy code">${icon.copy}</button><pre class="code"><code>${highlight(code)}</code></pre></div>`);

for (const t of tagPages) {
  const related = tagPages.filter((x) => x !== t && x.items.some((it) => t.items.includes(it))).slice(0, 8);
  const others = related.length >= 4 ? related : [...related, ...POPULAR.map((s) => tagBySlug.get(s)).filter((x) => x && x !== t && !related.includes(x))].slice(0, 8);
  const main = `
    <section class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/browse">All components</a><span>/</span><span aria-current="page">${esc(t.h1)}</span></nav>
      <header class="doc-head">
        <h1>${esc(t.h1)}</h1>
        <p class="lede">${esc(t.intro)}</p>
        <p class="tag-meta">${t.items.length} free components · React + Tailwind CSS · MIT licensed</p>
      </header>
      <div class="cards">${t.items.map(anyCard).join("")}</div>
      ${faqBlock(t.faq || [])}
      <section class="doc-sec"><h2>Related topics</h2><nav class="pop-links">${others.map((x) => `<a href="${x.path}">${esc(x.h1)}</a>`).join("")}<a href="/browse">All components</a></nav></section>
    </section>`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      { "@type": "CollectionPage", name: t.h1, url: site.url + t.path, description: t.intro, mainEntity: { "@type": "ItemList", numberOfItems: t.items.length, itemListElement: t.items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: site.url + it.path })) } },
      crumbsLd([["Home", "/"], ["All components", "/browse"], [t.h1, t.path]]),
      ...faqLd(t.faq || []),
    ],
  };
  const first = t.items.find((it) => it.lib && existsSync("assets/thumbs/" + it.sec + "--" + it.slug + ".webp"));
  write(t.path.slice(1) + ".html", layout({ title: `${t.title} | NiceUI`, description: t.intro.slice(0, 158).replace(/\s\S*$/, "") + "…", path: t.path, main, ld, image: first?.thumb }));
}

const articles = [...GUIDES.map((a) => ({ ...a, kind: "guides" })), ...COMPARE.map((a) => ({ ...a, kind: "compare" }))];
for (const a of articles) {
  a.path = `/${a.kind}/${a.slug}`;
  const others = articles.filter((x) => x !== a).slice(0, 4);
  const main = `
    <article class="doc guide">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/guides">Guides</a><span>/</span><span aria-current="page">${esc(a.h1)}</span></nav>
      <header class="doc-head">
        <h1>${esc(a.h1)}</h1>
        <p class="lede">${esc(a.lede)}</p>
        ${a.updated ? `<p class="tag-meta">Updated <time datetime="${a.updated}">${new Date(a.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time> · NiceUI</p>` : ""}
      </header>
      <div class="prose">${renderBody(a.body)}</div>
      ${faqBlock(a.faq || [])}
      <section class="doc-sec"><h2>Keep reading</h2><div class="g-more">${others.map((x) => `<a href="/${x.kind}/${x.slug}"><b>${esc(x.h1)}</b><span>${esc(x.description.slice(0, 110))}…</span></a>`).join("")}</div></section>
    </article>`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      { "@type": "Article", headline: a.title, description: a.description, url: site.url + a.path, datePublished: a.updated || today, dateModified: a.updated || today, author: { "@id": site.url + "/#org" }, publisher: { "@id": site.url + "/#org" } },
      crumbsLd([["Home", "/"], ["Guides", "/guides"], [a.h1, a.path]]),
      ...faqLd(a.faq || []),
    ],
  };
  write(a.path.slice(1) + ".html", layout({ title: `${a.title} | NiceUI`, description: a.description, path: a.path, main, ld }));
}
{
  const main = `
    <section class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Guides</span></nav>
      <header class="doc-head"><h1>Guides</h1><p class="lede">Practical guides to building interfaces with React and Tailwind CSS, with live components you can copy.</p></header>
      <div class="g-more g-index">${articles.map((x) => `<a href="${x.path}"><b>${esc(x.h1)}</b><span>${esc(x.description)}</span></a>`).join("")}</div>
      <section class="doc-sec"><h2>Popular topics</h2>${popularLinks()}</section>
    </section>`;
  const ld = { "@context": "https://schema.org", "@graph": [org, website, { "@type": "CollectionPage", name: "NiceUI guides", url: site.url + "/guides" }, crumbsLd([["Home", "/"], ["Guides", "/guides"]])] };
  write("guides.html", layout({ title: "Guides — React & Tailwind UI how-tos | NiceUI", description: "Practical React and Tailwind CSS guides: website animation examples, icon libraries, auto-resizing textareas, loading animations and choosing a React framework.", path: "/guides", main, ld }));
}

// ─── gradients: gallery + generator, family pages, one page per gradient ─
const gradFamily = (id) => FAMILIES.find((f) => f.id === id);
const famPath = (id) => `/gradients/${id}-gradients`;
const gradPath = (g) => `/gradients/${g.slug}`;
const gradCard = (g) => {
  const css = gradientCss(g);
  return `<div class="gr-box"><a class="gr-card" href="${gradPath(g)}"><span class="gr-sw" style="background:${esc(css)}"></span><span class="gr-meta"><b>${esc(g.name)}</b><span class="gr-dots">${gradientColours(g)
    .slice(0, 5)
    .map((c) => `<i style="background:${c}"></i>`)
    .join("")}</span></span></a><button class="gr-copy" data-copy="background: ${esc(css)};" aria-label="Copy ${esc(g.name)} CSS" title="Copy CSS">${icon.copy}</button></div>`;
};
const famChips = (active) => `<nav class="pop-links gr-fams" aria-label="Gradient families"><a href="/gradients"${active ? "" : ' aria-current="page"'}>All gradients</a>${FAMILIES.map((f) => `<a href="${famPath(f.id)}"${active === f.id ? ' aria-current="page"' : ""}>${esc(f.name.replace(/ gradients$/, ""))}</a>`).join("")}</nav>`;
const gmCta = (g) => `<a class="gm-cta" href="/gradient-maker${g ? "#g=" + g.slug : ""}"><span class="gm-cta-sw" style="background:${esc(g ? gradientCss(g) : "linear-gradient(135deg,#0ea5e9,#a78bfa,#34d399)")}"></span><span><b>${g ? "Edit this gradient in the Gradient Maker" : "Open the Gradient Maker"}</b><span>Mesh, conic and animated shader gradients, grain, PNG export and one-click CSS, Tailwind, React or HTML.</span></span>${icon.arrow}</a>`;
const gradGenerator = (seed) => {
  const g = seed || GRADIENTS[0];
  const stops = g.kind === "mesh" ? [[g.base, 0], ...g.blobs.slice(0, 2).map((b, i) => [b[0], 50 + i * 50])] : g.stops;
  return `<section class="gr-gen" data-grad-gen aria-labelledby="gen-h">
        <div class="gr-gen-pv" data-gg-preview style="background:${esc(gradientCss(g))}"></div>
        <div class="gr-gen-ctl">
          <h2 id="gen-h">Gradient generator</h2>
          <div class="gr-row"><span>Type</span><div class="br-sort" role="group" aria-label="Gradient type"><button class="${g.kind !== "radial" ? "on" : ""}" data-gg-kind="linear" aria-pressed="${g.kind !== "radial"}">Linear</button><button class="${g.kind === "radial" ? "on" : ""}" data-gg-kind="radial" aria-pressed="${g.kind === "radial"}">Radial</button></div></div>
          <label class="gr-row"><span>Angle <output data-gg-angle-out>${g.angle ?? 135}°</output></span><input type="range" min="0" max="360" step="5" value="${g.angle ?? 135}" data-gg-angle aria-label="Angle" /></label>
          <div class="gr-row gr-stops" data-gg-stops>${stops.map(([c]) => `<label class="gr-stop"><input type="color" value="${c}" aria-label="Colour stop" /><button type="button" data-gg-del aria-label="Remove colour">×</button></label>`).join("")}<button type="button" class="gr-add" data-gg-add aria-label="Add a colour">+</button></div>
          <button type="button" class="btn btn-cmd" data-gg-random>Random gradient</button>
          <div class="gr-out"><span>CSS</span><code data-gg-css></code><button class="icon-btn" data-gg-copy="css" aria-label="Copy CSS">${icon.copy}</button></div>
          <div class="gr-out"><span>Tailwind</span><code data-gg-tw></code><button class="icon-btn" data-gg-copy="tw" aria-label="Copy Tailwind class">${icon.copy}</button></div>
        </div>
      </section>`;
};
const gradFaq = [
  ["How do I make a gradient in CSS?", "Use the background property with linear-gradient() or radial-gradient(), for example background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%). The angle sets the direction and each colour stop sets where a colour sits."],
  ["How do I use a gradient in Tailwind CSS?", "Use bg-gradient-to-r (or another direction) with from-, via- and to- colours, or paste any CSS gradient as an arbitrary value such as bg-[linear-gradient(135deg,#d4fc79_0%,#96e6a1_100%)]."],
  ["Can I use these gradients commercially?", "Yes. They are free to use in any project, no attribution needed."],
];
{
  const main = `
    <section class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Gradients</span></nav>
      <header class="doc-head"><h1>Gradients</h1><p class="lede">${GRADIENTS.length} free CSS and Tailwind gradients: pastel, green, cream, blue, sunset, dark and mesh. Click any swatch to copy its CSS, open it for Tailwind classes, or make your own below.</p></header>
      ${famChips(null)}
      <div class="gr-grid">${GRADIENTS.map(gradCard).join("")}</div>
      ${gmCta(null)}
      ${faqBlock(gradFaq)}
    </section>`;
  const ld = { "@context": "https://schema.org", "@graph": [org, website, { "@type": "CollectionPage", name: "CSS & Tailwind gradients", url: site.url + "/gradients", mainEntity: { "@type": "ItemList", numberOfItems: GRADIENTS.length, itemListElement: GRADIENTS.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.name + " gradient", url: site.url + gradPath(g) })) } }, crumbsLd([["Home", "/"], ["Gradients", "/gradients"]]), ...faqLd(gradFaq)] };
  write("gradients.html", layout({ title: "Gradients — Free CSS & Tailwind Gradient Gallery and Generator | NiceUI", description: `${GRADIENTS.length} free CSS and Tailwind gradients (pastel, green, cream, blue, sunset, dark and mesh) plus a gradient generator. Copy CSS or Tailwind classes in one click.`, path: "/gradients", main, ld }));
}
for (const f of FAMILIES) {
  const list = GRADIENTS.filter((g) => g.family.includes(f.id));
  const main = `
    <section class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/gradients">Gradients</a><span>/</span><span aria-current="page">${esc(f.name)}</span></nav>
      <header class="doc-head"><h1>${esc(f.name)}</h1><p class="lede">${esc(f.blurb)} ${list.length} free CSS and Tailwind gradients, each one copyable in a click.</p></header>
      ${famChips(f.id)}
      <div class="gr-grid">${list.map(gradCard).join("")}</div>
      ${gmCta(null)}
      ${faqBlock(gradFaq)}
    </section>`;
  const ld = { "@context": "https://schema.org", "@graph": [org, website, { "@type": "CollectionPage", name: f.name, url: site.url + famPath(f.id), description: f.blurb }, crumbsLd([["Home", "/"], ["Gradients", "/gradients"], [f.name, famPath(f.id)]]), ...faqLd(gradFaq)] };
  write(famPath(f.id).slice(1) + ".html", layout({ title: `${f.name} — Free CSS & Tailwind ${f.name} | NiceUI`, description: `${f.blurb} ${list.length} free ${f.name.toLowerCase()} with CSS and Tailwind code.`, path: famPath(f.id), main, ld }));
}
for (const g of GRADIENTS) {
  const css = gradientCss(g);
  const { arb, simple } = gradientTailwind(g);
  const fams = g.family.map(gradFamily).filter(Boolean);
  const related = GRADIENTS.filter((x) => x !== g && x.family.some((f) => g.family.includes(f))).slice(0, 8);
  const colours = gradientColours(g);
  const cssCode = `.${g.slug.replace(/-gradient$/, "")}-bg {\n  background: ${css};\n}`;
  const desc = `${g.name} gradient: a free ${g.kind === "mesh" ? "mesh" : g.kind} CSS gradient using ${colours.slice(0, 4).join(", ")}. Copy the CSS or Tailwind class in one click.`;
  const faq = [
    [`How do I use the ${g.name.toLowerCase()} gradient in CSS?`, `Set background: ${css}; on any element. It works in every modern browser.`],
    [`How do I use the ${g.name.toLowerCase()} gradient in Tailwind?`, simple ? `Use ${simple}, or the exact arbitrary value ${arb}.` : `Use the arbitrary value class ${arb}.`],
  ];
  const main = `
    <article class="doc">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/gradients">Gradients</a><span>/</span><a href="${famPath(fams[0].id)}">${esc(fams[0].name)}</a><span>/</span><span aria-current="page">${esc(g.name)}</span></nav>
      <header class="doc-head"><h1>${esc(g.name)} Gradient</h1><p class="lede">A free ${g.kind === "mesh" ? "multi-colour mesh" : g.kind} gradient you can copy as CSS or Tailwind. ${esc(fams.map((f) => f.blurb).slice(0, 1).join(""))}</p></header>
      <div class="gr-hero" style="background:${esc(css)}" role="img" aria-label="${esc(g.name)} gradient preview"><div class="gr-hero-acts"><a class="btn btn-cmd gr-hero-copy" href="/gradient-maker#g=${g.slug}">Edit in maker</a><button class="btn btn-cmd gr-hero-copy" data-copy="background: ${esc(css)};">${icon.copy} Copy CSS</button></div></div>
      <div class="gr-stops-list">${colours.map((c) => `<button class="gr-hex" data-copy="${c}" title="Copy ${c}"><i style="background:${c}"></i>${c}</button>`).join("")}</div>
      <section class="doc-sec"><h2>CSS</h2><div class="code-wrap"><button class="icon-btn code-copy" data-copy="${esc(cssCode)}" aria-label="Copy CSS">${icon.copy}</button><pre class="code"><code>${esc(cssCode)}</code></pre></div></section>
      <section class="doc-sec"><h2>Tailwind CSS</h2>
        ${simple ? `<p class="mute">With Tailwind's gradient utilities:</p><div class="cmdline"><code>${esc(simple)}</code><button class="icon-btn" data-copy="${esc(simple)}" aria-label="Copy Tailwind classes">${icon.copy}</button></div><p class="mute" style="margin-top:14px">Or the exact gradient as an arbitrary value:</p>` : ""}
        <div class="cmdline"><code>${esc(arb)}</code><button class="icon-btn" data-copy="${esc(arb)}" aria-label="Copy Tailwind arbitrary class">${icon.copy}</button></div>
      </section>
      ${gmCta(g)}
      ${faqBlock(faq)}
      <section class="doc-sec"><h2>Similar gradients</h2><div class="gr-grid">${related.map(gradCard).join("")}</div><p class="rel-tags">More: ${fams.map((f) => `<a href="${famPath(f.id)}">${esc(f.name)}</a>`).join("")}<a href="/gradients">All gradients</a></p></section>
    </article>`;
  const ld = { "@context": "https://schema.org", "@graph": [org, website, { "@type": "CreativeWork", name: g.name + " gradient", url: site.url + gradPath(g), description: desc, license: "https://opensource.org/licenses/MIT" }, crumbsLd([["Home", "/"], ["Gradients", "/gradients"], [fams[0].name, famPath(fams[0].id)], [g.name, gradPath(g)]]), ...faqLd(faq)] };
  write(gradPath(g).slice(1) + ".html", layout({ title: `${g.name} Gradient — CSS & Tailwind Code | NiceUI`, description: desc, path: gradPath(g), main, ld }));
}

// ─── /gradient-maker: the full gradient + shader app ─────────────────
{
  const GM_JS = hashed("gradient-maker.js");
  const rng = (attr, label, min, max, step, val, fmt) => `<label class="gm-rng"><span>${label}<output ${attr}-out>${fmt}</output></span><input type="range" ${attr} min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
  // the gradient library, so /gradients pages can open in the maker via #g=<slug>
  const lib = Object.fromEntries(
    GRADIENTS.map((g) => {
      const cols = g.kind === "mesh" ? g.blobs.map(([c, x, y], i, a) => ({ c, p: Math.round((i / (a.length - 1)) * 100), x, y })) : g.stops.map(([c, p], i) => ({ c, p, x: [18, 82, 30, 85, 55][i % 5], y: [22, 18, 82, 80, 50][i % 5] }));
      return [g.slug, { mode: g.kind === "mesh" ? "mesh" : g.kind, colors: cols, ...(g.kind === "mesh" ? { base: g.base } : {}), ...(g.kind === "linear" ? { angle: g.angle } : {}), ...(g.kind === "radial" ? { cx: 50, cy: 30 } : {}), grain: 0 }];
    })
  );
  const main = `
    <section class="doc gm-page">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/gradients">Gradients</a><span>/</span><span aria-current="page">Gradient Maker</span></nav>
      <header class="doc-head gm-head"><h1>Gradient Maker</h1><p class="lede">Design linear, radial, conic, mesh and animated shader gradients. Drag the colours, add grain, then copy dependency-free CSS, Tailwind, React or HTML in one click.</p></header>
      <div class="gm" data-gm>
        <div class="gm-main">
          <div class="gm-stage" data-gm-stage>
            <div class="gm-css" data-gm-css></div>
            <canvas class="gm-canvas" data-gm-canvas hidden></canvas>
            <div class="gm-handles" data-gm-handles></div>
            <div class="gm-stage-bar">
              <div class="gm-modes" role="group" aria-label="Gradient type">${["linear", "radial", "conic", "mesh", "shader"].map((m) => `<button type="button" data-gm-mode="${m}" aria-pressed="false">${m[0].toUpperCase() + m.slice(1)}</button>`).join("")}</div>
            </div>
          </div>
          <div class="gm-bar-wrap">
            <div class="gm-bar" data-gm-bar title="Click to add a colour"><div class="gm-stops" data-gm-stops></div></div>
            <p class="gm-hint">Click the bar to add a colour · drag a stop to move it · Delete removes it${""}</p>
          </div>
          <div class="gm-edit">
            <div class="gm-swatches" data-gm-swatches></div>
            <label class="gm-picker"><input type="color" data-gm-pick aria-label="Selected colour" /></label>
            <label class="gm-field"><span>Hex</span><input data-gm-hex maxlength="7" spellcheck="false" aria-label="Hex colour" /></label>
            <label class="gm-field gm-field-s"><span>Stop</span><input type="number" min="0" max="100" data-gm-pos aria-label="Stop position in percent" /></label>
            <button type="button" class="gm-del" data-gm-del aria-label="Remove selected colour">Remove</button>
          </div>
        </div>

        <aside class="gm-side" aria-label="Controls">
          <section class="gm-card">
            <h2>Shape</h2>
            <div data-gm-show="linear">${rng("data-gm-angle", "Angle", 0, 360, 1, 135, "135°")}</div>
            <div data-gm-show="radial" class="gm-seg" role="group" aria-label="Radial shape"><button type="button" data-gm-shape="circle">Circle</button><button type="button" data-gm-shape="ellipse">Ellipse</button></div>
            <div data-gm-show="conic">${rng("data-gm-conic", "Rotation", 0, 360, 1, 0, "0°")}</div>
            <p data-gm-show="radial conic" class="gm-tip">Drag the white handle on the preview to move the centre.</p>
            <div data-gm-show="mesh">
              ${rng("data-gm-spread", "Softness", 25, 90, 1, 55, "55%")}
              <label class="gm-row"><span>Base colour</span><input type="color" data-gm-base aria-label="Mesh base colour" /></label>
              <p class="gm-tip">Drag the colour dots on the preview to shape the mesh.</p>
            </div>
            <div data-gm-show="shader">
              <div class="gm-seg gm-seg4" role="group" aria-label="Shader style">${["flow", "waves", "aurora", "plasma"].map((k) => `<button type="button" data-gm-kind="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join("")}</div>
              ${rng("data-gm-speed", "Speed", 0, 150, 1, 35, "0.35")}
              ${rng("data-gm-scale", "Scale", 40, 400, 1, 140, "1.40")}
              ${rng("data-gm-warp", "Warp", 0, 150, 1, 60, "0.60")}
              <button type="button" class="gm-ghost" data-gm-play>Pause</button>
            </div>
            ${rng("data-gm-grain", "Grain", 0, 40, 1, 12, "12%")}
          </section>

          <section class="gm-card">
            <h2>Colours</h2>
            <div class="gm-harm">${["random", "pastel", "vivid", "neon", "dark", "analogous", "complementary", "earthy"].map((h) => `<button type="button" data-gm-harmony="${h}">${h[0].toUpperCase() + h.slice(1)}</button>`).join("")}</div>
          </section>

          <section class="gm-card gm-export">
            <div class="gm-tabs" role="tablist" aria-label="Export format">${[["css", "CSS"], ["tailwind", "Tailwind"], ["react", "React"], ["html", "HTML"]].map(([k, l], i) => `<button type="button" role="tab" data-gm-tab="${k}" aria-selected="${i === 0}">${l}</button>`).join("")}</div>
            <pre class="gm-code"><code data-gm-out></code></pre>
            <div class="gm-actions">
              <button type="button" class="btn btn-sky" data-gm-copy>${icon.copy} Copy code</button>
              <button type="button" class="btn btn-cmd" data-gm-png>PNG</button>
              <button type="button" class="btn btn-cmd" data-gm-share>Share</button>
            </div>
            <p class="gm-note">Every export is dependency-free: plain CSS, a Tailwind class, or a self-contained React / HTML snippet (shaders use raw WebGL).</p>
          </section>
        </aside>

        <section class="gm-presets-wrap" aria-labelledby="gm-presets-h">
          <div class="gm-presets-head"><h2 id="gm-presets-h">Presets</h2><button type="button" class="gm-ghost" data-gm-reset>Reset</button></div>
          <div class="gm-presets" data-gm-presets></div>
        </section>
      </div>
      ${faqBlock([
        ["What is a mesh gradient?", "A mesh gradient blends several colours from different points instead of along one line. In CSS it is made by layering radial gradients over a base colour, which is exactly what the Mesh mode exports."],
        ["How do shader gradients work?", "Shader mode draws the gradient on the GPU with a small WebGL fragment shader, so it can animate smoothly. The React and HTML exports include that shader inline, with no libraries, and stop animating for people who prefer reduced motion."],
        ["Do I need any package to use the exported code?", "No. CSS and Tailwind exports are plain values, and the React and HTML exports are self-contained. Nothing to install."],
        ["Can I add grain to a CSS gradient?", "Yes. The Grain slider layers a tiny inline SVG noise texture on top of the gradient, still as a single CSS background."],
      ])}
      <section class="doc-sec"><h2>Ready-made gradients</h2><p class="mute">Prefer to start from a finished one? Browse <a class="ul" href="/gradients">${GRADIENTS.length} free gradients</a>; each opens in the maker.</p></section>
    </section>
    <script type="application/json" id="gm-library">${json(lib)}</script>
    <script src="${GM_JS}" defer></script>`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      website,
      { "@type": "WebApplication", name: "NiceUI Gradient Maker", url: site.url + "/gradient-maker", applicationCategory: "DesignApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Free gradient maker for linear, radial, conic, mesh and animated WebGL shader gradients with one-click CSS, Tailwind, React and HTML export." },
      crumbsLd([["Home", "/"], ["Gradients", "/gradients"], ["Gradient Maker", "/gradient-maker"]]),
    ],
  };
  write("gradient-maker.html", layout({ title: "Gradient Maker — Mesh, Conic & Shader Gradient Generator (CSS, Tailwind, React) | NiceUI", description: "Free gradient maker: design linear, radial, conic, mesh and animated shader gradients with grain, then copy dependency-free CSS, Tailwind, React or HTML in one click.", path: "/gradient-maker", main, ld }));
}

write(INDEXNOW_KEY + ".txt", INDEXNOW_KEY);

// ─── registry index, llms, sitemap, robots, manifest ────────────────
write(
  "r/registry.json",
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "niceui",
      homepage: site.url,
      items: [...readyOrder.map((it) => ({
        name: it.slug,
        type: it.kind === "block" ? "registry:block" : "registry:ui",
        title: it.name,
        description: it.description,
        files: [{ path: (it.kind === "block" ? "registry/blocks/" : "registry/ui/") + it.file, type: it.kind === "block" ? "registry:component" : "registry:ui" }],
      })),
      ...navGroups.flatMap((g) => g.list.filter((i) => i.lib && i.files?.length)).map((it) => ({
        name: it.rid,
        type: it.files.length > 1 ? "registry:block" : "registry:component",
        title: it.name,
        description: it.description,
        files: it.files.map((f) => ({ path: f.path, type: "registry:component" })),
      }))],
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
- [All components](${site.url}/browse): Every live item on one page, filterable.

## Topics

${tagPages.map((t) => `- [${t.h1}](${site.url}${t.path}): ${t.intro.split(". ")[0]}.`).join("\n")}

## Gradients

- [Gradient Maker](${site.url}/gradient-maker): Make linear, radial, conic, mesh and animated WebGL shader gradients; copy dependency-free CSS, Tailwind, React or HTML.
- [Gradient gallery](${site.url}/gradients): ${GRADIENTS.length} free CSS and Tailwind gradients.
${FAMILIES.map((f) => `- [${f.name}](${site.url}/gradients/${f.id}-gradients): ${f.blurb}`).join("\n")}

## Guides

${articles.map((a) => `- [${a.h1}](${site.url}${a.path}): ${a.description}`).join("\n")}

## AI agent UI

${aiSections.map((sub) => `### ${sub.title}\n\n${sub.items.map((i) => `- [${i.name}](${site.url}${i.path}): ${i.description}`).join("\n")}`).join("\n\n")}

## CRM UI

${crmTemplate() ? `- [CRM App template](${site.url}${crmTemplate().path}): ${crmTemplate().description}\n` : ""}${crmSections.map((sub) => `\n### ${sub.title}\n\n${sub.items.map((i) => `- [${i.name}](${site.url}${i.path}): ${i.description}`).join("\n")}`).join("\n")}

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
  { loc: site.url + "/browse", priority: "0.9", freq: "weekly" },
  { loc: site.url + "/guides", priority: "0.7", freq: "weekly" },
  { loc: site.url + "/gradients", priority: "0.8", freq: "weekly" },
  { loc: site.url + "/gradient-maker", priority: "0.9", freq: "monthly" },
  ...FAMILIES.map((f) => ({ loc: site.url + "/gradients/" + f.id + "-gradients", priority: "0.7", freq: "monthly" })),
  ...GRADIENTS.map((g) => ({ loc: site.url + "/gradients/" + g.slug, priority: "0.6", freq: "monthly" })),
  ...tagPages.map((t) => ({ loc: site.url + t.path, priority: "0.9", freq: "weekly" })),
  ...articles.map((a) => ({ loc: site.url + a.path, priority: "0.8", freq: "monthly" })),
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
console.log(`pure: ${pureStats.single} single-file, ${pureStats.multi} multi-file copies`);
