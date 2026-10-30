import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, Copy, CornerDownLeft, FileText, Github, Hash, Info, Lightbulb, Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV: { title: string; items: string[] }[] = [
  { title: 'Getting started', items: ['Introduction', 'Installation', 'Quickstart', 'Project structure'] },
  { title: 'Core concepts', items: ['Routing', 'Data fetching', 'Caching', 'Middleware'] },
  { title: 'API reference', items: ['createClient', 'defineRoute', 'useQuery', 'Config file'] },
  { title: 'Guides', items: ['Deploying', 'Authentication', 'Testing', 'Migrating from v2'] },
];
const FLAT = NAV.flatMap((s) => s.items.map((i) => ({ section: s.title, title: i })));
const TOC = [
  { id: 'overview', title: 'Overview' },
  { id: 'install', title: 'Install the CLI' },
  { id: 'create', title: 'Create a project' },
  { id: 'config', title: 'Configure routes' },
  { id: 'run', title: 'Run it locally' },
  { id: 'next', title: 'Next steps' },
];
const PM = {
  npm: 'npm install -g @kestrel/cli\nkestrel init my-app',
  pnpm: 'pnpm add -g @kestrel/cli\nkestrel init my-app',
  bun: 'bun add -g @kestrel/cli\nkestrel init my-app',
} as const;

