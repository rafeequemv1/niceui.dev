/* NiceUI Gradient Maker — linear, radial, conic, mesh and WebGL shader gradients.
   Plain JavaScript, no dependencies. Every export is dependency-free too. */
(() => {
  const root = document.querySelector("[data-gm]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];

  /* ── colour helpers ─────────────────────────────────────── */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hex2rgb = (h) => {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const rgb2hex = (r, g, b) => "#" + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0")).join("");
  const hsl2hex = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return rgb2hex(f(0) * 255, f(8) * 255, f(4) * 255);
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v);

  /* ── state ──────────────────────────────────────────────── */
  const DEFAULT = {
    mode: "mesh",
    colors: [
      { c: "#0ea5e9", p: 0, x: 18, y: 22 },
      { c: "#a78bfa", p: 35, x: 82, y: 18 },
      { c: "#34d399", p: 70, x: 30, y: 82 },
      { c: "#f472b6", p: 100, x: 85, y: 80 },
    ],
    base: "#020617",
    angle: 135,
    cx: 50,
    cy: 40,
    shape: "circle",
    conic: 0,
    spread: 55,
    grain: 0.12,
    shader: { kind: "flow", speed: 0.35, scale: 1.4, warp: 0.6 },
  };
  let S = structuredClone(DEFAULT);
  let sel = 0;

  /* ── presets ────────────────────────────────────────────── */
  const P = (name, mode, cols, extra = {}) => ({ name, mode, colors: cols.map((c, i, a) => ({ c, p: Math.round((i / (a.length - 1)) * 100), x: [18, 82, 30, 85, 55, 12][i % 6], y: [22, 18, 82, 80, 50, 60][i % 6] })), ...extra });
  const PRESETS = [
    P("Northern Lights", "shader", ["#020617", "#0e7490", "#22d3ee", "#a7f3d0"], { shader: { kind: "aurora", speed: 0.3, scale: 1.2, warp: 0.7 }, grain: 0.08 }),
    P("Liquid Sunset", "shader", ["#1f1135", "#fb7185", "#fdba74", "#facc15"], { shader: { kind: "flow", speed: 0.3, scale: 1.3, warp: 0.65 }, grain: 0.1 }),
    P("Deep Ocean", "shader", ["#020617", "#0c4a6e", "#0ea5e9", "#7dd3fc"], { shader: { kind: "flow", speed: 0.25, scale: 1.6, warp: 0.5 }, grain: 0.06 }),
    P("Neon Plasma", "shader", ["#0b0118", "#ff2fd6", "#22d3ee", "#a855f7"], { shader: { kind: "plasma", speed: 0.5, scale: 1.2, warp: 0.6 }, grain: 0.06 }),
    P("Lava Lamp", "shader", ["#2a0a00", "#ff006e", "#ff4d00", "#ffb000"], { shader: { kind: "flow", speed: 0.4, scale: 1.1, warp: 0.9 }, grain: 0.08 }),
    P("Forest Waves", "shader", ["#022c22", "#065f46", "#10b981", "#d9f99d"], { shader: { kind: "waves", speed: 0.35, scale: 1.3, warp: 0.6 }, grain: 0.07 }),
    P("Pastel Dream", "mesh", ["#fbcfe8", "#bae6fd", "#d9f99d", "#e9d5ff"], { base: "#fdf8f3", spread: 60, grain: 0.1 }),
    P("Aurora Mesh", "mesh", ["#22d3ee", "#a78bfa", "#34d399", "#0ea5e9"], { base: "#020617", spread: 55, grain: 0.12 }),
    P("Paper Sky", "mesh", ["#e0f2fe", "#fef3c7", "#bfdbfe", "#fde2e4"], { base: "#fffaf0", spread: 65, grain: 0.14 }),
    P("Mint Chip", "mesh", ["#a7f3d0", "#ecfccb", "#5eead4", "#d1fae5"], { base: "#f0fdf4", spread: 60, grain: 0.08 }),
    P("Peach Fuzz", "linear", ["#ffecd2", "#fcb69f", "#ff8a8a"], { angle: 135, grain: 0.1 }),
    P("Grape Soda", "linear", ["#4c1d95", "#7c3aed", "#f0abfc"], { angle: 160, grain: 0.06 }),
    P("Ember", "radial", ["#fef3c7", "#f97316", "#7c2d12", "#0c0a09"], { cx: 50, cy: 85, grain: 0.1 }),
    P("Midnight Bloom", "radial", ["#38bdf8", "#1e3a8a", "#020617"], { cx: 50, cy: 0, shape: "ellipse", grain: 0.08 }),
    P("Holo Foil", "conic", ["#a5f3fc", "#f0abfc", "#fde68a", "#86efac", "#a5f3fc"], { conic: 30, cx: 50, cy: 50, grain: 0.12 }),
    P("Prism", "conic", ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"], { conic: 0, cx: 50, cy: 50, grain: 0 }),
  ];

  /* ── CSS generation ─────────────────────────────────────── */
  const sorted = () => [...S.colors].sort((a, b) => a.p - b.p);
  const stopList = () => sorted().map((s) => `${s.c} ${s.p}%`).join(", ");
  const noiseUrl = (a) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 ${a.toFixed(2)} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`).replace(/'/g, "%27")}")`;
  const layers = (mode = S.mode) => {
    if (mode === "linear") return [`linear-gradient(${S.angle}deg, ${stopList()})`];
    if (mode === "radial") return [`radial-gradient(${S.shape} at ${S.cx}% ${S.cy}%, ${stopList()})`];
    if (mode === "conic") return [`conic-gradient(from ${S.conic}deg at ${S.cx}% ${S.cy}%, ${stopList()})`];
    // mesh (and the static fallback for shaders)
    return [...S.colors.map((s) => `radial-gradient(at ${Math.round(s.x)}% ${Math.round(s.y)}%, ${s.c} 0px, transparent ${S.spread}%)`), mode === "mesh" ? S.base : sorted()[0].c];
  };
  const cssBackground = (mode, withGrain = true) => [...(withGrain && S.grain > 0 ? [noiseUrl(S.grain)] : []), ...layers(mode)].join(",\n    ");

  /* ── WebGL shader ───────────────────────────────────────── */
  const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uC[5];
uniform int uN;
uniform int uKind;
uniform float uScale;
uniform float uWarp;
uniform float uGrain;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0) * float(uN - 1);
  vec3 c = uC[0];
  for (int i = 0; i < 4; i++) {
    if (i < uN - 1) c = mix(c, uC[i + 1], smoothstep(float(i), float(i) + 1.0, t));
  }
  return c;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * uScale * 2.0;
  float t = uTime;
  float v;
  if (uKind == 0) {
    vec2 s = p * 0.45;
    vec2 q = vec2(noise(s + t * 0.08), noise(s + vec2(5.2, 1.3) - t * 0.1));
    vec2 r = vec2(noise(s + uWarp * 2.6 * q + vec2(1.7, 9.2) + t * 0.12), noise(s + uWarp * 2.6 * q + vec2(8.3, 2.8) - t * 0.1));
    v = smoothstep(0.15, 0.85, 0.65 * noise(s + uWarp * 2.6 * r) + 0.35 * noise(s * 1.7 - r));
  } else if (uKind == 1) {
    float w = sin(p.x * 2.4 + sin(p.y * 1.6 + t) * uWarp * 2.5 + t * 0.8);
    v = 0.5 + 0.35 * w + 0.25 * (fbm(p * 1.5 + t * 0.15) - 0.5) * uWarp * 2.0;
  } else if (uKind == 2) {
    float band = fbm(vec2(p.x * 0.9 + t * 0.12, t * 0.05));
    float curtain = fbm(vec2(p.x * 3.0 + band * 2.0, p.y * 0.4 - t * 0.2));
    v = clamp(1.0 - uv.y + (band - 0.5) * uWarp * 1.6, 0.0, 1.0) * 0.7 + curtain * 0.45 - 0.1;
  } else {
    v = 0.5 + 0.25 * sin(p.x * 3.0 + t) + 0.25 * sin((p.y * 3.0 + t) * 0.8 + uWarp * fbm(p + t * 0.2) * 6.0);
  }
  vec3 col = palette(v);
  col += (hash(gl_FragCoord.xy + fract(t * 7.0)) - 0.5) * uGrain;
  gl_FragColor = vec4(col, 1.0);
}`;
  const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const KINDS = ["flow", "waves", "aurora", "plasma"];

  function makeGL(canvas) {
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    return { gl, u: { res: u("uRes"), time: u("uTime"), c: u("uC"), n: u("uN"), kind: u("uKind"), scale: u("uScale"), warp: u("uWarp"), grain: u("uGrain") } };
  }
  function drawGL(ctx, w, h, t) {
    const { gl, u } = ctx;
    gl.viewport(0, 0, w, h);
    const cols = sorted().slice(0, 5);
    const flat = new Float32Array(15);
    cols.forEach((s, i) => hex2rgb(s.c).forEach((v, k) => (flat[i * 3 + k] = v / 255)));
    gl.uniform2f(u.res, w, h);
    gl.uniform1f(u.time, t);
    gl.uniform3fv(u.c, flat);
    gl.uniform1i(u.n, cols.length);
    gl.uniform1i(u.kind, KINDS.indexOf(S.shader.kind));
    gl.uniform1f(u.scale, S.shader.scale);
    gl.uniform1f(u.warp, S.shader.warp);
    gl.uniform1f(u.grain, S.grain * 0.6);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /* ── preview ────────────────────────────────────────────── */
  const stage = $("[data-gm-stage]");
  const cssLayer = $("[data-gm-css]");
  const canvas = $("[data-gm-canvas]");
  const handles = $("[data-gm-handles]");
  let glc = null;
  let playing = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let clock = 0;
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (S.mode === "shader" && glc) {
      if (playing) clock += dt * S.shader.speed * 2;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      const w = Math.max(2, Math.round(r.width * dpr));
      const h = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      drawGL(glc, w, h, clock);
    }
    requestAnimationFrame(loop);
  };

  function renderPreview() {
    const shader = S.mode === "shader";
    if (shader && !glc) glc = makeGL(canvas);
    canvas.hidden = !shader || !glc;
    cssLayer.style.background = cssBackground(shader ? "mesh" : S.mode).replace(/\n\s*/g, " ");
    cssLayer.hidden = shader && !!glc;
    renderHandles();
  }

  function renderHandles() {
    handles.innerHTML = "";
    const add = (x, y, color, i, cls = "") => {
      const h = document.createElement("button");
      h.type = "button";
      h.className = "gm-h " + cls;
      h.style.left = x + "%";
      h.style.top = y + "%";
      if (color) h.style.background = color;
      h.dataset.i = i;
      h.setAttribute("aria-label", i === "c" ? "Move the gradient centre" : `Move colour ${+i + 1}`);
      if (i !== "c" && +i === sel) h.classList.add("on");
      handles.appendChild(h);
    };
    if (S.mode === "mesh") S.colors.forEach((s, i) => add(s.x, s.y, s.c, i));
    if (S.mode === "radial" || S.mode === "conic") add(S.cx, S.cy, null, "c", "gm-hc");
  }

  /* drag handles on the preview */
  let drag = null;
  handles.addEventListener("pointerdown", (e) => {
    const h = e.target.closest(".gm-h");
    if (!h) return;
    drag = h.dataset.i;
    if (drag !== "c") {
      sel = +drag;
      renderStops();
    }
    h.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  handles.addEventListener("pointermove", (e) => {
    if (drag === null) return;
    const r = stage.getBoundingClientRect();
    const x = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
    const y = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100);
    if (drag === "c") {
      S.cx = Math.round(x);
      S.cy = Math.round(y);
    } else {
      S.colors[+drag].x = x;
      S.colors[+drag].y = y;
    }
    update(false);
  });
  const endDrag = () => {
    if (drag !== null) {
      drag = null;
      update();
    }
  };
  handles.addEventListener("pointerup", endDrag);
  handles.addEventListener("pointercancel", endDrag);
  handles.addEventListener("keydown", (e) => {
    const h = e.target.closest(".gm-h");
    if (!h || !/^Arrow/.test(e.key)) return;
    e.preventDefault();
    const d = e.shiftKey ? 5 : 1;
    const dx = e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0;
    const dy = e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0;
    if (h.dataset.i === "c") {
      S.cx = clamp(S.cx + dx, 0, 100);
      S.cy = clamp(S.cy + dy, 0, 100);
    } else {
      const s = S.colors[+h.dataset.i];
      s.x = clamp(s.x + dx, 0, 100);
      s.y = clamp(s.y + dy, 0, 100);
    }
    update();
    handles.querySelector(`[data-i="${h.dataset.i}"]`)?.focus();
  });

  /* ── colour stop bar ────────────────────────────────────── */
  const bar = $("[data-gm-bar]");
  const stopsEl = $("[data-gm-stops]");
  const pick = $("[data-gm-pick]");
  const hexIn = $("[data-gm-hex]");
  const posIn = $("[data-gm-pos]");
  function renderStops() {
    bar.style.background = `linear-gradient(90deg, ${stopList()})`;
    stopsEl.innerHTML = S.colors
      .map((s, i) => `<button type="button" class="gm-stop${i === sel ? " on" : ""}" data-s="${i}" style="left:${s.p}%;--c:${s.c}" aria-label="Colour stop ${i + 1}, ${s.c} at ${s.p}%"></button>`)
      .join("");
    const s = S.colors[sel];
    pick.value = s.c;
    if (document.activeElement !== hexIn) hexIn.value = s.c;
    posIn.value = s.p;
    $("[data-gm-del]").disabled = S.colors.length <= 2;
    $("[data-gm-swatches]").innerHTML = S.colors.map((s, i) => `<button type="button" class="gm-sw${i === sel ? " on" : ""}" data-sw="${i}" style="background:${s.c}" aria-label="Edit colour ${i + 1}"></button>`).join("");
  }
  let sdrag = null;
  stopsEl.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".gm-stop");
    if (!b) return;
    sel = +b.dataset.s;
    sdrag = sel;
    b.setPointerCapture(e.pointerId);
    renderStops();
    e.preventDefault();
  });
  stopsEl.addEventListener("pointermove", (e) => {
    if (sdrag === null) return;
    const r = bar.getBoundingClientRect();
    S.colors[sdrag].p = Math.round(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100));
    update(false);
  });
  stopsEl.addEventListener("pointerup", () => {
    if (sdrag !== null) {
      sdrag = null;
      update();
    }
  });
  bar.addEventListener("click", (e) => {
    if (S.colors.length >= 6 || e.target.closest(".gm-stop")) return;
    const r = bar.getBoundingClientRect();
    const p = Math.round(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100));
    // colour under the click: mix the neighbouring stops
    const ss = sorted();
    let a = ss[0],
      b = ss[ss.length - 1];
    for (let i = 0; i < ss.length - 1; i++) if (p >= ss[i].p && p <= ss[i + 1].p) ((a = ss[i]), (b = ss[i + 1]));
    const k = b.p === a.p ? 0 : (p - a.p) / (b.p - a.p);
    const ca = hex2rgb(a.c),
      cb = hex2rgb(b.c);
    S.colors.push({ c: rgb2hex(...ca.map((v, i) => v + (cb[i] - v) * k)), p, x: rnd(15, 85), y: rnd(15, 85) });
    sel = S.colors.length - 1;
    update();
  });
  stopsEl.addEventListener("keydown", (e) => {
    const b = e.target.closest(".gm-stop");
    if (!b) return;
    const i = +b.dataset.s;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      S.colors[i].p = clamp(S.colors[i].p + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1), 0, 100);
      update();
      stopsEl.querySelector(`[data-s="${i}"]`)?.focus();
    }
    if ((e.key === "Delete" || e.key === "Backspace") && S.colors.length > 2) {
      S.colors.splice(i, 1);
      sel = 0;
      update();
    }
  });
  pick.addEventListener("input", () => {
    S.colors[sel].c = pick.value;
    update(false);
  });
  pick.addEventListener("change", () => update());
  hexIn.addEventListener("input", () => {
    const v = hexIn.value.trim().startsWith("#") ? hexIn.value.trim() : "#" + hexIn.value.trim();
    if (isHex(v)) {
      S.colors[sel].c = v.toLowerCase();
      update();
    }
  });
  posIn.addEventListener("input", () => {
    S.colors[sel].p = clamp(+posIn.value || 0, 0, 100);
    update(false);
  });
  root.addEventListener("click", (e) => {
    const sw = e.target.closest("[data-sw]");
    if (sw) {
      sel = +sw.dataset.sw;
      renderStops();
      renderHandles();
    }
  });
  $("[data-gm-del]").addEventListener("click", () => {
    if (S.colors.length <= 2) return;
    S.colors.splice(sel, 1);
    sel = Math.max(0, sel - 1);
    update();
  });

  /* ── harmony generators ─────────────────────────────────── */
  const HARMONY = {
    random: () => Array.from({ length: 3 + Math.floor(rnd(0, 2)) }, () => hsl2hex(rnd(0, 360), rnd(55, 95), rnd(35, 75))),
    pastel: (h) => [0, 40, 90, 150].map((d) => hsl2hex(h + d, rnd(70, 95), rnd(82, 90))),
    vivid: (h) => [0, 35, 70].map((d) => hsl2hex(h + d, rnd(85, 100), rnd(50, 60))),
    neon: (h) => ["#05010f", hsl2hex(h, 100, 55), hsl2hex(h + 120, 100, 55), hsl2hex(h + 220, 100, 60)],
    dark: (h) => ["#030712", hsl2hex(h, 70, 18), hsl2hex(h + 25, 75, 38), hsl2hex(h + 50, 85, 62)],
    analogous: (h) => [-30, 0, 30].map((d) => hsl2hex(h + d, rnd(65, 85), rnd(50, 65))),
    complementary: (h) => [hsl2hex(h, 80, 55), hsl2hex(h + 30, 70, 75), hsl2hex(h + 180, 80, 55)],
    earthy: (h) => [hsl2hex(30 + rnd(-10, 10), 35, 85), hsl2hex(95 + rnd(-15, 15), 25, 55), hsl2hex(25 + rnd(-10, 10), 45, 40)],
  };
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-gm-harmony]");
    if (!b) return;
    const cols = HARMONY[b.dataset.gmHarmony](rnd(0, 360));
    S.colors = cols.map((c, i, a) => ({ c, p: Math.round((i / (a.length - 1)) * 100), x: rnd(10, 90), y: rnd(10, 90) }));
    if (S.mode === "mesh") S.base = b.dataset.gmHarmony === "pastel" || b.dataset.gmHarmony === "earthy" ? "#fdf8f3" : b.dataset.gmHarmony === "neon" || b.dataset.gmHarmony === "dark" ? "#030712" : S.base;
    sel = 0;
    update();
  });

  /* ── mode + parameter controls ──────────────────────────── */
  const bindRange = (sel, get, set, fmt = (v) => v) => {
    const el = $(sel);
    const out = $(sel.replace(/\]$/, "-out]"));
    el.addEventListener("input", () => {
      set(+el.value);
      if (out) out.textContent = fmt(+el.value);
      update(false);
    });
    el.addEventListener("change", () => update());
    return () => {
      el.value = get();
      if (out) out.textContent = fmt(get());
    };
  };
  const syncers = [
    bindRange("[data-gm-angle]", () => S.angle, (v) => (S.angle = v), (v) => v + "°"),
    bindRange("[data-gm-conic]", () => S.conic, (v) => (S.conic = v), (v) => v + "°"),
    bindRange("[data-gm-spread]", () => S.spread, (v) => (S.spread = v), (v) => v + "%"),
    bindRange("[data-gm-grain]", () => Math.round(S.grain * 100), (v) => (S.grain = v / 100), (v) => v + "%"),
    bindRange("[data-gm-speed]", () => Math.round(S.shader.speed * 100), (v) => (S.shader.speed = v / 100), (v) => (v / 100).toFixed(2)),
    bindRange("[data-gm-scale]", () => Math.round(S.shader.scale * 100), (v) => (S.shader.scale = v / 100), (v) => (v / 100).toFixed(2)),
    bindRange("[data-gm-warp]", () => Math.round(S.shader.warp * 100), (v) => (S.shader.warp = v / 100), (v) => (v / 100).toFixed(2)),
  ];
  $("[data-gm-base]").addEventListener("input", (e) => {
    S.base = e.target.value;
    update(false);
  });
  root.addEventListener("click", (e) => {
    const m = e.target.closest("[data-gm-mode]");
    if (m) {
      S.mode = m.dataset.gmMode;
      update();
    }
    const k = e.target.closest("[data-gm-kind]");
    if (k) {
      S.shader.kind = k.dataset.gmKind;
      update();
    }
    const sh = e.target.closest("[data-gm-shape]");
    if (sh) {
      S.shape = sh.dataset.gmShape;
      update();
    }
    const pr = e.target.closest("[data-gm-preset]");
    if (pr) {
      const p = PRESETS[+pr.dataset.gmPreset];
      S = { ...structuredClone(DEFAULT), ...structuredClone(p), shader: { ...DEFAULT.shader, ...(p.shader || {}) } };
      delete S.name;
      sel = 0;
      update();
      stage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (e.target.closest("[data-gm-play]")) {
      playing = !playing;
      e.target.closest("[data-gm-play]").textContent = playing ? "Pause" : "Play";
    }
    if (e.target.closest("[data-gm-reset]")) {
      S = structuredClone(DEFAULT);
      sel = 0;
      update();
    }
    const ex = e.target.closest("[data-gm-tab]");
    if (ex) {
      tab = ex.dataset.gmTab;
      renderExport();
    }
    if (e.target.closest("[data-gm-copy]")) copyOut();
    if (e.target.closest("[data-gm-png]")) downloadPng();
    if (e.target.closest("[data-gm-share]")) shareLink();
  });

  function syncControls() {
    $$("[data-gm-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.gmMode === S.mode)));
    $$("[data-gm-kind]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.gmKind === S.shader.kind)));
    $$("[data-gm-shape]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.gmShape === S.shape)));
    $$("[data-gm-show]").forEach((el) => (el.hidden = !el.dataset.gmShow.split(" ").includes(S.mode)));
    $("[data-gm-base]").value = S.base;
    syncers.forEach((f) => f());
  }

  /* ── export ─────────────────────────────────────────────── */
  let tab = "css";
  const out = $("[data-gm-out]");
  const shaderReact = () => {
    const cols = sorted().slice(0, 5).map((s) => hex2rgb(s.c).map((v) => +(v / 255).toFixed(3)));
    return `'use client';
import { useEffect, useRef, type CSSProperties } from 'react';

// ${KINDS[KINDS.indexOf(S.shader.kind)]} shader gradient made with NiceUI Gradient Maker. No dependencies.
const COLORS = ${JSON.stringify(cols)};
const SETTINGS = { kind: ${KINDS.indexOf(S.shader.kind)}, speed: ${S.shader.speed}, scale: ${S.shader.scale}, warp: ${S.shader.warp}, grain: ${+(S.grain * 0.6).toFixed(3)} };
const FRAG = \`${FRAG}\`;

export function ShaderGradient({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext('webgl');
    if (!canvas || !gl) return;
    const make = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, make(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
    gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.uniform3fv(u('uC'), COLORS.flat().concat(Array(15).fill(0)).slice(0, 15));
    gl.uniform1i(u('uN'), COLORS.length);
    gl.uniform1i(u('uKind'), SETTINGS.kind);
    gl.uniform1f(u('uScale'), SETTINGS.scale);
    gl.uniform1f(u('uWarp'), SETTINGS.warp);
    gl.uniform1f(u('uGrain'), SETTINGS.grain);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const frame = (now: number) => {
      t += (Math.min(50, now - last) / 1000) * SETTINGS.speed * 2;
      last = now;
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u('uRes'), w, h);
      gl.uniform1f(u('uTime'), t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className={className} style={{ display: 'block', width: '100%', height: '100%', ...style }} aria-hidden />;
}
`;
  };
  const shaderHtml = () => {
    const cols = sorted().slice(0, 5).map((s) => hex2rgb(s.c).map((v) => +(v / 255).toFixed(3)));
    return `<!-- ${S.shader.kind} shader gradient made with NiceUI Gradient Maker. No dependencies. -->
<canvas id="shader-gradient" style="display:block;width:100%;height:100vh"></canvas>
<script>
(() => {
  const COLORS = ${JSON.stringify(cols)};
  const S = { kind: ${KINDS.indexOf(S.shader.kind)}, speed: ${S.shader.speed}, scale: ${S.shader.scale}, warp: ${S.shader.warp}, grain: ${+(S.grain * 0.6).toFixed(3)} };
  const FRAG = \`${FRAG}\`;
  const canvas = document.getElementById('shader-gradient');
  const gl = canvas.getContext('webgl');
  if (!gl) return;
  const make = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, make(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  gl.uniform3fv(u('uC'), COLORS.flat().concat(Array(15).fill(0)).slice(0, 15));
  gl.uniform1i(u('uN'), COLORS.length);
  gl.uniform1i(u('uKind'), S.kind);
  gl.uniform1f(u('uScale'), S.scale);
  gl.uniform1f(u('uWarp'), S.warp);
  gl.uniform1f(u('uGrain'), S.grain);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0, last = performance.now();
  const frame = (now) => {
    t += (Math.min(50, now - last) / 1000) * S.speed * 2; last = now;
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u('uRes'), w, h);
    gl.uniform1f(u('uTime'), t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!still) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
</script>`;
  };
  const code = () => {
    const shader = S.mode === "shader";
    const grad = cssBackground(shader ? "mesh" : S.mode, false); // gradient layers only, readable first
    const gradLine = grad.replace(/\n\s*/g, " ");
    const grain = S.grain > 0 ? noiseUrl(S.grain) : "";
    const tw = (v) => v.replace(/\s*,\s*/g, ",").replace(/ /g, "_");
    if (tab === "css")
      return `${shader ? "/* Static CSS fallback for the shader (use the React or HTML tab for the animated version). */\n" : ""}.gradient {\n  position: relative;\n  background:\n    ${grad};\n}${grain ? `\n\n/* Film grain on top */\n.gradient::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background: ${grain};\n}` : ""}`;
    if (tab === "tailwind") {
      // gradient layers need Tailwind's image: hint; a trailing solid colour becomes its own class
      const ls = layers(shader ? "mesh" : S.mode);
      const colour = ls.find((l) => /^#[0-9a-f]{3,8}$/i.test(l));
      const imgs = ls.filter((l) => l !== colour).join(", ");
      return `${shader ? "<!-- Static fallback for the shader -->\n" : ""}<div class="relative bg-[image:${tw(imgs)}]${colour ? ` bg-[${colour}]` : ""}${grain ? ` after:pointer-events-none after:absolute after:inset-0 after:content-[''] after:bg-[${tw(grain)}]` : ""}"></div>`;
    }
    const oneLine = (grain ? grain + ", " : "") + gradLine;
    if (tab === "react") {
      if (shader) return shaderReact();
      return `// Made with NiceUI Gradient Maker. No dependencies.
import type { CSSProperties, ReactNode } from 'react';

const GRADIENT = \`${gradLine}\`;
${grain ? `const GRAIN = \`${grain}\`;\n` : ""}
export function Gradient({ className = '', style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={className} style={{ background: ${grain ? "`${GRAIN}, ${GRADIENT}`" : "GRADIENT"}, ...style }}>
      {children}
    </div>
  );
}
`;
    }
    return shader ? shaderHtml() : `<!-- Made with NiceUI Gradient Maker. No dependencies. -->\n<div style="min-height: 100vh; background: ${oneLine.replace(/"/g, "'")};"></div>`;
  };
  function renderExport() {
    $$("[data-gm-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.gmTab === tab)));
    out.textContent = code();
  }
  async function copyOut() {
    const text = code();
    try {
      await navigator.clipboard.writeText(text);
      flash(`Copied ${tab === "tailwind" ? "Tailwind" : tab.toUpperCase()} · ${text.split("\n").length} lines`);
    } catch {
      flash("Copy failed — select the code and copy it");
    }
  }
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1600);
  };

  /* PNG at 1920×1080 */
  function downloadPng() {
    const W = 1920,
      H = 1080;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    if (S.mode === "shader") {
      const g2 = makeGL(c);
      if (!g2) return flash("WebGL is not available");
      drawGL(g2, W, H, clock);
    } else {
      const g = c.getContext("2d");
      const ss = sorted();
      const fill = (grad) => {
        ss.forEach((s) => grad.addColorStop(s.p / 100, s.c));
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
      };
      if (S.mode === "linear") {
        const a = ((S.angle - 90) * Math.PI) / 180;
        const len = Math.abs(W * Math.cos(a)) + Math.abs(H * Math.sin(a));
        const dx = (Math.cos(a) * len) / 2,
          dy = (Math.sin(a) * len) / 2;
        fill(g.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy));
      } else if (S.mode === "radial") {
        const x = (S.cx / 100) * W,
          y = (S.cy / 100) * H;
        const r = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
        g.save();
        if (S.shape === "ellipse") {
          g.translate(x, y);
          g.scale(1, H / W);
          g.translate(-x, -y);
        }
        const grad = g.createRadialGradient(x, y, 0, x, y, S.shape === "ellipse" ? r * (W / H) * 0.75 : r);
        ss.forEach((s) => grad.addColorStop(s.p / 100, s.c));
        g.fillStyle = grad;
        g.fillRect(-W, -H * 4, W * 3, H * 9);
        g.restore();
      } else if (S.mode === "conic" && g.createConicGradient) {
        fill(g.createConicGradient(((S.conic - 90) * Math.PI) / 180, (S.cx / 100) * W, (S.cy / 100) * H));
      } else {
        g.fillStyle = S.base;
        g.fillRect(0, 0, W, H);
        S.colors.forEach((s) => {
          const x = (s.x / 100) * W,
            y = (s.y / 100) * H;
          const r = (S.spread / 100) * Math.hypot(W, H) * 0.75;
          const grad = g.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, s.c);
          grad.addColorStop(1, s.c + "00");
          g.fillStyle = grad;
          g.fillRect(0, 0, W, H);
        });
      }
      if (S.grain > 0) {
        const img = g.getImageData(0, 0, W, H);
        const d = img.data;
        const amt = S.grain * 90;
        for (let i = 0; i < d.length; i += 4) {
          const n = (Math.random() - 0.5) * amt;
          d[i] += n;
          d[i + 1] += n;
          d[i + 2] += n;
        }
        g.putImageData(img, 0, 0);
      }
    }
    const a = document.createElement("a");
    a.download = `gradient-${S.mode}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
    flash("PNG downloaded · 1920 × 1080");
  }

  /* share link: state in the URL hash */
  const encode = () => btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  async function shareLink() {
    const url = location.origin + location.pathname + "#s=" + encode();
    history.replaceState(null, "", "#s=" + encode());
    try {
      await navigator.clipboard.writeText(url);
      flash("Share link copied");
    } catch {
      flash("Link is in the address bar");
    }
  }
  function loadHash() {
    const h = location.hash;
    try {
      if (h.startsWith("#s=")) {
        const v = JSON.parse(decodeURIComponent(escape(atob(h.slice(3)))));
        if (v && Array.isArray(v.colors) && v.colors.length >= 2) S = { ...structuredClone(DEFAULT), ...v, shader: { ...DEFAULT.shader, ...(v.shader || {}) } };
      } else if (h.startsWith("#g=")) {
        const lib = JSON.parse(document.getElementById("gm-library")?.textContent || "{}");
        const g = lib[h.slice(3)];
        if (g) S = { ...structuredClone(DEFAULT), ...g, shader: { ...DEFAULT.shader } };
      }
    } catch {}
  }

  /* ── update cycle ───────────────────────────────────────── */
  let saveT = 0;
  function update(full = true) {
    renderPreview();
    renderStops();
    if (full) syncControls();
    renderExport();
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#s=" + encode()), 400);
  }

  // presets grid
  $("[data-gm-presets]").innerHTML = PRESETS.map((p, i) => {
    const prev = S;
    S = { ...structuredClone(DEFAULT), ...structuredClone(p) };
    const bg = cssBackground(p.mode === "shader" ? "mesh" : p.mode, false).replace(/\n\s*/g, " ");
    S = prev;
    return `<button type="button" class="gm-preset" data-gm-preset="${i}"><span style="background:${bg}"></span><b>${p.name}</b><i>${p.mode === "shader" ? "Shader · " + p.shader.kind : p.mode}</i></button>`;
  }).join("");

  loadHash();
  update();
  requestAnimationFrame(loop);
  // links like /gradient-maker#g=<slug> also work when already on the page
  addEventListener("hashchange", () => {
    if (location.hash.slice(3) === encode()) return;
    loadHash();
    sel = 0;
    update();
  });
})();
