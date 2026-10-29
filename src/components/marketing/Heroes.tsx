import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  Code2,
  Copy,
  Database,
  Figma,
  GitBranch,
  Globe,
  Layers,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/* ─── shared bits ──────────────────────────────────────────────────── */

const REDUCED = '@media (prefers-reduced-motion: reduce){[data-mk-anim],[data-mk-anim] *{animation:none!important;transition:none!important}}';

function Eyebrow({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1 text-[12px] text-ink-300 backdrop-blur">
      {icon ?? <span className="h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_10px_#7dd3fc]" />}
      {children}
    </span>
  );
}

function Accent({ children }: { children: ReactNode }) {
  return <em className="font-serif font-normal italic text-brand-300">{children}</em>;
}

type Cta = { label: string; href: string };

function PrimaryButton({ cta, icon = true }: { cta: Cta; icon?: boolean }) {
  return (
    <a
      href={cta.href}
      className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-300 px-5 text-sm font-medium text-brand-950 shadow-glow transition hover:bg-brand-200"
    >
      {cta.label}
      {icon && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
    </a>
  );
}

function GhostButton({ cta }: { cta: Cta }) {
  return (
    <a
      href={cta.href}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-ink-100 transition hover:border-white/30 hover:bg-white/[.03]"
    >
      {cta.label}
    </a>
  );
}

/* ─── 1. HeroAurora ────────────────────────────────────────────────── */

export type HeroAuroraProps = {
  eyebrow?: string;
  title?: string;
  accent?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  onSubmit?: (email: string) => void;
  className?: string;
};

export function HeroAurora({
  eyebrow = 'Early access is open',
  title = 'The calm place to',
  accent = 'think together.',
  description = 'Docs, decisions and roadmaps in one quiet workspace. Built for teams who would rather ship than sync.',
  placeholder = 'you@company.com',
  buttonLabel = 'Join the waitlist',
  onSubmit,
  className,
}: HeroAuroraProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <section data-mk-anim className={cn('relative isolate w-full overflow-hidden bg-ink-950 px-6 py-24 text-center sm:py-32', className)}>
      <style>{`
        @keyframes mk-hero-aurora-a{0%,100%{transform:translate(-10%,-6%) scale(1)}50%{transform:translate(8%,6%) scale(1.15)}}
        @keyframes mk-hero-aurora-b{0%,100%{transform:translate(12%,4%) scale(1.1)}50%{transform:translate(-10%,-8%) scale(.95)}}
        @keyframes mk-hero-aurora-c{0%,100%{transform:translate(0,10%) scale(.9)}50%{transform:translate(4%,-6%) scale(1.2)}}
        ${REDUCED}
      `}</style>
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[70%] w-[60%] -translate-x-1/2 rounded-full bg-sky-400/30 blur-[90px] [animation:mk-hero-aurora-a_18s_ease-in-out_infinite]" />
        <div className="absolute left-[15%] top-[5%] h-[55%] w-[45%] rounded-full bg-indigo-500/25 blur-[100px] [animation:mk-hero-aurora-b_22s_ease-in-out_infinite]" />
        <div className="absolute right-[10%] top-[10%] h-[50%] w-[40%] rounded-full bg-cyan-300/20 blur-[90px] [animation:mk-hero-aurora-c_20s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#000_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>
      <div className="mx-auto max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-7 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] text-ink-50 sm:text-7xl">
          {title} <Accent>{accent}</Accent>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-ink-300">{description}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes('@')) return;
            setSent(true);
            onSubmit?.(email);
          }}
          className="mx-auto mt-10 flex max-w-md items-center gap-1.5 rounded-full border border-white/12 bg-white/[.04] p-1.5 backdrop-blur-xl transition focus-within:border-brand-300/50 focus-within:shadow-[0_0_0_4px_rgba(125,211,252,.1)]"
        >
          {sent ? (
            <p className="flex h-10 flex-1 items-center justify-center gap-2 text-sm text-brand-200 animate-fade-in">
              <Check className="h-4 w-4" /> You are on the list — we will be in touch.
            </p>
          ) : (
            <>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                aria-label="Email address"
                className="h-10 min-w-0 flex-1 bg-transparent px-4 text-sm text-ink-50 outline-none placeholder:text-ink-500"
              />
              <button type="submit" className="h-10 shrink-0 rounded-full bg-brand-300 px-4 text-sm font-medium text-brand-950 shadow-glow transition hover:bg-brand-200">
                {buttonLabel}
              </button>
            </>
          )}
        </form>
        <p className="mt-4 text-[12px] text-ink-500">Free during beta · No credit card</p>
      </div>
    </section>
  );
}

