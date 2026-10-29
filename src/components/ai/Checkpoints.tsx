import { useEffect, useRef, useState } from 'react';
import { FileCode2, History, Loader2, Redo2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';

export type CheckpointFile = { path: string; add: number; del: number };
export type Checkpoint = { id: string; prompt: string; time: string; files: CheckpointFile[] };

export type CheckpointsProps = {
  checkpoints: Checkpoint[];
  onRestore?: (id: string | null) => void;
  className?: string;
};

const sum = (files: CheckpointFile[], k: 'add' | 'del') => files.reduce((a, f) => a + f[k], 0);

export function Checkpoints({ checkpoints, onRestore, className }: CheckpointsProps) {
  const latest = checkpoints.length - 1;
  const [current, setCurrent] = useState(latest);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const restore = (i: number) => {
    setConfirm(null);
    setBusy(i);
    timer.current = window.setTimeout(() => {
      setBusy(null);
      setCurrent(i);
      onRestore?.(i === latest ? null : checkpoints[i].id);
    }, 700);
  };

  const reverted = checkpoints.slice(current + 1);
  const revertedFiles = new Set(reverted.flatMap((c) => c.files.map((f) => f.path))).size;

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-ink-200 shadow-hairline">
          <History className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-100">Checkpoints</p>
          <p className="truncate text-xs text-ink-500">Saved automatically before every agent edit</p>
        </div>
        <span className="font-mono text-xs tabular-nums text-ink-500">{checkpoints.length}</span>
      </div>

      <div className={cn('grid transition-[grid-template-rows] duration-500 ease-smooth', current < latest ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-brand-500/15 bg-brand-500/[0.07] px-4 py-2.5">
            <RotateCcw className="h-3.5 w-3.5 shrink-0 text-brand-300" />
            <p className="min-w-0 flex-1 text-xs text-ink-200">
              Restored to <span className="font-mono text-brand-200">#{current + 1}</span>
              <span className="text-ink-400">
                {' '}
                · {reverted.length} later checkpoint{reverted.length === 1 ? '' : 's'} reverted ({revertedFiles} files)
              </span>
            </p>
            <button
              type="button"
              onClick={() => restore(latest)}
              className="focus-ring flex h-7 items-center gap-1.5 rounded-md bg-white/5 px-2.5 text-xs font-medium text-ink-100 transition-all hover:bg-white/10 active:scale-95"
            >
              <Redo2 className="h-3.5 w-3.5" /> Redo
            </button>
          </div>
        </div>
      </div>

      <ol className="relative px-4 py-3">
        {checkpoints.map((c, i) => {
          const gone = i > current;
          const isCurrent = i === current;
          const add = sum(c.files, 'add');
          const del = sum(c.files, 'del');
          return (
            <li key={c.id} className="relative flex gap-3 pb-1">
              <div className="relative flex w-7 shrink-0 flex-col items-center">
                <span
                  className={cn(
                    'relative z-10 mt-2.5 flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] transition-all duration-500',
                    isCurrent ? 'bg-brand-500 text-white shadow-glow' : gone ? 'bg-ink-850 text-ink-600 shadow-hairline' : 'bg-ink-800 text-ink-300 shadow-hairline',
                  )}
                >
                  {busy === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : i + 1}
                </span>
                {i < latest && <span className={cn('absolute bottom-0 top-9 w-px transition-colors duration-500', i >= current ? 'bg-white/5' : 'bg-white/10')} />}
              </div>
              <div className={cn('group min-w-0 flex-1 rounded-xl px-3 py-2.5 transition-all duration-500', gone ? 'opacity-40' : 'hover:bg-white/[0.03]', isCurrent && 'bg-white/[0.03]')}>
                <div className="flex items-start gap-2">
                  <p className={cn('min-w-0 flex-1 text-sm leading-snug', gone ? 'text-ink-400 line-through decoration-ink-600' : 'text-ink-100')}>{c.prompt}</p>
                  {isCurrent ? (
                    <span className="shrink-0 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-medium text-brand-300">{i === latest ? 'Now' : 'Current'}</span>
                  ) : gone ? (
                    <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-ink-500">Reverted</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirm(confirm === i ? null : i)}
                      aria-expanded={confirm === i}
                      className="focus-ring flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-ink-400 transition-all hover:bg-white/5 hover:text-ink-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore
                    </button>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-500">
                  <span className="font-mono tabular-nums">{c.time}</span>
                  <span>
                    {c.files.length} file{c.files.length === 1 ? '' : 's'}
                  </span>
                  <span className="font-mono tabular-nums">
                    <span className="text-emerald-400">+{add}</span> <span className="text-rose-400">−{del}</span>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.files.slice(0, 2).map((f) => (
                    <span key={f.path} className="flex min-w-0 max-w-full items-center gap-1 rounded-md bg-ink-950/60 px-1.5 py-0.5 font-mono text-[10.5px] text-ink-400 shadow-hairline">
                      <FileCode2 className="h-3 w-3 shrink-0 text-ink-500" />
                      <span className="truncate">{f.path}</span>
                    </span>
                  ))}
                  {c.files.length > 2 && <span className="rounded-md px-1.5 py-0.5 text-[10.5px] text-ink-500">+{c.files.length - 2} more</span>}
                </div>
                <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-smooth', confirm === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <div className="overflow-hidden">
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-amber-500/[0.07] p-2.5 shadow-[0_0_0_1px_rgba(245,158,11,0.18)]">
                      <p className="min-w-0 flex-1 text-xs text-amber-200/90">Files changed after #{i + 1} will be reverted. You can redo this.</p>
                      <div className="flex gap-1.5">
                        <button type="button" tabIndex={confirm === i ? 0 : -1} onClick={() => setConfirm(null)} className="focus-ring h-7 rounded-md px-2.5 text-xs text-ink-400 transition-colors hover:text-ink-100">
                          Cancel
                        </button>
                        <button
                          type="button"
                          tabIndex={confirm === i ? 0 : -1}
                          onClick={() => restore(i)}
                          className="focus-ring flex h-7 items-center gap-1.5 rounded-md bg-ink-50 px-2.5 text-xs font-medium text-ink-950 transition-all hover:bg-white active:scale-95"
                        >
                          <RotateCcw className="h-3 w-3" /> Restore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const HISTORY: Checkpoint[] = [
  { id: 'c1', prompt: 'Scaffold a Next.js app with Tailwind and auth', time: '10:02', files: [{ path: 'app/layout.tsx', add: 48, del: 0 }, { path: 'lib/auth.ts', add: 86, del: 0 }, { path: 'app/page.tsx', add: 31, del: 0 }] },
  { id: 'c2', prompt: 'Add a pricing page with a monthly and yearly toggle', time: '10:09', files: [{ path: 'app/pricing/page.tsx', add: 142, del: 0 }, { path: 'components/PriceToggle.tsx', add: 58, del: 0 }] },
  { id: 'c3', prompt: 'Connect Stripe checkout to the Pro plan', time: '10:17', files: [{ path: 'lib/stripe.ts', add: 64, del: 0 }, { path: 'app/api/checkout/route.ts', add: 41, del: 0 }, { path: '.env.example', add: 3, del: 0 }] },
  { id: 'c4', prompt: 'Refactor the pricing cards into a responsive grid', time: '10:24', files: [{ path: 'components/PricingGrid.tsx', add: 88, del: 12 }, { path: 'app/pricing/page.tsx', add: 6, del: 74 }] },
  { id: 'c5', prompt: 'Make the hero full-bleed with a video background', time: '10:31', files: [{ path: 'components/Hero.tsx', add: 72, del: 20 }, { path: 'app/page.tsx', add: 37, del: 9 }] },
];

export function CheckpointsDemo() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <Checkpoints checkpoints={HISTORY} />
    </div>
  );
}
