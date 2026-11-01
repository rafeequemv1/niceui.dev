import { useState } from 'react';
import { Pills, Showcase, Size, ThinkingLabel, TONES, usePrefersReducedMotion, useTick, type ThinkingState, type Tone } from './shared';

export type GridPattern = 'wave' | 'snake' | 'random' | 'ripple';

export type GridFlickerProps = {
  /** Overall size in px. */
  size?: number;
  /** Cells per side: 3, 4 or 5. */
  grid?: 3 | 4 | 5;
  pattern?: GridPattern;
  tone?: Tone;
  state?: ThinkingState;
  className?: string;
};

const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** Brightness 0..1 for cell (r, c) at frame t. */
function level(pattern: GridPattern, r: number, c: number, n: number, t: number) {
  if (pattern === 'wave') return 0.5 + 0.5 * Math.sin(t * 0.55 - (r + c) * 0.9);
  if (pattern === 'ripple') {
    const m = (n - 1) / 2;
    const d = Math.hypot(r - m, c - m);
    return 0.5 + 0.5 * Math.sin(t * 0.6 - d * 1.6);
  }
  if (pattern === 'snake') {
    const order = r % 2 === 0 ? r * n + c : r * n + (n - 1 - c);
    const head = t % (n * n);
    const dist = (head - order + n * n) % (n * n);
    return dist < 4 ? 1 - dist * 0.24 : 0.08;
  }
  return hash(r * 31 + c * 7 + Math.floor(t / 2) * 13) > 0.62 ? 1 : 0.12;
}

export function GridFlicker({ size = 20, grid = 3, pattern = 'wave', tone = 'sky', state = 'thinking', className }: GridFlickerProps) {
  const reduce = usePrefersReducedMotion();
  const t = useTick(state === 'thinking' && !reduce, 14);
  const c = TONES[tone];
  const gap = Math.max(1, size / (grid * 4.5));
  const cell = (size - gap * (grid - 1)) / grid;
  return (
    <span
      role="img"
      aria-label={state === 'thinking' ? 'Thinking' : state === 'done' ? 'Done' : 'Idle'}
      className={className}
      style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${grid}, ${cell}px)`, gap, width: size, height: size }}
    >
      {Array.from({ length: grid * grid }, (_, i) => {
        const r = Math.floor(i / grid);
        const col = i % grid;
        const v = state === 'thinking' ? (reduce ? 0.35 + 0.4 * ((r + col) % 2) : level(pattern, r, col, grid, t)) : state === 'done' ? 0.9 : 0.18;
        return (
          <span
            key={i}
            style={{
              width: cell,
              height: cell,
              borderRadius: cell * 0.3,
              background: state === 'done' ? c.soft : c.main,
              opacity: 0.12 + v * 0.88,
              boxShadow: v > 0.75 && state === 'thinking' ? `0 0 ${Math.max(2, cell)}px ${c.main}aa` : 'none',
              transition: 'opacity 140ms linear, background 300ms',
            }}
          />
        );
      })}
    </span>
  );
}

const PATTERNS = ['wave', 'snake', 'random', 'ripple'] as const;
const GRIDS = ['3×3', '4×4', '5×5'] as const;

export function GridFlickerDemo() {
  const [pattern, setPattern] = useState<GridPattern>('wave');
  const [g, setG] = useState<(typeof GRIDS)[number]>('3×3');
  const grid = (Number(g[0]) as 3 | 4 | 5) || 3;
  return (
    <Showcase
      controls={
        <>
          <Pills label="Pattern" value={pattern} options={PATTERNS} onChange={setPattern} />
          <Pills label="Grid" value={g} options={GRIDS} onChange={setG} />
        </>
      }
      sizes={
        <>
          <Size px={14}><GridFlicker size={14} grid={grid} pattern={pattern} /></Size>
          <Size px={24}><GridFlicker size={24} grid={grid} pattern={pattern} tone="violet" /></Size>
          <Size px={40}><GridFlicker size={40} grid={grid} pattern={pattern} /></Size>
          <Size px={60}><GridFlicker size={60} grid={grid} pattern={pattern} tone="emerald" /></Size>
        </>
      }
      chat={
        <div className="flex items-center gap-2.5">
          <GridFlicker size={16} grid={grid} pattern={pattern} />
          <ThinkingLabel>Planning the migration…</ThinkingLabel>
        </div>
      }
    />
  );
}
