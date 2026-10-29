import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, CloudUpload, FileVideo2, Github, Linkedin, Minus, Plus, Sparkles, Twitter, Youtube } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useCountUp, useInView } from '@/pages/landing/shared/motion';
import { ACC, ACCENT, DitherCanvas, INK, PAPER, SCREEN, clamp, scenes, sunrise, type Field } from './dither';
import { Corners, Eyebrow, Mark, RButton, SectionHead, Serif, scrollToRushes } from './ui';

function useLoop(seconds: number, fps = 12) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    const id = window.setInterval(() => setT(((performance.now() - start) / 1000) % seconds), 1000 / fps);
    return () => clearInterval(id);
  }, [inView, seconds, fps]);
  return { ref, t, live: inView && !window.matchMedia('(prefers-reduced-motion: reduce)').matches };
}

/* ——— Workflow ——— */

function Ingest() {
  const { ref, t, live } = useLoop(6);
  const files = [
    ['A001_C004.mov', '2.1 GB', 0],
    ['phone_broll_07.mp4', '640 MB', 0.5],
    ['podcast_ep42.wav', '310 MB', 1],
  ] as const;
  return (
    <div ref={ref} className="space-y-2">
      {files.map(([n, s, d]) => {
        const p = live ? clamp((t - d) / 2.4) : 1;
        return (
          <div key={n} className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-zinc-200">
            <div className="flex items-center gap-2 text-[12px]">
              <FileVideo2 className="h-3.5 w-3.5 text-zinc-400" />
              <span className="truncate font-medium text-zinc-800">{n}</span>
              <span className="ml-auto font-mono text-[10.5px] text-zinc-400">{p < 1 ? `${Math.round(p * 100)}%` : s}</span>
              {p >= 1 && <Check className="h-3.5 w-3.5 text-[#ff4f1f]" />}
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-zinc-900" style={{ width: `${p * 100}%` }} />
            </div>
          </div>
        );
      })}
      <p className="flex items-center gap-1.5 pt-1 font-mono text-[10.5px] text-zinc-500">
        <CloudUpload className="h-3.5 w-3.5" /> Multicam synced · transcribing {live ? Math.min(100, Math.round((t / 4) * 100)) : 100}%
      </p>
    </div>
  );
}

function Direct() {
  const { ref, t, live } = useLoop(6);
  const done = !live || (t > 2.6 && t < 5.6);
  const blocks = [0.18, 0.06, 0.2, 0.05, 0.16, 0.08, 0.22];
  return (
    <div ref={ref} className="space-y-3">
      <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-zinc-950 px-3 py-2 text-[12.5px] leading-snug text-white">Cut it to 60 seconds, keep the laugh, open on the sunrise.</p>
      <div className="rounded-xl bg-white p-2.5 ring-1 ring-zinc-200">
        <div className="flex h-8 gap-0.5">
          {blocks.map((b, i) => {
            const drop = i % 2 === 1;
            return (
              <span key={i} className={cn('h-full rounded-[4px] transition-all duration-700 ease-smooth', drop ? 'bg-[#ff4f1f]/70' : i === 4 ? 'bg-[#ff4f1f]' : 'bg-zinc-800')} style={{ flexGrow: done && drop ? 0 : b * 100, flexBasis: 0, opacity: done && drop ? 0 : 1 }} />
            );
          })}
          <span className="h-full rounded-[4px] border border-dashed border-zinc-300 transition-all duration-700 ease-smooth" style={{ flexGrow: done ? 19 : 0, flexBasis: 0, opacity: done ? 1 : 0 }} />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#ff4f1f]" /> {done ? 'Edited · 3 cuts, 1 move' : 'Director is cutting…'}
          </span>
          <span className="tabular-nums text-zinc-900">{done ? '00:59:22' : '01:14:08'}</span>
        </div>
      </div>
    </div>
  );
}

