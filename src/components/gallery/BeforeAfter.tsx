import { useEffect, useRef, useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from './art';

export type BeforeAfterProps = {
  before: string;
  after: string;
  /** CSS filter applied to the before image, handy when you only have one photo. */
  beforeFilter?: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Starting split, 0–100. */
  initial?: number;
  className?: string;
};

/** A draggable comparison slider. Arrow keys nudge it; a tap flips between the two on touch screens. */
export function BeforeAfter({ before, after, beforeFilter, beforeLabel = 'Before', afterLabel = 'After', initial = 50, className }: BeforeAfterProps) {
  const [pos, setPos] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const setFrom = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={box}
      className={cn('relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-ink-850 shadow-card sm:aspect-[16/10]', dragging ? 'cursor-grabbing' : 'cursor-ew-resize', className)}
      onPointerDown={(e) => {
        moved.current = false;
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        if (e.pointerType === 'mouse') setFrom(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        moved.current = true;
        setFrom(e.clientX);
      }}
      onPointerUp={(e) => {
        setDragging(false);
        if (e.pointerType !== 'mouse' && !moved.current) setPos((p) => (p > 50 ? 0 : 100));
      }}
      onPointerCancel={() => setDragging(false)}
    >
      <img src={after} alt={afterLabel} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, transition: dragging ? 'none' : 'clip-path .45s cubic-bezier(.16,1,.3,1)' }}>
        <img src={before} alt={beforeLabel} draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ filter: beforeFilter }} />
      </div>
      <span className={cn('absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-white/85 backdrop-blur transition-opacity', pos < 12 && 'opacity-0')}>{beforeLabel}</span>
      <span className={cn('absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-white/85 backdrop-blur transition-opacity', pos > 88 && 'opacity-0')}>{afterLabel}</span>
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%`, transition: dragging ? 'none' : 'left .45s cubic-bezier(.16,1,.3,1)' }}>
        <span className="absolute inset-y-0 -left-px w-0.5 bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
        <button
          type="button"
          role="slider"
          aria-label="Comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 2;
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - step));
            if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + step));
            if (e.key === 'Home') setPos(0);
            if (e.key === 'End') setPos(100);
          }}
          className="focus-ring pointer-events-auto absolute left-0 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-950 shadow-pop transition-transform active:scale-95"
        >
          <ChevronsLeftRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function BeforeAfterDemo() {
  const [src, setSrc] = useState('');
  const [pos, setPos] = useState(50);
  useEffect(() => setSrc(artwork(6, 1200, 800)), []);
  const presets = [
    ['Colour grade', 'grayscale(0.85) contrast(0.9) brightness(0.9)'],
    ['Exposure', 'brightness(0.55) contrast(1.1)'],
    ['White balance', 'sepia(0.6) hue-rotate(-15deg) saturate(0.8)'],
  ] as const;
  const [k, setK] = useState(0);
  if (!src) return <div className="aspect-[16/10] w-full rounded-2xl bg-ink-850" />;
  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      <BeforeAfter key={k} before={src} after={src} beforeFilter={presets[k][1]} beforeLabel="Original" afterLabel="Edited" initial={pos} />
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {presets.map(([label], i) => (
          <button
            key={label}
            onClick={() => {
              setK(i);
              setPos(50);
            }}
            className={cn('focus-ring rounded-full px-3 py-1.5 text-xs font-medium transition-colors', k === i ? 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/40' : 'text-ink-400 ring-1 ring-white/10 hover:text-ink-100')}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
