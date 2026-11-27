import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, CloudUpload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ——— ring ——— */

export type CircularProgressProps = {
  /** 0–100. Omit (or set `indeterminate`) for a spinner. */
  value?: number;
  indeterminate?: boolean;
  size?: number;
  thickness?: number;
  /** Split the ring into this many steps (segmented variant). */
  segments?: number;
  /** Show the value in the middle. Pass a node to replace it. */
  label?: boolean | ReactNode;
  /** Gradient stops for the stroke. */
  colors?: [string, string];
  className?: string;
  'aria-label'?: string;
};

/** An animated circular progress bar with a gradient stroke, steps and a spinner mode. */
export function CircularProgress({
  value = 0,
  indeterminate,
  size = 120,
  thickness = 10,
  segments,
  label = true,
  colors = ['#7dd3fc', '#0284c7'],
  className,
  'aria-label': ariaLabel = 'Progress',
}: CircularProgressProps) {
  const id = useId().replace(/:/g, '');
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const spin = indeterminate;
  const gap = segments ? Math.min(6, c / segments / 3) : 0;
  const seg = segments ? c / segments : 0;
  const done = segments ? Math.round((v / 100) * segments) : 0;

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={spin ? undefined : Math.round(v)}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn('-rotate-90', spin && 'cp-spin')} aria-hidden>
        <defs>
          <linearGradient id={`cpg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        {segments ? (
          Array.from({ length: segments }, (_, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              stroke={i < done ? `url(#cpg-${id})` : 'rgba(255,255,255,0.08)'}
              strokeDasharray={`${Math.max(0.1, seg - gap - thickness)} ${c}`}
              strokeDashoffset={-(i * seg + gap / 2 + thickness / 2)}
              className="transition-[stroke] duration-300"
            />
          ))
        ) : (
          <>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={`url(#cpg-${id})`}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={spin ? c * 0.72 : c * (1 - v / 100)}
              className="transition-[stroke-dashoffset] duration-700 ease-smooth motion-reduce:transition-none"
            />
          </>
        )}
      </svg>
      {label && !spin && (
        <div className="absolute inset-0 grid place-items-center text-center">
          {label === true ? (
            <span className="font-medium tabular-nums text-ink-50" style={{ fontSize: Math.max(12, size * 0.2) }}>
              {segments ? `${done}/${segments}` : `${Math.round(v)}%`}
            </span>
          ) : (
            label
          )}
        </div>
      )}
      <style>{`@keyframes cp-spin{to{transform:rotate(270deg)}}.cp-spin{animation:cp-spin .9s linear infinite}@media (prefers-reduced-motion:reduce){.cp-spin{animation-duration:2.5s}}`}</style>
    </div>
  );
}

/* ——— hold-to-confirm button ——— */

export type HoldButtonProps = {
  /** How long the press must be held, in ms. */
  duration?: number;
  onConfirm?: () => void;
  children?: ReactNode;
  className?: string;
};

/** A circular progress button: press and hold to confirm. Space/Enter work too. */
export function HoldToConfirmButton({ duration = 1200, onConfirm, children = 'Hold to delete', className }: HoldButtonProps) {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    if (!done) setP(0);
  };
  const begin = () => {
    if (done) return;
    start.current = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start.current) / duration);
      setP(k * 100);
      if (k < 1) raf.current = requestAnimationFrame(tick);
      else {
        setDone(true);
        onConfirm?.();
      }
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => {
      setDone(false);
      setP(0);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [done]);

  return (
    <button
      type="button"
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          begin();
        }
      }}
      onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && stop()}
      aria-label={typeof children === 'string' ? children : 'Hold to confirm'}
      className={cn(
        'focus-ring group inline-flex select-none items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 text-sm font-medium transition-colors',
        done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-ink-900 text-ink-100 shadow-card hover:bg-ink-800',
        className,
      )}
    >
      <CircularProgress value={done ? 100 : p} size={36} thickness={3.5} colors={done ? ['#6ee7b7', '#10b981'] : ['#fda4af', '#f43f5e']} label={done ? <Check className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-rose-300" />} aria-label="Hold progress" />
      {done ? 'Deleted' : children}
    </button>
  );
}

