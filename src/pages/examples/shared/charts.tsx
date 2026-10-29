import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { easeOutExpo, useCountUp, useSize } from './hooks';

/* ----------------------------- count-up number ---------------------------- */

export function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 900,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const d = useCountUp(value, duration);
  return (
    <span className={className}>
      {prefix}
      {d.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* -------------------------------- sparkline ------------------------------- */

export function Sparkline({
  data,
  color = '#38bdf8',
  fill = true,
  width = 120,
  height = 36,
  className,
}: {
  data: number[];
  color?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
}) {
  const raw = useId().replace(/:/g, '');
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - 3 - ((v - min) / range) * (height - 6),
  ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    setDrawn(false);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(t);
  }, [data]);
  const ref = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useLayoutEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
  }, [data, width]);
  return (
    <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      {fill && (
        <>
          <defs>
            <linearGradient id={`sp-${raw}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L ${width} ${height} L 0 ${height} Z`} fill={`url(#sp-${raw})`} />
        </>
      )}
      <path
        ref={ref}
        d={line}
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={drawn ? 0 : len}
        style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

/* -------------------------------- area chart ------------------------------ */

export function AreaChart({
  data,
  height = 240,
  color = '#38bdf8',
  format = (v) => String(v),
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
}) {
  const [ref, w] = useSize<HTMLDivElement>();
  const raw = useId().replace(/:/g, '');
  const width = w || 640;
  const pad = { l: 6, r: 6, t: 14, b: 22 };
  const iw = Math.max(1, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * iw,
    y: pad.t + ih - ((d.value - min) / range) * (ih - 8) - 4,
    ...d,
  }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.t + ih).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pad.t + ih).toFixed(1)} Z`;
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [len, setLen] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  useLayoutEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [data, width]);
  useEffect(() => {
    setDrawn(false);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(t);
  }, [data, width]);
  const gridY = [0, 0.25, 0.5, 0.75, 1];
  const move = (e: React.MouseEvent) => {
    const el = svgRef.current;
    if (!el) return;
    const x = e.clientX - el.getBoundingClientRect().left - pad.l;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round((x / iw) * (data.length - 1)))));
  };
  const hp = hover != null ? pts[hover] : null;
  return (
    <div ref={ref} className="relative" onMouseMove={move} onMouseLeave={() => setHover(null)}>
      <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
        <defs>
          <linearGradient id={`ar-${raw}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridY.map((g) => (
          <line key={g} x1={pad.l} x2={width - pad.r} y1={pad.t + g * ih} y2={pad.t + g * ih} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#ar-${raw})`} />
        <path
          ref={pathRef}
          d={line}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={len}
          strokeDashoffset={drawn ? 0 : len}
          style={{ transition: 'stroke-dashoffset 1000ms cubic-bezier(0.16,1,0.3,1)' }}
        />
        {hp && (
          <>
            <line x1={hp.x} x2={hp.x} y1={pad.t} y2={pad.t + ih} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={hp.x} cy={hp.y} r="4.5" fill={color} stroke="#0a0a0c" strokeWidth="2" />
          </>
        )}
        {pts.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((p) => (
          <text key={p.x} x={p.x} y={height - 6} textAnchor="middle" className="fill-ink-500" style={{ fontSize: 10 }}>
            {p.label}
          </text>
        ))}
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-ink-800 px-2.5 py-1.5 text-xs shadow-pop ring-1 ring-white/10"
          style={{ left: Math.max(56, Math.min(width - 56, hp.x)), top: Math.max(0, hp.y - 48) }}
        >
          <div className="font-medium text-ink-50">{format(hp.value)}</div>
          <div className="text-[10px] text-ink-400">{hp.label}</div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- bar chart ------------------------------- */

export function BarChart({
  series,
  groups,
  height = 220,
  format = (v) => String(v),
}: {
  series: { key: string; label: string; color: string }[];
  groups: { label: string; values: Record<string, number> }[];
  height?: number;
  format?: (v: number) => string;
}) {
  const max = Math.max(1, ...groups.flatMap((g) => series.map((s) => g.values[s.key] ?? 0)));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(false);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    return () => cancelAnimationFrame(t);
  }, [groups]);
  const [hover, setHover] = useState<number | null>(null);
  const ih = height - 28;
  return (
    <div>
      <div className="relative" style={{ height }}>
        <div className="absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between">
          {[1, 0.66, 0.33, 0].map((g) => (
            <div key={g} className="border-t border-white/5" />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 flex items-end justify-around gap-2 px-1" style={{ height: ih }} onMouseLeave={() => setHover(null)}>
          {groups.map((g, gi) => (
            <div key={g.label} className="group flex h-full flex-1 items-end justify-center gap-1" onMouseEnter={() => setHover(gi)}>
              {series.map((s) => {
                const h = ((g.values[s.key] ?? 0) / max) * ih;
                return (
                  <div
                    key={s.key}
                    className={cn('w-full max-w-[18px] rounded-t-md transition-all duration-700 ease-smooth', hover === gi ? 'opacity-100' : 'opacity-80')}
                    style={{ height: mounted ? h : 0, background: `linear-gradient(to top, ${s.color}, ${s.color}cc)`, transitionDelay: `${gi * 45}ms` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-around px-1">
          {groups.map((g) => (
            <span key={g.label} className="flex-1 text-center text-[10px] text-ink-500">{g.label}</span>
          ))}
        </div>
      </div>
      {hover != null && (
        <div className="mt-1 text-xs text-ink-400">
          {groups[hover].label}: {series.map((s) => `${s.label} ${format(groups[hover].values[s.key] ?? 0)}`).join('  ·  ')}
        </div>
      )}
      <div className="mt-2 flex items-center gap-4">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-ink-400">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- donut chart ------------------------------ */

export function DonutChart({
  data,
  size = 168,
  thickness = 18,
  center,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    return () => cancelAnimationFrame(t);
  }, []);
  let acc = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const seg = frac * circ;
          const offset = -acc * circ;
          acc += frac;
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${mounted ? seg : 0} ${circ}`}
              strokeDashoffset={offset}
              style={{ transition: `stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1) ${i * 110}ms` }}
            />
          );
        })}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>}
    </div>
  );
}
