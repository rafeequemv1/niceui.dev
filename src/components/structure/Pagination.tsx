import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Page numbers to show, with 'gap' where pages are skipped. Always includes first, last and `siblings` around the current page. */
export function paginationRange(page: number, pageCount: number, siblings = 1): Array<number | 'gap'> {
  const total = siblings * 2 + 5; // first, last, current, two gaps
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showLeftGap = left > 3;
  const showRightGap = right < pageCount - 2;
  if (!showLeftGap) {
    const count = 3 + siblings * 2;
    return [...Array.from({ length: count }, (_, i) => i + 1), 'gap', pageCount];
  }
  if (!showRightGap) {
    const count = 3 + siblings * 2;
    return [1, 'gap', ...Array.from({ length: count }, (_, i) => pageCount - count + i + 1)];
  }
  return [1, 'gap', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), 'gap', pageCount];
}

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current one. */
  siblings?: number;
  /** Show first/last buttons. */
  showEdges?: boolean;
  className?: string;
};

const btn =
  'focus-ring relative z-10 grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm tabular-nums transition-colors duration-200 disabled:pointer-events-none disabled:opacity-35';

/**
 * Numbered pagination with ellipsis, previous/next, first/last and a sliding
 * active indicator. Arrow keys move between pages when it has focus.
 */
export function Pagination({ page, pageCount, onPageChange, siblings = 1, showEdges = true, className }: PaginationProps) {
  const items = paginationRange(page, pageCount, siblings);
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
  }, [page, pageCount, siblings]);

  const go = (p: number) => onPageChange(Math.min(pageCount, Math.max(1, p)));
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(page - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(page + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(pageCount);
    }
  };

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)} onKeyDown={onKey}>
      {showEdges && (
        <button className={cn(btn, 'text-ink-400 hover:bg-white/[0.05] hover:text-ink-100')} onClick={() => go(1)} disabled={page === 1} aria-label="First page">
          <ChevronsLeft className="h-4 w-4" />
        </button>
      )}
      <button className={cn(btn, 'gap-1 text-ink-300 hover:bg-white/[0.05] hover:text-ink-50 sm:px-3')} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>
      <div ref={listRef} className="relative flex items-center gap-1">
        {pill && (
          <span
            aria-hidden
            className="absolute top-0 h-9 rounded-lg bg-brand-500/15 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.35)] transition-all duration-300 ease-spring motion-reduce:transition-none"
            style={{ left: pill.x, width: pill.w }}
          />
        )}
        {items.map((it, i) =>
          it === 'gap' ? (
            <span key={`gap-${i}`} aria-hidden className="grid h-9 w-7 place-items-center text-sm text-ink-500">
              …
            </span>
          ) : (
            <button
              key={it}
              onClick={() => go(it)}
              aria-label={`Page ${it}`}
              aria-current={it === page ? 'page' : undefined}
              className={cn(btn, it === page ? 'font-medium text-brand-200' : 'text-ink-300 hover:bg-white/[0.05] hover:text-ink-50')}
            >
              {it}
            </button>
          ),
        )}
      </div>
      <button className={cn(btn, 'gap-1 text-ink-300 hover:bg-white/[0.05] hover:text-ink-50 sm:px-3')} onClick={() => go(page + 1)} disabled={page === pageCount} aria-label="Next page">
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
      {showEdges && (
        <button className={cn(btn, 'text-ink-400 hover:bg-white/[0.05] hover:text-ink-100')} onClick={() => go(pageCount)} disabled={page === pageCount} aria-label="Last page">
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}

/** A compact "‹ 3 of 12 ›" control for small screens. */
export function CompactPagination({ page, pageCount, onPageChange, className }: Omit<PaginationProps, 'siblings' | 'showEdges'>) {
  const go = (p: number) => onPageChange(Math.min(pageCount, Math.max(1, p)));
  return (
    <nav aria-label="Pagination" className={cn('inline-flex items-center gap-1 rounded-xl bg-ink-900 p-1 shadow-card', className)}>
      <button className={cn(btn, 'text-ink-300 hover:bg-white/[0.05] hover:text-ink-50')} onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[5.5rem] text-center text-sm tabular-nums text-ink-300" aria-live="polite">
        <span key={page} className="inline-block animate-fade-up font-medium text-ink-50">
          {page}
        </span>{' '}
        of {pageCount}
      </span>
      <button className={cn(btn, 'text-ink-300 hover:bg-white/[0.05] hover:text-ink-50')} onClick={() => go(page + 1)} disabled={page === pageCount} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/** Rows-per-page select and a "go to page" field. */
export function PaginationFooter({
  page,
  pageCount,
  pageSize,
  total,
  sizes = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  sizes?: number[];
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const [draft, setDraft] = useState(String(page));
  useEffect(() => setDraft(String(page)), [page]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) onPageChange(Math.min(pageCount, Math.max(1, n)));
    else setDraft(String(page));
  };
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-400">
      <p className="tabular-nums">
        <span className="text-ink-200">
          {from}–{to}
        </span>{' '}
        of {total.toLocaleString()}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="focus-ring h-8 rounded-lg border border-white/[0.08] bg-ink-900 px-2 text-xs text-ink-100"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={submit} className="flex items-center gap-2">
          <label htmlFor="pg-goto">Go to</label>
          <input
            id="pg-goto"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
            onBlur={submit}
            className="focus-ring h-8 w-12 rounded-lg border border-white/[0.08] bg-ink-900 text-center text-xs tabular-nums text-ink-100"
            aria-label={`Go to page, 1 to ${pageCount}`}
          />
        </form>
      </div>
    </div>
  );
}

const ROWS = Array.from({ length: 247 }, (_, i) => {
  const names = ['Northwind', 'Halcyon', 'Quiet Hours', 'Arcline', 'Tessera', 'Basalt', 'Orbitly', 'Ferrous', 'Lumen & Co', 'Quillon'];
  const status = ['Paid', 'Due', 'Paid', 'Refunded', 'Paid'];
  return { id: 1000 + i, name: names[i % names.length], status: status[(i * 7) % status.length], amount: ((i * 3719) % 9000) + 120 };
});

export function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const pageCount = Math.ceil(ROWS.length / size);
  const [compact, setCompact] = useState(3);
  const rows = ROWS.slice((page - 1) * size, page * size).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="rounded-2xl bg-ink-900 p-4 shadow-card sm:p-5">
        <div className="mb-4 overflow-hidden rounded-xl border border-white/[0.06] text-[13px]">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-white/[0.04] px-3.5 py-2.5 last:border-0">
              <span className="font-mono text-[11px] text-ink-500">#{r.id}</span>
              <span className="truncate text-ink-100">{r.name}</span>
              <span className={cn('text-xs', r.status === 'Paid' ? 'text-emerald-400' : r.status === 'Due' ? 'text-amber-300' : 'text-ink-400')}>{r.status}</span>
              <span className="w-16 text-right font-mono text-xs text-ink-200">${r.amount.toLocaleString()}</span>
            </div>
          ))}
          <p className="px-3.5 py-2 text-[11px] text-ink-500">Showing the first 5 rows of this page</p>
        </div>
        <PaginationFooter
          page={page}
          pageCount={pageCount}
          pageSize={size}
          total={ROWS.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => {
            setSize(s);
            setPage(1);
          }}
        />
        <div className="mt-4 overflow-x-auto [scrollbar-width:none]">
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} className="w-max" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-100">Compact</p>
          <p className="text-xs text-ink-500">For phones, carousels and dialogs.</p>
        </div>
        <CompactPagination page={compact} pageCount={12} onPageChange={setCompact} />
      </div>
    </div>
  );
}
