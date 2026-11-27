// NiceUI Shader Studio: every Paper Shaders effect (https://github.com/paper-design/shaders,
// Apache-2.0) running live, with generated controls, presets and one-click export.
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as Paper from "@paper-design/shaders-react";
import { vertexShaderSource } from "../../node_modules/@paper-design/shaders/dist/vertex-shader.js";
import DEFS from "../paper-shaders.json";

const SITE = "https://niceui.dev";
const THUMBS = new Set(__THUMBS__);
const CATS = ["Backgrounds", "Image filters", "Logo effects"];
const BY_SLUG = Object.fromEntries(DEFS.map((d) => [d.slug, d]));
const SAMPLES = [
  { id: "dunes", label: "Dunes", src: "/assets/shader-samples/dunes.jpg" },
  { id: "sphere", label: "Spheres", src: "/assets/shader-samples/sphere.jpg" },
  { id: "rings", label: "Rings", src: "/assets/shader-samples/rings.jpg" },
  { id: "logo-arc", label: "Arc logo", src: "/assets/shader-samples/logo-arc.png", logo: true },
  { id: "logo-star", label: "Star", src: "/assets/shader-samples/logo-star.png", logo: true },
  { id: "logo-ring", label: "Ring", src: "/assets/shader-samples/logo-ring.png", logo: true },
];
const SAMPLE = Object.fromEntries(SAMPLES.map((s) => [s.id, s]));
// the image each shader opens with (logo effects without one fall back to their built-in shapes)
const DEFAULT_IMAGE = { "paper-texture": "sphere", "fluted-glass": "rings", water: "dunes", "image-dithering": "sphere", "halftone-dots": "sphere", "halftone-cmyk": "dunes", "lens-distortion": "rings", heatmap: "logo-arc" };
const HIDDEN = new Set(["frame", "worldWidth", "worldHeight", "minPixelRatio", "maxPixelCount", "width", "height", "originX", "originY", "image"]);
const FRAMING = ["speed", "scale", "rotation", "offsetX", "offsetY", "fit"];
const OMIT_IF = { frame: 0, worldWidth: 0, worldHeight: 0, originX: 0.5, originY: 0.5, offsetX: 0, offsetY: 0, rotation: 0 };

const hasImage = (d) => d.params.some((p) => p.name === "image");
const words = (s) => s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
const COLOR_NAMES = { Back: "Background", Front: "Foreground", C: "Cyan", M: "Magenta", Y: "Yellow", K: "Black (K)" };
const title = (s) => (/^color[A-Z]/.test(s) ? COLOR_NAMES[s.slice(5)] || words(s.slice(5)) : words(s));
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const maxColors = (d, p) => +(p.description.match(/up to (\d+)/i)?.[1] || 8);

function stepFor(p, v) {
  if (p.step) return p.step;
  const span = p.max - p.min;
  if (Number.isInteger(p.min) && Number.isInteger(p.max) && span >= 8 && Number.isInteger(v)) return 1;
  return span <= 2 ? 0.01 : span <= 20 ? 0.05 : 0.5;
}
const fmtNum = (v, step) => (step >= 1 ? String(Math.round(v)) : v.toFixed(step < 0.05 ? 2 : step < 1 ? 2 : 1));

function freshState(slug, presetIndex = 0) {
  const d = BY_SLUG[slug];
  return { slug, preset: presetIndex, params: structuredClone(d.presets[presetIndex].params), image: hasImage(d) ? DEFAULT_IMAGE[slug] || "" : "" };
}
function readHash() {
  try {
    const h = new URLSearchParams(location.hash.slice(1));
    const slug = h.get("s");
    if (!slug || !BY_SLUG[slug]) return null;
    const s = freshState(slug);
    if (h.get("p")) {
      s.params = { ...s.params, ...JSON.parse(decodeURIComponent(escape(atob(h.get("p"))))) };
      s.preset = -1;
    }
    if (h.has("i") && SAMPLE[h.get("i")]) s.image = h.get("i");
    return s;
  } catch {
    return null;
  }
}

function toast(msg) {
  const el = document.querySelector("[data-toast]");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1700);
}

