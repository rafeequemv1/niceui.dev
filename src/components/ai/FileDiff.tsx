import { useState } from 'react';
import { Check, ChevronRight, FileText, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type DiffLine = { type: 'add' | 'del' | 'ctx'; text: string };
export type DiffHunk = { header: string; oldStart: number; newStart: number; lines: DiffLine[] };

export type FileDiffProps = {
  path: string;
  hunks: DiffHunk[];
  onResolve?: (accepted: boolean) => void;
  className?: string;
};

function StatBar({ add, del }: { add: number; del: number }) {
  const total = add + del || 1;
  const greens = Math.round((add / total) * 5);
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={cn('h-2 w-2 rounded-[2px]', i < greens ? 'bg-emerald-400' : 'bg-rose-400')} />
      ))}
    </span>
  );
}

function Hunk({ hunk }: { hunk: DiffHunk }) {
  const [open, setOpen] = useState(true);
  let o = hunk.oldStart;
  let n = hunk.newStart;
  const rows = hunk.lines.map((l) => {
    const row = { ...l, old: l.type === 'add' ? '' : String(o), new: l.type === 'del' ? '' : String(n) };
    if (l.type !== 'add') o += 1;
    if (l.type !== 'del') n += 1;
    return row;
  });

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex w-full items-center gap-2 bg-brand-500/[0.06] px-3 py-1.5 text-left font-mono text-[11px] text-brand-300 transition-colors hover:bg-brand-500/10"
      >
        <ChevronRight className={cn('h-3.5 w-3.5 transition-transform duration-300 ease-spring', open && 'rotate-90')} />
        {hunk.header}
      </button>
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-smooth', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto py-1 font-mono text-[12px] leading-[22px]">
            {rows.map((r, i) => (
              <div
                key={i}
                className={cn(
                  'flex min-w-max',
                  r.type === 'add' && 'bg-emerald-500/10',
                  r.type === 'del' && 'bg-rose-500/10',
                )}
              >
                <span className="w-9 shrink-0 select-none pr-2 text-right text-ink-600">{r.old}</span>
                <span className="w-9 shrink-0 select-none pr-2 text-right text-ink-600">{r.new}</span>
                <span
                  className={cn(
                    'w-5 shrink-0 select-none text-center',
                    r.type === 'add' ? 'text-emerald-400' : r.type === 'del' ? 'text-rose-400' : 'text-ink-700',
                  )}
                >
                  {r.type === 'add' ? '+' : r.type === 'del' ? '−' : ' '}
                </span>
                <span className={cn('whitespace-pre pr-4', r.type === 'add' ? 'text-emerald-100' : r.type === 'del' ? 'text-rose-200/80' : 'text-ink-400')}>
                  {r.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FileDiff({ path, hunks, onResolve, className }: FileDiffProps) {
  const [state, setState] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const all = hunks.flatMap((h) => h.lines);
  const add = all.filter((l) => l.type === 'add').length;
  const del = all.filter((l) => l.type === 'del').length;

  const resolve = (ok: boolean) => {
    setState(ok ? 'accepted' : 'rejected');
    onResolve?.(ok);
  };

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card transition-shadow duration-500',
        state === 'accepted' && 'shadow-[0_0_0_1px_rgba(52,211,153,0.3),0_8px_24px_-8px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/5 px-3 py-2.5">
        <FileText className="h-4 w-4 shrink-0 text-ink-400" />
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-100">{path}</span>
        <span className="hidden items-center gap-2 font-mono text-xs sm:flex">
          <span className="text-emerald-400">+{add}</span>
          <span className="text-rose-400">−{del}</span>
          <StatBar add={add} del={del} />
        </span>
        <div className="relative flex h-7 w-[148px] justify-end">
          <div className={cn('absolute inset-0 flex justify-end gap-1.5 transition-all duration-300', state !== 'pending' && 'pointer-events-none scale-90 opacity-0')}>
            <button
              onClick={() => resolve(false)}
              className="focus-ring flex h-7 items-center gap-1 rounded-md px-2 text-xs text-ink-300 shadow-hairline transition-all hover:bg-rose-500/10 hover:text-rose-300 active:scale-95"
            >
              <X className="h-3.5 w-3.5" /> Reject
            </button>
            <button
              onClick={() => resolve(true)}
              className="focus-ring flex h-7 items-center gap-1 rounded-md bg-emerald-500 px-2 text-xs font-medium text-ink-950 transition-all hover:bg-emerald-400 active:scale-95"
            >
              <Check className="h-3.5 w-3.5" /> Accept
            </button>
          </div>
          {state !== 'pending' && (
            <button
              onClick={() => setState('pending')}
              title="Undo"
              className={cn(
                'focus-ring flex h-7 animate-scale-in items-center gap-1 rounded-md px-2 text-xs font-medium',
                state === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300',
              )}
            >
              {state === 'accepted' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {state === 'accepted' ? 'Accepted' : 'Rejected'}
            </button>
          )}
        </div>
      </div>
      <div className={cn('grid transition-all duration-500 ease-smooth', state === 'rejected' ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]')}>
        <div className="overflow-hidden">
          {hunks.map((h, i) => (
            <Hunk key={i} hunk={h} />
          ))}
        </div>
      </div>
    </div>
  );
}

const HUNKS: DiffHunk[] = [
  {
    header: '@@ -12,7 +12,9 @@ export async function getInvoices(orgId: string)',
    oldStart: 12,
    newStart: 12,
    lines: [
      { type: 'ctx', text: '  const db = await connect();' },
      { type: 'del', text: '  const rows = await db.query(`SELECT * FROM invoices WHERE org = ${orgId}`);' },
      { type: 'add', text: "  const rows = await db.query('SELECT * FROM invoices WHERE org = $1', [orgId]);" },
      { type: 'add', text: '  if (!rows.length) return [];' },
      { type: 'ctx', text: '  return rows.map(toInvoice);' },
      { type: 'ctx', text: '}' },
    ],
  },
  {
    header: '@@ -41,6 +43,8 @@ function toInvoice(row: InvoiceRow)',
    oldStart: 41,
    newStart: 43,
    lines: [
      { type: 'ctx', text: '    id: row.id,' },
      { type: 'del', text: '    total: row.total,' },
      { type: 'add', text: '    total: Number(row.total_cents) / 100,' },
      { type: 'add', text: "    currency: row.currency ?? 'USD'," },
      { type: 'add', text: '    dueAt: new Date(row.due_at),' },
      { type: 'ctx', text: '  };' },
    ],
  },
];

export function FileDiffDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <FileDiff path="src/server/billing/invoices.ts" hunks={HUNKS} />
    </div>
  );
}
