import { type ComponentType, type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Bell,
  Gauge,
  Globe2,
  Layers,
  Lock,
  Play,
  Search,
  ShieldCheck,
  Star,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/* ─── shared ───────────────────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes mk-sc-x { to { transform: translateX(-50%); } }
@keyframes mk-sc-y { to { transform: translateY(-50%); } }
@keyframes mk-sc-shimmer { 0% { transform: translateX(-100%); } 60%, 100% { transform: translateX(100%); } }
@keyframes mk-sc-spin { to { transform: rotate(360deg); } }
@keyframes mk-sc-ring { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(1.9); opacity: 0; } }
@keyframes mk-sc-bar { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
@keyframes mk-sc-blink { 50% { opacity: 0; } }
@keyframes mk-sc-pop { from { opacity: 0; transform: translateY(-8px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes mk-sc-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mk-sc-modal { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { [data-mk-sc] * { animation-duration: 0s !important; animation-iteration-count: 1 !important; } }
`;

function Keyframes() {
  return <style>{KEYFRAMES}</style>;
}

function Accent({ children }: { children: ReactNode }) {
  return <em className="font-serif font-normal italic text-brand-300">{children}</em>;
}

function SectionHead({ eyebrow, title, sub, align = 'center' }: { eyebrow?: string; title: ReactNode; sub?: string; align?: 'center' | 'left' }) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.02] px-3 py-1 font-mono text-[11px] text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_10px_#7dd3fc]" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-5 text-3xl font-medium leading-[1.05] tracking-[-0.05em] text-ink-50 sm:text-5xl">{title}</h2>
      {sub && <p className={cn('mt-4 text-[15px] leading-relaxed text-ink-400', align === 'center' && 'mx-auto max-w-lg')}>{sub}</p>}
    </div>
  );
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/* ─── FeatureGrid ──────────────────────────────────────────────────── */

export type Feature = { icon: ComponentType<{ className?: string }>; title: string; text: string };

const defaultFeatures: Feature[] = [
  { icon: Zap, title: 'Instant by default', text: 'Edge-rendered pages and streaming data keep every interaction under 100ms.' },
  { icon: ShieldCheck, title: 'Secure from day one', text: 'SSO, audit logs and encryption at rest — enabled before you ask.' },
  { icon: Layers, title: 'Composable blocks', text: 'Mix sections like Lego. Every piece shares tokens, spacing and motion.' },
  { icon: Wand2, title: 'AI that helps', text: 'Draft copy, generate variants and fix accessibility issues in a click.' },
  { icon: Globe2, title: 'Global from launch', text: 'Localised routing, currencies and time zones across 40 regions.' },
  { icon: Gauge, title: 'Measured, always', text: 'Real-user metrics and alerts so regressions never reach customers.' },
];

function SpotlightCell({ f }: { f: Feature }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -400, y: -400 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const Icon = f.icon;
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: -400, y: -400 })}
      className="group relative overflow-hidden bg-ink-950 p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, rgba(125,211,252,.11), transparent 60%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(125,211,252,.55), transparent 60%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: 1,
        }}
      />
      <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-ink-300 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:rotate-[-6deg] group-hover:border-brand-300/40 group-hover:bg-brand-300/10 group-hover:text-brand-300 group-hover:shadow-[0_0_24px_-4px_rgba(125,211,252,.6)]">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <h3 className="relative mt-5 text-[16px] font-medium tracking-[-0.02em] text-ink-50">{f.title}</h3>
      <p className="relative mt-2 text-[14px] leading-relaxed text-ink-400">{f.text}</p>
    </div>
  );
}

export function FeatureGrid({
  eyebrow = 'Platform',
  title = (
    <>
      Everything you need. <Accent>Nothing</Accent> you don't.
    </>
  ),
  sub = 'A focused toolkit that scales from your first user to your millionth.',
  features = defaultFeatures,
  className,
}: { eyebrow?: string; title?: ReactNode; sub?: string; features?: Feature[]; className?: string }) {
  return (
    <section data-mk-sc className={cn('w-full bg-ink-950 px-4 py-16 sm:px-8', className)}>
      <SectionHead eyebrow={eyebrow} title={title} sub={sub} />
      <div className="mx-auto mt-12 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.07] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <SpotlightCell key={f.title} f={f} />
        ))}
      </div>
    </section>
  );
}

