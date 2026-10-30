import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown, CircleDollarSign, Layers, ListFilter, MapPin, Plus, Search, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type FieldKey = 'stage' | 'owner' | 'city' | 'arr';
type Op = 'is' | 'isNot' | 'gte' | 'lte';
export type Filter = { id: string; field: FieldKey; op: Op; value: string };
type SortKey = 'name' | 'company' | 'arr';
export type Sort = { key: SortKey; dir: 'asc' | 'desc' };
export type SavedView = { id: string; name: string; filters: Filter[]; sort: Sort | null };
export type FilterPerson = { id: string; name: string; company: string; stage: string; owner: string; city: string; arr: number };

const STAGES = ['Lead', 'Qualified', 'Customer', 'Churned'];
const OWNERS = ['Ana Ruiz', 'Leo Park', 'Mira Shah'];
const CITIES = ['Berlin', 'Lisbon', 'London', 'New York', 'Tokyo'];
const FIELDS: Record<FieldKey, { label: string; icon: typeof Layers; options?: string[] }> = {
  stage: { label: 'Stage', icon: Layers, options: STAGES },
  owner: { label: 'Owner', icon: UserRound, options: OWNERS },
  city: { label: 'City', icon: MapPin, options: CITIES },
  arr: { label: 'ARR', icon: CircleDollarSign },
};
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'arr', label: 'ARR' },
];
const OP_LABEL: Record<Op, string> = { is: 'is', isNot: 'is not', gte: '≥', lte: '≤' };
const STAGE_DOT: Record<string, string> = { Lead: 'bg-sky-400', Qualified: 'bg-violet-400', Customer: 'bg-emerald-400', Churned: 'bg-rose-400' };
const k = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
const uid = () => Math.random().toString(36).slice(2, 8);

export const DEFAULT_VIEWS: SavedView[] = [
  { id: 'all', name: 'All people', filters: [], sort: { key: 'name', dir: 'asc' } },
  { id: 'mine', name: 'My leads', filters: [{ id: 'f1', field: 'owner', op: 'is', value: 'Ana Ruiz' }, { id: 'f2', field: 'stage', op: 'is', value: 'Lead' }], sort: { key: 'arr', dir: 'desc' } },
  { id: 'hot', name: 'Hot deals', filters: [{ id: 'f3', field: 'stage', op: 'is', value: 'Qualified' }, { id: 'f4', field: 'arr', op: 'gte', value: '40000' }], sort: { key: 'arr', dir: 'desc' } },
];

function matches(p: FilterPerson, f: Filter) {
  if (f.field === 'arr') return f.op === 'gte' ? p.arr >= Number(f.value) : p.arr <= Number(f.value);
  const v = p[f.field];
  return f.op === 'is' ? v === f.value : v !== f.value;
}

function useDismiss(open: boolean, close: () => void, refs: RefObject<HTMLElement>[]) {
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (!refs.some((r) => r.current?.contains(e.target as Node))) close();
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
}

function Pop({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('absolute left-0 top-[calc(100%+6px)] z-40 w-60 max-w-[calc(100vw-56px)] rounded-xl bg-ink-800 p-1.5 shadow-pop animate-scale-in', className)}>{children}</div>;
}

export type FilterBarProps = {
  people: FilterPerson[];
  views?: SavedView[];
  initialView?: string;
  className?: string;
};

