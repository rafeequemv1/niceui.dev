import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  FlaskConical,
  History,
  LayoutGrid,
  Lightbulb,
  Menu,
  PanelLeft,
  PieChart,
  Search,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useScene } from './scenery';

const WORDS = ['Momentum', 'Revenue', 'Readers'];
const NAV = ['Features', 'Use cases', 'Pricing', 'Integrations'];

function SproutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 21V11" stroke="#15803d" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 12C12 7 8.5 4 3.5 4 3.5 9 7 12 12 12z" fill="#22c55e" />
      <path d="M12 10c0-4 3-6.5 8.5-6.5C20.5 8 17.5 10 12 10z" fill="#16a34a" />
    </svg>
  );
}

/** Counts up once when it scrolls into view. */
function Count({ to, decimals = 0, suffix = '' }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 1400);
        setV(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && start());
    io.observe(el);
    // clipped previews never report an intersection, so start anyway
    const fallback = window.setTimeout(start, 2200);
    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

const KPIS = [
  { label: 'Experiments live', value: 128, delta: '+9.4%', up: true },
  { label: 'Weekly signups', value: 18406, delta: '+15.2%', up: true },
  { label: 'Activation rate', value: 41.8, decimals: 1, suffix: '%', delta: '-0.6%', up: false },
  { label: 'Ideas in backlog', value: 312, delta: '+4.1%', up: true },
];
const BARS = [38, 52, 46, 61, 58, 72, 69, 84, 78, 92, 88, 100];
const PLAN = [
  { day: 'Mon', title: 'Pricing page A/B test', tag: 'Live', tone: 'bg-emerald-100 text-emerald-700' },
  { day: 'Wed', title: 'Onboarding checklist v2', tag: 'Review', tone: 'bg-amber-100 text-amber-700' },
  { day: 'Fri', title: 'Referral reward email', tag: 'Draft', tone: 'bg-zinc-100 text-zinc-600' },
];

