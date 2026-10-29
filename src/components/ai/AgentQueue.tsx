import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, Check, ChevronDown, CircleAlert, Clock3, FileCode2, GitBranch, GitMerge, GitPullRequest, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TaskStatus = 'queued' | 'running' | 'review' | 'merged' | 'failed';
export type AgentTask = {
  id: number;
  title: string;
  repo: string;
  branch: string;
  status: TaskStatus;
  /** 0–1 while running. */
  progress?: number;
  added?: number;
  removed?: number;
  age: string;
  note?: string;
  files?: { path: string; added: number; removed: number }[];
  summary?: string[];
};

const STEPS = ['Cloning repository', 'Reading 42 files', 'Planning changes', 'Editing code', 'Writing tests', 'Running tests', 'Opening pull request'];

const SEED: AgentTask[] = [
  { id: 1, title: 'Add rate limiting to /api/upload', repo: 'acme/web', branch: 'agent/rate-limit', status: 'running', progress: 0.46, age: 'now' },
  {
    id: 2,
    title: 'Migrate date helpers to Temporal',
    repo: 'acme/web',
    branch: 'agent/temporal',
    status: 'review',
    added: 412,
    removed: 388,
    age: '6m',
    summary: ['Replaced 31 moment.js call sites with Temporal.PlainDate', 'Kept the public formatDate() signature, so nothing upstream breaks', 'Added 18 tests for time-zone edge cases; all pass'],
    files: [
      { path: 'src/lib/dates.ts', added: 164, removed: 201 },
      { path: 'src/lib/dates.test.ts', added: 188, removed: 0 },
      { path: 'src/features/billing/invoice.tsx', added: 38, removed: 112 },
      { path: 'package.json', added: 2, removed: 3 },
    ],
  },
  { id: 3, title: 'Fix flaky checkout end-to-end test', repo: 'acme/web', branch: 'agent/flaky-e2e', status: 'queued', age: '9m' },
  { id: 4, title: 'Upgrade to React 19 and fix the types', repo: 'acme/dashboard', branch: 'agent/react-19', status: 'failed', age: '24m', note: 'Type errors in 3 files after upgrade' },
  { id: 5, title: 'Add dark mode to the settings page', repo: 'acme/web', branch: 'agent/settings-dark', status: 'merged', added: 96, removed: 12, age: '1h' },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'running', label: 'Running' },
  { id: 'review', label: 'Review' },
] as const;
type Filter = (typeof FILTERS)[number]['id'];

