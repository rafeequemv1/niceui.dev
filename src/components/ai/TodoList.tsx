import { useEffect, useState } from 'react';
import { Check, ListChecks, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TodoStatus = 'pending' | 'active' | 'done';
export type TodoItem = { id: string; label: string; detail?: string; status: TodoStatus };

export type TodoListProps = { title?: string; items: TodoItem[]; onRestart?: () => void; className?: string };

function StatusIcon({ status }: { status: TodoStatus }) {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      <span
        className={cn(
          'absolute inset-0.5 rounded-full border-[1.5px] transition-all duration-300',
          status === 'pending' ? 'border-ink-600 opacity-100' : 'scale-50 border-transparent opacity-0',
        )}
      />
      <Loader2 className={cn('absolute h-4 w-4 animate-spin text-brand-400 transition-all duration-300', status === 'active' ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
      <span
        className={cn(
          'absolute inset-0.5 flex items-center justify-center rounded-full bg-emerald-500 text-ink-950 transition-all duration-500 ease-spring',
          status === 'done' ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        )}
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
      </span>
    </span>
  );
}

export function TodoList({ title = 'Plan', items, onRestart, className }: TodoListProps) {
  const done = items.filter((i) => i.status === 'done').length;
  const pct = items.length ? (done / items.length) * 100 : 0;
  const finished = done === items.length;

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-brand-300" />
          <h4 className="text-sm font-medium text-ink-50">{title}</h4>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-ink-400">
            {done}/{items.length}
          </span>
        </div>
        {onRestart && (
          <button
            onClick={onRestart}
            className="focus-ring group flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100"
          >
            <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
            Restart
          </button>
        )}
      </div>
      <div className="mx-4 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-smooth', finished ? 'bg-emerald-400' : 'bg-brand-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="p-2 pt-3">
        {items.map((item, i) => (
          <li
            key={item.id}
            className={cn(
              'flex animate-fade-up gap-3 rounded-lg px-2 py-2 transition-colors duration-300',
              item.status === 'active' && 'bg-brand-500/[0.06]',
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <StatusIcon status={item.status} />
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  'relative inline-block text-sm transition-colors duration-500',
                  item.status === 'done' ? 'text-ink-500' : item.status === 'active' ? 'text-ink-50' : 'text-ink-300',
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-px w-full origin-left bg-ink-500 transition-transform duration-500 ease-smooth',
                    item.status === 'done' ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </span>
              {item.detail && (
                <div className={cn('grid transition-all duration-300 ease-smooth', item.status === 'active' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <p className="shimmer-text overflow-hidden text-xs">{item.detail}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PLAN = [
  { label: 'Read the existing auth middleware', detail: 'Scanning src/middleware.ts…' },
  { label: 'Add session refresh endpoint', detail: 'Writing app/api/auth/refresh/route.ts…' },
  { label: 'Update useSession hook to retry on 401', detail: 'Editing hooks/useSession.ts…' },
  { label: 'Write integration tests', detail: 'Creating auth.refresh.test.ts…' },
  { label: 'Run the test suite', detail: 'pnpm test — 42 passing…' },
];

export function TodoListDemo() {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setStep(0);
    let s = 0;
    const id = window.setInterval(() => {
      s += 1;
      setStep(s);
      if (s > PLAN.length) window.clearInterval(id);
    }, 1400);
    return () => window.clearInterval(id);
  }, [run]);

  const items: TodoItem[] = PLAN.map((p, i) => ({
    id: String(i),
    ...p,
    status: i < step ? 'done' : i === step ? 'active' : 'pending',
  }));

  return (
    <div className="mx-auto w-full max-w-md">
      <TodoList title="Implement token refresh" items={items} onRestart={() => setRun((r) => r + 1)} />
    </div>
  );
}
