import { useRef, type PointerEvent, type ReactNode } from 'react';
import { Bolt, Lock, Sparkles, Workflow } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SpotlightCardProps = { children: ReactNode; className?: string; color?: string };

/** A card lit by a soft light that follows the pointer, with a matching border highlight. */
export function SpotlightCard({ children, className, color = '56,189,248' }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onPointerMove={move}
      className={cn('group relative overflow-hidden rounded-2xl bg-ink-900 p-px', className)}
      style={{ background: `radial-gradient(260px circle at var(--x,50%) var(--y,0%), rgba(${color},.55), rgba(255,255,255,.06) 60%)` }}
    >
      <div className="relative h-full rounded-[15px] bg-ink-900 p-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(320px circle at var(--x,50%) var(--y,0%), rgba(${color},.12), transparent 60%)` }} />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

const items = [
  { icon: Sparkles, title: 'AI suggestions', body: 'Context-aware edits as you type.' },
  { icon: Workflow, title: 'Workflows', body: 'Automate the busywork in a few clicks.' },
  { icon: Lock, title: 'SSO and audit logs', body: 'Enterprise controls, built in.' },
  { icon: Bolt, title: 'Edge-fast', body: 'Sub-50ms responses worldwide.' },
];

export function SpotlightCardDemo() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(({ icon: Icon, title, body }) => (
        <SpotlightCard key={title}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/10 text-brand-300">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="mt-4 text-sm font-medium text-ink-50">{title}</h3>
          <p className="mt-1 text-sm text-ink-400">{body}</p>
        </SpotlightCard>
      ))}
    </div>
  );
}
