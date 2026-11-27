// Bundles Logo Maker (site/apps-src/logo-maker.js + opentype.js) into site/assets/logo-maker.js.
import { build } from "esbuild";

await build({
  entryPoints: ["site/apps-src/logo-maker.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  outfile: "site/assets/logo-maker.js",
  legalComments: "eof",
  banner: { js: "/*! NiceUI Logo Maker. Includes opentype.js (MIT). */" },
  logLevel: "warning",
});
console.log("logo-maker.js built");
