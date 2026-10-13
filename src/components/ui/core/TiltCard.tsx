import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import { Rocket, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  maxTilt?: number;
  /** Renders a light reflection that tracks the pointer. */
  glare?: boolean;
  /** Scale applied while hovered. */
  scale?: number;
};

export function TiltCard({ children, className, maxTilt = 12, glare = true, scale = 1.03 }: TiltCardProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const target = useRef({ rx: 0, ry: 0, gx: 50, gy: 50, s: 1, o: 0 });
  const current = useRef({ ...target.current });
  const raf = useRef(0);

  const tick = () => {
    const c = current.current;
    const t = target.current;
    let moving = false;
    (Object.keys(t) as Array<keyof typeof t>).forEach((k) => {
      const d = t[k] - c[k];
      if (Math.abs(d) > 0.001) moving = true;
      c[k] += d * 0.14;
    });
    const el = card.current;
    if (el) {
      el.style.transform = `perspective(900px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s})`;
      el.style.setProperty('--gx', `${c.gx}%`);
      el.style.setProperty('--gy', `${c.gy}%`);
      el.style.setProperty('--go', `${c.o}`);
    }
    raf.current = moving ? requestAnimationFrame(tick) : 0;
  };

  const kick = () => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = wrap.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    target.current = { rx: (0.5 - py) * maxTilt * 2, ry: (px - 0.5) * maxTilt * 2, gx: px * 100, gy: py * 100, s: scale, o: 1 };
    kick();
  };

  const onLeave = () => {
    target.current = { rx: 0, ry: 0, gx: 50, gy: 50, s: 1, o: 0 };
    kick();
  };

  return (
    <div ref={wrap} onPointerMove={onMove} onPointerLeave={onLeave} className={cn('[perspective:900px]', className)}>
      <div ref={card} className="relative h-full w-full will-change-transform [transform-style:preserve-3d]">
        {children}
        {glare && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
            style={{
              opacity: 'var(--go, 0)',
              background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.55), transparent 55%)',
              borderRadius: 'inherit',
            }}
          />
        )}
      </div>
    </div>
  );
}

export function TiltCardDemo() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-8 md:flex-row">
      <TiltCard className="w-full max-w-[340px]">
        <div className="relative aspect-[1.586] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-700 to-ink-950 p-6 text-white shadow-pop">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-300/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between [transform:translateZ(40px)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles className="h-4 w-4" /> NiceUI
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-white/70">Platinum</span>
            </div>
            <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner" />
            <div>
              <p className="font-mono text-lg tracking-[0.18em]">4242 8810 3021 0097</p>
              <div className="mt-2 flex justify-between text-xs text-white/75">
                <span>MAYA CHEN</span>
                <span>09 / 29</span>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>

      <TiltCard className="w-full max-w-[260px]" maxTilt={16}>
        <div className="relative overflow-hidden rounded-2xl bg-ink-900 p-5 shadow-card">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_30%_20%,#1b77f5,transparent_60%),radial-gradient(circle_at_80%_90%,#14b8a6,transparent_55%)] bg-ink-950">
            <div className="dot-bg absolute inset-0 opacity-60" />
            <Rocket className="relative h-16 w-16 text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] [transform:translateZ(60px)]" strokeWidth={1.5} />
          </div>
          <div className="mt-4 [transform:translateZ(30px)]">
            <p className="text-sm font-medium text-ink-50">Launch Week 08</p>
            <p className="mt-0.5 text-xs text-ink-400">Five days, five big releases.</p>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
