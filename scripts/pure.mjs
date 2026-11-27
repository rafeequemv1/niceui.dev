// Turns a NiceUI library item (several source files) into ONE self-contained
// .tsx file that needs only React and Tailwind CSS:
//   - local files are merged in dependency order (deps first)
//   - lucide-react icons are inlined as tiny SVG components
//   - the cn() helper is inlined
//   - NiceUI theme tokens (ink-*, brand-*, shadow-card, ease-spring…) become
//     standard Tailwind arbitrary values
//   - NiceUI keyframe animations and helper classes are injected as a <style>
// If an item can't be merged safely, `pure` is null and `problems` says why.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── lucide icon shapes ─────────────────────────────────────────────── */
const LUCIDE = join(ROOT, "node_modules/lucide-react/dist/esm");
const lucideIndex = readFileSync(join(LUCIDE, "lucide-react.js"), "utf8");
const iconFile = new Map(); // exported name -> file
for (const m of lucideIndex.matchAll(/export \{([^}]+)\} from '\.\/icons\/([\w-]+)\.js';/g))
  for (const part of m[1].split(",")) {
    const as = part.match(/as\s+(\w+)/);
    if (as) iconFile.set(as[1].trim(), m[2]);
  }
const nodeCache = new Map();
function iconNode(name) {
  const file = iconFile.get(name);
  if (!file) return null;
  if (nodeCache.has(file)) return nodeCache.get(file);
  const src = readFileSync(join(LUCIDE, "icons", file + ".js"), "utf8");
  const m = src.match(/createLucideIcon\("[^"]+",\s*(\[[\s\S]*?\])\s*\);/);
  // trusted package source: a plain array literal of [tag, attrs]
  const node = m ? Function(`return ${m[1]}`)().map(([t, a]) => [t, Object.fromEntries(Object.entries(a).filter(([k]) => k !== "key"))]) : null;
  nodeCache.set(file, node);
  return node;
}

/* ── theme tokens → plain Tailwind ──────────────────────────────────── */
const INK = { 50: "#f3f4f6", 100: "#e5e7eb", 200: "#c9cdd3", 300: "#a3a8b0", 400: "#8b9099", 500: "#6b7079", 600: "#4b5058", 700: "#30333a", 800: "#1c1e22", 850: "#121316", 900: "#0b0c0e", 950: "#000000" };
const BRAND = { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e", 950: "#082f49" };
const SHADOW = {
  hairline: "0 0 0 1px rgba(255,255,255,0.06)",
  card: "0 0 0 1px rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)",
  pop: "0 0 0 1px rgba(255,255,255,0.08), 0 16px 48px -12px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4)",
  glow: "0 0 0 1px rgba(125,211,252,0.4), 0 8px 32px -8px rgba(56,189,248,0.6)",
};
const EASE = { spring: "cubic-bezier(0.34,1.56,0.64,1)", smooth: "cubic-bezier(0.16,1,0.3,1)" };
const tw = (v) => v.replace(/\s*,\s*/g, ",").replace(/\s+/g, "_");
function plainTailwind(code) {
  return code
    .replace(/(?<![\w-])((?:[\w-]+:)*)(bg|text|border(?:-[trblxyse])?|ring|ring-offset|from|via|to|fill|stroke|divide|outline|caret|accent|decoration|shadow|placeholder)-(ink|brand)-(50|100|200|300|400|500|600|700|800|850|900|950)(?![\w-])/g, (_, v, util, pal, n) => `${v}${util}-[${(pal === "ink" ? INK : BRAND)[n]}]`)
    .replace(/(?<![\w-])((?:[\w-]+:)*)shadow-(hairline|card|pop|glow)(?![\w-])/g, (_, v, k) => `${v}shadow-[${tw(SHADOW[k])}]`)
    .replace(/(?<![\w-])((?:[\w-]+:)*)ease-(spring|smooth)(?![\w-])/g, (_, v, k) => `${v}ease-[${EASE[k]}]`)
    .replace(/theme\(colors\.(ink|brand)\.(\d+)\)/g, (_, pal, n) => (pal === "ink" ? INK : BRAND)[n] || _);
}

/* ── animations and helper classes, injected only when used ─────────── */
const KEYFRAMES = {
  "fade-in": ["from{opacity:0}to{opacity:1}", "300ms ease-out both"],
  "fade-up": ["from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}", "400ms cubic-bezier(0.16,1,0.3,1) both"],
  "fade-down": ["from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}", "400ms cubic-bezier(0.16,1,0.3,1) both"],
  "scale-in": ["from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}", "250ms cubic-bezier(0.16,1,0.3,1) both"],
  "slide-in-right": ["from{transform:translateX(100%)}to{transform:translateX(0)}", "450ms cubic-bezier(0.16,1,0.3,1) both"],
  "slide-in-up": ["from{transform:translateY(100%)}to{transform:translateY(0)}", "450ms cubic-bezier(0.16,1,0.3,1) both"],
  shimmer: ["from{background-position:200% 0}to{background-position:-200% 0}", "2.4s linear infinite"],
  marquee: ["from{transform:translateX(0)}to{transform:translateX(-50%)}", "30s linear infinite"],
  "marquee-y": ["from{transform:translateY(0)}to{transform:translateY(-50%)}", "30s linear infinite"],
  float: ["0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}", "4s ease-in-out infinite"],
  blink: ["0%,100%{opacity:1}50%{opacity:0}", "1s step-end infinite"],
  "pulse-ring": ["0%{transform:scale(0.9);opacity:0.7}100%{transform:scale(1.8);opacity:0}", "1.6s cubic-bezier(0.2,0.6,0.4,1) infinite"],
  blob: ["0%,100%{border-radius:42% 58% 70% 30%/45% 45% 55% 55%;transform:rotate(0deg)}50%{border-radius:70% 30% 46% 54%/30% 39% 61% 70%;transform:rotate(180deg)}", "12s ease-in-out infinite"],
  "spin-slow": ["to{transform:rotate(360deg)}", "8s linear infinite"],
  wiggle: ["0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}", "300ms ease-in-out"],
  "bar-bounce": ["0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}", "1s ease-in-out infinite"],
};
const HELPERS = {
  surface: `.surface{background-color:${INK[900]};border-radius:1rem;box-shadow:${SHADOW.card}}`,
  "surface-raised": `.surface-raised{background-color:${INK[850]};border-radius:.75rem;box-shadow:${SHADOW.hairline}}`,
  "focus-ring": `.focus-ring{outline:none}.focus-ring:focus-visible{box-shadow:0 0 0 2px #000,0 0 0 4px rgba(14,165,233,.6)}`,
  "grid-bg": `.grid-bg{background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:24px 24px}`,
  "dot-bg": `.dot-bg{background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1px);background-size:16px 16px}`,
  "text-gradient": `.text-gradient{background-image:linear-gradient(to bottom,#fff,${INK[400]});-webkit-background-clip:text;background-clip:text;color:transparent}`,
  "shimmer-text": `.shimmer-text{background:linear-gradient(90deg,#6b6b77 0%,#6b6b77 40%,#f7f7f8 50%,#6b6b77 60%,#6b6b77 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 2.4s linear infinite}`,
  "mask-fade-x": `.mask-fade-x{mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent)}`,
  "mask-fade-y": `.mask-fade-y{mask-image:linear-gradient(180deg,transparent,black 12%,black 88%,transparent)}`,
  "dither-dots": `.dither-dots{background-image:radial-gradient(rgba(255,255,255,.045) .5px,transparent .5px);background-size:4px 4px}`,
  "dither-grid": `.dither-grid{background-image:linear-gradient(rgba(255,255,255,.04) .5px,transparent .5px),linear-gradient(90deg,rgba(255,255,255,.04) .5px,transparent .5px);background-size:8px 8px}`,
  "dither-diagonal": `.dither-diagonal{background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.03) 0px,rgba(255,255,255,.03) 1px,transparent 1px,transparent 4px)}`,
  "dither-noise": `.dither-noise{background-image:radial-gradient(rgba(255,255,255,.06) .5px,transparent .5px),radial-gradient(rgba(255,255,255,.04) .5px,transparent .5px);background-size:3px 3px,7px 7px;background-position:0 0,1px 1px}`,
  "dither-cross": `.dither-cross{background-image:linear-gradient(rgba(255,255,255,.05) .5px,transparent .5px),linear-gradient(90deg,rgba(255,255,255,.05) .5px,transparent .5px);background-size:6px 6px;background-position:center}`,
};
const used = (code, cls) => new RegExp(`(?<![\\w-])${cls.replace(/[-]/g, "\\-")}(?![\\w-])`).test(code);
function injectedCss(code) {
  const rules = [];
  const anims = Object.keys(KEYFRAMES).filter((k) => used(code, "animate-" + k));
  const helpers = Object.keys(HELPERS).filter((k) => used(code, k));
  if (helpers.includes("shimmer-text") && !anims.includes("shimmer")) anims.push("shimmer");
  for (const a of anims) rules.push(`@keyframes ${a}{${KEYFRAMES[a][0]}}`, `.animate-${a}{animation:${a} ${KEYFRAMES[a][1]}}`);
  for (const h of helpers) rules.push(HELPERS[h]);
  return rules.join("\n");
}

/* ── import parsing ─────────────────────────────────────────────────── */
const IMPORT_RE = /^import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"];?[ \t]*\r?\n?/gm;
const SIDE_RE = /^import\s+['"]([^'"]+)['"];?[ \t]*\r?\n?/gm;
function parseClause(clause, typeOnly) {
  const out = { def: null, ns: null, named: [] };
  let rest = clause.trim();
  const brace = rest.match(/\{([\s\S]*)\}/);
  if (brace) {
    for (let s of brace[1].split(",")) {
      s = s.trim();
      if (!s) continue;
      const isType = typeOnly || /^type\s+/.test(s);
      s = s.replace(/^type\s+/, "");
      const [imported, local] = s.split(/\s+as\s+/).map((x) => x.trim());
      out.named.push({ imported, local: local || imported, type: isType });
    }
    rest = rest.replace(brace[0], "");
  }
  rest = rest.replace(/,/g, " ").trim();
  const ns = rest.match(/\*\s+as\s+(\w+)/);
  if (ns) out.ns = ns[1];
  else if (rest) out.def = rest.split(/\s+/)[0];
  return out;
}
const DOM_SHADOWS = new Set(["KeyboardEvent", "MouseEvent", "PointerEvent", "FocusEvent", "DragEvent", "TouchEvent", "WheelEvent", "UIEvent", "ClipboardEvent", "AnimationEvent", "TransitionEvent", "CompositionEvent", "Touch"]);
const EXT = ["", ".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
function resolveLocal(fromPath, spec, paths) {
  const base = spec.startsWith("@/") ? "src/" + spec.slice(2) : posix.normalize(posix.join(posix.dirname(fromPath), spec));
  return EXT.map((e) => base + e).find((p) => paths.has(p)) || null;
}
/* Split a file into its leading block (comments, directives, imports) and the rest. */
function splitHeader(src) {
  const re = /\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/|['"]use (?:client|strict)['"];?|import\s+(?:type\s+)?[\s\S]*?\s+from\s+['"][^'"]+['"];?|import\s+['"][^'"]+['"];?)/y;
  let i = 0;
  for (;;) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m || m[0].length === 0) break;
    i = re.lastIndex;
  }
  const nl = src.indexOf("\n", i);
  const cut = nl === -1 ? src.length : nl + 1;
  return { header: src.slice(0, cut), rest: src.slice(cut) };
}
const DECL_RE = /^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm;

/** files: [{ path: "src/…", content }] with the entry first. */
export function makePure({ name, url, files }) {
  const problems = [];
  const paths = new Set(files.map((f) => f.path));
  const byPath = new Map(files.map((f) => [f.path, f]));
  const external = new Map(); // module -> { def, named: Map(local -> {imported,type}) }
  const icons = new Map(); // local name -> lucide export name
  let needCn = false;
  const parsed = new Map();

  for (const f of files) {
    // only the import block at the top of the file counts; code samples inside strings stay untouched
    const split = splitHeader(f.content);
    let rest = split.rest;
    let extra = "";
    rest = rest.replace(new RegExp(IMPORT_RE.source, "gm"), (m, _t, _c, _s, offset, whole) => {
      // skip matches inside template literals (odd number of backticks before them)
      const ticks = (whole.slice(0, offset).match(/(?<!\\)`/g) || []).length;
      if (ticks % 2) return m;
      extra += m.endsWith("\n") ? m : m + "\n";
      return "";
    });
    let body = split.header + extra;
    const shadow = new Map(); // React type names that would hide a DOM global
    const deps = [];
    const aliases = [];
    body = body.replace(SIDE_RE, (m, spec) => {
      if (spec.startsWith(".") || spec.startsWith("@/")) return ""; // local CSS etc.
      problems.push(`side-effect import ${spec}`);
      return m;
    });
    body = body.replace(IMPORT_RE, (m, typeKw, clause, spec) => {
      const c = parseClause(clause, !!typeKw);
      if (spec === "@/lib/cn") {
        needCn = true;
        return "";
      }
      if (spec.startsWith(".") || spec.startsWith("@/")) {
        const target = resolveLocal(f.path, spec, paths);
        if (!target) {
          problems.push(`missing local file ${spec} (from ${f.path})`);
          return "";
        }
        deps.push(target);
        if (c.ns) problems.push(`namespace import of ${spec}`);
        if (c.def) aliases.push({ local: c.def, from: target, def: true });
        for (const n of c.named) if (n.local !== n.imported) aliases.push({ local: n.local, imported: n.imported, type: n.type });
        return "";
      }
      if (spec === "lucide-react") {
        for (const n of c.named) {
          if (n.type || /^(LucideIcon|LucideProps|IconNode)$/.test(n.imported)) continue;
          if (!iconNode(n.imported)) problems.push(`unknown icon ${n.imported}`);
          else icons.set(n.local, n.imported);
        }
        if (c.def || c.ns) problems.push("default/namespace lucide import");
        return "";
      }
      if (!/^(react|react-dom|react-dom\/client|react\/jsx-runtime)$/.test(spec)) {
        problems.push(`external dependency ${spec}`);
        return m;
      }
      const e = external.get(spec) || { def: null, ns: null, named: new Map() };
      if (c.def) e.def = c.def;
      if (c.ns) e.ns = c.ns;
      for (const n of c.named)
        if (spec === "react" && DOM_SHADOWS.has(n.local)) {
          shadow.set(n.local, "React" + n.local);
          n.local = "React" + n.local;
        }
      for (const n of c.named) {
        const prev = e.named.get(n.local);
        e.named.set(n.local, { imported: n.imported, type: prev ? prev.type && n.type : n.type });
      }
      external.set(spec, e);
      return "";
    });
    body = body + rest;
    for (const [from, to] of shadow) body = body.replace(new RegExp(`(?<![\\w.$])${from}(?![\\w$])`, "g"), to);
    parsed.set(f.path, { body, deps, aliases });
  }

  // dependency order: deps before dependents, entry last
  const order = [];
  const seen = new Set();
  const visit = (p) => {
    if (seen.has(p)) return;
    seen.add(p);
    for (const d of parsed.get(p)?.deps || []) visit(d);
    order.push(p);
  };
  visit(files[0].path);
  for (const f of files) visit(f.path);

  // default export names of each file (for default-import aliases)
  const defaultName = new Map();
  for (const f of files) {
    const m = f.content.match(/export\s+default\s+(?:async\s+)?(?:function\*?|class)\s+([A-Za-z_$][\w$]*)/) || f.content.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;/);
    if (m) defaultName.set(f.path, m[1]);
  }

  const entry = files[0].path;
  const sections = [];
  const declared = new Map();
  for (const p of order) {
    let { body, aliases } = parsed.get(p);
    if (p !== entry) {
      body = body
        .replace(/^export\s+default\s+(?=(?:async\s+)?(?:function|class)\b)/gm, "")
        .replace(/^export\s+default\s+[A-Za-z_$][\w$]*\s*;[ \t]*\n?/gm, "")
        .replace(/^export\s+(?=(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\b)/gm, "")
        .replace(/^export\s*\{[^}]*\}(?:\s*from\s*['"][^'"]+['"])?\s*;?[ \t]*\n?/gm, "")
        .replace(/^export\s+\*.*\n?/gm, "");
    }
    body = body.replace(/^['"]use client['"];?\s*\n/m, "");
    for (const m of body.matchAll(DECL_RE)) {
      if (declared.has(m[1]) && declared.get(m[1]) !== p) problems.push(`name clash: ${m[1]}`);
      declared.set(m[1], p);
    }
    const aliasLines = aliases
      .map((a) => {
        if (a.def) {
          const dn = defaultName.get(a.from);
          if (!dn) {
            problems.push(`default import without a named default (${a.from})`);
            return "";
          }
          return dn === a.local ? "" : `const ${a.local} = ${dn};`;
        }
        return a.type ? `type ${a.local} = ${a.imported};` : `const ${a.local} = ${a.imported};`;
      })
      .filter(Boolean);
    const rel = p.replace(/^src\//, "");
    sections.push(`// ── ${rel} ${"─".repeat(Math.max(4, 60 - rel.length))}\n${aliasLines.length ? aliasLines.join("\n") + "\n" : ""}${body.trim()}\n`);
  }
  for (const local of icons.keys()) if (declared.has(local)) problems.push(`icon name clash: ${local}`);
  for (const h of ["niceIcon", "NiceIconProps", "NICEUI_CSS", ...(icons.size ? ["LucideIcon", "LucideProps"] : []), ...(needCn ? ["cn"] : [])]) if (declared.has(h)) problems.push(`helper name clash: ${h}`);
  if (problems.length) return { pure: null, problems: [...new Set(problems)] };

  // imports
  const head = [];
  const needCreateElement = icons.size > 0;
  for (const [spec, e] of external) {
    if (spec === "react" && needCreateElement && !e.named.has("createElement")) e.named.set("createElement", { imported: "createElement", type: false });
    if (spec === "react" && icons.size && !e.named.has("SVGProps")) e.named.set("SVGProps", { imported: "SVGProps", type: true });
    const named = [...e.named].map(([local, n]) => `${n.type ? "type " : ""}${n.imported === local ? local : `${n.imported} as ${local}`}`);
    if (e.ns) head.push(`import * as ${e.ns} from '${spec}';`);
    const parts = [e.def, named.length ? `{ ${named.join(", ")} }` : null].filter(Boolean);
    if (parts.length) head.push(`import ${parts.join(", ")} from '${spec}';`);
  }
  if (!external.has("react") && icons.size) head.push(`import { createElement, type SVGProps } from 'react';`);

  const helpers = [];
  if (needCn)
    helpers.push(`function cn(...classes: Array<string | false | null | undefined>) {\n  return classes.filter(Boolean).join(' ');\n}`);
  if (icons.size) {
    helpers.push(
      `// Icons from Lucide (ISC licence, lucide.dev), inlined so there is nothing to install.
type NiceIconProps = SVGProps<SVGSVGElement> & { size?: number | string; absoluteStrokeWidth?: boolean };
type LucideIcon = (props: NiceIconProps) => JSX.Element;
type LucideProps = NiceIconProps;
const niceIcon = (node: Array<[string, Record<string, string>]>): LucideIcon =>
  function Icon({ size = 24, strokeWidth = 2, absoluteStrokeWidth, children, ...rest }: NiceIconProps) {
    const sw = absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth;
    return createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...rest }, ...node.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs })), children);
  };
${[...icons].map(([local, name]) => `const ${local} = niceIcon(${JSON.stringify(iconNode(name))});`).join("\n")}`
    );
  }

  let code = plainTailwind(sections.join("\n"));
  const css = injectedCss(code);
  if (css)
    helpers.push(`// NiceUI animations and helper classes, injected once so no CSS setup is needed.
const NICEUI_CSS = ${JSON.stringify(css)};
if (typeof document !== 'undefined' && !document.getElementById('niceui-css-${hash(css)}')) {
  const el = document.createElement('style');
  el.id = 'niceui-css-${hash(css)}';
  el.textContent = NICEUI_CSS;
  document.head.appendChild(el);
}`);

  const banner = `'use client';\n\n// ${name} — NiceUI (MIT) · ${url}\n// One self-contained file: needs only React and Tailwind CSS. Nothing else to install.\n`;
  const pure = `${banner}\n${head.join("\n")}\n\n${helpers.join("\n\n")}${helpers.length ? "\n\n" : ""}${code.trim()}\n`;
  return { pure, problems: [] };
}

function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
