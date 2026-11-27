// Shadow & Glass Maker: layered box shadows, smooth shadows, glassmorphism and
// neumorphism with one-click, dependency-free export.
// The site build turns this into the full-screen page at /apps/shadow-maker.

const rng = (path, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-sh-out="${path}">${fmt}</output></span><input type="range" data-sh-in="${path}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (path, opts, cls = "") =>
  `<div class="gm-seg sh-seg ${cls}" role="group">${opts.map(([v, l]) => `<button type="button" data-sh-set="${path}:${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

export default {
  slug: "shadow-maker",
  name: "Shadow & Glass Maker",
  blurb: "Layered and smooth box shadows, glassmorphism and neumorphism with live controls, then copy CSS, Tailwind or React in one click.",
  chips: ["Smooth shadows", "Glassmorphism", "Neumorphism", "No dependencies"],
  preview: `background:radial-gradient(at 25% 30%,#22d3ee 0px,transparent 50%),radial-gradient(at 80% 25%,#a78bfa 0px,transparent 50%),radial-gradient(at 60% 85%,#f472b6 0px,transparent 50%),#0b1020`,
  title: "CSS Box Shadow Generator — Smooth Shadows, Glassmorphism & Neumorphism | NiceUI",
  description: "Free CSS box shadow generator: layered and smooth shadows, glassmorphism and neumorphism with a live preview. Copy CSS, Tailwind or React in one click.",
  about: `<p class="lede">Design shadows that look real. Stack and tune box-shadow layers, generate smooth multi-layer shadows from a light angle, make frosted glass cards, or soft neumorphic surfaces, then copy plain CSS, Tailwind classes, a React component or CSS custom properties. Nothing to install.</p>`,
  faq: [
    ["What is a smooth (layered) shadow?", "Instead of one big blurry shadow, a smooth shadow stacks several box-shadow layers whose offset and blur grow step by step. The result fades more naturally, like a real shadow. Turn on Smooth in Shadow mode and set the light angle, distance, blur and strength."],
    ["How do I make a glassmorphism card in CSS?", "Give the element a semi-transparent background, a backdrop-filter such as blur(16px) saturate(160%), a thin light border and rounded corners, and place it over something colourful. Glass mode writes all of this, including the -webkit- prefix Safari needs."],
    ["How does neumorphism work?", "Neumorphism uses two shadows on an element the same colour as its background: a dark one on one side and a light one on the other, so the shape looks extruded or pressed. Pick flat, concave, convex or pressed in Neumorphism mode."],
    ["Can I use these shadows in Tailwind CSS?", "Yes. The Tailwind tab gives arbitrary-value classes such as shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)] and [backdrop-filter:blur(16px)_saturate(160%)], which work without changing your config."],
  ],
  body: ({ icon }) => `
    <div class="sh" data-sh>
      <div class="sh-main">
        <div class="sh-stage" data-sh-stage>
          <div class="sh-art" data-sh-art></div>
          <div class="sh-demo">
            <div class="sh-card" data-sh-card>
              <span class="sh-card-tag" data-sh-tag>Shadow</span>
              <p class="sh-card-h">Depth that feels real.</p>
              <p class="sh-card-p">Layered shadows, frosted glass and soft clay, tuned live.</p>
              <span class="sh-card-btn" data-sh-btn>Get started</span>
            </div>
          </div>
          <div class="sh-stage-bar">
            <div class="gm-modes" role="group" aria-label="Effect">${[
              ["shadow", "Shadow"],
              ["glass", "Glass"],
              ["neu", "Neumorphism"],
            ]
              .map(([m, l]) => `<button type="button" data-sh-mode="${m}" aria-pressed="false">${l}</button>`)
              .join("")}</div>
          </div>
        </div>
      </div>

      <aside class="sh-side" aria-label="Controls">
        <div class="sh-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Presets</h2><button type="button" class="gm-ghost" data-sh-reset>Reset</button></div>
            <div class="sh-presets" data-sh-presets></div>
          </section>

          <section class="gm-card" data-sh-show="shadow">
            <h2>Shadow</h2>
            ${seg("shadow.kind", [["layers", "Custom layers"], ["smooth", "Smooth"]])}
            <div data-sh-kind="smooth">
              ${rng("shadow.smooth.n", "Layers", 2, 10, 1, 6, "6")}
              ${rng("shadow.smooth.angle", "Light angle", 0, 360, 1, 90, "90°")}
              ${rng("shadow.smooth.distance", "Distance", 0, 120, 1, 32, "32px")}
              ${rng("shadow.smooth.blur", "Blur", 0, 160, 1, 56, "56px")}
              ${rng("shadow.smooth.strength", "Strength", 2, 60, 1, 18, "18%")}
              <label class="gm-row"><span>Shadow colour</span><input type="color" data-sh-in="shadow.smooth.color" aria-label="Shadow colour" /></label>
            </div>
            <div data-sh-kind="layers">
              <div class="sh-layers" data-sh-layers></div>
              <button type="button" class="gm-ghost" data-sh-add>+ Add layer</button>
            </div>
          </section>

          <section class="gm-card" data-sh-show="glass">
            <h2>Glass</h2>
            ${rng("glass.blur", "Blur", 0, 40, 1, 16, "16px")}
            ${rng("glass.sat", "Saturation", 100, 250, 5, 160, "160%")}
            <label class="gm-row"><span>Tint</span><input type="color" data-sh-in="glass.tint" aria-label="Tint colour" /></label>
            ${rng("glass.tintA", "Tint opacity", 0, 80, 1, 14, "14%")}
            ${rng("glass.border", "Border highlight", 0, 80, 1, 28, "28%")}
            ${rng("glass.noise", "Noise", 0, 30, 1, 6, "6%")}
            <p class="sh-label">Backdrop</p>
            ${seg("glass.art", [["aurora", "Aurora"], ["sunset", "Sunset"], ["ocean", "Ocean"], ["candy", "Candy"]], "sh-seg4")}
          </section>

          <section class="gm-card" data-sh-show="neu">
            <h2>Neumorphism</h2>
            ${seg("neu.shape", [["flat", "Flat"], ["concave", "Concave"], ["convex", "Convex"], ["pressed", "Pressed"]], "sh-seg4")}
            <label class="gm-row"><span>Base colour</span><input type="color" data-sh-in="neu.base" aria-label="Base colour" /></label>
            ${rng("neu.distance", "Distance", 2, 40, 1, 14, "14px")}
            ${rng("neu.blur", "Blur", 0, 80, 1, 28, "28px")}
            ${rng("neu.intensity", "Intensity", 2, 40, 1, 15, "15%")}
            <p class="gm-tip">The page background is set to the base colour, which neumorphism needs.</p>
          </section>

          <section class="gm-card">
            <h2>Card</h2>
            ${rng("radius", "Radius", 0, 48, 1, 20, "20px")}
            <label class="gm-row" data-sh-show="shadow"><span>Card colour</span><input type="color" data-sh-in="card" aria-label="Card colour" /></label>
            <div data-sh-show="shadow"><p class="sh-label">Background</p>${seg("bg", [["light", "Light"], ["dark", "Dark"], ["gradient", "Gradient"]])}</div>
            <label class="gm-row"><span>Show button</span><input type="checkbox" data-sh-in="showBtn" aria-label="Show button" /></label>
          </section>
        </div>

        <section class="sh-export">
          <div class="gm-tabs" role="tablist" aria-label="Export format">${[
            ["css", "CSS"],
            ["tailwind", "Tailwind"],
            ["react", "React"],
            ["vars", "Variables"],
          ]
            .map(([k, l], i) => `<button type="button" role="tab" data-sh-tab="${k}" aria-selected="${i === 0}">${l}</button>`)
            .join("")}</div>
          <pre class="gm-code"><code data-sh-code></code></pre>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-sh-copy>${icon.copy} Copy code</button>
            <button type="button" class="btn btn-cmd" data-sh-share>Share</button>
          </div>
          <p class="gm-note">Dependency-free: plain CSS, Tailwind arbitrary values, a self-contained React component or CSS custom properties.</p>
        </section>
      </aside>
    </div>`,
};
