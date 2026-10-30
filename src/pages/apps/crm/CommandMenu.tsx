import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CheckSquare, CornerDownLeft, LayoutDashboard, Moon, PanelLeft, Plus, Search, StickyNote, Target, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCrm, type ObjectKey } from './store';
import { Avatar, Logo } from './ui';

type Item = { id: string; group: string; label: string; hint?: string; icon: JSX.Element; run: () => void };

export function CommandMenu({ onClose, onNew, onTheme, onCollapse }: { onClose: () => void; onNew: (o: ObjectKey) => void; onTheme: () => void; onCollapse: () => void }) {
  const crm = useCrm();
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const icon = (I: typeof Users) => <I className="h-4 w-4 text-[var(--mute)]" />;

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = (
      [
        ['people', 'People', Users],
        ['companies', 'Companies', Building2],
        ['opportunities', 'Opportunities', Target],
        ['tasks', 'Tasks', CheckSquare],
        ['notes', 'Notes', StickyNote],
        ['workflows', 'Workflows', Zap],
        ['dashboard', 'Dashboard', LayoutDashboard],
      ] as const
    ).map(([k, label, I]) => ({ id: `go-${k}`, group: 'Navigate', label: `Go to ${label}`, icon: icon(I), run: () => crm.go(k) }));
    const actions: Item[] = [
      { id: 'new-person', group: 'Actions', label: 'Create person', hint: 'N then P', icon: icon(Plus), run: () => onNew('people') },
      { id: 'new-company', group: 'Actions', label: 'Create company', icon: icon(Plus), run: () => onNew('companies') },
      { id: 'new-opp', group: 'Actions', label: 'Create opportunity', icon: icon(Plus), run: () => onNew('opportunities') },
      { id: 'theme', group: 'Actions', label: 'Toggle dark mode', icon: icon(Moon), run: onTheme },
      { id: 'collapse', group: 'Actions', label: 'Toggle sidebar', icon: icon(PanelLeft), run: onCollapse },
    ];
    const people: Item[] = crm.people.map((p) => ({ id: p.id, group: 'People', label: p.name, hint: p.email, icon: <Avatar name={p.name} size={18} />, run: () => crm.openRecord({ kind: 'person', id: p.id }) }));
    const companies: Item[] = crm.companies.map((c) => ({ id: c.id, group: 'Companies', label: c.name, hint: c.domain, icon: <Logo company={c} size={18} />, run: () => crm.openRecord({ kind: 'company', id: c.id }) }));
    const opps: Item[] = crm.opps.map((o) => ({ id: o.id, group: 'Opportunities', label: o.name, hint: o.stage, icon: icon(Target), run: () => crm.openRecord({ kind: 'opportunity', id: o.id }) }));
    const s = q.trim().toLowerCase();
    if (!s) return [...nav, ...actions, ...people.slice(0, 4), ...companies.slice(0, 3)];
    return [...people, ...companies, ...opps, ...nav, ...actions].filter((i) => (i.label + ' ' + (i.hint ?? '')).toLowerCase().includes(s)).slice(0, 30);
  }, [crm, q, onNew, onTheme, onCollapse]);

  useEffect(() => setHi(0), [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [hi]);

  const run = (i: Item | undefined) => {
    if (!i) return;
    onClose();
    i.run();
  };

  let lastGroup = '';
  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center bg-black/25 px-3 pt-[12vh] animate-fade-in sm:pt-24" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label="Command menu" className="w-full max-w-[560px] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] animate-scale-in" style={{ boxShadow: 'var(--pop)' }}>
        <div className="flex items-center gap-2 border-b border-[var(--line)] px-3.5">
          <Search className="h-4 w-4 text-[var(--mute)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHi((h) => Math.min(items.length - 1, h + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHi((h) => Math.max(0, h - 1));
              } else if (e.key === 'Enter') run(items[hi]);
              else if (e.key === 'Escape') onClose();
            }}
            placeholder="Search records or type a command…"
            aria-label="Search"
            role="combobox"
            aria-expanded
            aria-controls="mrd-cmd-list"
            className="h-12 min-w-0 flex-1 bg-transparent text-[14px] text-[var(--strong)] outline-none placeholder:text-[var(--faint)]"
          />
          <kbd className="rounded border border-[var(--line)] px-1.5 font-mono text-[10.5px] text-[var(--mute)]">esc</kbd>
        </div>
        <div ref={list} id="mrd-cmd-list" role="listbox" className="max-h-[360px] overflow-y-auto p-1.5 [scrollbar-width:thin]">
          {items.map((i, n) => {
            const head = i.group !== lastGroup;
            lastGroup = i.group;
            return (
              <div key={i.id}>
                {head && <p className="px-2 pb-1 pt-2 text-[11.5px] font-medium text-[var(--mute)]">{i.group}</p>}
                <button
                  data-i={n}
                  role="option"
                  aria-selected={n === hi}
                  onMouseMove={() => setHi(n)}
                  onClick={() => run(i)}
                  className={cn('flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-[var(--strong)]', n === hi && 'bg-[var(--hover)]')}
                >
                  {i.icon}
                  <span className="min-w-0 flex-1 truncate">{i.label}</span>
                  {i.hint && <span className="hidden max-w-[45%] truncate text-[12px] text-[var(--mute)] sm:block">{i.hint}</span>}
                  {n === hi && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[var(--mute)]" />}
                </button>
              </div>
            );
          })}
          {!items.length && <p className="px-3 py-8 text-center text-[13px] text-[var(--mute)]">Nothing found for “{q}”.</p>}
        </div>
      </div>
    </div>
  );
}
