/* NiceUI Device Studio — 3D device mockups drawn with WebGL. Plain JavaScript, no dependencies.
   Each device is built from "slabs": a front texture (drawn on a 2D canvas) plus a stack of
   silhouette layers that give it real thickness and rounded edges from any angle. */
(() => {
  const root = document.querySelector("[data-ds]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rad = (d) => (d * Math.PI) / 180;

  /* ── 4×4 matrices (column-major) ───────────────────────── */
  const M = {
    id: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    mul(a, b) {
      const o = new Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      return o;
    },
    chain: (...ms) => ms.reduce((a, b) => M.mul(a, b)),
    t: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
    s: (x, y, z) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1],
    rx(a) {
      const c = Math.cos(a), s = Math.sin(a);
      return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    },
    ry(a) {
      const c = Math.cos(a), s = Math.sin(a);
      return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
    },
    rz(a) {
      const c = Math.cos(a), s = Math.sin(a);
      return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },
    persp(fovy, asp, n, f) {
      const k = 1 / Math.tan(fovy / 2);
      return [k / asp, 0, 0, 0, 0, k, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0];
    },
    xf: (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]],
  };

  /* ── state ─────────────────────────────────────────────── */
  const DEFAULT = {
    scene: "phone-hero",
    size: "dribbble",
    yaw: -20,
    pitch: 12,
    roll: 0,
    fov: 26,
    pad: 12,
    finish: "graphite",
    band: "ocean",
    lid: 108,
    chrome: "light",
    url: "niceui.dev",
    fit: "top",
    glare: true,
    bg: "studio",
    bg1: "#1e293b",
    bg2: "#020617",
    shadow: 55,
    cap: "none",
    title: "Ship UI that feels premium",
    sub: "Free React & Tailwind components",
    fmt: "png",
    scale: "2",
    shots: {},
  };
  let S = structuredClone(DEFAULT);
  let slot = 0;

  const SIZES = { dribbble: [1600, 1200], hd: [1920, 1080], og: [1200, 630], square: [1080, 1080], portrait: [1080, 1350], appstore: [1290, 2796], play: [1080, 1920] };
  const FINISHES = {
    graphite: { name: "Graphite", body: "#2a2a2e", side: "#3a3a3f" },
    black: { name: "Black", body: "#111113", side: "#232326" },
    silver: { name: "Silver", body: "#d7d8db", side: "#b9bbbf" },
    sand: { name: "Sand", body: "#ddcfb8", side: "#c4b397" },
    ocean: { name: "Ocean", body: "#2b4766", side: "#3d5f86" },
    white: { name: "White", body: "#f4f4f2", side: "#d9d9d5" },
  };
  const BANDS = { ocean: "#1e3a5f", coral: "#f0705a", sand: "#cdb892", graphite: "#2c2c30", mint: "#7cc6a4" };
  const BGS = {
    studio: { name: "Studio", kind: "radial", c: ["#334155", "#020617"] },
    night: { name: "Night", kind: "linear", c: ["#0b1220", "#020617"] },
    sky: { name: "Sky", kind: "mesh", c: ["#0ea5e9", "#020617"], mesh: [["#38bdf8", 0.18, 0.2], ["#6366f1", 0.85, 0.15], ["#0ea5e9", 0.7, 0.95]] },
    sunset: { name: "Sunset", kind: "mesh", c: ["#fb7185", "#1e1b4b"], mesh: [["#fb923c", 0.15, 0.2], ["#f472b6", 0.85, 0.3], ["#7c3aed", 0.5, 0.95]] },
    mint: { name: "Mint", kind: "mesh", c: ["#a7f3d0", "#ecfdf5"], mesh: [["#6ee7b7", 0.2, 0.25], ["#99f6e4", 0.85, 0.2], ["#d9f99d", 0.6, 0.95]] },
    paper: { name: "Paper", kind: "radial", c: ["#ffffff", "#e7e5e4"] },
    custom: { name: "Custom", kind: "linear" },
    none: { name: "Transparent", kind: "none" },
  };

  /* screenshots: samples and uploads */
  const SAMPLES = [
    { id: "mobile-home", label: "Mobile", src: "/assets/device-samples/mobile-home.jpg", for: "phone" },
    { id: "mobile-apps", label: "Mobile 2", src: "/assets/device-samples/mobile-apps.jpg", for: "phone" },
    { id: "tablet-home", label: "Tablet", src: "/assets/device-samples/tablet-home.jpg", for: "tablet" },
    { id: "desktop-home", label: "Desktop", src: "/assets/device-samples/desktop-home.jpg", for: "wide" },
    { id: "desktop-iso", label: "Desktop 2", src: "/assets/device-samples/desktop-iso.jpg", for: "wide" },
    { id: "watch-rings", label: "Watch", src: "/assets/device-samples/watch-rings.jpg", for: "watch" },
  ];
  const IMGS = new Map(); // id -> HTMLImageElement
  const uploads = new Map(); // id -> object URL
  function img(id) {
    if (IMGS.has(id)) return IMGS.get(id);
    const src = uploads.get(id) || SAMPLES.find((s) => s.id === id)?.src;
    if (!src) return null;
    const im = new Image();
    im.onload = () => {
      texCache.clear();
      schedule();
      renderSlots();
    };
    im.src = src;
    IMGS.set(id, im);
    return im;
  }
  const defaultShot = (type, i) => {
    if (type === "phone") return i % 2 ? "mobile-apps" : "mobile-home";
    if (type === "tablet") return "tablet-home";
    if (type === "watch") return "watch-rings";
    return i % 2 ? "desktop-iso" : "desktop-home";
  };

  /* ── scenes ────────────────────────────────────────────── */
  // p = position (world units ≈ mm, y up), ry/rz/rx = rotation in degrees, flat = lying on the ground
  const SCENES = {
    "phone-hero": { name: "Phone", cam: "hero", items: [{ d: "phone", p: [0, 0, 0] }] },
    "phone-duo": { name: "Two phones", cam: "left", items: [{ d: "phone", p: [-42, 14, -30] }, { d: "phone", p: [42, 0, 20] }] },
    "phone-fan": { name: "Phone fan", cam: "front", items: [{ d: "phone", p: [-80, -4, -26], rz: 9, ry: 10 }, { d: "phone", p: [0, 6, 0] }, { d: "phone", p: [80, -4, -26], rz: -9, ry: -10 }] },
    "phone-iso": { name: "Isometric", cam: "iso", items: [{ d: "phone", p: [-95, 0, 30], flat: true }, { d: "phone", p: [0, 26, 0], flat: true }, { d: "phone", p: [95, 52, -30], flat: true }] },
    tablet: { name: "Tablet", cam: "hero", items: [{ d: "tablet", p: [0, 0, 0] }] },
    laptop: { name: "Laptop", cam: "hero", items: [{ d: "laptop", p: [0, 0, 0] }] },
    desktop: { name: "Desktop", cam: "hero", items: [{ d: "desktop", p: [0, 0, 0] }] },
    browser: { name: "Browser", cam: "left", items: [{ d: "browser", p: [0, 0, 0] }] },
    watch: { name: "Watch", cam: "hero", items: [{ d: "watch", p: [0, 0, 0] }] },
    trio: { name: "Laptop + tablet + phone", cam: "hero", items: [{ d: "laptop", p: [0, 0, -40] }, { d: "tablet", p: [-250, 0, 70], ry: 16 }, { d: "phone", p: [188, 0, 90], ry: -14 }] },
    responsive: { name: "Responsive", cam: "front", items: [{ d: "desktop", p: [0, 0, -190] }, { d: "laptop", p: [330, 0, 10], ry: -16 }, { d: "tablet", p: [-330, 0, 30], ry: 14 }, { d: "phone", p: [170, 0, 150], ry: -8 }] },
    "phone-watch": { name: "Phone + watch", cam: "hero", items: [{ d: "phone", p: [-30, 0, 0] }, { d: "watch", p: [62, 0, 40], ry: -10 }] },
  };
  const ANGLES = {
    front: { name: "Front", yaw: 0, pitch: 0, roll: 0, fov: 18 },
    hero: { name: "Hero", yaw: -22, pitch: 12, roll: 0, fov: 26 },
    left: { name: "Left", yaw: 32, pitch: 8, roll: 0, fov: 26 },
    right: { name: "Right", yaw: -34, pitch: 8, roll: 0, fov: 26 },
    iso: { name: "Isometric", yaw: 38, pitch: 52, roll: 0, fov: 8 },
    top: { name: "Top", yaw: 0, pitch: 70, roll: 0, fov: 18 },
    low: { name: "Low", yaw: -16, pitch: -8, roll: 0, fov: 38 },
  };

  /* ── device models: slabs with a front texture ─────────── */
  // A slab is { w, h, t, ppu, draw(ctx, W, H, k), side, local } — w×h front face, t thickness,
  // front texture drawn at ppu pixels per unit, `local` places it in the device's space.
  // mix two #rrggbb colours: t = share of b
  const mix = (a, b, t) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
  };
  const rr = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  };
  function screen(ctx, x, y, w, h, r, shotId) {
    ctx.save();
    rr(ctx, x, y, w, h, r);
    ctx.clip();
    const im = shotId && img(shotId);
    if (im && im.complete && im.naturalWidth) {
      const iw = im.naturalWidth, ih = im.naturalHeight;
      if (S.fit === "contain") {
        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, w, h);
        const k = Math.min(w / iw, h / ih);
        ctx.drawImage(im, x + (w - iw * k) / 2, y + (h - ih * k) / 2, iw * k, ih * k);
      } else {
        const k = Math.max(w / iw, h / ih);
        const dy = S.fit === "top" ? 0 : (h - ih * k) / 2;
        ctx.drawImage(im, x + (w - iw * k) / 2, y + dy, iw * k, ih * k);
      }
    } else {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, "#1e293b");
      g.addColorStop(1, "#0f172a");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = `500 ${Math.round(Math.min(w, h) * 0.06)}px Geist, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Drop a screenshot", x + w / 2, y + h / 2);
    }
    if (S.glare) {
      const g = ctx.createLinearGradient(x, y, x + w * 0.9, y + h * 0.6);
      g.addColorStop(0, "rgba(255,255,255,0.16)");
      g.addColorStop(0.42, "rgba(255,255,255,0.03)");
      g.addColorStop(0.42, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  const DEVICES = {
    phone: (inst) => {
      const f = FINISHES[S.finish];
      const W = 72, H = 150;
      return [
        {
          w: W, h: H, t: 8, ppu: 14, side: f.side, local: M.t(0, H / 2, 0),
          draw(ctx, w, h, k) {
            rr(ctx, 0, 0, w, h, 11 * k);
            ctx.fillStyle = f.body;
            ctx.fill();
            rr(ctx, 0.7 * k, 0.7 * k, w - 1.4 * k, h - 1.4 * k, 10.4 * k);
            ctx.fillStyle = "#050506";
            ctx.fill();
            screen(ctx, 2.6 * k, 2.6 * k, w - 5.2 * k, h - 5.2 * k, 8.8 * k, inst.shot);
            rr(ctx, w / 2 - 9 * k, 4.2 * k, 18 * k, 5.4 * k, 2.7 * k);
            ctx.fillStyle = "#000";
            ctx.fill();
          },
        },
      ];
    },
    tablet: (inst) => {
      const f = FINISHES[S.finish];
      const W = 180, H = 250;
      return [
        {
          w: W, h: H, t: 6.5, ppu: 7, side: f.side, local: M.t(0, H / 2, 0),
          draw(ctx, w, h, k) {
            rr(ctx, 0, 0, w, h, 14 * k);
            ctx.fillStyle = f.body;
            ctx.fill();
            rr(ctx, 0.8 * k, 0.8 * k, w - 1.6 * k, h - 1.6 * k, 13.2 * k);
            ctx.fillStyle = "#050506";
            ctx.fill();
            screen(ctx, 7.5 * k, 7.5 * k, w - 15 * k, h - 15 * k, 7 * k, inst.shot);
            ctx.fillStyle = "#1a1a1d";
            ctx.beginPath();
            ctx.arc(w / 2, 3.9 * k, 1.2 * k, 0, Math.PI * 2);
            ctx.fill();
          },
        },
      ];
    },
    laptop: (inst) => {
      const f = FINISHES[S.finish];
      const W = 304, LH = 198, DH = 212;
      const open = rad(S.lid - 90);
      return [
        {
          // keyboard deck, lying flat with its top surface at y = 0
          w: W, h: DH, t: 7, ppu: 4.5, side: f.side, local: M.chain(M.t(0, -3.5, 0), M.rx(-Math.PI / 2)),
          draw(ctx, w, h, k) {
            rr(ctx, 0, 0, w, h, 10 * k);
            ctx.fillStyle = f.body;
            ctx.fill();
            const shade = (a) => mix(f.body, "#000000", a / 100);
            rr(ctx, 22 * k, 12 * k, w - 44 * k, 104 * k, 4 * k);
            ctx.fillStyle = shade(18);
            ctx.fill();
            const cols = 14, rows = 6, gx = 1.4 * k;
            const kw = (w - 48 * k - gx * (cols - 1)) / cols;
            const kh = (100 * k - gx * (rows - 1)) / rows;
            ctx.fillStyle = shade(70);
            for (let r = 0; r < rows; r++)
              for (let c = 0; c < cols; c++) {
                if (r === rows - 1 && c > 3 && c < 10) continue;
                rr(ctx, 24 * k + c * (kw + gx), 14 * k + r * (kh + gx), kw, r === 0 ? kh * 0.7 : kh, 1.2 * k);
                ctx.fill();
              }
            rr(ctx, 24 * k + 4 * (kw + gx), 14 * k + (rows - 1) * (kh + gx), kw * 6 + gx * 5, kh, 1.2 * k);
            ctx.fill();
            rr(ctx, w / 2 - 58 * k, 126 * k, 116 * k, 74 * k, 6 * k);
            ctx.fillStyle = shade(6);
            ctx.fill();
            ctx.strokeStyle = shade(22);
            ctx.lineWidth = 0.6 * k;
            ctx.stroke();
          },
        },
        {
          // lid, hinged at the back edge of the deck
          w: W, h: LH, t: 4.5, ppu: 7, side: f.side, local: M.chain(M.t(0, 0, -DH / 2 + 2), M.rx(-open), M.t(0, LH / 2, -2.25)),
          draw(ctx, w, h, k) {
            rr(ctx, 0, 0, w, h, 9 * k);
            ctx.fillStyle = f.body;
            ctx.fill();
            rr(ctx, 0.6 * k, 0.6 * k, w - 1.2 * k, h - 1.2 * k, 8.4 * k);
            ctx.fillStyle = "#070708";
            ctx.fill();
            screen(ctx, 9 * k, 10 * k, w - 18 * k, h - 20 * k, 1.5 * k, inst.shot);
            ctx.fillStyle = "#1c1c20";
            ctx.beginPath();
            ctx.arc(w / 2, 5 * k, 1 * k, 0, Math.PI * 2);
            ctx.fill();
          },
        },
      ];
    },
    desktop: (inst) => {
      const f = FINISHES[S.finish];
      const W = 540, H = 330;
      const plain = (r) => (ctx, w, h, k) => {
        rr(ctx, 0, 0, w, h, r * k);
        ctx.fillStyle = f.body;
        ctx.fill();
      };
      return [
        { w: 220, h: 160, t: 8, ppu: 1.5, side: f.side, local: M.chain(M.t(0, 4, -70), M.rx(-Math.PI / 2)), draw: plain(16) },
        { w: 80, h: 230, t: 9, ppu: 1.5, side: f.side, local: M.chain(M.t(0, 118, -64), M.rx(rad(-10))), draw: plain(6) },
        {
          w: W, h: H, t: 12, ppu: 4.2, side: f.side, local: M.t(0, 300, -18),
          draw(ctx, w, h, k) {
            rr(ctx, 0, 0, w, h, 8 * k);
            ctx.fillStyle = f.body;
            ctx.fill();
            rr(ctx, 1 * k, 1 * k, w - 2 * k, h - 30 * k, 7 * k);
            ctx.fillStyle = "#070708";
            ctx.fill();
            screen(ctx, 9 * k, 9 * k, w - 18 * k, h - 46 * k, 1 * k, inst.shot);
          },
        },
      ];
    },
    watch: (inst) => {
      const f = FINISHES[S.finish];
      const band = BANDS[S.band];
      const strap = (top) => (ctx, w, h, k) => {
        ctx.beginPath();
        if (top) ctx.roundRect(0, 0, w, h, [12 * k, 12 * k, 2 * k, 2 * k]);
        else ctx.roundRect(0, 0, w, h, [2 * k, 2 * k, 12 * k, 12 * k]);
        ctx.fillStyle = band;
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        for (let i = 1; i < 5; i++) ctx.fillRect(w * 0.42, (top ? h * 0.1 : h * 0.35) + i * h * 0.1, w * 0.16, h * 0.035);
      };
      const cy = 60;
      return [
        { w: 30, h: 40, t: 3.5, ppu: 8, side: mix(band, "#000000", 0.2), local: M.t(0, cy + 40, -3), draw: strap(true) },
        { w: 30, h: 40, t: 3.5, ppu: 8, side: mix(band, "#000000", 0.2), local: M.t(0, cy - 40, -3), draw: strap(false) },
        {
          w: 42, h: 50, t: 11, ppu: 20, side: f.side, local: M.t(0, cy, 0),
          draw(ctx, w, h, k) {
            rr(ctx, 0, 0, w, h, 11 * k);
            ctx.fillStyle = f.body;
            ctx.fill();
            rr(ctx, 1.3 * k, 1.3 * k, w - 2.6 * k, h - 2.6 * k, 9.8 * k);
            ctx.fillStyle = "#020203";
            ctx.fill();
            screen(ctx, 3.6 * k, 3.6 * k, w - 7.2 * k, h - 7.2 * k, 7.8 * k, inst.shot);
          },
        },
      ];
    },
    browser: (inst) => {
      const dark = S.chrome === "dark";
      const W = 330, H = 222;
      return [
        {
          w: W, h: H, t: 2, ppu: 6.4, side: dark ? "#26262a" : "#cfd1d5", local: M.t(0, H / 2, 0),
          draw(ctx, w, h, k) {
            rr(ctx, 0, 0, w, h, 4 * k);
            ctx.fillStyle = dark ? "#1b1b1e" : "#ececee";
            ctx.fill();
            const bar = 13 * k;
            ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
              ctx.fillStyle = c;
              ctx.beginPath();
              ctx.arc(8 * k + i * 6 * k, bar / 2, 1.7 * k, 0, Math.PI * 2);
              ctx.fill();
            });
            rr(ctx, w * 0.3, bar * 0.2, w * 0.4, bar * 0.6, bar * 0.3);
            ctx.fillStyle = dark ? "#2a2a2e" : "#ffffff";
            ctx.fill();
            ctx.fillStyle = dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";
            ctx.font = `500 ${4.2 * k}px Geist, system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(S.url || "", w / 2, bar / 2 + 0.2 * k);
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(0, bar, w, h - bar, [0, 0, 4 * k, 4 * k]);
            ctx.clip();
            screen(ctx, 0, bar, w, h - bar, 0, inst.shot);
            ctx.restore();
          },
        },
      ];
    },
  };

  /* ── WebGL ─────────────────────────────────────────────── */
  const glc = document.createElement("canvas");
  const gl = glc.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) {
    $("[data-ds-nogl]").hidden = false;
    return;
  }
  const VS = `attribute vec2 a;uniform mat4 uM;uniform vec2 uC,uS,uT;varying vec2 v;
void main(){v=vec2(a.x+.5,.5-a.y);vec4 p=uM*vec4(a,0.,1.);p.xy=(p.xy-uC*p.w)*uS+uT*p.w;gl_Position=p;}`;
  const FS = `precision mediump float;uniform sampler2D tx;uniform vec3 uTint;uniform float uMode;varying vec2 v;
void main(){vec4 c=texture2D(tx,v);if(uMode>.5){if(c.a<.5)discard;gl_FragColor=vec4(uTint,1.);}else{if(c.a<.003)discard;gl_FragColor=c;}}`;
  const prog = (() => {
    const mk = (t, s) => {
      const o = gl.createShader(t);
      gl.shaderSource(o, s);
      gl.compileShader(o);
      return o;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    gl.useProgram(p);
    return p;
  })();
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const U = Object.fromEntries(["uM", "uC", "uS", "uT", "uTint", "uMode", "tx"].map((n) => [n, gl.getUniformLocation(prog, n)]));
  const MAXTEX = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const MAXRB = Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), gl.getParameter(gl.MAX_VIEWPORT_DIMS)[0]);

  const texCache = new Map(); // key -> WebGLTexture
  const texKeys = new Map(); // texture -> key (for cleanup)
  function textureFor(slab, key) {
    if (texCache.has(key)) return texCache.get(key);
    let k = slab.ppu;
    const big = Math.max(slab.w, slab.h) * k;
    if (big > MAXTEX) k *= MAXTEX / big;
    const c = document.createElement("canvas");
    c.width = Math.round(slab.w * k);
    c.height = Math.round(slab.h * k);
    const ctx = c.getContext("2d");
    slab.draw(ctx, c.width, c.height, k);
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    texCache.set(key, t);
    texKeys.set(t, key);
    return t;
  }
  // drop GL textures whose key is no longer used
  const origClear = texCache.clear.bind(texCache);
  texCache.clear = () => {
    for (const t of texCache.values()) gl.deleteTexture(t);
    origClear();
  };

  const hex3 = (c) => {
    const ctx = hex3.ctx || (hex3.ctx = document.createElement("canvas").getContext("2d"));
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    const v = ctx.fillStyle;
    if (v.startsWith("#")) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
    const m = v.match(/[\d.]+/g) || [0, 0, 0];
    return m.slice(0, 3).map((n) => n / 255);
  };

  function instances() {
    const sc = SCENES[S.scene];
    return sc.items.map((it, i) => ({ ...it, i, shot: S.shots[i] ?? defaultShot(it.d, i) }));
  }
  function deviceType(d) {
    return d === "phone" ? "phone" : d === "tablet" ? "tablet" : d === "watch" ? "watch" : "wide";
  }

  /* draw the 3D devices into the GL canvas; region is the target box in pixels */
  function drawGL(W, H, region) {
    glc.width = W;
    glc.height = H;
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // collect slabs with world matrices
    const slabs = [];
    for (const inst of instances()) {
      let m = M.chain(M.t(...inst.p), M.ry(rad(inst.ry || 0)), M.rz(rad(inst.rz || 0)), M.rx(rad(inst.rx || 0)));
      if (inst.flat) m = M.chain(M.t(...inst.p), M.ry(rad(inst.ry || 0)), M.rx(-Math.PI / 2), M.t(0, -75, 0));
      DEVICES[inst.d](inst).forEach((sl, j) => {
        const key = [inst.d, j, S.finish, S.band, S.chrome, S.url, S.fit, S.glare, inst.shot, S.lid].join("|");
        slabs.push({ ...sl, m: M.mul(m, sl.local), key });
      });
    }
    // scene bounds -> rotation centre and camera distance
    const pts = [];
    for (const s of slabs)
      for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) pts.push(M.xf(s.m, x * s.w, y * s.h, z * s.t));
    const lo = [0, 1, 2].map((i) => Math.min(...pts.map((p) => p[i])));
    const hi = [0, 1, 2].map((i) => Math.max(...pts.map((p) => p[i])));
    const ctr = lo.map((v, i) => (v + hi[i]) / 2);
    const radius = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2;
    const fov = rad(S.fov);
    const dist = radius / Math.sin(fov / 2) + radius * 0.2;
    const view = M.chain(M.t(0, 0, -dist), M.rz(rad(S.roll)), M.rx(rad(S.pitch)), M.ry(rad(-S.yaw)), M.t(-ctr[0], -ctr[1], -ctr[2]));
    const proj = M.persp(fov, W / H, Math.max(1, dist - radius * 2), dist + radius * 2);
    const vp = M.mul(proj, view);
    // fit: projected bounds -> target region
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of pts) {
      const q = M.xf(vp, p[0], p[1], p[2]);
      const nx = q[0] / q[3], ny = q[1] / q[3];
      x0 = Math.min(x0, nx); x1 = Math.max(x1, nx); y0 = Math.min(y0, ny); y1 = Math.max(y1, ny);
    }
    const rx0 = (region.x / W) * 2 - 1, rx1 = ((region.x + region.w) / W) * 2 - 1;
    const ry1 = 1 - (region.y / H) * 2, ry0 = 1 - ((region.y + region.h) / H) * 2;
    const k = Math.min((rx1 - rx0) / (x1 - x0), (ry1 - ry0) / (y1 - y0));
    gl.uniform2f(U.uC, (x0 + x1) / 2, (y0 + y1) / 2);
    gl.uniform2f(U.uS, k, k);
    gl.uniform2f(U.uT, (rx0 + rx1) / 2, (ry0 + ry1) / 2);
    gl.uniform1i(U.tx, 0);
    gl.activeTexture(gl.TEXTURE0);

    // pass 1: thickness — silhouette layers, shaded like a rounded edge
    gl.uniform1f(U.uMode, 1);
    gl.depthMask(true);
    for (const s of slabs) {
      gl.bindTexture(gl.TEXTURE_2D, textureFor(s, s.key));
      const base = hex3(s.side);
      const n = clamp(Math.ceil(s.t / 0.22), 6, 60);
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const z = -s.t / 2 + f * s.t * 0.985;
        const shade = 0.58 + 0.42 * Math.sin(f * Math.PI * 0.92 + 0.12);
        gl.uniform3f(U.uTint, base[0] * shade, base[1] * shade, base[2] * shade);
        gl.uniformMatrix4fv(U.uM, false, M.chain(vp, s.m, M.t(0, 0, z), M.s(s.w, s.h, 1)));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
    // pass 2: front faces, back to front so their soft edges blend correctly
    gl.uniform1f(U.uMode, 0);
    gl.depthFunc(gl.LEQUAL);
    const fronts = slabs.map((s) => ({ s, z: M.xf(M.mul(view, s.m), 0, 0, s.t / 2)[2] })).sort((a, b) => a.z - b.z);
    for (const { s } of fronts) {
      gl.bindTexture(gl.TEXTURE_2D, textureFor(s, s.key));
      gl.uniformMatrix4fv(U.uM, false, M.chain(vp, s.m, M.t(0, 0, s.t / 2), M.s(s.w, s.h, 1)));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.depthFunc(gl.LESS);
  }

  /* ── 2D composite: background, shadow, devices, caption ── */
  function drawBg(ctx, W, H) {
    const b = BGS[S.bg];
    if (b.kind === "none") return;
    const [c1, c2] = S.bg === "custom" ? [S.bg1, S.bg2] : b.c;
    let g;
    if (b.kind === "radial") {
      g = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.hypot(W, H) * 0.62);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
    } else {
      g = ctx.createLinearGradient(0, 0, W * 0.35, H);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
    }
    ctx.fillStyle = b.kind === "mesh" ? c2 : g;
    ctx.fillRect(0, 0, W, H);
    if (b.kind === "mesh")
      for (const [c, x, y] of b.mesh) {
        const r = Math.max(W, H) * 0.65;
        const m = ctx.createRadialGradient(W * x, H * y, 0, W * x, H * y, r);
        m.addColorStop(0, c);
        m.addColorStop(1, "transparent");
        ctx.fillStyle = m;
        ctx.fillRect(0, 0, W, H);
      }
  }
  const lum = (c) => {
    const [r, g, b] = hex3(c);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  function captionColors() {
    const b = BGS[S.bg];
    const base = S.bg === "custom" ? S.bg1 : b.kind === "none" ? "#ffffff" : b.c[b.kind === "mesh" ? 1 : 0];
    const light = b.kind === "none" ? false : S.bg === "paper" || S.bg === "mint" || lum(base) > 0.6;
    return light ? ["#0b0c0e", "rgba(11,12,14,0.62)"] : ["#ffffff", "rgba(255,255,255,0.7)"];
  }
  function wrap(ctx, text, maxW) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  function compose(out, W, H) {
    const ctx = out.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    drawBg(ctx, W, H);
    const pad = S.pad / 100;
    let region = { x: W * pad, y: H * pad, w: W * (1 - 2 * pad), h: H * (1 - 2 * pad) };
    // caption layout
    let cap = null;
    if (S.cap !== "none" && (S.title || S.sub)) {
      const portrait = H > W * 1.2;
      const fs = Math.round((portrait ? W * 0.075 : S.cap === "left" ? H * 0.072 : H * 0.06) * 1);
      cap = { fs, sub: Math.round(fs * 0.46) };
      if (S.cap === "top" || S.cap === "bottom") {
        const band = H * (portrait ? 0.24 : 0.26);
        region = { x: W * pad, y: S.cap === "top" ? band : H * pad * 0.6, w: W * (1 - 2 * pad), h: H - band - H * pad * (S.cap === "top" ? 1 : 0.6) };
        cap.box = { x: W * 0.08, y: S.cap === "top" ? H * 0.06 : H - band + H * 0.02, w: W * 0.84, h: band - H * 0.06, align: "center" };
      } else {
        const left = W * 0.44;
        region = { x: left, y: H * pad, w: W - left - W * pad * 0.6, h: H * (1 - 2 * pad) };
        cap.box = { x: W * 0.07, y: H * 0.2, w: left - W * 0.1, h: H * 0.6, align: "left" };
      }
    }
    drawGL(W, H, region);
    // soft shadow from the device silhouette
    if (S.shadow > 0) {
      ctx.save();
      ctx.shadowColor = `rgba(0,0,0,${(S.shadow / 100) * 0.75})`;
      ctx.shadowBlur = Math.min(W, H) * 0.05;
      ctx.shadowOffsetY = Math.min(W, H) * 0.035;
      ctx.drawImage(glc, 0, 0);
      ctx.restore();
    }
    ctx.drawImage(glc, 0, 0);
    if (cap) {
      const [c1, c2] = captionColors();
      const b = cap.box;
      ctx.textAlign = b.align;
      ctx.textBaseline = "top";
      ctx.font = `600 ${cap.fs}px Geist, system-ui, sans-serif`;
      const tl = S.title ? wrap(ctx, S.title, b.w) : [];
      ctx.font = `400 ${cap.sub}px Geist, system-ui, sans-serif`;
      const sl = S.sub ? wrap(ctx, S.sub, b.w) : [];
      const total = tl.length * cap.fs * 1.08 + (sl.length ? cap.fs * 0.35 + sl.length * cap.sub * 1.35 : 0);
      let y = b.y + (b.h - total) / 2;
      const x = b.align === "center" ? b.x + b.w / 2 : b.x;
      ctx.fillStyle = c1;
      ctx.font = `600 ${cap.fs}px Geist, system-ui, sans-serif`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = `${-cap.fs * 0.025}px`;
      for (const l of tl) {
        ctx.fillText(l, x, y);
        y += cap.fs * 1.08;
      }
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
      y += cap.fs * 0.35;
      ctx.fillStyle = c2;
      ctx.font = `400 ${cap.sub}px Geist, system-ui, sans-serif`;
      for (const l of sl) {
        ctx.fillText(l, x, y);
        y += cap.sub * 1.35;
      }
    }
  }

  /* ── preview ───────────────────────────────────────────── */
  const stage = $("[data-ds-stage]");
  const canvas = $("[data-ds-canvas]");
  let raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(renderPreview);
  }
  function renderPreview() {
    const [w, h] = SIZES[S.size];
    const r = stage.getBoundingClientRect();
    const availW = r.width - 40,
      availH = r.height - 96;
    const k = Math.min(availW / w, availH / h);
    const cw = Math.max(80, Math.floor(w * k)),
      ch = Math.max(60, Math.floor(h * k));
    canvas.style.width = cw + "px";
    canvas.style.height = ch + "px";
    const dpr = Math.min(2, devicePixelRatio || 1);
    const pw = Math.round(cw * dpr),
      ph = Math.round(ch * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    canvas.classList.toggle("ds-checker", BGS[S.bg].kind === "none");
    compose(canvas, pw, ph);
  }
  new ResizeObserver(schedule).observe(stage);

  /* orbit by dragging the preview */
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, yaw: S.yaw, pitch: S.pitch };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    S.yaw = Math.round(clamp(drag.yaw - (e.clientX - drag.x) * 0.35, -80, 80));
    S.pitch = Math.round(clamp(drag.pitch + (e.clientY - drag.y) * 0.3, -30, 80));
    syncRanges();
    schedule();
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    canvas.classList.remove("dragging");
    save();
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("keydown", (e) => {
    const d = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key];
    if (!d) return;
    e.preventDefault();
    S.yaw = clamp(S.yaw + d[0], -80, 80);
    S.pitch = clamp(S.pitch + d[1], -30, 80);
    syncRanges();
    schedule();
  });
  canvas.tabIndex = 0;

  /* ── UI ────────────────────────────────────────────────── */
  const fmtV = { yaw: (v) => v + "°", pitch: (v) => v + "°", roll: (v) => v + "°", fov: (v) => v + "°", pad: (v) => v + "%", lid: (v) => v + "°", shadow: (v) => v + "%" };
  function syncRanges() {
    $$("[data-ds-in]").forEach((el) => {
      const k = el.dataset.dsIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else el.value = S[k];
    });
    $$("[data-ds-out]").forEach((o) => (o.textContent = fmtV[o.dataset.dsOut](S[o.dataset.dsOut])));
    $$("[data-ds-angle]").forEach((b) => {
      const a = ANGLES[b.dataset.dsAngle];
      b.setAttribute("aria-pressed", String(a.yaw === S.yaw && a.pitch === S.pitch && a.roll === S.roll));
    });
  }
  const swatch = (bg) => `background:${bg}`;
  function renderLists() {
    $("[data-ds-scenes]").innerHTML = Object.entries(SCENES)
      .map(([id, s]) => `<button type="button" class="ds-scene" data-ds-scene="${id}" aria-pressed="${S.scene === id}"><span class="ds-scene-ico">${sceneIcon(s)}</span><b>${s.name}</b></button>`)
      .join("");
    $("[data-ds-angles]").innerHTML = Object.entries(ANGLES).map(([id, a]) => `<button type="button" data-ds-angle="${id}" aria-pressed="false">${a.name}</button>`).join("");
    $("[data-ds-finishes]").innerHTML = Object.entries(FINISHES).map(([id, f]) => `<button type="button" class="ds-sw" data-ds-finish="${id}" aria-pressed="${S.finish === id}" title="${f.name}" aria-label="${f.name} finish"><i style="${swatch(`linear-gradient(135deg,${f.body},${f.side})`)}"></i></button>`).join("");
    $("[data-ds-bands]").innerHTML = Object.entries(BANDS).map(([id, c]) => `<button type="button" class="ds-sw" data-ds-band="${id}" aria-pressed="${S.band === id}" title="${id}" aria-label="${id} band"><i style="${swatch(c)}"></i></button>`).join("");
    $("[data-ds-bgs]").innerHTML = Object.entries(BGS)
      .map(([id, b]) => {
        const prev = b.kind === "none" ? "conic-gradient(#3f3f46 25%,#18181b 0 50%,#3f3f46 0 75%,#18181b 0) 0 0/10px 10px" : id === "custom" ? `linear-gradient(135deg,${S.bg1},${S.bg2})` : b.kind === "mesh" ? `radial-gradient(at 20% 20%,${b.mesh[0][0]},transparent 60%),radial-gradient(at 85% 20%,${b.mesh[1][0]},transparent 60%),radial-gradient(at 60% 95%,${b.mesh[2][0]},transparent 60%),${b.c[1]}` : `linear-gradient(160deg,${b.c[0]},${b.c[1]})`;
        return `<button type="button" class="ds-bg" data-ds-bg="${id}" aria-pressed="${S.bg === id}"><i style="background:${prev}"></i><b>${b.name}</b></button>`;
      })
      .join("");
    $("[data-ds-samples]").innerHTML = SAMPLES.map((s) => `<button type="button" class="ds-sample" data-ds-sample="${s.id}" title="Use ${s.label} sample"><img src="${s.src}" alt="${s.label} sample screenshot" loading="lazy" /></button>`).join("");
  }
  function sceneIcon(s) {
    const shape = { phone: [7, 13], tablet: [10, 13], laptop: [16, 10], desktop: [17, 12], browser: [16, 11], watch: [7, 8] };
    const items = s.items.slice(0, 4);
    const gap = 2;
    const total = items.reduce((a, it) => a + shape[it.d][0], 0) + gap * (items.length - 1);
    let x = (28 - total) / 2;
    return `<svg viewBox="0 0 28 18" width="28" height="18" aria-hidden="true">${items
      .map((it) => {
        const [w, h] = shape[it.d];
        const r = `<rect x="${x}" y="${(18 - h) / 2}" width="${w}" height="${h}" rx="${it.d === "phone" || it.d === "watch" ? 2 : 1.2}" fill="none" stroke="currentColor" stroke-width="1.2"/>`;
        x += w + gap;
        return r;
      })
      .join("")}</svg>`;
  }
  function renderSlots() {
    const inst = instances();
    if (slot >= inst.length) slot = 0;
    const label = { phone: "Phone", tablet: "Tablet", laptop: "Laptop", desktop: "Desktop", browser: "Browser", watch: "Watch" };
    $("[data-ds-slots]").innerHTML = inst
      .map((it) => {
        const im = img(it.shot);
        const src = im?.src || "";
        const n = inst.filter((x) => x.d === it.d).length > 1 ? " " + (inst.filter((x, j) => x.d === it.d && j <= it.i).length) : "";
        return `<button type="button" role="radio" class="ds-slot" data-ds-slot="${it.i}" aria-checked="${slot === it.i}"><span class="ds-slot-img">${src ? `<img src="${src}" alt="" />` : ""}</span><b>${label[it.d]}${n}</b></button>`;
      })
      .join("");
    const types = new Set(inst.map((i) => i.d));
    $$("[data-ds-only]").forEach((el) => (el.hidden = !types.has(el.dataset.dsOnly)));
    // highlight samples that suit the selected device
    const cur = inst[slot];
    $$("[data-ds-sample]").forEach((b) => {
      const s = SAMPLES.find((x) => x.id === b.dataset.dsSample);
      b.classList.toggle("fit", s.for === deviceType(cur.d));
      b.setAttribute("aria-pressed", String(cur.shot === s.id));
    });
  }
  function syncAll() {
    $$("[data-ds-set]").forEach((b) => b.setAttribute("aria-pressed", String(String(S[b.dataset.dsSet]) === b.dataset.dsVal)));
    $$("[data-ds-text]").forEach((el) => (el.value = S[el.dataset.dsText] || ""));
    $$("[data-ds-scene]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dsScene === S.scene)));
    $$("[data-ds-finish]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dsFinish === S.finish)));
    $$("[data-ds-band]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dsBand === S.band)));
    $$("[data-ds-bg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dsBg === S.bg)));
    $(".ds-row2").hidden = S.bg !== "custom";
    const [w, h] = SIZES[S.size];
    const sc = Math.min(+S.scale, Math.floor(MAXRB / Math.max(w, h)) || 1);
    $("[data-ds-dim]").textContent = `${w * sc} × ${h * sc}`;
    syncRanges();
    renderSlots();
  }
  let saveT = 0;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      const shots = Object.fromEntries(Object.entries(S.shots).filter(([, v]) => !uploads.has(v)));
      history.replaceState(null, "", "#d=" + btoa(JSON.stringify({ ...S, shots })));
    }, 400);
  }
  const update = (full = true) => {
    if (full) syncAll();
    else syncRanges();
    schedule();
    save();
  };

  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  };

  function setShot(id, i = slot) {
    S.shots = { ...S.shots, [i]: id };
    texCache.clear();
    update();
  }
  function addFile(file) {
    if (!file || !file.type.startsWith("image/")) return flash("That file is not an image");
    const id = "up-" + Date.now();
    uploads.set(id, URL.createObjectURL(file));
    setShot(id);
    flash("Screenshot added to " + ($(`[data-ds-slot="${slot}"] b`)?.textContent || "device"));
  }

  root.addEventListener("input", (e) => {
    const k = e.target.dataset.dsIn;
    const tk = e.target.dataset.dsText;
    if (tk) {
      S[tk] = e.target.value;
      if (tk === "url") texCache.clear();
      return update(false);
    }
    if (!k) return;
    if (e.target.type === "checkbox") S[k] = e.target.checked;
    else if (e.target.type === "color") S[k] = e.target.value;
    else S[k] = +e.target.value;
    if (k === "glare" || k === "lid") texCache.clear();
    if (k === "bg1" || k === "bg2") renderLists();
    update(e.target.type === "checkbox" || k === "bg1" || k === "bg2");
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    const set = t.closest("[data-ds-set]");
    if (set) {
      S[set.dataset.dsSet] = set.dataset.dsVal;
      if (["fit", "chrome"].includes(set.dataset.dsSet)) texCache.clear();
      return update();
    }
    const sc = t.closest("[data-ds-scene]");
    if (sc) {
      S.scene = sc.dataset.dsScene;
      S.shots = {};
      slot = 0;
      const a = ANGLES[SCENES[S.scene].cam];
      Object.assign(S, { yaw: a.yaw, pitch: a.pitch, roll: a.roll, fov: a.fov });
      texCache.clear();
      return update();
    }
    const an = t.closest("[data-ds-angle]");
    if (an) {
      const a = ANGLES[an.dataset.dsAngle];
      Object.assign(S, { yaw: a.yaw, pitch: a.pitch, roll: a.roll, fov: a.fov });
      return update();
    }
    const fi = t.closest("[data-ds-finish]");
    if (fi) {
      S.finish = fi.dataset.dsFinish;
      texCache.clear();
      return update();
    }
    const bd = t.closest("[data-ds-band]");
    if (bd) {
      S.band = bd.dataset.dsBand;
      texCache.clear();
      return update();
    }
    const bg = t.closest("[data-ds-bg]");
    if (bg) {
      S.bg = bg.dataset.dsBg;
      return update();
    }
    const sl = t.closest("[data-ds-slot]");
    if (sl) {
      slot = +sl.dataset.dsSlot;
      return renderSlots();
    }
    const sm = t.closest("[data-ds-sample]");
    if (sm) return setShot(sm.dataset.dsSample);
    if (t.closest("[data-ds-reset]")) {
      const keep = S.scene;
      S = { ...structuredClone(DEFAULT), scene: keep };
      const a = ANGLES[SCENES[keep].cam];
      Object.assign(S, { yaw: a.yaw, pitch: a.pitch, roll: a.roll, fov: a.fov });
      texCache.clear();
      return update();
    }
    if (t.closest("[data-ds-download]")) return download();
    if (t.closest("[data-ds-copy]")) return copyImage();
    if (t.closest("[data-ds-share]")) return share();
  });
  $("[data-ds-file]").addEventListener("change", (e) => {
    addFile(e.target.files?.[0]);
    e.target.value = "";
  });
  addEventListener("paste", (e) => {
    const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/"));
    if (f) {
      e.preventDefault();
      addFile(f);
    }
  });
  const drop = $("[data-ds-drop]");
  stage.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.hidden = false;
  });
  stage.addEventListener("dragleave", (e) => {
    if (!stage.contains(e.relatedTarget)) drop.hidden = true;
  });
  stage.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.hidden = true;
    addFile(e.dataTransfer?.files?.[0]);
  });

  /* ── export ────────────────────────────────────────────── */
  function exportCanvas() {
    const [w, h] = SIZES[S.size];
    const sc = Math.max(1, Math.min(+S.scale, Math.floor(MAXRB / Math.max(w, h)) || 1));
    const c = document.createElement("canvas");
    c.width = w * sc;
    c.height = h * sc;
    compose(c, c.width, c.height);
    schedule(); // the GL canvas was resized for export; redraw the preview
    return c;
  }
  const MIME = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
  function download() {
    const c = exportCanvas();
    if (S.fmt === "jpg") {
      // JPG has no transparency: flatten on white or the background
      const f = document.createElement("canvas");
      f.width = c.width;
      f.height = c.height;
      const x = f.getContext("2d");
      x.fillStyle = "#ffffff";
      x.fillRect(0, 0, f.width, f.height);
      x.drawImage(c, 0, 0);
      return save2(f);
    }
    save2(c);
  }
  function save2(c) {
    c.toBlob(
      (b) => {
        if (!b) return flash("Export failed in this browser");
        const a = document.createElement("a");
        a.download = `mockup-${S.scene}-${c.width}x${c.height}.${S.fmt}`;
        a.href = URL.createObjectURL(b);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        flash(`Downloaded ${c.width} × ${c.height} ${S.fmt.toUpperCase()}`);
      },
      MIME[S.fmt],
      0.92
    );
  }
  async function copyImage() {
    try {
      const c = exportCanvas();
      const blob = await new Promise((r) => c.toBlob(r, "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("Image copied, paste it anywhere");
    } catch {
      flash("Copy is not supported here, use Download");
    }
  }
  async function share() {
    save();
    await new Promise((r) => setTimeout(r, 450));
    try {
      await navigator.clipboard.writeText(location.href);
      flash(uploads.size ? "Link copied (your own screenshots are not included)" : "Share link copied");
    } catch {
      flash("The link is in the address bar");
    }
  }

  /* ── boot ──────────────────────────────────────────────── */
  try {
    if (location.hash.startsWith("#d=")) {
      const v = JSON.parse(atob(location.hash.slice(3)));
      if (v && SCENES[v.scene]) S = { ...structuredClone(DEFAULT), ...v, shots: v.shots || {} };
    }
  } catch {}
  renderLists();
  syncAll();
  document.fonts?.ready.then(() => {
    texCache.clear();
    schedule();
  });
  schedule();
})();
