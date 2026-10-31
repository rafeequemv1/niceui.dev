import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

type Drop = { id: number; x: number; y: number; img: number; rot: number };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type ImageTrailProps = {
  /** Image URLs dropped along the pointer path, in order. */
  images: string[];
  /** Pixels the pointer must travel before the next image drops. */
  spacing?: number;
  /** How long each image lives, in ms. */
  life?: number;
  className?: string;
  children?: React.ReactNode;
};

/** Drops a trail of images behind the pointer; each one pops in, then shrinks and fades. */
export function ImageTrail({ images, spacing = 80, life = 1100, className, children }: ImageTrailProps) {
  const box = useRef<HTMLDivElement>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const n = useRef(0);
  const touched = useRef(false);

  const drop = (x: number, y: number) => {
    const id = n.current++;
    setDrops((d) => [...d.slice(-14), { id, x, y, img: id % images.length, rot: ((id * 37) % 24) - 12 }]);
    window.setTimeout(() => setDrops((d) => d.filter((t) => t.id !== id)), life);
  };

  const move = (x: number, y: number) => {
    const l = last.current;
    if (!l || Math.hypot(x - l.x, y - l.y) > spacing) {
      last.current = { x, y };
      drop(x, y);
    }
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const r = box.current!.getBoundingClientRect();
    move(e.clientX - r.left, e.clientY - r.top);
  };

  // Idle demo: trace a slow figure-eight until the visitor moves the pointer.
  useEffect(() => {
    if (reduced()) return;
    let t = 0;
    const id = window.setInterval(() => {
      if (touched.current || !box.current) return;
      const { width: w, height: h } = box.current.getBoundingClientRect();
      t += 0.09;
      move(w / 2 + Math.sin(t) * w * 0.34, h / 2 + Math.sin(t * 2) * h * 0.22);
    }, 60);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const still = reduced();

  return (
    <div ref={box} onPointerMove={onMove} className={cn('relative h-[440px] w-full touch-none select-none overflow-hidden rounded-2xl bg-ink-950 shadow-card', className)}>
      <style>{`@keyframes nui-trail{0%{opacity:0;transform:translate(-50%,-50%) scale(.55) rotate(var(--r))}14%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(var(--r))}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(.8) rotate(var(--r))}}`}</style>
      <div className="pointer-events-none absolute inset-0 dot-bg opacity-60" />
      {still
        ? [0, 1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src={images[i % images.length]}
              alt=""
              className="absolute h-36 w-28 rounded-xl object-cover shadow-pop sm:h-44 sm:w-32"
              style={{ left: `${18 + i * 16}%`, top: `${40 + (i % 2 ? 14 : -6)}%`, transform: `translate(-50%,-50%) rotate(${(i - 2) * 5}deg)` }}
            />
          ))
        : drops.map((d) => (
            <img
              key={d.id}
              src={images[d.img]}
              alt=""
              draggable={false}
              className="pointer-events-none absolute h-40 w-28 rounded-xl object-cover shadow-pop sm:h-48 sm:w-36"
              style={{ left: d.x, top: d.y, ['--r' as string]: `${d.rot}deg`, animation: `nui-trail ${life}ms cubic-bezier(.16,1,.3,1) both` }}
            />
          ))}
      <div className="pointer-events-none relative flex h-full flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function ImageTrailDemo() {
  const images = ARTWORKS.map((a) => artwork(a.id, 360, 480));
  return (
    <ImageTrail images={images}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">Portfolio · 2026</p>
      <h3 className="mt-3 text-4xl font-semibold tracking-tight text-ink-50 sm:text-6xl">
        Move your <em className="font-serif font-normal italic text-brand-300">cursor</em>
      </h3>
    </ImageTrail>
  );
}
