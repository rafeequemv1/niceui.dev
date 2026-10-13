import { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TimeRange = { id: number; start: string; end: string };
export type DaySchedule = { day: string; enabled: boolean; ranges: TimeRange[] };

const TIMES = Array.from({ length: 33 }, (_, i) => {
  const mins = 6 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${mins % 60 === 0 ? '00' : '30'}`;
});

let uid = 100;
const range = (start = '09:00', end = '17:00'): TimeRange => ({ id: uid++, start, end });

export const DEFAULT_WEEK: DaySchedule[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => ({
  day,
  enabled: i < 5,
  ranges: i === 2 ? [range('09:00', '12:00'), range('13:30', '18:00')] : [range()],
}));

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn('focus-ring relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300', on ? 'bg-brand-500' : 'bg-ink-700')}
    >
      <span className={cn('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-spring', on && 'translate-x-4')} />
    </button>
  );
}

function TimeSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="focus-ring h-8 cursor-pointer appearance-none rounded-lg bg-ink-850 px-2.5 font-mono text-xs text-ink-100 shadow-hairline transition-colors hover:bg-ink-800"
    >
      {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

export type AvailabilitySchedulerProps = { value: DaySchedule[]; onChange: (next: DaySchedule[]) => void };

export function AvailabilityScheduler({ value, onChange }: AvailabilitySchedulerProps) {
  const [leaving, setLeaving] = useState<number[]>([]);
  const update = (i: number, patch: Partial<DaySchedule>) => onChange(value.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const removeRange = (i: number, id: number) => {
    setLeaving((l) => [...l, id]);
    window.setTimeout(() => {
      onChange(value.map((d, j) => (j === i ? { ...d, ranges: d.ranges.filter((r) => r.id !== id), enabled: d.ranges.length > 1 } : d)));
      setLeaving((l) => l.filter((x) => x !== id));
    }, 260);
  };

  return (
    <div className="divide-y divide-white/5">
      {value.map((d, i) => (
        <div key={d.day} className="flex gap-4 py-3">
          <div className="flex w-32 shrink-0 items-center gap-3 self-start pt-1.5">
            <Switch on={d.enabled} label={`Toggle ${d.day}`} onChange={() => update(i, { enabled: !d.enabled, ranges: d.ranges.length ? d.ranges : [range()] })} />
            <span className={cn('text-sm font-medium transition-colors', d.enabled ? 'text-ink-100' : 'text-ink-500')}>{d.day.slice(0, 3)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn('grid transition-all duration-500 ease-smooth', d.enabled ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
              <div className="overflow-hidden">
                {d.ranges.map((r, ri) => {
                  const out = leaving.includes(r.id);
                  return (
                    <div key={r.id} className={cn('grid transition-all duration-300 ease-smooth', out ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100')}>
                      <div className="overflow-hidden">
                        <div className={cn('flex items-center gap-2 py-1', !out && 'animate-fade-up')}>
                          <TimeSelect label="Start time" value={r.start} onChange={(v) => update(i, { ranges: d.ranges.map((x) => (x.id === r.id ? { ...x, start: v } : x)) })} />
                          <span className="text-ink-600">–</span>
                          <TimeSelect label="End time" value={r.end} onChange={(v) => update(i, { ranges: d.ranges.map((x) => (x.id === r.id ? { ...x, end: v } : x)) })} />
                          {r.end <= r.start && <span className="animate-fade-in text-[11px] text-rose-400">Invalid</span>}
                          <div className="ml-auto flex gap-0.5">
                            {ri === 0 && (
                              <button aria-label="Add range" onClick={() => update(i, { ranges: [...d.ranges, range('18:00', '20:00')] })} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-all hover:bg-white/5 hover:text-ink-100 active:scale-90">
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                            <button aria-label="Remove range" onClick={() => removeRange(i, r.id)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-all hover:bg-rose-500/10 hover:text-rose-300 active:scale-90">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {!d.enabled && <p className="animate-fade-in pt-1.5 text-sm text-ink-500">Unavailable</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AvailabilitySchedulerDemo() {
  const [week, setWeek] = useState(DEFAULT_WEEK);
  const [saved, setSaved] = useState(false);
  const hours = week.filter((d) => d.enabled).reduce((sum, d) => sum + d.ranges.reduce((s, r) => {
    const [sh, sm] = r.start.split(':').map(Number); const [eh, em] = r.end.split(':').map(Number);
    return s + Math.max(0, eh * 60 + em - sh * 60 - sm) / 60;
  }, 0), 0);

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl bg-ink-900 p-5 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-50">Working hours</p>
          <p className="text-xs text-ink-400">{hours.toFixed(1)}h available per week · Europe/London</p>
        </div>
        <button
          onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}
          className={cn('focus-ring flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95', saved ? 'bg-emerald-500/15 text-emerald-300' : 'bg-ink-50 text-ink-950 hover:bg-white')}
        >
          {saved && <Check className="h-3.5 w-3.5 animate-scale-in" />} {saved ? 'Saved' : 'Save changes'}
        </button>
      </div>
      <AvailabilityScheduler value={week} onChange={setWeek} />
    </div>
  );
}
