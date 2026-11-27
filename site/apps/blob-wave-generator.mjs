// Blob & Wave Generator: organic SVG blobs, layered waves and full-canvas SVG backgrounds
// with one-click SVG, PNG, CSS, Tailwind, React and section-divider export.
// The site build turns this into the full-screen page at /apps/blob-wave-generator.

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-bw-out="${key}">${fmt}</output></span><input type="range" data-bw-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (key, items, label) =>
  `<div class="gm-seg bw-seg" role="group" aria-label="${label}" style="grid-template-columns:repeat(${items.length},1fr)">${items.map(([v, l]) => `<button type="button" data-bw-set="${key}" data-bw-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

const SIZES = [
  ["square", "1:1"],
  ["hd", "16:9"],
  ["classic", "4:3"],
  ["story", "9:16"],
  ["banner", "Banner"],
  ["custom", "Custom"],
];

export default {
  slug: "blob-wave-generator",
  name: "Blob & Wave Generator",
  blurb: "Organic SVG blobs, layered waves and full-canvas SVG backgrounds (steps, peaks, blob scenes, circles, low-poly) with morph animation and one-click SVG, PNG, CSS, Tailwind or React export.",
  chips: ["Blobs", "Layered waves", "SVG backgrounds", "No dependencies"],
  preview: "radial-gradient(40% 55% at 35% 40%,#a78bfa,transparent 70%),radial-gradient(45% 55% at 70% 60%,#38bdf8,transparent 70%),linear-gradient(180deg,transparent 62%,#0ea5e9 62%,#0ea5e9 72%,#6366f1 72%),#020617",
  title: "SVG Blob & Wave Generator — Waves, Blobs & Background Shapes | NiceUI",
  description: "Free SVG blob and wave generator: make organic blobs, layered wave dividers and SVG backgrounds (layered steps, peaks, blob scenes, low-poly). Export SVG, PNG, CSS, Tailwind or React.",
  about: `<p class="lede">Make organic shapes for websites in seconds. Generate smooth SVG blobs (with an optional morph animation), layered wave dividers for the bottom or top of a section, or full-canvas backgrounds: layered steps, layered peaks, blob scenes, circle scatter and low-poly gradients. Every shape is seeded, so a share link brings back the exact same result.</p>
  <p class="mute">Export clean SVG, a transparent PNG at 1× or 2×, a CSS background, a Tailwind class, a dependency-free React component or a ready-made section divider. Everything runs in your browser.</p>`,
  faq: [
    ["How do I add a wave divider between sections?", "Choose Waves, set the direction to match the edge you want, then copy the Divider tab. It gives you a section with the SVG absolutely positioned at its bottom (or top), stretched to full width with preserveAspectRatio=\"none\" so it fits any screen."],
    ["How do I make an SVG blob?", "Pick Blob, adjust complexity and randomness, then press Randomize (or the R key) until you like the shape. Copy the SVG, or the React tab for a component. The morph option animates between two blobs with SMIL, which works in every modern browser."],
    ["Can I use the shapes as a CSS background?", "Yes. The CSS and Tailwind tabs encode the SVG as a data URI, so there is no file to host. For large backgrounds, download the SVG file instead and reference it by URL."],
    ["Are the shapes free to use?", "Yes. Everything you generate is yours to use in personal and commercial projects, with no attribution required."],
  ],
  body: ({ icon }) => `
    <div class="bw" data-bw>
      <div class="bw-main">
        <div class="bw-stage" data-bw-stage>
          <div class="bw-art" data-bw-art aria-live="polite"></div>
          <div class="bw-section" data-bw-section hidden aria-hidden="true">
            <span class="bw-section-tag">Section preview</span>
            <p class="bw-section-h">Make the next section flow.</p>
            <p class="bw-section-p">The wave sits on the edge of this block, full width, at any size.</p>
          </div>
          <div class="bw-stage-bar">
            ${seg("mode", [["blob", "Blob"], ["waves", "Waves"], ["scene", "Background"]], "Generator")}
            <button type="button" class="bw-chip" data-bw-random title="Randomize (R)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg> Randomize <kbd>R</kbd></button>
          </div>
          <label class="bw-toggle" data-bw-only="waves"><input type="checkbox" data-bw-in="inSection" /> <span>Section preview</span></label>
          <span class="bw-seed">Seed <b data-bw-seed></b></span>
        </div>
        <div class="bw-presets-wrap">
          <span class="bw-presets-label">Presets</span>
          <div class="bw-presets" data-bw-presets></div>
        </div>
      </div>

      <aside class="bw-side" aria-label="Controls">
        <div class="bw-scroll">
          <section class="gm-card" data-bw-only="blob">
            <h2>Blob</h2>
            ${rng("bPoints", "Complexity", 3, 12, 1, 6, "6")}
            ${rng("bRand", "Randomness", 0, 100, 1, 55, "55%")}
            ${rng("bLayers", "Layers", 1, 4, 1, 1, "1")}
            ${rng("bSize", "Size", 30, 95, 1, 72, "72%")}
            ${rng("bRot", "Rotation", 0, 360, 1, 0, "0°")}
            ${seg("bFill", [["gradient", "Gradient"], ["solid", "Solid"], ["outline", "Outline"]], "Fill")}
            <div data-bw-only-fill="outline">${rng("bStroke", "Stroke", 1, 24, 1, 6, "6")}</div>
            <label class="bw-check"><input type="checkbox" data-bw-in="bAnim" /> <span>Morph animation</span></label>
            <div data-bw-only-anim>${rng("bDur", "Duration", 3, 20, 1, 8, "8s")}</div>
          </section>
          <section class="gm-card" data-bw-only="waves">
            <h2>Waves</h2>
            ${seg("wType", [["smooth", "Smooth"], ["peaks", "Peaks"], ["steps", "Steps"]], "Wave type")}
            ${rng("wLayers", "Layers", 1, 6, 1, 4, "4")}
            ${rng("wHeight", "Height", 10, 90, 1, 45, "45%")}
            ${rng("wFreq", "Frequency", 2, 24, 1, 6, "6")}
            ${rng("wAmp", "Amplitude", 0, 100, 1, 55, "55%")}
            ${seg("wDir", [["bottom", "Bottom"], ["top", "Top"]], "Direction")}
            <label class="bw-check"><input type="checkbox" data-bw-in="wFade" /> <span>Fade back layers</span></label>
          </section>
          <section class="gm-card" data-bw-only="scene">
            <h2>Background</h2>
            <div class="bw-kinds" data-bw-kinds role="group" aria-label="Background style"></div>
            ${rng("sDensity", "Density", 0, 100, 1, 50, "50")}
            <div data-bw-only-kind="blobs"><label class="bw-check"><input type="checkbox" data-bw-in="sSoft" /> <span>Soft focus (blur)</span></label></div>
          </section>
          <section class="gm-card">
            <h2>Colour</h2>
            <div class="bw-palettes" data-bw-palettes></div>
            <div class="bw-colors">
              <label class="bw-color"><input type="color" data-bw-in="c1" aria-label="Colour 1" /><span>1</span></label>
              <label class="bw-color"><input type="color" data-bw-in="c2" aria-label="Colour 2" /><span>2</span></label>
              <label class="bw-color"><input type="color" data-bw-in="c3" aria-label="Colour 3" /><span>3</span></label>
              <label class="bw-color"><input type="color" data-bw-in="bg" aria-label="Background colour" /><span>BG</span></label>
            </div>
            <label class="bw-check" data-bw-hide-scene><input type="checkbox" data-bw-in="bgOn" /> <span>Fill background</span></label>
          </section>
          <section class="gm-card">
            <h2>Canvas</h2>
            <div class="bw-sizes" role="group" aria-label="Canvas size">${SIZES.map(([v, l]) => `<button type="button" data-bw-set="size" data-bw-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
            <div class="bw-custom" data-bw-custom>
              <label><span>W</span><input type="number" min="100" max="4000" step="10" data-bw-in="cw" aria-label="Custom width" /></label>
              <label><span>H</span><input type="number" min="100" max="4000" step="10" data-bw-in="ch" aria-label="Custom height" /></label>
            </div>
          </section>
        </div>
        <section class="bw-export">
          <div class="gm-tabs bw-tabs" role="tablist" aria-label="Export format">${[
            ["svg", "SVG"],
            ["css", "CSS"],
            ["tailwind", "Tailwind"],
            ["react", "React"],
            ["divider", "Divider"],
          ]
            .map(([k, l], i) => `<button type="button" role="tab" data-bw-tab="${k}" aria-selected="${i === 0}">${l}</button>`)
            .join("")}</div>
          <pre class="gm-code"><code data-bw-code></code></pre>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-bw-copy>${icon.copy} Copy code</button>
            <button type="button" class="btn btn-cmd" data-bw-dl-svg>.svg</button>
            <button type="button" class="btn btn-cmd" data-bw-dl-png>PNG</button>
            <button type="button" class="btn btn-cmd" data-bw-share>Share</button>
          </div>
          <div class="bw-export-opts">
            <span>PNG scale</span>
            ${seg("pngScale", [["1", "1×"], ["2", "2×"]], "PNG scale")}
          </div>
          <p class="gm-note">Dependency-free: plain SVG, a data-URI CSS background, a Tailwind class, a typed React component or a section divider.</p>
        </section>
      </aside>
    </div>`,
};
