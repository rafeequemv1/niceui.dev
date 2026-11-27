import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Camera, FileText, Image, Mic, Music, Plus, Share2, Video } from 'lucide-react';
import { cn } from '@/lib/cn';

export type RadialItem = { label: string; icon: ComponentType<{ className?: string }>; onSelect?: () => void };

export type RadialMenuProps = {
  items: RadialItem[];
  /** 'full' fans items all the way round; 'corner' fans a quarter circle up and to the left. */
  variant?: 'full' | 'corner';
  radius?: number;
  className?: string;
  label?: string;
};

/** A radial circle menu: items fan out around a floating button with a spring. */
export function RadialMenu({ items, variant = 'full', radius = 96, className, label = 'Quick actions' }: RadialMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const btns = useRef<Array<HTMLButtonElement | null>>([]);
  const fab = useRef<HTMLButtonElement>(null);

  const n = items.length;
  const angle = (i: number) => {
    if (variant === 'corner') {
      const a0 = 180, a1 = 270; // left → up
      return ((a0 + ((a1 - a0) * i) / Math.max(1, n - 1)) * Math.PI) / 180;
    }
    return ((-90 + (360 * i) / n) * Math.PI) / 180;
  };

  useEffect(() => {
    if (!open) return;
    btns.current[active]?.focus();
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', down);
    return () => window.removeEventListener('pointerdown', down);
  }, [open]);

  const close = () => {
    setOpen(false);
    fab.current?.focus();
  };

  return (
    <div
      ref={root}
      className={cn('relative inline-grid place-items-center', className)}
      onKeyDown={(e) => {
        if (!open) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setActive((a) => (a + 1) % n);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setActive((a) => (a - 1 + n) % n);
        } else if (e.key === 'Home') setActive(0);
        else if (e.key === 'End') setActive(n - 1);
      }}
    >
      <div role="menu" aria-label={label} aria-hidden={!open} className="absolute inset-0">
        {items.map((it, i) => {
          const a = angle(i);
          const x = Math.cos(a) * radius;
          const y = Math.sin(a) * radius;
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              ref={(el) => (btns.current[i] = el)}
              role="menuitem"
              tabIndex={open && i === active ? 0 : -1}
              onClick={() => {
                it.onSelect?.();
                setPicked(it.label);
                close();
              }}
              onFocus={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'focus-ring group absolute left-1/2 top-1/2 -ml-6 -mt-6 grid h-12 w-12 place-items-center rounded-full bg-ink-850 text-ink-200 shadow-card transition-all duration-500 ease-spring motion-reduce:duration-0 hover:bg-brand-500 hover:text-ink-950 focus-visible:bg-brand-500 focus-visible:text-ink-950',
                !open && 'pointer-events-none',
              )}
              style={{
                transform: open ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0,0) scale(0.3)',
                opacity: open ? 1 : 0,
                transitionDelay: `${open ? i * 35 : (n - i) * 20}ms`,
              }}
            >
              <Icon className="h-5 w-5" />
              <span
                className={cn(
                  'pointer-events-none absolute whitespace-nowrap rounded-md bg-ink-950/90 px-2 py-1 text-[11px] text-ink-100 opacity-0 transition-opacity',
                  'group-hover:opacity-100 group-focus-visible:opacity-100',
                  y < -10 ? 'bottom-full mb-2' : 'top-full mt-2',
                )}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
      <button
        ref={fab}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : label}
        onClick={() => {
          setActive(0);
          setOpen((o) => !o);
        }}
        className="focus-ring relative z-10 grid h-14 w-14 place-items-center rounded-full bg-brand-400 text-ink-950 shadow-glow transition-transform duration-300 ease-spring active:scale-90"
      >
        <Plus className={cn('h-6 w-6 transition-transform duration-500 ease-spring', open && 'rotate-[135deg]')} />
      </button>
      <span className="sr-only" aria-live="polite">
        {picked ? `${picked} selected` : ''}
      </span>
    </div>
  );
}

const CREATE: RadialItem[] = [
  { label: 'Photo', icon: Camera },
  { label: 'Video', icon: Video },
  { label: 'Voice note', icon: Mic },
  { label: 'Document', icon: FileText },
  { label: 'Gallery', icon: Image },
  { label: 'Music', icon: Music },
];
const SHARE: RadialItem[] = [
  { label: 'Share', icon: Share2 },
  { label: 'Photo', icon: Camera },
  { label: 'Note', icon: FileText },
  { label: 'Voice', icon: Mic },
];

export function RadialMenuDemo() {
  const [last, setLast] = useState('Nothing yet');
  const wrap = (list: RadialItem[]) => list.map((it) => ({ ...it, onSelect: () => setLast(it.label) }));
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <div className="relative grid h-72 place-items-center rounded-2xl bg-ink-900/60 shadow-hairline">
          <RadialMenu items={wrap(CREATE)} label="Create" />
          <span className="absolute left-4 top-3 text-xs text-ink-400">Full circle</span>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl bg-ink-900/60 shadow-hairline">
          <span className="absolute left-4 top-3 text-xs text-ink-400">Corner</span>
          <div className="absolute bottom-5 right-5">
            <RadialMenu items={wrap(SHARE)} variant="corner" radius={108} label="Share" />
          </div>
        </div>
      </div>
      <p className="text-xs text-ink-400">
        Last action: <span className="text-ink-100">{last}</span> · Open a menu, then use the arrow keys and Esc.
      </p>
    </div>
  );
}
