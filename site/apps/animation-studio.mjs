// Animation Studio: easing curves (cubic-bezier + spring → CSS linear()) and keyframe
// animations with one-click, dependency-free export. The site build turns this into
// the full-screen page at /apps/animation-studio.

const PRESETS = [
  ["Entrance", [["fade-up", "Fade up"], ["fade-down", "Fade down"], ["scale-in", "Scale in"], ["blur-in", "Blur in"], ["slide-left", "Slide left"], ["slide-right", "Slide right"], ["flip-in", "Flip in"], ["reveal", "Reveal"]]],
  ["Attention", [["bounce", "Bounce"], ["shake", "Shake"], ["pulse", "Pulse"], ["wiggle", "Wiggle"], ["float", "Float"], ["spin", "Spin"]]],
  ["Exit", [["fade-out", "Fade out"], ["zoom-out", "Zoom out"]]],
];
const EASES = [
  ["ease", "Ease"],
  ["ease-out", "Ease out"],
  ["ease-in-out", "Ease in-out"],
  ["out-expo", "Out expo"],
  ["out-quint", "Out quint"],
  ["in-out-quart", "In-out quart"],
  ["out-back", "Out back"],
  ["in-back", "In back"],
  ["snappy", "Snappy"],
  ["linear", "Linear"],
];

const rng = (key, label, min, max, step, val, fmt) =>
  `<label class="gm-rng" data-an-row="${key}"><span>${label}<output data-an-out="${key}">${fmt}</output></span><input type="range" data-an-in="${key}" min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;

const seg = (key, opts, cls = "") =>
  `<div class="gm-seg an-seg ${cls}" role="group" aria-label="${key}" data-an-seg="${key}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="false">${l}</button>`).join("")}</div>`;

