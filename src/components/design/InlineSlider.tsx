import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LightFrame, Panel, SectionHead, focusRing } from './shared';

export type InlineSliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  decimals?: number;
  className?: string;
};

/** A slider whose label lives inside the track: drag anywhere to scrub, double-click the value to type. */
export function InlineSlider({ label, value, onChange, min = 0, max = 1, step = 0.01, unit, defaultValue, decimals = 1, className }: InlineSliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [drag, setDrag] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const pct = ((value - min) / (max - min)) * 100;
  const setFromX = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    onChange(clamp(min + ((x - r.left) / r.width) * (max - min)));
  };
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) onChange(clamp(n));
    setEditing(false);
  };
  const changed = defaultValue !== undefined && Math.abs(value - defaultValue) > step / 2;

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value.toFixed(decimals)}${unit ?? ''}`}
      onPointerDown={(e) => {
        if (editing || (e.target as HTMLElement).closest('[data-noscrub]')) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDrag(true);
        setFromX(e.clientX);
      }}
      onPointerMove={(e) => drag && setFromX(e.clientX)}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
      onKeyDown={(e) => {
        if (editing) return;
        const big = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') (e.preventDefault(), onChange(clamp(value + step * big)));
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') (e.preventDefault(), onChange(clamp(value - step * big)));
        if (e.key === 'Home') onChange(min);
        if (e.key === 'End') onChange(max);
        if (e.key === 'Enter') (setDraft(value.toFixed(decimals)), setEditing(true));
      }}
      className={cn(
        'group relative flex h-9 cursor-ew-resize touch-none select-none items-center overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-inset ring-zinc-200/70 transition-shadow',
        focusRing,
        drag && 'ring-zinc-300',
        className,
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 border-r border-zinc-300 bg-zinc-200/80 transition-[width]', drag ? 'duration-0' : 'duration-200')} style={{ width: `${pct}%` }} />
      <span className="relative z-10 pl-3 text-[13px] text-zinc-600">{label}</span>
      {defaultValue !== undefined && (
        <button
          data-noscrub
          onClick={() => onChange(defaultValue)}
          aria-label={`Reset ${label}`}
          className={cn('relative z-10 ml-2 grid h-5 w-5 place-items-center rounded-md text-zinc-400 transition-all hover:bg-white hover:text-zinc-800', changed ? 'opacity-100' : 'pointer-events-none opacity-0')}
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
      <span className="relative z-10 ml-auto pr-3" data-noscrub onDoubleClick={() => (setDraft(value.toFixed(decimals)), setEditing(true))}>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            aria-label={`${label} value`}
            className="w-14 rounded-md bg-white px-1.5 py-0.5 text-right font-mono text-[12.5px] text-zinc-900 outline-none ring-1 ring-zinc-300"
          />
        ) : (
          <span className="cursor-text font-mono text-[12.5px] tabular-nums text-zinc-900" title="Double-click to type">
            {value.toFixed(decimals)}
            {unit && <span className="ml-0.5 text-zinc-400">{unit}</span>}
          </span>
        )}
      </span>
    </div>
  );
}

export function InlineSliderDemo() {
  const [cutoff, setCutoff] = useState(0.5);
  const [smooth, setSmooth] = useState(0.6);
  const [corner, setCorner] = useState(7.2);
  const [opacity, setOpacity] = useState(86);
  return (
    <LightFrame className="mx-auto max-w-[420px]">
      <Panel className="space-y-2.5">
        <SectionHead title="Trace" meta="Drag, arrows or double-click" />
        <InlineSlider label="Threshold" value={cutoff} onChange={setCutoff} defaultValue={0.5} decimals={2} />
        <InlineSlider label="Smoothing" value={smooth} onChange={setSmooth} max={4} step={0.1} unit="px" defaultValue={1} />
        <InlineSlider label="Corner radius" value={corner} onChange={setCorner} max={24} step={0.1} unit="px" defaultValue={4} />
        <InlineSlider label="Opacity" value={opacity} onChange={setOpacity} max={100} step={1} unit="%" decimals={0} defaultValue={100} />
      </Panel>
    </LightFrame>
  );
}
