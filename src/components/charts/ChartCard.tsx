import { useEffect, useId, useState } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { reducedMotion, smoothPath, useInView } from './chart-utils';

export function Sparkline({ values, color = '#38bdf8', width = 120, height = 36, play = true }: { values: number[]; color?: string; width?: number; height?: number; play?: boolean }) {
  const id = useId().replace(/:/g, '');
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 3 - ((v - min) / (max - min || 1)) * (height - 6)] as [number, number]);
  const line = smoothPath(pts);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} style={{ opacity: play ? 1 : 0, transition: 'opacity 0.8s 0.5s' }} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" pathLength={1} strokeDasharray="1" style={{ strokeDashoffset: play ? 0 : 1, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={color} style={{ opacity: play ? 1 : 0, transition: 'opacity 0.3s 1.1s' }} />
    </svg>
  );
}

export function MiniBars({ values, color = '#a78bfa', height = 36, play = true }: { values: number[]; color?: string; height?: number; play?: boolean }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className="w-[6px] rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === values.length - 1 ? color : `${color}55`,
            transform: play ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'bottom',
            transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function ProgressRing({ value, color = '#34d399', size = 44, stroke = 5, play = true }: { value: number; color?: string; size?: number; stroke?: number; play?: boolean }) {
  const r = (size - stroke) / 2;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength={100} strokeDasharray={`${play ? value : 0} 100`} style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
    </svg>
  );
}

function useCount(target: number, play: boolean, decimals = 0) {
  const [v, setV] = useState(reducedMotion() ? target : 0);
  useEffect(() => {
    if (!play || reducedMotion()) return setV(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1200);
      setV(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, play]);
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export type KpiCardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta: number;
  /** Lower is better (e.g. churn): a negative delta is shown as good. */
  invert?: boolean;
  visual: 'sparkline' | 'bars' | 'ring';
  data?: number[];
  ring?: number;
  color?: string;
  note?: string;
};

export function KpiCard({ label, value, prefix = '', suffix = '', decimals = 0, delta, invert, visual, data = [], ring = 0, color, note }: KpiCardProps) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const shown = useCount(value, seen, decimals);
  const good = invert ? delta < 0 : delta >= 0;
  const Arrow = delta >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div ref={ref} className="group flex min-w-0 flex-col justify-between gap-4 rounded-2xl bg-ink-900 p-4 shadow-card transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-ink-400">{label}</p>
          <p className="mt-1.5 font-mono text-2xl font-medium tabular-nums tracking-tight text-ink-50">
            {prefix}
            {shown}
            {suffix}
          </p>
        </div>
        {visual === 'ring' && (
          <div className="relative grid place-items-center">
            <ProgressRing value={ring} color={color} play={seen} />
            <span className="absolute font-mono text-[10px] text-ink-300">{ring}%</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[11px]', good ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
          <Arrow className="h-3 w-3" />
          {Math.abs(delta).toFixed(1)}%
          {note && <span className="ml-1 text-ink-500">{note}</span>}
        </span>
        {visual === 'sparkline' && <Sparkline values={data} color={color} play={seen} width={110} />}
        {visual === 'bars' && <MiniBars values={data} color={color} play={seen} />}
      </div>
    </div>
  );
}

export function ChartCardDemo() {
  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
      <KpiCard label="Monthly recurring revenue" value={118400} prefix="$" delta={12.4} visual="sparkline" color="#38bdf8" data={[62, 66, 64, 71, 75, 73, 80, 86, 84, 92, 97, 104]} note="vs last mo" />
      <KpiCard label="Active users" value={24816} delta={8.1} visual="bars" color="#a78bfa" data={[30, 42, 38, 51, 47, 58, 62, 55, 68, 72, 70, 84]} />
      <KpiCard label="Churn rate" value={1.92} suffix="%" decimals={2} delta={-0.6} invert visual="sparkline" color="#f472b6" data={[3.1, 2.9, 3, 2.7, 2.6, 2.4, 2.5, 2.2, 2.1, 2, 1.95, 1.92]} />
      <KpiCard label="Quarterly quota" value={742} prefix="$" suffix="k" delta={4.3} visual="ring" ring={74} color="#34d399" note="on track" />
    </div>
  );
}
