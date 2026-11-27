// Palette Generator: colour palettes generated in OKLCH, colour from image, Tailwind
// 50–950 scales, contrast checks, colour-blind preview and one-click exports.
// The site build turns this into the full-screen page at /apps/palette-generator.

import { PALETTES } from "../palettes.mjs";

const MODES = [
  ["auto", "Auto"],
  ["analogous", "Analogous"],
  ["monochromatic", "Monochrome"],
  ["complementary", "Complementary"],
  ["split", "Split comp."],
  ["triadic", "Triadic"],
  ["tetradic", "Tetradic"],
  ["pastel", "Pastel"],
  ["vivid", "Vivid"],
  ["earthy", "Earthy"],
  ["dark", "Dark"],
];

export default {
  slug: "palette-generator",
  name: "Palette Generator",
  blurb: "Generate beautiful colour palettes with the space bar, pull colours from any image, turn a colour into a Tailwind 50–950 scale, check contrast and colour blindness, then export CSS, Tailwind or shadcn themes.",
  chips: [`${PALETTES.length}+ palettes`, "Tailwind scales", "Contrast checks", "From image"],
  preview: "linear-gradient(90deg,#fde2e4 0 20%,#fad2e1 20% 40%,#bee1e6 40% 60%,#6366f1 60% 80%,#0f172a 80%)",
  title: "Color Palette Generator — Tailwind Colors, Contrast Checker & Palettes from Image | NiceUI",
  description: "Free color palette generator: press space for harmonious palettes made in OKLCH, extract colors from an image, build Tailwind 50–950 color scales, check WCAG contrast and export CSS, Tailwind or shadcn themes.",
  about: `<p class="lede">Palette Generator makes colour palettes that actually work in interfaces. Press the space bar for a new palette, lock the colours you like and keep generating. Pick a harmony (analogous, complementary, triadic, pastel, earthy…), pull colours from a photo, turn any colour into a Tailwind 50–950 scale, then check every pair for WCAG contrast and preview the palette under four types of colour blindness.</p>
  <p class="mute">Palettes are generated in OKLCH, a colour space that matches how we see lightness, so the steps feel even and the colours sit well together. Browse <a class="ul" href="/palettes">${PALETTES.length} curated palettes</a> for a head start.</p>`,
  faq: [
    ["How do I generate a color palette?", "Press the space bar (or the Generate button). Click the lock on any colour you want to keep, then press space again to regenerate the rest. Choose a harmony such as analogous, complementary or pastel to steer the result."],
    ["How do I make a Tailwind color scale from one color?", "Select a colour and open the Tailwind scale tab. It builds a 50–950 scale around it in OKLCH, placing your colour at the closest step, and copies as a Tailwind v3 config or Tailwind v4 @theme variables."],
    ["How do I get a color palette from an image?", "Open the From image tab and upload, paste or drop a picture. Palette Generator finds its dominant colours with k-means clustering and marks where each one came from. The image never leaves your browser."],
    ["How do I check if my colors are accessible?", "The Contrast tab shows the WCAG contrast ratio for every pair with AA and AAA badges, and each colour shows whether black or white text reads better on it. The colour-blind menu previews the whole palette as people with protanopia, deuteranopia, tritanopia or achromatopsia see it."],
    ["Can I use these palettes commercially?", "Yes. Colours are free to use anywhere, and every export is plain code with no dependencies."],
  ],
  body: ({ icon }) => `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
      <filter id="pg-cb-protanopia"><feColorMatrix values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/></filter>
      <filter id="pg-cb-deuteranopia"><feColorMatrix values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/></filter>
      <filter id="pg-cb-tritanopia"><feColorMatrix values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/></filter>
      <filter id="pg-cb-achromatopsia"><feColorMatrix values="0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0"/></filter>
    </svg>
    <div class="pg" data-pg>
      <div class="pg-main" data-pg-sim>
        <div class="pg-bar">
          <button type="button" class="pg-gen" data-pg-generate><kbd>Space</kbd> Generate</button>
          <label class="pg-mode"><span class="sr-only">Harmony</span><select data-pg-mode aria-label="Harmony">${MODES.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select></label>
          <div class="pg-bar-r">
            <button type="button" class="pg-ib" data-pg-undo aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg></button>
            <button type="button" class="pg-ib" data-pg-redo aria-label="Redo (Ctrl+Shift+Z)" title="Redo (Ctrl+Shift+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/></svg></button>
            <span class="pg-sep" aria-hidden="true"></span>
            <button type="button" class="pg-ib" data-pg-remove-last aria-label="Remove a colour" title="Remove a colour">−</button>
            <span class="pg-count" data-pg-count>5</span>
            <button type="button" class="pg-ib" data-pg-add aria-label="Add a colour" title="Add a colour">+</button>
          </div>
        </div>
        <div class="pg-cols" data-pg-cols role="list" aria-label="Palette colours. Space generates, L locks, C copies, Alt+arrows move."></div>
        <div class="pg-panel">
          <div class="pg-tabs" role="tablist" aria-label="Tools">${[
            ["preview", "UI preview"],
            ["contrast", "Contrast"],
            ["scale", "Tailwind scale"],
            ["image", "From image"],
          ]
            .map(([k, l], i) => `<button type="button" role="tab" data-pg-tab="${k}" aria-selected="${i === 0}">${l}</button>`)
            .join("")}</div>
          <div class="pg-pane" data-pg-pane="preview"></div>
          <div class="pg-pane" data-pg-pane="contrast" hidden></div>
          <div class="pg-pane" data-pg-pane="scale" hidden></div>
          <div class="pg-pane pg-img-pane" data-pg-pane="image" hidden>
            <div class="pg-img-drop" data-pg-drop>
              <div class="pg-img-wrap" data-pg-img-wrap hidden><img alt="Your image" data-pg-img /><div class="pg-marks" data-pg-marks></div></div>
              <div class="pg-img-empty" data-pg-img-empty>
                <p><b>Drop an image</b>, paste one (⌘V / Ctrl+V) or</p>
                <label class="btn btn-sky pg-up"><input type="file" accept="image/*" data-pg-file /> Choose image</label>
                <p class="mute">Colours are found in your browser. Nothing is uploaded.</p>
              </div>
            </div>
            <div class="pg-img-side">
              <label class="gm-rng"><span>Colours<output data-pg-k-out>6</output></span><input type="range" min="3" max="10" value="6" data-pg-k /></label>
              <button type="button" class="btn btn-cmd" data-pg-reextract hidden>Extract again</button>
              <label class="btn btn-cmd pg-up pg-up-s" data-pg-new-img hidden><input type="file" accept="image/*" data-pg-file2 /> New image</label>
            </div>
          </div>
        </div>
      </div>

      <aside class="pg-side" aria-label="Library and export">
        <div class="pg-scroll">
          <section class="gm-card">
            <h2>Colour blindness</h2>
            <div class="gm-seg pg-cb" role="group" aria-label="Colour-blind simulation">${[
              ["none", "Normal"],
              ["protanopia", "Protan"],
              ["deuteranopia", "Deutan"],
              ["tritanopia", "Tritan"],
              ["achromatopsia", "Mono"],
            ]
              .map(([v, l], i) => `<button type="button" data-pg-cb="${v}" aria-pressed="${i === 0}">${l}</button>`)
              .join("")}</div>
          </section>
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Browse palettes</h2><a class="gm-ghost" href="/palettes">All ${PALETTES.length}</a></div>
            <div class="pg-tags" data-pg-tags></div>
            <div class="pg-lib" data-pg-lib></div>
          </section>
        </div>
        <section class="pg-export">
          <div class="gm-tabs pg-xtabs" role="tablist" aria-label="Export format">${[
            ["css", "CSS"],
            ["tailwind", "Tailwind"],
            ["shadcn", "shadcn"],
            ["json", "JSON"],
            ["scss", "SCSS"],
          ]
            .map(([k, l], i) => `<button type="button" role="tab" data-pg-x="${k}" aria-selected="${i === 0}">${l}</button>`)
            .join("")}</div>
          <pre class="gm-code"><code data-pg-code></code></pre>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-pg-copy>${icon.copy} Copy code</button>
            <button type="button" class="btn btn-cmd" data-pg-png>PNG</button>
            <button type="button" class="btn btn-cmd" data-pg-svg>SVG</button>
            <button type="button" class="btn btn-cmd" data-pg-share>Share</button>
          </div>
        </section>
      </aside>
    </div>
    <script type="application/json" id="pg-library">${JSON.stringify(PALETTES.map((p) => [p.slug, p.name, p.tags, p.colors])).replace(/</g, "\\u003c")}</script>`,
};