/* ——— upload button ——— */

/** A circular progress button that shows upload progress, then a success tick. */
export function UploadProgressButton({ className }: { className?: string }) {
  const [state, setState] = useState<'idle' | 'up' | 'done'>('idle');
  const [p, setP] = useState(0);
  useEffect(() => {
    if (state !== 'up') return;
    const id = window.setInterval(() => {
      setP((x) => {
        const n = Math.min(100, x + 3 + Math.random() * 9);
        if (n >= 100) setState('done');
        return n;
      });
    }, 160);
    return () => window.clearInterval(id);
  }, [state]);
  useEffect(() => {
    if (state !== 'done') return;
    const t = window.setTimeout(() => {
      setState('idle');
      setP(0);
    }, 1800);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <button
      type="button"
      onClick={() => state === 'idle' && setState('up')}
      aria-live="polite"
      className={cn('focus-ring relative grid h-16 w-16 place-items-center rounded-full bg-ink-900 shadow-card transition-transform duration-300 ease-spring active:scale-95', className)}
      aria-label={state === 'idle' ? 'Upload file' : state === 'up' ? `Uploading ${Math.round(p)}%` : 'Upload complete'}
    >
      <span className="absolute inset-0"><CircularProgress value={state === 'idle' ? 0 : p} size={64} thickness={4} label={false} aria-label="Upload progress" /></span>
      {state === 'done' ? <Check className="h-6 w-6 text-brand-300" /> : state === 'up' ? <span className="text-[13px] font-medium tabular-nums text-ink-50">{Math.round(p)}</span> : <CloudUpload className="h-6 w-6 text-ink-200" />}
    </button>
  );
}

/* ——— demo ——— */

export function CircularProgressDemo() {
  const [v, setV] = useState(64);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setV((x) => (x >= 100 ? 8 : Math.min(100, x + 9))), 900);
    return () => window.clearInterval(id);
  }, [auto]);

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="grid w-full max-w-2xl grid-cols-2 place-items-center gap-8 sm:grid-cols-4">
        <figure className="flex flex-col items-center gap-3">
          <CircularProgress value={v} size={104} aria-label="Storage used" />
          <figcaption className="text-xs text-ink-400">Gradient ring</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3">
          <CircularProgress value={v} size={104} segments={8} colors={['#c4b5fd', '#7c3aed']} aria-label="Onboarding steps" />
          <figcaption className="text-xs text-ink-400">Steps</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3">
          <CircularProgress indeterminate size={104} thickness={8} aria-label="Loading" />
          <figcaption className="text-xs text-ink-400">Indeterminate</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3">
          <CircularProgress
            value={v}
            size={104}
            thickness={6}
            colors={['#6ee7b7', '#0ea5e9']}
            label={
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-semibold tabular-nums text-ink-50">{Math.round((v / 100) * 8.4 * 10) / 10}k</span>
                <span className="text-[10px] uppercase tracking-wider text-ink-400">steps</span>
              </span>
            }
            aria-label="Daily steps"
          />
          <figcaption className="text-xs text-ink-400">Custom label</figcaption>
        </figure>
      </div>
      <label className="flex w-full max-w-sm items-center gap-3 text-xs text-ink-400">
        <span className="w-10 tabular-nums text-ink-200">{Math.round(v)}%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => {
            setAuto(false);
            setV(Number(e.target.value));
          }}
          className="h-1 flex-1 accent-sky-400"
          aria-label="Progress value"
        />
      </label>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <HoldToConfirmButton />
        <UploadProgressButton />
      </div>
    </div>
  );
}
