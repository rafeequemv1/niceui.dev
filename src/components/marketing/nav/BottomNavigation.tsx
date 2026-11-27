import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Bell, Compass, Heart, Home, MessageCircle, Plus, Search, User, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type BottomNavItem = { label: string; icon: LucideIcon; badge?: number };

const ITEMS: BottomNavItem[] = [
  { label: 'Home', icon: Home },
  { label: 'Explore', icon: Compass },
  { label: 'Inbox', icon: MessageCircle, badge: 3 },
  { label: 'Alerts', icon: Bell, badge: 12 },
  { label: 'Profile', icon: User },
];

function Badge({ n }: { n: number }) {
  return (
    <span key={n} className="absolute -right-2 -top-1.5 min-w-[17px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-semibold leading-[17px] text-white ring-2 ring-ink-950 motion-safe:animate-[bn-pop_.35s_cubic-bezier(.3,1.6,.5,1)]">
      {n > 9 ? '9+' : n}
    </span>
  );
}

/** Arrow keys move focus between tabs, like a real tablist. */
function onArrows(e: KeyboardEvent<HTMLDivElement>) {
  const tabs = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0) return;
  const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1;
  if (next >= 0) {
    e.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  }
}

export type BottomNavigationProps = {
  items?: BottomNavItem[];
  /** 'blob': a glowing pill slides under the active tab. 'notch': the bar dips around a raised active icon. */
  variant?: 'blob' | 'notch';
  defaultActive?: number;
  onChange?: (index: number) => void;
  className?: string;
};

/**
 * A floating bottom navigation bar for mobile apps: icons with labels, badge
 * counts and an animated active indicator that glides between tabs.
 */
