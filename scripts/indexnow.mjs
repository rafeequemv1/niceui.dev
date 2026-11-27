// Tell IndexNow engines (Bing, Yandex, Seznam, Naver…) which niceui.dev URLs exist or changed.
// Usage: node scripts/indexnow.mjs            → every URL in site/dist/sitemap.xml
//        node scripts/indexnow.mjs /s/foo /x  → just those paths
// Run it after a production deploy, once the key file is live.
import { readFileSync } from "node:fs";
import { INDEXNOW_KEY } from "../site/seo.mjs";

const HOST = "niceui.dev";
const args = process.argv.slice(2);
const urls = args.length
  ? args.map((p) => `https://${HOST}${p.startsWith("/") ? p : "/" + p}`)
  : [...readFileSync(new URL("../site/dist/sitemap.xml", import.meta.url), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

for (let i = 0; i < urls.length; i += 10000) {
  const urlList = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList }),
  });
  console.log(`IndexNow: ${urlList.length} URLs → ${res.status} ${res.statusText}`);
}
