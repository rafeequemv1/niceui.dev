import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ChartFrame, SERIES_COLORS, useInView } from './chart-utils';

export type DonutSlice = { name: string; value: number; color?: string };

export type DonutChartProps = {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  label?: string;
  format?: (v: number) => string;
};

export function DonutChart({ data, size = 220, thickness = 22, label = 'Total', format = (v) => v.toLocaleString('en-US') }: DonutChartProps) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const slices = data.map((d, i) => ({ ...d, color: d.color ?? SERIES_COLORS[i % SERIES_COLORS.length] }));
  const shown = slices.filter((s) => !hidden.has(s.name));
  const total = shown.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2 - 6;
  const gap = shown.length > 1 ? 0.006 : 0;

  let acc = 0;
  const arcs = slices.map((s) => {
    const frac = hidden.has(s.name) ? 0 : s.value / total;
    const start = acc;
    acc += frac;
    return { ...s, frac, start };
  });
  const cur = active ? slices.find((s) => s.name === active) : null;

  const toggle = (n: string) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(n)) next.delete(n);
      else if (shown.length > 1) next.add(n);
      return next;
    });

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`Donut chart: ${shown.map((s) => `${s.name} ${Math.round((s.value / total) * 100)}%`).join(', ')}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
          {arcs.map((a, i) => {
            const len = Math.max(0, a.frac - gap);
            const on = active === a.name;
            return (
              <circle
                key={a.name}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={on ? thickness + 8 : thickness}
                pathLength={1}
                strokeDasharray={`${seen ? len : 0} 1`}
                strokeDashoffset={-a.start}
                strokeLinecap="butt"
                opacity={active && !on ? 0.4 : 1}
                onPointerEnter={() => setActive(a.name)}
                onPointerLeave={() => setActive(null)}
                className="cursor-pointer"
                style={{ transition: `stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1), stroke-width 0.2s, opacity 0.2s` }}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div key={cur?.name ?? 'total'} className="animate-fade-in">
            <p className="text-xs text-ink-400">{cur ? cur.name : label}</p>
            <p className="mt-0.5 font-mono text-2xl font-medium tabular-nums text-ink-50">{format(cur ? cur.value : shown.reduce((a, s) => a + s.value, 0))}</p>
            {cur && <p className="font-mono text-xs tabular-nums" style={{ color: cur.color }}>{hidden.has(cur.name) ? 'hidden' : `${((cur.value / total) * 100).toFixed(1)}%`}</p>}
          </div>
        </div>
      </div>
      <ul className="w-full max-w-[260px] space-y-1">
        {slices.map((s) => {
          const off = hidden.has(s.name);
          return (
            <li key={s.name}>
              <button
                onClick={() => toggle(s.name)}
                onPointerEnter={() => setActive(s.name)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(s.name)}
                onBlur={() => setActive(null)}
                aria-pressed={!off}
                className={cn('focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-white/[0.04]', off && 'opacity-40')}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
                <span className="min-w-0 flex-1 truncate text-ink-200">{s.name}</span>
                <span className="font-mono text-xs tabular-nums text-ink-400">{off ? '—' : `${Math.round((s.value / total) * 100)}%`}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DonutChartDemo() {
  return (
    <ChartFrame title="Revenue by plan" sub="Hover a segment · click the legend to hide one">
      <DonutChart
        label="MRR"
        format={(v) => '$' + (v / 1000).toFixed(1) + 'k'}
        data={[
          { name: 'Enterprise', value: 48200 },
          { name: 'Team', value: 31500 },
          { name: 'Pro', value: 22800 },
          { name: 'Starter', value: 9400 },
          { name: 'Add-ons', value: 6100 },
        ]}
      />
    </ChartFrame>
  );
}