export function BottomNavigation({ items = ITEMS, variant = 'blob', defaultActive = 0, onChange, className }: BottomNavigationProps) {
  const [active, setActive] = useState(defaultActive);
  const rowRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number | null>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const el = rowRef.current?.children[active] as HTMLElement | undefined;
    if (el) {
      setX(el.offsetLeft + el.offsetWidth / 2);
      setW(el.offsetWidth);
    }
  }, [active, items.length]);

  const pick = (i: number) => {
    setActive(i);
    onChange?.(i);
  };

  return (
    <nav aria-label="Primary" className={cn('relative w-full max-w-[380px]', className)}>
      <style>{`@keyframes bn-pop{from{transform:scale(.4)}to{transform:scale(1)}}`}</style>
      {variant === 'notch' && x !== null && (
        // the raised disc that sits in the notch
        <span
          aria-hidden
          className="absolute -top-5 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-brand-300 text-ink-950 shadow-[0_10px_30px_-6px_rgba(56,189,248,.8)] transition-[left] duration-500 ease-[cubic-bezier(.3,1.3,.5,1)] motion-reduce:transition-none"
          style={{ left: x }}
        >
          {(() => {
            const Icon = items[active].icon;
            return <Icon className="h-5 w-5" strokeWidth={2} />;
          })()}
        </span>
      )}
      <div
        className="relative overflow-hidden rounded-[26px] border border-white/[.08] bg-ink-900/85 shadow-[0_24px_50px_-20px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl"
        style={
          variant === 'notch' && x !== null
            ? {
                WebkitMaskImage: `radial-gradient(circle 30px at ${x}px 0px, transparent 29px, #000 30px)`,
                maskImage: `radial-gradient(circle 30px at ${x}px 0px, transparent 29px, #000 30px)`,
                transition: 'none',
              }
            : undefined
        }
      >
        {variant === 'blob' && x !== null && (
          <span
            aria-hidden
            className="absolute top-2 h-[calc(100%-16px)] -translate-x-1/2 rounded-[18px] bg-brand-300/[.13] shadow-[inset_0_0_0_1px_rgba(125,211,252,.25),0_0_24px_rgba(56,189,248,.18)] transition-[left] duration-500 ease-[cubic-bezier(.3,1.3,.5,1)] motion-reduce:transition-none"
            style={{ left: x, width: Math.max(0, w - 10) }}
          />
        )}
        <div ref={rowRef} role="tablist" aria-label="Sections" onKeyDown={onArrows} className="relative grid h-[68px]" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((it, i) => {
            const on = active === i;
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(i)}
                className="group relative flex flex-col items-center justify-center gap-1 outline-none focus-visible:after:absolute focus-visible:after:inset-1.5 focus-visible:after:rounded-2xl focus-visible:after:ring-1 focus-visible:after:ring-brand-300/60"
              >
                <span className={cn('relative transition-all duration-300 motion-reduce:transition-none', variant === 'notch' && on && 'translate-y-1 opacity-0', on ? 'text-brand-200' : 'text-ink-400 group-hover:text-ink-200')}>
                  <Icon className={cn('h-[22px] w-[22px] transition-transform duration-300', on && variant === 'blob' && 'scale-110')} strokeWidth={on ? 2.1 : 1.7} />
                  {it.badge ? <Badge n={it.badge} /> : null}
                </span>
                <span className={cn('text-[10.5px] font-medium tracking-wide transition-colors', on ? 'text-ink-50' : 'text-ink-500', variant === 'notch' && on && 'translate-y-2')}>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export type BottomNavigationFabProps = { onAction?: () => void; className?: string };

/** A bottom navigation bar with a raised floating action button in the middle. */
export function BottomNavigationFab({ onAction, className }: BottomNavigationFabProps) {
  const left: BottomNavItem[] = [
    { label: 'Home', icon: Home },
    { label: 'Search', icon: Search },
  ];
  const right: BottomNavItem[] = [
    { label: 'Saved', icon: Heart, badge: 2 },
    { label: 'Me', icon: User },
  ];
  const [active, setActive] = useState('Home');
  const [spin, setSpin] = useState(false);
  const tab = (it: BottomNavItem) => {
    const on = active === it.label;
    const Icon = it.icon;
    return (
      <button key={it.label} role="tab" aria-selected={on} onClick={() => setActive(it.label)} className="relative flex flex-col items-center justify-center gap-1 outline-none focus-visible:text-ink-50">
        <span className={cn('relative transition-colors', on ? 'text-brand-200' : 'text-ink-400 hover:text-ink-200')}>
          <Icon className="h-[21px] w-[21px]" strokeWidth={on ? 2.1 : 1.7} />
          {it.badge ? <Badge n={it.badge} /> : null}
        </span>
        <span className={cn('text-[10.5px] font-medium', on ? 'text-ink-50' : 'text-ink-500')}>{it.label}</span>
        <span aria-hidden className={cn('absolute bottom-1.5 h-1 w-1 rounded-full bg-brand-300 transition-all duration-300', on ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
      </button>
    );
  };
  return (
    <nav aria-label="Primary" className={cn('relative w-full max-w-[380px] pt-6', className)}>
      <div
        className="rounded-[26px] border border-white/[.08] bg-ink-900/85 shadow-[0_24px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl"
        style={{ WebkitMaskImage: 'radial-gradient(circle 38px at 50% 0, transparent 37px, #000 38px)', maskImage: 'radial-gradient(circle 38px at 50% 0, transparent 37px, #000 38px)' }}
      >
        <div role="tablist" aria-label="Sections" className="grid h-[68px] grid-cols-5">
          {left.map(tab)}
          <span aria-hidden />
          {right.map(tab)}
        </div>
      </div>
      <button
        onClick={() => {
          setSpin(true);
          onAction?.();
          window.setTimeout(() => setSpin(false), 450);
        }}
        aria-label="Create"
        className="focus-ring absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-brand-300 text-ink-950 shadow-[0_12px_30px_-6px_rgba(56,189,248,.85),inset_0_1px_0_rgba(255,255,255,.6)] transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <Plus className={cn('h-6 w-6 transition-transform duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none', spin && 'rotate-90')} strokeWidth={2.4} />
      </button>
    </nav>
  );
}

/* ——— demo ——— */

function Phone({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-[360px] w-[300px] flex-col justify-end overflow-hidden rounded-[34px] border border-white/[.08] bg-[radial-gradient(90%_60%_at_50%_0%,rgba(56,189,248,.12),transparent),#050607] p-3">
        <div className="absolute inset-x-5 top-6 space-y-2.5" aria-hidden>
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-20 rounded-2xl bg-white/[.04]" />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="h-16 rounded-xl bg-white/[.03]" />
            <div className="h-16 rounded-xl bg-white/[.03]" />
          </div>
        </div>
        <div className="relative flex justify-center">{children}</div>
      </div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{label}</p>
    </div>
  );
}

export function BottomNavigationDemo() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <Phone label="Sliding blob">
        <BottomNavigation variant="blob" />
      </Phone>
      <Phone label="Notch">
        <BottomNavigation variant="notch" defaultActive={2} />
      </Phone>
      <Phone label="Floating action button">
        <BottomNavigationFab />
      </Phone>
    </div>
  );
}
