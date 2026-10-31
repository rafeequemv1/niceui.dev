import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type RevealItem = { src: string; title: string; meta: string };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function RevealFigure({ item, root, align, index }: { item: RevealItem; root: React.RefObject<HTMLDivElement>; align: 'left' | 'right'; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(reduced());
  useEffect(() => {
    if (on || !ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { root: root.current, threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [on, root]);
  return (
    <figure ref={ref} className={cn('w-[86%] sm:w-[64%]', align === 'right' && 'ml-auto')}>
      <div
        className="overflow-hidden rounded-2xl transition-[clip-path] duration-[1200ms] ease-smooth"
        style={{ clipPath: on ? 'inset(0% 0% 0% 0%)' : align === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' }}
      >
        <img src={item.src} alt={item.title} className={cn('aspect-[4/3] w-full object-cover transition-transform duration-[1600ms] ease-smooth', on ? 'scale-100' : 'scale-125')} />
      </div>
      <figcaption className={cn('mt-3 flex items-baseline justify-between gap-3 transition-all delay-300 duration-700', on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
        <span className="text-[15px] font-medium text-ink-50">
          <span className="mr-2 font-mono text-[11px] text-brand-300">{String(index + 1).padStart(2, '0')}</span>
          {item.title}
        </span>
        <span className="font-mono text-[11px] text-ink-500">{item.meta}</span>
      </figcaption>
    </figure>
  );
}

export type ScrollRevealProps = { items: RevealItem[]; height?: number; className?: string };

/** Images wipe in with a clip-path and settle from a slight zoom as they scroll into view. Scrolls inside its own frame. */
export function ScrollReveal({ items, height = 480, className }: ScrollRevealProps) {
  const root = useRef<HTMLDivElement>(null);
  return (
    <div ref={root} className={cn('w-full overflow-y-auto overscroll-contain rounded-2xl bg-ink-950 shadow-card [scrollbar-width:thin]', className)} style={{ height }}>
      <div className="space-y-16 px-5 py-10 sm:px-10">
        <header className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">Selected work</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-ink-50">
            Light, <em className="font-serif font-normal italic text-brand-300">land</em> and water.
          </h3>
          <p className="mt-2 text-sm text-ink-400">Scroll inside this frame.</p>
        </header>
        {items.map((it, i) => (
          <RevealFigure key={it.title} item={it} root={root} align={i % 2 ? 'right' : 'left'} index={i} />
        ))}
      </div>
    </div>
  );
}

export function ScrollRevealDemo() {
  const items = ARTWORKS.slice(0, 6).map((a) => ({ src: artwork(a.id, 960, 720), title: a.title, meta: `${a.place} · ${a.year}` }));
  return <ScrollReveal items={items} />;
}
