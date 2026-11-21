import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PixelText } from './PixelText';
import { useScene } from './scenery';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* Made-up partner marks: a tiny glyph and a wordmark each. */
const MARKS: Array<{ name: string; glyph: ReactNode; className?: string }> = [
  { name: 'halcyon', glyph: <path d="M2 12a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="2" /> },
  { name: 'FERROUS', className: 'tracking-[0.22em] text-[13px] font-semibold', glyph: <path d="M3 4h14v4H8v3h7v4H8v3H3z" fill="currentColor" /> },
  { name: 'orbitly', glyph: <><circle cx="10" cy="10" r="3.5" fill="currentColor" /><ellipse cx="10" cy="10" rx="8.5" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></> },
  { name: 'quillon', className: 'italic', glyph: <path d="M4 17 16 3l1 1L5 18z" fill="currentColor" /> },
  { name: 'BASALT', className: 'tracking-[0.18em] text-[13px] font-semibold', glyph: <path d="M10 2 18 7v6l-8 5-8-5V7z" fill="none" stroke="currentColor" strokeWidth="1.8" /> },
  { name: 'tessera', glyph: <><rect x="2" y="2" width="7" height="7" fill="currentColor" /><rect x="11" y="11" width="7" height="7" fill="currentColor" /><rect x="11" y="2" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" /></> },
  { name: 'lumenco', className: 'font-semibold', glyph: <><circle cx="10" cy="10" r="4" fill="currentColor" /><path d="M10 1v3M10 16v3M1 10h3M16 10h3" stroke="currentColor" strokeWidth="1.8" /></> },
];

const NAV = ['Platform', 'Features', 'Insights', 'Pricing'];

function RidgeMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden>
      <path d="M2 19 10 6l3.5 5.5L16 8l6 11z" fill="#f26b2c" />
      <path d="M7.5 19 10 14.8 12.6 19z" fill="#121212" />
    </svg>
  );
}

export type HeroDuskProps = {
  title?: string;
  subtitle?: string;
  cta?: string;
  /** Optional photo URL; a painted dusk landscape is used when omitted. */
  image?: string;
  className?: string;
};

/**
 * A cinematic dusk hero: grainy landscape, pixel-set headline that decodes in,
 * a boxed segmented nav, and a divided logo strip along the bottom edge.
 */
