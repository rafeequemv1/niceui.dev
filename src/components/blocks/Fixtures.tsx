import { useEffect, useState } from 'react';
import { Bell, Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';

type Team = { name: string; short: string; color: string };
export type Fixture = { id: string; home: Team; away: Team; status: 'live' | 'ft' | 'upcoming'; score?: [number, number]; minute?: number; kickoff?: string; league: string };

const T = (name: string, short: string, color: string): Team => ({ name, short, color });
const ARS = T('Arsenal', 'ARS', 'bg-rose-500'), CHE = T('Chelsea', 'CHE', 'bg-brand-600'), LIV = T('Liverpool', 'LIV', 'bg-rose-700');
const MCI = T('Man City', 'MCI', 'bg-sky-400'), TOT = T('Tottenham', 'TOT', 'bg-ink-200'), NEW = T('Newcastle', 'NEW', 'bg-ink-600');
const AVL = T('Aston Villa', 'AVL', 'bg-amber-700'), BHA = T('Brighton', 'BHA', 'bg-brand-400');

export const FIXTURE_DAYS: Array<{ id: string; label: string; date: string; fixtures: Fixture[] }> = [
  { id: 'y', label: 'Yesterday', date: 'Sat 14', fixtures: [
    { id: '1', home: LIV, away: TOT, status: 'ft', score: [3, 1], league: 'Premier League' },
    { id: '2', home: BHA, away: NEW, status: 'ft', score: [0, 0], league: 'Premier League' },
  ] },
  { id: 't', label: 'Today', date: 'Sun 15', fixtures: [
    { id: '3', home: ARS, away: CHE, status: 'live', score: [2, 1], minute: 67, league: 'Premier League' },
    { id: '4', home: MCI, away: AVL, status: 'live', score: [1, 1], minute: 38, league: 'Premier League' },
    { id: '5', home: NEW, away: LIV, status: 'upcoming', kickoff: '19:45', league: 'Premier League' },
  ] },
  { id: 'm', label: 'Tomorrow', date: 'Mon 16', fixtures: [
    { id: '6', home: TOT, away: ARS, status: 'upcoming', kickoff: '17:30', league: 'Premier League' },
    { id: '7', home: CHE, away: BHA, status: 'upcoming', kickoff: '20:00', league: 'FA Cup' },
    { id: '8', home: AVL, away: MCI, status: 'upcoming', kickoff: '20:00', league: 'FA Cup' },
  ] },
];

function Crest({ team }: { team: Team }) {
  return (
    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-ink-950 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]', team.color)}>
      {team.short}
    </span>
  );
}

export function FixtureRow({ f, index }: { f: Fixture; index: number }) {
  const [minute, setMinute] = useState(f.minute ?? 0);
  const [remind, setRemind] = useState(false);
  useEffect(() => {
    if (f.status !== 'live') return;
    const id = window.setInterval(() => setMinute((m) => Math.min(90, m + 1)), 4000);
    return () => window.clearInterval(id);
  }, [f.status]);

  return (
    <div className="flex animate-fade-up items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.03]" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex flex-1 items-center justify-end gap-2.5 text-right">
        <span className="truncate text-sm font-medium text-ink-100">{f.home.name}</span>
        <Crest team={f.home} />
      </div>
      <div className="flex w-24 flex-col items-center">
        {f.status === 'upcoming' ? (
          <>
            <span className="font-mono text-sm text-ink-200">{f.kickoff}</span>
            <button
              onClick={() => setRemind((r) => !r)}
              className={cn('mt-0.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all active:scale-95', remind ? 'bg-brand-500/15 text-brand-300' : 'text-ink-500 hover:text-ink-200')}
            >
              <Bell className={cn('h-2.5 w-2.5', remind && 'animate-wiggle fill-current')} /> {remind ? 'Reminder set' : 'Remind'}
            </button>
          </>
        ) : (
          <>
            <span className="font-mono text-xl font-medium tabular-nums text-ink-50">
              {f.score?.[0]} <span className="text-ink-600">–</span> {f.score?.[1]}
            </span>
            {f.status === 'live' ? (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-400" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                LIVE {minute}’
              </span>
            ) : (
              <span className="text-[10px] font-medium text-ink-500">FT</span>
            )}
          </>
        )}
      </div>
      <div className="flex flex-1 items-center gap-2.5">
        <Crest team={f.away} />
        <span className="truncate text-sm font-medium text-ink-100">{f.away.name}</span>
      </div>
    </div>
  );
}

export function Fixtures({ days = FIXTURE_DAYS, defaultDay = 't' }: { days?: typeof FIXTURE_DAYS; defaultDay?: string }) {
  const [day, setDay] = useState(defaultDay);
  const idx = Math.max(0, days.findIndex((d) => d.id === day));
  const current = days[idx];
  const live = current.fixtures.filter((f) => f.status === 'live').length;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-ink-900 shadow-card">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-ink-50">Fixtures</span>
        </div>
        {live > 0 && <span className="animate-fade-in rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">{live} live now</span>}
      </div>
      <div className="relative mx-4 grid rounded-xl bg-ink-950/60 p-1" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        <span
          className="absolute inset-y-1 left-1 rounded-lg bg-ink-800 shadow-hairline transition-transform duration-500 ease-spring"
          style={{ width: `calc((100% - 8px) / ${days.length})`, transform: `translateX(${idx * 100}%)` }}
        />
        {days.map((d) => (
          <button key={d.id} onClick={() => setDay(d.id)} className={cn('focus-ring relative z-10 rounded-lg py-1.5 text-center transition-colors', day === d.id ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200')}>
            <span className="block text-xs font-medium">{d.label}</span>
            <span className="block text-[10px] text-ink-500">{d.date}</span>
          </button>
        ))}
      </div>
      <div key={day} className="p-2 pt-3">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-ink-500">{current.fixtures[0]?.league}</p>
        {current.fixtures.map((f, i) => <FixtureRow key={f.id} f={f} index={i} />)}
      </div>
    </div>
  );
}

export function FixturesDemo() {
  return (
    <div className="flex justify-center">
      <Fixtures />
    </div>
  );
}
