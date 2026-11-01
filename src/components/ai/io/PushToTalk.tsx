import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronLeft, Mic, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { mmss, prefersReducedMotion, rnd, useTicker } from './shared';

const PHRASE = 'Summarize the three customer calls from yesterday and draft a follow-up for Halcyon.';

export type PushToTalkProps = { onTranscript?: (text: string) => void; autoPlay?: boolean; className?: string };

/** Hold the mic (or Space) to talk; slide left to cancel. Transcription streams into the composer. */
export function PushToTalk({ onTranscript, autoPlay = false, className }: PushToTalkProps) {
  const [recording, setRecording] = useState(false);
  const [drag, setDrag] = useState(0);
  const [text, setText] = useState('');
  const [t, reset] = useTicker(recording, 24);
  const startX = useRef(0);
  const cancel = drag < -80;

  const words = PHRASE.split(' ');
  const live = recording ? words.slice(0, Math.min(words.length, Math.floor(t * 3.2))).join(' ') : '';

  const begin = () => {
    reset();
    setDrag(0);
    setRecording(true);
  };
  const end = (cancelled: boolean) => {
    if (!recording) return;
    setRecording(false);
    setDrag(0);
    if (!cancelled) {
      const final = words.slice(0, Math.max(4, Math.floor(t * 3.2))).join(' ');
      setText(final);
      onTranscript?.(final);
    }
  };

  // Demo: record a short take on mount so the component reads at a glance.
  const endRef = useRef(end);
  endRef.current = end;
  useEffect(() => {
    if (!autoPlay || prefersReducedMotion()) {
      if (autoPlay) setText(PHRASE);
      return;
    }
    const a = window.setTimeout(begin, 400);
    const b = window.setTimeout(() => endRef.current(false), 4200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!(e.target as HTMLElement)?.closest?.('[data-ptt]')) return;
      e.preventDefault();
      begin();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') end(false);
      if (e.code === 'Escape') end(true);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  });

  return (
    <div data-ptt className={cn('w-full max-w-xl rounded-2xl bg-ink-900 p-3 shadow-card', className)}>
      <div className="min-h-[72px] rounded-xl bg-ink-950/60 px-3.5 py-3 text-[15px] leading-relaxed">
        {recording ? (
          <p className="text-ink-200">
            {live}
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-blink bg-brand-400" />
          </p>
        ) : text ? (
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} aria-label="Message" className="w-full resize-none bg-transparent text-ink-100 outline-none" />
        ) : (
          <p className="text-ink-500">Hold the mic or press and hold Space to talk…</p>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {recording ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-rose-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
              {mmss(t)}
            </span>
            <div className="flex h-8 min-w-0 flex-1 items-center gap-[3px] overflow-hidden" aria-hidden>
              {Array.from({ length: 40 }, (_, i) => {
                const v = prefersReducedMotion() ? 0.4 : 0.15 + Math.abs(Math.sin(t * 7 + i * 0.6)) * 0.6 * (0.5 + rnd(i + Math.floor(t * 8)) * 0.5);
                return <span key={i} className={cn('w-[3px] shrink-0 rounded-full', cancel ? 'bg-ink-600' : 'bg-brand-400')} style={{ height: `${v * 100}%` }} />;
              })}
            </div>
            <span className={cn('flex shrink-0 items-center gap-1 text-xs transition-colors', cancel ? 'text-rose-300' : 'text-ink-500')}>
              {cancel ? <Trash2 className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{cancel ? 'Release to cancel' : 'Slide to cancel'}</span>
            </span>
          </div>
        ) : (
          <div className="flex-1 text-xs text-ink-500">{text ? 'Edit the transcript, then send.' : 'Space to talk · Esc cancels'}</div>
        )}
        {text && !recording && (
          <button onClick={() => setText('')} className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-ink-950 transition-transform active:scale-95" aria-label="Send">
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
        <button
          aria-label="Hold to talk"
          aria-pressed={recording}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            startX.current = e.clientX;
            begin();
          }}
          onPointerMove={(e) => recording && setDrag(Math.min(0, e.clientX - startX.current))}
          onPointerUp={() => end(cancel)}
          onPointerCancel={() => end(true)}
          className={cn(
            'focus-ring relative flex h-12 w-12 shrink-0 touch-none select-none items-center justify-center rounded-full transition-all duration-200',
            recording ? (cancel ? 'scale-90 bg-rose-500/20 text-rose-300' : 'scale-110 bg-brand-500 text-ink-950 shadow-glow') : 'bg-white/5 text-ink-200 hover:bg-white/10'
          )}
          style={{ transform: recording ? `translateX(${Math.max(-120, drag)}px) scale(${cancel ? 0.9 : 1.1})` : undefined }}
        >
          {recording && !cancel && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400" />}
          <Mic className="relative h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export function PushToTalkDemo() {
  return <PushToTalk autoPlay />;
}
