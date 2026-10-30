import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export type WordRotateProps = { words: string[]; interval?: number; className?: string };

/** Swaps one word in a headline with a blur-and-slide, animating the width so the line reflows smoothly. */
export function WordRotate({ words, interval = 2200, className }: WordRotateProps) {
  const [i, setI] = useState(0);
  const [w, setW] = useState<number>();
  const measure = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  useLayoutEffect(() => setW(measure.current?.offsetWidth), [i]);
  return (
    <span className={cn('relative inline-flex overflow-hidden align-bottom transition-[width] duration-500 ease-smooth', className)} style={{ width: w }} aria-live="polite">
      <span ref={measure} className="invisible absolute whitespace-nowrap">{words[i]}</span>
      <span key={i} className="whitespace-nowrap animate-[nice-word-in_600ms_cubic-bezier(0.16,1,0.3,1)_both]">
        {words[i]}
      </span>
      <style>{`@keyframes nice-word-in{from{opacity:0;transform:translateY(60%);filter:blur(8px)}to{opacity:1;transform:none;filter:blur(0)}}`}</style>
    </span>
  );
}

export function WordRotateDemo() {
  return (
    <h2 className="text-center text-3xl font-semibold leading-tight tracking-[-0.035em] text-ink-50 sm:text-5xl">
      The UI kit for{' '}
      <WordRotate className="text-brand-300" words={['AI agents', 'dashboards', 'CRMs', 'landing pages', 'galleries']} />
    </h2>
  );
}
