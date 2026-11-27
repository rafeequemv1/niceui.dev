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
// ordered-dither and print-style textures, still seamless SVG tiles
const DITHER = [
  ["bayer", "Bayer dither"],
  ["halftone", "Halftone"],
  ["stipple", "Stipple"],
  ["engrave", "Engraving"],
  ["pixels", "Dot matrix"],
  ["shade", "Dither shade"],
];
// animated WebGL backgrounds (raw WebGL, exported as React or HTML)
const SHADERS = [
  ["sh-grain", "Grain gradient"],
  ["sh-dither", "Dither flow"],
  ["sh-halftone", "Halftone wave"],
  ["sh-dots", "Dot ripple"],
  ["sh-warp", "Silk warp"],
  ["sh-blobs", "Metaballs"],
  ["sh-cells", "Voronoi"],
  ["sh-contours", "Contours"],
];
const CATS = [
  ["pattern", "Patterns", TYPES],
  ["dither", "Dither", DITHER],
  ["shader", "Shaders", SHADERS],
];

const rng = (attr, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-pm-out="${attr}">${fmt}</output></span><input type="range" data-pm-in="${attr}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;

export default {
  slug: "pattern-maker",
  name: "Pattern Maker",
  blurb: "Seamless SVG patterns, Bayer and halftone dither textures, and animated WebGL shader backgrounds (grain gradients, dithering, halftone waves, metaballs) with one-click CSS, Tailwind, React or HTML export.",
  chips: ["21 patterns", "Dither", "8 shaders", "No dependencies"],
  preview: `background-color:#020617;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='11' cy='11' r='1.6' fill='%237dd3fc' fill-opacity='.55'/%3E%3C/svg%3E"),radial-gradient(60% 70% at 50% 40%,rgba(14,165,233,.25),transparent 70%);background-size:22px 22px,100% 100%`,
  title: "Background Pattern, Dither & Shader Generator — CSS, Tailwind, React | NiceUI",
  description: "Free background pattern generator: seamless SVG patterns, Bayer and halftone dither textures, and animated WebGL shaders (grain gradient, dithering, metaballs). Copy CSS, Tailwind, React or HTML.",
  about: `<p class="lede">Make background patterns, dither textures and animated shader backgrounds for websites and apps. Pick a pattern, a Bayer or halftone dither, or a WebGL shader, tune the size, colours and motion, add a fade, then copy plain CSS, a Tailwind class, the raw SVG, a React component or an HTML snippet. Nothing to install.</p>`,
  faq: [
    ["How do I add a background pattern with CSS?", "Use a small SVG tile as a data URI in background-image and set background-size to the tile size, for example background-image: url(\"data:image/svg+xml,…\"); background-size: 24px 24px. The browser repeats it seamlessly. Pattern Maker writes this for you."],
    ["Can I use these patterns in Tailwind CSS?", "Yes. The Tailwind tab gives arbitrary-value classes such as bg-[url(data:image/svg+xml,…)] and bg-[length:24px_24px]. The SVG is fully URL-encoded so it works inside a class name."],
    ["How do I fade a pattern out at the edges?", "Use a CSS mask, for example mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%). Choose a fade in Pattern Maker and it is included in every export, applied to the pattern layer only so your background colour stays solid."],
    ["What is a dither pattern?", "Dithering fakes shades with only one or two colours by arranging pixels in a pattern. Ordered (Bayer) dithering uses a fixed threshold grid for the classic retro, 1-bit look; halftone uses dots that grow and shrink like print. Pattern Maker exports both as tiny seamless SVG tiles."],
    ["How do the animated shader backgrounds work?", "Shader mode draws the background on the GPU with a small WebGL fragment shader, so grain gradients, dithering, halftone waves and metaballs animate smoothly at full frame rate. The React and HTML exports include the shader inline with no libraries, and they stop animating for people who prefer reduced motion."],
    ["Are the patterns free to use?", "Yes. Every pattern you make is free for personal and commercial projects, and the exported code has no dependencies."],
  ],
  body: ({ icon }) => `
    <div class="pm" data-pm>
      <div class="pm-main">
        <div class="pm-stage" data-pm-stage>
          <div class="pm-layer" data-pm-layer></div>
          <canvas class="pm-layer pm-canvas" data-pm-canvas hidden></canvas>
          <div class="pm-card" data-pm-card>
            <span class="pm-card-tag">Background patterns</span>
            <p class="pm-card-h">Texture that stays out of the way.</p>
            <p class="pm-card-p">Seamless SVG tiles, a few hundred bytes each.</p>
            <span class="pm-card-btn">Get started</span>
          </div>
          <div class="pm-stage-bar">
            <label class="pm-toggle"><input type="checkbox" data-pm-show-card checked /> <span>Sample card</span></label>
            <label class="pm-toggle" data-pm-pat-only><input type="checkbox" data-pm-in="anim" /> <span>Slow pan</span></label>
            <button type="button" class="pm-toggle" data-pm-play data-pm-sh-only>Pause</button>
            <button type="button" class="pm-chip" data-pm-random>Random</button>
          </div>
        </div>
        <div class="pm-strip">
          <div class="pm-cats" role="group" aria-label="Category">${CATS.map(([c, l, list]) => `<button type="button" data-pm-cat="${c}" aria-pressed="false">${l}<i>${list.length}</i></button>`).join("")}</div>
          <div class="pm-types" role="radiogroup" aria-label="Pattern" data-pm-types>
            ${CATS.map(([c, , list]) => list.map(([id, label]) => `<button type="button" role="radio" aria-checked="false" class="pm-type" data-pm-type="${id}" data-pm-in-cat="${c}"${c === "pattern" ? "" : " hidden"}><span class="pm-type-sw" data-pm-sw="${id}"></span><b>${label}</b></button>`).join("")).join("")}
          </div>
        </div>
      </div>

      <aside class="pm-side" aria-label="Controls">
        <div class="pm-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Presets</h2><button type="button" class="gm-ghost" data-pm-reset>Reset</button></div>
            <div class="pm-presets" data-pm-presets></div>
          </section>
          <section class="gm-card" data-pm-sh-only>
            <h2>Shader</h2>
            ${rng("speed", "Speed", 0, 200, 1, 50, "0.50")}
            ${rng("scale", "Scale", 30, 300, 1, 100, "1.00")}
            ${rng("px", "Pixel / cell size", 2, 16, 1, 4, "4px")}
            ${rng("grain", "Grain", 0, 50, 1, 10, "10%")}
            <label class="gm-row"><span>Ordered dither</span><label class="pm-toggle pm-toggle-s"><input type="checkbox" data-pm-in="dither" /> <span>Bayer 8×8</span></label></label>
          </section>
          <section class="gm-card" data-pm-pat-only>
            <h2>Pattern</h2>
            ${rng("size", "Tile size", 6, 120, 1, 24, "24px")}
            ${rng("stroke", "Stroke / dot", 0.5, 12, 0.5, 1.5, "1.5")}
            ${rng("rot", "Rotation", 0, 180, 1, 0, "0°")}
          </section>
          <section class="gm-card">
            <h2>Colour</h2>
            <label class="gm-row"><span>Foreground</span><input type="color" data-pm-in="fg" aria-label="Foreground colour" /></label>
            <div data-pm-pat-only>${rng("fgA", "Opacity", 5, 100, 1, 40, "40%")}</div>
            <label class="gm-row" data-pm-two><span>Second colour</span><input type="color" data-pm-in="fg2" aria-label="Second colour" /></label>
            <label class="gm-row"><span>Background</span><span class="pm-bgrow"><label class="pm-toggle pm-toggle-s" data-pm-pat-only><input type="checkbox" data-pm-in="bgOn" /> <span>Fill</span></label><input type="color" data-pm-in="bg" aria-label="Background colour" /></span></label>
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
            ["html", "HTML"],
          ]
            .map(([k, l], i) => `<button type="button" role="tab" data-pm-tab="${k}" aria-selected="${i === 0}"${k === "html" ? " hidden" : ""}>${l}</button>`)
            .join("")}</div>
          <pre class="gm-code"><code data-pm-code></code></pre>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-pm-copy>${icon.copy} Copy code</button>
            <button type="button" class="btn btn-cmd" data-pm-dl-svg data-pm-pat-only>.svg</button>
            <button type="button" class="btn btn-cmd" data-pm-dl-png>PNG</button>
            <button type="button" class="btn btn-cmd" data-pm-share>Share</button>
          </div>
          <p class="gm-note">Dependency-free: a data-URI SVG tile in plain CSS, Tailwind classes, the raw SVG or a React component. Shaders export as raw-WebGL React or HTML.</p>
        </section>
      </aside>
    </div>`,
};
