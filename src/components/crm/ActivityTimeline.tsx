import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, ChevronDown, LoaderCircle, Mail, PencilLine, Phone, StickyNote, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ActivityKind = 'email' | 'call' | 'meeting' | 'note' | 'stage' | 'update';

export type Activity = {
  id: string;
  kind: ActivityKind;
  day: string;
  time: string;
  actor: string;
  title: string;
  body?: string;
  /** Call duration, meeting length or similar. */
  meta?: string;
  from?: string;
  to?: string;
  attendees?: string[];
};

export type ActivityFilter = 'all' | 'email' | 'call' | 'note';

export type ActivityTimelineProps = {
  activities: Activity[];
  /** Called when the visitor asks for older activity; resolve with more items. */
  onLoadMore?: () => Promise<Activity[]>;
  /** Ids to highlight as just arrived. */
  fresh?: string[];
  className?: string;
};

const KIND: Record<ActivityKind, { icon: typeof Mail; tint: string }> = {
  email: { icon: Mail, tint: 'bg-sky-500/15 text-sky-300' },
  call: { icon: Phone, tint: 'bg-emerald-500/15 text-emerald-300' },
  meeting: { icon: CalendarDays, tint: 'bg-violet-500/15 text-violet-300' },
  note: { icon: StickyNote, tint: 'bg-amber-500/15 text-amber-300' },
  stage: { icon: TrendingUp, tint: 'bg-brand-500/15 text-brand-300' },
  update: { icon: PencilLine, tint: 'bg-white/[0.06] text-ink-300' },
};

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'email', label: 'Emails' },
  { id: 'call', label: 'Calls' },
  { id: 'note', label: 'Notes' },
];

