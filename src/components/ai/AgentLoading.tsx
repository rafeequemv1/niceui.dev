import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

const KEYFRAMES =
  '@keyframes ai-dot{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}' +
  '@keyframes ai-type{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}';

export function ThinkingShimmer({ label = 'Thinking…', className }: { label?: string; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 text-sm', className)} role="status">
      <Sparkles className="h-4 w-4 animate-pulse text-brand-300" />
      <span className="shimmer-text font-medium">{label}</span>
    </span>
  );
}

export function DotPulse({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-1.5', className)} role="status" aria-label="Loading">
      <style>{KEYFRAMES}</style>
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full bg-brand-400" style={{ animation: `ai-dot 1.2s ease-in-out ${i * 160}ms infinite` }} />
      ))}
    </span>
  );
}

export function EqualizerBars({ bars = 7, className }: { bars?: number; className?: string }) {
  return (
    <span className={cn('flex h-8 items-center gap-[3px]', className)} role="status" aria-label="Loading">
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="h-full w-1 animate-bar-bounce rounded-full bg-gradient-to-t from-brand-600 to-sky-300"
          style={{ animationDelay: `${(i * 137) % 600}ms`, animationDuration: `${800 + ((i * 211) % 500)}ms` }}
        />
      ))}
    </span>
  );
}

export function OrbitSpinner({ className }: { className?: string }) {
  return (
    <span className={cn('relative block h-12 w-12', className)} role="status" aria-label="Loading">
      <span className="absolute inset-0 rounded-full border border-white/10" />
      <span className="absolute inset-0 animate-spin [animation-duration:1.6s]">
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-400 shadow-[0_0_12px_2px_rgba(56,189,248,0.7)]" />
      </span>
      <span className="absolute inset-3 animate-spin rounded-full border border-white/10 [animation-direction:reverse] [animation-duration:1.1s]">
        <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-teal-300" />
      </span>
      <span className="absolute inset-[22px] rounded-full bg-brand-300/80" />
    </span>
  );
}

export function SkeletonLines({ lines = 4, className }: { lines?: number; className?: string }) {
  const widths = ['92%', '100%', '78%', '56%', '85%'];
  return (
    <span className={cn('flex w-full flex-col gap-2', className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <span
          key={i}
          className="h-2.5 animate-shimmer rounded-full bg-[linear-gradient(90deg,#1a1a1e_0%,#1a1a1e_35%,#36363e_50%,#1a1a1e_65%,#1a1a1e_100%)] bg-[length:200%_100%]"
          style={{ width: widths[i % widths.length], animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-ink-800 px-3.5 py-3 shadow-hairline', className)} role="status" aria-label="Assistant is typing">
      <style>{KEYFRAMES}</style>
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink-300" style={{ animation: `ai-type 1.3s ease-in-out ${i * 150}ms infinite` }} />
      ))}
    </span>
  );
}

function Tile({ label, children, i }: { label: string; children: ReactNode; i: number }) {
  return (
    <div
      className="group flex h-36 animate-fade-up flex-col rounded-2xl bg-ink-900 p-4 shadow-card transition-transform duration-300 ease-spring hover:-translate-y-0.5"
      style={{ animationDelay: `${i * 70}ms` }}
    >
      <div className="flex flex-1 items-center justify-center px-2">{children}</div>
      <p className="text-center text-xs text-ink-500 transition-colors group-hover:text-ink-300">{label}</p>
    </div>
  );
}

export function AgentLoadingDemo() {
  const items: Array<[string, ReactNode]> = [
    ['Shimmer text', <ThinkingShimmer />],
    ['Dot pulse', <DotPulse />],
    ['Equalizer', <EqualizerBars />],
    ['Orbit', <OrbitSpinner />],
    ['Skeleton lines', <SkeletonLines />],
    ['Typing indicator', <TypingIndicator />],
  ];
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map(([label, node], i) => (
        <Tile key={label} label={label} i={i}>
          {node}
        </Tile>
      ))}
    </div>
  );
}
