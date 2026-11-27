import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  Archive,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Link2,
  Mail,
  MessageSquare,
  Pencil,
  Share2,
  Star,
  Trash2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export type MenuEntry =
  | { type?: 'item'; label: string; icon?: LucideIcon; shortcut?: string; danger?: boolean; disabled?: boolean; onSelect?: () => void }
  | { type: 'checkbox'; label: string; checked: boolean; onChange: (checked: boolean) => void; shortcut?: string }
  | { type: 'radio'; label: string; checked: boolean; onSelect: () => void }
  | { type: 'separator' }
  | { type: 'label'; label: string }
  | { type: 'sub'; label: string; icon?: LucideIcon; items: MenuEntry[] };

const focusable = (e: MenuEntry) => e.type !== 'separator' && e.type !== 'label' && !(('disabled' in e && e.disabled) ?? false);

function MenuList({
  items,
  onClose,
  onBack,
  focusFirst,
  className,
  label,
}: {
  items: MenuEntry[];
  onClose: (refocus: boolean) => void;
  onBack?: () => void;
  focusFirst: boolean;
  className?: string;
  label: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [sub, setSub] = useState<number | null>(null);
  const [subFocus, setSubFocus] = useState(false);
  const [subSide, setSubSide] = useState<'right' | 'left' | 'below'>('right');
  const type = useRef({ buf: '', t: 0 });
  const hover = useRef(0);

  const ids = items.map((e, i) => (focusable(e) ? i : -1)).filter((i) => i >= 0);
  useEffect(() => {
    if (focusFirst) refs.current[ids[0]]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusFirst]);

  const openSub = (i: number, focus: boolean) => {
    const r = refs.current[i]?.getBoundingClientRect();
    if (r) setSubSide(r.right + 220 <= window.innerWidth ? 'right' : r.left - 220 >= 0 ? 'left' : 'below');
    setSub(i);
    setSubFocus(focus);
  };

  const move = (cur: number, d: number) => {
    const at = ids.indexOf(cur);
    const next = ids[(at + d + ids.length) % ids.length];
    refs.current[next]?.focus();
  };

  const activate = (e: MenuEntry, i: number) => {
    if (e.type === 'sub') return openSub(i, true);
    if (e.type === 'checkbox') return e.onChange(!e.checked);
    if (e.type === 'radio') return e.onSelect();
    if (e.type === undefined || e.type === 'item') {
      e.onSelect?.();
      onClose(true);
    }
  };

  const onKey = (ev: KeyboardEvent, i: number) => {
    const e = items[i];
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        move(i, 1);
        break;
      case 'ArrowUp':
        ev.preventDefault();
        move(i, -1);
        break;
      case 'Home':
        ev.preventDefault();
        refs.current[ids[0]]?.focus();
        break;
      case 'End':
        ev.preventDefault();
        refs.current[ids[ids.length - 1]]?.focus();
        break;
      case 'ArrowRight':
        if (e.type === 'sub') {
          ev.preventDefault();
          openSub(i, true);
        }
        break;
      case 'ArrowLeft':
        if (onBack) {
          ev.preventDefault();
          ev.stopPropagation();
          onBack();
        }
        break;
      case 'Escape':
        ev.preventDefault();
        ev.stopPropagation();
        if (onBack) onBack();
        else onClose(true);
        break;
      case 'Tab':
        onClose(false);
        break;
      case 'Enter':
      case ' ':
        ev.preventDefault();
        activate(e, i);
        break;
      default:
        if (ev.key.length === 1 && /\S/.test(ev.key)) {
          // typeahead: jump to the next item starting with the typed letters
          const t = type.current;
          window.clearTimeout(t.t);
          t.buf += ev.key.toLowerCase();
          t.t = window.setTimeout(() => (t.buf = ''), 500);
          const order = [...ids.slice(ids.indexOf(i) + 1), ...ids.slice(0, ids.indexOf(i) + 1)];
          const hit = order.find((k) => (items[k] as { label: string }).label.toLowerCase().startsWith(t.buf));
          if (hit !== undefined) refs.current[hit]?.focus();
        }
    }
  };

  return (
    <div role="menu" aria-label={label} className={cn('dd-pop w-56 rounded-xl border border-white/10 bg-ink-900/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl', className)}>
      {items.map((e, i) => {
        if (e.type === 'separator') return <div key={i} role="separator" className="my-1.5 h-px bg-white/[.07]" />;
        if (e.type === 'label') return <p key={i} className="px-2.5 pb-1 pt-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-500">{e.label}</p>;
        const Icon = 'icon' in e ? e.icon : undefined;
        const role = e.type === 'checkbox' ? 'menuitemcheckbox' : e.type === 'radio' ? 'menuitemradio' : 'menuitem';
        const checked = e.type === 'checkbox' || e.type === 'radio' ? e.checked : undefined;
        const danger = (e.type === undefined || e.type === 'item') && e.danger;
        const disabled = (e.type === undefined || e.type === 'item') && e.disabled;
        return (
          <div key={i} className="relative">
            <button
              ref={(el) => (refs.current[i] = el)}
              role={role}
              aria-checked={checked}
              aria-haspopup={e.type === 'sub' ? 'menu' : undefined}
              aria-expanded={e.type === 'sub' ? sub === i : undefined}
              aria-disabled={disabled || undefined}
              tabIndex={-1}
              onClick={() => !disabled && activate(e, i)}
              onKeyDown={(ev) => onKey(ev, i)}
              onPointerEnter={(ev) => {
                if (ev.pointerType !== 'mouse') return;
                refs.current[i]?.focus();
                window.clearTimeout(hover.current);
                if (e.type === 'sub') hover.current = window.setTimeout(() => openSub(i, false), 120);
                else if (sub !== null) hover.current = window.setTimeout(() => setSub(null), 200);
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] outline-none transition-colors',
                disabled ? 'cursor-not-allowed text-ink-600' : danger ? 'text-rose-300 focus:bg-rose-500/15 focus:text-rose-200' : 'text-ink-200 focus:bg-white/[.07] focus:text-ink-50',
                sub === i && 'bg-white/[.07] text-ink-50',
              )}
            >
              <span className="grid w-4 shrink-0 place-items-center">
                {e.type === 'checkbox' ? (
                  <Check className={cn('h-3.5 w-3.5 text-brand-300 transition-all', e.checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
                ) : e.type === 'radio' ? (
                  <span className={cn('h-1.5 w-1.5 rounded-full bg-brand-300 transition-all', e.checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
                ) : Icon ? (
                  <Icon className="h-[15px] w-[15px] opacity-70" strokeWidth={1.8} />
                ) : null}
              </span>
              <span className="flex-1 truncate">{e.label}</span>
              {'shortcut' in e && e.shortcut && <kbd className="font-sans text-[11px] tracking-wide text-ink-500">{e.shortcut}</kbd>}
              {e.type === 'sub' && <ChevronRight className="h-3.5 w-3.5 text-ink-500" />}
            </button>
            {e.type === 'sub' && sub === i && (
              <MenuList
                items={e.items}
                label={e.label}
                focusFirst={subFocus}
                onClose={onClose}
                onBack={() => {
                  setSub(null);
                  refs.current[i]?.focus();
                }}
                className={cn('absolute z-10', subSide === 'right' ? 'left-[calc(100%+6px)] top-[-6px]' : subSide === 'left' ? 'right-[calc(100%+6px)] top-[-6px]' : 'left-4 top-[calc(100%+4px)]')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export type DropdownMenuProps = {
  /** Content of the trigger button. */
  trigger: ReactNode;
  items: MenuEntry[];
  align?: 'start' | 'end';
  label?: string;
  className?: string;
};

/**
 * An animated React dropdown menu: icons, shortcuts, separators, checkbox and radio
 * items and nested submenus, with full keyboard support (arrows, Home/End,
 * typeahead, Enter/Space, Esc) and outside-click close.
 */
export function DropdownMenu({ trigger, items, align = 'start', label = 'Menu', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [viaKey, setViaKey] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const [flip, setFlip] = useState(false);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', down);
    return () => window.removeEventListener('pointerdown', down);
  }, [open]);

  // open upward when there is no room below
  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    setFlip(window.innerHeight - r.bottom < 320 && r.top > 320);
  }, [open]);

  return (
    <div ref={root} className={cn('relative inline-block', className)}>
      <style>{`@keyframes dd-in{from{opacity:0;transform:translateY(-4px) scale(.97)}to{opacity:1;transform:none}}.dd-pop{animation:dd-in .16s cubic-bezier(.2,.8,.2,1) both}@media (prefers-reduced-motion:reduce){.dd-pop{animation:none}}`}</style>
      <button
        ref={btn}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setViaKey(false);
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || ((e.key === 'Enter' || e.key === ' ') && !open)) {
            e.preventDefault();
            setViaKey(true);
            setOpen(true);
          }
        }}
        className={cn('focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-ink-900 px-3.5 text-[13.5px] font-medium text-ink-100 shadow-hairline transition-colors hover:bg-ink-800', open && 'bg-ink-800')}
      >
        {trigger}
        <ChevronDown className={cn('h-4 w-4 text-ink-400 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      {open && (
        <MenuList
          items={items}
          label={label}
          focusFirst={viaKey}
          onClose={close}
          className={cn('absolute z-50', align === 'end' ? 'right-0' : 'left-0', flip ? 'bottom-[calc(100%+6px)] origin-bottom' : 'top-[calc(100%+6px)] origin-top')}
        />
      )}
    </div>
  );
}

export function DropdownMenuDemo() {
  const [log, setLog] = useState('Pick something from the menu');
  const [starred, setStarred] = useState(true);
  const [notify, setNotify] = useState(false);
  const [view, setView] = useState('Comfortable');
  const say = (s: string) => () => setLog(s);
  const items: MenuEntry[] = [
    { type: 'label', label: 'Project' },
    { label: 'Rename', icon: Pencil, shortcut: '⌘R', onSelect: say('Renamed “Q3 launch”') },
    { label: 'Duplicate', icon: Copy, shortcut: '⌘D', onSelect: say('Duplicated the project') },
    {
      type: 'sub',
      label: 'Share',
      icon: Share2,
      items: [
        { label: 'Copy link', icon: Link2, onSelect: say('Link copied') },
        { label: 'Email', icon: Mail, onSelect: say('Opened an email draft') },
        { label: 'Message', icon: MessageSquare, onSelect: say('Sent to #launch') },
        { type: 'separator' },
        { label: 'Invite people…', icon: Users, onSelect: say('Invite dialog opened') },
      ],
    },
    { type: 'separator' },
    { type: 'checkbox', label: 'Starred', checked: starred, onChange: (v) => (setStarred(v), setLog(v ? 'Starred' : 'Unstarred')) },
    { type: 'checkbox', label: 'Notify me', checked: notify, onChange: (v) => (setNotify(v), setLog(v ? 'Notifications on' : 'Notifications off')) },
    { type: 'separator' },
    { type: 'label', label: 'Density' },
    ...['Compact', 'Comfortable', 'Spacious'].map((d) => ({ type: 'radio' as const, label: d, checked: view === d, onSelect: () => (setView(d), setLog(`Density: ${d}`)) })),
    { type: 'separator' },
    { label: 'Archive', icon: Archive, onSelect: say('Archived'), disabled: true },
    { label: 'Delete', icon: Trash2, shortcut: '⌫', danger: true, onSelect: say('Deleted (not really)') },
  ];
  return (
    <div className="flex min-h-[420px] w-full max-w-xl flex-col items-center pt-4">
      <div className="flex w-full items-center justify-between rounded-2xl border border-white/[.07] bg-ink-900/50 p-3 pl-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-400/15 text-brand-300">
            <Star className={cn('h-4 w-4', starred && 'fill-current')} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-ink-50">Q3 launch</p>
            <p className="truncate text-[12px] text-ink-500">{view} · {notify ? 'notifications on' : 'quiet'}</p>
          </div>
        </div>
        <DropdownMenu trigger="Options" items={items} align="end" label="Project options" />
      </div>
      <p key={log} className="mt-6 animate-fade-up text-[13px] text-ink-400" aria-live="polite">
        {log}
      </p>
    </div>
  );
}
