// Device Studio: 3D device mockups (phone, tablet, laptop, desktop, watch, browser)
// rendered with WebGL, multi-device scenes, orbit camera, captions and store sizes.
// The site build turns this into the full-screen page at /apps/device-studio.

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-ds-out="${key}">${fmt}</output></span><input type="range" data-ds-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (key, items, cls = "") =>
  `<div class="gm-seg ds-seg ${cls}" role="group" style="grid-template-columns:repeat(${items.length},1fr)">${items.map(([v, l]) => `<button type="button" data-ds-set="${key}" data-ds-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

const SIZES = [
  ["dribbble", "4:3"],
  ["hd", "16:9"],
  ["og", "OG"],
  ["square", "1:1"],
  ["portrait", "4:5"],
  ["appstore", "App Store"],
  ["play", "Play"],
];

export default {
  slug: "device-studio",
  name: "Device Studio",
  blurb: "3D device mockups for UI designers: phones, tablets, laptops, desktops, watches and browser windows you can orbit, in multi-device scenes, with captions, App Store sizes and transparent PNG export.",
  chips: ["3D devices", "Multi-device scenes", "App Store sizes", "Private"],
  preview: "radial-gradient(70% 60% at 50% 35%,#334155,transparent 70%),linear-gradient(180deg,#0b1220,#020617)",
  title: "Device Mockup Generator — 3D Phone, Laptop & Tablet Mockups | NiceUI",
  description: "Free 3D device mockup generator: put your screenshots on phones, tablets, laptops, desktops, watches and browser windows, orbit the camera, add captions and export PNG, App Store and Dribbble sizes.",
  about: `<p class="lede">Device Studio turns your UI screenshots into 3D device mockups. Pick a scene (one phone, a phone fan, an isometric stack, laptop with tablet and phone, or a full responsive line-up), drop a screenshot on each device, drag to orbit the camera, then export a sharp PNG for Dribbble, Behance, your landing page or the App Store.</p>
  <p class="mute">The devices are generic models drawn with WebGL in your browser, so screenshots never leave your computer. Share links save the scene and settings, not your images.</p>`,
  faq: [
    ["How do I make a phone mockup from a screenshot?", "Choose a phone scene, then upload, paste (⌘V or Ctrl+V) or drop your screenshot. It fills the screen automatically. Drag the preview to change the angle and download a PNG."],
    ["Can I put different screenshots on each device?", "Yes. Every device in a scene has its own screen slot. Select a slot under the preview, then upload or paste the image for that device."],
    ["Which sizes can I export?", "Dribbble 4:3 (1600 × 1200), 16:9 (1920 × 1080), Open Graph (1200 × 630), square, Instagram 4:5, App Store 6.7-inch (1290 × 2796) and Google Play (1080 × 1920), at 1× or 2×, as PNG, JPG or WebP. Turn the background off for a transparent PNG."],
    ["Are these real Apple or Samsung device frames?", "No. They are generic, brand-free devices modelled for NiceUI, so you can use the mockups anywhere without trademark worries."],
  ],
  body: ({ icon }) => `
    <div class="ds" data-ds>
      <div class="ds-main">
        <div class="ds-stage" data-ds-stage>
          <canvas class="ds-canvas" data-ds-canvas aria-label="Device mockup preview. Drag to orbit."></canvas>
          <div class="ds-drop" data-ds-drop hidden><span>Drop screenshot on the selected device</span></div>
          <p class="ds-nogl" data-ds-nogl hidden>Device Studio needs WebGL, which is turned off in this browser.</p>
          <div class="ds-stage-bar">
            <div class="ds-sizes" role="group" aria-label="Canvas size">${SIZES.map(([v, l]) => `<button type="button" data-ds-set="size" data-ds-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
          </div>
          <span class="ds-hint">Drag to orbit</span>
        </div>
        <div class="ds-src">
          <div class="ds-slots" data-ds-slots role="radiogroup" aria-label="Device screens"></div>
          <span class="ds-div" aria-hidden="true"></span>
          <div class="ds-samples" data-ds-samples aria-label="Sample screenshots"></div>
          <label class="ds-upload">
            <input type="file" accept="image/*" data-ds-file />
            <span>${icon.arrow} Upload</span>
          </label>
        </div>
      </div>

      <aside class="ds-side" aria-label="Controls">
        <div class="ds-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Scene</h2><button type="button" class="gm-ghost" data-ds-reset>Reset</button></div>
            <div class="ds-scenes" data-ds-scenes></div>
          </section>
          <section class="gm-card">
            <h2>Camera</h2>
            <div class="ds-angles" data-ds-angles></div>
            ${rng("yaw", "Turn", -80, 80, 1, -20, "-20°")}
            ${rng("pitch", "Tilt", -30, 80, 1, 12, "12°")}
            ${rng("roll", "Roll", -30, 30, 1, 0, "0°")}
            ${rng("fov", "Perspective", 4, 60, 1, 26, "26°")}
            ${rng("pad", "Padding", 0, 40, 1, 12, "12%")}
          </section>
          <section class="gm-card">
            <h2>Device</h2>
            <span class="ds-lab">Finish</span>
            <div class="ds-finishes" data-ds-finishes></div>
            <div data-ds-only="laptop">${rng("lid", "Lid angle", 70, 135, 1, 108, "108°")}</div>
            <div data-ds-only="watch"><span class="ds-lab">Band</span><div class="ds-finishes" data-ds-bands></div></div>
            <div data-ds-only="browser">
              ${seg("chrome", [["light", "Light"], ["dark", "Dark"]])}
              <label class="ds-field"><span>Address</span><input data-ds-text="url" maxlength="40" spellcheck="false" /></label>
            </div>
            ${seg("fit", [["top", "Fill top"], ["center", "Fill centre"], ["contain", "Fit"]])}
            <label class="ds-check"><input type="checkbox" data-ds-in="glare" /> <span>Screen glare</span></label>
          </section>
          <section class="gm-card">
            <h2>Background</h2>
            <div class="ds-bgs" data-ds-bgs></div>
            <div class="ds-row2">
              <label class="gm-row"><span>Colour 1</span><input type="color" data-ds-in="bg1" aria-label="Background colour 1" /></label>
              <label class="gm-row"><span>Colour 2</span><input type="color" data-ds-in="bg2" aria-label="Background colour 2" /></label>
            </div>
            ${rng("shadow", "Shadow", 0, 100, 1, 55, "55%")}
          </section>
          <section class="gm-card">
            <h2>Caption</h2>
            ${seg("cap", [["none", "None"], ["top", "Top"], ["bottom", "Bottom"], ["left", "Left"]])}
            <label class="ds-field"><span>Headline</span><input data-ds-text="title" maxlength="80" /></label>
            <label class="ds-field"><span>Subtext</span><input data-ds-text="sub" maxlength="120" /></label>
          </section>
        </div>
        <section class="ds-export">
          <div class="ds-export-row">
            ${seg("fmt", [["png", "PNG"], ["jpg", "JPG"], ["webp", "WebP"]])}
            ${seg("scale", [["1", "1×"], ["2", "2×"]])}
          </div>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-ds-download>${icon.arrow} Download <span data-ds-dim></span></button>
            <button type="button" class="btn btn-cmd" data-ds-copy>Copy</button>
            <button type="button" class="btn btn-cmd" data-ds-share>Share</button>
          </div>
          <p class="gm-note">Rendered in your browser. Screenshots are never uploaded.</p>
        </section>
      </aside>
    </div>`,
};
