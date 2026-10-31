import { useEffect, useMemo, useState } from 'react';
import { Eye, Play, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ARTWORKS, artwork } from './art';

export type Reel = { id: number; title: string; image: string; views: string; duration: number };

function ReelCard({ reel, active, onActivate }: { reel: Reel; active: boolean; onActivate: (on: boolean) => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) return setP(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setP(0.5);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setP(((now - start) / 1000 / reel.duration) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reel.duration]);

  return (
    <button
      onMouseEnter={() => onActivate(true)}
      onMouseLeave={() => onActivate(false)}
      onFocus={() => onActivate(true)}
      onBlur={() => onActivate(false)}
      onClick={() => onActivate(!active)}
      className={cn('focus-ring group relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black text-left shadow-card transition-transform duration-500 ease-smooth', active && '-translate-y-1')}
      aria-label={`${reel.title}, ${reel.views} views`}
    >
      <img src={reel.image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ transform: `scale(${1.08 + p * 0.18}) translateY(${-p * 6}%)` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
      <div className="absolute inset-x-2 top-2 flex gap-1">
        <span className="h-0.5 flex-1 overflow-hidden rounded bg-white/25"><span className="block h-full bg-white" style={{ width: `${p * 100}%` }} /></span>
      </div>
      <span className="absolute right-2 top-4 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9.5px] text-white/85 backdrop-blur">0:{String(reel.duration).padStart(2, '0')}</span>
      <span className={cn('absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-all duration-300', active ? 'scale-75 opacity-0' : 'opacity-100')}>
        <Play className="ml-0.5 h-4 w-4 fill-current" />
      </span>
      <div className="absolute inset-x-3 bottom-3">
        <p className="text-[13px] font-medium leading-snug text-white">{reel.title}</p>
        <p className="mt-1 flex items-center gap-2 font-mono text-[10px] text-white/70">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{reel.views}</span>
          {active && <span className="flex items-center gap-1 text-brand-300"><Volume2 className="h-3 w-3" />Playing</span>}
        </p>
      </div>
    </button>
  );
}

export function ReelGrid({ reels, className }: { reels: Reel[]; className?: string }) {
  const [active, setActive] = useState<number | null>(reels[1]?.id ?? null);
  return (
    <div className={cn('grid w-full grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {reels.map((r) => (
        <ReelCard key={r.id} reel={r} active={active === r.id} onActivate={(on) => setActive((a) => (on ? r.id : a === r.id ? null : a))} />
      ))}
    </div>
  );
}

export function ReelGridDemo() {
  const reels = useMemo(() => [1, 3, 6, 8].map((id, i) => ({ id, title: ARTWORKS[id].title, image: artwork(id, 360, 640), views: ['1.2M', '384K', '92K', '2.4M'][i], duration: [14, 9, 12, 18][i] })), []);
  return <ReelGrid reels={reels} />;
}
