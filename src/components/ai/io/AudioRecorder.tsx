import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUp, Mic, Pause, Play, RotateCcw, Square, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { mmss, prefersReducedMotion, rnd } from './shared';

type Phase = 'idle' | 'recording' | 'ready' | 'sent';
const BARS = 48;

export type AudioRecorderProps = { maxSeconds?: number; onSend?: (seconds: number) => void; className?: string };

/** Record a voice note (simulated levels), scrub it on a waveform, then send. */
export function AudioRecorder({ maxSeconds = 60, onSend, className }: AudioRecorderProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: BARS }, (_, i) => 0.2 + rnd(i * 3.1) * 0.75 * Math.abs(Math.sin(i / 5))));
  const [length, setLength] = useState(14.6);
  const [elapsed, setElapsed] = useState(0);
  const [pos, setPos] = useState(0.36);
  const [playing, setPlaying] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  // Recording: grow the waveform from simulated levels.
  useEffect(() => {
    if (phase !== 'recording') return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const s = (performance.now() - start) / 1000;
      setElapsed(s);
      setLevels((l) => [...l.slice(-(BARS - 1)), 0.15 + Math.abs(Math.sin(s * 5)) * 0.7 * (0.4 + rnd(Math.floor(s * 10)) * 0.6)]);
      if (s >= maxSeconds) {
        setLength(s);
        setPhase('ready');
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, maxSeconds]);

  // Playback.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPos((p) => {
        const n = p + 0.05 / length;
        if (n >= 1) {
          setPlaying(false);
          return 0;
        }
        return n;
      });
    }, 50);
    return () => clearInterval(id);
  }, [playing, length]);

  const seek = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    if (r) setPos(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
  };

  const shown = useMemo(() => levels.map((v) => (prefersReducedMotion() && phase === 'recording' ? 0.4 : v)), [levels, phase]);

  return (
    <div className={cn('w-full max-w-md rounded-2xl bg-ink-900 p-4 shadow-card', className)}>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-ink-200">Voice note</span>
        <span className="font-mono tabular-nums text-ink-500">
          {phase === 'recording' ? mmss(elapsed) : phase === 'sent' ? 'Sent' : `${mmss(pos * length)} / ${mmss(length)}`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {phase === 'recording' ? (
          <button onClick={() => (setLength(Math.max(1, elapsed)), setPhase('ready'), setPos(0))} aria-label="Stop recording" className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button onClick={() => setPlaying((p) => !p)} disabled={phase !== 'ready'} aria-label={playing ? 'Pause' : 'Play'} className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-ink-950 transition-transform active:scale-95 disabled:opacity-40">
            {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
          </button>
        )}

        <div
          ref={track}
          role="slider"
          tabIndex={phase === 'ready' ? 0 : -1}
          aria-label="Playback position"
          aria-valuemin={0}
          aria-valuemax={Math.round(length)}
          aria-valuenow={Math.round(pos * length)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setPos((p) => Math.min(1, p + 1 / length));
            if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 1 / length));
            if (e.key === ' ') (e.preventDefault(), setPlaying((p) => !p));
          }}
          onPointerDown={(e) => {
            if (phase !== 'ready') return;
            drag.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            seek(e.clientX);
          }}
          onPointerMove={(e) => drag.current && seek(e.clientX)}
          onPointerUp={() => (drag.current = false)}
          className="focus-ring relative flex h-12 min-w-0 flex-1 cursor-pointer touch-none items-center justify-between rounded-lg"
        >
          {shown.map((v, i) => {
            const played = phase === 'ready' && i / BARS < pos;
            return <span key={i} className={cn('w-[3px] shrink-0 rounded-full transition-colors', phase === 'recording' ? 'bg-rose-300/80' : played ? 'bg-brand-400' : 'bg-white/20')} style={{ height: `${Math.max(8, v * 100)}%` }} />;
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {phase === 'sent' ? (
          <button onClick={() => (setPhase('ready'), setPos(0))} className="focus-ring flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs text-ink-300 hover:bg-white/5">
            <RotateCcw className="h-3.5 w-3.5" /> Record another
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                setPlaying(false);
                setLevels([]);
                setElapsed(0);
                setPhase('recording');
              }}
              disabled={phase === 'recording'}
              className="focus-ring flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs text-ink-300 hover:bg-white/5 disabled:opacity-40"
            >
              <Mic className="h-3.5 w-3.5" /> {phase === 'recording' ? 'Recording…' : 'Re-record'}
            </button>
            <button onClick={() => (setPlaying(false), setPos(0), setPhase('idle'))} disabled={phase !== 'ready'} aria-label="Discard" className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-rose-300 disabled:opacity-40">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setPlaying(false);
                setPhase('sent');
                onSend?.(length);
              }}
              disabled={phase !== 'ready'}
              className="focus-ring ml-auto flex h-9 items-center gap-1.5 rounded-full bg-brand-500 px-4 text-xs font-medium text-ink-950 transition-transform active:scale-95 disabled:bg-white/10 disabled:text-ink-500"
            >
              Send <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
      {phase === 'idle' && <p className="mt-2 text-xs text-ink-500">Discarded. Press Re-record to start over.</p>}
    </div>
  );
}

export function AudioRecorderDemo() {
  return <AudioRecorder />;
}
