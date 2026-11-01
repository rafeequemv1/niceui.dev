import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Seconds left until `target` (ms timestamp), ticking every 250ms. */
export function useCountdown(target: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (target == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [target]);
  return target == null ? 0 : Math.max(0, Math.ceil((target - now) / 1000));
}

export function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  return (ms: number, fn: () => void) => void ids.current.push(window.setTimeout(fn, ms));
}

export const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** A compact chat thread frame so each state is shown in context. */
export function Thread({ title = 'Research assistant', children, footer, className }: { title?: string; children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-500/15 text-brand-300">
          <Sparkles className="h-3 w-3" />
        </span>
        <span className="text-xs font-medium text-ink-200">{title}</span>
      </div>
      <div className="space-y-3 px-4 py-4">{children}</div>
      {footer && <div className="border-t border-white/5 p-3">{footer}</div>}
    </div>
  );
}

export function UserMsg({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-500/90 px-3.5 py-2 text-sm text-white">{children}</p>
    </div>
  );
}

export function AssistantMsg({ children }: { children: ReactNode }) {
  return <p className="max-w-[90%] text-sm leading-relaxed text-ink-200">{children}</p>;
}

export function Composer({ disabled, placeholder = 'Ask anything…' }: { disabled?: boolean; placeholder?: string }) {
  return (
    <div className={cn('flex h-10 items-center rounded-xl bg-ink-950/60 px-3 text-sm text-ink-500 shadow-hairline transition-opacity', disabled && 'opacity-50')}>
      {placeholder}
    </div>
  );
}
