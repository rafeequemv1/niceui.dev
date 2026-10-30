import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Mail, Plus, Star, Trash2, Undo2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Stage = 'Lead' | 'Qualified' | 'Customer' | 'Churned';
export type PersonRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  stage: Stage;
  arr: number;
  lastContact: string;
  rating: number;
};
type Key = keyof Omit<PersonRow, 'id'>;
type Col = { key: Key; label: string; width: string; edit?: 'text' | 'select' | 'number' | 'date' };

const STAGES: Stage[] = ['Lead', 'Qualified', 'Customer', 'Churned'];
const STAGE_STYLE: Record<Stage, string> = {
  Lead: 'bg-sky-500/10 text-sky-300 ring-sky-400/25',
  Qualified: 'bg-violet-500/10 text-violet-300 ring-violet-400/25',
  Customer: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/25',
  Churned: 'bg-rose-500/10 text-rose-300 ring-rose-400/25',
};
const COLS: Col[] = [
  { key: 'name', label: 'Name', width: 'min-w-[210px]', edit: 'text' },
  { key: 'email', label: 'Email', width: 'min-w-[210px]', edit: 'text' },
  { key: 'phone', label: 'Phone', width: 'min-w-[150px]', edit: 'text' },
  { key: 'company', label: 'Company', width: 'min-w-[160px]', edit: 'text' },
  { key: 'stage', label: 'Stage', width: 'min-w-[130px]', edit: 'select' },
  { key: 'arr', label: 'ARR', width: 'min-w-[110px]', edit: 'number' },
  { key: 'lastContact', label: 'Last contact', width: 'min-w-[130px]', edit: 'date' },
  { key: 'rating', label: 'Rating', width: 'min-w-[120px]' },
];
const HUES = ['bg-sky-500/20 text-sky-200', 'bg-violet-500/20 text-violet-200', 'bg-emerald-500/20 text-emerald-200', 'bg-amber-500/20 text-amber-200', 'bg-rose-500/20 text-rose-200', 'bg-teal-500/20 text-teal-200'];
export const hue = (s: string) => HUES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];
export const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
const money = (n: number) => '$' + n.toLocaleString('en-US');
const day = (iso: string) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

export type RecordTableProps = {
  initialRows: PersonRow[];
  /** Row ids selected on mount. */
  initialSelected?: string[];
  onChange?: (rows: PersonRow[]) => void;
  className?: string;
};

