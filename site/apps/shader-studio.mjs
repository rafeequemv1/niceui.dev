// Shader Studio: all 30 Paper Shaders (open source, Apache-2.0) live, with presets,
// generated controls and one-click export. The UI is a React island bundled by
// scripts/build-shader-studio.mjs into assets/shader-studio.js.
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

const DEFS = JSON.parse(readFileSync(new URL("../paper-shaders.json", import.meta.url), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default {
  slug: "shader-studio",
  name: "Shader Studio",
  blurb: "All 30 open-source Paper Shaders live: mesh and grain gradients, dithering, metaballs, liquid metal, halftone, fluted glass and more, with presets, full controls and dependency-free React or HTML export.",
  chips: ["30 shaders", "Presets", "Image filters", "No dependencies"],
  preview: "radial-gradient(60% 80% at 30% 30%,#7300ff,transparent 70%),radial-gradient(50% 70% at 75% 60%,#00bfff,transparent 70%),#05010f",
  title: "Shader Studio — Paper Shaders Playground with React & HTML Export | NiceUI",
  description: "Play with all 30 open-source Paper Shaders in the browser: mesh gradient, grain gradient, dithering, liquid metal, halftone, fluted glass and more. Copy dependency-free React or HTML.",
  about: `<p class="lede">Shader Studio runs every effect from <a class="ul" href="https://shaders.paper.design" rel="noopener">Paper Shaders</a>, the open-source WebGL shader library by Paper, live in your browser. Pick a shader, start from one of its presets, tune every parameter, drop in your own image or logo, then copy a self-contained React component or HTML snippet. You can also copy the version that uses the official <code>@paper-design/shaders-react</code> package.</p>
  <section class="doc-sec"><h2>All shaders</h2><ul class="ss-list">${DEFS.map((d) => `<li><b>${esc(d.name)}</b> <span class="mute">(${esc(d.category)})</span>: ${esc(d.description)}</li>`).join("")}</ul></section>
  <section class="doc-sec"><h2>License</h2><p class="mute">The shaders are © Paper and released under the <a class="ul" href="/licenses/paper-shaders.txt">Apache License 2.0</a>. Exported code keeps that notice. Sample images were made for NiceUI and are free to use.</p></section>`,
  faq: [
    ["What are Paper Shaders?", "Paper Shaders is an open-source library of WebGL shaders by Paper (paper.design): animated gradients, dithering, halftone, liquid metal, glass and image filters. It is released under the Apache 2.0 license, so you can use it in commercial projects as long as you keep the license notice."],
    ["Do I need to install anything to use the exported code?", "No. The React and HTML tabs give you the shader and a small WebGL2 runner inline, with no packages. If you prefer the official package, the Package tab gives you the same settings for @paper-design/shaders-react."],
    ["Can I use my own image or logo?", "Yes. Image filters such as halftone, dithering, fluted glass and water accept any image, and logo effects such as liquid metal, heatmap and gem smoke accept a logo with a transparent background. Uploads stay in your browser."],
    ["Do the shaders respect reduced motion?", "Yes. The exported code checks prefers-reduced-motion and renders a single still frame for people who ask for less motion."],
  ],
  files() {
    const req = createRequire(import.meta.url);
    const dir = req.resolve("@paper-design/shaders").replace(/dist[\\/]index\.js$/, "");
    const read = (f) => (existsSync(dir + f) ? readFileSync(dir + f, "utf8") : "");
    return [{ path: "licenses/paper-shaders.txt", content: `Paper Shaders (https://github.com/paper-design/shaders)\nUsed by NiceUI Shader Studio (https://niceui.dev/apps/shader-studio).\n\n${read("NOTICE")}\n\n${read("LICENSE")}` }];
  },
  body: () => `
    <div id="ss-root" class="ss-root">
      <noscript><p class="ss-noscript">Shader Studio needs JavaScript and WebGL2.</p></noscript>
    </div>`,
};
