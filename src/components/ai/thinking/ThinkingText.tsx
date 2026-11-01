import { cn } from '@/lib/cn';

export type ThinkingTextVariant = 'gradient' | 'glint' | 'wave';

export type ThinkingTextProps = {
  text?: string;
  variant?: ThinkingTextVariant;
  /** Seconds for one full sweep. */
  duration?: number;
  className?: string;
};

const css = `
@keyframes th-sweep { 0% { background-position: 150% 0 } 100% { background-position: -50% 0 } }
@keyframes th-glint { 0%, 100% { opacity: .45; text-shadow: none } 50% { opacity: 1; text-shadow: 0 0 10px rgba(125,211,252,.55) } }
@keyframes th-bob { 0%, 100% { transform: translateY(0) } 40% { transform: translateY(-3px) } }
@media (prefers-reduced-motion: reduce) { .th-anim, .th-anim * { animation: none !important } }
`;

/** "Thinking…" with a sweeping shimmer, a letter-by-letter glint or a gentle wave. */
export function ThinkingText({ text = 'Thinking…', variant = 'gradient', duration = 2, className }: ThinkingTextProps) {
  const letters = [...text];
  return (
    <span role="status" aria-label={text} className={cn('th-anim inline-flex text-sm font-medium tracking-[-0.01em]', className)}>
      <style>{css}</style>
      {variant === 'gradient' && (
        <span
          aria-hidden
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(90deg, #5b6068 0%, #5b6068 35%, #e0f2fe 50%, #5b6068 65%, #5b6068 100%)',
            backgroundSize: '200% 100%',
            animation: `th-sweep ${duration}s linear infinite`,
          }}
        >
          {text}
        </span>
      )}
      {variant !== 'gradient' && (
        <span aria-hidden className="inline-flex">
          {letters.map((ch, i) => (
            <span
              key={i}
              className={cn('inline-block whitespace-pre', variant === 'glint' ? 'text-ink-100' : 'text-ink-200')}
              style={{
                animation: `${variant === 'glint' ? 'th-glint' : 'th-bob'} ${duration * (variant === 'glint' ? 0.8 : 0.6)}s ease-in-out infinite`,
                animationDelay: `${(i / letters.length) * duration * (variant === 'glint' ? 0.8 : 0.45)}s`,
              }}
            >
              {ch}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

export function ThinkingTextDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      {(['gradient', 'glint', 'wave'] as const).map((v) => (
        <div key={v} className="flex w-full max-w-sm items-center justify-between gap-4 rounded-xl bg-ink-900 px-4 py-3 shadow-card">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500">{v}</span>
          <ThinkingText variant={v} text={v === 'wave' ? 'Working on it…' : v === 'glint' ? 'Reasoning…' : 'Thinking…'} />
        </div>
      ))}
    </div>
  );
}
