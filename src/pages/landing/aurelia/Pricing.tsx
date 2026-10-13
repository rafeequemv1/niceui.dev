import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Quote } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { Eyebrow, Pill, scrollToId } from './primitives';

const plans = [
  { name: 'Essential', monthly: 0, yearly: 0, blurb: 'For your first portfolio.', features: ['Automated portfolios', '4.10% APY savings', 'Round-ups', 'Email support'] },
  { name: 'Reserve', monthly: 12, yearly: 9, blurb: 'Our most loved membership.', features: ['Everything in Essential', 'Tax-loss harvesting', 'Reserve metal card', 'Named advisor', 'Priority support'], featured: true },
  { name: 'Private', monthly: 48, yearly: 39, blurb: 'For complex, multi-generational wealth.', features: ['Everything in Reserve', 'Direct indexing', 'Trust & estate planning', 'Private markets access', 'Dedicated wealth team'] },
];

function AnimatedPrice({ value }: { value: number }) {
  return (
    <span key={value} className="inline-block animate-fade-up font-serif text-6xl tabular-nums text-inherit">
      ${value}
    </span>
  );
}

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="aurelia-pricing" className="scroll-mt-24 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center text-center">
          <Eyebrow>Membership</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 md:text-6xl">
            One honest price. <em className="text-orange-700">No basis points.</em>
          </h2>
          <div className="relative mt-10 flex rounded-full border border-stone-900/10 bg-white/70 p-1">
            <span className={cn('absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-stone-900 transition-transform duration-500 ease-spring', yearly ? 'translate-x-full' : 'translate-x-0')} />
            {['Monthly', 'Yearly'].map((l, i) => (
              <button
                key={l}
                onClick={() => setYearly(i === 1)}
                className={cn('relative z-10 w-32 rounded-full py-2 text-sm font-medium transition-colors duration-300', yearly === (i === 1) ? 'text-[#f5f1ea]' : 'text-stone-600 hover:text-stone-900')}
              >
                {l}
                {i === 1 && <span className={cn('ml-1.5 text-xs', yearly ? 'text-orange-300' : 'text-orange-700')}>-25%</span>}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-[28px] border p-8 transition-all duration-500 ease-smooth hover:-translate-y-1',
                  p.featured ? 'border-stone-900 bg-stone-900 text-[#f5f1ea] shadow-[0_40px_80px_-30px_rgba(41,37,36,0.6)]' : 'border-stone-900/10 bg-white/70 text-stone-900',
                )}
              >
                {p.featured && <span className="absolute right-6 top-6 rounded-full bg-orange-700 px-3 py-1 text-xs font-medium text-white">Most chosen</span>}
                <h3 className="font-serif text-3xl">{p.name}</h3>
                <p className={cn('mt-1 text-sm', p.featured ? 'text-stone-400' : 'text-stone-500')}>{p.blurb}</p>
                <div className="mt-8 flex items-baseline gap-2">
                  <AnimatedPrice value={yearly ? p.yearly : p.monthly} />
                  <span className={cn('text-sm', p.featured ? 'text-stone-400' : 'text-stone-500')}>/ month</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span className={cn('grid h-5 w-5 place-items-center rounded-full', p.featured ? 'bg-orange-700 text-white' : 'bg-emerald-50 text-emerald-800')}>
                        <Check className="h-3 w-3" />
                      </span>
                      <span className={p.featured ? 'text-stone-200' : 'text-stone-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Pill variant={p.featured ? 'clay' : 'ink'} className="mt-10 w-full" onClick={() => scrollToId('cta')}>
                  {p.monthly === 0 ? 'Start free' : `Choose ${p.name}`}
                </Pill>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const stories = [
  { quote: 'I used to check my portfolio daily and lose sleep over it. With Aurelia I look once a quarter, and it is always further along than I expected.', name: 'Margot Ellery', role: 'Architect, Lisbon', tone: 'bg-orange-200' },
  { quote: 'Our advisor helped us set up a trust for the kids in an afternoon. It felt like having a family office without the family-office invoice.', name: 'Daniel & Priya Rao', role: 'Founders, Austin', tone: 'bg-emerald-200' },
  { quote: 'The card is beautiful, but the real magic is the cashback quietly turning into index funds. I have never thought about it once.', name: 'Jonah Whitlock', role: 'Film editor, Brooklyn', tone: 'bg-amber-200' },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    if (paused) return;
    timer.current = window.setTimeout(() => setI((n) => (n + 1) % stories.length), 6000);
    return () => window.clearTimeout(timer.current);
  }, [i, paused]);

  const go = (d: number) => setI((n) => (n + d + stories.length) % stories.length);
  const s = stories[i];

  return (
    <section id="aurelia-journal" className="scroll-mt-24 bg-[#ede7dd] px-6 py-28" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-5xl">
        <Eyebrow>Member journal</Eyebrow>
        <div className="relative mt-10 min-h-[320px]">
          <Quote className="h-10 w-10 text-orange-700/40" />
          <blockquote key={i} className="mt-6 animate-fade-up font-serif text-3xl leading-[1.25] text-stone-900 md:text-5xl">
            {s.quote}
          </blockquote>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-8 border-t border-stone-900/10 pt-8 sm:flex-row sm:items-center">
          <div key={`a-${i}`} className="flex items-center gap-4 animate-fade-in">
            <span className={cn('grid h-12 w-12 place-items-center rounded-full font-serif text-xl text-stone-900', s.tone)}>{s.name[0]}</span>
            <div>
              <div className="font-medium text-stone-900">{s.name}</div>
              <div className="text-sm text-stone-500">{s.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {stories.map((_, n) => (
                <button key={n} onClick={() => setI(n)} aria-label={`Story ${n + 1}`} className="relative h-1 w-10 overflow-hidden rounded-full bg-stone-900/10">
                  <span
                    key={`${i}-${paused}`}
                    className={cn('absolute inset-y-0 left-0 bg-stone-900', n < i ? 'w-full' : n > i ? 'w-0' : '')}
                    style={n === i ? { animation: paused ? 'none' : 'aurelia-progress 6s linear forwards', width: paused ? '100%' : undefined } : undefined}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full border border-stone-900/15 text-stone-900 transition-all hover:bg-stone-900 hover:text-[#f5f1ea]">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={() => go(1)} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full border border-stone-900/15 text-stone-900 transition-all hover:bg-stone-900 hover:text-[#f5f1ea]">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes aurelia-progress{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}
