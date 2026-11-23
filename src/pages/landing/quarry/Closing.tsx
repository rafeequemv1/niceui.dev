import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Lock, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { Heading, QButton, QuarryMark } from './ui';

/* ——— pricing ——— */

type Billing = 'monthly' | 'yearly' | 'lifetime';
const PRO: Record<Billing, { price: number; unit: string; note: string }> = {
  monthly: { price: 19, unit: '/ month', note: 'Cancel any time' },
  yearly: { price: 159, unit: '/ year', note: 'Two months on us' },
  lifetime: { price: 299, unit: 'once', note: 'Every future section, forever' },
};

/** A number that rolls to its new value. */
function Roll({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const a = from.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 450);
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - k, 3)));
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{shown}</span>;
}

export function QuarryPricing() {
  const [billing, setBilling] = useState<Billing>('yearly');
  const opts: Billing[] = ['monthly', 'yearly', 'lifetime'];
  const pro = PRO[billing];
  return (
    <section id="quarry-pricing" className="mx-auto max-w-[1040px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
      <Heading center tag="Pricing" a="Start free." b="Upgrade when it earns its keep." />
      <Reveal className="mt-9 flex justify-center">
        <div role="radiogroup" aria-label="Billing" className="relative grid grid-cols-3 rounded-full border border-white/[.07] bg-white/[.02] p-1">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-[#f2efe9] transition-transform duration-500 ease-[cubic-bezier(.3,1.25,.5,1)]"
            style={{ transform: `translateX(${opts.indexOf(billing) * 100}%)` }}
          />
          {opts.map((o) => (
            <button
              key={o}
              role="radio"
              aria-checked={billing === o}
              onClick={() => setBilling(o)}
              className={cn('relative z-10 flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] capitalize transition-colors sm:px-5', billing === o ? 'text-[#141413]' : 'text-[#8b8880] hover:text-white')}
            >
              {o}
              {o === 'yearly' && <span className={cn('rounded-full px-1.5 text-[10px] font-medium', billing === o ? 'bg-[#141413] text-[#c8d5b9]' : 'bg-[#c8d5b9]/15 text-[#c8d5b9]')}>−30%</span>}
            </button>
          ))}
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col rounded-2xl border border-white/[.07] bg-[#131312] p-7">
            <p className="text-[14px] text-[#cfcbc3]">Free</p>
            <p className="mt-3 text-[44px] font-medium leading-none tracking-[-0.04em] text-[#f2efe9]">
              $0 <span className="text-[15px] font-normal tracking-normal text-[#6f6c66]">forever</span>
            </p>
            <ul className="mt-7 flex-1 space-y-3 text-[13.5px] text-[#8b8880]">
              {['Six sections in every category', 'All colour themes', 'Agent bridge for free sections', 'Personal and client projects'].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6f6c66]" /> {f}
                </li>
              ))}
            </ul>
            <QButton variant="ghost" className="mt-8 border border-white/10">
              Start for free
            </QButton>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#c8d5b9]/25 bg-[linear-gradient(160deg,#1a1c17,#131312_60%)] p-7">
            <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c8d5b9]/10 blur-3xl" />
            <p className="flex items-center gap-2 text-[14px] text-[#c8d5b9]">
              Pro <span className="rounded-full border border-[#c8d5b9]/30 px-2 py-px text-[10px] uppercase tracking-wider">Most picked</span>
            </p>
            <p className="mt-3 text-[44px] font-medium leading-none tracking-[-0.04em] text-[#f2efe9]">
              $<Roll value={pro.price} /> <span className="text-[15px] font-normal tracking-normal text-[#6f6c66]">{pro.unit}</span>
            </p>
            <p key={billing} className="mt-2 text-[12.5px] text-[#8b8880]" style={{ animation: 'q-fade .4s ease both' }}>
              {pro.note}
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-[13.5px] text-[#cfcbc3]">
              {['All 540 sections and parts', 'Every website template', 'Agent bridge for everything', 'Palette lab and copy polish', 'New drops every Thursday'].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c8d5b9]" /> {f}
                </li>
              ))}
            </ul>
            <QButton className="mt-8">Get Pro</QButton>
          </div>
        </Reveal>
      </div>
      <p className="mt-6 text-center text-[12.5px] text-[#6f6c66]">
        Studio of 5+? <a href="#" className="text-[#cfcbc3] underline underline-offset-4 hover:text-white">Ask about a team licence</a>
      </p>
      <style>{`@keyframes q-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}

/* ——— FAQ ——— */

const FAQ = [
  ['Can I use the sections in client work?', 'Yes. Free and Pro sections can ship in personal and client projects. You can’t resell them as a library or template pack.'],
  ['Do I need a specific framework?', 'Anything that runs React and Tailwind: Next.js, Vite, Remix, Astro islands. There’s no runtime package to install.'],
  ['How does the agent bridge work?', 'You add one MCP server to your editor. Your agent can then search Quarry, fetch the source and write it into your project, using your theme tokens.'],
  ['What happens if I cancel?', 'Everything you already copied stays yours. You just stop getting new Pro sections and agent access to them.'],
  ['Is there a refund?', 'If Quarry isn’t for you, write within 14 days and we’ll refund you in full. No form, no questions.'],
];

export function QuarryFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="quarry-faq" className="mx-auto max-w-[760px] scroll-mt-24 px-5 pb-24 md:pb-32">
      <Heading center a="Questions, answered." />
      <div className="mt-10 divide-y divide-white/[.06] border-y border-white/[.06]">
        {FAQ.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] text-[#f2efe9] hover:text-white">
              {q}
              <Plus className={cn('h-4 w-4 shrink-0 text-[#8b8880] transition-transform duration-300', open === i && 'rotate-45')} />
            </button>
            <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <p className="overflow-hidden pr-10 text-[14px] leading-relaxed text-[#8b8880]">
                <span className="block pb-5">{a}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ——— CTA + footer ——— */

export function QuarryCta() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 md:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] bg-[#efece6] px-6 py-20 text-center md:py-28">
          <div aria-hidden className="absolute inset-0 opacity-[.5] [background-image:radial-gradient(#d8d3c8_1px,transparent_1.2px)] [background-size:22px_22px] [mask-image:radial-gradient(60%_70%_at_50%_50%,#000,transparent)]" />
          <div className="relative">
            <h2 className="text-[36px] font-medium leading-[1.04] tracking-[-0.04em] md:text-[56px]">
              <span className="text-[#141413]">Ship the next page</span>
              <br />
              <span className="text-[#9a968d]">before the coffee cools.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] text-[#6f6c66]">Every section, every template and the agent bridge, in one plan.</p>
            <QButton variant="dark" className="mt-8">
              Unlock Pro <Lock className="h-3.5 w-3.5" />
            </QButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const COLS: Array<[string, string[]]> = [
  ['Library', ['Free sections', 'All sections', 'UI parts', 'Templates', 'Showcase']],
  ['Tools', ['Agent bridge', 'Palette lab', 'Copy polish', 'Changelog']],
  ['Company', ['Pricing', 'About', 'Guides', 'Contact']],
  ['Legal', ['Licence', 'Privacy', 'Terms', 'Refunds']],
];

export function QuarryFooter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <footer className="mx-auto max-w-[1240px] px-5 pb-10 pt-20 md:px-8">
      <div className="grid gap-10 md:grid-cols-[repeat(4,1fr)_1.6fr]">
        {COLS.map(([h, links]) => (
          <div key={h}>
            <p className="text-[12.5px] text-[#f2efe9]">{h}</p>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-[13px] text-[#8b8880] transition-colors hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-[12.5px] text-[#f2efe9]">One free section, every Thursday</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#8b8880]">A finished section with full source in your inbox. One email a week, unsubscribe in one click.</p>
          {done ? (
            <p className="mt-4 flex h-11 items-center gap-2 text-[13px] text-[#c8d5b9]">
              <Check className="h-4 w-4" /> You’re in. See you Thursday.
            </p>
          ) : (
            <form
              className="mt-4 flex h-11 rounded-xl border border-white/[.08] bg-white/[.02] p-1 focus-within:border-white/20"
              onSubmit={(e) => {
                e.preventDefault();
                if (/\S+@\S+\.\S+/.test(email)) setDone(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white placeholder:text-[#6f6c66] focus:outline-none"
              />
              <button className="flex items-center gap-1 rounded-lg bg-[#f2efe9] px-3 text-[12.5px] font-medium text-[#141413] hover:bg-white">
                Subscribe <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="mt-16 flex flex-col gap-3 border-t border-white/[.06] pt-6 text-[12px] text-[#6f6c66] sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 text-[#cfcbc3]">
          <QuarryMark className="h-5 w-5" /> quarry
        </span>
        <span>Pages that feel finished.</span>
        <span className="sm:ml-auto">Made with care in Lisbon · © 2026</span>
      </div>
      <p aria-hidden className="mt-10 select-none text-center text-[22vw] font-semibold leading-[.8] tracking-[-0.06em] text-white/[.03] md:text-[200px]">
        quarry
      </p>
    </footer>
  );
}
