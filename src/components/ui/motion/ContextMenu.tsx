import { useCallback, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from 'react';
import { ChevronRight, Copy, Edit3, FolderOpen, MousePointerClick, Share2, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Portal, useClickOutside, useEscape, usePresence } from './hooks';

export type MenuItem =
  | { type?: 'item'; label: string; icon?: ComponentType<{ className?: string }>; shortcut?: string; danger?: boolean; submenu?: string[]; onSelect?: () => void }
  | { type: 'separator' };

export type ContextMenuProps = {
  items: MenuItem[];
  children: ReactNode;
  className?: string;
};

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<number | null>(null);
  const { mounted, visible } = usePresence(open, 160);
  const menu = useRef<HTMLDivElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    setSub(null);
  }, []);
  useEscape(open, close);
  useClickOutside([menu], open, close);

  const onContext = (e: MouseEvent) => {
    e.preventDefault();
    const w = 224;
    const h = items.length * 34 + 16;
    setPos({ x: Math.min(e.clientX, window.innerWidth - w - 8), y: Math.min(e.clientY, window.innerHeight - h - 8) });
    setSub(null);
    setOpen(false);
    requestAnimationFrame(() => setOpen(true));
  };

  return (
    <>
      <div onContextMenu={onContext} className={className}>
        {children}
      </div>
      {mounted && pos && (
        <Portal>
        <div
          ref={menu}
          role="menu"
          style={{ left: pos.x, top: pos.y }}
          className={cn(
            'fixed z-[100] w-56 origin-top-left rounded-xl bg-ink-900/95 p-1.5 shadow-pop backdrop-blur-xl',
            visible ? 'scale-100 opacity-100 transition-all duration-200 ease-spring' : 'scale-95 opacity-0 transition-all duration-150',
          )}
        >
          {items.map((item, i) =>
            item.type === 'separator' ? (
              <div key={i} className="my-1 h-px bg-white/5" />
            ) : (
              <div key={i} className="relative" onPointerEnter={() => setSub(item.submenu ? i : null)}>
                <button
                  role="menuitem"
                  onClick={() => {
                    if (item.submenu) return setSub(i);
                    item.onSelect?.();
                    close();
                  }}
                  style={{ animationDelay: `${i * 22}ms` }}
                  className={cn(
                    'group flex w-full animate-fade-up items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] outline-none transition-colors',
                    item.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-ink-200 hover:bg-white/[0.06] hover:text-ink-50',
                    sub === i && 'bg-white/[0.06] text-ink-50',
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && <span className="font-mono text-[11px] text-ink-500">{item.shortcut}</span>}
                  {item.submenu && <ChevronRight className="h-3.5 w-3.5 text-ink-500" />}
                </button>
                {item.submenu && sub === i && (
                  <div className="absolute left-full top-0 ml-1.5 w-44 origin-left animate-scale-in rounded-xl bg-ink-900/95 p-1.5 shadow-pop backdrop-blur-xl">
                    {item.submenu.map((s, j) => (
                      <button
                        key={s}
                        onClick={close}
                        style={{ animationDelay: `${j * 30}ms` }}
                        className="flex w-full animate-fade-up items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-ink-200 transition-colors hover:bg-white/[0.06] hover:text-ink-50"
                      >
                        <span className={cn('h-2 w-2 rounded-full', ['bg-brand-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'][j % 4])} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
        </Portal>
      )}
    </>
  );
}

export function ContextMenuDemo() {
  const [last, setLast] = useState<string | null>(null);
  const items: MenuItem[] = [
    { label: 'Open', icon: FolderOpen, shortcut: '↵', onSelect: () => setLast('Opened Q3 Roadmap.fig') },
    { label: 'Rename', icon: Edit3, shortcut: 'F2', onSelect: () => setLast('Renaming…') },
    { label: 'Duplicate', icon: Copy, shortcut: '⌘D', onSelect: () => setLast('Duplicated file') },
    { label: 'Add to favorites', icon: Star, onSelect: () => setLast('Added to favorites') },
    { label: 'Move to', icon: Share2, submenu: ['Design', 'Engineering', 'Marketing', 'Archive'] },
    { type: 'separator' },
    { label: 'Delete', icon: Trash2, shortcut: '⌘⌫', danger: true, onSelect: () => setLast('Moved to trash') },
  ];
  return (
    <div className="mx-auto w-full max-w-md">
      <ContextMenu items={items}>
        <div className="flex h-56 select-none flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-ink-900/60 text-center transition-colors hover:border-brand-500/40 hover:bg-ink-900">
          <span className="flex h-11 w-11 animate-float items-center justify-center rounded-xl bg-ink-850 text-ink-300 shadow-hairline">
            <MousePointerClick className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink-100">Right-click anywhere here</p>
            <p className="mt-1 text-xs text-ink-400">Q3 Roadmap.fig · Edited 2h ago</p>
          </div>
          <p key={last} className={cn('h-4 text-xs text-brand-300', last && 'animate-fade-up')}>{last}</p>
        </div>
      </ContextMenu>
    </div>
  );
}
