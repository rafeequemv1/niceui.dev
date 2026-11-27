import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type FlickeringGridFade = 'none' | 'radial' | 'top' | 'bottom';

const FLICKER_MASKS: Record<FlickeringGridFade, string | undefined> = {
  none: undefined,
  radial: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
  top: 'linear-gradient(to bottom, transparent, black 45%)',
  bottom: 'linear-gradient(to top, transparent, black 45%)',
};

export type FlickeringGridProps = {
  /** Square size in px. */
  square?: number;
  /** Gap between squares in px. */
  gap?: number;
  /** Square colour as an "r,g,b" string. */
  rgb?: string;
  /** Highest opacity a square reaches, 0–1. */
  maxOpacity?: number;
  /** Chance per second that a square changes, 0–1. */
  flicker?: number;
  opacity?: number;
  fade?: FlickeringGridFade;
  className?: string;
};

/** A flickering grid background: a canvas of small squares that brighten and dim at random. Pauses off-screen. */
export function FlickeringGrid({ square = 4, gap = 6, rgb = '125,211,252', maxOpacity = 0.32, flicker = 0.25, opacity = 1, fade = 'radial', className }: FlickeringGridProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    const g = c.getContext('2d');
    if (!g) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let cols = 0;
    let rows = 0;
    let cells = new Float32Array(0);
    let raf = 0;
    let visible = true;
    let last = 0;

    const draw = () => {
      g.clearRect(0, 0, c.width, c.height);
      const step = (square + gap) * dpr;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
          g.fillStyle = `rgba(${rgb},${cells[i * rows + j]})`;
          g.fillRect(i * step, j * step, square * dpr, square * dpr);
        }
    };
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      c.width = Math.max(1, Math.floor(w * dpr));
      c.height = Math.max(1, Math.floor(h * dpr));
      c.style.width = w + 'px';
      c.style.height = h + 'px';
      cols = Math.ceil(w / (square + gap));
      rows = Math.ceil(h / (square + gap));
      cells = new Float32Array(cols * rows).map(() => Math.random() * maxOpacity);
      draw();
    };
    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      for (let k = 0; k < cells.length; k++) if (Math.random() < flicker * dt) cells[k] = Math.random() * maxOpacity;
      draw();
      raf = requestAnimationFrame(tick);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [square, gap, rgb, maxOpacity, flicker]);

  const mask = FLICKER_MASKS[fade];
  return (
    <div ref={wrap} aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} style={{ opacity, maskImage: mask, WebkitMaskImage: mask }}>
      <canvas ref={canvas} className="absolute inset-0" />
    </div>
  );
}

function FlickerDemoChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn('focus-ring rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors', on ? 'bg-brand-300 text-ink-950' : 'bg-white/[0.06] text-ink-300 hover:text-ink-50')}
    >
      {children}
    </button>
  );
}

const FLICKER_COLOURS: Array<[string, string]> = [
  ['Sky', '125,211,252'],
  ['Mint', '110,231,183'],
  ['Rose', '251,113,133'],
  ['White', '255,255,255'],
];

export function FlickeringGridDemo() {
  const [rgb, setRgb] = useState(FLICKER_COLOURS[0][1]);
  const [speed, setSpeed] = useState(25);
  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink-950 px-4 py-10">
      <FlickeringGrid rgb={rgb} flicker={speed / 100} />
      <div className="relative max-w-sm rounded-2xl border border-white/10 bg-ink-950/70 p-6 text-center backdrop-blur">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">Flickering grid</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-50">A screen that feels alive</h3>
        <p className="mt-2 text-sm text-ink-400">One canvas, paused when it scrolls away.</p>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 p-2 backdrop-blur">
        {FLICKER_COLOURS.map(([label, v]) => (
          <FlickerDemoChip key={v} on={rgb === v} onClick={() => setRgb(v)}>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: `rgb(${v})` }} />
            {label}
          </FlickerDemoChip>
        ))}
        <label className="flex items-center gap-2 px-1 text-[11px] text-ink-400">
          Speed
          <input type="range" min={5} max={80} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-20 accent-sky-300" aria-label="Flicker speed" />
        </label>
      </div>
    </div>
  );
}
