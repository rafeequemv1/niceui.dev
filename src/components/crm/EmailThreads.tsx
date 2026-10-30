import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Briefcase, Building2, Check, ChevronDown, Inbox, LoaderCircle, Paperclip, Reply, Search, Send, User } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ThreadRecord = { kind: 'company' | 'person' | 'deal'; name: string };
export type ThreadMessage = { id: string; from: string; email: string; time: string; body: string; attachment?: string };
export type EmailThread = { id: string; subject: string; participants: string[]; records: ThreadRecord[]; unread: boolean; time: string; messages: ThreadMessage[] };

const RECORD_ICON = { company: Building2, person: User, deal: Briefcase } as const;
const HUES = ['bg-sky-500/20 text-sky-200', 'bg-violet-500/20 text-violet-200', 'bg-emerald-500/20 text-emerald-200', 'bg-amber-500/20 text-amber-200', 'bg-rose-500/20 text-rose-200'];
const hue = (name: string) => HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];
const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Avatar({ name, size = 'h-7 w-7 text-[10px]' }: { name: string; size?: string }) {
  return <span className={cn('grid shrink-0 place-items-center rounded-full font-semibold', size, hue(name))}>{initials(name)}</span>;
}

function RecordChip({ r }: { r: ThreadRecord }) {
  const Icon = RECORD_ICON[r.kind];
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[11px] text-ink-300 ring-1 ring-white/[0.06]">
      <Icon className="h-3 w-3 shrink-0 text-ink-500" />
      <span className="truncate">{r.name}</span>
    </span>
  );
}

export type EmailThreadsProps = { threads: EmailThread[]; me?: string; className?: string };

