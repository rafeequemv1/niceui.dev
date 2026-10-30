import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type MarqueeImage = { src: string; title: string; caption?: string };

export type InfiniteMarqueeGalleryProps = {
  rows: MarqueeImage[][];
  /** Base speed in px per second. */
  speed?: number;
  className?: string;
};

/** Rows of images drifting in opposite directions; scroll or drag velocity speeds them up. */
export function InfiniteMarqueeGallery({ rows, speed = 40, className }: InfiniteMarqueeGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const tracks = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({ x: rows.map(() => 0), boost: 0, hover: false, drag: null as null | number });

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      s.boost *= 0.92;
      const base = reduce || s.hover ? 0 : speed;
      tracks.current.forEach((el, i) => {
        if (!el) return;
        const dir = i % 2 === 0 ? -1 : 1;
        const half = el.scrollWidth / 2;
        s.x[i] += (dir * base + dir * s.boost) * dt;
        if (half > 0) {
          if (s.x[i] <= -half) s.x[i] += half;
          if (s.x[i] > 0) s.x[i] -= half;
        }
        el.style.transform = `translate3d(${s.x[i]}px,0,0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onWheel = (e: WheelEvent) => {
      state.current.boost = Math.min(900, state.current.boost + Math.abs(e.deltaY) * 2);
    };
    const el = root.current;
    el?.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener('wheel', onWheel);
    };
  }, [speed]);

  return (
    <div
      ref={root}
      className={cn('relative w-full touch-pan-y select-none space-y-3 overflow-hidden py-1 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]', className)}
      onPointerEnter={() => (state.current.hover = true)}
      onPointerLeave={() => {
        state.current.hover = false;
        state.current.drag = null;
      }}
      onPointerDown={(e) => (state.current.drag = e.clientX)}
      onPointerMove={(e) => {
        const s = state.current;
        if (s.drag === null) return;
        const dx = e.clientX - s.drag;
        s.drag = e.clientX;
        s.x = s.x.map((x, i) => x + (i % 2 === 0 ? dx : -dx));
        s.boost = Math.min(900, s.boost + Math.abs(dx) * 4);
      }}
      onPointerUp={() => (state.current.drag = null)}
      aria-label="Scrolling image gallery"
      role="region"
    >
      {rows.map((row, i) => (
        <div key={i} ref={(el) => (tracks.current[i] = el)} className="flex w-max gap-3 will-change-transform">
          {[...row, ...row].map((img, j) => (
            <figure key={j} className="group relative h-28 w-44 shrink-0 overflow-hidden rounded-xl bg-ink-850 shadow-card sm:h-36 sm:w-56" aria-hidden={j >= row.length}>
              <img src={img.src} alt={img.title} draggable={false} className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/80 to-transparent p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="truncate text-[12px] font-medium text-white">{img.title}</p>
                {img.caption && <p className="truncate text-[10.5px] text-white/60">{img.caption}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

export function InfiniteMarqueeGalleryDemo() {
  const rows = useMemo(() => {
    const imgs = ARTWORKS.map((a) => ({ src: artwork(a.id, 560, 360), title: a.title, caption: `${a.artist} · ${a.place}` }));
    return [imgs.slice(0, 6), imgs.slice(6, 12), [...imgs.slice(3, 9)].reverse()];
  }, []);
  return (
    <div className="w-full">
      <InfiniteMarqueeGallery rows={rows} />
      <p className="mt-4 text-center text-xs text-ink-500">Hover to pause · scroll or drag to speed up</p>
    </div>
  );
}
