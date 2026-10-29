import { type ReactNode, useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  Copy,
  GitPullRequest,
  Globe,
  Plug,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useCountUp, useInView } from './shared/motion';
import { AgentTerminal, DiffSuggestion, McpToolPicker, NetworkPulse, ParallelAgents, agentsDemo, diffDemoProps, terminalDemoProps, toolDemo } from '@/components/ai/AgentWorkflow';

type PageProps = { onNavigate?: (to: string) => void };

/* ─── frame primitives ─────────────────────────────────────────────── */

function Cross({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none absolute z-10 h-3 w-3', className)}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/25" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
    </span>
  );
}

function Band({ children, className, crosses = true }: { children: ReactNode; className?: string; crosses?: boolean }) {
  return (
    <section className={cn('relative border-t border-white/[.07]', className)}>
      {crosses && (
        <>
          <Cross className="-left-1.5 -top-1.5" />
          <Cross className="-right-1.5 -top-1.5" />
        </>
      )}
      {children}
    </section>
  );
}

function Eyebrow({ icon: Icon = Sparkles, children }: { icon?: typeof Sparkles; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.02] px-3 py-1 font-mono text-[11px] text-ink-400">
      <Icon className="h-3 w-3 text-brand-300" />
      {children}
    </span>
  );
}

function Accent({ children }: { children: ReactNode }) {
  return <em className="font-serif font-normal italic text-brand-300">{children}</em>;
}

/** Sky-tinted dot field used as a section divider. */
function Grain() {
  return (
    <div
      aria-hidden
      className="h-10 border-t border-white/[.07] opacity-70 [animation:ns-grain_14s_linear_infinite]"
      style={{
        backgroundImage:
          'radial-gradient(rgba(125,211,252,.55) 1px, transparent 1.3px), radial-gradient(rgba(255,255,255,.25) 1px, transparent 1.3px)',
        backgroundSize: '7px 7px, 11px 11px',
        backgroundPosition: '0 0, 3px 4px',
        maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
      }}
    />
  );
}