/* ─── BentoGrid ────────────────────────────────────────────────────── */

function Tile({ className, title, text, children }: { className?: string; title: string; text: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-brand-300/35 hover:shadow-[0_24px_60px_-28px_rgba(56,189,248,.45)]',
        className,
      )}
    >
      <span aria-hidden className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/0 to-transparent transition-colors duration-500 group-hover:via-brand-300/80" />
      <div className="relative flex min-h-[130px] flex-1 items-center justify-center overflow-hidden px-5 pt-5">{children}</div>
      <div className="relative px-5 pb-5 pt-4">
        <h3 className="text-[15px] font-medium tracking-[-0.02em] text-ink-50">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{text}</p>
      </div>
    </div>
  );
}

function MiniBars() {
  const bars = [0.5, 0.8, 0.4, 0.95, 0.65, 0.85, 0.55, 1, 0.7, 0.9];
  return (
    <div className="flex h-24 w-full max-w-[260px] items-end gap-1.5">
      {bars.map((h, i) => (
        <span
          key={i}
          className="flex-1 origin-bottom rounded-t-[3px] bg-gradient-to-t from-brand-500/30 to-brand-300"
          style={{ height: `${h * 100}%`, animation: `mk-sc-bar ${2.2 + (i % 4) * 0.35}s ease-in-out ${i * 0.12}s infinite` }}
        />
      ))}
    </div>
  );
}

