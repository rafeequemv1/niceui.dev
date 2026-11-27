import { useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';

export type VerticalSliderProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Track height in px. */
  height?: number;
  label: string;
  /** Formats the bubble and aria-valuetext. */
  format?: (v: number) => string;
  /** Fill from the middle (for bipolar values like EQ gain). */
  centered?: boolean;
  /** Draw a tick for every n steps (0 = none). */
  ticks?: number;
  className?: string;
};

/**
 * A vertical slider for volume, EQ bands or levels. Drag, click the track, scroll
 * isn't hijacked; keyboard: arrows, PageUp/PageDown (×10) and Home/End.
 */
export function VerticalSlider({ value, onChange, min = 0, max = 100, step = 1, height = 180, label, format = (v) => String(v), centered, ticks = 0, className }: VerticalSliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const snap = (v: number) => Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min));
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const p = pct(value);
  const mid = centered ? pct((min + max) / 2) : 0;

  const fromPointer = (e: RPointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    const k = 1 - (e.clientY - r.top) / r.height;
    onChange(snap(min + k * (max - min)));
  };
  const onKey = (e: KeyboardEvent) => {
    const big = step * 10;
    const map: Record<string, number> = { ArrowUp: value + step, ArrowRight: value + step, ArrowDown: value - step, ArrowLeft: value - step, PageUp: value + big, PageDown: value - big, Home: min, End: max };
    if (!(e.key in map)) return;
    e.preventDefault();
    onChange(snap(map[e.key]));
  };

  const nTicks = ticks ? Math.floor((max - min) / step / ticks) : 0;
  return (
    <div className={cn('group relative flex w-9 touch-none select-none justify-center', className)} style={{ height }}>
      <div
        ref={track}
        role="slider"
        aria-orientation="vertical"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag(true);
          fromPointer(e);
        }}
        onPointerMove={(e) => drag && fromPointer(e)}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
        className="peer relative h-full w-full cursor-pointer rounded-full outline-none"
      >
        <span className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-white/[.08]" />
        {Array.from({ length: nTicks + 1 }, (_, i) => (
          <span key={i} className="absolute left-0 h-px w-1.5 bg-white/15" style={{ bottom: `${(i / nTicks) * 100}%` }} />
        ))}
        <span
          className={cn('absolute left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-t from-brand-500 to-brand-300', !drag && 'transition-all duration-200 motion-reduce:transition-none')}
          style={{ bottom: `${Math.min(p, mid)}%`, height: `${Math.abs(p - mid)}%` }}
        />
        <span
          className={cn(
            'absolute left-1/2 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-brand-300 bg-ink-950 shadow-[0_0_0_4px_rgba(56,189,248,.12)]',
            !drag && 'transition-[bottom] duration-200 motion-reduce:transition-none',
            'group-focus-within:shadow-[0_0_0_6px_rgba(56,189,248,.25)]',
            drag && 'scale-110',
          )}
          style={{ bottom: `${p}%` }}
        />
        <span
          className={cn(
            'pointer-events-none absolute left-[calc(50%+16px)] translate-y-1/2 whitespace-nowrap rounded-md bg-ink-50 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-ink-950 opacity-0 transition-opacity',
            (drag || undefined) && 'opacity-100',
            'group-hover:opacity-100 group-focus-within:opacity-100',
          )}
          style={{ bottom: `${p}%` }}
        >
          {format(value)}
        </span>
      </div>
    </div>
  );
}

const BANDS = ['60', '150', '400', '1k', '2.4k', '6k', '15k'];
const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0],
  'Bass boost': [8, 6, 3, 0, -1, -1, 0],
  Vocal: [-3, -1, 2, 5, 4, 1, -1],
  Bright: [-2, -1, 0, 1, 4, 6, 7],
};

export function VerticalSliderDemo() {
  const [vol, setVol] = useState(64);
  const [muted, setMuted] = useState(false);
  const [eq, setEq] = useState(PRESETS['Bass boost']);
  const preset = Object.entries(PRESETS).find(([, v]) => v.every((x, i) => x === eq[i]))?.[0];
  const VolIcon = muted || vol === 0 ? VolumeX : vol < 50 ? Volume1 : Volume2;
  const W = 280;
  const H = 70;
  const pts = eq.map((g, i) => [(i / (eq.length - 1)) * W, H / 2 - (g / 12) * (H / 2 - 4)] as const);
  const path = pts.map(([x, y], i) => (i ? `S ${(pts[i - 1][0] + x) / 2} ${y} ${x} ${y}` : `M ${x} ${y}`)).join(' ');
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8 sm:flex-row sm:items-stretch sm:justify-center">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[.07] bg-ink-900/50 px-6 py-5">
        <VerticalSlider label="Volume" value={muted ? 0 : vol} onChange={(v) => (setMuted(false), setVol(v))} format={(v) => `${v}%`} height={200} ticks={10} />
        <button onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted} className="focus-ring grid h-9 w-9 place-items-center rounded-full text-ink-300 hover:bg-white/[.05] hover:text-ink-50">
          <VolIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="w-full max-w-[400px] rounded-2xl border border-white/[.07] bg-ink-900/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-ink-100">Equalizer</p>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Presets">
            {Object.keys(PRESETS).map((k) => (
              <button key={k} onClick={() => setEq(PRESETS[k])} aria-pressed={preset === k} className={cn('rounded-full px-2.5 py-1 text-[11px] transition-colors', preset === k ? 'bg-brand-400 text-ink-950' : 'bg-white/[.05] text-ink-300 hover:text-ink-50')}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-14 w-full" preserveAspectRatio="none" aria-hidden>
          <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,.08)" strokeDasharray="3 4" />
          <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="rgba(56,189,248,.08)" />
          <path d={path} fill="none" stroke="#7dd3fc" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="mt-2 flex justify-between">
          {eq.map((g, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <VerticalSlider
                label={`${BANDS[i]} Hz band`}
                value={g}
                min={-12}
                max={12}
                centered
                height={150}
                format={(v) => `${v > 0 ? '+' : ''}${v} dB`}
                onChange={(v) => setEq((e) => e.map((x, k) => (k === i ? v : x)))}
                className="w-7"
              />
              <span className="font-mono text-[10px] text-ink-500">{BANDS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
