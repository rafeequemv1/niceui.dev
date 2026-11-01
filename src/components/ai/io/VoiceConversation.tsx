import { useEffect, useMemo, useState } from 'react';
import { Hand, Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import { cn } from '@/lib/cn';
import { VoiceOrb, type OrbState } from '../VoiceOrb';
import { prefersReducedMotion, useTicker } from './shared';

type Turn = { who: 'user' | 'assistant'; text: string };

const SCRIPT: Turn[] = [
  { who: 'user', text: 'Can you move my 3pm with Priya to tomorrow morning?' },
  { who: 'assistant', text: 'Sure. Tomorrow at 9:30 is free for both of you. Want me to send the update with a short note?' },
  { who: 'user', text: 'Yes, and mention the new pricing deck.' },
  { who: 'assistant', text: 'Done. I moved it to 9:30 and attached the pricing deck to the invite.' },
];

// Timeline: each turn speaks for its word count at ~3.4 words/s, with short gaps.
function useTimeline() {
  return useMemo(() => {
    let at = 0.6;
    return SCRIPT.map((turn) => {
      const dur = turn.text.split(' ').length / 3.4;
      const t = { ...turn, start: at, end: at + dur };
      at += dur + (turn.who === 'user' ? 0.9 : 0.6);
      return t;
    });
  }, []);
}

export type VoiceConversationProps = { className?: string };

/** Realtime voice mode: orb, live captions for both sides, interrupt, mute and end call. */
export function VoiceConversation({ className }: VoiceConversationProps) {
  const timeline = useTimeline();
  const total = timeline[timeline.length - 1].end + 1.2;
  const [live, setLive] = useState(true);
  const [muted, setMuted] = useState(false);
  const [cut, setCut] = useState<number | null>(null);
  const [t, reset] = useTicker(live && !prefersReducedMotion(), 20);
  const now = prefersReducedMotion() ? total : t;

  useEffect(() => {
    if (live && t > total + 2) reset();
  }, [t, total, live, reset]);

  const idx = timeline.findIndex((x) => now >= x.start && now < x.end);
  const current = idx >= 0 ? timeline[idx] : null;
  const thinking = !current && timeline.some((x, i) => x.who === 'assistant' && now >= (timeline[i - 1]?.end ?? 0) && now < x.start);
  const state: OrbState = !live ? 'idle' : current?.who === 'assistant' ? 'speaking' : current?.who === 'user' ? (muted ? 'idle' : 'listening') : thinking ? 'thinking' : 'idle';

  const shown = timeline
    .filter((x) => now >= x.start)
    .map((x, i) => {
      const words = x.text.split(' ');
      const interrupted = cut !== null && x.who === 'assistant' && cut >= x.start && cut < x.end;
      const limit = interrupted ? (cut! - x.start) * 3.4 : (now - x.start) * 3.4;
      return { ...x, i, text: words.slice(0, Math.max(1, Math.ceil(limit))).join(' '), done: now >= x.end || interrupted, interrupted };
    })
    .slice(-3);

  const interrupt = () => {
    if (current?.who === 'assistant') setCut(now);
  };

  return (
    <div className={cn('relative w-full max-w-md overflow-hidden rounded-3xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-ink-300">
          <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-emerald-400' : 'bg-ink-500')} />
          {live ? 'Live' : 'Call ended'}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-ink-500">{live ? '182 ms' : '—'} latency</span>
      </div>

      <div className="flex justify-center py-6">
        <VoiceOrb state={state} size={150} />
      </div>
      <p className="-mt-2 text-center text-xs text-ink-400">
        {!live ? 'Tap call to start again' : state === 'speaking' ? 'Speaking…' : state === 'listening' ? 'Listening…' : state === 'thinking' ? 'Thinking…' : muted ? 'You are muted' : 'Go ahead'}
      </p>

      <div className="mx-4 mt-4 min-h-[132px] space-y-2.5" aria-live="polite">
        {shown.map((x) => (
          <div key={x.i} className={cn('flex animate-fade-up', x.who === 'user' ? 'justify-end' : 'justify-start')}>
            <p
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-snug',
                x.who === 'user' ? 'rounded-br-md bg-brand-500/15 text-brand-100' : 'rounded-bl-md bg-white/[0.04] text-ink-200',
                !x.done && 'ring-1 ring-white/10'
              )}
            >
              {x.text}
              {x.interrupted && <span className="ml-1 text-[11px] text-ink-500">· interrupted</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 border-t border-white/5 p-4">
        <button onClick={() => setMuted((m) => !m)} aria-pressed={muted} aria-label={muted ? 'Unmute' : 'Mute'} className={cn('focus-ring flex h-11 w-11 items-center justify-center rounded-full transition-colors', muted ? 'bg-rose-500/15 text-rose-300' : 'bg-white/5 text-ink-200 hover:bg-white/10')}>
          {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button onClick={interrupt} disabled={current?.who !== 'assistant'} className="focus-ring flex h-11 items-center gap-2 rounded-full bg-white/5 px-4 text-sm text-ink-200 transition-colors hover:bg-white/10 disabled:opacity-40">
          <Hand className="h-4 w-4" /> Interrupt
        </button>
        <button
          onClick={() => {
            if (live) setLive(false);
            else {
              setCut(null);
              reset();
              setLive(true);
            }
          }}
          aria-label={live ? 'End call' : 'Start call'}
          className={cn('focus-ring flex h-11 w-11 items-center justify-center rounded-full transition-colors', live ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-500 text-ink-950 hover:bg-emerald-400')}
        >
          {live ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function VoiceConversationDemo() {
  return <VoiceConversation />;
}
