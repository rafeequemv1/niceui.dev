import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type WallArtwork = { src: string; title: string; artist: string; year: number | string; place?: string };

export type Gallery3DWallProps = {
  items: WallArtwork[];
  initial?: number;
  className?: string;
};

/** A perspective gallery wall. Drag, swipe or use the arrow keys to walk along it. */
export function Gallery3DWall({ items, initial = 0, className }: Gallery3DWallProps) {
  const [active, setActive] = useState(initial);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const go = (i: number) => setActive(Math.max(0, Math.min(items.length - 1, i)));
  const cur = items[active];

  return (
    <div
      className={cn('relative w-full select-none overflow-hidden rounded-2xl bg-gradient-to-b from-ink-900 via-ink-950 to-ink-900 shadow-card', className)}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="3D gallery wall"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(active + 1);
        if (e.key === 'ArrowLeft') go(active - 1);
      }}
      onPointerDown={(e) => (drag.current = { x: e.clientX, moved: false })}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 50) {
          go(active + (dx < 0 ? 1 : -1));
          drag.current = { x: e.clientX, moved: true };
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      {/* floor and ceiling lines */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0_1px,transparent_1px_60px)] [mask-image:linear-gradient(transparent,black)] [transform:perspective(500px)_rotateX(60deg)] origin-bottom" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(125,211,252,0.12),transparent_70%)]" />
      <div className="relative h-[300px] [perspective:1100px] sm:h-[340px]">
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {items.map((it, i) => {
            const off = i - active;
            const abs = Math.abs(off);
            if (abs > 4) return null;
            return (
              <button
                key={i}
                tabIndex={-1}
                onClick={() => !drag.current?.moved && go(i)}
                aria-label={`${it.title} by ${it.artist}`}
                className="absolute left-1/2 top-1/2 w-[42%] max-w-[250px] transition-all duration-700 ease-smooth sm:w-[30%]"
                style={{
                  transform: `translate(-50%, -50%) translateX(${off * 62}%) translateZ(${off === 0 ? 40 : -abs * 70}px) rotateY(${off === 0 ? 0 : off < 0 ? 38 : -38}deg)`,
                  zIndex: 10 - abs,
                  opacity: abs > 3 ? 0 : 1,
                }}
              >
                <span className={cn('block rounded-[6px] bg-[#e9e3d6] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] transition-[filter] duration-700 sm:p-3.5', off !== 0 && 'brightness-[0.55]')}>
                  <span className="block bg-white/90 p-1.5 shadow-inner">
                    <img src={it.src} alt="" draggable={false} className="aspect-[4/5] w-full object-cover" />
                  </span>
                </span>
                <span className={cn('absolute -bottom-6 left-1/2 h-6 w-[80%] -translate-x-1/2 rounded-full bg-black/60 blur-xl transition-opacity', off === 0 ? 'opacity-100' : 'opacity-40')} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="relative flex items-end justify-between gap-4 border-t border-white/5 px-4 py-3.5 sm:px-6">
        <div key={active} className="min-w-0 animate-fade-up">
          <p className="truncate font-serif text-xl italic text-ink-50">{cur.title}</p>
          <p className="truncate text-xs text-ink-400">
            {cur.artist}
            {cur.place ? ` · ${cur.place}` : ''} · {cur.year}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[11px] tabular-nums text-ink-500">
            {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
          <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous artwork" className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/5 text-ink-200 transition-colors hover:bg-white/10 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => go(active + 1)} disabled={active === items.length - 1} aria-label="Next artwork" className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/5 text-ink-200 transition-colors hover:bg-white/10 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Gallery3DWallDemo() {
  const items = useMemo(() => ARTWORKS.slice(0, 9).map((a) => ({ src: artwork(a.id, 480, 600), title: a.title, artist: a.artist, year: a.year, place: a.place })), []);
  return <Gallery3DWall items={items} initial={3} className="mx-auto max-w-4xl" />;
}
