import { ArrowRight, Boxes, Component, Eye, Layers, Palette, Sparkles } from 'lucide-react';

type GuideProps = { onNavigate?: (to: string) => void };

const pillars = [
  { icon: Eye, title: 'Accessible by default', desc: 'Keyboard navigation, focus rings, ARIA labels, and reduced-motion support on every component.' },
  { icon: Palette, title: 'Consistent theming', desc: 'One color ramp (ink + brand), one spacing scale (8px), three font weights. No exceptions.' },
  { icon: Layers, title: 'Composable', desc: 'Primitives compose into blocks, blocks compose into dashboards. Each layer builds on the last.' },
  { icon: Sparkles, title: 'Motion with purpose', desc: 'Animations guide attention and confirm actions. No gratuitous movement.' },
];

const layers = [
  { name: 'Primitives', desc: 'Button, Input, Card, Switch, Badge, Tabs', to: '/components/button', icon: Component, count: '21' },
  { name: 'Motion', desc: 'Modal, Drawer, Tooltip, Loader, Marquee, Dock', to: '/components/tooltip', icon: Layers, count: '28' },
  { name: 'AI Agents', desc: 'VoiceOrb, ChatApp, Streaming, ToolApproval', to: '/ai/voice-orb', icon: Sparkles, count: '15' },
  { name: 'Blocks', desc: 'CommandPalette, OtpInput, FileUpload, Swap', to: '/blocks/morphing-search', icon: Boxes, count: '24' },
];

const tokens = [
  { label: 'Spacing', value: '8px base', items: ['p-2 = 8px', 'p-4 = 16px', 'p-6 = 24px', 'p-8 = 32px'] },
  { label: 'Radius', value: '8 / 12 / 16px', items: ['rounded-lg = 8px', 'rounded-xl = 12px', 'rounded-2xl = 16px'] },
  { label: 'Weights', value: '400 / 500 / 600', items: ['font-normal', 'font-medium', 'font-semibold'] },
  { label: 'Easing', value: 'smooth + spring', items: ['ease-smooth: 0.16,1,0.3,1', 'ease-spring: 0.34,1.56,0.64,1'] },
];

const colorRamp = [
  { name: 'ink', desc: 'Neutral backgrounds & text', shades: ['#0a0a0c', '#131316', '#232328', '#36363e', '#6b6b77', '#b1b1ba'] },
  { name: 'brand', desc: 'Primary actions & accents', shades: ['#142b57', '#19458f', '#1461e1', '#3396ff', '#59b6ff', '#d9eeff'] },
  { name: 'emerald', desc: 'Success & positive states', shades: ['#022c22', '#064e3b', '#065f46', '#10b981', '#34d399', '#a7f3d0'] },
  { name: 'rose', desc: 'Errors & destructive actions', shades: ['#4c0519', '#881337', '#9f1239', '#e11d48', '#fb7185', '#fecdd3'] },
  { name: 'amber', desc: 'Warnings & highlights', shades: ['#451a03', '#78350f', '#92400e', '#d97706', '#fbbf24', '#fde68a'] },
];

export function OpenUIPage({ onNavigate }: GuideProps) {
  const go = (to: string) => onNavigate?.(to);
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-8 lg:pt-14">
      <div className="animate-fade-up">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-brand-400">Design system</div>
        <h1 className="mt-3 text-3xl font-semibold text-ink-50 sm:text-4xl">OpenUI</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-400">
          The design language behind NiceUI. Four pillars, one token system, and a layered architecture that scales from a single button to a full dashboard.
        </p>
      </div>

      {/* Pillars */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {pillars.map((p, i) => (
          <div key={p.title} className="surface p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
              <p.icon className="h-5 w-5 text-brand-400" />
            </div>
            <h3 className="font-medium text-ink-50">{p.title}</h3>
            <p className="mt-1.5 text-sm text-ink-400">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Architecture layers */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-50">Architecture</h2>
        <p className="mt-2 text-sm text-ink-400">Four layers, each building on the one below.</p>
        <div className="mt-4 space-y-3">
          {layers.map((l, i) => (
            <button
              key={l.name}
              onClick={() => go(l.to)}
              className="group surface flex w-full items-center gap-4 p-4 text-left transition-all hover:shadow-pop animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-brand-500/10">
                <l.icon className="h-5 w-5 text-ink-300 transition-colors group-hover:text-brand-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-ink-50">{l.name}</h3>
                  <span className="rounded-full bg-white/5 px-1.5 py-px font-mono text-[10px] text-ink-400">{l.count}</span>
                </div>
                <p className="mt-0.5 text-sm text-ink-400">{l.desc}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-ink-500 transition-all group-hover:translate-x-1 group-hover:text-brand-400" />
            </button>
          ))}
        </div>
      </section>

      {/* Design tokens */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-50">Design tokens</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {tokens.map((t, i) => (
            <div key={t.label} className="surface p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-ink-50">{t.label}</h3>
                <span className="font-mono text-xs text-brand-300">{t.value}</span>
              </div>
              <ul className="mt-3 space-y-1">
                {t.items.map((item) => (
                  <li key={item} className="font-mono text-xs text-ink-400">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Color ramps */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink-50">Color ramps</h2>
        <p className="mt-2 text-sm text-ink-400">Six ramps with 11 shades each. Used consistently across every component.</p>
        <div className="mt-4 space-y-3">
          {colorRamp.map((ramp, i) => (
            <div key={ramp.name} className="surface p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm text-ink-100">{ramp.name}</h3>
                  <span className="text-xs text-ink-500">{ramp.desc}</span>
                </div>
              </div>
              <div className="flex gap-1 overflow-hidden rounded-lg">
                {ramp.shades.map((shade, j) => (
                  <div
                    key={j}
                    className="group relative h-12 flex-1 cursor-default transition-all hover:flex-[2]"
                    style={{ backgroundColor: shade }}
                  >
                    <span className="absolute inset-0 flex items-end justify-center pb-1 font-mono text-[9px] text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
                      {shade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-12 flex flex-wrap gap-3">
        <button
          onClick={() => go('/examples/analytics')}
          className="focus-ring group flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]"
        >
          See it all together
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          onClick={() => go('/intro/guides')}
          className="focus-ring flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-ink-100 backdrop-blur transition-all hover:bg-white/10 active:scale-[0.97]"
        >
          Getting started
        </button>
      </div>
    </div>
  );
}
