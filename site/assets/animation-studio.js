/* NiceUI Animation Studio — easing curves, springs and keyframe animations.
   Plain JavaScript, no dependencies. Every export is dependency-free too. */
(() => {
  const root = document.querySelector("[data-an]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const r3 = (v) => +(+v).toFixed(3);

  /* ── easings ────────────────────────────────────────────── */
  const BEZ = {
    ease: [0.25, 0.1, 0.25, 1],
    "ease-out": [0, 0, 0.58, 1],
    "ease-in-out": [0.42, 0, 0.58, 1],
    "out-expo": [0.16, 1, 0.3, 1],
    "out-quint": [0.22, 1, 0.36, 1],
    "in-out-quart": [0.76, 0, 0.24, 1],
    "out-back": [0.34, 1.56, 0.64, 1],
    "in-back": [0.36, 0, 0.66, -0.56],
    snappy: [0.2, 0.9, 0.1, 1],
    linear: [0, 0, 1, 1],
  };
  // y for a given x on a cubic-bezier (Newton with bisection fallback)
  function bezierY([x1, y1, x2, y2], x) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-6) break;
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (t < 0 || t > 1 || Math.abs(sx(t) - x) > 1e-4) {
      let lo = 0, hi = 1;
      t = x;
      for (let i = 0; i < 40; i++) {
        const v = sx(t);
        if (Math.abs(v - x) < 1e-6) break;
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return ((ay * t + by) * t + cy) * t;
  }
  // physical spring from 0 → 1; returns settle time (s) and 0..1 samples
  function spring({ k, c, m }) {
    let x = 0, v = 0, t = 0;
    const dt = 1 / 1000;
    const raw = [[0, 0]];
    while (t < 8) {
      const a = (-k * (x - 1) - c * v) / m;
      v += a * dt;
      x += v * dt;
      t += dt;
      raw.push([t, x]);
      if (t > 0.05 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break;
    }
    const T = t;
    const N = 60;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const idx = Math.round((i / N) * (raw.length - 1));
      pts.push([i / N, i === N ? 1 : raw[idx][1]]);
    }
    return { T, pts };
  }
  function linearFn(pts) {
    // drop points that a straight line between neighbours already describes
    const keep = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = keep[keep.length - 1], b = pts[i], c = pts[i + 1];
      const lerp = a[1] + ((c[1] - a[1]) * (b[0] - a[0])) / (c[0] - a[0]);
      if (Math.abs(lerp - b[1]) > 0.003) keep.push(b);
    }
    keep.push(pts[pts.length - 1]);
    return `linear(${keep.map(([px, y], i) => (i === 0 ? `${r3(y)}` : i === keep.length - 1 ? `${r3(y)}` : `${r3(y)} ${+(px * 100).toFixed(1)}%`)).join(", ")})`;
  }

  /* ── animation presets ──────────────────────────────────── */
  // each kf(p) returns [offset 0..1, props]; props use CSS names
  const P = {
    "fade-up": { uses: ["distance"], def: { distance: 24 }, kf: (p) => [[0, { opacity: 0, transform: `translateY(${p.distance}px)` }], [1, { opacity: 1, transform: "none" }]] },
    "fade-down": { uses: ["distance"], def: { distance: 24 }, kf: (p) => [[0, { opacity: 0, transform: `translateY(-${p.distance}px)` }], [1, { opacity: 1, transform: "none" }]] },
    "scale-in": { uses: ["scale"], def: { scale: 0.92 }, kf: (p) => [[0, { opacity: 0, transform: `scale(${p.scale})` }], [1, { opacity: 1, transform: "none" }]] },
    "blur-in": { uses: ["distance"], def: { distance: 12 }, kf: (p) => [[0, { opacity: 0, filter: "blur(12px)", transform: `translateY(${p.distance}px)` }], [1, { opacity: 1, filter: "blur(0px)", transform: "none" }]] },
    "slide-left": { uses: ["distance"], def: { distance: 48 }, kf: (p) => [[0, { opacity: 0, transform: `translateX(${p.distance}px)` }], [1, { opacity: 1, transform: "none" }]] },
    "slide-right": { uses: ["distance"], def: { distance: 48 }, kf: (p) => [[0, { opacity: 0, transform: `translateX(-${p.distance}px)` }], [1, { opacity: 1, transform: "none" }]] },
    "flip-in": { uses: ["rotate"], def: { rotate: 70 }, kf: (p) => [[0, { opacity: 0, transform: `perspective(700px) rotateX(${p.rotate}deg)` }], [1, { opacity: 1, transform: "perspective(700px) rotateX(0deg)" }]] },
    reveal: { uses: [], def: {}, kf: () => [[0, { clipPath: "inset(0 100% 0 0)" }], [1, { clipPath: "inset(0 0% 0 0)" }]] },
    bounce: {
      uses: ["distance"],
      def: { distance: 20, iter: "1" },
      kf: (p) => [[0, { transform: "translateY(0px)" }], [0.3, { transform: `translateY(-${p.distance}px)` }], [0.5, { transform: "translateY(0px)" }], [0.68, { transform: `translateY(-${r3(p.distance * 0.4)}px)` }], [0.84, { transform: "translateY(0px)" }], [1, { transform: "translateY(0px)" }]],
    },
    shake: {
      uses: ["distance"],
      def: { distance: 8 },
      kf: (p) => [[0, { transform: "translateX(0px)" }], [0.2, { transform: `translateX(-${p.distance}px)` }], [0.4, { transform: `translateX(${p.distance}px)` }], [0.6, { transform: `translateX(-${r3(p.distance * 0.6)}px)` }], [0.8, { transform: `translateX(${r3(p.distance * 0.6)}px)` }], [1, { transform: "translateX(0px)" }]],
    },
    pulse: { uses: ["scale"], def: { scale: 1.06, iter: "infinite", ease: "ease-in-out", duration: 1400 }, kf: (p) => [[0, { transform: "scale(1)" }], [0.5, { transform: `scale(${p.scale})` }], [1, { transform: "scale(1)" }]] },
    wiggle: {
      uses: ["rotate"],
      def: { rotate: 6 },
      kf: (p) => [[0, { transform: "rotate(0deg)" }], [0.25, { transform: `rotate(-${p.rotate}deg)` }], [0.5, { transform: `rotate(${p.rotate}deg)` }], [0.75, { transform: `rotate(-${r3(p.rotate / 2)}deg)` }], [1, { transform: "rotate(0deg)" }]],
    },
    float: { uses: ["distance"], def: { distance: 10, iter: "infinite", ease: "ease-in-out", duration: 3000 }, kf: (p) => [[0, { transform: "translateY(0px)" }], [0.5, { transform: `translateY(-${p.distance}px)` }], [1, { transform: "translateY(0px)" }]] },
    spin: { uses: [], def: { iter: "infinite", ease: "linear", duration: 1200 }, kf: () => [[0, { transform: "rotate(0deg)" }], [1, { transform: "rotate(360deg)" }]] },
    "fade-out": { uses: ["distance"], def: { distance: 16 }, kf: (p) => [[0, { opacity: 1, transform: "none" }], [1, { opacity: 0, transform: `translateY(${p.distance}px)` }]] },
    "zoom-out": { uses: ["scale"], def: { scale: 0.85 }, kf: (p) => [[0, { opacity: 1, transform: "scale(1)" }], [1, { opacity: 0, transform: `scale(${p.scale})` }]] },
  };

  /* ── state ──────────────────────────────────────────────── */
  const DEFAULT = { preset: "fade-up", target: "card", easeMode: "bezier", ease: "out-expo", bez: [...BEZ["out-expo"]], spring: { k: 170, c: 22, m: 1 }, duration: 700, delay: 0, iter: "1", dir: "normal", fill: "both", distance: 24, scale: 0.92, rotate: 12, stagger: 70 };
  let S = structuredClone(DEFAULT);
  let springCache = null;

  const easingValue = () => {
    if (S.easeMode === "spring") {
      springCache = spring(S.spring);
      return linearFn(springCache.pts);
    }
    return `cubic-bezier(${S.bez.map(r3).join(", ")})`;
  };
  const easeAt = (x) => {
    if (S.easeMode === "spring") {
      const pts = (springCache || spring(S.spring)).pts;
      const i = Math.min(pts.length - 2, Math.floor(x * (pts.length - 1)));
      const k = x * (pts.length - 1) - i;
      return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k;
    }
    return bezierY(S.bez, x);
  };
  const supportsLinear = (() => {
    try {
      return CSS.supports("animation-timing-function", "linear(0, 0.5 50%, 1)");
    } catch {
      return false;
    }
  })();

  /* ── curve editor ───────────────────────────────────────── */
  const svg = $("[data-an-curve]");
  const X0 = 20, XW = 200, Y0 = 190, YH = 140;
  const toX = (x) => X0 + x * XW;
  const toY = (y) => Y0 - y * YH;
  function drawCurve() {
    const path = $("[data-an-path]");
    const spr = S.easeMode === "spring";
    if (spr) {
      const pts = (springCache || spring(S.spring)).pts;
      path.setAttribute("d", pts.map(([x, y], i) => `${i ? "L" : "M"}${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`).join(""));
    } else {
      const [x1, y1, x2, y2] = S.bez;
      path.setAttribute("d", `M${toX(0)} ${toY(0)}C${toX(x1)} ${toY(y1)} ${toX(x2)} ${toY(y2)} ${toX(1)} ${toY(1)}`);
      const h1 = $('[data-an-h="1"]'), h2 = $('[data-an-h="2"]');
      h1.setAttribute("cx", toX(x1));
      h1.setAttribute("cy", toY(y1));
      h2.setAttribute("cx", toX(x2));
      h2.setAttribute("cy", toY(y2));
      h1.setAttribute("aria-valuetext", `${r3(x1)}, ${r3(y1)}`);
      h2.setAttribute("aria-valuetext", `${r3(x2)}, ${r3(y2)}`);
      const a1 = $('[data-an-arm="1"]'), a2 = $('[data-an-arm="2"]');
      Object.entries({ x1: toX(0), y1: toY(0), x2: toX(x1), y2: toY(y1) }).forEach(([k, v]) => a1.setAttribute(k, v));
      Object.entries({ x1: toX(1), y1: toY(1), x2: toX(x2), y2: toY(y2) }).forEach(([k, v]) => a2.setAttribute(k, v));
    }
    $$("[data-an-h], [data-an-arm]", svg).forEach((el) => el.toggleAttribute("hidden", spr));
    $("[data-an-ease-val]").textContent = spr ? `linear(…) · ${Math.round((springCache?.T || 0) * 1000)}ms to settle` : easingValue();
  }
  let drag = 0;
  const fromPointer = (e) => {
    const r = svg.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * 240;
    const sy = ((e.clientY - r.top) / r.height) * 240;
    return [clamp((sx - X0) / XW, 0, 1), clamp((Y0 - sy) / YH, -0.6, 1.6)];
  };
  svg.addEventListener("pointerdown", (e) => {
    const h = e.target.closest("[data-an-h]");
    if (!h) return;
    drag = +h.dataset.anH;
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const [x, y] = fromPointer(e);
    S.bez[(drag - 1) * 2] = r3(x);
    S.bez[(drag - 1) * 2 + 1] = r3(y);
    S.ease = "custom";
    update(false);
  });
  const endDrag = () => {
    if (drag) {
      drag = 0;
      update();
      replay();
    }
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("keydown", (e) => {
    const h = e.target.closest("[data-an-h]");
    if (!h || !/^Arrow/.test(e.key)) return;
    e.preventDefault();
    const i = (+h.dataset.anH - 1) * 2;
    const d = e.shiftKey ? 0.1 : 0.01;
    if (e.key === "ArrowLeft") S.bez[i] = r3(clamp(S.bez[i] - d, 0, 1));
    if (e.key === "ArrowRight") S.bez[i] = r3(clamp(S.bez[i] + d, 0, 1));
    if (e.key === "ArrowUp") S.bez[i + 1] = r3(clamp(S.bez[i + 1] + d, -0.6, 1.6));
    if (e.key === "ArrowDown") S.bez[i + 1] = r3(clamp(S.bez[i + 1] - d, -0.6, 1.6));
    S.ease = "custom";
    update();
  });

  /* ── preview ────────────────────────────────────────────── */
  const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const waapiFrames = () => P[S.preset].kf(S).map(([o, props]) => ({ offset: o, ...Object.fromEntries(Object.entries(props).map(([k, v]) => [camel(k), v])) }));
  const options = (extraDelay = 0) => ({
    duration: S.duration,
    delay: S.delay + extraDelay,
    iterations: S.iter === "infinite" ? Infinity : +S.iter,
    direction: S.dir,
    fill: S.fill,
    easing: S.easeMode === "spring" && !supportsLinear ? "ease-out" : easingValue(),
  });
  let running = [];
  function replay() {
    running.forEach((a) => a.cancel());
    running = [];
    const t = $(`[data-an-target="${S.target}"]`);
    const els = S.target === "list" ? $$(".an-row", t) : [t];
    const frames = waapiFrames();
    els.forEach((el, i) => {
      try {
        running.push(el.animate(frames, options(S.target === "list" ? i * S.stagger : 0)));
      } catch (err) {
        console.warn(err);
      }
    });
    race();
  }
  // easing vs linear race
  let raceRaf = 0;
  function race() {
    cancelAnimationFrame(raceRaf);
    const ballE = $('[data-an-ball="ease"]'), ballL = $('[data-an-ball="lin"]'), marker = $("[data-an-marker]");
    const dur = Math.max(300, S.duration);
    const t0 = performance.now();
    const step = (now) => {
      const x = clamp((now - t0) / dur, 0, 1);
      const y = easeAt(x);
      ballE.style.left = `calc(${(y * 100).toFixed(2)}% - ${(y * 14).toFixed(2)}px)`;
      ballL.style.left = `calc(${(x * 100).toFixed(2)}% - ${(x * 14).toFixed(2)}px)`;
      marker.setAttribute("cx", toX(x));
      marker.setAttribute("cy", toY(y));
      if (x < 1) raceRaf = requestAnimationFrame(step);
    };
    raceRaf = requestAnimationFrame(step);
  }

  /* ── code export ────────────────────────────────────────── */
  let tab = "css";
  const name = () => S.preset;
  const cssProps = (props) => Object.entries(props).map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())}: ${v};`).join(" ");
  const keyframesCss = () => `@keyframes ${name()} {\n${P[S.preset].kf(S).map(([o, props]) => `  ${Math.round(o * 1000) / 10}% { ${cssProps(props)} }`).join("\n")}\n}`;
  const iterCss = () => (S.iter === "infinite" ? "infinite" : S.iter);
  const shorthand = (ease) => `${name()} ${S.duration}ms ${ease} ${S.delay}ms ${iterCss()} ${S.dir} ${S.fill}`;
  const tw = (v) => v.replace(/\s*,\s*/g, ",").replace(/ /g, "_");
  function code() {
    const ease = easingValue();
    if (tab === "css") {
      return `/* ${P[S.preset] ? name() : ""} · made with NiceUI Animation Studio. No dependencies. */
:root {
  --ease-studio: ${ease};
}

${keyframesCss()}

.${name()} {
  animation: ${shorthand("var(--ease-studio)")};
}
${S.target === "list" ? `\n/* Stagger children: set --i on each (style="--i: 0", 1, 2…) */\n.${name()}-list > * {\n  animation: ${shorthand("var(--ease-studio)")};\n  animation-delay: calc(${S.delay}ms + var(--i, 0) * ${S.stagger}ms);\n}\n` : ""}
@media (prefers-reduced-motion: reduce) {
  .${name()}${S.target === "list" ? `,\n  .${name()}-list > *` : ""} {
    animation: none;
  }
}`;
    }
    if (tab === "tailwind") {
      const frames = Object.fromEntries(
        P[S.preset].kf(S).map(([o, props]) => [`${Math.round(o * 1000) / 10}%`, Object.fromEntries(Object.entries(props).map(([k, v]) => [camel(k), String(v)]))])
      );
      const fr = JSON.stringify(frames, null, 2).replace(/\n/g, "\n        ").replace(/"([a-zA-Z]+)":/g, "$1:").replace(/"/g, "'");
      return `// tailwind.config.js (v3) — add inside theme.extend
module.exports = {
  theme: {
    extend: {
      keyframes: {
        '${name()}': ${fr},
      },
      animation: {
        '${name()}': '${shorthand(ease).replace(/'/g, "\\'")}',
      },
      transitionTimingFunction: {
        studio: '${ease}',
      },
    },
  },
};

