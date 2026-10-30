import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const css = `@keyframes nui-beam{0%{transform:translateY(-110%);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateY(110%);opacity:0}}
@media (prefers-reduced-motion:reduce){.nui-beam{animation:none!important;opacity:.5;transform:none!important}}`;

const BEAMS = [
  { left: 8, w: 1, d: 6.5, delay: 0 },
  { left: 18, w: 2, d: 8, delay: 2.2 },
  { left: 31, w: 1, d: 5.5, delay: 1.1 },
  { left: 44, w: 3, d: 9, delay: 3.4 },
  { left: 57, w: 1, d: 6, delay: 0.6 },
  { left: 68, w: 2, d: 7.5, delay: 2.8 },
  { left: 79, w: 1, d: 5, delay: 1.7 },
  { left: 91, w: 2, d: 8.5, delay: 4 },
];

export type BeamsBackgroundProps = { children?: ReactNode; className?: string };

/** Vertical light beams that fall through a dark panel over faint guide lines. */
export function BeamsBackground({ children, className }: BeamsBackgroundProps) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-2xl bg-ink-950', className)}>
      <style>{css}</style>
      <div aria-hidden className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        {BEAMS.map((b, i) => (
          <div key={i} className="absolute inset-y-0" style={{ left: `${b.left}%`, width: b.w }}>
            <div className="absolute inset-0 bg-white/[0.04]" />
            <div className="nui-beam absolute inset-x-0 h-1/2" style={{ background: 'linear-gradient(to bottom, transparent, rgba(125,211,252,.9), transparent)', boxShadow: '0 0 12px 1px rgba(56,189,248,.5)', animation: `nui-beam ${b.d}s linear ${b.delay}s infinite` }} />
          </div>
        ))}
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_80%_at_50%_100%,rgba(56,189,248,.18),transparent)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function BeamsBackgroundDemo() {
  return (
    <BeamsBackground className="w-full max-w-3xl">
      <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">
        <h3 className="text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl">
          Ship at the speed <br />
          of <em className="font-serif font-normal italic text-brand-300">light.</em>
        </h3>
        <p className="mt-4 max-w-sm text-sm text-ink-400">Beams fall at their own pace behind your hero copy. Pure CSS.</p>
      </div>
    </BeamsBackground>
  );
}
