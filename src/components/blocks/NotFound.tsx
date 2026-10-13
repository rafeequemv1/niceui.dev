import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { ArrowLeft, ArrowRight, Compass, FileText, Hexagon, Home, Search, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';

type Dest = { title: string; desc: string; path: string; icon: ComponentType<{ className?: string }> };

const DESTINATIONS: Dest[] = [
  { title: 'Documentation', desc: 'Install and get started', path: '/intro/home', icon: FileText },
  { title: 'Components', desc: 'Buttons, inputs, overlays', path: '/components/button', icon: Hexagon },
  { title: 'Blocks', desc: 'Command palette, wallet, OTP', path: '/blocks/command-palette', icon: Zap },
  { title: 'Dashboards', desc: 'Full example layouts', path: '/examples/analytics', icon: Compass },
];

/** Layered "404" that follows the pointer with eased parallax and an occasional glitch. */
function Hero404({ size }: { size: string }) {
  const root = useRef<HTMLDivElement>(null);
  const layers = useRef<Array<HTMLSpanElement | null>>([]);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const el = root.current?.closest('[data-404-root]') as HTMLElement | null;
    if (!el) return;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const depth = [42, 22, 10];
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => { target.x = 0; target.y = 0; };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      layers.current.forEach((l, i) => {
        if (l) l.style.transform = `translate3d(${cur.x * depth[i]}px, ${cur.y * depth[i] * 0.6}px, 0) rotateX(${-cur.y * 6}deg) rotateY(${cur.x * 8}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, []);

  useEffect(() => {
    let off = 0;
    const id = window.setInterval(() => {
      setGlitch(true);
      off = window.setTimeout(() => setGlitch(false), 160 + Math.random() * 120);
    }, 3400);
    return () => { window.clearInterval(id); window.clearTimeout(off); };
  }, []);

  const base = cn('select-none font-semibold leading-none tracking-[-0.06em]', size);
  return (
    <div ref={root} aria-hidden className="relative grid place-items-center" style={{ perspective: 800 }}>
      <span ref={(e) => (layers.current[0] = e)} className={cn(base, '[grid-area:1/1] text-brand-500/40 blur-2xl')}>404</span>
      <span ref={(e) => (layers.current[1] = e)} className={cn(base, '[grid-area:1/1] scale-[1.06] text-transparent')} style={{ WebkitTextStroke: '1px rgba(255,255,255,0.09)' }}>404</span>
      <span ref={(e) => (layers.current[2] = e)} className="relative [grid-area:1/1]">
        <span className={cn(base, 'block bg-gradient-to-b from-white via-ink-200 to-ink-600 bg-clip-text text-transparent')}>404</span>
        {glitch && (
          <>
            <span className={cn(base, 'absolute inset-0 text-sky-400/70 mix-blend-screen')} style={{ clipPath: 'inset(18% 0 52% 0)', transform: 'translateX(-6px)' }}>404</span>
            <span className={cn(base, 'absolute inset-0 text-rose-400/70 mix-blend-screen')} style={{ clipPath: 'inset(58% 0 14% 0)', transform: 'translateX(6px)' }}>404</span>
          </>
        )}
      </span>
    </div>
  );
}

function SearchBox({ onGo, compact }: { onGo: (path: string) => void; compact?: boolean }) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? DESTINATIONS.filter((d) => `${d.title} ${d.desc}`.toLowerCase().includes(s)) : [];
  }, [q]);
  return (
    <div className={cn('relative w-full', compact ? 'max-w-xs' : 'max-w-md')}>
      <label className={cn('flex h-11 items-center gap-2.5 rounded-xl bg-ink-900/80 px-3.5 backdrop-blur transition-shadow duration-300', focused ? 'shadow-glow' : 'shadow-hairline')}>
        <Search className="h-4 w-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) onGo(results[0].path); if (e.key === 'Escape') setQ(''); }}
          placeholder="Search the docs…"
          className="h-full flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
        />
        <kbd className="rounded-md bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-ink-400">↵</kbd>
      </label>
      {focused && q && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 animate-scale-in rounded-xl bg-ink-850 p-1 text-left shadow-pop">
          {results.length === 0 && <p className="px-3 py-3 text-xs text-ink-400">No pages match “{q}”</p>}
          {results.map((r) => (
            <button key={r.path} onMouseDown={() => onGo(r.path)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-200 transition-colors hover:bg-white/5">
              <r.icon className="h-4 w-4 text-ink-400" /> {r.title}
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type NotFoundPageProps = { onHome: () => void; onNavigate?: (path: string) => void };

export function NotFoundPage({ onHome, onNavigate = (p) => { window.location.hash = p; } }: NotFoundPageProps) {
  return (
    <div data-404-root className="relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-blob bg-brand-500/15 blur-3xl" />
      <div className="relative animate-fade-up">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-ink-300 shadow-hairline">
          <Sparkles className="h-3 w-3 text-amber-400" /> Error 404
        </span>
      </div>
      <div className="relative mt-4 animate-scale-in [animation-delay:80ms]">
        <Hero404 size="text-[clamp(110px,20vw,220px)]" />
      </div>
      <h1 className="relative mt-2 animate-fade-up text-2xl font-medium text-ink-50 [animation-delay:160ms] sm:text-3xl">This page drifted out of orbit</h1>
      <p className="relative mt-2 max-w-md animate-fade-up text-sm text-ink-400 [animation-delay:220ms]">The link may be broken or the page may have moved. Try searching, or jump to one of these instead.</p>
      <div className="relative z-10 mt-7 flex w-full animate-fade-up justify-center [animation-delay:280ms]">
        <SearchBox onGo={onNavigate} />
      </div>
      <div className="relative mt-6 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.path}
            onClick={() => onNavigate(d.path)}
            style={{ animationDelay: `${340 + i * 60}ms` }}
            className="focus-ring group animate-fade-up rounded-xl bg-ink-900/80 p-3.5 text-left shadow-card backdrop-blur transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-ink-850"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-ink-300 shadow-hairline transition-colors group-hover:bg-brand-500/15 group-hover:text-brand-300"><d.icon className="h-4 w-4" /></span>
            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-ink-100">
              {d.title}
              <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
            <span className="mt-0.5 block text-xs text-ink-500">{d.desc}</span>
          </button>
        ))}
      </div>
      <button onClick={onHome} className="focus-ring group relative mt-8 flex animate-fade-up items-center gap-2 rounded-full bg-ink-50 px-5 py-2.5 text-sm font-medium text-ink-950 transition-all [animation-delay:600ms] hover:bg-white active:scale-95">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to home
      </button>
    </div>
  );
}

/** Compact card variant for empty states inside panels. */
export function NotFoundCard({ onHome, onNavigate }: NotFoundPageProps) {
  return (
    <div data-404-root className="relative mx-auto flex w-full max-w-sm flex-col items-center overflow-hidden rounded-2xl bg-ink-900 px-6 pb-7 pt-4 text-center shadow-card">
      <div className="pointer-events-none absolute inset-0 dot-bg [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Hero404 size="text-[96px]" />
      <p className="relative text-base font-medium text-ink-50">Page not found</p>
      <p className="relative mt-1 text-sm text-ink-400">We couldn’t find what you were looking for.</p>
      <div className="relative z-10 mt-5 flex w-full justify-center"><SearchBox onGo={(p) => onNavigate?.(p)} compact /></div>
      <button onClick={onHome} className="focus-ring relative mt-4 flex items-center gap-2 rounded-xl bg-ink-800 px-4 py-2 text-sm font-medium text-ink-100 shadow-hairline transition-all hover:bg-ink-700 active:scale-95">
        <Home className="h-4 w-4" /> Go home
      </button>
    </div>
  );
}

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = window.setTimeout(() => setMsg(null), 1600);
    return () => window.clearTimeout(t);
  }, [msg]);
  const node = msg ? <div key={msg} className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 animate-fade-up rounded-full bg-ink-800 px-3 py-1.5 text-xs text-ink-100 shadow-pop">{msg}</div> : null;
  return { show: setMsg, node };
}

export function NotFoundCardDemo() {
  const { show, node } = useToast();
  return (
    <div className="relative flex justify-center">
      <NotFoundCard onHome={() => show('→ Home')} onNavigate={(p) => show(`→ ${p}`)} />
      {node}
    </div>
  );
}

export function NotFoundPageDemo() {
  const { show, node } = useToast();
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-4xl overflow-y-auto rounded-2xl bg-ink-950 shadow-card">
      <NotFoundPage onHome={() => show('→ Home')} onNavigate={(p) => show(`→ ${p}`)} />
      {node}
    </div>
  );
}
