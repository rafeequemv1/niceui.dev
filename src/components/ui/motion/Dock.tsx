import { useRef, useState, type ComponentType, type MouseEvent } from 'react';
import { Calendar, Camera, Compass, Folder, Mail, MessageSquare, Music, Settings, Terminal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type DockItem = { id: string; label: string; icon: ComponentType<{ className?: string }>; tint: string };

export type DockProps = {
  items: DockItem[];
  baseSize?: number;
  maxSize?: number;
  distance?: number;
  defaultOpen?: string[];
};

export function Dock({ items, baseSize = 44, maxSize = 72, distance = 140, defaultOpen = [] }: DockProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [sizes, setSizes] = useState<number[]>(() => items.map(() => baseSize));
  const [hovering, setHovering] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const [bouncing, setBouncing] = useState<string | null>(null);

  const onMove = (e: MouseEvent) => {
    setHovering(true);
    setSizes(
      refs.current.map((el) => {
        if (!el) return baseSize;
        const r = el.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        if (d > distance) return baseSize;
        const k = Math.cos((d / distance) * (Math.PI / 2)); // 1 at center → 0 at edge
        return baseSize + (maxSize - baseSize) * k * k;
      }),
    );
  };
  const onLeave = () => {
    setHovering(false);
    setHover(null);
    setSizes(items.map(() => baseSize));
  };

  const launch = (id: string) => {
    if (open.includes(id)) return setOpen((o) => o.filter((x) => x !== id));
    setBouncing(id);
    window.setTimeout(() => {
      setBouncing(null);
      setOpen((o) => [...o, id]);
    }, 900);
  };

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="mx-auto flex w-max items-end gap-2 rounded-[22px] bg-ink-900/70 px-2.5 pb-2 pt-2 shadow-pop backdrop-blur-xl"
      style={{ height: baseSize + 26 }}
    >
      <style>{'@keyframes dock-bounce{0%,100%{transform:translateY(0)}25%{transform:translateY(-22px)}50%{transform:translateY(0)}70%{transform:translateY(-10px)}}'}</style>
      {items.map((item, i) => {
        const size = sizes[i] ?? baseSize;
        return (
          <div key={item.id} className="relative flex flex-col items-center">
            <span
              className={cn(
                'pointer-events-none absolute -top-10 whitespace-nowrap rounded-lg bg-ink-800 px-2.5 py-1 text-xs font-medium text-ink-50 shadow-pop transition-all duration-200 ease-spring',
                hover === item.id ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-90 opacity-0',
              )}
            >
              {item.label}
            </span>
            <button
              ref={(el) => (refs.current[i] = el)}
              aria-label={item.label}
              onMouseEnter={() => setHover(item.id)}
              onClick={() => launch(item.id)}
              className={cn(
                'focus-ring flex items-center justify-center rounded-[28%] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.4)] active:brightness-75',
                item.tint,
                hovering ? 'transition-[width,height] duration-100 ease-out' : 'transition-[width,height] duration-500 ease-spring',
              )}
              style={{ width: size, height: size, animation: bouncing === item.id ? 'dock-bounce 900ms ease-in-out' : undefined }}
            >
              <item.icon className="h-[46%] w-[46%] text-white drop-shadow" />
            </button>
            <span className={cn('mt-1 h-1 w-1 rounded-full bg-ink-200 transition-all duration-300', open.includes(item.id) ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
          </div>
        );
      })}
    </div>
  );
}

export const DOCK_ITEMS: DockItem[] = [
  { id: 'finder', label: 'Finder', icon: Folder, tint: 'bg-gradient-to-b from-sky-400 to-brand-600' },
  { id: 'safari', label: 'Safari', icon: Compass, tint: 'bg-gradient-to-b from-sky-300 to-sky-600' },
  { id: 'mail', label: 'Mail', icon: Mail, tint: 'bg-gradient-to-b from-brand-400 to-brand-700' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, tint: 'bg-gradient-to-b from-emerald-400 to-emerald-600' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, tint: 'bg-gradient-to-b from-rose-400 to-rose-600' },
  { id: 'music', label: 'Music', icon: Music, tint: 'bg-gradient-to-b from-rose-400 to-amber-500' },
  { id: 'camera', label: 'Photo Booth', icon: Camera, tint: 'bg-gradient-to-b from-amber-300 to-amber-600' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, tint: 'bg-gradient-to-b from-ink-600 to-ink-800' },
  { id: 'settings', label: 'Settings', icon: Settings, tint: 'bg-gradient-to-b from-ink-400 to-ink-600' },
  { id: 'trash', label: 'Trash', icon: Trash2, tint: 'bg-gradient-to-b from-ink-500 to-ink-700' },
];

export function DockDemo() {
  return (
    <div className="flex h-[220px] w-full flex-col items-center justify-between pb-2">
      <p className="text-xs text-ink-500">Hover to magnify · click to launch</p>
      <Dock items={DOCK_ITEMS} defaultOpen={['finder', 'safari', 'messages']} />
    </div>
  );
}
