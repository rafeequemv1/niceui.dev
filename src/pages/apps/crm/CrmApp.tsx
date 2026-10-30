import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, ChevronDown, Columns3, Download, Filter, Kanban, List, Menu as MenuIcon, MoreHorizontal, Plus, Search, Star, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { COMPANIES, MEMBERS, ME, NOTES, OPPORTUNITIES, PEOPLE, TASKS, type Company, type Note, type Opportunity, type Person, type Stage, type Target, type Task } from './data';
import { COMPANY_FIELDS, OPP_FIELDS, PEOPLE_FIELDS, type Field } from './fields';
import { KanbanView } from './KanbanView';
import { RecordPanel } from './RecordPanel';
import { CommandMenu } from './CommandMenu';
import { OBJECTS, Sidebar } from './Sidebar';
import { CrmContext, sameTarget, type Activity, type Crm, type ObjectKey } from './store';
import { TableView, type Sort } from './TableView';
import { DashboardView, NotesView, TasksView, WorkflowsView } from './Views';
import { Avatar, Logo, Menu, MenuItem, THEMES, btn, btnPrimary, colorFor } from './ui';

type Rule = { id: string; label: string; test: (r: Record<string, unknown>) => boolean };
type ViewDef = { id: string; label: string; rules: Rule[] };

const RULES: Record<'people' | 'companies' | 'opportunities', Rule[]> = {
  people: [
    { id: 'cust', label: 'Lifecycle is Customer', test: (r) => r.lifecycle === 'Customer' },
    { id: 'lead', label: 'Lifecycle is Lead', test: (r) => r.lifecycle === 'Lead' },
    { id: 'hot', label: 'Intent ≥ 4', test: (r) => Number(r.intent) >= 4 },
    { id: 'mine', label: 'Owner is me', test: (r) => r.owner === ME.id },
  ],
  companies: [
    { id: 'saas', label: 'Industry is SaaS', test: (r) => r.industry === 'SaaS' },
    { id: 'fin', label: 'Industry is Fintech', test: (r) => r.industry === 'Fintech' },
    { id: 'icp', label: 'Ideal customer is Yes', test: (r) => Boolean(r.icp) },
    { id: 'big', label: 'ARR ≥ $5M', test: (r) => Number(r.arr) >= 5_000_000 },
  ],
  opportunities: [
    { id: 'prop', label: 'Stage is Proposal', test: (r) => r.stage === 'Proposal' },
    { id: 'big', label: 'Amount ≥ $100k', test: (r) => Number(r.amount) >= 100_000 },
    { id: 'mine', label: 'Owner is me', test: (r) => r.owner === ME.id },
    { id: 'soon', label: 'Close date before Dec 1', test: (r) => String(r.close) < '2026-12-01' },
  ],
};
const VIEWS: Record<'people' | 'companies' | 'opportunities', ViewDef[]> = {
  people: [
    { id: 'all', label: 'All people', rules: [] },
    { id: 'mine', label: 'My contacts', rules: [RULES.people[3]] },
    { id: 'customers', label: 'Customers', rules: [RULES.people[0]] },
    { id: 'hot', label: 'Hot leads', rules: [RULES.people[2]] },
  ],
  companies: [
    { id: 'all', label: 'All companies', rules: [] },
    { id: 'icp', label: 'Ideal customers', rules: [RULES.companies[2]] },
    { id: 'big', label: 'Enterprise accounts', rules: [RULES.companies[3]] },
  ],
  opportunities: [
    { id: 'all', label: 'All opportunities', rules: [] },
    { id: 'mine', label: 'My deals', rules: [RULES.opportunities[2]] },
    { id: 'big', label: 'Big deals', rules: [RULES.opportunities[1]] },
  ],
};

type Toast = { id: number; msg: string; action?: { label: string; run: () => void } };
const isRecordObject = (o: ObjectKey): o is 'people' | 'companies' | 'opportunities' => o === 'people' || o === 'companies' || o === 'opportunities';