<!-- Usage -->
<div class="animate-${name()} motion-reduce:animate-none">…</div>
<button class="transition-transform duration-300 ease-studio hover:scale-105">…</button>

<!-- Or arbitrary values, no config (the @keyframes ${name()} rule must be in your CSS) -->
<div class="animate-[${tw(shorthand(ease))}] motion-reduce:animate-none">…</div>
<button class="transition-transform duration-300 ease-[${tw(ease)}] hover:scale-105">…</button>`;
    }
    if (tab === "react") {
      const frames = JSON.stringify(waapiFrames(), null, 2).replace(/"([a-zA-Z]+)":/g, "$1:").replace(/"/g, "'");
      const Comp = name().replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
      return `'use client';
// ${Comp} · made with NiceUI Animation Studio. No dependencies: uses the Web Animations API.
import { useEffect, useRef, type ReactNode } from 'react';

const KEYFRAMES: Keyframe[] = ${frames};

const OPTIONS: KeyframeAnimationOptions = {
  duration: ${S.duration},
  delay: ${S.delay},
  iterations: ${S.iter === "infinite" ? "Infinity" : S.iter},
  direction: '${S.dir}',
  fill: '${S.fill}',
  easing: '${ease}',
};

/** Plays the animation on mount (and again whenever \`replayKey\` changes). */
export function use${Comp}<T extends HTMLElement>(replayKey?: unknown, delay = 0) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = el.animate(KEYFRAMES, { ...OPTIONS, delay: (OPTIONS.delay as number) + delay });
    return () => animation.cancel();
  }, [replayKey, delay]);
  return ref;
}

