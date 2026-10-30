import { useState, type KeyboardEvent } from 'react';
import { CalendarDays, GripVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MEMBERS, STAGES, type Opportunity, type Stage } from './data';
import { useCrm } from './store';
import { Avatar, Logo, TONE, money, relDay } from './ui';

export function KanbanView({ rows, onNew }: { rows: Opportunity[]; onNew: (stage: Stage) => void }) {
  const crm = useCrm();
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);

  const move = (id: string, stage: Stage) => {
    const o = crm.opps.find((x) => x.id === id);
    if (!o || o.stage === stage) return;
    crm.setOpps((all) => all.map((x) => (x.id === id ? { ...x, stage, probability: stage === 'Customer' ? 100 : x.probability } : x)));
    crm.log(id, `Stage changed from ${o.stage} to ${stage}`, 'stage');
    crm.toast(`${o.name} moved to ${stage}`);
  };

  const keyMove = (e: KeyboardEvent, o: Opportunity) => {
    const i = STAGES.indexOf(o.stage);
    if (e.key === 'ArrowRight' && i < STAGES.length - 1) {
      e.preventDefault();
      move(o.id, STAGES[i + 1]);
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      move(o.id, STAGES[i - 1]);
    } else if (e.key === 'Enter') crm.openRecord({ kind: 'opportunity', id: o.id });
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto overscroll-contain [scrollbar-width:thin]">
      <div className="flex h-full min-w-max gap-0 px-2 pb-3">
        {STAGES.map((stage) => {
          const cards = rows.filter((o) => o.stage === stage);
          const total = cards.reduce((s, o) => s + o.amount, 0);
          const tone = TONE[stage];
          return (
            <section
              key={stage}
              aria-label={`${stage}, ${cards.length} opportunities`}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(stage);
              }}
              onDragLeave={() => setOver((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || drag;
                if (id) move(id, stage);
                setDrag(null);
                setOver(null);
              }}
              className={cn('flex w-[252px] shrink-0 flex-col border-r border-[var(--line)] px-2 transition-colors last:border-r-0', over === stage && 'bg-[var(--accent-soft)]')}
            >
              <header className="sticky top-0 z-10 flex h-10 items-center gap-2 bg-[var(--bg)] px-1">
                <span className="inline-flex h-[20px] items-center gap-1.5 rounded-[4px] px-1.5 text-[12px] font-medium" style={tone ? { color: tone, background: `${tone}1f` } : { background: 'var(--hover)' }}>
                  {stage}
                </span>
                <span className="text-[12px] text-[var(--mute)]">{cards.length}</span>
                <span className="ml-auto font-mono text-[11.5px] tabular-nums text-[var(--mute)]">{money(total)}</span>
              </header>
              <div className="flex flex-col gap-2 pb-2">
                {cards.map((o) => {
                  const c = crm.companies.find((x) => x.id === o.companyId);
                  const p = crm.people.find((x) => x.id === o.poc);
                  const m = MEMBERS.find((x) => x.id === o.owner) ?? MEMBERS[0];
                  return (
                    <article
                      key={o.id}
                      draggable
                      tabIndex={0}
                      aria-label={`${o.name}, ${money(o.amount)}. Arrow keys move between stages, Enter opens.`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', o.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDrag(o.id);
                      }}
                      onDragEnd={() => {
                        setDrag(null);
                        setOver(null);
                      }}
                      onKeyDown={(e) => keyMove(e, o)}
                      onClick={() => crm.openRecord({ kind: 'opportunity', id: o.id })}
                      className={cn(
                        'group cursor-grab rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2.5 text-[13px] transition-all hover:border-[var(--line2)] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:cursor-grabbing',
                        drag === o.id && 'rotate-1 opacity-50',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {c && <Logo company={c} size={18} />}
                        <p className="min-w-0 flex-1 font-medium leading-snug text-[var(--strong)]">{o.name}</p>
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-[var(--faint)] opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <dl className="mt-2 space-y-1.5 text-[12.5px] text-[var(--fg)]">
                        <div className="flex items-center justify-between gap-2">
                          <dt className="sr-only">Amount</dt>
                          <dd className="font-medium tabular-nums text-[var(--strong)]">{money(o.amount, true)}</dd>
                          <dd className="flex items-center gap-1 text-[var(--mute)]">
                            <CalendarDays className="h-3 w-3" /> {relDay(o.close)}
                          </dd>
                        </div>
                        {p && (
                          <div className="flex items-center gap-1.5 text-[var(--mute)]">
                            <Avatar name={p.name} size={16} />
                            <span className="truncate text-[var(--fg)]">{p.name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[var(--mute)]">
                            <Avatar name={m.name} color={m.color} size={16} />
                            {m.name.split(' ')[0]}
                          </span>
                          <span className="h-1 w-16 overflow-hidden rounded-full bg-[var(--sub)]" title={`${o.probability}% probability`}>
                            <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${o.probability}%` }} />
                          </span>
                        </div>
                      </dl>
                    </article>
                  );
                })}
                <button onClick={() => onNew(stage)} className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-[var(--mute)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--strong)]">
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
