import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3, Copy, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Status = 'Active' | 'Trial' | 'Past due' | 'Churned';
export type Row = { id: number; name: string; email: string; plan: string; status: Status; mrr: number; seats: number; joined: string };

const NAMES = ['Lumenpay', 'Kestrel Labs', 'Northbeam', 'Harborline', 'Sorabase', 'Quillstack', 'Verdant OS', 'Tidewater AI', 'Atlas Freight', 'Brightmill', 'Pellucid', 'Orchard Bank', 'Fernway', 'Copperline', 'Halcyon', 'Stratus', 'Paperplane', 'Arbor Finance', 'Quill & Co', 'Tidal Robotics', 'Meridian', 'Kinetik', 'Sundial', 'Field & Frame'];
const PLANS = ['Starter', 'Team', 'Business', 'Enterprise'];
const STATUS: Status[] = ['Active', 'Active', 'Trial', 'Active', 'Past due', 'Active', 'Churned', 'Trial'];
export const DEMO_ROWS: Row[] = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  email: `billing@${name.toLowerCase().replace(/[^a-z]+/g, '')}.com`,
  plan: PLANS[(i * 7) % 4],
  status: STATUS[(i * 5) % 8],
  mrr: [49, 240, 960, 4800][(i * 7) % 4] * (1 + (i % 3)),
  seats: 3 + ((i * 11) % 60),
  joined: `2026-0${1 + (i % 9)}-${String(1 + ((i * 3) % 28)).padStart(2, '0')}`,
}));

const COLS = [
  { key: 'email', label: 'Email' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'mrr', label: 'MRR' },
  { key: 'seats', label: 'Seats' },
  { key: 'joined', label: 'Joined' },
] as const;
type ColKey = 'name' | (typeof COLS)[number]['key'];

const BADGE: Record<Status, string> = {
  Active: 'bg-emerald-500/10 text-emerald-300',
  Trial: 'bg-brand-500/10 text-brand-300',
  'Past due': 'bg-amber-500/10 text-amber-300',
  Churned: 'bg-white/5 text-ink-400',
};

