import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export type CylinderCard = { id: string; title: string; subtitle: string; gradient: string };

export type CylinderCarouselProps = {
  cards: CylinderCard[];
  cardWidth?: number;
  cardHeight?: number;
  /** Degrees rotated per pixel dragged. */
  sensitivity?: number;
};

export function CylinderCarousel({ cards, cardWidth = 200, cardHeight = 260, sensitivity = 0.35 }: CylinderCarouselProps) {
  const n = cards.length;
  const step = 360 / n;
  const radius = Math.round(cardWidth / 2 / Math.tan(Math.PI / n)) + 24;
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ x: 0, angle: 0, moved: false });
  const root = useRef<HTMLDivElement>(null);

  const index = (((Math.round(-angle / step) % n) + n) % n);
  const go = (dir: number) => setAngle((a) => Math.round(a / step) * step - dir * step);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, angle, moved: false };
    setDragging(true);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    setAngle(drag.current.angle + dx * sensitivity);
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    setAngle((a) => Math.round(a / step) * step);
  };

  return (
    <div ref={root} tabIndex={0} className="focus-ring flex flex-col items-center gap-6 rounded-2xl outline-none" aria-roledescription="carousel">
      <div
        className={cn('relative w-full touch-pan-y select-none', dragging ? 'cursor-grabbing' : 'cursor-grab')}
        style={{ height: cardHeight + 40, perspective: 1100 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="absolute left-1/2 top-5"
          style={{
            width: cardWidth,
            height: cardHeight,
            marginLeft: -cardWidth / 2,
            transformStyle: 'preserve-3d',
            transform: `translateZ(${-radius}px) rotateY(${angle}deg)`,
            transition: dragging ? 'none' : 'transform 700ms cubic-bezier(0.34,1.2,0.64,1)',
          }}
        >
          {cards.map((c, i) => {
            const rel = ((((i * step + angle) % 360) + 540) % 360) - 180; // -180..180, 0 = front
            const facing = Math.cos((rel * Math.PI) / 180);
            return (
              <div
                key={c.id}
                onClick={() => !drag.current.moved && setAngle(Math.round(angle / step) * step - Math.round(rel / step) * step)}
                className="absolute inset-0 overflow-hidden rounded-2xl shadow-pop"
                style={{
                  transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                  background: c.gradient,
                  opacity: 0.25 + 0.75 * Math.max(0, facing),
                  filter: `brightness(${0.5 + 0.5 * Math.max(0, facing)})`,
                  transition: dragging ? 'none' : 'opacity 500ms, filter 500ms',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-sm font-medium text-white">{c.title}</p>
                  <p className="text-xs text-white/70">{c.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => go(-1)} aria-label="Previous" className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-ink-850 text-ink-200 shadow-hairline transition hover:bg-ink-800 hover:text-ink-50 active:scale-90">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {cards.map((c, i) => (
            <span key={c.id} className={cn('h-1.5 rounded-full transition-all duration-500 ease-spring', i === index ? 'w-5 bg-ink-50' : 'w-1.5 bg-ink-600')} />
          ))}
        </div>
        <button onClick={() => go(1)} aria-label="Next" className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-ink-850 text-ink-200 shadow-hairline transition hover:bg-ink-800 hover:text-ink-50 active:scale-90">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const g = (a: string, b: string, base: string) => `radial-gradient(circle at 25% 20%, ${a}, transparent 55%), radial-gradient(circle at 80% 85%, ${b}, transparent 60%), ${base}`;

const CARDS: CylinderCard[] = [
  { id: 'kyoto', title: 'Kyoto', subtitle: 'Temples at dawn', gradient: g('#f43f5e', '#f59e0b', '#2a0f14') },
  { id: 'reykjavik', title: 'Reykjavík', subtitle: 'Northern lights', gradient: g('#2dd4bf', '#3396ff', '#071f1a') },
  { id: 'lisbon', title: 'Lisbon', subtitle: 'Golden hour trams', gradient: g('#fbbf24', '#fb7185', '#2b1a06') },
  { id: 'patagonia', title: 'Patagonia', subtitle: 'Glacier trek', gradient: g('#8ed1ff', '#0ea5e9', '#0b1a33') },
  { id: 'marrakech', title: 'Marrakech', subtitle: 'Spice markets', gradient: g('#f97316', '#f43f5e', '#2a1206') },
  { id: 'banff', title: 'Banff', subtitle: 'Lake Louise', gradient: g('#10b981', '#59b6ff', '#062019') },
  { id: 'santorini', title: 'Santorini', subtitle: 'Caldera sunset', gradient: g('#3396ff', '#fbbf24', '#0b1a33') },
  { id: 'hanoi', title: 'Hanoi', subtitle: 'Old quarter nights', gradient: g('#fb7185', '#14b8a6', '#1e0b14') },
];

export function CylinderCarouselDemo() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <CylinderCarousel cards={CARDS} />
    </div>
  );
}
