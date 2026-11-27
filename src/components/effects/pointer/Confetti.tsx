import { useCallback, useEffect, useRef, useState } from 'react';
import { PartyPopper, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ConfettiOptions = {
  /** Origin in 0–1 of the canvas (x from left, y from top). */
  x?: number;
  y?: number;
  /** Launch angle in degrees (90 = straight up). */
  angle?: number;
  /** Cone width in degrees. */
  spread?: number;
  count?: number;
  /** Initial speed in px per frame. */
  speed?: number;
  colors?: string[];
};

type Piece = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; c: string; life: number; shape: 0 | 1 | 2; wob: number };

const DEFAULT_COLORS = ['#7dd3fc', '#38bdf8', '#e0f2fe', '#c4b5fd', '#fda4af', '#fde68a', '#86efac'];

/**
 * Confetti animation on a canvas with an imperative `fire()` API.
 * Attach `ref` to a <canvas> that covers the area you want confetti in.
 */
export function useConfetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pieces = useRef<Piece[]>([]);
  const raf = useRef(0);

  const loop = useCallback(() => {
    const c = ref.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const ps = pieces.current;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.vy += 0.22;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.wob += 0.12;
      p.x += p.vx + Math.sin(p.wob) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.004;
      if (p.y > h + 30 || p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }
      g.save();
      g.globalAlpha = Math.min(1, p.life * 2);
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.scale(1, Math.cos(p.wob));
      g.fillStyle = p.c;
      if (p.shape === 0) g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      else if (p.shape === 1) {
        g.beginPath();
        g.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        g.fill();
      } else {
        g.beginPath();
        g.moveTo(0, -p.h / 2);
        g.lineTo(p.w / 2, p.h / 2);
        g.lineTo(-p.w / 2, p.h / 2);
        g.closePath();
        g.fill();
      }
      g.restore();
    }
    raf.current = ps.length ? requestAnimationFrame(loop) : 0;
  }, []);

  const fire = useCallback(
    (o: ConfettiOptions = {}) => {
      const c = ref.current;
      if (!c) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const { x = 0.5, y = 0.6, angle = 90, spread = 70, count = 120, speed = 13, colors = DEFAULT_COLORS } = o;
      const n = reduced ? Math.round(count / 4) : count;
      const ox = x * c.clientWidth;
      const oy = y * c.clientHeight;
      for (let i = 0; i < n; i++) {
        const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
        const v = speed * (0.55 + Math.random() * 0.6);
        pieces.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * v,
          vy: -Math.sin(a) * v,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 8,
          c: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          shape: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
          wob: Math.random() * 6,
        });
      }
      if (!raf.current) raf.current = requestAnimationFrame(loop);
    },
    [loop],
  );

  /** Two cannons from the bottom corners. */
  const cannons = useCallback(
    (o: Omit<ConfettiOptions, 'x' | 'y' | 'angle'> = {}) => {
      fire({ ...o, x: 0, y: 1, angle: 60, spread: 40, count: o.count ?? 90, speed: o.speed ?? 17 });
      fire({ ...o, x: 1, y: 1, angle: 120, spread: 40, count: o.count ?? 90, speed: o.speed ?? 17 });
    },
    [fire],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { ref, fire, cannons };
}

export function ConfettiDemo() {
  const { ref, fire, cannons } = useConfetti();
  const [done, setDone] = useState(false);
  return (
    <div className="relative grid h-[340px] w-full max-w-2xl place-items-center overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-950">
      <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative text-center">
        <p className={cn('text-sm text-ink-400 transition-opacity', done && 'opacity-0')}>Ship it, then celebrate.</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-ink-50">{done ? 'Deployed to production 🎉' : 'Your launch is ready'}</h3>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={(e) => {
              const c = ref.current!.getBoundingClientRect();
              const b = e.currentTarget.getBoundingClientRect();
              fire({ x: (b.left + b.width / 2 - c.left) / c.width, y: (b.top - c.top) / c.height });
              setDone(true);
            }}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand-300 px-5 py-2.5 text-sm font-medium text-ink-950 transition-transform active:scale-95"
          >
            <PartyPopper className="h-4 w-4" /> Burst
          </button>
          <button onClick={() => (cannons(), setDone(true))} className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-ink-200 transition-transform active:scale-95">
            <Sparkles className="h-4 w-4" /> Side cannons
          </button>
        </div>
      </div>
    </div>
  );
}
