// Type Scale Generator: fluid clamp() type and spacing scales with one-click, dependency-free export.
// The site build turns this into the full-screen page at /apps/type-scale.

const RATIOS = [
  ["1.067", "Minor second · 1.067"],
  ["1.125", "Major second · 1.125"],
  ["1.2", "Minor third · 1.2"],
  ["1.25", "Major third · 1.25"],
  ["1.333", "Perfect fourth · 1.333"],
  ["1.414", "Augmented fourth · 1.414"],
  ["1.5", "Perfect fifth · 1.5"],
  ["1.618", "Golden ratio · 1.618"],
  ["custom", "Custom…"],
];

const num = (attr, label, min, max, step, val, unit) =>
  `<label class="ts-num"><span>${label}</span><span class="ts-num-in"><input type="number" data-ts-in="${attr}" min="${min}" max="${max}" step="${step}" value="${val}" inputmode="decimal" /><i>${unit}</i></span></label>`;
const rng = (attr, label, min, max, step, val, fmt) =>
  `<label class="gm-rng"><span>${label}<output data-ts-out="${attr}">${fmt}</output></span><input type="range" data-ts-in="${attr}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;
const ratioSel = (attr, val) =>
  `<label class="ts-num ts-ratio"><span>${attr === "ratioMin" ? "At min" : "At max"}</span><select data-ts-in="${attr}Sel" aria-label="Scale ratio ${attr === "ratioMin" ? "at the minimum viewport" : "at the maximum viewport"}">${RATIOS.map(([v, l]) => `<option value="${v}"${v === val ? " selected" : ""}>${l}</option>`).join("")}</select><input type="number" data-ts-in="${attr}" min="1.01" max="2" step="0.001" value="${val}" aria-label="Custom ratio" hidden /></label>`;
const seg = (attr, label, opts, val) =>
  `<div class="ts-field"><span class="ts-lbl">${label}</span><div class="gm-seg ts-seg" role="group" aria-label="${label}" style="grid-template-columns:repeat(${opts.length},1fr)">${opts.map(([v, l]) => `<button type="button" data-ts-seg="${attr}" data-v="${v}" aria-pressed="${v === val}">${l}</button>`).join("")}</div></div>`;

export default {
  slug: "type-scale",
  name: "Type Scale Generator",
  blurb: "Fluid type and spacing scales with clamp(): set sizes for small and large screens, preview them live, then copy CSS variables or a Tailwind font size config.",
  chips: ["clamp()", "Tailwind v3 & v4", "Fluid spacing", "No dependencies"],
  preview: `radial-gradient(at 15% 20%, rgba(14,165,233,.35) 0px, transparent 55%), radial-gradient(at 85% 80%, rgba(167,139,250,.25) 0px, transparent 55%), #05070a`,
  title: "Fluid Type Scale Generator — clamp() Font Sizes & Tailwind Font Size Config | NiceUI",
  description: "Free fluid type scale generator: responsive clamp() font sizes and spacing for any viewport range. Copy CSS variables or a Tailwind font size config in one click.",
  about: `<p class="lede">Fluid typography scales smoothly between a small and a large screen instead of jumping at breakpoints. Pick a base size and a ratio for each end, check the result with the viewport slider, then copy CSS custom properties, utility classes, a Tailwind v3 or v4 config, or JSON tokens. Everything uses rem, so text still respects the reader's browser font size.</p>`,
  faq: [
    ["How does clamp() make font sizes fluid?", "clamp(min, preferred, max) picks the preferred value but never goes below the minimum or above the maximum. The preferred value mixes rem and vw, so the size grows in a straight line from the minimum viewport to the maximum viewport and stays fixed outside that range."],
    ["How do I use a fluid type scale in Tailwind CSS?", "Copy the Tailwind v3 config into theme.extend, or the Tailwind v4 @theme block into your CSS. Classes like text-xl and text-4xl then use the fluid sizes, with matching line height and letter spacing."],
    ["What scale ratio should I choose?", "Smaller ratios such as 1.125 to 1.2 suit dense interfaces and dashboards. Larger ratios such as 1.25 to 1.333 give marketing pages more dramatic headings. Using a smaller ratio on phones and a larger one on desktop keeps big headings from overflowing small screens."],
    ["Is fluid typography accessible?", "Yes, as long as sizes use rem and the minimum body size stays at least 16px. Because the output uses rem plus a small vw part, text still scales when people zoom or change their browser font size."],
  ],
  body: () => `
<div class="ts" data-ts>
  <div class="ts-main">
    <div class="ts-bar">
      <div class="gm-tabs ts-view" role="tablist" aria-label="Preview">
        <button type="button" role="tab" data-ts-view="specimen" aria-selected="true">Specimen</button>
        <button type="button" role="tab" data-ts-view="page" aria-selected="false">Sample page</button>
        <button type="button" role="tab" data-ts-view="space" aria-selected="false">Spacing</button>
      </div>
      <label class="ts-vw"><span>Viewport <output data-ts-vw-out>1280px</output></span><input type="range" data-ts-vw min="320" max="1920" step="1" value="1280" aria-label="Preview viewport width" /><span class="ts-vw-marks" data-ts-marks></span></label>
    </div>
    <div class="ts-stage" data-ts-stage>
      <div class="ts-frame" data-ts-frame>
        <div class="ts-doc" data-ts-doc></div>
      </div>
    </div>
  </div>

  <aside class="ts-side" aria-label="Controls">
    <div class="ts-scroll">
      <section class="gm-card">
        <div class="ts-head"><h2>Presets</h2><button type="button" class="gm-ghost" data-ts-reset>Reset</button></div>
        <div class="ts-presets" data-ts-presets></div>
      </section>
      <section class="gm-card">
        <h2>Viewport range</h2>
        <div class="ts-pair">${num("vwMin", "Min width", 240, 1200, 1, 360, "px")}${num("vwMax", "Max width", 600, 2560, 1, 1280, "px")}</div>
      </section>
      <section class="gm-card">
        <h2>Base size</h2>
        <div class="ts-pair">${num("baseMin", "At min", 10, 32, 0.5, 16, "px")}${num("baseMax", "At max", 10, 40, 0.5, 18, "px")}</div>
        <p class="ts-warn" data-ts-warn hidden></p>
      </section>
      <section class="gm-card">
        <h2>Scale ratio</h2>
        <div class="ts-pair">${ratioSel("ratioMin", "1.2")}${ratioSel("ratioMax", "1.25")}</div>
      </section>
      <section class="gm-card">
        <h2>Steps</h2>
        <div class="ts-pair">${num("down", "Smaller", 0, 3, 1, 2, "")}${num("up", "Larger", 1, 9, 1, 6, "")}</div>
        ${seg("names", "Names", [["tw", "xs, sm, base…"], ["step", "step-0…"], ["h", "h6–h1"]], "tw")}
      </section>
      <section class="gm-card">
        <h2>Type</h2>
        ${seg("font", "Font", [["geist", "Geist"], ["system", "System"], ["serif", "Serif"], ["mono", "Mono"]], "geist")}
        ${rng("lhBody", "Body line height", 1.3, 1.9, 0.05, 1.6, "1.60")}
        ${rng("lhHead", "Heading line height", 0.95, 1.4, 0.05, 1.1, "1.10")}
        <label class="gm-row ts-check"><span>Tighten tracking on large text</span><input type="checkbox" data-ts-in="track" checked /></label>
      </section>
      <section class="gm-card">
        <h2>Spacing</h2>
        <label class="gm-row ts-check"><span>Include a fluid spacing scale</span><input type="checkbox" data-ts-in="spacing" checked /></label>
        <p class="gm-tip">3xs to 3xl, from the same base sizes. Shown in the Spacing tab.</p>
      </section>
    </div>
    <section class="gm-card gm-export ts-export">
      <div class="gm-tabs ts-tabs" role="tablist" aria-label="Export format">
        <button type="button" role="tab" data-ts-tab="css" aria-selected="true">CSS</button>
        <button type="button" role="tab" data-ts-tab="classes" aria-selected="false">Classes</button>
        <button type="button" role="tab" data-ts-tab="tw3" aria-selected="false">TW v3</button>
        <button type="button" role="tab" data-ts-tab="tw4" aria-selected="false">TW v4</button>
        <button type="button" role="tab" data-ts-tab="json" aria-selected="false">JSON</button>
      </div>
      <pre class="gm-code"><code data-ts-code></code></pre>
      <div class="gm-actions">
        <button type="button" class="btn btn-sky" data-ts-copy><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg> <span data-ts-copy-label>Copy CSS</span></button>
        <button type="button" class="btn btn-cmd" data-ts-share>Share</button>
      </div>
      <p class="gm-note">Plain CSS, rem + vw, no dependencies. Exports use vw; the preview uses container units so the slider works.</p>
    </section>
  </aside>
</div>`,
};
