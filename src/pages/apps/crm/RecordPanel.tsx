import { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarClock, Check, CheckSquare, ChevronRight, CircleDot, FileText, Mail, MessageSquare, PhoneCall, Plus, Sparkles, Star, StickyNote, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ME, MEMBERS, type Target } from './data';
import { COMPANY_FIELDS, DIRECT, FieldEditor, FieldValue, OPP_FIELDS, PEOPLE_FIELDS, TextEditor, type Field } from './fields';
import { sameTarget, useCrm, type Crm } from './store';
import { Avatar, Logo, Pill, btn, fmtDate, money, relDay } from './ui';

type Tab = 'timeline' | 'tasks' | 'notes' | 'emails';

function useRecord(crm: Crm, t: Target) {
  if (t.kind === 'person') {
    const r = crm.people.find((p) => p.id === t.id);
    return r ? { name: r.name, data: r as unknown as Record<string, unknown>, fields: PEOPLE_FIELDS } : null;
  }
  if (t.kind === 'company') {
    const r = crm.companies.find((c) => c.id === t.id);
    return r ? { name: r.name, data: r as unknown as Record<string, unknown>, fields: COMPANY_FIELDS } : null;
  }
  const r = crm.opps.find((o) => o.id === t.id);
  return r ? { name: r.name, data: r as unknown as Record<string, unknown>, fields: OPP_FIELDS } : null;
}

const ICON = { email: Mail, call: PhoneCall, meeting: CalendarClock, note: StickyNote, stage: CircleDot, created: Sparkles, edit: CircleDot, task: CheckSquare } as const;

function baseTimeline(crm: Crm, t: Target, name: string) {
  const first = name.split(' ')[0];
  const owner = MEMBERS[(t.id.length + name.length) % MEMBERS.length];
  const items: { kind: keyof typeof ICON; text: string; when: string; detail?: string }[] = [];
  if (t.kind === 'person') {
    items.push(
      { kind: 'email', text: `${owner.name} sent “Next steps for the rollout”`, when: '2026-10-29', detail: `Hi ${first}, attaching the plan we discussed and the security pack…` },
      { kind: 'meeting', text: `Meeting with ${first}: quarterly review`, when: '2026-10-24', detail: '45 min · Google Meet · 3 attendees' },
      { kind: 'call', text: `${owner.name} logged a call`, when: '2026-10-17', detail: 'Talked budget timing; decision expected after the board meeting.' },
      { kind: 'created', text: `${name} was created from an email import`, when: '2026-09-12' },
    );
  } else if (t.kind === 'company') {
    items.push(
      { kind: 'stage', text: 'Ideal customer profile matched', when: '2026-10-27', detail: 'Industry, size and stack all fit the target segment.' },
      { kind: 'email', text: `${owner.name} replied to the procurement thread`, when: '2026-10-22' },
      { kind: 'note', text: 'Account plan updated', when: '2026-10-08', detail: 'Expansion path: analytics seats → data add-on → enterprise.' },
      { kind: 'created', text: `${name} was enriched automatically`, when: '2026-08-30' },
    );
  } else {
    const o = crm.opps.find((x) => x.id === t.id);
    items.push(
      { kind: 'stage', text: `Stage set to ${o?.stage ?? 'New'}`, when: '2026-10-26' },
      { kind: 'meeting', text: 'Demo with the buying committee', when: '2026-10-20', detail: '60 min · 5 attendees · recording attached' },
      { kind: 'email', text: `${owner.name} sent the pricing proposal`, when: '2026-10-15' },
      { kind: 'created', text: 'Opportunity created', when: '2026-09-28' },
    );
  }
  return items;
}

function emailsFor(name: string) {
  const first = name.split(' ')[0];
  return [
    { id: 'e1', subject: 'Next steps for the rollout', from: ME.name, when: '2026-10-29', snippet: `Hi ${first}, attaching the plan we discussed and the security pack.`, body: `Hi ${first},\n\nAttaching the rollout plan and our security pack. If the timeline works for your team, we can lock the kickoff for the week of Nov 16.\n\nBest,\nAva` },
    { id: 'e2', subject: 'Re: Pricing for annual plan', from: name, when: '2026-10-21', snippet: 'Thanks, this looks close. Could you share the volume tier at 50 seats?', body: 'Thanks, this looks close. Could you share the volume tier at 50 seats? Finance wants to see both options before Friday.' },
    { id: 'e3', subject: 'Intro: Meridian × your team', from: MEMBERS[1].name, when: '2026-10-03', snippet: `Great to meet you ${first}! Looping in Ava who leads your account.`, body: `Great to meet you ${first}! Looping in Ava who leads your account and will set up a working session.` },
  ];
}

