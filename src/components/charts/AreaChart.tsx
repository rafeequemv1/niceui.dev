import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChartFrame, Legend, SERIES_COLORS, Segmented, Tooltip, fmt, niceMax, scale, smoothPath, useInView, useToggleSet, useWidth } from './chart-utils';

export type AreaSeries = { name: string; color?: string; values: number[] };

export type AreaChartProps = {
  labels: string[];
  series: AreaSeries[];
  mode?: 'stacked' | 'overlay';
  height?: number;
};

const PAD = { t: 12, r: 12, b: 26, l: 40 };

export function AreaChart({ labels, series, mode = 'stacked', height = 260 }: AreaChartProps) {
  const uid = useId().replace(/:/g, '');
  const { ref: wrap, w } = useWidth<HTMLDivElement>();
  const { ref: view, seen } = useInView<HTMLDivElement>();
  const { hidden, toggle } = useToggleSet();
  const [hover, setHover] = useState<number | null>(null);

  const colored = series.map((s, i) => ({ ...s, color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length] }));
  const visible = colored.filter((s) => !hidden.has(s.name));
  const n = labels.length;

  // Cumulative baselines for stacked mode.
  const bases: number[][] = [];
  const tops: number[][] = [];
  visible.forEach((s, si) => {
    const base = mode === 'stacked' && si > 0 ? tops[si - 1] : new Array(n).fill(0);
    bases.push(base);
    tops.push(s.values.map((v, i) => base[i] + v));
  });
  const max = niceMax(Math.max(1, ...tops.flat()));
  const x = scale(0, n - 1, PAD.l, w - PAD.r);
  const y = scale(0, max, height - PAD.b, PAD.t);
  const labelEvery = Math.ceil(n / Math.max(2, Math.floor(w / 70)));

  const pick = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    setHover(Math.max(0, Math.min(n - 1, Math.round(((clientX - r.left - PAD.l) / (w - PAD.l - PAD.r)) * (n - 1)))));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? n) - 1));
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
          aria-label={`${mode === 'stacked' ? 'Stacked' : 'Overlaid'} area chart. Use arrow keys to read values.`}
          onPointerMove={(e: PointerEvent<SVGSVGElement>) => pick(e.clientX, e.currentTarget)}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        >
          <defs>
            {visible.map((s, i) => (
              <linearGradient key={s.name} id={`${uid}-g${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={mode === 'stacked' ? 0.55 : 0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={mode === 'stacked' ? 0.15 : 0.02} />
              </linearGradient>
            ))}
            <clipPath id={`${uid}-reveal`}>
              <rect x={0} y={0} height={height} style={{ width: seen ? w : 0, transition: 'width 1.3s cubic-bezier(0.16,1,0.3,1)' }} />
            </clipPath>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line x1={PAD.l} x2={w - PAD.r} y1={y(f * max)} y2={y(f * max)} stroke="rgba(255,255,255,0.06)" strokeDasharray={f ? '3 4' : undefined} />
              <text x={PAD.l - 8} y={y(f * max)} dy="0.32em" textAnchor="end" className="fill-ink-500 font-mono text-[10px]">
                {fmt(f * max)}
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
          <g clipPath={`url(#${uid}-reveal)`}>
            {visible.map((s, si) => {
              const top = tops[si].map((v, i) => [x(i), y(v)] as [number, number]);
              const bot = bases[si].map((v, i) => [x(i), y(v)] as [number, number]).reverse();
              const topPath = smoothPath(top);
              const botPath = smoothPath(bot).replace(/^M/, 'L');
              return (
                <g key={s.name}>
                  <path d={`${topPath} ${botPath} Z`} fill={`url(#${uid}-g${si})`} className="transition-all duration-500" />
                  <path d={topPath} fill="none" stroke={s.color} strokeWidth={1.8} />
                </g>
              );
            })}
          </g>
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={height - PAD.b} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
              {visible.map((s, si) => (
                <circle key={s.name} cx={x(hover)} cy={y(tops[si][hover])} r={4} fill="#0b0c0e" stroke={s.color} strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>
        {hover !== null && visible.length > 0 && (
          <Tooltip x={x(hover)} y={y(Math.max(...tops.map((t) => t[hover])))} w={w}>
            <p className="mb-1 font-mono text-[10px] text-ink-400">{labels[hover]}</p>
            {[...visible].reverse().map((s) => (
              <p key={s.name} className="flex items-center gap-2 whitespace-nowrap text-ink-100">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-ink-400">{s.name}</span>
                <span className="ml-auto pl-3 font-mono tabular-nums">{s.values[hover].toLocaleString('en-US')}</span>
              </p>
            ))}
            {mode === 'stacked' && (
              <p className="mt-1 flex justify-between border-t border-white/10 pt-1 text-ink-300">
                Total <span className="font-mono tabular-nums text-ink-50">{visible.reduce((a, s) => a + s.values[hover], 0).toLocaleString('en-US')}</span>
              </p>
            )}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SERIES: AreaSeries[] = [
  { name: 'Organic', values: [3200, 3600, 3400, 4100, 4600, 4400, 5200, 5600, 5300, 6100, 6600, 7200] },
  { name: 'Paid', values: [1800, 2100, 2600, 2400, 2900, 3300, 3100, 3600, 4000, 3800, 4300, 4700] },
  { name: 'Referral', values: [900, 1100, 1000, 1400, 1300, 1700, 1900, 1800, 2200, 2500, 2400, 2800] },
];

export function AreaChartDemo() {
  const [mode, setMode] = useState<'Stacked' | 'Overlay'>('Stacked');
  return (
    <ChartFrame title="Visitors by channel" sub="Monthly unique visitors, 2026" right={<Segmented value={mode} options={['Stacked', 'Overlay']} onChange={setMode} />}>
      <AreaChart labels={MONTHS} series={SERIES} mode={mode === 'Stacked' ? 'stacked' : 'overlay'} />
    </ChartFrame>
  );
}