export default {
  slug: "animation-studio",
  name: "Animation Studio",
  blurb: "Design CSS easing curves and springs, build keyframe animations from 16 presets, preview them live, then copy CSS, Tailwind or a React hook in one click.",
  chips: ["Cubic-bezier", "Spring → linear()", "16 presets", "No dependencies"],
  preview:
    "background:radial-gradient(circle at 20% 80%,rgba(125,211,252,.28),transparent 55%),radial-gradient(circle at 80% 20%,rgba(167,139,250,.22),transparent 55%),#05070a",
  title: "CSS Animation Generator & Cubic-Bezier Easing Editor — Animation Studio | NiceUI",
  description: "Free CSS animation generator: edit cubic-bezier curves and springs (CSS linear()), build keyframe animations from presets and copy CSS, Tailwind or React.",
  about: `<p class="lede">Animation Studio is a free CSS animation generator and easing editor. Drag a cubic-bezier curve or tune a physical spring, pick one of 16 keyframe presets (fade, scale, blur, slide, flip, bounce, shake, pulse and more), adjust timing and distance, and watch it play on a card, button, headline, icon or a staggered list.</p>
<p class="mute">Every export is plain code with no libraries: CSS keyframes with an easing variable, a Tailwind config snippet or arbitrary-value classes, a small React hook built on the Web Animations API, or just the easing value. All of it switches off for people who prefer reduced motion.</p>`,
  faq: [
    ["What is a cubic-bezier easing?", "A cubic-bezier(x1, y1, x2, y2) easing describes how an animation speeds up and slows down. The two control points shape the curve; values outside 0–1 on the y axis create overshoot, like a back or bounce effect."],
    ["How do spring animations work in CSS?", "CSS has no spring function, but the linear() easing can trace any curve. Animation Studio simulates a real spring (stiffness, damping, mass) and samples it into a linear() value, and suggests the duration the spring needs to settle."],
    ["Can I use the animations in Tailwind CSS?", "Yes. Copy the tailwind.config snippet to get classes like animate-fade-up, or use the arbitrary-value classes such as animate-[fade-up_700ms_cubic-bezier(0.16,1,0.3,1)_both] together with the keyframes in your CSS."],
    ["Do the exports respect reduced motion?", "Yes. The CSS export disables the animation inside a prefers-reduced-motion media query, the Tailwind usage adds motion-reduce:animate-none, and the React hook skips animating when the user prefers reduced motion."],
  ],
  body: ({ icon }) => `
    <div class="an" data-an>
      <div class="an-main">
        <div class="an-stage" data-an-stage>
          <div class="an-targets">
            <div class="an-t an-card" data-an-target="card"><span class="an-card-tag">New release</span><p class="an-card-h">Motion that feels considered.</p><p class="an-card-p">Timing, easing and distance, tuned by eye.</p><span class="an-card-btn">Get started</span></div>
            <button type="button" class="an-t an-btn" data-an-target="button" hidden tabindex="-1">Join the waitlist ${icon.arrow}</button>
            <p class="an-t an-head" data-an-target="headline" hidden>Animate with intent.</p>
            <div class="an-t an-icon" data-an-target="icon" hidden><svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg></div>
            <div class="an-list" data-an-target="list" hidden>${["Design review", "Ship the beta", "Write the changelog", "Plan the launch", "Celebrate"].map((t, i) => `<div class="an-row"><span class="an-dot" style="--h:${190 + i * 25}"></span><span>${t}</span><span class="an-row-m">${i + 1}</span></div>`).join("")}</div>
          </div>
          <div class="an-stage-bar">
            <div class="an-pill" role="group" aria-label="Preview target" data-an-seg="target">${[["card", "Card"], ["button", "Button"], ["headline", "Text"], ["icon", "Icon"], ["list", "List"]].map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="false">${l}</button>`).join("")}</div>
            <button type="button" class="an-replay" data-an-replay><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>Replay</button>
          </div>
        </div>
        <div class="an-curve-strip">
          <div class="an-curve-box">
            <svg class="an-curve" data-an-curve viewBox="0 0 240 240" role="img" aria-label="Easing curve editor">
              <rect x="20" y="50" width="200" height="140" class="an-grid-bg" />
              <path class="an-grid" d="M70 50V190M120 50V190M170 50V190M20 85H220M20 120H220M20 155H220" />
              <path class="an-diag" d="M20 190L220 50" />
              <line class="an-arm" data-an-arm="1" />
              <line class="an-arm" data-an-arm="2" />
              <path class="an-path" data-an-path />
              <circle class="an-marker" data-an-marker r="4" cx="20" cy="190" />
              <circle class="an-h" data-an-h="1" r="8" tabindex="0" role="slider" aria-label="First control point" />
              <circle class="an-h" data-an-h="2" r="8" tabindex="0" role="slider" aria-label="Second control point" />
            </svg>
            <code class="an-ease-val" data-an-ease-val></code>
          </div>
          <div class="an-compare">
            <p class="an-compare-h">Your easing vs linear</p>
            <div class="an-track"><span>Easing</span><i data-an-ball="ease"></i></div>
            <div class="an-track"><span>Linear</span><i data-an-ball="lin"></i></div>
            <p class="an-tip">Drag the two handles (or focus one and use the arrow keys, Shift for bigger steps). Values above 1 or below 0 overshoot.</p>
          </div>
        </div>
      </div>

      <aside class="an-side" aria-label="Controls">
        <div class="an-scroll">
          <section class="gm-card">
            <div class="gm-presets-head"><h2>Animation</h2><button type="button" class="gm-ghost" data-an-reset>Reset</button></div>
            ${PRESETS.map(([g, list]) => `<p class="an-group">${g}</p><div class="an-presets">${list.map(([id, l]) => `<button type="button" data-an-preset="${id}" aria-pressed="false"><span class="an-pdot" aria-hidden="true"></span>${l}</button>`).join("")}</div>`).join("")}
          </section>
          <section class="gm-card">
            <h2>Easing</h2>
            ${seg("easeMode", [["bezier", "Curve"], ["spring", "Spring"]])}
            <div data-an-show="bezier"><div class="gm-harm an-eases">${EASES.map(([id, l]) => `<button type="button" data-an-ease="${id}" aria-pressed="false">${l}</button>`).join("")}</div></div>
            <div data-an-show="spring">
              ${rng("k", "Stiffness", 20, 600, 1, 170, "170")}
              ${rng("c", "Damping", 2, 80, 1, 22, "22")}
              ${rng("m", "Mass", 0.2, 5, 0.1, 1, "1.0")}
              <p class="gm-tip" data-an-spring-note></p>
              <button type="button" class="gm-ghost" data-an-spring-dur>Use spring duration</button>
            </div>
          </section>
          <section class="gm-card">
            <h2>Timing</h2>
            ${rng("duration", "Duration", 100, 4000, 10, 700, "700ms")}
            ${rng("delay", "Delay", 0, 2000, 10, 0, "0ms")}
            <div class="gm-row"><span>Iterations</span>${seg("iter", [["1", "1"], ["2", "2"], ["3", "3"], ["infinite", "∞"]], "an-seg4")}</div>
            <div class="gm-row"><span>Direction</span>${seg("dir", [["normal", "Normal"], ["alternate", "Alternate"], ["reverse", "Reverse"]], "an-seg3")}</div>
            <div class="gm-row"><span>Fill mode</span>${seg("fill", [["both", "Both"], ["forwards", "Fwd"], ["backwards", "Back"], ["none", "None"]], "an-seg4")}</div>
          </section>
          <section class="gm-card" data-an-amounts>
            <h2>Amount</h2>
            ${rng("distance", "Distance", 0, 160, 1, 24, "24px")}
            ${rng("scale", "Scale", 0.3, 1.6, 0.01, 0.92, "0.92")}
            ${rng("rotate", "Rotation", 0, 180, 1, 12, "12°")}
            <div data-an-show-target="list">${rng("stagger", "Stagger", 0, 300, 5, 70, "70ms")}</div>
          </section>
        </div>
        <section class="an-export">
          <div class="gm-tabs" role="tablist" aria-label="Export format">${[["css", "CSS"], ["tailwind", "Tailwind"], ["react", "React"], ["easing", "Easing"]].map(([k, l], i) => `<button type="button" role="tab" data-an-tab="${k}" aria-selected="${i === 0}">${l}</button>`).join("")}</div>
          <pre class="gm-code"><code data-an-code></code></pre>
          <div class="gm-actions">
            <button type="button" class="btn btn-sky" data-an-copy>${icon.copy} <span data-an-copy-label>Copy CSS</span></button>
            <button type="button" class="btn btn-cmd" data-an-share>Share</button>
          </div>
          <p class="gm-note">Plain CSS, Tailwind or a React hook on the Web Animations API. No libraries, and motion turns off for prefers-reduced-motion.</p>
        </section>
      </aside>
    </div>`,
};
