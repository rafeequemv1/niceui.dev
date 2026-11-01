import { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, Pencil, RotateCw, SkipForward, Wrench } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AssistantMsg, Thread, UserMsg, useCountdown, useTimers } from './shared';

export type ToolFailureState = 'failed' | 'waiting' | 'running' | 'success' | 'skipped';

export type ToolFailureProps = {
  tool: string;
  args: string;
  error: { code: string; message: string; detail?: string };
  state: ToolFailureState;
  attempt: number;
  /** Timestamp (ms) of the next automatic retry while `state` is 'waiting'. */
  retryAt?: number | null;
  onRetry: () => void;
  onSkip: () => void;
  onEditArgs: (args: string) => void;
  className?: string;
};

export function ToolFailure({ tool, args, error, state, attempt, retryAt = null, onRetry, onSkip, onEditArgs, className }: ToolFailureProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(args);
  const secs = useCountdown(state === 'waiting' ? retryAt : null);
  const bad = state === 'failed' || state === 'waiting';

  return (
    <div className={cn('overflow-hidden rounded-xl shadow-hairline transition-colors duration-500', bad ? 'bg-rose-500/[0.05]' : 'bg-white/[0.02]', className)}>
      <div className="flex items-center gap-3 px-3.5 py-3">
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', bad ? 'bg-rose-500/15 text-rose-300' : state === 'success' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-ink-300')}>
          {state === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : state === 'success' ? <CheckCircle2 className="h-4 w-4" /> : bad ? <AlertTriangle className="h-4 w-4" /> : <SkipForward className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm text-ink-100">
            <Wrench className="h-3.5 w-3.5 shrink-0 text-ink-500" />
            <span className="truncate font-mono text-[13px]">{tool}</span>
          </p>
          <p className="truncate text-xs text-ink-400">
            {state === 'failed' && `${error.code} · ${error.message}`}
            {state === 'waiting' && `Retrying in ${secs}s · attempt ${attempt + 1} of 3`}
            {state === 'running' && `Running · attempt ${attempt}`}
            {state === 'success' && `Succeeded on attempt ${attempt}`}
            {state === 'skipped' && 'Skipped. The agent will continue without it.'}
          </p>
        </div>
        {bad && (
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Error details" className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 hover:bg-white/5 hover:text-ink-100">
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-300 ease-spring', open && 'rotate-180')} />
          </button>
        )}
      </div>

      <div className={cn('grid transition-all duration-300 ease-smooth', bad && open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-white/5 px-3.5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500">Arguments</p>
            {editing ? (
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} aria-label="Tool arguments" className="w-full resize-none rounded-lg bg-ink-950/70 p-2.5 font-mono text-xs text-ink-100 shadow-hairline outline-none focus:ring-1 focus:ring-brand-400/50" />
            ) : (
              <pre className="overflow-x-auto rounded-lg bg-ink-950/70 p-2.5 font-mono text-xs text-ink-300">{args}</pre>
            )}
            {error.detail && <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-rose-500/[0.06] p-2.5 font-mono text-[11px] leading-relaxed text-rose-200/80">{error.detail}</pre>}
          </div>
        </div>
      </div>

      {bad && (
        <div className="flex flex-wrap gap-2 border-t border-white/5 bg-black/20 px-3.5 py-2.5">
          <button onClick={onRetry} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-medium text-ink-50 hover:bg-white/15">
            <RotateCw className="h-3.5 w-3.5" /> {state === 'waiting' ? 'Retry now' : 'Retry'}
          </button>
          {editing ? (
            <button
              onClick={() => {
                onEditArgs(draft);
                setEditing(false);
              }}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-xs font-medium text-white hover:bg-brand-400"
            >
              Save & retry
            </button>
          ) : (
            <button
              onClick={() => {
                setOpen(true);
                setEditing(true);
              }}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-ink-300 hover:bg-white/5 hover:text-ink-100"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit arguments
            </button>
          )}
          <button onClick={onSkip} className="focus-ring ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-ink-400 hover:bg-white/5 hover:text-ink-100">
            <SkipForward className="h-3.5 w-3.5" /> Skip
          </button>
        </div>
      )}
    </div>
  );
}

const ERR = {
  code: '503',
  message: 'Upstream timed out',
  detail: 'GET https://api.internal/orders?customer=c_8812\n→ 503 Service Unavailable after 10.0s\nrequest id: req_7Hq2kd',
};

export function ToolFailureDemo() {
  const later = useTimers();
  const [state, setState] = useState<ToolFailureState>('failed');
  const [attempt, setAttempt] = useState(1);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [args, setArgs] = useState('{ "customer": "c_8812", "limit": 20 }');

  const token = useRef(0);
  const run = (n: number) => {
    const id = ++token.current;
    setState('running');
    setAttempt(n);
    later(1100, () => {
      if (id !== token.current) return;
      if (n < 3) {
        // Exponential backoff: 2s, then 4s.
        const wait = 2 ** n * 1000;
        setState('waiting');
        setRetryAt(Date.now() + wait);
        later(wait, () => id === token.current && run(n + 1));
      } else setState('success');
    });
  };

  return (
    <Thread>
      <UserMsg>Why was customer c_8812 charged twice?</UserMsg>
      <ToolFailure
        tool="orders.search"
        args={args}
        error={ERR}
        state={state}
        attempt={attempt}
        retryAt={retryAt}
        onRetry={() => run(attempt + 1)}
        onSkip={() => {
          token.current++;
          setState('skipped');
        }}
        onEditArgs={(a) => {
          setArgs(a);
          run(attempt + 1);
        }}
      />
      {state === 'success' && <AssistantMsg>Found it: two captures 4 seconds apart on order #4821 after a checkout retry. I've drafted a refund for the duplicate.</AssistantMsg>}
      {state === 'skipped' && <AssistantMsg>I couldn't reach the orders service, so this is based on billing logs only: there are two charges on 14 Oct, 4 seconds apart.</AssistantMsg>}
      {(state === 'success' || state === 'skipped') && (
        <button
          onClick={() => {
            setState('failed');
            setAttempt(1);
          }}
          className="focus-ring rounded-md px-2 py-1 text-xs text-ink-500 hover:text-ink-200"
        >
          Reset demo
        </button>
      )}
    </Thread>
  );
}