function Publish() {
  const { ref, t, live } = useLoop(6.5);
  const outs = ['Long-form · 4K 16:9', 'Vertical · 1080×1920', 'Square · 1080×1080', 'Captions · SRT + burned-in', 'Audio · −14 LUFS'];
  return (
    <div ref={ref} className="space-y-1.5">
      {outs.map((o, i) => {
        const ok = !live || t > 0.6 + i * 0.75;
        return (
          <div key={o} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-[12.5px] ring-1 ring-zinc-200">
            <span className={cn('grid h-4 w-4 place-items-center rounded-full transition-all duration-300', ok ? 'bg-[#ff4f1f] text-white' : 'bg-zinc-100 text-transparent')}>
              <Check className="h-2.5 w-2.5" />
            </span>
            <span className={cn('transition-colors', ok ? 'text-zinc-900' : 'text-zinc-400')}>{o}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Workflow() {
  const steps = [
    { n: '01', title: 'Drop your rushes', body: 'Cards, phone clips, screen recordings, a three-hour podcast. Rushes ingests, syncs multicam and transcribes while it uploads.', visual: <Ingest /> },
    { n: '02', title: 'Direct in plain English', body: 'Say what you want the way you’d tell an editor. Every decision lands on the timeline, so nothing is a black box.', visual: <Direct /> },
    { n: '03', title: 'Publish everywhere', body: 'Every aspect ratio, caption file and language from one cut, rendered in the cloud in minutes.', visual: <Publish /> },
  ];
  return (
    <section id="rushes-workflow" className="relative scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <SectionHead
          center
          tag="How it works"
          title={
            <>
              From card to cut,
              <br />
              <Serif>in three moves.</Serif>
            </>
          }
          body="No new tools to learn. If you can write a message, you can direct an edit."
        />
        <div className="relative mt-16 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          <div aria-hidden className="pointer-events-none absolute left-[16%] right-[16%] top-[30px] hidden h-px lg:block" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #d4d4d8 0 3px, transparent 3px 7px)' }} />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="relative flex h-full flex-col rounded-[28px] border border-zinc-200/80 bg-white p-2">
                <div className="flex items-center gap-3 px-4 pb-1 pt-4">
                  <span className="relative grid h-9 w-9 place-items-center rounded-full bg-zinc-950 font-mono text-[11px] font-medium text-white ring-8 ring-white">{s.n}</span>
                  <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-zinc-950">{s.title}</h3>
                </div>
                <p className="px-4 pb-5 pt-2 text-[14.5px] leading-relaxed text-zinc-500">{s.body}</p>
                <div className="mt-auto rounded-[22px] border border-zinc-100 bg-zinc-50/70 p-4">{s.visual}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ——— Stats ——— */

const halftoneNum = {
  backgroundImage: 'radial-gradient(circle, #0b0b0c 1.25px, transparent 1.5px)',
  backgroundSize: '3.6px 3.6px',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
} as const;

function Stat({ to, decimals = 0, suffix, label, active }: { to: number; decimals?: number; suffix: string; label: string; active: boolean }) {
  const v = useCountUp(to, active, 2000);
  return (
    <div className="px-2 py-8 text-center sm:px-6 md:py-10">
      <p className="text-[64px] font-semibold leading-none tracking-[-0.06em] sm:text-[88px]" style={halftoneNum}>
        {v.toFixed(decimals)}
        <span className="text-[#ff4f1f] [-webkit-text-fill-color:#ff4f1f]">{suffix}</span>
      </p>
      <p className="mt-3 text-[14px] text-zinc-500">{label}</p>
    </div>
  );
}

export function Stats() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <section className="border-y border-zinc-100 bg-white">
      <div ref={ref} className="mx-auto grid max-w-7xl grid-cols-2 divide-zinc-100 px-2 lg:grid-cols-4 lg:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-zinc-100 lg:[&>*:nth-child(-n+2)]:border-b-0 [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-zinc-100 lg:[&>*:nth-child(odd)]:border-r-0">
        <Stat to={6} suffix="×" label="faster to a first cut" active={inView} />
        <Stat to={11} suffix="M" label="hours of footage edited" active={inView} />
        <Stat to={29} suffix="" label="languages, in your voice" active={inView} />
        <Stat to={4.9} decimals={1} suffix="★" label="from 12,000 reviews" active={inView} />
      </div>
    </section>
  );
}

/* ——— Testimonials ——— */

const QUOTES = [
  { q: 'We publish a long-form episode and twelve shorts every week with two people. That used to be a team of six.', n: 'Jonah Reyes', r: 'Head of video, Field & Frame', m: '−31 h / week' },
  { q: 'The captions alone paid for it. The B-roll generation is the part clients ask about.', n: 'Priya Natarajan', r: 'Founder, Pellucid Studio', m: '3× client output' },
  { q: 'It edits like someone who has watched every take, because it has. I just argue with it about pacing.', n: 'Tomás Lindqvist', r: 'Documentary editor', m: '4K, 9 languages' },
];

export function Testimonials() {
  const portrait = useMemo<Field>(() => (u, v, t, ar) => scenes.portrait(0.36 + u * 0.56, v, t, 16 / 9), []);
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <Reveal>
          <div className="grid items-center gap-8 rounded-[32px] border border-zinc-200/80 bg-white p-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12 md:p-4">
            <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[#0d0d0e] md:aspect-[4/5]">
              <DitherCanvas field={portrait} pixel={3} ink={PAPER} bg={SCREEN} fps={20} className="absolute inset-0" />
              <Corners className="m-4 text-white/40" size={16} />
              <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 py-1 pl-1 pr-3 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur">
                <span className="h-5 w-5 rounded-full bg-[#ff4f1f]" /> 1.2M subscribers
              </span>
            </div>
            <div className="px-3 pb-6 md:px-0 md:pb-0 md:pr-10">
              <Eyebrow>Customer story</Eyebrow>
              <blockquote className="mt-6 font-serif text-[30px] italic leading-[1.15] tracking-[-0.02em] text-zinc-950 sm:text-[42px]">
                “Rushes gave me my weekends back. I shoot on Saturday, and the first cut is waiting when I wake up on Sunday.”
              </blockquote>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="text-[15px] font-semibold text-zinc-950">Maya Ocampo</p>
                  <p className="text-[13.5px] text-zinc-500">Documentary filmmaker</p>
                </div>
                <span className="hidden h-8 w-px bg-zinc-200 sm:block" />
                <div className="flex gap-6">
                  {[
                    ['14 h', 'saved per video'],
                    ['9', 'languages live'],
                  ].map(([a, b]) => (
                    <div key={b}>
                      <p className="font-mono text-[18px] text-zinc-950">{a}</p>
                      <p className="text-[12px] text-zinc-500">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {QUOTES.map((x, i) => (
            <Reveal key={x.n} delay={i * 90}>
              <figure className="flex h-full flex-col justify-between rounded-[28px] border border-zinc-200/80 bg-white p-6">
                <blockquote className="text-[16px] leading-relaxed text-zinc-800">“{x.q}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-zinc-950 text-[12px] font-semibold text-white" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 0.9px, transparent 1.1px)', backgroundSize: '3px 3px' }}>
                    {x.n
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-zinc-950">{x.n}</span>
                    <span className="block truncate text-[12.5px] text-zinc-500">{x.r}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#ff4f1f]/10 px-2 py-0.5 font-mono text-[10.5px] text-[#d63a0c]">{x.m}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ——— Pricing ——— */

const TIERS = [
  { name: 'Free', m: 0, y: 0, blurb: 'For your first films.', cta: 'Start free', features: ['60 AI minutes a month', '1080p export, no watermark', 'Text-based editing', 'Auto captions in 3 styles'] },
  { name: 'Creator', m: 20, y: 16, blurb: 'For people who publish every week.', cta: 'Start 14-day trial', featured: true, features: ['10 AI hours a month', '4K export', 'Studio Sound and reframe', '100 B-roll generations', 'Clips from long videos'] },
  { name: 'Studio', m: 45, y: 36, blurb: 'Per seat, for teams and agencies.', cta: 'Start 14-day trial', features: ['Unlimited AI hours', 'Dubbing in 29 languages', 'Brand kits and templates', 'Frame-accurate client review', 'Priority cloud render'] },
];

export function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="rushes-pricing" className="relative scroll-mt-16 border-t border-zinc-100 bg-[#fafaf9] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <SectionHead center tag="Pricing" title={
            <>
              Pay for the edit,
              <br />
              <Serif>not the seat count.</Serif>
            </>
          } body="Start free. Upgrade when you publish more than you can watch." />
        <div className="mt-10 flex justify-center">
          <div className="relative flex rounded-full bg-white p-1 ring-1 ring-zinc-200">
            <span className={cn('absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-zinc-950 transition-all duration-300 ease-smooth', yearly ? 'left-[calc(50%)]' : 'left-1')} />
            {[
              ['Monthly', false],
              ['Yearly · −20%', true],
            ].map(([l, v]) => (
              <button key={l as string} onClick={() => setYearly(v as boolean)} className={cn('relative z-10 w-36 rounded-full py-2 text-[13px] font-medium transition-colors', yearly === v ? 'text-white' : 'text-zinc-500 hover:text-zinc-900')}>
                {l as string}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          {TIERS.map((t, i) => {
            const price = yearly ? t.y : t.m;
            return (
              <Reveal key={t.name} delay={i * 90}>
                <div className={cn('relative flex h-full flex-col overflow-hidden rounded-[28px] p-7', t.featured ? 'bg-zinc-950 text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]' : 'border border-zinc-200/80 bg-white')}>
                  {t.featured && (
                    <>
                      <DitherCanvas field={featuredGlow} pixel={3} ink="#3f3f46" fps={16} className="absolute inset-x-0 top-0 h-48 [mask-image:linear-gradient(black,transparent)]" />
                      <span className="absolute right-6 top-7 rounded-full bg-[#ff4f1f] px-2.5 py-1 text-[11px] font-medium text-white">Most popular</span>
                    </>
                  )}
                  <div className="relative">
                    <h3 className={cn('text-[15px] font-medium', t.featured ? 'text-white' : 'text-zinc-950')}>{t.name}</h3>
                    <p className={cn('mt-1 text-[13.5px]', t.featured ? 'text-zinc-400' : 'text-zinc-500')}>{t.blurb}</p>
                    <p className="mt-7 flex items-end gap-1.5">
                      <span key={price} className="text-[52px] font-semibold leading-none tracking-[-0.05em] animate-fade-up">${price}</span>
                      <span className={cn('pb-1.5 text-[13px]', t.featured ? 'text-zinc-400' : 'text-zinc-500')}>{price ? (t.name === 'Studio' ? '/ seat / mo' : '/ month') : 'forever'}</span>
                    </p>
                    <RButton variant={t.featured ? 'white' : 'dark'} className="mt-7 w-full" onClick={() => scrollToRushes('cta')}>
                      {t.cta}
                    </RButton>
                    <ul className="mt-8 space-y-3">
                      {t.features.map((f) => (
                        <li key={f} className={cn('flex items-start gap-2.5 text-[14px]', t.featured ? 'text-zinc-300' : 'text-zinc-600')}>
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4f1f]" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mx-auto mt-4 max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-zinc-200/80 bg-white px-7 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[15px] font-semibold text-zinc-950">Enterprise and broadcast</p>
              <p className="mt-0.5 text-[13.5px] text-zinc-500">SSO, on-prem render nodes, MAM integrations and an SLA your legal team will like.</p>
            </div>
            <RButton variant="light" className="h-10 shrink-0" onClick={() => scrollToRushes('cta')}>
              Talk to us <ArrowRight className="h-4 w-4" />
            </RButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const featuredGlow: Field = (u, v, t, ar) => {
  const x = (u - 0.8) * ar;
  const d = Math.hypot(x, v + 0.1);
  return clamp(0.9 - d * 0.9 + Math.sin(u * 14 - t * 0.8 + v * 6) * 0.08);
};

/* ——— FAQ ——— */

const FAQS = [
  ['Is the edit really mine to change?', 'Yes. Director makes ordinary cuts, moves and effects on a normal multitrack timeline. Undo anything, nudge any cut by a frame, or turn the AI off entirely.'],
  ['Which cameras and formats do you support?', 'ProRes, H.264, H.265, BRAW proxies, phone footage and most audio formats. Multicam sync works from timecode or audio.'],
  ['Can I export to Premiere, Resolve or Final Cut?', 'Every plan exports XML and EDL with media relinking, so you can finish a grade or mix wherever you like.'],
  ['Is my footage used to train models?', 'No. Your media is encrypted at rest and never used for training. Studio and Enterprise plans can choose the storage region.'],
  ['How does voice cloning stay safe?', 'Cloning requires a recorded consent phrase from the speaker, and every dubbed export carries an inaudible watermark.'],
  ['What counts as an AI minute?', 'One minute of source footage processed by any AI feature. Editing, playback and exports never use minutes.'],
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="rushes-faq" className="scroll-mt-16 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionHead
          tag="FAQ"
          title={
            <>
              Questions,
              <br />
              <Serif>answered.</Serif>
            </>
          }
          body={
            <>
              Something else? Write to <span className="text-zinc-950 underline decoration-zinc-300 underline-offset-4">hello@rushes.video</span>, a human editor replies.
            </>
          }
        />
        <div className="divide-y divide-zinc-200/80 border-y border-zinc-200/80">
          {FAQS.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q}>
                <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-6 py-5 text-left">
                  <span className="text-[17px] font-medium tracking-[-0.01em] text-zinc-950">{q}</span>
                  <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all duration-300', on ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-600')}>
                    {on ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <div className={cn('grid transition-all duration-500 ease-smooth', on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-zinc-500">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ——— CTA ——— */

export function Cta() {
  return (
    <section id="rushes-cta" className="scroll-mt-16 px-3 pb-3 sm:px-4">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] bg-[#0d0d0e] sm:rounded-[40px]">
        <DitherCanvas field={sunrise} pixel={3} ink={PAPER} accent={ACCENT} bg={SCREEN} fps={24} className="absolute inset-x-0 bottom-0 h-[230px] [mask-image:linear-gradient(to_bottom,transparent,black_32%)] sm:h-[400px]" />
        <Corners className="m-6 text-white/25 sm:m-8" size={22} />
        <div className="relative px-6 pb-[250px] pt-20 text-center sm:pb-[380px] sm:pt-28">
          <Eyebrow className="text-white/50">Your next film</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-4xl text-[44px] font-semibold leading-[0.98] tracking-[-0.05em] text-white sm:text-[76px]">
            Your best cut is
            <br />
            <Serif>already in the footage.</Serif>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-white/60">Upload a card tonight. Wake up to a first cut, captions and ten shorts.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RButton variant="white" className="h-12 w-full px-6 text-[15px] sm:w-auto">
              Start editing free <ArrowRight className="h-4 w-4" />
            </RButton>
            <RButton className="h-12 w-full bg-white/10 px-6 text-[15px] shadow-none ring-1 ring-white/15 hover:bg-white/15 sm:w-auto">Book a demo</RButton>
          </div>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">Free forever plan · No card needed</p>
        </div>
      </div>
    </section>
  );
}

/* ——— Footer ——— */

function DitheredWordmark() {
  const [mask, setMask] = useState<{ data: Uint8ClampedArray; w: number; h: number } | null>(null);
  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive) return;
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const font = '600 400px Geist, Inter, system-ui, sans-serif';
      ctx.font = font;
      const ls = 'letterSpacing' in ctx;
      const word = 'rushes';
      const m = ctx.measureText(word);
      const dot = ctx.measureText('.');
      const track = -0.06 * 400;
      const w = Math.ceil(m.width + dot.width + (ls ? track * word.length : 0) + 40);
      const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 30);
      c.width = w;
      c.height = h;
      ctx.font = font;
      if (ls) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${track}px`;
      ctx.fillStyle = '#000';
      ctx.fillText(word, 10, m.actualBoundingBoxAscent + 14);
      const end = 10 + ctx.measureText(word).width;
      ctx.fillStyle = '#f00';
      ctx.fillText('.', end, m.actualBoundingBoxAscent + 14);
      setMask({ data: ctx.getImageData(0, 0, w, h).data, w, h });
    });
    return () => {
      alive = false;
    };
  }, []);

  const field = useMemo<Field>(
    () => (u, v, t) => {
      if (!mask) return 0;
      const i = (Math.floor(v * mask.h) * mask.w + Math.floor(u * mask.w)) * 4;
      const a = mask.data[i + 3] / 255;
      if (a < 0.4) return 0;
      const wave = 0.5 + 0.5 * Math.sin(u * 7 - t * 0.9 + v * 2.5);
      const d = a * (0.18 + 0.82 * v ** 1.3) * (0.7 + 0.3 * wave);
      return mask.data[i] > 128 ? ACC + 0.95 : d;
    },
    [mask],
  );

  return (
    <div className="w-full" style={{ aspectRatio: mask ? `${mask.w} / ${mask.h}` : '1000 / 300' }}>
      {mask && <DitherCanvas field={field} pixel={3} ink={INK} fps={20} className="h-full w-full" />}
    </div>
  );
}

const COLS: [string, string[]][] = [
  ['Product', ['Editor', 'Director', 'B-roll', 'Studio Sound', 'Dubbing', 'Changelog']],
  ['Workflows', ['Podcasts', 'YouTube', 'Agencies', 'Newsrooms', 'Education']],
  ['Company', ['About', 'Careers', 'Press', 'Contact']],
  ['Legal', ['Privacy', 'Terms', 'Security', 'Voice consent']],
];

export function RushesFooter() {
  return (
    <footer className="relative bg-white pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <span className="flex items-center gap-2 text-zinc-950">
              <Mark className="h-7 w-7" />
              <span className="text-[19px] font-semibold tracking-[-0.04em]">rushes</span>
            </span>
            <p className="mt-4 max-w-xs text-[14.5px] leading-relaxed text-zinc-500">The AI video editor for people who would rather be filming.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex max-w-sm items-center gap-1.5 rounded-full border border-zinc-200 bg-white p-1 pl-4 focus-within:border-zinc-400">
              <input type="email" placeholder="you@studio.com" aria-label="Email" className="h-9 min-w-0 flex-1 bg-transparent text-[14px] text-zinc-900 outline-none placeholder:text-zinc-400" />
              <RButton className="h-9 px-4 text-[13px]">Get the newsletter</RButton>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map(([h, links]) => (
              <div key={h}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">{h}</p>
                <ul className="mt-4 space-y-2.5">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[14px] text-zinc-600 transition-colors hover:text-zinc-950">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16">
          <DitheredWordmark />
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-zinc-200/80 py-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-zinc-500">© 2026 Rushes Labs, Inc.</p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[12.5px] text-zinc-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> All render nodes online
            </span>
            {[Twitter, Youtube, Linkedin, Github].map((I, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} aria-label={['X', 'YouTube', 'LinkedIn', 'GitHub'][i]} className="text-zinc-400 transition-colors hover:text-zinc-950">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