export function HeroDusk({
  title = 'See the signal in every hard call',
  subtitle = 'Pull metrics, bets and debates into one calm view, so your team can commit to the next move with confidence.',
  cta = 'Book a walkthrough',
  image,
  className,
}: HeroDuskProps) {
  const painted = useScene('dunes', 1440, 900);
  const src = image ?? painted;
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0 });
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = navRef.current?.querySelectorAll<HTMLButtonElement>('button')[active];
    if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
  }, [active]);

  // gentle pointer parallax on the landscape
  useEffect(() => {
    const root = sceneRef.current?.parentElement;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      if (sceneRef.current) sceneRef.current.style.transform = `translate3d(${dx * -14}px, ${dy * -8}px, 0) scale(1.06)`;
    };
    root.addEventListener('pointermove', move);
    return () => root.removeEventListener('pointermove', move);
  }, []);

  return (
    <section data-fill className={cn('relative isolate flex min-h-[720px] flex-col overflow-hidden bg-[#0e0b0a] font-sans text-white', className)}>
      <style>{`@keyframes dusk-in{from{opacity:0;transform:scale(1.14)}to{opacity:1;transform:scale(1.06)}}@keyframes dusk-grain{0%{transform:translate(0,0)}25%{transform:translate(-3%,2%)}50%{transform:translate(2%,-3%)}75%{transform:translate(-2%,-1%)}100%{transform:translate(0,0)}}@keyframes dusk-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.dusk-anim{animation:none!important}}`}</style>

      {/* landscape */}
      <div ref={sceneRef} className="absolute inset-0 -z-20 transition-transform duration-700 ease-out" style={{ transform: 'scale(1.06)' }}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#152f35,#5c5650_52%,#2a1712_70%,#0e0b0a)]" />
        {src && <img src={src} alt="" className="dusk-anim absolute inset-0 h-full w-full object-cover" style={{ animation: 'dusk-in 2.4s cubic-bezier(.2,.7,.2,1) both' }} />}
      </div>
      {/* legibility and grain */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,8,7,.72),rgba(10,8,7,.25)_55%,transparent),linear-gradient(0deg,rgba(10,8,7,.85),transparent_45%)]" />
      <div aria-hidden className="dusk-anim pointer-events-none absolute -inset-[10%] -z-10 opacity-[.16] mix-blend-overlay" style={{ backgroundImage: GRAIN, animation: 'dusk-grain .9s steps(4) infinite' }} />

      {/* nav */}
      <header className="relative z-20 mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 pt-6 md:px-10 md:pt-8">
        <a href="#" className="flex h-11 items-center gap-2.5 border border-white/10 bg-black/55 px-4 backdrop-blur-md" aria-label="Ridge home">
          <RidgeMark />
          <PixelText text="RIDGE" reveal={false} className="text-[17px] text-white/95" />
        </a>
        <nav aria-label="Primary" className="hidden md:block">
          <div ref={navRef} className="relative flex h-11 items-center border border-white/10 bg-black/55 p-1 backdrop-blur-md">
            <span aria-hidden className="absolute inset-y-1 bg-white/[.09] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)] transition-all duration-500 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ left: pill.x, width: pill.w }} />
            {NAV.map((n, i) => (
              <button
                key={n}
                onClick={() => setActive(i)}
                aria-current={active === i ? 'page' : undefined}
                className={cn('relative z-10 h-full px-5 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400', active === i ? 'text-white' : 'text-white/60 hover:text-white')}
              >
                {n}
              </button>
            ))}
          </div>
        </nav>
        <button
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-label={menu ? 'Close menu' : 'Open menu'}
          className="flex h-11 w-11 items-center justify-center border border-white/10 bg-black/55 backdrop-blur-md md:hidden"
        >
          {menu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        {menu && (
          <div className="absolute inset-x-5 top-[72px] border border-white/10 bg-black/80 p-1.5 backdrop-blur-xl md:hidden" style={{ animation: 'dusk-up .25s ease both' }}>
            {NAV.map((n, i) => (
              <button key={n} onClick={() => { setActive(i); setMenu(false); }} className={cn('block w-full px-4 py-3 text-left text-[15px]', active === i ? 'bg-white/[.08] text-white' : 'text-white/65')}>
                {n}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* copy */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-end px-5 pb-14 pt-24 md:px-10 md:pb-20">
        <h1 className="max-w-[16ch] text-[34px] leading-[1.16] text-white sm:text-[48px] lg:max-w-[22ch] lg:text-[66px]">
          <PixelText text={title} delay={0.4} />
        </h1>
        <p className="dusk-anim mt-6 max-w-[34rem] text-[16px] leading-relaxed text-white/70 md:text-[19px]" style={{ animation: 'dusk-up .8s 1.1s ease both' }}>
          {subtitle}
        </p>
        <div className="dusk-anim mt-9 flex flex-wrap items-center gap-5" style={{ animation: 'dusk-up .8s 1.3s ease both' }}>
          <a href="#" className="group inline-flex h-12 items-center gap-2 border border-white/10 bg-white/[.12] px-6 text-[15px] text-white backdrop-blur-md transition-colors hover:bg-white/[.2] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400">
            {cta}
            <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </a>
          <a href="#" className="text-[14px] text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline">
            Watch the 2-minute tour
          </a>
        </div>
      </div>

      {/* logo strip */}
      <div className="relative z-10 grid grid-cols-3 border-t border-white/[.08] bg-black/35 backdrop-blur-sm sm:grid-cols-4 lg:grid-cols-7">
        {MARKS.map((m, i) => (
          <div
            key={m.name}
            className={cn(
              'flex h-[72px] items-center justify-center gap-2 border-white/[.08] text-[15px] text-white/45 transition-colors hover:text-white/85 md:h-[88px] md:text-[17px] [&:not(:last-child)]:border-r',
              i >= 3 && 'hidden sm:flex',
              i >= 4 && 'sm:hidden lg:flex',
            )}
          >
            <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
              {m.glyph}
            </svg>
            <span className={m.className}>{m.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HeroDuskDemo() {
  return <HeroDusk />;
}
