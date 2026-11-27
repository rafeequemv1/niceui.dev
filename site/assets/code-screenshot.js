/* NiceUI Code Screenshot — highlighter, editor and canvas export. Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-cs]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ── themes (original palettes) ────────────────────────── */
  // bg window, fg text, bar title bar, gutter numbers, hl spotlight band, then token colours
  const THEMES = {
    midnight: { name: "Midnight", dark: true, bg: "#0b1020", bar: "#0e1428", fg: "#d6deeb", gutter: "#3b4766", hl: "rgba(125,211,252,0.10)", border: "rgba(255,255,255,0.08)", comment: "#5f6f94", keyword: "#c792ea", string: "#a5e3a1", number: "#f7a76c", function: "#7dd3fc", type: "#ffcb6b", tag: "#7dd3fc", attr: "#c3a6ff", property: "#82aaff", constant: "#ff9cac", punct: "#8a99c0", operator: "#89ddff", variable: "#f78c6c", meta: "#ffcb6b" },
    ember: { name: "Ember", dark: true, bg: "#16110f", bar: "#1c1613", fg: "#ecdfd4", gutter: "#5a4a40", hl: "rgba(251,146,60,0.12)", border: "rgba(255,255,255,0.07)", comment: "#7d6a5e", keyword: "#ff7a45", string: "#e6c07b", number: "#f4a261", function: "#ffd166", type: "#f28482", tag: "#ff7a45", attr: "#e9c46a", property: "#f6bd60", constant: "#ef476f", punct: "#a08c7d", operator: "#ff9f68", variable: "#f28482", meta: "#e9c46a" },
    grove: { name: "Grove", dark: true, bg: "#0c1512", bar: "#0f1a16", fg: "#d3e8dc", gutter: "#365447", hl: "rgba(52,211,153,0.11)", border: "rgba(255,255,255,0.07)", comment: "#5b7d6c", keyword: "#5eead4", string: "#bef264", number: "#fbbf24", function: "#86efac", type: "#fde68a", tag: "#5eead4", attr: "#a7f3d0", property: "#7dd3fc", constant: "#fca5a5", punct: "#6f9483", operator: "#99f6e4", variable: "#fda4af", meta: "#fde68a" },
    nebula: { name: "Nebula", dark: true, bg: "#130f24", bar: "#17122c", fg: "#e4dcff", gutter: "#4a3f72", hl: "rgba(192,132,252,0.13)", border: "rgba(255,255,255,0.08)", comment: "#6d6496", keyword: "#f472b6", string: "#a7f3d0", number: "#fbbf24", function: "#c4b5fd", type: "#67e8f9", tag: "#f472b6", attr: "#c4b5fd", property: "#93c5fd", constant: "#fb923c", punct: "#8b80b8", operator: "#f9a8d4", variable: "#fdba74", meta: "#67e8f9" },
    graphite: { name: "Graphite", dark: true, bg: "#111113", bar: "#161618", fg: "#e4e4e7", gutter: "#46464d", hl: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.08)", comment: "#6b6b74", keyword: "#ffffff", string: "#a1a1aa", number: "#d4d4d8", function: "#f4f4f5", type: "#d4d4d8", tag: "#f4f4f5", attr: "#a1a1aa", property: "#d4d4d8", constant: "#ffffff", punct: "#71717a", operator: "#a1a1aa", variable: "#e4e4e7", meta: "#a1a1aa" },
    tide: { name: "Tide", dark: true, bg: "#071a24", bar: "#09202c", fg: "#cfe8f3", gutter: "#28505f", hl: "rgba(34,211,238,0.11)", border: "rgba(255,255,255,0.07)", comment: "#4f7685", keyword: "#38bdf8", string: "#fcd34d", number: "#fb7185", function: "#5eead4", type: "#a5b4fc", tag: "#38bdf8", attr: "#5eead4", property: "#93c5fd", constant: "#fb7185", punct: "#5d8797", operator: "#67e8f9", variable: "#fda4af", meta: "#a5b4fc" },
    paper: { name: "Paper", dark: false, bg: "#fbf8f3", bar: "#f3eee6", fg: "#3b3530", gutter: "#c2b8ab", hl: "rgba(217,119,6,0.10)", border: "rgba(0,0,0,0.08)", comment: "#a39686", keyword: "#b4421b", string: "#4d7c0f", number: "#b45309", function: "#1d4ed8", type: "#7c3aed", tag: "#b4421b", attr: "#a16207", property: "#0f766e", constant: "#be123c", punct: "#8c8073", operator: "#b4421b", variable: "#be123c", meta: "#7c3aed" },
    frost: { name: "Frost", dark: false, bg: "#ffffff", bar: "#f4f6fa", fg: "#1f2937", gutter: "#b6c0d0", hl: "rgba(14,165,233,0.10)", border: "rgba(15,23,42,0.08)", comment: "#94a3b8", keyword: "#7c3aed", string: "#059669", number: "#ea580c", function: "#0284c7", type: "#c026d3", tag: "#2563eb", attr: "#7c3aed", property: "#0369a1", constant: "#dc2626", punct: "#64748b", operator: "#7c3aed", variable: "#dc2626", meta: "#c026d3" },
    rose: { name: "Rosé", dark: false, bg: "#fff7f8", bar: "#fdeef1", fg: "#4a2a33", gutter: "#e3b8c2", hl: "rgba(244,63,94,0.09)", border: "rgba(76,5,25,0.08)", comment: "#c299a4", keyword: "#d6336c", string: "#2f9e72", number: "#e8590c", function: "#7048e8", type: "#c2255c", tag: "#d6336c", attr: "#9c36b5", property: "#1971c2", constant: "#e03131", punct: "#a37b86", operator: "#d6336c", variable: "#e8590c", meta: "#9c36b5" },
    chalk: { name: "Chalk", dark: false, bg: "#f6f6f4", bar: "#ececea", fg: "#18181b", gutter: "#b5b5b0", hl: "rgba(0,0,0,0.06)", border: "rgba(0,0,0,0.09)", comment: "#9a9a94", keyword: "#18181b", string: "#52525b", number: "#3f3f46", function: "#18181b", type: "#3f3f46", tag: "#18181b", attr: "#52525b", property: "#3f3f46", constant: "#18181b", punct: "#8a8a85", operator: "#52525b", variable: "#27272a", meta: "#52525b" },
  };
  const ITALIC = new Set(["comment"]);

  /* ── backgrounds ───────────────────────────────────────── */
  const BGS = {
    sky: { name: "Sky", angle: 135, stops: [["#38bdf8", 0], ["#6366f1", 1]] },
    sunset: { name: "Sunset", angle: 135, stops: [["#f97316", 0], ["#ec4899", 0.55], ["#8b5cf6", 1]] },
    mint: { name: "Mint", angle: 135, stops: [["#34d399", 0], ["#06b6d4", 1]] },
    candy: { name: "Candy", angle: 120, stops: [["#f472b6", 0], ["#fb7185", 0.5], ["#fbbf24", 1]] },
    ocean: { name: "Ocean", angle: 160, stops: [["#0ea5e9", 0], ["#1e3a8a", 1]] },
    aurora: { name: "Aurora", angle: 120, stops: [["#22d3ee", 0], ["#a78bfa", 0.5], ["#f472b6", 1]] },
    peach: { name: "Peach", angle: 135, stops: [["#fed7aa", 0], ["#fecdd3", 1]] },
    lime: { name: "Lime", angle: 135, stops: [["#d9f99d", 0], ["#22c55e", 1]] },
    noir: { name: "Noir", angle: 160, stops: [["#3f3f46", 0], ["#09090b", 1]] },
    solid: { name: "Solid" },
    none: { name: "None" },
  };
  const cssGrad = (b) => `linear-gradient(${b.angle}deg, ${b.stops.map(([c, p]) => `${c} ${Math.round(p * 100)}%`).join(", ")})`;
  // CSS gradient line for an angle over a W×H box (same maths as the CSS spec)
  function gradLine(angle, W, H) {
    const a = (angle * Math.PI) / 180;
    const dx = Math.sin(a), dy = -Math.cos(a);
    const L = Math.abs((W / 2) * dx) + Math.abs((H / 2) * dy);
    return [W / 2 - dx * L, H / 2 - dy * L, W / 2 + dx * L, H / 2 + dy * L];
  }

  /* ── tokenizer ─────────────────────────────────────────── */
  const W = (list) => `\\b(?:${list.trim().split(/\s+/).join("|")})\\b`;
  const STR_D = `"(?:[^"\\\\\\n]|\\\\.)*"`;
  const STR_S = `'(?:[^'\\\\\\n]|\\\\.)*'`;
  const NUM = `\\b(?:0[xX][\\da-fA-F_]+|0[bB][01_]+|\\d[\\d_]*(?:\\.\\d[\\d_]*)?(?:[eE][+-]?\\d+)?[nfFlLuU]*)\\b`;
  const FN = `\\b[a-zA-Z_$][\\w$]*(?=\\s*\\()`;
  const CAPS = `\\b[A-Z][\\w$]*\\b`;
  const PUNCT = `[{}()\\[\\];,.:]`;
  const OPS = `[=+\\-*/%<>!&|?^~@]+`;
  const KW_JS = "abstract as async await break case catch class const continue debugger default delete do else enum export extends finally for from function get if implements import in instanceof interface keyof let new of private protected public readonly return satisfies set static super switch this throw try type typeof var void while with yield declare namespace module";
  const TYPES_TS = "string number boolean any unknown never object symbol bigint void Promise Record Partial Readonly Array";
  const R = {};
  R.js = [
    ["comment", `//[^\\n]*`], ["comment", `/\\*[\\s\\S]*?\\*/`],
    ["string", "`(?:[^`\\\\]|\\\\[\\s\\S])*`"], ["string", STR_D], ["string", STR_S],
    ["tag", `</?[A-Za-z][\\w.]*(?=[\\s/>])`], ["tag", `/>`],
    ["attr", `\\b[a-zA-Z_][\\w-]*(?==[{"'])`],
    ["constant", W("true false null undefined NaN Infinity")],
    ["keyword", W(KW_JS)],
    ["type", W(TYPES_TS)],
    ["number", NUM],
    ["function", FN],
    ["type", CAPS],
    ["property", `(?<=\\.)[a-zA-Z_$][\\w$]*`],
    ["punct", PUNCT], ["operator", OPS],
  ];
  R.python = [
    ["comment", `#[^\\n]*`],
    ["string", `[rRbBfFuU]{0,2}"""[\\s\\S]*?"""`], ["string", `[rRbBfFuU]{0,2}'''[\\s\\S]*?'''`],
    ["string", `[rRbBfFuU]{0,2}${STR_D}`], ["string", `[rRbBfFuU]{0,2}${STR_S}`],
    ["meta", `@[\\w.]+`],
    ["constant", W("True False None")],
    ["function", `(?<=\\bdef\\s+)\\w+`], ["type", `(?<=\\bclass\\s+)\\w+`],
    ["keyword", W("and as assert async await break class continue def del elif else except finally for from global if import in is lambda match case nonlocal not or pass raise return try while with yield")],
    ["variable", W("self cls")],
    ["function", W("print len range open int str float list dict set tuple isinstance super enumerate zip map filter sorted min max sum any all type")],
    ["number", NUM], ["function", FN], ["type", CAPS],
    ["property", `(?<=\\.)[a-zA-Z_]\\w*`],
    ["punct", PUNCT], ["operator", OPS],
  ];
  R.html = [
    ["comment", `<!--[\\s\\S]*?-->`], ["meta", `<!DOCTYPE[^>]*>`],
    ["tag", `</?[a-zA-Z][\\w-]*`], ["tag", `/?>`],
    ["attr", `\\b[a-zA-Z_:@][\\w:.-]*(?=\\s*=)`],
    ["string", STR_D], ["string", STR_S],
    ["constant", `&[#\\w]+;`],
    ["operator", `=`],
  ];
  R.css = [
    ["comment", `/\\*[\\s\\S]*?\\*/`],
    ["keyword", `@[\\w-]+`], ["string", STR_D], ["string", STR_S],
    ["property", `--?[a-zA-Z][\\w-]*(?=\\s*:\\s*[^;{}]*[;}])`],
    ["number", `#[\\da-fA-F]{3,8}\\b`],
    ["keyword", `!important`],
    ["function", `[a-zA-Z][\\w-]*(?=\\()`],
    ["number", `-?\\d*\\.?\\d+(?:px|rem|em|vh|vw|vmin|vmax|s|ms|deg|fr|ch|%)?`],
    ["type", `[.#][a-zA-Z_][\\w-]*`],
    ["attr", `::?[a-zA-Z][\\w-]*`],
    ["tag", `\\b(?:html|body|div|span|a|p|h[1-6]|ul|li|img|button|input|section|header|footer|main|nav|svg|form|label|table|tr|td)\\b`],
    ["punct", `[{}();,]`], ["operator", `[>+~*=:]`],
  ];
  R.json = [
    ["property", `${STR_D}(?=\\s*:)`], ["string", STR_D],
    ["constant", W("true false null")], ["number", `-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?`],
    ["punct", `[{}\\[\\],:]`],
  ];
  R.bash = [
    ["comment", `(?<=^|\\s)#[^\\n]*`],
    ["string", STR_D], ["string", STR_S],
    ["variable", `\\$\\{[^}\\n]*\\}|\\$\\(|\\$[\\w@#?*!$-]+`],
    ["keyword", W("if then else elif fi for while until do done case esac function in return export local readonly unset shift source alias exit")],
    ["attr", `(?<=\\s)--?[\\w][\\w-]*`],
    ["function", `(?<=^|\\n|[|;&]\\s*|\\$\\s|sudo\\s)[a-zA-Z_][\\w.-]*`],
    ["number", `\\b\\d+\\b`],
    ["operator", `[|&;<>=]+`], ["punct", `[(){}\\[\\]]`],
  ];
  R.go = [
    ["comment", `//[^\\n]*`], ["comment", `/\\*[\\s\\S]*?\\*/`],
    ["string", "`[^`]*`"], ["string", STR_D], ["string", `'(?:[^'\\\\]|\\\\.)'`],
    ["constant", W("true false nil iota")],
    ["keyword", W("break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var")],
    ["type", W("int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 uintptr float32 float64 complex64 complex128 string bool byte rune error any")],
    ["number", NUM], ["function", FN], ["type", CAPS],
    ["property", `(?<=\\.)[a-zA-Z_]\\w*`],
    ["punct", PUNCT], ["operator", OPS],
  ];
  R.rust = [
    ["comment", `//[^\\n]*`], ["comment", `/\\*[\\s\\S]*?\\*/`],
    ["meta", `#!?\\[[^\\]\\n]*\\]`],
    ["string", `b?r#*"[\\s\\S]*?"#*`], ["string", `'(?:[^'\\\\]|\\\\.)'`],
    ["meta", `'[a-z_]\\w*`],
    ["function", `\\b[a-z_]\\w*!`],
    ["constant", W("true false None Some Ok Err")],
    ["keyword", W("as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait type unsafe use where while")],
    ["type", W("i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str String Vec Option Result Box")],
    ["number", NUM], ["function", FN], ["type", CAPS],
    ["property", `(?<=\\.)[a-zA-Z_]\\w*`],
    ["punct", PUNCT], ["operator", OPS],
  ];
  R.c = [
    ["comment", `//[^\\n]*`], ["comment", `/\\*[\\s\\S]*?\\*/`],
    ["meta", `(?<=^|\\n)[ \\t]*#\\s*\\w+[^\\n]*`],
    ["meta", `@\\w+`],
    ["string", `"""[\\s\\S]*?"""`], ["string", STR_D], ["string", `'(?:[^'\\\\\\n]|\\\\.)'`],
    ["constant", W("true false null nullptr NULL")],
    ["keyword", W("abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while var val fun when object override struct typedef sizeof namespace using template typename auto async await readonly sealed record yield in out is as")],
    ["type", W("void int long short byte char float double boolean bool string String unsigned signed size_t")],
    ["number", NUM], ["function", FN], ["type", CAPS],
    ["property", `(?<=\\.|->)[a-zA-Z_]\\w*`],
    ["punct", PUNCT], ["operator", OPS],
  ];
  R.sql = [
    ["comment", `--[^\\n]*`], ["comment", `/\\*[\\s\\S]*?\\*/`],
    ["string", `'(?:[^']|'')*'`], ["property", `"[^"\\n]*"`],
    ["constant", W("true false null"), "i"],
    // SQL keywords are case-insensitive
    ["keyword", W("select from where and or not insert into values update set delete create table alter drop index view join left right inner outer full cross on as group by order having limit offset union all distinct case when then else end is like in between exists primary key foreign references default with returning asc desc count sum avg min max coalesce over partition window"), "i"],
    ["number", `\\b\\d+(?:\\.\\d+)?\\b`], ["function", FN],
    ["punct", `[(),;.]`], ["operator", `[=<>!*+\\-/%|]+`],
  ];
  R.markdown = [
    ["string", "```[\\s\\S]*?```"],
    ["keyword", `(?<=^|\\n)#{1,6} [^\\n]*`],
    ["comment", `(?<=^|\\n)>[^\\n]*`],
    ["string", "`[^`\\n]+`"],
    ["type", `\\*\\*[^*\\n]+\\*\\*|__[^_\\n]+__`],
    ["attr", `(?<![*\\w])[*_][^*_\\n]+[*_](?![*\\w])`],
    ["function", `!?\\[[^\\]\\n]+\\]\\([^)\\n]+\\)`],
    ["punct", `(?<=^|\\n)[ \\t]*(?:[-*+]|\\d+\\.)(?=\\s)`],
    ["meta", `(?<=^|\\n)(?:---|\\*\\*\\*)\\s*(?=\\n|$)`],
  ];
  R.yaml = [
    ["comment", `(?<=^|\\s)#[^\\n]*`],
    ["meta", `(?<=^|\\n)---`],
    ["property", `[\\w.$-]+(?=\\s*:(?:\\s|$))`],
    ["string", STR_D], ["string", STR_S],
    ["constant", W("true false null yes no on off")],
    ["meta", `[&*][\\w-]+`],
    ["number", `\\b\\d+(?:\\.\\d+)?\\b`],
    ["punct", `(?<=^|\\n)[ \\t]*-(?=\\s)|[{}\\[\\],:|>]`],
  ];
  R.text = [];
  const LANG_RULES = { tsx: "js", ts: "js", jsx: "js", js: "js", python: "python", html: "html", css: "css", json: "json", bash: "bash", go: "go", rust: "rust", java: "c", c: "c", sql: "sql", markdown: "markdown", yaml: "yaml", text: "text" };
  const COMPILED = {};
  const compiled = (key) => COMPILED[key] || (COMPILED[key] = R[key].filter((r) => r[1]).map(([t, src, f]) => [t, new RegExp(src, "y" + (f || ""))]));

  // tokenize → array of lines, each an array of [type, text]
  function tokenize(code, lang) {
    const rules = compiled(LANG_RULES[lang] || "text");
    const out = [];
    let i = 0;
    let plain = "";
    const flush = () => {
      if (plain) out.push(["plain", plain]);
      plain = "";
    };
    while (i < code.length) {
      let hit = null;
      for (const [t, re] of rules) {
        re.lastIndex = i;
        const m = re.exec(code);
        if (m && m[0].length) {
          hit = [t, m[0]];
          break;
        }
      }
      if (hit) {
        flush();
        out.push(hit);
        i += hit[1].length;
      } else {
        // consume a run of word chars or a single char as plain text
        const w = /[\w$]+|\s+|./y;
        w.lastIndex = i;
        const m = w.exec(code);
        plain += m[0];
        i += m[0].length;
      }
    }
    flush();
    const lines = [[]];
    for (const [t, text] of out) {
      const parts = text.split("\n");
      parts.forEach((p, k) => {
        if (k) lines.push([]);
        if (p) lines[lines.length - 1].push([t, p]);
      });
    }
    return lines;
  }

  /* ── language detection ────────────────────────────────── */
  function detect(code) {
    const c = code.trim();
    if (!c) return "text";
    if (/^[[{]/.test(c)) {
      try {
        JSON.parse(c);
        return "json";
      } catch {}
    }
    const score = { tsx: 0, ts: 0, jsx: 0, js: 0, python: 0, html: 0, css: 0, bash: 0, go: 0, rust: 0, java: 0, c: 0, sql: 0, markdown: 0, yaml: 0 };
    const t = (re, lang, n = 1) => {
      if (re.test(code)) score[lang] += n;
    };
    t(/^\s*(import|export)\s.+from\s+['"]/m, "js", 3);
    t(/\b(const|let)\s+\w+\s*=/, "js", 2);
    t(/=>\s*[{(]?/, "js", 2);
    t(/\bfunction\s*\w*\s*\(/, "js", 2);
    t(/console\.log|document\.|window\.|useState|useEffect/, "js", 2);
    t(/:\s*(string|number|boolean|any|unknown|void)\b|\binterface\s+\w+|\btype\s+\w+\s*=|<\w+>\(|\bas const\b/, "ts", 4);
    t(/return\s*\(\s*\n?\s*<|<\/[a-zA-Z][\w.]*>|<[A-Z]\w*[\s/>]|className=/, "jsx", 4);
    t(/^\s*(def|class)\s+\w+.*:\s*$/m, "python", 4);
    t(/^\s*(from\s+[\w.]+\s+import|import\s+\w+\s*$)/m, "python", 3);
    t(/\bprint\(|\bself\.|elif\s|__name__|:\s*\n\s{4}/, "python", 2);
    t(/^\s*<!DOCTYPE|<html|<head|<body|<div[\s>]|<\/(div|p|span|section)>/im, "html", 4);
    t(/^[^{}\n]*[.#]?[\w-]+[^{}\n]*\{\s*\n?\s*[\w-]+\s*:\s*[^;]+;/m, "css", 4);
    t(/@media|@import|:root\s*\{|--[\w-]+\s*:/, "css", 3);
    t(/^#!.*\b(ba|z)?sh\b/m, "bash", 6);
    t(/^\s*(\$\s)?(npm|npx|pnpm|yarn|bun|git|cd|curl|wget|echo|sudo|brew|docker|kubectl|export|apt|pip|ls|mkdir|rm)\s/m, "bash", 4);
    t(/^package\s+\w+/m, "go", 6);
    t(/\bfunc\s+(\(\w+\s+\*?\w+\)\s*)?\w+\(|:=|fmt\./, "go", 3);
    t(/\bfn\s+\w+|let\s+mut\b|impl\s|println!|::new\(|->\s*\w+\s*\{|&str/, "rust", 4);
    t(/#\[derive|^\s*use\s+(std|crate|super)::|\bfn\s+main\s*\(\)|&'[a-z]\b|\bmatch\s+\w+\s*\{/m, "rust", 4);
    t(/\bpublic\s+(static\s+)?(class|void|final)|System\.out|@Override|\bpackage\s+[\w.]+;/, "java", 5);
    t(/#include\s*<|std::(cout|cin|string|vector|endl)|int\s+main\s*\(|printf\(|using\s+System|namespace\s+\w+/, "c", 5);
    t(/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+(TABLE|INDEX|VIEW)|WITH\s+\w+\s+AS|ALTER\s+TABLE)\b/im, "sql", 6);
    t(/^#{1,6}\s+\S/m, "markdown", 3);
    t(/^\s*[-*]\s+\S|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)/m, "markdown", 1);
    t(/^[\w.-]+:\s*(\S[^{};]*)?$/m, "yaml", 2);
    if (/^[\w.-]+:\s*$/m.test(code) && /^\s{2,}[\w.-]+:\s/m.test(code) && !/[{};]/.test(code)) score.yaml += 4;
    // the JS family: combine
    if (score.ts && score.jsx) score.tsx = score.ts + score.jsx + score.js;
    else if (score.ts) score.ts += score.js;
    else if (score.jsx) score.jsx += score.js;
    let best = "text", bv = 0;
    for (const [k, v] of Object.entries(score))
      if (v > bv) {
        best = k;
        bv = v;
      }
    return bv >= 2 ? best : "text";
  }
  const EXT = { tsx: "tsx", ts: "ts", mts: "ts", jsx: "jsx", js: "js", mjs: "js", cjs: "js", py: "python", html: "html", htm: "html", vue: "html", svelte: "html", css: "css", scss: "css", less: "css", json: "json", sh: "bash", bash: "bash", zsh: "bash", go: "go", rs: "rust", java: "java", kt: "java", c: "c", h: "c", cpp: "c", cc: "c", hpp: "c", cs: "c", swift: "c", sql: "sql", md: "markdown", mdx: "markdown", yml: "yaml", yaml: "yaml", txt: "text" };

  /* ── state ─────────────────────────────────────────────── */
  const SAMPLE = `import { useState } from 'react';

type Props = { initial?: number };

export function Counter({ initial = 0 }: Props) {
  const [count, setCount] = useState(initial);

  // Ship UI that feels premium
  return (
    <button className="btn" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`;
  const DEFAULT = { code: SAMPLE, lang: "auto", theme: "midnight", bg: "sky", bgColor: "#0ea5e9", win: "mac", title: "Counter.tsx", lineNumbers: true, font: "jetbrains", size: 15, radius: 14, widthMode: "auto", width: 720, pad: 56, shadow: true, watermark: false, diff: false, canvas: "auto", scale: "2", hl: [] };
  let S = structuredClone(DEFAULT);
  const FONTS = {
    jetbrains: `"CS JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,
    geist: `"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,
    system: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`,
  };
  const CANVAS = { auto: null, x: [1600, 900], linkedin: [1200, 627], slide: [1920, 1080], square: [1080, 1080] };
  const LH = 1.62; // line height factor
  const lang = () => (S.lang === "auto" ? detect(S.code) : S.lang);

  // the JetBrains Mono file ships with Logo Maker; load it for the editor and the canvas
  try {
    const ff = new FontFace("CS JetBrains Mono", "url(/assets/logo-fonts/jetbrains-mono-400.woff) format('woff')", { weight: "400" });
    const fb = new FontFace("CS JetBrains Mono", "url(/assets/logo-fonts/jetbrains-mono-600.woff) format('woff')", { weight: "600" });
    Promise.all([ff.load(), fb.load()])
      .then((fs) => {
        fs.forEach((f) => document.fonts.add(f));
        metricsCache = {};
        render();
      })
      .catch(() => {});
  } catch {}

  /* ── layout (CSS px, shared by preview and export) ─────── */
  let metricsCache = {};
  const mctx = document.createElement("canvas").getContext("2d");
  function charW() {
    const key = S.font + S.size;
    if (metricsCache[key]) return metricsCache[key];
    mctx.font = `${S.size}px ${FONTS[S.font]}`;
    return (metricsCache[key] = mctx.measureText("M".repeat(50)).width / 50);
  }
  function layout() {
    const lines = S.code.split("\n");
    const cw = charW();
    const lh = Math.round(S.size * LH);
    const cols = Math.max(1, ...lines.map((l) => l.length));
    const gutterW = S.lineNumbers ? Math.ceil(String(lines.length).length * cw + 20) : 0;
    const padX = 22;
    const titleH = S.win === "none" ? 0 : 42;
    const padTop = S.win === "none" ? 20 : 6;
    const padBottom = 20;
    const codeW = Math.ceil(cols * cw) + 2;
    const need = gutterW + codeW + padX * 2;
    const winW = Math.max(S.widthMode === "fixed" ? S.width : 0, need, 280);
    const winH = titleH + padTop + lines.length * lh + padBottom;
    const preset = CANVAS[S.canvas];
    let Wf, Hf, s, wx, wy;
    if (!preset) {
      Wf = winW + S.pad * 2;
      Hf = winH + S.pad * 2;
      s = 1;
      wx = S.pad;
      wy = S.pad;
    } else {
      [Wf, Hf] = preset;
      const m = Math.max(48, S.pad);
      s = Math.min(1.6, (Wf - 2 * m) / winW, (Hf - 2 * m) / winH);
      wx = (Wf - winW * s) / 2;
      wy = (Hf - winH * s) / 2;
    }
    return { lines, cw, lh, gutterW, padX, titleH, padTop, padBottom, codeW, winW, winH, W: Math.round(Wf), H: Math.round(Hf), s, wx, wy };
  }

  /* ── preview ───────────────────────────────────────────── */
  const stage = $("[data-cs-stage]");
  const fit = $("[data-cs-fit]");
  const frame = $("[data-cs-frame]");
  const win = $("[data-cs-window]");
  const pre = $("[data-cs-pre]");
  const ta = $("[data-cs-ta]");
  const gutter = $("[data-cs-gutter]");
  const bands = $("[data-cs-bands]");
  let tokens = [];

  function bandFor(i, line) {
    const T = THEMES[S.theme];
    if (S.diff && /^\+/.test(line)) return { bg: T.dark ? "rgba(34,197,94,0.16)" : "rgba(22,163,74,0.12)", bar: "#22c55e" };
    if (S.diff && /^-/.test(line)) return { bg: T.dark ? "rgba(239,68,68,0.16)" : "rgba(220,38,38,0.10)", bar: "#ef4444" };
    if (S.hl.includes(i)) return { bg: T.hl, bar: null };
    return null;
  }
  const dimmed = (i) => S.hl.length > 0 && !S.hl.includes(i);

  function render() {
    const T = THEMES[S.theme];
    const L = layout();
    tokens = tokenize(S.code, lang());
    // frame + background
    const b = BGS[S.bg];
    frame.style.width = L.W + "px";
    frame.style.height = L.H + "px";
    frame.style.background = S.bg === "none" ? "" : S.bg === "solid" ? S.bgColor : cssGrad(b);
    frame.classList.toggle("cs-transparent", S.bg === "none");
    $("[data-cs-mark]").hidden = !S.watermark;
    $("[data-cs-mark]").style.color = S.bg === "none" || (b.stops && ["peach", "lime"].includes(S.bg)) ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.75)";
    // window
    Object.assign(win.style, {
      left: L.wx + "px",
      top: L.wy + "px",
      width: L.winW + "px",
      height: L.winH + "px",
      transform: `scale(${L.s})`,
      borderRadius: S.radius + "px",
      background: T.bg,
      color: T.fg,
      boxShadow: `${S.shadow ? "0 24px 60px -12px rgba(0,0,0,0.55), " : ""}0 0 0 1px ${T.border}`,
      fontFamily: FONTS[S.font],
      fontSize: S.size + "px",
      lineHeight: L.lh + "px",
    });
    win.dataset.style = S.win;
    for (const k of Object.keys(T)) if (typeof T[k] === "string") win.style.setProperty("--t-" + k, T[k]);
    const bar = $("[data-cs-bar]");
    bar.hidden = S.win === "none";
    bar.style.height = L.titleH + "px";
    // body
    const body = $("[data-cs-body]");
    body.style.padding = `${L.padTop}px ${L.padX}px ${L.padBottom}px`;
    // bands
    bands.style.top = L.padTop + "px";
    bands.innerHTML = L.lines
      .map((line, i) => {
        const bd = bandFor(i, line);
        return bd ? `<i style="top:${i * L.lh}px;height:${L.lh}px;background:${bd.bg}${bd.bar ? `;box-shadow:inset 3px 0 0 ${bd.bar}` : ""}"></i>` : "";
      })
      .join("");
    // gutter
    gutter.hidden = !S.lineNumbers;
    gutter.style.width = L.gutterW + "px";
    gutter.innerHTML = S.lineNumbers ? L.lines.map((_, i) => `<button type="button" tabindex="-1" data-cs-line="${i}" aria-pressed="${S.hl.includes(i)}" aria-label="Highlight line ${i + 1}" style="height:${L.lh}px${dimmed(i) ? ";opacity:.45" : ""}">${i + 1}</button>`).join("") : "";
    // code
    pre.innerHTML = tokens
      .map((line, i) => `<span class="cs-l${dimmed(i) ? " cs-dim" : ""}" style="height:${L.lh}px">${line.map(([t, v]) => (t === "plain" ? esc(v) : `<span class="t-${t}">${esc(v)}</span>`)).join("")}</span>`)
      .join("");
    const cw = L.codeW + "px";
    pre.style.width = cw;
    ta.style.width = cw;
    ta.style.height = L.lines.length * L.lh + "px";
    pre.style.height = ta.style.height;
    if (ta.value !== S.code) ta.value = S.code;
    $(".cs-title").value = S.title;
    fitPreview(L);
    $("[data-cs-detected]").textContent = S.lang === "auto" ? `· ${LANG_NAME[lang()] || lang()}` : "";
    const sc = +S.scale;
    $("[data-cs-dim]").textContent = `${L.W * sc} × ${L.H * sc}`;
    saveHash();
  }
  function fitPreview(L = layout()) {
    const r = stage.getBoundingClientRect();
    const k = Math.min(1, (r.width - 48) / L.W, (r.height - 110) / L.H);
    frame.style.transform = `scale(${k})`;
    fit.style.width = L.W * k + "px";
    fit.style.height = L.H * k + "px";
  }
  new ResizeObserver(() => fitPreview()).observe(stage);
  const LANG_NAME = Object.fromEntries([...$("[data-cs-lang]").options].map((o) => [o.value, o.textContent]));

  /* ── editor behaviour ──────────────────────────────────── */
  const setCode = (v) => {
    S.code = v.replace(/\t/g, "  ").replace(/\r\n?/g, "\n");
    S.hl = S.hl.filter((i) => i < S.code.split("\n").length);
    render();
  };
  ta.addEventListener("input", () => setCode(ta.value));
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return ta.blur();
    const { selectionStart: a, selectionEnd: b, value: v } = ta;
    if (e.key === "Tab") {
      e.preventDefault();
      const ls = v.lastIndexOf("\n", a - 1) + 1;
      if (e.shiftKey) {
        const n = v.slice(ls, ls + 2).match(/^ {0,2}/)[0].length;
        ta.setRangeText("", ls, ls + n, "preserve");
        ta.selectionStart = ta.selectionEnd = Math.max(ls, a - n);
      } else ta.setRangeText("  ", a, b, "end");
      setCode(ta.value);
    } else if (e.key === "Enter") {
      // keep the current indentation
      const ls = v.lastIndexOf("\n", a - 1) + 1;
      const ind = v.slice(ls).match(/^ */)[0];
      const extra = /[{([]\s*$/.test(v.slice(ls, a)) ? "  " : "";
      e.preventDefault();
      ta.setRangeText("\n" + ind + extra, a, b, "end");
      setCode(ta.value);
    }
  });
  gutter.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cs-line]");
    if (!b) return;
    const i = +b.dataset.csLine;
    S.hl = S.hl.includes(i) ? S.hl.filter((x) => x !== i) : [...S.hl, i].sort((x, y) => x - y);
    render();
  });

  /* ── side panel ────────────────────────────────────────── */
  $("[data-cs-themes]").innerHTML = Object.entries(THEMES)
    .map(([id, t]) => `<button type="button" role="radio" class="cs-theme" data-cs-theme="${id}" aria-checked="false" style="background:${t.bg};color:${t.fg};border-color:${t.border}"><span class="cs-theme-dots"><i style="background:${t.keyword}"></i><i style="background:${t.string}"></i><i style="background:${t.function}"></i></span><b>${t.name}</b></button>`)
    .join("");
  $("[data-cs-bgs]").innerHTML = Object.entries(BGS)
    .map(([id, b]) => `<button type="button" role="radio" class="cs-bg" data-cs-bg="${id}" aria-checked="false" title="${b.name}" aria-label="${b.name} background"><i style="background:${id === "none" ? "conic-gradient(#3f3f46 25%,#1c1c1f 0 50%,#3f3f46 0 75%,#1c1c1f 0) 0 0/8px 8px" : id === "solid" ? "var(--cs-solid,#0ea5e9)" : cssGrad(b)}"></i></button>`)
    .join("");
  const fmt = { size: (v) => v + "px", radius: (v) => v + "px", width: (v) => v + "px", pad: (v) => v + "px" };
  function sync() {
    $$("[data-cs-set]").forEach((b) => b.setAttribute("aria-pressed", String(String(S[b.dataset.csSet]) === b.dataset.csVal)));
    $$("[data-cs-theme]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.csTheme === S.theme)));
    $$("[data-cs-bg]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.csBg === S.bg)));
    $$("[data-cs-in]").forEach((el) => {
      const k = el.dataset.csIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else el.value = S[k];
    });
    $$("[data-cs-out]").forEach((o) => (o.textContent = fmt[o.dataset.csOut](S[o.dataset.csOut])));
    $$("[data-cs-only]").forEach((el) => (el.hidden = !(el.dataset.csOnly === S.widthMode || el.dataset.csOnly === S.bg)));
    $("[data-cs-lang]").value = S.lang;
    $("[data-cs-font]").value = S.font;
    $("[data-cs-bgs]").style.setProperty("--cs-solid", S.bgColor);
  }
  const update = () => {
    sync();
    render();
  };
  root.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.csText) {
      S[t.dataset.csText] = t.value;
      return saveHash();
    }
    const k = t.dataset.csIn;
    if (!k) return;
    S[k] = t.type === "checkbox" ? t.checked : t.type === "color" ? t.value : +t.value;
    update();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-cs-lang]")) {
      S.lang = e.target.value;
      update();
    }
    if (e.target.matches("[data-cs-font]")) {
      S.font = e.target.value;
      update();
    }
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    const set = t.closest("[data-cs-set]");
    if (set) {
      S[set.dataset.csSet] = set.dataset.csVal;
      return update();
    }
    const th = t.closest("[data-cs-theme]");
    if (th) {
      S.theme = th.dataset.csTheme;
      return update();
    }
    const bg = t.closest("[data-cs-bg]");
    if (bg) {
      S.bg = bg.dataset.csBg;
      return update();
    }
    if (t.closest("[data-cs-reset]")) {
      S = { ...structuredClone(DEFAULT), code: S.code, title: S.title, lang: S.lang };
      return update();
    }
    if (t.closest("[data-cs-png]")) return downloadPng();
    if (t.closest("[data-cs-copy]")) return copyPng();
    if (t.closest("[data-cs-svg]")) return downloadSvg();
    if (t.closest("[data-cs-embed]")) return copyEmbed();
    if (t.closest("[data-cs-share]")) return share();
  });
  // arrow keys inside radio groups
  root.addEventListener("keydown", (e) => {
    const r = e.target.closest("[role=radio]");
    if (!r || !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    const list = [...r.parentElement.querySelectorAll("[role=radio]")];
    const n = list[(list.indexOf(r) + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length];
    e.preventDefault();
    n.click();
    n.focus();
  });

  /* paste anywhere, drop a file */
  addEventListener("paste", (e) => {
    if (e.target.closest && e.target.closest("input, textarea, select")) return;
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;
    e.preventDefault();
    S.hl = [];
    setCode(text);
    flash(`Pasted ${text.split("\n").length} lines · ${LANG_NAME[lang()] || "text"}`);
  });
  const drop = $("[data-cs-drop]");
  stage.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.hidden = false;
  });
  stage.addEventListener("dragleave", (e) => {
    if (!stage.contains(e.relatedTarget)) drop.hidden = true;
  });
  stage.addEventListener("drop", async (e) => {
    e.preventDefault();
    drop.hidden = true;
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    if (f.size > 400000) return flash("That file is too big for a screenshot");
    const text = await f.text();
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    S.lang = EXT[ext] || "auto";
    S.title = f.name;
    S.hl = [];
    setCode(text);
    sync();
    flash(`Loaded ${f.name}`);
  });

  /* ── canvas export ─────────────────────────────────────── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }
  function drawTo(scale) {
    const T = THEMES[S.theme];
    const L = layout();
    const c = document.createElement("canvas");
    c.width = Math.round(L.W * scale);
    c.height = Math.round(L.H * scale);
    const ctx = c.getContext("2d");
    ctx.scale(scale, scale);
    // background
    if (S.bg === "solid") {
      ctx.fillStyle = S.bgColor;
      ctx.fillRect(0, 0, L.W, L.H);
    } else if (S.bg !== "none") {
      const b = BGS[S.bg];
      const g = ctx.createLinearGradient(...gradLine(b.angle, L.W, L.H));
      b.stops.forEach(([col, p]) => g.addColorStop(p, col));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, L.W, L.H);
    }
    if (S.watermark) {
      ctx.font = `500 13px Geist, system-ui, sans-serif`;
      ctx.fillStyle = S.bg === "none" || ["peach", "lime"].includes(S.bg) ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.75)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("niceui.dev", L.W - 16, L.H - 12);
      ctx.textAlign = "left";
    }
    // window
    ctx.save();
    ctx.translate(L.wx, L.wy);
    ctx.scale(L.s, L.s);
    if (S.shadow) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 24;
      roundRect(ctx, 0, 0, L.winW, L.winH, S.radius);
      ctx.fillStyle = T.bg;
      ctx.fill();
      ctx.restore();
    }
    roundRect(ctx, 0, 0, L.winW, L.winH, S.radius);
    ctx.fillStyle = T.bg;
    ctx.fill();
    ctx.save();
    ctx.clip();
    if (S.win !== "none") {
      ctx.fillStyle = T.bar;
      ctx.fillRect(0, 0, L.winW, L.titleH);
      if (S.win === "mac")
        ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
          ctx.beginPath();
          ctx.arc(20 + i * 20, L.titleH / 2, 6, 0, Math.PI * 2);
          ctx.fillStyle = col;
          ctx.fill();
        });
      if (S.title) {
        ctx.font = `500 13px Geist, system-ui, sans-serif`;
        ctx.fillStyle = T.gutter === T.fg ? T.fg : mix(T.fg, 0.62);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(S.title, L.winW / 2, L.titleH / 2 + 0.5, L.winW - 140);
        ctx.textAlign = "left";
      }
    }
    // bands
    const top = L.titleH + L.padTop;
    L.lines.forEach((line, i) => {
      const bd = bandFor(i, line);
      if (!bd) return;
      ctx.fillStyle = bd.bg;
      ctx.fillRect(0, top + i * L.lh, L.winW, L.lh);
      if (bd.bar) {
        ctx.fillStyle = bd.bar;
        ctx.fillRect(0, top + i * L.lh, 3, L.lh);
      }
    });
    ctx.restore();
    // border
    roundRect(ctx, 0.5, 0.5, L.winW - 1, L.winH - 1, S.radius);
    ctx.strokeStyle = T.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    // text
    ctx.textBaseline = "middle";
    const fam = FONTS[S.font];
    tokens.forEach((line, i) => {
      const y = top + i * L.lh + L.lh / 2;
      ctx.globalAlpha = dimmed(i) ? 0.38 : 1;
      if (S.lineNumbers) {
        ctx.font = `${S.size}px ${fam}`;
        ctx.fillStyle = T.gutter;
        ctx.textAlign = "right";
        ctx.fillText(String(i + 1), L.padX + L.gutterW - 14, y);
        ctx.textAlign = "left";
      }
      let x = L.padX + L.gutterW;
      for (const [t, v] of line) {
        ctx.font = `${ITALIC.has(t) ? "italic " : ""}${S.size}px ${fam}`;
        ctx.fillStyle = t === "plain" ? T.fg : T[t] || T.fg;
        ctx.fillText(v, x, y);
        x += ctx.measureText(v).width;
      }
    });
    ctx.globalAlpha = 1;
    ctx.restore();
    return c;
  }
  // fg colour at reduced strength, for the title text
  function mix(hex, a) {
    const v = parseInt(hex.slice(1), 16);
    return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
  }
  const fileBase = () => (S.title || "code").replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-") || "code";
  function save(blob, name) {
    const a = document.createElement("a");
    a.download = name;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function ready() {
    try {
      await document.fonts.load(`${S.size}px ${FONTS[S.font]}`);
      await document.fonts.load(`italic ${S.size}px ${FONTS[S.font]}`);
    } catch {}
  }
  async function downloadPng() {
    await ready();
    const c = drawTo(+S.scale);
    c.toBlob((b) => {
      save(b, `${fileBase()}@${S.scale}x.png`);
      flash(`PNG downloaded · ${c.width} × ${c.height}`);
    }, "image/png");
  }
  async function copyPng() {
    try {
      await ready();
      const c = drawTo(+S.scale);
      const blob = await new Promise((r) => c.toBlob(r, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("Image copied, paste it into a post or doc");
    } catch {
      flash("Copy is not supported here, use PNG");
    }
  }

  /* ── SVG + HTML embed ──────────────────────────────────── */
  const xesc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function svg() {
    const T = THEMES[S.theme];
    const L = layout();
    const fam = FONTS[S.font].replace(/"/g, "'");
    const top = L.titleH + L.padTop;
    let bg = "";
    let defs = `<clipPath id="w"><rect width="${L.winW}" height="${L.winH}" rx="${S.radius}"/></clipPath>`;
    if (S.shadow) defs += `<filter id="s" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000" flood-opacity="0.5"/></filter>`;
    if (S.bg === "solid") bg = `<rect width="${L.W}" height="${L.H}" fill="${S.bgColor}"/>`;
    else if (S.bg !== "none") {
      const b = BGS[S.bg];
      const [x1, y1, x2, y2] = gradLine(b.angle, L.W, L.H).map((n) => n.toFixed(1));
      defs += `<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${b.stops.map(([c, p]) => `<stop offset="${p}" stop-color="${c}"/>`).join("")}</linearGradient>`;
      bg = `<rect width="${L.W}" height="${L.H}" fill="url(#g)"/>`;
    }
    const bar = S.win === "none" ? "" : `<rect width="${L.winW}" height="${L.titleH}" fill="${T.bar}"/>${S.win === "mac" ? ["#ff5f57", "#febc2e", "#28c840"].map((c, i) => `<circle cx="${20 + i * 20}" cy="${L.titleH / 2}" r="6" fill="${c}"/>`).join("") : ""}${S.title ? `<text x="${L.winW / 2}" y="${L.titleH / 2}" text-anchor="middle" dominant-baseline="central" font-family="Geist, system-ui, sans-serif" font-size="13" font-weight="500" fill="${T.fg}" fill-opacity="0.62">${xesc(S.title)}</text>` : ""}`;
    const bandsSvg = L.lines.map((line, i) => {
      const bd = bandFor(i, line);
      return bd ? `<rect y="${top + i * L.lh}" width="${L.winW}" height="${L.lh}" fill="${bd.bg}"/>${bd.bar ? `<rect y="${top + i * L.lh}" width="3" height="${L.lh}" fill="${bd.bar}"/>` : ""}` : "";
    }).join("");
    const text = tokens
      .map((line, i) => {
        const y = top + i * L.lh + L.lh / 2;
        const op = dimmed(i) ? ` opacity="0.38"` : "";
        const num = S.lineNumbers ? `<text x="${L.padX + L.gutterW - 14}" y="${y}" text-anchor="end" fill="${T.gutter}">${i + 1}</text>` : "";
        const spans = line.map(([t, v]) => `<tspan fill="${t === "plain" ? T.fg : T[t] || T.fg}"${ITALIC.has(t) ? ` font-style="italic"` : ""}>${xesc(v)}</tspan>`).join("");
        return `<g${op}>${num}${spans ? `<text x="${L.padX + L.gutterW}" y="${y}">${spans}</text>` : ""}</g>`;
      })
      .join("\n    ");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${L.W}" height="${L.H}" viewBox="0 0 ${L.W} ${L.H}">
  <defs>${defs}</defs>
  ${bg}
  <g transform="translate(${L.wx.toFixed(1)} ${L.wy.toFixed(1)}) scale(${L.s.toFixed(4)})">
    <rect width="${L.winW}" height="${L.winH}" rx="${S.radius}" fill="${T.bg}"${S.shadow ? ` filter="url(#s)"` : ""}/>
    <g clip-path="url(#w)">${bar}${bandsSvg}</g>
    <rect x="0.5" y="0.5" width="${L.winW - 1}" height="${L.winH - 1}" rx="${S.radius}" fill="none" stroke="${T.border}"/>
    <g font-family="${fam}" font-size="${S.size}" dominant-baseline="central" xml:space="preserve">
    ${text}
    </g>
  </g>
</svg>`;
  }
  function downloadSvg() {
    save(new Blob([svg()], { type: "image/svg+xml" }), `${fileBase()}.svg`);
    flash("SVG downloaded");
  }
  function embed() {
    const T = THEMES[S.theme];
    const L = layout();
    const bgCss = S.bg === "none" ? "transparent" : S.bg === "solid" ? S.bgColor : cssGrad(BGS[S.bg]);
    const lines = tokens
      .map((line, i) => {
        const line0 = L.lines[i];
        const bd = bandFor(i, line0);
        const style = [`display:block`, `min-height:${L.lh}px`, bd ? `background:${bd.bg}` : "", bd?.bar ? `box-shadow:inset 3px 0 0 ${bd.bar}` : "", dimmed(i) ? "opacity:.38" : "", `padding:0 ${L.padX}px`].filter(Boolean).join(";");
        const num = S.lineNumbers ? `<span style="display:inline-block;width:${L.gutterW - 14}px;margin-right:14px;text-align:right;color:${T.gutter};user-select:none">${i + 1}</span>` : "";
        return `<span style="${style}">${num}${line.map(([t, v]) => (t === "plain" ? esc(v) : `<span style="color:${T[t] || T.fg}${ITALIC.has(t) ? ";font-style:italic" : ""}">${esc(v)}</span>`)).join("")}</span>`;
      })
      .join("");
    const bar = S.win === "none" ? "" : `<div style="height:${L.titleH}px;display:flex;align-items:center;position:relative;background:${T.bar};padding:0 14px">${S.win === "mac" ? `<span style="display:flex;gap:8px">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<i style="width:12px;height:12px;border-radius:50%;background:${c};display:block"></i>`).join("")}</span>` : ""}<span style="position:absolute;left:0;right:0;text-align:center;font:500 13px system-ui,sans-serif;opacity:.62;pointer-events:none">${esc(S.title || "")}</span></div>`;
    return `<!-- Code screenshot made with NiceUI Code Screenshot (https://niceui.dev/apps/code-screenshot) -->
<div style="background:${bgCss};padding:${S.pad}px;display:inline-block;max-width:100%;box-sizing:border-box">
  <div style="background:${T.bg};color:${T.fg};border-radius:${S.radius}px;overflow:hidden;${S.shadow ? "box-shadow:0 24px 60px -12px rgba(0,0,0,.55)," : "box-shadow:"}0 0 0 1px ${T.border}">
    ${bar}
    <pre style="margin:0;padding:${L.padTop}px 0 ${L.padBottom}px;overflow:auto;font:${S.size}px/${L.lh}px ${FONTS[S.font].replace(/"/g, "'")};white-space:pre">${lines}</pre>
  </div>
</div>`;
  }
  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embed());
      flash("HTML embed copied");
    } catch {
      flash("Copy failed");
    }
  }

  /* ── share link (code + settings in the hash) ──────────── */
  const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  async function pack() {
    const bytes = new TextEncoder().encode(JSON.stringify(S));
    if ("CompressionStream" in window) {
      const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"))).arrayBuffer();
      const u8 = new Uint8Array(buf);
      let s = "";
      for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode(...u8.subarray(i, i + 8192));
      return "z" + btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    let s = "";
    for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return "j" + btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  async function unpack(h) {
    const kind = h[0];
    const bytes = unb64u(h.slice(1));
    if (kind === "z") {
      const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"))).arrayBuffer();
      return JSON.parse(new TextDecoder().decode(buf));
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  let saveT = 0;
  let lastHash = "";
  function saveHash() {
    clearTimeout(saveT);
    saveT = setTimeout(async () => {
      try {
        lastHash = "#c=" + (await pack());
        history.replaceState(null, "", lastHash);
      } catch {}
    }, 500);
  }
  async function share() {
    clearTimeout(saveT);
    lastHash = "#c=" + (await pack());
    history.replaceState(null, "", lastHash);
    try {
      await navigator.clipboard.writeText(location.href);
      flash(location.href.length > 8000 ? "Link copied (long code makes long links)" : "Share link copied");
    } catch {
      flash("The link is in the address bar");
    }
  }

  const toastEl = document.querySelector("[data-toast]");
  function flash(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ── boot ──────────────────────────────────────────────── */
  async function boot() {
    if (location.hash.startsWith("#c=")) {
      try {
        const v = await unpack(location.hash.slice(3));
        if (v && typeof v.code === "string" && THEMES[v.theme]) S = { ...structuredClone(DEFAULT), ...v };
      } catch {}
    }
    sync();
    render();
  }
  addEventListener("hashchange", async () => {
    if (location.hash === lastHash || !location.hash.startsWith("#c=")) return;
    await boot();
  });
  document.fonts?.ready.then(() => {
    metricsCache = {};
    render();
  });
  boot();
})();
