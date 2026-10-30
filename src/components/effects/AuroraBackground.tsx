import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const css = `
@keyframes nui-aurora { 0% { transform: translate3d(-10%, -6%, 0) rotate(0deg) scale(1); } 50% { transform: translate3d(8%, 6%, 0) rotate(12deg) scale(1.15); } 100% { transform: translate3d(-10%, -6%, 0) rotate(0deg) scale(1); } }
@media (prefers-reduced-motion: reduce) { .nui-aurora-band { animation: none !important; } }
`;

export type AuroraBackgroundProps = { children?: ReactNode; className?: string };

/** Slow, blurred gradient ribbons drifting behind content. */
export function AuroraBackground({ children, className }: AuroraBackgroundProps) {
  const bands = [
    ['#38bdf8', '#6366f1', '0s', '18s', '-20%', '-10%'],
    ['#22d3ee', '#a855f7', '-6s', '22s', '20%', '10%'],
    ['#0ea5e9', '#14b8a6', '-12s', '26s', '-5%', '30%'],
  ];
  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl bg-ink-950', className)}>
      <style>{css}</style>
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70 blur-3xl">
        {bands.map(([a, b, delay, dur, x, y], i) => (
          <div
            key={i}
            className="nui-aurora-band absolute h-[70%] w-[80%] rounded-full mix-blend-screen"
            style={{ left: x, top: y, background: `linear-gradient(120deg, ${a}, ${b})`, animation: `nui-aurora ${dur} ease-in-out ${delay} infinite`, opacity: 0.55 }}
          />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000_85%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function AuroraBackgroundDemo() {
  return (
    <AuroraBackground className="flex min-h-[360px] w-full items-center justify-center px-6 py-16 text-center">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-300">Now in beta</p>
        <h3 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Light that <em className="font-serif font-normal italic text-brand-300">moves</em>.
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink-300">A drifting aurora behind any hero, built with three blurred gradients and pure CSS.</p>
      </div>
    </AuroraBackground>
  );
}
