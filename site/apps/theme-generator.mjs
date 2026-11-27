// NiceUI Theme Generator: shadcn / Tailwind themes from one brand colour.
const PRESETS = [
  ["Sky", "#0ea5e9", "zinc"],
  ["Violet", "#7c3aed", "slate"],
  ["Emerald", "#10b981", "stone"],
  ["Rose", "#e11d48", "neutral"],
  ["Amber", "#f59e0b", "stone"],
  ["Indigo", "#4f46e5", "slate"],
  ["Ocean", "#0d9488", "tinted"],
  ["Mono", "#18181b", "neutral"],
];

const rng = (attr, label, min, max, step, val, out) =>
  `<label class="tg-rng"><span>${label}<output data-tg-out="${attr}">${out}</output></span><input type="range" data-tg-${attr} min="${min}" max="${max}" step="${step}" value="${val}" /></label>`;

export default {
  slug: "theme-generator",
  name: "Theme Generator",
  blurb: "Turn one brand colour into a complete light and dark shadcn / Tailwind theme, checked for contrast and previewed on a live app.",
  chips: ["shadcn", "Tailwind v3 & v4", "Light & dark", "OKLCH", "No dependencies"],
  preview:
    "radial-gradient(at 20% 25%, #0ea5e9 0px, transparent 50%), radial-gradient(at 80% 20%, #7c3aed 0px, transparent 50%), radial-gradient(at 30% 85%, #10b981 0px, transparent 50%), radial-gradient(at 85% 80%, #f59e0b 0px, transparent 50%), #09090b",
  title: "shadcn Theme Generator — Tailwind Light & Dark Theme from One Colour | NiceUI",
  description:
    "Free shadcn theme generator: pick a brand colour and get light and dark tokens in OKLCH or HSL, a Tailwind v3 config or v4 @theme, contrast-checked and copied in one click.",
  about:
    "<p>Pick a brand colour and the Theme Generator builds every shadcn/ui design token for light and dark mode: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, five chart colours and a 50–950 brand scale. Colours are computed in OKLCH so lightness stays even across hues, and every key text pair is checked against WCAG contrast.</p><p>Copy the result as shadcn v4 CSS (OKLCH), shadcn v3 CSS (HSL), a Tailwind v3 config, a Tailwind v4 <code>@theme</code> block or plain JSON tokens. Nothing to install.</p>",
  faq: [
    ["How do I use the generated theme with shadcn/ui?", "Paste the CSS into your global stylesheet (app/globals.css), replacing the existing :root and .dark blocks. Use the v4 (OKLCH) export for Tailwind v4 projects and the v3 (HSL) export for Tailwind v3 projects."],
    ["What is OKLCH and why use it?", "OKLCH is a colour space where equal steps in lightness look equally bright to people, whatever the hue. That makes generated scales and light/dark themes far more even than HSL."],
    ["Are the colours accessible?", "Foreground colours are picked by contrast, and the panel shows the WCAG ratio for the main text pairs with AA and AAA badges, so you can see at a glance whether text is readable."],
    ["Does this work without shadcn?", "Yes. The Tailwind exports and JSON tokens work in any Tailwind or CSS-variable based project, and the brand scale can be used on its own."],
  ],
  body: ({ icon }) => `
    <div class="tg" data-tg>
      <div class="tg-main">
        <div class="tg-toolbar">
          <div class="tg-seg" role="group" aria-label="Preview theme"><button type="button" data-tg-mode="light" aria-pressed="false">Light</button><button type="button" data-tg-mode="dark" aria-pressed="true">Dark</button></div>
          <div class="tg-scale" data-tg-scale aria-label="Brand scale"></div>
        </div>
        <div class="tg-pv-wrap">
          <div class="tg-pv" data-tg-pv>
            <div class="tg-app">
              <aside class="tg-nav">
                <div class="tg-logo"><span class="tg-logo-mark"></span><b>Acme</b></div>
                <a class="on">Dashboard</a><a>Projects</a><a>Customers</a><a>Reports</a><a>Settings</a>
                <div class="tg-nav-card"><b>Upgrade to Pro</b><span>Unlock unlimited projects and priority support.</span><button class="tg-btn tg-btn-p tg-btn-sm">Upgrade</button></div>
              </aside>
              <div class="tg-content">
                <header class="tg-head">
                  <div><h3>Dashboard</h3><p>Here is how your workspace is doing this week.</p></div>
                  <div class="tg-head-r"><button class="tg-btn tg-btn-o">Export</button><button class="tg-btn tg-btn-p">New project</button></div>
                </header>
                <div class="tg-tabs" role="tablist"><span class="on">Overview</span><span>Analytics</span><span>Reports</span><span>Notifications</span></div>
                <div class="tg-kpis">
                  <div class="tg-card"><span class="tg-k">Revenue</span><b>$45,231</b><span class="tg-up">+20.1% from last month</span></div>
                  <div class="tg-card"><span class="tg-k">Subscriptions</span><b>+2,350</b><span class="tg-up">+18.4% from last month</span></div>
                  <div class="tg-card"><span class="tg-k">Active now</span><b>573</b><span class="tg-mute">+201 since last hour</span></div>
                </div>
                <div class="tg-grid">
                  <div class="tg-card tg-chart">
                    <div class="tg-card-h"><b>Overview</b><span class="tg-badge">Monthly</span></div>
                    <div class="tg-bars">${[42, 68, 55, 80, 62, 90, 74, 58, 84, 70, 96, 66].map((h, i) => `<i style="height:${h}%;--c:var(--chart-${(i % 5) + 1})"></i>`).join("")}</div>
                  </div>
                  <div class="tg-card tg-form">
                    <div class="tg-card-h"><b>Invite your team</b></div>
                    <label class="tg-lbl">Email<input class="tg-input" value="ana@acme.com" readonly /></label>
                    <label class="tg-lbl">Role<span class="tg-input tg-select">Editor</span></label>
                    <label class="tg-check"><span class="tg-box"></span>Send a welcome email</label>
                    <div class="tg-row"><button class="tg-btn tg-btn-s">Cancel</button><button class="tg-btn tg-btn-p">Send invite</button></div>
                  </div>
                </div>
                <div class="tg-alert"><b>Heads up!</b><span>Your trial ends in 3 days. Add a payment method to keep your projects.</span><button class="tg-btn tg-btn-d tg-btn-sm">Delete trial data</button></div>
                <div class="tg-card tg-table">
                  <div class="tg-card-h"><b>Recent sales</b><span class="tg-mute">You made 265 sales this month.</span></div>
                  ${[["Olivia Martin", "olivia@email.com", "Paid", "+$1,999.00"], ["Jackson Lee", "jackson@email.com", "Pending", "+$39.00"], ["Isabella Nguyen", "isabella@email.com", "Paid", "+$299.00"], ["William Kim", "will@email.com", "Refunded", "-$99.00"]]
                    .map(([n, e, s, a]) => `<div class="tg-tr"><span class="tg-av">${n.split(" ").map((x) => x[0]).join("")}</span><span class="tg-who"><b>${n}</b><i>${e}</i></span><span class="tg-pill tg-pill-${s.toLowerCase()}">${s}</span><b class="tg-amt">${a}</b></div>`)
                    .join("")}
                </div>
              </div>
              <div class="tg-dialog">
                <b>Delete project?</b>
                <p>This permanently removes the project and its files. This can’t be undone.</p>
                <div class="tg-row"><button class="tg-btn tg-btn-o tg-btn-sm">Cancel</button><button class="tg-btn tg-btn-d tg-btn-sm">Delete</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="tg-side" aria-label="Theme controls">
        <div class="tg-scroll">
          <section class="tg-sec">
            <h2>Presets</h2>
            <div class="tg-presets">${PRESETS.map(([n, c, b], i) => `<button type="button" data-tg-preset="${i}" data-c="${c}" data-b="${b}" title="${n}"><i style="background:${c}"></i>${n}</button>`).join("")}</div>
            <button type="button" class="tg-ghost" data-tg-random>Random theme</button>
          </section>
          <section class="tg-sec">
            <h2>Brand colour</h2>
            <div class="tg-brand"><input type="color" data-tg-brand aria-label="Brand colour" /><input class="tg-hex" data-tg-hex maxlength="7" spellcheck="false" aria-label="Brand colour hex" /></div>
          </section>
          <section class="tg-sec">
            <h2>Neutral base</h2>
            <div class="tg-chips" role="group" aria-label="Neutral base">${["slate", "gray", "zinc", "neutral", "stone", "tinted"].map((b) => `<button type="button" data-tg-base="${b}" aria-pressed="false">${b === "tinted" ? "Tinted" : b[0].toUpperCase() + b.slice(1)}</button>`).join("")}</div>
          </section>
          <section class="tg-sec">
            <h2>Shape &amp; type</h2>
            ${rng("radius", "Radius", 0, 1.25, 0.025, 0.625, "0.625rem")}
            ${rng("contrast", "Contrast", -1, 1, 0.1, 0, "0")}
            <div class="tg-chips" role="group" aria-label="Font pairing">${[["geist", "Geist"], ["inter", "Inter"], ["system", "System"], ["serif", "Serif headings"]].map(([k, l]) => `<button type="button" data-tg-font="${k}" aria-pressed="false">${l}</button>`).join("")}</div>
          </section>
          <section class="tg-sec">
            <h2>Contrast check <span class="tg-sub" data-tg-mode-label>dark</span></h2>
            <div class="tg-contrast" data-tg-contrast></div>
          </section>
          <section class="tg-sec">
            <h2>Tokens <span class="tg-sub" data-tg-mode-label>dark</span></h2>
            <div class="tg-tokens" data-tg-tokens></div>
          </section>
        </div>
        <section class="tg-export">
          <div class="tg-tabs-x" role="tablist" aria-label="Export format">${[["v4", "shadcn v4"], ["v3", "shadcn v3"], ["tw3", "TW v3"], ["tw4", "TW v4"], ["json", "JSON"]].map(([k, l], i) => `<button type="button" role="tab" data-tg-tab="${k}" aria-selected="${i === 0}">${l}</button>`).join("")}</div>
          <pre class="tg-code"><code data-tg-code></code></pre>
          <div class="tg-actions">
            <button type="button" class="btn btn-sky" data-tg-copy>${icon.copy} Copy <span data-tg-copy-label>shadcn v4 CSS</span></button>
            <button type="button" class="btn btn-cmd" data-tg-share>Share</button>
          </div>
        </section>
      </aside>
    </div>`,
};