export function FilterBar({ people, views: initialViews = DEFAULT_VIEWS, initialView = 'hot', className }: FilterBarProps) {
  const [views, setViews] = useState(initialViews);
  const [viewId, setViewId] = useState(initialView);
  const view = views.find((v) => v.id === viewId) ?? views[0];
  const [filters, setFilters] = useState<Filter[]>(view.filters);
  const [sort, setSort] = useState<Sort | null>(view.sort);
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState<'views' | 'filter' | 'sort' | null>(null);
  const [draft, setDraft] = useState<{ field: FieldKey | null; op: Op; custom: string }>({ field: null, op: 'is', custom: '' });
  const [saved, setSaved] = useState(false);
  const viewsRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  useDismiss(menu !== null, () => setMenu(null), [viewsRef, filterRef, sortRef]);

  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(id);
  }, [saved]);

  const dirty = JSON.stringify(filters.map(({ field, op, value }) => [field, op, value])) + JSON.stringify(sort) !== JSON.stringify(view.filters.map(({ field, op, value }) => [field, op, value])) + JSON.stringify(view.sort);

  const result = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = people.filter((p) => filters.every((f) => matches(p, f)) && (!q || `${p.name} ${p.company} ${p.city}`.toLowerCase().includes(q)));
    if (!sort) return list;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => (sort.key === 'arr' ? a.arr - b.arr : a[sort.key].localeCompare(b[sort.key])) * dir);
  }, [people, filters, sort, query]);

  const pickView = (id: string) => {
    const v = views.find((x) => x.id === id)!;
    setViewId(id);
    setFilters(v.filters);
    setSort(v.sort);
    setMenu(null);
  };
  const addFilter = (field: FieldKey, op: Op, value: string) => {
    setFilters((fs) => [...fs, { id: uid(), field, op, value }]);
    setDraft({ field: null, op: 'is', custom: '' });
    setMenu(null);
  };
  const saveView = () => {
    setViews((vs) => vs.map((v) => (v.id === view.id ? { ...v, filters, sort } : v)));
    setSaved(true);
  };

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="space-y-2.5 border-b border-white/[0.06] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div ref={viewsRef} className="relative">
            <button onClick={() => setMenu(menu === 'views' ? null : 'views')} aria-haspopup="menu" aria-expanded={menu === 'views'} className="focus-ring flex h-8 items-center gap-2 rounded-lg bg-white/[0.04] px-2.5 text-[13px] font-medium text-ink-100 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.07]">
              <ListFilter className="h-3.5 w-3.5 text-brand-300" />
              {view.name}
              <ChevronDown className={cn('h-3.5 w-3.5 text-ink-500 transition-transform', menu === 'views' && 'rotate-180')} />
            </button>
            {menu === 'views' && (
              <Pop>
                <p className="px-2 pb-1 pt-1 text-[10.5px] font-medium uppercase tracking-wider text-ink-500">Saved views</p>
                {views.map((v) => (
                  <button key={v.id} role="menuitemradio" aria-checked={v.id === view.id} onClick={() => pickView(v.id)} className="focus-ring flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[13px] text-ink-200 transition-colors hover:bg-white/5">
                    <span>{v.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-500">{v.filters.length}</span>
                      {v.id === view.id && <Check className="h-3.5 w-3.5 text-brand-300" />}
                    </span>
                  </button>
                ))}
              </Pop>
            )}
          </div>
          <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg bg-ink-950/60 px-2.5 ring-1 ring-white/[0.06] focus-within:ring-brand-400/50 sm:max-w-[260px]">
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people…" aria-label="Search people" className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-100 outline-none placeholder:text-ink-600" />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="text-ink-500 hover:text-ink-200">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <span className="ml-auto font-mono text-[11.5px] tabular-nums text-ink-400" aria-live="polite">
            <span className="text-ink-100">{result.length}</span> of {people.length} people
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((f) => {
            const F = FIELDS[f.field];
            return (
              <span key={f.id} className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-brand-500/10 pl-2 pr-1 text-[12px] text-brand-200 ring-1 ring-brand-400/20 animate-scale-in">
                <F.icon className="h-3 w-3 text-brand-300" />
                <span className="text-brand-300/80">{F.label}</span>
                <span className="text-brand-300/60">{OP_LABEL[f.op]}</span>
                <span className="font-medium text-ink-50">{f.field === 'arr' ? k(Number(f.value)) : f.value}</span>
                <button onClick={() => setFilters((fs) => fs.filter((x) => x.id !== f.id))} aria-label={`Remove ${F.label} filter`} className="focus-ring grid h-5 w-5 place-items-center rounded-md text-brand-300/70 transition-colors hover:bg-brand-400/15 hover:text-ink-50">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <div ref={filterRef} className="relative">
            <button onClick={() => { setMenu(menu === 'filter' ? null : 'filter'); setDraft({ field: null, op: 'is', custom: '' }); }} aria-expanded={menu === 'filter'} className="focus-ring flex h-7 items-center gap-1 rounded-lg px-2 border border-dashed border-white/15 text-[12px] text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              <Plus className="h-3 w-3" /> Filter
            </button>
            {menu === 'filter' && (
              <Pop>
                {!draft.field ? (
                  <>
                    <p className="px-2 pb-1 pt-1 text-[10.5px] font-medium uppercase tracking-wider text-ink-500">Filter by</p>
                    {(Object.keys(FIELDS) as FieldKey[]).map((key) => {
                      const F = FIELDS[key];
                      return (
                        <button key={key} onClick={() => setDraft({ field: key, op: key === 'arr' ? 'gte' : 'is', custom: '' })} className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-ink-200 transition-colors hover:bg-white/5">
                          <F.icon className="h-3.5 w-3.5 text-ink-400" /> {F.label}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="space-y-1.5 p-1">
                    <div className="flex items-center justify-between">
                      <button onClick={() => setDraft({ field: null, op: 'is', custom: '' })} className="text-[11.5px] text-ink-400 hover:text-ink-100">
                        ← {FIELDS[draft.field].label}
                      </button>
                      <div className="flex rounded-md bg-ink-950/60 p-0.5">
                        {(draft.field === 'arr' ? (['gte', 'lte'] as Op[]) : (['is', 'isNot'] as Op[])).map((op) => (
                          <button key={op} onClick={() => setDraft((d) => ({ ...d, op }))} className={cn('rounded px-2 py-0.5 text-[11.5px] transition-colors', draft.op === op ? 'bg-ink-700 text-ink-50' : 'text-ink-400 hover:text-ink-100')}>
                            {OP_LABEL[op]}
                          </button>
                        ))}
                      </div>
                    </div>
                    {draft.field === 'arr' ? (
                      <>
                        <div className="grid grid-cols-4 gap-1">
                          {[10000, 25000, 50000, 100000].map((n) => (
                            <button key={n} onClick={() => addFilter('arr', draft.op, String(n))} className="rounded-md bg-white/[0.04] py-1.5 font-mono text-[11.5px] text-ink-200 transition-colors hover:bg-brand-500/15 hover:text-ink-50">
                              {k(n)}
                            </button>
                          ))}
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const n = Number(draft.custom.replace(/[^\d]/g, ''));
                            if (n) addFilter('arr', draft.op, String(n));
                          }}
                          className="flex gap-1"
                        >
                          <input autoFocus value={draft.custom} onChange={(e) => setDraft((d) => ({ ...d, custom: e.target.value }))} placeholder="Custom amount" inputMode="numeric" aria-label="Custom ARR amount" className="h-7 min-w-0 flex-1 rounded-md bg-ink-950 px-2 text-[12.5px] text-ink-50 outline-none ring-1 ring-white/10 focus:ring-brand-400/50" />
                          <button className="rounded-md bg-brand-500 px-2 text-[12px] font-medium text-white">Apply</button>
                        </form>
                      </>
                    ) : (
                      FIELDS[draft.field].options!.map((o) => (
                        <button key={o} onClick={() => addFilter(draft.field!, draft.op, o)} className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-ink-200 transition-colors hover:bg-white/5">
                          {draft.field === 'stage' && <span className={cn('h-2 w-2 rounded-full', STAGE_DOT[o])} />}
                          {o}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </Pop>
            )}
          </div>
          <span className="mx-1 h-4 w-px bg-white/10" />
          {sort && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-white/[0.04] pl-2 pr-1 text-[12px] text-ink-200 ring-1 ring-white/[0.07] animate-scale-in">
              <button onClick={() => setSort({ ...sort, dir: sort.dir === 'asc' ? 'desc' : 'asc' })} aria-label="Flip sort direction" className="flex items-center gap-1.5 hover:text-ink-50">
                {sort.dir === 'asc' ? <ArrowUp className="h-3 w-3 text-brand-300" /> : <ArrowDown className="h-3 w-3 text-brand-300" />}
                {SORTS.find((s) => s.key === sort.key)?.label}
              </button>
              <button onClick={() => setSort(null)} aria-label="Remove sort" className="focus-ring grid h-5 w-5 place-items-center rounded-md text-ink-500 transition-colors hover:bg-white/10 hover:text-ink-50">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <div ref={sortRef} className="relative">
            <button onClick={() => setMenu(menu === 'sort' ? null : 'sort')} aria-expanded={menu === 'sort'} className="focus-ring flex h-7 items-center gap-1 rounded-lg px-2 text-[12px] text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              <ArrowUpDown className="h-3 w-3" /> Sort
            </button>
            {menu === 'sort' && (
              <Pop className="w-52">
                {SORTS.map((s) => (
                  <div key={s.key} className="flex items-center justify-between rounded-lg px-2 py-1 text-[13px] text-ink-200 hover:bg-white/5">
                    {s.label}
                    <span className="flex gap-0.5">
                      {(['asc', 'desc'] as const).map((dir) => (
                        <button
                          key={dir}
                          onClick={() => {
                            setSort({ key: s.key, dir });
                            setMenu(null);
                          }}
                          aria-label={`Sort by ${s.label} ${dir === 'asc' ? 'ascending' : 'descending'}`}
                          className={cn('grid h-6 w-6 place-items-center rounded-md transition-colors', sort?.key === s.key && sort.dir === dir ? 'bg-brand-500/20 text-brand-200' : 'text-ink-500 hover:bg-white/10 hover:text-ink-100')}
                        >
                          {dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        </button>
                      ))}
                    </span>
                  </div>
                ))}
              </Pop>
            )}
          </div>
          <span className="ml-auto flex items-center gap-1.5">
            {saved ? (
              <span className="flex items-center gap-1 text-[12px] text-emerald-300 animate-fade-in">
                <Check className="h-3.5 w-3.5" /> View saved
              </span>
            ) : (
              dirty && (
                <span className="flex items-center gap-1.5 animate-fade-in">
                  <button onClick={() => pickView(view.id)} className="focus-ring rounded-lg px-2 py-1 text-[12px] text-ink-400 transition-colors hover:text-ink-100">
                    Reset
                  </button>
                  <button onClick={saveView} className="focus-ring rounded-lg bg-brand-500 px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-brand-400">
                    Save view
                  </button>
                </span>
              )
            )}
          </span>
        </div>
      </div>

      <ul className="max-h-[300px] divide-y divide-white/[0.04] overflow-y-auto [scrollbar-width:thin]">
        {result.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px] animate-fade-in">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[10.5px] font-semibold text-ink-200">
              {p.name
                .split(' ')
                .map((w) => w[0])
                .join('')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-ink-50">{p.name}</span>
              <span className="block truncate text-[12px] text-ink-500">
                {p.company} · {p.city}
              </span>
            </span>
            <span className="hidden items-center gap-1.5 text-[12px] text-ink-300 sm:flex">
              <span className={cn('h-1.5 w-1.5 rounded-full', STAGE_DOT[p.stage])} />
              {p.stage}
            </span>
            <span className="hidden w-24 truncate text-[12px] text-ink-400 md:block">{p.owner}</span>
            <span className="w-16 text-right font-mono text-[12.5px] tabular-nums text-ink-100">{k(p.arr)}</span>
          </li>
        ))}
        {result.length === 0 && (
          <li className="px-4 py-10 text-center text-[13px] text-ink-500">
            No people match these filters.{' '}
            <button onClick={() => { setFilters([]); setQuery(''); }} className="text-brand-300 hover:underline">
              Clear filters
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export const DEMO_FILTER_PEOPLE: FilterPerson[] = [
  { id: '1', name: 'Amara Okafor', company: 'Lumenpay', stage: 'Customer', owner: 'Ana Ruiz', city: 'London', arr: 84000 },
  { id: '2', name: 'Jonas Weber', company: 'Kestrel Labs', stage: 'Qualified', owner: 'Leo Park', city: 'Berlin', arr: 42000 },
  { id: '3', name: 'Priya Raman', company: 'Northbeam', stage: 'Lead', owner: 'Ana Ruiz', city: 'London', arr: 18000 },
  { id: '4', name: 'Mateo Silva', company: 'Harborline', stage: 'Qualified', owner: 'Mira Shah', city: 'Lisbon', arr: 56000 },
  { id: '5', name: 'Hana Kobayashi', company: 'Sorabase', stage: 'Customer', owner: 'Leo Park', city: 'Tokyo', arr: 120000 },
  { id: '6', name: 'Elliot Grant', company: 'Quillstack', stage: 'Churned', owner: 'Ana Ruiz', city: 'New York', arr: 9000 },
  { id: '7', name: 'Sofia Marin', company: 'Verdant OS', stage: 'Lead', owner: 'Ana Ruiz', city: 'Lisbon', arr: 24000 },
  { id: '8', name: 'Kwame Mensah', company: 'Tidewater AI', stage: 'Qualified', owner: 'Leo Park', city: 'London', arr: 67000 },
  { id: '9', name: 'Lena Fischer', company: 'Brightmill', stage: 'Customer', owner: 'Mira Shah', city: 'Berlin', arr: 38000 },
  { id: '10', name: 'Ravi Menon', company: 'Atlas Freight', stage: 'Lead', owner: 'Ana Ruiz', city: 'Tokyo', arr: 15000 },
  { id: '11', name: 'Noor Haddad', company: 'Pellucid', stage: 'Qualified', owner: 'Ana Ruiz', city: 'New York', arr: 91000 },
  { id: '12', name: 'Tomás Lindqvist', company: 'Fieldframe', stage: 'Lead', owner: 'Mira Shah', city: 'Berlin', arr: 12000 },
  { id: '13', name: 'Grace Liu', company: 'Kinetik', stage: 'Customer', owner: 'Leo Park', city: 'New York', arr: 73000 },
  { id: '14', name: 'Olu Adebayo', company: 'Sundial', stage: 'Qualified', owner: 'Mira Shah', city: 'London', arr: 48000 },
  { id: '15', name: 'Ines Duarte', company: 'Oddly', stage: 'Lead', owner: 'Ana Ruiz', city: 'Lisbon', arr: 31000 },
  { id: '16', name: 'Felix Brandt', company: 'Northform', stage: 'Churned', owner: 'Leo Park', city: 'Berlin', arr: 22000 },
  { id: '17', name: 'Yuki Tanaka', company: 'Lumen TV', stage: 'Qualified', owner: 'Leo Park', city: 'Tokyo', arr: 35000 },
  { id: '18', name: 'Clara Novak', company: 'Apex Media', stage: 'Customer', owner: 'Mira Shah', city: 'New York', arr: 58000 },
];

export function FilterBarDemo() {
  return (
    <div className="w-full max-w-[760px]">
      <FilterBar people={DEMO_FILTER_PEOPLE} initialView="hot" />
    </div>
  );
}
