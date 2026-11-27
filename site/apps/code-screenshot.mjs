// Code Screenshot: beautiful images of code with a built-in highlighter, themes,
// line highlights, diff mode and crisp canvas-rendered PNG/SVG export.
// The site build turns this into the full-screen page at /apps/code-screenshot.

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-cs-out="${key}">${fmt}</output></span><input type="range" data-cs-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const seg = (key, items, label) =>
  `<div class="gm-seg cs-seg" role="group" aria-label="${label}" style="grid-template-columns:repeat(${items.length},1fr)">${items.map(([v, l]) => `<button type="button" data-cs-set="${key}" data-cs-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;
const tog = (key, label) => `<label class="cs-check"><input type="checkbox" data-cs-in="${key}" /> <span>${label}</span></label>`;

const LANGS = [
  ["auto", "Auto-detect"],
  ["tsx", "TSX"],
  ["ts", "TypeScript"],
  ["jsx", "JSX"],
  ["js", "JavaScript"],
  ["python", "Python"],
  ["html", "HTML"],
  ["css", "CSS"],
  ["json", "JSON"],
  ["bash", "Bash / shell"],
  ["go", "Go"],
  ["rust", "Rust"],
  ["java", "Java"],
  ["c", "C / C++ / C#"],
  ["sql", "SQL"],
  ["markdown", "Markdown"],
  ["yaml", "YAML"],
  ["text", "Plain text"],
];
const SIZES = [
  ["auto", "Auto"],
  ["x", "X post"],
  ["linkedin", "LinkedIn"],
  ["slide", "Slide 16:9"],
  ["square", "Square"],
];

