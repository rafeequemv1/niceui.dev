import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, PenLine, Search, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type StatusStep = { label: string; icon: LucideIcon; ms: number };

export type RotatingStatusProps = {
  steps?: StatusStep[];
  /** Label shown after the last step. */
  doneLabel?: string;
  loop?: boolean;
  className?: string;
};

const DEFAULT: StatusStep[] = [
  { label: 'Searching the web…', icon: Search, ms: 1600 },
  { label: 'Reading 4 sources…', icon: BookOpen, ms: 1900 },
  { label: 'Writing the answer…', icon: PenLine, ms: 1700 },
];

/** Cycles through what the agent is doing, sliding each label up with a soft blur, with an elapsed timer. */
export function RotatingStatus({ steps = DEFAULT, doneLabel = 'Done', loop = true, className }: RotatingStatusProps) {
  const [i, setI] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const t0 = useRef(performance.now());
  const done = i >= steps.length;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setI(steps.length);
      return;
    }
    if (done) {
      if (!loop) return;
      const id = window.setTimeout(() => {
        t0.current = performance.now();
        setI(0);
      }, 1600);
      return () => clearTimeout(id);
    }
    const id = window.setTimeout(() => setI((n) => n + 1), steps[i].ms);
    return () => clearTimeout(id);
  }, [i, done, loop, steps]);

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setElapsed((performance.now() - t0.current) / 1000), 100);
    return () => clearInterval(id);
  }, [done]);

  const items = [...steps.map((s) => ({ label: s.label, icon: s.icon })), { label: doneLabel, icon: Check }];
  const cur = Math.min(i, steps.length);

  return (
    <div role="status" aria-live="polite" className={cn('inline-flex items-center gap-2.5 rounded-full bg-ink-900 py-1.5 pl-2 pr-3 shadow-card', className)}>
      <span className={cn('grid h-6 w-6 place-items-center rounded-full transition-colors duration-300', done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-brand-500/15 text-brand-300')}>
        {(() => {
          const Icon = items[cur].icon;
          return <Icon key={cur} className="h-3.5 w-3.5 animate-scale-in" />;
        })()}
      </span>
      <span className="relative h-5 w-40 overflow-hidden text-sm sm:w-44">
        {items.map((it, k) => (
          <span
            key={it.label}
            aria-hidden={k !== cur}
            className={cn(
              'absolute inset-0 truncate transition-all duration-500 ease-smooth',
              k === cur ? 'translate-y-0 opacity-100 blur-0' : k < cur ? '-translate-y-4 opacity-0 blur-[3px]' : 'translate-y-4 opacity-0 blur-[3px]',
              done ? 'text-ink-100' : 'text-ink-200',
            )}
          >
            {it.label}
          </span>
        ))}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-ink-500">{elapsed.toFixed(1)}s</span>
    </div>
  );
}

export function RotatingStatusDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <RotatingStatus steps={DEFAULT} />
      <p className="text-xs text-ink-500">Loops in the demo. Pass your own steps and icons.</p>
    </div>
  );
}
