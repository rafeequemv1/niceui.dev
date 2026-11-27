// ASCII Art Generator: images, video and webcam to ASCII / braille / block art,
// rendered live on a canvas with colour, dithering and edge detection.
// The site build turns this into the full-screen page at /apps/ascii-art.

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-aa-out="${key}">${fmt}</output></span><input type="range" data-aa-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (key, items) =>
  `<div class="gm-seg aa-seg" role="group" style="grid-template-columns:repeat(${items.length},1fr)">${items.map(([v, l]) => `<button type="button" data-aa-set="${key}" data-aa-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

export default {
  slug: "ascii-art",
  name: "ASCII Art Generator",
  blurb: "Turn any image, video or your webcam into ASCII art live: classic characters, blocks or braille, in colour or mono, with dithering and edge lines. Copy text, HTML or React, or download PNG and video.",
  chips: ["Image to ASCII", "Live webcam", "Braille & blocks", "PNG · TXT · HTML"],
  preview: "#000",
  title: "ASCII Art Generator — Convert Image to ASCII Art Online (Free) | NiceUI",
  description: "Free ASCII art generator: convert images, video or your webcam into ASCII, block or braille art in colour or mono. Adjust detail, contrast and dithering, then copy the text or download PNG, HTML and video.",
  about: `<p class="lede">The ASCII Art Generator converts pictures into text art right in your browser. Drop in a photo, a screenshot or a video, or turn on your webcam, and watch it redraw as characters in real time. Choose classic ASCII ramps, shaded blocks or high-detail braille, keep the original colours or pick a duotone, add Floyd–Steinberg dithering or edge lines, then export.</p>
  <p class="mute">Your images and camera feed never leave your device: everything is processed locally on a canvas.</p>`,
  faq: [
    ["How do I convert an image to ASCII art?", "Upload, paste or drop an image. It is converted instantly; use Detail to set how many characters wide the art is, and Copy text or Download to save it."],
    ["What is braille ASCII art?", "Braille mode packs a 2 × 4 grid of dots into each character (Unicode braille patterns), so you get about eight times the detail of normal ASCII in the same space. It works best for line art and high-contrast photos."],
    ["Can I make ASCII art from my webcam?", "Yes. Press Webcam and allow camera access. The art updates live, and Record saves a short video of the canvas. The video never leaves your computer."],
    ["How do I keep the colours?", "Switch Colour to Original. Every character takes the colour of the pixels it covers. Export as PNG or HTML to keep the colours; plain text has no colour."],
  ],
  body: ({ icon }) => `
    <div class="aa" data-aa>
      <div class="aa-main">
        <div class="aa-stage" data-aa-stage>
          <canvas class="aa-canvas" data-aa-canvas aria-label="ASCII art preview"></canvas>
          <video data-aa-video playsinline muted loop hidden></video>
          <div class="aa-drop" data-aa-drop hidden><span>Drop an image or video</span></div>
          <div class="aa-stage-bar">
            <button type="button" class="aa-chip" data-aa-compare aria-pressed="false">Compare</button>
            <span class="aa-meta" data-aa-meta></span>
          </div>
        </div>
        <div class="aa-src">
          <div class="aa-samples" data-aa-samples aria-label="Sample images"></div>
          <label class="aa-btn">
            <input type="file" accept="image/*,video/*" data-aa-file />
            <span>${icon.arrow} Upload</span>
          </label>
          <button type="button" class="aa-btn aa-btn-ghost" data-aa-cam>● Webcam</button>
          <button type="button" class="aa-btn aa-btn-ghost" data-aa-rec hidden>Record</button>
          <span class="aa-hint">or paste (⌘V) / drop an image or video</span>
        </div>
      </div>

      <aside class="aa-side" aria-label="Controls">
        <div class="aa-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Style</h2><button type="button" class="gm-ghost" data-aa-reset>Reset</button></div>
            <div class="aa-presets" data-aa-presets></div>
          </section>
          <section class="gm-card">
            <h2>Characters</h2>
            ${seg("set", [["classic", "Classic"], ["detailed", "Detailed"], ["blocks", "Blocks"], ["braille", "Braille"]])}
            ${seg("set", [["binary", "01"], ["dots", "Dots"], ["lines", "Lines"], ["custom", "Custom"]])}
            <label class="aa-field" data-aa-only="custom"><span>Custom ramp, dark → light</span><input data-aa-text="custom" spellcheck="false" maxlength="70" /></label>
            ${rng("cols", "Detail (columns)", 30, 260, 1, 120, "120")}
            <label class="aa-check"><input type="checkbox" data-aa-in="edges" /> <span>Edge lines</span></label>
            <label class="aa-check"><input type="checkbox" data-aa-in="dither" /> <span>Dithering</span></label>
            <label class="aa-check"><input type="checkbox" data-aa-in="invert" /> <span>Invert</span></label>
          </section>
          <section class="gm-card">
            <h2>Tone</h2>
            ${rng("brightness", "Brightness", -100, 100, 1, 0, "0")}
            ${rng("contrast", "Contrast", -100, 100, 1, 20, "20")}
            ${rng("gamma", "Gamma", 40, 250, 1, 100, "1.00")}
          </section>
          <section class="gm-card">
            <h2>Colour</h2>
            ${seg("color", [["mono", "Mono"], ["original", "Original"], ["duotone", "Duotone"]])}
            <div class="aa-colors">
              <label class="gm-row" data-aa-only="mono duotone"><span data-aa-fglabel>Text</span><input type="color" data-aa-in="fg" aria-label="Text colour" /></label>
              <label class="gm-row" data-aa-only="duotone"><span>Shadows</span><input type="color" data-aa-in="fg2" aria-label="Shadow colour" /></label>
              <label class="gm-row"><span>Background</span><span class="aa-bgrow"><label class="aa-check aa-check-s"><input type="checkbox" data-aa-in="bgOn" /> <span>Fill</span></label><input type="color" data-aa-in="bg" aria-label="Background colour" /></span></label>
            </div>
            <div data-aa-only="original">${rng("sat", "Saturation", 0, 200, 1, 120, "120%")}</div>
            ${rng("size", "Font size", 6, 20, 1, 10, "10px")}
          </section>
        </div>
        <section class="aa-export">
          <div class="aa-export-row">
            ${seg("scale", [["1", "1×"], ["2", "2×"], ["3", "3×"]])}
          </div>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-aa-png>${icon.arrow} PNG</button>
            <button type="button" class="btn btn-cmd" data-aa-copy>Copy text</button>
            <button type="button" class="btn btn-cmd" data-aa-more aria-haspopup="true" aria-expanded="false">More</button>
          </div>
          <div class="aa-more" data-aa-menu hidden>
            <button type="button" data-aa-dl="txt">Download .txt</button>
            <button type="button" data-aa-dl="html">Download colour HTML</button>
            <button type="button" data-aa-dl="svg">Download SVG</button>
            <button type="button" data-aa-dl="react">Copy React component</button>
            <button type="button" data-aa-dl="share">Copy share link</button>
          </div>
          <p class="gm-note">Processed on your device. Images and camera never leave your browser.</p>
        </section>
      </aside>
    </div>`,
};
