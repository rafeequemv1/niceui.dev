import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type RetroGridProps = {
  /** Cell size in px. */
  cell?: number;
  /** Tilt of the floor in degrees. */
  angle?: number;
  /** Line colour. */
  color?: string;
  /** Horizon glow colour. */
  glow?: string;
  /** Seconds for one cell to scroll past. 0 stops the motion. */
  speed?: number;
  opacity?: number;
  className?: string;
};

/** A retro grid background: a perspective synthwave floor that scrolls toward the viewer, with a glowing horizon. */
export function RetroGrid({ cell = 56, angle = 66, color = 'rgba(125,211,252,0.45)', glow = 'rgba(56,189,248,0.35)', speed = 1.6, opacity = 1, className }: RetroGridProps) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} style={{ opacity }}>
      {/* horizon glow */}
      <div className="absolute inset-x-0 top-[38%] h-40 -translate-y-1/2 blur-2xl" style={{ background: `radial-gradient(60% 100% at 50% 50%, ${glow}, transparent)` }} />
      <div
        className="absolute inset-x-0 bottom-0 top-[42%] overflow-hidden"
        style={{ perspective: 220, perspectiveOrigin: '50% 0%', maskImage: 'linear-gradient(to bottom, transparent, black 45%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 45%)' }}
      >
        <div className="absolute -inset-x-[100%] bottom-0 h-[400%] origin-bottom" style={{ transform: `rotateX(${angle}deg)` }}>
          <div
            className="retrogrid-floor absolute inset-x-0 -top-[10%] bottom-0"
            style={{
              backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 0), linear-gradient(to bottom, ${color} 1px, transparent 0)`,
              backgroundSize: `${cell}px ${cell}px`,
              animation: speed ? `retrogrid-scroll ${speed}s linear infinite` : undefined,
              ['--retrogrid-cell' as string]: `${cell}px`,
            }}
          />
        </div>
      </div>
      <div className="absolute inset-x-0 top-[42%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)` }} />
      <style>{`@keyframes retrogrid-scroll{from{transform:translateY(0)}to{transform:translateY(var(--retrogrid-cell))}}@media (prefers-reduced-motion:reduce){.retrogrid-floor{animation:none!important}}`}</style>
    </div>
  );
}

function RetroDemoChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
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

const RETRO_THEMES: Array<{ label: string; color: string; glow: string }> = [
  { label: 'Sky', color: 'rgba(125,211,252,0.45)', glow: 'rgba(56,189,248,0.35)' },
  { label: 'Sunset', color: 'rgba(244,114,182,0.5)', glow: 'rgba(251,146,60,0.4)' },
  { label: 'Mono', color: 'rgba(255,255,255,0.22)', glow: 'rgba(255,255,255,0.18)' },
];

export function RetroGridDemo() {
  const [theme, setTheme] = useState(0);
  const [moving, setMoving] = useState(true);
  const t = RETRO_THEMES[theme];
  return (
    <div className="relative flex min-h-[380px] w-full flex-col items-center justify-start overflow-hidden rounded-2xl bg-ink-950 px-4 pt-12">
      <RetroGrid color={t.color} glow={t.glow} speed={moving ? 1.6 : 0} />
      <div className="relative text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-300">Retro grid</p>
        <h3 className="mt-2 bg-gradient-to-b from-white to-ink-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">Drive into the launch</h3>
      </div>
      <div className="relative mt-auto mb-5 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 bg-ink-900/80 p-2 backdrop-blur">
        {RETRO_THEMES.map((th, i) => (
          <RetroDemoChip key={th.label} on={theme === i} onClick={() => setTheme(i)}>
            {th.label}
          </RetroDemoChip>
        ))}
        <RetroDemoChip on={moving} onClick={() => setMoving((m) => !m)}>
          Motion
        </RetroDemoChip>
      </div>
    </div>
  );
}