export default {
  slug: "code-screenshot",
  name: "Code Screenshot",
  blurb: "Turn code into beautiful images: 17 languages highlighted, 10 themes, line highlights and diff mode, gradient backgrounds, then export a razor-sharp PNG up to 4×, SVG or an HTML embed.",
  chips: ["17 languages", "Diff mode", "PNG up to 4×", "No sign-up"],
  preview: "linear-gradient(135deg,#38bdf8,#6366f1)",
  title: "Code Screenshot Generator — Beautiful Code Images (PNG, SVG) | NiceUI",
  description: "Free code screenshot generator: paste code, pick a theme and background, highlight lines or show a diff, then export a sharp PNG (up to 4×), SVG or HTML embed for X, LinkedIn, slides and docs.",
  about: `<p class="lede">Code Screenshot makes clean, shareable images of code for posts, docs, slides and READMEs. Paste or drop a file, and the language is detected and highlighted. Pick one of 10 themes and a background, click line numbers to spotlight the lines that matter, or switch on diff mode for added and removed lines. Then download a PNG at up to 4× resolution, an SVG, or a copy-paste HTML embed.</p>
  <p class="mute">Everything runs in your browser. Your code is never uploaded, and share links carry the code inside the link itself.</p>`,
  faq: [
    ["How do I make a screenshot of my code?", "Paste your code into the editor (or press ⌘V / Ctrl+V anywhere on the page, or drop a file onto the preview). Choose a theme, background and window style, then click Download PNG. Use 2× or 4× for crisp images on high-density screens and slides."],
    ["Which languages are highlighted?", "TypeScript, TSX, JavaScript, JSX, Python, HTML, CSS, JSON, Bash, Go, Rust, Java, C, C++, C#, SQL, Markdown and YAML. Auto-detect picks the language as you type, or you can choose it yourself."],
    ["How do I highlight specific lines?", "Click a line number to spotlight that line; the others are dimmed. Click more numbers to add lines, or click again to remove one. Diff mode colours lines that start with + green and lines that start with - red."],
    ["Is the image sharp enough for slides?", "Yes. The PNG is drawn directly at the chosen scale (1×, 2× or 4×) instead of being a screenshot of the page, so text stays crisp. For print or further editing, export the SVG."],
  ],
  body: ({ icon }) => `
    <div class="cs" data-cs>
      <div class="cs-main">
        <div class="cs-stage" data-cs-stage>
          <div class="cs-fit" data-cs-fit>
            <div class="cs-frame" data-cs-frame>
              <div class="cs-window" data-cs-window>
                <div class="cs-bar" data-cs-bar>
                  <span class="cs-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                  <input class="cs-title" data-cs-text="title" placeholder="Untitled" spellcheck="false" aria-label="File name" maxlength="60" />
                </div>
                <div class="cs-body" data-cs-body>
                  <div class="cs-bands" data-cs-bands aria-hidden="true"></div>
                  <div class="cs-gutter" data-cs-gutter role="group" aria-label="Line numbers: click to highlight a line"></div>
                  <div class="cs-code">
                    <pre class="cs-pre" data-cs-pre aria-hidden="true"></pre>
                    <textarea class="cs-ta" data-cs-ta spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code. Press Escape, then Tab, to leave the editor."></textarea>
                  </div>
                </div>
              </div>
              <span class="cs-mark" data-cs-mark>niceui.dev</span>
            </div>
          </div>
          <div class="cs-drop" data-cs-drop hidden><span>Drop a code file</span></div>
          <div class="cs-stage-bar">
            <div class="cs-sizes" role="group" aria-label="Image size">${SIZES.map(([v, l]) => `<button type="button" data-cs-set="canvas" data-cs-val="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
          </div>
          <span class="cs-hint">Click line numbers to spotlight · paste or drop code anywhere</span>
        </div>
      </div>

      <aside class="cs-side" aria-label="Controls">
        <div class="cs-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Code</h2><button type="button" class="gm-ghost" data-cs-reset>Reset</button></div>
            <label class="cs-field"><span>Language <em data-cs-detected></em></span>
              <select data-cs-lang aria-label="Language">${LANGS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>
            </label>
            <span class="cs-lab">Theme</span>
            <div class="cs-themes" data-cs-themes role="radiogroup" aria-label="Theme"></div>
          </section>
          <section class="gm-card">
            <h2>Window</h2>
            ${seg("win", [["mac", "Dots"], ["minimal", "Minimal"], ["none", "None"]], "Window style")}
            <label class="cs-field"><span>Font</span>
              <select data-cs-font aria-label="Font">
                <option value="jetbrains">JetBrains Mono</option>
                <option value="geist">Geist Mono</option>
                <option value="system">System mono</option>
              </select>
            </label>
            ${rng("size", "Font size", 11, 24, 1, 15, "15px")}
            ${rng("radius", "Corner radius", 0, 24, 1, 14, "14px")}
            ${seg("widthMode", [["auto", "Auto width"], ["fixed", "Fixed width"]], "Window width")}
            <div data-cs-only="fixed">${rng("width", "Width", 360, 1400, 10, 720, "720px")}</div>
            <div class="cs-toggles">
              ${tog("lineNumbers", "Line numbers")}
              ${tog("diff", "Diff mode (+ / − lines)")}
            </div>
          </section>
          <section class="gm-card">
            <h2>Background</h2>
            <div class="cs-bgs" data-cs-bgs role="radiogroup" aria-label="Background"></div>
            <label class="gm-row" data-cs-only="solid"><span>Colour</span><input type="color" data-cs-in="bgColor" aria-label="Background colour" /></label>
            ${rng("pad", "Padding", 0, 160, 4, 56, "56px")}
            <div class="cs-toggles">
              ${tog("shadow", "Window shadow")}
              ${tog("watermark", "Watermark")}
            </div>
          </section>
        </div>
        <section class="cs-export">
          ${seg("scale", [["1", "1×"], ["2", "2×"], ["4", "4×"]], "Export scale")}
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-cs-png>${icon.arrow} PNG <span data-cs-dim></span></button>
            <button type="button" class="btn btn-cmd" data-cs-copy>${icon.copy} Copy</button>
          </div>
          <div class="gm-actions cs-actions2">
            <button type="button" class="btn btn-cmd" data-cs-svg>SVG</button>
            <button type="button" class="btn btn-cmd" data-cs-embed>Embed HTML</button>
            <button type="button" class="btn btn-cmd" data-cs-share>Share link</button>
          </div>
          <p class="gm-note">Drawn in your browser. Your code is never uploaded.</p>
        </section>
      </aside>
    </div>`,
};
