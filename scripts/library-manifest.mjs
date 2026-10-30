// Dumps the React library's registry (sections → entries) to site/library.json
// so the static site can list every library item in its sidebar, search and sitemap.
import { createServer } from "vite";
import { writeFileSync } from "node:fs";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { sections } = await server.ssrLoadModule("/src/registry/index.ts");
  const manifest = sections.map((s) => ({
    id: s.id,
    title: s.title,
    entries: s.entries.map((e) => ({ slug: e.slug, name: e.name, description: e.description, badge: e.badge || null, theme: e.theme || null, page: !!e.page, demos: (e.demos || []).length })),
  }));
  writeFileSync("site/library.json", JSON.stringify(manifest, null, 2) + "\n");
  console.log("library.json:", manifest.map((s) => s.id + "=" + s.entries.length).join(" "));
} finally {
  await server.close();
}
