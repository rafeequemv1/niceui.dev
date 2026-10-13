import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, type BadgeTone } from './Badge';
import { Checkbox } from './Checkbox';
import { Button } from './Button';

type Status = 'Paid' | 'Pending' | 'Overdue' | 'Refunded';
type Invoice = { id: string; customer: string; email: string; amount: number; status: Status; date: string };

const TONE: Record<Status, BadgeTone> = { Paid: 'success', Pending: 'warning', Overdue: 'error', Refunded: 'neutral' };

const INVOICES: Invoice[] = [
  { id: 'INV-2041', customer: 'Northwind Labs', email: 'billing@northwind.io', amount: 4820, status: 'Paid', date: '2025-02-14' },
  { id: 'INV-2040', customer: 'Acme Corp', email: 'ap@acme.com', amount: 1299, status: 'Pending', date: '2025-02-12' },
  { id: 'INV-2039', customer: 'Globex', email: 'finance@globex.co', amount: 9120, status: 'Overdue', date: '2025-02-09' },
  { id: 'INV-2038', customer: 'Initech', email: 'pay@initech.dev', amount: 640, status: 'Paid', date: '2025-02-07' },
  { id: 'INV-2037', customer: 'Umbrella Health', email: 'ops@umbrella.health', amount: 2310, status: 'Refunded', date: '2025-02-03' },
  { id: 'INV-2036', customer: 'Hooli', email: 'invoices@hooli.xyz', amount: 15400, status: 'Paid', date: '2025-01-30' },
  { id: 'INV-2035', customer: 'Stark Industries', email: 'ar@stark.com', amount: 7850, status: 'Pending', date: '2025-01-27' },
  { id: 'INV-2034', customer: 'Wayne Logistics', email: 'billing@wayne.co', amount: 3200, status: 'Paid', date: '2025-01-22' },
  { id: 'INV-2033', customer: 'Soylent', email: 'accounts@soylent.io', amount: 980, status: 'Overdue', date: '2025-01-18' },
  { id: 'INV-2032', customer: 'Vandelay Imports', email: 'art@vandelay.com', amount: 5600, status: 'Paid', date: '2025-01-15' },
  { id: 'INV-2031', customer: 'Cyberdyne', email: 'ap@cyberdyne.ai', amount: 12750, status: 'Pending', date: '2025-01-11' },
  { id: 'INV-2030', customer: 'Tyrell Systems', email: 'fin@tyrell.systems', amount: 2045, status: 'Paid', date: '2025-01-06' },
];

type Key = 'customer' | 'amount' | 'status' | 'date';
const PAGE = 5;
const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const day = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function SortHeader({ label, k, sort, onSort, align }: { label: string; k: Key; sort: { key: Key; dir: 1 | -1 }; onSort: (k: Key) => void; align?: 'right' }) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
  return (
    <th className={cn('px-4 py-3 font-medium', align === 'right' && 'text-right')} aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button
        onClick={() => onSort(k)}
        className={cn('focus-ring group inline-flex items-center gap-1 rounded transition-colors', active ? 'text-ink-100' : 'hover:text-ink-200')}
      >
        {label}
        <Icon className={cn('h-3.5 w-3.5 transition-all duration-300', active ? 'text-brand-300' : 'opacity-0 group-hover:opacity-100')} />
      </button>
    </th>
  );
}

export function TableDemo() {
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: 'date', dir: -1 });
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      [...INVOICES].sort((a, b) => {
        const x = a[sort.key];
        const y = b[sort.key];
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
      }),
    [sort],
  );
  const pages = Math.ceil(rows.length / PAGE);
  const view = rows.slice(page * PAGE, page * PAGE + PAGE);
  const allOnPage = view.every((r) => sel.includes(r.id));
  const someOnPage = view.some((r) => sel.includes(r.id));
  const selTotal = INVOICES.filter((r) => sel.includes(r.id)).reduce((s, r) => s + r.amount, 0);

  const onSort = (key: Key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : key === 'amount' || key === 'date' ? -1 : 1 }));
  const toggleAll = () =>
    setSel((s) => (allOnPage ? s.filter((id) => !view.some((r) => r.id === id)) : [...new Set([...s, ...view.map((r) => r.id)])]));

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-ink-900 shadow-card">
      <div className="flex h-14 items-center justify-between border-b border-white/5 px-4">
        <div className="relative h-5 flex-1 overflow-hidden text-sm">
          <p className={cn('absolute inset-0 font-medium text-ink-50 transition-all duration-300 ease-smooth', sel.length > 0 && '-translate-y-full opacity-0')}>
            Invoices <span className="ml-1 text-ink-500">{INVOICES.length}</span>
          </p>
          <p className={cn('absolute inset-0 text-ink-200 transition-all duration-300 ease-smooth', !sel.length && 'translate-y-full opacity-0')}>
            <span className="font-medium text-ink-50">{sel.length} selected</span> · {money(selTotal)}
          </p>
        </div>
        <Button size="sm" variant="secondary" leftIcon={<Download />} disabled={!sel.length}>
          Export
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-ink-400">
            <tr className="border-b border-white/5">
              <th className="w-10 py-3 pl-4">
                <Checkbox checked={allOnPage} indeterminate={!allOnPage && someOnPage} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <SortHeader label="Customer" k="customer" sort={sort} onSort={onSort} />
              <SortHeader label="Status" k="status" sort={sort} onSort={onSort} />
              <SortHeader label="Date" k="date" sort={sort} onSort={onSort} />
              <SortHeader label="Amount" k="amount" sort={sort} onSort={onSort} align="right" />
              <th className="w-10" />
            </tr>
          </thead>
          <tbody key={`${page}-${sort.key}-${sort.dir}`}>
            {view.map((r, i) => {
              const on = sel.includes(r.id);
              return (
                <tr
                  key={r.id}
                  className={cn(
                    'group animate-fade-in border-b border-white/5 transition-colors last:border-0',
                    on ? 'bg-brand-500/[0.06]' : 'hover:bg-white/[0.025]',
                  )}
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <td className="py-3 pl-4">
                    <Checkbox checked={on} onChange={(c) => setSel((s) => (c ? [...s, r.id] : s.filter((x) => x !== r.id)))} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-300">{r.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-100">{r.customer}</p>
                    <p className="text-xs text-ink-500">{r.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={TONE[r.status]} dot>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-300">{day(r.date)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums text-ink-50">{money(r.amount)}</td>
                  <td className="pr-3">
                    <button
                      aria-label="Row actions"
                      className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 opacity-0 transition hover:bg-white/5 hover:text-ink-100 focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-xs text-ink-400">
        <span>
          Showing {page * PAGE + 1}–{Math.min((page + 1) * PAGE, rows.length)} of {rows.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-white/5 hover:text-ink-100 active:scale-90 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                'focus-ring h-7 min-w-[28px] rounded-md tabular-nums transition-all',
                i === page ? 'bg-ink-800 font-medium text-ink-50 shadow-hairline' : 'hover:bg-white/5 hover:text-ink-100',
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            aria-label="Next page"
            disabled={page === pages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-white/5 hover:text-ink-100 active:scale-90 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
