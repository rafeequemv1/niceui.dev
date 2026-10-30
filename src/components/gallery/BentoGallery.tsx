import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

/** Slot layout of a 4×3 bento grid; slot 0 is the featured tile. */
const SLOTS = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-1 row-span-1',
];

export type BentoGalleryProps = { items?: Artwork[]; className?: string };

/** Editorial bento grid. Click any tile to swap it into the featured slot with a FLIP animation. */
export function BentoGallery({ items = ARTWORKS.slice(0, 6), className }: BentoGalleryProps) {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const nodes = useRef(new Map<number, HTMLElement>());
  const before = useRef(new Map<number, DOMRect>());

  const feature = (slot: number) => {
    if (slot === 0) return;
    nodes.current.forEach((el, id) => before.current.set(id, el.getBoundingClientRect()));
    setOrder((o) => {
      const n = [...o];
      [n[0], n[slot]] = [n[slot], n[0]];
      return n;
    });
  };

  useLayoutEffect(() => {
    if (!before.current.size) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    nodes.current.forEach((el, id) => {
      const a = before.current.get(id);
      if (!a || reduce) return;
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      const sx = a.width / b.width;
      const sy = a.height / b.height;
      if (!dx && !dy && sx === 1 && sy === 1) return;
      el.animate(
        [{ transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: 'top left', transform: 'none' }],
        { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' },
      );
    });
    before.current.clear();
  }, [order]);

  return (
    <div className={cn('grid w-full auto-rows-[92px] grid-cols-3 gap-2 sm:auto-rows-[120px] sm:grid-cols-4 sm:gap-3', className)}>
      {order.map((idx, slot) => {
        const a = items[idx];
        const featured = slot === 0;
        return (
          <button
            key={a.id}
            ref={(el) => {
              if (el) nodes.current.set(a.id, el);
              else nodes.current.delete(a.id);
            }}
            onClick={() => feature(slot)}
            aria-label={featured ? `${a.title}, featured` : `Feature ${a.title}`}
            aria-current={featured}
            className={cn(
              'focus-ring group relative overflow-hidden rounded-2xl bg-ink-900 text-left shadow-card',
              SLOTS[slot] ?? 'col-span-1 row-span-1',
              slot === 4 && 'max-sm:col-span-1',
              slot === 2 && 'max-sm:row-span-1',
            )}
          >
            <img src={artwork(a.id, featured ? 900 : 480, featured ? 720 : 480)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.05]" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              {featured && <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">Featured</span>}
              <span className={cn('block truncate font-medium text-white', featured ? 'text-base sm:text-xl' : 'text-xs sm:text-[13px]')}>{a.title}</span>
              <span className={cn('block truncate text-white/65', featured ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]')}>
                {a.artist} · {a.place}
              </span>
            </span>
            <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              {featured ? <ArrowUpRight className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function BentoGalleryDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <BentoGallery />
    </div>
  );
}