/* ─── 2. HeroSpotlight ─────────────────────────────────────────────── */

export type HeroSpotlightProps = {
  eyebrow?: string;
  title?: string;
  /** Index of the word in `title` rendered as the serif accent. */
  accentIndex?: number;
  description?: string;
  primary?: Cta;
  secondary?: Cta;
  className?: string;
};

export function HeroSpotlight({
  eyebrow = 'Introducing Lens 2.0',
  title = 'See every request your product makes',
  accentIndex = 1,
  description = 'Tracing, logs and metrics stitched into one timeline. Find the slow query before your customers do.',
  primary = { label: 'Start tracing', href: '#' },
  secondary = { label: 'Live demo', href: '#' },
  className,
}: HeroSpotlightProps) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 30 });
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 80);
    return () => clearTimeout(t);
  }, []);
  const words = title.split(' ');
  return (
    <section
      ref={ref}
      data-mk-anim
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className={cn('relative isolate w-full overflow-hidden bg-ink-950 px-6 py-24 text-center sm:py-32', className)}
    >
      <style>{REDUCED}</style>
      <div aria-hidden className="absolute inset-0 -z-10 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:linear-gradient(rgba(125,211,252,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.35)_1px,transparent_1px)] [background-size:48px_48px] transition-[mask-position] duration-200"
        style={{
          maskImage: `radial-gradient(260px circle at ${pos.x}% ${pos.y}%, black, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(260px circle at ${pos.x}% ${pos.y}%, black, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/15 blur-[80px] transition-[left,top] duration-500 ease-out"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,transparent,#000)]" />
      <div className="mx-auto max-w-4xl">
        <Eyebrow icon={<Sparkles className="h-3 w-3 text-brand-300" />}>{eyebrow}</Eyebrow>
        <h1 className="mt-7 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] text-ink-50 sm:text-7xl">
          {words.map((w, i) => (
            <span
              key={i}
              className={cn('inline-block transition-all duration-700 ease-out', shown ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-3 opacity-0 blur-md')}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {i === accentIndex ? <Accent>{w}</Accent> : w}
              {i < words.length - 1 && ' '}
            </span>
          ))}
        </h1>
        <p
          className={cn('mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-ink-400 transition-all duration-700', shown ? 'opacity-100' : 'opacity-0')}
          style={{ transitionDelay: `${words.length * 90 + 100}ms` }}
        >
          {description}
        </p>
        <div
          className={cn('mt-10 flex flex-wrap justify-center gap-3 transition-all duration-700', shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')}
          style={{ transitionDelay: `${words.length * 90 + 220}ms` }}
        >
          <PrimaryButton cta={primary} />
          <GhostButton cta={secondary} />
        </div>
      </div>
    </section>
  );
}

/* ─── 3. HeroSplitProduct ──────────────────────────────────────────── */

export type HeroSplitProductProps = {
  eyebrow?: string;
  title?: string;
  accent?: string;
  description?: string;
  primary?: Cta;
  secondary?: Cta;
  rating?: string;
  reviewers?: string;
  className?: string;
};

export function HeroSplitProduct({
  eyebrow = 'Revenue analytics',
  title = 'Know your numbers',
  accent = 'before Monday.',
  description = 'Stripe, HubSpot and your warehouse in one live dashboard. Forecasts update the moment a deal moves.',
  primary = { label: 'Get started free', href: '#' },
  secondary = { label: 'Book a demo', href: '#' },
  rating = '4.9',
  reviewers = 'from 2,400+ finance teams',
  className,
}: HeroSplitProductProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const bars = [38, 52, 44, 66, 58, 74, 69, 88, 80, 96];
  return (
    <section data-mk-anim className={cn('relative isolate w-full overflow-hidden bg-ink-950 px-6 py-20 sm:py-24', className)}>
      <style>{`
        @keyframes mk-hero-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes mk-hero-bar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        ${REDUCED}
      `}</style>
      <div aria-hidden className="absolute right-0 top-0 -z-10 h-[500px] w-[600px] bg-[radial-gradient(closest-side,rgba(56,189,248,.18),transparent)] blur-2xl" />
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-[40px] font-medium leading-[1.03] tracking-[-0.05em] text-ink-50 sm:text-6xl">
            {title} <Accent>{accent}</Accent>
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-400">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton cta={primary} />
            <GhostButton cta={secondary} />
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex">
              {['#7dd3fc', '#a5b4fc', '#f0abfc', '#fcd34d', '#86efac'].map((c, i) => (
                <span key={c} className={cn('h-8 w-8 rounded-full border-2 border-ink-950', i > 0 && '-ml-2.5')} style={{ background: `linear-gradient(135deg, ${c}, #0b0c0e)` }} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-brand-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
                <span className="ml-1.5 text-[13px] font-medium text-ink-100">{rating}</span>
              </div>
              <p className="mt-0.5 text-[12px] text-ink-500">{reviewers}</p>
            </div>
          </div>
        </div>
        <div
          ref={ref}
          onMouseMove={(e) => {
            const r = ref.current!.getBoundingClientRect();
            setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -8, y: ((e.clientX - r.left) / r.width - 0.5) * 10 });
          }}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className="relative mx-auto h-[380px] w-full max-w-[520px] [perspective:1200px]"
        >
          <div className="relative h-full w-full transition-transform duration-300 ease-out [transform-style:preserve-3d]" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
            {/* chart card */}
            <div className="absolute inset-x-0 top-6 mx-auto w-[86%] rounded-2xl border border-white/10 bg-ink-900/90 p-5 shadow-pop backdrop-blur [transform:translateZ(0px)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-ink-400">Net revenue</p>
                  <p className="mt-1 text-2xl font-medium tracking-[-0.03em] text-ink-50">$1.28M</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> 18.2%
                </span>
              </div>
              <div className="mt-6 flex h-32 items-end gap-2">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 origin-bottom rounded-t-md bg-gradient-to-t from-brand-500/30 to-brand-300 [animation:mk-hero-bar_1s_cubic-bezier(.2,.8,.2,1)_both]"
                    style={{ height: `${h}%`, animationDelay: `${i * 60}ms`, opacity: 0.35 + (i / bars.length) * 0.65 }}
                  />
                ))}
              </div>
            </div>
            {/* notification */}
            <div
              className="absolute -left-2 top-0 w-60 rounded-xl border border-white/10 bg-ink-850/95 p-3 shadow-pop backdrop-blur [animation:mk-hero-float_6s_ease-in-out_infinite] sm:-left-6"
              style={{ transform: 'translateZ(60px)' }}
            >
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-300/15 text-brand-300">
                  <Bell className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[12.5px] font-medium text-ink-50">Deal closed · Acme Inc.</p>
                  <p className="text-[11.5px] text-ink-400">+$48,000 ARR · just now</p>
                </div>
              </div>
            </div>
            {/* metric */}
            <div
              className="absolute -right-2 bottom-4 w-52 rounded-xl border border-white/10 bg-ink-850/95 p-4 shadow-pop backdrop-blur [animation:mk-hero-float_7s_ease-in-out_1.2s_infinite] sm:-right-6"
              style={{ transform: 'translateZ(90px)' }}
            >
              <p className="text-[11.5px] text-ink-400">Forecast accuracy</p>
              <p className="mt-1 text-xl font-medium text-ink-50">97.4%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
                <div className="h-full w-[97%] rounded-full bg-brand-300 shadow-[0_0_10px_#7dd3fc]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. HeroBeams ─────────────────────────────────────────────────── */

