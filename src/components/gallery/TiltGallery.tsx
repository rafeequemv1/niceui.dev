import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type TiltGalleryProps = {
  items?: Artwork[];
  src?: (item: Artwork) => string;
  /** Maximum tilt in degrees. */
  maxTilt?: number;
  className?: string;
};

type Tilt = { id: number; rx: number; ry: number; gx: number; gy: number } | null;
type Open = { item: Artwork; from: DOMRect; box: DOMRect; expanded: boolean } | null;

/** A grid of cards that tilt toward the pointer with glare and floating captions; click to zoom one open. */
export function TiltGallery({ items = ARTWORKS.slice(0, 6), src = (a) => artwork(a.id, 800, 600), maxTilt = 12, className }: TiltGalleryProps) {
  const [tilt, setTilt] = useState<Tilt>(null);
  const [open, setOpen] = useState<Open>(null);
  const box = useRef<HTMLDivElement>(null);
  const urls = useMemo(() => new Map(items.map((a) => [a.id, src(a)])), [items, src]);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e: PointerEvent<HTMLButtonElement>, id: number) => {
    if (reduce || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ id, ry: (px - 0.5) * 2 * maxTilt, rx: -(py - 0.5) * 2 * maxTilt, gx: px * 100, gy: py * 100 });
  };

  const expand = (item: Artwork, el: HTMLElement) => {
    const b = box.current;
    if (!b) return;
    setTilt(null);
    setOpen({ item, from: el.getBoundingClientRect(), box: b.getBoundingClientRect(), expanded: false });
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen((o) => (o ? { ...o, expanded: true } : o))));
  };
  const close = () => {
    setOpen((o) => (o ? { ...o, expanded: false } : o));
    window.setTimeout(() => setOpen(null), reduce ? 0 : 420);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Overlay geometry, relative to the gallery box.
  let frameStyle: CSSProperties = {};
  if (open) {
    const { from, box: bx, expanded } = open;
    const pad = 12;
    const maxW = bx.width - pad * 2;
    const maxH = bx.height - pad * 2 - 72;
    const ratio = from.width / from.height;
    const w = Math.min(maxW, maxH * ratio);
    const h = w / ratio;
    frameStyle = expanded
      ? { left: (bx.width - w) / 2, top: pad, width: w, height: h }
      : { left: from.left - bx.left, top: from.top - bx.top, width: from.width, height: from.height };
  }

  return (
    <div ref={box} className={cn('relative w-full', className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" style={{ perspective: 900 }}>
        {items.map((it) => {
          const t = tilt?.id === it.id ? tilt : null;
          return (
            <button
              key={it.id}
              type="button"
              aria-label={`Open ${it.title}`}
              onPointerMove={(e) => onMove(e, it.id)}
              onPointerLeave={() => setTilt((cur) => (cur?.id === it.id ? null : cur))}
              onClick={(e) => expand(it, e.currentTarget)}
              className={cn('focus-ring group relative aspect-[4/3] rounded-2xl', open?.item.id === it.id && 'opacity-0')}
              style={{ transformStyle: 'preserve-3d', transform: `rotateX(${t?.rx ?? 0}deg) rotateY(${t?.ry ?? 0}deg) scale(${t ? 1.03 : 1})`, transition: t ? 'transform 80ms linear' : 'transform 500ms cubic-bezier(.16,1,.3,1)' }}
            >
              <span className="absolute inset-0 overflow-hidden rounded-2xl shadow-card ring-1 ring-white/10">
                <img src={urls.get(it.id)} alt="" draggable={false} className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span
                  className="absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at ${t?.gx ?? 50}% ${t?.gy ?? 50}%, rgba(255,255,255,0.55), transparent 55%)` }}
                />
              </span>
              <span className="absolute inset-x-3 bottom-3 text-left" style={{ transform: 'translateZ(40px)' }}>
                <span className="block truncate text-[13px] font-medium text-white drop-shadow sm:text-sm">{it.title}</span>
                <span className="mt-0.5 hidden items-center gap-1 text-[11px] text-white/70 sm:flex">
                  <MapPin className="h-3 w-3" /> {it.place}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="absolute inset-0 z-20" role="dialog" aria-modal="true" aria-label={open.item.title}>
          <button aria-label="Close" onClick={close} className={cn('absolute inset-0 rounded-2xl bg-ink-950/80 backdrop-blur-sm transition-opacity duration-500', open.expanded ? 'opacity-100' : 'opacity-0')} />
          <div className="absolute overflow-hidden rounded-2xl shadow-pop ring-1 ring-white/15 transition-all duration-500 ease-smooth" style={frameStyle}>
            <img src={urls.get(open.item.id)} alt={open.item.title} className="h-full w-full object-cover" />
          </div>
          <div className={cn('absolute inset-x-0 bottom-3 flex items-end justify-between gap-3 px-4 transition-all duration-500', open.expanded ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
            <div className="min-w-0">
              <p className="truncate font-serif text-2xl italic text-ink-50">{open.item.title}</p>
              <p className="truncate text-xs text-ink-400">
                {open.item.artist} · {open.item.place}, {open.item.year}
              </p>
            </div>
            <button onClick={close} aria-label="Close" className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-ink-100 ring-1 ring-white/15 transition hover:bg-white/15">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TiltGalleryDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <TiltGallery />
    </div>
  );
}