export function RecordPanel({ target, onClose }: { target: Target; onClose: () => void }) {
  const crm = useCrm();
  const rec = useRecord(crm, target);
  const [tab, setTab] = useState<Tab>('timeline');
  const [editing, setEditing] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [openMail, setOpenMail] = useState<string | null>('e1');

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && !editing && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose, editing]);
  useEffect(() => {
    setTab('timeline');
    setEditing(null);
  }, [target.id]);

  const tasks = crm.tasks.filter((x) => sameTarget(x.target, target));
  const notes = crm.notes.filter((x) => sameTarget(x.target, target));
  const emails = useMemo(() => emailsFor(rec?.name ?? ''), [rec?.name]);
  if (!rec) return null;

  const fav = crm.favorites.some((f) => sameTarget(f, target));
  const update = (key: string, value: unknown) => {
    const label = rec.fields.find((f) => f.key === key)?.label ?? key;
    if (target.kind === 'person') crm.setPeople((all) => all.map((x) => (x.id === target.id ? { ...x, [key]: value } : x)));
    else if (target.kind === 'company') crm.setCompanies((all) => all.map((x) => (x.id === target.id ? { ...x, [key]: value } : x)));
    else crm.setOpps((all) => all.map((x) => (x.id === target.id ? { ...x, [key]: value } : x)));
    if (key !== 'name') crm.log(target.id, `You updated ${label}`, 'edit');
  };

  const company = target.kind === 'person' ? crm.companies.find((c) => c.id === rec.data.companyId) : target.kind === 'opportunity' ? crm.companies.find((c) => c.id === rec.data.companyId) : crm.companies.find((c) => c.id === target.id);
  const subtitle =
    target.kind === 'person' ? `${String(rec.data.title)}${company ? ` · ${company.name}` : ''}` : target.kind === 'company' ? String(rec.data.domain) : `${money(Number(rec.data.amount), true)} · closes ${relDay(String(rec.data.close))}`;
  const session = crm.activity[target.id] ?? [];
  const timeline = baseTimeline(crm, target, rec.name);

  const tabs: { id: Tab; label: string; n?: number; icon: typeof Mail }[] = [
    { id: 'timeline', label: 'Timeline', icon: CircleDot },
    { id: 'tasks', label: 'Tasks', n: tasks.length, icon: CheckSquare },
    { id: 'notes', label: 'Notes', n: notes.length, icon: StickyNote },
    { id: 'emails', label: 'Emails', n: emails.length, icon: Mail },
  ];

  return (
    <aside role="dialog" aria-label={rec.name} className="absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-[var(--line)] bg-[var(--panel)] animate-slide-in-right sm:w-[460px]" style={{ boxShadow: 'var(--pop)' }}>
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[var(--line)] px-3">
        <span className="text-[12px] capitalize text-[var(--mute)]">{target.kind === 'opportunity' ? 'Opportunity' : target.kind}</span>
        <ChevronRight className="h-3 w-3 text-[var(--faint)]" />
        <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--fg)]">{rec.name}</span>
        <button onClick={() => crm.toggleFavorite(target)} aria-pressed={fav} aria-label={fav ? 'Remove from favorites' : 'Add to favorites'} className={btn}>
          <Star className={cn('h-3.5 w-3.5', fav && 'fill-[#e8a400] text-[#e8a400]')} />
        </button>
        <button onClick={onClose} aria-label="Close record" className={btn}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="px-5 pb-4 pt-5">
          <div className="flex items-start gap-3">
            {target.kind === 'person' ? <Avatar name={rec.name} size={40} /> : company ? <Logo company={company} size={40} /> : null}
            <div className="min-w-0 flex-1">
              {editing === 'name' ? (
                <TextEditor initial={rec.name} onCommit={(s) => { update('name', s || rec.name); setEditing(null); }} onCancel={() => setEditing(null)} className="h-9 text-[17px] font-semibold" />
              ) : (
                <button onClick={() => setEditing('name')} className="block max-w-full truncate rounded-md text-left text-[18px] font-semibold tracking-[-0.01em] text-[var(--strong)] hover:bg-[var(--hover)]">
                  {rec.name}
                </button>
              )}
              <p className="mt-0.5 truncate text-[13px] text-[var(--mute)]">{subtitle}</p>
            </div>
            {target.kind === 'opportunity' && <Pill value={String(rec.data.stage)} />}
          </div>
        </div>

        <dl className="border-y border-[var(--line)] px-3 py-2">
          {rec.fields.map((f: Field) => (
            <div key={f.key} className="relative flex min-h-[32px] items-center gap-2 rounded-md px-2 hover:bg-[var(--hover)]">
              <dt className="flex w-[128px] shrink-0 items-center gap-1.5 text-[13px] text-[var(--mute)]">
                <f.icon className="h-3.5 w-3.5" /> {f.label}
              </dt>
              <dd
                className="flex min-w-0 flex-1 cursor-pointer items-center text-[13px] text-[var(--fg)]"
                onClick={() => !DIRECT.includes(f.type) && setEditing(f.key)}
                onKeyDown={(e) => e.key === 'Enter' && !DIRECT.includes(f.type) && setEditing(f.key)}
                tabIndex={DIRECT.includes(f.type) ? -1 : 0}
                role="button"
                aria-label={`Edit ${f.label}`}
              >
                <FieldValue field={f} value={rec.data[f.key]} onChange={(v) => update(f.key, v)} />
              </dd>
              {editing === f.key && (
                <div className="absolute left-[136px] top-0 z-40">
                  <FieldEditor field={f} value={rec.data[f.key]} onCommit={(v) => { update(f.key, v); setEditing(null); }} onCancel={() => setEditing(null)} />
                </div>
              )}
            </div>
          ))}
        </dl>

        {target.kind === 'company' && (
          <div className="border-b border-[var(--line)] px-5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[var(--mute)]"><Building2 className="h-3.5 w-3.5" /> People at {rec.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {crm.people.filter((p) => p.companyId === target.id).map((p) => (
                <button key={p.id} onClick={() => crm.openRecord({ kind: 'person', id: p.id })} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sub)] py-0.5 pl-0.5 pr-2 text-[12.5px] hover:bg-[var(--hover)]">
                  <Avatar name={p.name} size={18} /> {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div role="tablist" className="sticky top-0 z-10 flex gap-1 border-b border-[var(--line)] bg-[var(--panel)] px-3">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn('relative flex h-10 items-center gap-1.5 px-2 text-[13px] transition-colors', tab === t.id ? 'text-[var(--strong)]' : 'text-[var(--mute)] hover:text-[var(--fg)]')}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
              {t.n !== undefined && <span className="rounded bg-[var(--sub)] px-1 text-[11px] text-[var(--mute)]">{t.n}</span>}
              {tab === t.id && <span className="absolute inset-x-1 -bottom-px h-[2px] rounded-full bg-[var(--strong)]" />}
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          {tab === 'timeline' && (
            <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-[var(--line)]">
              {session.map((a) => (
                <li key={a.id} className="relative flex gap-3 animate-fade-up">
                  <span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"><Check className="h-3 w-3" /></span>
                  <div className="min-w-0 pt-0.5"><p className="text-[13px] text-[var(--strong)]">{a.text}</p><p className="text-[12px] text-[var(--mute)]">Just now</p></div>
                </li>
              ))}
              {timeline.map((a, i) => {
                const Icon = ICON[a.kind];
                return (
                  <li key={i} className="relative flex gap-3">
                    <span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)] text-[var(--mute)]"><Icon className="h-3 w-3" /></span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[13px] text-[var(--strong)]">{a.text}</p>
                      <p className="text-[12px] text-[var(--mute)]">{relDay(a.when)}</p>
                      {a.detail && <p className="mt-1.5 rounded-md border border-[var(--line)] bg-[var(--sub)] px-2.5 py-2 text-[12.5px] leading-relaxed text-[var(--fg)]">{a.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {tab === 'tasks' && (
            <div className="space-y-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTask.trim()) return;
                  crm.setTasks((all) => [{ id: `t${Date.now()}`, title: newTask.trim(), due: '2026-11-04', done: false, assignee: ME.id, target }, ...all]);
                  crm.log(target.id, `Task “${newTask.trim()}” created`, 'task');
                  setNewTask('');
                }}
                className="mb-2 flex items-center gap-2 rounded-md border border-[var(--line)] px-2"
              >
                <Plus className="h-3.5 w-3.5 text-[var(--mute)]" />
                <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a task and press Enter" aria-label="New task" className="h-8 min-w-0 flex-1 bg-transparent text-[13px] text-[var(--strong)] outline-none placeholder:text-[var(--faint)]" />
              </form>
              {tasks.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-[var(--hover)]">
                  <input type="checkbox" checked={t.done} onChange={() => crm.setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className="h-3.5 w-3.5 accent-[var(--accent)]" />
                  <span className={cn('min-w-0 flex-1 truncate text-[13px]', t.done ? 'text-[var(--faint)] line-through' : 'text-[var(--strong)]')}>{t.title}</span>
                  <span className="text-[12px] text-[var(--mute)]">{relDay(t.due)}</span>
                </label>
              ))}
              {!tasks.length && <p className="py-6 text-center text-[13px] text-[var(--mute)]">No tasks yet.</p>}
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-2">
              {noteDraft === null ? (
                <button onClick={() => setNoteDraft('')} className={cn(btn, 'border border-dashed border-[var(--line2)]')}><Plus className="h-3.5 w-3.5" /> New note</button>
              ) : (
                <div className="rounded-lg border border-[var(--accent)] p-2">
                  <textarea autoFocus value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={3} placeholder="Write a note…" aria-label="Note" className="w-full resize-none bg-transparent text-[13px] text-[var(--strong)] outline-none placeholder:text-[var(--faint)]" />
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setNoteDraft(null)} className={btn}>Cancel</button>
                    <button
                      onClick={() => {
                        if (noteDraft.trim()) {
                          crm.setNotes((all) => [{ id: `n${Date.now()}`, title: noteDraft.trim().split('\n')[0].slice(0, 48), body: noteDraft.trim(), target, author: ME.id, updated: '2026-10-30' }, ...all]);
                          crm.log(target.id, 'You added a note', 'note');
                        }
                        setNoteDraft(null);
                      }}
                      className="inline-flex h-7 items-center rounded-md bg-[var(--accent)] px-2.5 text-[13px] font-medium text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
              {notes.map((n) => (
                <article key={n.id} className="rounded-lg border border-[var(--line)] p-3">
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--strong)]"><FileText className="h-3.5 w-3.5 text-[var(--mute)]" /> {n.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--fg)]">{n.body}</p>
                  <p className="mt-2 text-[11.5px] text-[var(--mute)]">{MEMBERS.find((m) => m.id === n.author)?.name} · {fmtDate(n.updated)}</p>
                </article>
              ))}
            </div>
          )}

          {tab === 'emails' && (
            <div className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)]">
              {emails.map((m) => (
                <div key={m.id}>
                  <button onClick={() => setOpenMail(openMail === m.id ? null : m.id)} aria-expanded={openMail === m.id} className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-[var(--hover)]">
                    <Avatar name={m.from} size={22} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="truncate text-[13px] font-medium text-[var(--strong)]">{m.subject}</span><span className="ml-auto shrink-0 text-[11.5px] text-[var(--mute)]">{relDay(m.when)}</span></span>
                      <span className="block truncate text-[12.5px] text-[var(--mute)]">{m.from} · {m.snippet}</span>
                    </span>
                  </button>
                  {openMail === m.id && <p className="whitespace-pre-line border-t border-[var(--line)] bg-[var(--sub)] px-3 py-3 text-[12.5px] leading-relaxed text-[var(--fg)] animate-fade-in">{m.body}</p>}
                </div>
              ))}
              <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-[var(--mute)]"><MessageSquare className="h-3.5 w-3.5" /> Synced from {ME.name.split(' ')[0]}’s inbox</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
