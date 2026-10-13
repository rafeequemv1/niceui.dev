import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { NetworkBadge, networks } from './logos';
import { CadenceLogo } from './Hero';
import { PrimaryButton, SectionHeading, scrollToId } from './shared';

const FAQS = [
  { q: 'Which networks does Cadence support?', a: 'Instagram (feed, Reels, Stories), X, LinkedIn profiles and pages, TikTok, Facebook pages and groups, and YouTube including Shorts. We publish natively through each official API.' },
  { q: 'Do I need a credit card to start?', a: 'No. Every plan starts with a 14-day free trial with all features unlocked. Add a card only when you decide to stay.' },
  { q: 'How does best-time scheduling work?', a: 'Cadence analyzes up to 90 days of engagement for each connected profile and builds an hourly activity model. New posts are auto-slotted into the strongest open windows — you can always override.' },
  { q: 'Can clients approve posts without an account?', a: 'Yes. Share a secure approval link and clients can comment, request changes or approve without signing up. Every action is logged.' },
  { q: 'Is the AI rewrite trained on my content?', a: 'Never without permission. Rewrites use your brand voice settings and the post itself. Your content is not used to train shared models.' },
  { q: 'Can I switch or cancel my plan anytime?', a: 'Absolutely. Upgrade, downgrade or cancel from settings in a couple of clicks. Yearly plans are prorated when you switch.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <SectionHeading
          align="left"
          eyebrow="FAQ"
          title="Questions,"
          accent="answered."
          body="Can't find what you're looking for? Our team replies in under two hours, every day of the week."
        />
        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-base font-medium text-stone-900 transition-colors group-hover:text-[#FF5A36] sm:text-lg">{f.q}</span>
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-spring',
                      isOpen ? 'rotate-45 border-[#FF5A36] bg-[#FF5A36] text-white' : 'border-stone-300 text-stone-600 group-hover:border-stone-900',
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <div className={cn('grid transition-all duration-500 ease-smooth', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-base leading-relaxed text-stone-600">{f.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-[#FF5A36] px-6 py-16 text-center text-white sm:px-12 sm:py-24">
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-blob bg-amber-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 animate-blob bg-rose-400/40 blur-3xl [animation-delay:-5s]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="relative">
            <div className="flex justify-center -space-x-2">
              {networks.map((n, i) => (
                <span key={n.id} className="animate-float rounded-2xl bg-white p-1 shadow-lg" style={{ animationDelay: `${i * 200}ms` }}>
                  <NetworkBadge id={n.id} size="md" />
                </span>
              ))}
            </div>
            <h2 className="mx-auto mt-8 max-w-3xl text-4xl font-medium leading-[1.1] tracking-[-0.035em] sm:text-6xl">
              Find your rhythm. <span className="font-serif font-normal italic tracking-normal">Keep it.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-white/85">
              Join 18,000+ creators and teams who plan less, post better and grow faster with Cadence.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton onClick={() => scrollToId('pricing')} className="bg-white text-stone-900 hover:bg-stone-900 hover:text-white">
                Start free for 14 days <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </PrimaryButton>
              <button type="button" className="rounded-full px-6 py-3 text-sm font-medium text-white ring-1 ring-white/40 transition-all hover:bg-white/10 hover:ring-white">
                Book a demo
              </button>
            </div>
            <p className="mt-4 text-xs text-white/75">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FOOTER = [
  { title: 'Product', links: [['Composer', 'composer'], ['Scheduling', 'scheduling'], ['Analytics', 'analytics'], ['Workflow', 'workflow'], ['Pricing', 'pricing']] },
  { title: 'Company', links: [['About', ''], ['Careers', ''], ['Press', ''], ['Contact', '']] },
  { title: 'Resources', links: [['Blog', ''], ['Guides', ''], ['Help center', ''], ['FAQ', 'faq']] },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  return (
    <footer className="border-t border-stone-200 bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <CadenceLogo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-600">
              The calm command center for social media. Plan, publish and grow — everywhere your audience is.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes('@')) setJoined(true);
              }}
              className="mt-6 flex max-w-sm gap-2"
            >
              <label htmlFor="cad-email" className="sr-only">Email</label>
              <input
                id="cad-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"
              />
              <button type="submit" className="rounded-full bg-stone-900 px-4 text-sm font-medium text-white transition-colors hover:bg-[#FF5A36]">
                {joined ? 'Joined' : 'Subscribe'}
              </button>
            </form>
            <div className="mt-6 flex gap-2">
              {networks.map((n) => (
                <span key={n.id} className="transition-transform duration-300 ease-spring hover:-translate-y-1">
                  <NetworkBadge id={n.id} size="sm" variant="soft" />
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER.map((col) => (
              <div key={col.title}>
                <div className="text-sm font-medium text-stone-900">{col.title}</div>
                <ul className="mt-4 space-y-3">
                  {col.links.map(([label, id]) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => id && scrollToId(id)}
                        className="text-sm text-stone-600 transition-colors hover:text-[#FF5A36]"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-stone-200 pt-8 text-xs text-stone-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Cadence Labs, Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <button type="button" className="hover:text-stone-900">Privacy</button>
            <button type="button" className="hover:text-stone-900">Terms</button>
            <button type="button" className="hover:text-stone-900">Security</button>
          </div>
        </div>
      </div>
      <div className="pointer-events-none select-none overflow-hidden">
        <div className="mx-auto -mb-[0.22em] max-w-6xl px-4 text-center font-serif text-[22vw] italic leading-none text-stone-900/[0.04] lg:text-[240px]">
          cadence
        </div>
      </div>
    </footer>
  );
}
