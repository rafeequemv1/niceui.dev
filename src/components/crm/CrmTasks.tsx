import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, CalendarClock, Check, CircleDollarSign, Plus, UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TaskGroup = 'overdue' | 'today' | 'upcoming';
export type TaskLink = { kind: 'person' | 'company' | 'deal'; label: string };
export type Assignee = { name: string; initials: string; color: string };

export type CrmTask = {
  id: string;
  title: string;
  group: TaskGroup;
  due: string;
  assignee: Assignee;
  links: TaskLink[];
  done?: boolean;
};

export type CrmTasksProps = {
  tasks: CrmTask[];
  onChange: (tasks: CrmTask[]) => void;
  /** Who new tasks are assigned to. */
  me: Assignee;
  /** Drives the quick-add box from outside (the demo's auto-play); `submit` adds the task. */
  autoType?: { text: string; submit?: boolean };
  className?: string;
};

const GROUPS: { id: TaskGroup; label: string; tint: string }[] = [
  { id: 'overdue', label: 'Overdue', tint: 'text-rose-300' },
  { id: 'today', label: 'Today', tint: 'text-brand-300' },
  { id: 'upcoming', label: 'Upcoming', tint: 'text-ink-300' },
];

const LINK_ICON = { person: UserRound, company: Building2, deal: CircleDollarSign } as const;
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Turns "call Ana tomorrow 3pm" into a title plus a due label and group. */
export function parseDue(text: string): { title: string; due: string; group: TaskGroup } | null {
  let rest = ` ${text} `;
  let day: string | null = null;
  let group: TaskGroup = 'upcoming';
  const take = (re: RegExp) => {
    const m = rest.match(re);
    if (m) rest = rest.replace(m[0], ' ');
    return m;
  };
  let m = take(/\s(today|tonight)\s/i);
  if (m) {
    day = 'Today';
    group = 'today';
  } else if ((m = take(/\s(tomorrow|tmrw)\s/i))) day = 'Tomorrow';
  else if ((m = take(/\s(yesterday)\s/i))) {
    day = 'Yesterday';
    group = 'overdue';
  } else if ((m = take(/\snext week\s/i))) day = 'Next week';
  else if ((m = take(/\sin (\d+) days?\s/i))) day = `In ${m[1]} days`;
  else if ((m = take(/\s(sun|mon|tue|wed|thu|fri|sat)[a-z]*\s/i))) day = DAY_NAMES[DAYS.indexOf(m[1].toLowerCase())];

  let time: string | null = null;
  const t = take(/\s(?:at\s)?(\d{1,2})(?::(\d{2}))?\s?(am|pm)\s/i) || take(/\s(?:at\s)?(\d{1,2}):(\d{2})\s/i);
  if (t) {
    let h = Number(t[1]);
    const min = t[2] ?? '00';
    const ap = t[3]?.toLowerCase();
    if (!ap) {
      const suffix = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      time = `${h}:${min} ${suffix}`;
    } else time = `${h % 12 || 12}:${min} ${ap.toUpperCase()}`;
    if (!day) {
      day = 'Today';
      group = 'today';
    }
  }
  if (!day) return null;
  const title = rest.replace(/\s+/g, ' ').trim();
  return { title, due: time ? `${day} ${time}` : day, group };
}

function Avatar({ a }: { a: Assignee }) {
  return (
    <span title={a.name} className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: a.color }}>
      {a.initials}
    </span>
  );
}

function TaskRow({ task, fresh, onToggle }: { task: CrmTask; fresh: boolean; onToggle: () => void }) {
  return (
    <li className={cn('group flex items-start gap-3 rounded-xl px-2.5 py-2 transition-all duration-500', fresh ? 'bg-brand-500/[0.08] ring-1 ring-brand-400/30 animate-fade-up' : 'hover:bg-white/[0.03]', task.done && 'opacity-60')}>
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={!!task.done}
        aria-label={`Complete “${task.title}”`}
        className={cn('focus-ring mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition-all duration-300 ease-spring', task.done ? 'scale-110 border-emerald-400 bg-emerald-400 text-ink-950' : 'border-ink-500 text-transparent hover:border-brand-300')}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn('relative w-fit max-w-full truncate text-sm text-ink-100 transition-colors', task.done && 'text-ink-500')}>
          {task.title}
          <span className={cn('absolute left-0 top-1/2 h-px bg-ink-500 transition-all duration-500 ease-smooth', task.done ? 'w-full' : 'w-0')} />
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-1 text-[11px]', task.group === 'overdue' && !task.done ? 'text-rose-300' : 'text-ink-500')}>
            <CalendarClock className="h-3 w-3" /> {task.due}
          </span>
          {task.links.map((l) => {
            const Icon = LINK_ICON[l.kind];
            return (
              <span key={l.label} className="inline-flex max-w-[150px] items-center gap-1 truncate rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[11px] text-ink-300">
                <Icon className="h-3 w-3 shrink-0 text-ink-500" />
                <span className="truncate">{l.label}</span>
              </span>
            );
          })}
        </div>
      </div>
      <Avatar a={task.assignee} />
    </li>
  );
}

