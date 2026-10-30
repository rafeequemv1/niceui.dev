import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { ChevronLeft, ChevronRight, Info, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type LightboxProps = {
  items?: Artwork[];
  /** Index opened on mount; omit to start on the grid. */
  defaultIndex?: number | null;
  className?: string;
};

/** Thumbnail grid with a viewer that zooms, pans, swipes and keeps a filmstrip in sync. */
export function Lightbox({ items = ARTWORKS, defaultIndex = null, className }: LightboxProps) {
  const [open, setOpen] = useState<number | null>(defaultIndex);
  const [zoom, setZoom] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [info, setInfo] = useState(true);
  const [dir, setDir] = useState(1);
  const viewer = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);

  const go = (d: number) => {
    if (open === null) return;
    setDir(d);
    setZoom(false);
    setPan({ x: 0, y: 0 });
    setOpen((open + d + items.length) % items.length);
  };
  const close = () => {
    setOpen(null);
    setZoom(false);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (open === null) return;
    viewer.current?.focus({ preventScroll: true });
    const el = strip.current?.children[open] as HTMLElement | undefined;
    const s = strip.current;
    if (el && s) s.scrollTo({ left: el.offsetLeft - s.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Escape') close();
    else if (e.key === 'z') setZoom((z) => !z);
    else return;
    e.preventDefault();
  };

  const down = (e: RPointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (zoom) setPan({ x: Math.max(-160, Math.min(160, d.px + dx)), y: Math.max(-110, Math.min(110, d.py + dy)) });
  };
  const up = (e: RPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!zoom && d.moved && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    else if (!d.moved) {
      setZoom((z) => !z);
      setPan({ x: 0, y: 0 });
    }
  };

  const cur = open === null ? null : items[open];

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl bg-ink-900 p-3 shadow-card sm:p-4', className)} style={{ minHeight: 440 }}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setOpen(i)}
            aria-label={`Open ${a.title}`}
            className="focus-ring group relative aspect-square overflow-hidden rounded-lg bg-ink-850"
          >
            <img src={artwork(a.id, 320, 320)} alt="" className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-110" />
            <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {cur && open !== null && (
        <div
          ref={viewer}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`${cur.title}, image ${open + 1} of ${items.length}`}
          onKeyDown={onKey}
          className="absolute inset-0 z-10 flex flex-col bg-black/95 outline-none animate-fade-in"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-white">
            <span className="font-mono text-xs tabular-nums text-white/60">
              {String(open + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1">
              <IconBtn label={zoom ? 'Zoom out' : 'Zoom in'} onClick={() => (setZoom((z) => !z), setPan({ x: 0, y: 0 }))}>
                {zoom ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </IconBtn>
              <IconBtn label="Toggle details" on={info} onClick={() => setInfo((v) => !v)}>
                <Info className="h-4 w-4" />
              </IconBtn>
              <IconBtn label="Close" onClick={close}>
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-10">
            <div
              key={open}
              className={cn('relative h-full max-h-full w-full touch-none select-none', dir > 0 ? 'animate-[lb-in-r_.45s_cubic-bezier(.16,1,.3,1)]' : 'animate-[lb-in-l_.45s_cubic-bezier(.16,1,.3,1)]')}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={() => (drag.current = null)}
              style={{ cursor: zoom ? 'grab' : 'zoom-in' }}
            >
              <img
                src={artwork(cur.id, 960, 640)}
                alt={`${cur.title} by ${cur.artist}`}
                draggable={false}
                className="h-full w-full object-contain transition-transform duration-500 ease-smooth"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom ? 2 : 1})` }}
              />
            </div>
            <NavBtn side="left" onClick={() => go(-1)} />
            <NavBtn side="right" onClick={() => go(1)} />
            <div className={cn('absolute bottom-3 left-3 max-w-[70%] rounded-xl border border-white/10 bg-black/60 px-3 py-2 backdrop-blur transition-all duration-300', info ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0')}>
              <p className="truncate text-sm font-medium text-white">{cur.title}</p>
              <p className="truncate text-xs text-white/60">
                {cur.artist} · {cur.place} · {cur.year}
              </p>
            </div>
          </div>

          <div ref={strip} className="flex gap-1.5 overflow-x-auto px-3 py-3 [scrollbar-width:none]">
            {items.map((a, i) => (
              <button
                key={a.id}
                onClick={() => (setDir(i > open ? 1 : -1), setOpen(i), setZoom(false), setPan({ x: 0, y: 0 }))}
                aria-label={`Show ${a.title}`}
                aria-current={i === open}
                className={cn('focus-ring relative h-11 w-16 shrink-0 overflow-hidden rounded-md transition-all duration-300', i === open ? 'opacity-100 ring-2 ring-brand-400' : 'opacity-40 hover:opacity-80')}
              >
                <img src={artwork(a.id, 320, 320)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <style>{`@keyframes lb-in-r{from{opacity:0;transform:translateX(40px) scale(.98)}to{opacity:1;transform:none}}@keyframes lb-in-l{from{opacity:0;transform:translateX(-40px) scale(.98)}to{opacity:1;transform:none}}`}</style>
        </div>
      )}
    </div>
  );
}

function IconBtn({ label, on, onClick, children }: { label: string; on?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} aria-pressed={on} className={cn('focus-ring grid h-8 w-8 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white', on && 'bg-white/10 text-white')}>
      {children}
    </button>
  );
}

function NavBtn({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous image' : 'Next image'}
      className={cn('focus-ring absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur transition-all hover:scale-105 hover:bg-white/15', side === 'left' ? 'left-1.5' : 'right-1.5')}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function LightboxDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Lightbox defaultIndex={2} />
    </div>
  );
}