export function ${Comp}({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = use${Comp}<HTMLDivElement>(undefined, delay);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
${S.target === "list" ? `\n// Stagger a list:\n// {items.map((item, i) => <${Comp} key={item.id} delay={i * ${S.stagger}}>{item.label}</${Comp}>)}\n` : ""}`;
    }
    return `/* Easing · made with NiceUI Animation Studio */
${ease}

/* As a CSS variable */
:root {
  --ease-studio: ${ease};
}
.element {
  transition: transform 300ms var(--ease-studio);
}${S.easeMode === "spring" ? `\n\n/* This spring settles in about ${Math.round((springCache?.T || 0) * 1000)}ms: use that as the duration. */` : ""}`;
  }

  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1600);
  };
  const LABEL = { css: "CSS", tailwind: "Tailwind", react: "React", easing: "easing" };

  /* ── controls ───────────────────────────────────────────── */
  const fmt = {
    duration: (v) => `${v}ms`,
    delay: (v) => `${v}ms`,
    distance: (v) => `${v}px`,
    scale: (v) => (+v).toFixed(2),
    rotate: (v) => `${v}°`,
    stagger: (v) => `${v}ms`,
    k: (v) => `${v}`,
    c: (v) => `${v}`,
    m: (v) => (+v).toFixed(1),
  };
  $$("[data-an-in]").forEach((inp) => {
    inp.addEventListener("input", () => {
      const k = inp.dataset.anIn;
      if (k in S.spring) S.spring[k] = +inp.value;
      else S[k] = +inp.value;
      update(false);
    });
    inp.addEventListener("change", () => {
      update();
      replay();
    });
  });
  root.addEventListener("click", (e) => {
    const segBtn = e.target.closest("[data-an-seg] button");
    if (segBtn) {
      const key = segBtn.closest("[data-an-seg]").dataset.anSeg;
      S[key] = segBtn.dataset.v;
      update();
      replay();
      return;
    }
    const pr = e.target.closest("[data-an-preset]");
    if (pr) {
      const id = pr.dataset.anPreset;
      const d = P[id].def;
      S.preset = id;
      ["distance", "scale", "rotate"].forEach((k) => {
        if (d[k] != null) S[k] = d[k];
      });
      S.iter = d.iter || "1";
      S.duration = d.duration || (S.duration > 1500 ? 700 : S.duration);
      if (d.ease) {
        S.easeMode = "bezier";
        S.ease = d.ease;
        S.bez = [...BEZ[d.ease]];
      }
      update();
      replay();
      return;
    }
    const ez = e.target.closest("[data-an-ease]");
    if (ez) {
      S.easeMode = "bezier";
      S.ease = ez.dataset.anEase;
      S.bez = [...BEZ[S.ease]];
      update();
      replay();
      return;
    }
    if (e.target.closest("[data-an-replay]")) replay();
    if (e.target.closest("[data-an-reset]")) {
      S = structuredClone(DEFAULT);
      update();
      replay();
    }
    if (e.target.closest("[data-an-spring-dur]")) {
      S.duration = clamp(Math.round((springCache || spring(S.spring)).T * 1000 / 10) * 10, 100, 4000);
      update();
      replay();
    }
    const t = e.target.closest("[data-an-tab]");
    if (t) {
      tab = t.dataset.anTab;
      renderCode();
    }
    if (e.target.closest("[data-an-copy]")) copyCode();
    if (e.target.closest("[data-an-share]")) share();
  });
  async function copyCode() {
    const text = code();
    try {
      await navigator.clipboard.writeText(text);
      flash(`Copied ${LABEL[tab]} · ${text.split("\n").length} lines`);
    } catch {
      flash("Copy failed — select the code and copy it");
    }
  }
  const encode = () => btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  async function share() {
    history.replaceState(null, "", "#a=" + encode());
    try {
      await navigator.clipboard.writeText(location.href);
      flash("Share link copied");
    } catch {
      flash("Link is in the address bar");
    }
  }
  function loadHash() {
    if (!location.hash.startsWith("#a=")) return;
    try {
      const v = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3)))));
      if (v && P[v.preset]) S = { ...structuredClone(DEFAULT), ...v, spring: { ...DEFAULT.spring, ...(v.spring || {}) } };
    } catch {}
  }

  function renderCode() {
    $$("[data-an-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.anTab === tab)));
    $("[data-an-code]").textContent = code();
    $("[data-an-copy-label]").textContent = `Copy ${LABEL[tab]}`;
  }
  function syncControls() {
    $$("[data-an-seg]").forEach((g) => $$("button", g).forEach((b) => b.setAttribute("aria-pressed", String(String(S[g.dataset.anSeg]) === b.dataset.v))));
    $$("[data-an-preset]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.anPreset === S.preset)));
    $$("[data-an-ease]").forEach((b) => b.setAttribute("aria-pressed", String(S.easeMode === "bezier" && b.dataset.anEase === S.ease)));
    $$("[data-an-show]").forEach((el) => (el.hidden = el.dataset.anShow !== S.easeMode));
    $$("[data-an-show-target]").forEach((el) => (el.hidden = el.dataset.anShowTarget !== S.target));
    const uses = P[S.preset].uses;
    ["distance", "scale", "rotate"].forEach((k) => ($(`[data-an-row="${k}"]`).hidden = !uses.includes(k)));
    $("[data-an-amounts]").hidden = !uses.length && S.target !== "list";
    $$("[data-an-in]").forEach((inp) => {
      const k = inp.dataset.anIn;
      const v = k in S.spring ? S.spring[k] : S[k];
      inp.value = v;
      const out = $(`[data-an-out="${k}"]`);
      if (out) out.textContent = fmt[k] ? fmt[k](v) : v;
    });
    $$("[data-an-target]").forEach((el) => (el.hidden = el.dataset.anTarget !== S.target));
    const note = $("[data-an-spring-note]");
    if (note) note.textContent = S.easeMode === "spring" ? `Settles in about ${Math.round((springCache?.T || 0) * 1000)}ms.${supportsLinear ? "" : " This browser can't preview linear() easing; the export still works in modern browsers."}` : "";
  }
  let saveT = 0;
  function update(full = true) {
    easingValue(); // refresh spring cache
    drawCurve();
    if (full) syncControls();
    else
      $$("[data-an-in]").forEach((inp) => {
        const k = inp.dataset.anIn;
        const out = $(`[data-an-out="${k}"]`);
        if (out) out.textContent = fmt[k] ? fmt[k](inp.value) : inp.value;
      });
    renderCode();
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#a=" + encode()), 400);
  }

  loadHash();
  update();
  setTimeout(replay, 250);
  addEventListener("hashchange", () => {
    if (location.hash.slice(3) === encode()) return;
    loadHash();
    update();
    replay();
  });
})();
