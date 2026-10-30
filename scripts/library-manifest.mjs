// Dumps the React library's registry (sections → entries) to site/library.json
// so the static site can list every library item in its sidebar, search and sitemap.
import { createServer } from "vite";
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { sections } = await server.ssrLoadModule("/src/registry/index.ts");
  const manifest = sections.map((s) => ({
    id: s.id,
    title: s.title,
    entries: s.entries.map((e) => ({ slug: e.slug, name: e.name, description: e.description, badge: e.badge || null, theme: e.theme || null, page: !!e.page, demos: (e.demos || []).length })),
  }));
  writeFileSync("site/library.json", JSON.stringify(manifest, null, 2) + "\n");

  // Source for each entry: find the module that exports its demo (or page) component,
  // then follow local imports so the code tab and registry item carry every file it needs.
  const owner = new Map();
  for (const mod of server.moduleGraph.idToModuleMap.values()) {
    if (!mod.ssrModule || !mod.file || !mod.file.includes("/src/") || mod.file.includes("/src/registry/") || mod.file.includes("/src/docs/")) continue;
    for (const v of Object.values(mod.ssrModule)) if (typeof v === "function" && !owner.has(v)) owner.set(v, mod.file);
  }
  const root = process.cwd() + "/";
  const resolveLocal = (from, spec) => {
    let base = spec.startsWith("@/") ? root + "src/" + spec.slice(2) : spec.startsWith(".") ? join(dirname(from), spec) : null;
    if (!base || base.endsWith("/lib/cn")) return null;
    for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) if (existsSync(base + ext) && statSync(base + ext).isFile()) return base + ext;
    return null;
  };
  const collect = (file, seen = new Set()) => {
    if (seen.has(file) || seen.size > 40) return seen;
    seen.add(file);
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const dep = resolveLocal(file, m[1]);
      if (dep) collect(dep, seen);
    }
    return seen;
  };
  const sources = {};
  for (const s of sections) {
    if (s.id === "intro") continue;
    for (const e of s.entries) {
      const fn = e.page || e.demos?.[0]?.component;
      const file = fn && owner.get(fn);
      if (!file) continue;
      sources[s.id + "/" + e.slug] = [...collect(file)].map((f) => ({ path: f.replace(root, ""), content: readFileSync(f, "utf8") }));
    }
  }
  writeFileSync("site/library-src.json", JSON.stringify(sources));
  console.log("library-src.json:", Object.keys(sources).length, "entries with source");
  console.log("library.json:", manifest.map((s) => s.id + "=" + s.entries.length).join(" "));
} finally {
  await server.close();
}
