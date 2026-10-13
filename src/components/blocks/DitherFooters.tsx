import { type ReactNode } from 'react';
import { ArrowUpRight, Github, Twitter, Linkedin, Hexagon, Mail } from 'lucide-react';
import { cn } from '@/lib/cn';

type FooterProps = { onNavigate?: (to: string) => void };

const cols = [
  { title: 'Product', links: ['Components', 'Dashboards', 'AI Agents', 'Blocks', 'Pricing'] },
  { title: 'Resources', links: ['Documentation', 'Guides', 'Motion Guide', 'Changelog', 'Blog'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact', 'Press kit', 'Partners'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'License', 'Security', 'Status'] },
];

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow">
        <Hexagon className="h-4 w-4 text-white" strokeWidth={2.5} />
      </span>
      <span className="text-sm font-semibold tracking-tight text-ink-50">NiceUI</span>
    </span>
  );
}

function Socials() {
  return (
    <div className="flex items-center gap-2">
      {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
        <a
          key={i}
          href="#"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-ink-400 transition-all hover:bg-white/5 hover:text-ink-50 active:scale-95"
        >
          <Icon className="h-[18px] w-[18px]" />
        </a>
      ))}
    </div>
  );
}

export function DitherDotFooter({ onNavigate }: FooterProps) {
  const go = (label: string) => {
    const map: Record<string, string> = {
      Components: '/components/button',
      Dashboards: '/examples/analytics',
      'AI Agents': '/ai/voice-orb',
      Blocks: '/blocks/morphing-search',
      Documentation: '/intro/guides',
      Guides: '/intro/guides',
      'Motion Guide': '/intro/motion-guides',
      Pricing: '/intro/openui',
    };
    onNavigate?.(map[label] ?? '/intro/home');
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-ink-950">
      <div className="dither-dots absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      {/* CTA strip */}
      <div className="relative border-b border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-12 sm:flex-row">
          <div>
            <h2 className="text-2xl font-semibold text-ink-50">Start building today</h2>
            <p className="mt-1.5 text-sm text-ink-400">100+ premium components. Copy, paste, ship.</p>
          </div>
          <button
            onClick={() => go('Components')}
            className="focus-ring group flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-all hover:bg-brand-400 active:scale-[0.97]"
          >
            Get started free
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-ink-400">
              The premium animated component library for React. Built for developers who care about craft.
            </p>
            <Socials />
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-ink-500">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => go(link)}
                      className="text-sm text-ink-400 transition-colors hover:text-ink-100"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs text-ink-500">© 2026 NiceUI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              All systems operational
            </span>
            <span className="font-mono">v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function DitherGridFooter({ onNavigate }: FooterProps) {
  const go = (label: string) => {
    const map: Record<string, string> = {
      Components: '/components/button',
      Dashboards: '/examples/analytics',
      'AI Agents': '/ai/voice-orb',
      Blocks: '/blocks/morphing-search',
      Documentation: '/intro/guides',
      Guides: '/intro/guides',
    };
    onNavigate?.(map[label] ?? '/intro/home');
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-ink-950">
      <div className="dither-grid absolute inset-0 opacity-50" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-30"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(51,150,255,0.15), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Big brand + newsletter */}
        <div className="grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-sm text-sm text-ink-400">
              Premium animated React components, AI agent interfaces, blocks and full dashboard templates.
            </p>
            <div className="flex max-w-sm items-center gap-2">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 transition-colors focus-within:border-brand-500/40">
                <Mail className="h-4 w-4 text-ink-500" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="h-full flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
                />
              </div>
              <button className="focus-ring flex h-10 shrink-0 items-center rounded-xl bg-ink-50 px-4 text-sm font-medium text-ink-950 transition-all hover:bg-white active:scale-[0.97]">
                Subscribe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-medium uppercase tracking-wider text-ink-500">{col.title}</h3>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        onClick={() => go(link)}
                        className="group flex items-center gap-1 text-sm text-ink-400 transition-colors hover:text-ink-100"
                      >
                        {link}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Giant brand text */}
      <div className="relative overflow-hidden border-t border-white/5">
        <div className="select-none px-6 py-8 text-center">
          <span className="bg-gradient-to-b from-white/[0.07] to-transparent bg-clip-text text-[clamp(3rem,12vw,9rem)] font-semibold leading-none tracking-tighter text-transparent">
            NiceUI
          </span>
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs text-ink-500">© 2026 NiceUI Inc. MIT Licensed.</p>
          <Socials />
        </div>
      </div>
    </footer>
  );
}

export function DitherDiagonalFooter({ onNavigate }: FooterProps) {
  const go = (label: string) => {
    const map: Record<string, string> = {
      Components: '/components/button',
      Dashboards: '/examples/analytics',
      'AI Agents': '/ai/voice-orb',
      Blocks: '/blocks/morphing-search',
      Documentation: '/intro/guides',
    };
    onNavigate?.(map[label] ?? '/intro/home');
  };

  const features = ['Zero runtime deps', 'TypeScript native', 'MIT licensed', '100+ components'];

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-ink-950">
      <div className="dither-diagonal absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <p className="mt-5 max-w-md text-sm text-ink-400">
            Crafted with obsessive attention to detail. Every transition, every shadow, every pixel — intentional.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {features.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs text-ink-500">
                <span className="h-1 w-1 rounded-full bg-brand-400" />
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {cols.slice(0, 4).map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-ink-500">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.slice(0, 4).map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => go(link)}
                      className="text-sm text-ink-400 transition-colors hover:text-ink-100"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs text-ink-500">© 2026 NiceUI Inc.</p>
          <div className="flex items-center gap-4 text-xs text-ink-500">
            <a href="#" className="transition-colors hover:text-ink-300">Privacy</a>
            <a href="#" className="transition-colors hover:text-ink-300">Terms</a>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Operational
            </span>
          </div>
          <Socials />
        </div>
      </div>
    </footer>
  );
}
