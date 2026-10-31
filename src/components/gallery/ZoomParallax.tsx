import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Grid slots as % of the stage (left, top, width, height) and how far each starts zoomed in.
const SLOTS: [number, number, number, number, number][] = [
  [33, 31, 34, 38, 2.9],
  [8, 8, 22, 30, 4.2],
  [36, 4, 28, 24, 5],
  [70, 10, 22, 36, 4.6],
  [6, 44, 24, 46, 5.4],
  [70, 50, 24, 40, 4.8],
  [36, 72, 28, 24, 5.8],
];

export type ZoomParallaxProps = {
  /** Up to seven image URLs; the first is the hero that zooms out. */
  images: string[];
  height?: number;
  /** How many screens of scrolling the effect takes. */
  length?: number;
  className?: string;
  /** Scroll a little on mount so the effect is visible at once. */
  autoPreview?: boolean;
};

/** A full-frame image zooms out into a grid of surrounding images as you scroll its own frame. */
export function ZoomParallax({ images, height = 480, length = 3, className, autoPreview = true }: ZoomParallaxProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const on = () => setP(Math.min(1, el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)));
    el.addEventListener('scroll', on, { passive: true });
    let t = 0;
    if (autoPreview && !reduced()) t = window.setTimeout(() => el.scrollTo({ top: (el.scrollHeight - el.clientHeight) * 0.45, behavior: 'smooth' }), 900);
    return () => {
      el.removeEventListener('scroll', on);
      clearTimeout(t);
    };
  }, [autoPreview]);

  return (
    <div ref={scroller} className={cn('relative w-full overflow-y-auto overscroll-contain rounded-2xl bg-ink-950 shadow-card [scrollbar-width:none]', className)} style={{ height }}>
      <div style={{ height: height * length }}>
        <div className="sticky top-0 overflow-hidden" style={{ height }}>
          {SLOTS.slice(0, images.length).map(([l, t, w, h, s], i) => {
            const scale = 1 + (s - 1) * (1 - p);
            return (
              <div key={i} className="absolute inset-0 will-change-transform" style={{ transform: `scale(${scale})`, transformOrigin: '50% 50%' }}>
                <img src={images[i]} alt="" className="absolute rounded-lg object-cover" style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }} />
              </div>
            );
          })}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">Scroll to zoom out</span>
            <span className="font-mono text-[11px] tabular-nums text-brand-300">{Math.round(p * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ZoomParallaxDemo() {
  return <ZoomParallax images={ARTWORKS.slice(0, 7).map((a) => artwork(a.id, 900, 700))} />;
}
