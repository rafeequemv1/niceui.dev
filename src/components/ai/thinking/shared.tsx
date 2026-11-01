import { useEffect, useState, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ThinkingState = 'idle' | 'thinking' | 'done';

export const TONES = {
  sky: { main: '#38bdf8', soft: '#7dd3fc', deep: '#0284c7' },
  violet: { main: '#a78bfa', soft: '#c4b5fd', deep: '#7c3aed' },
  emerald: { main: '#34d399', soft: '#6ee7b7', deep: '#059669' },
  amber: { main: '#fbbf24', soft: '#fcd34d', deep: '#d97706' },
  white: { main: '#e5e7eb', soft: '#f9fafb', deep: '#9ca3af' },
} as const;
export type Tone = keyof typeof TONES;

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}

/** Ticks a frame counter at `fps` while active. */
export function useTick(active: boolean, fps = 12) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setN((v) => v + 1), 1000 / fps);
    return () => window.clearInterval(id);
  }, [active, fps]);
  return n;
}

export function Pills<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1 rounded-xl bg-white/[0.03] p-1 ring-1 ring-white/5">
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            'focus-ring rounded-lg px-2.5 py-1 text-xs capitalize transition-colors',
            value === o ? 'bg-white/10 text-ink-50 shadow-hairline' : 'text-ink-400 hover:text-ink-200',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Standard showcase: variant pills, a size ladder and an inline chat row. */
export function Showcase({ controls, sizes, chat, footer }: { controls: ReactNode; sizes: ReactNode; chat: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-center gap-2">{controls}</div>
      <div className="flex min-h-[112px] flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-2xl bg-ink-900/80 px-6 py-7 shadow-card">{sizes}</div>
      <div className="flex items-start gap-3 rounded-2xl bg-ink-900 p-4 shadow-card">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 pt-1.5">{chat}</div>
      </div>
      {footer}
    </div>
  );
}

export function Size({ px, children }: { px: number; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex h-16 items-center justify-center">{children}</div>
      <span className="font-mono text-[10px] tabular-nums text-ink-500">{px}px</span>
    </div>
  );
}

export function ThinkingLabel({ children = 'Thinking…' }: { children?: ReactNode }) {
  return <span className="shimmer-text text-sm font-medium">{children}</span>;
}
