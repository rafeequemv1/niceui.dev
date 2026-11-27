// Mockup Maker: screenshots into polished share images (OG, X, Instagram, Dribbble).
// The site build turns this into the full-screen page at /apps/mockup-maker.

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-mm-out="${key}">${fmt}</output></span><input type="range" data-mm-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (key, items, cls = "") =>
  `<div class="gm-seg mm-seg ${cls}" role="group">${items.map(([v, l]) => `<button type="button" data-mm-set="${key}" data-mm-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

const SIZES = [
  ["og", "OG"],
  ["x", "X"],
  ["square", "Square"],
  ["story", "Story"],
  ["dribbble", "Dribbble"],
  ["custom", "Custom"],
];

export default {
  slug: "mockup-maker",
  name: "Mockup Maker",
  blurb: "Turn any screenshot into a polished share image: browser, macOS, phone and tablet frames on mesh backgrounds, sized for OG images, X, Instagram and Dribbble.",
  chips: ["OG images", "Device frames", "PNG · JPG · WebP", "Private"],
  preview:
    "background:radial-gradient(at 18% 22%,#22d3ee 0px,transparent 52%),radial-gradient(at 85% 15%,#a78bfa 0px,transparent 50%),radial-gradient(at 70% 90%,#0ea5e9 0px,transparent 55%),#020617",
  title: "Screenshot Mockup Generator — OG Images & Device Frames | NiceUI",
  description: "Free screenshot mockup generator: put screenshots in browser, macOS, phone or tablet frames on gradient backgrounds and export OG images, X and Instagram posts as PNG.",
  about: `<p class="lede">Make share images from screenshots in seconds. Drop in a screenshot, choose a browser, macOS, phone or tablet frame, set the background, tilt and shadow, add a headline, then download a PNG, JPG or WebP sized for Open Graph previews, X, Instagram or Dribbble.</p>
      <p class="mute">Everything happens in your browser: your screenshot is never uploaded anywhere. The preview is the export, drawn on one canvas, so what you see is exactly what you download.</p>`,
  faq: [
    ["What size should an Open Graph (OG) image be?", "1200 × 630 pixels is the standard for link previews on most sites and chat apps. Choose OG in Mockup Maker and export at 2× if you want extra sharpness on high-density screens."],
    ["Is my screenshot uploaded anywhere?", "No. Images are read locally in your browser and drawn on a canvas. Nothing is sent to a server, and share links only store your settings, not the image."],
    ["Can I paste a screenshot instead of uploading?", "Yes. Copy a screenshot to your clipboard and press Ctrl+V or ⌘V anywhere on the page, or drag an image file onto the preview."],
    ["Which formats can I export?", "PNG, JPG and WebP at 1× or 2× size. You can also copy the image straight to your clipboard and paste it into a post, a design tool or a doc."],
  ],
  body: ({ icon }) => `
    <div class="mm" data-mm>
      <div class="mm-main">
        <div class="mm-stage" data-mm-stage>
          <canvas class="mm-canvas" data-mm-canvas width="1200" height="630" aria-label="Mockup preview"></canvas>
          <div class="mm-drop" data-mm-drop hidden><span>Drop your screenshot</span></div>
          <div class="mm-stage-bar">
            <div class="mm-sizes" role="group" aria-label="Canvas size">${SIZES.map(([v, l]) => `<button type="button" data-mm-set="size" data-mm-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
          </div>
        </div>
        <div class="mm-src">
          <span class="mm-src-label">Screenshot</span>
          <div class="mm-samples" data-mm-samples></div>
          <label class="mm-upload">
            <input type="file" accept="image/*" data-mm-file />
            <span>${icon.arrow} Upload</span>
          </label>
          <span class="mm-src-hint">or paste (⌘V) / drop an image · stays in your browser</span>
        </div>
      </div>

      <aside class="mm-side" aria-label="Controls">
        <div class="mm-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Presets</h2><button type="button" class="gm-ghost" data-mm-reset>Reset</button></div>
            <div class="mm-presets" data-mm-presets></div>
          </section>

          <section class="gm-card" data-mm-custom>
            <h2>Custom size</h2>
            <div class="mm-wh">
              <label class="gm-field"><span>W</span><input type="number" min="200" max="4000" data-mm-in="cw" /></label>
              <label class="gm-field"><span>H</span><input type="number" min="200" max="4000" data-mm-in="ch" /></label>
            </div>
          </section>

          <section class="gm-card">
            <h2>Frame</h2>
            ${seg("frame", [["none", "None"], ["mac", "macOS"], ["browser", "Browser"], ["phone", "Phone"], ["tablet", "Tablet"], ["card", "Card"]], "mm-seg3")}
            ${seg("frameTheme", [["dark", "Dark"], ["light", "Light"]])}
            <label class="gm-field mm-wide" data-mm-urlrow><span>URL</span><input data-mm-in="url" spellcheck="false" aria-label="Browser URL" /></label>
            <label class="gm-field mm-wide" data-mm-titlerow><span>Title</span><input data-mm-in="winTitle" spellcheck="false" aria-label="Window title" /></label>
          </section>

          <section class="gm-card">
            <h2>Layout</h2>
            ${rng("pad", "Padding", 0, 30, 1, 9, "9%")}
            ${rng("scale", "Scale", 40, 140, 1, 100, "100%")}
            ${rng("inset", "Inset", 0, 60, 1, 0, "0px")}
            ${rng("radius", "Radius", 0, 48, 1, 14, "14px")}
            ${rng("shadow", "Shadow", 0, 100, 1, 60, "60%")}
            ${rng("tiltX", "Tilt X", -30, 30, 1, 0, "0°")}
            ${rng("tiltY", "Tilt Y", -30, 30, 1, 0, "0°")}
            ${rng("offX", "Offset X", -50, 50, 1, 0, "0%")}
            ${rng("offY", "Offset Y", -50, 50, 1, 0, "0%")}
          </section>

          <section class="gm-card">
            <h2>Background</h2>
            ${seg("bgType", [["solid", "Solid"], ["linear", "Linear"], ["mesh", "Mesh"]])}
            <div class="mm-meshes" data-mm-meshes></div>
            <label class="gm-row"><span>Colour 1</span><input type="color" data-mm-in="c1" aria-label="Background colour 1" /></label>
            <label class="gm-row" data-mm-c2row><span>Colour 2</span><input type="color" data-mm-in="c2" aria-label="Background colour 2" /></label>
            <div data-mm-anglerow>${rng("angle", "Angle", 0, 360, 1, 135, "135°")}</div>
            ${rng("grain", "Grain", 0, 40, 1, 8, "8%")}
            <label class="gm-row"><span>Dot pattern</span><input type="checkbox" class="mm-check" data-mm-in="dots" aria-label="Dot pattern" /></label>
          </section>

          <section class="gm-card">
            <h2>Text</h2>
            ${seg("textPos", [["off", "Off"], ["top", "Top"], ["left", "Left"], ["bottom", "Bottom"]], "mm-seg4")}
            <div class="mm-textfields" data-mm-textfields>
              <label class="gm-field mm-wide"><span>Headline</span><input data-mm-in="headline" aria-label="Headline" /></label>
              <label class="gm-field mm-wide"><span>Subtext</span><input data-mm-in="sub" aria-label="Subtext" /></label>
              <label class="gm-field mm-wide"><span>Badge</span><input data-mm-in="badge" placeholder="optional" aria-label="Badge text" /></label>
              ${seg("align", [["left", "Left"], ["center", "Center"], ["right", "Right"]], "mm-seg3s")}
              ${seg("font", [["sans", "Sans"], ["serif", "Serif"], ["mono", "Mono"]], "mm-seg3s")}
              ${rng("textSize", "Text size", 50, 160, 1, 100, "100%")}
              <label class="gm-row"><span>Text colour</span><input type="color" data-mm-in="textColor" aria-label="Text colour" /></label>
            </div>
          </section>
        </div>

        <section class="mm-export">
          <div class="mm-exrow">
            ${seg("fmt", [["png", "PNG"], ["jpeg", "JPG"], ["webp", "WebP"]])}
            ${seg("mult", [["1", "1×"], ["2", "2×"]])}
          </div>
          <p class="mm-dim" data-mm-dim>1200 × 630</p>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-mm-download>${icon.arrow} Download</button>
            <button type="button" class="btn btn-cmd" data-mm-copy>${icon.copy} Copy</button>
            <button type="button" class="btn btn-cmd" data-mm-share>Share</button>
          </div>
          <p class="gm-note">Your screenshot never leaves your browser. Share links store your settings, not the image.</p>
        </section>
      </aside>
    </div>`,
};
