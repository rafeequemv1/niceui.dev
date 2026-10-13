import { useCallback, useRef, useState, type ComponentType } from 'react';
import { Camera, FileText, Image, Mic, Plus, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape } from '@/components/ui/motion/hooks';

export type BloomItem = { id: string; label: string; icon: ComponentType<{ className?: string }>; tint: string };

export type BloomMenuProps = {
  items: BloomItem[];
  radius?: number;
  /** Arc in degrees, centered on `direction`. 360 for a full ring. */
  spread?: number;
  /** Angle in degrees the arc points toward (−90 = up). */
  direction?: number;
  onSelect?: (item: BloomItem) => void;
};

export function BloomMenu({ items, radius = 92, spread = 360, direction = -90, onSelect }: BloomMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEscape(open, close);
  useClickOutside([ref], open, close);

  const full = spread >= 360;
  const step = full ? 360 / items.length : spread / Math.max(1, items.length - 1);
  const start = full ? direction : direction - spread / 2;

  return (
    <div ref={ref} className="relative flex h-14 w-14 items-center justify-center">
      <span
        className={cn('pointer-events-none absolute rounded-full bg-brand-500/10 shadow-[0_0_0_1px_rgba(51,150,255,0.15)] transition-all duration-500 ease-spring', open ? 'opacity-100' : 'opacity-0')}
        style={{ width: open ? radius * 2 + 64 : 56, height: open ? radius * 2 + 64 : 56 }}
      />
      {items.map((it, i) => {
        const a = ((start + step * i) * Math.PI) / 180;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            aria-label={it.label}
            tabIndex={open ? 0 : -1}
            onClick={() => { onSelect?.(it); setOpen(false); }}
            className={cn('focus-ring group absolute flex h-12 w-12 items-center justify-center rounded-full text-white shadow-pop transition-all ease-spring hover:brightness-110', it.tint, open ? 'opacity-100' : 'pointer-events-none opacity-0')}
            style={{
              transform: open ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0,0) scale(0.3)',
              transitionDuration: open ? '550ms' : '250ms',
              transitionDelay: `${(open ? i : items.length - 1 - i) * 40}ms`,
            }}
          >
            <Icon className="h-5 w-5 transition-transform duration-300 ease-spring group-hover:scale-125 group-active:scale-90" />
            <span className={cn('pointer-events-none absolute whitespace-nowrap rounded-md bg-ink-800 px-2 py-1 text-[11px] font-medium text-ink-50 opacity-0 shadow-pop transition-all duration-200 group-hover:opacity-100', y < 0 ? '-top-8' : '-bottom-8')}>
              {it.label}
            </span>
          </button>
        );
      })}
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn('focus-ring relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-pop transition-all duration-500 ease-spring active:scale-90', open ? 'bg-ink-50 text-ink-950' : 'bg-brand-500 text-white hover:scale-105 hover:shadow-glow')}
      >
        <Plus className={cn('h-6 w-6 transition-transform duration-500 ease-spring', open && 'rotate-[135deg]')} />
      </button>
    </div>
  );
}

const ITEMS: BloomItem[] = [
  { id: 'photo', label: 'Photo', icon: Camera, tint: 'bg-rose-500' },
  { id: 'gallery', label: 'Gallery', icon: Image, tint: 'bg-amber-500' },
  { id: 'voice', label: 'Voice note', icon: Mic, tint: 'bg-emerald-500' },
  { id: 'doc', label: 'Document', icon: FileText, tint: 'bg-sky-500' },
  { id: 'event', label: 'Event', icon: Calendar, tint: 'bg-teal-500' },
  { id: 'place', label: 'Location', icon: MapPin, tint: 'bg-brand-600' },
];

export function BloomMenuDemo() {
  const [picked, setPicked] = useState<BloomItem | null>(null);
  return (
    <div className="flex flex-col items-center gap-36 py-28 sm:flex-row sm:py-24 sm:justify-center sm:gap-40">
      <div className="flex flex-col items-center gap-6">
        <BloomMenu items={ITEMS} onSelect={setPicked} />
        <p className="h-4 text-xs text-ink-500">Full ring</p>
      </div>
      <div className="flex flex-col items-center gap-6">
        <BloomMenu items={ITEMS.slice(0, 4)} spread={150} radius={84} onSelect={setPicked} />
        <p className="h-4 text-xs text-ink-500">{picked ? <span key={picked.id} className="animate-fade-in">Attach <span className="text-ink-200">{picked.label}</span></span> : 'Arc · 150°'}</p>
      </div>
    </div>
  );
}
