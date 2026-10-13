import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Streams `text` token-by-token (words + whitespace). */
export function useStream(text: string, { speed = 32, enabled = true }: { speed?: number; enabled?: boolean } = {}) {
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);
  const tokens = useRef<string[]>([]);
  tokens.current = text.split(/(\s+)/).filter(Boolean);

  useEffect(() => {
    setCount(0);
  }, [text, run]);

  useEffect(() => {
    if (!enabled) return;
    if (count >= tokens.current.length) return;
    const jitter = speed * (0.5 + Math.random());
    const t = window.setTimeout(() => setCount((c) => c + 2), jitter);
    return () => window.clearTimeout(t);
  }, [count, enabled, speed, text, run]);

  const restart = useCallback(() => setRun((r) => r + 1), []);
  const total = tokens.current.length;
  return { output: tokens.current.slice(0, count).join(''), done: count >= total, restart, progress: total ? Math.min(1, count / total) : 1 };
}

export function Caret({ className }: { className?: string }) {
  return <span aria-hidden className={cn('ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[3px] animate-blink rounded-[2px] bg-brand-400', className)} />;
}

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={i} className="font-medium text-ink-50">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={i} className="rounded bg-white/[0.06] px-1 py-px font-mono text-[0.85em] text-brand-200">{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Minimal markdown: `## heading`, `- bullet`, `1. step`, **bold**, `code`. */
export function Markdown({ text, caret, className }: { text: string; caret?: boolean; className?: string }) {
  const blocks = text.split('\n').filter((l, i, arr) => l.trim() !== '' || i === arr.length - 1);
  const last = blocks.length - 1;
  const tail = (i: number): ReactNode => (caret && i === last ? <Caret /> : null);

  return (
    <div className={cn('space-y-2 text-sm leading-relaxed text-ink-300', className)}>
      {blocks.map((line, i) => {
        if (line.startsWith('## '))
          return (
            <h4 key={i} className="pt-1 text-[15px] font-medium text-ink-50">
              {inline(line.slice(3))}
              {tail(i)}
            </h4>
          );
        const bullet = line.match(/^(- |\d+\. )(.*)$/);
        if (bullet)
          return (
            <div key={i} className="flex gap-2.5 pl-1">
              <span className={cn('shrink-0 select-none', bullet[1] === '- ' ? 'mt-[9px] h-1 w-1 rounded-full bg-brand-400' : 'font-mono text-xs leading-6 text-ink-500')}>
                {bullet[1] === '- ' ? '' : bullet[1].trim()}
              </span>
              <p>
                {inline(bullet[2])}
                {tail(i)}
              </p>
            </div>
          );
        return (
          <p key={i}>
            {inline(line)}
            {tail(i)}
          </p>
        );
      })}
    </div>
  );
}
