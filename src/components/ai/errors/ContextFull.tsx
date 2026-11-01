import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, FileText, Layers, Loader2, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AssistantMsg, Composer, Thread, UserMsg, reducedMotion } from './shared';

export type ContextFullProps = {
  /** Tokens in use and the model's window. */
  used: number;
  limit: number;
  compacting?: boolean;
  onCompact: () => void;
  onNewChat: () => void;
  className?: string;
};

const k = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

export function ContextFull({ used, limit, compacting, onCompact, onNewChat, className }: ContextFullProps) {
  const pct = Math.min(100, (used / limit) * 100);
  const hot = pct > 90;

  return (
    <div className={cn('overflow-hidden rounded-xl shadow-hairline transition-colors duration-700', hot ? 'bg-amber-400/[0.05]' : 'bg-emerald-400/[0.04]', className)}>
      <div className="flex items-start gap-3 p-3.5">
        <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-700', hot ? 'bg-amber-400/15 text-amber-300' : 'bg-emerald-400/15 text-emerald-300')}>
          <Layers className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-50">{hot ? 'This chat is almost out of memory' : 'Conversation compacted'}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
            {hot ? 'Older messages will start to drop out of context. Compact it to keep going, or carry a summary into a new chat.' : 'Earlier turns were folded into a summary the assistant can still use.'}
          </p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className={cn('h-full rounded-full transition-[width,background-color] duration-[1400ms] ease-smooth', hot ? 'bg-amber-400' : 'bg-emerald-400')} style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-400">
              {k(used)} / {k(limit)}
            </span>
          </div>
        </div>
      </div>
      {hot && (
        <div className="flex flex-wrap gap-2 border-t border-white/5 bg-black/20 px-3.5 py-2.5">
          <button onClick={onCompact} disabled={compacting} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-xs font-medium text-white hover:bg-brand-400 disabled:opacity-70">
            {compacting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5" />}
            {compacting ? 'Summarising 46 messages…' : 'Compact conversation'}
          </button>
          <button onClick={onNewChat} disabled={compacting} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/5 px-3 text-xs font-medium text-ink-100 hover:bg-white/10 disabled:opacity-50">
            <MessageSquarePlus className="h-3.5 w-3.5" /> New chat with summary
          </button>
        </div>
      )}
    </div>
  );
}

export function ContextFullDemo() {
  const [mode, setMode] = useState<'full' | 'compacting' | 'compacted' | 'new'>('full');
  const [used, setUsed] = useState(196_000);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const compact = () => {
    setMode('compacting');
    timer.current = window.setTimeout(
      () => {
        setUsed(41_000);
        setMode('compacted');
      },
      reducedMotion() ? 0 : 1400,
    );
  };

  if (mode === 'new')
    return (
      <Thread title="New chat" footer={<Composer />}>
        <div className="rounded-xl bg-white/[0.03] p-3.5 shadow-hairline animate-fade-up">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-500">
            <FileText className="h-3.5 w-3.5" /> Carried over from "Pricing research"
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-ink-300">
            <li>• Comparing 6 competitors' seat vs usage pricing; usage wins for teams under 20.</li>
            <li>• Decision pending: free tier cap at 3 projects or 1,000 runs.</li>
            <li>• Next: draft the pricing page copy and FAQ.</li>
          </ul>
        </div>
        <AssistantMsg>I've got the summary of our earlier chat. Want me to start on the pricing page copy?</AssistantMsg>
        <button onClick={() => (setUsed(196_000), setMode('full'))} className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-500 hover:text-ink-200">
          Reset demo <ArrowRight className="h-3 w-3" />
        </button>
      </Thread>
    );

  return (
    <Thread title="Pricing research" footer={<Composer />}>
      <UserMsg>Compare that against the three competitors we looked at on Monday.</UserMsg>
      <AssistantMsg>Pulling Monday's notes together. Of the three, two price per seat and one on usage…</AssistantMsg>
      <ContextFull used={used} limit={200_000} compacting={mode === 'compacting'} onCompact={compact} onNewChat={() => setMode('new')} />
      {mode === 'compacted' && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-300/80 animate-fade-up">
          <Check className="h-3.5 w-3.5" /> 155k tokens freed. Nothing you said was deleted from your history.
          <button onClick={() => (setUsed(196_000), setMode('full'))} className="focus-ring ml-auto rounded-md px-2 py-0.5 text-ink-500 hover:text-ink-200">
            Reset
          </button>
        </p>
      )}
    </Thread>
  );
}
