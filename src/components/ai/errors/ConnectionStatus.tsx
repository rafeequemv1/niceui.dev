import { useEffect, useRef, useState } from 'react';
import { Check, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AssistantMsg, Thread, UserMsg, useCountdown, useTimers } from './shared';

export type ConnectionState = 'online' | 'offline' | 'reconnecting';

export type ConnectionStatusProps = {
  state: ConnectionState;
  attempt?: number;
  /** Timestamp (ms) of the next reconnect attempt. */
  nextAttemptAt?: number | null;
  queued?: number;
  onRetryNow?: () => void;
  className?: string;
};

/** A slim bar that sits above the composer. It hides itself shortly after coming back online. */
export function ConnectionStatus({ state, attempt = 1, nextAttemptAt = null, queued = 0, onRetryNow, className }: ConnectionStatusProps) {
  const secs = useCountdown(state === 'offline' ? nextAttemptAt : null);
  const [showOnline, setShowOnline] = useState(false);
  const prev = useRef(state);

  useEffect(() => {
    if (state === 'online' && prev.current !== 'online') {
      setShowOnline(true);
      const id = window.setTimeout(() => setShowOnline(false), 2600);
      prev.current = state;
      return () => clearTimeout(id);
    }
    prev.current = state;
  }, [state]);

  const visible = state !== 'online' || showOnline;

  return (
    <div className={cn('grid transition-all duration-300 ease-smooth', visible ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0', className)} aria-live="polite">
      <div className="overflow-hidden">
        <div
          className={cn(
            'mb-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors duration-500',
            state === 'online' ? 'bg-emerald-400/10 text-emerald-200' : state === 'reconnecting' ? 'bg-brand-500/10 text-brand-200' : 'bg-amber-400/10 text-amber-200',
          )}
        >
          {state === 'online' ? <Wifi className="h-3.5 w-3.5 shrink-0" /> : state === 'reconnecting' ? <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" /> : <WifiOff className="h-3.5 w-3.5 shrink-0" />}
          <span className="min-w-0 flex-1 truncate">
            {state === 'online' && (queued ? `Back online · sending ${queued} queued` : 'Back online')}
            {state === 'reconnecting' && `Reconnecting… attempt ${attempt}`}
            {state === 'offline' && (
              <>
                You're offline. Retrying in <span className="font-mono tabular-nums">{secs}s</span>
                {queued > 0 && <span className="text-amber-200/70"> · {queued} queued</span>}
              </>
            )}
          </span>
          {state === 'offline' && onRetryNow && (
            <button onClick={onRetryNow} className="focus-ring shrink-0 rounded-md px-2 py-0.5 font-medium text-amber-100 hover:bg-white/10">
              Try now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type Queued = { id: number; text: string; status: 'queued' | 'sending' | 'sent' };

export function ConnectionStatusDemo() {
  const later = useTimers();
  const [state, setState] = useState<ConnectionState>('offline');
  const [attempt, setAttempt] = useState(1);
  const [nextAt, setNextAt] = useState<number | null>(() => Date.now() + 3000);
  const [msgs, setMsgs] = useState<Queued[]>([
    { id: 1, text: 'Also check the EU numbers', status: 'queued' },
    { id: 2, text: 'and flag anything over 5%', status: 'queued' },
  ]);
  const token = useRef(0);

  const tryConnect = (n: number) => {
    const id = ++token.current;
    setState('reconnecting');
    setAttempt(n);
    later(1200, () => {
      if (id !== token.current) return;
      if (n < 2) {
        setState('offline');
        setNextAt(Date.now() + 4000);
        later(4000, () => id === token.current && tryConnect(n + 1));
        return;
      }
      setState('online');
      setMsgs((m) => m.map((x) => ({ ...x, status: 'sending' })));
      later(700, () => setMsgs((m) => m.map((x) => ({ ...x, status: 'sent' }))));
    });
  };

  useEffect(() => {
    const id = window.setTimeout(() => tryConnect(1), 3000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    token.current++;
    setState('offline');
    setAttempt(1);
    setNextAt(Date.now() + 3000);
    setMsgs((m) => m.map((x) => ({ ...x, status: 'queued' })));
    later(3000, () => tryConnect(1));
  };

  const pending = msgs.filter((m) => m.status !== 'sent').length;

  return (
    <Thread
      footer={
        <>
          <ConnectionStatus state={state} attempt={attempt} nextAttemptAt={nextAt} queued={pending} onRetryNow={() => tryConnect(attempt + 1)} />
          <div className="flex items-center gap-2">
            <div className="flex h-10 flex-1 items-center rounded-xl bg-ink-950/60 px-3 text-sm text-ink-500 shadow-hairline">Messages you send now will queue…</div>
            <button onClick={reset} className="focus-ring h-10 shrink-0 rounded-xl px-3 text-xs text-ink-400 hover:bg-white/5 hover:text-ink-100">
              Drop connection
            </button>
          </div>
        </>
      }
    >
      <UserMsg>Summarise churn by region for last quarter.</UserMsg>
      <AssistantMsg>Churn rose to 3.1% overall, driven mostly by APAC self-serve plans. North America held steady at 2.4%…</AssistantMsg>
      {msgs.map((m) => (
        <div key={m.id} className="flex flex-col items-end gap-1">
          <p className={cn('max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm transition-all duration-500', m.status === 'sent' ? 'bg-brand-500/90 text-white' : 'bg-white/5 text-ink-300 shadow-hairline')}>{m.text}</p>
          <span className="flex items-center gap-1 text-[11px] text-ink-500">
            {m.status === 'queued' && (
              <>
                <Clock className="h-3 w-3" /> Queued
              </>
            )}
            {m.status === 'sending' && (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" /> Sending
              </>
            )}
            {m.status === 'sent' && (
              <>
                <Check className="h-3 w-3 text-emerald-400" /> Sent
              </>
            )}
          </span>
        </div>
      ))}
    </Thread>
  );
}
