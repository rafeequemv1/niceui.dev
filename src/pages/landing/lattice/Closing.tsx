import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Github, Linkedin, Loader2, Shapes, Twitter, Youtube } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { LButton, SectionHead, SelectionBox, scrollToSection } from './ui';

const plans = [
  { name: 'Starter', seat: 0, blurb: 'For personal projects', features: ['3 design files', 'Unlimited viewers', '50 AI generations / mo', 'Community plugins'] },
  { name: 'Professional', seat: 15, blurb: 'For growing product teams', features: ['Unlimited files & projects', 'Dev Mode + code export', '2,000 AI generations / mo', 'Shared libraries', 'Version history'], featured: true },
  { name: 'Organization', seat: 45, blurb: 'For design systems at scale', features: ['Everything in Professional', 'Unlimited AI', 'Branching & merging', 'SSO / SCIM', 'Design system analytics'] },
];

export function LatticePricing() {
  const [seats, setSeats] = useState(8);
  return (
    <section id="lattice-pricing" className="scroll-mt-16 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead center tag="Pricing" color="#facc15" title={<>Start free. <span className="text-zinc-400">Scale when it clicks.</span></>} />
        <Reveal className="mx-auto mt-12 max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">Editors on your team</span>
            <span className="rounded-md bg-zinc-950 px-2 py-0.5 font-mono text-xs text-white">{seats}</span>
          </div>
          <input type="range" min={1} max={50} value={seats} onChange={(e) => setSeats(Number(e.target.value))} aria-label="Number of editors" className="mt-4 w-full accent-[#0d99ff]" />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400"><span>1</span><span>25</span><span>50</span></div>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((p, i) => {
            const total = p.seat * seats;
            return (
              <Reveal key={p.name} delay={i * 100}>
                <div className={cn('relative flex h-full flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1', p.featured ? 'bg-zinc-950 text-white shadow-[0_40px_80px_-30px_rgba(13,153,255,0.45)]' : 'border border-zinc-200 bg-white text-zinc-950')}>
                  {p.featured && <span className="absolute -top-3 left-8 rounded-full bg-[#0d99ff] px-3 py-1 text-xs font-medium text-white">Most popular</span>}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className={cn('text-sm', p.featured ? 'text-zinc-400' : 'text-zinc-500')}>{p.blurb}</p>
                  <div className="mt-8 flex items-baseline gap-1.5">
                    <span key={total} className="text-5xl font-semibold tabular-nums tracking-tight animate-fade-up">${total.toLocaleString()}</span>
                    <span className={cn('text-sm', p.featured ? 'text-zinc-400' : 'text-zinc-500')}>/ month</span>
                  </div>
                  <p className={cn('mt-1 font-mono text-xs', p.featured ? 'text-zinc-500' : 'text-zinc-400')}>{p.seat ? `$${p.seat} × ${seats} editors` : 'Free forever'}</p>
                  <ul className="mt-8 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <Check className={cn('h-4 w-4 shrink-0', p.featured ? 'text-[#0d99ff]' : 'text-emerald-600')} />
                        <span className={p.featured ? 'text-zinc-300' : 'text-zinc-700'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <LButton variant={p.featured ? 'blue' : 'light'} className="mt-10 w-full" onClick={() => scrollToSection('cta')}>
                    {p.seat ? `Get ${p.name}` : 'Start for free'}
                  </LButton>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const quotes = [
  { q: 'We replaced three tools with Lattice. Our design-to-dev handoff went from days to minutes.', n: 'Sana Okafor', r: 'Head of Design, Northwind', c: '#0d99ff' },
  { q: 'The AI actually respects our tokens. It is the first generator that outputs things we would ship.', n: 'Luca Ferri', r: 'Design Systems Lead, Initech', c: '#f97316' },
  { q: 'Branching changed how we work. Ten designers, one library, zero overwrites.', n: 'Hana Ito', r: 'VP Product, Lumon', c: '#10b981' },
  { q: 'Dev Mode is the reason our engineers open design files voluntarily now.', n: 'Marcus Webb', r: 'Staff Engineer, Hooli', c: '#f43f5e' },
  { q: 'Prototypes are so close to real that we run usability tests straight from the share link.', n: 'Elena Duarte', r: 'UX Research, Vandelay', c: '#facc15' },
  { q: 'Performance on a 4,000-frame file is unreal. It just does not slow down.', n: 'Dev Patel', r: 'Founder, Pied Piper', c: '#0d99ff' },
];

export function Wall() {
  return (
    <section className="bg-zinc-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead tag="Loved by teams" color="#f97316" title={<>Made by makers, <span className="text-zinc-400">for makers.</span></>} />
        <div className="mt-14 columns-1 gap-4 md:columns-2 lg:columns-3">
          {quotes.map((t, i) => (
            <Reveal key={t.n} delay={(i % 3) * 100} className="mb-4 break-inside-avoid">
              <figure className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg">
                <blockquote className="text-[15px] leading-relaxed text-zinc-800">"{t.q}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: t.c }}>{t.n[0]}</span>
                  <div>
                    <div className="text-sm font-medium text-zinc-950">{t.n}</div>
                    <div className="text-xs text-zinc-500">{t.r}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LatticeCta() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'error' | 'loading' | 'done'>('idle');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setState('error');
    setState('loading');
    window.setTimeout(() => setState('done'), 1100);
  };
  return (
    <section id="lattice-cta" className="scroll-mt-16 px-6 py-28">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-zinc-950 px-8 py-20 text-center md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#0d99ff]/30 blur-[100px]" />
        <div className="relative">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-6xl">
            Your next idea <br className="hidden sm:block" />deserves a <SelectionBox label="canvas" className="text-white">canvas.</SelectionBox>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-zinc-400">Join 4 million designers and developers building on Lattice.</p>
          {state === 'done' ? (
            <div className="mx-auto mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-950 animate-scale-in">
              <Check className="h-4 w-4 text-emerald-600" /> Invite sent. Check your inbox.
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mx-auto mt-10 flex max-w-md flex-col gap-2 sm:flex-row">
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                type="email" placeholder="you@company.com" aria-label="Work email"
                className={cn('h-12 flex-1 rounded-xl bg-white/5 px-4 text-sm text-white outline-none ring-1 transition-all placeholder:text-zinc-500 focus:bg-white/10', state === 'error' ? 'ring-rose-500' : 'ring-white/15 focus:ring-[#0d99ff]')}
              />
              <LButton variant="blue" type="submit" className="h-12" disabled={state === 'loading'}>
                {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Get started <ArrowRight className="h-4 w-4" /></>}
              </LButton>
            </form>
          )}
          <p className={cn('mt-3 text-sm text-rose-400 transition-opacity', state === 'error' ? 'opacity-100' : 'opacity-0')} role="alert">Enter a valid work email.</p>
        </div>
      </Reveal>
    </section>
  );
}

const footerCols = [
  { t: 'Product', l: ['Design', 'Lattice AI', 'Prototyping', 'Dev Mode', 'Whiteboard'] },
  { t: 'Resources', l: ['Community', 'Plugins', 'Templates', 'Changelog', 'Status'] },
  { t: 'Company', l: ['About', 'Careers', 'Customers', 'Press', 'Contact'] },
];

export function LatticeFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-950 text-white"><Shapes className="h-4 w-4" /></span>
            <span className="text-[17px] font-semibold tracking-tight text-zinc-950">Lattice</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-600">The AI-native design canvas for teams who ship.</p>
          <div className="mt-6 flex gap-2">
            {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
              <button key={i} aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"><Icon className="h-4 w-4" /></button>
            ))}
          </div>
        </div>
        {footerCols.map((c) => (
          <div key={c.t}>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">{c.t}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.l.map((l) => <li key={l}><button className="text-sm text-zinc-600 transition-colors hover:text-zinc-950">{l}</button></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-6 text-xs text-zinc-500 sm:flex-row">
          <span>© 2026 Lattice Design, Inc. A NiceUI template.</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