function Item({ a, fresh }: { a: Activity; fresh: boolean }) {
  const [open, setOpen] = useState(false);
  const { icon: Icon, tint } = KIND[a.kind];
  const long = !!a.body && a.body.length > 110;
  return (
    <li className={cn('relative flex gap-3 pb-4 last:pb-0', fresh && 'animate-fade-up')}>
      <span className={cn('relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full ring-4 ring-ink-900', tint)}>
        <Icon className="h-3.5 w-3.5" />
        {fresh && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-400 ring-2 ring-ink-900 animate-pulse" />}
      </span>
      <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors', fresh ? 'bg-brand-500/[0.07] ring-1 ring-brand-400/25' : 'hover:bg-white/[0.02]')}>
        <p className="flex min-w-0 items-baseline gap-2 text-[13px]">
          <span className="min-w-0 flex-1 truncate text-ink-300">
            <b className="font-medium text-ink-100">{a.actor}</b> {a.title}
          </span>
          {fresh && <span className="shrink-0 rounded bg-brand-500/20 px-1 text-[10px] font-medium text-brand-200">New</span>}
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-500">{a.time}</span>
        </p>
        {a.kind === 'stage' && a.from && a.to && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-ink-400 line-through decoration-ink-600">{a.from}</span>
            <ArrowRight className="h-3 w-3 text-ink-500" />
            <span className="rounded-md bg-brand-500/15 px-1.5 py-0.5 font-medium text-brand-200">{a.to}</span>
          </p>
        )}
        {a.kind === 'update' && a.from && a.to && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <span className="text-ink-500 line-through">{a.from}</span>
            <ArrowRight className="h-3 w-3 text-ink-500" />
            <span className="text-emerald-300">{a.to}</span>
          </p>
        )}
        {a.meta && (
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-400">
            <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono tabular-nums">{a.meta}</span>
            {a.attendees?.map((p) => (
              <span key={p} className="rounded-md bg-white/[0.05] px-1.5 py-0.5">
                {p}
              </span>
            ))}
          </p>
        )}
        {a.body && (
          <>
            <p className={cn('mt-1.5 text-[13px] leading-relaxed text-ink-400', !open && long && 'line-clamp-2')}>{a.body}</p>
            {long && (
              <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="focus-ring mt-1 inline-flex items-center gap-1 rounded text-[11px] text-brand-300 hover:text-brand-200">
                {open ? 'Show less' : 'Show more'}
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-300', open && 'rotate-180')} />
              </button>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export function ActivityTimeline({ activities, onLoadMore, fresh = [], className }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [older, setOlder] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(!onLoadMore);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const all = [...activities, ...older];
  const shown = all.filter((a) => filter === 'all' || a.kind === filter);
  const days = [...new Set(shown.map((a) => a.day))];
  const count = (f: ActivityFilter) => all.filter((a) => f === 'all' || a.kind === f).length;

  const more = async () => {
    if (!onLoadMore || loading) return;
    setLoading(true);
    const next = await onLoadMore();
    if (!alive.current) return;
    setOlder((o) => [...o, ...next]);
    setLoading(false);
    if (!next.length) setExhausted(true);
  };

  return (
    <div className={cn('w-full max-w-xl rounded-2xl bg-ink-900 p-4 shadow-card sm:p-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink-50">Timeline</h3>
        <div role="tablist" aria-label="Filter activity" className="flex rounded-lg bg-ink-950/60 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn('focus-ring flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors', filter === f.id ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-400 hover:text-ink-200')}
            >
              {f.label}
              <span className="font-mono text-[10px] tabular-nums text-ink-500">{count(f.id)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {days.map((day) => (
          <section key={day}>
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-500">{day}</p>
            <ol className="relative before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-white/[0.07]">
              {shown
                .filter((a) => a.day === day)
                .map((a) => (
                  <Item key={a.id} a={a} fresh={fresh.includes(a.id)} />
                ))}
            </ol>
          </section>
        ))}
        {!shown.length && <p className="py-8 text-center text-sm text-ink-500">Nothing here yet.</p>}
      </div>

      {!exhausted && (
        <button onClick={more} disabled={loading} className="focus-ring mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/5 text-xs text-ink-300 transition-colors hover:bg-white/[0.03] hover:text-ink-100">
          {loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
          {loading ? 'Loading older activity…' : 'Load older activity'}
        </button>
      )}
    </div>
  );
}

const BASE: Activity[] = [
  { id: 'a2', kind: 'call', day: 'Today', time: '11:20', actor: 'Lena Brooks', title: 'called Sofia Andersen', meta: '18m 42s · Connected', body: 'Walked through the pilot scope. Sofia wants SSO and a Friday go-live for the Oakland depot, legal review starts Monday.' },
  { id: 'a3', kind: 'stage', day: 'Today', time: '09:05', actor: 'Lena Brooks', title: 'moved Halcyon pilot', from: 'Discovery', to: 'Proposal' },
  { id: 'a4', kind: 'email', day: 'Yesterday', time: '16:48', actor: 'Sofia Andersen', title: 'replied · Re: Pilot pricing', body: 'Thanks Lena, this looks right. Could you split the onboarding fee across the first two invoices? Our finance team closes the quarter on the 28th, so anything signed before then is easier to approve. Looping in Marcus from procurement.' },
  { id: 'a5', kind: 'meeting', day: 'Yesterday', time: '13:00', actor: 'Marcus Webb', title: 'held Pilot kickoff', meta: '45 min', attendees: ['Sofia A.', 'Dev P.', '+2'] },
  { id: 'a6', kind: 'note', day: 'Yesterday', time: '12:10', actor: 'Priya Raman', title: 'added a note', body: 'Champion is Sofia; economic buyer is the CFO. Competitor is still in the running on price only.' },
  { id: 'a7', kind: 'update', day: 'Yesterday', time: '10:32', actor: 'Lena Brooks', title: 'updated Amount', from: '$48,000', to: '$72,000' },
];

const OLDER: Activity[] = [
  { id: 'b1', kind: 'email', day: 'Mon, Oct 26', time: '08:15', actor: 'Lena Brooks', title: 'sent · Halcyon × Meridian intro', body: 'Great meeting you at FleetOps. Sharing the deck and two customer stories from regional carriers like yours.' },
  { id: 'b2', kind: 'call', day: 'Mon, Oct 26', time: '07:40', actor: 'Lena Brooks', title: 'called Sofia Andersen', meta: '2m 05s · Voicemail' },
];

export function ActivityTimelineDemo() {
  const [items, setItems] = useState(BASE);
  const [fresh, setFresh] = useState<string[]>([]);
  const loaded = useRef(false);

  // A reply lands live shortly after load.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const add = () => {
      setItems((list) => [{ id: 'a1', kind: 'email', day: 'Today', time: '12:04', actor: 'Sofia Andersen', title: 'replied · Re: Pilot pricing', body: 'Signed copy attached. Excited to get the Oakland depot live next Friday!' }, ...list]);
      setFresh(['a1']);
    };
    if (reduce) {
      add();
      return;
    }
    const id = window.setTimeout(add, 1400);
    return () => clearTimeout(id);
  }, []);

  return (
    <ActivityTimeline
      activities={items}
      fresh={fresh}
      onLoadMore={() =>
        new Promise((resolve) => {
          window.setTimeout(() => {
            const next = loaded.current ? [] : OLDER;
            loaded.current = true;
            resolve(next);
          }, 700);
        })
      }
    />
  );
}