/* ── code export ─────────────────────────────────────────── */
const lit = (v) => JSON.stringify(v);
function propsFor(state, imageUrl) {
  const out = [];
  for (const [k, v] of Object.entries(state.params)) {
    if (k in OMIT_IF && v === OMIT_IF[k]) continue;
    out.push([k, v]);
  }
  if (imageUrl) out.push(["image", imageUrl]);
  return out;
}
function imageUrlForExport(state, uploaded) {
  if (!state.image) return "";
  if (state.image === "upload") return uploaded ? "/your-image.png" : "";
  return SITE + SAMPLE[state.image].src;
}
function packageReact(state, d, uploaded) {
  const props = propsFor(state, imageUrlForExport(state, uploaded))
    .map(([k, v]) => `      ${k}=${typeof v === "string" ? lit(v) : `{${lit(v)}}`}`)
    .join("\n");
  return `// npm i @paper-design/shaders-react
// ${d.name} by Paper Shaders (https://shaders.paper.design), configured in NiceUI Shader Studio.
import { ${d.component} } from '@paper-design/shaders-react';

export function ShaderBackground() {
  return (
    <${d.component}
      style={{ position: 'absolute', inset: 0 }}
${props}
    />
  );
}
`;
}
function canvasDataUrl(img) {
  try {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    const png = c.toDataURL("image/png");
    const webp = c.toDataURL("image/webp", 0.92);
    return webp.startsWith("data:image/webp") && webp.length < png.length ? webp : png;
  } catch {
    return "/your-image.png";
  }
}
// Reads the live shader (fragment source + final uniforms) so the export matches the preview exactly.
function snapshot(stage, state, d, uploaded) {
  const mount = stage?.querySelector("canvas")?.parentElement?.paperShaderMount;
  if (!mount) return null;
  const uniforms = {};
  const images = {};
  for (const [k, v] of Object.entries(mount.providedUniforms || {})) {
    if (v instanceof HTMLImageElement) {
      const src = v.src || "";
      if (src.startsWith("data:")) images[k] = src;
      else if (src.includes("/assets/shader-samples/")) images[k] = SITE + new URL(src).pathname;
      else if (d.category === "Logo effects") images[k] = canvasDataUrl(v); // processed logo map
      else images[k] = uploaded ? "/your-image.png" : src;
    } else if (typeof v === "number") uniforms[k] = r4(v);
    else if (typeof v === "boolean") uniforms[k] = v;
    else if (Array.isArray(v)) uniforms[k] = v.map((x) => (Array.isArray(x) ? x.map(r4) : r4(x)));
  }
  return { fragment: mount.fragmentShader, uniforms, images, mipmaps: mount.mipmaps || [], speed: state.params.speed ?? 0, frame: state.params.frame ?? 0 };
}
const credit = (d) => `${d.name} shader made with NiceUI Shader Studio. No dependencies.
Shader code: Paper Shaders (https://github.com/paper-design/shaders), Apache-2.0 license.`;
function standaloneHtml(snap, d) {
  return `<!-- ${credit(d).replace("\n", "\n     ")} -->
<div id="shader-bg" style="position: relative; width: 100%; height: 100vh; overflow: hidden;"></div>
<script>
${__RUNTIME_JS__}

paperShader(document.getElementById('shader-bg'), {
  vertex: \`${vertexShaderSource}\`,
  fragment: \`${snap.fragment}\`,
  uniforms: ${lit(snap.uniforms)},
  images: ${lit(snap.images)},
  mipmaps: ${lit(snap.mipmaps)},
  speed: ${snap.speed},
  frame: ${snap.frame},
});
</script>
`;
}
function standaloneReact(snap, d) {
  return `'use client';
// ${credit(d).replace("\n", "\n// ")}
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

${__RUNTIME_TS__}

const VERTEX = \`${vertexShaderSource}\`;
const FRAGMENT = \`${snap.fragment}\`;
const UNIFORMS: Record<string, Uniform> = ${lit(snap.uniforms)};
const IMAGES: Record<string, string> = ${lit(snap.images)};

export function ShaderBackground({ className = '', style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return paperShader(ref.current, { vertex: VERTEX, fragment: FRAGMENT, uniforms: UNIFORMS, images: IMAGES, mipmaps: ${lit(snap.mipmaps)}, speed: ${snap.speed}, frame: ${snap.frame} });
  }, []);
  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}
`;
}
// long embedded images are shortened on screen; the copied code keeps them whole
const forDisplay = (code) => code.replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]{240,}/g, (m) => `${m.slice(0, 48)}…[${Math.round(m.length / 1024)} KB image, included when you copy]`);