export function EmailThreads({ threads: initial, me = 'You', className }: EmailThreadsProps) {
  const [threads, setThreads] = useState(initial);
  const [active, setActive] = useState(initial[0]?.id);
  const [view, setView] = useState<'list' | 'thread'>('list');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const timers = useRef<number[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const thread = threads.find((t) => t.id === active);
  const list = useMemo(
    () =>
      threads.filter((t) => (filter === 'unread' ? t.unread : true) && (!q || (t.subject + t.participants.join(' ') + t.records.map((r) => r.name).join(' ')).toLowerCase().includes(q.toLowerCase()))),
    [threads, filter, q],
  );
  const unread = threads.filter((t) => t.unread).length;

  const select = (id: string) => {
    setActive(id);
    setView('thread');
    setOpen(new Set());
    setDraft('');
    setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, unread: false } : t)));
  };

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [active, thread?.messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text || !thread || sending) return;
    setSending(true);
    timers.current.push(
      window.setTimeout(() => {
        setThreads((ts) => ts.map((t) => (t.id === thread.id ? { ...t, time: 'now', messages: [...t.messages, { id: `m${Date.now()}`, from: me, email: 'you@meridian.app', time: 'Just now', body: text }] } : t)));
        setDraft('');
        setSending(false);
      }, 700),
    );
  };

  return (
    <div className={cn('grid h-[460px] w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card md:grid-cols-[280px_minmax(0,1fr)]', className)}>
      <aside className={cn('min-h-0 flex-col border-white/5 md:flex md:border-r', view === 'thread' ? 'hidden' : 'flex')}>
        <div className="space-y-2 border-b border-white/5 p-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-ink-400" />
            <span className="text-sm font-medium text-ink-100">Inbox</span>
            {unread > 0 && <span className="rounded-full bg-brand-500/15 px-1.5 font-mono text-[10.5px] text-brand-200">{unread}</span>}
            <div className="ml-auto flex rounded-lg bg-ink-950/60 p-0.5" role="tablist" aria-label="Filter">
              {(['all', 'unread'] as const).map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('focus-ring rounded-md px-2 py-0.5 text-[11px] capitalize transition-colors', filter === f ? 'bg-ink-800 text-ink-50' : 'text-ink-500 hover:text-ink-200')}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <label className="flex h-8 items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 ring-1 ring-white/[0.06] focus-within:ring-brand-500/40">
            <Search className="h-3.5 w-3.5 text-ink-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mail and records" aria-label="Search threads" className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink-100 outline-none placeholder:text-ink-600" />
          </label>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
          {list.map((t) => (
            <li key={t.id}>
              <button onClick={() => select(t.id)} aria-current={t.id === active} className={cn('focus-ring relative flex w-full gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors', t.id === active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}>
                {t.unread && <span className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-400" aria-label="Unread" />}
                <Avatar name={t.participants[0]} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn('truncate text-[12.5px]', t.unread ? 'font-semibold text-ink-50' : 'text-ink-200')}>{t.participants.join(', ')}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-ink-500">{t.time}</span>
                  </span>
                  <span className={cn('block truncate text-[12px]', t.unread ? 'text-ink-200' : 'text-ink-400')}>{t.subject}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {t.records.slice(0, 2).map((r) => (
                      <RecordChip key={r.kind + r.name} r={r} />
                    ))}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {!list.length && <li className="px-3 py-8 text-center text-xs text-ink-500">Nothing matches “{q}”.</li>}
        </ul>
      </aside>

      <section className={cn('min-h-0 min-w-0 flex-col md:flex', view === 'list' ? 'hidden' : 'flex')}>
        {thread && (
          <>
            <header className="space-y-2 border-b border-white/5 px-4 py-3">
              <div className="flex items-start gap-2">
                <button onClick={() => setView('list')} aria-label="Back to inbox" className="focus-ring -ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-white/5 md:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="min-w-0 flex-1 text-[14.5px] font-medium leading-snug text-ink-50">{thread.subject}</h3>
                <div className="flex -space-x-1.5">
                  {thread.participants.map((p) => (
                    <span key={p} className="rounded-full ring-2 ring-ink-900" title={p}>
                      <Avatar name={p} size="h-6 w-6 text-[9px]" />
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {thread.records.map((r) => (
                  <RecordChip key={r.kind + r.name} r={r} />
                ))}
              </div>
            </header>
            <div ref={scroller} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 [scrollbar-width:thin]">
              {thread.messages.map((m, i) => {
                const last = i === thread.messages.length - 1;
                const expanded = last || open.has(m.id);
                return (
                  <article key={m.id} className={cn('rounded-xl ring-1 transition-colors', expanded ? 'bg-white/[0.03] ring-white/[0.06]' : 'ring-transparent hover:bg-white/[0.02]', m.from === me && 'animate-fade-up')}>
                    <button
                      onClick={() => !last && setOpen((s) => new Set(s).add(m.id))}
                      disabled={last}
                      aria-expanded={expanded}
                      className="focus-ring flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left disabled:cursor-default"
                    >
                      <Avatar name={m.from} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[12.5px] font-medium text-ink-100">{m.from}</span>
                          <span className="hidden truncate text-[11px] text-ink-500 sm:inline">{m.email}</span>
                          <span className="ml-auto shrink-0 font-mono text-[10px] text-ink-500">{m.time}</span>
                        </span>
                        {!expanded && <span className="block truncate text-[12px] text-ink-500">{m.body.split('\n')[0]}</span>}
                      </span>
                      {!expanded && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-600" />}
                    </button>
                    {expanded && (
                      <div className="px-3 pb-3 pl-[46px]">
                        <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink-300">{m.body}</p>
                        {m.attachment && (
                          <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] text-ink-300 ring-1 ring-white/[0.06]">
                            <Paperclip className="h-3 w-3" /> {m.attachment}
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-white/5 p-3"
            >
              <div className="flex items-end gap-2 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/[0.06] focus-within:ring-brand-500/40">
                <Reply className="mb-1.5 ml-1 h-3.5 w-3.5 shrink-0 text-ink-500" />
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder={`Reply to ${thread.participants[0].split(' ')[0]}…`}
                  aria-label="Quick reply"
                  className="max-h-24 min-h-[28px] min-w-0 flex-1 resize-none bg-transparent py-1 text-[12.5px] text-ink-100 outline-none placeholder:text-ink-600"
                />
                <button type="submit" disabled={!draft.trim() || sending} aria-label="Send reply" className="focus-ring grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500 text-white transition-all hover:bg-brand-400 disabled:bg-white/10 disabled:text-ink-500">
                  {sending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-1.5 flex items-center gap-1 px-1 text-[10.5px] text-ink-600">
                <Check className="h-3 w-3" /> Logged to {thread.records[0]?.name ?? 'the record'} timeline · ⌘ Enter to send
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

/* ——— demo ——— */

const DEMO_THREADS: EmailThread[] = [
  {
    id: 't1',
    subject: 'Re: Security review for the Growth plan',
    participants: ['Maya Chen', 'Leo Park'],
    records: [
      { kind: 'company', name: 'Halcyon Labs' },
      { kind: 'deal', name: 'Halcyon · Growth' },
    ],
    unread: true,
    time: '9:41',
    messages: [
      { id: 'a', from: 'Jordan Blake', email: 'jordan@meridian.app', time: 'Mon 16:02', body: 'Hi Maya, attaching our security overview and SOC 2 report. Happy to walk your IT team through it.', attachment: 'meridian-security.pdf' },
      { id: 'b', from: 'Leo Park', email: 'leo@halcyonlabs.io', time: 'Tue 10:15', body: 'Thanks Jordan. Two questions from IT: do you support SSO with our identity provider, and where is data stored?' },
      { id: 'c', from: 'Maya Chen', email: 'maya@halcyonlabs.io', time: 'Today 9:41', body: 'Adding to Leo’s note: if SSO is covered we can sign this week.\n\nCould you also confirm the price for 25 seats on annual billing?' },
    ],
  },
  {
    id: 't2',
    subject: 'Pilot results from the Lisbon team',
    participants: ['Tomás Ruiz'],
    records: [
      { kind: 'company', name: 'Brightfold' },
      { kind: 'person', name: 'Tomás Ruiz' },
    ],
    unread: true,
    time: '8:12',
    messages: [{ id: 'a', from: 'Tomás Ruiz', email: 'tomas@brightfold.co', time: 'Today 8:12', body: 'The pilot went well: reps logged 40% fewer manual updates. Let’s talk expansion next week.' }],
  },
  {
    id: 't3',
    subject: 'Invoice #4821 and the seat change',
    participants: ['Ines Kovač'],
    records: [{ kind: 'company', name: 'Quarry & Co' }],
    unread: false,
    time: 'Yesterday',
    messages: [{ id: 'a', from: 'Ines Kovač', email: 'ines@quarry.co', time: 'Yesterday', body: 'We dropped two seats last month; can you reissue the invoice?' }],
  },
  {
    id: 't4',
    subject: 'Intro: Priya from Lattice Ventures',
    participants: ['Priya Natarajan', 'Sam Ortiz'],
    records: [
      { kind: 'person', name: 'Priya Natarajan' },
      { kind: 'deal', name: 'Lattice · Enterprise' },
    ],
    unread: false,
    time: 'Oct 27',
    messages: [{ id: 'a', from: 'Sam Ortiz', email: 'sam@latticevc.com', time: 'Oct 27', body: 'Priya runs RevOps across our portfolio and wants to see the forecasting views.' }],
  },
];

export function EmailThreadsDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <EmailThreads threads={DEMO_THREADS} />
    </div>
  );
}
