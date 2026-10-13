import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { animateOnce } from './utils';

export type DateRange = { start: Date | null; end: Date | null };

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const same = (a: Date | null, b: Date | null) => !!a && !!b && a.getTime() === b.getTime();
const fmt = (d: Date | null) => (d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - offset + i));
}

export type DateRangePickerProps = { value: DateRange; onChange: (range: DateRange) => void };

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const today = startOfDay(new Date());
  const [view, setView] = useState(() => {
    const d = value.end ?? value.start ?? today;
    return { y: d.getFullYear(), m: d.getMonth(), dir: 0 };
  });
  const [hover, setHover] = useState<Date | null>(null);

  const presets: Array<[string, () => DateRange]> = [
    ['Today', () => ({ start: today, end: today })],
    ['Last 7 days', () => ({ start: addDays(today, -6), end: today })],
    ['Last 30 days', () => ({ start: addDays(today, -29), end: today })],
    ['This month', () => ({ start: new Date(today.getFullYear(), today.getMonth(), 1), end: today })],
    ['Last month', () => ({ start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) })],
  ];

  const shift = (n: number) => setView((v) => {
    const d = new Date(v.y, v.m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth(), dir: n };
  });

  const applyPreset = (r: DateRange) => {
    onChange(r);
    const d = r.end!;
    setView((v) => ({ y: d.getFullYear(), m: d.getMonth(), dir: d.getFullYear() * 12 + d.getMonth() >= v.y * 12 + v.m ? 1 : -1 }));
  };

  const pick = (d: Date) => {
    if (!value.start || value.end) onChange({ start: d, end: null });
    else if (d < value.start) onChange({ start: d, end: value.start });
    else onChange({ start: value.start, end: d });
  };

  const end = value.end ?? (value.start && hover ? hover : null);
  const [lo, hi] = value.start && end ? (end < value.start ? [end, value.start] : [value.start, end]) : [value.start, value.start];
  const days = monthGrid(view.y, view.m);
  const title = new Date(view.y, view.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-ink-900 shadow-pop sm:flex-row">
      <div className="flex gap-1 overflow-x-auto border-b border-white/5 p-2 sm:w-36 sm:flex-col sm:border-b-0 sm:border-r">
        {presets.map(([label, get]) => {
          const r = get();
          const on = same(r.start, value.start) && same(r.end, value.end);
          return (
            <button
              key={label}
              onClick={() => applyPreset(r)}
              className={cn(
                'focus-ring whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-all active:scale-[0.97]',
                on ? 'bg-brand-500/15 text-brand-200' : 'text-ink-400 hover:bg-white/5 hover:text-ink-100',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <button aria-label="Previous month" onClick={() => shift(-1)} className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition hover:bg-white/5 hover:text-ink-50 active:scale-90">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="overflow-hidden text-sm font-medium text-ink-50">
            <span key={title} className="block" ref={(el) => animateOnce(el, [{ opacity: 0, transform: `translateY(${view.dir * 8}px)` }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' })}>
              {title}
            </span>
          </span>
          <button aria-label="Next month" onClick={() => shift(1)} className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition hover:bg-white/5 hover:text-ink-50 active:scale-90">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-medium text-ink-500">
          {DAYS.map((d) => (
            <span key={d} className="pb-2">{d}</span>
          ))}
        </div>
        <div className="overflow-hidden">
          <div
            key={`${view.y}-${view.m}`}
            className="grid grid-cols-7 gap-y-1"
            onPointerLeave={() => setHover(null)}
            ref={(el) =>
              animateOnce(el, [{ opacity: 0, transform: `translateX(${view.dir * 36}px)` }, { opacity: 1, transform: 'none' }], {
                duration: 380,
                easing: 'cubic-bezier(0.16,1,0.3,1)',
              })
            }
          >
            {days.map((d) => {
              const outside = d.getMonth() !== view.m;
              const isStart = same(d, lo);
              const isEnd = same(d, hi);
              const inRange = !!lo && !!hi && d > lo && d < hi;
              const edge = isStart || isEnd;
              return (
                <div
                  key={d.getTime()}
                  className={cn(
                    'relative h-9',
                    inRange && 'bg-brand-500/10',
                    isStart && hi && !same(lo, hi) && 'bg-[linear-gradient(90deg,transparent_50%,rgba(51,150,255,0.1)_50%)]',
                    isEnd && lo && !same(lo, hi) && 'bg-[linear-gradient(90deg,rgba(51,150,255,0.1)_50%,transparent_50%)]',
                  )}
                >
                  <button
                    onClick={() => pick(d)}
                    onPointerEnter={() => setHover(d)}
                    className={cn(
                      'focus-ring relative mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm tabular-nums transition-all duration-200 active:scale-90',
                      edge
                        ? 'bg-brand-500 font-medium text-white shadow-[0_4px_12px_-4px_rgba(51,150,255,0.8)]'
                        : outside
                          ? 'text-ink-600 hover:bg-white/5'
                          : inRange
                            ? 'text-brand-100 hover:bg-brand-500/20'
                            : 'text-ink-200 hover:bg-white/5 hover:text-ink-50',
                    )}
                  >
                    {d.getDate()}
                    {same(d, today) && !edge && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-400" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DateRangePickerDemo() {
  const today = startOfDay(new Date());
  const [range, setRange] = useState<DateRange>({ start: addDays(today, -6), end: today });
  const nights = range.start && range.end ? Math.round((range.end.getTime() - range.start.getTime()) / 864e5) + 1 : 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full max-w-[460px] items-center gap-3 rounded-xl bg-ink-900 px-4 py-2.5 text-sm shadow-card">
        <Calendar className="h-4 w-4 text-brand-300" />
        <span className="text-ink-100">{fmt(range.start)}</span>
        <span className="text-ink-600">→</span>
        <span className={range.end ? 'text-ink-100' : 'text-ink-500'}>{range.end ? fmt(range.end) : 'Pick end date'}</span>
        <span className="ml-auto text-xs tabular-nums text-ink-400">{nights ? `${nights} days` : ''}</span>
      </div>
      <DateRangePicker value={range} onChange={setRange} />
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setRange({ start: null, end: null })}>
          Clear
        </Button>
        <Button size="sm" disabled={!range.end}>
          Apply range
        </Button>
      </div>
    </div>
  );
}
