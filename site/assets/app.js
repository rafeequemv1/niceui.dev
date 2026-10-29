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
  const data = JSON.parse($("#search-data").textContent);
  const modal = $("[data-search]");
  const input = $("[data-search-input]");
  const list = $("[data-search-list]");
  const kindLabel = { component: "Component", block: "Block", template: "Template", ai: "AI agent", landing: "Landing page", dashboard: "Dashboard" };
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
