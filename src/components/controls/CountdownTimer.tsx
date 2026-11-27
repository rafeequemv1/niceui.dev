import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { cn } from '@/lib/cn';

const pad = (n: number) => String(n).padStart(2, '0');

/** One digit that rolls to its next value. */
function Digit({ d }: { d: string }) {
  return (
    <span className="relative inline-block h-[1.15em] w-[0.62em] overflow-hidden align-top" aria-hidden>
      <span className="cd-roll absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none" style={{ transform: `translateY(-${Number(d) * 10}%)` }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1.15em] text-center leading-[1.15em]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  const s = pad(value);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex whitespace-nowrap rounded-xl border border-white/[.08] bg-gradient-to-b from-ink-800 to-ink-900 px-2.5 py-1.5 text-[34px] font-semibold leading-none tracking-tight text-ink-50 tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,.06)] sm:px-3.5 sm:text-[52px]">
        {[...s].map((d, i) => (
          <Digit key={i} d={d} />
        ))}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">{label}</span>
    </div>
  );
}

export type CountdownTimerProps = {
  /** The moment to count down to. */
  to: Date | number;
  onDone?: () => void;
  className?: string;
};

/** A countdown timer to a date with rolling digits for days, hours, minutes and seconds. */
export function CountdownTimer({ to, onDone, className }: CountdownTimerProps) {
  const target = typeof to === 'number' ? to : to.getTime();
  const [now, setNow] = useState(() => Date.now());
  const done = useRef(false);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const left = Math.max(0, target - now);
  useEffect(() => {
    if (left === 0 && !done.current) {
      done.current = true;
      onDone?.();
    }
  }, [left, onDone]);
  const s = Math.floor(left / 1000);
  const parts = [
    { v: Math.min(99, Math.floor(s / 86400)), l: 'Days' },
    { v: Math.floor(s / 3600) % 24, l: 'Hours' },
    { v: Math.floor(s / 60) % 60, l: 'Minutes' },
    { v: s % 60, l: 'Seconds' },
  ];
  return (
    <div className={cn('flex items-start gap-2 sm:gap-3', className)} role="timer" aria-label={`${parts[0].v} days, ${parts[1].v} hours, ${parts[2].v} minutes left`}>
      {parts.map((p, i) => (
        <div key={p.l} className="flex items-start gap-2 sm:gap-3">
          <Unit value={p.v} label={p.l} />
          {i < parts.length - 1 && <span className="mt-2 text-[28px] font-light text-ink-600 sm:mt-3 sm:text-[40px]">:</span>}
        </div>
      ))}
    </div>
  );
}

export type FocusTimerProps = {
  /** Focus and break lengths in seconds. */
  focus?: number;
  rest?: number;
  className?: string;
};

/** A pomodoro-style ring timer that alternates focus and break sessions. */
export function FocusTimer({ focus = 25 * 60, rest = 5 * 60, className }: FocusTimerProps) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [left, setLeft] = useState(focus);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const total = mode === 'focus' ? focus : rest;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left > 0) return;
    const next = mode === 'focus' ? 'break' : 'focus';
    if (mode === 'focus') setRounds((r) => r + 1);
    setMode(next);
    setLeft(next === 'focus' ? focus : rest);
  }, [left, mode, focus, rest]);

  const R = 84;
  const C = 2 * Math.PI * R;
  const k = 1 - left / total;
  return (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      <div className="relative h-52 w-52">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
          <circle cx="100" cy="100" r={R} fill="none" stroke={mode === 'focus' ? '#7dd3fc' : '#86efac'} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - k)} className="transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" role="timer" aria-live="off" aria-label={`${mode} ${Math.floor(left / 60)} minutes ${left % 60} seconds left`}>
          <span className={cn('font-mono text-[10px] uppercase tracking-[0.18em]', mode === 'focus' ? 'text-brand-300' : 'text-emerald-300')}>{mode === 'focus' ? 'Focus' : 'Break'}</span>
          <span className="mt-1 text-[44px] font-semibold tabular-nums tracking-tight text-ink-50">
            {pad(Math.floor(left / 60))}:{pad(left % 60)}
          </span>
          <span className="mt-1 flex gap-1" aria-label={`${rounds % 4} of 4 rounds`}>
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i < rounds % 4 ? 'bg-brand-300' : 'bg-white/15')} />
            ))}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => (setRunning(false), setLeft(total))} aria-label="Reset" className="focus-ring grid h-10 w-10 place-items-center rounded-full text-ink-400 hover:bg-white/[.05] hover:text-ink-50">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause' : 'Start'} className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-brand-400 text-ink-950 shadow-[0_8px_24px_-8px_rgba(56,189,248,.7)] transition-transform active:scale-95">
          {running ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
        <button onClick={() => setLeft(0)} aria-label="Skip to next session" className="focus-ring grid h-10 w-10 place-items-center rounded-full text-ink-400 hover:bg-white/[.05] hover:text-ink-50">
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function CountdownTimerDemo() {
  const [target] = useState(() => Date.now() + ((3 * 24 + 7) * 3600 + 42 * 60 + 18) * 1000);
  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-10 lg:flex-row lg:justify-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-[13px] text-ink-400">Launch in</p>
        <CountdownTimer to={target} />
      </div>
      <FocusTimer focus={25 * 60} rest={5 * 60} />
    </div>
  );
}