/* ─── nav + hero ───────────────────────────────────────────────────── */

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[15px] font-medium tracking-[-0.02em] text-ink-50">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M12 2v20M2 12h20" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 5l14 14M19 5 5 19" stroke="white" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.4" fill="#7dd3fc" />
      </svg>
      northstar
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-ink-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-[13px] text-ink-400 md:flex">
          {['Product', 'Agents', 'Integrations', 'Pricing', 'Docs'].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-ink-50">
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#" className="hidden px-3 text-[13px] text-ink-300 hover:text-ink-50 sm:block">
            Sign in
          </a>
          <a href="#" className="inline-flex h-8 items-center rounded-full bg-brand-300 px-3.5 text-[13px] font-medium text-brand-950 shadow-glow transition hover:bg-brand-200">
            Start building
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="relative px-6 pb-0 pt-24 text-center sm:pt-28">
        <Reveal>
          <Eyebrow icon={Bot}>Multi-agent runs are here</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mx-auto mt-7 max-w-3xl text-[44px] font-medium leading-[1] tracking-[-0.055em] text-ink-50 sm:text-7xl">
            Your frontend, <Accent>shipped</Accent> by agents.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-ink-400">
            Northstar turns a ticket into a reviewed, tested pull request — components, styles and stories included. You stay the editor, not the typist.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-300 px-5 text-sm font-medium text-brand-950 shadow-glow transition hover:bg-brand-200">
              Start for free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <button
              onClick={() => {
                navigator.clipboard?.writeText('npx northstar init');
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}
              className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/15 px-4 font-mono text-[13px] text-ink-200 transition hover:border-brand-300/50"
            >
              <span className="text-brand-300">$</span> npx northstar init
              {copied ? <Check className="h-3.5 w-3.5 text-brand-300" /> : <Copy className="h-3.5 w-3.5 text-ink-500" />}
            </button>
          </div>
        </Reveal>
      </div>
      <div aria-hidden className="relative mt-14 h-56 [mask-image:linear-gradient(black_50%,transparent)]">
        <div className="absolute left-1/2 top-20 h-[1800px] w-[1800px] -translate-x-1/2 rounded-full border-t border-brand-200/80 bg-ink-950 shadow-[0_-1px_48px_rgba(125,211,252,.5),inset_0_40px_80px_-40px_rgba(125,211,252,.25)]" />
        <div className="absolute left-1/2 top-0 h-56 w-[70%] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_75%,rgba(56,189,248,.32),transparent_70%)] blur-2xl [animation:ns-breathe_7s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

/* ─── feature tabs ─────────────────────────────────────────────────── */

const TABS = [
  { id: 'gen', label: 'Generate', icon: Sparkles, title: 'Components from a sentence', body: 'Describe the UI. Get typed React, Tailwind and a story for every state.' },
  { id: 'rev', label: 'Review', icon: GitPullRequest, title: 'Reviews that read the diff', body: 'Line-level suggestions, explained — accept with one click.' },
  { id: 'test', label: 'Test', icon: ShieldCheck, title: 'Visual tests on every push', body: 'Screenshots across breakpoints, diffs flagged before you merge.' },
  { id: 'ship', label: 'Ship', icon: Rocket, title: 'Preview links in seconds', body: 'Every branch gets a live URL your designer can comment on.' },
];

function TabMock({ id }: { id: string }) {
  if (id === 'gen')
    return (
      <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-white/10 bg-ink-900/70 p-4 text-left text-[13px] text-ink-300">
          <p className="font-mono text-[11px] text-ink-500">prompt</p>
          <p className="mt-2 text-ink-100">A pricing card with a yearly toggle and a highlighted Pro plan.</p>
          <p className="mt-4 font-mono text-[11px] text-brand-300">✓ PricingCard.tsx · PricingCard.stories.tsx</p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-ink-900/40 p-3">
          {['Starter', 'Pro', 'Team'].map((t, i) => (
            <div key={t} className={cn('rounded-lg border p-3 text-left', i === 1 ? 'border-brand-300/50 bg-brand-300/[.06]' : 'border-white/10')}>
              <p className="text-[11px] text-ink-400">{t}</p>
              <p className="mt-1 text-lg font-medium text-ink-50">${[0, 19, 49][i]}</p>
              <div className="mt-3 space-y-1.5">
                {[0, 1, 2].map((k) => (
                  <div key={k} className="h-1.5 rounded bg-white/10" style={{ width: `${90 - k * 18}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  if (id === 'rev')
    return (
      <div className="rounded-xl border border-white/10 bg-ink-900/70 p-4 text-left font-mono text-[12px] leading-6">
        <p className="text-ink-500">Button.tsx</p>
        <p className="mt-1 bg-rose-500/10 px-2 text-rose-300">- &lt;button className="btn"&gt;{'{label}'}&lt;/button&gt;</p>
        <p className="bg-emerald-500/10 px-2 text-emerald-300">+ &lt;button type="button" aria-label={'{label}'} className="btn"&gt;</p>
        <p className="mt-3 font-sans text-[12px] text-ink-400">
          <span className="text-brand-300">northstar</span> · Buttons without an explicit type submit their parent form. Added type and an accessible label.
        </p>
      </div>
    );
  if (id === 'test')
    return (
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Mobile', 'pass'],
          ['Tablet', 'diff'],
          ['Desktop', 'pass'],
        ].map(([v, s]) => (
          <div key={v} className="rounded-xl border border-white/10 bg-ink-900/60 p-3 text-left">
            <div className={cn('mx-auto rounded-md border border-white/10 bg-ink-950 p-2', v === 'Mobile' ? 'w-1/2' : v === 'Tablet' ? 'w-3/4' : 'w-full')}>
              <div className="h-1.5 w-1/2 rounded bg-white/15" />
              <div className={cn('mt-2 h-8 rounded', s === 'diff' ? 'bg-amber-400/25 ring-1 ring-amber-300/50' : 'bg-white/[.06]')} />
            </div>
            <p className="mt-2 flex items-center justify-between text-[11px] text-ink-400">
              {v}
              <span className={s === 'diff' ? 'text-amber-300' : 'text-brand-300'}>{s === 'diff' ? '1 change' : 'passed'}</span>
            </p>
          </div>
        ))}
      </div>
    );
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/70 p-4 text-left">
      <div className="flex items-center gap-2 font-mono text-[12px] text-ink-300">
        <Globe className="h-3.5 w-3.5 text-brand-300" /> feat-pricing-card.northstar.app
        <span className="ml-auto rounded-full bg-brand-300/10 px-2 py-0.5 text-[10px] text-brand-300 ring-1 ring-brand-300/30">Ready</span>
      </div>
      <div className="mt-4 flex gap-2">
        {['Build 14s', 'Lighthouse 99', '2 comments'].map((x) => (
          <span key={x} className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-ink-400">
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureTabs() {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (tick >= 100) {
      setActive((a) => (a + 1) % TABS.length);
      setTick(0);
    }
  }, [tick]);
  const tab = TABS[active];
  return (
    <Band crosses={false}>
      <div className="grid grid-cols-2 border-b border-white/[.07] md:grid-cols-4">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => {
              setActive(i);
              setTick(0);
            }}
            className={cn(
              'relative flex items-center justify-center gap-2 border-white/[.07] py-4 text-[13px] transition-colors [&:not(:last-child)]:border-r',
              i === active ? 'text-ink-50' : 'text-ink-500 hover:text-ink-300',
            )}
          >
            <t.icon className={cn('h-3.5 w-3.5', i === active && 'text-brand-300')} />
            {t.label}
            <span className="absolute inset-x-0 bottom-0 h-px bg-white/[.04]">
              {i === active && <span className="block h-full bg-brand-300 shadow-[0_0_8px_#7dd3fc]" style={{ width: `${tick}%` }} />}
            </span>
          </button>
        ))}
      </div>
      <div className="grid items-center gap-10 px-6 py-14 md:grid-cols-[1fr_1.4fr] md:px-12">
        <div key={tab.id} className="animate-fade-up text-left">
          <h3 className="text-2xl font-medium tracking-[-0.03em] text-ink-50">{tab.title}</h3>
          <p className="mt-3 max-w-sm text-[15px] text-ink-400">{tab.body}</p>
        </div>
        <div key={tab.id + '-m'} className="animate-fade-up">
          <TabMock id={tab.id} />
        </div>
      </div>
    </Band>
  );
}

/* ─── logos ────────────────────────────────────────────────────────── */

const LOGOS = [
  ['Halcyon', 'font-serif italic text-[22px]'],
  ['PARALLAX', 'font-mono tracking-[0.2em] text-[13px]'],
  ['kite', 'font-semibold text-[21px] lowercase'],
  ['Monolith', 'font-medium tracking-[-0.04em] text-[19px]'],
  ['Arcadia', 'font-serif text-[21px]'],
  ['fieldnote', 'font-mono text-[15px]'],
  ['QUANTA', 'font-semibold tracking-[0.12em] text-[14px]'],
  ['Sable&Co', 'font-medium italic text-[18px]'],
];

function Logos() {
  return (
    <Band>
      <div className="grid md:grid-cols-[240px_1fr]">
        <p className="flex items-center px-6 py-8 text-[13px] text-ink-400 md:border-r md:border-white/[.07]">
          <span>Trusted by product teams that <Accent>ship weekly.</Accent></span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {LOGOS.map(([name, cls], i) => (
            <div
              key={name}
              className={cn(
                'flex h-20 items-center justify-center border-white/[.07] text-ink-300 transition-colors hover:text-ink-50',
                i % 4 !== 3 && 'sm:border-r',
                i < 4 && 'sm:border-b',
                i % 2 === 0 && 'border-r sm:border-r',
                i < 6 && 'border-b',
              )}
            >
              <span className={cls}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </Band>
  );
}

/* ─── split rows ───────────────────────────────────────────────────── */

function Split({ title, body, mock, caption, icon: Icon }: { title: ReactNode; body: string; mock: ReactNode; caption: string; icon: typeof Sparkles }) {
  return (
    <Band>
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]">
        <div className="px-6 py-12 md:border-r md:border-white/[.07] md:px-10 md:py-16">
          <Reveal>
            <h3 className="text-[28px] font-medium leading-[1.08] tracking-[-0.04em] text-ink-50">{title}</h3>
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-ink-400">{body}</p>
            <a href="#" className="group mt-6 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/12 px-3 text-[12.5px] text-ink-200 transition hover:border-brand-300/50">
              Learn more <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>
        <div className="flex flex-col">
          <div className="flex min-h-[320px] flex-1 items-center justify-center bg-[radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:18px_18px] px-6 py-12">
            <Reveal className="w-full max-w-md">{mock}</Reveal>
          </div>
          <p className="flex items-start gap-2 border-t border-white/[.07] px-6 py-4 text-[13px] text-ink-400">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-300" />
            {caption}
          </p>
        </div>
      </div>
    </Band>
  );
}

/* ─── statement + stats ────────────────────────────────────────────── */

function Stat({ value, suffix, label, decimals = 0 }: { value: number; suffix: string; label: string; decimals?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const v = useCountUp(value, inView);
  return (
    <div ref={ref} className="px-6 py-8 text-left">
      <p className="text-4xl font-medium tabular-nums tracking-[-0.04em] text-ink-50">
        {v.toFixed(decimals)}
        <span className="text-brand-300">{suffix}</span>
      </p>
      <p className="mt-1.5 text-[13px] text-ink-400">{label}</p>
    </div>
  );
}

function Statement() {
  return (
    <Band>
      <div className="px-6 pb-4 pt-20 text-center">
        <Reveal>
          <Eyebrow icon={Workflow}>Outcomes</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-medium leading-[1.04] tracking-[-0.05em] text-ink-50 sm:text-6xl">
            Less boilerplate. <Accent>More product.</Accent>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] text-ink-400">The repetitive 80% is handled. Your team spends its time on the decisions only people can make.</p>
        </Reveal>
      </div>
      <div className="mt-12 grid border-t border-white/[.07] sm:grid-cols-3 [&>*:not(:last-child)]:sm:border-r [&>*:not(:last-child)]:border-white/[.07]">
        <Stat value={4.2} decimals={1} suffix="×" label="faster from ticket to merged PR" />
        <Stat value={61} suffix="%" label="fewer UI regressions reaching production" />
        <Stat value={12} suffix="k+" label="teams running agents every day" />
      </div>
    </Band>
  );
}

/* ─── constellation ────────────────────────────────────────────────── */

function Constellation() {
  return (
    <Band>
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]">
        <div className="px-6 py-12 md:border-r md:border-white/[.07] md:px-10 md:py-16">
          <Reveal>
            <h3 className="text-[28px] font-medium leading-[1.08] tracking-[-0.04em] text-ink-50">
              From one developer to a <Accent>thousand.</Accent>
            </h3>
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-ink-400">Shared memory, shared rules, one review queue. Agents learn your design system once and apply it everywhere.</p>
          </Reveal>
        </div>
        <div className="relative flex items-center justify-center overflow-hidden px-6 py-10">
          <NetworkPulse />
          <p className="absolute bottom-4 left-6 right-6 flex items-start gap-2 text-[13px] text-ink-400">
            <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-300" /> Running in 90+ countries, across 40k repositories.
          </p>
        </div>
      </div>
    </Band>
  );
}

/* ─── testimonials ─────────────────────────────────────────────────── */

const QUOTES = [
  ['Our design system finally gets used. Northstar reaches for our tokens before I do.', 'Imani Okafor', 'Design Eng Lead, Halcyon'],
  ['Review time went from days to an afternoon. The suggestions explain themselves.', 'Luca Bianchi', 'Staff Engineer, Monolith'],
  ['We shipped the new onboarding in a week with two people.', 'Hana Sato', 'Founder, kite'],
  ['The visual tests caught a broken checkout on tablet before any customer did.', 'Diego Ramos', 'CTO, Arcadia'],
  ['It feels like a senior frontend engineer who never gets tired.', 'Priya Nair', 'VP Product, Quanta'],
  ['Preview links changed how design and engineering talk to each other.', 'Tom Becker', 'Head of Design, fieldnote'],
];

function QuoteCard({ q }: { q: string[] }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <blockquote className="text-[14px] leading-relaxed text-ink-200">“{q[0]}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-300/15 text-[11px] font-medium text-brand-200">
          {q[1].split(' ').map((p) => p[0]).join('')}
        </span>
        <span>
          <span className="block text-[13px] text-ink-100">{q[1]}</span>
          <span className="block text-[11.5px] text-ink-500">{q[2]}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Testimonials() {
  const row = (reverse: boolean) => (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className={cn('flex w-max gap-4 pr-4 hover:[animation-play-state:paused]', reverse ? '[animation:ns-marquee_46s_linear_infinite_reverse]' : '[animation:ns-marquee_40s_linear_infinite]')}>
        {[...QUOTES, ...QUOTES].map((q, i) => (
          <QuoteCard key={i} q={q} />
        ))}
      </div>
    </div>
  );
  return (
    <Band>
      <div className="px-6 pb-12 pt-20 text-center">
        <Reveal>
          <Eyebrow icon={Sparkles}>Teams</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-xl text-4xl font-medium leading-[1.05] tracking-[-0.05em] text-ink-50 sm:text-5xl">
            Loved by people who <Accent>ship.</Accent>
          </h2>
        </Reveal>
      </div>
      <div className="space-y-4 pb-16">
        {row(false)}
        {row(true)}
      </div>
    </Band>
  );
}

/* ─── pricing ──────────────────────────────────────────────────────── */

function Pricing() {
  const [yearly, setYearly] = useState(true);
  const plans = [
    { name: 'Solo', m: 0, y: 0, d: 'For side projects', f: ['1 agent', '50 runs / month', 'Preview links'] },
    { name: 'Team', m: 29, y: 24, d: 'For product teams', f: ['5 parallel agents', 'Unlimited runs', 'Visual tests', 'MCP integrations'], pop: true },
    { name: 'Scale', m: 79, y: 64, d: 'For organisations', f: ['Unlimited agents', 'SSO + audit log', 'Private models', 'Dedicated support'] },
  ];
  return (
    <Band>
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        <div className="px-6 py-12 md:border-r md:border-white/[.07] md:px-10 md:py-16">
          <h3 className="text-[28px] font-medium leading-[1.08] tracking-[-0.04em] text-ink-50">
            Simple pricing. <Accent>No surprises.</Accent>
          </h3>
          <p className="mt-4 max-w-xs text-[14.5px] text-ink-400">Start free. Upgrade when the agents earn it.</p>
          <div className="mt-6 inline-flex rounded-full border border-white/12 p-[3px] text-[12.5px]">
            {['Monthly', 'Yearly'].map((l) => (
              <button key={l} onClick={() => setYearly(l === 'Yearly')} className={cn('rounded-full px-3.5 py-1.5 transition', (l === 'Yearly') === yearly ? 'bg-brand-300 font-medium text-brand-950' : 'text-ink-400')}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 [&>*:not(:last-child)]:sm:border-r [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:sm:border-b-0 [&>*]:border-white/[.07]">
          {plans.map((p) => (
            <div key={p.name} className={cn('relative flex flex-col p-6', p.pop && 'bg-[radial-gradient(90%_60%_at_50%_0%,rgba(56,189,248,.12),transparent)]')}>
              {p.pop && <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent" />}
              <p className="flex items-center justify-between text-[14px] font-medium text-ink-50">
                {p.name}
                {p.pop && <span className="rounded-full bg-brand-300/10 px-2 py-0.5 text-[10.5px] font-normal text-brand-300 ring-1 ring-brand-300/30">Popular</span>}
              </p>
              <p className="mt-4 text-4xl font-medium tracking-[-0.04em] text-ink-50">
                ${yearly ? p.y : p.m}
                <span className="ml-1 text-[13px] font-normal tracking-normal text-ink-500">/ seat / mo</span>
              </p>
              <p className="mt-1 text-[13px] text-ink-400">{p.d}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-[13px] text-ink-300">
                {p.f.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-brand-300" /> {f}
                  </li>
                ))}
              </ul>
              <a href="#" className={cn('mt-7 inline-flex h-9 items-center justify-center rounded-full text-[13px] font-medium transition', p.pop ? 'bg-brand-300 text-brand-950 shadow-glow hover:bg-brand-200' : 'border border-white/15 text-ink-100 hover:border-white/30')}>
                {p.m === 0 ? 'Start free' : `Choose ${p.name}`}
              </a>
            </div>
          ))}
        </div>
      </div>
    </Band>
  );
}

/* ─── faq + cta + footer ───────────────────────────────────────────── */

const FAQS = [
  ['What does an agent actually change?', 'Only what the ticket asks for. Every change arrives as a pull request with a plain-language summary — nothing merges without a human.'],
  ['Does it follow our design system?', 'Yes. Point Northstar at your tokens and components once; agents reuse them instead of inventing new styles.'],
  ['Which stacks are supported?', 'React, Next.js, Vue and Svelte with Tailwind, CSS Modules or vanilla-extract. More arrive monthly.'],
  ['Where does our code go?', 'Runs execute in isolated sandboxes and are deleted afterwards. Scale plans can bring their own model and region.'],
  ['Can we try it on a real repo?', 'The Solo plan is free forever and works on private repositories.'],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Band>
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        <div className="px-6 py-12 md:border-r md:border-white/[.07] md:px-10 md:py-16">
          <h3 className="text-[28px] font-medium leading-[1.08] tracking-[-0.04em] text-ink-50">
            Questions, <Accent>answered.</Accent>
          </h3>
          <p className="mt-4 max-w-xs text-[14.5px] text-ink-400">Anything else? Our engineers answer support themselves.</p>
        </div>
        <div className="px-6 py-6 md:px-10">
          {FAQS.map(([q, a], i) => (
            <div key={q} className="border-b border-white/[.07] last:border-0">
              <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] text-ink-100 transition hover:text-brand-200">
                {q}
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-500 transition-transform duration-300', open === i && 'rotate-180 text-brand-300')} />
              </button>
              <div className={cn('grid transition-all duration-300 ease-smooth', open === i ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                <p className="overflow-hidden text-[14px] leading-relaxed text-ink-400">{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Band>
  );
}

function Closing() {
  return (
    <Band>
      <div className="relative overflow-hidden px-6 pb-0 pt-24 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-4xl font-medium leading-[1.04] tracking-[-0.05em] text-ink-50 sm:text-6xl">
            Ship your next feature <Accent>tonight.</Accent>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] text-ink-400">Connect a repository and hand Northstar its first ticket. Free forever for solo builders.</p>
          <a href="#" className="group mt-9 inline-flex h-11 items-center gap-2 rounded-full bg-brand-300 px-5 text-sm font-medium text-brand-950 shadow-glow transition hover:bg-brand-200">
            Start for free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </Reveal>
        <div aria-hidden className="relative mt-16 h-40 [mask-image:linear-gradient(black_45%,transparent)]">
          <div className="absolute left-1/2 top-14 h-[1600px] w-[1600px] -translate-x-1/2 rounded-full border-t border-brand-200/70 bg-ink-950 shadow-[0_-1px_40px_rgba(125,211,252,.45)]" />
          <div className="absolute left-1/2 top-0 h-40 w-[60%] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_80%,rgba(56,189,248,.3),transparent_70%)] blur-2xl" />
        </div>
      </div>
    </Band>
  );
}

function Footer() {
  const cols: [string, string[]][] = [
    ['Product', ['Agents', 'Review', 'Visual tests', 'Preview links', 'Changelog']],
    ['Developers', ['Docs', 'API', 'MCP servers', 'Status', 'Security']],
    ['Company', ['About', 'Careers', 'Blog', 'Contact', 'Legal']],
  ];
  return (
    <Band>
      <div className="grid gap-10 px-6 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)] md:px-10">
        <div>
          <Logo />
          <p className="mt-3 max-w-[220px] text-[13px] text-ink-500">AI agents for frontend teams who care about craft.</p>
        </div>
        {cols.map(([t, links]) => (
          <div key={t}>
            <p className="text-[13px] font-medium text-ink-100">{t}</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-ink-500">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="transition-colors hover:text-ink-100">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/[.07] px-6 py-5 text-[12px] text-ink-500 md:px-10">
        <span>© 2026 Northstar Labs</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_8px_#7dd3fc]" /> All systems normal
        </span>
      </div>
    </Band>
  );
}

/* ─── page ─────────────────────────────────────────────────────────── */

export function LandingPageNorthstar(_props: PageProps) {
  return (
    <div className="min-h-screen bg-ink-950 font-sans text-ink-100 antialiased">
      <style>{`
        @keyframes ns-marquee { to { transform: translateX(-50%); } }
        @keyframes ns-grain { to { background-position: 70px 0, -77px 4px; } }
        @keyframes ns-breathe { 50% { opacity: .55; } }
      `}</style>
      <Nav />
      <main className="mx-auto max-w-6xl border-x border-white/[.07]">
        <Hero />
        <FeatureTabs />
        <Logos />
        <Statement />
        <Grain />
        <Split
          icon={Terminal}
          title={
            <>
              From ticket to <Accent>pull request.</Accent>
            </>
          }
          body="Assign a ticket and watch the plan, the code and the tests come together — in the open, step by step."
          mock={<AgentTerminal {...terminalDemoProps} />}
          caption="Agents work in your repository, on a branch, with a full log of every decision."
        />
        <Split
          icon={GitPullRequest}
          title={
            <>
              Review that <Accent>reads</Accent> the diff.
            </>
          }
          body="Suggestions arrive inline with the reason attached. Accept, tweak or ignore — you stay in charge."
          mock={<DiffSuggestion {...diffDemoProps} />}
          caption="Click Apply suggestion to see the fix land."
        />
        <Grain />
        <Split
          icon={Plug}
          title={
            <>
              Plug in <Accent>every</Accent> tool.
            </>
          }
          body="Figma, GitHub, Linear, Storybook and hundreds of MCP servers. Agents use the same context your team does."
          mock={<McpToolPicker tools={toolDemo} />}
          caption="Search and toggle servers — integrations install with a single click."
        />
        <Split
          icon={Plus}
          title={
            <>
              Many agents, <Accent>one</Accent> queue.
            </>
          }
          body="Run design, build and test agents in parallel. Track progress and token use in one place."
          mock={<ParallelAgents agents={agentsDemo} />}
          caption="Parallel runs finish together and land as a single, reviewable PR."
        />
        <Constellation />
        <Testimonials />
        <Pricing />
        <Faq />
        <Closing />
        <Footer />
      </main>
    </div>
  );
}