export function DataTablePro({ rows: initial = DEMO_ROWS, loadingFirst = true }: { rows?: Row[]; loadingFirst?: boolean }) {
  const [rows, setRows] = useState(initial);
  const [loading, setLoading] = useState(loadingFirst);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: ColKey; dir: 1 | -1 }>({ key: 'mrr', dir: -1 });
  const [hidden, setHidden] = useState<Set<ColKey>>(new Set(['joined']));
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [menu, setMenu] = useState<number | 'cols' | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(id);
  }, [loading]);
  useEffect(() => {
    if (menu === null) return;
    const close = (e: PointerEvent) => !(e.target as HTMLElement).closest('[data-menu]') && setMenu(null);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(null);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', key);
    };
  }, [menu]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = rows.filter((r) => !s || `${r.name} ${r.email} ${r.plan} ${r.status}`.toLowerCase().includes(s));
    return [...list].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [rows, q, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const cur = Math.min(page, pages - 1);
  const view = filtered.slice(cur * size, cur * size + size);
  const allOnPage = view.length > 0 && view.every((r) => sel.has(r.id));

  const toggleSort = (key: ColKey) => setSort((s) => ({ key, dir: s.key === key ? ((s.dir * -1) as 1 | -1) : 1 }));
  const visible = COLS.filter((c) => !hidden.has(c.key));
  const fmt = (r: Row, k: (typeof COLS)[number]['key']) =>
    k === 'status' ? <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', BADGE[r.status])}>{r.status}</span> : k === 'mrr' ? <span className="font-mono tabular-nums">${r.mrr.toLocaleString()}</span> : k === 'seats' ? <span className="font-mono tabular-nums">{r.seats}</span> : k === 'joined' ? <span className="font-mono text-xs">{r.joined}</span> : r[k];

  const Head = ({ k, label, className }: { k: ColKey; label: string; className?: string }) => (
    <th scope="col" aria-sort={sort.key === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className={cn('px-3 py-2.5 text-left font-medium', className)}>
      <button onClick={() => toggleSort(k)} className="focus-ring inline-flex items-center gap-1 rounded hover:text-ink-100">
        {label}
        {sort.key === k && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );

  return (
    <div ref={root} className="w-full max-w-4xl rounded-2xl bg-ink-900 shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 p-3">
        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-ink-950/60 px-3 focus-within:border-brand-400/50 sm:max-w-xs">
          <Search className="h-4 w-4 shrink-0 text-ink-500" />
          <input value={q} onChange={(e) => (setQ(e.target.value), setPage(0))} placeholder="Search customers…" aria-label="Search" className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500" />
        </label>
        {sel.size > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-brand-500/10 px-2.5 py-1.5 text-xs text-brand-200 animate-scale-in">
            {sel.size} selected
            <button onClick={() => (setRows((r) => r.filter((x) => !sel.has(x.id))), setSel(new Set()))} className="focus-ring inline-flex items-center gap-1 rounded text-rose-300 hover:text-rose-200">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
        <div className="relative ml-auto" data-menu>
          <button onClick={() => setMenu(menu === 'cols' ? null : 'cols')} aria-expanded={menu === 'cols'} className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-ink-200 hover:bg-white/5">
            <Columns3 className="h-4 w-4" /> <span className="hidden sm:inline">Columns</span>
          </button>
          {menu === 'cols' && (
            <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-white/10 bg-ink-850 p-1.5 shadow-pop animate-scale-in">
              {COLS.map((c) => (
                <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-200 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={!hidden.has(c.key)}
                    onChange={() =>
                      setHidden((h) => {
                        const n = new Set(h);
                        n.has(c.key) ? n.delete(c.key) : n.add(c.key);
                        return n;
                      })
                    }
                    className="accent-sky-400"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-xs text-ink-500">
            <tr className="border-b border-white/5">
              <th className="w-10 px-3 py-2.5">
                <input type="checkbox" aria-label="Select page" checked={allOnPage} onChange={() => setSel((s) => { const n = new Set(s); view.forEach((r) => (allOnPage ? n.delete(r.id) : n.add(r.id))); return n; })} className="accent-sky-400" />
              </th>
              <Head k="name" label="Customer" />
              {visible.map((c) => (
                <Head key={c.key} k={c.key} label={c.label} className={c.key === 'email' ? 'hidden md:table-cell' : undefined} />
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: size }, (_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={visible.length + 3} className="px-3 py-3">
                      <div className="h-4 animate-pulse rounded bg-white/5" style={{ width: `${60 + ((i * 17) % 35)}%` }} />
                    </td>
                  </tr>
                ))
              : view.map((r) => (
                  <tr key={r.id} className={cn('border-b border-white/5 transition-colors', sel.has(r.id) ? 'bg-brand-500/[0.05]' : 'hover:bg-white/[0.02]')}>
                    <td className="px-3 py-2.5">
                      <input type="checkbox" aria-label={`Select ${r.name}`} checked={sel.has(r.id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })} className="accent-sky-400" />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-ink-100">{r.name}</td>
                    {visible.map((c) => (
                      <td key={c.key} className={cn('px-3 py-2.5 text-ink-300', c.key === 'email' && 'hidden md:table-cell')}>
                        {fmt(r, c.key)}
                      </td>
                    ))}
                    <td className="relative px-2" data-menu>
                      <button aria-label={`Actions for ${r.name}`} onClick={() => setMenu(menu === r.id ? null : r.id)} className="focus-ring grid h-7 w-7 place-items-center rounded-md text-ink-500 hover:bg-white/5 hover:text-ink-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menu === r.id && (
                        <div role="menu" className="absolute right-2 top-9 z-20 w-36 rounded-xl border border-white/10 bg-ink-850 p-1 shadow-pop animate-scale-in">
                          {[
                            [Pencil, 'Edit'],
                            [Copy, 'Duplicate'],
                          ].map(([I, l]) => {
                            const Icon = I as typeof Pencil;
                            return (
                              <button key={l as string} role="menuitem" onClick={() => setMenu(null)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink-200 hover:bg-white/5">
                                <Icon className="h-3.5 w-3.5" /> {l as string}
                              </button>
                            );
                          })}
                          <button role="menuitem" onClick={() => (setRows((list) => list.filter((x) => x.id !== r.id)), setMenu(null))} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-rose-300 hover:bg-rose-500/10">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            {!loading && !view.length && (
              <tr>
                <td colSpan={visible.length + 3} className="px-3 py-12 text-center text-sm text-ink-500">
                  No customers match “{q}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-xs text-ink-400">
        <label className="flex items-center gap-2">
          Rows
          <select value={size} onChange={(e) => (setSize(+e.target.value), setPage(0))} className="focus-ring h-7 rounded-md border border-white/10 bg-ink-950 px-1.5 text-ink-200">
            {[6, 10, 20].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {filtered.length ? cur * size + 1 : 0}–{Math.min(filtered.length, cur * size + size)} of {filtered.length}
          </span>
          <button aria-label="Previous page" disabled={cur === 0} onClick={() => setPage(cur - 1)} className="focus-ring grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button aria-label="Next page" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="focus-ring grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DataTableProDemo() {
  return <DataTablePro loadingFirst={false} />;
}
