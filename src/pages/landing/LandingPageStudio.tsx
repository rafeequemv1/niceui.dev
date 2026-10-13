import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Hexagon,
  Layers,
  Menu,
  Palette,
  Quote,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type PageProps = { onNavigate?: (to: string) => void };

function Nav({ onNavigate }: PageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (to: string) => { onNavigate?.(to); setMenuOpen(false); };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const main = document.querySelector('main');
    main?.addEventListener('scroll', onScroll);
    return () => main?.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      scrolled ? 'border-b border-white/5 bg-ink-950/80 backdrop-blur-xl' : 'border-b border-transparent',
    )}>
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <button onClick={() => go('/intro/home')} className="focus-ring flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow">
            <Hexagon className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink-50">NiceUI</span>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {['Work', 'Services', 'Studio', 'Journal'].map((label) => (
            <button key={label} onClick={() => go('/intro/home')} className="focus-ring rounded-lg px-3 py-1.5 text-sm text-ink-400 transition-colors hover:text-ink-50">
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => go('/components/button')} className="focus-ring hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-ink-100 transition-all hover:bg-white/10 active:scale-[0.97] sm:flex">
            Start a project
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setMenuOpen(o => !o)} className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="animate-fade-down border-t border-white/5 bg-ink-950 px-6 py-4 md:hidden">
          {['Work', 'Services', 'Studio', 'Journal'].map((label) => (
            <button key={label} onClick={() => go('/intro/home')} className="block w-full py-2 text-left text-sm text-ink-300 hover:text-ink-50">{label}</button>
          ))}
        </div>
      )}
    </header>
  );
}

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('relative px-6 py-16 sm:py-24', className)}><div className="mx-auto max-w-5xl">{children}</div></section>;
}

const works = [
  { title: 'Helix Finance', category: 'Fintech dashboard', year: '2026', gradient: 'from-brand-500/20 to-sky-500/10', desc: 'A complete banking interface with real-time transactions, transfers and spending analytics.' },
  { title: 'Cobalt AI', category: 'AI agent console', year: '2026', gradient: 'from-emerald-500/20 to-teal-500/10', desc: 'An LLM operations platform with token usage tracking, agent run traces and cost breakdowns.' },
  { title: 'Northwind Commerce', category: 'E-commerce admin', year: '2025', gradient: 'from-amber-500/20 to-orange-500/10', desc: 'A store management dashboard with order tracking, inventory alerts and conversion funnels.' },
  { title: 'Meridian Ops', category: 'Infrastructure monitor', year: '2025', gradient: 'from-rose-500/20 to-red-500/10', desc: 'A cloud ops dashboard with live metrics, deployment timelines and incident management.' },
];

const services = [
  { icon: Palette, title: 'Design systems', desc: 'Token-based design systems with color ramps, spacing scales and motion guidelines.' },
  { icon: Layers, title: 'Component libraries', desc: 'Production-ready React component libraries with TypeScript, animations and accessibility.' },
  { icon: Sparkles, title: 'Landing pages', desc: 'Conversion-optimized landing pages with premium animations and micro-interactions.' },
  { icon: Zap, title: 'Dashboard templates', desc: 'Full application screens — analytics, finance, commerce, DevOps and AI operations.' },
];

const process = [
  { step: '01', title: 'Discover', desc: 'We start with a deep dive into your product, users and goals.' },
  { step: '02', title: 'Design', desc: 'We craft a design system and build interactive prototypes.' },
  { step: '03', title: 'Build', desc: 'We ship production-ready React components with animations.' },
  { step: '04', title: 'Deliver', desc: 'You get the full source code, Figma file and documentation.' },
];

const testimonials = [
  { name: 'James Park', role: 'CTO, Helix', text: 'The NiceUI team delivered our entire dashboard in two weeks. The quality is stunning — it looks like a Fortune 500 product.', rating: 5 },
  { name: 'Aisha Bello', role: 'PM, Cobalt', text: 'Every animation, every transition feels intentional. Our users constantly compliment the interface.', rating: 5 },
  { name: 'Tom Wright', role: 'Founder, Northwind', text: 'Worth every penny. We priced similar template work at $499+ and NiceUI still felt like a steal.', rating: 5 },
];

