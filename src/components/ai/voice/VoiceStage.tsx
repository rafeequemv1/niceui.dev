import { useEffect, useState, type ReactNode } from 'react';
import { Brain, Circle, Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { VoiceState } from './engine';

const STATES: Array<{ id: VoiceState; label: string; icon: typeof Mic; caption: string }> = [
  { id: 'idle', label: 'Idle', icon: Circle, caption: 'Tap the orb to talk' },
  { id: 'listening', label: 'Listening', icon: Mic, caption: 'Listening…' },
  { id: 'thinking', label: 'Thinking', icon: Brain, caption: 'Thinking…' },
  { id: 'speaking', label: 'Speaking', icon: Volume2, caption: '“Sure — I moved your 3pm to Thursday.”' },
];

/**
 * Demo shell for the voice orbs: a state switcher, a live-mic toggle and a caption.
 * It cycles through the states on its own until you pick one.
 */
export function VoiceStage({
  children,
  className,
}: {
  children: (p: { state: VoiceState; mic: boolean; setMicError: (e: string | null) => void; toggle: () => void }) => ReactNode;
  className?: string;
}) {
  const [state, setState] = useState<VoiceState>('speaking');
  const [auto, setAuto] = useState(true);
  const [mic, setMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    if (!auto) return;
    const order: VoiceState[] = ['speaking', 'listening', 'thinking', 'speaking', 'idle'];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setState(order[i]);
    }, 3600);
    return () => window.clearInterval(id);
  }, [auto]);

  const pick = (s: VoiceState) => {
    setAuto(false);
    setMic(false);
    setState(s);
  };
  const toggle = () => pick(state === 'idle' ? 'listening' : 'idle');
  const index = STATES.findIndex((s) => s.id === state);
  const caption = mic && !micError ? 'Live microphone — say something' : STATES[index].caption;

  return (
    <div className={cn('flex flex-col items-center gap-7', className)}>
      {children({ state: mic ? 'listening' : state, mic, setMicError, toggle })}
      <p key={caption} className={cn('h-5 animate-fade-up text-center text-sm', state === 'thinking' && !mic ? 'shimmer-text font-medium' : 'text-ink-300')}>
        {micError ?? caption}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div role="radiogroup" aria-label="Voice state" className="relative grid grid-cols-4 rounded-xl bg-ink-900 p-1 shadow-card">
          <span
            aria-hidden
            className={cn('absolute inset-y-1 left-1 w-[calc((100%-8px)/4)] rounded-lg bg-ink-800 shadow-hairline transition-all duration-500 ease-spring', mic && 'opacity-0')}
            style={{ transform: `translateX(${index * 100}%)` }}
          />
          {STATES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="radio"
              aria-checked={!mic && state === id}
              onClick={() => pick(id)}
              className={cn(
                'focus-ring relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-3.5',
                !mic && state === id ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setAuto(false);
            setMicError(null);
            setMic((m) => !m);
          }}
          aria-pressed={mic}
          className={cn(
            'focus-ring flex h-[42px] items-center gap-1.5 rounded-xl px-3.5 text-xs font-medium shadow-card transition-colors',
            mic ? 'bg-brand-500 text-ink-950 hover:bg-brand-400' : 'bg-ink-900 text-ink-300 hover:text-ink-50',
          )}
        >
          {mic ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {mic ? 'Stop mic' : 'Use my mic'}
        </button>
      </div>
    </div>
  );
}
