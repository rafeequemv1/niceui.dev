import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Leaf, Menu, Play, Repeat, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCountUp } from '@/pages/landing/shared/motion';
import { Pill, scrollToId } from './primitives';

const links = ['Invest', 'Save', 'Card', 'Pricing', 'Journal'];

export function AureliaNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    const onScroll = () => setScrolled((main?.scrollTop ?? window.scrollY) > 24);
    main?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      main?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-40 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          'flex w-full max-w-5xl items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 ease-smooth',
          scrolled ? 'border-stone-900/10 bg-[#f5f1ea]/85 shadow-[0_8px_30px_-12px_rgba(41,37,36,0.25)] backdrop-blur-xl' : 'border-transparent bg-transparent',
        )}
      >
        <button onClick={() => scrollToId('top')} className="flex items-center gap-2 pl-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-stone-900 text-[#f5f1ea]">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-serif text-2xl leading-none text-stone-900">Aurelia</span>
        </button>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button key={l} onClick={() => scrollToId(l.toLowerCase())} className="rounded-full px-4 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-900/5 hover:text-stone-900">
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scrollToId('cta')} className="hidden px-3 text-sm text-stone-700 hover:text-stone-900 sm:block">Sign in</button>
          <Pill className="h-10 px-5" onClick={() => scrollToId('cta')}>Open account</Pill>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full text-stone-900 hover:bg-stone-900/5 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <div
        className={cn(
          'absolute inset-x-4 top-20 grid rounded-3xl border border-stone-900/10 bg-[#f5f1ea]/95 backdrop-blur-xl transition-all duration-500 ease-smooth md:hidden',
          open ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col p-3">
            {links.map((l) => (
              <button key={l} onClick={() => { setOpen(false); scrollToId(l.toLowerCase()); }} className="rounded-2xl text-left px-4 py-3 font-serif text-2xl text-stone-900 hover:bg-stone-900/5">
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const chartPoints = [12, 18, 15, 24, 22, 30, 28, 36, 34, 44, 41, 52, 50, 60];

function PortfolioCard() {
  const balance = useCountUp(248_391.42, true, 2200);
  const max = Math.max(...chartPoints);
  const path = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (chartPoints.length - 1)) * 300} ${100 - (p / max) * 88}`).join(' ');
  const [range, setRange] = useState('1Y');

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 rounded-[48px] bg-gradient-to-br from-orange-200/60 via-transparent to-emerald-200/60 blur-3xl" />
      <div className="relative rounded-[32px] border border-stone-900/10 bg-white/80 p-6 shadow-[0_40px_80px_-30px_rgba(41,37,36,0.35)] backdrop-blur-xl animate-fade-up">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-stone-500">Total wealth</span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-700/15">
            <ArrowUpRight className="h-3 w-3" /> 18.4%
          </span>
        </div>
        <div className="mt-3 font-serif text-5xl tabular-nums tracking-tight text-stone-900">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <svg viewBox="0 0 300 110" className="mt-6 h-32 w-full overflow-visible">
          <defs>
            <linearGradient id="aurelia-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#c2410c" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path} L 300 110 L 0 110 Z`} fill="url(#aurelia-fill)" className="animate-fade-in" />
          <path
            d={path}
            fill="none"
            stroke="#c2410c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="600"
            strokeDashoffset="600"
            style={{ animation: 'aurelia-draw 2.4s cubic-bezier(.22,1,.36,1) forwards' }}
          />
          <circle cx="300" cy={100 - (chartPoints[chartPoints.length - 1] / max) * 88} r="4" fill="#c2410c" className="animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'both' }} />
        </svg>
        <div className="mt-4 flex gap-1 rounded-full bg-stone-100 p-1">
          {['1W', '1M', '1Y', 'All'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn('flex-1 rounded-full py-1.5 text-xs font-medium transition-all duration-300', range === r ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800')}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {[
            { name: 'Global Equities', pct: 62, color: 'bg-orange-700' },
            { name: 'Treasury Bonds', pct: 24, color: 'bg-emerald-700' },
            { name: 'Cash Reserve', pct: 14, color: 'bg-stone-400' },
          ].map((a, i) => (
            <div key={a.name}>
              <div className="flex justify-between text-sm">
                <span className="text-stone-700">{a.name}</span>
                <span className="tabular-nums text-stone-900">{a.pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div className={cn('h-full origin-left rounded-full', a.color)} style={{ width: `${a.pct}%`, animation: `aurelia-grow 1.4s ${0.6 + i * 0.15}s cubic-bezier(.22,1,.36,1) both` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -left-6 top-24 hidden items-center gap-3 rounded-2xl border border-stone-900/10 bg-white/90 p-3 pr-4 shadow-xl backdrop-blur animate-float sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white"><Repeat className="h-4 w-4" /></span>
        <div>
          <div className="text-xs text-stone-500">Auto-invest</div>
          <div className="text-sm font-medium text-stone-900">$500 every Friday</div>
        </div>
      </div>
      <div className="absolute -right-4 bottom-16 hidden items-center gap-3 rounded-2xl border border-stone-900/10 bg-stone-900 p-3 pr-4 text-[#f5f1ea] shadow-xl animate-float sm:flex" style={{ animationDelay: '1.5s' }}>
        <ShieldCheck className="h-5 w-5 text-orange-300" />
        <span className="text-sm">Insured up to $2M</span>
      </div>
    </div>
  );
}

export function AureliaHero() {
  return (
    <section id="aurelia-top" className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24">
      <style>{`@keyframes aurelia-draw{to{stroke-dashoffset:0}}@keyframes aurelia-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.14),transparent)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <button onClick={() => scrollToId('invest')} className="group inline-flex items-center gap-3 rounded-full border border-stone-900/10 bg-white/60 py-1 pl-1 pr-4 text-sm text-stone-700 backdrop-blur animate-fade-down">
            <span className="rounded-full bg-orange-700 px-2.5 py-0.5 text-xs font-medium text-white">New</span>
            Tax-loss harvesting is here
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <h1 className="mt-8 font-serif text-6xl leading-[1.02] tracking-tight text-stone-900 sm:text-7xl lg:text-[88px]">
            {['Wealth,', 'quietly'].map((w, i) => (
              <span key={w} className="mr-4 inline-block animate-fade-up" style={{ animationDelay: `${150 + i * 120}ms`, animationFillMode: 'both' }}>{w}</span>
            ))}
            <br />
            <em className="inline-block animate-fade-up text-orange-700" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>compounded.</em>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-stone-600 animate-fade-up" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
            Aurelia is the private wealth studio for people who would rather be living. Automated portfolios, high-yield savings and a metal card, all in one calm place.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
            <Pill onClick={() => scrollToId('cta')}>Start investing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Pill>
            <Pill variant="paper" onClick={() => scrollToId('save')}><Play className="h-3.5 w-3.5 fill-current" /> Watch the film</Pill>
          </div>
          <div className="mt-12 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '850ms', animationFillMode: 'both' }}>
            <div className="flex -space-x-2">
              {['bg-orange-200', 'bg-emerald-200', 'bg-stone-300', 'bg-amber-200'].map((c, i) => (
                <span key={c} className={cn('grid h-9 w-9 place-items-center rounded-full text-xs font-medium text-stone-800 ring-2 ring-[#f5f1ea]', c)}>{'MJKS'[i]}</span>
              ))}
            </div>
            <p className="text-sm text-stone-600"><span className="font-medium text-stone-900">140,000+</span> members growing $4.2B</p>
          </div>
        </div>
        <PortfolioCard />
      </div>
    </section>
  );
}
