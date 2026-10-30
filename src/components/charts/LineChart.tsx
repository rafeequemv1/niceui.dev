import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChartFrame, Legend, SERIES_COLORS, Segmented, Tooltip, fmt, niceMax, scale, smoothPath, useInView, useToggleSet, useWidth } from './chart-utils';

export type LineSeries = { name: string; color?: string; values: number[] };

export type LineChartProps = {
  labels: string[];
  series: LineSeries[];
  height?: number;
  prefix?: string;
  /** Changing this key replays the draw-in animation (e.g. on range change). */
  animationKey?: string | number;
};

const PAD = { t: 12, r: 12, b: 26, l: 40 };

export function LineChart({ labels, series, height = 260, prefix = '', animationKey }: LineChartProps) {
  const { ref: wrap, w } = useWidth<HTMLDivElement>();
  const { ref: view, seen } = useInView<HTMLDivElement>();
  const { hidden, toggle } = useToggleSet();
  const [hover, setHover] = useState<number | null>(null);

  const colored = series.map((s, i) => ({ ...s, color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length] }));
  const visible = colored.filter((s) => !hidden.has(s.name));
  const max = niceMax(Math.max(1, ...visible.flatMap((s) => s.values)));
  const x = scale(0, labels.length - 1, PAD.l, w - PAD.r);
  const y = scale(0, max, height - PAD.b, PAD.t);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const labelEvery = Math.ceil(labels.length / Math.max(2, Math.floor(w / 70)));

  const pick = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - PAD.l) / (w - PAD.l - PAD.r)) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setHover((h) => Math.min(labels.length - 1, (h ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? labels.length) - 1));
    else if (e.key === 'Escape') setHover(null);
  };

  return (
    <div ref={view} className="space-y-3">
      <Legend items={colored} hidden={hidden} onToggle={toggle} />
      <div ref={wrap} className="relative w-full">
        <svg
          width={w}
          height={height}
          className="block touch-pan-y outline-none"
          tabIndex={0}
          role="img"
          aria-label={`Line chart of ${visible.map((s) => s.name).join(' and ')}. Use arrow keys to read values.`}
          onPointerMove={(e: PointerEvent<SVGSVGElement>) => pick(e.clientX, e.currentTarget)}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        >
          <defs>
            {colored.map((s, i) => (
              <linearGradient key={i} id={`lc-g-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={w - PAD.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" strokeDasharray={t === 0 ? undefined : '3 4'} />
              <text x={PAD.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-500 font-mono text-[10px]">
                {fmt(t, prefix)}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % labelEvery === 0 ? (
              <text key={i} x={x(i)} y={height - 6} textAnchor="middle" className="fill-ink-500 font-mono text-[10px]">
                {l}
              </text>
            ) : null,
          )}
          {colored.map((s, si) => {
            if (hidden.has(s.name)) return null;
            const pts = s.values.map((v, i) => [x(i), y(v)] as [number, number]);
            const line = smoothPath(pts);
            return (
              <g key={`${s.name}-${animationKey}-${w}`}>
                <path d={`${line} L${x(labels.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#lc-g-${si})`} className="transition-opacity duration-700" style={{ opacity: seen ? 1 : 0, transitionDelay: '400ms' }} />
                <path
                  d={line}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  style={{ strokeDashoffset: seen ? 0 : 1, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', transitionDelay: `${si * 120}ms` }}
                />
              </g>
            );
          })}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={height - PAD.b} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
              {visible.map((s) => (
                <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r={4.5} fill="#0b0c0e" stroke={s.color} strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>
        {hover !== null && visible.length > 0 && (
          <Tooltip x={x(hover)} y={Math.min(...visible.map((s) => y(s.values[hover])))} w={w}>
            <p className="mb-1 font-mono text-[10px] text-ink-400">{labels[hover]}</p>
            {visible.map((s) => (
              <p key={s.name} className="flex items-center gap-2 whitespace-nowrap text-ink-100">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-ink-400">{s.name}</span>
                <span className="ml-auto pl-3 font-mono tabular-nums">{prefix + s.values[hover].toLocaleString('en-US')}</span>
              </p>
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

const RANGES = { '7D': 7, '30D': 30, '90D': 90 } as const;
type Range = keyof typeof RANGES;

function wave(n: number, base: number, amp: number, seed: number) {
  return Array.from({ length: n }, (_, i) => Math.round(base + amp * Math.sin(i / 3.2 + seed) + amp * 0.6 * Math.sin(i / 1.3 + seed * 2) + i * (base / n) * 0.6));
}

export function LineChartDemo() {
  const [range, setRange] = useState<Range>('30D');
  const data = useMemo(() => {
    const n = RANGES[range];
    const labels = Array.from({ length: n }, (_, i) => {
      const d = new Date(2026, 9, 30 - (n - 1 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    return { labels, series: [{ name: 'Revenue', values: wave(n, 4200, 900, 1) }, { name: 'Expenses', values: wave(n, 2600, 500, 4) }] };
  }, [range]);
  const total = data.series[0].values.reduce((a, b) => a + b, 0);
  return (
    <ChartFrame
      title="Revenue vs expenses"
      sub={
        <span>
          <span className="font-mono text-base tabular-nums text-ink-50">${total.toLocaleString('en-US')}</span> <span className="text-emerald-400">↑ 12.4%</span> this period
        </span>
      }
      right={<Segmented value={range} options={Object.keys(RANGES) as Range[]} onChange={setRange} />}
    >
      <LineChart labels={data.labels} series={data.series} prefix="$" animationKey={range} />
    </ChartFrame>
  );
}
