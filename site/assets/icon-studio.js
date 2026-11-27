/* NiceUI Icon Studio — search, tune and export Lucide icons (ISC) as dependency-free code.
   Plain JavaScript, no dependencies. */
(() => {
  const root = document.querySelector("[data-is]");
  if (!root) return;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => [...r.querySelectorAll(s)];

  const S = { size: 24, stroke: 2, abs: false, color: "#7dd3fc", current: false, bg: "dark", tab: "svg", multi: false, q: "", cat: "all", sel: "sparkles" };
  const set = new Set();
  let ICONS = [];
  let byName = new Map();
  let list = [];
  let focusIdx = 0;

  /* ── search helpers ─────────────────────────────────────── */
  const SYN = {
    delete: ["trash", "x", "eraser"], remove: ["trash", "minus", "x"], close: ["x", "circle-x"], add: ["plus"], new: ["plus", "file-plus"],
    settings: ["settings", "cog", "sliders"], config: ["settings", "cog", "sliders"], gear: ["settings", "cog"], user: ["user", "circle-user"], person: ["user", "users"],
    profile: ["user", "circle-user", "contact"], home: ["house"], edit: ["pencil", "pen", "square-pen"], write: ["pencil", "pen", "notebook-pen"],
    like: ["thumbs-up", "heart"], love: ["heart"], favourite: ["star", "heart"], favorite: ["star", "heart"], warning: ["triangle-alert", "circle-alert"],
    error: ["circle-x", "octagon-alert", "circle-alert"], success: ["check", "circle-check"], done: ["check", "circle-check"], info: ["info"], help: ["circle-help", "life-buoy"],
    email: ["mail"], message: ["message", "messages"], chat: ["message", "messages", "bot"], comment: ["message"], money: ["dollar", "wallet", "banknote", "coins", "piggy"],
    payment: ["credit-card", "wallet", "receipt"], time: ["clock", "timer", "hourglass"], date: ["calendar"], location: ["map-pin", "map", "navigation"], place: ["map-pin"],
    photo: ["image", "camera"], picture: ["image"], video: ["video", "film", "clapperboard"], music: ["music", "headphones", "disc"], sound: ["volume", "speaker", "audio"],
    ai: ["sparkles", "bot", "brain", "wand"], magic: ["sparkles", "wand"], code: ["code", "terminal", "braces"], dev: ["code", "terminal", "git", "bug"], menu: ["menu", "ellipsis", "grip"],
    more: ["ellipsis"], logout: ["log-out"], login: ["log-in"], signout: ["log-out"], signin: ["log-in"], cart: ["shopping-cart", "shopping-bag", "shopping-basket"],
    shop: ["store", "shopping"], phone: ["phone", "smartphone"], mobile: ["smartphone", "tablet"], lock: ["lock", "shield"], security: ["shield", "lock", "key", "fingerprint"],
    password: ["key", "lock"], chart: ["chart"], graph: ["chart", "trending"], stats: ["chart", "activity"], analytics: ["chart", "activity", "gauge"], share: ["share", "send", "forward"],
    notification: ["bell"], alert: ["bell", "triangle-alert", "siren"], save: ["save", "bookmark", "download"], link: ["link", "external-link"], external: ["external-link", "square-arrow-out-up-right"],
    copy: ["copy", "clipboard"], paste: ["clipboard"], filter: ["filter", "list-filter", "sliders"], sort: ["arrow-up-down", "list-ordered", "sort"], refresh: ["refresh", "rotate", "repeat"],
    dark: ["moon"], light: ["sun"], theme: ["sun", "moon", "palette"], colour: ["palette", "paintbrush", "pipette"], color: ["palette", "paintbrush", "pipette"], weather: ["sun", "cloud", "snowflake", "wind"],
    car: ["car"], travel: ["plane", "luggage", "map"], food: ["utensils", "pizza", "coffee", "apple"], health: ["heart-pulse", "stethoscope", "pill", "activity"], calendar: ["calendar"],
  };
  const CATS = [
    ["arrows", "Arrows", /^(arrow|chevron|move|corner|redo|undo|refresh|rotate|repeat|iteration|navigation|send-to-back)/],
    ["ui", "Interface", /^(menu|ellipsis|grip|panel|layout|sidebar|toggle|sliders|settings|search|x$|plus|minus|check|circle-check|square-check|filter|list|grid|columns|rows|maximize|minimize|expand|shrink|eye|lock|unlock|loader|log-|power)/],
    ["files", "Files", /^(file|folder|files|archive|clipboard|book|notebook|sticky-note|paperclip|save)/],
    ["media", "Media", /^(play|pause|music|video|film|camera|image|images|mic|volume|headphones|radio|tv|podcast|disc|clapperboard|speaker|audio|skip|rewind|fast-forward|repeat|shuffle|cast)/],
    ["comms", "Communication", /^(mail|message|phone|send|at-sign|inbox|reply|forward|bell|megaphone|contact|voicemail|rss|share)/],
    ["devices", "Devices", /^(monitor|laptop|smartphone|tablet|keyboard|mouse|printer|cpu|hard-drive|server|battery|watch|gamepad|webcam|usb|router|wifi|bluetooth|plug|cable|headset|projector)/],
    ["dev", "Development", /^(code|terminal|braces|brackets|bug|git|github|gitlab|database|binary|regex|variable|square-code|file-code|webhook|blocks|component|workflow|container|cloud-cog|bot)/],
    ["commerce", "Commerce", /^(shopping|wallet|credit-card|dollar|euro|pound|banknote|coins|receipt|store|tag|percent|piggy|badge-dollar|gift|package|truck|barcode|qr-code)/],
    ["charts", "Charts", /^(chart|trending|activity|gauge|signal|sigma|calculator|presentation)/],
    ["text", "Text", /^(text|type|bold|italic|underline|align|heading|list-|pilcrow|quote|strikethrough|baseline|wrap-text|letter|case|spell|languages|subscript|superscript)/],
    ["people", "People", /^(user|users|person|baby|accessibility|hand|smile|frown|meh|laugh|angry|annoyed|contact|ear|eye|brain|heart)/],
    ["weather", "Weather & nature", /^(sun|moon|cloud|snow|wind|umbrella|thermometer|rainbow|tornado|droplet|haze|zap|leaf|tree|flower|sprout|mountain|waves|flame|sparkle|star)/],
    ["maps", "Maps & travel", /^(map|globe|compass|navigation|landmark|earth|tent|plane|car|bus|train|ship|bike|luggage|hotel|building|house|home|castle|church|school|hospital|factory)/],
    ["shapes", "Shapes", /^(circle|square|triangle|hexagon|octagon|pentagon|diamond|shapes|cone|cylinder|box|cuboid|torus|spline)$|^(circle-dashed|square-dashed|circle-dot|square-dot)/],
  ];
  const catOf = (n) => (CATS.find(([, , rx]) => rx.test(n)) || [])[0] || "other";
  const pascal = (n) => {
    const p = n.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
    return /^\d/.test(p) ? "Icon" + p : p;
  };

  function score(icon, q) {
    if (!q) return 1;
    const n = icon.n;
    let total = 0;
    for (const t of q.split(/\s+/).filter(Boolean)) {
      let best = 0;
      const words = n.split("-");
      const syn = SYN[t] && SYN[t].some((x) => n === x || n.startsWith(x + "-") || ("-" + n + "-").includes("-" + x + "-"));
      if (n === t) best = 100;
      else if (n.startsWith(t)) best = t.length <= 2 ? 40 : 80;
      else if (syn) best = 70;
      else if (words.some((w) => w.startsWith(t))) best = t.length <= 2 ? 35 : 65;
      else if (n.includes(t)) best = t.length <= 2 ? 5 : 50;
      else {
        // subsequence fuzzy match ("srch" → search)
        let i = 0;
        for (const ch of n) if (ch === t[i]) i++;
        if (i === t.length && t.length >= 3) best = 20;
      }
      if (!best) return 0;
      total += best;
    }
    return total - n.length * 0.05;
  }

  /* ── rendering helpers ──────────────────────────────────── */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const attrs = (a) => Object.entries(a).map(([k, v]) => `${k}="${esc(v)}"`).join(" ");
  const inner = (node) => node.map(([t, a]) => `<${t} ${attrs(a)}/>`).join("");
  const strokeW = () => (S.abs ? +((S.stroke * 24) / S.size).toFixed(3) : S.stroke);
  const colourVal = (forceHex) => (S.current && !forceHex ? "currentColor" : S.color);
  const svgMarkup = (icon, { forceHex = false, pretty = true, cls = "" } = {}) => {
    const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${S.size}" height="${S.size}" viewBox="0 0 24 24" fill="none" stroke="${colourVal(forceHex)}" stroke-width="${strokeW()}" stroke-linecap="round" stroke-linejoin="round"${cls}>`;
    const kids = icon.node.map(([t, a]) => `<${t} ${attrs(a)}/>`);
    return pretty ? `${open}\n  ${kids.join("\n  ")}\n</svg>` : open + kids.join("") + "</svg>";
  };
  const camel = (k) => k.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const jsxKids = (icon, pad) => icon.node.map(([t, a]) => `${pad}<${t} ${Object.entries(a).map(([k, v]) => `${camel(k)}="${esc(v)}"`).join(" ")} />`).join("\n");
  const reactComponent = (icon) => {
    const name = pascal(icon.n) + "Icon";
    return `export function ${name}({ size = ${S.size}, strokeWidth = ${strokeW()}, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="${colourVal()}" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
${jsxKids(icon, "      ")}
    </svg>
  );
}`;
  };
  const reactFile = (icons) => `// ${icons.length === 1 ? `Lucide "${icons[0].n}" icon` : `${icons.length} Lucide icons`} (ISC licence, lucide.dev) via NiceUI Icon Studio. No dependencies.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

${icons.map(reactComponent).join("\n\n")}
`;
  const dataUri = (icon) => `data:image/svg+xml,${encodeURIComponent(svgMarkup(icon, { forceHex: true, pretty: false })).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")}`;

  /* ── grid ───────────────────────────────────────────────── */
  const grid = $("[data-is-grid]");
  const scroller = $("[data-is-scroll]");
  const CHUNK = 240;
  let rendered = 0;
  const cell = (ic, i) =>
    `<button type="button" class="is-cell${ic.n === S.sel ? " on" : ""}${set.has(ic.n) ? " picked" : ""}" role="option" aria-selected="${ic.n === S.sel}" data-n="${ic.n}" data-i="${i}" tabindex="${i === focusIdx ? 0 : -1}" title="${ic.n}"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner(ic.node)}</svg><span>${ic.n}</span></button>`;
  function renderMore() {
    if (rendered >= list.length) return;
    const next = list.slice(rendered, rendered + CHUNK);
    grid.insertAdjacentHTML("beforeend", next.map((ic, k) => cell(ic, rendered + k)).join(""));
    rendered += next.length;
  }
  function renderGrid() {
    grid.innerHTML = "";
    rendered = 0;
    focusIdx = Math.max(0, list.findIndex((ic) => ic.n === S.sel));
    if (focusIdx >= CHUNK) focusIdx = 0;
    renderMore();
    $("[data-is-empty]").hidden = list.length > 0;
    $("[data-is-count]").textContent = `${list.length.toLocaleString()} of ${ICONS.length.toLocaleString()} icons`;
  }
  scroller.addEventListener(
    "scroll",
    () => {
      if (scroller.scrollTop + scroller.clientHeight > scroller.scrollHeight - 600) renderMore();
    },
    { passive: true }
  );
  // page-level scrolling on phones (the grid grows with the page)
  addEventListener(
    "scroll",
    () => {
      const r = grid.getBoundingClientRect();
      if (r.bottom < innerHeight + 800) renderMore();
    },
    { passive: true }
  );

  function filter() {
    const q = S.q.trim().toLowerCase();
    const base = S.cat === "all" ? ICONS : ICONS.filter((ic) => ic.cat === S.cat);
    if (!q) list = base;
    else
      list = base
        .map((ic) => [ic, score(ic, q)])
        .filter(([, s]) => s > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([ic]) => ic);
    renderGrid();
  }

  function renderCats() {
    const counts = {};
    ICONS.forEach((ic) => (counts[ic.cat] = (counts[ic.cat] || 0) + 1));
    $("[data-is-cats]").innerHTML = [["all", "All", ICONS.length], ...CATS.map(([id, label]) => [id, label, counts[id] || 0]), ["other", "Other", counts.other || 0]]
      .filter(([, , n]) => n)
      .map(([id, label, n]) => `<button type="button" data-is-cat="${id}" aria-pressed="${S.cat === id}">${label}<i>${n}</i></button>`)
      .join("");
  }

  /* ── panel ──────────────────────────────────────────────── */
  const out = $("[data-is-out]");
  function current() {
    return byName.get(S.sel) || ICONS[0];
  }
  function code() {
    const ic = current();
    if (S.tab === "svg") return svgMarkup(ic);
    if (S.tab === "react") return reactFile([ic]);
    if (S.tab === "uri") return dataUri(ic);
    if (S.tab === "tw") return `<span class="inline-block h-[${S.size}px] w-[${S.size}px] bg-[url('${dataUri(ic)}')] bg-contain bg-center bg-no-repeat" aria-hidden="true"></span>`;
    return `<!-- Lucide "${ic.n}" icon (ISC, lucide.dev) -->\n${svgMarkup(ic, { cls: ' class="icon" aria-hidden="true"' })}`;
  }
  function renderPanel() {
    const ic = current();
    if (!ic) return;
    const zoom = Math.max(1, Math.min(6, Math.floor(150 / S.size)));
    const big = $("[data-is-big]");
    big.innerHTML = svgMarkup(ic, { pretty: false });
    const svg = big.firstChild;
    svg.setAttribute("width", S.size * zoom);
    svg.setAttribute("height", S.size * zoom);
    if (S.current) svg.style.color = S.bg === "light" ? "#0b0c0e" : "#f3f4f6";
    $("[data-is-name]").textContent = pascal(ic.n);
    $("[data-is-tagline]").textContent = `${ic.n} · ${S.size}px${zoom > 1 ? ` · shown ×${zoom}` : ""}`;
    $("[data-is-stage]").dataset.bg = S.bg;
    $$("[data-is-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.isTab === S.tab)));
    out.textContent = code();
    // outputs + toggles
    $('[data-is-out="size"]').textContent = S.size + "px";
    $('[data-is-out="stroke"]').textContent = S.stroke;
    $("[data-is-size]").value = S.size;
    $("[data-is-stroke]").value = S.stroke;
    $("[data-is-abs]").checked = S.abs;
    $("[data-is-color]").value = S.color;
    $("[data-is-current]").setAttribute("aria-pressed", String(S.current));
    $("[data-is-multi]").checked = S.multi;
    $$("[data-is-bg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.isBg === S.bg)));
    root.style.setProperty("--is-sw", String(S.stroke));
    root.style.setProperty("--is-ic", S.current ? "currentColor" : S.color);
    // selection chips
    const sel = $("[data-is-sel]");
    sel.innerHTML = set.size
      ? [...set].map((n) => `<button type="button" class="is-chip" data-is-unpick="${n}" title="Remove ${n}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner(byName.get(n).node)}</svg>${n}<b aria-hidden="true">×</b></button>`).join("")
      : `<p class="is-muted">Shift-click icons (or turn on Select mode) to build a set.</p>`;
    $("[data-is-copyset]").disabled = !set.size;
    $("[data-is-copyset]").textContent = set.size ? `Copy ${set.size} as React` : "Copy set as React";
    $("[data-is-clear]").disabled = !set.size;
    saveHash();
  }
  function markSel() {
    $$(".is-cell.on", grid).forEach((c) => {
      c.classList.remove("on");
      c.setAttribute("aria-selected", "false");
    });
    const c = grid.querySelector(`[data-n="${S.sel}"]`);
    if (c) {
      c.classList.add("on");
      c.setAttribute("aria-selected", "true");
    }
  }

  /* ── feedback + copy ────────────────────────────────────── */
  const toastEl = document.querySelector("[data-toast]");
  const flash = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1500);
  };
  const copy = async (text, msg) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      flash("Copy failed — select the code and copy it");
    }
  };

  /* ── interactions ───────────────────────────────────────── */
  function choose(n, { copySvg = false, toggle = false } = {}) {
    const ic = byName.get(n);
    if (!ic) return;
    if (toggle) {
      set.has(n) ? set.delete(n) : set.add(n);
      grid.querySelector(`[data-n="${n}"]`)?.classList.toggle("picked", set.has(n));
    }
    S.sel = n;
    markSel();
    renderPanel();
    if (copySvg) copy(svgMarkup(ic), `${pascal(n)} SVG copied`);
  }
  grid.addEventListener("click", (e) => {
    const c = e.target.closest(".is-cell");
    if (!c) return;
    focusIdx = +c.dataset.i;
    setRoving();
    const toggle = e.shiftKey || e.metaKey || e.ctrlKey || S.multi;
    choose(c.dataset.n, { copySvg: !toggle, toggle });
  });
  function cols() {
    const t = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    return Math.max(1, t);
  }
  function setRoving() {
    $$(".is-cell[tabindex='0']", grid).forEach((c) => (c.tabIndex = -1));
    const c = grid.querySelector(`[data-i="${focusIdx}"]`);
    if (c) c.tabIndex = 0;
    return c;
  }
  grid.addEventListener("keydown", (e) => {
    const k = e.key;
    const n = cols();
    let next = focusIdx;
    if (k === "ArrowRight") next++;
    else if (k === "ArrowLeft") next--;
    else if (k === "ArrowDown") next += n;
    else if (k === "ArrowUp") next -= n;
    else if (k === "Home") next = 0;
    else if (k === "End") next = list.length - 1;
    else if (k === "Enter" || k === " ") {
      e.preventDefault();
      const ic = list[focusIdx];
      if (ic) choose(ic.n, { copySvg: !e.shiftKey && !S.multi, toggle: e.shiftKey || S.multi });
      return;
    } else return;
    e.preventDefault();
    next = Math.max(0, Math.min(list.length - 1, next));
    while (next >= rendered && rendered < list.length) renderMore();
    focusIdx = next;
    const c = setRoving();
    if (c) {
      c.focus({ preventScroll: true });
      c.scrollIntoView({ block: "nearest" });
      choose(c.dataset.n);
    }
  });
  grid.addEventListener("focus", (e) => {
    if (e.target === grid) setRoving()?.focus();
  });

  const q = $("[data-is-q]");
  let qt = 0;
  q.addEventListener("input", () => {
    clearTimeout(qt);
    qt = setTimeout(() => {
      S.q = q.value;
      filter();
    }, 60);
  });
  q.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      focusIdx = 0;
      const c = setRoving();
      if (c) {
        c.focus();
        choose(c.dataset.n, { copySvg: e.key === "Enter" });
      }
    }
    if (e.key === "Escape" && q.value) {
      q.value = "";
      S.q = "";
      filter();
    }
  });
  // "/" focuses the icon search here (instead of the site search)
  addEventListener(
    "keydown",
    (e) => {
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        q.focus();
        q.select();
      }
    },
    true
  );

  root.addEventListener("click", (e) => {
    const cat = e.target.closest("[data-is-cat]");
    if (cat) {
      S.cat = cat.dataset.isCat;
      $$("[data-is-cat]").forEach((b) => b.setAttribute("aria-pressed", String(b === cat)));
      filter();
      scroller.scrollTop = 0;
    }
    const bg = e.target.closest("[data-is-bg]");
    if (bg) {
      S.bg = bg.dataset.isBg;
      renderPanel();
    }
    const tab = e.target.closest("[data-is-tab]");
    if (tab) {
      S.tab = tab.dataset.isTab;
      renderPanel();
    }
    if (e.target.closest("[data-is-current]")) {
      S.current = !S.current;
      renderPanel();
    }
    if (e.target.closest("[data-is-copy]")) {
      const labels = { svg: "SVG", react: "React component", uri: "Data URI", tw: "Tailwind class", html: "HTML" };
      copy(code(), `${pascal(current().n)} ${labels[S.tab]} copied`);
    }
    const dl = e.target.closest("[data-is-dl]");
    if (dl) download(dl.dataset.isDl);
    if (e.target.closest("[data-is-share]")) {
      saveHash(true);
      copy(location.href, "Share link copied");
    }
    const un = e.target.closest("[data-is-unpick]");
    if (un) {
      set.delete(un.dataset.isUnpick);
      grid.querySelector(`[data-n="${un.dataset.isUnpick}"]`)?.classList.remove("picked");
      renderPanel();
    }
    if (e.target.closest("[data-is-copyset]") && set.size) copy(reactFile([...set].map((n) => byName.get(n))), `${set.size} React icons copied in one file`);
    if (e.target.closest("[data-is-clear]")) {
      set.clear();
      $$(".is-cell.picked", grid).forEach((c) => c.classList.remove("picked"));
      renderPanel();
    }
  });
  const onRange = (attr, key, cast) => {
    const el = $(`[data-is-${attr}]`);
    el.addEventListener("input", () => {
      S[key] = cast(el.value);
      renderPanel();
    });
  };
  onRange("size", "size", (v) => Math.round(+v));
  onRange("stroke", "stroke", (v) => +v);
  $("[data-is-abs]").addEventListener("change", (e) => {
    S.abs = e.target.checked;
    renderPanel();
  });
  $("[data-is-color]").addEventListener("input", (e) => {
    S.color = e.target.value;
    S.current = false;
    renderPanel();
  });
  $("[data-is-multi]").addEventListener("change", (e) => {
    S.multi = e.target.checked;
    root.classList.toggle("is-multi", S.multi);
  });

  /* downloads */
  function download(kind) {
    const ic = current();
    const name = `${ic.n}.${kind}`;
    const save = (href) => {
      const a = document.createElement("a");
      a.href = href;
      a.download = name;
      a.click();
    };
    if (kind === "svg") {
      const url = URL.createObjectURL(new Blob([svgMarkup(ic, { forceHex: true })], { type: "image/svg+xml" }));
      save(url);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      flash(`${name} downloaded`);
      return;
    }
    const px = Math.max(256, S.size * 8);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = px;
      c.getContext("2d").drawImage(img, 0, 0, px, px);
      save(c.toDataURL("image/png"));
      flash(`${name} downloaded · ${px}×${px}`);
    };
    img.src = dataUri(ic);
  }

  /* share: settings + selected icon in the URL hash */
  let ht = 0;
  function saveHash(now) {
    const write = () => {
      const p = new URLSearchParams({ i: S.sel, s: S.size, w: S.stroke, c: S.color.slice(1), a: S.abs ? 1 : 0, cc: S.current ? 1 : 0, b: S.bg });
      history.replaceState(null, "", "#" + p.toString());
    };
    clearTimeout(ht);
    if (now) write();
    else ht = setTimeout(write, 300);
  }
  function loadHash() {
    try {
      const p = new URLSearchParams(location.hash.slice(1));
      if (p.get("i")) S.sel = p.get("i");
      if (p.get("s")) S.size = Math.max(12, Math.min(96, +p.get("s") || 24));
      if (p.get("w")) S.stroke = Math.max(0.5, Math.min(3, +p.get("w") || 2));
      if (/^[0-9a-f]{6}$/i.test(p.get("c") || "")) S.color = "#" + p.get("c");
      S.abs = p.get("a") === "1";
      S.current = p.get("cc") === "1";
      if (["dark", "light", "brand", "grid"].includes(p.get("b"))) S.bg = p.get("b");
    } catch {}
  }

  /* ── boot ───────────────────────────────────────────────── */
  loadHash();
  fetch("/apps/icon-studio-icons.json")
    .then((r) => r.json())
    .catch(() => fetch("apps/icon-studio-icons.json").then((r) => r.json()))
    .then((data) => {
      ICONS = data.map(([n, node]) => ({ n, node, cat: catOf(n) }));
      byName = new Map(ICONS.map((ic) => [ic.n, ic]));
      if (!byName.has(S.sel)) S.sel = byName.has("sparkles") ? "sparkles" : ICONS[0].n;
      renderCats();
      filter();
      renderPanel();
    })
    .catch(() => {
      $("[data-is-count]").textContent = "Couldn't load icons. Refresh to try again.";
    });
})();