export function LandingPageStudio({ onNavigate }: PageProps) {
  const go = (to: string) => onNavigate?.(to);

  return (
    <div className="min-h-full bg-ink-950">
      <Nav onNavigate={onNavigate} />

      {/* Hero — editorial style */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-80 w-80 animate-blob rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-72 w-72 animate-blob rounded-full bg-emerald-500/8 blur-3xl" style={{ animationDelay: '5s' }} />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <div className="animate-fade-up text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
            Design studio × Component library
          </div>
          <h1 className="mt-6 animate-fade-up text-4xl font-semibold leading-[1.05] text-ink-50 sm:text-6xl" style={{ animationDelay: '60ms' }}>
            We build interfaces
            <br />
            that feel <span className="font-serif italic text-gradient">inevitable</span>
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-base text-ink-400 sm:text-lg" style={{ animationDelay: '120ms' }}>
            NiceUI is a design studio and premium component library. We craft the React components, dashboards and landing pages that make your product look like it was built by a world-class team — because it was.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3" style={{ animationDelay: '180ms' }}>
            <button onClick={() => go('/examples/analytics')} className="focus-ring group flex items-center gap-2 rounded-xl bg-ink-50 px-6 py-3 text-sm font-medium text-ink-950 transition-all hover:bg-white active:scale-[0.97]">
              View our work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => go('/components/button')} className="focus-ring flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-ink-100 backdrop-blur transition-all hover:bg-white/10 active:scale-[0.97]">
              <Layers className="h-4 w-4" /> Browse components
            </button>
          </div>
        </div>
      </section>

      {/* Selected work */}
      <Section>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-ink-50 sm:text-3xl">Selected work</h2>
            <p className="mt-2 text-sm text-ink-400">A few recent projects we're proud of.</p>
          </div>
          <button onClick={() => go('/examples/analytics')} className="hidden items-center gap-1 text-sm text-brand-400 transition-colors hover:text-brand-300 sm:flex">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {works.map((w, i) => (
            <button
              key={w.title}
              onClick={() => go('/examples/analytics')}
              className="group surface relative overflow-hidden p-0 text-left transition-all hover:shadow-pop animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Gradient art preview */}
              <div className={cn('relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br', w.gradient)}>
                <div className="dither-dots absolute inset-0 opacity-40" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                  <Hexagon className="h-7 w-7 text-white/80" strokeWidth={1.5} />
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-ink-950/60 px-2.5 py-1 text-xs text-ink-300 backdrop-blur">
                  {w.year}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-ink-50">{w.title}</h3>
                  <ArrowUpRight className="h-4 w-4 text-ink-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-400" />
                </div>
                <p className="mt-0.5 text-xs text-ink-500">{w.category}</p>
                <p className="mt-2 text-sm text-ink-400">{w.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section className="py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <h2 className="text-2xl font-semibold text-ink-50 sm:text-3xl">What we do</h2>
            <p className="mt-3 text-sm text-ink-400">
              From a single component to an entire design system. We work with React, TypeScript and Tailwind.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {services.map((s, i) => (
              <div key={s.title} className="group surface p-5 transition-all hover:shadow-pop animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 transition-colors group-hover:bg-brand-500/20">
                  <s.icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="font-medium text-ink-50">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Process */}
      <Section>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-ink-50 sm:text-3xl">How we work</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-400">A simple, proven process from first call to final delivery.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((p, i) => (
            <div key={p.step} className="surface p-6 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="font-mono text-xs text-brand-400">{p.step}</span>
              <h3 className="mt-3 font-medium text-ink-50">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-400">{p.desc}</p>
              {i < process.length - 1 && (
                <div className="mt-4 hidden h-px w-full bg-gradient-to-r from-brand-500/30 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing banner */}
      <Section>
        <div className="surface relative overflow-hidden p-8 sm:p-12">
          <div className="dither-diagonal absolute inset-0 opacity-40" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs text-brand-300">
                <Sparkles className="h-3.5 w-3.5" /> Template license
              </div>
              <h2 className="text-2xl font-semibold text-ink-50 sm:text-3xl">Get the full library for $499</h2>
              <p className="mt-3 text-sm text-ink-400">
                Every component, every dashboard, every landing page. Full source code, Figma file, lifetime updates and a commercial license. One-time payment.
              </p>
            </div>
            <div className="surface-raised p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-ink-50">$499</span>
                <span className="text-sm text-ink-500">one-time</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {['100+ animated components', '5 full dashboard templates', '2 landing page templates', 'Figma design file', 'Lifetime updates', 'Commercial license'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-300">
                    <Check className="h-4 w-4 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => go('/intro/guides')} className="focus-ring group mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]">
                Buy now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="mt-3 text-center text-xs text-ink-500">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-ink-50 sm:text-3xl">What clients say</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={t.name} className="surface p-6 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <Quote className="h-6 w-6 text-brand-400/40" />
              <p className="mt-3 text-sm leading-relaxed text-ink-300">{t.text}</p>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="mt-4 border-t border-white/5 pt-4">
                <div className="text-sm font-medium text-ink-100">{t.name}</div>
                <div className="text-xs text-ink-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Contact CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 to-ink-850 p-10 text-center shadow-card sm:p-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 -top-10 h-60 w-60 animate-blob rounded-full bg-brand-500/10 blur-3xl" />
            <div className="absolute -right-10 -bottom-10 h-60 w-60 animate-blob rounded-full bg-emerald-500/8 blur-3xl" style={{ animationDelay: '3s' }} />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-semibold text-ink-50 sm:text-4xl">Let's build something premium</h2>
            <p className="mx-auto mt-3 max-w-md text-ink-400">
              Tell us about your project. We'll get back within 24 hours.
            </p>
            <button onClick={() => go('/components/button')} className="focus-ring group mt-8 inline-flex items-center gap-2 rounded-xl bg-ink-50 px-6 py-3 text-sm font-medium text-ink-950 transition-all hover:bg-white active:scale-[0.97]">
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </Section>

      {/* Footer with dither grid */}
      <DitherGridFooterInline onNavigate={onNavigate} />
    </div>
  );
}

import { DitherGridFooter as DitherGridFooterInline } from '@/components/blocks/DitherFooters';