export function CrmTasks({ tasks, onChange, me, autoType, className }: CrmTasksProps) {
  const [draft, setDraft] = useState('');
  const [fresh, setFresh] = useState<string | null>(null);
  const parsed = draft.trim() ? parseDue(draft) : null;

  const latest = useRef({ tasks, onChange, me });
  latest.current = { tasks, onChange, me };

  const addText = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const p = parseDue(text);
    const id = `t${Date.now()}`;
    const { tasks: list, onChange: emit, me: owner } = latest.current;
    emit([{ id, title: p?.title || text, group: p?.group ?? 'upcoming', due: p?.due ?? 'No date', assignee: owner, links: [] }, ...list]);
    setFresh(id);
    setDraft('');
  };

  useEffect(() => {
    if (!autoType) return;
    if (autoType.submit) addText(autoType.text);
    else setDraft(autoType.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoType]);

  const add = (e?: FormEvent) => {
    e?.preventDefault();
    addText(draft);
  };

  const toggle = (id: string) => onChange(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const open = tasks.filter((t) => !t.done).length;

  return (
    <div className={cn('w-full max-w-xl rounded-2xl bg-ink-900 p-4 shadow-card sm:p-5', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-50">Tasks</h3>
        <span className="font-mono text-[11px] tabular-nums text-ink-500">{open} open</span>
      </div>

      <form onSubmit={add} className="mt-3 flex items-center gap-2 rounded-xl bg-ink-950/60 px-2.5 py-1.5 ring-1 ring-white/[0.06] transition-shadow focus-within:ring-brand-400/50">
        <Plus className="h-4 w-4 shrink-0 text-ink-500" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task… try “call Ana tomorrow 3pm”"
          aria-label="New task"
          className="h-7 min-w-0 flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
        />
        {parsed && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-500/15 px-1.5 py-0.5 text-[11px] font-medium text-brand-200 animate-scale-in">
            <CalendarClock className="h-3 w-3" /> {parsed.due}
          </span>
        )}
        <button type="submit" disabled={!draft.trim()} className="focus-ring hidden h-7 shrink-0 rounded-lg bg-brand-500 px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-400 disabled:bg-white/5 disabled:text-ink-500 sm:block">
          Add
        </button>
      </form>

      <div className="mt-4 space-y-4">
        {GROUPS.map((g) => {
          const list = tasks.filter((t) => t.group === g.id);
          if (!list.length) return null;
          return (
            <section key={g.id}>
              <p className={cn('mb-1.5 flex items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-wider', g.tint)}>
                {g.label}
                <span className="font-mono text-ink-500">{list.filter((t) => !t.done).length}</span>
              </p>
              <ul className="space-y-0.5">
                {list.map((t) => (
                  <TaskRow key={t.id} task={t} fresh={fresh === t.id} onToggle={() => toggle(t.id)} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

const PEOPLE: Record<string, Assignee> = {
  lena: { name: 'Lena Brooks', initials: 'LB', color: '#0ea5e9' },
  marcus: { name: 'Marcus Webb', initials: 'MW', color: '#8b5cf6' },
  priya: { name: 'Priya Raman', initials: 'PR', color: '#10b981' },
};

const START: CrmTask[] = [
  { id: 't1', title: 'Send revised MSA to legal', group: 'overdue', due: 'Yesterday 5:00 PM', assignee: PEOPLE.lena, links: [{ kind: 'company', label: 'Halcyon Freight' }] },
  { id: 't2', title: 'Prep pilot kickoff agenda', group: 'today', due: 'Today 2:30 PM', assignee: PEOPLE.marcus, links: [{ kind: 'deal', label: 'Halcyon pilot' }, { kind: 'person', label: 'Sofia Andersen' }] },
  { id: 't3', title: 'Follow up on security questionnaire', group: 'today', due: 'Today 4:00 PM', assignee: PEOPLE.lena, links: [{ kind: 'company', label: 'Lumenfield' }] },
  { id: 't4', title: 'Quarterly business review deck', group: 'upcoming', due: 'Thu 10:00 AM', assignee: PEOPLE.priya, links: [{ kind: 'company', label: 'Northpine Health' }] },
];

export function CrmTasksDemo() {
  const [tasks, setTasks] = useState(START);
  const [typed, setTyped] = useState<CrmTasksProps['autoType']>(undefined);
  const timers = useRef<number[]>([]);

  // Auto-play: type a task with a natural-language date, add it, then tick one off.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const text = 'Send proposal to Ana tomorrow 3pm';
    [...text].forEach((_, i) => timers.current.push(window.setTimeout(() => setTyped({ text: text.slice(0, i + 1) }), 600 + i * 34)));
    timers.current.push(window.setTimeout(() => setTyped({ text, submit: true }), 600 + text.length * 34 + 450));
    timers.current.push(window.setTimeout(() => setTasks((list) => list.map((t) => (t.id === 't2' ? { ...t, done: true } : t))), 3600));
    const all = timers.current;
    return () => all.forEach(clearTimeout);
  }, []);

  return <CrmTasks tasks={tasks} onChange={setTasks} me={PEOPLE.lena} autoType={typed} />;
}
