import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type HoverRevealProps = {
  items?: Artwork[];
  /** Row shown on mount, before the pointer arrives. */
  defaultActive?: number | null;
  className?: string;
};

/** An editorial index where hovering a title floats its image beside the cursor, revealed with a clip-path. */
export function HoverReveal({ items = ARTWORKS.slice(0, 6), defaultActive = null, className }: HoverRevealProps) {
  const [active, setActive] = useState<number | null>(defaultActive);
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  // place the preview near the default row before any pointer input
  useEffect(() => {
    const w = wrap.current;
    if (!w || defaultActive === null) return;
    const row = w.querySelectorAll('li')[defaultActive] as HTMLElement | undefined;
    const x = w.clientWidth * 0.62;
    const y = row ? row.offsetTop + row.offsetHeight / 2 : w.clientHeight / 2;
    target.current = { x, y };
    pos.current = { x, y };
  }, [defaultActive]);

  // spring the floating card towards the pointer
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let vx = 0;
    let vy = 0;
    const tick = () => {
      const p = pos.current;
      const t = target.current;
      if (reduce) {
        p.x = t.x;
        p.y = t.y;
      } else {
        vx = (vx + (t.x - p.x) * 0.09) * 0.72;
        vy = (vy + (t.y - p.y) * 0.09) * 0.72;
        p.x += vx;
        p.y += vy;
      }
      const tilt = Math.max(-8, Math.min(8, vx * 0.6));
      if (card.current) card.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const track = (e: React.PointerEvent) => {
    const r = wrap.current!.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div ref={wrap} className={cn('relative w-full overflow-hidden rounded-2xl bg-ink-900 px-2 py-2 shadow-card sm:px-4', className)} onPointerMove={(e) => e.pointerType === 'mouse' && track(e)} onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}>
      <ul>
        {items.map((a, i) => (
          <li key={a.id} className="border-b border-white/5 last:border-0">
            <button
              onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
              onFocus={(e) => {
                const r = wrap.current!.getBoundingClientRect();
                const b = e.currentTarget.getBoundingClientRect();
                target.current = { x: r.width * 0.68, y: b.top - r.top + b.height / 2 };
                setActive(i);
              }}
              onClick={(e) => {
                if ((e.nativeEvent as PointerEvent).pointerType === 'mouse') return;
                track(e as unknown as React.PointerEvent);
                setActive((v) => (v === i ? null : i));
              }}
              className={cn('focus-ring group flex w-full items-baseline gap-3 rounded-lg px-2 py-3.5 text-left transition-colors sm:gap-5 sm:py-4', active !== null && active !== i ? 'text-ink-600' : 'text-ink-50')}
            >
              <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-ink-500">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1 truncate text-lg font-medium tracking-[-0.03em] transition-transform duration-500 ease-smooth group-hover:translate-x-1.5 sm:text-2xl">{a.title}</span>
              <span className="hidden shrink-0 text-xs text-ink-500 sm:block">{a.place}</span>
              <span className="w-10 shrink-0 text-right font-mono text-[11px] text-ink-500">{a.year}</span>
              <ArrowUpRight className={cn('h-4 w-4 shrink-0 transition-all duration-300', active === i ? 'text-brand-300 opacity-100' : 'opacity-0')} />
            </button>
          </li>
        ))}
      </ul>
      <div ref={card} aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 aspect-[4/5] w-36 sm:w-48" style={{ willChange: 'transform' }}>
        {items.map((a, i) => (
          <div
            key={a.id}
            className="absolute inset-0 overflow-hidden rounded-xl shadow-pop transition-[clip-path,opacity] duration-500 ease-smooth"
            style={{ clipPath: active === i ? 'inset(0% 0% 0% 0% round 12px)' : 'inset(50% 50% 50% 50% round 12px)', opacity: active === i ? 1 : 0 }}
          >
            <img src={artwork(a.id, 400, 500)} alt="" className={cn('h-full w-full object-cover transition-transform duration-700 ease-smooth', active === i ? 'scale-100' : 'scale-125')} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HoverRevealDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <HoverReveal defaultActive={1} />
    </div>
  );
}
