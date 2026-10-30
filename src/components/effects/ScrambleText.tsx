import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

export type ScrambleTextProps = { text: string; duration?: number; trigger?: 'view' | 'hover' | 'both'; className?: string };

/** Characters cycle through random glyphs and lock into place left to right. */
export function ScrambleText({ text, duration = 900, trigger = 'both', className }: ScrambleTextProps) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  const run = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setOut(text);
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const lock = Math.floor(p * text.length);
      setOut(
        text
          .split('')
          .map((ch, i) => (ch === ' ' || i < lock ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, duration]);

  useEffect(() => {
    if (trigger === 'hover') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (run(), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => (io.disconnect(), cancelAnimationFrame(raf.current));
  }, [run, trigger]);

  return (
    <span ref={ref} onMouseEnter={trigger !== 'view' ? run : undefined} aria-label={text} className={cn('font-mono tabular-nums', className)}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

export function ScrambleTextDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ScrambleText text="DECRYPTING THE SIGNAL" className="text-2xl font-medium tracking-[0.14em] text-ink-50 sm:text-4xl" />
      <ScrambleText text="hover me to scramble again" trigger="hover" className="cursor-default text-sm text-brand-300" />
    </div>
  );
}