function Dashboard() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex overflow-hidden rounded-[18px] border border-white/70 bg-[#f6f6f2] text-zinc-900 shadow-[0_30px_80px_-20px_rgba(20,60,30,.45),0_0_0_1px_rgba(0,0,0,.04)]">
      <aside className="hidden w-[210px] shrink-0 flex-col gap-1 border-r border-zinc-200/70 bg-white/70 p-3 md:flex">
        <div className="mb-3 flex items-center gap-2 px-2 pt-1 text-[15px] font-medium">
          <SproutMark className="h-5 w-5" /> Tendril
        </div>
        {[
          { icon: LayoutGrid, label: 'Overview', on: true },
          { icon: FlaskConical, label: 'Experiments' },
          { icon: Users, label: 'Audiences' },
          { icon: PieChart, label: 'Reports' },
          { icon: Sparkles, label: 'Automations' },
        ].map(({ icon: Icon, label, on }) => (
          <span key={label} className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]', on ? 'bg-emerald-100/80 text-emerald-900' : 'text-zinc-600')}>
            <Icon className="h-4 w-4" strokeWidth={1.7} /> {label}
          </span>
        ))}
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-6">
        <div className="flex items-center gap-3 text-[12px] text-zinc-500">
          <PanelLeft className="h-4 w-4" strokeWidth={1.6} />
          <Star className="h-4 w-4" strokeWidth={1.6} />
          <span className="hidden sm:inline">Workspaces</span>
          <span className="hidden text-zinc-300 sm:inline">/</span>
          <span className="text-zinc-800">Growth</span>
          <span className="ml-auto hidden items-center gap-2 rounded-md bg-zinc-100 px-2.5 py-1.5 text-zinc-400 sm:flex">
            <Search className="h-3.5 w-3.5" /> Search <kbd className="ml-6 rounded border border-zinc-200 px-1 text-[10px]">/</kbd>
          </span>
          <Sun className="ml-auto h-4 w-4 sm:ml-0" strokeWidth={1.6} />
          <History className="h-4 w-4" strokeWidth={1.6} />
          <Bell className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-serif text-[28px] leading-none tracking-[-0.01em] md:text-[34px]">Overview</h3>
            <p className="mt-2 text-[12px] text-zinc-500">
              <span className="font-medium text-zinc-800">Morning, Ana.</span> Here&rsquo;s how this week&rsquo;s bets are doing.
            </p>
          </div>
          <button className="shrink-0 rounded-lg bg-zinc-900 px-3.5 py-2 text-[12px] font-medium text-white transition-transform active:scale-95">New experiment</button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-xl border border-zinc-200/80 bg-white p-3.5">
              <p className="text-[11px] text-zinc-500">{k.label}</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="font-serif text-[22px] leading-none md:text-[26px]">
                  <Count to={k.value} decimals={k.decimals} suffix={k.suffix} />
                </span>
                <span className={cn('text-[10px] font-medium', k.up ? 'text-emerald-600' : 'text-rose-500')}>
                  {k.delta} {k.up ? '↗' : '↘'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
            <p className="text-[12px] font-medium text-zinc-700">Signups</p>
            <p className="mt-1 font-serif text-[24px] leading-none">
              <Count to={74219} /> this quarter
            </p>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              <span className="text-emerald-600">+12% ↗</span> vs last quarter
            </p>
            <div className="mt-4 flex h-28 items-end gap-1.5" onMouseLeave={() => setHover(null)}>
              {BARS.map((b, i) => (
                <div key={i} className="relative flex-1" style={{ height: '100%' }} onMouseEnter={() => setHover(i)}>
                  {hover === i && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-white">{(b * 61).toLocaleString()}</span>
                  )}
                  <div
                    className={cn('meadow-bar absolute inset-x-0 bottom-0 rounded-t-[5px] transition-colors', hover === i ? 'bg-emerald-500' : i === BARS.length - 1 ? 'bg-emerald-400' : 'bg-emerald-200/90')}
                    style={{ height: `${b}%`, animationDelay: `${0.6 + i * 0.05}s` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
            <p className="text-[12px] font-medium text-zinc-700">Launch planner</p>
            <p className="mt-1 font-serif text-[24px] leading-none">3 launches this week</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-200 px-2.5 py-2 text-[12px] text-zinc-600">
              <CalendarDays className="h-3.5 w-3.5" /> November 2026
            </div>
            <ul className="mt-2.5 space-y-2">
              {PLAN.map((p) => (
                <li key={p.title} className="flex items-center gap-3 rounded-lg px-1 py-1 text-[12px]">
                  <span className="w-8 text-zinc-400">{p.day}</span>
                  <span className="min-w-0 flex-1 truncate text-zinc-800">{p.title}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', p.tone)}>{p.tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export type HeroMeadowProps = {
  /** Words that rotate inside the second chip. */
  words?: string[];
  subtitle?: string;
  cta?: string;
  /** Optional photo URL; a painted spring meadow is used when omitted. */
  image?: string;
  className?: string;
};

/**
 * A bright, airy hero: sky and flower hills, a floating pill nav, a headline
 * with tilted serif word chips (the second one rotates), a pressable CTA and a
 * live product dashboard rising out of the meadow.
 */
export function HeroMeadow({
  words = WORDS,
  subtitle = 'Plan, ship and measure growth experiments in one calm place, without spreadsheets or status meetings.',
  cta = 'Start growing',
  image,
  className,
}: HeroMeadowProps) {
  const painted = useScene('meadow', 1600, 1000);
  const src = image ?? painted;
  const [wi, setWi] = useState(0);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setWi((i) => (i + 1) % words.length), 2600);
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <section data-fill className={cn('relative isolate overflow-hidden bg-[#9fcdf3] font-sans text-zinc-900 [color-scheme:light]', className)}>
      <style>{`@keyframes meadow-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes meadow-chip{from{opacity:0;transform:translateY(10px) rotate(var(--r)) scale(.9)}to{opacity:1;transform:rotate(var(--r))}}@keyframes meadow-word{from{opacity:0;filter:blur(6px);transform:translateY(40%)}to{opacity:1;filter:none;transform:none}}@keyframes meadow-rise{from{opacity:0;transform:perspective(1400px) translateY(60px) rotateX(14deg)}to{opacity:1;transform:perspective(1400px)}}@keyframes meadow-bar{from{transform:scaleY(0)}to{transform:scaleY(1)}}.meadow-bar{transform-origin:bottom;animation:meadow-bar .7s cubic-bezier(.2,.8,.2,1) both}@media (prefers-reduced-motion:reduce){.meadow-anim,.meadow-bar{animation:none!important}}`}</style>

      {/* scenery */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#3f8fe6,#9fd0f5_55%,#7fbf6a_75%,#3e8a2c)]">
        {src && <img src={src} alt="" className="meadow-anim h-full w-full object-cover object-bottom" style={{ animation: 'meadow-up 1.6s ease both' }} />}
      </div>
      {/* dot grid and faint guides */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,#000_0%,#000_45%,transparent_70%)]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.55) 1px, transparent 1.4px)', backgroundSize: '26px 26px' }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent_calc(50%-480px),rgba(255,255,255,.18)_calc(50%-480px),transparent_calc(50%-479px),transparent_calc(50%+479px),rgba(255,255,255,.18)_calc(50%+479px),transparent_calc(50%+480px))]" />

      {/* nav */}
      <header className="relative z-20 flex justify-center px-4 pt-6 md:pt-8">
        <nav aria-label="Primary" className="flex items-center gap-1 rounded-2xl bg-white/85 p-1.5 pl-4 shadow-[0_8px_30px_-12px_rgba(30,80,140,.35),inset_0_0_0_1px_rgba(255,255,255,.9)] backdrop-blur-xl">
          <a href="#" className="mr-3 flex items-center gap-2 text-[16px] font-medium">
            <SproutMark className="h-6 w-6" /> Tendril
          </a>
          {NAV.map((n) => (
            <a key={n} href="#" className="hidden rounded-xl px-3.5 py-2 text-[15px] text-zinc-700 transition-colors hover:bg-zinc-900/5 hover:text-zinc-950 md:block">
              {n}
            </a>
          ))}
          <a href="#" className="ml-1 hidden rounded-xl bg-zinc-900 px-3.5 py-2 text-[14px] font-medium text-white sm:block">Sign in</a>
          <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={menu ? 'Close menu' : 'Open menu'} className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-900/5 md:hidden">
            {menu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
        {menu && (
          <div className="meadow-anim absolute inset-x-4 top-[76px] rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur-xl md:hidden" style={{ animation: 'meadow-up .25s ease both' }}>
            {NAV.map((n) => (
              <a key={n} href="#" className="block rounded-xl px-4 py-3 text-[15px] text-zinc-700 hover:bg-zinc-100">
                {n}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* headline */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 pt-16 text-center md:pt-24">
        <h1 className="text-[34px] font-light leading-[1.12] tracking-[-0.045em] text-zinc-800 min-[420px]:text-[42px] sm:text-[64px] lg:text-[84px]">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-3 sm:gap-x-4">
            <span>Turn</span>
            <span
              className="meadow-anim inline-flex items-center gap-2 sm:gap-3 rounded-[16px] bg-[#d9dcff]/90 px-2.5 py-1 sm:rounded-[22px] sm:px-4 sm:py-1.5 shadow-[0_10px_30px_-12px_rgba(90,90,220,.5),inset_0_0_0_1px_rgba(255,255,255,.7)] sm:px-5"
              style={{ ['--r' as string]: '-1.5deg', animation: 'meadow-chip .7s .3s cubic-bezier(.3,1.4,.5,1) both' }}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl bg-indigo-400/90 text-white sm:h-12 sm:w-12">
                <Lightbulb className="h-4 w-4 sm:h-7 sm:w-7" strokeWidth={1.8} />
              </span>
              <span className="font-serif italic tracking-[-0.02em] text-indigo-500">Ideas</span>
            </span>
            <span>into</span>
          </span>
          <span className="mt-3 inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-3 sm:gap-x-4">
            <span className="font-normal text-zinc-950">lasting</span>
            <span
              className="meadow-anim inline-flex items-center gap-2 sm:gap-3 rounded-[16px] bg-[#ffe6cf]/95 px-2.5 py-1 sm:rounded-[22px] sm:px-4 sm:py-1.5 shadow-[0_14px_34px_-14px_rgba(234,88,12,.55),inset_0_0_0_1px_rgba(255,255,255,.8)] sm:px-5"
              style={{ ['--r' as string]: '2deg', animation: 'meadow-chip .7s .5s cubic-bezier(.3,1.4,.5,1) both' }}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl bg-orange-500 text-white shadow-inner sm:h-12 sm:w-12">
                <TrendingUp className="h-4 w-4 sm:h-7 sm:w-7" strokeWidth={2} />
              </span>
              <span className="relative inline-block overflow-hidden pb-1 font-serif italic tracking-[-0.02em] text-orange-600" aria-live="polite">
                <span key={wi} className="meadow-anim inline-block" style={{ animation: 'meadow-word .5s cubic-bezier(.2,.8,.2,1) both' }}>
                  {words[wi]}
                </span>
              </span>
            </span>
          </span>
        </h1>
        <p className="meadow-anim mx-auto mt-8 max-w-xl text-[17px] leading-relaxed text-zinc-700 md:text-[20px]" style={{ animation: 'meadow-up .8s .7s ease both' }}>
          {subtitle}
        </p>
        <div className="meadow-anim mt-9 flex flex-col items-center gap-4" style={{ animation: 'meadow-up .8s .85s ease both' }}>
          <a
            href="#"
            className="group inline-flex h-14 items-center gap-2 rounded-2xl bg-green-500 px-7 text-[17px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_4px_0_#15803d,0_14px_30px_-10px_rgba(22,163,74,.7)] transition-all hover:bg-green-400 active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_1px_0_#15803d,0_8px_20px_-10px_rgba(22,163,74,.7)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
          >
            {cta}
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <span className="flex items-center gap-2 text-[13px] text-zinc-700">
            <span className="flex -space-x-2">
              {['#f9a8d4', '#fdba74', '#a5b4fc', '#86efac'].map((c) => (
                <span key={c} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </span>
            Trusted by 4,000+ product teams
          </span>
        </div>
      </div>

      {/* product */}
      <div className="relative z-10 mx-auto mt-14 max-w-[1120px] px-4 md:mt-20 md:px-8">
        <div className="meadow-anim" style={{ animation: 'meadow-rise 1.2s .9s cubic-bezier(.2,.8,.2,1) both' }}>
          <div className="rounded-[24px] bg-white/35 p-2 backdrop-blur-md [mask-image:linear-gradient(180deg,#000_70%,transparent)]">
            <Dashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroMeadowDemo() {
  return <HeroMeadow />;
}
