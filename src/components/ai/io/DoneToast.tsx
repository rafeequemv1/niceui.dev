import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from './shared';

export type AgentToast = { id: number; title: string; detail: string; duration: string; status: 'running' | 'done' | 'undone'; progress: number };

const QUEUE = [
  { title: 'Refactored billing module', detail: '6 files changed · tests pass', duration: '2m 14s' },
  { title: 'Weekly report drafted', detail: '4 pages · 12 sources cited', duration: '48s' },
  { title: 'Inbox triaged', detail: '31 emails labelled · 4 need you', duration: '1m 02s' },
];

export type DoneToastStackProps = { className?: string };

/** Toasts that announce finished agent runs. A progress toast turns into a success state in place. */
export function DoneToastStack({ className }: DoneToastStackProps) {
  const [toasts, setToasts] = useState<AgentToast[]>([]);
  const n = useRef(0);
  const timers = useRef<number[]>([]);

  const push = (k: number) => {
    const q = QUEUE[k % QUEUE.length];
    const id = n.current++;
    const reduce = prefersReducedMotion();
    setToasts((t) => [{ id, ...q, status: reduce ? 'done' : 'running', progress: reduce ? 1 : 0 }, ...t].slice(0, 3));
  };

  useEffect(() => {
    setToasts([]);
    push(2);
    timers.current.push(window.setTimeout(() => push(1), 500));
    timers.current.push(window.setTimeout(() => push(0), 1100));
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toasts.some((t) => t.status === 'running')) return;
    const id = window.setInterval(
      () => setToasts((list) => list.map((t) => (t.status !== 'running' ? t : t.progress >= 1 ? { ...t, status: 'done' } : { ...t, progress: Math.min(1, t.progress + 0.035) }))),
      60
    );
    return () => clearInterval(id);
  }, [toasts]);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const undo = (id: number) => setToasts((t) => t.map((x) => (x.id === id ? { ...x, status: 'undone' } : x)));

  return (
    <div className={cn('relative flex w-full max-w-md flex-col items-stretch gap-4', className)}>
      <ol className="flex flex-col gap-2" aria-live="polite">
        {toasts.map((t, i) => (
          <li
            key={t.id}
            className={cn('relative animate-fade-down overflow-hidden rounded-2xl bg-ink-850 p-3.5 shadow-pop transition-all duration-300', i > 0 && 'opacity-80')}
            style={{ transform: `scale(${1 - i * 0.02})` }}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  t.status === 'running' ? 'bg-brand-500/15 text-brand-300' : t.status === 'done' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-ink-400'
                )}
              >
                {t.status === 'running' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : t.status === 'done' ? <Check className="h-4 w-4 animate-scale-in" /> : <RotateCcw className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-100">{t.status === 'running' ? `${t.title.split(' ')[0]}…` : t.status === 'undone' ? `Undone: ${t.title}` : t.title}</p>
                <p className="mt-0.5 truncate text-xs text-ink-400">{t.status === 'running' ? `Working · ${Math.round(t.progress * 100)}%` : `${t.detail} · ${t.duration}`}</p>
                {t.status === 'done' && (
                  <div className="mt-2.5 flex gap-1.5">
                    <button className="focus-ring flex h-7 items-center gap-1 rounded-md bg-white/5 px-2.5 text-xs text-ink-100 hover:bg-white/10">
                      Open <ArrowUpRight className="h-3 w-3" />
                    </button>
                    <button onClick={() => undo(t.id)} className="focus-ring h-7 rounded-md px-2.5 text-xs text-ink-400 hover:bg-white/5 hover:text-ink-100">
                      Undo
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="focus-ring -mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:bg-white/5 hover:text-ink-200">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {t.status === 'running' && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-400 transition-[width]" style={{ width: `${t.progress * 100}%` }} />}
          </li>
        ))}
      </ol>
      <button onClick={() => push(n.current)} className="focus-ring self-center rounded-full border border-white/10 px-4 py-2 text-xs text-ink-300 transition-colors hover:bg-white/5 hover:text-ink-100">
        Run another task
      </button>
    </div>
  );
}

export function DoneToastDemo() {
  return <DoneToastStack />;
}
