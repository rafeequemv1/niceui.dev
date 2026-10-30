import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type RingCarouselProps = {
  items?: Artwork[];
  src?: (item: Artwork) => string;
  /** Degrees per second while idle. 0 disables auto-rotation. */
  speed?: number;
  className?: string;
};

/** Cards on a rotating cylinder. Drag to spin with momentum; click a card to bring it to the front. */
export function RingCarousel({ items = ARTWORKS.slice(0, 10), src = (a) => artwork(a.id, 420, 560), speed = 9, className }: RingCarouselProps) {
  const [rot, setRot] = useState(0);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0);
  const vel = useRef(0);
  const target = useRef<number | null>(null);
  const drag = useRef<{ x: number; t: number; moved: boolean } | null>(null);
  const urls = useMemo(() => items.map(src), [items, src]);
  const n = items.length;
  const step = 360 / n;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      let r = rotRef.current;
      if (target.current !== null) {
        const d = target.current - r;
        r += d * Math.min(1, dt * 8);
        if (Math.abs(d) < 0.05) (r = target.current), (target.current = null);
      } else if (!drag.current) {
        if (Math.abs(vel.current) > 0.5) {
          r += vel.current * dt;
          vel.current *= Math.pow(0.04, dt);
        } else if (!hover && !paused && !reduce && speed) r -= speed * dt;
      }
      if (r !== rotRef.current) {
        rotRef.current = r;
        setRot(r);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hover, paused, speed]);

  const cardW = Math.round(Math.min(210, Math.max(110, width * 0.24)));
  const radius = Math.round((cardW / 2 / Math.tan(Math.PI / n)) * 1.18);
  const front = (((-Math.round(rot / step)) % n) + n) % n;

  const bringFront = (i: number) => {
    const base = -i * step;
    const k = Math.round((rotRef.current - base) / 360);
    target.current = base + k * 360;
    vel.current = 0;
  };

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: performance.now(), moved: false };
    target.current = null;
    vel.current = 0;
  };
  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    const now = performance.now();
    const deg = dx * 0.35;
    rotRef.current += deg;
    setRot(rotRef.current);
    vel.current = (deg / Math.max(1, now - d.t)) * 1000;
    d.x = e.clientX;
    d.t = now;
  };
  const onUp = () => {
    setTimeout(() => (drag.current = null), 0);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), bringFront((front + 1) % n));
    if (e.key === 'ArrowLeft') (e.preventDefault(), bringFront((front - 1 + n) % n));
  };

  const cur = items[front];

  return (
    <div className={cn('relative w-full select-none', className)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div
        ref={wrap}
        role="region"
        aria-roledescription="carousel"
        aria-label="3D ring gallery"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="focus-ring relative cursor-grab touch-pan-y overflow-hidden rounded-2xl active:cursor-grabbing"
        style={{ height: cardW * 1.33 + 120, perspective: 1300 }}
      >
        <div className="pointer-events-none absolute inset-x-[10%] bottom-6 h-16 rounded-[50%] bg-brand-500/20 blur-2xl" />
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: cardW, height: cardW * 1.33, marginLeft: -cardW / 2, marginTop: (-cardW * 1.33) / 2 - 10, transformStyle: 'preserve-3d', transform: `translateZ(${-radius}px) rotateX(-6deg) rotateY(${rot}deg)` }}
        >
          {items.map((it, i) => {
            const a = i * step + rot;
            const facing = Math.cos((a * Math.PI) / 180);
            return (
              <button
                key={it.id}
                type="button"
                tabIndex={-1}
                aria-label={`Bring ${it.title} to the front`}
                onClick={() => !drag.current?.moved && bringFront(i)}
                className="absolute inset-0 overflow-hidden rounded-xl ring-1 ring-white/15 [backface-visibility:hidden]"
                style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, boxShadow: '0 24px 50px -20px rgba(0,0,0,0.8)' }}
              >
                <img src={urls[i]} alt="" draggable={false} className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-ink-950" style={{ opacity: Math.max(0, 0.65 - facing * 0.65) }} />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 text-left">
                  <span className="block truncate text-[11px] font-medium text-white">{it.title}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <div key={cur.id} className="min-w-0 animate-fade-up">
          <p className="truncate font-serif text-xl italic text-ink-50">{cur.title}</p>
          <p className="truncate text-xs text-ink-400">
            {cur.artist} · {cur.place}
          </p>
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Resume rotation' : 'Pause rotation'}
          className="focus-ring flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/5 px-3 text-xs text-ink-200 ring-1 ring-white/10 transition hover:bg-white/10"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  );
}

export function RingCarouselDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <RingCarousel />
    </div>
  );
}
