import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export type CustomCursorProps = {
  children: ReactNode;
  /** 'ring' = sky dot + ring; 'blend' = a large disc that inverts what it covers. */
  variant?: 'ring' | 'blend';
  /** Pull strength (0–1) toward elements marked data-cursor-magnetic. */
  magnetic?: number;
  className?: string;
};

/**
 * An animated custom mouse cursor scoped to its container: a spring-follow dot
 * and ring that grows and shows a label over `data-cursor="Label"` targets and
 * snaps to `data-cursor-magnetic` buttons. Touch and coarse pointers keep the
 * native cursor.
 */
export function CustomCursor({ children, variant = 'ring', magnetic = 0.35, className }: CustomCursorProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(fine.matches);
    sync();
    fine.addEventListener('change', sync);
    return () => fine.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !enabled) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = { x: -100, y: -100 };
    const d = { x: -100, y: -100 };
    const r = { x: -100, y: -100, s: 1 };
    let scale = 1;
    let inside = false;
    let raf = 0;
    let mag: HTMLElement | null = null;

    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      let x = e.clientX - b.left;
      let y = e.clientY - b.top;
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], [data-cursor-magnetic]');
      const lab = t?.dataset.cursor ?? '';
      setLabel(lab);
      scale = lab ? 3.2 : t ? 1.8 : 1;
      if (mag && mag !== t) mag.style.transform = '';
      mag = t && t.hasAttribute('data-cursor-magnetic') ? t : null;
      if (mag) {
        const mb = mag.getBoundingClientRect();
        const cx = mb.left - b.left + mb.width / 2;
        const cy = mb.top - b.top + mb.height / 2;
        x = x + (cx - x) * magnetic;
        y = y + (cy - y) * magnetic;
        mag.style.transform = `translate(${(e.clientX - b.left - cx) * magnetic * 0.4}px, ${(e.clientY - b.top - cy) * magnetic * 0.4}px)`;
      }
      target.x = x;
      target.y = y;
      if (!inside) {
        inside = true;
        d.x = r.x = x;
        d.y = r.y = y;
        setActive(true);
      }
    };
    const leave = () => {
      inside = false;
      setActive(false);
      setLabel('');
      if (mag) mag.style.transform = '';
      mag = null;
    };
    const tick = () => {
      const k1 = reduced ? 1 : 0.55;
      const k2 = reduced ? 1 : 0.16;
      d.x += (target.x - d.x) * k1;
      d.y += (target.y - d.y) * k1;
      r.x += (target.x - r.x) * k2;
      r.y += (target.y - r.y) * k2;
      r.s += (scale - r.s) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${d.x}px, ${d.y}px, 0) translate(-50%, -50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) translate(-50%, -50%) scale(${r.s})`;
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
      if (mag) mag.style.transform = '';
    };
  }, [enabled, magnetic]);

  const blend = variant === 'blend';
  return (
    <div ref={wrap} className={cn('relative overflow-hidden', enabled && '[&_*]:cursor-none cursor-none', className)}>
      {children}
      {enabled && (
        <div aria-hidden className={cn('pointer-events-none absolute inset-0 z-50 transition-opacity duration-300', active ? 'opacity-100' : 'opacity-0')}>
          <div
            ref={ring}
            className={cn(
              'absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full will-change-transform',
              blend ? 'bg-white mix-blend-difference' : 'border border-brand-300/70 bg-brand-300/[0.06] backdrop-blur-[1px]',
            )}
          >
            <span className={cn('text-[4px] font-medium uppercase tracking-[0.18em] transition-opacity duration-200', blend ? 'text-black' : 'text-brand-100', label ? 'opacity-100' : 'opacity-0')}>{label}</span>
          </div>
          {!blend && <div ref={dot} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_12px_#7dd3fc] will-change-transform" />}
        </div>
      )}
    </div>
  );
}

const WORK = [
  { t: 'Northfold Studio', k: 'Brand · 2026', c: 'from-sky-500/40 to-indigo-600/30' },
  { t: 'Halcyon App', k: 'Product · 2025', c: 'from-emerald-400/30 to-sky-600/30' },
  { t: 'Quiet Hours', k: 'Editorial · 2025', c: 'from-fuchsia-500/30 to-amber-400/20' },
];

export function CustomCursorDemo() {
  const [variant, setVariant] = useState<'ring' | 'blend'>('ring');
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-3 flex justify-center gap-1 rounded-xl bg-ink-900 p-1 text-xs shadow-card sm:mx-auto sm:w-fit">
        {(['ring', 'blend'] as const).map((v) => (
          <button key={v} onClick={() => setVariant(v)} className={cn('focus-ring rounded-lg px-3 py-1.5 capitalize transition-colors', variant === v ? 'bg-ink-800 text-ink-50' : 'text-ink-400 hover:text-ink-200')}>
            {v === 'ring' ? 'Dot + ring' : 'Blend disc'}
          </button>
        ))}
      </div>
      <CustomCursor variant={variant} className="rounded-2xl border border-white/[0.07] bg-ink-950 p-6 sm:p-8">
        <p className="text-[13px] text-ink-400">Selected work</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink-50 sm:text-3xl">Move over the cards.</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {WORK.map((w) => (
            <a key={w.t} href="#" onClick={(e) => e.preventDefault()} data-cursor="View" className="group block rounded-xl border border-white/[0.06] bg-ink-900 p-3 focus-ring">
              <div className={cn('h-24 rounded-lg bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.03]', w.c)} />
              <p className="mt-3 text-sm text-ink-100">{w.t}</p>
              <p className="text-xs text-ink-500">{w.k}</p>
            </a>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button data-cursor-magnetic className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand-300 px-5 py-2.5 text-sm font-medium text-ink-950 transition-transform duration-200">
            Start a project <ArrowUpRight className="h-4 w-4" />
          </button>
          <button data-cursor-magnetic className="focus-ring rounded-full border border-white/10 px-5 py-2.5 text-sm text-ink-200 transition-transform duration-200">
            Say hello
          </button>
        </div>
      </CustomCursor>
      <p className="mt-3 text-center text-xs text-ink-500">On touch screens the native cursor is kept.</p>
    </div>
  );
}
