import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type NavLink = { label: string; href?: string };

const LINKS: NavLink[] = [{ label: 'Product' }, { label: 'Solutions' }, { label: 'Pricing' }, { label: 'Docs' }, { label: 'Changelog' }];

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[15px] font-medium tracking-[-0.02em] text-ink-50">
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeOpacity=".25" />
        <path d="M5 15a7 7 0 0 1 14 0" fill="none" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="15" r="1.8" fill="#7dd3fc" />
      </svg>
      Arcline
    </span>
  );
}

/** Measures the active / hovered link so an indicator can slide to it. */
function useIndicator(count: number, active: number) {
  const listRef = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [box, setBox] = useState({ x: 0, w: 0, ready: false });
  const target = hover ?? active;
  useLayoutEffect(() => {
    const el = listRef.current?.children[target] as HTMLElement | undefined;
    if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
  }, [target, count]);
  useEffect(() => {
    const on = () => {
      const el = listRef.current?.children[target] as HTMLElement | undefined;
      if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
    };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [target]);
  return { listRef, hover, setHover, box };
}

/** Full-screen-ish mobile menu with staggered links. */
function MobileMenu({ open, links, active, onPick }: { open: boolean; links: NavLink[]; active: number; onPick: (i: number) => void }) {
  return (
    <div
      className={cn(
        'absolute inset-x-3 top-[calc(100%+8px)] z-30 origin-top rounded-2xl border border-white/10 bg-ink-950/95 p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl transition-all duration-300 motion-reduce:transition-none md:hidden',
        open ? 'visible scale-100 opacity-100' : 'invisible -translate-y-2 scale-[.98] opacity-0',
      )}
    >
      <ul>
        {links.map((l, i) => (
          <li key={l.label} className={cn('transition-all duration-500 motion-reduce:transition-none', open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')} style={{ transitionDelay: open ? `${60 + i * 45}ms` : '0ms' }}>
            <a
              href={l.href ?? '#'}
              tabIndex={open ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                onPick(i);
              }}
              className={cn('flex items-center justify-between rounded-xl px-4 py-3 text-[15px]', active === i ? 'bg-white/[.06] text-ink-50' : 'text-ink-300 hover:text-ink-50')}
            >
              {l.label}
              <ArrowRight className="h-4 w-4 opacity-40" />
            </a>
          </li>
        ))}
      </ul>
      <a href="#" tabIndex={open ? 0 : -1} className="mt-2 flex h-11 items-center justify-center rounded-xl bg-brand-300 text-[14px] font-medium text-ink-950">
        Get started
      </a>
    </div>
  );
}

function Burger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-ink-200 hover:bg-white/[.06] md:hidden">
      {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
    </button>
  );
}

export type AnimatedNavbarProps = {
  links?: NavLink[];
  /** How the active link is marked: a sliding pill, or a sliding underline. */
  indicator?: 'pill' | 'underline';
  /** Right-hand slot; defaults to a sign-in link and a CTA button. */
  actions?: ReactNode;
  defaultActive?: number;
  className?: string;
};

/**
 * An animated navigation bar: a pill or underline slides to the hovered link
 * and settles back on the active one. Collapses to a staggered menu on mobile.
 */
export function AnimatedNavbar({ links = LINKS, indicator = 'pill', actions, defaultActive = 0, className }: AnimatedNavbarProps) {
  const [active, setActive] = useState(defaultActive);
  const [open, setOpen] = useState(false);
  const { listRef, hover, setHover, box } = useIndicator(links.length, active);

  return (
    <header className={cn('relative', className)}>
      <nav aria-label="Main" className="flex h-14 items-center gap-4 rounded-2xl border border-white/[.08] bg-ink-950/80 px-3 pl-4 backdrop-blur-xl">
        <Logo />
        <ul ref={listRef} className="relative mx-auto hidden items-center md:flex" onMouseLeave={() => setHover(null)}>
          {links.map((l, i) => (
            <li key={l.label}>
              <a
                href={l.href ?? '#'}
                aria-current={active === i ? 'page' : undefined}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(i);
                }}
                className={cn('relative z-10 block rounded-lg px-3.5 py-2 text-[13.5px] outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-brand-300/60', (hover ?? active) === i ? 'text-ink-50' : 'text-ink-400')}
              >
                {l.label}
              </a>
            </li>
          ))}
          {indicator === 'pill' ? (
            <span
              aria-hidden
              className={cn('absolute inset-y-0 left-0 rounded-lg bg-white/[.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(.3,1.2,.5,1)] motion-reduce:transition-none', !box.ready && 'opacity-0')}
              style={{ transform: `translateX(${box.x}px)`, width: box.w }}
            />
          ) : (
            <span
              aria-hidden
              className={cn('absolute -bottom-[9px] left-0 h-[2px] rounded-full bg-brand-300 shadow-[0_0_12px_#7dd3fc] transition-[transform,width] duration-300 ease-[cubic-bezier(.3,1.2,.5,1)] motion-reduce:transition-none', !box.ready && 'opacity-0')}
              style={{ transform: `translateX(${box.x + 12}px)`, width: Math.max(0, box.w - 24) }}
            />
          )}
        </ul>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {actions ?? (
            <>
              <a href="#" className="hidden rounded-lg px-3 py-2 text-[13.5px] text-ink-300 hover:text-ink-50 sm:block">
                Sign in
              </a>
              <a href="#" className="hidden h-9 items-center rounded-lg bg-ink-50 px-3.5 text-[13.5px] font-medium text-ink-950 transition-opacity hover:opacity-90 sm:flex">
                Get started
              </a>
            </>
          )}
          <Burger open={open} onClick={() => setOpen((o) => !o)} />
        </div>
      </nav>
      <MobileMenu
        open={open}
        links={links}
        active={active}
        onPick={(i) => {
          setActive(i);
          setOpen(false);
        }}
      />
    </header>
  );
}

