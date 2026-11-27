import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type HexagonPatternFade = 'none' | 'radial' | 'top' | 'bottom';

const HEX_MASKS: Record<HexagonPatternFade, string | undefined> = {
  none: undefined,
  radial: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
  top: 'linear-gradient(to bottom, transparent, black 45%)',
  bottom: 'linear-gradient(to top, transparent, black 45%)',
};

export type HexagonPatternProps = {
  /** Hexagon radius in px (centre to corner). */
  radius?: number;
  /** Outline colour. */
  color?: string;
  /** Fill colour for highlighted and hovered cells. */
  highlight?: string;
  /** Cells to highlight, as [column, row] pairs. */
  cells?: Array<[number, number]>;
  /** Light up cells under the pointer. */
  interactive?: boolean;
  opacity?: number;
  fade?: HexagonPatternFade;
  className?: string;
};

const hexPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

/** A hexagon background pattern: an SVG honeycomb whose cells light up under the pointer, with optional highlighted hexes. */
export function HexagonPattern({ radius = 22, color = 'rgba(255,255,255,0.08)', highlight = 'rgba(125,211,252,0.16)', cells = [], interactive = true, opacity = 1, fade = 'radial', className }: HexagonPatternProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [hot, setHot] = useState<string | null>(null);
  const [trail, setTrail] = useState<string[]>([]);
  const hotRef = useRef<string | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const w = Math.sqrt(3) * radius; // pointy-top hex width
  const v = radius * 1.5; // vertical step
  const cols = Math.ceil(box.w / w) + 1;
  const rows = Math.ceil(box.h / v) + 1;
  const lit = useMemo(() => new Set(cells.map(([c, r]) => `${c}-${r}`)), [cells]);

  // pointer events land on the parent section, so listen there
  useEffect(() => {
    const el = wrap.current?.parentElement;
    if (!el || !interactive) return;
    const move = (e: PointerEvent) => {
      const r = wrap.current!.getBoundingClientRect();
      const y = e.clientY - r.top;
      const row = Math.round(y / v);
      const x = e.clientX - r.left - (row % 2 ? w / 2 : 0);
      const key = `${Math.round(x / w)}-${row}`;
      if (hotRef.current === key) return;
      hotRef.current = key;
      setHot(key);
      setTrail((t) => [key, ...t.filter((q) => q !== key)].slice(0, 6));
    };
    const leave = () => {
      hotRef.current = null;
      setHot(null);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [interactive, v, w]);

  const mask = HEX_MASKS[fade];
  return (
    <div ref={wrap} aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} style={{ opacity, maskImage: mask, WebkitMaskImage: mask }}>
      {box.w > 0 && (
        <svg width={box.w} height={box.h} className="absolute inset-0">
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              const key = `${col}-${row}`;
              const cx = col * w + (row % 2 ? w / 2 : 0);
              const cy = row * v;
              const t = trail.indexOf(key);
              const on = lit.has(key) || key === hot;
              const fill = on ? highlight : t >= 0 ? highlight : 'transparent';
              return (
                <polygon
                  key={key}
                  points={hexPoints(cx, cy, radius - 1)}
                  fill={fill}
                  fillOpacity={on ? 1 : t >= 0 ? Math.max(0, 0.7 - t * 0.12) : 1}
                  stroke={color}
                  strokeWidth="1"
                  style={{ transition: 'fill-opacity 600ms ease-out' }}
                />
              );
            }),
          )}
        </svg>
      )}
    </div>
  );
}

function HexDemoChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
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

const HEX_DEMO_CELLS: Array<[number, number]> = [
  [3, 2], [4, 3], [10, 1], [12, 4], [6, 6], [15, 2], [2, 5], [13, 7],
];

export function HexagonPatternDemo() {
  const [radius, setRadius] = useState(22);
  const [lit, setLit] = useState(true);
  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink-950 px-4 py-10">
      <HexagonPattern radius={radius} cells={lit ? HEX_DEMO_CELLS : []} />
      <div className="relative max-w-sm rounded-2xl border border-white/10 bg-ink-950/70 p-6 text-center backdrop-blur">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">Hexagon pattern</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-50">Move your pointer across the hive</h3>
        <p className="mt-2 text-sm text-ink-400">Cells light up and fade behind you.</p>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 p-2 backdrop-blur">
        <label className="flex items-center gap-2 px-1 text-[11px] text-ink-400">
          Size
          <input type="range" min={12} max={40} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-20 accent-sky-300" aria-label="Hexagon size" />
        </label>
        <HexDemoChip on={lit} onClick={() => setLit((l) => !l)}>
          Highlights
        </HexDemoChip>
      </div>
    </div>
  );
}
