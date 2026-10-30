import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type PanelImage = { src: string; title: string; subtitle?: string; meta?: string };

export type ExpandingPanelsProps = {
  items: PanelImage[];
  /** Auto-advance interval in ms; 0 turns it off. */
  interval?: number;
  className?: string;
};

/** A horizontal accordion of image panels; stacks vertically on phones. */
export function ExpandingPanels({ items, interval = 4200, className }: ExpandingPanelsProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!interval || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [interval, paused, items.length]);

  return (
    <div
      className={cn('flex h-[420px] w-full flex-col gap-2 sm:h-[380px] sm:flex-row', className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      role="tablist"
      aria-label="Gallery panels"
    >
      {items.map((it, i) => {
        const on = i === active;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={on}
            aria-label={it.title}
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setActive((i + 1) % items.length);
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setActive((i - 1 + items.length) % items.length);
            }}
            className={cn(
              'focus-ring group relative min-h-0 min-w-0 overflow-hidden rounded-2xl bg-ink-850 text-left shadow-card transition-[flex-grow] duration-700 ease-smooth',
              on ? 'grow-[6]' : 'grow',
            )}
            style={{ flexBasis: 0 }}
          >
            <img src={it.src} alt="" className={cn('absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-smooth', on ? 'scale-100' : 'scale-125 saturate-50')} />
            <span className={cn('absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-500', on ? 'opacity-100' : 'opacity-60')} />
            <span
              className={cn(
                'absolute bottom-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[13px] font-medium tracking-wide text-white/80 transition-opacity duration-300 [writing-mode:vertical-rl] rotate-180 sm:block',
                on ? 'opacity-0' : 'opacity-100 delay-300',
              )}
            >
              {it.title}
            </span>
            <span className={cn('absolute inset-x-0 bottom-0 p-4 transition-all duration-500 sm:p-5', on ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-3 opacity-0 sm:translate-y-6')}>
              {it.meta && <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-300">{it.meta}</span>}
              <span className="mt-1 flex items-end justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-lg font-semibold tracking-tight text-white sm:text-2xl">{it.title}</span>
                  {it.subtitle && <span className="block truncate text-sm text-white/65">{it.subtitle}</span>}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors group-hover:bg-white group-hover:text-ink-950">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </span>
            </span>
            {on && interval > 0 && !paused && (
              <span key={active} className="absolute inset-x-4 top-4 h-0.5 overflow-hidden rounded-full bg-white/20">
                <span className="block h-full origin-left bg-white" style={{ animation: `gal-progress ${interval}ms linear both` }} />
              </span>
            )}
          </button>
        );
      })}
      <style>{'@keyframes gal-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}'}</style>
    </div>
  );
}

export function ExpandingPanelsDemo() {
  const items = useMemo(
    () => [0, 2, 6, 9, 11].map((id) => ({ src: artwork(id, 900, 900), title: ARTWORKS[id].title, subtitle: `${ARTWORKS[id].artist} · ${ARTWORKS[id].place}`, meta: `No. ${String(id + 1).padStart(2, '0')} · ${ARTWORKS[id].year}` })),
    [],
  );
  return <ExpandingPanels items={items} className="mx-auto max-w-4xl" />;
}
