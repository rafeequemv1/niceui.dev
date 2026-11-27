import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Minutes since midnight. */
export type TimeValue = number;

const pad = (n: number) => String(n).padStart(2, '0');
export function formatTime(v: TimeValue, hour12: boolean) {
  const h = Math.floor(v / 60);
  const m = v % 60;
  if (!hour12) return `${pad(h)}:${pad(m)}`;
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}

type Col = { key: string; label: string; options: { v: number; t: string }[]; value: number; set: (v: number) => void };

function columns(value: TimeValue, onChange: (v: TimeValue) => void, hour12: boolean, step: number): Col[] {
  const h = Math.floor(value / 60);
  const m = value % 60;
  const pm = h >= 12;
  const cols: Col[] = [
    hour12
      ? { key: 'h', label: 'Hour', options: Array.from({ length: 12 }, (_, i) => ({ v: i === 0 ? 12 : i, t: String(i === 0 ? 12 : i) })).sort((a, b) => a.v - b.v), value: h % 12 === 0 ? 12 : h % 12, set: (v) => onChange(((v % 12) + (pm ? 12 : 0)) * 60 + m) }
      : { key: 'h', label: 'Hour', options: Array.from({ length: 24 }, (_, i) => ({ v: i, t: pad(i) })), value: h, set: (v) => onChange(v * 60 + m) },
    { key: 'm', label: 'Minute', options: Array.from({ length: 60 / step }, (_, i) => ({ v: i * step, t: pad(i * step) })), value: Math.round(m / step) * step, set: (v) => onChange(h * 60 + v) },
  ];
  if (hour12) cols.push({ key: 'p', label: 'AM or PM', options: [{ v: 0, t: 'AM' }, { v: 1, t: 'PM' }], value: pm ? 1 : 0, set: (v) => onChange(((h % 12) + (v ? 12 : 0)) * 60 + m) });
  return cols;
}

export type TimePickerProps = {
  value: TimeValue;
  onChange: (v: TimeValue) => void;
  hour12?: boolean;
  /** Minute step. */
  step?: 1 | 5 | 10 | 15 | 30;
  label?: string;
  className?: string;
};

/**
 * A time picker: a field that opens scrollable hour and minute columns (and AM/PM).
 * Left/Right move between columns, Up/Down change the value, Enter or Esc closes.
 */
