import { useRef, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-zinc-100 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'flex-1 rounded-lg px-2 py-1.5 text-[12.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
            value === o.id ? 'bg-white font-medium text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]' : 'text-zinc-500 hover:text-zinc-800',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A slider whose label and value sit inside the track, like a pro tool. */
export function FieldSlider({ label, value, min, max, step = 1, unit = '', onChange, onReset }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; onReset?: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const pct = ((value - min) / (max - min)) * 100;
  const set = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const v = min + Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * (max - min);
    onChange(Math.round(v / step) * step);
  };
  const decimals = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        set(e.clientX);
      }}
      onPointerMove={(e) => e.buttons === 1 && set(e.clientX)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(max, +(value + step).toFixed(3)));
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(min, +(value - step).toFixed(3)));
      }}
      className="group relative flex h-9 cursor-ew-resize touch-none select-none items-center overflow-hidden rounded-lg bg-zinc-100 px-3 text-[12.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
    >
      <span className="absolute inset-y-0 left-0 bg-zinc-200/90 transition-[width] duration-75" style={{ width: `${pct}%` }} />
      <span className="absolute inset-y-2 w-[2px] rounded-full bg-zinc-800 opacity-70" style={{ left: `calc(${pct}% - 1px)` }} />
      <span className="relative flex-1 text-zinc-600">{label}</span>
      {onReset && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onReset}
          aria-label={`Reset ${label}`}
          className="relative mr-2 grid h-5 w-5 place-items-center rounded text-zinc-400 opacity-0 transition-opacity hover:text-zinc-800 group-hover:opacity-100"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
      <span className="relative font-mono text-[12px] tabular-nums text-zinc-900">
        {value.toFixed(decimals)}
        <span className="ml-0.5 text-zinc-400">{unit}</span>
      </span>
    </div>
  );
}

export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex h-9 cursor-pointer items-center justify-between rounded-lg bg-zinc-100 px-3 text-[12.5px] text-zinc-600">
      {label}
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn('relative h-[18px] w-8 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50', checked ? 'bg-zinc-900' : 'bg-zinc-300')}
      >
        <span className={cn('absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all', checked ? 'left-[16px]' : 'left-[2px]')} />
      </button>
    </label>
  );
}

export function UnitInput({ prefix, value, unit, onChange }: { prefix: string; value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="flex h-9 min-w-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-[12.5px] focus-within:border-zinc-400">
      <span className="text-zinc-400">{prefix}</span>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
          if (!Number.isNaN(n)) onChange(Math.min(2048, n));
        }}
        aria-label={prefix === 'W' ? 'Width' : 'Height'}
        className="w-full min-w-0 bg-transparent font-mono tabular-nums text-zinc-900 outline-none"
      />
      <span className="text-zinc-400">{unit}</span>
    </label>
  );
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5 border-b border-zinc-100 pb-5 pt-1 last:border-0">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-semibold text-zinc-900">{title}</h3>
        {hint && <span className="text-[11.5px] text-zinc-400">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
