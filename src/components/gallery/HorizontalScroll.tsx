import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type HorizontalItem = { src: string; title: string; meta: string };
export type HorizontalScrollProps = { items: HorizontalItem[]; height?: number; className?: string; autoPreview?: boolean };

/** Scrolling down its own frame slides a track of large captioned images sideways. */
export function HorizontalScroll({ items, height = 460, className, autoPreview = true }: HorizontalScrollProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setDist(Math.max(0, (track.current?.scrollWidth ?? 0) - (stage.current?.clientWidth ?? 0)));
    const on = () => setP(Math.min(1, el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)));
    measure();
    const ro = new ResizeObserver(measure);
    if (stage.current) ro.observe(stage.current);
    el.addEventListener('scroll', on, { passive: true });
    let t = 0;
    if (autoPreview && !reduced()) t = window.setTimeout(() => el.scrollTo({ top: (el.scrollHeight - el.clientHeight) * 0.3, behavior: 'smooth' }), 900);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', on);
      clearTimeout(t);
    };
  }, [autoPreview]);

  return (
    <div ref={scroller} className={cn('w-full overflow-y-auto overscroll-contain rounded-2xl bg-ink-950 shadow-card [scrollbar-width:none]', className)} style={{ height }}>
      <div style={{ height: height * (1 + items.length * 0.55) }}>
        <div ref={stage} className="sticky top-0 flex flex-col justify-center overflow-hidden" style={{ height }}>
          <div className="mb-5 flex items-end justify-between px-5 sm:px-8">
            <h3 className="text-2xl font-semibold tracking-tight text-ink-50 sm:text-3xl">
              The <em className="font-serif font-normal italic text-brand-300">field</em> notes
            </h3>
            <span className="font-mono text-[11px] tabular-nums text-ink-500">
              {String(Math.min(items.length, Math.floor(p * items.length) + 1)).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
          </div>
          <div ref={track} className="flex gap-4 px-5 will-change-transform sm:gap-6 sm:px-8" style={{ transform: `translateX(${-p * dist}px)` }}>
            {items.map((it, i) => (
              <figure key={it.title} className="w-[72%] shrink-0 sm:w-[40%]">
                <div className="overflow-hidden rounded-2xl">
                  <img src={it.src} alt={it.title} className="aspect-[16/10] w-full object-cover" style={{ transform: `scale(1.15) translateX(${(p * items.length - i) * -14}px)` }} />
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-ink-100">{it.title}</span>
                  <span className="shrink-0 font-mono text-[11px] text-ink-500">{it.meta}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mx-5 mt-6 h-px bg-white/10 sm:mx-8">
            <div className="h-px bg-brand-400" style={{ width: `${p * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HorizontalScrollDemo() {
  const items = ARTWORKS.slice(0, 7).map((a) => ({ src: artwork(a.id, 900, 680), title: a.title, meta: a.place }));
  return <HorizontalScroll items={items} />;
}
