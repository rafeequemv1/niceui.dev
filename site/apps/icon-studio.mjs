// Icon Studio: browse, tune and export every Lucide icon as dependency-free code.
// The parent build turns this module into /apps/icon-studio (full-screen app shell).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const LUCIDE = join(ROOT, "node_modules/lucide-react/dist/esm");

/* Every Lucide icon as [kebab-name, [[tag, attrs], …]], built once at build time. */
function iconData() {
  const index = readFileSync(join(LUCIDE, "lucide-react.js"), "utf8");
  const seen = new Set();
  const out = [];
  for (const m of index.matchAll(/export \{ default as (\w+)[^}]*\} from '\.\/icons\/([\w-]+)\.js';/g)) {
    const file = m[2];
    if (seen.has(file)) continue;
    seen.add(file);
    const src = readFileSync(join(LUCIDE, "icons", file + ".js"), "utf8");
    const arr = src.match(/createLucideIcon\("[^"]+",\s*(\[[\s\S]*?\])\s*\);/);
    if (!arr) continue;
    // trusted package source: a plain array literal of [tag, attrs]
    const node = Function(`return ${arr[1]}`)().map(([t, a]) => {
      const attrs = {};
      for (const [k, v] of Object.entries(a)) if (k !== "key") attrs[k] = v;
      return [t, attrs];
    });
    out.push([file, node]);
  }
  out.sort((a, b) => a[0].localeCompare(b[0]));
  return out;
}

const rng = (attr, label, min, max, step, val, fmt) =>
  `<label class="is-rng"><span>${label}<output data-is-out="${attr}">${fmt}</output></span><input type="range" data-is-${attr} min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;

export default {
  slug: "icon-studio",
  name: "Icon Studio",
  blurb: "Search 1,500+ Lucide icons, tune size, stroke and colour, then copy SVG, React, a data URI or Tailwind class in one click.",
  chips: ["1,500+ icons", "SVG & React", "PNG export", "No dependencies"],
  preview:
    "background:radial-gradient(circle at 30% 30%,rgba(125,211,252,.35),transparent 55%),radial-gradient(circle at 75% 70%,rgba(167,139,250,.28),transparent 55%),#05070a",
  title: "Free SVG Icons for React — Icon Studio: search, customise & copy Lucide icons | NiceUI",
  description: "Search 1,500+ free Lucide icons, change size, stroke and colour, then copy SVG, a React component, data URI or Tailwind class in one click. No icon package.",
  about: `<p>Icon Studio is a fast way to grab clean, consistent icons without installing an icon package. Every icon comes from <a class="ul" href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC licence), the open-source set used by shadcn/ui and most NiceUI components.</p>
<p>Pick an icon, set its size, stroke width and colour, and copy it as raw SVG, a typed React component, a data URI for CSS, or a Tailwind <code>bg-[url(...)]</code> class. Select several icons to copy them as one file of React components.</p>`,
  faq: [
    ["Do I need to install lucide-react to use these icons?", "No. Every export is self-contained: the SVG markup or a small React component with the paths inlined. Nothing to install."],
    ["What licence are the icons under?", "The icons are from Lucide, released under the ISC licence, so you can use them in personal and commercial projects. A credit is appreciated but not required."],
    ["How do I use an SVG icon as a CSS background?", "Copy the data URI and use it as background-image: url(...), or copy the Tailwind class, which wraps the same data URI in bg-[url(...)]."],
    ["Can I change the stroke width of an icon?", "Yes. Use the stroke slider. Turn on absolute stroke to keep lines the same thickness at every size, which is useful for very large or very small icons."],
  ],
  files: () => [{ path: "apps/icon-studio-icons.json", content: JSON.stringify(iconData()) }],
  body: ({ icon }) => `
    <div class="is" data-is>
      <div class="is-main">
        <div class="is-top">
          <label class="is-search">${icon.search}<input type="search" data-is-q placeholder="Search icons…" aria-label="Search icons" autocomplete="off" spellcheck="false" /><kbd>/</kbd></label>
          <span class="is-count" data-is-count aria-live="polite">Loading icons…</span>
        </div>
        <div class="is-cats" data-is-cats role="group" aria-label="Filter by category"></div>
        <div class="is-grid-wrap" data-is-scroll>
          <div class="is-grid" data-is-grid role="listbox" aria-label="Icons" tabindex="0"></div>
          <p class="is-empty" data-is-empty hidden>No icons match. Try a shorter word.</p>
        </div>
        <p class="is-hint">Click an icon to copy its SVG · arrow keys move · Enter copies · Shift-click or Select mode picks several</p>
      </div>
      <aside class="is-side" aria-label="Icon settings">
        <div class="is-scroll">
          <section class="is-card is-hero">
            <div class="is-stage" data-is-stage><div class="is-big" data-is-big></div></div>
            <div class="is-name"><b data-is-name>—</b><span data-is-tagline>Lucide icon</span></div>
          </section>
          <section class="is-card">
            <h2>Style</h2>
            ${rng("size", "Size", 12, 96, 1, 24, "24px")}
            ${rng("stroke", "Stroke", 0.5, 3, 0.25, 2, "2")}
            <label class="is-row"><span>Absolute stroke</span><input type="checkbox" data-is-abs class="is-switch" /></label>
            <div class="is-row"><span>Colour</span><span class="is-colours"><input type="color" data-is-color value="#7dd3fc" aria-label="Icon colour" /><button type="button" data-is-current title="Use currentColor">currentColor</button></span></div>
            <div class="is-row"><span>Preview</span><span class="is-seg" role="group" aria-label="Preview background">${["dark", "light", "brand", "grid"].map((b) => `<button type="button" data-is-bg="${b}">${b[0].toUpperCase() + b.slice(1)}</button>`).join("")}</span></div>
          </section>
          <section class="is-card">
            <div class="is-sel-head"><h2>Selection</h2><label class="is-row is-mini"><span>Select mode</span><input type="checkbox" data-is-multi class="is-switch" /></label></div>
            <div class="is-chips" data-is-sel><p class="is-muted">Shift-click icons (or turn on Select mode) to build a set.</p></div>
            <div class="is-sel-actions"><button type="button" class="is-ghost" data-is-copyset disabled>Copy set as React</button><button type="button" class="is-ghost" data-is-clear disabled>Clear</button></div>
          </section>
          <p class="is-credit">Icons by <a href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> · ISC licence</p>
        </div>
        <section class="is-card is-export">
          <div class="is-tabs" role="tablist" aria-label="Export format">${[["svg", "SVG"], ["react", "React"], ["uri", "Data URI"], ["tw", "Tailwind"], ["html", "HTML"]].map(([k, l], i) => `<button type="button" role="tab" data-is-tab="${k}" aria-selected="${i === 0}">${l}</button>`).join("")}</div>
          <pre class="is-code"><code data-is-code></code></pre>
          <div class="is-actions">
            <button type="button" class="btn btn-sky" data-is-copy>${icon.copy} Copy</button>
            <button type="button" class="btn btn-cmd" data-is-dl="svg">SVG</button>
            <button type="button" class="btn btn-cmd" data-is-dl="png">PNG</button>
            <button type="button" class="btn btn-cmd" data-is-share aria-label="Copy share link">Share</button>
          </div>
        </section>
      </aside>
    </div>`,
};
