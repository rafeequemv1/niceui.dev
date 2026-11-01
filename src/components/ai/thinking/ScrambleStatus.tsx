import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/';

export type ScrambleStatusProps = {
  text: string;
  /** Milliseconds for the decode. */
  duration?: number;
  className?: string;
};

/** A status label that scramble-decodes into place whenever its text changes. */
export function ScrambleStatus({ text, duration = 650, className }: ScrambleStatusProps) {
  const [shown, setShown] = useState(text);
  const prev = useRef(text);

  useEffect(() => {
    if (prev.current === text) return;
    prev.current = text;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        if (i < settled || text[i] === ' ') out += text[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setShown(out);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);

  return (
    <span role="status" aria-live="polite" className={cn('font-mono text-[13px] text-ink-100', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}

const STEPS = ['planning the change', 'reading 12 files', 'running the tests', 'writing the summary', 'done in 8.4s'];

export function ScrambleStatusDemo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % STEPS.length), 1800);
    return () => clearInterval(id);
  }, []);
  const done = i === STEPS.length - 1;
  return (
    <div className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-ink-900 px-4 py-3.5 shadow-card">
      <span className="relative flex h-2 w-2 shrink-0">
        {!done && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400" />}
        <span className={cn('relative h-2 w-2 rounded-full transition-colors', done ? 'bg-emerald-400' : 'bg-brand-400')} />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-ink-500">agent</span>
      <ScrambleStatus text={STEPS[i]} className="min-w-0 truncate" />
    </div>
  );
}
