import { useState } from 'react';
import { ArrowRight, Check, Plus, Quote } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { Button, Container, SectionHeading, scrollToId } from './ui';

const PLANS = [
  {
    name: 'Catalog license',
    price: 'From $40K',
    unit: 'per dataset / year',
    blurb: 'Off-the-shelf datasets with commercial rights, ready to download today.',
    features: ['Any dataset in the catalog', 'Per-record license receipts', 'Quarterly refreshes', 'Streaming API + bucket delivery', 'Email support'],
    cta: 'Browse catalog',
    target: 'catalog',
  },
  {
    name: 'Custom collection',
    price: 'From $250K',
    unit: 'per program',
    blurb: 'We source, license and label new data to your spec, with your rubric.',
    features: ['Dedicated research PM', 'Expert annotator pools', 'Custom RLHF & eval design', 'Weekly gold-set reports', 'Exclusivity options'],
    cta: 'Scope a program',
    target: 'contact',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: 'multi-year',
    blurb: 'Full-stack data partnership for labs training frontier-scale models.',
    features: ['Unlimited catalog access', 'Indemnification up to $50M', 'Data residency & air-gap', 'Dedicated legal liaison', '24/7 incident response'],
    cta: 'Talk to sales',
    target: 'contact',
  },
];

export function CorpusPricing() {
  return (
    <section id="pricing" className="relative scroll-mt-20 border-t border-white/[0.06] py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading align="center" eyebrow="06 — Engagement" title={<>Licensing that scales with <em className="italic text-teal-100">your ambition.</em></>} sub="Transparent starting points. Every plan includes indemnification and full provenance." />
        </Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div className={cn('group relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-500 ease-smooth hover:-translate-y-1', p.featured ? 'border-teal-300/40 bg-gradient-to-b from-teal-300/[0.08] to-transparent shadow-[0_30px_80px_-30px_rgba(94,234,212,0.35)]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20')}>
                {p.featured && <span className="absolute -top-3 left-8 rounded-full bg-teal-200 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#04110e]">Most chosen</span>}
                <h3 className="text-lg font-medium text-white">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.blurb}</p>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-serif text-5xl tracking-tight text-white">{p.price}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">{p.unit}</div>
                <ul className="mt-8 flex-1 space-y-3 border-t border-white/[0.06] pt-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className={cn('mt-0.5 h-4 w-4 shrink-0', p.featured ? 'text-teal-300' : 'text-zinc-400')} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={p.featured ? 'primary' : 'outline'} onClick={() => scrollToId(p.target)} className="mt-8 w-full">
                  {p.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

const QUOTES = [
  { q: 'Corpus is the only vendor whose receipts our legal team accepted without a second review. That alone saved us a quarter.', n: 'Dr. Lena Hoffmann', r: 'Head of Pretraining, Helix Labs' },
  { q: 'Their preference data moved our reward model more than three times the volume from crowd vendors. Expert rationales are the difference.', n: 'Ravi Menon', r: 'Alignment Lead, Northwind AI' },
  { q: 'We gave them an eval spec on Monday and had a contamination-audited, sealed benchmark three weeks later. Remarkable rigor.', n: 'Sofia Alvarez', r: 'Research Scientist, Parallel' },
];

export function CorpusTestimonials() {
  const [i, setI] = useState(0);
  return (
    <section className="relative border-t border-white/[0.06] py-24 sm:py-32">
      <div aria-hidden className="dither-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]" />
      <Container className="relative">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Quote className="mx-auto h-8 w-8 text-teal-300/60" strokeWidth={1.25} />
          <blockquote key={i} className="mt-8 animate-fade-up font-serif text-3xl leading-[1.25] text-white sm:text-4xl lg:text-5xl">"{QUOTES[i].q}"</blockquote>
          <div key={`a-${i}`} className="mt-8 animate-fade-in">
            <div className="text-white">{QUOTES[i].n}</div>
            <div className="mt-1 font-mono text-xs text-zinc-400">{QUOTES[i].r}</div>
          </div>
          <div className="mt-10 flex justify-center gap-2">
            {QUOTES.map((x, k) => (
              <button key={x.n} type="button" onClick={() => setI(k)} aria-label={`Testimonial from ${x.n}`} className={cn('h-1.5 rounded-full transition-all duration-500 ease-smooth', k === i ? 'w-10 bg-teal-300' : 'w-4 bg-white/20 hover:bg-white/40')} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

const FAQS = [
  ['Where does your data come from?', 'Exclusively from direct agreements: publishers, code owners who opted in, stock and studio partners, and paid contributors who signed explicit consent. We never train on, or resell, scraped data of unknown provenance.'],
  ['What does indemnification cover?', 'Enterprise and custom programs include IP indemnification for claims arising from the licensed data, backed by insurance. Catalog licenses include indemnification up to the contract value.'],
  ['Can you dedupe against our existing corpora?', 'Yes. We run exact, MinHash and embedding-based dedupe against hashes of your data inside your VPC, so your raw data never leaves your environment.'],
  ['How do you handle opt-outs after delivery?', 'Each record carries a receipt id. When a rights holder opts out, we publish a signed revocation list and replacement records so you can exclude them from future training runs.'],
  ['Who are your annotators?', '38,000 vetted specialists across 120 countries — clinicians, engineers, lawyers, mathematicians and native-speaker linguists — paid above local living-wage benchmarks.'],
];

export function CorpusFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative border-t border-white/[0.06] py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <Reveal>
          <SectionHeading eyebrow="07 — FAQ" title={<>Questions, <em className="italic text-teal-100">answered.</em></>} sub="Can't find what you need? Our data counsel team replies within one business day." />
        </Reveal>
        <Reveal delay={100}>
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {FAQS.map(([q, a], i) => {
              const on = open === i;
              return (
                <div key={q}>
                  <button type="button" onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
                    <span className={cn('text-lg transition-colors', on ? 'text-white' : 'text-zinc-300 group-hover:text-white')}>{q}</span>
                    <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-smooth', on ? 'rotate-45 border-teal-300/40 bg-teal-300/10 text-teal-200' : 'border-white/10 text-zinc-400')}>
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <div className={cn('grid transition-all duration-500 ease-smooth', on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                    <p className="min-h-0 overflow-hidden pr-14 leading-relaxed text-zinc-400">
                      <span className="block pb-6">{a}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
