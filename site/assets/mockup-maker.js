/* NiceUI Mockup Maker — screenshots into share images. Plain JavaScript, no dependencies.
   Everything is drawn on one canvas, so the preview is exactly what gets exported. */
(() => {
  const root = document.querySelector("[data-mm]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── constants ──────────────────────────────────────────── */
  const SIZES = { og: [1200, 630], x: [1600, 900], square: [1080, 1080], story: [1080, 1920], dribbble: [1600, 1200] };
  const MESHES = [
    { name: "Aurora", base: "#020617", blobs: [["#22d3ee", 0.18, 0.22], ["#a78bfa", 0.85, 0.15], ["#0ea5e9", 0.7, 0.92], ["#34d399", 0.12, 0.9]] },
    { name: "Sunset", base: "#1f1135", blobs: [["#fb7185", 0.15, 0.25], ["#fdba74", 0.85, 0.18], ["#f472b6", 0.6, 0.9], ["#facc15", 0.1, 0.92]] },
    { name: "Pastel", base: "#fdf8f3", blobs: [["#fbcfe8", 0.12, 0.2], ["#bae6fd", 0.88, 0.22], ["#d9f99d", 0.3, 0.9], ["#e9d5ff", 0.85, 0.85]] },
    { name: "Ocean", base: "#020617", blobs: [["#0c4a6e", 0.2, 0.2], ["#0ea5e9", 0.85, 0.3], ["#7dd3fc", 0.4, 0.95], ["#1e3a8a", 0.9, 0.9]] },
    { name: "Ember", base: "#0c0a09", blobs: [["#f97316", 0.15, 0.85], ["#dc2626", 0.85, 0.2], ["#facc15", 0.6, 0.95], ["#7c2d12", 0.3, 0.15]] },
    { name: "Mint", base: "#f0fdf4", blobs: [["#a7f3d0", 0.15, 0.2], ["#ecfccb", 0.85, 0.15], ["#5eead4", 0.3, 0.9], ["#bbf7d0", 0.85, 0.85]] },
    { name: "Graphite", base: "#09090b", blobs: [["#3f3f46", 0.2, 0.2], ["#27272a", 0.8, 0.3], ["#52525b", 0.5, 0.95], ["#18181b", 0.9, 0.9]] },
    { name: "Paper", base: "#fffaf0", blobs: [["#fde68a", 0.15, 0.2], ["#fecdd3", 0.85, 0.2], ["#e7e5e4", 0.3, 0.9], ["#fed7aa", 0.85, 0.85]] },
  ];
  const DEFAULT = {
    size: "og", cw: 1200, ch: 630,
    sample: 0,
    frame: "browser", frameTheme: "dark", url: "niceui.dev/dashboard", winTitle: "Dashboard",
    pad: 9, scale: 100, inset: 0, radius: 14, shadow: 60, tiltX: 0, tiltY: 0, offX: 0, offY: 0,
    bgType: "mesh", mesh: 0, c1: "#020617", c2: "#0ea5e9", angle: 135, grain: 8, dots: false,
    textPos: "off", headline: "Ship interfaces your users love", sub: "Free React & Tailwind components", badge: "", align: "left", font: "sans", textSize: 100, textColor: "#f3f4f6",
    fmt: "png", mult: "1",
  };
  const P = (name, o) => ({ name, ...o });
  const PRESETS = [
    P("Launch OG", { size: "og", frame: "browser", frameTheme: "dark", bgType: "mesh", mesh: 0, textPos: "left", headline: "Ship interfaces your users love", sub: "Free React & Tailwind components", badge: "NEW", textColor: "#f3f4f6", pad: 7, scale: 100, sample: 0 }),
    P("Mac window", { size: "x", frame: "mac", frameTheme: "dark", bgType: "mesh", mesh: 3, textPos: "off", pad: 9, sample: 0 }),
    P("Phone sunset", { size: "x", frame: "phone", frameTheme: "dark", bgType: "mesh", mesh: 1, textPos: "left", headline: "Your app, in their pocket", sub: "Mobile-first by default", textColor: "#fff7ed", sample: 2, pad: 8 }),
    P("Pastel tablet", { size: "square", frame: "tablet", frameTheme: "light", bgType: "mesh", mesh: 2, textPos: "top", headline: "Calm, clear dashboards", sub: "Designed for focus", textColor: "#18181b", align: "center", sample: 0, pad: 8 }),
    P("Minimal card", { size: "og", frame: "card", frameTheme: "light", bgType: "solid", c1: "#f4f4f5", textPos: "off", shadow: 35, pad: 10, sample: 1, grain: 0 }),
    P("3D tilt", { size: "x", frame: "browser", frameTheme: "dark", bgType: "mesh", mesh: 6, tiltX: 8, tiltY: -16, shadow: 85, textPos: "off", pad: 10, sample: 0 }),
    P("Story", { size: "story", frame: "phone", frameTheme: "dark", bgType: "mesh", mesh: 0, textPos: "top", headline: "Now on mobile", sub: "Download the app today", align: "center", textColor: "#f3f4f6", sample: 2, pad: 8 }),
    P("Instagram", { size: "square", frame: "mac", frameTheme: "light", bgType: "linear", c1: "#fbc2eb", c2: "#a6c1ee", angle: 135, textPos: "bottom", headline: "Fresh drop", sub: "New components every week", align: "center", textColor: "#18181b", sample: 1, pad: 9 }),
    P("Dribbble shot", { size: "dribbble", frame: "none", bgType: "mesh", mesh: 7, radius: 18, shadow: 70, textPos: "off", pad: 12, sample: 1 }),
    P("Ember launch", { size: "og", frame: "browser", frameTheme: "dark", bgType: "mesh", mesh: 4, textPos: "left", headline: "Launch week", sub: "Five days, five drops", badge: "LIVE", textColor: "#fff7ed", sample: 0, pad: 7, dots: true }),
  ];
  let S = structuredClone(DEFAULT);

  /* ── sample screenshots, drawn procedurally ─────────────── */
  const rr = (g, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  const FONT = (w, px, fam = "sans") => `${w} ${px}px ${fam === "serif" ? '"Instrument Serif", Georgia, serif' : fam === "mono" ? '"Geist Mono", ui-monospace, monospace' : 'Geist, Inter, system-ui, -apple-system, sans-serif'}`;
  function sampleDashboard() {
    const c = document.createElement("canvas");
    c.width = 1600;
    c.height = 1000;
    const g = c.getContext("2d");
    g.fillStyle = "#0b0c0e";
    g.fillRect(0, 0, 1600, 1000);
    g.fillStyle = "#060708";
    g.fillRect(0, 0, 260, 1000);
    g.fillStyle = "#7dd3fc";
    rr(g, 28, 30, 30, 30, 9);
    g.fill();
    g.fillStyle = "#f3f4f6";
    g.font = FONT(600, 22);
    g.fillText("Northwind", 72, 53);
    ["Overview", "Analytics", "Customers", "Revenue", "Settings"].forEach((t, i) => {
      if (i === 0) {
        g.fillStyle = "#1c1e22";
        rr(g, 18, 100, 224, 42, 10);
        g.fill();
      }
      g.fillStyle = i === 0 ? "#f3f4f6" : "#8b9099";
      g.font = FONT(500, 18);
      g.fillText(t, 40, 128 + i * 52);
    });
    g.fillStyle = "#f3f4f6";
    g.font = FONT(600, 34);
    g.fillText("Overview", 310, 80);
    g.fillStyle = "#8b9099";
    g.font = FONT(400, 18);
    g.fillText("Here is how your workspace is doing this week.", 310, 112);
    const kpi = [["Revenue", "$48,210", "+12.4%"], ["Active users", "9,438", "+8.1%"], ["Conversion", "4.6%", "+0.9%"], ["Churn", "1.2%", "-0.3%"]];
    kpi.forEach(([l, v, d], i) => {
      const x = 310 + i * 318;
      g.fillStyle = "#121316";
      rr(g, x, 150, 300, 140, 16);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,.07)";
      g.stroke();
      g.fillStyle = "#8b9099";
      g.font = FONT(500, 17);
      g.fillText(l, x + 24, 190);
      g.fillStyle = "#f3f4f6";
      g.font = FONT(600, 36);
      g.fillText(v, x + 24, 240);
      g.fillStyle = d.startsWith("-") ? "#fb7185" : "#34d399";
      g.font = FONT(500, 16);
      g.fillText(d, x + 24, 270);
    });
    g.fillStyle = "#121316";
    rr(g, 310, 316, 860, 420, 18);
    g.fill();
    g.fillStyle = "#f3f4f6";
    g.font = FONT(600, 20);
    g.fillText("Revenue", 336, 356);
    const pts = Array.from({ length: 24 }, (_, i) => 640 - (Math.sin(i * 0.55) * 60 + i * 9 + Math.cos(i * 1.7) * 22));
    const grad = g.createLinearGradient(0, 380, 0, 700);
    grad.addColorStop(0, "rgba(56,189,248,.45)");
    grad.addColorStop(1, "rgba(56,189,248,0)");
    g.beginPath();
    pts.forEach((y, i) => (i ? g.lineTo(336 + i * 35, y) : g.moveTo(336, y)));
    g.lineTo(336 + 23 * 35, 710);
    g.lineTo(336, 710);
    g.fillStyle = grad;
    g.fill();
    g.beginPath();
    pts.forEach((y, i) => (i ? g.lineTo(336 + i * 35, y) : g.moveTo(336, y)));
    g.strokeStyle = "#38bdf8";
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = "#121316";
    rr(g, 1194, 316, 360, 420, 18);
    g.fill();
    g.fillStyle = "#f3f4f6";
    g.font = FONT(600, 20);
    g.fillText("Top channels", 1220, 356);
    [["Organic", 0.82, "#7dd3fc"], ["Direct", 0.61, "#a78bfa"], ["Referral", 0.44, "#34d399"], ["Social", 0.28, "#f472b6"]].forEach(([n, v, col], i) => {
      const y = 400 + i * 78;
      g.fillStyle = "#8b9099";
      g.font = FONT(500, 16);
      g.fillText(n, 1220, y);
      g.fillStyle = "#1c1e22";
      rr(g, 1220, y + 14, 300, 12, 6);
      g.fill();
      g.fillStyle = col;
      rr(g, 1220, y + 14, 300 * v, 12, 6);
      g.fill();
    });
    g.fillStyle = "#121316";
    rr(g, 310, 760, 1244, 210, 18);
    g.fill();
    ["Acme Inc.", "Globex", "Initech", "Umbrella"].forEach((n, i) => {
      const y = 806 + i * 44;
      g.fillStyle = "#f3f4f6";
      g.font = FONT(500, 17);
      g.fillText(n, 336, y);
      g.fillStyle = "#8b9099";
      g.fillText(["Enterprise", "Growth", "Starter", "Growth"][i], 700, y);
      g.fillText(["$12,400", "$8,920", "$2,310", "$6,780"][i], 1000, y);
      g.fillStyle = i === 2 ? "#facc15" : "#34d399";
      g.fillText(i === 2 ? "Trial" : "Active", 1300, y);
    });
    return c;
  }
  function sampleLanding() {
    const c = document.createElement("canvas");
    c.width = 1600;
    c.height = 1000;
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 1600, 1000);
    g.fillStyle = "#0b0c0e";
    g.font = FONT(600, 24);
    g.fillText("Lumen", 80, 66);
    g.fillStyle = "#5c616a";
    g.font = FONT(500, 18);
    ["Product", "Pricing", "Docs", "Blog"].forEach((t, i) => g.fillText(t, 560 + i * 120, 64));
    g.fillStyle = "#0b0c0e";
    rr(g, 1360, 36, 160, 46, 23);
    g.fill();
    g.fillStyle = "#fff";
    g.font = FONT(600, 17);
    g.fillText("Get started", 1394, 65);
    g.fillStyle = "#0b0c0e";
    g.font = FONT(600, 70);
    g.textAlign = "center";
    g.fillText("Analytics that feel", 800, 250);
    g.fillStyle = "#0284c7";
    g.font = 'italic 400 78px "Instrument Serif", Georgia, serif';
    g.fillText("effortless.", 800, 335);
    g.fillStyle = "#5c616a";
    g.font = FONT(400, 22);
    g.fillText("Dashboards, alerts and reports your whole team understands.", 800, 395);
    g.fillStyle = "#0b0c0e";
    rr(g, 650, 430, 300, 58, 29);
    g.fill();
    g.fillStyle = "#fff";
    g.font = FONT(600, 19);
    g.fillText("Start free trial", 800, 466);
    g.textAlign = "left";
    const grad = g.createLinearGradient(160, 540, 1440, 980);
    grad.addColorStop(0, "#e0f2fe");
    grad.addColorStop(0.5, "#ede9fe");
    grad.addColorStop(1, "#fce7f3");
    g.fillStyle = grad;
    rr(g, 160, 540, 1280, 520, 28);
    g.fill();
    [0, 1, 2].forEach((i) => {
      const x = 220 + i * 400;
      g.fillStyle = "rgba(255,255,255,.85)";
      rr(g, x, 600, 360, 220, 20);
      g.fill();
      g.fillStyle = ["#0ea5e9", "#8b5cf6", "#ec4899"][i];
      rr(g, x + 28, 630, 44, 44, 12);
      g.fill();
      g.fillStyle = "#0b0c0e";
      g.font = FONT(600, 22);
      g.fillText(["Live dashboards", "Smart alerts", "Shared reports"][i], x + 28, 712);
      g.fillStyle = "#5c616a";
      g.font = FONT(400, 17);
      g.fillText(["Real-time, zero setup.", "Know before it breaks.", "One link, every stakeholder."][i], x + 28, 746);
    });
    return c;
  }
  function samplePhone() {
    const c = document.createElement("canvas");
    c.width = 780;
    c.height = 1688;
    const g = c.getContext("2d");
    const bg = g.createLinearGradient(0, 0, 0, 1688);
    bg.addColorStop(0, "#0b0c0e");
    bg.addColorStop(1, "#000");
    g.fillStyle = bg;
    g.fillRect(0, 0, 780, 1688);
    g.fillStyle = "#f3f4f6";
    g.font = FONT(600, 28);
    g.fillText("9:41", 60, 70);
    g.fillStyle = "#8b9099";
    g.font = FONT(500, 26);
    g.fillText("Good morning,", 48, 190);
    g.fillStyle = "#f3f4f6";
    g.font = FONT(600, 52);
    g.fillText("Maya", 48, 252);
    const card = g.createLinearGradient(48, 300, 732, 640);
    card.addColorStop(0, "#0ea5e9");
    card.addColorStop(1, "#7c3aed");
    g.fillStyle = card;
    rr(g, 48, 300, 684, 340, 36);
    g.fill();
    g.fillStyle = "rgba(255,255,255,.8)";
    g.font = FONT(500, 26);
    g.fillText("Total balance", 88, 370);
    g.fillStyle = "#fff";
    g.font = FONT(600, 72);
    g.fillText("$12,840", 88, 460);
    g.fillStyle = "rgba(255,255,255,.85)";
    g.font = FONT(500, 24);
    g.fillText("+ $1,204 this month", 88, 520);
    ["Send", "Request", "Top up"].forEach((t, i) => {
      const x = 48 + i * 236;
      g.fillStyle = "#121316";
      rr(g, x, 690, 212, 150, 28);
      g.fill();
      g.fillStyle = ["#7dd3fc", "#a78bfa", "#34d399"][i];
      rr(g, x + 26, 716, 56, 56, 18);
      g.fill();
      g.fillStyle = "#f3f4f6";
      g.font = FONT(600, 26);
      g.fillText(t, x + 26, 814);
    });
    g.fillStyle = "#f3f4f6";
    g.font = FONT(600, 32);
    g.fillText("Activity", 48, 920);
    [["Spotify", "-$9.99", "#34d399"], ["Salary", "+$4,200", "#7dd3fc"], ["Coffee Lab", "-$4.50", "#facc15"], ["Rent", "-$1,450", "#f472b6"], ["Gym", "-$39.00", "#a78bfa"]].forEach(([n, a, col], i) => {
      const y = 960 + i * 130;
      g.fillStyle = "#121316";
      rr(g, 48, y, 684, 110, 26);
      g.fill();
      g.fillStyle = col;
      rr(g, 72, y + 25, 60, 60, 18);
      g.fill();
      g.fillStyle = "#f3f4f6";
      g.font = FONT(600, 28);
      g.fillText(n, 156, y + 64);
      g.textAlign = "right";
      g.fillStyle = a.startsWith("+") ? "#34d399" : "#f3f4f6";
      g.fillText(a, 700, y + 64);
      g.textAlign = "left";
    });
    return c;
  }
  const SAMPLES = [
    { name: "Dashboard", make: sampleDashboard },
    { name: "Landing page", make: sampleLanding },
    { name: "Mobile app", make: samplePhone },
  ];
  const sampleCache = [];
  let upload = null; // ImageBitmap/HTMLImageElement of the user's screenshot
  const shot = () => (S.sample === "upload" && upload ? upload : sampleCache[S.sample] || (sampleCache[S.sample] = SAMPLES[S.sample]?.make() || SAMPLES[0].make()));

  /* ── noise tile for grain ───────────────────────────────── */
  const noiseTile = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const g = c.getContext("2d");
    const img = g.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  })();

  /* ── canvas size ────────────────────────────────────────── */
  const dims = () => (S.size === "custom" ? [clamp(+S.cw || 1200, 200, 4000), clamp(+S.ch || 630, 200, 4000)] : SIZES[S.size] || SIZES.og);

  /* ── rendering ──────────────────────────────────────────── */
  function drawBackground(g, W, H) {
    if (S.bgType === "solid") {
      g.fillStyle = S.c1;
      g.fillRect(0, 0, W, H);
    } else if (S.bgType === "linear") {
      const a = ((S.angle - 90) * Math.PI) / 180;
      const len = Math.abs(W * Math.cos(a)) + Math.abs(H * Math.sin(a));
      const dx = (Math.cos(a) * len) / 2,
        dy = (Math.sin(a) * len) / 2;
      const gr = g.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy);
      gr.addColorStop(0, S.c1);
      gr.addColorStop(1, S.c2);
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
    } else {
      const m = MESHES[S.mesh] || MESHES[0];
      g.fillStyle = m.base;
      g.fillRect(0, 0, W, H);
      const R = Math.hypot(W, H) * 0.55;
      for (const [c, x, y] of m.blobs) {
        const gr = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, R);
        gr.addColorStop(0, c);
        gr.addColorStop(1, c + "00");
        g.fillStyle = gr;
        g.fillRect(0, 0, W, H);
      }
    }
    if (S.dots) {
      const step = Math.max(14, Math.round(Math.min(W, H) / 32));
      const light = isLight();
      g.fillStyle = light ? "rgba(0,0,0,.09)" : "rgba(255,255,255,.08)";
      for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
        g.beginPath();
        g.arc(x, y, Math.max(1, step / 14), 0, Math.PI * 2);
        g.fill();
      }
    }
    if (S.grain > 0) {
      g.save();
      g.globalAlpha = S.grain / 100;
      g.globalCompositeOperation = "overlay";
      g.fillStyle = g.createPattern(noiseTile, "repeat");
      g.fillRect(0, 0, W, H);
      g.restore();
    }
  }
  const lum = (hex) => {
    const v = parseInt(hex.slice(1), 16);
    const [r, gg, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x) => x / 255);
    return 0.2126 * r + 0.7152 * gg + 0.0722 * b;
  };
  const isLight = () => (S.bgType === "mesh" ? lum((MESHES[S.mesh] || MESHES[0]).base) > 0.6 : lum(S.c1) > 0.6);

  function wrap(g, text, maxW) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (g.measureText(t).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  /* Draw headline/sub/badge in box; returns used height. measureOnly skips drawing. */
  function drawText(g, x, y, w, unit, measureOnly) {
    const k = (S.textSize / 100) * unit;
    const hSize = Math.round(64 * k),
      sSize = Math.round(28 * k),
      bSize = Math.round(18 * k);
    let cy = y;
    const ax = S.align === "center" ? x + w / 2 : S.align === "right" ? x + w : x;
    g.textAlign = S.align;
    g.textBaseline = "alphabetic";
    if (S.badge) {
      g.font = FONT(600, bSize, S.font === "serif" ? "sans" : S.font);
      const bw = g.measureText(S.badge).width + bSize * 1.4;
      const bx = S.align === "center" ? ax - bw / 2 : S.align === "right" ? ax - bw : ax;
      if (!measureOnly) {
        g.fillStyle = S.textColor + "22";
        rr(g, bx, cy, bw, bSize * 1.9, bSize * 0.95);
        g.fill();
        g.strokeStyle = S.textColor + "55";
        g.lineWidth = Math.max(1, unit);
        g.stroke();
        g.fillStyle = S.textColor;
        g.textAlign = "left";
        g.fillText(S.badge, bx + bSize * 0.7, cy + bSize * 1.32);
        g.textAlign = S.align;
      }
      cy += bSize * 1.9 + hSize * 0.45;
    }
    if (S.headline) {
      g.font = S.font === "serif" ? `italic 400 ${Math.round(hSize * 1.08)}px "Instrument Serif", Georgia, serif` : FONT(600, hSize, S.font);
      const lines = wrap(g, S.headline, w);
      for (const l of lines) {
        cy += hSize * 1.05;
        if (!measureOnly) {
          g.fillStyle = S.textColor;
          g.fillText(l, ax, cy);
        }
      }
    }
    if (S.sub) {
      g.font = FONT(400, sSize, S.font === "serif" ? "sans" : S.font);
      const lines = wrap(g, S.sub, w);
      cy += sSize * 0.6;
      for (const l of lines) {
        cy += sSize * 1.35;
        if (!measureOnly) {
          g.fillStyle = S.textColor;
          g.globalAlpha = 0.78;
          g.fillText(l, ax, cy);
          g.globalAlpha = 1;
        }
      }
    }
    g.textAlign = "left";
    return cy - y + sSize * 0.4;
  }

  const FR = {
    dark: { body: "#141518", bar: "#1c1e22", line: "rgba(255,255,255,.09)", text: "#a3a8b0", pill: "#0b0c0e", bezel: "#0b0c0e", bezelEdge: "#2a2c31" },
    light: { body: "#ffffff", bar: "#f1f2f4", line: "rgba(0,0,0,.08)", text: "#5c616a", pill: "#ffffff", bezel: "#f4f4f5", bezelEdge: "#d4d4d8" },
  };

  /* Frame geometry for a frame width fw and image aspect ia (h/w). */
  function frameGeom(fw, ia, unit) {
    const inset = S.inset * unit;
    if (S.frame === "phone") return { w: fw, h: fw * 2.05, kind: "phone" };
    if (S.frame === "tablet") return { w: fw, h: fw * 0.72, kind: "tablet" };
    const chrome = S.frame === "mac" ? fw * 0.042 : S.frame === "browser" ? fw * 0.058 : 0;
    const pad = S.frame === "card" ? Math.max(inset, fw * 0.025) : inset;
    const iw = fw - pad * 2;
    return { w: fw, h: chrome + pad * 2 + iw * ia, chrome, pad, kind: S.frame };
  }

  function drawCover(g, img, x, y, w, h, alignTop) {
    const iw = img.width,
      ih = img.height;
    const s = Math.max(w / iw, h / ih);
    const dw = iw * s,
      dh = ih * s;
    g.drawImage(img, x + (w - dw) / 2, alignTop ? y : y + (h - dh) / 2, dw, dh);
  }

  function drawDevice(g, cx, cy, fw, img, unit) {
    const ia = img.height / img.width;
    const geo = frameGeom(fw, ia, unit);
    const t = FR[S.frameTheme] || FR.dark;
    const x = -geo.w / 2,
      y = -geo.h / 2;
    const R = S.radius * unit;
    g.save();
    g.translate(cx, cy);
    // 3D tilt approximated with scale + skew
    const rx = (S.tiltX * Math.PI) / 180,
      ry = (S.tiltY * Math.PI) / 180;
    g.transform(Math.cos(ry), Math.sin(ry) * 0.32, -Math.sin(rx) * 0.32, Math.cos(rx), 0, 0);
    // shadow on the frame body
    const sh = S.shadow / 100;
    if (sh > 0) {
      g.shadowColor = `rgba(0,0,0,${0.18 + sh * 0.5})`;
      g.shadowBlur = (20 + 90 * sh) * unit;
      g.shadowOffsetY = 34 * sh * unit;
    }
    if (geo.kind === "phone" || geo.kind === "tablet") {
      const outerR = geo.kind === "phone" ? geo.w * 0.15 : geo.w * 0.05;
      const bez = geo.kind === "phone" ? geo.w * 0.035 : geo.w * 0.025;
      g.fillStyle = t.bezel;
      rr(g, x, y, geo.w, geo.h, outerR);
      g.fill();
      g.shadowColor = "transparent";
      g.strokeStyle = t.bezelEdge;
      g.lineWidth = Math.max(1.5, geo.w * 0.006);
      g.stroke();
      const sx = x + bez,
        sy = y + bez,
        sw = geo.w - bez * 2,
        shh = geo.h - bez * 2;
      g.save();
      rr(g, sx, sy, sw, shh, outerR - bez);
      g.clip();
      g.fillStyle = "#000";
      g.fillRect(sx, sy, sw, shh);
      drawCover(g, img, sx, sy, sw, shh, true);
      g.restore();
      if (geo.kind === "phone") {
        g.fillStyle = "#000";
        const iw = geo.w * 0.3,
          ih = geo.w * 0.085;
        rr(g, -iw / 2, sy + bez * 0.9, iw, ih, ih / 2);
        g.fill();
      } else {
        g.fillStyle = t.bezelEdge;
        g.beginPath();
        g.arc(0, y + bez / 2, Math.max(2, bez * 0.18), 0, Math.PI * 2);
        g.fill();
      }
    } else {
      const r = geo.kind === "none" ? R : Math.max(R, 4 * unit);
      if (geo.kind === "none") {
        g.fillStyle = "#000";
        rr(g, x, y, geo.w, geo.h, r);
        g.fill();
        g.shadowColor = "transparent";
        g.save();
        rr(g, x, y, geo.w, geo.h, r);
        g.clip();
        g.drawImage(img, x, y, geo.w, geo.h);
        g.restore();
      } else {
        g.fillStyle = t.body;
        rr(g, x, y, geo.w, geo.h, r);
        g.fill();
        g.shadowColor = "transparent";
        g.strokeStyle = t.line;
        g.lineWidth = Math.max(1, unit);
        g.stroke();
        if (geo.chrome) {
          // title bar
          g.save();
          rr(g, x, y, geo.w, geo.h, r);
          g.clip();
          g.fillStyle = t.bar;
          g.fillRect(x, y, geo.w, geo.chrome);
          g.fillStyle = t.line;
          g.fillRect(x, y + geo.chrome - Math.max(1, unit), geo.w, Math.max(1, unit));
          g.restore();
          const d = geo.chrome * 0.26;
          ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
            g.fillStyle = c;
            g.beginPath();
            g.arc(x + geo.chrome * 0.55 + i * d * 2.7, y + geo.chrome / 2, d, 0, Math.PI * 2);
            g.fill();
          });
          if (geo.kind === "browser") {
            const pw = geo.w * 0.46,
              ph = geo.chrome * 0.56;
            g.fillStyle = t.pill;
            rr(g, -pw / 2, y + (geo.chrome - ph) / 2, pw, ph, ph / 2);
            g.fill();
            g.strokeStyle = t.line;
            g.stroke();
            g.fillStyle = t.text;
            g.font = FONT(500, Math.round(ph * 0.46));
            g.textAlign = "center";
            g.textBaseline = "middle";
            g.fillText("🔒 " + (S.url || ""), 0, y + geo.chrome / 2 + 1);
          } else {
            g.fillStyle = t.text;
            g.font = FONT(600, Math.round(geo.chrome * 0.36));
            g.textAlign = "center";
            g.textBaseline = "middle";
            g.fillText(S.winTitle || "", 0, y + geo.chrome / 2 + 1);
          }
          g.textAlign = "left";
          g.textBaseline = "alphabetic";
        }
        const ix = x + geo.pad,
          iy = y + geo.chrome + geo.pad,
          iw = geo.w - geo.pad * 2,
          ih = geo.h - geo.chrome - geo.pad * 2;
        g.save();
        if (geo.chrome && !geo.pad) {
          // square top, rounded bottom
          g.beginPath();
          g.moveTo(ix, iy);
          g.lineTo(ix + iw, iy);
          g.arcTo(ix + iw, iy + ih, ix, iy + ih, r);
          g.arcTo(ix, iy + ih, ix, iy, r);
          g.closePath();
        } else rr(g, ix, iy, iw, ih, Math.max(0, r - geo.pad * 0.6));
        g.clip();
        g.drawImage(img, ix, iy, iw, ih);
        g.restore();
      }
    }
    g.restore();
  }

  function render(g, W, H) {
    g.save();
    g.clearRect(0, 0, W, H);
    drawBackground(g, W, H);
    const unit = Math.min(W, H) / 1000 + Math.max(W, H) / 4000;
    const pad = (Math.min(W, H) * S.pad) / 100;
    let ax = pad,
      ay = pad,
      aw = W - pad * 2,
      ah = H - pad * 2;
    // text block
    if (S.textPos !== "off" && (S.headline || S.sub || S.badge)) {
      if (S.textPos === "left") {
        const tw = aw * 0.42;
        const th = drawText(g, ax, 0, tw, unit, true);
        drawText(g, ax, ay + (ah - th) / 2, tw, unit, false);
        ax += tw + pad * 0.6;
        aw -= tw + pad * 0.6;
      } else {
        const th = drawText(g, ax, 0, aw, unit, true);
        if (S.textPos === "top") {
          drawText(g, ax, ay, aw, unit, false);
          ay += th + pad * 0.5;
          ah -= th + pad * 0.5;
        } else {
          drawText(g, ax, ay + ah - th, aw, unit, false);
          ah -= th + pad * 0.5;
        }
      }
    }
    // fit the device into the remaining box
    const img = shot();
    const ia = img.height / img.width;
    const test = frameGeom(1000, ia, unit);
    const ratio = test.h / test.w;
    let fw = Math.min(aw, ah / ratio) * (S.scale / 100);
    fw = Math.max(40, fw);
    const cx = ax + aw / 2 + (S.offX / 100) * W,
      cy = ay + ah / 2 + (S.offY / 100) * H;
    drawDevice(g, cx, cy, fw, img, unit);
    g.restore();
  }

  /* ── preview ────────────────────────────────────────────── */
  const canvas = $("[data-mm-canvas]");
  const ctx = canvas.getContext("2d");
  let raf = 0;
  function paint() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const [W, H] = dims();
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      render(ctx, W, H);
      const m = +S.mult;
      $("[data-mm-dim]").textContent = `${W * m} × ${H * m} · ${S.fmt === "jpeg" ? "JPG" : S.fmt.toUpperCase()}`;
    });
  }

  /* ── controls ───────────────────────────────────────────── */
  const FMT = {
    pad: (v) => v + "%", scale: (v) => v + "%", inset: (v) => v + "px", radius: (v) => v + "px", shadow: (v) => v + "%",
    tiltX: (v) => v + "°", tiltY: (v) => v + "°", offX: (v) => v + "%", offY: (v) => v + "%", angle: (v) => v + "°", grain: (v) => v + "%", textSize: (v) => v + "%",
  };
  function sync() {
    $$("[data-mm-in]").forEach((el) => {
      const k = el.dataset.mmIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else if (document.activeElement !== el) el.value = S[k];
      const out = $(`[data-mm-out="${k}"]`);
      if (out && FMT[k]) out.textContent = FMT[k](S[k]);
    });
    $$("[data-mm-set]").forEach((b) => b.setAttribute("aria-pressed", String(String(S[b.dataset.mmSet]) === b.dataset.mmVal)));
    $("[data-mm-custom]").hidden = S.size !== "custom";
    $("[data-mm-urlrow]").hidden = S.frame !== "browser";
    $("[data-mm-titlerow]").hidden = S.frame !== "mac";
    $("[data-mm-c2row]").hidden = S.bgType !== "linear";
    $("[data-mm-anglerow]").hidden = S.bgType !== "linear";
    $("[data-mm-meshes]").hidden = S.bgType !== "mesh";
    $("[data-mm-c1row]") && ($("[data-mm-c1row]").hidden = S.bgType === "mesh");
    const c1 = $('[data-mm-in="c1"]').closest(".gm-row");
    if (c1) c1.hidden = S.bgType === "mesh";
    $("[data-mm-textfields]").hidden = S.textPos === "off";
    $$("[data-mm-mesh]").forEach((b) => b.setAttribute("aria-pressed", String(S.bgType === "mesh" && +b.dataset.mmMesh === S.mesh)));
    $$("[data-mm-sample]").forEach((b) => b.setAttribute("aria-pressed", String(String(S.sample) === b.dataset.mmSample)));
  }
  function update() {
    sync();
    paint();
    clearTimeout(update.t);
    update.t = setTimeout(() => history.replaceState(null, "", "#m=" + encode()), 400);
  }
  root.addEventListener("input", (e) => {
    const el = e.target.closest("[data-mm-in]");
    if (!el) return;
    const k = el.dataset.mmIn;
    S[k] = el.type === "checkbox" ? el.checked : el.type === "range" || el.type === "number" ? +el.value : el.value;
    update();
  });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mm-set]");
    if (b) {
      const k = b.dataset.mmSet;
      S[k] = b.dataset.mmVal;
      if (k === "size" && S.size !== "custom") [S.cw, S.ch] = SIZES[S.size];
      update();
    }
    const m = e.target.closest("[data-mm-mesh]");
    if (m) {
      S.bgType = "mesh";
      S.mesh = +m.dataset.mmMesh;
      update();
    }
    const sm = e.target.closest("[data-mm-sample]");
    if (sm) {
      const v = sm.dataset.mmSample;
      if (v === "upload" && !upload) return;
      S.sample = v === "upload" ? "upload" : +v;
      update();
    }
    const pr = e.target.closest("[data-mm-preset]");
    if (pr) {
      const keepUpload = S.sample === "upload" && upload;
      S = { ...structuredClone(DEFAULT), ...structuredClone(PRESETS[+pr.dataset.mmPreset]) };
      delete S.name;
      if (S.size !== "custom") [S.cw, S.ch] = SIZES[S.size];
      if (keepUpload) S.sample = "upload";
      update();
    }
    if (e.target.closest("[data-mm-reset]")) {
      S = structuredClone(DEFAULT);
      update();
    }
    if (e.target.closest("[data-mm-download]")) download();
    if (e.target.closest("[data-mm-copy]")) copyImage();
    if (e.target.closest("[data-mm-share]")) share();
  });

  /* ── image input: file, drop, paste ─────────────────────── */
  async function loadFile(file) {
    if (!file || !/^image\//.test(file.type)) return flash("That isn't an image");
    try {
      upload = await createImageBitmap(file);
    } catch {
      const url = URL.createObjectURL(file);
      upload = await new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = url;
      });
    }
    S.sample = "upload";
    renderSources();
    update();
    flash("Screenshot loaded · stays in your browser");
  }
  $("[data-mm-file]").addEventListener("change", (e) => loadFile(e.target.files[0]));
  const stage = $("[data-mm-stage]");
  const drop = $("[data-mm-drop]");
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
    loadFile(e.dataTransfer.files[0]);
  });
  addEventListener("paste", (e) => {
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) return;
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
    if (item) {
      e.preventDefault();
      loadFile(item.getAsFile());
    }
  });

  /* ── source thumbnails, mesh swatches, presets ──────────── */
  const thumb = (img) => {
    const c = document.createElement("canvas");
    c.width = 120;
    c.height = 76;
    drawCover(c.getContext("2d"), img, 0, 0, 120, 76, true);
    return c.toDataURL("image/jpeg", 0.8);
  };
  function renderSources() {
    $("[data-mm-samples]").innerHTML =
      SAMPLES.map((s, i) => `<button type="button" class="mm-thumb" data-mm-sample="${i}" aria-pressed="false" title="${s.name}"><img src="${thumb(sampleCache[i] || (sampleCache[i] = s.make()))}" alt="${s.name} sample" /></button>`).join("") +
      (upload ? `<button type="button" class="mm-thumb" data-mm-sample="upload" aria-pressed="false" title="Your screenshot"><img src="${thumb(upload)}" alt="Your screenshot" /></button>` : "");
  }
  $("[data-mm-meshes]").innerHTML = MESHES.map((m, i) => `<button type="button" class="mm-mesh" data-mm-mesh="${i}" aria-pressed="false" title="${m.name}" aria-label="${m.name} background" style="background:${m.blobs.map(([c, x, y]) => `radial-gradient(at ${x * 100}% ${y * 100}%, ${c} 0, transparent 60%)`).join(",")},${m.base}"></button>`).join("");
  function renderPresets() {
    const keep = S;
    $("[data-mm-presets]").innerHTML = PRESETS.map((p, i) => {
      S = { ...structuredClone(DEFAULT), ...structuredClone(p) };
      const c = document.createElement("canvas");
      const [W, H] = SIZES[S.size] || SIZES.og;
      const k = 220 / W;
      c.width = 220;
      c.height = Math.round(H * k);
      const g = c.getContext("2d");
      g.scale(k, k);
      render(g, W, H);
      return `<button type="button" class="mm-preset" data-mm-preset="${i}"><span><img src="${c.toDataURL("image/jpeg", 0.82)}" alt="" /></span><b>${p.name}</b></button>`;
    }).join("");
    S = keep;
  }

  /* ── export ─────────────────────────────────────────────── */
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  };
  function exportCanvas(mult) {
    const [W, H] = dims();
    const c = document.createElement("canvas");
    c.width = W * mult;
    c.height = H * mult;
    const g = c.getContext("2d");
    g.scale(mult, mult);
    render(g, W, H);
    return c;
  }
  const toBlob = (c, type, q) => new Promise((res) => c.toBlob(res, type, q));
  async function download() {
    const mult = +S.mult;
    const c = exportCanvas(mult);
    const type = "image/" + S.fmt;
    const blob = await toBlob(c, type, 0.92);
    if (!blob) return flash("Export failed");
    const a = document.createElement("a");
    a.download = `mockup-${c.width}x${c.height}.${S.fmt === "jpeg" ? "jpg" : S.fmt}`;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    flash(`Downloaded ${c.width} × ${c.height} ${S.fmt === "jpeg" ? "JPG" : S.fmt.toUpperCase()}`);
  }
  async function copyImage() {
    if (!window.ClipboardItem || !navigator.clipboard?.write) return flash("Copying images isn't supported here — use Download");
    try {
      const c = exportCanvas(+S.mult);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": toBlob(c, "image/png") })]);
      flash(`Image copied · ${c.width} × ${c.height} PNG`);
    } catch {
      flash("Copy failed — use Download instead");
    }
  }
  const encode = () => btoa(unescape(encodeURIComponent(JSON.stringify({ ...S, sample: S.sample === "upload" ? 0 : S.sample }))));
  async function share() {
    const url = location.origin + location.pathname + "#m=" + encode();
    history.replaceState(null, "", "#m=" + encode());
    try {
      await navigator.clipboard.writeText(url);
      flash(upload ? "Share link copied · settings only, not your screenshot" : "Share link copied");
    } catch {
      flash("Link is in the address bar");
    }
  }
  function loadHash() {
    if (!location.hash.startsWith("#m=")) return;
    try {
      const v = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3)))));
      if (v && typeof v === "object") S = { ...structuredClone(DEFAULT), ...v };
      if (S.sample === "upload") S.sample = 0;
    } catch {}
  }

  loadHash();
  renderSources();
  renderPresets();
  update();
  // re-render once web fonts are ready so canvas text uses them
  document.fonts?.ready.then(() => {
    renderPresets();
    paint();
  });
})();