export type HeroBeamsProps = {
  badge?: string;
  title?: string;
  accent?: string;
  description?: string;
  command?: string;
  primary?: Cta;
  beams?: number;
  className?: string;
};

export function HeroBeams({
  badge = 'v4.0 — now with edge functions',
  title = 'Deploy at the',
  accent = 'speed of thought.',
  description = 'Push to main. We build, test and ship to 300 cities before your coffee cools.',
  command = 'npx create-orbit@latest',
  primary = { label: 'Start deploying', href: '#' },
  beams = 9,
  className,
}: HeroBeamsProps) {
  const [copied, setCopied] = useState(false);
  return (
    <section data-mk-anim className={cn('relative isolate w-full overflow-hidden bg-ink-950 px-6 py-24 text-center sm:py-32', className)}>
      <style>{`
        @keyframes mk-hero-beam{0%{transform:translateY(-120%)}100%{transform:translateY(420%)}}
        ${REDUCED}
      `}</style>
      <div aria-hidden className="absolute inset-0 -z-10 flex justify-between px-[4%] [mask-image:linear-gradient(to_bottom,black_40%,transparent)]">
        {Array.from({ length: beams }).map((_, i) => (
          <div key={i} className="relative h-full w-px overflow-hidden bg-white/[.06]">
            <span
              className="absolute left-0 top-0 h-1/4 w-px bg-gradient-to-b from-transparent via-brand-300 to-transparent [animation:mk-hero-beam_linear_infinite]"
              style={{ animationDuration: `${4 + ((i * 7) % 5)}s`, animationDelay: `${(i * 1.3) % 4}s` }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_50%_80%_at_50%_0%,rgba(56,189,248,.22),transparent)]" />
      <div className="mx-auto max-w-3xl">
        <a href="#" className="group inline-flex items-center gap-2 rounded-full border border-brand-300/25 bg-brand-300/[.06] py-1 pl-1 pr-3 text-[12px] text-brand-100 transition hover:border-brand-300/50">
          <span className="rounded-full bg-brand-300 px-2 py-0.5 text-[10.5px] font-semibold text-brand-950">New</span>
          {badge}
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <h1 className="mt-7 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] text-ink-50 sm:text-7xl">
          {title} <Accent>{accent}</Accent>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-ink-400">{description}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryButton cta={primary} />
          <button
            onClick={() => {
              navigator.clipboard?.writeText(command);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex h-11 items-center gap-3 rounded-full border border-white/12 bg-ink-900/70 px-4 font-mono text-[13px] text-ink-200 backdrop-blur transition hover:border-brand-300/50"
          >
            <span className="text-brand-300">$</span>
            {command}
            {copied ? <Check className="h-3.5 w-3.5 text-brand-300" /> : <Copy className="h-3.5 w-3.5 text-ink-500" />}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── 5. HeroOrbit ─────────────────────────────────────────────────── */

export type HeroOrbitProps = {
  eyebrow?: string;
  title?: string;
  accent?: string;
  description?: string;
  primary?: Cta;
  secondary?: Cta;
  className?: string;
};

const ORBIT_RINGS: { r: number; dur: number; icons: typeof Zap[] }[] = [
  { r: 130, dur: 26, icons: [Figma, GitBranch, Database] },
  { r: 205, dur: 38, icons: [Code2, Globe, Layers, Zap] },
  { r: 280, dur: 52, icons: [Sparkles, Bell, TrendingUp, Star, Check] },
];

export function HeroOrbit({
  eyebrow = '120+ integrations',
  title = 'Everything you use,',
  accent = 'in orbit.',
  description = 'Connect your design, code and data tools once. Relay keeps them in sync while you focus on the work.',
  primary = { label: 'Connect your stack', href: '#' },
  secondary = { label: 'Browse integrations', href: '#' },
  className,
}: HeroOrbitProps) {
  return (
    <section data-mk-anim className={cn('relative isolate w-full overflow-hidden bg-ink-950 px-6 py-24 text-center sm:py-28', className)}>
      <style>{`
        @keyframes mk-hero-orbit{to{transform:rotate(360deg)}}
        @keyframes mk-hero-counter{to{transform:rotate(-360deg)}}
        @keyframes mk-hero-core{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
        ${REDUCED}
      `}</style>
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 scale-[.62] sm:scale-100">
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/30 blur-3xl [animation:mk-hero-core_5s_ease-in-out_infinite]" />
        {ORBIT_RINGS.map((ring, ri) => (
          <div
            key={ri}
            className="absolute left-1/2 top-1/2 rounded-full border border-white/[.08]"
            style={{ width: ring.r * 2, height: ring.r * 2, marginLeft: -ring.r, marginTop: -ring.r, animation: `mk-hero-orbit ${ring.dur}s linear infinite ${ri % 2 ? 'reverse' : ''}` }}
          >
            {ring.icons.map((Icon, i) => {
              const a = (i / ring.icons.length) * Math.PI * 2;
              return (
                <span
                  key={i}
                  className="absolute grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink-900 text-ink-200 shadow-pop"
                  style={{ left: ring.r + Math.cos(a) * ring.r - 20, top: ring.r + Math.sin(a) * ring.r - 20, animation: `mk-hero-counter ${ring.dur}s linear infinite ${ri % 2 ? 'reverse' : ''}` }}
                >
                  <Icon className="h-4 w-4" />
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,0,0,.85)_0,rgba(0,0,0,.6)_22%,transparent_45%)]" />
      <div className="relative mx-auto max-w-2xl py-10">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-7 text-[42px] font-medium leading-[1.02] tracking-[-0.05em] text-ink-50 sm:text-7xl">
          {title} <Accent>{accent}</Accent>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-ink-300">{description}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <PrimaryButton cta={primary} />
          <GhostButton cta={secondary} />
        </div>
      </div>
    </section>
  );
}

/* ─── 6. HeroRotatingWord ──────────────────────────────────────────── */

export type HeroRotatingWordProps = {
  prefix?: string;
  words?: string[];
  suffix?: string;
  description?: string;
  links?: Cta[];
  interval?: number;
  className?: string;
};

export function HeroRotatingWord({
  prefix = 'Software for teams who',
  words = ['design', 'build', 'ship', 'care'],
  suffix = 'with intent.',
  description = 'A small studio making calm, durable tools. No growth hacks, no dark patterns — just software that respects your time.',
  links = [
    { label: 'See the work', href: '#' },
    { label: 'Read the manifesto', href: '#' },
  ],
  interval = 2200,
  className,
}: HeroRotatingWordProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <section data-mk-anim className={cn('relative isolate w-full overflow-hidden bg-ink-950 px-6 py-24 sm:px-12 sm:py-32', className)}>
      <style>{`
        @keyframes mk-hero-word-in{from{opacity:0;transform:translateY(60%);filter:blur(8px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes mk-hero-underline{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        ${REDUCED}
      `}</style>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-ink-500">Studio — est. 2019</p>
        <h1 className="mt-8 text-[44px] font-medium leading-[1.02] tracking-[-0.055em] text-ink-50 sm:text-[88px]">
          {prefix}{' '}
          <span className="relative inline-block align-bottom">
            <span key={i} className="relative inline-block font-serif font-normal italic text-brand-300 [animation:mk-hero-word-in_.7s_cubic-bezier(.2,.8,.2,1)_both]">
              {words[i]}
            </span>
            <span
              key={'u' + i}
              aria-hidden
              className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-brand-300 to-brand-300/0 [animation:mk-hero-underline_.8s_.15s_cubic-bezier(.2,.8,.2,1)_both]"
            />
          </span>{' '}
          {suffix}
        </h1>
        <div className="mt-12 grid gap-8 border-t border-white/[.07] pt-8 sm:grid-cols-[1.4fr_1fr]">
          <p className="max-w-md text-[16px] leading-relaxed text-ink-400">{description}</p>
          <div className="flex flex-col gap-3 sm:items-end">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="group inline-flex items-center gap-2 text-[15px] text-ink-100 transition hover:text-brand-200">
                {l.label}
                <ArrowUpRight className="h-4 w-4 text-ink-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-300" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── demos ────────────────────────────────────────────────────────── */

const DemoFrame = ({ children }: { children: ReactNode }) => <div className="w-full overflow-hidden rounded-2xl border border-white/[.07]">{children}</div>;

export const HeroAuroraDemo = () => (
  <DemoFrame>
    <HeroAurora />
  </DemoFrame>
);
export const HeroSpotlightDemo = () => (
  <DemoFrame>
    <HeroSpotlight />
  </DemoFrame>
);
export const HeroSplitProductDemo = () => (
  <DemoFrame>
    <HeroSplitProduct />
  </DemoFrame>
);
export const HeroBeamsDemo = () => (
  <DemoFrame>
    <HeroBeams />
  </DemoFrame>
);
export const HeroOrbitDemo = () => (
  <DemoFrame>
    <HeroOrbit />
  </DemoFrame>
);
export const HeroRotatingWordDemo = () => (
  <DemoFrame>
    <HeroRotatingWord />
  </DemoFrame>
);
