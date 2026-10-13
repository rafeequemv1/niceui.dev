import { useEffect, useState } from 'react';
import { Bell, Mic, Music, Pause, Phone, PhoneOff, Play, SkipForward, Timer } from 'lucide-react';
import { cn } from '@/lib/cn';

export type IslandMode = 'idle' | 'call' | 'music' | 'timer' | 'notification';

const SIZES: Record<IslandMode, { w: number; h: number; r: number }> = {
  idle: { w: 120, h: 34, r: 17 },
  call: { w: 300, h: 56, r: 28 },
  music: { w: 340, h: 148, r: 40 },
  timer: { w: 220, h: 40, r: 20 },
  notification: { w: 340, h: 76, r: 32 },
};

function Waveform({ playing }: { playing: boolean }) {
  return (
    <span className="flex h-5 items-end gap-[3px]">
      {[0.5, 0.9, 0.6, 1, 0.7].map((s, i) => (
        <span
          key={i}
          className={cn('w-[3px] origin-bottom rounded-full bg-brand-400', playing && 'animate-bar-bounce')}
          style={{ height: `${s * 100}%`, animationDelay: `${i * 120}ms`, animationDuration: `${700 + i * 90}ms`, transform: playing ? undefined : 'scaleY(0.3)' }}
        />
      ))}
    </span>
  );
}

function useSeconds(active: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!active) return setS(0);
    const id = window.setInterval(() => setS((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function DynamicIsland({ mode, onModeChange }: { mode: IslandMode; onModeChange?: (m: IslandMode) => void }) {
  const size = SIZES[mode];
  const [playing, setPlaying] = useState(true);
  const callTime = useSeconds(mode === 'call');
  const [left, setLeft] = useState(300);
  useEffect(() => {
    if (mode !== 'timer') return;
    setLeft(300);
    const id = window.setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  return (
    <div
      className="relative mx-auto overflow-hidden bg-black text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_32px_-8px_rgba(0,0,0,0.8)]"
      style={{
        width: size.w,
        height: size.h,
        borderRadius: size.r,
        transition: 'width 600ms cubic-bezier(0.34,1.4,0.64,1), height 600ms cubic-bezier(0.34,1.4,0.64,1), border-radius 600ms cubic-bezier(0.34,1.4,0.64,1)',
      }}
    >
      <div key={mode} className="absolute inset-0 flex animate-[fade-in_400ms_ease-out_150ms_both] items-center px-3">
        {mode === 'idle' && <span className="mx-auto h-2 w-2 rounded-full bg-ink-800" />}
        {mode === 'call' && (
          <div className="flex w-full items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-sm font-semibold text-ink-950">MC</span>
            <div className="flex-1 leading-tight">
              <p className="text-[11px] text-ink-400">iPhone · {callTime}</p>
              <p className="text-sm font-medium">Mira Chen</p>
            </div>
            <button aria-label="Mute" className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 transition-transform active:scale-90"><Mic className="h-4 w-4" /></button>
            <button aria-label="End call" onClick={() => onModeChange?.('idle')} className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 transition-transform hover:scale-105 active:scale-90"><PhoneOff className="h-4 w-4" /></button>
          </div>
        )}
        {mode === 'timer' && (
          <div className="flex w-full items-center justify-between px-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400"><Timer className="h-3.5 w-3.5" /></span>
            <span className="font-mono text-lg font-medium tabular-nums text-amber-400">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
          </div>
        )}
        {mode === 'notification' && (
          <div className="flex w-full items-center gap-3 px-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500"><Bell className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-sm font-medium">Deploy succeeded</p>
              <p className="truncate text-xs text-ink-400">lumen-ui · production is live in 42s</p>
            </div>
            <span className="text-[11px] text-ink-500">now</span>
          </div>
        )}
        {mode === 'music' && (
          <div className="flex w-full flex-col gap-3 px-2">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-400 via-sky-500 to-teal-400" />
              <div className="flex-1 leading-tight">
                <p className="text-sm font-medium">Midnight City</p>
                <p className="text-xs text-ink-400">M83</p>
              </div>
              <Waveform playing={playing} />
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div className={cn('h-full w-1/3 rounded-full bg-white transition-all duration-[4000ms] ease-linear', playing && 'w-2/3')} />
            </div>
            <div className="flex items-center justify-center gap-6">
              <button aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((p) => !p)} className="transition-transform active:scale-90">
                {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button aria-label="Next" className="transition-transform active:scale-90"><SkipForward className="h-5 w-5 fill-current" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const MODES: Array<{ id: IslandMode; label: string; icon: typeof Phone }> = [
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'notification', label: 'Alert', icon: Bell },
];

export function DynamicIslandDemo() {
  const [mode, setMode] = useState<IslandMode>('idle');
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex h-40 items-start">
        <DynamicIsland mode={mode} onModeChange={setMode} />
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 rounded-2xl bg-ink-900 p-1.5 shadow-card">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(mode === id ? 'idle' : id)}
            className={cn(
              'focus-ring flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all active:scale-95',
              mode === id ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-400 hover:text-ink-100',
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
