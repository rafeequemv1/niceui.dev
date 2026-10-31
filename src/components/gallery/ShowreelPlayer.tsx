import { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type Chapter = { title: string; image: string; duration: number };

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function ShowreelPlayer({ chapters, autoPlay = true, className }: { chapters: Chapter[]; autoPlay?: boolean; className?: string }) {
  const total = chapters.reduce((a, c) => a + c.duration, 0);
  const starts = useMemo(() => chapters.reduce<number[]>((acc, c, i) => [...acc, i ? acc[i - 1] + chapters[i - 1].duration : 0], []), [chapters]);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [full, setFull] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  useEffect(() => {
    if (autoPlay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(true);
  }, [autoPlay]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, now - last) / 1000;
      last = now;
      setT((v) => (v + dt >= total ? 0 : v + dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  const idx = Math.max(0, starts.findIndex((s, i) => t >= s && t < s + chapters[i].duration));
  const local = (t - starts[idx]) / chapters[idx].duration;
  const at = (x: number) => {
    const r = bar.current!.getBoundingClientRect();
    return Math.min(total - 0.01, Math.max(0, ((x - r.left) / r.width) * total));
  };
  const jump = (i: number) => setT(starts[(i + chapters.length) % chapters.length] + 0.01);
  const hoverIdx = hover === null ? null : Math.max(0, starts.findIndex((s, i) => hover >= s && hover < s + chapters[i].duration));

  return (
    <div className={cn('w-full', full ? 'absolute inset-0 z-20 flex items-center bg-black p-3' : 'relative', className)}>
      <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div
          className="group relative aspect-video overflow-hidden rounded-2xl bg-black shadow-card"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ') (e.preventDefault(), setPlaying((p) => !p));
            if (e.key === 'ArrowRight') setT((v) => Math.min(total - 0.01, v + 2));
            if (e.key === 'ArrowLeft') setT((v) => Math.max(0, v - 2));
          }}
          aria-label="Showreel player"
        >
          {chapters.map((c, i) => (
            <img
              key={i}
              src={c.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: i === idx ? 1 : 0, transform: i === idx ? `scale(${1.04 + local * 0.1}) translate(${(i % 2 ? -1 : 1) * local * 2}%, ${local * -1.5}%)` : 'scale(1.04)' }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          <div className="absolute left-4 top-3 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-white/70">
            <span className={cn('h-1.5 w-1.5 rounded-full', playing ? 'animate-pulse bg-rose-500' : 'bg-white/40')} /> Reel 2026 · Ch {idx + 1}/{chapters.length}
          </div>
          <p key={idx} className="absolute bottom-16 left-4 font-serif text-2xl italic text-white animate-fade-up sm:text-3xl">{chapters[idx].title}</p>
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} className={cn('focus-ring absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-opacity', playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100')}>
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
          </button>
          <div className="absolute inset-x-3 bottom-3 space-y-2">
            <div
              ref={bar}
              className="relative h-5 cursor-pointer touch-none"
              onPointerDown={(e) => {
                drag.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                setT(at(e.clientX));
              }}
              onPointerMove={(e) => {
                setHover(at(e.clientX));
                if (drag.current) setT(at(e.clientX));
              }}
              onPointerUp={() => (drag.current = false)}
              onPointerLeave={() => setHover(null)}
            >
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/20" />
              <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-400" style={{ width: `${(t / total) * 100}%` }} />
              {starts.slice(1).map((s) => (
                <span key={s} className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded bg-white/60" style={{ left: `${(s / total) * 100}%` }} />
              ))}
              <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${(t / total) * 100}%` }} />
              {hover !== null && hoverIdx !== null && (
                <div className="pointer-events-none absolute bottom-6 hidden w-28 -translate-x-1/2 overflow-hidden rounded-lg border border-white/20 bg-black shadow-pop sm:block" style={{ left: `clamp(56px, ${(hover / total) * 100}%, calc(100% - 56px))` }}>
                  <img src={chapters[hoverIdx].image} alt="" className="aspect-video w-full object-cover" />
                  <p className="truncate px-1.5 py-1 font-mono text-[9px] text-white/80">{fmt(hover)} · {chapters[hoverIdx].title}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-white">
              <button onClick={() => jump(idx - 1)} aria-label="Previous chapter" className="focus-ring grid h-7 w-7 place-items-center rounded-md hover:bg-white/10"><SkipBack className="h-3.5 w-3.5" /></button>
              <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'} className="focus-ring grid h-7 w-7 place-items-center rounded-md hover:bg-white/10">{playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</button>
              <button onClick={() => jump(idx + 1)} aria-label="Next chapter" className="focus-ring grid h-7 w-7 place-items-center rounded-md hover:bg-white/10"><SkipForward className="h-3.5 w-3.5" /></button>
              <span className="ml-1 font-mono text-[11px] tabular-nums text-white/80">{fmt(t)} / {fmt(total)}</span>
              <button onClick={() => setFull((f) => !f)} aria-label={full ? 'Exit full view' : 'Full view'} className="focus-ring ml-auto grid h-7 w-7 place-items-center rounded-md hover:bg-white/10">{full ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}</button>
            </div>
          </div>
        </div>
        {!full && (
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {chapters.map((c, i) => (
              <li key={i} className="shrink-0 lg:shrink">
                <button onClick={() => jump(i)} className={cn('focus-ring flex w-44 items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors lg:w-full', i === idx ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]')}>
                  <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md">
                    <img src={c.image} alt="" className="h-full w-full object-cover" />
                    {i === idx && <span className="absolute bottom-0 left-0 h-0.5 bg-brand-400" style={{ width: `${local * 100}%` }} />}
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block truncate text-[12.5px]', i === idx ? 'text-ink-50' : 'text-ink-300')}>{c.title}</span>
                    <span className="font-mono text-[10px] text-ink-500">{fmt(starts[i])}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function ShowreelPlayerDemo() {
  const chapters = useMemo(() => [0, 2, 3, 6, 9].map((id, i) => ({ title: ARTWORKS[id].title, image: artwork(id, 960, 540), duration: [6, 5, 7, 5, 6][i] })), []);
  return (
    <div className="relative w-full">
      <ShowreelPlayer chapters={chapters} />
    </div>
  );
}
