import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, Circle, ListChecks, Loader2, MessageSquareText, Play, Plus, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type PlanStep = { id: string; text: string; enabled?: boolean; /** Simulated run time in ms. */ duration?: number };
type Step = Required<PlanStep> & { isNew?: boolean };
type Status = 'draft' | 'changes' | 'revising' | 'running' | 'done';

export type PlanReviewProps = {
  title: string;
  steps: PlanStep[];
  /** Step the agent adds when changes are requested. */
  revision?: { after: number; text: string };
  className?: string;
};

const STATUS: Record<Status, { label: string; className: string }> = {
  draft: { label: 'Awaiting approval', className: 'bg-amber-500/10 text-amber-300' },
  changes: { label: 'Requesting changes', className: 'bg-white/[0.06] text-ink-300' },
  revising: { label: 'Revising', className: 'bg-brand-500/10 text-brand-300' },
  running: { label: 'Running', className: 'bg-brand-500/10 text-brand-300' },
  done: { label: 'Complete', className: 'bg-emerald-500/10 text-emerald-300' },
};

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="focus-ring grid h-7 w-7 place-items-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100 disabled:pointer-events-none disabled:opacity-25">
      {children}
    </button>
  );
}

/** An editable agent plan: reorder, rewrite, skip or add steps, then approve and watch it run. */
export function PlanReview({ title, steps: initial, revision, className }: PlanReviewProps) {
  const make = (s: PlanStep): Step => ({ enabled: true, duration: 1200, ...s });
  const [steps, setSteps] = useState<Step[]>(() => initial.map(make));
  const [status, setStatus] = useState<Status>('draft');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [moved, setMoved] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const runnable = steps.filter((s) => s.enabled);

  // Execute enabled steps one after another.
  useEffect(() => {
    if (status !== 'running') return;
    const order = steps.filter((s) => s.enabled);
    let i = 0;
    let start = performance.now();
    const t0 = start;
    setActive(0);
    setProgress(0);
    const id = window.setInterval(() => {
      const now = performance.now();
      setElapsed(now - t0);
      const p = (now - start) / order[i].duration;
      if (p < 1) return setProgress(p);
      i += 1;
      start = now;
      setProgress(0);
      if (i >= order.length) {
        window.clearInterval(id);
        setActive(order.length);
        setStatus('done');
      } else setActive(i);
    }, 40);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const flash = (id: string) => {
    setMoved(id);
    timers.current.push(window.setTimeout(() => setMoved((m) => (m === id ? null : m)), 700));
  };
  const move = (i: number, dir: -1 | 1) =>
    setSteps((s) => {
      const n = [...s];
      [n[i], n[i + dir]] = [n[i + dir], n[i]];
      flash(n[i + dir].id);
      return n;
    });
  const startEdit = (s: Step) => {
    setEditing(s.id);
    setDraft(s.text);
  };
  const commit = () => {
    if (editing && draft.trim()) setSteps((s) => s.map((x) => (x.id === editing ? { ...x, text: draft.trim() } : x)));
    setEditing(null);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(null);
  };
  const add = () => {
    const id = `new-${Date.now()}`;
    setSteps((s) => [...s, { id, text: '', enabled: true, duration: 1000, isNew: true }]);
    setEditing(id);
    setDraft('');
  };
  const sendChanges = () => {
    setStatus('revising');
    timers.current.push(
      window.setTimeout(() => {
        if (revision) {
          const id = `rev-${Date.now()}`;
          setSteps((s) => {
            const n = [...s];
            n.splice(Math.min(revision.after, n.length), 0, { id, text: revision.text, enabled: true, duration: 1100, isNew: true });
            return n;
          });
          flash(id);
        }
        setNote('Plan updated with your feedback · 1 step added');
        setFeedback('');
        setStatus('draft');
      }, 1300),
    );
  };
  const reset = () => {
    setSteps(initial.map(make));
    setStatus('draft');
    setActive(-1);
    setElapsed(0);
    setNote(null);
  };

  const live = status === 'running' || status === 'done';
  const overall = live ? Math.min(1, (Math.max(0, active) + (status === 'done' ? 0 : progress)) / Math.max(1, runnable.length)) : 0;
  let runIndex = -1;

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="relative h-0.5 bg-white/[0.04]">
        <div className="absolute inset-y-0 left-0 bg-brand-400 transition-[width] duration-200" style={{ width: `${overall * 100}%` }} />
      </div>
      <header className="flex flex-wrap items-start gap-3 px-4 pb-3 pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-ink-200">
          <ListChecks className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-50">Proposed plan</p>
          <p className="truncate text-xs text-ink-500">
            {title} · {runnable.length} steps
          </p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', STATUS[status].className)}>{STATUS[status].label}</span>
      </header>

      {note && status === 'draft' && (
        <p className="mx-4 mb-2 flex items-center gap-1.5 rounded-lg bg-brand-500/[0.07] px-2.5 py-1.5 text-xs text-brand-200 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" /> {note}
        </p>
      )}

      <ol className={cn('space-y-0.5 px-2 pb-2 transition-opacity', status === 'revising' && 'opacity-50')}>
        {steps.map((s, i) => {
          if (s.enabled) runIndex += 1;
          const ri = runIndex;
          const state = !live || !s.enabled ? 'idle' : ri < active ? 'done' : ri === active && status === 'running' ? 'running' : status === 'done' ? 'done' : 'queued';
          return (
            <li key={s.id} className={cn('group relative rounded-xl px-2.5 py-2 transition-colors duration-500', moved === s.id ? 'bg-brand-500/[0.08]' : 'hover:bg-white/[0.02]', !s.enabled && 'opacity-45')}>
              <div className="flex items-start gap-2.5">
                {live ? (
                  <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center">
                    {state === 'done' && <Check className="h-4 w-4 text-emerald-400 animate-scale-in" />}
                    {state === 'running' && <Loader2 className="h-4 w-4 animate-spin text-brand-400" />}
                    {(state === 'queued' || state === 'idle') && <Circle className="h-3.5 w-3.5 text-ink-600" />}
                  </span>
                ) : (
                  <button
                    role="checkbox"
                    aria-checked={s.enabled}
                    aria-label={`Include step ${i + 1}`}
                    onClick={() => setSteps((x) => x.map((y) => (y.id === s.id ? { ...y, enabled: !y.enabled } : y)))}
                    className={cn('focus-ring mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] ring-1 transition-colors', s.enabled ? 'bg-brand-500 text-white ring-brand-400' : 'ring-white/20 hover:ring-white/40')}
                  >
                    {s.enabled && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                )}
                <span className="mt-0.5 w-5 shrink-0 font-mono text-[11px] tabular-nums text-ink-500">{String(i + 1).padStart(2, '0')}</span>
                {editing === s.id ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKey}
                    onBlur={commit}
                    placeholder="Describe the step…"
                    aria-label={`Step ${i + 1}`}
                    className="-my-1 min-w-0 flex-1 rounded-md bg-ink-950/60 px-2 py-1 text-sm text-ink-50 outline-none ring-1 ring-brand-400/50 placeholder:text-ink-600"
                  />
                ) : (
                  <button
                    onClick={() => !live && status !== 'revising' && startEdit(s)}
                    disabled={live}
                    aria-label={`Edit step ${i + 1}: ${s.text}`}
                    className={cn('focus-ring min-w-0 flex-1 rounded-md text-left text-sm leading-snug transition-colors', state === 'running' ? 'shimmer-text font-medium' : 'text-ink-200 enabled:hover:text-ink-50', !s.enabled && 'line-through decoration-ink-500')}
                  >
                    {s.text || <span className="text-ink-600">Untitled step</span>}
                    {s.isNew && <span className="ml-2 rounded bg-brand-500/15 px-1.5 py-px align-middle text-[10px] font-medium text-brand-300">new</span>}
                  </button>
                )}
                {!live && editing !== s.id && (
                  <span className="flex shrink-0 items-center opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                    <IconButton label={`Move step ${i + 1} up`} onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton label={`Move step ${i + 1} down`} onClick={() => move(i, 1)} disabled={i === steps.length - 1}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconButton>
                  </span>
                )}
              </div>
              {state === 'running' && (
                <div className="ml-[58px] mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${progress * 100}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {status === 'changes' && (
        <div className="mx-4 mb-3 animate-fade-in">
          <textarea
            autoFocus
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            placeholder="e.g. Add a rollback before the rollout"
            aria-label="Feedback for the agent"
            className="w-full resize-none rounded-xl bg-ink-950/60 px-3 py-2 text-sm text-ink-100 outline-none ring-1 ring-white/10 placeholder:text-ink-600 focus:ring-brand-400/50"
          />
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-2 border-t border-white/5 px-4 py-3">
        {status === 'draft' && (
          <>
            <button onClick={add} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              <Plus className="h-3.5 w-3.5" /> Add step
            </button>
            <span className="ml-auto flex gap-2">
              <button onClick={() => setStatus('changes')} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-ink-200 ring-1 ring-white/10 transition-colors hover:bg-white/5">
                <MessageSquareText className="h-3.5 w-3.5" /> Request changes
              </button>
              <button onClick={() => setStatus('running')} disabled={!runnable.length} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-xs font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97] disabled:opacity-40">
                <Play className="h-3.5 w-3.5 fill-current" /> Approve & run
              </button>
            </span>
          </>
        )}
        {status === 'changes' && (
          <span className="ml-auto flex gap-2">
            <button onClick={() => setStatus('draft')} className="focus-ring h-8 rounded-lg px-3 text-xs text-ink-400 hover:bg-white/5 hover:text-ink-100">
              Cancel
            </button>
            <button onClick={sendChanges} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-ink-950 transition-all hover:bg-ink-100 active:scale-[0.97]">
              <Sparkles className="h-3.5 w-3.5" /> Send to agent
            </button>
          </span>
        )}
        {status === 'revising' && <span className="shimmer-text text-xs font-medium">Revising the plan…</span>}
        {live && (
          <>
            <span className="font-mono text-xs tabular-nums text-ink-400">
              {status === 'done' ? `Done · ${runnable.length} steps in ${(elapsed / 1000).toFixed(1)}s` : `Step ${Math.min(active + 1, runnable.length)} of ${runnable.length} · ${(elapsed / 1000).toFixed(1)}s`}
            </span>
            {status === 'done' && (
              <button onClick={reset} className="focus-ring ml-auto flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </>
        )}
      </footer>
    </div>
  );
}

/* ——— demo ——— */

const STEPS: PlanStep[] = [
  { id: 'a', text: 'Audit the current auth middleware and session usage', duration: 1100 },
  { id: 'b', text: 'Add the OAuth provider config behind a feature flag', duration: 1300 },
  { id: 'c', text: 'Move session storage from cookies to signed tokens', duration: 1500 },
  { id: 'd', text: 'Write integration tests for login and token refresh', duration: 1200 },
  { id: 'e', text: 'Roll out to 10% of users and watch error rates', duration: 1000 },
];

export function PlanReviewDemo() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <PlanReview title="Migrate auth to OAuth" steps={STEPS} revision={{ after: 3, text: 'Add a one-click rollback for the token migration' }} />
    </div>
  );
}
