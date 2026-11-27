// One-off generator: reads the parameter definitions from a checkout of
// paper-design/shaders (Apache-2.0) and writes site/paper-shaders.json, which
// Shader Studio uses to build its controls.
//   node scripts/paper-defs.mjs /path/to/paper-design/shaders
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repo = resolve(process.argv[2] || "../paper-design/shaders");
const out = resolve("node_modules/.cache/paper-defs.mjs");
await build({
  entryPoints: [join(repo, "docs/src/shader-defs/shader-defs.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: out,
  nodePaths: [resolve("node_modules")],
  external: ["react", "react-dom", "@paper-design/*"],
  logLevel: "error",
});
const { shaderDefs } = await import(pathToFileURL(out).href);
const R = await import("@paper-design/shaders-react");
const CATS = {
  "Image filters": ["paper-texture", "fluted-glass", "water", "image-dithering", "halftone-dots", "halftone-cmyk", "lens-distortion"],
  "Logo effects": ["heatmap", "liquid-metal", "gem-smoke"],
};
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const list = shaderDefs.map((d) => {
  const s = slug(d.name);
  const comp = s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
  const presetsKey = comp[0].toLowerCase() + comp.slice(1) + "Presets";
  if (!R[comp] || !R[presetsKey]) throw new Error("missing export for " + d.name + " " + comp);
  const cat = Object.entries(CATS).find(([, l]) => l.includes(s))?.[0] || "Backgrounds";
  return {
    slug: s,
    name: d.name,
    component: comp,
    presetsKey,
    category: cat,
    description: d.description,
    params: d.params.map((p) => ({
      name: p.name,
      type: p.type,
      ...(p.min !== undefined ? { min: p.min } : {}),
      ...(p.max !== undefined ? { max: p.max } : {}),
      ...(p.step !== undefined ? { step: p.step } : {}),
      ...(p.isColor ? { isColor: true } : {}),
      ...(p.options ? { options: p.options.map((o) => (typeof o === "string" ? o : o.name)) } : {}),
      description: p.description,
    })),
    presets: R[presetsKey].map((p) => ({ name: p.name, params: Object.fromEntries(Object.entries(p.params).filter(([, v]) => typeof v !== "object" || Array.isArray(v))) })),
  };
});
writeFileSync("site/paper-shaders.json", JSON.stringify(list, null, 1));
console.log(list.length, "shaders:", list.map((x) => `${x.slug}(${x.category[0]})`).join(" "));
