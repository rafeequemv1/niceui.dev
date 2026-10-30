import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type ParallaxCarouselProps = {
  items?: Artwork[];
  src?: (item: Artwork) => string;
  /** Autoplay interval in ms. 0 disables autoplay. */
  interval?: number;
  className?: string;
};

/** Full-width slides whose images travel slower than the frame, with serif captions and an autoplay progress bar. */
export function ParallaxCarousel({ items = ARTWORKS.slice(0, 6), src = (a) => artwork(a.id, 1400, 900), interval = 5000, className }: ParallaxCarouselProps) {
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [progress, setProgress] = useState(0);
  const [width, setWidth] = useState(800);
  const frame = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const progressRef = useRef(0);
  const urls = useMemo(() => items.map(src), [items, src]);
  const n = items.length;

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = (i: number) => {
    setIndex(((i % n) + n) % n);
    progressRef.current = 0;
    setProgress(0);
  };

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!interval || paused || hover || dragging || reduce) return;
    let raf = 0;
    const startAt = performance.now() - progressRef.current * interval;
    let begin = startAt;
    const tick = (t: number) => {
      let p = (t - begin) / interval;
      if (p >= 1) {
        setIndex((i) => (i + 1) % n);
        begin = t;
        p = 0;
      }
      progressRef.current = p;
      setProgress(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [interval, paused, hover, dragging, n, index]);

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    setDragging(true);
  };
  const onMove = (e: PointerEvent) => dragging && setDx(e.clientX - startX.current);
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dx < -width * 0.15) go(index + 1);
    else if (dx > width * 0.15) go(index - 1);
    setDx(0);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), go(index + 1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), go(index - 1));
  };

  const cur = items[index];

  return (
    <div className={cn('w-full', className)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div
        ref={frame}
        role="region"
        aria-roledescription="carousel"
        aria-label="Parallax slider"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="focus-ring relative aspect-[4/5] w-full cursor-grab touch-pan-y select-none overflow-hidden rounded-3xl bg-ink-900 shadow-pop ring-1 ring-white/10 active:cursor-grabbing sm:aspect-[16/9]"
      >
        <div className={cn('absolute inset-0 flex', dragging ? '' : 'transition-transform duration-700 ease-smooth')} style={{ transform: `translateX(${-index * width + dx}px)` }}>
          {items.map((it, i) => {
            const offset = (i * width - index * width + dx) / width;
            return (
              <div key={it.id} className="relative h-full shrink-0 overflow-hidden" style={{ width }} aria-hidden={i !== index}>
                <img
                  src={urls[i]}
                  alt={it.title}
                  draggable={false}
                  className={cn('absolute inset-y-0 left-[-20%] h-full w-[140%] max-w-none object-cover', dragging ? '' : 'transition-transform duration-700 ease-smooth')}
                  style={{ transform: `translateX(${-offset * 38}%) scale(${1.04 - Math.min(0.04, Math.abs(offset) * 0.04)})` }}
                />
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
        <div className="pointer-events-none absolute left-5 top-5 font-mono text-[11px] tracking-wider text-white/70 sm:left-8 sm:top-7">
          {String(index + 1).padStart(2, '0')} <span className="text-white/35">/ {String(n).padStart(2, '0')}</span>
        </div>
        <div className="pointer-events-none absolute inset-x-5 bottom-6 sm:inset-x-8 sm:bottom-8">
          <p key={`p-${cur.id}`} className="text-xs uppercase tracking-[0.2em] text-white/60 animate-fade-up">
            {cur.place} · {cur.year}
          </p>
          <h3 key={`t-${cur.id}`} className="mt-2 max-w-xl font-serif text-[40px] italic leading-[0.95] text-white animate-fade-up sm:text-[64px]" style={{ animationDelay: '80ms' }}>
            {cur.title}
          </h3>
          <p key={`a-${cur.id}`} className="mt-3 text-sm text-white/70 animate-fade-up" style={{ animationDelay: '160ms' }}>
            by {cur.artist}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {items.map((it, i) => (
            <button key={it.id} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`} className="focus-ring group relative h-6 flex-1">
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/10 transition group-hover:bg-white/20">
                <span className="block h-full rounded-full bg-white" style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' }} />
              </span>
            </button>
          ))}
        </div>
        <button onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'} className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/5 text-ink-200 ring-1 ring-white/10 transition hover:bg-white/10">
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
        <button onClick={() => go(index - 1)} aria-label="Previous slide" className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/5 text-ink-200 ring-1 ring-white/10 transition hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button onClick={() => go(index + 1)} aria-label="Next slide" className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white text-ink-950 transition hover:bg-ink-100">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ParallaxCarouselDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ParallaxCarousel />
    </div>
  );
}
