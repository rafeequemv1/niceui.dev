import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type WarpBackgroundProps = {
  children?: ReactNode;
  /** Grid cells across each wall. */
  cells?: number;
  /** Light beams per wall. */
  beams?: number;
  /** Grid line colour. */
  gridColor?: string;
  /** Beam colours, picked at random. */
  beamColors?: string[];
  /** Seconds for a beam to travel the tunnel. */
  duration?: number;
  /** Tunnel depth in px. */
  depth?: number;
  /** Perspective distance in px (smaller = stronger). */
  perspective?: number;
  className?: string;
};

type WarpBeam = { x: number; delay: number; dur: number; color: string; width: number };

function useWarpBeams(count: number, colors: string[], duration: number, salt: number): WarpBeam[] {
  return useMemo(() => {
    let s = 7 + salt * 131;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, () => ({
      x: 4 + rnd() * 92,
      delay: -rnd() * duration,
      dur: duration * (0.7 + rnd() * 0.6),
      color: colors[Math.floor(rnd() * colors.length)],
      width: 1 + Math.round(rnd() * 2),
    }));
  }, [count, colors, duration, salt]);
}

/** One wall, hinged on the top edge of a square and folded away from the viewer. */
function WarpWall({ rotate, cells, gridColor, beams, depth }: { rotate: number; cells: number; gridColor: string; beams: WarpBeam[]; depth: number }) {
  return (
    <div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: `rotate(${rotate}deg)` }}>
      <div
        className="absolute inset-x-0 top-0 origin-top overflow-hidden"
        style={{
          height: depth,
          transform: 'rotateX(-90deg)',
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: `${100 / cells}% ${depth / cells}px`,
        }}
      >
        {beams.map((b, i) => (
          <span
            key={i}
            className="warp-beam absolute top-0 rounded-full"
            style={{
              left: `${b.x}%`,
              width: b.width,
              height: depth / 4,
              background: `linear-gradient(to top, transparent, ${b.color})`,
              boxShadow: `0 0 10px ${b.color}`,
              animation: `warp-travel ${b.dur}s linear ${b.delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** A warp background: a perspective tunnel of grid walls with light beams travelling toward you, framing a centred child. */
export function WarpBackground({
  children,
  cells = 10,
  beams = 3,
  gridColor = 'rgba(255,255,255,0.09)',
  beamColors = ['#7dd3fc', '#a78bfa', '#f0abfc', '#6ee7b7'],
  duration = 3.2,
  depth = 520,
  perspective = 140,
  className,
}: WarpBackgroundProps) {
  const sets = [useWarpBeams(beams, beamColors, duration, 1), useWarpBeams(beams, beamColors, duration, 2), useWarpBeams(beams, beamColors, duration, 3), useWarpBeams(beams, beamColors, duration, 4)];
  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={{ ['--warp-depth' as string]: `${depth}px` }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden" style={{ containerType: 'size' }}>
        {/* a square tunnel, large enough to cover the box */}
        <div className="relative aspect-square shrink-0" style={{ width: 'max(100cqw, 100cqh)', perspective, transformStyle: 'preserve-3d' }}>
          {[0, 90, 180, 270].map((r, i) => (
            <WarpWall key={r} rotate={r} cells={cells} gridColor={gridColor} beams={sets[i]} depth={depth} />
          ))}
        </div>
      </div>
      <div className="relative">{children}</div>
      <style>{`@keyframes warp-travel{from{transform:translateY(var(--warp-depth));opacity:0}15%{opacity:1}to{transform:translateY(-100%);opacity:.4}}@media (prefers-reduced-motion:reduce){.warp-beam{animation:none!important;opacity:.6;transform:translateY(calc(var(--warp-depth) / 2))}}`}</style>
    </div>
  );
}

function WarpDemoChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn('focus-ring rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors', on ? 'bg-brand-300 text-ink-950' : 'bg-white/[0.06] text-ink-300 hover:text-ink-50')}
    >
      {children}
    </button>
  );
}

export function WarpBackgroundDemo() {
  const [beams, setBeams] = useState(3);
  const [persp, setPersp] = useState(140);
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <WarpBackground beams={beams} perspective={persp} className="w-full max-w-xl rounded-2xl border border-white/10 bg-ink-950 p-10 sm:p-16">
        <div className="mx-auto max-w-xs rounded-2xl border border-white/10 bg-ink-900/90 p-6 text-center shadow-card backdrop-blur">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">Warp background</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink-50">Pull people into the card</h3>
          <p className="mt-2 text-sm text-ink-400">A tunnel of grid walls with travelling light.</p>
        </div>
      </WarpBackground>
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 p-2">
        {[1, 3, 6].map((n) => (
          <WarpDemoChip key={n} on={beams === n} onClick={() => setBeams(n)}>
            {n} {n === 1 ? 'beam' : 'beams'}
          </WarpDemoChip>
        ))}
        <label className="flex items-center gap-2 px-1 text-[11px] text-ink-400">
          Perspective
          <input type="range" min={70} max={320} value={persp} onChange={(e) => setPersp(+e.target.value)} className="w-20 accent-sky-300" aria-label="Perspective" />
        </label>
      </div>
    </div>
  );
}