/* ── controls ────────────────────────────────────────────── */
function Range({ p, value, onChange }) {
  const step = stepFor(p, value);
  return (
    <label className="gm-rng" title={p.description}>
      <span>
        {title(p.name)}
        <output>{fmtNum(value, step)}</output>
      </span>
      <input type="range" min={p.min} max={p.max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}
function ColorField({ label, value, onChange, onRemove }) {
  const hex6 = /^#[0-9a-f]{6}/i.test(value) ? value.slice(0, 7) : "#000000";
  return (
    <div className="ss-color">
      <input type="color" value={hex6} aria-label={label} onChange={(e) => onChange(e.target.value + (value.length === 9 ? value.slice(7) : ""))} />
      <input className="ss-hex" value={value} spellCheck={false} aria-label={label + " hex"} onChange={(e) => /^#[0-9a-f]{3,8}$/i.test(e.target.value) && onChange(e.target.value)} />
      {onRemove && (
        <button type="button" className="ss-x" onClick={onRemove} aria-label={"Remove " + label}>
          ×
        </button>
      )}
    </div>
  );
}
function Param({ p, value, set }) {
  if (p.isColor && Array.isArray(value)) {
    const max = maxColors(null, p);
    return (
      <div className="ss-field" title={p.description}>
        <span className="ss-lab">
          {title(p.name)} <i>{value.length}/{max}</i>
        </span>
        <div className="ss-colors">
          {value.map((c, i) => (
            <ColorField key={i} label={`Colour ${i + 1}`} value={c} onChange={(v) => set(value.map((x, j) => (j === i ? v : x)))} onRemove={value.length > 1 ? () => set(value.filter((_, j) => j !== i)) : null} />
          ))}
          {value.length < max && (
            <button type="button" className="gm-ghost ss-add" onClick={() => set([...value, value[value.length - 1] || "#ffffff"])}>
              + Add colour
            </button>
          )}
        </div>
      </div>
    );
  }
  if (p.isColor) return (
    <div className="ss-field ss-inline" title={p.description}>
      <span className="ss-lab">{title(p.name)}</span>
      <ColorField label={title(p.name)} value={value} onChange={set} />
    </div>
  );
  if (p.type === "enum" && p.options) {
    if (p.options.length <= 4)
      return (
        <div className="ss-field" title={p.description}>
          <span className="ss-lab">{title(p.name)}</span>
          <div className="gm-seg" style={{ gridTemplateColumns: `repeat(${p.options.length}, 1fr)` }} role="group" aria-label={title(p.name)}>
            {p.options.map((o) => (
              <button key={o} type="button" aria-pressed={value === o} onClick={() => set(o)}>
                {title(String(o))}
              </button>
            ))}
          </div>
        </div>
      );
    return (
      <label className="ss-field ss-inline" title={p.description}>
        <span className="ss-lab">{title(p.name)}</span>
        <select className="ss-select" value={value} onChange={(e) => set(e.target.value)}>
          {p.options.map((o) => (
            <option key={o} value={o}>
              {title(String(o))}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (typeof value === "boolean")
    return (
      <label className="ss-field ss-inline ss-check" title={p.description}>
        <span className="ss-lab">{title(p.name)}</span>
        <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
      </label>
    );
  if (typeof value === "number") {
    const q = p.min === undefined ? (p.name === "speed" ? { ...p, min: 0, max: 3, step: 0.01 } : null) : p;
    return q ? <Range p={q} value={value} onChange={set} /> : null;
  }
  return null;
}

/* ── app ─────────────────────────────────────────────────── */
function App() {
  const [state, setState] = useState(() => readHash() || freshState("grain-gradient"));
  const [cat, setCat] = useState(() => BY_SLUG[state.slug].category);
  const [playing, setPlaying] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [tab, setTab] = useState("react");
  const [card, setCard] = useState(true);
  const [upload, setUpload] = useState("");
  const [code, setCode] = useState("");
  const stageRef = useRef(null);
  const d = BY_SLUG[state.slug];
  const Comp = Paper[d.component];

  const pick = (slug) => {
    setState(freshState(slug));
    setCat(BY_SLUG[slug].category);
  };
  const setParam = (k, v) => setState((s) => ({ ...s, preset: -1, params: { ...s.params, [k]: v } }));
  const imageSrc = state.image === "upload" ? upload : state.image ? SAMPLE[state.image].src : "";

  // keep the URL shareable
  useEffect(() => {
    const t = setTimeout(() => {
      const p = btoa(unescape(encodeURIComponent(JSON.stringify(state.params))));
      history.replaceState(null, "", `#s=${state.slug}&p=${p}${state.image && state.image !== "upload" ? `&i=${state.image}` : ""}`);
    }, 400);
    return () => clearTimeout(t);
  }, [state]);

  // regenerate the export after the shader has applied the latest uniforms
  useEffect(() => {
    let alive = true;
    const run = () => {
      if (!alive) return;
      if (tab === "pkg") return setCode(packageReact(state, d, !!upload));
      const snap = snapshot(stageRef.current, state, d, !!upload);
      if (!snap) return setTimeout(run, 150);
      setCode(tab === "html" ? standaloneHtml(snap, d) : standaloneReact(snap, d));
    };
    const t = setTimeout(run, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [state, tab, upload]);

  const groups = useMemo(() => {
    const vis = d.params.filter((p) => !HIDDEN.has(p.name) && p.name in state.params);
    return [
      ["Colours", vis.filter((p) => p.isColor)],
      ["Shape", vis.filter((p) => !p.isColor && !FRAMING.includes(p.name))],
      ["Motion & framing", vis.filter((p) => FRAMING.includes(p.name))],
    ].filter(([, l]) => l.length);
  }, [d, state.params]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast(`Copied ${{ pkg: "React (package)", react: "React", html: "HTML" }[tab]} · ${code.split("\n").length} lines`);
    } catch {
      toast("Copy failed. Select the code and copy it");
    }
  };
  const png = () => {
    const c = stageRef.current?.querySelector("canvas");
    if (!c) return;
    const a = document.createElement("a");
    a.download = `${state.slug}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
    toast(`PNG downloaded · ${c.width} × ${c.height}`);
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast("Share link copied");
    } catch {
      toast("The link is in the address bar");
    }
  };
  const onUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (upload) URL.revokeObjectURL(upload);
    setUpload(URL.createObjectURL(f));
    setState((s) => ({ ...s, image: "upload" }));
  };
  const randomize = () => {
    const pool = DEFS.filter((x) => x.category === cat);
    const nd = pool[Math.floor(Math.random() * pool.length)];
    const s = freshState(nd.slug, Math.floor(Math.random() * nd.presets.length));
    setState(s);
  };
  const animated = "speed" in state.params;

  return (
    <div className="ss">
      <div className="ss-main">
        <div className="ss-stage" ref={stageRef}>
          <Comp
            key={state.slug + "|" + (state.image === "upload" ? upload : state.image)}
            {...state.params}
            {...(hasImage(d) ? { image: imageSrc } : {})}
            speed={playing ? state.params.speed ?? 0 : 0}
            webGlContextAttributes={{ preserveDrawingBuffer: true }}
            style={{ position: "absolute", inset: 0 }}
          />
          {card && (
            <div className="pm-card ss-card">
              <span className="pm-card-tag">{d.category}</span>
              <p className="pm-card-h">{d.name}</p>
              <p className="pm-card-p">{d.description}</p>
              <span className="pm-card-btn">Get started</span>
            </div>
          )}
          <div className="pm-stage-bar">
            <label className="pm-toggle">
              <input type="checkbox" checked={card} onChange={(e) => setCard(e.target.checked)} /> <span>Sample card</span>
            </label>
            {animated && (
              <button type="button" className="pm-toggle" onClick={() => setPlaying((v) => !v)}>
                {playing ? "Pause" : "Play"}
              </button>
            )}
            <button type="button" className="pm-chip" onClick={randomize}>
              Random
            </button>
          </div>
        </div>
        <div className="pm-strip">
          <div className="pm-cats" role="group" aria-label="Category">
            {CATS.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>
                {c}
                <i>{DEFS.filter((x) => x.category === c).length}</i>
              </button>
            ))}
          </div>
          <div className="pm-types ss-types" role="radiogroup" aria-label="Shader">
            {DEFS.filter((x) => x.category === cat).map((x) => (
              <button key={x.slug} type="button" role="radio" aria-checked={x.slug === state.slug} className="pm-type" onClick={() => pick(x.slug)}>
                <span className="pm-type-sw ss-sw">{THUMBS.has(x.slug) && <img src={`/assets/shader-thumbs/${x.slug}.webp`} alt="" loading="lazy" width="86" height="44" />}</span>
                <b>{x.name}</b>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="pm-side" aria-label="Controls">
        <div className="pm-scroll">
          <section className="gm-card">
            <div className="gm-presets-head">
              <h2>{d.name}</h2>
              <button type="button" className="gm-ghost" onClick={() => setState(freshState(state.slug, Math.max(0, state.preset)))}>
                Reset
              </button>
            </div>
            <div className="ss-presets">
              {d.presets.map((p, i) => (
                <button key={p.name} type="button" aria-pressed={state.preset === i} onClick={() => setState((s) => ({ ...freshState(s.slug, i), image: s.image }))}>
                  {p.name}
                </button>
              ))}
            </div>
          </section>
          {hasImage(d) && (
            <section className="gm-card">
              <h2>Image</h2>
              <div className="ss-imgs">
                {d.category === "Logo effects" && d.slug !== "heatmap" && (
                  <button type="button" aria-pressed={!state.image} onClick={() => setState((s) => ({ ...s, image: "" }))} className="ss-img ss-img-none">
                    Built-in
                  </button>
                )}
                {SAMPLES.filter((s) => !!s.logo === (d.category === "Logo effects")).map((s) => (
                  <button key={s.id} type="button" aria-pressed={state.image === s.id} className={"ss-img" + (s.logo ? " ss-img-logo" : "")} onClick={() => setState((x) => ({ ...x, image: s.id }))} title={s.label}>
                    <img src={s.src} alt={s.label} loading="lazy" />
                  </button>
                ))}
                <label className={"ss-img ss-img-up" + (state.image === "upload" ? " on" : "")}>
                  <input type="file" accept="image/*" onChange={onUpload} />
                  Upload
                </label>
              </div>
              <p className="gm-tip">{d.category === "Logo effects" ? "Use a PNG or SVG logo with a transparent background." : "Your image stays in your browser."}</p>
            </section>
          )}
          {groups.map(([g, list]) => (
            <section className="gm-card" key={g}>
              <h2>{g}</h2>
              {list.map((p) => (
                <Param key={p.name} p={p} value={state.params[p.name]} set={(v) => setParam(p.name, v)} />
              ))}
            </section>
          ))}
          <p className="ss-credit">
            Shaders by <a href="https://shaders.paper.design" rel="noopener" target="_blank">Paper Shaders</a>, open source under the <a href="/licenses/paper-shaders.txt">Apache-2.0 license</a>.
          </p>
        </div>
        <section className="pm-export">
          <div className="gm-tabs" role="tablist" aria-label="Export format">
            {[
              ["react", "React"],
              ["html", "HTML"],
              ["pkg", "Package"],
            ].map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
                {l}
              </button>
            ))}
          </div>
          <pre className="gm-code">
            <code>{forDisplay(code)}</code>
          </pre>
          <div className="gm-actions">
            <button type="button" className="btn btn-sky" onClick={copy} disabled={!code}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>{" "}
              Copy code
            </button>
            <button type="button" className="btn btn-cmd" onClick={png}>
              PNG
            </button>
            <button type="button" className="btn btn-cmd" onClick={share}>
              Share
            </button>
          </div>
          <p className="gm-note">{tab === "pkg" ? "Uses the official @paper-design/shaders-react package." : "Dependency-free: the shader and a small WebGL2 runner, inline. Respects reduced motion."}</p>
        </section>
      </aside>
    </div>
  );
}

const root = document.getElementById("ss-root");
if (root) {
  root.textContent = "";
  createRoot(root).render(<App />);
}
