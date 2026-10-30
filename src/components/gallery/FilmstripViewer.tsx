import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type FilmstripViewerProps = {
  items?: Artwork[];
  /** Seconds per slide while autoplaying. */
  interval?: number;
  autoplay?: boolean;
  className?: string;
};

/** A cinematic stage with crossfade and Ken Burns motion, a synced filmstrip and an autoplay ring. */
export function FilmstripViewer({ items = ARTWORKS, interval = 5, autoplay = true, className }: FilmstripViewerProps) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [hover, setHover] = useState(false);
  const [reduce, setReduce] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const live = playing && !hover && !reduce;

  useEffect(() => setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  useEffect(() => {
    if (!live) return;
    const id = window.setTimeout(() => setI((v) => (v + 1) % items.length), interval * 1000);
    return () => clearTimeout(id);
  }, [i, live, interval, items.length]);
  useEffect(() => {
    const s = strip.current;
    const el = s?.children[i] as HTMLElement | undefined;
    if (s && el) s.scrollTo({ left: el.offsetLeft - s.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [i]);

  const go = (d: number) => setI((v) => (v + d + items.length) % items.length);
  const a = items[i];

  return (
    <div
      className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') (e.preventDefault(), go(1));
        if (e.key === 'ArrowLeft') (e.preventDefault(), go(-1));
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Photo filmstrip"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        {items.map((it, k) => (
          <img
            key={it.id}
            src={artwork(it.id, 960, 600)}
            alt={k === i ? `${it.title} by ${it.artist}` : ''}
            aria-hidden={k !== i}
            className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-smooth', k === i ? 'opacity-100' : 'opacity-0')}
            style={k === i && !reduce ? { animation: `${k % 2 ? 'fs-kb-b' : 'fs-kb'} ${interval + 1.5}s ease-out both` } : undefined}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div key={a.id} className="absolute bottom-4 left-4 right-24 animate-fade-up">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
            {a.place} · {a.year}
          </p>
          <p className="mt-1 truncate text-lg font-medium tracking-tight text-white sm:text-2xl">{a.title}</p>
          <p className="truncate text-xs text-white/60 sm:text-sm">{a.artist}</p>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
          <button onClick={() => go(-1)} aria-label="Previous" className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white/15">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => go(1)} aria-label="Next" className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white/15">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          className="focus-ring absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
            <circle
              key={`${i}-${live}`}
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="100.5"
              style={{ strokeDashoffset: 100.5, animation: live ? `fs-ring ${interval}s linear forwards` : undefined }}
            />
          </svg>
          {playing ? <Pause className="relative h-3.5 w-3.5 fill-current" /> : <Play className="relative ml-0.5 h-3.5 w-3.5 fill-current" />}
        </button>
      </div>
      <div ref={strip} className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none]">
        {items.map((it, k) => (
          <button
            key={it.id}
            onClick={() => setI(k)}
            aria-label={`Show ${it.title}`}
            aria-current={k === i}
            className={cn('focus-ring group relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 sm:h-16 sm:w-24', k === i ? 'opacity-100' : 'opacity-45 hover:opacity-80')}
          >
            <img src={artwork(it.id, 320, 320)} alt="" className="h-full w-full object-cover" />
            <span className={cn('absolute inset-x-1.5 bottom-1 h-0.5 rounded-full bg-brand-300 transition-transform duration-500 ease-smooth', k === i ? 'scale-x-100' : 'scale-x-0')} />
          </button>
        ))}
      </div>
      <style>{`@keyframes fs-kb{from{transform:scale(1.12) translate(2%,1%)}to{transform:scale(1) translate(0,0)}}@keyframes fs-kb-b{from{transform:scale(1) translate(0,0)}to{transform:scale(1.12) translate(-2%,-1%)}}@keyframes fs-ring{to{stroke-dashoffset:0}}`}</style>
    </div>
  );
}

export function FilmstripViewerDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <FilmstripViewer />
    </div>
  );
}
