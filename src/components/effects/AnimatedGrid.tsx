import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type AnimatedGridProps = { cols?: number; rows?: number; interval?: number; children?: ReactNode; className?: string };

/** A perspective grid whose cells light up at random, faded with a radial mask. */
export function AnimatedGrid({ cols = 16, rows = 9, interval = 700, children, className }: AnimatedGridProps) {
  const total = cols * rows;
  const [lit, setLit] = useState<number[]>(() => Array.from({ length: 10 }, (_, i) => (i * 37) % total));
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setLit((l) => [...l.slice(1), Math.floor(Math.random() * total)]), interval);
    return () => clearInterval(id);
  }, [interval, total]);
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-ink-950', className)}>
      <div aria-hidden className="absolute inset-0 [perspective:700px]">
        <div
          className="absolute -inset-x-1/4 bottom-[-20%] top-[10%] grid [transform:rotateX(55deg)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className={cn('border-[0.5px] border-brand-300/15 transition-colors duration-1000', lit.includes(i) && 'bg-brand-400/40 shadow-[0_0_24px_rgba(56,189,248,0.5)]')} />
          ))}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

export function AnimatedGridDemo() {
  return (
    <AnimatedGrid className="flex min-h-[360px] w-full items-start justify-center px-6 pt-16 text-center">
      <div>
        <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Built on a grid.</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-400">Cells catch the light one by one, then fade back into the floor.</p>
      </div>
    </AnimatedGrid>
  );
}
