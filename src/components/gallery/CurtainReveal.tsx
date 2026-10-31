import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STRIPS = 6;

export type CurtainSlide = { src: string; title: string; meta: string };
export type CurtainRevealProps = { slides: CurtainSlide[]; interval?: number; height?: number; className?: string };

/** Slides change behind a curtain of strips that pull away in alternating directions. */
export function CurtainReveal({ slides, interval = 4500, height = 460, className }: CurtainRevealProps) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  const busy = useRef(false);
  const still = reduced();

  const go = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      busy.current = !still;
      setPrev(still ? null : i);
      setI((v) => (v + dir + slides.length) % slides.length);
      setRun((r) => r + 1);
      window.setTimeout(() => {
        setPrev(null);
        busy.current = false;
      }, 1300);
    },
    [i, slides.length, still]
  );

  useEffect(() => {
    if (paused || still) return;
    const id = window.setTimeout(() => go(1), interval);
    return () => clearTimeout(id);
  }, [i, paused, still, interval, go]);

  const s = slides[i];
  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-2xl bg-ink-950 shadow-card', className)}
      style={{ height }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : null)}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Curtain gallery"
    >
      <style>{`@keyframes nui-cin{from{transform:scale(1.12)}to{transform:scale(1)}}@keyframes nui-up{to{transform:translateY(-101%)}}@keyframes nui-down{to{transform:translateY(101%)}}@keyframes nui-cap{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes nui-bar{from{width:0}to{width:100%}}`}</style>
      <img key={`c${run}`} src={s.src} alt={s.title} className="absolute inset-0 h-full w-full object-cover" style={{ animation: still ? undefined : 'nui-cin 1.6s cubic-bezier(.16,1,.3,1) both' }} />
      {prev !== null && (
        <div key={`p${run}`} className="pointer-events-none absolute inset-0 flex">
          {Array.from({ length: STRIPS }, (_, k) => (
            <div
              key={k}
              className="h-full flex-1"
              style={{
                backgroundImage: `url(${slides[prev].src})`,
                backgroundSize: `${STRIPS * 100}% 100%`,
                backgroundPosition: `${(k / (STRIPS - 1)) * 100}% 0`,
                animation: `${k % 2 ? 'nui-down' : 'nui-up'} 1s cubic-bezier(.7,0,.2,1) ${k * 55}ms forwards`,
              }}
            />
          ))}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div key={`t${run}`} className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
        <div style={{ animation: still ? undefined : 'nui-cap .8s .45s cubic-bezier(.16,1,.3,1) both' }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">{s.meta}</p>
          <h3 className="mt-1 font-serif text-3xl italic text-white sm:text-5xl">{s.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="mr-2 font-mono text-xs tabular-nums text-white/70">
            {String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>
          <button onClick={() => go(-1)} aria-label="Previous" className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:bg-white/15">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => go(1)} aria-label="Next" className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition hover:bg-white/15">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!still && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10">
          <div key={`b${run}`} className="h-full bg-brand-400" style={{ animation: `nui-bar ${interval}ms linear both`, animationPlayState: paused ? 'paused' : 'running' }} />
        </div>
      )}
    </div>
  );
}

export function CurtainRevealDemo() {
  const slides = ARTWORKS.slice(0, 6).map((a) => ({ src: artwork(a.id, 1280, 800), title: a.title, meta: `${a.artist} · ${a.place}` }));
  return <CurtainReveal slides={slides} />;
}
