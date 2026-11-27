// Logo Maker: wordmark + mark logos with real vector text (outlined with opentype.js),
// brand-free geometric marks, Lucide icons or monograms, and a favicon pack export.
// The UI script is bundled by scripts/build-logo-maker.mjs into assets/logo-maker.js.

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-lm-out="${key}">${fmt}</output></span><input type="range" data-lm-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (key, items) =>
  `<div class="gm-seg lm-seg" role="group" style="grid-template-columns:repeat(${items.length},1fr)">${items.map(([v, l]) => `<button type="button" data-lm-set="${key}" data-lm-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

export default {
  slug: "logo-maker",
  name: "Logo Maker",
  blurb: "Make a clean logo in minutes: pick a mark (geometric shapes, 1,500 icons or a monogram), a font and colours, preview it on real UI, then download SVG, PNG and a full favicon pack.",
  chips: ["Vector SVG", "Favicon pack", "18 fonts", "Free for commercial use"],
  preview: "radial-gradient(60% 70% at 50% 40%,rgba(99,102,241,.35),transparent 70%),#05060a",
  title: "Free Logo Maker — Create a Logo with SVG, PNG & Favicon Export | NiceUI",
  description: "Free logo maker for startups, apps and side projects: combine a mark, an icon or a monogram with a great font, preview it in context and download vector SVG, transparent PNG and a favicon pack.",
  about: `<p class="lede">Logo Maker builds simple, modern logos the way designers do: a mark plus a wordmark. Choose from geometric marks drawn for NiceUI, 1,500 open-source icons or a monogram, set it in one of 18 open-licence fonts, pick a palette, and see it live on light and dark backgrounds, as an app icon, a browser tab and a website header.</p>
  <p class="mute">The text is converted to vector outlines, so the SVG looks identical in Figma, Illustrator or a browser without the font installed. Everything runs in your browser.</p>`,
  faq: [
    ["Can I use the logo for my business?", "Yes. The marks, the Lucide icons (ISC licence) and the fonts (SIL Open Font License) all allow commercial use, and the logo you make is yours. Simple marks are hard to register as trademarks, so check with a lawyer before you file one."],
    ["What files do I get?", "A vector SVG of the full logo, the mark on its own and the wordmark, transparent PNGs, and a favicon pack (favicon.svg, 16 and 32 px PNGs, a 180 px Apple touch icon, 192 and 512 px app icons, a web manifest and the HTML tags to paste in)."],
    ["Why is the text converted to outlines?", "So the logo looks the same everywhere. An SVG that relies on a font only renders correctly where that font is installed. Outlined text is just shapes."],
    ["Can I use the logo in React?", "Yes. Copy the React tab to get a small component with the SVG inlined, sized by a single prop and recoloured with the variant prop."],
  ],
  body: ({ icon }) => `
    <div class="lm" data-lm>
      <div class="lm-main">
        <div class="lm-stage" data-lm-stage>
          <div class="lm-canvas" data-lm-canvas aria-live="polite"></div>
          <div class="lm-stage-bar">
            ${seg("stage", [["light", "Light"], ["dark", "Dark"], ["brand", "Brand"]])}
            <button type="button" class="lm-chip" data-lm-inspire>✦ Inspire me</button>
          </div>
        </div>
        <div class="lm-contexts" data-lm-contexts aria-label="Logo in context"></div>
      </div>

      <aside class="lm-side" aria-label="Controls">
        <div class="lm-scroll">
          <section class="gm-card">
            <h2>Name</h2>
            <label class="lm-field"><span>Brand name</span><input data-lm-text="name" maxlength="28" spellcheck="false" /></label>
            <label class="lm-field"><span>Tagline <i>optional</i></span><input data-lm-text="tagline" maxlength="48" /></label>
          </section>
          <section class="gm-card">
            <h2>Mark</h2>
            ${seg("mark", [["shape", "Shape"], ["icon", "Icon"], ["mono", "Monogram"], ["none", "None"]])}
            <div data-lm-only="shape"><div class="lm-grid lm-shapes" data-lm-shapes></div></div>
            <div data-lm-only="icon">
              <input class="lm-search" type="search" placeholder="Search 1,500 icons…" data-lm-search aria-label="Search icons" />
              <div class="lm-grid lm-icons" data-lm-icons><p class="lm-note">Loading icons…</p></div>
            </div>
            <div data-lm-only="mono"><label class="lm-field"><span>Letters</span><input data-lm-text="mono" maxlength="2" /></label></div>
            <div data-lm-only="shape icon mono">
              <span class="lm-lab">Container</span>
              <div class="lm-containers" data-lm-containers></div>
              ${seg("style", [["fill", "Filled"], ["soft", "Soft"], ["outline", "Outline"]])}
              ${rng("markSize", "Mark size", 60, 180, 1, 100, "100%")}
            </div>
          </section>
          <section class="gm-card">
            <h2>Type</h2>
            <div class="lm-fonts" data-lm-fonts></div>
            <div class="lm-weights" data-lm-weights></div>
            ${seg("case", [["as", "Aa"], ["upper", "AA"], ["lower", "aa"]])}
            ${rng("track", "Letter spacing", -8, 30, 1, -2, "-2")}
          </section>
          <section class="gm-card">
            <h2>Layout</h2>
            ${seg("layout", [["side", "Side"], ["stack", "Stacked"], ["mark", "Mark"], ["word", "Wordmark"]])}
            ${rng("gap", "Spacing", 0, 80, 1, 22, "22")}
          </section>
          <section class="gm-card">
            <h2>Colour</h2>
            <div class="lm-palettes" data-lm-palettes></div>
            <div class="lm-colors">
              <label class="gm-row"><span>Brand</span><input type="color" data-lm-in="c1" aria-label="Brand colour" /></label>
              <label class="gm-row"><span>Accent</span><input type="color" data-lm-in="c2" aria-label="Accent colour" /></label>
              <label class="gm-row"><span>Text</span><input type="color" data-lm-in="ink" aria-label="Text colour" /></label>
            </div>
            <label class="lm-check"><input type="checkbox" data-lm-in="grad" /> <span>Gradient mark</span></label>
            <label class="lm-check"><input type="checkbox" data-lm-in="tintText" /> <span>Brand-coloured name</span></label>
          </section>
        </div>
        <section class="lm-export">
          <div class="gm-tabs" role="tablist" aria-label="Export">${[["svg", "SVG"], ["react", "React"], ["html", "Favicon tags"]].map(([k, l], i) => `<button type="button" role="tab" data-lm-tab="${k}" aria-selected="${i === 0}">${l}</button>`).join("")}</div>
          ${seg("variant", [["color", "Colour"], ["black", "Black"], ["white", "White"]])}
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-lm-zip>${icon.arrow} Download kit</button>
            <button type="button" class="btn btn-cmd" data-lm-svg>.svg</button>
            <button type="button" class="btn btn-cmd" data-lm-png>PNG</button>
            <button type="button" class="btn btn-cmd" data-lm-copy aria-label="Copy code">${icon.copy} Copy</button>
          </div>
          <p class="gm-note" data-lm-note>Kit = logo, mark and wordmark SVGs, PNGs and a full favicon pack, zipped.</p>
        </section>
      </aside>
    </div>`,
};
