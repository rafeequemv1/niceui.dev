import { useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUp, Check, Leaf, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { Eyebrow, Pill, paperGrain, scrollToId } from './primitives';

const faqs = [
  { q: 'Is my money actually safe?', a: 'Investment accounts are held at a qualified custodian and protected by SIPC up to $500k, plus excess insurance up to $2M. Cash is swept to FDIC-insured partner banks with coverage up to $5M.' },
  { q: 'What does a named advisor actually do?', a: 'Your advisor reviews your plan quarterly, helps with big moments like a home purchase or inheritance, and is reachable by message or video. They are fiduciaries and never paid on commission.' },
  { q: 'Can I move an existing account?', a: 'Yes. We support ACATS transfers from every major brokerage and will cover transfer fees up to $150. Most transfers complete in five to seven business days.' },
  { q: 'Are there any hidden fees?', a: 'None. Your membership is the only thing you pay. No trading commissions, no advisory percentage, no account minimums and no withdrawal fees.' },
  { q: 'Can I cancel any time?', a: 'Of course. Downgrade to Essential or close your account from settings in two taps. Yearly memberships are refunded pro rata.' },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight text-stone-900">Asked, and <em className="text-orange-700">answered.</em></h2>
          <p className="mt-6 max-w-sm text-stone-600">Still curious? Our advisors answer within the hour, every day of the year.</p>
        </Reveal>
        <div className="divide-y divide-stone-900/10 border-y border-stone-900/10">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className={cn('font-serif text-2xl transition-colors', isOpen ? 'text-stone-900' : 'text-stone-700 group-hover:text-stone-900')}>{f.q}</span>
                  <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-spring', isOpen ? 'rotate-45 border-orange-700 bg-orange-700 text-white' : 'border-stone-900/15 text-stone-700')}>
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <div className={cn('grid transition-all duration-500 ease-smooth', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <div className="overflow-hidden">
                    <p className="max-w-xl pb-6 leading-relaxed text-stone-600">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SignupCta() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    window.setTimeout(() => setStatus('done'), 1200);
  };

  return (
    <section id="aurelia-cta" className="scroll-mt-24 px-6 pb-28">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-orange-700 px-8 py-20 text-center md:px-16 md:py-28">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '7px 7px' }} />
          <div className="pointer-events-none absolute -bottom-32 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-amber-300/40 blur-[100px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight text-white md:text-7xl">
              Your future self <em>is already grateful.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-orange-50">Open an account in four minutes. Start with any amount. First year of Reserve is on us.</p>

            {status === 'done' ? (
              <div className="mx-auto mt-10 inline-flex items-center gap-3 rounded-full bg-white px-6 py-4 text-stone-900 animate-scale-in">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-700 text-white"><Check className="h-4 w-4" /></span>
                Check your inbox, we have saved you a seat.
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mx-auto mt-10 flex max-w-md flex-col gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/25 backdrop-blur sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="h-12 flex-1 rounded-full bg-transparent px-5 text-white placeholder:text-orange-100/70 focus:outline-none"
                />
                <Pill type="submit" disabled={status === 'loading'} className="disabled:opacity-80">
                  {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Get started <ArrowRight className="h-4 w-4" /></>}
                </Pill>
              </form>
            )}
            <p className={cn('mt-4 text-sm transition-opacity', status === 'error' ? 'text-white opacity-100' : 'opacity-0')} role="alert">
              Please enter a valid email address.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const columns = [
  { title: 'Products', links: ['Invest', 'Save', 'Card', 'Private'] },
  { title: 'Company', links: ['About', 'Careers', 'Press', 'Letters'] },
  { title: 'Support', links: ['Help centre', 'Security', 'Contact', 'Status'] },
];

export function AureliaFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-stone-900/10 px-6 pt-20">
      <div className="pointer-events-none absolute inset-0" style={paperGrain} />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-stone-900 text-[#f5f1ea]"><Leaf className="h-4 w-4" /></span>
              <span className="font-serif text-3xl text-stone-900">Aurelia</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-600">A private wealth studio for people who would rather be living.</p>
            <button onClick={() => scrollToId('top')} className="group mt-8 inline-flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-stone-900/15 transition-all group-hover:-translate-y-0.5 group-hover:bg-stone-900 group-hover:text-[#f5f1ea]"><ArrowUp className="h-3.5 w-3.5" /></span>
              Back to top
            </button>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] uppercase tracking-[0.22em] text-stone-500">{c.title}</h4>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <button className="group relative text-sm text-stone-700 transition-colors hover:text-stone-900">
                      {l}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-orange-700 transition-all duration-300 group-hover:w-full" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-20 select-none font-serif text-[22vw] leading-[0.8] tracking-tighter text-stone-900/[0.07] lg:text-[260px]" aria-hidden>
          Aurelia
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-stone-900/10 py-6 text-xs text-stone-500 md:flex-row">
          <span>© 2026 Aurelia Wealth, LLC. A NiceUI template.</span>
          <span className="max-w-xl md:text-right">Advisory services offered by Aurelia Advisers, an SEC-registered investment adviser. Investing involves risk, including loss of principal.</span>
        </div>
      </div>
    </footer>
  );
}
