import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Minus,
  Plus,
  Sparkles,
  Twitter,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInView } from '@/pages/landing/shared/motion';

/* ─── shared ───────────────────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes mk-cv-spin { to { transform: rotate(360deg); } }
@keyframes mk-cv-beam { 0% { transform: translateX(-120%) skewX(-18deg); } 100% { transform: translateX(260%) skewX(-18deg); } }
@keyframes mk-cv-grid { to { background-position: 0 48px, 48px 0; } }
@keyframes mk-cv-breathe { 50% { opacity: .55; } }
@keyframes mk-cv-pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .mk-cv-anim, .mk-cv-anim * { animation: none !important; transition: none !important; }
}
`;

function Keyframes() {
  return <style>{KEYFRAMES}</style>;
}

function Accent({ children }: { children: ReactNode }) {
  return <em className="font-serif font-normal italic text-brand-300">{children}</em>;
}

/** Smoothly tweens a number whenever `value` changes. */
function useTween(value: number, duration = 650) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const v = a + (value - a) * eased;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(loop);
      else from.current = value;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, duration]);
  return display;
}

/** Digits that roll vertically when the number changes. */
function RollingNumber({ value, className }: { value: number; className?: string }) {
  const chars = String(value).split('');
  return (
    <span className={cn('inline-flex overflow-hidden tabular-nums', className)} aria-label={String(value)}>
      {chars.map((c, i) => (
        <span key={chars.length - i} className="relative inline-block h-[1em] w-[0.62em] leading-none">
          <span
            className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-700 ease-smooth"
            style={{ transform: `translateY(-${Number(c) * 10}%)` }}
            aria-hidden
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="block h-[1em] text-center leading-none">
                {d}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

function SectionHead({ eyebrow, title, body, center = true }: { eyebrow?: string; title: ReactNode; body?: string; center?: boolean }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.02] px-3 py-1 font-mono text-[11px] text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_10px_#7dd3fc]" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-5 text-4xl font-medium leading-[1.04] tracking-[-0.05em] text-ink-50 sm:text-5xl">{title}</h2>
      {body && <p className={cn('mt-4 text-[15px] leading-relaxed text-ink-400', center && 'mx-auto max-w-lg')}>{body}</p>}
    </div>
  );
}

function Segmented<T extends string>({ options, value, onChange, chip }: { options: T[]; value: T; onChange: (v: T) => void; chip?: { on: T; label: string } }) {
  const idx = options.indexOf(value);
  return (
    <div className="relative inline-flex rounded-full border border-white/12 bg-white/[.02] p-[3px] text-[13px]">
      <span
        aria-hidden
        className="absolute bottom-[3px] top-[3px] rounded-full bg-brand-300 shadow-glow transition-all duration-500 ease-spring"
        style={{ left: `calc(${(idx * 100) / options.length}% + 3px)`, width: `calc(${100 / options.length}% - 6px)` }}
      />
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn('relative z-10 flex min-w-[112px] items-center justify-center gap-1.5 rounded-full px-4 py-1.5 transition-colors duration-300', o === value ? 'font-medium text-brand-950' : 'text-ink-400 hover:text-ink-100')}
        >
          {o}
          {chip?.on === o && (
            <span className={cn('rounded-full px-1.5 py-px text-[10px] font-medium transition-colors', o === value ? 'bg-brand-950/15 text-brand-950' : 'bg-brand-300/10 text-brand-300')}>{chip.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── PricingTiers ─────────────────────────────────────────────────── */

export type PricingTier = { name: string; monthly: number; yearly: number; description: string; features: string[]; cta: string; featured?: boolean };

const DEFAULT_TIERS: PricingTier[] = [
  { name: 'Starter', monthly: 0, yearly: 0, description: 'For side projects and experiments.', features: ['3 projects', 'Community support', 'Basic analytics', '1 GB storage'], cta: 'Start free' },
  { name: 'Pro', monthly: 29, yearly: 23, description: 'For growing products and small teams.', features: ['Unlimited projects', 'Priority support', 'Advanced analytics', 'Custom domains', 'Team roles'], cta: 'Upgrade to Pro', featured: true },
  { name: 'Scale', monthly: 79, yearly: 63, description: 'For organisations that need control.', features: ['Everything in Pro', 'SSO and SCIM', 'Audit log', 'Dedicated manager'], cta: 'Contact sales' },
];

export type PricingTiersProps = { tiers?: PricingTier[]; title?: ReactNode; subtitle?: string; className?: string };

export function PricingTiers({ tiers = DEFAULT_TIERS, title, subtitle = 'Start free. Upgrade when you are ready — cancel anytime.', className }: PricingTiersProps) {
  const [period, setPeriod] = useState<'Monthly' | 'Yearly'>('Yearly');
  const yearly = period === 'Yearly';
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-16 sm:px-8', className)}>
      <Keyframes />
      <SectionHead eyebrow="Pricing" title={title ?? <>Simple, <Accent>honest</Accent> pricing.</>} body={subtitle} />
      <div className="mt-8 flex justify-center">
        <Segmented<'Monthly' | 'Yearly'> options={['Monthly', 'Yearly']} value={period} onChange={setPeriod} chip={{ on: 'Yearly', label: '−20%' }} />
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {tiers.map((t) => {
          const price = yearly ? t.yearly : t.monthly;
          const card = (
            <div className={cn('relative flex h-full flex-col rounded-[15px] p-6', t.featured ? 'bg-ink-900' : 'border border-white/10 bg-ink-900/60')}>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-ink-50">{t.name}</span>
                {t.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-300/10 px-2 py-0.5 text-[11px] text-brand-300 ring-1 ring-brand-300/30">
                    <Sparkles className="h-3 w-3" /> Popular
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-end gap-1.5">
                <span className="text-[44px] font-medium leading-none tracking-[-0.05em] text-ink-50">
                  $<RollingNumber value={price} />
                </span>
                <span className="mb-1 text-[13px] text-ink-500">/ mo</span>
              </div>
              <p className="mt-1.5 h-4 text-[12px] text-brand-300/80 transition-opacity duration-300" style={{ opacity: yearly && t.monthly > 0 ? 1 : 0 }}>
                Billed ${t.yearly * 12} yearly · save ${(t.monthly - t.yearly) * 12}
              </p>
              <p className="mt-3 text-[13.5px] text-ink-400">{t.description}</p>
              <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/[.07] pt-6 text-[13.5px] text-ink-300">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className={cn('grid h-4 w-4 place-items-center rounded-full', t.featured ? 'bg-brand-300 text-brand-950' : 'bg-white/[.06] text-brand-300')}>
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={cn(
                  'group mt-8 inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition',
                  t.featured ? 'bg-brand-300 text-brand-950 shadow-glow hover:bg-brand-200' : 'border border-white/15 text-ink-100 hover:border-white/30 hover:bg-white/[.03]',
                )}
              >
                {t.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          );
          return t.featured ? (
            <div key={t.name} className="relative overflow-hidden rounded-2xl p-px shadow-[0_30px_80px_-30px_rgba(56,189,248,.45)] md:-my-3">
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2 [animation:mk-cv-spin_6s_linear_infinite]"
                style={{ background: 'conic-gradient(from 0deg, transparent 0 55%, rgba(125,211,252,.15) 65%, #7dd3fc 80%, #e0f2fe 85%, transparent 92%)' }}
              />
              <div className="relative h-full">{card}</div>
            </div>
          ) : (
            <div key={t.name}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── PricingComparison ────────────────────────────────────────────── */

type Cell = boolean | string;
export type ComparisonGroup = { group: string; rows: { feature: string; values: Cell[] }[] };
export type PricingComparisonProps = { plans?: { name: string; price: string; cta: string; featured?: boolean }[]; groups?: ComparisonGroup[]; className?: string };

const DEFAULT_PLANS = [
  { name: 'Starter', price: '$0', cta: 'Start free' },
  { name: 'Pro', price: '$29', cta: 'Upgrade', featured: true },
  { name: 'Scale', price: '$79', cta: 'Contact sales' },
];
const DEFAULT_GROUPS: ComparisonGroup[] = [
  {
    group: 'Usage',
    rows: [
      { feature: 'Projects', values: ['3', 'Unlimited', 'Unlimited'] },
      { feature: 'Team members', values: ['1', '10', 'Unlimited'] },
      { feature: 'Storage', values: ['1 GB', '100 GB', '1 TB'] },
    ],
  },
  {
    group: 'Features',
    rows: [
      { feature: 'Custom domains', values: [false, true, true] },
      { feature: 'Advanced analytics', values: [false, true, true] },
      { feature: 'Preview deployments', values: [true, true, true] },
      { feature: 'Role-based access', values: [false, true, true] },
    ],
  },
  {
    group: 'Security & support',
    rows: [
      { feature: 'SSO / SAML', values: [false, false, true] },
      { feature: 'Audit log', values: [false, '30 days', '1 year'] },
      { feature: 'Support', values: ['Community', 'Priority', 'Dedicated'] },
    ],
  },
];

export function PricingComparison({ plans = DEFAULT_PLANS, groups = DEFAULT_GROUPS, className }: PricingComparisonProps) {
  const cols = `minmax(180px,1.4fr) repeat(${plans.length}, minmax(130px,1fr))`;
  const featuredIdx = plans.findIndex((p) => p.featured);
  const cell = (v: Cell) =>
    v === true ? (
      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-300/15 text-brand-300">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    ) : v === false ? (
      <Minus className="h-4 w-4 text-ink-600" />
    ) : (
      <span className="text-[13px] text-ink-200">{v}</span>
    );
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <SectionHead eyebrow="Compare plans" title={<>Every feature, <Accent>side by side.</Accent></>} />
      <div className="mx-auto mt-10 max-w-5xl overflow-x-auto rounded-2xl border border-white/10 [scrollbar-width:thin]">
        <div className="relative min-w-[640px]">
          <div className="sticky top-0 z-10 grid border-b border-white/10 bg-ink-950/90 backdrop-blur" style={{ gridTemplateColumns: cols }}>
            <div className="p-5 text-[12px] uppercase tracking-[.14em] text-ink-500">Plans</div>
            {plans.map((p, i) => (
              <div key={p.name} className={cn('p-5', i === featuredIdx && 'relative bg-brand-300/[.05] shadow-[inset_0_2px_0_#7dd3fc]')}>
                <p className="flex items-center gap-2 text-[14px] font-medium text-ink-50">
                  {p.name}
                  {p.featured && <span className="rounded-full bg-brand-300/10 px-1.5 py-px text-[10px] text-brand-300 ring-1 ring-brand-300/30">Popular</span>}
                </p>
                <p className="mt-1 text-2xl font-medium tracking-[-0.04em] text-ink-50">
                  {p.price}
                  <span className="ml-1 text-[12px] font-normal tracking-normal text-ink-500">/mo</span>
                </p>
                <a href="#" className={cn('mt-3 inline-flex h-8 items-center rounded-full px-3.5 text-[12px] font-medium transition', p.featured ? 'bg-brand-300 text-brand-950 shadow-glow hover:bg-brand-200' : 'border border-white/15 text-ink-200 hover:border-white/30')}>
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
          {groups.map((g) => (
            <div key={g.group}>
              <div className="border-b border-white/[.07] bg-white/[.02] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[.14em] text-brand-300/80">{g.group}</div>
              {g.rows.map((r) => (
                <div key={r.feature} className="grid items-center border-b border-white/[.05] transition-colors last:border-b-0 hover:bg-white/[.03]" style={{ gridTemplateColumns: cols }}>
                  <div className="px-5 py-3.5 text-[13.5px] text-ink-300">{r.feature}</div>
                  {r.values.map((v, i) => (
                    <div key={i} className={cn('flex h-full items-center px-5 py-3.5', i === featuredIdx && 'bg-brand-300/[.035]')}>
                      {cell(v)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PricingUsage ─────────────────────────────────────────────────── */

export type PricingUsageProps = { min?: number; max?: number; step?: number; defaultValue?: number; unit?: string; className?: string };

function usagePrice(users: number) {
  if (users <= 1000) return { plan: 'Hobby', price: 0, base: 0, overage: 0 };
  if (users <= 25000) {
    const over = users - 1000;
    return { plan: 'Growth', price: 19 + Math.round(over * 0.002), base: 19, overage: Math.round(over * 0.002) };
  }
  const over = users - 25000;
  return { plan: 'Scale', price: 99 + Math.round(over * 0.0012), base: 99, overage: Math.round(over * 0.0012) };
}

export function PricingUsage({ min = 0, max = 100000, step = 500, defaultValue = 12000, unit = 'monthly active users', className }: PricingUsageProps) {
  const [users, setUsers] = useState(defaultValue);
  const p = usagePrice(users);
  const shown = useTween(p.price);
  const pct = ((users - min) / (max - min)) * 100;
  const marks = [0, 25, 50, 75, 100];
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <div className="mx-auto grid max-w-4xl gap-6 rounded-3xl border border-white/10 bg-ink-900/60 p-6 sm:p-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-500">Pay as you grow</span>
          <h3 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-ink-50">
            Only pay for <Accent>what you use.</Accent>
          </h3>
          <div className="mt-10">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-ink-400">{unit}</span>
              <span className="font-mono text-[15px] text-ink-50">{users.toLocaleString('en-US')}</span>
            </div>
            <div className="relative mt-4 h-6">
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/[.07]" />
              <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-500 to-brand-300 shadow-[0_0_14px_rgba(56,189,248,.6)]" style={{ width: `${pct}%` }} />
              <div
                className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-300 bg-ink-950 shadow-[0_0_0_6px_rgba(125,211,252,.15)]"
                style={{ left: `${pct}%` }}
              />
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={users}
                onChange={(e) => setUsers(Number(e.target.value))}
                aria-label={unit}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10.5px] text-ink-600">
              {marks.map((m) => (
                <span key={m}>{Math.round(((max - min) * m) / 100 / 1000)}k</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-white/10 bg-ink-950/70 p-6">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-400">Estimated</span>
            <span key={p.plan} className="rounded-full bg-brand-300/10 px-2.5 py-0.5 text-[11px] text-brand-300 ring-1 ring-brand-300/30 [animation:mk-cv-pop_.45s_ease-out]">
              {p.plan} plan
            </span>
          </div>
          <p className="mt-4 text-5xl font-medium tabular-nums tracking-[-0.05em] text-ink-50">
            ${Math.round(shown)}
            <span className="ml-1 text-[14px] font-normal tracking-normal text-ink-500">/mo</span>
          </p>
          <dl className="mt-6 space-y-2.5 border-t border-white/[.07] pt-5 text-[13px]">
            <div className="flex justify-between text-ink-400">
              <dt>Base</dt>
              <dd className="font-mono text-ink-200">${p.base}</dd>
            </div>
            <div className="flex justify-between text-ink-400">
              <dt>Usage overage</dt>
              <dd className="font-mono text-ink-200">${p.overage}</dd>
            </div>
            <div className="flex justify-between text-ink-400">
              <dt>First 1,000 users</dt>
              <dd className="font-mono text-brand-300">Free</dd>
            </div>
          </dl>
          <a href="#" className="group mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand-300 pt-0 text-[13px] font-medium text-brand-950 shadow-glow transition hover:bg-brand-200 [margin-top:24px]">
            Get started <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── FaqTwoColumn ─────────────────────────────────────────────────── */

export type FaqItem = { q: string; a: string };
export type FaqTwoColumnProps = { items?: FaqItem[]; title?: ReactNode; className?: string };

const DEFAULT_FAQ: FaqItem[] = [
  { q: 'Is there a free plan?', a: 'Yes. The Starter plan is free forever and includes everything you need to ship a side project. Upgrade only when you outgrow it.' },
  { q: 'Can I change plans later?', a: 'Anytime. Upgrades apply immediately and are prorated; downgrades take effect at the end of your billing period.' },
  { q: 'Do you offer discounts for startups?', a: 'Startups under two years old get 50% off Pro for the first year. Reach out with your company details.' },
  { q: 'How secure is my data?', a: 'Data is encrypted at rest and in transit, backed up daily, and stored in the region you choose. SSO and audit logs are available on Scale.' },
  { q: 'What happens if I exceed my limits?', a: 'Nothing breaks. We notify you at 80% and 100% of your limits and suggest the plan that fits best.' },
];

export function FaqTwoColumn({ items = DEFAULT_FAQ, title, className }: FaqTwoColumnProps) {
  const [open, setOpen] = useState(0);
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="text-4xl font-medium leading-[1.04] tracking-[-0.05em] text-ink-50">{title ?? <>Questions, <Accent>answered.</Accent></>}</h2>
          <p className="mt-4 max-w-xs text-[14.5px] text-ink-400">Everything you need to know. Can’t find an answer? Talk to a human.</p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/60 p-5">
            <div className="flex -space-x-2">
              {['AK', 'MJ', 'RS'].map((n, i) => (
                <span key={n} className={cn('grid h-8 w-8 place-items-center rounded-full border-2 border-ink-900 text-[10px] font-medium', i === 0 ? 'bg-brand-300 text-brand-950' : 'bg-ink-800 text-ink-300')}>
                  {n}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[14px] text-ink-100">Still have questions?</p>
            <p className="mt-1 text-[13px] text-ink-400">Average reply time: under 2 hours.</p>
            <a href="#" className="group mt-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[12.5px] text-ink-100 transition hover:border-brand-300/50">
              <MessageCircle className="h-3.5 w-3.5 text-brand-300" /> Chat with us
            </a>
          </div>
        </div>
        <div className="divide-y divide-white/[.07] border-y border-white/[.07]">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="group flex w-full items-center justify-between gap-6 py-5 text-left">
                  <span className={cn('text-[15.5px] transition-colors', isOpen ? 'text-ink-50' : 'text-ink-200 group-hover:text-ink-50')}>{it.q}</span>
                  <span className={cn('relative grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300', isOpen ? 'border-brand-300/50 bg-brand-300/10' : 'border-white/12')}>
                    <span className={cn('absolute h-px w-3 transition-colors', isOpen ? 'bg-brand-300' : 'bg-ink-300')} />
                    <span className={cn('absolute h-3 w-px transition-all duration-300 ease-smooth', isOpen ? 'rotate-90 scale-y-0 bg-brand-300' : 'bg-ink-300')} />
                  </span>
                </button>
                <div className={cn('grid transition-[grid-template-rows,opacity] duration-500 ease-smooth', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <p className="overflow-hidden pr-12 text-[14px] leading-relaxed text-ink-400">
                    <span className="block pb-5">{it.a}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── CtaHorizon ───────────────────────────────────────────────────── */

export type CtaHorizonProps = { title?: ReactNode; body?: string; primary?: string; secondary?: string; className?: string };

export function CtaHorizon({ title, body = 'Join thousands of teams building faster. Free to start, no credit card required.', primary = 'Start for free', secondary = 'Talk to sales', className }: CtaHorizonProps) {
  return (
    <section className={cn('mk-cv-anim relative w-full overflow-hidden bg-ink-950 px-4 pt-20 text-center sm:px-8', className)}>
      <Keyframes />
      <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,black,transparent)]" />
      <div className="relative">
        <h2 className="mx-auto max-w-2xl text-4xl font-medium leading-[1.02] tracking-[-0.055em] text-ink-50 sm:text-6xl">{title ?? <>Build something <Accent>nice</Accent> today.</>}</h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] text-ink-400">{body}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a href="#" className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-300 px-5 text-sm font-medium text-brand-950 shadow-glow transition hover:bg-brand-200">
            {primary} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href="#" className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-ink-100 transition hover:border-white/30 hover:bg-white/[.03]">
            {secondary}
          </a>
        </div>
      </div>
      <div aria-hidden className="relative mt-16 h-48 [mask-image:linear-gradient(black_50%,transparent)]">
        <div className="absolute left-1/2 top-16 h-[1600px] w-[1600px] -translate-x-1/2 rounded-full border-t border-brand-200/80 bg-ink-950 shadow-[0_-1px_48px_rgba(125,211,252,.5),inset_0_40px_80px_-40px_rgba(125,211,252,.25)]" />
        <div className="absolute left-1/2 top-0 h-48 w-[70%] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_78%,rgba(56,189,248,.34),transparent_70%)] blur-2xl [animation:mk-cv-breathe_7s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}

/* ─── CtaGridBeams ─────────────────────────────────────────────────── */

export type CtaGridBeamsProps = { title?: ReactNode; body?: string; placeholder?: string; button?: string; onSubmit?: (email: string) => void; className?: string };

export function CtaGridBeams({ title, body = 'Product updates, new components and the occasional deep dive. One email a month.', placeholder = 'you@company.com', button = 'Subscribe', onSubmit, className }: CtaGridBeamsProps) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-12 sm:px-8', className)}>
      <Keyframes />
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60 px-6 py-14 text-center sm:px-12">
        <div aria-hidden className="absolute inset-0 opacity-70 [animation:mk-cv-grid_6s_linear_infinite] [background-image:linear-gradient(rgba(125,211,252,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_70%_80%_at_50%_50%,black,transparent)]" />
        {[0, 1.8, 3.4].map((d, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-brand-300/[.13] to-transparent"
            style={{ animation: `mk-cv-beam ${5 + i}s ${d}s ease-in-out infinite`, top: 0 }}
          />
        ))}
        <span aria-hidden className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
        <div className="relative">
          <span className="inline-grid h-11 w-11 place-items-center rounded-xl border border-brand-300/30 bg-brand-300/10 text-brand-300 shadow-glow">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="mx-auto mt-6 max-w-lg text-3xl font-medium leading-[1.05] tracking-[-0.05em] text-ink-50 sm:text-5xl">{title ?? <>Stay in the <Accent>loop.</Accent></>}</h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] text-ink-400">{body}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes('@')) return;
              onSubmit?.(email);
              setDone(true);
            }}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            {done ? (
              <p className="mx-auto inline-flex h-11 items-center gap-2 rounded-full border border-brand-300/30 bg-brand-300/10 px-5 text-[14px] text-brand-200 [animation:mk-cv-pop_.5s_ease-out]">
                <Check className="h-4 w-4" /> You’re in — check your inbox.
              </p>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  aria-label="Email"
                  className="h-11 min-w-0 flex-1 rounded-full border border-white/15 bg-ink-950/80 px-5 text-[14px] text-ink-50 outline-none transition placeholder:text-ink-500 focus:border-brand-300 focus:ring-4 focus:ring-brand-300/10"
                />
                <button type="submit" className="h-11 rounded-full bg-brand-300 px-5 text-[14px] font-medium text-brand-950 shadow-glow transition hover:bg-brand-200">
                  {button}
                </button>
              </>
            )}
          </form>
          <p className="mt-4 text-[12px] text-ink-500">No spam. Unsubscribe with one click.</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Footers ──────────────────────────────────────────────────────── */

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn('h-6 w-6', className)} aria-hidden>
      <circle cx="14" cy="14" r="13" fill="none" stroke="white" strokeOpacity=".22" />
      <path d="M5 17a9 9 0 0 1 18 0" fill="none" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="17" r="2" fill="#7dd3fc" />
    </svg>
  );
}

const SOCIALS = [
  { icon: Github, label: 'GitHub' },
  { icon: Twitter, label: 'X' },
  { icon: Linkedin, label: 'LinkedIn' },
];

export type FooterColumn = { title: string; links: string[] };
export type FooterMegaProps = { brand?: string; columns?: FooterColumn[]; className?: string };

const DEFAULT_COLUMNS: FooterColumn[] = [
  { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Integrations'] },
  { title: 'Developers', links: ['Docs', 'API reference', 'Status', 'Open source'] },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
];

export function FooterMega({ brand = 'niceui', columns = DEFAULT_COLUMNS, className }: FooterMegaProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [joined, setJoined] = useState(false);
  return (
    <footer className={cn('mk-cv-anim w-full overflow-hidden border-t border-white/[.07] bg-ink-950 px-4 pt-14 sm:px-8', className)}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <span className="flex items-center gap-2.5 text-[16px] font-medium tracking-[-0.02em] text-ink-50">
              <Mark /> {brand}
            </span>
            <p className="mt-4 max-w-xs text-[13.5px] text-ink-400">Interfaces, nicely made. Get new components in your inbox once a month.</p>
            {joined ? (
              <p className="mt-5 inline-flex h-10 items-center gap-2 text-[13px] text-brand-300 [animation:mk-cv-pop_.45s_ease-out]">
                <Check className="h-4 w-4" /> Subscribed — thank you.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setJoined(true);
                }}
                className="mt-5 flex max-w-sm items-center gap-1 rounded-full border border-white/12 bg-ink-900/60 p-1 transition focus-within:border-brand-300/60"
              >
                <input required type="email" placeholder="Email address" aria-label="Email" className="h-8 min-w-0 flex-1 bg-transparent px-3 text-[13px] text-ink-50 outline-none placeholder:text-ink-500" />
                <button className="h-8 rounded-full bg-brand-300 px-3.5 text-[12.5px] font-medium text-brand-950 transition hover:bg-brand-200">Join</button>
              </form>
            )}
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a key={label} href="#" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-ink-400 transition hover:-translate-y-0.5 hover:border-brand-300/40 hover:text-brand-300">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="text-[13px] font-medium text-ink-100">{c.title}</p>
                <ul className="mt-4 space-y-2.5 text-[13px]">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="group inline-flex items-center gap-1 text-ink-500 transition-colors hover:text-ink-100">
                        {l}
                        <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/[.07] py-5 text-[12px] text-ink-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {brand}. All rights reserved.</span>
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            All systems normal
          </span>
        </div>
      </div>
      <div ref={ref} className="group relative -mb-[0.18em] select-none text-center" aria-hidden>
        <span
          className="block text-[clamp(72px,19vw,260px)] font-semibold leading-[.85] tracking-[-0.07em] text-transparent transition-all duration-[1400ms] ease-smooth"
          style={{
            WebkitTextStroke: '1px rgba(125,211,252,.35)',
            backgroundImage: 'linear-gradient(180deg, #e0f2fe 0%, #7dd3fc 45%, rgba(14,165,233,0) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            backgroundSize: '100% 200%',
            backgroundPosition: inView ? '0 0%' : '0 100%',
            opacity: inView ? 1 : 0.35,
            transform: inView ? 'translateY(0)' : 'translateY(18%)',
          }}
        >
          {brand}
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950 to-transparent transition-opacity duration-700 group-hover:opacity-40" />
      </div>
    </footer>
  );
}

export type FooterMinimalProps = { brand?: string; links?: string[]; className?: string };

export function FooterMinimal({ brand = 'niceui', links = ['Product', 'Pricing', 'Docs', 'Blog', 'Careers'], className }: FooterMinimalProps) {
  return (
    <footer className={cn('relative w-full bg-ink-950 px-4 sm:px-8', className)}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/50 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 py-8 md:flex-row md:justify-between">
        <span className="flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.02em] text-ink-50">
          <Mark className="h-5 w-5" /> {brand}
        </span>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-ink-400">
          {links.map((l) => (
            <a key={l} href="#" className="relative transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-brand-300 after:transition-all after:duration-300 hover:text-ink-50 hover:after:w-full">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="grid h-8 w-8 place-items-center rounded-full text-ink-500 transition hover:bg-white/5 hover:text-brand-300">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <span className="text-[12px] text-ink-600">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Changelog ────────────────────────────────────────────────────── */

type ChangeTag = 'New' | 'Improved' | 'Fixed';
export type Release = { version: string; date: string; tags: ChangeTag[]; title: string; body: string; visual?: 'chart' | 'ui' | 'code' };
export type ChangelogProps = { releases?: Release[]; className?: string };

const DEFAULT_RELEASES: Release[] = [
  { version: 'v2.6', date: 'Oct 24, 2026', tags: ['New'], title: 'Agent workflows', body: 'Run multiple agents in parallel with a shared queue, live progress and token budgets per run.', visual: 'ui' },
  { version: 'v2.5', date: 'Oct 10, 2026', tags: ['Improved', 'Fixed'], title: 'Faster previews', body: 'Preview builds are 3× faster thanks to incremental bundling. Fixed a flicker when switching themes.', visual: 'chart' },
  { version: 'v2.4', date: 'Sep 26, 2026', tags: ['New', 'Improved'], title: 'Registry v2', body: 'Install any component with one command, including its dependencies and Tailwind tokens.', visual: 'code' },
  { version: 'v2.3', date: 'Sep 12, 2026', tags: ['Fixed'], title: 'Accessibility pass', body: 'Focus rings, reduced motion and screen-reader labels across 40 components.' },
];

const TAG_STYLE: Record<ChangeTag, string> = {
  New: 'bg-brand-300/10 text-brand-300 ring-brand-300/30',
  Improved: 'bg-violet-400/10 text-violet-300 ring-violet-300/30',
  Fixed: 'bg-emerald-400/10 text-emerald-300 ring-emerald-300/30',
};

function ReleaseVisual({ kind }: { kind: NonNullable<Release['visual']> }) {
  if (kind === 'chart')
    return (
      <div className="flex h-20 items-end gap-1.5 rounded-xl border border-white/10 bg-ink-950/60 p-3">
        {[38, 52, 44, 66, 58, 80, 92].map((h, i) => (
          <span key={i} className="flex-1 rounded-sm bg-gradient-to-t from-brand-500/30 to-brand-300" style={{ height: `${h}%` }} />
        ))}
      </div>
    );
  if (kind === 'code')
    return (
      <div className="rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 font-mono text-[12px] text-ink-300">
        <span className="text-brand-300">$</span> npx shadcn add @niceui/pricing-tiers
      </div>
    );
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-ink-950/60 p-3">
      {[82, 54, 27].map((p, i) => (
        <div key={i} className="rounded-lg border border-white/10 p-2">
          <div className="h-1.5 w-2/3 rounded bg-white/10" />
          <div className="mt-2 h-1 rounded-full bg-white/[.06]">
            <div className="h-full rounded-full bg-brand-300" style={{ width: `${p}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReleaseRow({ r }: { r: Release }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  return (
    <div ref={ref} className="relative grid gap-3 pb-12 pl-8 md:grid-cols-[140px_1fr] md:gap-8 md:pl-0">
      <div className="md:pt-0.5 md:text-right">
        <p className="font-mono text-[13px] text-ink-100">{r.version}</p>
        <p className="mt-0.5 text-[12px] text-ink-500">{r.date}</p>
      </div>
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 transition-all duration-700 md:left-[159px]',
          inView ? 'border-brand-300 bg-brand-300 shadow-[0_0_0_5px_rgba(125,211,252,.12),0_0_14px_#7dd3fc]' : 'border-ink-600 bg-ink-950',
        )}
      />
      <div className={cn('transition-all duration-700 ease-smooth md:pl-10', inView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')}>
        <div className="flex flex-wrap gap-1.5">
          {r.tags.map((t) => (
            <span key={t} className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1', TAG_STYLE[t])}>
              {t}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-xl font-medium tracking-[-0.03em] text-ink-50">{r.title}</h3>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-ink-400">{r.body}</p>
        {r.visual && (
          <div className="mt-4 max-w-md">
            <ReleaseVisual kind={r.visual} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Changelog({ releases = DEFAULT_RELEASES, className }: ChangelogProps) {
  const [filter, setFilter] = useState<'All' | ChangeTag>('All');
  const shown = useMemo(() => (filter === 'All' ? releases : releases.filter((r) => r.tags.includes(filter))), [filter, releases]);
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead center={false} eyebrow="Changelog" title={<>What’s <Accent>new.</Accent></>} />
          <div className="flex gap-1.5">
            {(['All', 'New', 'Improved', 'Fixed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn('rounded-full px-3 py-1.5 text-[12.5px] transition', filter === t ? 'bg-white/10 text-ink-50' : 'text-ink-500 hover:text-ink-200')}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-12">
          <span aria-hidden className="absolute bottom-0 left-[5px] top-2 w-px bg-gradient-to-b from-brand-300/50 via-white/10 to-transparent md:left-[164px]" />
          {shown.map((r) => (
            <ReleaseRow key={r.version + filter} r={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TeamGrid ─────────────────────────────────────────────────────── */

export type TeamMember = { name: string; role: string; bio: string; hue?: number };
export type TeamGridProps = { members?: TeamMember[]; hiring?: boolean; className?: string };

const DEFAULT_TEAM: TeamMember[] = [
  { name: 'Ada King', role: 'Co-founder, Design', bio: 'Previously led design systems at a fintech unicorn. Obsessed with motion curves.', hue: 199 },
  { name: 'Raj Shah', role: 'Co-founder, Engineering', bio: 'Built rendering engines for a decade. Thinks in frames per second.', hue: 222 },
  { name: 'Mia Jones', role: 'Product Engineer', bio: 'Ships accessible components and writes the docs nobody else wants to.', hue: 185 },
  { name: 'Leo Park', role: 'Developer Relations', bio: 'Runs the community, the newsletter and the occasional livestream.', hue: 245 },
  { name: 'Noa Ito', role: 'Brand Designer', bio: 'Draws every icon and illustration by hand before it becomes a vector.', hue: 170 },
];

export function TeamGrid({ members = DEFAULT_TEAM, hiring = true, className }: TeamGridProps) {
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <SectionHead eyebrow="Team" title={<>The people <Accent>behind it.</Accent></>} body="A small, senior team that sweats the details." />
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3">
        {members.map((m) => {
          const initials = m.name.split(' ').map((p) => p[0]).join('');
          const h = m.hue ?? 199;
          return (
            <article key={m.name} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
              <div
                className="absolute inset-0 transition-transform duration-700 ease-smooth group-hover:scale-105"
                style={{ background: `radial-gradient(120% 80% at 30% 15%, hsl(${h} 90% 70% / .35), transparent 60%), radial-gradient(90% 70% at 90% 100%, hsl(${h + 30} 80% 55% / .25), transparent 60%), #0b0c0e` }}
              />
              <span className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 text-[clamp(44px,8vw,72px)] font-medium tracking-[-0.06em] text-white/85 transition-all duration-700 ease-smooth group-hover:top-[28%] group-hover:scale-90">
                {initials}
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent p-4 pt-16">
                <p className="text-[14.5px] font-medium text-ink-50">{m.name}</p>
                <p className="text-[12.5px] text-brand-300/90">{m.role}</p>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-smooth group-hover:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pt-2 text-[12.5px] leading-relaxed text-ink-300">{m.bio}</p>
                    <div className="mt-3 flex gap-1.5">
                      {SOCIALS.map(({ icon: Icon, label }) => (
                        <a key={label} href="#" aria-label={`${m.name} on ${label}`} className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-ink-300 transition hover:border-brand-300/50 hover:text-brand-300">
                          <Icon className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {hiring && (
          <a href="#" className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-brand-300/30 bg-brand-300/[.03] p-5 transition hover:border-brand-300/60 hover:bg-brand-300/[.06]">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-brand-300/30 text-brand-300 transition-transform duration-500 group-hover:rotate-90">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[17px] font-medium tracking-[-0.02em] text-ink-50">We’re hiring</p>
              <p className="mt-1 text-[13px] text-ink-400">3 open roles · Remote</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] text-brand-300">
                See openings <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </a>
        )}
      </div>
    </section>
  );
}

/* ─── BlogCards ────────────────────────────────────────────────────── */

export type BlogPost = { title: string; excerpt: string; category: string; readTime: string; author: string; date: string; hue?: number };
export type BlogCardsProps = { posts?: BlogPost[]; className?: string };

const DEFAULT_POSTS: BlogPost[] = [
  { title: 'Designing motion that feels inevitable', excerpt: 'Springs, easing and timing — the small decisions that make an interface feel alive rather than animated.', category: 'Design', readTime: '8 min', author: 'Ada King', date: 'Oct 21', hue: 199 },
  { title: 'Shipping AI interfaces people trust', excerpt: 'Streaming, citations and approvals: patterns that keep humans in control.', category: 'AI', readTime: '6 min', author: 'Raj Shah', date: 'Oct 14', hue: 260 },
  { title: 'A component registry in 200 lines', excerpt: 'How we serve installable components with nothing but static JSON.', category: 'Engineering', readTime: '5 min', author: 'Mia Jones', date: 'Oct 7', hue: 170 },
  { title: 'Dark mode is a design system problem', excerpt: 'Why inverting colours is never enough, and what to do instead.', category: 'Design', readTime: '7 min', author: 'Noa Ito', date: 'Sep 30', hue: 215 },
];

function Cover({ hue = 199, seed = 0 }: { hue?: number; seed?: number }) {
  return (
    <div
      className="absolute inset-0 transition-transform duration-700 ease-smooth group-hover:scale-[1.06]"
      style={{
        background: `radial-gradient(60% 80% at ${20 + seed * 23}% 20%, hsl(${hue} 95% 70% / .55), transparent 60%), radial-gradient(70% 70% at ${80 - seed * 11}% 90%, hsl(${hue + 40} 85% 55% / .45), transparent 65%), conic-gradient(from ${seed * 60}deg at 70% 40%, #0b0c0e, hsl(${hue} 60% 18%), #0b0c0e)`,
      }}
    >
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(180deg,black,transparent)]" />
    </div>
  );
}

function Meta({ p }: { p: BlogPost }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-ink-500">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-300/15 text-[9px] font-medium text-brand-200">{p.author.split(' ').map((x) => x[0]).join('')}</span>
      {p.author}
      <span className="text-ink-700">·</span>
      {p.date}
      <span className="text-ink-700">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" /> {p.readTime}
      </span>
    </div>
  );
}

export function BlogCards({ posts = DEFAULT_POSTS, className }: BlogCardsProps) {
  const [featured, ...rest] = posts;
  return (
    <section className={cn('mk-cv-anim w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead center={false} eyebrow="Journal" title={<>Notes from the <Accent>studio.</Accent></>} />
          <a href="#" className="group inline-flex items-center gap-1 text-[13px] text-ink-300 hover:text-ink-50">
            All posts <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        {featured && (
          <a href="#" className="group mt-10 grid overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 transition hover:border-white/20 md:grid-cols-[1.3fr_1fr]">
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[300px]">
              <Cover hue={featured.hue} seed={0} />
              <span className="absolute left-4 top-4 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] text-ink-100 ring-1 ring-white/15 backdrop-blur">Featured · {featured.category}</span>
            </div>
            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
              <div>
                <h3 className="text-2xl font-medium leading-tight tracking-[-0.035em] text-ink-50 transition-colors group-hover:text-brand-100">{featured.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-400">{featured.excerpt}</p>
              </div>
              <div className="flex items-center justify-between">
                <Meta p={featured} />
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-ink-300 transition-all duration-300 group-hover:border-brand-300/50 group-hover:bg-brand-300 group-hover:text-brand-950">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </div>
            </div>
          </a>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <a key={p.title} href="#" className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 transition hover:-translate-y-0.5 hover:border-white/20">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Cover hue={p.hue} seed={i + 1} />
                <span className="absolute left-3 top-3 rounded-full bg-ink-950/70 px-2 py-0.5 text-[11px] text-ink-100 ring-1 ring-white/15 backdrop-blur">{p.category}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[16px] font-medium leading-snug tracking-[-0.02em] text-ink-50">{p.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-400">{p.excerpt}</p>
                <div className="mt-5 flex items-center justify-between">
                  <Meta p={p} />
                  <ArrowRight className="h-4 w-4 -translate-x-2 text-brand-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── demos ────────────────────────────────────────────────────────── */

export const PricingTiersDemo = () => <PricingTiers />;
export const PricingComparisonDemo = () => <PricingComparison />;
export const PricingUsageDemo = () => <PricingUsage />;
export const FaqTwoColumnDemo = () => <FaqTwoColumn />;
export const CtaHorizonDemo = () => <CtaHorizon />;
export const CtaGridBeamsDemo = () => <CtaGridBeams />;
export const FooterMegaDemo = () => <FooterMega />;
export const FooterMinimalDemo = () => (
  <div className="w-full pt-24">
    <FooterMinimal />
  </div>
);
export const ChangelogDemo = () => <Changelog />;
export const TeamGridDemo = () => <TeamGrid />;
export const BlogCardsDemo = () => <BlogCards />;
