import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type CoverflowCarouselProps = {
  items?: Artwork[];
  /** Image URL for an item. Defaults to the procedural demo artwork. */
  src?: (item: Artwork) => string;
  initial?: number;
  className?: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** 3D coverflow: side covers rotate away, drag or swipe with inertia, arrow keys to step. */
export function CoverflowCarousel({ items = ARTWORKS, src = (a) => artwork(a.id, 640, 640), initial = 3, className }: CoverflowCarouselProps) {
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const [width, setWidth] = useState(800);
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, start: 0, t: 0, v: 0, moved: false });
  const last = items.length - 1;
  const urls = useMemo(() => items.map(src), [items, src]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const size = Math.round(clamp(width * 0.36, 150, 260));
  const gap = size * 0.52;
  const active = Math.round(pos);

  const go = (i: number) => setPos(clamp(i, 0, last));

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: pos, t: performance.now(), v: 0, moved: false };
    setDragging(true);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    const now = performance.now();
    const next = clamp(drag.current.start - dx / gap, -0.4, last + 0.4);
    drag.current.v = (next - pos) / Math.max(1, now - drag.current.t);
    drag.current.t = now;
    setPos(next);
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    go(Math.round(pos + drag.current.v * 180));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), go(active + 1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), go(active - 1));
  };

  const cur = items[clamp(active, 0, last)];

  return (
    <div className={cn('w-full select-none', className)}>
      <div
        ref={wrap}
        role="region"
        aria-roledescription="carousel"
        aria-label="Coverflow gallery"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="focus-ring relative cursor-grab touch-pan-y overflow-hidden rounded-2xl active:cursor-grabbing"
        style={{ height: size * 1.48, perspective: 1100 }}
      >
        <div className="absolute inset-x-0 top-[8%] h-full" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((it, i) => {
            const o = i - pos;
            const ao = Math.abs(o);
            if (ao > 4.5) return null;
            const side = clamp(o, -1, 1);
            const x = o * gap + side * size * 0.32;
            return (
              <button
                key={it.id}
                type="button"
                tabIndex={-1}
                aria-label={`${it.title}, ${it.artist}`}
                onClick={() => !drag.current.moved && go(i)}
                className={cn('absolute left-1/2 top-0', dragging ? '' : 'transition-transform duration-500 ease-smooth')}
                style={{
                  width: size,
                  marginLeft: -size / 2,
                  zIndex: 100 - Math.round(ao * 10),
                  transform: `translateX(${x}px) translateZ(${-ao * size * 0.45}px) rotateY(${-side * 52}deg)`,
                }}
              >
                <span className="relative block overflow-hidden rounded-xl shadow-pop ring-1 ring-white/10" style={{ height: size }}>
                  <img src={urls[i]} alt="" draggable={false} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-ink-950 transition-opacity duration-500" style={{ opacity: Math.min(0.55, ao * 0.22) }} />
                </span>
                {/* reflection */}
                <span className="pointer-events-none relative mt-1 block overflow-hidden rounded-xl opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]" style={{ height: size * 0.45 }}>
                  <img src={urls[i]} alt="" draggable={false} className="h-[222%] w-full -scale-y-100 object-cover object-bottom" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 px-1">
        <div key={cur.id} className="min-w-0 animate-fade-up">
          <p className="truncate text-[15px] font-medium text-ink-50">{cur.title}</p>
          <p className="truncate text-xs text-ink-400">
            {cur.artist} · {cur.place}, {cur.year}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="mr-2 font-mono text-xs tabular-nums text-ink-500">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous" className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/5 text-ink-200 ring-1 ring-white/10 transition hover:bg-white/10 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => go(active + 1)} disabled={active === last} aria-label="Next" className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/5 text-ink-200 ring-1 ring-white/10 transition hover:bg-white/10 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CoverflowCarouselDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <CoverflowCarousel />
    </div>
  );
}
