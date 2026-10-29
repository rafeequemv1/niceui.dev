import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, Frown, Heart, Loader2, Meh, MessageSquare, Smile, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape } from '@/components/ui/motion/hooks';

type Mode = 'closed' | 'open' | 'sending' | 'done';

const RATINGS = [
  { id: 1, label: 'Not great', icon: Frown, tone: 'text-rose-400 bg-rose-500/15 shadow-[0_0_0_1px_rgba(251,113,133,0.4)]' },
  { id: 2, label: 'It’s okay', icon: Meh, tone: 'text-amber-400 bg-amber-500/15 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]' },
  { id: 3, label: 'Good', icon: Smile, tone: 'text-emerald-400 bg-emerald-500/15 shadow-[0_0_0_1px_rgba(52,211,153,0.4)]' },
  { id: 4, label: 'Love it', icon: Heart, tone: 'text-brand-300 bg-brand-500/15 shadow-[0_0_0_1px_rgba(56,189,248,0.4)]' },
];

const SIZE: Record<Mode, { w: number; h: number; r: number }> = {
  closed: { w: 132, h: 42, r: 21 },
  open: { w: 340, h: 286, r: 20 },
  sending: { w: 340, h: 286, r: 20 },
  done: { w: 260, h: 148, r: 24 },
};

export type FeedbackWidgetProps = { onSubmit?: (data: { rating: number; message: string }) => Promise<void> };

export function FeedbackWidget({ onSubmit = () => new Promise((r) => setTimeout(r, 1200)) }: FeedbackWidgetProps) {
  const [mode, setMode] = useState<Mode>('closed');
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => {
    setMode('closed');
    window.setTimeout(() => { setRating(null); setMessage(''); }, 300);
  }, []);
  useEscape(mode !== 'closed', close);
  useClickOutside([ref], mode === 'open' || mode === 'done', close);

  const send = async () => {
    if (!rating) return;
    setMode('sending');
    await onSubmit({ rating, message });
    setMode('done');
    window.setTimeout(() => setMode((m) => (m === 'done' ? 'closed' : m)), 2600);
  };

  const s = SIZE[mode];
  const layer = (show: boolean) => cn('absolute inset-0 transition-all duration-300', show ? 'opacity-100 blur-0 delay-150' : 'pointer-events-none opacity-0 blur-sm');

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden bg-ink-900 shadow-pop', mode === 'closed' && 'hover:bg-ink-850')}
      style={{ width: s.w, height: s.h, borderRadius: s.r, transition: 'width 550ms cubic-bezier(0.34,1.3,0.64,1), height 550ms cubic-bezier(0.34,1.3,0.64,1), border-radius 550ms, background-color 200ms' }}
    >
      <button onClick={() => setMode('open')} tabIndex={mode === 'closed' ? 0 : -1} className={cn(layer(mode === 'closed'), 'focus-ring flex items-center justify-center gap-2 text-sm font-medium text-ink-100')}>
        <MessageSquare className="h-4 w-4" /> Feedback
      </button>

      <div className={cn(layer(mode === 'open' || mode === 'sending'), 'w-[340px] p-4')}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-50">How’s your experience?</p>
          <button aria-label="Close" onClick={close} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-ink-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {RATINGS.map((r) => {
            const on = rating === r.id;
            return (
              <button
                key={r.id}
                aria-label={r.label}
                aria-pressed={on}
                onClick={() => setRating(r.id)}
                className={cn('flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-all duration-300 ease-spring active:scale-90', on ? r.tone : 'bg-ink-850 text-ink-400 shadow-hairline hover:text-ink-100', on && 'scale-105')}
              >
                <r.icon className={cn('h-5 w-5 transition-transform duration-300 ease-spring', on && 'scale-110')} />
                {r.label}
              </button>
            );
          })}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 280))}
          placeholder="Tell us more (optional)…"
          rows={3}
          className="mt-3 w-full resize-none rounded-xl bg-ink-850 px-3 py-2.5 text-sm text-ink-50 shadow-hairline outline-none transition-shadow placeholder:text-ink-500 focus:shadow-glow"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] tabular-nums text-ink-500">{message.length}/280</span>
          <button
            onClick={send}
            disabled={!rating || mode === 'sending'}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-ink-50 px-3 text-xs font-medium text-ink-950 transition-all hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {mode === 'sending' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === 'sending' ? 'Sending' : 'Send feedback'}
          </button>
        </div>
      </div>

      <div className={cn(layer(mode === 'done'), 'flex w-[260px] flex-col items-center justify-center text-center')}>
        <span className="relative flex h-10 w-10 items-center justify-center">
          {mode === 'done' && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-500/30" />}
          <CheckCircle2 className={cn('h-8 w-8 text-emerald-400 transition-transform duration-500 ease-spring', mode === 'done' ? 'scale-100 delay-200' : 'scale-50')} />
        </span>
        <p className="mt-3 text-sm font-medium text-ink-50">Thanks for the feedback!</p>
        <p className="mt-0.5 text-xs text-ink-400">It goes straight to the team.</p>
      </div>
    </div>
  );
}

export function FeedbackWidgetDemo() {
  return (
    <div className="flex h-[320px] items-center justify-center">
      <FeedbackWidget />
    </div>
  );
}
