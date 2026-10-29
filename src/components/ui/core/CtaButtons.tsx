import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ArrowRight, Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';

type CtaProps = { children: ReactNode; onClick?: () => void; className?: string };

export function ShimmerBorderButton({ children, onClick, className }: CtaProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'focus-ring group relative inline-flex h-11 items-center overflow-hidden rounded-full p-px transition-transform duration-200 active:scale-[0.97]',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0%,transparent_65%,#7dd3fc_80%,#f7f7f8_86%,transparent_92%)] [animation-duration:3s]"
      />
      <span className="relative inline-flex h-full items-center gap-2 rounded-full bg-ink-950 px-5 text-sm font-medium text-ink-50 transition-colors group-hover:bg-ink-900">
        {children}
      </span>
    </button>
  );
}

export function GradientGlowButton({ children, onClick, className }: CtaProps) {
  return (
    <button onClick={onClick} className={cn('focus-ring group relative inline-flex rounded-xl active:scale-[0.97] transition-transform', className)}>
      <span
        aria-hidden
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 via-sky-400 to-teal-400 opacity-40 blur-lg transition-all duration-500 ease-smooth group-hover:-inset-2 group-hover:opacity-80"
      />
      <span className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 px-5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        {children}
      </span>
    </button>
  );
}

export function ArrowSlideButton({ children, onClick, className }: CtaProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'focus-ring group inline-flex h-11 items-center gap-3 rounded-full bg-ink-50 pl-5 pr-1.5 text-sm font-medium text-ink-950 transition-all duration-300 ease-smooth hover:bg-white hover:pr-2 active:scale-[0.97]',
        className,
      )}
    >
      {children}
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink-950 text-ink-50">
        <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-smooth group-hover:translate-x-8" />
        <ArrowRight className="absolute h-4 w-4 -translate-x-8 transition-transform duration-500 ease-smooth group-hover:translate-x-0" />
      </span>
    </button>
  );
}

export function MagneticButton({ children, onClick, className, strength = 0.35 }: CtaProps & { strength?: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, active: false });

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const r = ref.current!.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, active: true });
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={() => setPos({ x: 0, y: 0, active: false })}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      className={cn(
        'focus-ring inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-medium text-ink-50 shadow-hairline',
        pos.active ? 'bg-ink-700 transition-[transform,background-color] duration-150 ease-out' : 'bg-ink-800 transition-transform duration-700 ease-spring',
        className,
      )}
    >
      <span className="inline-flex items-center gap-2" style={{ transform: `translate3d(${pos.x * 0.4}px, ${pos.y * 0.4}px, 0)` }}>
        {children}
      </span>
    </button>
  );
}

export function ShineSweepButton({ children, onClick, className }: CtaProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'focus-ring group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-amber-400 px-5 text-sm font-medium text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_20px_-6px_rgba(251,191,36,0.6)] transition-transform active:scale-[0.97]',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-smooth group-hover:translate-x-[420%]"
      />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

export function SuccessMorphButton({ children, className }: Omit<CtaProps, 'onClick'>) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const run = () => {
    if (state !== 'idle') return;
    setState('loading');
    window.setTimeout(() => setState('success'), 1400);
    window.setTimeout(() => setState('idle'), 3200);
  };

  return (
    <button
      onClick={run}
      aria-live="polite"
      className={cn(
        'focus-ring relative inline-flex h-11 items-center justify-center overflow-hidden text-sm font-medium text-white transition-all duration-500 ease-spring active:scale-[0.97]',
        state === 'idle' && 'w-40 rounded-xl bg-brand-600 hover:bg-brand-500',
        state === 'loading' && 'w-11 rounded-[22px] bg-brand-600',
        state === 'success' && 'w-11 rounded-[22px] bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]',
        className,
      )}
    >
      <span className={cn('absolute whitespace-nowrap transition-all duration-300', state === 'idle' ? 'opacity-100' : 'scale-75 opacity-0')}>
        {children}
      </span>
      <Loader2 className={cn('absolute h-4 w-4 animate-spin transition-opacity duration-200', state === 'loading' ? 'opacity-100' : 'opacity-0')} />
      <Check
        className={cn('absolute h-5 w-5 transition-all duration-500 ease-spring', state === 'success' ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}
        strokeWidth={2.5}
      />
    </button>
  );
}

function Cell({ label, children, i }: { label: string; children: ReactNode; i: number }) {
  return (
    <div
      className="flex animate-fade-up flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-ink-950/60 px-4 py-7"
      style={{ animationDelay: `${i * 60}ms` }}
    >
      <div className="flex h-12 items-center">{children}</div>
      <span className="text-xs text-ink-400">{label}</span>
    </div>
  );
}

export function CtaButtonsDemo() {
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Cell i={0} label="Shimmer border">
        <ShimmerBorderButton>
          <Sparkles className="h-4 w-4 text-brand-300" /> Try Nice Pro
        </ShimmerBorderButton>
      </Cell>
      <Cell i={1} label="Gradient glow">
        <GradientGlowButton>
          <Zap className="h-4 w-4" /> Upgrade now
        </GradientGlowButton>
      </Cell>
      <Cell i={2} label="Arrow slide">
        <ArrowSlideButton>Get started</ArrowSlideButton>
      </Cell>
      <Cell i={3} label="Magnetic hover">
        <MagneticButton>Book a demo</MagneticButton>
      </Cell>
      <Cell i={4} label="Shine sweep">
        <ShineSweepButton>Claim 40% off</ShineSweepButton>
      </Cell>
      <Cell i={5} label="Success morph (click)">
        <SuccessMorphButton>Save changes</SuccessMorphButton>
      </Cell>
    </div>
  );
}