export function TimePicker({ value, onChange, hour12 = true, step = 5, label = 'Time', className }: TimePickerProps) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const colRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cols = columns(value, onChange, hour12, step);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', down);
    return () => window.removeEventListener('pointerdown', down);
  }, [open]);

  // keep the selected option of each column in view
  useEffect(() => {
    if (!open) return;
    colRefs.current.forEach((c) => {
      const sel = c?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (c && sel) c.scrollTo({ top: sel.offsetTop - c.clientHeight / 2 + sel.offsetHeight / 2, behavior: 'smooth' });
    });
  }, [open, value]);

  useEffect(() => {
    if (open) colRefs.current[col]?.focus();
  }, [open, col]);

  const onKey = (e: KeyboardEvent, ci: number) => {
    const c = cols[ci];
    const at = c.options.findIndex((o) => o.v === c.value);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = c.options[(at + (e.key === 'ArrowDown' ? 1 : -1) + c.options.length) % c.options.length];
      c.set(n.v);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setCol((ci + (e.key === 'ArrowRight' ? 1 : -1) + cols.length) % cols.length);
    } else if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      btn.current?.focus();
    }
  };

  return (
    <div ref={root} className={cn('relative inline-block', className)}>
      <style>{`@keyframes tp-in{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}.tp-pop{animation:tp-in .16s cubic-bezier(.2,.8,.2,1) both}@media (prefers-reduced-motion:reduce){.tp-pop{animation:none}}`}</style>
      <button
        ref={btn}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${formatTime(value, hour12)}`}
        onClick={() => {
          setCol(0);
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setCol(0);
            setOpen(true);
          }
        }}
        className={cn('focus-ring flex h-11 min-w-[150px] items-center gap-3 rounded-xl border border-white/10 bg-ink-900 px-3.5 text-[14px] text-ink-50 shadow-hairline transition-colors hover:bg-ink-800', open && 'border-brand-400/50')}
      >
        <Clock className="h-4 w-4 text-ink-400" />
        <span className="font-medium tabular-nums">{formatTime(value, hour12)}</span>
      </button>
      {open && (
        <div role="dialog" aria-label={`Choose ${label.toLowerCase()}`} className="tp-pop absolute left-0 top-[calc(100%+6px)] z-50 flex gap-1 rounded-xl border border-white/10 bg-ink-900/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl">
          {cols.map((c, ci) => (
            <div
              key={c.key}
              ref={(el) => (colRefs.current[ci] = el)}
              role="listbox"
              aria-label={c.label}
              aria-activedescendant={`${uid}-${c.key}-${c.value}`}
              tabIndex={col === ci ? 0 : -1}
              onKeyDown={(e) => onKey(e, ci)}
              onFocus={() => setCol(ci)}
              className={cn('h-56 w-14 overflow-y-auto rounded-lg py-1 outline-none [scrollbar-width:none] focus-visible:ring-1 focus-visible:ring-brand-400/50', c.key === 'p' && 'h-auto self-start')}
            >
              {c.options.map((o) => (
                <button
                  key={o.v}
                  id={`${uid}-${c.key}-${o.v}`}
                  role="option"
                  aria-selected={o.v === c.value}
                  tabIndex={-1}
                  onClick={() => {
                    c.set(o.v);
                    setCol(ci);
                  }}
                  className={cn('my-0.5 block w-full rounded-md py-1.5 text-center text-[13.5px] tabular-nums transition-colors', o.v === c.value ? 'bg-brand-400 font-medium text-ink-950' : 'text-ink-300 hover:bg-white/[.06] hover:text-ink-50')}
                >
                  {o.t}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ——— inline wheel ——— */

const ROW = 36;

function Wheel({ options, value, onPick, label }: { options: { v: number; t: string }[]; value: number; onPick: (v: number) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useRef(0);
  const idx = Math.max(0, options.findIndex((o) => o.v === value));
  const [scrollIdx, setScrollIdx] = useState(idx);

  useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ROW) !== idx) el.scrollTo({ top: idx * ROW, behavior: 'smooth' });
    setScrollIdx(idx);
  }, [idx]);

  return (
    <div className="relative">
      <div
        ref={ref}
        role="spinbutton"
        aria-label={label}
        aria-valuenow={value}
        aria-valuetext={options[idx]?.t}
        tabIndex={0}
        onScroll={(e) => {
          const top = e.currentTarget.scrollTop;
          setScrollIdx(Math.round(top / ROW));
          window.clearTimeout(t.current);
          t.current = window.setTimeout(() => {
            const i = Math.min(options.length - 1, Math.max(0, Math.round(top / ROW)));
            if (options[i].v !== value) onPick(options[i].v);
          }, 120);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
          e.preventDefault();
          const n = Math.min(options.length - 1, Math.max(0, idx + (e.key === 'ArrowDown' ? 1 : -1)));
          onPick(options[n].v);
        }}
        className="h-[180px] w-16 snap-y snap-mandatory overflow-y-auto rounded-lg outline-none [scrollbar-width:none] focus-visible:ring-1 focus-visible:ring-brand-400/50 [&::-webkit-scrollbar]:hidden"
        style={{ paddingBlock: ROW * 2, maskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)', WebkitMaskImage: 'linear-gradient(transparent, #000 30%, #000 70%, transparent)' }}
      >
        {options.map((o, i) => {
          const d = Math.min(2, Math.abs(i - scrollIdx));
          return (
            <button
              key={o.v}
              tabIndex={-1}
              onClick={() => onPick(o.v)}
              className="block w-full snap-center text-center tabular-nums transition-[color,transform] duration-150"
              style={{ height: ROW, fontSize: d === 0 ? 20 : 16, color: d === 0 ? '#f3f4f6' : `rgba(160,166,175,${1 - d * 0.3})`, transform: `perspective(200px) rotateX(${(i - scrollIdx) * 18}deg)` }}
            >
              {o.t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** An inline wheel time picker: scroll, drag, click or use arrow keys on each wheel. */
export function WheelTimePicker({ value, onChange, hour12 = true, step = 1, className }: Omit<TimePickerProps, 'label'>) {
  const cols = columns(value, onChange, hour12, step);
  return (
    <div className={cn('relative flex items-center gap-1 rounded-2xl border border-white/[.08] bg-ink-900/70 px-3', className)}>
      <span aria-hidden className="pointer-events-none absolute inset-x-2 top-1/2 h-9 -translate-y-1/2 rounded-lg border border-brand-400/25 bg-brand-400/[.07]" />
      {cols.map((c, i) => (
        <div key={c.key} className="flex items-center">
          <Wheel options={c.options} value={c.value} onPick={c.set} label={c.label} />
          {i === 0 && <span className="text-xl text-ink-500">:</span>}
        </div>
      ))}
    </div>
  );
}

export function TimePickerDemo() {
  const [a, setA] = useState(9 * 60 + 30);
  const [b, setB] = useState(18 * 60 + 15);
  const [c, setC] = useState(7 * 60 + 45);
  const [h12, setH12] = useState(true);
  return (
    <div className="flex min-h-[340px] w-full max-w-xl flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-ink-900 p-1 shadow-hairline" role="group" aria-label="Clock format">
          {[true, false].map((v) => (
            <button key={String(v)} onClick={() => setH12(v)} aria-pressed={h12 === v} className={cn('flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors', h12 === v ? 'bg-ink-700 text-ink-50' : 'text-ink-400 hover:text-ink-200')}>
              {v ? '12-hour' : '24-hour'}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5 text-[12px] text-ink-400">
          Meeting starts
          <TimePicker value={a} onChange={setA} hour12={h12} label="Meeting starts" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-ink-400">
          Reminder
          <TimePicker value={b} onChange={setB} hour12={h12} step={15} label="Reminder" />
        </label>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-[12px] text-ink-400">Alarm</p>
        <WheelTimePicker value={c} onChange={setC} hour12={h12} />
        <p className="text-[13px] tabular-nums text-ink-200" aria-live="polite">
          Rings at {formatTime(c, h12)}
        </p>
      </div>
    </div>
  );
}
