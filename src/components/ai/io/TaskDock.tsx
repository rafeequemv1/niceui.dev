import { useEffect, useState } from 'react';
import { Bot, Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from './shared';

type Task = { id: number; title: string; step: string; steps: string[]; progress: number; speed: number; state: 'running' | 'done' | 'cancelled' };

const SEED: Task[] = [
  { id: 1, title: 'Migrate auth to OAuth', step: '', steps: ['Read the auth module', 'Add provider config', 'Move sessions to tokens', 'Write tests'], progress: 0.62, speed: 0.006, state: 'running' },
  { id: 2, title: 'Research EU pricing', step: '', steps: ['Plan queries', 'Read 18 sources', 'Summarize'], progress: 0.34, speed: 0.01, state: 'running' },
  { id: 3, title: 'Clean up CRM duplicates', step: '', steps: ['Scan 4,812 contacts', 'Merge 37 pairs'], progress: 0.88, speed: 0.012, state: 'running' },
  { id: 4, title: 'Generate release notes', step: '', steps: ['Read 24 commits', 'Write notes'], progress: 1, speed: 0, state: 'done' },
];

function Ring({ value, done }: { value: number; done: boolean }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
      <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/10" />
        <circle cx="12" cy="12" r={r} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${value * c} ${c}`} className={cn('transition-[stroke-dasharray] duration-200', done ? 'stroke-emerald-400' : 'stroke-brand-400')} />
      </svg>
      {done && <Check className="h-3 w-3 text-emerald-300" />}
    </span>
  );
}

export type TaskDockProps = { className?: string };

/** A downloads-tray style dock for background agent tasks. */
export function TaskDock({ className }: TaskDockProps) {
  const [tasks, setTasks] = useState<Task[]>(() => (prefersReducedMotion() ? SEED.map((t) => ({ ...t, progress: t.state === 'running' ? t.progress : 1 })) : SEED));
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(1);

  useEffect(() => {
    if (prefersReducedMotion() || !tasks.some((t) => t.state === 'running')) return;
    const id = window.setInterval(
      () => setTasks((list) => list.map((t) => (t.state !== 'running' ? t : t.progress + t.speed >= 1 ? { ...t, progress: 1, state: 'done' } : { ...t, progress: t.progress + t.speed }))),
      100
    );
    return () => clearInterval(id);
  }, [tasks]);

  const running = tasks.filter((t) => t.state === 'running');
  const finished = tasks.filter((t) => t.state !== 'running');
  const stepOf = (t: Task) => t.steps[Math.min(t.steps.length - 1, Math.floor(t.progress * t.steps.length))];

  const row = (t: Task) => (
    <li key={t.id} className="rounded-xl transition-colors hover:bg-white/[0.03]">
      <div className="flex items-center gap-3 px-2.5 py-2">
        <Ring value={t.progress} done={t.state === 'done'} />
        <button onClick={() => setExpanded((e) => (e === t.id ? null : t.id))} aria-expanded={expanded === t.id} className="focus-ring min-w-0 flex-1 rounded text-left">
          <span className={cn('block truncate text-[13px]', t.state === 'cancelled' ? 'text-ink-500 line-through' : 'text-ink-100')}>{t.title}</span>
          <span className="block truncate text-[11.5px] text-ink-500">{t.state === 'running' ? `${stepOf(t)} · ${Math.round(t.progress * 100)}%` : t.state === 'done' ? 'Finished' : 'Cancelled'}</span>
        </button>
        {t.state === 'running' ? (
          <button onClick={() => setTasks((l) => l.map((x) => (x.id === t.id ? { ...x, state: 'cancelled' } : x)))} aria-label={`Cancel ${t.title}`} className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-white/5 hover:text-rose-300">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {expanded === t.id && (
        <ol className="animate-fade-in space-y-1.5 pb-2.5 pl-12 pr-3">
          {t.steps.map((s, i) => {
            const at = (i + 1) / t.steps.length;
            const done = t.progress >= at || t.state === 'done';
            const active = !done && t.progress >= i / t.steps.length && t.state === 'running';
            return (
              <li key={s} className={cn('flex items-center gap-2 text-xs', done ? 'text-ink-300' : active ? 'text-ink-100' : 'text-ink-500')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', done ? 'bg-emerald-400' : active ? 'animate-pulse bg-brand-400' : 'bg-white/15')} />
                {s}
              </li>
            );
          })}
        </ol>
      )}
    </li>
  );

  return (
    <div className={cn('w-full max-w-sm overflow-hidden rounded-2xl bg-ink-900 shadow-pop', className)}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="focus-ring flex w-full items-center gap-2.5 px-4 py-3 text-left">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
          <Bot className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm font-medium text-ink-100">{running.length ? `${running.length} agent${running.length > 1 ? 's' : ''} working` : 'All tasks finished'}</span>
        <ChevronDown className={cn('h-4 w-4 text-ink-500 transition-transform duration-300', !open && '-rotate-180')} />
      </button>
      <div className={cn('grid transition-all duration-300 ease-smooth', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <ul className="space-y-0.5 border-t border-white/5 p-1.5">{running.map(row)}</ul>
          {finished.length > 0 && (
            <>
              <div className="flex items-center justify-between border-t border-white/5 px-4 pb-1 pt-2.5">
                <span className="text-[11px] uppercase tracking-wider text-ink-500">Completed</span>
                <button onClick={() => setTasks((l) => l.filter((t) => t.state === 'running'))} className="focus-ring rounded text-[11px] text-ink-500 hover:text-ink-200">
                  Clear
                </button>
              </div>
              <ul className="space-y-0.5 p-1.5 pt-0">{finished.map(row)}</ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TaskDockDemo() {
  return <TaskDock />;
}
