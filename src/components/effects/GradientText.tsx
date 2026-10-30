import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type GradientTextProps = { children: ReactNode; colors?: string[]; speed?: number; shine?: boolean; className?: string };

const css = `
@keyframes nice-grad-flow { to { background-position: 200% 50%; } }
@keyframes nice-grad-shine { 0%, 60% { background-position: -150% 0; } 100% { background-position: 250% 0; } }
@media (prefers-reduced-motion: reduce) { .nice-grad, .nice-grad-shine { animation: none !important; } }
`;

/** Text filled with a slowly flowing gradient, with an optional light sweep on top. */
export function GradientText({ children, colors = ['#7dd3fc', '#38bdf8', '#a78bfa', '#7dd3fc'], speed = 6, shine = true, className }: GradientTextProps) {
  const flow: CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: `nice-grad-flow ${speed}s linear infinite`,
  };
  return (
    <span className={cn('relative inline-block', className)}>
      <style>{css}</style>
      <span className="nice-grad" style={flow}>
        {children}
      </span>
      {shine && (
        <span
          aria-hidden
          className="nice-grad-shine pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.85) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'nice-grad-shine 3.2s ease-in-out infinite',
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
}

export function GradientTextDemo() {
  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-500">Introducing</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
        <GradientText>Aurora 2.0</GradientText>
      </h2>
      <p className="mt-3 text-sm text-ink-400">A gradient that flows, with a light sweep every few seconds.</p>
    </div>
  );
}
