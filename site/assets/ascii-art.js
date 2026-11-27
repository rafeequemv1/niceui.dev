/* NiceUI ASCII Art Generator — images, video and webcam to text art. Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-aa]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const SETS = {
    classic: " .:-=+*#%@",
    detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    blocks: " ░▒▓█",
    binary: " 01",
    dots: " ·•●",
    lines: " -=≡▬",
  };
  const DEFAULT = { set: "classic", custom: " .oO@", cols: 120, edges: false, dither: false, invert: false, brightness: 0, contrast: 20, gamma: 100, color: "mono", fg: "#e5e7eb", fg2: "#1e3a8a", bg: "#09090b", bgOn: true, sat: 120, size: 10, scale: "2" };
  let S = { ...DEFAULT };
  const PRESETS = [
    ["Terminal", { set: "classic", color: "mono", fg: "#4ade80", bg: "#030a05", bgOn: true, contrast: 30, invert: false }],
    ["Original", { set: "detailed", color: "original", bg: "#000000", bgOn: true, sat: 130, contrast: 20 }],
    ["Blocks", { set: "blocks", color: "original", bg: "#000000", bgOn: true, sat: 120, cols: 100 }],
    ["Braille", { set: "braille", color: "mono", fg: "#f4f4f5", bg: "#09090b", bgOn: true, cols: 140, dither: true, contrast: 25 }],
    ["Newsprint", { set: "detailed", color: "mono", fg: "#111111", bg: "#f5f1e8", bgOn: true, invert: true, dither: false, contrast: 25 }],
    ["Neon duo", { set: "detailed", color: "duotone", fg: "#f472b6", fg2: "#1e1b4b", bg: "#05010f", bgOn: true, contrast: 30 }],
    ["Matrix", { set: "binary", color: "mono", fg: "#22c55e", bg: "#000000", bgOn: true, cols: 110, contrast: 35 }],
    ["Blueprint", { set: "classic", edges: true, color: "mono", fg: "#7dd3fc", bg: "#0b1e3a", bgOn: true, contrast: 20 }],
  ];
  const SAMPLES = [
    ["Dunes", "/assets/shader-samples/dunes.jpg"],
    ["Sphere", "/assets/shader-samples/sphere.jpg"],
    ["Rings", "/assets/shader-samples/rings.jpg"],
    ["Website", "/assets/device-samples/desktop-home.jpg"],
    ["Star", "/assets/shader-samples/logo-star.png"],
  ];

  /* ── source ────────────────────────────────────────────── */
  const video = $("[data-aa-video]");
  let source = null; // HTMLImageElement | HTMLVideoElement
  let live = false; // video or webcam
  let stream = null;
  let sourceUrl = "";
  const srcSize = () => (source instanceof HTMLVideoElement ? [source.videoWidth, source.videoHeight] : [source.naturalWidth, source.naturalHeight]);
  function stopLive() {
    live = false;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    video.pause();
    video.removeAttribute("src");
    video.srcObject = null;
    $("[data-aa-cam]").textContent = "● Webcam";
    $("[data-aa-rec]").hidden = true;
    stopRec();
  }
  function useImage(url, label = "") {
    stopLive();
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      source = im;
      sourceUrl = url.startsWith("blob:") ? "" : url;
      render();
      $$("[data-aa-sample]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.aaSample === url)));
    };
    im.onerror = () => flash("Could not open that image");
    im.src = url;
    if (label) flash(label);
  }
  function useVideo(url) {
    stopLive();
    video.srcObject = null;
    video.src = url;
    video.onloadeddata = () => {
      source = video;
      live = true;
      sourceUrl = "";
      $("[data-aa-rec]").hidden = false;
      video.play();
      loop();
    };
  }
  async function toggleCam() {
    if (stream) {
      stopLive();
      if (!(source instanceof HTMLImageElement)) useImage(SAMPLES[0][1]);
      return;
    }
    try {
      stopLive();
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      video.srcObject = stream;
      await video.play();
      source = video;
      live = true;
      sourceUrl = "";
      $("[data-aa-cam]").textContent = "■ Stop webcam";
      $("[data-aa-rec]").hidden = false;
      $$("[data-aa-sample]").forEach((b) => b.setAttribute("aria-pressed", "false"));
      loop();
    } catch {
      flash("Camera not available or permission denied");
    }
  }
  function loop() {
    if (!live) return;
    render();
    requestAnimationFrame(loop);
  }
  function addFile(f) {
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (f.type.startsWith("video/")) useVideo(url);
    else if (f.type.startsWith("image/")) useImage(url);
    else flash("Use an image or a video file");
  }

  /* ── conversion ────────────────────────────────────────── */
  const sample = document.createElement("canvas");
  const sctx = sample.getContext("2d", { willReadFrequently: true });
  const out = $("[data-aa-canvas]");
  let grid = null; // { cols, rows, chars: string[], colors: Uint8ClampedArray|null }
  const CHAR_ASPECT = 0.55; // monospace width / line height

  function tone(v) {
    // v 0..1 → brightness, contrast, gamma
    v += S.brightness / 200;
    const c = S.contrast / 100;
    const k = c >= 0 ? 1 + c * 3 : 1 + c;
    v = (v - 0.5) * k + 0.5;
    v = clamp(v, 0, 1);
    v = Math.pow(v, 100 / S.gamma);
    return S.invert ? 1 - v : v;
  }
  function convert() {
    if (!source) return null;
    const [iw, ih] = srcSize();
    if (!iw || !ih) return null;
    const braille = S.set === "braille";
    const cols = S.cols;
    const rows = Math.max(1, Math.round((cols * ih * CHAR_ASPECT) / iw));
    const sw = braille ? cols * 2 : cols, sh = braille ? rows * 4 : rows;
    sample.width = sw;
    sample.height = sh;
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.clearRect(0, 0, sw, sh);
    if (source instanceof HTMLVideoElement && stream) {
      // mirror the webcam like a selfie camera
      sctx.save();
      sctx.translate(sw, 0);
      sctx.scale(-1, 1);
      sctx.drawImage(source, 0, 0, sw, sh);
      sctx.restore();
    } else sctx.drawImage(source, 0, 0, sw, sh);
    const px = sctx.getImageData(0, 0, sw, sh).data;
    const L = new Float32Array(sw * sh);
    for (let i = 0; i < sw * sh; i++) {
      const a = px[i * 4 + 3] / 255;
      const l = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
      // transparent pixels read as the background
      L[i] = tone(l * a + (S.invert ? 1 : 0) * 0 + (1 - a) * (lumOf(S.bgOn ? S.bg : "#000000")));
    }
    const ramp = braille ? null : [...(S.set === "custom" ? S.custom || " #" : SETS[S.set])];
    const chars = new Array(cols * rows);
    if (braille) {
      // binary threshold (optionally dithered) on the 2×4 dot grid
      const B = S.dither ? ditherGrid(L, sw, sh, 2) : L.map((v) => (v > 0.5 ? 1 : 0));
      const bits = [[0, 0, 0x01], [0, 1, 0x02], [0, 2, 0x04], [1, 0, 0x08], [1, 1, 0x10], [1, 2, 0x20], [0, 3, 0x40], [1, 3, 0x80]];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          let code = 0;
          for (const [dx, dy, bit] of bits) if (B[(r * 4 + dy) * sw + c * 2 + dx] >= 0.5) code |= bit;
          chars[r * cols + c] = String.fromCharCode(0x2800 + code);
        }
    } else {
      const n = ramp.length;
      const Q = S.dither ? ditherGrid(L, sw, sh, n) : L;
      let ed = null;
      if (S.edges) ed = sobel(L, sw, sh);
      for (let i = 0; i < cols * rows; i++) {
        if (ed && ed[i]) {
          chars[i] = ed[i];
          continue;
        }
        const v = Q[i];
        chars[i] = ramp[clamp(Math.round(v * (n - 1)), 0, n - 1)];
      }
    }
    // colours per cell (average of the sampled block)
    let colors = null;
    if (S.color === "original") {
      colors = new Uint8ClampedArray(cols * rows * 3);
      const bw = braille ? 2 : 1, bh = braille ? 4 : 1;
      const s = S.sat / 100;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          let R = 0, G = 0, Bc = 0, k = 0;
          for (let y = 0; y < bh; y++)
            for (let x = 0; x < bw; x++) {
              const i = ((r * bh + y) * sw + c * bw + x) * 4;
              R += px[i]; G += px[i + 1]; Bc += px[i + 2]; k++;
            }
          R /= k; G /= k; Bc /= k;
          const g = 0.2126 * R + 0.7152 * G + 0.0722 * Bc;
          const o = (r * cols + c) * 3;
          colors[o] = g + (R - g) * s;
          colors[o + 1] = g + (G - g) * s;
          colors[o + 2] = g + (Bc - g) * s;
        }
    } else if (S.color === "duotone") {
      colors = new Uint8ClampedArray(cols * rows * 3);
      const a = hex(S.fg2), b = hex(S.fg);
      const bw = braille ? 2 : 1, bh = braille ? 4 : 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          let v = 0;
          for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) v += L[(r * bh + y) * sw + c * bw + x];
          v /= bw * bh;
          const t = S.invert ? 1 - v : v;
          const o = (r * cols + c) * 3;
          for (let k = 0; k < 3; k++) colors[o + k] = a[k] + (b[k] - a[k]) * t;
        }
    }
    return { cols, rows, chars, colors };
  }
  // Floyd–Steinberg to n levels, returns values snapped to k/(n-1)
  function ditherGrid(L, w, h, n) {
    const a = Float32Array.from(L);
    const q = n - 1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const old = a[i];
        const nv = Math.round(clamp(old, 0, 1) * q) / q;
        a[i] = nv;
        const e = old - nv;
        if (x + 1 < w) a[i + 1] += (e * 7) / 16;
        if (y + 1 < h) {
          if (x > 0) a[i + w - 1] += (e * 3) / 16;
          a[i + w] += (e * 5) / 16;
          if (x + 1 < w) a[i + w + 1] += e / 16;
        }
      }
    return a;
  }
  // Sobel edges → direction characters where the gradient is strong
  function sobel(L, w, h) {
    const out = new Array(w * h).fill(null);
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const p = (dx, dy) => L[(y + dy) * w + x + dx];
        const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
        const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
        const m = Math.hypot(gx, gy);
        if (m < 0.9) continue;
        let a = (Math.atan2(gy, gx) * 180) / Math.PI;
        if (a < 0) a += 180;
        out[y * w + x] = a < 22.5 || a >= 157.5 ? "|" : a < 67.5 ? "\\" : a < 112.5 ? "_" : "/";
      }
    return out;
  }
  const hex = (h) => {
    const v = parseInt(h.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const lumOf = (h) => {
    const [r, g, b] = hex(h);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };

  /* ── drawing ───────────────────────────────────────────── */
  const FONT = `"aa-mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  function paint(canvas, g, scale) {
    const fs = S.size * scale;
    const lh = fs / (CHAR_ASPECT / 0.6) ; // keep cells close to the sampling aspect
    const ctx = canvas.getContext("2d");
    ctx.font = `${fs}px ${FONT}`;
    const cw = ctx.measureText("M").width;
    const lineH = cw / CHAR_ASPECT;
    canvas.width = Math.max(1, Math.ceil(g.cols * cw));
    canvas.height = Math.max(1, Math.ceil(g.rows * lineH));
    ctx.font = `${fs}px ${FONT}`;
    ctx.textBaseline = "top";
    if (S.bgOn) {
      ctx.fillStyle = S.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else ctx.clearRect(0, 0, canvas.width, canvas.height);
    const yOff = (lineH - fs) / 2;
    if (!g.colors) {
      ctx.fillStyle = S.fg;
      for (let r = 0; r < g.rows; r++) {
        const line = g.chars.slice(r * g.cols, (r + 1) * g.cols).join("");
        // draw per character so widths stay locked to the grid even with fallback glyphs
        for (let c = 0; c < g.cols; c++) {
          const ch = line[c];
          if (ch !== " " && ch !== "⠀") ctx.fillText(ch, c * cw, r * lineH + yOff);
        }
      }
    } else {
      let last = "";
      for (let r = 0; r < g.rows; r++)
        for (let c = 0; c < g.cols; c++) {
          const i = r * g.cols + c;
          const ch = g.chars[i];
          if (ch === " " || ch === "⠀") continue;
          const col = `rgb(${g.colors[i * 3]},${g.colors[i * 3 + 1]},${g.colors[i * 3 + 2]})`;
          if (col !== last) ctx.fillStyle = last = col;
          ctx.fillText(ch, c * cw, r * lineH + yOff);
        }
    }
    void lh;
  }
  let compare = false;
  function render() {
    grid = convert();
    if (!grid) return;
    paint(out, grid, Math.min(2, devicePixelRatio || 1));
    fitCanvas();
    if (compare && source) {
      const ctx = out.getContext("2d");
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, out.width / 2, out.height);
      ctx.clip();
      if (source instanceof HTMLVideoElement && stream) {
        ctx.translate(out.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(source, 0, 0, out.width, out.height);
      } else ctx.drawImage(source, 0, 0, out.width, out.height);
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.fillRect(out.width / 2 - 1, 0, 2, out.height);
    }
    $("[data-aa-meta]").textContent = `${grid.cols} × ${grid.rows} chars`;
  }
  const stage = $("[data-aa-stage]");
  function fitCanvas() {
    const r = stage.getBoundingClientRect();
    const k = Math.min((r.width - 32) / out.width, (r.height - 80) / out.height);
    out.style.width = Math.floor(out.width * k) + "px";
    out.style.height = Math.floor(out.height * k) + "px";
  }
  new ResizeObserver(() => grid && fitCanvas()).observe(stage);

  /* ── export ────────────────────────────────────────────── */
  const text = () => (grid ? Array.from({ length: grid.rows }, (_, r) => grid.chars.slice(r * grid.cols, (r + 1) * grid.cols).join("").replace(/\s+$/, "")).join("\n") : "");
  const toastEl = document.querySelector("[data-toast]");
  function flash(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }
  function dl(name, blob) {
    const a = document.createElement("a");
    a.download = name;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const escH = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function htmlExport() {
    const g = grid;
    const fg = S.fg;
    let body = "";
    for (let r = 0; r < g.rows; r++) {
      let run = "", runCol = "";
      const flush = () => {
        if (!run) return;
        body += runCol ? `<span style="color:${runCol}">${escH(run)}</span>` : escH(run);
        run = "";
      };
      for (let c = 0; c < g.cols; c++) {
        const i = r * g.cols + c;
        let col = "";
        if (g.colors) {
          // quantise so neighbouring characters share a span
          const q = (v) => (v >> 4) * 17;
          col = "#" + [g.colors[i * 3], g.colors[i * 3 + 1], g.colors[i * 3 + 2]].map((v) => q(v).toString(16).padStart(2, "0")).join("");
        }
        if (col !== runCol) {
          flush();
          runCol = col;
        }
        run += g.chars[i];
      }
      flush();
      body += "\n";
    }
    return `<!-- ASCII art made with NiceUI ASCII Art Generator -->
<pre style="margin:0;padding:16px;background:${S.bgOn ? S.bg : "transparent"};color:${fg};font:${S.size}px/${(1 / CHAR_ASPECT) * 0.6}em ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:0;white-space:pre">${body}</pre>`;
  }
  function svgExport() {
    const g = grid;
    const fs = S.size;
    const cw = fs * 0.6, lh = cw / CHAR_ASPECT;
    let rows = "";
    for (let r = 0; r < g.rows; r++) {
      const line = g.chars.slice(r * g.cols, (r + 1) * g.cols).join("");
      rows += `<text x="0" y="${((r + 0.8) * lh).toFixed(1)}" textLength="${(g.cols * cw).toFixed(1)}" lengthAdjust="spacing" xml:space="preserve">${escH(line)}</text>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${(g.cols * cw).toFixed(0)}" height="${(g.rows * lh).toFixed(0)}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="${fs}" fill="${S.color === "mono" ? S.fg : S.fg}">${S.bgOn ? `<rect width="100%" height="100%" fill="${S.bg}"/>` : ""}${rows}</svg>`;
  }
  const reactExport = () => `// ASCII art made with NiceUI ASCII Art Generator. No dependencies.
const ART = ${JSON.stringify(text())};

export function AsciiArt({ className = '' }: { className?: string }) {
  return (
    <pre
      aria-hidden
      className={className}
      style={{ margin: 0, color: '${S.fg}', background: '${S.bgOn ? S.bg : "transparent"}', font: '${S.size}px/1.09 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', whiteSpace: 'pre' }}
    >
      {ART}
    </pre>
  );
}
`;
  async function copy(t, label) {
    try {
      await navigator.clipboard.writeText(t);
      flash(label);
    } catch {
      flash("Copy failed");
    }
  }
  function png() {
    if (!grid) return;
    const c = document.createElement("canvas");
    paint(c, grid, +S.scale);
    c.toBlob((b) => (dl(`ascii-art-${grid.cols}.png`, b), flash(`PNG downloaded · ${c.width} × ${c.height}`)), "image/png");
  }
  // record the live canvas
  let rec = null;
  function stopRec() {
    if (rec && rec.state !== "inactive") rec.stop();
  }
  function toggleRec() {
    const btn = $("[data-aa-rec]");
    if (rec && rec.state === "recording") return stopRec();
    if (!out.captureStream || !window.MediaRecorder) return flash("Recording is not supported in this browser");
    const chunks = [];
    const type = ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
    rec = new MediaRecorder(out.captureStream(30), type ? { mimeType: type, videoBitsPerSecond: 6e6 } : undefined);
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      btn.textContent = "Record";
      btn.classList.remove("rec");
      if (chunks.length) dl(`ascii-video.${(type || "video/webm").includes("mp4") ? "mp4" : "webm"}`, new Blob(chunks, { type: type || "video/webm" }));
    };
    rec.start();
    btn.textContent = "■ Stop";
    btn.classList.add("rec");
    setTimeout(() => stopRec(), 30000);
  }

  /* ── UI ────────────────────────────────────────────────── */
  const fmt = { cols: (v) => String(v), brightness: (v) => String(v), contrast: (v) => String(v), gamma: (v) => (v / 100).toFixed(2), sat: (v) => v + "%", size: (v) => v + "px" };
  function sync() {
    $$("[data-aa-set]").forEach((b) => b.setAttribute("aria-pressed", String(String(S[b.dataset.aaSet]) === b.dataset.aaVal)));
    $$("[data-aa-in]").forEach((el) => {
      const k = el.dataset.aaIn;
      if (el.type === "checkbox") el.checked = !!S[k];
      else el.value = S[k];
    });
    $$("[data-aa-out]").forEach((o) => (o.textContent = fmt[o.dataset.aaOut](S[o.dataset.aaOut])));
    $$("[data-aa-text]").forEach((el) => document.activeElement !== el && (el.value = S[el.dataset.aaText]));
    $$("[data-aa-only]").forEach((el) => {
      const keys = el.dataset.aaOnly.split(" ");
      el.hidden = !keys.includes(S.color) && !keys.includes(S.set);
    });
    $("[data-aa-fglabel]").textContent = S.color === "duotone" ? "Highlights" : "Text";
    $$("[data-aa-preset]").forEach((b) => {
      const p = PRESETS[+b.dataset.aaPreset][1];
      b.setAttribute("aria-pressed", String(Object.entries(p).every(([k, v]) => S[k] === v)));
    });
  }
  let saveT = 0;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => history.replaceState(null, "", "#a=" + btoa(unescape(encodeURIComponent(JSON.stringify({ ...S, src: sourceUrl }))))), 400);
  }
  const update = () => {
    sync();
    if (!live) render();
    save();
  };
  root.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.aaText) {
      S[t.dataset.aaText] = t.value;
      return update();
    }
    const k = t.dataset.aaIn;
    if (!k) return;
    S[k] = t.type === "checkbox" ? t.checked : t.type === "color" ? t.value : +t.value;
    update();
  });
  root.addEventListener("click", (e) => {
    const t = e.target;
    const set = t.closest("[data-aa-set]");
    if (set) {
      S[set.dataset.aaSet] = set.dataset.aaVal;
      return update();
    }
    const pr = t.closest("[data-aa-preset]");
    if (pr) {
      S = { ...DEFAULT, cols: S.cols, size: S.size, scale: S.scale, ...PRESETS[+pr.dataset.aaPreset][1] };
      return update();
    }
    const sm = t.closest("[data-aa-sample]");
    if (sm) return useImage(sm.dataset.aaSample);
    if (t.closest("[data-aa-reset]")) {
      S = { ...DEFAULT };
      return update();
    }
    if (t.closest("[data-aa-cam]")) return toggleCam();
    if (t.closest("[data-aa-rec]")) return toggleRec();
    if (t.closest("[data-aa-compare]")) {
      compare = !compare;
      t.closest("[data-aa-compare]").setAttribute("aria-pressed", String(compare));
      return render();
    }
    if (t.closest("[data-aa-png]")) return png();
    if (t.closest("[data-aa-copy]")) return copy(text(), `Copied ${grid ? grid.rows : 0} lines of text`);
    const more = t.closest("[data-aa-more]");
    const menu = $("[data-aa-menu]");
    if (more) {
      menu.hidden = !menu.hidden;
      more.setAttribute("aria-expanded", String(!menu.hidden));
      return;
    }
    const d = t.closest("[data-aa-dl]");
    if (d) {
      menu.hidden = true;
      const k = d.dataset.aaDl;
      if (!grid) return;
      if (k === "txt") return dl("ascii-art.txt", new Blob([text()], { type: "text/plain;charset=utf-8" }));
      if (k === "html") return dl("ascii-art.html", new Blob([`<!doctype html><meta charset="utf-8"><title>ASCII art</title><body style="margin:0;background:${S.bgOn ? S.bg : "#fff"}">${htmlExport()}</body>`], { type: "text/html" }));
      if (k === "svg") return dl("ascii-art.svg", new Blob([svgExport()], { type: "image/svg+xml" }));
      if (k === "react") return copy(reactExport(), "Copied React component");
      if (k === "share") {
        save();
        return setTimeout(() => copy(location.href, sourceUrl ? "Share link copied" : "Link copied (your own image is not included)"), 450);
      }
    }
  });
  $("[data-aa-file]").addEventListener("change", (e) => {
    addFile(e.target.files?.[0]);
    e.target.value = "";
  });
  addEventListener("paste", (e) => {
    const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/") || x.type.startsWith("video/"));
    if (f) {
      e.preventDefault();
      addFile(f);
    }
  });
  const drop = $("[data-aa-drop]");
  stage.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.hidden = false;
  });
  stage.addEventListener("dragleave", (e) => !stage.contains(e.relatedTarget) && (drop.hidden = true));
  stage.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.hidden = true;
    addFile(e.dataTransfer?.files?.[0]);
  });

  /* ── boot ──────────────────────────────────────────────── */
  const st = document.createElement("style");
  st.textContent = `@font-face{font-family:"aa-mono";src:url(/assets/logo-fonts/jetbrains-mono-400.woff) format("woff");font-display:swap}`;
  document.head.appendChild(st);
  $("[data-aa-presets]").innerHTML = PRESETS.map(([n, p], i) => `<button type="button" class="aa-preset" data-aa-preset="${i}" aria-pressed="false" style="--pf:${p.color === "original" ? "#f472b6" : p.fg};--pb:${p.bg}"><span aria-hidden="true">${p.set === "braille" ? "⣿⣷⣦" : p.set === "blocks" ? "▓▒░" : p.set === "binary" ? "101" : "@#+"}</span><b>${n}</b></button>`).join("");
  $("[data-aa-samples]").innerHTML = SAMPLES.map(([n, u]) => `<button type="button" class="aa-sample" data-aa-sample="${u}" aria-pressed="false" title="${n}"><img src="${u}" alt="${n} sample" loading="lazy" /></button>`).join("");
  let start = SAMPLES[0][1];
  try {
    if (location.hash.startsWith("#a=")) {
      const v = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3)))));
      const { src, ...rest } = v;
      S = { ...DEFAULT, ...rest };
      if (src && /^\/assets\//.test(src)) start = src;
    }
  } catch {}
  sync();
  (document.fonts ? document.fonts.load(`10px "aa-mono"`).catch(() => {}) : Promise.resolve()).then(() => useImage(start));
})();