export function DocsApp() {
  const [page, setPage] = useState('Quickstart');
  const [open, setOpen] = useState<string[]>(NAV.map((n) => n.title));
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const [version, setVersion] = useState('v3.2');
  const [active, setActive] = useState('overview');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === 'Escape') setPalette(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const els = TOC.map((t) => document.getElementById('kd-' + t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.slice(3));
      },
      { rootMargin: '0px 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [page]);

  const idx = FLAT.findIndex((f) => f.title === page);
  const go = (t: string) => {
    setPage(t);
    setMenu(false);
    setPalette(false);
    root.current?.scrollIntoView({ block: 'start' });
  };

  const sidebar = (
    <nav aria-label="Docs" className="space-y-5 text-[13.5px]">
      {NAV.map((s) => {
        const isOpen = open.includes(s.title);
        return (
          <div key={s.title}>
            <button onClick={() => setOpen((o) => (isOpen ? o.filter((x) => x !== s.title) : [...o, s.title]))} aria-expanded={isOpen} className="flex w-full items-center justify-between py-1 text-[12px] font-semibold uppercase tracking-wider text-ink-400 hover:text-ink-200">
              {s.title}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !isOpen && '-rotate-90')} />
            </button>
            {isOpen && (
              <ul className="mt-1.5 space-y-0.5 border-l border-white/10">
                {s.items.map((i) => (
                  <li key={i}>
                    <button onClick={() => go(i)} aria-current={page === i ? 'page' : undefined} className={cn('-ml-px block w-full border-l py-1.5 pl-3 text-left transition-colors', page === i ? 'border-brand-400 text-brand-300' : 'border-transparent text-ink-400 hover:border-white/30 hover:text-ink-100')}>
                      {i}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div ref={root} className="relative min-h-screen bg-ink-950 font-sans text-ink-200 antialiased">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setMenu((m) => !m)} aria-label="Toggle navigation" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5 lg:hidden"><Menu className="h-4 w-4" /></button>
          <span className="flex items-center gap-2 text-[15px] font-semibold text-white">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand-300 to-brand-600 text-[11px] font-bold text-ink-950">K</span>
            Kestrel <span className="font-normal text-ink-500">docs</span>
          </span>
          <div className="relative ml-2 hidden sm:block">
            <select value={version} onChange={(e) => setVersion(e.target.value)} aria-label="Version" className="h-7 appearance-none rounded-md border border-white/10 bg-white/[0.03] pl-2 pr-6 font-mono text-[11.5px] text-ink-300">
              {['v3.2', 'v3.1', 'v2.9'].map((v) => <option key={v}>{v}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1.5 h-3.5 w-3.5 text-ink-500" />
          </div>
          <button onClick={() => setPalette(true)} className="ml-auto flex h-8 w-full max-w-[260px] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-[13px] text-ink-500 hover:border-white/20">
            <Search className="h-3.5 w-3.5" /> <span className="flex-1 text-left">Search docs…</span>
            <kbd className="hidden rounded border border-white/10 px-1 font-mono text-[10px] sm:block">⌘K</kbd>
          </button>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="GitHub" className="hidden h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-white sm:grid"><Github className="h-4 w-4" /></a>
        </div>
        {menu && <div className="max-h-[70vh] overflow-y-auto border-t border-white/5 px-5 py-4 lg:hidden">{sidebar}</div>}
      </header>

      <div className="sticky top-14 z-40 h-0">
        {palette && (
          <>
            <div className="absolute inset-x-0 top-0 h-[560px] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setPalette(false)} />
            <Palette onGo={go} onClose={() => setPalette(false)} />
          </>
        )}
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_200px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] max-h-[900px] overflow-y-auto py-8 lg:block">{sidebar}</aside>

        <main className="min-w-0 py-10">
          <p className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
            Docs <ChevronRight className="h-3 w-3" /> {FLAT[idx]?.section} <ChevronRight className="h-3 w-3" /> <span className="text-ink-300">{page}</span>
          </p>
          <h1 className="mt-3 text-[38px] font-semibold tracking-[-0.03em] text-white">{page}</h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-400">Spin up a typed, edge-ready Kestrel app in about five minutes. This guide covers install, project setup, routes and your first deploy.</p>

          <article className="mt-8 max-w-[720px] space-y-6 text-[15px] leading-[1.75] text-ink-300">
            <H id="overview">Overview</H>
            <p>Kestrel is a full-stack framework for building fast web apps on the edge. Routes are plain TypeScript files, data loads in parallel, and every response is cached by default.</p>
            <Callout kind="info">Kestrel {version} requires Node 20 or newer. Run <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-ink-100">node -v</code> to check.</Callout>

            <H id="install">Install the CLI</H>
            <p>Install the command-line tool globally with your package manager of choice, then scaffold a project.</p>
            <CodeTabs tabs={PM} />

            <H id="create">Create a project</H>
            <p>The init command asks a few questions and writes a minimal app with one route and a config file.</p>
            <Code file="kestrel.config.ts">{`import { defineConfig } from '@kestrel/core';

export default defineConfig({
  runtime: 'edge',
  cache: { ttl: 60, staleWhileRevalidate: true },
  routes: './app/routes',
});`}</Code>
            <Callout kind="tip">Keep secrets in <code className="font-mono text-[13px] text-ink-100">.env.local</code>. Kestrel loads it automatically and never ships it to the client.</Callout>

            <H id="config">Configure routes</H>
            <p>Every file in <code className="font-mono text-[13px] text-ink-100">app/routes</code> becomes a URL. Export a loader to fetch data on the server.</p>
            <Code file="app/routes/index.ts">{`import { defineRoute } from '@kestrel/core';

export default defineRoute({
  async load({ db }) {
    return { posts: await db.post.findMany({ take: 10 }) };
  },
});`}</Code>

            <H id="run">Run it locally</H>
            <p>Start the dev server. Pages hot-reload and type errors show in the browser overlay.</p>
            <Code file="terminal">{`kestrel dev
  ▲ Ready on http://localhost:4000 in 212ms`}</Code>
            <Callout kind="warn">Port 4000 is the default. Pass <code className="font-mono text-[13px] text-ink-100">--port</code> if something else is already using it.</Callout>

            <H id="next">Next steps</H>
            <ul className="space-y-2">
              {['Routing', 'Data fetching', 'Deploying'].map((t) => (
                <li key={t}>
                  <button onClick={() => go(t)} className="group inline-flex items-center gap-2 text-brand-300 hover:text-brand-200">
                    <FileText className="h-4 w-4" /> {t} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <nav className="mt-14 grid max-w-[720px] gap-3 border-t border-white/[0.07] pt-6 sm:grid-cols-2" aria-label="Pagination">
            {idx > 0 ? (
              <button onClick={() => go(FLAT[idx - 1].title)} className="rounded-xl border border-white/[0.07] p-4 text-left transition-colors hover:border-brand-400/40">
                <span className="flex items-center gap-1 text-[12px] text-ink-500"><ArrowLeft className="h-3 w-3" /> Previous</span>
                <span className="mt-1 block text-[14.5px] font-medium text-ink-100">{FLAT[idx - 1].title}</span>
              </button>
            ) : <span />}
            {idx < FLAT.length - 1 && (
              <button onClick={() => go(FLAT[idx + 1].title)} className="rounded-xl border border-white/[0.07] p-4 text-right transition-colors hover:border-brand-400/40">
                <span className="flex items-center justify-end gap-1 text-[12px] text-ink-500">Next <ArrowRight className="h-3 w-3" /></span>
                <span className="mt-1 block text-[14.5px] font-medium text-ink-100">{FLAT[idx + 1].title}</span>
              </button>
            )}
          </nav>
        </main>

        <aside className="sticky top-14 hidden h-fit py-10 xl:block">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink-400"><BookOpen className="h-3.5 w-3.5" /> On this page</p>
          <ul className="mt-3 space-y-1 border-l border-white/10 text-[13px]">
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={'#kd-' + t.id} className={cn('-ml-px block border-l py-1 pl-3 transition-colors', active === t.id ? 'border-brand-400 text-brand-300' : 'border-transparent text-ink-500 hover:text-ink-200')}>
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function H({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={'kd-' + id} className="group scroll-mt-20 pt-4 text-[22px] font-semibold tracking-[-0.02em] text-white">
      <a href={'#kd-' + id} className="inline-flex items-center gap-2">
        {children}
        <Hash className="h-4 w-4 text-ink-600 opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    </h2>
  );
}

function Callout({ kind, children }: { kind: 'info' | 'tip' | 'warn'; children: ReactNode }) {
  const s = { info: [Info, 'border-brand-400/30 bg-brand-500/[0.06] text-brand-300'], tip: [Lightbulb, 'border-emerald-400/30 bg-emerald-500/[0.06] text-emerald-300'], warn: [AlertTriangle, 'border-amber-400/30 bg-amber-500/[0.06] text-amber-300'] }[kind];
  const Icon = s[0] as typeof Info;
  return (
    <div className={cn('flex gap-3 rounded-xl border px-4 py-3 text-[14px]', s[1] as string)}>
      <Icon className="mt-1 h-4 w-4 shrink-0" />
      <div className="text-ink-300">{children}</div>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        try {
          void navigator.clipboard?.writeText(text);
        } catch {}
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      }}
      aria-label="Copy code"
      className="grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-white/5 hover:text-white"
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const highlight = (code: string) =>
  code.split('\n').map((line, i) => (
    <div key={i}>
      {line.split(/('[^']*'|\b(?:import|from|export|default|const|async|await|return|true)\b|\/\/.*)/).map((tok, j) =>
        /^'/.test(tok) ? <span key={j} className="text-emerald-300">{tok}</span> : /^\/\//.test(tok) ? <span key={j} className="text-ink-500">{tok}</span> : /^(import|from|export|default|const|async|await|return|true)$/.test(tok) ? <span key={j} className="text-brand-300">{tok}</span> : <span key={j}>{tok}</span>,
      )}
      {line === '' && ' '}
    </div>
  ));

function Code({ file, children }: { file: string; children: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink-900">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
        <span className="font-mono text-[11.5px] text-ink-500">{file}</span>
        <CopyBtn text={children} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] text-ink-200">{highlight(children)}</pre>
    </div>
  );
}

function CodeTabs({ tabs }: { tabs: Record<string, string> }) {
  const keys = Object.keys(tabs);
  const [k, setK] = useState(keys[0]);
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-ink-900">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-2">
        <div role="tablist" className="flex">
          {keys.map((t) => (
            <button key={t} role="tab" aria-selected={k === t} onClick={() => setK(t)} className={cn('relative px-3 py-2 font-mono text-[12px] transition-colors', k === t ? 'text-white' : 'text-ink-500 hover:text-ink-300')}>
              {t}
              {k === t && <span className="absolute inset-x-2 bottom-0 h-px bg-brand-400" />}
            </button>
          ))}
        </div>
        <CopyBtn text={tabs[k]} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] text-ink-200">
        {tabs[k].split('\n').map((l, i) => (
          <div key={i}><span className="select-none text-ink-600">$ </span>{l}</div>
        ))}
      </pre>
    </div>
  );
}

function Palette({ onGo, onClose }: { onGo: (t: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const res = useMemo(() => FLAT.filter((f) => (f.title + ' ' + f.section).toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div className="absolute inset-x-0 top-10 flex justify-center px-3"><div role="dialog" aria-label="Search docs" className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-pop animate-scale-in">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4">
        <Search className="h-4 w-4 text-ink-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => (setQ(e.target.value), setI(0))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') (e.preventDefault(), setI((x) => Math.min(res.length - 1, x + 1)));
            if (e.key === 'ArrowUp') (e.preventDefault(), setI((x) => Math.max(0, x - 1)));
            if (e.key === 'Enter' && res[i]) onGo(res[i].title);
          }}
          placeholder="Search the docs"
          aria-label="Search the docs"
          className="h-12 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-ink-500"
        />
        <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-ink-500 hover:bg-white/5"><X className="h-4 w-4" /></button>
      </div>
      <ul role="listbox" className="max-h-[320px] overflow-y-auto p-2">
        {res.map((r, j) => (
          <li key={r.title} role="option" aria-selected={j === i}>
            <button onMouseMove={() => setI(j)} onClick={() => onGo(r.title)} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left', j === i ? 'bg-white/[0.06]' : '')}>
              <FileText className="h-4 w-4 text-ink-500" />
              <span className="flex-1">
                <span className="block text-[13.5px] text-ink-100">{r.title}</span>
                <span className="block text-[11.5px] text-ink-500">{r.section}</span>
              </span>
              {j === i && <CornerDownLeft className="h-3.5 w-3.5 text-ink-500" />}
            </button>
          </li>
        ))}
        {!res.length && <li className="px-3 py-8 text-center text-[13px] text-ink-500">No results for “{q}”.</li>}
      </ul>
    </div></div>
  );
}
