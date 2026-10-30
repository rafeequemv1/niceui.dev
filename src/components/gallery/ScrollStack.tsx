import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type StackImage = { src: string; title: string; caption?: string };

export type ScrollStackProps = {
  items: StackImage[];
  /** Height of the scroll viewport. */
  height?: number;
  className?: string;
};

/** Sticky image cards that stack and recede as you scroll inside the gallery. */
export function ScrollStack({ items, height = 440, className }: ScrollStackProps) {
  const box = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const on = () => setP(el.scrollTop / Math.max(1, el.clientHeight * 0.8));
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, []);

  const idx = Math.min(items.length - 1, Math.round(p));

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div ref={box} className="relative overflow-y-auto overscroll-contain [scrollbar-width:none]" style={{ height }} tabIndex={0} aria-label="Scrolling image stack">
        {items.map((it, i) => {
          const behind = Math.max(0, p - i);
          const scale = 1 - Math.min(behind, 3) * 0.06;
          return (
            <div key={i} className="sticky top-0 flex items-center justify-center px-4 sm:px-8" style={{ height: height * 0.8, top: 18 + Math.min(i, 4) * 10, zIndex: i }}>
              <figure
                className="relative h-[86%] w-full max-w-2xl overflow-hidden rounded-2xl shadow-[0_-18px_40px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 will-change-transform"
                style={{ transform: `scale(${scale})`, filter: `brightness(${1 - Math.min(behind, 2) * 0.25})` }}
              >
                <img src={it.src} alt={it.title} className="h-full w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-5">
                  <span className="min-w-0">
                    <span className="block truncate text-base font-semibold text-white sm:text-xl">{it.title}</span>
                    {it.caption && <span className="block truncate text-xs text-white/65 sm:text-sm">{it.caption}</span>}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-white/60">{String(i + 1).padStart(2, '0')}</span>
                </figcaption>
              </figure>
            </div>
          );
        })}
        <div style={{ height: height * 0.35 }} />
      </div>
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-1.5" aria-hidden>
        {items.map((_, i) => (
          <span key={i} className={cn('w-1 rounded-full transition-all duration-300', i === idx ? 'h-5 bg-brand-300' : 'h-1.5 bg-white/20')} />
        ))}
      </div>
      <div className="pointer-events-none absolute left-4 top-3 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[10.5px] tabular-nums text-white/80 backdrop-blur" aria-live="polite">
        {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
      </div>
    </div>
  );
}

export function ScrollStackDemo() {
  const items = useMemo(() => [1, 3, 5, 7, 8, 10].map((id) => ({ src: artwork(id, 1100, 700), title: ARTWORKS[id].title, caption: `${ARTWORKS[id].artist} · ${ARTWORKS[id].place}, ${ARTWORKS[id].year}` })), []);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Nudge the stack on first view so the thumbnail shows cards layering.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scroller = ref.current?.querySelector('[aria-label="Scrolling image stack"]') as HTMLElement | null;
    const id = window.setTimeout(() => scroller?.scrollTo({ top: (scroller.clientHeight * 0.8) * 1.4, behavior: 'smooth' }), 900);
    return () => clearTimeout(id);
  }, []);
  return (
    <div ref={ref} className="mx-auto w-full max-w-3xl">
      <ScrollStack items={items} />
      <p className="mt-3 text-center text-xs text-ink-500">Scroll inside the gallery</p>
    </div>
  );
}
