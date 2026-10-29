import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, FileText, LoaderCircle, MessageSquare, Minimize2, RotateCcw, Wrench } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ContextSegment = { id: string; label: string; tokens: number; color: string };

export type ContextUsageProps = {
  segments: ContextSegment[];
  /** Context window size in tokens. */
  limit: number;
  /** Model name shown in the header. */
  model?: string;
  /** Dollars per million input tokens, used for the running cost. */
  pricePerMillion?: number;
  /** Fraction of the window at which the warning appears. */
  warnAt?: number;
  onCompact?: () => void;
  compacting?: boolean;
  className?: string;
};

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K` : `${Math.round(n)}`);

/** Eases a number toward its target so totals count instead of jumping. */
function useTween(target: number, ms = 700) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const val = a + (target - a) * (1 - Math.pow(1 - t, 3));
      from.current = val;
      setV(val);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** Context-window meter: ring, segmented bar with tooltips, cost and a compact action. */
export function ContextUsage({ segments, limit, model, pricePerMillion = 3, warnAt = 0.8, onCompact, compacting, className }: ContextUsageProps) {
  const used = segments.reduce((s, x) => s + x.tokens, 0);
  const shown = useTween(used);
  const pct = Math.min(1, used / limit);
  const level = pct >= 0.95 ? 'danger' : pct >= warnAt ? 'warn' : 'ok';
  const R = 34;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 p-4 shadow-card sm:p-5', className)}>
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px] shrink-0">
          <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
            <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            {segments.map((s) => {
              const len = (s.tokens / limit) * C;
              const dash = Math.max(0, len - 2);
              const el = (
                <circle
                  key={s.id}
                  cx="42"
                  cy="42"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="7"
                  strokeLinecap="butt"
                  style={{ strokeDasharray: `${dash} ${C}`, strokeDashoffset: -offset, transition: 'stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1), stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)' }}
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-mono text-lg font-medium tabular-nums leading-none', level === 'ok' ? 'text-ink-50' : level === 'warn' ? 'text-amber-300' : 'text-rose-300')}>
              {Math.round((shown / limit) * 100)}%
            </span>
            <span className="mt-0.5 text-[10px] text-ink-500">used</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-50">Context window</p>
            {model && <span className="truncate rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-ink-400">{model}</span>}
          </div>
          <p className="mt-1 font-mono text-[13px] tabular-nums text-ink-200">
            {fmt(shown)} <span className="text-ink-500">/ {fmt(limit)} tokens</span>
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            <span className="font-mono tabular-nums text-ink-300">${((shown / 1_000_000) * pricePerMillion).toFixed(2)}</span> so far · {fmt(Math.max(0, limit - used))} left
          </p>
        </div>
      </div>

      <div className="mt-4 flex h-2.5 w-full gap-[2px] rounded-full bg-white/[0.04]" role="img" aria-label={`${Math.round(pct * 100)}% of the context window used`}>
        {segments.map((s) => (
          <div
            key={s.id}
            tabIndex={0}
            aria-label={`${s.label}: ${fmt(s.tokens)} tokens`}
            className="group relative h-full rounded-full outline-none transition-[width] duration-700 ease-smooth first:rounded-l-full focus-visible:ring-2 focus-visible:ring-brand-400/60"
            style={{ width: `${(s.tokens / limit) * 100}%`, background: s.color }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg bg-ink-800 px-2 py-1 text-[11px] text-ink-100 opacity-0 shadow-pop transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              {s.label} · <span className="font-mono tabular-nums">{fmt(s.tokens)}</span> · {((s.tokens / limit) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {segments.map((s) => (
          <div key={s.id} className="flex min-w-0 items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="truncate text-ink-400">{s.label}</span>
            <span className="ml-auto font-mono tabular-nums text-ink-200">{fmt(s.tokens)}</span>
          </div>
        ))}
      </div>

      <div className={cn('grid transition-[grid-template-rows,opacity] duration-500 ease-smooth', level !== 'ok' || compacting ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className={cn('mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset', level === 'danger' ? 'bg-rose-500/10 ring-rose-400/20' : 'bg-amber-500/10 ring-amber-400/20')}>
            {compacting ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-brand-300" /> : <AlertTriangle className={cn('h-4 w-4 shrink-0', level === 'danger' ? 'text-rose-300' : 'text-amber-300')} />}
            <p className="min-w-0 flex-1 text-xs leading-snug text-ink-200">
              {compacting ? <span className="shimmer-text font-medium">Summarizing older turns…</span> : `${Math.round(pct * 100)}% full. Older turns will be summarized soon.`}
            </p>
            {onCompact && (
              <button
                type="button"
                onClick={onCompact}
                disabled={compacting}
                className="focus-ring flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-xs font-medium text-ink-50 transition-all hover:bg-white/15 active:scale-95 disabled:opacity-50"
              >
                <Minimize2 className="h-3.5 w-3.5" /> Compact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const START: ContextSegment[] = [
  { id: 'system', label: 'System prompt', tokens: 3_200, color: '#64748b' },
  { id: 'tools', label: 'Tool definitions', tokens: 14_600, color: '#a78bfa' },
  { id: 'files', label: 'Files', tokens: 48_000, color: '#2dd4bf' },
  { id: 'messages', label: 'Messages', tokens: 58_400, color: '#7dd3fc' },
];

export function ContextUsageDemo() {
  const [segs, setSegs] = useState<ContextSegment[]>(() => START.map((s) => ({ ...s, tokens: 0 })));
  const [compacting, setCompacting] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    const t = window.setTimeout(() => setSegs(START), 250);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(timer.current);
    };
  }, []);

  const add = (id: string, n: number) =>
    setSegs((all) => {
      const free = Math.max(0, 200_000 - all.reduce((a, x) => a + x.tokens, 0));
      return all.map((s) => (s.id === id ? { ...s, tokens: s.tokens + Math.min(n, free) } : s));
    });
  const compact = () => {
    setCompacting(true);
    timer.current = window.setTimeout(() => {
      setSegs((all) => all.map((s) => (s.id === 'messages' ? { ...s, tokens: Math.round(s.tokens * 0.18) } : s.id === 'tools' ? { ...s, tokens: Math.round(s.tokens * 0.6) } : s)));
      setCompacting(false);
    }, 1500);
  };

  const actions = [
    { label: 'Message', icon: MessageSquare, run: () => add('messages', 6_400) },
    { label: 'File', icon: FileText, run: () => add('files', 22_000) },
    { label: 'Tool call', icon: Wrench, run: () => add('tools', 7_800) },
  ];

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <ContextUsage segments={segs} limit={200_000} model="Nova Pro" onCompact={compact} compacting={compacting} />
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.run}
            disabled={compacting}
            className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-ink-850 px-2.5 text-xs text-ink-200 shadow-hairline transition-all hover:bg-ink-800 hover:text-ink-50 active:scale-95 disabled:opacity-50"
          >
            <a.icon className="h-3.5 w-3.5 text-ink-400" /> + {a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSegs(START)}
          aria-label="Reset"
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
