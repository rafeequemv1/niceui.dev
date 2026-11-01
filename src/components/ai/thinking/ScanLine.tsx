import { useState, type ReactNode } from 'react';
import { Pills, ThinkingLabel, TONES, type ThinkingState, type Tone } from './shared';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ScanVariant = 'line' | 'shimmer';

export type ScanLineProps = {
  variant?: ScanVariant;
  tone?: Tone;
  state?: ThinkingState;
  /** Seconds per pass. */
  speed?: number;
  className?: string;
  children?: ReactNode;
};

const KEYFRAMES = `
@keyframes nui-scan-y { 0% { top: -10% } 100% { top: 105% } }
@keyframes nui-scan-x { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }
@media (prefers-reduced-motion: reduce) { .nui-scan * { animation: none !important } }
`;

/** Wraps any block (card, text, image) and scans a light across it while the agent reads. */
export function ScanLine({ variant = 'line', tone = 'sky', state = 'thinking', speed = 1.8, className, children }: ScanLineProps) {
  const c = TONES[tone];
  const on = state === 'thinking';
  return (
    <div className={cn('nui-scan relative overflow-hidden', className)} aria-busy={on}>
      <style>{KEYFRAMES}</style>
      {children}
      {on && variant === 'line' && (
        <>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 h-12" style={{ background: `linear-gradient(180deg, transparent, ${c.main}1f 70%, transparent)`, animation: `nui-scan-y ${speed}s cubic-bezier(.4,0,.2,1) infinite` }}>
            <span className="absolute inset-x-0 bottom-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.soft}, transparent)`, boxShadow: `0 0 10px ${c.main}` }} />
          </span>
        </>
      )}
      {on && variant === 'shimmer' && (
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(100deg, transparent 30%, ${c.soft}22 50%, transparent 70%)`, animation: `nui-scan-x ${speed}s ease-in-out infinite` }} />
      )}
      {state === 'done' && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: `inset 0 0 0 1px ${c.main}55` }} />}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2.5">
      {[92, 78, 85, 60].map((w, i) => (
        <span key={i} className="block h-2.5 rounded-full bg-white/[0.07]" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

const VARIANTS = ['line', 'shimmer'] as const;
const STATES = ['idle', 'thinking', 'done'] as const;

export function ScanLineDemo() {
  const [variant, setVariant] = useState<ScanVariant>('line');
  const [state, setState] = useState<ThinkingState>('thinking');
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Pills label="Variant" value={variant} options={VARIANTS} onChange={setVariant} />
        <Pills label="State" value={state} options={STATES} onChange={setState} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ScanLine variant={variant} state={state} className="rounded-2xl bg-ink-900 p-4 shadow-card">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">contract_v3.pdf · page 4</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-200">The supplier shall deliver all goods within thirty (30) days of the purchase order date, unless agreed otherwise in writing by both parties.</p>
        </ScanLine>
        <ScanLine variant={variant} state={state} tone="violet" speed={2.2} className="rounded-2xl bg-ink-900 p-4 shadow-card">
          <Skeleton />
        </ScanLine>
      </div>
      <div className="flex items-start gap-3 rounded-2xl bg-ink-900 p-4 shadow-card">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-300"><Sparkles className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1 pt-1.5">
          {state === 'done' ? <span className="text-sm text-ink-300">Read 4 pages · found 2 clauses</span> : <ThinkingLabel>Reading contract_v3.pdf…</ThinkingLabel>}
        </div>
      </div>
    </div>
  );
}