export function CrmApp(_: { onNavigate?: (to: string) => void }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [obj, setObj] = useState<ObjectKey>('people');
  const [people, setPeopleS] = useState<Person[]>(PEOPLE);
  const [companies, setCompaniesS] = useState<Company[]>(COMPANIES);
  const [opps, setOppsS] = useState<Opportunity[]>(OPPORTUNITIES);
  const [tasks, setTasksS] = useState<Task[]>(TASKS);
  const [notes, setNotesS] = useState<Note[]>(NOTES);
  const [activity, setActivity] = useState<Record<string, Activity[]>>({});
  const [favorites, setFavorites] = useState<Target[]>([{ kind: 'company', id: 'c1' }, { kind: 'person', id: 'p3' }, { kind: 'opportunity', id: 'o7' }]);
  const [open, setOpen] = useState<Target | null>(null);
  const [cmd, setCmd] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [settings, setSettings] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<Record<string, string>>({ people: 'all', companies: 'all', opportunities: 'all' });
  const [rules, setRules] = useState<Record<string, Rule[]>>({ people: [], companies: [], opportunities: [] });
  const [sorts, setSorts] = useState<Record<string, Sort>>({ people: null, companies: null, opportunities: null });
  const [mode, setMode] = useState<'kanban' | 'table'>('kanban');
  const [menu, setMenu] = useState<'view' | 'filter' | 'sort' | 'options' | null>(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [autoEdit, setAutoEdit] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toast = useCallback((msg: string, action?: Toast['action']) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg, action }]);
    timers.current.push(window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 6000 : 3200));
  }, []);

  const go = useCallback((o: ObjectKey) => {
    setObj(o);
    setSelected(new Set());
    setMenu(null);
    setSearch('');
    setSearching(false);
    setDrawer(false);
  }, []);

  const crm: Crm = useMemo(
    () => ({
      people,
      companies,
      opps,
      tasks,
      notes,
      setPeople: setPeopleS,
      setCompanies: setCompaniesS,
      setOpps: setOppsS,
      setTasks: setTasksS,
      setNotes: setNotesS,
      activity,
      log: (id, text, kind = 'edit') => setActivity((a) => ({ ...a, [id]: [{ id: `${Date.now()}${Math.random()}`, at: 'now', text, kind }, ...(a[id] ?? [])].slice(0, 8) })),
      openRecord: (t) => {
        setOpen(t);
        setDrawer(false);
      },
      favorites,
      toggleFavorite: (t) => setFavorites((f) => (f.some((x) => sameTarget(x, t)) ? f.filter((x) => !sameTarget(x, t)) : [...f, t])),
      toast: (m) => toast(m),
      go,
    }),
    [people, companies, opps, tasks, notes, activity, favorites, toast, go],
  );

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmd((c) => !c);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  /* ——— records for the current object ——— */
  const objKey = isRecordObject(obj) ? obj : null;
  const source: { id: string; name: string }[] = obj === 'people' ? people : obj === 'companies' ? companies : obj === 'opportunities' ? opps : [];
  const fields: Field[] = obj === 'people' ? PEOPLE_FIELDS : obj === 'companies' ? COMPANY_FIELDS : OPP_FIELDS;
  const activeRules = objKey ? [...(VIEWS[objKey].find((v) => v.id === view[objKey])?.rules ?? []), ...rules[objKey]] : [];
  const sort = objKey ? sorts[objKey] : null;
  const rows = useMemo(() => {
    let r = source.filter((x) => activeRules.every((rule) => rule.test(x as unknown as Record<string, unknown>)));
    const s = search.trim().toLowerCase();
    if (s) r = r.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
    if (sort) {
      r = [...r].sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[sort.key];
        const bv = (b as unknown as Record<string, unknown>)[sort.key];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir;
        return String(av ?? '').localeCompare(String(bv ?? '')) * sort.dir;
      });
    }
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, activeRules.map((r) => r.id).join(), search, sort]);

  const update = (id: string, key: string, value: unknown) => {
    const apply = <T extends { id: string }>(all: T[]) => all.map((x) => (x.id === id ? { ...x, [key]: value } : x));
    if (obj === 'people') setPeopleS(apply);
    else if (obj === 'companies') setCompaniesS(apply);
    else if (obj === 'opportunities') setOppsS(apply);
    const label = key === 'name' ? 'Name' : fields.find((f) => f.key === key)?.label ?? key;
    crm.log(id, `You updated ${label}`);
  };

  const newRecord = (o: ObjectKey, stage: Stage = 'New') => {
    const id = `${o[0]}${Date.now()}`;
    if (o !== obj) go(o);
    if (o === 'people') {
      setPeopleS((all) => [{ id, name: '', email: '', phone: '', title: '', companyId: 'c1', city: '', lifecycle: 'Lead', intent: 3, lastContact: '2026-10-30', owner: ME.id }, ...all]);
      setAutoEdit(id);
    } else if (o === 'companies') {
      setCompaniesS((all) => [{ id, name: '', domain: '', industry: 'SaaS', employees: 10, arr: 0, city: '', owner: ME.id, icp: false, rating: 3, created: '2026-10-30', color: colorFor(id) }, ...all]);
      setAutoEdit(id);
    } else if (o === 'opportunities') {
      setOppsS((all) => [{ id, name: 'New opportunity', companyId: 'c1', amount: 25_000, stage, close: '2026-12-15', poc: 'p1', owner: ME.id, probability: 10 }, ...all]);
      if (mode === 'table' && o === obj) setAutoEdit(id);
      else setOpen({ kind: 'opportunity', id });
    } else if (o === 'tasks') {
      setTasksS((all) => [{ id, title: 'New task', due: '2026-10-30', done: false, assignee: ME.id, target: { kind: 'company', id: 'c1' } }, ...all]);
      toast('Task added for today');
    } else if (o === 'notes') {
      setNotesS((all) => [{ id, title: 'Untitled note', body: 'Start writing…', target: { kind: 'company', id: 'c1' }, author: ME.id, updated: '2026-10-30' }, ...all]);
      toast('Note created on Halcyon Labs');
    } else toast('The workflow builder isn’t part of this demo');
  };

  const deleteSelected = () => {
    const ids = new Set(selected);
    const before = { people, companies, opps };
    if (obj === 'people') setPeopleS((all) => all.filter((x) => !ids.has(x.id)));
    if (obj === 'companies') setCompaniesS((all) => all.filter((x) => !ids.has(x.id)));
    if (obj === 'opportunities') setOppsS((all) => all.filter((x) => !ids.has(x.id)));
    setSelected(new Set());
    toast(`Deleted ${ids.size} record${ids.size > 1 ? 's' : ''}`, {
      label: 'Undo',
      run: () => {
        setPeopleS(before.people);
        setCompaniesS(before.companies);
        setOppsS(before.opps);
      },
    });
  };

  const exportCsv = (list: { id: string }[]) => {
    const keys = ['name', ...fields.map((f) => f.key)];
    const csv = [keys.join(','), ...list.map((r) => keys.map((k) => JSON.stringify((r as Record<string, unknown>)[k] ?? '')).join(','))].join('\n');
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `meridian-${obj}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      /* downloads can be blocked in sandboxes */
    }
    toast(`Exported ${list.length} ${obj} to CSV`);
  };

  const meta = OBJECTS.find((o) => o.key === obj)!;
  const count = objKey ? rows.length : obj === 'tasks' ? tasks.filter((t) => !t.done).length : obj === 'notes' ? notes.length : undefined;
  const currentView = objKey ? VIEWS[objKey].find((v) => v.id === view[objKey]) : undefined;

  const leading = (r: { id: string; name: string }) => {
    if (obj === 'people') return <Avatar name={r.name || '?'} size={18} />;
    if (obj === 'companies') return <Logo company={r as Company} size={18} />;
    const c = companies.find((x) => x.id === (r as Opportunity).companyId);
    return c ? <Logo company={c} size={18} /> : null;
  };

  return (
    <CrmContext.Provider value={crm}>
      <div data-fill className="relative flex h-[720px] overflow-hidden bg-[var(--bg)] font-sans text-[13px] text-[var(--fg)] antialiased sm:h-[760px]" style={{ ...THEMES[theme], colorScheme: theme }} data-theme={theme}>
        <div className="hidden md:flex">
          <Sidebar current={obj} collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} onSearch={() => setCmd(true)} theme={theme} onTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} onSettings={() => setSettings(true)} />
        </div>
        {drawer && (
          <div className="absolute inset-0 z-40 flex md:hidden">
            <div className="h-full animate-fade-in">
              <Sidebar current={obj} collapsed={false} onCollapse={() => setDrawer(false)} onSearch={() => { setDrawer(false); setCmd(true); }} theme={theme} onTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} onSettings={() => { setDrawer(false); setSettings(true); }} />
            </div>
            <button aria-label="Close menu" onClick={() => setDrawer(false)} className="flex-1 bg-black/30 animate-fade-in" />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          {/* top bar */}
          <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--line)] px-3">
            <button onClick={() => setDrawer(true)} aria-label="Open menu" className={cn(btn, 'px-1.5 md:hidden')}>
              <MenuIcon className="h-4 w-4" />
            </button>
            <meta.icon className="h-4 w-4 text-[var(--mute)]" />
            <h1 className="truncate text-[14px] font-medium text-[var(--strong)]">{meta.label}</h1>
            {count !== undefined && <span className="text-[13px] text-[var(--mute)]">{count}</span>}
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setCmd(true)} aria-label="Search (Ctrl K)" className={cn(btn, 'px-1.5')}>
                <Search className="h-4 w-4" />
              </button>
              {obj !== 'dashboard' && (
                <button onClick={() => newRecord(obj)} className={btnPrimary}>
                  <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New {obj === 'people' ? 'person' : obj === 'companies' ? 'company' : obj === 'opportunities' ? 'opportunity' : obj === 'tasks' ? 'task' : obj === 'notes' ? 'note' : 'workflow'}</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </div>
          </header>

          {/* view bar */}
          {objKey && (
            <div className="flex h-10 shrink-0 items-center gap-1 border-b border-[var(--line)] px-2">
              <div className="relative">
                <button onClick={() => setMenu(menu === 'view' ? null : 'view')} aria-haspopup="menu" aria-expanded={menu === 'view'} className={cn(btn, 'font-medium text-[var(--strong)]')}>
                  <List className="h-3.5 w-3.5 text-[var(--mute)]" />
                  <span className="max-w-[140px] truncate">{currentView?.label}</span>
                  <span className="text-[var(--mute)]">· {rows.length}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--mute)]" />
                </button>
                <Menu open={menu === 'view'} onClose={() => setMenu(null)}>
                  {VIEWS[objKey].map((v) => (
                    <MenuItem key={v.id} active={view[objKey] === v.id} icon={List} onClick={() => { setView((s) => ({ ...s, [objKey]: v.id })); setMenu(null); }}>
                      {v.label}
                    </MenuItem>
                  ))}
                  <div className="my-1 h-px bg-[var(--line)]" />
                  <MenuItem icon={Plus} onClick={() => { setMenu(null); toast('Saved views are read-only in this demo'); }}>Add view</MenuItem>
                </Menu>
              </div>
              {obj === 'opportunities' && (
                <div className="ml-1 flex rounded-md bg-[var(--sub)] p-0.5" role="group" aria-label="Layout">
                  {(['kanban', 'table'] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} aria-label={m === 'kanban' ? 'Kanban' : 'Table'} className={cn('grid h-6 w-7 place-items-center rounded-[5px] transition-colors', mode === m ? 'bg-[var(--panel)] text-[var(--strong)] shadow-sm' : 'text-[var(--mute)]')}>
                      {m === 'kanban' ? <Kanban className="h-3.5 w-3.5" /> : <Columns3 className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
              <div className="ml-auto flex items-center gap-0.5">
                {searching ? (
                  <div className="flex h-7 items-center gap-1 rounded-md border border-[var(--accent)] px-2">
                    <Search className="h-3.5 w-3.5 text-[var(--mute)]" />
                    <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && (setSearch(''), setSearching(false))} placeholder={`Search ${meta.label.toLowerCase()}`} aria-label={`Search ${meta.label}`} className="w-24 bg-transparent text-[13px] text-[var(--strong)] outline-none placeholder:text-[var(--faint)] sm:w-36" />
                    <button onClick={() => { setSearch(''); setSearching(false); }} aria-label="Clear search"><X className="h-3.5 w-3.5 text-[var(--mute)]" /></button>
                  </div>
                ) : (
                  <button onClick={() => setSearching(true)} aria-label={`Search ${meta.label}`} className={cn(btn, 'px-1.5')}><Search className="h-3.5 w-3.5" /></button>
                )}
                <div className="relative">
                  <button onClick={() => setMenu(menu === 'filter' ? null : 'filter')} aria-haspopup="menu" aria-expanded={menu === 'filter'} className={cn(btn, rules[objKey].length > 0 && 'text-[var(--accent)]')}>
                    <Filter className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Filter</span>
                  </button>
                  <Menu open={menu === 'filter'} onClose={() => setMenu(null)} align="right" className="w-[230px]">
                    <p className="px-2 pb-1 pt-1.5 text-[11.5px] text-[var(--mute)]">Add a filter</p>
                    {RULES[objKey].map((r) => {
                      const on = rules[objKey].some((x) => x.id === r.id);
                      return (
                        <MenuItem key={r.id} active={on} icon={Filter} onClick={() => setRules((s) => ({ ...s, [objKey]: on ? s[objKey].filter((x) => x.id !== r.id) : [...s[objKey], r] }))}>
                          {r.label}
                        </MenuItem>
                      );
                    })}
                  </Menu>
                </div>
                <div className="relative">
                  <button onClick={() => setMenu(menu === 'sort' ? null : 'sort')} aria-haspopup="menu" aria-expanded={menu === 'sort'} className={cn(btn, sort && 'text-[var(--accent)]')}>
                    <ArrowDownUp className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sort</span>
                  </button>
                  <Menu open={menu === 'sort'} onClose={() => setMenu(null)} align="right" className="max-h-[300px] w-[210px] overflow-y-auto">
                    {[{ key: 'name', label: 'Name', icon: List }, ...fields].map((f) => (
                      <MenuItem key={f.key} active={sort?.key === f.key} icon={f.icon} hint={sort?.key === f.key ? (sort.dir === 1 ? 'A→Z' : 'Z→A') : undefined} onClick={() => { setSorts((s) => ({ ...s, [objKey]: { key: f.key, dir: s[objKey]?.key === f.key ? (s[objKey]!.dir === 1 ? -1 : 1) : 1 } })); setMenu(null); }}>
                        {f.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
                <div className="relative">
                  <button onClick={() => setMenu(menu === 'options' ? null : 'options')} aria-label="Options" aria-haspopup="menu" aria-expanded={menu === 'options'} className={cn(btn, 'px-1.5')}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <Menu open={menu === 'options'} onClose={() => setMenu(null)} align="right">
                    <MenuItem icon={Download} onClick={() => { setMenu(null); exportCsv(rows); }}>Export view as CSV</MenuItem>
                    <MenuItem icon={Upload} onClick={() => { setMenu(null); toast('Import opens a CSV mapper in the full product'); }}>Import records</MenuItem>
                    <MenuItem icon={Trash2} onClick={() => { setMenu(null); toast('No deleted records in the last 30 days'); }}>Deleted records</MenuItem>
                  </Menu>
                </div>
              </div>
            </div>
          )}

          {/* active filter chips */}
          {objKey && (rules[objKey].length > 0 || sort) && (
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--line)] px-3 py-1.5">
              {sort && (
                <span className="inline-flex h-6 items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 text-[12px] text-[var(--accent)]">
                  <ArrowDownUp className="h-3 w-3" /> {sort.key === 'name' ? 'Name' : fields.find((f) => f.key === sort.key)?.label}: {sort.dir === 1 ? 'ascending' : 'descending'}
                  <button aria-label="Remove sort" onClick={() => setSorts((s) => ({ ...s, [objKey]: null }))}><X className="h-3 w-3" /></button>
                </span>
              )}
              {rules[objKey].map((r) => (
                <span key={r.id} className="inline-flex h-6 items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 text-[12px] text-[var(--accent)]">
                  {r.label}
                  <button aria-label={`Remove filter ${r.label}`} onClick={() => setRules((s) => ({ ...s, [objKey]: s[objKey].filter((x) => x.id !== r.id) }))}><X className="h-3 w-3" /></button>
                </span>
              ))}
              <button onClick={() => { setRules((s) => ({ ...s, [objKey]: [] })); setSorts((s) => ({ ...s, [objKey]: null })); }} className="text-[12px] text-[var(--mute)] hover:text-[var(--strong)]">Reset</button>
            </div>
          )}

          {/* content */}
          {objKey && !(obj === 'opportunities' && mode === 'kanban') && (
            <TableView
              key={obj}
              rows={rows as { id: string; name: string }[]}
              fields={fields}
              leading={leading}
              selected={selected}
              setSelected={setSelected}
              sort={sort}
              onSort={(key) => setSorts((s) => ({ ...s, [objKey]: s[objKey]?.key === key ? (s[objKey]!.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 } }))}
              onUpdate={update}
              onOpen={(id) => setOpen({ kind: obj === 'people' ? 'person' : obj === 'companies' ? 'company' : 'opportunity', id })}
              onNew={() => newRecord(obj)}
              autoEdit={autoEdit}
              clearAutoEdit={() => setAutoEdit(null)}
              nameLabel={obj === 'people' ? 'Name' : obj === 'companies' ? 'Company' : 'Opportunity'}
            />
          )}
          {obj === 'opportunities' && mode === 'kanban' && <KanbanView rows={rows as Opportunity[]} onNew={(stage) => newRecord('opportunities', stage)} />}
          {obj === 'tasks' && <TasksView />}
          {obj === 'notes' && <NotesView />}
          {obj === 'workflows' && <WorkflowsView />}
          {obj === 'dashboard' && <DashboardView />}
        </main>

        {/* bulk actions */}
        {selected.size > 0 && objKey && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-1 pl-3 text-[13px] animate-fade-up" style={{ boxShadow: 'var(--pop)' }}>
            <span className="whitespace-nowrap font-medium text-[var(--strong)]">{selected.size} selected</span>
            <span className="mx-1 h-4 w-px bg-[var(--line)]" />
            <button
              onClick={() => {
                const kind = obj === 'people' ? 'person' : obj === 'companies' ? 'company' : 'opportunity';
                setFavorites((f) => [...f, ...[...selected].map((id) => ({ kind, id }) as Target).filter((t) => !f.some((x) => sameTarget(x, t)))]);
                toast(`Added ${selected.size} to favorites`);
              }}
              className={btn}
            >
              <Star className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Favorite</span>
            </button>
            <button onClick={() => exportCsv(rows.filter((r) => selected.has(r.id)))} className={btn}>
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
            </button>
            <button onClick={deleteSelected} className={cn(btn, 'text-[#dc3e42]')}>
              <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Delete</span>
            </button>
            <button onClick={() => setSelected(new Set())} aria-label="Clear selection" className={cn(btn, 'px-1.5')}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {open && <RecordPanel target={open} onClose={() => setOpen(null)} />}
        {cmd && <CommandMenu onClose={() => setCmd(false)} onNew={(o) => newRecord(o)} onTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} onCollapse={() => setCollapsed((c) => !c)} />}

        {settings && (
          <div className="absolute inset-0 z-50 grid place-items-center bg-black/25 p-4 animate-fade-in" onPointerDown={(e) => e.target === e.currentTarget && setSettings(false)}>
            <div role="dialog" aria-label="Settings" className="w-full max-w-[420px] rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 animate-scale-in" style={{ boxShadow: 'var(--pop)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[var(--strong)]">Settings</h2>
                <button onClick={() => setSettings(false)} aria-label="Close settings" className={cn(btn, 'px-1.5')}><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 text-[12px] font-medium text-[var(--mute)]">Appearance</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(['light', 'dark'] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t} className={cn('rounded-lg border p-2 text-left capitalize transition-colors', theme === t ? 'border-[var(--accent)] text-[var(--strong)]' : 'border-[var(--line)] text-[var(--fg)] hover:border-[var(--line2)]')}>
                    <span className="mb-2 block h-12 rounded-md border border-black/10" style={{ background: t === 'light' ? 'linear-gradient(90deg,#fafafa 30%,#fff 30%)' : 'linear-gradient(90deg,#111 30%,#151515 30%)' }} />
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[12px] font-medium text-[var(--mute)]">Members</p>
              <ul className="mt-1 divide-y divide-[var(--line)]">
                {MEMBERS.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 py-2">
                    <Avatar name={m.name} color={m.color} size={22} />
                    <span className="flex-1 text-[13px] text-[var(--strong)]">{m.name}</span>
                    <span className="text-[12px] text-[var(--mute)]">{m.id === ME.id ? 'Admin' : 'Member'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div aria-live="polite" className="pointer-events-none absolute bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto flex items-center gap-3 rounded-lg bg-[var(--strong)] px-3 py-2 text-[12.5px] text-[var(--bg)] shadow-lg animate-fade-up">
              {t.msg}
              {t.action && (
                <button onClick={() => { t.action!.run(); setToasts((all) => all.filter((x) => x.id !== t.id)); }} className="font-medium underline underline-offset-2">
                  {t.action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </CrmContext.Provider>
  );
}
