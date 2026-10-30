import { useState } from 'react';
import { ChartFrame, Legend, SERIES_COLORS, useInView, useToggleSet } from './chart-utils';

export type RadarSeries = { name: string; color?: string; values: number[] };

export type RadarChartProps = {
  axes: string[];
  series: RadarSeries[];
  max?: number;
  size?: number;
};

export function RadarChart({ axes, series, max = 100, size = 300 }: RadarChartProps) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const { hidden, toggle } = useToggleSet();
  const [axis, setAxis] = useState<number | null>(null);
  const colored = series.map((s, i) => ({ ...s, color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length] }));
  const c = size / 2;
  const R = c - 42;
  const n = axes.length;
  const pt = (i: number, f: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * R * f, c + Math.sin(a) * R * f] as const;
  };
  const poly = (vals: number[], k: number) => vals.map((v, i) => pt(i, (v / max) * k).join(',')).join(' ');

  return (
    <div ref={ref} className="space-y-3">
      <Legend items={colored} hidden={hidden} onToggle={toggle} />
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] shrink-0" role="img" aria-label={`Radar chart comparing ${colored.map((s) => s.name).join(' and ')}`}>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <polygon key={f} points={axes.map((_, i) => pt(i, f).join(',')).join(' ')} fill="none" stroke="rgba(255,255,255,0.07)" />
          ))}
          {axes.map((a, i) => {
            const [x, y] = pt(i, 1);
            const [lx, ly] = pt(i, 1.17);
            return (
              <g key={a}>
                <line x1={c} y1={c} x2={x} y2={y} stroke={axis === i ? 'rgba(125,211,252,0.5)' : 'rgba(255,255,255,0.07)'} />
                <text
                  x={lx}
                  y={ly}
                  dy="0.32em"
                  textAnchor={Math.abs(lx - c) < 4 ? 'middle' : lx > c ? 'start' : 'end'}
                  tabIndex={0}
                  onPointerEnter={() => setAxis(i)}
                  onPointerLeave={() => setAxis(null)}
                  onFocus={() => setAxis(i)}
                  onBlur={() => setAxis(null)}
                  className={axis === i ? 'cursor-default fill-brand-300 text-[11px] outline-none' : 'cursor-default fill-ink-400 text-[11px] outline-none'}
                >
                  {a}
                </text>
              </g>
            );
          })}
          {colored.map((s, si) =>
            hidden.has(s.name) ? null : (
              <g key={s.name} style={{ transformOrigin: `${c}px ${c}px`, transform: seen ? 'scale(1)' : 'scale(0.2)', opacity: seen ? 1 : 0, transition: `transform 1s cubic-bezier(0.34,1.56,0.64,1) ${si * 150}ms, opacity 0.6s ${si * 150}ms` }}>
                <polygon points={poly(s.values, 1)} fill={s.color} fillOpacity={0.16} stroke={s.color} strokeWidth={1.8} strokeLinejoin="round" />
                {s.values.map((v, i) => {
                  const [x, y] = pt(i, v / max);
                  return <circle key={i} cx={x} cy={y} r={axis === i ? 4.5 : 3} fill="#0b0c0e" stroke={s.color} strokeWidth={2} className="transition-all" />;
                })}
              </g>
            ),
          )}
        </svg>
        <div className="w-full max-w-[220px] rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/5">
          <p className="mb-2 text-xs font-medium text-ink-300">{axis === null ? 'Average score' : axes[axis]}</p>
          {colored.map((s) => {
            const v = axis === null ? Math.round(s.values.reduce((a, b) => a + b, 0) / s.values.length) : s.values[axis];
            return (
              <div key={s.name} className={hidden.has(s.name) ? 'opacity-40' : ''}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-400">{s.name}</span>
                  <span className="font-mono tabular-nums text-ink-100">{v}</span>
                </div>
                <div className="mb-2 mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(v / max) * 100}%`, background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RadarChartDemo() {
  return (
    <ChartFrame title="Model evaluation" sub="Hover or focus an axis to compare">
      <RadarChart
        axes={['Reasoning', 'Coding', 'Writing', 'Speed', 'Cost', 'Tool use']}
        series={[
          { name: 'Atlas Reasoner', values: [92, 84, 78, 52, 46, 88] },
          { name: 'Nova Mini', values: [68, 72, 74, 94, 90, 70] },
        ]}
      />
    </ChartFrame>
  );
}
