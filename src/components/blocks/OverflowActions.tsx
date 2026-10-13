import { useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { Bold, Copy, Download, Italic, Link, MoreHorizontal, Pencil, Share2, Tag, Trash2, Underline } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from '@/components/ui/motion/hooks';

export type ToolbarAction = { id: string; label: string; icon: ComponentType<{ className?: string }>; danger?: boolean };

const ACTIONS: ToolbarAction[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'bold', label: 'Bold', icon: Bold },
  { id: 'italic', label: 'Italic', icon: Italic },
  { id: 'underline', label: 'Underline', icon: Underline },
  { id: 'link', label: 'Link', icon: Link },
  { id: 'tag', label: 'Tag', icon: Tag },
  { id: 'copy', label: 'Duplicate', icon: Copy },
  { id: 'share', label: 'Share', icon: Share2 },
  { id: 'download', label: 'Export', icon: Download },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true },
];

const MORE_W = 40;
const GAP = 2;

export type OverflowActionsProps = { actions?: ToolbarAction[]; onAction?: (a: ToolbarAction) => void };

export function OverflowActions({ actions = ACTIONS, onAction }: OverflowActionsProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState<number[]>([]);
  const [fit, setFit] = useState(actions.length);
  const [open, setOpen] = useState(false);
  const { mounted, visible } = usePresence(open, 180);
  useEscape(open, () => setOpen(false));
  useClickOutside([menuRef], open, () => setOpen(false));

  useLayoutEffect(() => {
    const el = wrap.current;
    const m = measure.current;
    if (!el || !m) return;
    const ws = Array.from(m.children).map((c) => (c as HTMLElement).offsetWidth);
    setWidths(ws);
    const compute = () => {
      const avail = el.clientWidth - 12;
      const total = ws.reduce((a, b) => a + b + GAP, 0);
      if (total <= avail) return setFit(ws.length);
      let used = MORE_W;
      let n = 0;
      while (n < ws.length && used + ws[n] + GAP <= avail) used += ws[n++] + GAP;
      setFit(n);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [actions]);

  const overflow = actions.slice(fit);
  const btn = 'focus-ring flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm transition-colors';

  return (
    <div ref={wrap} className="relative w-full">
      <div ref={measure} aria-hidden className="pointer-events-none invisible absolute flex">
        {actions.map((a) => (
          <span key={a.id} className={btn}><a.icon className="h-4 w-4" />{a.label}</span>
        ))}
      </div>
      <div className="flex items-center rounded-xl bg-ink-900 p-1.5 shadow-card" style={{ gap: GAP }}>
        {actions.map((a, i) => {
          const shown = i < fit;
          return (
            <button
              key={a.id}
              tabIndex={shown ? 0 : -1}
              aria-hidden={!shown}
              onClick={() => onAction?.(a)}
              className={cn(btn, 'overflow-hidden duration-300 ease-smooth', a.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-ink-300 hover:bg-white/5 hover:text-ink-50', shown ? 'opacity-100' : 'pointer-events-none !px-0 opacity-0')}
              style={{ width: widths[i] !== undefined ? (shown ? widths[i] : 0) : undefined, marginRight: shown ? 0 : -GAP, transitionProperty: 'width, opacity, padding, margin, background-color, color' }}
            >
              <a.icon className="h-4 w-4 shrink-0" />
              {a.label}
            </button>
          );
        })}
        <div ref={menuRef} className={cn('relative ml-auto transition-all duration-300 ease-spring', overflow.length ? 'w-9 scale-100 opacity-100' : 'pointer-events-none w-0 scale-50 opacity-0')}>
          <button
            aria-label={`${overflow.length} more actions`}
            onClick={() => setOpen((o) => !o)}
            className={cn('focus-ring relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-white/5 hover:text-ink-50', open && 'bg-white/5 text-ink-50')}
          >
            <MoreHorizontal className="h-4 w-4" />
            {overflow.length > 0 && (
              <span key={overflow.length} className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] animate-scale-in items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-medium text-white">{overflow.length}</span>
            )}
          </button>
          {mounted && overflow.length > 0 && (
            <div className={cn('absolute right-0 top-full z-30 mt-2 w-44 origin-top-right rounded-xl bg-ink-850 p-1 shadow-pop transition-all duration-200 ease-smooth', visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0')}>
              {overflow.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => { onAction?.(a); setOpen(false); }}
                  style={{ animationDelay: `${i * 25}ms` }}
                  className={cn('flex w-full animate-fade-up items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors', a.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-ink-200 hover:bg-white/5')}
                >
                  <a.icon className="h-4 w-4" /> {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OverflowActionsDemo() {
  const [width, setWidth] = useState(78);
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="mx-auto flex min-h-[300px] w-full max-w-2xl flex-col items-center gap-8 pt-6">
      <div className="w-full transition-[width] duration-150" style={{ width: `${width}%` }}>
        <OverflowActions onAction={(a) => setLast(a.label)} />
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <div className="flex justify-between text-xs text-ink-400">
          <span>Container width</span>
          <span className="font-mono text-ink-200">{width}%</span>
        </div>
        <input type="range" min={20} max={100} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-brand-500" />
        <p className="h-4 text-center text-xs text-ink-500">{last ? <span key={last} className="animate-fade-in">Ran <span className="text-ink-200">{last}</span></span> : 'Drag the slider to collapse actions'}</p>
      </div>
    </div>
  );
}
