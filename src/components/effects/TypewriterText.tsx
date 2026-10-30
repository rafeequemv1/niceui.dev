import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export type TypewriterTextProps = { phrases: string[]; typeMs?: number; deleteMs?: number; holdMs?: number; className?: string };

/** Types each phrase, holds, deletes it, then moves to the next. */
export function TypewriterText({ phrases, typeMs = 60, deleteMs = 32, holdMs = 1400, className }: TypewriterTextProps) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  const word = phrases[i % phrases.length];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(word.length);
      return;
    }
    let t: number;
    if (!del && n < word.length) t = window.setTimeout(() => setN(n + 1), typeMs);
    else if (!del) t = window.setTimeout(() => setDel(true), holdMs);
    else if (n > 0) t = window.setTimeout(() => setN(n - 1), deleteMs);
    else t = window.setTimeout(() => (setDel(false), setI((x) => x + 1)), 250);
    return () => clearTimeout(t);
  }, [n, del, word, typeMs, deleteMs, holdMs]);

  return (
    <span className={cn('inline-flex items-baseline', className)} aria-label={word}>
      <span aria-hidden>{word.slice(0, n)}</span>
      <span aria-hidden className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-blink rounded-full bg-brand-400" />
    </span>
  );
}

export function TypewriterTextDemo() {
  return (
    <h2 className="text-center text-3xl font-semibold tracking-[-0.03em] text-ink-50 sm:text-5xl">
      Build interfaces that
      <br />
      <TypewriterText className="font-serif font-normal italic text-brand-300" phrases={['feel inevitable.', 'ship on Friday.', 'agents can use.', 'people remember.']} />
    </h2>
  );
}
