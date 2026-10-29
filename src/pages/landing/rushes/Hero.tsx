import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, Menu, Play, Star, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DitherCanvas, halo } from './dither';
import { Editor } from './Editor';
import { Corners, RButton, Serif, Wordmark, scrollToRushes, tc } from './ui';

const nav = [
  { label: 'Editing', id: 'script' },
  { label: 'Features', id: 'features' },
  { label: 'Workflow', id: 'workflow' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
];

export function RushesNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    const onScroll = () => setScrolled((main?.scrollTop ?? 0) > 12 || window.scrollY > 12);
    main?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      main?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToRushes(id);
  };

  return (
    <header className={cn('sticky top-0 z-50 transition-all duration-300', scrolled || open ? 'border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl' : 'border-b border-transparent')}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <button onClick={() => go('top')} aria-label="Rushes home">
          <Wordmark />
        </button>
        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className="rounded-full px-3.5 py-2 text-[14px] text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950">
              {n.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <RButton variant="ghost" className="hidden h-9 px-4 sm:inline-flex" onClick={() => go('cta')}>
            Log in
          </RButton>
          <RButton className="h-9 px-4" onClick={() => go('cta')}>
            Start free
          </RButton>
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open} className="grid h-9 w-9 place-items-center rounded-full text-zinc-900 hover:bg-zinc-100 md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className={cn('grid transition-all duration-300 md:hidden', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="flex flex-col px-3 pb-3">
            {nav.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="rounded-xl px-3 py-3 text-left text-[17px] font-medium tracking-[-0.01em] text-zinc-900 hover:bg-zinc-100">
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

const halftone: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, #0b0b0c 1.05px, transparent 1.3px)',
  backgroundSize: '3px 3px',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

function useRecClock() {
  const [t, setT] = useState(14.9);
  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => setT(14.9 + (performance.now() - t0) / 1000), 1000 / 12);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Hud() {
  const t = useRecClock();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
      <span className="absolute left-5 top-4 flex items-center gap-2 sm:left-7 sm:top-5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4f1f]" />
        <span className="text-zinc-600">Rec</span>
        <span className="tabular-nums">{tc(t)}</span>
      </span>
      <span className="absolute right-5 top-4 hidden sm:right-7 sm:top-5 sm:block">ISO 400 · 1/48 · 24p</span>
      <span className="absolute bottom-4 left-7 hidden md:block">LUT · Rushes Neutral</span>
      <span className="absolute bottom-4 right-7 hidden items-center gap-1.5 md:flex">
        <span className="relative h-2.5 w-5 rounded-[2px] border border-zinc-400 after:absolute after:-right-[3px] after:top-[2px] after:h-1 after:w-[2px] after:rounded-r-sm after:bg-zinc-400">
          <span className="absolute inset-[1.5px] right-[30%] rounded-[1px] bg-zinc-400" />
        </span>
        84%
      </span>
      <span className="absolute left-1/2 top-1/2 hidden h-5 w-5 -translate-x-1/2 -translate-y-1/2 opacity-40 lg:block">
        <span className="absolute left-1/2 top-0 h-full w-px bg-zinc-300" />
        <span className="absolute left-0 top-1/2 h-px w-full bg-zinc-300" />
      </span>
    </div>
  );
}

export function RushesHero() {
  return (
    <section id="rushes-top" className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] [mask-image:linear-gradient(to_bottom,black,transparent)]" style={{ backgroundImage: 'linear-gradient(to right, #f4f4f5 1px, transparent 1px)', backgroundSize: '88px 100%', backgroundPosition: 'center top' }} />
      <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 md:pt-10">
        <div className="relative mx-auto max-w-[1080px] px-3 pb-14 pt-16 text-center sm:px-10 sm:pb-16 sm:pt-20">
          <Corners className="text-zinc-300" size={22} />
          <Hud />
          <button onClick={() => scrollToRushes('features')} className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-[13px] text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 animate-fade-down">
            <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[11px] font-medium text-white">Rushes 3</span>
            Direct your edit in plain English
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
          </button>
          <h1 className="mt-9 text-[46px] font-semibold leading-[0.94] tracking-[-0.055em] text-zinc-950 sm:text-[76px] lg:text-[104px]">
            <span className="block animate-fade-up" style={halftone}>
              Raw footage in.
            </span>
            <span className="block animate-fade-up pb-2" style={{ animationDelay: '140ms' }}>
              <Serif>Finished film</Serif> out.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-[600px] text-[17px] leading-relaxed text-zinc-600 animate-fade-up sm:text-[19px]" style={{ animationDelay: '260ms' }}>
            Rushes is the AI video editor that watches every take for you. It cuts the ums, writes the captions, finds the B-roll and reframes for every screen, on a real timeline you can still grab.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row" style={{ animationDelay: '380ms' }}>
            <RButton className="h-12 w-full px-6 text-[15px] sm:w-auto" onClick={() => scrollToRushes('cta')}>
              Start editing free <ArrowRight className="h-4 w-4" />
            </RButton>
            <RButton variant="light" className="h-12 w-full pl-2 pr-5 text-[15px] sm:w-auto" onClick={() => scrollToRushes('editor')}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-950 text-white">
                <Play className="ml-px h-3 w-3 fill-current" />
              </span>
              Watch it edit, live
            </RButton>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-zinc-500 animate-fade-in" style={{ animationDelay: '520ms' }}>
            <span className="flex items-center gap-2">
              <span className="flex -space-x-1.5">
                {['#18181b', '#ff4f1f', '#71717a', '#d4d4d8'].map((c, i) => (
                  <span key={c} className="h-6 w-6 rounded-full ring-2 ring-white" style={{ background: c, backgroundImage: i % 2 ? 'radial-gradient(rgba(255,255,255,0.5) 0.8px, transparent 1px)' : 'radial-gradient(rgba(255,255,255,0.35) 0.8px, transparent 1px)', backgroundSize: '3px 3px' }} />
                ))}
              </span>
              <span className="flex items-center gap-0.5 text-zinc-950">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              <b className="font-medium text-zinc-900">4.9</b> from 12,000+ creators
            </span>
            <span className="hidden h-3.5 w-px bg-zinc-300 sm:block" />
            <span>Free plan, no watermark</span>
          </div>
        </div>

        <div id="rushes-editor" className="relative mx-auto mt-6 max-w-[1180px] scroll-mt-24 animate-fade-up md:mt-14" style={{ animationDelay: '480ms' }}>
          <DitherCanvas field={halo} pixel={3} ink="#a1a1aa" fps={24} className="absolute -inset-x-[14%] -bottom-20 -top-28 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_72%)]" />
          <div className="absolute -top-9 left-2 z-10 hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] text-zinc-600 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)] ring-1 ring-zinc-200 md:flex animate-float">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff4f1f]" /> It’s live. Click the timeline, run a command, or type your own.
          </div>
          <div className="relative">
            <Editor />
          </div>
        </div>
      </div>
      <LogoCloud />
    </section>
  );
}

