import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const SERIES_COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'];

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Becomes true once the element scrolls into view (or immediately under reduced motion). */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (reducedMotion()) return setSeen(true);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, seen };
}

/** Tracks the rendered width of an element so SVG charts can draw at true pixel size. */
export function useWidth<T extends Element>(fallback = 600) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

export const scale = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

/** Nice upper bound for an axis. */
export function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** Smooth monotone-ish path through points (Catmull-Rom → Bézier, tension 0.5). */
export function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export const fmt = (v: number, prefix = '') => prefix + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'k' : String(Math.round(v)));

export function Legend({ items, hidden, onToggle }: { items: { name: string; color: string }[]; hidden: Set<string>; onToggle: (name: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => {
        const off = hidden.has(s.name);
        return (
          <button
            key={s.name}
            onClick={() => onToggle(s.name)}
            aria-pressed={!off}
            className={cn('focus-ring flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all', off ? 'border-white/5 text-ink-500' : 'border-white/10 bg-white/[0.03] text-ink-200 hover:bg-white/[0.06]')}
          >
            <span className="h-2 w-2 rounded-full transition-opacity" style={{ background: s.color, opacity: off ? 0.3 : 1 }} />
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

export function useToggleSet() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggle = (k: string) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  return { hidden, toggle };
}

export function Tooltip({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  const left = Math.min(Math.max(x, 70), w - 70);
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-ink-850/95 px-3 py-2 text-xs shadow-pop backdrop-blur" style={{ left, top: y - 10 }}>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg bg-white/[0.04] p-0.5 ring-1 ring-white/5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={cn('focus-ring rounded-md px-2.5 py-1 text-xs font-medium transition-all', value === o ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-400 hover:text-ink-200')}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function ChartFrame({ title, sub, right, children, className }: { title: string; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 p-4 shadow-card sm:p-5', className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-100">{title}</p>
          {sub && <div className="mt-0.5 text-xs text-ink-500">{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
