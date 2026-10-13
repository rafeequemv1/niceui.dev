import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Coins, Landmark, UserRound } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useCountUp, useInView } from '@/pages/landing/shared/motion';
import { Eyebrow, scrollToId } from './primitives';

const steps = [
  { icon: UserRound, title: 'Tell us about your life', body: 'Ten thoughtful questions. No jargon. We learn your horizon, your appetite for risk and what you are saving toward.', stat: '4 min', statLabel: 'average setup' },
  { icon: Landmark, title: 'Connect your accounts', body: 'Link any bank in 11,000+ institutions. Roll over old 401(k)s with one signature, and we handle the paperwork.', stat: '11k+', statLabel: 'institutions' },
  { icon: Coins, title: 'Set it, then forget it', body: 'Recurring deposits, round-ups and dividend reinvestment run quietly in the background while you get on with things.', stat: '$0', statLabel: 'trading fees' },
  { icon: BadgeCheck, title: 'Meet your advisor', body: 'Every member has a named, fiduciary advisor. Real humans, on call, legally bound to act in your interest.', stat: '24/7', statLabel: 'human support' },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="aurelia-save" className="scroll-mt-24 bg-[#ede7dd] px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 md:text-6xl">
            Four steps to a <em className="text-emerald-800">calmer</em> balance sheet.
          </h2>
          <div className="mt-12 hidden space-y-2 lg:block">
            {steps.map((s, i) => (
              <button
                key={s.title}
                onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all duration-500"
              >
                <span className={cn('font-mono text-sm transition-colors duration-500', active === i ? 'text-orange-700' : 'text-stone-400')}>0{i + 1}</span>
                <span className="relative h-px flex-1 overflow-hidden bg-stone-900/10">
                  <span className={cn('absolute inset-y-0 left-0 bg-orange-700 transition-all duration-700 ease-smooth', active === i ? 'w-full' : active > i ? 'w-full opacity-30' : 'w-0')} />
                </span>
                <span className={cn('w-56 text-sm transition-colors duration-500', active === i ? 'text-stone-900' : 'text-stone-500')}>{s.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {steps.map((s, i) => (
            <div
              key={s.title}
              ref={(el) => { refs.current[i] = el; }}
              data-index={i}
              className={cn(
                'rounded-[28px] border bg-white p-8 transition-all duration-700 ease-smooth md:p-10',
                active === i ? 'border-orange-700/30 shadow-[0_30px_60px_-30px_rgba(194,65,12,0.35)] lg:scale-100 lg:opacity-100' : 'border-stone-900/10 lg:scale-[0.97] lg:opacity-50',
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn('grid h-12 w-12 place-items-center rounded-2xl transition-colors duration-500', active === i ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-700')}>
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-stone-400">Step 0{i + 1}</span>
              </div>
              <h3 className="mt-8 font-serif text-3xl text-stone-900">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-stone-600">{s.body}</p>
              <div className="mt-8 flex items-baseline gap-2 border-t border-stone-900/10 pt-6">
                <span className="font-serif text-4xl text-stone-900">{s.stat}</span>
                <span className="text-sm text-stone-500">{s.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, prefix = '', suffix = '', decimals = 0, label, active }: { value: number; prefix?: string; suffix?: string; decimals?: number; label: string; active: boolean }) {
  const v = useCountUp(value, active, 2000);
  return (
    <div className="border-t border-white/15 pt-6">
      <div className="font-serif text-6xl tabular-nums tracking-tight text-[#f5f1ea] md:text-7xl">
        {prefix}{v.toFixed(decimals)}{suffix}
      </div>
      <p className="mt-3 text-sm text-stone-400">{label}</p>
    </div>
  );
}

export function StatsBand() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <section className="relative overflow-hidden bg-stone-950 px-6 py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#f5f1ea 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-orange-700/25 blur-[120px]" />
      <div ref={ref} className="relative mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 className="max-w-xl font-serif text-5xl leading-[1.05] tracking-tight text-[#f5f1ea] md:text-6xl">
            Patience, <em className="text-orange-300">measured.</em>
          </h2>
          <button onClick={() => scrollToId('journal')} className="inline-flex items-center gap-2 text-sm text-stone-300 transition-colors hover:text-white">
            Hear from our members <ArrowUpRight className="h-4 w-4" />
          </button>
        </Reveal>
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={4.2} prefix="$" suffix="B" decimals={1} label="Assets under care" active={inView} />
          <Stat value={9.8} suffix="%" decimals={1} label="Avg. 10-yr annualized return*" active={inView} />
          <Stat value={140} suffix="k" label="Members in 38 countries" active={inView} />
          <Stat value={4.9} decimals={1} label="App Store rating, 32k reviews" active={inView} />
        </div>
        <p className="mt-12 text-xs text-stone-500">*Illustrative figures for template purposes. Past performance does not guarantee future results.</p>
      </div>
    </section>
  );
}
