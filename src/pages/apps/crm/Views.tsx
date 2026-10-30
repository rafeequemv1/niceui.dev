import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bell, Building2, CalendarDays, ChevronDown, CircleDollarSign, FileText, Mail, Plus, Repeat, Sparkles, Target as TargetIcon, Trophy, UserPlus, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ME, MEMBERS, STAGES } from './data';
import { recordName, useCrm } from './store';
import { Avatar, TONE, daysFromToday, fmtDate, money, relDay } from './ui';

/* ——— Tasks ——— */

export function TasksView() {
  const crm = useCrm();
  const [draft, setDraft] = useState('');
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const groups = useMemo(() => {
    const g: Record<string, typeof crm.tasks> = { Overdue: [], Today: [], 'This week': [], Later: [], Completed: [] };
    for (const t of crm.tasks) {
      const d = daysFromToday(t.due);
      if (t.done) g.Completed.push(t);
      else if (d < 0) g.Overdue.push(t);
      else if (d === 0) g.Today.push(t);
      else if (d <= 7) g['This week'].push(t);
      else g.Later.push(t);
    }
    return g;
  }, [crm.tasks]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] sm:px-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          crm.setTasks((all) => [{ id: `t${Date.now()}`, title: draft.trim(), due: '2026-10-30', done: false, assignee: ME.id, target: { kind: 'company', id: 'c1' } }, ...all]);
          crm.toast('Task added for today');
          setDraft('');
        }}
        className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 focus-within:border-[var(--accent)]"
      >
        <Plus className="h-4 w-4 text-[var(--mute)]" />
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task for today and press Enter" aria-label="New task" className="h-9 min-w-0 flex-1 bg-transparent text-[13px] text-[var(--strong)] outline-none placeholder:text-[var(--faint)]" />
      </form>
      {Object.entries(groups).map(([name, list]) =>
        list.length ? (
          <section key={name} className="mb-3">
            <button onClick={() => setClosed((c) => ({ ...c, [name]: !c[name] }))} aria-expanded={!closed[name]} className="mb-1 flex items-center gap-1.5 px-1 text-[12px] font-medium text-[var(--mute)] hover:text-[var(--strong)]">
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', closed[name] && '-rotate-90')} />
              <span className={cn(name === 'Overdue' && 'text-[#dc3e42]')}>{name}</span>
              <span className="text-[var(--faint)]">{list.length}</span>
            </button>
            {!closed[name] && (
              <ul className="overflow-hidden rounded-lg border border-[var(--line)]">
                {list.map((t) => {
                  const m = MEMBERS.find((x) => x.id === t.assignee) ?? ME;
                  const overdue = !t.done && daysFromToday(t.due) < 0;
                  return (
                    <li key={t.id} className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-2 last:border-b-0 hover:bg-[var(--side)]">
                      <input type="checkbox" checked={t.done} aria-label={`Complete ${t.title}`} onChange={() => crm.setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className="h-3.5 w-3.5 shrink-0 accent-[var(--accent)]" />
                      <span className={cn('min-w-0 flex-1 truncate text-[13px]', t.done ? 'text-[var(--faint)] line-through' : 'text-[var(--strong)]')}>{t.title}</span>
                      <button onClick={() => crm.openRecord(t.target)} className="hidden max-w-[180px] items-center gap-1 truncate rounded-[4px] bg-[var(--sub)] px-1.5 py-px text-[12px] text-[var(--fg)] hover:bg-[var(--hover)] sm:inline-flex">
                        {recordName(crm, t.target)}
                      </button>
                      <span className={cn('flex shrink-0 items-center gap-1 text-[12px]', overdue ? 'text-[#dc3e42]' : 'text-[var(--mute)]')}>
                        <CalendarDays className="h-3 w-3" /> {relDay(t.due)}
                      </span>
                      <Avatar name={m.name} color={m.color} size={18} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : null,
      )}
    </div>
  );
}

/* ——— Notes ——— */

export function NotesView() {
  const crm = useCrm();
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:thin] sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {crm.notes.map((n) => {
          const m = MEMBERS.find((x) => x.id === n.author) ?? ME;
          return (
            <button key={n.id} onClick={() => crm.openRecord(n.target)} className="group flex min-h-[150px] flex-col rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-left transition-all hover:border-[var(--line2)] hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.15)]">
              <span className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--strong)]">
                <FileText className="h-4 w-4 shrink-0 text-[var(--mute)]" />
                <span className="truncate">{n.title}</span>
              </span>
              <span className="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-[var(--fg)]">{n.body}</span>
              <span className="mt-3 flex items-center gap-2 text-[11.5px] text-[var(--mute)]">
                <Avatar name={m.name} color={m.color} size={16} /> {m.name.split(' ')[0]} · {fmtDate(n.updated)}
                <span className="ml-auto truncate rounded-[4px] bg-[var(--sub)] px-1.5 py-px text-[var(--fg)]">{recordName(crm, n.target)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ——— Workflows ——— */

const FLOWS = [
  { id: 'w1', name: 'Route inbound leads', steps: [{ icon: UserPlus, label: 'Person created' }, { icon: Sparkles, label: 'Enrich with AI' }, { icon: Repeat, label: 'Round-robin owner' }, { icon: Mail, label: 'Send intro email' }], runs: 1284, active: true },
  { id: 'w2', name: 'Deal won hand-off', steps: [{ icon: TargetIcon, label: 'Stage → Customer' }, { icon: Building2, label: 'Create onboarding' }, { icon: Bell, label: 'Notify success team' }], runs: 92, active: true },
  { id: 'w3', name: 'Stale deal nudge', steps: [{ icon: CalendarDays, label: 'Every Monday' }, { icon: Zap, label: 'No activity 14 days' }, { icon: Mail, label: 'Email the owner' }], runs: 418, active: false },
];

export function WorkflowsView() {
  const crm = useCrm();
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(FLOWS.map((f) => [f.id, f.active])));
  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 [scrollbar-width:thin] sm:p-5">
      {FLOWS.map((f) => (
        <article key={f.id} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Zap className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="text-[14px] font-medium text-[var(--strong)]">{f.name}</h3>
            <span className={cn('rounded-full px-2 py-px text-[11px] font-medium', on[f.id] ? 'bg-[#2b9a66]/15 text-[#2b9a66]' : 'bg-[var(--hover)] text-[var(--mute)]')}>{on[f.id] ? 'Active' : 'Draft'}</span>
            <span className="ml-auto text-[12px] text-[var(--mute)]">{f.runs.toLocaleString('en-US')} runs</span>
            <button
              role="switch"
              aria-checked={on[f.id]}
              aria-label={`Activate ${f.name}`}
              onClick={() => {
                setOn((s) => ({ ...s, [f.id]: !s[f.id] }));
                crm.toast(`${f.name} ${on[f.id] ? 'paused' : 'activated'}`);
              }}
              className={cn('relative h-5 w-9 rounded-full transition-colors', on[f.id] ? 'bg-[var(--accent)]' : 'bg-[var(--line2)]')}
            >
              <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', on[f.id] ? 'left-[18px]' : 'left-0.5')} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {f.steps.map((s, i) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--sub)] px-2 py-1 text-[12px] text-[var(--fg)]">
                  <s.icon className="h-3.5 w-3.5 text-[var(--mute)]" /> {s.label}
                </span>
                {i < f.steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-[var(--faint)]" />}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ——— Dashboard ——— */

const REVENUE = [182, 205, 196, 240, 268, 251, 302, 329, 318, 366, 391, 428];
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export function DashboardView() {
  const crm = useCrm();
  const open = crm.opps.filter((o) => o.stage !== 'Customer');
  const won = crm.opps.filter((o) => o.stage === 'Customer');
  const pipeline = open.reduce((s, o) => s + o.amount, 0);
  const weighted = open.reduce((s, o) => s + (o.amount * o.probability) / 100, 0);
  const wonSum = won.reduce((s, o) => s + o.amount, 0);
  const byStage = STAGES.map((s) => ({ s, v: crm.opps.filter((o) => o.stage === s).reduce((a, o) => a + o.amount, 0) }));
  const maxStage = Math.max(...byStage.map((b) => b.v), 1);
  const owners = MEMBERS.map((m) => ({ m, v: crm.opps.filter((o) => o.owner === m.id).reduce((a, o) => a + o.amount, 0) })).sort((a, b) => b.v - a.v);
  const [hover, setHover] = useState<number | null>(null);

  const W = 560;
  const H = 150;
  const max = Math.max(...REVENUE) * 1.1;
  const pts = REVENUE.map((v, i) => [(i / (REVENUE.length - 1)) * W, H - (v / max) * H] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const kpis = [
    { label: 'Open pipeline', value: money(pipeline), delta: '+12.4%', icon: CircleDollarSign },
    { label: 'Weighted forecast', value: money(Math.round(weighted)), delta: '+8.1%', icon: TargetIcon },
    { label: 'Won this quarter', value: money(wonSum), delta: '+21.0%', icon: Trophy },
    { label: 'Win rate', value: `${Math.round((won.length / Math.max(1, crm.opps.length)) * 100 + 18)}%`, delta: '+3 pts', icon: ArrowUpRight },
  ];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:thin] sm:p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3.5">
            <p className="flex items-center gap-1.5 text-[12px] text-[var(--mute)]"><k.icon className="h-3.5 w-3.5" /> {k.label}</p>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[var(--strong)] tabular-nums">{k.value}</p>
            <p className="mt-0.5 text-[12px] font-medium text-[#2b9a66]">{k.delta} <span className="font-normal text-[var(--mute)]">vs last quarter</span></p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[13.5px] font-medium text-[var(--strong)]">Monthly recurring revenue</h3>
            <span className="font-mono text-[12px] tabular-nums text-[var(--mute)]">{hover === null ? '$428k in Oct' : `$${REVENUE[hover]}k in ${MONTHS[hover]}`}</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H + 22}`} className="mt-3 h-auto w-full" role="img" aria-label="Monthly recurring revenue, last 12 months" onMouseLeave={() => setHover(null)}>
            <defs>
              <linearGradient id="mrd-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--accent)" stopOpacity="0.22" />
                <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--line)" strokeDasharray="3 4" />
            ))}
            <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#mrd-area)" />
            <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
            {pts.map(([x, y], i) => (
              <g key={i} onMouseEnter={() => setHover(i)}>
                <rect x={x - W / 24} y="0" width={W / 12} height={H} fill="transparent" />
                <circle cx={x} cy={y} r={hover === i ? 4 : 2.5} fill="var(--panel)" stroke="var(--accent)" strokeWidth="2" />
                <text x={x} y={H + 16} textAnchor="middle" fontSize="10" fill="var(--mute)">{MONTHS[i]}</text>
              </g>
            ))}
          </svg>
        </section>
        <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <h3 className="text-[13.5px] font-medium text-[var(--strong)]">Pipeline by stage</h3>
          <div className="mt-3 space-y-2.5">
            {byStage.map(({ s, v }) => (
              <div key={s}>
                <div className="flex items-center justify-between text-[12px]"><span className="text-[var(--fg)]">{s}</span><span className="font-mono tabular-nums text-[var(--mute)]">{money(v)}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--sub)]">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(v / maxStage) * 100}%`, background: TONE[s] || 'var(--mute)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <h3 className="text-[13.5px] font-medium text-[var(--strong)]">Pipeline by owner</h3>
          <ol className="mt-2 divide-y divide-[var(--line)]">
            {owners.map(({ m, v }, i) => (
              <li key={m.id} className="flex items-center gap-2.5 py-2 text-[13px]">
                <span className="w-4 text-[12px] text-[var(--faint)]">{i + 1}</span>
                <Avatar name={m.name} color={m.color} size={20} />
                <span className="min-w-0 flex-1 truncate text-[var(--strong)]">{m.name}</span>
                <span className="font-mono text-[12px] tabular-nums text-[var(--fg)]">{money(v)}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <h3 className="text-[13.5px] font-medium text-[var(--strong)]">Closing soon</h3>
          <ul className="mt-2 divide-y divide-[var(--line)]">
            {open
              .slice()
              .sort((a, b) => a.close.localeCompare(b.close))
              .slice(0, 5)
              .map((o) => (
                <li key={o.id}>
                  <button onClick={() => crm.openRecord({ kind: 'opportunity', id: o.id })} className="flex w-full items-center gap-2 py-2 text-left text-[13px] hover:text-[var(--accent)]">
                    <span className="min-w-0 flex-1 truncate text-[var(--strong)]">{o.name}</span>
                    <span className="font-mono text-[12px] tabular-nums text-[var(--fg)]">{money(o.amount)}</span>
                    <span className="w-20 text-right text-[12px] text-[var(--mute)]">{relDay(o.close)}</span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
