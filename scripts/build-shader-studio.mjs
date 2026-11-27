// Bundles Shader Studio (site/apps-src/shader-studio.jsx) into site/assets/shader-studio.js.
// Runs before the site build (see npm run build:web).
import { build, transform } from "esbuild";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const runtimeTs = readFileSync("site/apps-src/paper-runtime.ts", "utf8").trim();
const runtimeJs = (await transform(runtimeTs, { loader: "ts" })).code.trim();
const thumbs = existsSync("site/assets/shader-thumbs") ? readdirSync("site/assets/shader-thumbs").filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)) : [];

await build({
  entryPoints: ["site/apps-src/shader-studio.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  outfile: "site/assets/shader-studio.js",
  jsx: "automatic",
  legalComments: "eof",
  define: {
    "process.env.NODE_ENV": '"production"',
    __RUNTIME_TS__: JSON.stringify(runtimeTs),
    __RUNTIME_JS__: JSON.stringify(runtimeJs),
    __THUMBS__: JSON.stringify(thumbs),
  },
  banner: { js: "/*! NiceUI Shader Studio. Shaders by Paper Shaders (https://shaders.paper.design), Apache-2.0: https://niceui.dev/licenses/paper-shaders.txt */" },
  logLevel: "warning",
});
console.log("shader-studio.js built");
