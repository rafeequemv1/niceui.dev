import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Heart, MessageCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SkeletonVariant = 'shimmer' | 'pulse';

export type SkeletonProps = {
  className?: string;
  /** Shimmer sweeps a highlight across; pulse fades in and out. */
  variant?: SkeletonVariant;
  /** Make it a circle (avatars). */
  circle?: boolean;
  style?: CSSProperties;
};

const SKELETON_CSS = `@keyframes sk-sweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}@keyframes sk-pulse{0%,100%{opacity:1}50%{opacity:.45}}@media (prefers-reduced-motion:reduce){.sk-anim,.sk-anim::after{animation:none!important}}`;

/** One placeholder block. Size it with className (h-4 w-32, aspect-video…). */
export function Skeleton({ className, variant = 'shimmer', circle, style }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={{ ...style, animation: variant === 'pulse' ? 'sk-pulse 1.6s ease-in-out infinite' : undefined }}
      className={cn(
        'sk-anim relative block overflow-hidden bg-white/[0.06]',
        circle ? 'rounded-full' : 'rounded-md',
        variant === 'shimmer' && "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.07] after:to-transparent after:content-[''] after:[animation:sk-sweep_1.5s_ease-in-out_infinite]",
        className,
      )}
    />
  );
}

/** Wrap placeholders so screen readers hear "Loading" once instead of nothing. */
export function SkeletonGroup({ children, loading = true, label = 'Loading', className }: { children: ReactNode; loading?: boolean; label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy={loading} className={className}>
      <style>{SKELETON_CSS}</style>
      <span className="sr-only">{loading ? `${label}…` : 'Loaded'}</span>
      {children}
    </div>
  );
}

/* ── preset layouts ─────────────────────────────────────────────── */

type PresetProps = { variant?: SkeletonVariant; className?: string };

export function SkeletonCard({ variant, className }: PresetProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <Skeleton variant={variant} className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton variant={variant} className="h-4 w-3/4" />
        <Skeleton variant={variant} className="h-3 w-full" />
        <Skeleton variant={variant} className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonListRow({ variant, className }: PresetProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <Skeleton variant={variant} circle className="h-9 w-9 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton variant={variant} className="h-3 w-1/2" />
        <Skeleton variant={variant} className="h-3 w-4/5" />
      </div>
      <Skeleton variant={variant} className="h-6 w-14 shrink-0 rounded-full" />
    </div>
  );
}

