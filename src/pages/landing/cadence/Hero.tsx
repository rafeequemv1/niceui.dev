import { useEffect, useRef, useState } from 'react';
import { ArrowRight, AudioWaveform, Menu, Play, Star, X as Close } from 'lucide-react';
import { cn } from '@/lib/cn';
import { HeroMock, OrbitingLogos } from './HeroMock';
import { Avatar, Eyebrow, GhostButton, PEOPLE, PrimaryButton, scrollToId } from './shared';

const LINKS = [
  { id: 'composer', label: 'Composer' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

export function CadenceLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5A36] text-white shadow-[0_6px_16px_-6px_rgba(255,90,54,0.8)]">
        <AudioWaveform className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-semibold tracking-[-0.03em] text-stone-900">cadence</span>
    </span>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <div ref={sentinel} className="absolute top-0 h-px w-px" aria-hidden="true" />
      <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
        <nav
          className={cn(
            'mx-auto flex max-w-6xl items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 ease-smooth sm:px-4',
            scrolled
              ? 'border-stone-200/80 bg-[#FBFAF7]/80 shadow-[0_8px_32px_-12px_rgba(28,25,23,0.18)] backdrop-blur-xl'
              : 'border-transparent bg-transparent',
          )}
        >
          <button type="button" onClick={() => go('top')} className="rounded-full pl-1" aria-label="Cadence home">
            <CadenceLogo />
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className="rounded-full px-3.5 py-2 text-sm text-stone-600 transition-colors duration-200 hover:bg-stone-900/5 hover:text-stone-900"
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="hidden rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:text-stone-900 sm:block">
              Sign in
            </button>
            <button
              type="button"
              onClick={() => go('pricing')}
              className="hidden rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-[#FF5A36] sm:block"
            >
              Start free
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-stone-900/5 lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl origin-top overflow-hidden rounded-3xl border border-stone-200 bg-white/95 shadow-[0_24px_48px_-16px_rgba(28,25,23,0.25)] backdrop-blur-xl transition-all duration-300 ease-spring lg:hidden',
            open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none absolute inset-x-4 scale-95 opacity-0',
          )}
        >
          <div className="grid gap-1 p-3">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-base text-stone-800 transition-colors hover:bg-stone-100"
              >
                {l.label}
                <ArrowRight className="h-4 w-4 text-stone-400" />
              </button>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" className="rounded-full border border-stone-300 py-3 text-sm font-medium text-stone-800">Sign in</button>
              <button type="button" onClick={() => go('pricing')} className="rounded-full bg-stone-900 py-3 text-sm font-medium text-white">
                Start free
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

const HEADLINE = ['Post', 'everywhere.'];

export function Hero() {
  return (
    <section id="top" className="relative scroll-mt-20 overflow-hidden pb-24 pt-12 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,90,54,0.16),transparent)]" />
        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] animate-blob bg-amber-200/30 blur-3xl" />
        <div className="absolute left-[-8%] top-[40%] h-[360px] w-[360px] animate-blob bg-sky-200/30 blur-3xl [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(28,25,23,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(28,25,23,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-down">
            <Eyebrow>
              New: AI captions tuned to each network <ArrowRight className="h-3 w-3" />
            </Eyebrow>
          </div>
          <h1 className="mt-6 text-5xl font-medium leading-[1.05] tracking-[-0.045em] text-stone-900 sm:text-6xl lg:text-7xl">
            {HEADLINE.map((w, i) => (
              <span key={w} className="cad-word mr-[0.22em] inline-block" style={{ animationDelay: `${i * 90}ms` }}>
                {w}
              </span>
            ))}
            <br className="hidden sm:block" />
            <span className="cad-word inline-block font-serif font-normal italic tracking-[-0.01em]" style={{ animationDelay: '220ms' }}>
              Stay <span className="relative inline-block text-[#FF5A36]">
                in rhythm.
                <svg viewBox="0 0 300 20" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 14 C 60 2, 120 2, 160 10 S 260 18, 298 6" fill="none" stroke="#FF5A36" strokeWidth="3" strokeLinecap="round" className="cad-underline" />
                </svg>
              </span>
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl animate-fade-up text-lg leading-relaxed text-stone-600 [animation-delay:350ms]">
            Cadence is the calm command center for social. Plan a month of content in an afternoon, tailor every caption per network,
            and publish at the exact moment your audience is listening.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:450ms] sm:flex-row">
            <PrimaryButton onClick={() => scrollToId('pricing')}>
              Start free for 14 days
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </PrimaryButton>
            <GhostButton onClick={() => scrollToId('composer')}>
              <Play className="h-3.5 w-3.5 fill-current" /> See it in action
            </GhostButton>
          </div>
          <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 text-sm text-stone-600 [animation-delay:550ms] sm:flex-row">
            <div className="flex -space-x-2">
              {[PEOPLE.maya, PEOPLE.daniel, PEOPLE.amara, PEOPLE.theo, PEOPLE.lena].map((p) => (
                <Avatar key={p.name} src={p.img} name={p.name} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex text-amber-500">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
              <span>
                Loved by <span className="font-medium text-stone-900">18,000+</span> creators & teams
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up [animation-delay:650ms] sm:mt-20">
          <OrbitingLogos />
          <HeroMock />
        </div>
      </div>
    </section>
  );
}
