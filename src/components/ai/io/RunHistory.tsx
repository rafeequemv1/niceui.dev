import { useMemo, useState } from 'react';
import { AlertTriangle, Check, ChevronRight, CircleSlash, LoaderCircle, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Status = 'success' | 'failed' | 'running' | 'cancelled';
type Run = { id: string; task: string; agent: string; status: Status; started: string; seconds: number; tokens: number; cost: number; steps: { name: string; ms: number; ok: boolean }[] };

const RUNS: Run[] = [
  { id: 'run_8f3a', task: 'Triage support inbox', agent: 'Support', status: 'running', started: 'just now', seconds: 42, tokens: 18200, cost: 0.11, steps: [{ name: 'Fetch 31 emails', ms: 1800, ok: true }, { name: 'Classify', ms: 9200, ok: true }, { name: 'Draft replies', ms: 0, ok: true }] },
  { id: 'run_8f2c', task: 'Refactor billing module', agent: 'Coder', status: 'success', started: '12 min ago', seconds: 134, tokens: 96400, cost: 0.58, steps: [{ name: 'Read 14 files', ms: 3100, ok: true }, { name: 'Plan changes', ms: 8400, ok: true }, { name: 'Edit 6 files', ms: 71000, ok: true }, { name: 'Run tests', ms: 51000, ok: true }] },
  { id: 'run_8f1e', task: 'Weekly metrics report', agent: 'Analyst', status: 'success', started: '1 h ago', seconds: 48, tokens: 22800, cost: 0.14, steps: [{ name: 'Query warehouse', ms: 6200, ok: true }, { name: 'Build charts', ms: 14100, ok: true }, { name: 'Write summary', ms: 27700, ok: true }] },
  { id: 'run_8f0b', task: 'Sync CRM contacts', agent: 'Ops', status: 'failed', started: '3 h ago', seconds: 19, tokens: 4100, cost: 0.03, steps: [{ name: 'Authenticate', ms: 900, ok: true }, { name: 'Fetch contacts', ms: 18100, ok: false }] },
  { id: 'run_8efa', task: 'Research EU pricing', agent: 'Research', status: 'success', started: 'Yesterday', seconds: 212, tokens: 141000, cost: 0.86, steps: [{ name: 'Plan queries', ms: 4200, ok: true }, { name: 'Read 18 sources', ms: 158000, ok: true }, { name: 'Write brief', ms: 49800, ok: true }] },
  { id: 'run_8ef1', task: 'Draft launch email', agent: 'Writer', status: 'cancelled', started: 'Yesterday', seconds: 8, tokens: 1900, cost: 0.01, steps: [{ name: 'Read brief', ms: 8000, ok: true }] },
];

const STATUS: Record<Status, { label: string; icon: typeof Check; cls: string }> = {
  success: { label: 'Succeeded', icon: Check, cls: 'text-emerald-300 bg-emerald-500/10' },
  failed: { label: 'Failed', icon: AlertTriangle, cls: 'text-rose-300 bg-rose-500/10' },
  running: { label: 'Running', icon: LoaderCircle, cls: 'text-brand-300 bg-brand-500/10' },
  cancelled: { label: 'Cancelled', icon: CircleSlash, cls: 'text-ink-400 bg-white/5' },
};

const FILTERS = ['all', 'success', 'failed', 'running'] as const;
const dur = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const COST_7D = [0.9, 1.4, 1.1, 2.3, 1.8, 2.9, 1.73];

export type RunHistoryProps = { runs?: Run[]; className?: string };

/** Past agent runs with status, duration, tokens and cost; open a run to see its steps. */
export function RunHistory({ runs = RUNS, className }: RunHistoryProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [open, setOpen] = useState<string | null>('run_8f0b');
  const list = useMemo(() => runs.filter((r) => filter === 'all' || r.status === filter), [runs, filter]);
  const max = Math.max(...COST_7D);

  return (
    <div className={cn('w-full max-w-2xl overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 p-4">
        <div>
          <p className="text-xs text-ink-500">Spend, last 7 days</p>
          <p className="mt-0.5 font-mono text-xl tabular-nums text-ink-50">${COST_7D.reduce((a, b) => a + b, 0).toFixed(2)}</p>
        </div>
        <svg viewBox="0 0 140 36" className="h-9 w-36" aria-hidden>
          <defs>
            <linearGradient id="rh-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {(() => {
            const pts = COST_7D.map((v, i) => [i * (140 / (COST_7D.length - 1)), 34 - (v / max) * 30]);
            const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
            return (
              <>
                <path d={`${d} L140,36 L0,36 Z`} fill="url(#rh-fill)" />
                <path d={d} fill="none" stroke="#38bdf8" strokeWidth="1.6" />
              </>
            );
          })()}
        </svg>
        <div className="flex w-full gap-1 sm:w-auto" role="tablist" aria-label="Filter runs">
          {FILTERS.map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('focus-ring rounded-md px-2.5 py-1 text-xs capitalize transition-colors', filter === f ? 'bg-white/10 text-ink-50' : 'text-ink-400 hover:text-ink-100')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-white/5">
        {list.map((r) => {
          const S = STATUS[r.status];
          const Icon = S.icon;
          const isOpen = open === r.id;
          const total = r.steps.reduce((a, s) => a + s.ms, 0) || 1;
          return (
            <li key={r.id}>
              <button onClick={() => setOpen(isOpen ? null : r.id)} aria-expanded={isOpen} className="focus-ring flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]">
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', S.cls)}>
                  <Icon className={cn('h-3.5 w-3.5', r.status === 'running' && 'animate-spin')} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink-100">{r.task}</span>
                  <span className="block truncate text-[11.5px] text-ink-500">
                    {r.agent} · {r.started} · <span className="font-mono">{r.id}</span>
                  </span>
                </span>
                <span className="hidden text-right font-mono text-[11.5px] tabular-nums text-ink-400 sm:block">
                  <span className="block">{dur(r.seconds)}</span>
                  <span className="block text-ink-500">{(r.tokens / 1000).toFixed(1)}k tok</span>
                </span>
                <span className="w-14 text-right font-mono text-xs tabular-nums text-ink-200">${r.cost.toFixed(2)}</span>
                <ChevronRight className={cn('h-4 w-4 shrink-0 text-ink-500 transition-transform duration-300', isOpen && 'rotate-90')} />
              </button>
              {isOpen && (
                <div className="animate-fade-in space-y-2 px-4 pb-4 pl-14">
                  {r.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className={cn('w-32 shrink-0 truncate', s.ok ? 'text-ink-300' : 'text-rose-300')}>{s.name}</span>
                      <span className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5">
                        <span className={cn('absolute inset-y-0 left-0 rounded-full', s.ok ? 'bg-brand-400/70' : 'bg-rose-400/80')} style={{ width: `${Math.max(3, (s.ms / total) * 100)}%` }} />
                      </span>
                      <span className="w-12 shrink-0 text-right font-mono tabular-nums text-ink-500">{s.ms ? `${(s.ms / 1000).toFixed(1)}s` : '…'}</span>
                    </div>
                  ))}
                  {r.status === 'failed' && (
                    <p className="flex items-center gap-1.5 pt-1 text-xs text-rose-300">
                      <X className="h-3.5 w-3.5" /> 429 from the CRM API after 3 retries. Retry with a smaller batch?
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {list.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-500">No runs match this filter.</li>}
      </ul>
    </div>
  );
}

export function RunHistoryDemo() {
  return <RunHistory />;
}
