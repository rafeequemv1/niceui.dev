import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Bell, Bot, Box, Brush, Calendar, Camera, Cloud, Code2, Compass, Cpu, Database, Feather, Flame, Gauge, Globe, Heart, Image, Key, Layers, Leaf, Lock, Mail, Map, Mic, Moon, Music, Palette, Rocket, Search, Shield, Sparkles, Star, Sun, Terminal, Wand2, Zap, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/cn';

const ICONS: ComponentType<LucideProps>[] = [Bell, Bot, Box, Brush, Calendar, Camera, Cloud, Code2, Compass, Cpu, Database, Feather, Flame, Gauge, Globe, Heart, Image, Key, Layers, Leaf, Lock, Mail, Map, Mic, Moon, Music, Palette, Rocket, Search, Shield, Sparkles, Star, Sun, Terminal, Wand2, Zap];

export type IconCloudProps = {
  /** Icons or text tags to place on the sphere. Defaults to generic line icons. */
  items?: Array<ComponentType<LucideProps> | string>;
  /** Sphere size in px. */
  size?: number;
  /** Idle spin speed (radians per second). */
  speed?: number;
  className?: string;
};

/**
 * An interactive 3D icon cloud: items spread evenly on a sphere that spins on
 * its own, can be dragged in any direction, and highlights the item you hover.
 */
export function IconCloud({ items = ICONS, size = 320, speed = 0.35, className }: IconCloudProps) {
  const root = useRef<HTMLDivElement>(null);
  const nodes = useRef<Array<HTMLElement | null>>([]);
  const [hot, setHot] = useState<number | null>(null);
  const pts = useMemo(() => {
    const n = items.length;
    const ga = Math.PI * (3 - Math.sqrt(5));
    return items.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      return { x: Math.cos(ga * i) * r, y, z: Math.sin(ga * i) * r };
    });
  }, [items]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ax = 0.3;
    let ay = 0;
    let vx = 0;
    let vy = speed / 60;
    let drag: { x: number; y: number } | null = null;
    let raf = 0;
    let visible = true;
    const R = size * 0.4;

    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      vy = (e.clientX - drag.x) * 0.004;
      vx = -(e.clientY - drag.y) * 0.004;
      drag = { x: e.clientX, y: e.clientY };
    };
    const up = () => (drag = null);
    const key = (e: KeyboardEvent) => {
      const k: Record<string, [number, number]> = { ArrowLeft: [0, -0.06], ArrowRight: [0, 0.06], ArrowUp: [0.06, 0], ArrowDown: [-0.06, 0] };
      if (k[e.key]) {
        e.preventDefault();
        vx = k[e.key][0];
        vy = k[e.key][1];
      }
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('keydown', key);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);

    function tick() {
      raf = 0;
      if (!visible) return;
      if (!drag) {
        vx += (0 - vx) * 0.03;
        vy += ((reduced ? 0 : speed / 60) - vy) * 0.03;
      }
      ax += vx;
      ay += vy;
      const cx = Math.cos(ax);
      const sx = Math.sin(ax);
      const cy = Math.cos(ay);
      const sy = Math.sin(ay);
      pts.forEach((p, i) => {
        const n = nodes.current[i];
        if (!n) return;
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2;
        const s = 0.55 + depth * 0.6;
        n.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${s})`;
        n.style.opacity = String(0.18 + depth * 0.82);
        n.style.zIndex = String(Math.round(depth * 100));
        n.style.filter = depth < 0.35 ? `blur(${(0.35 - depth) * 4}px)` : 'none';
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('keydown', key);
    };
  }, [pts, size, speed]);

  return (
    <div
      ref={root}
      tabIndex={0}
      role="img"
      aria-label="Rotating cloud of icons. Drag or use the arrow keys to spin it."
      className={cn('focus-ring relative cursor-grab touch-none select-none rounded-full active:cursor-grabbing', className)}
      style={{ width: size, height: size }}
    >
      <div aria-hidden className="absolute inset-[12%] rounded-full bg-brand-500/10 blur-3xl" />
      {items.map((Item, i) => (
        <span
          key={i}
          ref={(el) => (nodes.current[i] = el)}
          onPointerEnter={() => setHot(i)}
          onPointerLeave={() => setHot(null)}
          className={cn(
            'absolute left-1/2 top-1/2 grid place-items-center rounded-xl border transition-colors duration-200 will-change-transform',
            typeof Item === 'string' ? 'h-8 px-3 text-xs font-medium' : 'h-10 w-10',
            hot === i ? 'border-brand-300/60 bg-brand-300/15 text-brand-100 shadow-[0_0_24px_rgba(125,211,252,0.45)]' : 'border-white/10 bg-ink-900/80 text-ink-300',
          )}
        >
          {typeof Item === 'string' ? Item : <Item className="h-[18px] w-[18px]" strokeWidth={1.6} />}
        </span>
      ))}
    </div>
  );
}

const TAGS = ['React', 'Tailwind', 'Motion', 'TypeScript', 'Canvas', 'SVG', 'A11y', 'Dark mode', 'Hooks', 'Tokens', 'CSS', 'Vite', 'Charts', 'Forms', 'Agents', 'MCP', 'Shaders', 'Layout'];

export function IconCloudDemo() {
  const [mode, setMode] = useState<'icons' | 'tags'>('icons');
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1 rounded-xl bg-ink-900 p-1 text-xs shadow-card">
        {(['icons', 'tags'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={cn('focus-ring rounded-lg px-3 py-1.5 capitalize transition-colors', mode === m ? 'bg-ink-800 text-ink-50' : 'text-ink-400 hover:text-ink-200')}>
            {m}
          </button>
        ))}
      </div>
      <IconCloud key={mode} items={mode === 'icons' ? ICONS : TAGS} size={300} />
      <p className="text-xs text-ink-500">Drag to spin · hover an item · arrow keys when focused</p>
    </div>
  );
}
