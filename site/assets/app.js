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

  // ── one-click copy of a component's whole source (fetched on demand) ──
  const fetched = new Map();
  const getText = (url) => {
    if (!fetched.has(url)) fetched.set(url, fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status)))));
    return fetched.get(url);
  };
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest?.("[data-copy-url]");
    if (b) getText(b.dataset.copyUrl).catch(() => fetched.delete(b.dataset.copyUrl));
  });
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy-url]");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    const url = b.dataset.copyUrl;
    const done = (text) => {
      toast(`${b.dataset.copyName || "Code"} copied · ${text.split("\n").length} lines`);
      b.classList.add("ok");
      setTimeout(() => b.classList.remove("ok"), 1400);
    };
    try {
      const text = getText(url);
      // ClipboardItem keeps the user gesture while the file downloads (Safari needs this)
      if (window.ClipboardItem && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })) })]);
      } else {
        await navigator.clipboard.writeText(await text);
      }
      done(await text);
    } catch {
      try {
        const t = await getText(url);
        await navigator.clipboard.writeText(t);
        done(t);
      } catch {
        fetched.delete(url);
        toast("Copy failed — use Download instead");
      }
    }
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
  const kindLabel = { component: "Component", block: "Block", template: "Template", ai: "AI agent", crm: "CRM", gallery: "Gallery", effect: "Effect", application: "Application", chart: "Chart", commerce: "E-commerce", design: "Design tool", marketing: "Marketing section", landing: "Landing page", dashboard: "Dashboard" };
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

  $$("[data-search-open]").forEach((b) => b.addEventListener("click", openSearch));
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

  // ── saved items (localStorage) ─────────────────────────
  const SAVED_KEY = "niceui-saved";
  const getSaved = () => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; } };
  const setSaved = (list) => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch {} };
  const syncSaved = () => {
    const list = getSaved();
    $$("[data-save]").forEach((b) => {
      const on = list.includes(b.dataset.save);
      b.setAttribute("aria-pressed", on);
      b.classList.toggle("on", on);
      $("span", b).textContent = on ? "Saved" : "Save";
    });
    $$("[data-saved-count]").forEach((el) => { el.hidden = !list.length; el.textContent = list.length; });
    const ul = $("[data-saved-list]");
    if (ul) {
      const data = JSON.parse($("#search-data")?.textContent || "[]");
      const rows = list.map((p) => data.find((d) => d.p === p)).filter(Boolean);
      ul.innerHTML = rows.map((r) => `<li><a href="${r.p}"><b>${r.n}</b><small>${r.c}</small></a><button data-unsave="${r.p}" aria-label="Remove ${r.n}">Remove</button></li>`).join("");
      $("[data-saved-empty]").hidden = rows.length > 0;
      $$("[data-unsave]", ul).forEach((b) => b.addEventListener("click", () => { setSaved(getSaved().filter((p) => p !== b.dataset.unsave)); syncSaved(); }));
    }
  };
  $$("[data-save]").forEach((b) =>
    b.addEventListener("click", () => {
      const list = getSaved();
      const p = b.dataset.save;
      setSaved(list.includes(p) ? list.filter((x) => x !== p) : [p, ...list]);
      syncSaved();
    })
  );
  syncSaved();

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
  // ── home mega menu ───────────────────────────────────────
  (() => {
    const root = $("[data-mk]");
    if (!root) return;
    const bar = $(".mk-bar", root);
    const panel = $("[data-mk-panel]", root);
    const trigs = $$("[data-mk-trig]", root);
    const panes = $$("[data-mk-pane]", root);
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let open = -1;
    let t = 0;
    const place = (i) => {
      const pane = panes[i];
      const w = pane.offsetWidth;
      const h = pane.offsetHeight;
      const br = bar.getBoundingClientRect();
      const tr = trigs[i].getBoundingClientRect();
      const x = Math.max(0, Math.min(br.width - w, tr.left - br.left + tr.width / 2 - w / 2));
      panel.style.left = x + "px";
      panel.style.width = w + "px";
      panel.style.height = h + "px";
    };
    const show = (i) => {
      clearTimeout(t);
      if (i === open) return;
      const was = open;
      open = i;
      trigs.forEach((b, k) => b.setAttribute("aria-expanded", String(k === i)));
      panes.forEach((p, k) => {
        p.classList.toggle("on", k === i);
        p.classList.toggle("from-l", i >= 0 && k > i);
        p.setAttribute("aria-hidden", String(k !== i));
      });
      if (i < 0) {
        panel.classList.toggle("open", false);
        return;
      }
      if (was < 0) panel.classList.toggle("no-move", true);
      place(i);
      panel.classList.toggle("open", true);
      if (was < 0) requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.toggle("no-move", false)));
    };
    const later = (i, ms) => {
      clearTimeout(t);
      t = setTimeout(() => show(i), ms);
    };
    trigs.forEach((b, i) => {
      b.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse" || !fine.matches) return;
        if (open < 0) later(i, 70);
        else show(i);
      });
      b.addEventListener("click", () => show(open === i ? -1 : i));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          show(i);
          setTimeout(() => $("a", panes[i])?.focus(), 40);
        }
      });
    });
    $$("[data-mk-plain]", root).forEach((a) => a.addEventListener("pointerenter", () => later(-1, 120)));
    bar.addEventListener("pointerleave", () => later(-1, 200));
    bar.addEventListener("pointerenter", () => clearTimeout(t));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open >= 0) {
        const b = trigs[open];
        show(-1);
        b.focus();
      }
    });
    document.addEventListener("pointerdown", (e) => {
      if (open >= 0 && !bar.contains(e.target)) show(-1);
    });
    addEventListener("resize", () => {
      if (open >= 0) place(open);
    });
    // the preview card follows the hovered link
    panes.forEach((pane) => {
      const pv = $(".mk-pv", pane);
      if (!pv) return;
      const img = $("img", pv);
      const meta = $(".mk-pv-meta", pv);
      const title = $(".mk-pv-t", pv);
      let cur = img.getAttribute("src");
      let ft = 0;
      const set = (a) => {
        $$(".hot", pane).forEach((x) => x.classList.toggle("hot", false));
        a.classList.toggle("hot", true);
        if (a.dataset.pv === cur) return;
        cur = a.dataset.pv;
        pv.classList.toggle("swap", true);
        clearTimeout(ft);
        ft = setTimeout(() => {
          img.src = a.dataset.pv;
          pv.dataset.native = a.dataset.pvNative || "dark";
          meta.textContent = a.dataset.pvM || "";
          title.textContent = a.dataset.pvT || "";
          pv.classList.toggle("swap", false);
        }, 140);
      };
      $$("[data-pv]", pane).forEach((a, k) => {
        if (k === 0) a.classList.toggle("hot", true);
        a.addEventListener("pointerenter", () => set(a));
        a.addEventListener("focus", () => set(a));
      });
    });
    // phone sheet
    const burger = $("[data-mk-sheet]", root);
    const sheet = $("[data-mk-sheet-panel]", root);
    if (burger && sheet) {
      burger.addEventListener("click", () => {
        const on = sheet.hidden;
        sheet.hidden = !on;
        burger.setAttribute("aria-expanded", String(on));
        burger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
        document.body.classList.toggle("mk-locked", on);
      });
    }
  })();
  // ── /browse: search, category chips, sort, URL state ─────
  (() => {
    const grid = $("[data-br-grid]");
    if (!grid) return;
    const cards = $$("[data-br]", grid);
    const q = $("[data-br-q]");
    const chips = $$("[data-br-cat]");
    const sorts = $$("[data-br-sort]");
    const count = $("[data-br-count]");
    const empty = $("[data-br-empty]");
    const term = $("[data-br-term]");
    const params = new URLSearchParams(location.search);
    let cat = params.get("cat") || "all";
    let sort = params.get("sort") || "cat";
    if (!chips.some((c) => c.dataset.brCat === cat)) cat = "all";
    if (!sorts.some((b) => b.dataset.brSort === sort)) sort = "cat";
    q.value = params.get("q") || "";

    const order = {
      cat: (a, b) => a.dataset.i - b.dataset.i,
      new: (a, b) => b.dataset.new - a.dataset.new || a.dataset.i - b.dataset.i,
      az: (a, b) => a.dataset.n.localeCompare(b.dataset.n),
    };
    const sync = () => {
      const p = new URLSearchParams();
      if (q.value.trim()) p.set("q", q.value.trim());
      if (cat !== "all") p.set("cat", cat);
      if (sort !== "cat") p.set("sort", sort);
      const s = p.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
    };
    const apply = () => {
      const words = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let shown = 0;
      cards.forEach((c) => {
        const ok = (cat === "all" || c.dataset.g === cat) && words.every((w) => c.dataset.h.includes(w));
        c.hidden = !ok;
        if (ok) shown++;
      });
      chips.forEach((c) => {
        const on = c.dataset.brCat === cat;
        c.classList.toggle("on", on);
        c.setAttribute("aria-pressed", String(on));
      });
      sorts.forEach((b) => {
        const on = b.dataset.brSort === sort;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      const label = cat === "all" ? "" : " in " + chips.find((c) => c.dataset.brCat === cat).firstChild.textContent;
      count.textContent = `${shown} ${shown === 1 ? "item" : "items"}${label}`;
      empty.hidden = shown > 0;
      term.textContent = q.value.trim() ? `“${q.value.trim()}”` : "these filters";
      sync();
    };
    const resort = () => {
      const frag = document.createDocumentFragment();
      [...cards].sort(order[sort]).forEach((c) => frag.appendChild(c));
      grid.appendChild(frag);
    };

    let t = 0;
    q.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(apply, 80);
    });
    chips.forEach((c) =>
      c.addEventListener("click", () => {
        cat = c.dataset.brCat;
        apply();
      })
    );
    sorts.forEach((b) =>
      b.addEventListener("click", () => {
        sort = b.dataset.brSort;
        resort();
        apply();
      })
    );
    $("[data-br-reset]").addEventListener("click", () => {
      q.value = "";
      cat = "all";
      apply();
      q.focus();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.activeElement === q && q.value) {
        q.value = "";
        apply();
      }
    });
    if (sort !== "cat") resort();
    apply();
  })();
})();