export type MorphingNavbarProps = {
  links?: NavLink[];
  /** The element whose scroll position drives the morph. Defaults to window. */
  scrollRoot?: RefObject<HTMLElement>;
  /** Pixels scrolled before the bar morphs into the compact pill. */
  threshold?: number;
  className?: string;
};

/**
 * A glass navigation bar that spans the page at the top, then morphs into a
 * compact floating pill once you scroll.
 */
export function MorphingNavbar({ links = LINKS, scrollRoot, threshold = 40, className }: MorphingNavbarProps) {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollRoot?.current ?? window;
    const read = () => {
      const y = scrollRoot?.current ? scrollRoot.current.scrollTop : window.scrollY;
      setCompact(y > threshold);
    };
    read();
    el.addEventListener('scroll', read, { passive: true });
    return () => el.removeEventListener('scroll', read);
  }, [scrollRoot, threshold]);

  return (
    <header className={cn('pointer-events-none sticky top-0 z-20 flex justify-center px-3 pt-3', className)}>
      <div className="relative w-full">
        <nav
          aria-label="Main"
          className={cn(
            'pointer-events-auto mx-auto flex h-14 items-center gap-3 border px-3 pl-4 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none',
            compact
              ? 'max-w-[560px] rounded-full border-white/10 bg-ink-900/70 shadow-[0_20px_50px_-20px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl'
              : 'max-w-full rounded-2xl border-transparent bg-transparent',
          )}
        >
          <Logo />
          <ul className="mx-auto hidden items-center gap-0.5 md:flex">
            {links.slice(0, compact ? 4 : links.length).map((l, i) => (
              <li key={l.label}>
                <a
                  href={l.href ?? '#'}
                  aria-current={active === i ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(i);
                  }}
                  className={cn('block rounded-full px-3 py-1.5 text-[13px] transition-colors', active === i ? 'bg-white/[.07] text-ink-50' : 'text-ink-400 hover:text-ink-50')}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className={cn('ml-auto hidden h-9 items-center rounded-full px-4 text-[13px] font-medium transition-all duration-500 sm:flex md:ml-0', compact ? 'bg-brand-300 text-ink-950' : 'bg-ink-50 text-ink-950')}
          >
            {compact ? 'Start' : 'Get started'}
          </a>
          <div className="ml-auto sm:ml-0">
            <Burger open={open} onClick={() => setOpen((o) => !o)} />
          </div>
        </nav>
        <div className="pointer-events-auto">
          <MobileMenu
            open={open}
            links={links}
            active={active}
            onPick={(i) => {
              setActive(i);
              setOpen(false);
            }}
          />
        </div>
      </div>
    </header>
  );
}

/* ——— demos ——— */

function Stage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="w-full">
      <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{label}</p>
      {children}
    </div>
  );
}

export function AnimatedNavbarDemo() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-10 pb-48 md:pb-6">
      <Stage label="Sliding pill">
        <AnimatedNavbar indicator="pill" />
      </Stage>
      <Stage label="Animated underline">
        <AnimatedNavbar indicator="underline" defaultActive={2} />
      </Stage>
    </div>
  );
}

export function MorphingNavbarDemo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative h-[460px] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl border border-white/[.06] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(56,189,248,.12),transparent)]">
      <MorphingNavbar scrollRoot={ref as RefObject<HTMLElement>} />
      <div className="px-6 pb-16 pt-14 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-300">Scroll inside this box</p>
        <h3 className="mx-auto mt-4 max-w-md text-[32px] font-medium leading-tight tracking-[-0.04em] text-ink-50">The bar becomes a pill as you scroll.</h3>
        <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-28 rounded-xl border border-white/[.06] bg-white/[.02]" />
          ))}
        </div>
      </div>
    </div>
  );
}
