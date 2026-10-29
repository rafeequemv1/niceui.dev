import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Portal } from './hooks';

export type ViewerImage = { id: string; title: string; art: string };

export type ImageViewerProps = { images: ViewerImage[]; columns?: number };

export function ImageViewer({ images, columns = 3 }: ImageViewerProps) {
  const thumbs = useRef<Array<HTMLButtonElement | null>>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<'closed' | 'from' | 'open'>('closed');
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState('50% 50%');
  const [dir, setDir] = useState(0);

  const target = () => {
    const w = Math.min(window.innerWidth - 96, 760);
    const h = Math.min(w * 0.66, window.innerHeight - 160);
    return { w: h / 0.66, h };
  };
  const flipFrom = (i: number): CSSProperties => {
    const r = thumbs.current[i]?.getBoundingClientRect();
    if (!r) return { opacity: 0 };
    const { w, h } = target();
    const dx = r.left + r.width / 2 - window.innerWidth / 2;
    const dy = r.top + r.height / 2 - window.innerHeight / 2;
    return { transform: `translate(${dx}px, ${dy}px) scale(${r.width / w}, ${r.height / h})`, borderRadius: 40 };
  };

  const open = (i: number) => {
    setIndex(i);
    setZoom(1);
    setPhase('from');
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')));
  };
  const close = useCallback(() => {
    setZoom(1);
    setPhase('from');
    window.setTimeout(() => {
      setPhase('closed');
      setIndex(null);
    }, 420);
  }, []);
  const nav = useCallback(
    (d: number) => {
      setZoom(1);
      setDir(d);
      setIndex((i) => (i === null ? i : (i + d + images.length) % images.length));
    },
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') nav(1);
      if (e.key === 'ArrowLeft') nav(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, close, nav]);

  const toggleZoom = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
    setZoom((z) => (z > 1 ? 1 : 2.2));
  };

  const size = typeof window !== 'undefined' && index !== null ? target() : { w: 0, h: 0 };
  const img = index !== null ? images[index] : null;
  const ctrl = 'focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-90';

  return (
    <>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {images.map((im, i) => (
          <button
            key={im.id}
            ref={(el) => (thumbs.current[i] = el)}
            onClick={() => open(i)}
            aria-label={`Open ${im.title}`}
            style={{ background: im.art, animationDelay: `${i * 40}ms` }}
            className={cn(
              'focus-ring group relative aspect-[3/2] animate-fade-up overflow-hidden [animation-fill-mode:backwards] rounded-xl shadow-card transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-pop',
              index === i && 'opacity-0 duration-0',
            )}
          >
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs font-medium text-white transition-transform duration-300 ease-smooth group-hover:translate-y-0">
              {im.title}
            </span>
          </button>
        ))}
      </div>

      {img && index !== null && (
        <Portal>
        <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal aria-label={img.title}>
          <div onClick={close} className={cn('absolute inset-0 bg-ink-950/90 backdrop-blur-md transition-opacity duration-500', phase === 'open' ? 'opacity-100' : 'opacity-0')} />
          <div
            className="relative overflow-hidden rounded-2xl shadow-pop"
            style={{
              width: size.w,
              height: size.h,
              transition: 'transform 420ms cubic-bezier(0.32,0.72,0,1), border-radius 420ms',
              ...(phase === 'open' ? { transform: 'none' } : flipFrom(index)),
            }}
          >
            <div
              key={img.id}
              onClick={toggleZoom}
              className={cn('h-full w-full transition-transform duration-500 ease-smooth', zoom > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in')}
              style={{ background: img.art, transform: `scale(${zoom})`, transformOrigin: origin, animation: dir ? `viewer-in-${dir > 0 ? 'r' : 'l'} 380ms cubic-bezier(0.16,1,0.3,1)` : undefined }}
            />
            <style>{'@keyframes viewer-in-r{from{opacity:.3;transform:translateX(40px)}}@keyframes viewer-in-l{from{opacity:.3;transform:translateX(-40px)}}'}</style>
          </div>
          <div className={cn('absolute inset-x-0 top-0 flex items-center justify-between p-4 transition-all duration-300', phase === 'open' ? 'opacity-100' : '-translate-y-2 opacity-0')}>
            <p className="text-sm font-medium text-white">
              {img.title} <span className="ml-2 text-ink-400">{index + 1} / {images.length}</span>
            </p>
            <div className="flex gap-2">
              <button aria-label="Zoom out" className={ctrl} onClick={() => setZoom((z) => Math.max(1, z - 0.6))}><ZoomOut className="h-4 w-4" /></button>
              <button aria-label="Zoom in" className={ctrl} onClick={() => setZoom((z) => Math.min(3.4, z + 0.6))}><ZoomIn className="h-4 w-4" /></button>
              <button aria-label="Close" className={ctrl} onClick={close}><X className="h-4 w-4" /></button>
            </div>
          </div>
          <button aria-label="Previous" onClick={() => nav(-1)} className={cn(ctrl, 'absolute left-4 top-1/2 -translate-y-1/2', phase !== 'open' && 'opacity-0')}><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Next" onClick={() => nav(1)} className={cn(ctrl, 'absolute right-4 top-1/2 -translate-y-1/2', phase !== 'open' && 'opacity-0')}><ChevronRight className="h-5 w-5" /></button>
        </div>
        </Portal>
      )}
    </>
  );
}

const art = (a: string, b: string, c: string, base: string) =>
  `radial-gradient(ellipse at 20% 15%, ${a}, transparent 55%), radial-gradient(ellipse at 85% 30%, ${b}, transparent 50%), radial-gradient(ellipse at 50% 100%, ${c}, transparent 60%), ${base}`;

const IMAGES: ViewerImage[] = [
  { id: 'dune', title: 'Dune at dusk', art: art('#f59e0b', '#f43f5e', '#7c2d12', '#1c0a05') },
  { id: 'fjord', title: 'Fjord morning', art: art('#bae6fd', '#2dd4bf', '#174eb6', '#06121f') },
  { id: 'meadow', title: 'Alpine meadow', art: art('#34d399', '#fbbf24', '#065f46', '#04140e') },
  { id: 'neon', title: 'Neon alley', art: art('#fb7185', '#38bdf8', '#0ea5e9', '#0a0a14') },
  { id: 'glacier', title: 'Glacier blue', art: art('#bce2ff', '#7dd3fc', '#14b8a6', '#08182b') },
  { id: 'ember', title: 'Ember field', art: art('#fb923c', '#fde047', '#be123c', '#180606') },
];

export function ImageViewerDemo() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <ImageViewer images={IMAGES} />
    </div>
  );
}
