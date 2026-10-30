import { useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const css = `
@keyframes nui-meteor { 0% { transform: rotate(215deg) translateX(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: rotate(215deg) translateX(-600px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .nui-meteor { animation: none !important; opacity: .5; } }
`;

export type MeteorsProps = { count?: number; children?: ReactNode; className?: string };

/** Falling light streaks across a card. */
export function Meteors({ count = 18, children, className }: MeteorsProps) {
  const meteors = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ left: `${(i * 53) % 110 - 5}%`, delay: `${((i * 0.37) % 4).toFixed(2)}s`, dur: `${(2.5 + ((i * 0.71) % 5)).toFixed(2)}s` })),
    [count],
  );
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <style>{css}</style>
      {meteors.map((m, i) => (
        <span
          key={i}
          aria-hidden
          className="nui-meteor pointer-events-none absolute top-0 h-0.5 w-0.5 rounded-full bg-brand-200 shadow-[0_0_0_1px_#ffffff10] before:absolute before:top-1/2 before:h-px before:w-[60px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-brand-200 before:to-transparent before:content-['']"
          style={{ left: m.left, animation: `nui-meteor ${m.dur} linear ${m.delay} infinite` }}
        />
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}

export function MeteorsDemo() {
  return (
    <Meteors className="w-full max-w-md p-8">
      <span className="inline-flex rounded-full border border-brand-300/30 bg-brand-500/10 px-2.5 py-0.5 font-mono text-[11px] text-brand-300">Launch week</span>
      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">Shipping something every day.</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-400">Five days, five releases. Follow along as new components land in the library.</p>
      <button className="focus-ring mt-6 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-950 transition-transform active:scale-95">See what's new</button>
    </Meteors>
  );
}
