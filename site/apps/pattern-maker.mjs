// Pattern Maker: tileable SVG background patterns with one-click, dependency-free export.
// The site build turns this into the full-screen page at /apps/pattern-maker.

const TYPES = [
  ["dots", "Dots"],
  ["grid", "Grid"],
  ["graph", "Graph paper"],
  ["diagonal", "Diagonal"],
  ["crosshatch", "Cross-hatch"],
  ["checker", "Checker"],
  ["hexagons", "Hexagons"],
  ["triangles", "Triangles"],
  ["waves", "Waves"],
  ["zigzag", "Zigzag"],
  ["plus", "Plus"],
  ["rings", "Rings"],
  ["cubes", "Isometric"],
  ["topo", "Topographic"],
  ["noise", "Grain"],
];

const rng = (attr, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-pm-out="${attr}">${fmt}</output></span><input type="range" data-pm-in="${attr}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;

export default {
  slug: "pattern-maker",
  name: "Pattern Maker",
  blurb: "Seamless SVG background patterns (dots, grids, hexagons, waves, topographic lines, grain and more) with fades and one-click CSS, Tailwind, SVG or React export.",
  chips: ["15 patterns", "Fade masks", "SVG & PNG", "No dependencies"],
  preview: `background-color:#020617;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='11' cy='11' r='1.6' fill='%237dd3fc' fill-opacity='.55'/%3E%3C/svg%3E"),radial-gradient(60% 70% at 50% 40%,rgba(14,165,233,.25),transparent 70%);background-size:22px 22px,100% 100%`,
  title: "CSS Background Pattern Generator — SVG Patterns for CSS & Tailwind | NiceUI",
  description: "Free CSS background pattern generator: dots, grids, hexagons, waves, topographic lines and grain as seamless SVG. Copy CSS, Tailwind, SVG or React in one click.",
  about: `<p class="lede">Make seamless background patterns for websites and apps. Pick a pattern, tune the size, stroke, rotation and colours, add a fade, then copy plain CSS, a Tailwind class, the raw SVG tile or a React component. Nothing to install.</p>`,
  faq: [
    ["How do I add a background pattern with CSS?", "Use a small SVG tile as a data URI in background-image and set background-size to the tile size, for example background-image: url(\"data:image/svg+xml,…\"); background-size: 24px 24px. The browser repeats it seamlessly. Pattern Maker writes this for you."],
    ["Can I use these patterns in Tailwind CSS?", "Yes. The Tailwind tab gives arbitrary-value classes such as bg-[url(data:image/svg+xml,…)] and bg-[length:24px_24px]. The SVG is fully URL-encoded so it works inside a class name."],
    ["How do I fade a pattern out at the edges?", "Use a CSS mask, for example mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%). Choose a fade in Pattern Maker and it is included in every export, applied to the pattern layer only so your background colour stays solid."],
    ["Are the patterns free to use?", "Yes. Every pattern you make is free for personal and commercial projects, and the exported code has no dependencies."],
  ],
  body: ({ icon }) => `
    <div class="pm" data-pm>
      <div class="pm-main">
        <div class="pm-stage" data-pm-stage>
          <div class="pm-layer" data-pm-layer></div>
          <div class="pm-card" data-pm-card>
            <span class="pm-card-tag">Background patterns</span>
            <p class="pm-card-h">Texture that stays out of the way.</p>
            <p class="pm-card-p">Seamless SVG tiles, a few hundred bytes each.</p>
            <span class="pm-card-btn">Get started</span>
          </div>
          <div class="pm-stage-bar">
            <label class="pm-toggle"><input type="checkbox" data-pm-show-card checked /> <span>Sample card</span></label>
            <label class="pm-toggle"><input type="checkbox" data-pm-in="anim" /> <span>Slow pan</span></label>
            <button type="button" class="pm-chip" data-pm-random>Random</button>
          </div>
        </div>
        <div class="pm-types" role="radiogroup" aria-label="Pattern" data-pm-types>
          ${TYPES.map(([id, label]) => `<button type="button" role="radio" aria-checked="false" class="pm-type" data-pm-type="${id}"><span class="pm-type-sw" data-pm-sw="${id}"></span><b>${label}</b></button>`).join("")}
        </div>
      </div>

      <aside class="pm-side" aria-label="Controls">
        <div class="pm-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Presets</h2><button type="button" class="gm-ghost" data-pm-reset>Reset</button></div>
            <div class="pm-presets" data-pm-presets></div>
          </section>
          <section class="gm-card">
            <h2>Pattern</h2>
            ${rng("size", "Tile size", 6, 120, 1, 24, "24px")}
            ${rng("stroke", "Stroke / dot", 0.5, 12, 0.5, 1.5, "1.5")}
            ${rng("rot", "Rotation", 0, 180, 1, 0, "0°")}
          </section>
          <section class="gm-card">
            <h2>Colour</h2>
            <label class="gm-row"><span>Foreground</span><input type="color" data-pm-in="fg" aria-label="Foreground colour" /></label>
            ${rng("fgA", "Opacity", 5, 100, 1, 40, "40%")}
            <label class="gm-row" data-pm-two><span>Second colour</span><input type="color" data-pm-in="fg2" aria-label="Second colour" /></label>
            <label class="gm-row"><span>Background</span><span class="pm-bgrow"><label class="pm-toggle pm-toggle-s"><input type="checkbox" data-pm-in="bgOn" /> <span>Fill</span></label><input type="color" data-pm-in="bg" aria-label="Background colour" /></span></label>
          </section>
          <section class="gm-card">
            <h2>Fade</h2>
            <div class="gm-seg pm-seg5" role="group" aria-label="Fade mask">${[
              ["none", "None"],
              ["radial", "Radial"],
              ["top", "Top"],
              ["bottom", "Bottom"],
              ["sides", "Sides"],
            ]
              .map(([id, l]) => `<button type="button" data-pm-mask="${id}" aria-pressed="false">${l}</button>`)
              .join("")}</div>
          </section>
        </div>
        <section class="pm-export">
          <div class="gm-tabs" role="tablist" aria-label="Export format">${[
            ["css", "CSS"],
            ["tailwind", "Tailwind"],
            ["svg", "SVG"],
            ["react", "React"],
          ]
            .map(([k, l], i) => `<button type="button" role="tab" data-pm-tab="${k}" aria-selected="${i === 0}">${l}</button>`)
            .join("")}</div>
          <pre class="gm-code"><code data-pm-code></code></pre>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-pm-copy>${icon.copy} Copy code</button>
            <button type="button" class="btn btn-cmd" data-pm-dl-svg>.svg</button>
            <button type="button" class="btn btn-cmd" data-pm-dl-png>PNG</button>
            <button type="button" class="btn btn-cmd" data-pm-share>Share</button>
          </div>
          <p class="gm-note">Dependency-free: a data-URI SVG tile in plain CSS, Tailwind classes, the raw SVG, or a self-contained React component.</p>
        </section>
      </aside>
    </div>`,
};
