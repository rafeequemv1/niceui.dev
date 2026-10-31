import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type PixelEffect = 'pixelate' | 'dissolve' | 'blinds';

const load = (src: string) =>
  new Promise<HTMLImageElement>((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = src;
  });

/** Transitions between images on a canvas: pixelate, dissolve or blinds. */
export function PixelTransition({ images, effect = 'pixelate', index, className }: { images: string[]; effect?: PixelEffect; index: number; className?: string }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const shown = useRef(index);
  const imgs = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all(images.map(load)).then((l) => {
      if (!alive) return;
      imgs.current = l;
      const c = cvs.current!;
      c.getContext('2d')!.drawImage(l[shown.current], 0, 0, c.width, c.height);
    });
    return () => {
      alive = false;
    };
  }, [images]);

  useEffect(() => {
    const c = cvs.current;
    const g = c?.getContext('2d');
    const from = imgs.current[shown.current];
    const to = imgs.current[index];
    if (!c || !g || !from || !to || shown.current === index) return;
    const W = c.width;
    const H = c.height;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduce ? 1 : 900;
    const seeds = Array.from({ length: 48 * 27 }, () => Math.random());
    const t0 = performance.now();
    let raf = 0;
    const off = document.createElement('canvas');
    const og = off.getContext('2d')!;
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      g.imageSmoothingEnabled = true;
      if (effect === 'pixelate') {
        const peak = 1 - Math.abs(t * 2 - 1);
        const block = Math.max(1, Math.round(peak * 42));
        const src = t < 0.5 ? from : to;
        off.width = Math.ceil(W / block);
        off.height = Math.ceil(H / block);
        og.drawImage(src, 0, 0, off.width, off.height);
        g.imageSmoothingEnabled = false;
        g.drawImage(off, 0, 0, W, H);
      } else if (effect === 'dissolve') {
        g.drawImage(from, 0, 0, W, H);
        const cw = W / 48;
        const ch = H / 27;
        for (let y = 0; y < 27; y++)
          for (let x = 0; x < 48; x++)
            if (seeds[y * 48 + x] < t) g.drawImage(to, (x * to.width) / 48, (y * to.height) / 27, to.width / 48, to.height / 27, x * cw, y * ch, cw + 1, ch + 1);
      } else {
        g.drawImage(from, 0, 0, W, H);
        const n = 12;
        const bw = W / n;
        for (let i = 0; i < n; i++) {
          const p = Math.min(1, Math.max(0, t * 1.6 - (i / n) * 0.6));
          g.drawImage(to, (i * to.width) / n, 0, (to.width / n) * p, to.height, i * bw, 0, bw * p, H);
        }
      }
      if (t < 1) raf = requestAnimationFrame(frame);
      else {
        g.imageSmoothingEnabled = true;
        g.drawImage(to, 0, 0, W, H);
        shown.current = index;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      shown.current = index;
    };
  }, [index, effect]);

  return <canvas ref={cvs} width={960} height={540} className={cn('aspect-video w-full rounded-2xl bg-black shadow-card', className)} />;
}

export function PixelTransitionDemo() {
  const images = useMemo(() => [0, 2, 6, 9, 11].map((id) => artwork(id, 960, 540)), []);
  const [i, setI] = useState(0);
  const [effect, setEffect] = useState<PixelEffect>('pixelate');
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % images.length), 2400);
    return () => clearInterval(id);
  }, [touched, images.length]);
  const go = (d: number) => {
    setTouched(true);
    setI((v) => (v + d + images.length) % images.length);
  };
  const art = ARTWORKS[[0, 2, 6, 9, 11][i]];
  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <PixelTransition images={images} effect={effect} index={i} />
        <div className="pointer-events-none absolute bottom-4 left-4">
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-white/60">{art.place} · {art.year}</p>
          <p key={i} className="font-serif text-2xl italic text-white animate-fade-up">{art.title}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-white/5 p-0.5" role="group" aria-label="Transition effect">
          {(['pixelate', 'dissolve', 'blinds'] as PixelEffect[]).map((e) => (
            <button key={e} onClick={() => (setTouched(true), setEffect(e))} className={cn('focus-ring rounded-full px-3 py-1 text-[12px] capitalize transition-colors', effect === e ? 'bg-white text-ink-950' : 'text-ink-300 hover:text-ink-50')}>
              {e}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[11px] text-ink-500">{i + 1} / {images.length}</span>
        <button onClick={() => go(-1)} aria-label="Previous" className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-white/10 text-ink-200 hover:bg-white/5"><ChevronLeft className="h-4 w-4" /></button>
        <button onClick={() => go(1)} aria-label="Next" className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-white/10 text-ink-200 hover:bg-white/5"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
