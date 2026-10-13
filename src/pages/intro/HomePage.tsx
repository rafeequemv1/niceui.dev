import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Boxes,
  Component,
  Gauge,
  Hexagon,
  Layers,
  Palette,
  Radio,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type HomeProps = { onNavigate?: (to: string) => void };

const stats = [
  { label: 'Components', value: '53' },
  { label: 'AI agents', value: '18' },
  { label: 'Blocks', value: '23' },
  { label: 'Dashboards', value: '5' },
];

const showcase = [
  { title: 'Voice Orb', section: 'AI Agents', icon: Radio, to: '/ai/voice-orb', tone: 'from-brand-400 to-brand-700', blurb: 'Audio-reactive orb with idle, listening and speaking states.' },
  { title: 'Command Palette', section: 'Blocks', icon: Terminal, to: '/blocks/command-palette', tone: 'from-emerald-400 to-teal-700', blurb: 'Cmd+K fuzzy command palette with sliding highlight.' },
  { title: 'Streaming Response', section: 'AI Agents', icon: Sparkles, to: '/ai/streaming-response', tone: 'from-amber-400 to-orange-700', blurb: 'Word-by-word streaming with a blinking caret and markdown.' },
  { title: 'Cylinder Carousel', section: 'Components', icon: Boxes, to: '/components/cylinder-carousel', tone: 'from-sky-400 to-blue-700', blurb: '3D rotating cylinder of cards with drag-to-rotate.' },
  { title: 'Dynamic Island', section: 'Blocks', icon: Hexagon, to: '/blocks/dynamic-island', tone: 'from-rose-400 to-rose-700', blurb: 'Apple-style pill morphing between call, music and timer.' },
  { title: 'Shader Background', section: 'Components', icon: Palette, to: '/components/shader-background', tone: 'from-teal-400 to-emerald-700', blurb: 'Animated gradient mesh canvas with hero text overlay.' },
];

const sections = [
  { title: 'AI Agents', count: 18, desc: 'Voice orbs, streaming, tool approvals, citations, chat apps.', icon: Bot, to: '/ai/voice-orb' },
  { title: 'Components', count: 53, desc: 'Buttons, inputs, tables, tabs, modals, motion primitives.', icon: Component, to: '/components/button' },
  { title: 'Blocks', count: 23, desc: 'Command palettes, OTP, swaps, upload, prediction markets.', icon: Layers, to: '/blocks/morphing-search' },
  { title: 'Dashboards', count: 5, desc: 'Analytics, finance, DevOps, commerce, AI ops — full screens.', icon: Gauge, to: '/examples/analytics' },
  { title: 'Landing Pages', count: 6, desc: 'SaaS, studio, wealth, design tool, social and AI data pages — sellable templates.', icon: Layers, to: '/landing/saas-landing' },
  { title: 'App Templates', count: 1, desc: 'A full AI chat assistant with text, code, image and video generation.', icon: Bot, to: '/apps/ai-assistant' },
];

function GradientMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-96 w-96 animate-blob rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -right-24 top-10 h-80 w-80 animate-blob rounded-full bg-emerald-500/15 blur-3xl" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-sky-500/15 blur-3xl" style={{ animationDelay: '6s' }} />
    </div>
  );
}

function OrbVisual() {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const s = (offset: number) => 1 + Math.sin(t * 1.5 + offset) * 0.06;
  const layers = [
    { size: 220, color: 'from-brand-400 to-brand-700', delay: 0, opacity: 0.25 },
    { size: 170, color: 'from-sky-400 to-brand-600', delay: 1, opacity: 0.35 },
    { size: 130, color: 'from-brand-300 to-brand-500', delay: 2, opacity: 0.5 },
  ];

  return (
    <div className="relative flex items-center justify-center">
      {layers.map((l, i) => (
        <div
          key={i}
          className={cn('absolute rounded-full bg-gradient-to-br blur-2xl', l.color)}
          style={{ width: l.size, height: l.size, opacity: l.opacity, transform: `scale(${s(l.delay)})`, transition: 'transform 80ms linear' }}
        />
      ))}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-700 shadow-glow">
        <div className="absolute inset-0 rounded-full bg-ink-950/40 backdrop-blur-sm" />
        <Hexagon className="relative h-8 w-8 text-white animate-spin-slow" strokeWidth={2} />
      </div>
      <div className="absolute h-32 w-32 animate-pulse-ring rounded-full border border-brand-400/40" />
    </div>
  );
}

