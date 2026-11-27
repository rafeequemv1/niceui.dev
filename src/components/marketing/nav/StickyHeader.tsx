import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const LINKS = ['Work', 'Studio', 'Journal', 'Contact'];

export type ScrollState = { y: number; hidden: boolean; scrolled: boolean; progress: number };

/**
 * Tracks scroll direction and progress for a scroll container (or the window).
 * `hidden` turns on when scrolling down past `offset` and off as soon as you
 * scroll up; small jitters under `tolerance` px are ignored.
 */
export function useScrollHeader(root?: RefObject<HTMLElement>, { offset = 80, tolerance = 6 } = {}) {
  const [s, setS] = useState<ScrollState>({ y: 0, hidden: false, scrolled: false, progress: 0 });
  const last = useRef(0);
  useEffect(() => {
    const target: HTMLElement | Window = root?.current ?? window;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = root?.current;
      const y = el ? el.scrollTop : window.scrollY;
      const max = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      const dy = y - last.current;
      setS((prev) => {
        let hidden = prev.hidden;
        if (y < offset) hidden = false;
        else if (dy > tolerance) hidden = true;
        else if (dy < -tolerance) hidden = false;
        return { y, hidden, scrolled: y > 8, progress: max > 0 ? Math.min(1, y / max) : 0 };
      });
      if (Math.abs(dy) > tolerance || y < offset) last.current = y;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    target.addEventListener('scroll', on, { passive: true });
    return () => {
      target.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
    };
  }, [root, offset, tolerance]);
  return s;
}

export type StickyHeaderProps = {
  /** Scroll container that drives the header. Defaults to the window. */
  scrollRoot?: RefObject<HTMLElement>;
  /** Show a reading-progress bar along the bottom edge. */
  progress?: boolean;
  /** Keep the header visible instead of hiding it on scroll down. */
  alwaysVisible?: boolean;
  brand?: ReactNode;
  className?: string;
};

/**
 * A sticky website header that hides when you scroll down, slides back as soon
 * as you scroll up, and shrinks onto a blurred background once the page moves.
 */
export function StickyHeader({ scrollRoot, progress = false, alwaysVisible = false, brand, className }: StickyHeaderProps) {
  const { hidden, scrolled, progress: p } = useScrollHeader(scrollRoot);
  const [open, setOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const hide = hidden && !alwaysVisible && !open && !focusWithin;

  return (
    <header
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocusWithin(false)}
      className={cn(
        'sticky top-0 z-20 transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none',
        hide ? '-translate-y-full' : 'translate-y-0',
        scrolled || open ? 'border-b border-white/[.08] bg-ink-950/70 backdrop-blur-xl backdrop-saturate-150' : 'border-b border-transparent bg-transparent',
        className,
      )}
    >
      <div className={cn('mx-auto flex max-w-5xl items-center gap-6 px-5 transition-[height] duration-500 motion-reduce:transition-none', scrolled ? 'h-14' : 'h-20')}>
        {brand ?? (
          <a href="#" className={cn('font-serif tracking-[-0.01em] text-ink-50 transition-all duration-500', scrolled ? 'text-[21px]' : 'text-[26px]')}>
            Northfold<span className="text-brand-300">.</span>
          </a>
        )}
        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => (
            <a key={l} href="#" className="rounded-lg px-3 py-1.5 text-[13.5px] text-ink-300 transition-colors hover:text-ink-50">
              {l}
            </a>
          ))}
          <a href="#" className={cn('ml-2 flex items-center rounded-full bg-ink-50 px-4 text-[13px] font-medium text-ink-950 transition-all duration-500', scrolled ? 'h-8' : 'h-10')}>
            Book a call
          </a>
        </nav>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} className="focus-ring ml-auto grid h-9 w-9 place-items-center rounded-lg text-ink-200 sm:hidden">
          {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
        </button>
      </div>
      <div className={cn('grid transition-[grid-template-rows] duration-300 sm:hidden', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <nav aria-label="Mobile" className="flex flex-col px-3 pb-3">
            {LINKS.map((l) => (
              <a key={l} href="#" tabIndex={open ? 0 : -1} className="rounded-lg px-3 py-3 text-[15px] text-ink-200 hover:bg-white/[.05]">
                {l}
              </a>
            ))}
          </nav>
        </div>
      </div>
      {progress && (
        <div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-gradient-to-r from-brand-400 via-brand-300 to-cyan-200 shadow-[0_0_10px_#38bdf8]" style={{ transform: `scaleX(${p})` }} />
      )}
    </header>
  );
}

/* ——— demo ——— */

function Article() {
  return (
    <article className="mx-auto max-w-2xl px-5 pb-24 pt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-300">Scroll down, then back up</p>
      <h3 className="mt-4 text-[30px] font-medium leading-tight tracking-[-0.035em] text-ink-50">The header steps aside while you read, and returns the moment you reach for it.</h3>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="mt-6 space-y-2" aria-hidden>
          {[100, 94, 97, 60].map((w, k) => (
            <div key={k} className="h-2.5 rounded-full bg-white/[.06]" style={{ width: `${w - (i % 3) * 4}%` }} />
          ))}
          {i === 3 && <div className="!mt-6 h-40 rounded-2xl border border-white/[.06] bg-[radial-gradient(60%_80%_at_30%_30%,rgba(56,189,248,.2),transparent),#0a0b0d]" />}
        </div>
      ))}
    </article>
  );
}

export function StickyHeaderDemo({ progress = false }: { progress?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative h-[460px] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl border border-white/[.06] bg-[#050607] [overflow-anchor:none]">
      <StickyHeader scrollRoot={ref as RefObject<HTMLElement>} progress={progress} />
      <Article />
    </div>
  );
}

export function StickyHeaderProgressDemo() {
  return <StickyHeaderDemo progress />;
}
