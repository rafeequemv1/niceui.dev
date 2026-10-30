import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Heart, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork, type Artwork } from './art';

export type StackCarouselProps = {
  items?: Artwork[];
  src?: (item: Artwork) => string;
  onSwipe?: (item: Artwork, dir: 'left' | 'right') => void;
  className?: string;
};

const THRESHOLD = 110;

/** Swipeable photo stack: drag the top card, it tilts, then flies out left or right. */
export function StackCarousel({ items = ARTWORKS.slice(0, 7), src = (a) => artwork(a.id, 600, 760), onSwipe, className }: StackCarouselProps) {
  const [deck, setDeck] = useState(items);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [fly, setFly] = useState<'left' | 'right' | null>(null);
  const [kept, setKept] = useState<Artwork[]>([]);
  const [skipped, setSkipped] = useState(0);
  const start = useRef({ x: 0, y: 0 });
  const timer = useRef<number>();
  const urls = useMemo(() => new Map(items.map((a) => [a.id, src(a)])), [items, src]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const top = deck[0];

  const swipe = (dir: 'left' | 'right') => {
    if (!top || fly) return;
    setFly(dir);
    onSwipe?.(top, dir);
    if (dir === 'right') setKept((k) => [top, ...k].slice(0, 5));
    else setSkipped((s) => s + 1);
    timer.current = window.setTimeout(() => {
      setDeck((d) => d.slice(1));
      setFly(null);
      setDrag({ x: 0, y: 0, active: false });
    }, 320);
  };

  const restack = () => {
    setDeck(items);
    setKept([]);
    setSkipped(0);
  };

  const onDown = (e: PointerEvent) => {
    if (fly) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  };
  const onMove = (e: PointerEvent) => {
    if (!drag.active) return;
    setDrag({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.4, active: true });
  };
  const onUp = () => {
    if (!drag.active) return;
    if (Math.abs(drag.x) > THRESHOLD) swipe(drag.x > 0 ? 'right' : 'left');
    else setDrag({ x: 0, y: 0, active: false });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') (e.preventDefault(), swipe('left'));
    if (e.key === 'ArrowRight') (e.preventDefault(), swipe('right'));
  };

  const x = fly ? (fly === 'right' ? 640 : -640) : drag.x;
  const intent = Math.max(-1, Math.min(1, x / THRESHOLD));

  return (
    <div className={cn('flex w-full flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center sm:gap-10', className)}>
      <div className="flex flex-col items-center gap-5">
        <div
          role="region"
          aria-label="Photo stack. Use left and right arrow keys to skip or keep."
          tabIndex={0}
          onKeyDown={onKey}
          className="focus-ring relative h-[340px] w-[256px] rounded-3xl"
        >
          {deck.length === 0 && (
            <div className="absolute inset-0 grid place-items-center rounded-3xl border border-dashed border-white/15 text-center animate-fade-in">
              <div>
                <p className="text-sm text-ink-200">That’s the whole stack.</p>
                <button onClick={restack} className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink-950">
                  <RotateCcw className="h-3.5 w-3.5" /> Restack
                </button>
              </div>
            </div>
          )}
          {deck
            .slice(0, 4)
            .map((it, i) => {
              const isTop = i === 0;
              const depth = isTop ? 0 : i - Math.min(1, Math.abs(intent)) * (i === 1 ? 1 : 0.5);
              const style = isTop
                ? { transform: `translate(${x}px, ${drag.y}px) rotate(${x / 14}deg)`, zIndex: 10 }
                : { transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05}) rotate(${(i % 2 ? 1 : -1) * depth * 2}deg)`, zIndex: 10 - i };
              return (
                <div
                  key={it.id}
                  onPointerDown={isTop ? onDown : undefined}
                  onPointerMove={isTop ? onMove : undefined}
                  onPointerUp={isTop ? onUp : undefined}
                  onPointerCancel={isTop ? onUp : undefined}
                  className={cn(
                    'absolute inset-0 overflow-hidden rounded-3xl bg-ink-900 shadow-pop ring-1 ring-white/10',
                    isTop ? 'cursor-grab touch-none active:cursor-grabbing' : '',
                    drag.active && isTop ? '' : 'transition-transform duration-300 ease-smooth',
                  )}
                  style={{ ...style, opacity: fly && isTop ? 0 : 1, transition: fly && isTop ? 'transform 320ms cubic-bezier(.4,0,1,1), opacity 320ms' : undefined }}
                >
                  <img src={urls.get(it.id)} alt={it.title} draggable={false} className="h-full w-full select-none object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16">
                    <p className="font-serif text-2xl italic leading-tight text-white">{it.title}</p>
                    <p className="mt-1 text-xs text-white/70">
                      {it.artist} · {it.place}
                    </p>
                  </div>
                  {isTop && (
                    <>
                      <span className="absolute left-4 top-4 rotate-[-12deg] rounded-lg border-2 border-emerald-400 px-2 py-0.5 text-sm font-bold uppercase tracking-wider text-emerald-300" style={{ opacity: Math.max(0, intent) }}>
                        Keep
                      </span>
                      <span className="absolute right-4 top-4 rotate-[12deg] rounded-lg border-2 border-rose-400 px-2 py-0.5 text-sm font-bold uppercase tracking-wider text-rose-300" style={{ opacity: Math.max(0, -intent) }}>
                        Skip
                      </span>
                    </>
                  )}
                </div>
              );
            })
            .reverse()}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => swipe('left')} disabled={!top} aria-label="Skip" className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-white/5 text-rose-300 ring-1 ring-white/10 transition hover:scale-105 hover:bg-rose-500/10 active:scale-95 disabled:opacity-30">
            <X className="h-5 w-5" />
          </button>
          <button onClick={restack} aria-label="Restack" className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/5 text-ink-300 ring-1 ring-white/10 transition hover:bg-white/10">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={() => swipe('right')} disabled={!top} aria-label="Keep" className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-white/5 text-emerald-300 ring-1 ring-white/10 transition hover:scale-105 hover:bg-emerald-500/10 active:scale-95 disabled:opacity-30">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="w-full max-w-[256px] sm:w-48">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">Kept · {kept.length}</p>
        <div className="mt-2 flex gap-1.5 sm:flex-col">
          {kept.length === 0 && <p className="text-xs text-ink-500">Swipe right, press →, or tap the heart.</p>}
          {kept.map((k) => (
            <div key={k.id} className="flex min-w-0 items-center gap-2 rounded-lg bg-white/[0.03] p-1.5 ring-1 ring-white/5 animate-fade-up">
              <img src={urls.get(k.id)} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
              <span className="hidden min-w-0 truncate text-xs text-ink-200 sm:block">{k.title}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-500">Skipped {skipped}</p>
      </div>
    </div>
  );
}

export function StackCarouselDemo() {
  return <StackCarousel />;
}
