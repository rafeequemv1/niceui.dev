// Bento Grid Builder: draw a bento layout on a grid, fill the cells, then copy
// Tailwind, React or plain HTML + CSS. The site build turns this into /apps/bento-grid-builder.

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-bg-out="${key}">${fmt}</output></span><input type="range" data-bg-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (key, items, label) =>
  `<div class="gm-seg bg-seg" role="group" aria-label="${label}" style="grid-template-columns:repeat(${items.length},1fr)">${items.map(([v, l]) => `<button type="button" data-bg-set="${key}" data-bg-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

export default {
  slug: "bento-grid-builder",
  name: "Bento Grid Builder",
  blurb: "Draw a bento grid layout by dragging on a grid, fill each cell with stats, charts, icons or images, then copy responsive Tailwind, React or plain HTML + CSS in one click.",
  chips: ["Drag to draw", "10 layouts", "Responsive", "Tailwind & React"],
  preview: `background:#05060a;background-image:linear-gradient(135deg,rgba(56,189,248,.32),rgba(99,102,241,.18)),linear-gradient(rgba(255,255,255,.08),rgba(255,255,255,.08)),linear-gradient(rgba(255,255,255,.06),rgba(255,255,255,.06)),linear-gradient(rgba(255,255,255,.06),rgba(255,255,255,.06));background-size:46% 58%,24% 27%,24% 27%,70% 30%;background-position:8% 12%,62% 12%,90% 12%,8% 86%;background-repeat:no-repeat`,
  title: "Bento Grid Generator — Build Bento Layouts for Tailwind & React | NiceUI",
  description: "Free bento grid generator: draw a bento box layout, resize and move cells, add stats, charts and images, then copy responsive Tailwind CSS, React or plain CSS grid code.",
  about: `<p class="lede">Bento Grid Builder is a visual editor for bento layouts, the tiled grids used on product, feature and portfolio pages. Drag on the grid to draw a cell, drag it to move, pull the corner to resize, and pick what each tile shows: a headline, a big stat, a chart, an icon, an image or a call to action.</p>
  <p class="mute">Exports reproduce the layout exactly with explicit grid placement, and stack to one or two columns on phones. Tailwind, a typed React component and plain HTML + CSS are all dependency-free.</p>`,
  faq: [
    ["What is a bento grid?", "A bento grid is a layout of rectangular tiles of different sizes that fit together like a bento box. It is popular for feature sections, product pages, dashboards and portfolios because each tile can highlight one idea."],
    ["How do I make a bento grid in Tailwind CSS?", "Use a grid container such as grid grid-cols-4 auto-rows-[140px] gap-3, then give each tile a span, for example col-span-2 row-span-2. Bento Grid Builder writes these classes for you, including md: prefixes so the grid stacks on mobile."],
    ["Will the layout be responsive?", "Yes. On screens narrower than 768 px the tiles stack into one or two columns (your choice), in reading order. From 768 px up they use the exact layout you drew."],
    ["Can I use the code in React or plain HTML?", "Yes. The React tab gives a typed component using Tailwind classes, and the HTML + CSS tab gives standalone markup with a small CSS grid stylesheet, with no framework at all."],
  ],
  body: ({ icon }) => `
    <div class="bg" data-bg>
      <div class="bg-main">
        <div class="bg-stage" data-bg-stage>
          <div class="bg-scroll" data-bg-scroll>
            <div class="bg-frame" data-bg-frame>
              <div class="bg-canvas">
                <div class="bx-slots" data-bg-slots aria-hidden="true"></div>
                <div class="bx" data-bg-grid></div>
              </div>
            </div>
          </div>
          <div class="bg-stage-bar">
            ${seg("view", [["desktop", "Desktop"], ["mobile", "Mobile"]], "Preview size")}
            <button type="button" class="bg-tool" data-bg-undo aria-label="Undo" title="Undo (⌘Z)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg></button>
            <button type="button" class="bg-tool" data-bg-redo aria-label="Redo" title="Redo (⌘⇧Z)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/></svg></button>
            <button type="button" class="bg-chip" data-bg-random>Randomize</button>
          </div>
          <span class="bg-hint" data-bg-hint>Drag on empty space to draw a cell</span>
        </div>
      </div>

      <aside class="bg-side" aria-label="Controls">
        <div class="bg-scroll-side">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Layouts</h2><button type="button" class="gm-ghost" data-bg-clear>Clear</button></div>
            <div class="bg-presets" data-bg-presets></div>
          </section>
          <section class="gm-card" data-bg-cellcard>
            <div class="gm-presets-head"><h2>Cell</h2><span class="bg-pos" data-bg-pos></span></div>
            <div data-bg-cellbody></div>
          </section>
          <section class="gm-card">
            <h2>Grid</h2>
            ${rng("cols", "Columns", 2, 8, 1, 4, "4")}
            ${rng("rowH", "Row height", 60, 260, 2, 140, "140px")}
            ${rng("gap", "Gap", 0, 32, 1, 12, "12px")}
            ${rng("radius", "Corner radius", 0, 40, 1, 20, "20px")}
            ${seg("theme", [["dark", "Dark"], ["light", "Light"]], "Theme")}
            <label class="gm-row"><span>Accent</span><input type="color" data-bg-in="accent" aria-label="Accent colour" /></label>
          </section>
          <section class="gm-card">
            <h2>On phones</h2>
            ${seg("mobile", [["1", "1 column"], ["2", "2 columns"]], "Mobile columns")}
            <p class="gm-tip">Below 768 px the cells stack in reading order. Use the Mobile preview to check it.</p>
          </section>
        </div>
        <section class="bg-export">
          <div class="gm-tabs" role="tablist" aria-label="Export format">${[["tailwind", "Tailwind"], ["react", "React"], ["html", "HTML + CSS"]].map(([k, l], i) => `<button type="button" role="tab" data-bg-tab="${k}" aria-selected="${i === 0}">${l}</button>`).join("")}</div>
          <pre class="gm-code"><code data-bg-code></code></pre>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-bg-copy>${icon.copy} Copy code</button>
            <button type="button" class="btn btn-cmd" data-bg-dl>.html</button>
            <button type="button" class="btn btn-cmd" data-bg-share>Share</button>
          </div>
          <p class="gm-note">Dependency-free. Explicit grid placement from 768 px up, stacked below.</p>
        </section>
      </aside>
    </div>`,
};
