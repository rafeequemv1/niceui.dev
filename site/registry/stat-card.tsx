import * as React from "react";

export interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: number[];
  className?: string;
}

function toPath(points: number[], w = 120, h = 32) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  return points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - 4 - ((p - min) / range) * (h - 8);
      return (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    })
    .join(" ");
}

export function StatCard({ label, value, delta, trend, className = "" }: StatCardProps) {
  return (
    <div
      className={[
        "w-full max-w-[240px] rounded-xl border border-white/10 bg-zinc-950 p-[18px]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        {delta && <span className="font-mono text-[11px] text-sky-300">{delta}</span>}
      </div>
      <div className="mb-2.5 mt-0.5 text-[30px] font-medium tabular-nums tracking-[-0.04em] text-zinc-100">
        {value}
      </div>
      {trend && trend.length > 1 && (
        <svg viewBox="0 0 120 32" preserveAspectRatio="none" className="h-8 w-full">
          <path d={toPath(trend)} fill="none" stroke="#7dd3fc" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
}
