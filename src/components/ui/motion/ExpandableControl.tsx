import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape } from './hooks';

export type ExpandableControlProps = {
  collapsed: ReactNode;
  expanded: ReactNode;
  collapsedSize?: { width: number; height: number };
  expandedSize?: { width: number; height: number };
  className?: string;
};

/** A compact pill that springs open into a full control surface. */
export function ExpandableControl({
  collapsed,
  expanded,
  collapsedSize = { width: 240, height: 52 },
  expandedSize = { width: 360, height: 212 },
  className,
}: ExpandableControlProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEscape(open, close);
  useClickOutside([ref], open, close);
  const size = open ? expandedSize : collapsedSize;

  return (
    <div
      ref={ref}
      onClick={() => !open && setOpen(true)}
      style={{ width: size.width, height: size.height, borderRadius: open ? 28 : size.height / 2 }}
      className={cn(
        'relative max-w-full overflow-hidden bg-ink-900 shadow-pop transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.3,0.64,1)]',
        !open && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className,
      )}
    >
      <div className={cn('absolute inset-0 transition-all', open ? 'pointer-events-none scale-95 opacity-0 blur-sm duration-150' : 'scale-100 opacity-100 blur-0 delay-150 duration-300')}>
        {collapsed}
      </div>
      <div
        className={cn('absolute left-0 top-0 transition-all', open ? 'scale-100 opacity-100 blur-0 delay-150 duration-500' : 'pointer-events-none scale-[0.97] opacity-0 blur-sm duration-150')}
        style={{ width: expandedSize.width, height: expandedSize.height }}
      >
        {expanded}
      </div>
    </div>
  );
}

function Eq({ on }: { on: boolean }) {
  return (
    <span className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn('w-[3px] origin-bottom rounded-full bg-brand-400', on ? 'animate-bar-bounce' : 'scale-y-[0.3]')}
          style={{ height: '100%', animationDelay: `${i * 150}ms`, animationDuration: `${0.8 + i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const TRACK = { title: 'Midnight Transit', artist: 'Kaito & The Lanterns', length: 214 };
const ART = 'radial-gradient(circle at 30% 30%, #59b6ff, transparent 60%), radial-gradient(circle at 70% 80%, #f59e0b, transparent 55%), #142b57';

export function ExpandableControlDemo() {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(63);
  const [vol, setVol] = useState(70);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setT((v) => (v + 1) % TRACK.length), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  const iconBtn = 'focus-ring flex h-10 w-10 items-center justify-center rounded-full text-ink-200 transition hover:bg-white/5 hover:text-ink-50 active:scale-90';

  return (
    <div className="flex h-[240px] flex-col items-center justify-center gap-3">
      <ExpandableControl
        collapsed={
          <div className="flex h-full items-center gap-3 pl-2 pr-4">
            <span className="h-9 w-9 shrink-0 rounded-full" style={{ background: ART, animation: playing ? 'spin 8s linear infinite' : undefined }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink-50">{TRACK.title}</span>
              <span className="block truncate text-xs text-ink-400">{TRACK.artist}</span>
            </span>
            <Eq on={playing} />
          </div>
        }
        expanded={
          <div className="flex h-full flex-col p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <span className="h-16 w-16 shrink-0 rounded-2xl shadow-card" style={{ background: ART }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-50">{TRACK.title}</p>
                <p className="truncate text-sm text-ink-400">{TRACK.artist}</p>
              </div>
              <Eq on={playing} />
            </div>
            <div className="mt-4">
              <input type="range" min={0} max={TRACK.length} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label="Seek" className="h-1 w-full cursor-pointer accent-brand-500" />
              <div className="mt-1 flex justify-between font-mono text-[11px] text-ink-500">
                <span>{fmt(t)}</span>
                <span>-{fmt(TRACK.length - t)}</span>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button aria-label="Previous" className={iconBtn} onClick={() => setT(0)}><SkipBack className="h-4 w-4" /></button>
                <button aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((p) => !p)} className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-950 transition hover:bg-white active:scale-90">
                  {playing ? <Pause key="pa" className="h-4 w-4 animate-scale-in" /> : <Play key="pl" className="h-4 w-4 animate-scale-in" />}
                </button>
                <button aria-label="Next" className={iconBtn} onClick={() => setT(0)}><SkipForward className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-2">
                <button aria-label="Mute" onClick={() => setVol((v) => (v ? 0 : 70))} className="text-ink-400 transition hover:text-ink-100">
                  {vol ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <input type="range" min={0} max={100} value={vol} onChange={(e) => setVol(Number(e.target.value))} aria-label="Volume" className="h-1 w-20 cursor-pointer accent-brand-500" />
              </div>
            </div>
          </div>
        }
      />
      <p className="text-xs text-ink-500">Click the pill · Esc or click outside to collapse</p>
    </div>
  );
}
