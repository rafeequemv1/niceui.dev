import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type DotPatternFade = 'none' | 'radial' | 'top' | 'bottom';

const DOT_MASKS: Record<DotPatternFade, string | undefined> = {
  none: undefined,
  radial: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
  top: 'linear-gradient(to bottom, transparent, black 45%)',
  bottom: 'linear-gradient(to top, transparent, black 45%)',
};

export type DotPatternProps = {
  /** Distance between dots in px. */
  gap?: number;
  /** Dot radius in px. */
  radius?: number;
  /** Dot colour (any CSS colour). */
  color?: string;
  /** Overall opacity, 0–1. */
  opacity?: number;
  /** Fade the pattern out toward the edges. */
  fade?: DotPatternFade;
  /** Number of dots that softly glow at random. 0 turns it off. */
  glow?: number;
  /** Glow colour. */
  glowColor?: string;
  className?: string;
};

/** A dotted background pattern: an SVG dot grid with an optional glow on random dots and an edge fade. */
export function DotPattern({ gap = 18, radius = 1.3, color = 'rgba(255,255,255,0.32)', opacity = 1, fade = 'radial', glow = 14, glowColor = '#7dd3fc', className }: DotPatternProps) {
  const id = useId().replace(/:/g, '');
  const [seed, setSeed] = useState(0);
  const reduce = useReducedMotionDots();

  // re-pick the glowing dots every few seconds
  useEffect(() => {
    if (!glow || reduce) return;
    const t = window.setInterval(() => setSeed((s) => s + 1), 2800);
    return () => window.clearInterval(t);
  }, [glow, reduce]);

  const lit = useMemo(() => {
    const out: Array<{ x: number; y: number; d: number }> = [];
    let s = (seed + 1) * 9301;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < glow; i++) out.push({ x: Math.floor(rnd() * 60), y: Math.floor(rnd() * 40), d: rnd() * 2 });
    return out;
  }, [glow, seed]);

  const mask = DOT_MASKS[fade];
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} style={{ opacity, maskImage: mask, WebkitMaskImage: mask }}>
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={`dots-${id}`} width={gap} height={gap} patternUnits="userSpaceOnUse">
            <circle cx={gap / 2} cy={gap / 2} r={radius} fill={color} />
          </pattern>
          <radialGradient id={`dotglow-${id}`}>
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${id})`} />
        {lit.map((p, i) => (
          <g key={`${seed}-${i}`} style={{ animation: reduce ? undefined : `dotpattern-pulse 2.8s ease-in-out ${p.d}s both` }}>
            <circle cx={p.x * gap + gap / 2} cy={p.y * gap + gap / 2} r={gap * 0.9} fill={`url(#dotglow-${id})`} opacity={0.45} />
            <circle cx={p.x * gap + gap / 2} cy={p.y * gap + gap / 2} r={radius * 1.4} fill={glowColor} />
          </g>
        ))}
      </svg>
      <style>{`@keyframes dotpattern-pulse{0%,100%{opacity:0}45%{opacity:1}}`}</style>
    </div>
  );
}

function useReducedMotionDots() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    const on = () => setReduce(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduce;
}

function DotDemoChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
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

export function DotPatternDemo() {
  const [gap, setGap] = useState(18);
  const [fade, setFade] = useState<DotPatternFade>('radial');
  const [glow, setGlow] = useState(true);
  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink-950 px-4 py-10">
      <DotPattern gap={gap} fade={fade} glow={glow ? 14 : 0} />
      <div className="relative max-w-sm rounded-2xl border border-white/10 bg-ink-950/70 p-6 text-center backdrop-blur">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">Dot pattern</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-50">Quiet texture, zero weight</h3>
        <p className="mt-2 text-sm text-ink-400">One SVG pattern behind any section.</p>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 p-2 backdrop-blur">
        <label className="flex items-center gap-2 px-1 text-[11px] text-ink-400">
          Gap
          <input type="range" min={10} max={36} value={gap} onChange={(e) => setGap(+e.target.value)} className="w-20 accent-sky-300" aria-label="Dot gap" />
        </label>
        {(['radial', 'top', 'bottom', 'none'] as const).map((f) => (
          <DotDemoChip key={f} on={fade === f} onClick={() => setFade(f)}>
            {f}
          </DotDemoChip>
        ))}
        <DotDemoChip on={glow} onClick={() => setGlow((g) => !g)}>
          Glow
        </DotDemoChip>
      </div>
    </div>
  );
}