const logos: { name: string; className: string }[] = [
  { name: 'NORTHFORM', className: 'text-[14px] font-semibold tracking-[0.32em]' },
  { name: 'Pellucid', className: 'font-serif text-[25px] italic' },
  { name: 'kinetik', className: 'text-[23px] font-bold tracking-[-0.07em]' },
  { name: '▲ APEX MEDIA', className: 'text-[14px] font-semibold tracking-[0.18em]' },
  { name: 'Field & Frame', className: 'font-serif text-[22px]' },
  { name: 'LUMEN.TV', className: 'font-mono text-[16px] font-medium' },
  { name: 'oddly', className: 'text-[22px] font-semibold italic tracking-[-0.04em]' },
  { name: '◐ Sundial', className: 'text-[19px] font-medium tracking-[-0.02em]' },
];

function LogoCloud() {
  return (
    <div className="relative mx-auto mt-20 max-w-7xl px-4 pb-6 sm:px-6 md:mt-24">
      <p className="text-center text-[13px] text-zinc-500">Cutting rooms at 40,000+ studios, newsrooms and channels</p>
      <div className="relative mt-8 overflow-hidden mask-fade-x">
        <div className="flex w-max animate-marquee items-center gap-16 pr-16 [animation-duration:44s]">
          {[...logos, ...logos].map((l, i) => (
            <span key={i} aria-hidden={i >= logos.length} className={cn('whitespace-nowrap text-zinc-400 transition-colors duration-300 hover:text-zinc-950', l.className)}>
              {l.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
