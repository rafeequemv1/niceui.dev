import { useEffect, useState } from 'react';
import { BookOpen, Brain, Check, Pencil, RefreshCw, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ActivityKind = 'thinking' | 'searching' | 'reading' | 'writing';
export type ActivityStep = { kind: ActivityKind; title: string; detail?: string; duration: number };

const KIND = {
  thinking: { icon: Brain, color: 'text-amber-300 bg-amber-500/10' },
  searching: { icon: Search, color: 'text-sky-300 bg-sky-500/10' },
  reading: { icon: BookOpen, color: 'text-teal-300 bg-teal-500/10' },
  writing: { icon: Pencil, color: 'text-brand-300 bg-brand-500/10' },
} as const;

export type AgentActivityProps = { steps: ActivityStep[]; onComplete?: () => void; showRestart?: boolean; className?: string };

/** Live timeline: each step becomes active after the previous finishes. */
export function AgentActivity({ steps, onComplete, showRestart = true, className }: AgentActivityProps) {
  const [run, setRun] = useState(0);
  const [now, setNow] = useState(0);
  const total = steps.reduce((a, s) => a + s.duration, 0);

  useEffect(() => {
    setNow(0);
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now() - start;
      setNow(t);
      if (t < total + 100) raf = requestAnimationFrame(tick);
      else onComplete?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, total]);

  let acc = 0;
  const timeline = steps.map((s) => {
    const startAt = acc;
    acc += s.duration;
    return { ...s, startAt, state: now >= acc ? 'done' : now >= startAt ? 'active' : 'hidden', elapsed: Math.min(s.duration, Math.max(0, now - startAt)) };
  });
  const visible = timeline.filter((s) => s.state !== 'hidden');
  const finished = now >= acc;

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 p-4 shadow-card', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            {!finished && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400" />}
            <span className={cn('relative h-2 w-2 rounded-full transition-colors', finished ? 'bg-emerald-400' : 'bg-brand-400')} />
          </span>
          <span className="font-medium text-ink-100">{finished ? 'Completed' : 'Working'}</span>
          <span className="font-mono text-xs tabular-nums text-ink-500">{(Math.min(now, acc) / 1000).toFixed(1)}s</span>
        </div>
        {showRestart && <button
          onClick={() => setRun((r) => r + 1)}
          className="focus-ring group flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100"
        >
          <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" /> Restart
        </button>}
      </div>
      <ol className="relative">
        {visible.map((s, i) => {
          const { icon: Icon, color } = KIND[s.kind];
          const active = s.state === 'active';
          const last = i === visible.length - 1;
          return (
            <li key={`${run}-${i}`} className="relative flex animate-fade-up gap-3 pb-4 last:pb-0">
              {!last && <span className="absolute left-[13px] top-8 h-[calc(100%-28px)] w-px origin-top animate-scale-in bg-white/10" />}
              <span className={cn('relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-500', active ? color : 'bg-white/5 text-ink-400')}>
                {active ? <Icon className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5 animate-scale-in text-emerald-400" />}
                {active && <span className="absolute inset-0 animate-pulse-ring rounded-lg border border-current opacity-40" />}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={cn('truncate text-sm', active ? 'shimmer-text font-medium' : 'text-ink-200')}>{s.title}</p>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-500">{(s.elapsed / 1000).toFixed(1)}s</span>
                </div>
                {s.detail && <p className="mt-0.5 truncate text-xs text-ink-500">{s.detail}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const STEPS: ActivityStep[] = [
  { kind: 'thinking', title: 'Planning the comparison', detail: 'Breaking the request into pricing, limits and support', duration: 1600 },
  { kind: 'searching', title: 'Searching 3 providers', detail: 'neon.tech · planetscale.com · supabase.com', duration: 2200 },
  { kind: 'reading', title: 'Reading pricing pages', detail: '8 pages · 14,203 tokens', duration: 2400 },
  { kind: 'thinking', title: 'Normalizing plan tiers', detail: 'Mapping compute hours to monthly cost', duration: 1400 },
  { kind: 'writing', title: 'Drafting the summary table', detail: 'comparison.md', duration: 2000 },
];

export function AgentActivityDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <AgentActivity steps={STEPS} />
    </div>
  );
}
