import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ParticlesProps = { quantity?: number; color?: string; children?: ReactNode; className?: string };

/** Canvas particles that drift slowly and lean away from the pointer. */
export function Particles({ quantity = 90, color = '125, 211, 252', children, className }: ParticlesProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = wrap.current;
    const canvas = cvs.current;
    const ctx = canvas?.getContext('2d');
    if (!el || !canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const mouse = { x: -9999, y: -9999 };
    const ps = Array.from({ length: quantity }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15, r: 0.6 + Math.random() * 1.6, a: 0.2 + Math.random() * 0.7, ox: 0, oy: 0 }));
    const resize = () => {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!reduce) {
          p.x = (p.x + p.vx / w + 1) % 1;
          p.y = (p.y + p.vy / h + 1) % 1;
        }
        const px = p.x * w;
        const py = p.y * h;
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const d = Math.hypot(dx, dy);
        const push = d < 120 ? (120 - d) / 120 : 0;
        p.ox += ((d ? dx / d : 0) * push * 30 - p.ox) * 0.08;
        p.oy += ((d ? dy / d : 0) * push * 30 - p.oy) * 0.08;
        ctx.beginPath();
        ctx.arc(px + p.ox, py + p.oy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.a})`;
        ctx.fill();
      }
    };
    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    resize();
    loop();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => ((mouse.x = -9999), (mouse.y = -9999));
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [quantity, color]);
  return (
    <div ref={wrap} className={cn('relative overflow-hidden rounded-2xl bg-ink-950', className)}>
      <canvas ref={cvs} aria-hidden className="pointer-events-none absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function ParticlesDemo() {
  return (
    <Particles className="flex min-h-[360px] w-full items-center justify-center px-6 text-center">
      <div>
        <h3 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Move your <em className="font-serif font-normal italic text-brand-300">cursor</em>.
        </h3>
        <p className="mt-3 text-sm text-ink-400">Particles drift on their own and lean away from the pointer.</p>
      </div>
    </Particles>
  );
}
