// Render one NiceUI app module (site/apps/<slug>.mjs) as a standalone page for
// testing, without running the whole site build.
//   node scripts/app-preview.mjs <slug> <outDir>
// Then serve <outDir> with any static server and open /index.html.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [slug, out] = process.argv.slice(2);
if (!slug || !out) throw new Error("usage: node scripts/app-preview.mjs <slug> <outDir>");
const app = (await import(join(ROOT, "site/apps", slug + ".mjs") + "?t=" + Date.now())).default;
mkdirSync(out, { recursive: true });
const icon = {
  copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
};
copyFileSync(join(ROOT, "site/assets/styles.css"), join(out, "styles.css"));
for (const ext of ["js", "css"]) if (existsSync(join(ROOT, `site/assets/${slug}.${ext}`))) copyFileSync(join(ROOT, `site/assets/${slug}.${ext}`), join(out, `${slug}.${ext}`));
for (const f of app.files ? app.files() : []) {
  mkdirSync(dirname(join(out, f.path)), { recursive: true });
  writeFileSync(join(out, f.path), f.content);
}
writeFileSync(
  join(out, "index.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${app.name} preview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" />
<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="${slug}.css"></head>
<body class="app-shell"><header class="ap-bar"><span class="ap-title">${app.name}</span></header>
<main id="main" class="ap-main">${app.body({ icon })}</main>
<div class="toast" data-toast role="status" aria-live="polite"></div>
<script src="${slug}.js" defer></script></body></html>`
);
console.log("preview written to", join(out, "index.html"));
