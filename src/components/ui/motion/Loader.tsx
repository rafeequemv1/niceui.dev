import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type LoaderVariant = 'ring' | 'dots' | 'bars' | 'orbit' | 'pulse' | 'progress' | 'skeleton' | 'gradient';

export function SpinnerRing({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('relative inline-block', className)} style={{ width: size, height: size }} role="status" aria-label="Loading">
      <span className="absolute inset-0 rounded-full border-2 border-white/10" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-400 [animation-duration:700ms]" />
    </span>
  );
}

export function DotsLoader({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-1.5', className)} role="status" aria-label="Loading">
      <style>{'@keyframes dot-hop{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-6px);opacity:1}}'}</style>
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 rounded-full bg-ink-50" style={{ animation: `dot-hop 1.1s ease-in-out ${i * 140}ms infinite` }} />
      ))}
    </span>
  );
}

export function BarsLoader({ className }: { className?: string }) {
  return (
    <span className={cn('flex h-7 items-center gap-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="h-full w-1 origin-center animate-bar-bounce rounded-full bg-brand-400" style={{ animationDelay: `${i * 110}ms` }} />
      ))}
    </span>
  );
}

export function OrbitLoader({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-block h-10 w-10', className)} role="status" aria-label="Loading">
      <span className="absolute inset-0 rounded-full border border-white/10" />
      <span className="absolute inset-0 animate-spin [animation-duration:1.4s]">
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.6)]" />
      </span>
      <span className="absolute inset-2.5 animate-spin rounded-full border border-white/10 [animation-direction:reverse] [animation-duration:1s]">
        <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-teal-300" />
      </span>
    </span>
  );
}

export function PulseLoader({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-10 w-10 items-center justify-center', className)} role="status" aria-label="Loading">
      <span className="absolute h-4 w-4 animate-pulse-ring rounded-full bg-brand-400" />
      <span className="absolute h-4 w-4 animate-pulse-ring rounded-full bg-brand-400 [animation-delay:0.8s]" />
      <span className="relative h-3.5 w-3.5 rounded-full bg-brand-400" />
    </span>
  );
}

export function ProgressLoader({ className }: { className?: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setP((v) => (v >= 100 ? 0 : Math.min(100, v + Math.random() * 14))), 380);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className={cn('w-36', className)} role="progressbar" aria-valuenow={Math.round(p)}>
      <div className="mb-1.5 flex justify-between text-[11px] text-ink-400">
        <span>Uploading</span>
        <span className="tabular-nums">{Math.round(p)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('relative h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400', p > 0 && 'transition-[width] duration-300 ease-smooth')}
          style={{ width: `${p}%` }}
        >
          <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  const bar = 'animate-shimmer rounded-md bg-[linear-gradient(90deg,#232328_0%,#36363e_50%,#232328_100%)] bg-[length:200%_100%]';
  return (
    <div className={cn('w-40 space-y-2.5', className)} role="status" aria-label="Loading">
      <div className="flex items-center gap-2">
        <span className={cn(bar, 'h-7 w-7 rounded-full')} />
        <span className="flex-1 space-y-1.5">
          <span className={cn(bar, 'block h-2 w-3/4')} />
          <span className={cn(bar, 'block h-2 w-1/2')} />
        </span>
      </div>
      <span className={cn(bar, 'block h-12 w-full rounded-lg')} />
    </div>
  );
}

export function GradientSpinner({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block animate-spin rounded-full [animation-duration:900ms]', className)}
      style={{
        width: size,
        height: size,
        background: 'conic-gradient(from 0deg, transparent 0deg, #38bdf8 200deg, #5eead4 340deg, transparent 360deg)',
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
      }}
    />
  );
}

/** Single entry point for every loader style. */
export function Loader({ variant = 'ring', className }: { variant?: LoaderVariant; className?: string }) {
  const map: Record<LoaderVariant, ReactNode> = {
    ring: <SpinnerRing className={className} />,
    dots: <DotsLoader className={className} />,
    bars: <BarsLoader className={className} />,
    orbit: <OrbitLoader className={className} />,
    pulse: <PulseLoader className={className} />,
    progress: <ProgressLoader className={className} />,
    skeleton: <SkeletonCard className={className} />,
    gradient: <GradientSpinner className={className} />,
  };
  return <>{map[variant]}</>;
}

const ALL: Array<{ name: string; node: ReactNode }> = [
  { name: 'Spinner ring', node: <SpinnerRing /> },
  { name: 'Dots', node: <DotsLoader /> },
  { name: 'Bars', node: <BarsLoader /> },
  { name: 'Orbit', node: <OrbitLoader /> },
  { name: 'Pulse', node: <PulseLoader /> },
  { name: 'Progress', node: <ProgressLoader /> },
  { name: 'Skeleton', node: <SkeletonCard /> },
  { name: 'Gradient', node: <GradientSpinner /> },
];

export function LoaderDemo() {
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
      {ALL.map((l, i) => (
        <div
          key={l.name}
          style={{ animationDelay: `${i * 50}ms` }}
          className="group flex h-36 animate-fade-up flex-col [animation-fill-mode:backwards] items-center justify-between rounded-2xl bg-ink-900 p-4 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-pop"
        >
          <div className="flex flex-1 items-center justify-center">{l.node}</div>
          <p className="text-xs text-ink-400 transition-colors group-hover:text-ink-200">{l.name}</p>
        </div>
      ))}
    </div>
  );
}