export function RecordTable({ initialRows, initialSelected = [], onChange, className }: RecordTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [sort, setSort] = useState<{ key: Key; dir: 'asc' | 'desc' } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelected));
  const [active, setActive] = useState({ r: 0, c: 0 });
  const [focused, setFocused] = useState(false);
  const [editing, setEditing] = useState<{ id: string; key: Key } | null>(null);
  const [draft, setDraft] = useState('');
  const [undo, setUndo] = useState<{ rows: PersonRow[]; n: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const cells = useRef(new Map<string, HTMLTableCellElement>());
  const byKeyboard = useRef(false);
  const headAll = useRef<HTMLInputElement>(null);
  const editingRef = useRef<{ id: string; key: Key } | null>(null);

  useEffect(() => onChange?.(rows), [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = useMemo(() => {
    if (!sort) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
    });
  }, [rows, sort]);

  const allOn = view.length > 0 && view.every((r) => selected.has(r.id));
  const someOn = view.some((r) => selected.has(r.id));
  useEffect(() => {
    if (headAll.current) headAll.current.indeterminate = someOn && !allOn;
  }, [someOn, allOn]);

  useEffect(() => {
    if (!undo) return;
    const id = window.setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(id);
  }, [undo]);

  // Keep the active cell visible inside the scroller without scrolling the page.
  useEffect(() => {
    if (!byKeyboard.current) return;
    byKeyboard.current = false;
    const sc = scroller.current;
    const row = view[active.r];
    const cell = row && cells.current.get(`${row.id}:${active.c}`);
    if (!sc || !cell) return;
    const s = sc.getBoundingClientRect();
    const c = cell.getBoundingClientRect();
    const stickyW = 210;
    const headH = 40;
    if (active.c > 0 && c.left < s.left + stickyW) sc.scrollLeft -= s.left + stickyW - c.left;
    if (c.right > s.right) sc.scrollLeft += c.right - s.right;
    if (c.top < s.top + headH) sc.scrollTop -= s.top + headH - c.top;
    if (c.bottom > s.bottom) sc.scrollTop += c.bottom - s.bottom;
  }, [active, view]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const start = (id: string, key: Key) => {
    const col = COLS.find((c) => c.key === key);
    const row = rows.find((r) => r.id === id);
    if (!col?.edit || !row) return;
    setDraft(String(row[key]));
    editingRef.current = { id, key };
    setEditing({ id, key });
  };

  const commitValue = (value: string) => {
    const current = editingRef.current;
    if (!current) return;
    editingRef.current = null;
    const { id, key } = current;
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        if (key === 'arr') return { ...r, arr: Number(value.replace(/[^\d.]/g, '')) || 0 };
        if (key === 'name') return { ...r, name: value.trim() || 'Untitled' };
        return { ...r, [key]: value } as PersonRow;
      }),
    );
    setEditing(null);
    requestAnimationFrame(() => wrap.current?.focus({ preventScroll: true }));
  };
  const cancel = () => {
    editingRef.current = null;
    setEditing(null);
    requestAnimationFrame(() => wrap.current?.focus({ preventScroll: true }));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editing || e.target !== wrap.current) return;
    const maxR = view.length - 1;
    const maxC = COLS.length - 1;
    const move = (dr: number, dc: number) => {
      e.preventDefault();
      byKeyboard.current = true;
      setActive((a) => ({ r: Math.max(0, Math.min(maxR, a.r + dr)), c: Math.max(0, Math.min(maxC, a.c + dc)) }));
    };
    if (e.key === 'ArrowDown') move(1, 0);
    else if (e.key === 'ArrowUp') move(-1, 0);
    else if (e.key === 'ArrowRight') move(0, 1);
    else if (e.key === 'ArrowLeft') move(0, -1);
    else if (e.key === 'Enter') {
      e.preventDefault();
      const row = view[active.r];
      if (row) start(row.id, COLS[active.c].key);
    } else if (e.key === ' ') {
      e.preventDefault();
      const row = view[active.r];
      if (row) toggle(row.id);
    } else if (e.key === 'Escape') setSelected(new Set());
  };

  const sortBy = (key: Key) =>
    setSort((s) => (!s || s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));

  const addRecord = () => {
    const id = `new-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    setSort(null);
    setRows((rs) => [...rs, { id, name: '', email: '', phone: '', company: '', stage: 'Lead', arr: 0, lastContact: today, rating: 0 }]);
    setActive({ r: rows.length, c: 0 });
    setDraft('');
    editingRef.current = { id, key: 'name' };
    setEditing({ id, key: 'name' });
    byKeyboard.current = true;
  };

  const removeSelected = () => {
    const gone = rows.filter((r) => selected.has(r.id));
    setUndo({ rows, n: gone.length });
    setRows((rs) => rs.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
    setActive({ r: 0, c: 0 });
  };

  const total = rows.reduce((s, r) => s + r.arr, 0);

  const renderValue = (row: PersonRow, col: Col) => {
    switch (col.key) {
      case 'name':
        return (
          <span className="flex min-w-0 items-center gap-2.5">
            <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold', hue(row.name || '?'))}>{initials(row.name)}</span>
            <span className={cn('truncate font-medium', row.name ? 'text-ink-50' : 'text-ink-500')}>{row.name || 'Untitled'}</span>
          </span>
        );
      case 'email':
        return row.email ? <span className="truncate text-brand-300/90">{row.email}</span> : <span className="text-ink-600">Add email</span>;
      case 'phone':
        return <span className="font-mono text-[12px] tabular-nums text-ink-300">{row.phone || '—'}</span>;
      case 'company':
        return row.company ? (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/[0.04] py-0.5 pl-0.5 pr-2 ring-1 ring-white/[0.06]">
            <span className={cn('grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] text-[9px] font-bold', hue(row.company))}>{row.company[0]}</span>
            <span className="truncate text-ink-200">{row.company}</span>
          </span>
        ) : (
          <span className="text-ink-600">—</span>
        );
      case 'stage':
        return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11.5px] font-medium ring-1', STAGE_STYLE[row.stage])}>{row.stage}</span>;
      case 'arr':
        return <span className="font-mono text-[12.5px] tabular-nums text-ink-100">{row.arr ? money(row.arr) : '—'}</span>;
      case 'lastContact':
        return <span className="text-ink-300">{day(row.lastContact)}</span>;
      case 'rating':
        return (
          <span className="flex items-center gap-0.5" role="radiogroup" aria-label={`Rating for ${row.name || 'record'}`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={row.rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, rating: r.rating === n ? 0 : n } : r)));
                }}
                className="rounded p-px transition-transform hover:scale-110"
              >
                <Star className={cn('h-3.5 w-3.5', n <= row.rating ? 'fill-amber-300 text-amber-300' : 'text-ink-700')} />
              </button>
            ))}
          </span>
        );
    }
  };

  const renderEditor = (row: PersonRow, col: Col) => {
    const base = 'h-7 w-full min-w-0 rounded-md bg-ink-950 px-2 text-[13px] text-ink-50 outline-none ring-1 ring-brand-400/60';
    const keys = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitValue(draft);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
      e.stopPropagation();
    };
    if (col.edit === 'select')
      return (
        <select autoFocus value={draft} onChange={(e) => commitValue(e.target.value)} onBlur={cancel} onKeyDown={keys} className={cn(base, '[color-scheme:dark]')} aria-label={`Edit ${col.label}`}>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      );
    return (
      <input
        autoFocus
        type={col.edit === 'date' ? 'date' : 'text'}
        inputMode={col.edit === 'number' ? 'numeric' : undefined}
        value={draft}
        placeholder={col.key === 'name' ? 'Full name' : col.label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commitValue(draft)}
        onKeyDown={keys}
        className={cn(base, col.edit === 'date' && '[color-scheme:dark]')}
        aria-label={`Edit ${col.label} for ${row.name || 'new record'}`}
      />
    );
  };

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div
        ref={wrap}
        tabIndex={0}
        role="grid"
        aria-label="People"
        aria-rowcount={view.length + 1}
        onKeyDown={onKey}
        onFocus={() => setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-inset"
      >
        <div ref={scroller} className="relative max-h-[340px] overflow-auto [scrollbar-width:thin]">
          <table className="w-max min-w-full border-separate border-spacing-0 text-left text-[13px]">
            <thead>
              <tr>
                {COLS.map((col, ci) => {
                  const on = sort?.key === col.key;
                  const Icon = !on ? ArrowUpDown : sort?.dir === 'asc' ? ArrowUp : ArrowDown;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={on ? (sort?.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className={cn('sticky top-0 z-20 h-10 border-b border-white/[0.07] bg-ink-900 px-3 font-medium text-ink-400', col.width, ci === 0 && 'left-0 z-30 border-r border-r-white/[0.05]')}
                    >
                      <span className="flex items-center gap-2">
                        {ci === 0 && (
                          <input
                            ref={headAll}
                            type="checkbox"
                            checked={allOn}
                            onChange={() => setSelected(allOn ? new Set() : new Set(view.map((r) => r.id)))}
                            aria-label="Select all rows"
                            className="h-3.5 w-3.5 cursor-pointer accent-sky-400"
                          />
                        )}
                        <button onClick={() => sortBy(col.key)} className="focus-ring group/s -mx-1 flex items-center gap-1.5 rounded px-1 py-0.5 text-[12px] uppercase tracking-wider transition-colors hover:text-ink-100">
                          {col.label}
                          <Icon className={cn('h-3 w-3 transition-opacity', on ? 'text-brand-300' : 'opacity-0 group-hover/s:opacity-60')} />
                        </button>
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {view.map((row, ri) => {
                const on = selected.has(row.id);
                return (
                  <tr key={row.id} className="group" aria-selected={on}>
                    {COLS.map((col, ci) => {
                      const isActive = active.r === ri && active.c === ci;
                      const isEditing = editing?.id === row.id && editing.key === col.key;
                      return (
                        <td
                          key={col.key}
                          ref={(el) => {
                            if (el) cells.current.set(`${row.id}:${ci}`, el);
                            else cells.current.delete(`${row.id}:${ci}`);
                          }}
                          onClick={() => setActive({ r: ri, c: ci })}
                          onDoubleClick={() => start(row.id, col.key)}
                          className={cn(
                            'relative h-11 max-w-[260px] border-b border-white/[0.05] px-3 transition-colors',
                            on ? 'bg-[#0c1821] group-hover:bg-[#0f1e29]' : 'bg-ink-900 group-hover:bg-ink-850',
                            ci === 0 && 'sticky left-0 z-10 border-r border-r-white/[0.05]',
                            col.edit && 'cursor-text',
                            isActive && (focused || isEditing) && 'outline outline-1 -outline-offset-1 outline-brand-400/70',
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {ci === 0 && (
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggle(row.id)}
                                onClick={(e) => e.stopPropagation()}
                                tabIndex={-1}
                                aria-label={`Select ${row.name || 'record'}`}
                                className={cn('h-3.5 w-3.5 shrink-0 cursor-pointer accent-sky-400 transition-opacity', !on && 'opacity-40 group-hover:opacity-100')}
                              />
                            )}
                            <span className="flex min-w-0 flex-1 items-center">{isEditing ? renderEditor(row, col) : renderValue(row, col)}</span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td colSpan={COLS.length} className="sticky left-0 h-10 bg-ink-900 px-3">
                  <button onClick={addRecord} className="focus-ring flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12.5px] text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
                    <Plus className="h-3.5 w-3.5" /> Add record
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2.5 text-[12px] text-ink-500">
        <span>
          <span className="tabular-nums text-ink-300">{rows.length}</span> records
          <span className="hidden sm:inline"> · ↑↓←→ move · Enter edit · Space select</span>
        </span>
        <span>
          ARR <span className="font-mono tabular-nums text-ink-100">{money(total)}</span>
        </span>
      </div>

      {selected.size > 0 && (
        <div className="absolute bottom-12 left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-xl bg-ink-800 p-1 text-[12.5px] shadow-pop animate-fade-up">
          <span className="px-2.5 font-medium text-ink-100">
            <span className="tabular-nums text-brand-300">{selected.size}</span> selected
          </span>
          <span className="mx-0.5 h-4 w-px bg-white/10" />
          <button className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-300 transition-colors hover:bg-white/5 hover:text-ink-50">
            <Mail className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Email</span>
          </button>
          <button className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-ink-300 transition-colors hover:bg-white/5 hover:text-ink-50">
            <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={removeSelected} className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-rose-300 transition-colors hover:bg-rose-500/10">
            <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Delete</span>
          </button>
          <button onClick={() => setSelected(new Set())} aria-label="Clear selection" className="focus-ring grid h-7 w-7 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-white/5 hover:text-ink-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {undo && selected.size === 0 && (
        <div role="status" className="absolute bottom-12 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-xl bg-ink-800 py-1.5 pl-3 pr-1.5 text-[12.5px] text-ink-200 shadow-pop animate-fade-up">
          Deleted {undo.n} record{undo.n > 1 ? 's' : ''}
          <button
            onClick={() => {
              setRows(undo.rows);
              setUndo(null);
            }}
            className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-brand-300 transition-colors hover:bg-white/5"
          >
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </button>
        </div>
      )}
    </div>
  );
}

export const DEMO_PEOPLE: PersonRow[] = [
  { id: 'p1', name: 'Amara Okafor', email: 'amara@lumenpay.io', phone: '+1 415 555 0142', company: 'Lumenpay', stage: 'Customer', arr: 84000, lastContact: '2026-10-27', rating: 5 },
  { id: 'p2', name: 'Jonas Weber', email: 'jonas@kestrel.dev', phone: '+49 30 5550 1180', company: 'Kestrel Labs', stage: 'Qualified', arr: 42000, lastContact: '2026-10-24', rating: 4 },
  { id: 'p3', name: 'Priya Raman', email: 'priya@northbeam.co', phone: '+44 20 7946 0921', company: 'Northbeam', stage: 'Lead', arr: 18000, lastContact: '2026-10-21', rating: 3 },
  { id: 'p4', name: 'Mateo Silva', email: 'mateo@harborline.com', phone: '+55 11 5550 3307', company: 'Harborline', stage: 'Qualified', arr: 56000, lastContact: '2026-10-19', rating: 4 },
  { id: 'p5', name: 'Hana Kobayashi', email: 'hana@sorabase.jp', phone: '+81 3 5550 7781', company: 'Sorabase', stage: 'Customer', arr: 120000, lastContact: '2026-10-28', rating: 5 },
  { id: 'p6', name: 'Elliot Grant', email: 'elliot@quillstack.io', phone: '+1 646 555 0193', company: 'Quillstack', stage: 'Churned', arr: 9000, lastContact: '2026-09-02', rating: 2 },
  { id: 'p7', name: 'Sofia Marin', email: 'sofia@verdantos.com', phone: '+34 91 555 0144', company: 'Verdant OS', stage: 'Lead', arr: 24000, lastContact: '2026-10-15', rating: 3 },
  { id: 'p8', name: 'Kwame Mensah', email: 'kwame@tidewater.ai', phone: '+233 30 555 0175', company: 'Tidewater AI', stage: 'Qualified', arr: 67000, lastContact: '2026-10-26', rating: 4 },
  { id: 'p9', name: 'Lena Fischer', email: 'lena@brightmill.de', phone: '+49 89 5550 2240', company: 'Brightmill', stage: 'Customer', arr: 38000, lastContact: '2026-10-12', rating: 4 },
  { id: 'p10', name: 'Ravi Menon', email: 'ravi@atlasfreight.in', phone: '+91 80 5550 6612', company: 'Atlas Freight', stage: 'Lead', arr: 15000, lastContact: '2026-10-08', rating: 2 },
];

export function RecordTableDemo() {
  return (
    <div className="w-full max-w-[920px]">
      <RecordTable initialRows={DEMO_PEOPLE} initialSelected={['p2', 'p4']} />
    </div>
  );
}