function useReducedMotion() {
  const [reduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduce;
}

const STATUS: Record<TaskStatus, { label: string; cls: string; icon: typeof Check }> = {
  queued: { label: 'Queued', cls: 'bg-white/[0.05] text-ink-400', icon: Clock3 },
  running: { label: 'Running', cls: 'bg-brand-500/10 text-brand-300', icon: Loader2 },
  review: { label: 'Needs review', cls: 'bg-amber-500/10 text-amber-300', icon: GitPullRequest },
  merged: { label: 'Merged', cls: 'bg-violet-500/10 text-violet-300', icon: GitMerge },
  failed: { label: 'Failed', cls: 'bg-rose-500/10 text-rose-300', icon: CircleAlert },
};

export type AgentQueueProps = { initial?: AgentTask[]; className?: string };

/** An inbox for background agents: queue tasks, watch them run, then review and merge. */
export function AgentQueue({ initial = SEED, className }: AgentQueueProps) {
  const reduce = useReducedMotion();
  const [tasks, setTasks] = useState(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<number | null>(2);
  const [draft, setDraft] = useState('');
  const nextId = useRef(100);

  // Advance running tasks; promote the queue when a slot frees up.
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setTasks((list) => {
        let changed = false;
        const out = list.map((t) => {
          if (t.status !== 'running') return t;
          changed = true;
          const p = Math.min(1, (t.progress ?? 0) + 0.012 + Math.random() * 0.01);
          if (p >= 1) return { ...t, status: 'review' as const, progress: 1, added: 128 + (t.id % 7) * 11, removed: 34 + (t.id % 5) * 6, age: 'now', summary: ['Implemented the change behind a feature flag', 'Added tests; 24 of 24 pass', 'No breaking changes to public APIs'], files: [{ path: 'src/server/limits.ts', added: 84, removed: 12 }, { path: 'src/server/limits.test.ts', added: 61, removed: 0 }] };
          return { ...t, progress: p };
        });
        if (!out.some((t) => t.status === 'running')) {
          const q = out.findIndex((t) => t.status === 'queued');
          if (q >= 0) {
            out[q] = { ...out[q], status: 'running', progress: 0.02, age: 'now' };
            changed = true;
          }
        }
        return changed ? out : list;
      });
    }, 160);
    return () => window.clearInterval(id);
  }, [reduce]);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    setFilter('all');
    const busy = tasks.some((t) => t.status === 'running');
    setTasks((list) => [{ id: nextId.current++, title, repo: 'acme/web', branch: `agent/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 22).replace(/-$/, '')}`, status: busy ? 'queued' : 'running', progress: 0.02, age: 'now' }, ...list]);
  };
  const set = (id: number, patch: Partial<AgentTask>) => setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const counts = { all: tasks.length, running: tasks.filter((t) => t.status === 'running' || t.status === 'queued').length, review: tasks.filter((t) => t.status === 'review').length };
  const shown = tasks.filter((t) => filter === 'all' || (filter === 'running' ? t.status === 'running' || t.status === 'queued' : t.status === 'review'));

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 text-left shadow-card', className)}>
      <form onSubmit={add} className="border-b border-white/5 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-ink-950/60 p-1.5 pl-3 ring-1 ring-white/10 transition focus-within:ring-brand-400/50">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Describe a task for an agent…" aria-label="New agent task" className="h-8 min-w-0 flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500" />
          <span className="hidden items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[10.5px] text-ink-400 sm:flex">
            <GitBranch className="h-3 w-3" /> acme/web · main
          </span>
          <button type="submit" disabled={!draft.trim()} aria-label="Start task" className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-300 text-brand-950 transition hover:bg-brand-200 active:scale-95 disabled:bg-white/10 disabled:text-ink-500">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-1 border-b border-white/5 px-3 py-2" role="tablist" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn('focus-ring flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors', filter === f.id ? 'bg-white/[0.07] text-ink-50' : 'text-ink-400 hover:text-ink-100')}
          >
            {f.label}
            <span className="font-mono text-[10px] tabular-nums text-ink-500">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <ul className="divide-y divide-white/5">
        {shown.map((t) => {
          const S = STATUS[t.status];
          const step = STEPS[Math.min(STEPS.length - 1, Math.floor((t.progress ?? 0) * STEPS.length))];
          const isOpen = open === t.id && t.status === 'review';
          return (
            <li key={t.id} className="animate-fade-in">
              <div className="flex items-start gap-3 px-4 py-3">
                <span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg', S.cls)}>
                  <S.icon className={cn('h-3.5 w-3.5', t.status === 'running' && 'animate-spin')} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-100">{t.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-ink-500">
                    <span className="truncate font-mono">
                      {t.repo} · {t.branch}
                    </span>
                    {t.added !== undefined && (
                      <span className="font-mono tabular-nums">
                        <span className="text-emerald-300">+{t.added}</span> <span className="text-rose-300">−{t.removed}</span>
                      </span>
                    )}
                    <span>{t.age}</span>
                  </p>
                  {t.status === 'running' && (
                    <div className="mt-2">
                      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-brand-400 transition-[width] duration-200" style={{ width: `${(t.progress ?? 0) * 100}%` }} />
                      </div>
                      <p className="mt-1.5 text-[11.5px] shimmer-text">{step}…</p>
                    </div>
                  )}
                  {t.status === 'failed' && <p className="mt-1.5 text-[11.5px] text-rose-300/80">{t.note}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={cn('hidden rounded-full px-2 py-0.5 text-[10.5px] font-medium sm:inline', S.cls)}>{S.label}</span>
                  {t.status === 'review' && (
                    <button onClick={() => setOpen(isOpen ? null : t.id)} aria-expanded={isOpen} className="focus-ring flex h-7 items-center gap-1 rounded-md bg-amber-400/15 px-2 text-xs font-medium text-amber-200 transition hover:bg-amber-400/25">
                      Review <ChevronDown className={cn('h-3 w-3 transition-transform duration-300', isOpen && 'rotate-180')} />
                    </button>
                  )}
                  {t.status === 'failed' && (
                    <button onClick={() => set(t.id, { status: 'running', progress: 0.02, age: 'now', note: undefined })} className="focus-ring flex h-7 items-center gap-1 rounded-md px-2 text-xs text-ink-300 shadow-hairline transition hover:bg-white/5">
                      <RotateCcw className="h-3 w-3" /> Retry
                    </button>
                  )}
                </div>
              </div>
              <div className={cn('grid transition-all duration-500 ease-smooth', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                <div className="overflow-hidden">
                  <div className="mx-4 mb-3 rounded-xl bg-ink-850/70 p-3 ring-1 ring-white/5">
                    <ul className="space-y-1">
                      {t.summary?.map((s) => (
                        <li key={s} className="flex gap-2 text-[12px] leading-snug text-ink-300">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-3 space-y-1 border-t border-white/5 pt-2.5">
                      {t.files?.map((f) => (
                        <li key={f.path} className="flex items-center gap-2 font-mono text-[11px]">
                          <FileCode2 className="h-3 w-3 shrink-0 text-ink-500" />
                          <span className="min-w-0 flex-1 truncate text-ink-300">{f.path}</span>
                          <span className="tabular-nums text-emerald-300">+{f.added}</span>
                          <span className="tabular-nums text-rose-300">−{f.removed}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          set(t.id, { status: 'merged', age: 'now' });
                          setOpen(null);
                        }}
                        className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-brand-300 px-3 text-xs font-medium text-brand-950 transition hover:bg-brand-200 active:scale-95"
                      >
                        <GitMerge className="h-3.5 w-3.5" /> Approve & merge
                      </button>
                      <button onClick={() => set(t.id, { status: 'running', progress: 0.5, age: 'now' })} className="focus-ring h-8 rounded-lg px-3 text-xs text-ink-300 shadow-hairline transition hover:bg-white/5">
                        Request changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-500">Nothing here right now.</li>}
      </ul>
    </div>
  );
}

export function AgentQueueDemo() {
  return <AgentQueue />;
}
