import { useMemo, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type Polaroid = { id: number; image: string; caption: string };
type Placed = { x: number; y: number; r: number; z: number };

const scatter = (n: number): Placed[] =>
  Array.from({ length: n }, (_, i) => ({ x: 8 + ((i * 37) % 64) + Math.random() * 10, y: 6 + ((i * 23) % 40) + Math.random() * 8, r: (Math.random() - 0.5) * 22, z: i + 1 }));

/** Scattered polaroids you can drag around and bring to the front. */
export function PolaroidStack({ photos, height = 480, className }: { photos: Polaroid[]; height?: number; className?: string }) {
  const [placed, setPlaced] = useState<Placed[]>(() => scatter(photos.length));
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const top = () => Math.max(...placed.map((p) => p.z)) + 1;
  const front = (i: number) => setPlaced((ps) => ps.map((p, k) => (k === i ? { ...p, z: top() } : p)));

  return (
    <div className={cn('relative w-full', className)}>
      <div ref={box} className="relative w-full overflow-hidden rounded-2xl bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:18px_18px]" style={{ height }}>
        {photos.map((ph, i) => {
          const p = placed[i];
          return (
            <figure
              key={ph.id}
              tabIndex={0}
              aria-label={ph.caption}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') (e.preventDefault(), front(i));
                const step = { ArrowLeft: [-3, 0], ArrowRight: [3, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] }[e.key];
                if (step) (e.preventDefault(), setPlaced((ps) => ps.map((q, k) => (k === i ? { ...q, x: q.x + step[0], y: q.y + step[1] } : q))));
              }}
              onPointerDown={(e) => {
                front(i);
                drag.current = { i, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d || d.i !== i || !box.current) return;
                const r = box.current.getBoundingClientRect();
                const x = d.ox + ((e.clientX - d.sx) / r.width) * 100;
                const y = d.oy + ((e.clientY - d.sy) / r.height) * 100;
                setPlaced((ps) => ps.map((q, k) => (k === i ? { ...q, x: Math.min(78, Math.max(-4, x)), y: Math.min(60, Math.max(-4, y)) } : q)));
              }}
              onPointerUp={() => (drag.current = null)}
              className="focus-ring absolute w-[38%] max-w-[190px] cursor-grab touch-none rounded-sm bg-[#f6f3ec] p-2 pb-8 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.8)] transition-[transform,box-shadow] duration-300 ease-spring hover:shadow-[0_26px_50px_-14px_rgba(0,0,0,0.9)] active:cursor-grabbing sm:w-[30%]"
              style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: p.z, transform: `rotate(${p.r}deg)` }}
            >
              <img src={ph.image} alt="" draggable={false} className="aspect-square w-full object-cover" />
              <figcaption className="absolute inset-x-2 bottom-1.5 truncate text-center font-serif text-[15px] italic text-zinc-700">{ph.caption}</figcaption>
            </figure>
          );
        })}
      </div>
      <button onClick={() => setPlaced(scatter(photos.length))} className="focus-ring absolute bottom-3 right-3 z-[100] flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] text-white backdrop-blur transition-colors hover:bg-white/20">
        <Shuffle className="h-3.5 w-3.5" /> Shuffle
      </button>
    </div>
  );
}

export function PolaroidStackDemo() {
  const photos = useMemo(() => [0, 3, 5, 7, 9, 11].map((id) => ({ id, image: artwork(id, 400, 400), caption: `${ARTWORKS[id].place}, '${String(ARTWORKS[id].year).slice(2)}` })), []);
  return <PolaroidStack photos={photos} />;
}
