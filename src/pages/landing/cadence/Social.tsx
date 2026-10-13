import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { NetworkBadge, type NetworkId } from './logos';
import { Avatar, PEOPLE, SectionHeading } from './shared';

type Quote = { who: (typeof PEOPLE)[keyof typeof PEOPLE]; text: string; net: NetworkId };

const QUOTES: Quote[] = [
  { who: PEOPLE.maya, net: 'instagram', text: 'We went from scrambling every morning to having a full month planned. Our reach is up 41% and my team finally takes lunch breaks.' },
  { who: PEOPLE.daniel, net: 'x', text: 'The per-network previews are unreal. I catch truncated captions before they go live, not after.' },
  { who: PEOPLE.amara, net: 'tiktok', text: 'Best-time scheduling alone paid for Cadence in week one. It just knows when our people scroll.' },
  { who: PEOPLE.theo, net: 'linkedin', text: 'Approvals used to live in Slack threads and prayers. Now clients sign off in two clicks.' },
  { who: PEOPLE.jonah, net: 'youtube', text: 'Clean, fast, calm. It is the only tool in our stack people actually open voluntarily.' },
  { who: PEOPLE.lena, net: 'facebook', text: 'We manage 34 brands on Cadence. The workspace switching and reports are worth every penny.' },
  { who: PEOPLE.kofi, net: 'instagram', text: 'AI rewrite gets the tone right for each network. I edit less and post more.' },
  { who: PEOPLE.zara, net: 'linkedin', text: 'Analytics our CMO can read in thirty seconds. That alone changed how we get budget.' },
];

function QuoteCard({ q }: { q: Quote }) {
  return (
    <figure className="w-[320px] shrink-0 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(28,25,23,0.3)] sm:w-[380px]">
      <div className="flex items-center justify-between">
        <span className="flex text-amber-500">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </span>
        <NetworkBadge id={q.net} size="xs" variant="soft" />
      </div>
      <blockquote className="mt-4 text-[15px] leading-relaxed text-stone-800">“{q.text}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar src={q.who.img} name={q.who.name} className="h-10 w-10 ring-0" />
        <div className="leading-tight">
          <div className="text-sm font-medium text-stone-900">{q.who.name}</div>
          <div className="text-xs text-stone-500">{q.who.role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const a = QUOTES.slice(0, 4);
  const b = QUOTES.slice(4);
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Loved by teams"
          title="The social team's"
          accent="favorite tool."
          body="18,000+ creators, brands and agencies schedule over 2 million posts a month with Cadence."
        />
      </div>
      <div className="group mt-16 space-y-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {[a, b].map((row, ri) => (
          <div key={ri} className="flex overflow-hidden">
            <div
              className={cn('flex w-max animate-marquee gap-4 pr-4 group-hover:[animation-play-state:paused]', ri === 1 && '[animation-direction:reverse]')}
              style={{ animationDuration: ri === 0 ? '60s' : '70s' }}
            >
              {[...row, ...row, ...row, ...row].map((q, i) => (
                <QuoteCard key={`${q.who.name}-${i}`} q={q} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: 'Creator',
    monthly: 15,
    yearly: 12,
    blurb: 'For solo creators finding their rhythm.',
    features: ['3 social profiles', 'Unlimited scheduled posts', 'AI captions (100/mo)', 'Best-time suggestions', 'Basic analytics'],
  },
  {
    name: 'Team',
    monthly: 49,
    yearly: 39,
    blurb: 'For brands growing across every network.',
    features: ['15 social profiles', 'Everything in Creator', 'Unlimited AI rewrites', 'Approval workflows', 'Advanced analytics & reports', '5 team seats'],
    featured: true,
  },
  {
    name: 'Agency',
    monthly: 129,
    yearly: 103,
    blurb: 'For agencies running many brands at once.',
    features: ['50 social profiles', 'Everything in Team', 'Client workspaces', 'White-label reports', 'Unlimited seats', 'Priority support & SSO'],
  },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="scroll-mt-20 bg-[#F4F1EA] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans."
          accent="Serious results."
          body="Start free for 14 days. No credit card, cancel anytime, and switch plans whenever your rhythm changes."
        />
        <Reveal delay={200}>
          <div className="mt-10 flex justify-center">
            <div className="relative flex rounded-full bg-white p-1 shadow-sm ring-1 ring-stone-200">
              <span
                className={cn(
                  'absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-stone-900 transition-transform duration-500 ease-spring',
                  yearly ? 'translate-x-full' : 'translate-x-0',
                )}
              />
              {[false, true].map((y) => (
                <button
                  key={String(y)}
                  type="button"
                  onClick={() => setYearly(y)}
                  className={cn('relative z-10 w-32 rounded-full py-2 text-sm font-medium transition-colors duration-300', yearly === y ? 'text-white' : 'text-stone-600')}
                >
                  {y ? 'Yearly' : 'Monthly'}
                  {y && <span className={cn('ml-1.5 text-[11px]', yearly ? 'text-[#FFB39F]' : 'text-[#FF5A36]')}>−20%</span>}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => {
            const price = yearly ? p.yearly : p.monthly;
            return (
              <Reveal key={p.name} delay={i * 100} className="h-full">
                <div
                  className={cn(
                    'relative flex h-full flex-col rounded-3xl p-6 transition-all duration-500 ease-spring hover:-translate-y-1.5 sm:p-8',
                    p.featured
                      ? 'bg-stone-900 text-white shadow-[0_40px_80px_-32px_rgba(255,90,54,0.55)]'
                      : 'border border-stone-200 bg-white text-stone-900 hover:shadow-[0_24px_48px_-24px_rgba(28,25,23,0.3)]',
                  )}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-8 rounded-full bg-[#FF5A36] px-3 py-1 text-[11px] font-medium text-white shadow-[0_8px_16px_-6px_rgba(255,90,54,0.8)]">
                      Most popular
                    </span>
                  )}
                  <div className="text-lg font-medium">{p.name}</div>
                  <p className={cn('mt-1 text-sm', p.featured ? 'text-stone-400' : 'text-stone-500')}>{p.blurb}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-2xl font-medium">$</span>
                    <span className="relative inline-flex h-14 overflow-hidden">
                      <span key={price} className="cad-roll text-5xl font-medium tabular-nums tracking-tight">{price}</span>
                    </span>
                    <span className={cn('mb-1.5 text-sm', p.featured ? 'text-stone-400' : 'text-stone-500')}>/ month</span>
                  </div>
                  <div className={cn('mt-1 h-5 text-xs', p.featured ? 'text-stone-400' : 'text-stone-500')}>
                    {yearly ? `Billed $${price * 12} yearly` : 'Billed monthly'}
                  </div>
                  <button
                    type="button"
                    className={cn(
                      'mt-6 rounded-full py-3 text-sm font-medium transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.98]',
                      p.featured ? 'bg-[#FF5A36] text-white hover:bg-[#ff6e4f]' : 'bg-stone-900 text-white hover:bg-[#FF5A36]',
                    )}
                  >
                    Start 14-day trial
                  </button>
                  <ul className="mt-8 space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full', p.featured ? 'bg-[#FF5A36]' : 'bg-emerald-100')}>
                          <Check className={cn('h-2.5 w-2.5', p.featured ? 'text-white' : 'text-emerald-700')} strokeWidth={3} />
                        </span>
                        <span className={p.featured ? 'text-stone-300' : 'text-stone-700'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