function TypingSearch() {
  const words = ['pricing table', 'hero with video', 'bento grid', 'testimonials'];
  const [w, setW] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const word = words[w];
    const t = setTimeout(
      () => {
        if (n < word.length) setN(n + 1);
        else {
          setN(0);
          setW((x) => (x + 1) % words.length);
        }
      },
      n < word.length ? 85 : 1400,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, w]);
  return (
    <div className="w-full max-w-[280px] rounded-xl border border-white/10 bg-ink-950/80 shadow-pop">
      <div className="flex items-center gap-2 border-b border-white/[.07] px-3 py-2.5 text-[13px]">
        <Search className="h-3.5 w-3.5 text-ink-500" />
        <span className="text-ink-100">{words[w].slice(0, n)}</span>
        <span className="-ml-1.5 h-4 w-px bg-brand-300" style={{ animation: 'mk-sc-blink 1s steps(1) infinite' }} />
      </div>
      <div className="space-y-1 p-1.5">
        {[0, 1].map((i) => (
          <div key={i} className={cn('flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px]', i === 0 ? 'bg-brand-300/10 text-ink-100' : 'text-ink-500')}>
            <span className="h-1.5 rounded bg-current opacity-40" style={{ width: i === 0 ? 96 : 70 }} />
            <span className="font-mono text-[10px]">{i === 0 ? '↵' : 'block'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DotGlobe() {
  const dots: { x: number; y: number; r: number }[] = [];
  for (let lat = -70; lat <= 70; lat += 14) {
    const rad = Math.cos((lat * Math.PI) / 180);
    const count = Math.max(6, Math.round(22 * rad));
    for (let i = 0; i < count; i++) dots.push({ x: (i / count) * 360, y: lat, r: rad });
  }
  return (
    <div className="relative h-32 w-32">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(125,211,252,.25),transparent_60%)] ring-1 ring-white/10" />
      <svg viewBox="-60 -60 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
        <g>
          {dots.map((d, i) => {
            const lon = d.x;
            return (
              <circle key={i} r="1.1" fill="#7dd3fc">
                <animate
                  attributeName="cx"
                  dur="14s"
                  repeatCount="indefinite"
                  values={[0, 90, 180, 270, 360].map((a) => (Math.sin(((lon + a) * Math.PI) / 180) * 52 * d.r).toFixed(2)).join(';')}
                />
                <animate
                  attributeName="opacity"
                  dur="14s"
                  repeatCount="indefinite"
                  values={[0, 90, 180, 270, 360].map((a) => (Math.cos(((lon + a) * Math.PI) / 180) > 0 ? 0.9 : 0.12).toString()).join(';')}
                />
                <set attributeName="cy" to={(-d.y * 0.74).toFixed(2)} />
              </circle>
            );
          })}
        </g>
      </svg>
      <span className="absolute left-[62%] top-[38%] h-2 w-2 rounded-full bg-brand-300 shadow-[0_0_12px_#7dd3fc]">
        <span className="absolute inset-0 rounded-full bg-brand-300" style={{ animation: 'mk-sc-ring 1.8s ease-out infinite' }} />
      </span>
    </div>
  );
}

function NotificationStack() {
  const items = [
    ['New signup', 'ada@halcyon.io joined Pro'],
    ['Payment received', '$1,240 from Monolith'],
    ['Deploy succeeded', 'main → production in 42s'],
    ['Review requested', 'Hana tagged you on #318'],
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 2200);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <div className="relative h-[120px] w-full max-w-[280px]">
      {[2, 1, 0].map((depth) => {
        const [t, s] = items[(i + depth) % items.length];
        return (
          <div
            key={`${i}-${depth}`}
            className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/95 px-3 py-2.5 shadow-pop transition-all duration-500"
            style={{
              transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`,
              opacity: 1 - depth * 0.3,
              zIndex: 3 - depth,
              animation: depth === 0 ? 'mk-sc-pop .5s cubic-bezier(.2,.8,.2,1)' : undefined,
            }}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-300/10 text-brand-300">
              <Bell className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] text-ink-100">{t}</span>
              <span className="block truncate text-[11px] text-ink-500">{s}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SettingsTile() {
  const [on, setOn] = useState([true, false, true]);
  useEffect(() => {
    const t = setInterval(() => setOn((o) => [o[0], !o[1], o[2]]), 2600);
    return () => clearInterval(t);
  }, []);
  const labels = ['Two-factor auth', 'Beta features', 'Weekly digest'];
  return (
    <div className="w-full max-w-[240px] space-y-2.5">
      {labels.map((l, i) => (
        <button
          key={l}
          type="button"
          onClick={() => setOn((o) => o.map((v, k) => (k === i ? !v : v)))}
          className="flex w-full items-center justify-between text-[13px] text-ink-300"
        >
          <span className="flex items-center gap-2">
            {i === 0 && <Lock className="h-3.5 w-3.5 text-ink-500" />}
            {l}
          </span>
          <span className={cn('relative h-5 w-9 rounded-full transition-colors duration-300', on[i] ? 'bg-brand-300' : 'bg-white/10')}>
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-300 [transition-timing-function:cubic-bezier(.2,1.4,.4,1)]', on[i] ? 'left-[18px] bg-brand-950' : 'left-0.5 bg-ink-400')} />
          </span>
        </button>
      ))}
    </div>
  );
}

function CodeShimmer() {
  return (
    <div className="relative w-full max-w-[300px] overflow-hidden rounded-xl border border-white/10 bg-ink-950/80 p-3.5 font-mono text-[11.5px] leading-6 shadow-pop">
      <p>
        <span className="text-brand-300">import</span> <span className="text-ink-200">{'{ Hero }'}</span> <span className="text-brand-300">from</span>{' '}
        <span className="text-sky-200/80">'@/blocks'</span>
      </p>
      <p className="text-ink-500">// one line, fully themed</p>
      <p>
        <span className="text-brand-400">&lt;Hero</span> <span className="text-ink-300">variant</span>=<span className="text-sky-200/80">"aurora"</span> <span className="text-brand-400">/&gt;</span>
      </p>
      <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-300/[.09] to-transparent" style={{ animation: 'mk-sc-shimmer 3.2s ease-in-out infinite' }} />
    </div>
  );
}

export function BentoGrid({
  eyebrow = 'Why teams switch',
  title = (
    <>
      Built for the <Accent>whole</Accent> product.
    </>
  ),
  sub = 'Analytics, search, global delivery and settings — designed as one system.',
  className,
}: { eyebrow?: string; title?: ReactNode; sub?: string; className?: string }) {
  return (
    <section data-mk-sc className={cn('w-full bg-ink-950 px-4 py-16 sm:px-8', className)}>
      <Keyframes />
      <SectionHead eyebrow={eyebrow} title={title} sub={sub} />
      <div className="mx-auto mt-12 grid max-w-5xl auto-rows-[minmax(230px,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Tile className="lg:col-span-2" title="Real-time analytics" text="Live revenue, retention and funnels, streamed as events land.">
          <MiniBars />
        </Tile>
        <Tile title="Instant search" text="Typo-tolerant search across every block and page.">
          <TypingSearch />
        </Tile>
        <Tile className="lg:row-span-2" title="Global edge" text="Served from 40 regions with automatic failover.">
          <DotGlobe />
        </Tile>
        <Tile title="Live notifications" text="Signups, payments and deploys as they happen.">
          <NotificationStack />
        </Tile>
        <Tile title="Settings that make sense" text="Sensible defaults, one switch away.">
          <SettingsTile />
        </Tile>
        <Tile className="sm:col-span-2" title="One line to ship" text="Install a block and it inherits your theme, spacing and motion.">
          <CodeShimmer />
        </Tile>
      </div>
    </section>
  );
}

/* ─── logos ────────────────────────────────────────────────────────── */

export type Logo = { name: string; style: string };

export const defaultLogos: Logo[] = [
  { name: 'Halcyon', style: 'font-serif italic text-[22px]' },
  { name: 'PARALLAX', style: 'font-mono tracking-[0.22em] text-[13px]' },
  { name: 'kite', style: 'font-semibold lowercase text-[22px] tracking-[-0.04em]' },
  { name: 'Monolith', style: 'font-medium tracking-[-0.05em] text-[20px]' },
  { name: 'Arcadia', style: 'font-serif text-[21px]' },
  { name: 'fieldnote', style: 'font-mono text-[15px]' },
  { name: 'QUANTA', style: 'font-semibold tracking-[0.14em] text-[14px]' },
  { name: 'Sable&Co', style: 'font-medium italic text-[19px]' },
  { name: 'Orbital', style: 'font-light tracking-[0.06em] text-[19px]' },
  { name: 'nimbus', style: 'font-semibold text-[20px] tracking-[-0.03em]' },
  { name: 'Lumen/Labs', style: 'font-mono text-[14px] tracking-tight' },
  { name: 'Verity', style: 'font-serif italic text-[21px] tracking-wide' },
];

function LogoMark({ logo }: { logo: Logo }) {
  return <span className={cn('whitespace-nowrap text-ink-400 transition-colors duration-300 hover:text-ink-50', logo.style)}>{logo.name}</span>;
}

export function LogoMarquee({
  title = 'Trusted by product teams at',
  logos = defaultLogos,
  speed = 38,
  className,
}: { title?: string; logos?: Logo[]; speed?: number; className?: string }) {
  const half = Math.ceil(logos.length / 2);
  const rows = [logos.slice(0, half), logos.slice(half)];
  return (
    <section data-mk-sc className={cn('w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <Keyframes />
      <p className="text-center text-[13px] text-ink-500">{title}</p>
      <div className="mx-auto mt-8 max-w-5xl space-y-6">
        {rows.map((row, r) => (
          <div key={r} className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_14%,black_86%,transparent)]">
            <div
              className="flex w-max items-center gap-14 pr-14 group-hover:[animation-play-state:paused]"
              style={{ animation: `mk-sc-x ${speed + r * 6}s linear infinite ${r % 2 ? 'reverse' : ''}` }}
            >
              {[...row, ...row, ...row, ...row].map((l, i) => (
                <LogoMark key={i} logo={l} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LogoGridCycle({
  title = (
    <>
      Loved by teams that <Accent>ship weekly.</Accent>
    </>
  ),
  logos = defaultLogos,
  interval = 2600,
  className,
}: { title?: ReactNode; logos?: Logo[]; interval?: number; className?: string }) {
  const slots = 8;
  const [offset, setOffset] = useState(0);
  const [phase, setPhase] = useState<number | null>(null);
  useEffect(() => {
    let slot = 0;
    const t = setInterval(() => {
      setPhase(slot);
      setTimeout(() => {
        setOffset((o) => o + 1);
        setPhase(null);
      }, 380);
      slot = (slot + 3) % slots;
    }, interval);
    return () => clearInterval(t);
  }, [interval]);
  const logoFor = (i: number) => logos[(i + offset * (i % 2 ? 3 : 5)) % logos.length];
  return (
    <section data-mk-sc className={cn('w-full bg-ink-950 px-4 py-14 sm:px-8', className)}>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-white/[.07] md:grid-cols-[230px_1fr]">
        <div className="flex items-center border-b border-white/[.07] px-6 py-8 md:border-b-0 md:border-r">
          <p className="text-[19px] font-medium leading-snug tracking-[-0.03em] text-ink-100">{title}</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/[.07] sm:grid-cols-4">
          {Array.from({ length: slots }, (_, i) => (
            <div key={i} className="flex h-24 items-center justify-center bg-ink-950">
              <span
                className="transition-all duration-[380ms] ease-out"
                style={phase === i ? { opacity: 0, filter: 'blur(6px)', transform: 'translateY(-6px) scale(.96)' } : { opacity: 1, filter: 'blur(0)', transform: 'none' }}
              >
                <LogoMark logo={logoFor(i)} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── testimonials ─────────────────────────────────────────────────── */

export type Testimonial = { quote: string; name: string; role: string; rating?: number };

export const defaultTestimonials: Testimonial[] = [
  { quote: 'We replaced three internal component kits with this. Our designers finally trust what ships.', name: 'Imani Okafor', role: 'Design Eng Lead, Halcyon', rating: 5 },
  { quote: 'The motion is restrained in exactly the right way. It feels expensive without feeling busy.', name: 'Luca Bianchi', role: 'Staff Engineer, Monolith', rating: 5 },
  { quote: 'Our landing page went from a two-week project to an afternoon.', name: 'Hana Sato', role: 'Founder, kite' },
  { quote: 'Accessibility was handled before we asked. Keyboard, focus, reduced motion — all there.', name: 'Diego Ramos', role: 'CTO, Arcadia', rating: 5 },
  { quote: 'It is the first library where the defaults look better than what I would have built.', name: 'Priya Nair', role: 'VP Product, Quanta' },
  { quote: 'Copy, paste, ship. Then actually own the code. That is the whole pitch and it delivers.', name: 'Tom Becker', role: 'Head of Design, fieldnote', rating: 5 },
  { quote: 'Our conversion rate went up 18% after swapping in the new pricing section.', name: 'Sara Lindqvist', role: 'Growth Lead, Orbital' },
  { quote: 'Every block plays nicely with our tokens. No more one-off overrides.', name: 'Kwame Mensah', role: 'Frontend Lead, nimbus', rating: 5 },
  { quote: 'The AI components saved us months on our assistant launch.', name: 'Mei Chen', role: 'PM, Lumen Labs' },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn('h-3.5 w-3.5', i < n ? 'fill-brand-300 text-brand-300' : 'text-ink-700')} />
      ))}
    </span>
  );
}

function QuoteCard({ t, compact = false }: { t: Testimonial; compact?: boolean }) {
  return (
    <figure
      className={cn(
        'rounded-2xl border border-white/10 bg-ink-900/60 transition-colors duration-300 hover:border-brand-300/30',
        compact ? 'w-[300px] shrink-0 p-4' : 'p-5',
      )}
    >
      {t.rating && !compact && <Stars n={t.rating} />}
      <blockquote className={cn('leading-relaxed text-ink-200', compact ? 'text-[13.5px]' : 'mt-3 text-[14.5px]')}>“{t.quote}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-300/30 to-brand-700/30 text-[11px] font-medium text-brand-100 ring-1 ring-white/10">
          {initials(t.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] text-ink-100">{t.name}</span>
          <span className="block truncate text-[11.5px] text-ink-500">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialWall({
  eyebrow = 'Wall of love',
  title = (
    <>
      Teams <Accent>can't stop</Accent> talking.
    </>
  ),
  testimonials = defaultTestimonials,
  className,
}: { eyebrow?: string; title?: ReactNode; testimonials?: Testimonial[]; className?: string }) {
  const cols = [0, 1, 2].map((c) => testimonials.filter((_, i) => i % 3 === c));
  return (
    <section data-mk-sc className={cn('w-full bg-ink-950 px-4 py-16 sm:px-8', className)}>
      <Keyframes />
      <SectionHead eyebrow={eyebrow} title={title} />
      <div className="relative mx-auto mt-12 grid h-[460px] max-w-5xl gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-3 [mask-image:linear-gradient(transparent,black_14%,black_86%,transparent)]">
        {cols.map((col, c) => (
          <div key={c} className={cn('group', c === 1 && 'hidden sm:block', c === 2 && 'hidden lg:block')}>
            <div className="flex flex-col gap-4 group-hover:[animation-play-state:paused]" style={{ animation: `mk-sc-y ${28 + c * 7}s linear infinite ${c === 1 ? 'reverse' : ''}` }}>
              {[...col, ...col].map((t, i) => (
                <QuoteCard key={i} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialMarquee({
  featured = defaultTestimonials[1],
  testimonials = defaultTestimonials,
  className,
}: { featured?: Testimonial; testimonials?: Testimonial[]; className?: string }) {
  const rows = [testimonials.slice(0, 5), testimonials.slice(4)];
  return (
    <section data-mk-sc className={cn('w-full bg-ink-950 py-16', className)}>
      <Keyframes />
      <figure className="mx-auto max-w-3xl px-4 text-center sm:px-8">
        <span aria-hidden className="font-serif text-6xl leading-none text-brand-300/60">“</span>
        <blockquote className="-mt-4 text-2xl font-medium leading-snug tracking-[-0.03em] text-ink-50 sm:text-[32px]">{featured.quote}</blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-300 text-[12px] font-medium text-brand-950">{initials(featured.name)}</span>
          <span className="text-left">
            <span className="block text-[14px] text-ink-100">{featured.name}</span>
            <span className="block text-[12px] text-ink-500">{featured.role}</span>
          </span>
        </figcaption>
      </figure>
      <div className="mt-12 space-y-4">
        {rows.map((row, r) => (
          <div key={r} className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max gap-4 pr-4 group-hover:[animation-play-state:paused]" style={{ animation: `mk-sc-x ${44 + r * 8}s linear infinite ${r ? 'reverse' : ''}` }}>
              {[...row, ...row, ...row].map((t, i) => (
                <QuoteCard key={i} t={t} compact />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export type VideoTestimonial = Testimonial & { duration: string; poster: string; captions: string[] };

const defaultVideos: VideoTestimonial[] = [
  {
    ...defaultTestimonials[0],
    duration: '1:24',
    poster: 'radial-gradient(120% 90% at 20% 10%, #0c4a6e 0%, transparent 55%), radial-gradient(90% 80% at 90% 90%, #164e63 0%, transparent 60%), #05070a',
    captions: ['We had three design systems and none of them matched.', 'Within a month everything shipped from one library.', 'Our designers finally trust what goes live.'],
  },
  {
    ...defaultTestimonials[3],
    duration: '0:58',
    poster: 'radial-gradient(100% 90% at 80% 0%, #1e3a8a 0%, transparent 55%), radial-gradient(80% 70% at 10% 100%, #0e7490 0%, transparent 60%), #05070a',
    captions: ['Accessibility used to be our last-minute scramble.', 'Now it is the default state of every component.'],
  },
  {
    ...defaultTestimonials[6],
    duration: '2:05',
    poster: 'radial-gradient(110% 90% at 50% 0%, #075985 0%, transparent 55%), radial-gradient(70% 60% at 0% 80%, #3730a3 0%, transparent 60%), #05070a',
    captions: ['We swapped in the new pricing section on a Tuesday.', 'By Friday conversion was up eighteen percent.', 'Nothing else changed.'],
  },
];

function VideoModal({ v, onClose }: { v: VideoTestimonial; onClose: () => void }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / 9000);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, [onClose]);
  const caption = v.captions[Math.min(v.captions.length - 1, Math.floor(t * v.captions.length))];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" style={{ animation: 'mk-sc-fade .25s ease' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Video testimonial from ${v.name}`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-[0_40px_120px_-30px_rgba(56,189,248,.45)]"
        style={{ animation: 'mk-sc-modal .35s cubic-bezier(.2,.8,.2,1)' }}
      >
        <div className="relative aspect-video" style={{ background: v.poster }}>
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:4px_4px] opacity-40" />
          <div className="absolute left-1/2 top-[38%] grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/[.06] text-3xl font-medium text-ink-100 ring-1 ring-white/15 backdrop-blur">
            {initials(v.name)}
          </div>
          <p key={caption} className="absolute inset-x-0 bottom-16 px-8 text-center text-[15px] text-ink-50 sm:text-lg" style={{ animation: 'mk-sc-fade .4s ease' }}>
            <span className="rounded-md bg-black/55 px-2 py-1 [box-decoration-break:clone]">{caption}</span>
          </p>
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-10 font-mono text-[11px] text-ink-300">
            <span>{v.name}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-brand-300" style={{ width: `${t * 100}%` }} />
            </div>
            <span>{v.duration}</span>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-ink-200 ring-1 ring-white/15 transition hover:bg-black/70 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TestimonialVideo({
  eyebrow = 'Customer stories',
  title = (
    <>
      Hear it <Accent>from them.</Accent>
    </>
  ),
  videos = defaultVideos,
  className,
}: { eyebrow?: string; title?: ReactNode; videos?: VideoTestimonial[]; className?: string }) {
  const [open, setOpen] = useState<VideoTestimonial | null>(null);
  return (
    <section data-mk-sc className={cn('w-full bg-ink-950 px-4 py-16 sm:px-8', className)}>
      <Keyframes />
      <SectionHead eyebrow={eyebrow} title={title} />
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <button
            key={v.name}
            onClick={() => setOpen(v)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 text-left transition-all duration-500 hover:-translate-y-1 hover:border-brand-300/35 hover:shadow-[0_24px_60px_-28px_rgba(56,189,248,.5)]"
          >
            <div className="relative aspect-[4/3] transition-transform duration-700 group-hover:scale-[1.03]" style={{ background: v.poster }}>
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:4px_4px] opacity-40" />
              <span className="absolute left-1/2 top-[42%] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center">
                <span className="absolute inset-0 rounded-full bg-brand-300/40" style={{ animation: 'mk-sc-ring 2s ease-out infinite' }} />
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-brand-300 text-brand-950 shadow-glow transition-transform duration-300 group-hover:scale-110">
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                </span>
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10.5px] text-ink-200 ring-1 ring-white/10">{v.duration}</span>
            </div>
            <div className="border-t border-white/[.07] bg-ink-900/70 p-4">
              <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink-200">“{v.quote}”</p>
              <p className="mt-3 text-[12.5px] text-ink-100">
                {v.name} <span className="text-ink-500">· {v.role}</span>
              </p>
            </div>
          </button>
        ))}
      </div>
      {open && <VideoModal v={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

/* ─── demos ────────────────────────────────────────────────────────── */

export const FeatureGridDemo = () => <FeatureGrid />;
export const BentoGridDemo = () => <BentoGrid />;
export const LogoMarqueeDemo = () => <LogoMarquee />;
export const LogoGridCycleDemo = () => <LogoGridCycle />;
export const TestimonialWallDemo = () => <TestimonialWall />;
export const TestimonialMarqueeDemo = () => <TestimonialMarquee />;
export const TestimonialVideoDemo = () => <TestimonialVideo />;
