import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type GridPatternFade = 'none' | 'radial' | 'top' | 'bottom';

const GRID_MASKS: Record<GridPatternFade, string | undefined> = {
  none: undefined,
  radial: 'radial-gradient(ellipse at center, black 25%, transparent 75%)',
  top: 'linear-gradient(to bottom, transparent, black 45%)',
  bottom: 'linear-gradient(to top, transparent, black 45%)',
};

export type GridPatternProps = {
  /** Cell size in px. */
  size?: number;
  /** Line colour. */
  color?: string;
  /** Dashed lines instead of solid. */
  dashed?: boolean;
  /** Cells to highlight, as [column, row] pairs. */
  squares?: Array<[number, number]>;
  /** Highlight colour. */
  squareColor?: string;
  opacity?: number;
  fade?: GridPatternFade;
  className?: string;
};

/** A grid background pattern: SVG grid lines with optional highlighted squares and a dashed variant. */
export function GridPattern({ size = 40, color = 'rgba(255,255,255,0.09)', dashed = false, squares = [], squareColor = 'rgba(125,211,252,0.14)', opacity = 1, fade = 'radial', className }: GridPatternProps) {
  const id = useId().replace(/:/g, '');
  const mask = GRID_MASKS[fade];
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} style={{ opacity, maskImage: mask, WebkitMaskImage: mask }}>
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`grid-${id}`} width={size} height={size} patternUnits="userSpaceOnUse" x="-1" y="-1">
            <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke={color} strokeWidth="1" strokeDasharray={dashed ? '4 4' : undefined} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${id})`} />
        {squares.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x * size} y={y * size} width={size - 1} height={size - 1} fill={squareColor} />
        ))}
      </svg>
    </div>
  );
}

function GridDemoChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
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

const GRID_DEMO_SQUARES: Array<[number, number]> = [
  [4, 2], [5, 3], [9, 2], [11, 5], [3, 6], [14, 4], [7, 7], [16, 6], [12, 1], [18, 3],
];

export function GridPatternDemo() {
  const [size, setSize] = useState(40);
  const [dashed, setDashed] = useState(false);
  const [lit, setLit] = useState(true);
  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink-950 px-4 py-10">
      <GridPattern size={size} dashed={dashed} squares={lit ? GRID_DEMO_SQUARES : []} />
      <div className="relative max-w-sm rounded-2xl border border-white/10 bg-ink-950/70 p-6 text-center backdrop-blur">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">Grid pattern</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-50">Structure behind the story</h3>
        <p className="mt-2 text-sm text-ink-400">Lines, dashes and a few lit squares.</p>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 p-2 backdrop-blur">
        <label className="flex items-center gap-2 px-1 text-[11px] text-ink-400">
          Size
          <input type="range" min={20} max={72} value={size} onChange={(e) => setSize(+e.target.value)} className="w-20 accent-sky-300" aria-label="Cell size" />
        </label>
        <GridDemoChip on={dashed} onClick={() => setDashed((d) => !d)}>
          Dashed
        </GridDemoChip>
        <GridDemoChip on={lit} onClick={() => setLit((l) => !l)}>
          Squares
        </GridDemoChip>
      </div>
    </div>
  );
}
