import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type CursorTrailVariant = 'ribbon' | 'particles' | 'dots';

export type CursorTrailProps = {
  variant?: CursorTrailVariant;
  /** Trail colour (any CSS colour). */
  color?: string;
  children?: ReactNode;
  className?: string;
};

type P = { x: number; y: number; vx: number; vy: number; life: number; r: number };

/**
 * A custom cursor trail drawn on a canvas inside its container: a fading ribbon,
 * drifting particles or a chain of spring dots. Follows touch drags too, and
 * pauses when off-screen.
 */
export function CursorTrail({ variant = 'ribbon', color = '#7dd3fc', children, className }: CursorTrailProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    const g = c.getContext('2d');
    if (!g) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const pts: { x: number; y: number; t: number }[] = [];
    const parts: P[] = [];
    const chain = Array.from({ length: 14 }, () => ({ x: -50, y: -50 }));
    const mouse = { x: -50, y: -50, on: false, t: 0 };

    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      if (!mouse.on) chain.forEach((p) => ((p.x = x), (p.y = y)));
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      mouse.x = x;
      mouse.y = y;
      mouse.on = true;
      mouse.t = performance.now();
      pts.push({ x, y, t: mouse.t });
      if (variant === 'particles' && !reduced) {
        const n = Math.min(4, 1 + Math.hypot(dx, dy) / 12);
        for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - 0.5) * 1.6 + dx * 0.05, vy: (Math.random() - 0.5) * 1.6 + dy * 0.05 - 0.3, life: 1, r: 1 + Math.random() * 2.4 });
      }
    };
    const leave = () => (mouse.on = false);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    io.observe(el);

    function draw(now: number) {
      raf = 0;
      if (!visible) return;
      g!.clearRect(0, 0, w, h);
      g!.globalCompositeOperation = 'lighter';
      if (variant === 'ribbon') {
        while (pts.length && now - pts[0].t > (reduced ? 120 : 420)) pts.shift();
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const k = i / pts.length;
          g!.strokeStyle = color;
          g!.globalAlpha = k * 0.9;
          g!.lineWidth = 1 + k * 7;
          g!.lineCap = 'round';
          g!.shadowColor = color;
          g!.shadowBlur = 14 * k;
          g!.beginPath();
          g!.moveTo(a.x, a.y);
          g!.lineTo(b.x, b.y);
          g!.stroke();
        }
        g!.shadowBlur = 0;
      } else if (variant === 'particles') {
        pts.length = 0;
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.02;
          p.vx *= 0.98;
          p.life -= 0.018;
          if (p.life <= 0) {
            parts.splice(i, 1);
            continue;
          }
          g!.globalAlpha = p.life;
          g!.fillStyle = color;
          g!.beginPath();
          g!.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          g!.fill();
        }
      } else {
        pts.length = 0;
        let lx = mouse.x;
        let ly = mouse.y;
        chain.forEach((p, i) => {
          const k = reduced ? 1 : 0.35 - i * 0.012;
          p.x += (lx - p.x) * k;
          p.y += (ly - p.y) * k;
          lx = p.x;
          ly = p.y;
          g!.globalAlpha = mouse.on ? 1 - i / chain.length : 0;
          g!.fillStyle = color;
          g!.beginPath();
          g!.arc(p.x, p.y, 6 - i * 0.35, 0, Math.PI * 2);
          g!.fill();
        });
      }
      g!.globalAlpha = 1;
      g!.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [variant, color]);

  return (
    <div ref={wrap} className={cn('relative overflow-hidden touch-pan-y', className)}>
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative">{children}</div>
    </div>
  );
}

const COLORS = ['#7dd3fc', '#c4b5fd', '#fda4af', '#86efac'];

export function CursorTrailDemo() {
  const [variant, setVariant] = useState<CursorTrailVariant>('ribbon');
  const [color, setColor] = useState(COLORS[0]);
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
        <div className="flex gap-1 rounded-xl bg-ink-900 p-1 text-xs shadow-card">
          {(['ribbon', 'particles', 'dots'] as const).map((v) => (
            <button key={v} onClick={() => setVariant(v)} aria-pressed={variant === v} className={cn('focus-ring rounded-lg px-3 py-1.5 capitalize transition-colors', variant === v ? 'bg-ink-800 text-ink-50' : 'text-ink-400 hover:text-ink-200')}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 rounded-xl bg-ink-900 p-1.5 shadow-card">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-label={`Colour ${c}`} aria-pressed={color === c} className={cn('focus-ring h-6 w-6 rounded-full ring-offset-2 ring-offset-ink-900 transition', color === c && 'ring-2 ring-white/60')} style={{ background: c }} />
          ))}
        </div>
      </div>
      <CursorTrail variant={variant} color={color} className="grid h-[300px] place-items-center rounded-2xl border border-white/[0.07] bg-ink-950 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]">
        <p className="pointer-events-none select-none text-center text-sm text-ink-400">
          Move your cursor, or drag a finger,
          <br />
          across this area.
        </p>
      </CursorTrail>
    </div>
  );
}
