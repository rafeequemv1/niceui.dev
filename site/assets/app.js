(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── toast + copy ─────────────────────────────────────────
  const toastEl = $("[data-toast]");
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1500);
  };
  const pageData = (() => {
    try {
      return JSON.parse($("#page-data")?.textContent || "{}");
    } catch {
      return {};
    }
  })();
  const copy = async (text, btn, label = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(text);
      toast(label);
      if (btn) {
        btn.classList.add("ok");
        setTimeout(() => btn.classList.remove("ok"), 1200);
      }
    } catch {
      toast("Copy failed — select and copy manually");
    }
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy],[data-copy-key]");
    if (!b) return;
    const key = b.dataset.copyKey;
    copy(key ? pageData[key] || "" : b.dataset.copy, b, key === "prompt" ? "Prompt copied — paste it into your AI assistant" : undefined);
  });

  // ── mobile sidebar ───────────────────────────────────────
  const setMenu = (open) => document.body.classList.toggle("sb-open", open);
  $("[data-menu]")?.addEventListener("click", () => setMenu(!document.body.classList.contains("sb-open")));
  $("[data-menu-close]")?.addEventListener("click", () => setMenu(false));
  // Remember which sidebar categories are open (per visitor, best effort).
  $$(".sb-cat").forEach((d) => {
    const key = "niceui-cat-" + d.dataset.cat;
    try {
      if (!d.open && localStorage.getItem(key) === "1") d.open = true;
    } catch {}
    d.addEventListener("toggle", () => {
      try {
        localStorage.setItem(key, d.open ? "1" : "0");
      } catch {}
    });
  });
  $(".sb .on")?.scrollIntoView({ block: "center" });

  // ── search palette ───────────────────────────────────────
  if ($("#search-data")) {
  const data = JSON.parse($("#search-data").textContent);
  const modal = $("[data-search]");
  const input = $("[data-search-input]");
  const list = $("[data-search-list]");
  const kindLabel = { component: "Component", block: "Block", template: "Template", ai: "AI agent", crm: "CRM", gallery: "Gallery", effect: "Effect", marketing: "Marketing section", landing: "Landing page", dashboard: "Dashboard" };
  let results = [];
  let active = 0;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    results = data
      .filter((d) => !q || (d.n + " " + d.c + " " + d.k).toLowerCase().includes(q))
      .sort((a, b) => (!!b.p - !!a.p));
    active = Math.max(0, results.findIndex((r) => r.p));
    list.innerHTML = results.length
      ? results
          .map(
            (r, i) =>
              `<li role="option" data-i="${i}" class="${r.p ? "" : "soon"}${i === active && r.p ? " on" : ""}"><span>${r.n}${r.p ? "" : '<span class="s-tag">Soon</span>'}</span><small>${kindLabel[r.k]} · ${r.c}</small></li>`
          )
          .join("")
      : '<li class="empty">No matches. More components are on the way.</li>';
  };
  const highlight = (i) => {
    if (!results[i]?.p) return;
    active = i;
    $$("li", list).forEach((li) => li.classList.toggle("on", +li.dataset.i === i));
    $$("li", list)[i]?.scrollIntoView({ block: "nearest" });
  };
  const go = (i) => results[i]?.p && (location.href = results[i].p);
  const openSearch = () => {
    modal.hidden = false;
    input.value = "";
    render();
    input.focus();
  };
  const closeSearch = () => (modal.hidden = true);

  $("[data-search-open]").addEventListener("click", openSearch);
  modal.addEventListener("click", (e) => e.target === modal && closeSearch());
  input.addEventListener("input", render);
  list.addEventListener("mousemove", (e) => {
    const li = e.target.closest("li[data-i]");
    if (li) highlight(+li.dataset.i);
  });
  list.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-i]");
    if (li) go(+li.dataset.i);
  });
  input.addEventListener("keydown", (e) => {
    const step = (dir) => {
      let i = active;
      do i += dir;
      while (results[i] && !results[i].p);
      if (results[i]) highlight(i);
    };
    if (e.key === "ArrowDown") (e.preventDefault(), step(1));
    else if (e.key === "ArrowUp") (e.preventDefault(), step(-1));
    else if (e.key === "Enter") go(active);
  });
  document.addEventListener("keydown", (e) => {
    const typing = /input|textarea/i.test(document.activeElement?.tagName || "");
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      modal.hidden ? openSearch() : closeSearch();
    } else if (e.key === "/" && !typing && modal.hidden) {
      e.preventDefault();
      openSearch();
    } else if (e.key === "Escape") {
      closeSearch();
      setMenu(false);
    }
  });
  }

  // ── embedded library previews: size the iframe to its content ─
  $$("iframe[data-autosize]").forEach((frame) => {
    const wrap = frame.parentElement;
    const fit = () => {
      try {
        const doc = frame.contentDocument;
        const root = doc.getElementById("root");
        const h = root ? root.getBoundingClientRect().height : doc.documentElement.scrollHeight;
        if (h > 0) frame.style.height = h + "px";
      } catch {}
    };
    frame.addEventListener("load", () => {
      fit();
      setTimeout(() => wrap.classList.add("ready"), 150);
      try {
        new ResizeObserver(fit).observe(frame.contentDocument.getElementById("root") || frame.contentDocument.body);
      } catch {}
      let n = 0;
      const t = setInterval(() => (fit(), ++n > 20 && clearInterval(t)), 250);
    });
  });

  // ── preview controls: light/dark canvas + viewport width ─
  const VP = { desktop: "100%", tablet: "768px", mobile: "375px" };
  const frameTheme = (frame, light) => {
    try {
      frame.contentDocument.documentElement.classList.toggle("pv-light", light);
    } catch {}
  };
  $$("[data-pv]").forEach((root) => {
    const frame = $("iframe", root);
    let light = false;
    root.setTheme = (l) => {
      light = l;
      $$("[data-pv-theme]", root).forEach((x) => x.classList.toggle("on", (x.dataset.pvTheme === "light") === l));
      root.classList.toggle("pv-light", l);
      if (frame) frameTheme(frame, l);
    };
    $$("[data-pv-theme]", root).forEach((b) => b.addEventListener("click", () => root.setTheme(b.dataset.pvTheme === "light")));
    $$("[data-pv-vp]", root).forEach((b) =>
      b.addEventListener("click", () => {
        $$("[data-pv-vp]", root).forEach((x) => x.classList.toggle("on", x === b));
        root.dataset.vp = b.dataset.pvVp;
        root.style.setProperty("--pv-w", VP[b.dataset.pvVp]);
      })
    );
    frame?.addEventListener("load", () => frameTheme(frame, light));
  });

  // ── site theme: dark by default, light on request; previews follow it ─
  const html = document.documentElement;
  const applyTheme = (light, save) => {
    if (light) html.dataset.theme = "light";
    else delete html.dataset.theme;
    if (save) try { localStorage.setItem("niceui-theme", light ? "light" : "dark"); } catch {}
    $('meta[name="theme-color"]')?.setAttribute("content", light ? "#ffffff" : "#000000");
    $$(".card-stage:not(.card-thumb)").forEach((el) => el.classList.toggle("pv-light", light));
    $$("[data-pv]").forEach((pv) => pv.setTheme?.(light));
    $$("[data-theme-toggle]").forEach((b) => b.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme"));
  };
  applyTheme(html.dataset.theme === "light", false);
  $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => applyTheme(html.dataset.theme !== "light", true)));

  // ── home filters ─────────────────────────────────────────
  $$("[data-filter]").forEach((chip) =>
    chip.addEventListener("click", () => {
      $$("[data-filter]").forEach((c) => c.classList.toggle("on", c === chip));
      const f = chip.dataset.filter;
      $$(".cards .card").forEach((card) => card.classList.toggle("hide", f !== "all" && card.dataset.kind !== f));
    })
  );

  // ── preview / code tabs ──────────────────────────────────
  $$("[data-tabs]").forEach((root) => {
    const tabs = $$("[data-tab]", root);
    tabs.forEach((t) =>
      t.addEventListener("click", () => {
        tabs.forEach((x) => {
          x.classList.toggle("on", x === t);
          x.setAttribute("aria-selected", x === t);
        });
        $$("[data-panel]", root).forEach((p) => (p.hidden = p.dataset.panel !== t.dataset.tab));
      })
    );
  });

  // ── live previews ────────────────────────────────────────
  $$("[data-seg]").forEach((seg) => {
    const ind = $(".x-seg-ind", seg);
    const btns = $$("button", seg);
    const place = (b) => {
      ind.style.width = b.offsetWidth + "px";
      ind.style.transform = "translateX(" + b.offsetLeft + "px)";
    };
    btns.forEach((b) =>
      b.addEventListener("click", () => {
        btns.forEach((x) => x.classList.toggle("on", x === b));
        place(b);
      })
    );
    const sync = () => place($("button.on", seg));
    sync();
    document.fonts?.ready.then(sync);
    window.addEventListener("resize", sync);
  });

  $$("[data-range]").forEach((root) => {
    const r = $("input", root);
    const v = $("[data-range-v]", root);
    const sync = () => {
      r.style.setProperty("--p", r.value + "%");
      v.textContent = r.value + "%";
    };
    r.addEventListener("input", sync);
    sync();
  });

  $$("[data-pal]").forEach((pal) => {
    const q = $("input", pal);
    const items = $$("li", pal);
    const on = (li) => items.forEach((x) => x.classList.toggle("on", x === li));
    items.forEach((li) => li.addEventListener("mouseenter", () => on(li)));
    q.addEventListener("input", () => {
      const v = q.value.toLowerCase();
      items.forEach((li) => li.classList.toggle("hide", !li.textContent.toLowerCase().includes(v)));
      on(items.find((li) => !li.classList.contains("hide")));
    });
  });

  $$("[data-pricing]").forEach((root) => {
    const btns = $$(".x-pr-toggle button", root);
    btns.forEach((b, i) =>
      b.addEventListener("click", () => {
        btns.forEach((x) => x.classList.toggle("on", x === b));
        $$("[data-m]", root).forEach((s) => (s.textContent = "$" + (i === 0 ? s.dataset.m : s.dataset.y)));
      })
    );
  });

  const countUp = (el) => {
    const target = +el.dataset.count;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 1600, 1);
      el.textContent = "$" + Math.round(target * (1 - Math.pow(1 - p, 4))).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) =>
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countUp(en.target);
      io.unobserve(en.target);
    })
  );
  $$("[data-count]").forEach((el) => io.observe(el));
})();