export function HomePage({ onNavigate }: HomeProps) {
  const go = (to: string) => onNavigate?.(to);
  return (
    <div className="relative">
      <GradientMesh />

      {/* Hero */}
      <section className="relative px-4 pb-16 pt-16 sm:px-8 lg:pt-24">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center animate-fade-up">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-ink-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span>100+ animated components for React + Tailwind</span>
              <span className="ml-1 rounded-full bg-emerald-500/15 px-1.5 py-px text-[10px] text-emerald-300">v2.4</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] text-ink-50 sm:text-6xl">
              The premium animated <span className="text-gradient">component library</span> for modern apps
            </h1>
            <p className="mt-5 max-w-2xl text-base text-ink-400 sm:text-lg">
              NiceUI ships production-ready React components — AI agent interfaces, motion primitives, full blocks and complete dashboard templates. Open source, copy-paste, yours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => go('/components/button')}
                className="focus-ring group flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]"
              >
                Browse components
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => go('/examples/analytics')}
                className="focus-ring flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-ink-100 backdrop-blur transition-all hover:bg-white/10 active:scale-[0.97]"
              >
                <Gauge className="h-4 w-4" />
                View dashboards
              </button>
            </div>
          </div>

          {/* Orb showcase */}
          <div className="mt-16 flex justify-center animate-fade-up" style={{ animationDelay: '120ms' }}>
            <OrbVisual />
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
            {stats.map((s) => (
              <div key={s.label} className="surface p-5 text-center">
                <div className="text-3xl font-semibold text-ink-50">{s.value}</div>
                <div className="mt-1 text-sm text-ink-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase grid */}
      <section className="relative px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-ink-50">Featured components</h2>
            <button onClick={() => go('/components/button')} className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((item, i) => (
              <button
                key={item.title}
                onClick={() => go(item.to)}
                className="group surface relative overflow-hidden p-5 text-left transition-all hover:shadow-pop animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br', item.tone)}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-ink-50">{item.title}</h3>
                  <ArrowUpRight className="h-4 w-4 text-ink-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-400" />
                </div>
                <p className="mt-1 text-sm text-ink-400">{item.blurb}</p>
                <span className="mt-3 inline-block text-xs text-ink-500">{item.section}</span>
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.03] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section links */}
      <section className="relative px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-semibold text-ink-50">Explore the library</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((s, i) => (
              <button
                key={s.title}
                onClick={() => go(s.to)}
                className="group surface flex items-center gap-4 p-5 text-left transition-all hover:shadow-pop animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-colors group-hover:bg-brand-500/10">
                  <s.icon className="h-6 w-6 text-ink-300 transition-colors group-hover:text-brand-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-ink-50">{s.title}</h3>
                    <span className="rounded-full bg-white/5 px-1.5 py-px font-mono text-[10px] text-ink-400">{s.count}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-400">{s.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-ink-500 transition-all group-hover:translate-x-1 group-hover:text-brand-400" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="surface relative overflow-hidden p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
            <div className="relative">
              <Zap className="mx-auto mb-4 h-8 w-8 text-brand-400" />
              <h2 className="text-2xl font-semibold text-ink-50 sm:text-3xl">Ready to build something premium?</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-400">
                Every component is copy-paste ready with full TypeScript types and live interactive previews.
              </p>
              <button
                onClick={() => go('/intro/guides')}
                className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]"
              >
                Read the guides
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type FeatureBlockProps = { icon: typeof Zap; title: string; children: ReactNode };
function FeatureBlock({ icon: Icon, title, children }: FeatureBlockProps) {
  return (
    <div className="surface p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
        <Icon className="h-5 w-5 text-brand-400" />
      </div>
      <h3 className="font-medium text-ink-50">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-400">{children}</p>
    </div>
  );
}
