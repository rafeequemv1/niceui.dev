import { useEffect, useMemo, useRef, useState } from 'react';
import { Move, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

const CELL_W = 180;
const CELL_H = 220;

/** An endless, draggable wall of images. Tiles repeat in both directions. */
export function CanvasGallery({ images, height = 460, className }: { images: string[]; height?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -40, y: -60 });
  const [size, setSize] = useState({ w: 800, h: height });
  const [open, setOpen] = useState<number | null>(null);
  const vel = useRef({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      if (!drag.current) {
        const v = vel.current;
        if (Math.abs(v.x) + Math.abs(v.y) > 0.05) {
          setPos((p) => ({ x: p.x + v.x, y: p.y + v.y }));
          v.x *= 0.94;
          v.y *= 0.94;
        } else if (!reduce && open === null) setPos((p) => ({ x: p.x - 0.25, y: p.y - 0.12 }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const cols = Math.ceil(size.w / CELL_W) + 2;
  const rows = Math.ceil(size.h / CELL_H) + 2;
  const c0 = Math.floor(-pos.x / CELL_W) - 1;
  const r0 = Math.floor(-pos.y / CELL_H) - 1;
  const tiles = [];
  for (let r = r0; r < r0 + rows; r++)
    for (let c = c0; c < c0 + cols; c++) {
      const k = (((r * 5 + c * 7) % images.length) + images.length) % images.length;
      tiles.push({ r, c, k });
    }

  return (
    <div
      ref={box}
      className={cn('relative w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-ink-950 shadow-card active:cursor-grabbing', className)}
      style={{ height }}
      tabIndex={0}
      aria-label="Image canvas. Drag or use arrow keys to pan."
      onKeyDown={(e) => {
        const d = 40;
        if (e.key === 'ArrowLeft') vel.current.x += d / 6;
        if (e.key === 'ArrowRight') vel.current.x -= d / 6;
        if (e.key === 'ArrowUp') vel.current.y += d / 6;
        if (e.key === 'ArrowDown') vel.current.y -= d / 6;
        if (e.key === 'Escape') setOpen(null);
      }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
        vel.current = { x: 0, y: 0 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        d.x = e.clientX;
        d.y = e.clientY;
        d.moved += Math.abs(dx) + Math.abs(dy);
        vel.current = { x: dx, y: dy };
        setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (d && d.moved < 6) {
          const t = (e.target as HTMLElement).closest('[data-k]') as HTMLElement | null;
          if (t) setOpen(Number(t.dataset.k));
        }
      }}
    >
      {tiles.map(({ r, c, k }) => (
        <div
          key={`${r}:${c}`}
          data-k={k}
          className="absolute p-2"
          style={{ width: CELL_W, height: CELL_H, transform: `translate(${pos.x + c * CELL_W}px, ${pos.y + r * CELL_H + (c % 2 ? 40 : 0)}px)` }}
        >
          <img src={images[k]} alt="" draggable={false} className="h-full w-full rounded-xl object-cover transition-transform duration-300 hover:scale-[1.03]" />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.65))]" />
      <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
        <Move className="h-3 w-3" /> Drag to explore · click to open
      </span>
      {open !== null && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/80 p-6 backdrop-blur-sm animate-fade-in" onPointerDown={(e) => e.stopPropagation()}>
          <figure className="max-w-md animate-scale-in">
            <img src={images[open]} alt={ARTWORKS[open % ARTWORKS.length].title} className="max-h-[300px] w-full rounded-xl object-cover shadow-pop" />
            <figcaption className="mt-3 flex items-baseline justify-between gap-3">
              <span className="font-serif text-xl italic text-white">{ARTWORKS[open % ARTWORKS.length].title}</span>
              <span className="font-mono text-[11px] text-white/60">{ARTWORKS[open % ARTWORKS.length].artist}</span>
            </figcaption>
          </figure>
          <button onClick={() => setOpen(null)} aria-label="Close" className="focus-ring absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function CanvasGalleryDemo() {
  const images = useMemo(() => ARTWORKS.map((a) => artwork(a.id, 360, 440)), []);
  return <CanvasGallery images={images} />;
}
