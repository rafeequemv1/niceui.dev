import { useEffect, useState } from 'react';
import { ArrowRight, Check, Code2, Contrast, Copy, Accessibility, Paintbrush, Sparkles, Terminal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from '@/components/gallery/art';
import { Reveal, useInView } from '@/pages/landing/shared/motion';
import { Heading, QButton, Tag } from './ui';
import { PreviewWall } from './Wall';

/* ——— hero ——— */

export function QuarryHero() {
  const [copied, setCopied] = useState(false);
  const cmd = 'npx quarry add hero';
  const copy = () => {
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <section className="relative pt-16 md:pt-24">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#c8d5b9]/[.06] blur-[100px]" />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <Tag>
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8d5b9]" /> Sections for React and Tailwind
          </Tag>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-7 text-[42px] font-medium leading-[1.02] tracking-[-0.045em] sm:text-[60px] md:text-[76px]">
            <span className="text-[#f2efe9]">Pages that feel finished.</span>
            <br />
            <span className="text-[#6f6c66]">On day one.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-[#8b8880] md:text-[17px]">
            Quarry is a hand-built library of 380 page sections and 160 UI parts. Many are free. Copy the source, or let your coding agent pull them straight into your project.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <QButton>
              Explore the library <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </QButton>
            <button
              onClick={copy}
              className="flex h-12 items-center gap-2.5 rounded-xl border border-white/[.08] px-4 font-mono text-[13px] text-[#cfcbc3] transition-colors hover:border-white/20 hover:text-white"
              aria-label={`Copy ${cmd}`}
            >
              <Terminal className="h-4 w-4 text-[#8b8880]" />
              {cmd}
              <span className="grid h-6 w-6 place-items-center rounded-md bg-white/[.05]">
                {copied ? <Check className="h-3.5 w-3.5 text-[#c8d5b9]" /> : <Copy className="h-3.5 w-3.5 text-[#8b8880]" />}
              </span>
            </button>
          </div>
          <p className="mt-6 text-[12.5px] text-[#6f6c66]">
            <span className="text-[#cfcbc3]">540 building blocks</span> · new ones every Thursday
          </p>
        </Reveal>
      </div>
      <div className="mt-14 md:mt-16">
        <PreviewWall />
      </div>
    </section>
  );
}

/* ——— stack ——— */

const STACK = ['React', 'Next.js', 'Tailwind', 'TypeScript', 'Vite', 'Remix', 'Astro', 'Motion', 'Radix', 'shadcn/ui'];

export function QuarryStack() {
  return (
    <section className="border-y border-white/[.05] py-12">
      <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#6f6c66]">Drops into the stack you already use</p>
      <div className="relative mt-7 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <style>{`@keyframes q-marq{to{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){.q-marq{animation:none!important}}`}</style>
        <div className="q-marq flex w-max gap-3" style={{ animation: 'q-marq 40s linear infinite' }}>
          {[...STACK, ...STACK].map((s, i) => (
            <span key={i} className="flex items-center gap-2 rounded-full border border-white/[.07] bg-white/[.02] px-4 py-2 text-[13px] text-[#cfcbc3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8d5b9]/70" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ——— features ——— */

const FEATURES = [
  { icon: Code2, title: 'The whole source', body: 'Every file, every line. Nothing compiled, nothing hidden.' },
  { icon: Paintbrush, title: 'Your tokens, your look', body: 'Colours, radius and type come from your Tailwind theme.' },
  { icon: Accessibility, title: 'Accessible by habit', body: 'Real buttons, focus rings, reduced motion and labels.' },
  { icon: Contrast, title: 'Light and dark', body: 'Both themes designed, not inverted as an afterthought.' },
];

export function QuarryFeatures() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-24 md:px-8 md:py-32">
      <Heading center tag="Why Quarry" a="Real code, not a black box." b="Bend it however you like." body="You get plain React and Tailwind you can read in a minute and change in five." />
      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 70}>
            <div className="group h-full rounded-2xl border border-white/[.06] bg-[#141413] p-6 transition-colors duration-300 hover:border-white/[.12] hover:bg-[#171716]">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[.08] text-[#cfcbc3] transition-colors group-hover:border-[#c8d5b9]/40 group-hover:text-[#c8d5b9]">
                <f.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              </span>
              <p className="mt-8 text-[15px] font-medium text-[#f2efe9]">{f.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#8b8880]">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ——— templates ——— */

const TEMPLATES = [
  { name: 'Hollow House', kind: 'Architecture', art: 0, title: 'HOLLOW', serif: true, free: true },
  { name: 'Verso Bistro', kind: 'Restaurant', art: 6, title: 'Verso', serif: true, mesh: true },
  { name: 'Cadence Coach', kind: 'Fitness', art: 5, title: 'Train the long game.', free: true },
  { name: 'Salt & Sage', kind: 'Wellness', art: 1, title: 'Slow mornings', serif: true, mesh: true },
];

export function QuarryTemplates() {
  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-8">
        <Heading a="Whole sites," b="already put together." body="Nav to footer, written for one kind of business. Free ones include every line of source." />
        <a href="#" className="group flex shrink-0 items-center gap-1.5 text-[13.5px] text-[#cfcbc3] hover:text-white">
          Browse all templates <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1240px] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible md:px-8">
        {TEMPLATES.map((t, i) => (
          <Reveal key={t.name} delay={i * 80} className="w-[78%] shrink-0 snap-start md:w-auto">
            <a href="#" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/[.07]">
                <img src={artwork(t.art, 480, 600, 'mesh' in t && t.mesh ? 'mesh' : 'landscape')} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25),transparent_35%,rgba(0,0,0,.55))]" />
                <div className="absolute inset-x-4 top-3.5 flex items-center gap-2 text-white/80">
                  <span className="h-1.5 w-8 rounded-full bg-current" />
                  <span className="ml-auto h-1 w-5 rounded-full bg-current opacity-60" />
                  <span className="h-1 w-5 rounded-full bg-current opacity-60" />
                </div>
                <p className={cn('absolute inset-x-5 top-14 text-white', t.serif ? 'font-serif text-[34px] leading-none' : 'text-[24px] font-medium leading-tight tracking-[-0.03em]')}>{t.title}</p>
                <span className="absolute bottom-4 left-5 flex translate-y-2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Preview <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 px-1">
                <span className="text-[13.5px] text-[#f2efe9]">{t.name}</span>
                {t.free && <span className="rounded bg-[#c8d5b9]/15 px-1.5 py-px font-mono text-[9.5px] uppercase tracking-wider text-[#c8d5b9]">Free</span>}
                <span className="ml-auto text-[12px] text-[#6f6c66]">{t.kind}</span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ——— agent ——— */

const PROMPT = 'Add a pricing section with a yearly toggle';
const STEPS = ['Reading your Tailwind theme', 'Found pricing-tiers · 3 variants', 'Writing components/Pricing.tsx'];

function AgentDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => setT((x) => (x + 1) % 120), 80);
    return () => window.clearInterval(id);
  }, [inView]);
  const typed = PROMPT.slice(0, Math.min(PROMPT.length, t));
  const phase = t < PROMPT.length + 4 ? 0 : t < 70 ? 1 : 2;
  const stepCount = phase === 0 ? 0 : Math.min(3, Math.floor((t - PROMPT.length - 4) / 8) + 1);
  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl border border-white/[.07]">
      <img src={artwork(5, 760, 560)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,13,.15),rgba(14,14,13,.6))]" />
      <div className="relative flex min-h-[380px] flex-col justify-end gap-3 p-5 md:min-h-[440px] md:p-7">
        <div className={cn('rounded-xl border border-white/10 bg-[#111]/80 p-3 backdrop-blur-md transition-all duration-500', stepCount ? 'opacity-100' : 'translate-y-2 opacity-0')}>
          {STEPS.slice(0, stepCount).map((s, i) => (
            <p key={s} className="flex items-center gap-2 py-1 font-mono text-[11.5px] text-[#cfcbc3]">
              {i < stepCount - 1 || phase === 2 ? <Check className="h-3.5 w-3.5 text-[#c8d5b9]" /> : <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/20 border-t-[#c8d5b9]" />}
              {s}
            </p>
          ))}
        </div>
        {phase === 2 && (
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f2efe9] p-3 text-black" style={{ animation: 'q-pop .5s cubic-bezier(.2,.9,.3,1.2) both' }}>
            {['Starter', 'Studio'].map((n, i) => (
              <div key={n} className={cn('rounded-lg p-2.5', i ? 'bg-[#141413] text-white' : 'bg-white')}>
                <p className="text-[11px] opacity-60">{n}</p>
                <p className="text-[18px] font-medium">{i ? '$24' : '$0'}</p>
                <span className={cn('mt-2 block h-4 rounded', i ? 'bg-[#c8d5b9]' : 'bg-black/10')} />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111]/85 p-2 pl-3.5 backdrop-blur-md">
          <Sparkles className="h-4 w-4 shrink-0 text-[#c8d5b9]" />
          <span className="min-w-0 flex-1 truncate text-[13.5px] text-white">
            {typed}
            {phase === 0 && <span className="ml-px inline-block h-4 w-px animate-pulse bg-white align-middle" />}
          </span>
          <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors', typed.length === PROMPT.length ? 'bg-[#f2efe9] text-black' : 'bg-white/10 text-white/40')}>
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
      <style>{`@keyframes q-pop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

export function QuarryAgent() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 md:px-8">
      <div className="grid items-center gap-10 rounded-[28px] border border-white/[.06] bg-[#121211] p-6 md:grid-cols-2 md:gap-14 md:p-12">
        <div>
          <Heading tag="Agent bridge" a="Describe it." b="Watch it land in your code." body="Connect Quarry to your coding agent once. Ask for a section in plain words, and it fetches the right source, matches your theme and writes the file." />
          <ul className="mt-7 space-y-2.5 text-[13.5px] text-[#cfcbc3]">
            {['Works in any editor that speaks MCP', 'Free sections need no account', 'Keeps your naming and folder layout'].map((s) => (
              <li key={s} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#c8d5b9]" /> {s}
              </li>
            ))}
          </ul>
          <QButton className="mt-8">Connect your agent</QButton>
        </div>
        <AgentDemo />
      </div>
    </section>
  );
}