export function SkeletonProfile({ variant, className }: PresetProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-2xl bg-ink-900 p-6 shadow-card', className)}>
      <Skeleton variant={variant} circle className="h-16 w-16" />
      <Skeleton variant={variant} className="h-4 w-32" />
      <Skeleton variant={variant} className="h-3 w-44" />
      <div className="mt-2 flex gap-2">
        <Skeleton variant={variant} className="h-8 w-20 rounded-lg" />
        <Skeleton variant={variant} className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTable({ variant, rows = 4, className }: PresetProps & { rows?: number }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-white/[0.06]', className)}>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant={variant} className="h-3 w-2/3" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/[0.04] px-4 py-3.5 last:border-0">
          <Skeleton variant={variant} className="h-3 w-4/5" />
          <Skeleton variant={variant} className="h-3 w-1/2" />
          <Skeleton variant={variant} className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChat({ variant, className }: PresetProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-end gap-2">
        <Skeleton variant={variant} circle className="h-7 w-7 shrink-0" />
        <Skeleton variant={variant} className="h-14 w-3/5 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton variant={variant} className="h-9 w-2/5 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex items-end gap-2">
        <Skeleton variant={variant} circle className="h-7 w-7 shrink-0" />
        <Skeleton variant={variant} className="h-20 w-4/5 rounded-2xl rounded-bl-md" />
      </div>
    </div>
  );
}

export function SkeletonArticle({ variant, className }: PresetProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton variant={variant} className="h-6 w-4/5" />
      <Skeleton variant={variant} className="h-6 w-1/2" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton variant={variant} circle className="h-6 w-6" />
        <Skeleton variant={variant} className="h-3 w-28" />
      </div>
      <div className="space-y-2 pt-2">
        {[100, 96, 92, 98, 70].map((w, i) => (
          <Skeleton key={i} variant={variant} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ── demo ───────────────────────────────────────────────────────── */

function PostCard() {
  return (
    <article className="overflow-hidden rounded-2xl bg-ink-900 shadow-card">
      <div className="aspect-[16/9] w-full bg-[radial-gradient(120%_90%_at_20%_10%,#38bdf8_0%,#0c4a6e_45%,#000_100%)]" />
      <div className="p-4">
        <p className="text-[15px] font-medium text-ink-50">Designing calm loading states</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">Placeholders that match the final layout make waiting feel shorter and stop the page from jumping.</p>
      </div>
    </article>
  );
}

const PEOPLE = [
  ['Maya Lin', 'Shipped the onboarding redesign', 'Design'],
  ['Omar Haddad', 'Reviewed 4 pull requests', 'Eng'],
  ['Ines Duarte', 'Closed the Q3 roadmap', 'Product'],
];

function ChatDone() {
  return (
    <div className="space-y-3 text-[13px]">
      <div className="flex items-end gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500/20 text-[11px] text-brand-200">AI</span>
        <p className="max-w-[75%] rounded-2xl rounded-bl-md bg-ink-850 px-3.5 py-2.5 text-ink-200">Your report is ready. Revenue is up 12% this month.</p>
      </div>
      <div className="flex justify-end">
        <p className="rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2 text-ink-950">Show me by region</p>
      </div>
      <div className="flex items-end gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500/20 text-[11px] text-brand-200">AI</span>
        <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-ink-850 px-3.5 py-2.5 text-ink-200">Europe leads at +18%, then North America at +11% and APAC at +6%.</p>
      </div>
    </div>
  );
}

function Swap({ loading, skeleton, children }: { loading: boolean; skeleton: ReactNode; children: ReactNode }) {
  return (
    <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
      <div aria-hidden={!loading} className={cn('transition-opacity duration-500 ease-smooth', loading ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        {skeleton}
      </div>
      <div aria-hidden={loading} className={cn('transition-all duration-500 ease-smooth', loading ? 'pointer-events-none translate-y-1 opacity-0' : 'translate-y-0 opacity-100')}>
        {children}
      </div>
    </div>
  );
}

export function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<SkeletonVariant>('shimmer');
  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setLoading(false), 2200);
    return () => window.clearTimeout(id);
  }, [loading]);

  return (
    <SkeletonGroup className="mx-auto w-full max-w-4xl" loading={loading}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Animation" className="flex rounded-xl bg-ink-900 p-1 shadow-card">
          {(['shimmer', 'pulse'] as const).map((v) => (
            <button
              key={v}
              role="radio"
              aria-checked={variant === v}
              onClick={() => setVariant(v)}
              className={cn('focus-ring rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors', variant === v ? 'bg-ink-800 text-ink-50' : 'text-ink-400 hover:text-ink-200')}
            >
              {v}
            </button>
          ))}
        </div>
        <button onClick={() => setLoading(true)} disabled={loading} className="focus-ring flex items-center gap-1.5 rounded-xl bg-ink-900 px-3.5 py-2 text-xs font-medium text-ink-200 shadow-card transition-colors hover:text-ink-50 disabled:opacity-50">
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> {loading ? 'Loading…' : 'Reload'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Swap loading={loading} skeleton={<SkeletonCard variant={variant} />}>
          <PostCard />
        </Swap>

        <div className="rounded-2xl bg-ink-900 px-4 py-1 shadow-card">
          <Swap
            loading={loading}
            skeleton={
              <div className="divide-y divide-white/[0.05]">
                {[0, 1, 2].map((i) => (
                  <SkeletonListRow key={i} variant={variant} />
                ))}
              </div>
            }
          >
            <ul className="divide-y divide-white/[0.05]">
              {PEOPLE.map(([n, t, tag]) => (
                <li key={n} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-800 text-xs text-ink-200">{n.split(' ').map((p) => p[0]).join('')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink-100">{n}</p>
                    <p className="truncate text-xs text-ink-400">{t}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] text-brand-300">{tag}</span>
                </li>
              ))}
            </ul>
          </Swap>
        </div>

        <div className="rounded-2xl bg-ink-900 p-4 shadow-card">
          <Swap loading={loading} skeleton={<SkeletonChat variant={variant} />}>
            <ChatDone />
          </Swap>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr]">
        <Swap loading={loading} skeleton={<SkeletonProfile variant={variant} />}>
          <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-ink-900 p-6 shadow-card">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-700 text-lg font-medium text-ink-950">NB</span>
            <p className="mt-1.5 text-[15px] font-medium text-ink-50">Noah Bennett</p>
            <p className="text-xs text-ink-400">Product designer · Lisbon</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="flex items-center gap-1 rounded-lg bg-ink-850 px-3 py-1.5 text-ink-200"><Heart className="h-3.5 w-3.5" /> 1.2k</span>
              <span className="flex items-center gap-1 rounded-lg bg-ink-850 px-3 py-1.5 text-ink-200"><MessageCircle className="h-3.5 w-3.5" /> 86</span>
            </div>
          </div>
        </Swap>
        <Swap loading={loading} skeleton={<SkeletonTable variant={variant} rows={3} />}>
          <div className="overflow-hidden rounded-xl border border-white/[0.06] text-[13px]">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs text-ink-400">
              <span>Invoice</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>
            {[
              ['Northwind Studio', 'Paid', '$4,200'],
              ['Halcyon App', 'Due', '$1,850'],
              ['Quiet Hours', 'Paid', '$960'],
            ].map(([a, s, m]) => (
              <div key={a} className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/[0.04] px-4 py-3 last:border-0">
                <span className="truncate text-ink-100">{a}</span>
                <span className={s === 'Paid' ? 'text-emerald-400' : 'text-amber-300'}>{s}</span>
                <span className="text-right font-mono text-ink-200">{m}</span>
              </div>
            ))}
          </div>
        </Swap>
      </div>
      <div className="mt-4 rounded-2xl bg-ink-900 p-5 shadow-card">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-ink-500">Article preset</p>
        <SkeletonArticle variant={variant} />
      </div>
    </SkeletonGroup>
  );
}
