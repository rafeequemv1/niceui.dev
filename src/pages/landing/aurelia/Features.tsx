import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { Globe2, Lock, Sparkles, Target, Wifi } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal, useInView } from '@/pages/landing/shared/motion';
import { Eyebrow } from './primitives';

const press = ['The Financial Ledger', 'Monocle Weekly', 'Kinfolk Money', 'The Quiet Times', 'Wealth & Form', 'Morning Brief', 'Atlas Review'];

export function PressMarquee() {
  return (
    <section className="border-y border-stone-900/10 py-8">
      <p className="mb-6 text-center text-[11px] uppercase tracking-[0.22em] text-stone-500">As written about in</p>
      <div className="relative flex overflow-hidden mask-fade-x">
        <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16 [animation-duration:40s]">
          {[...press, ...press].map((p, i) => (
            <span key={i} className="whitespace-nowrap font-serif text-2xl italic text-stone-400 transition-colors hover:text-stone-900">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tile({ className, children, delay = 0 }: { className?: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="group relative h-full overflow-hidden rounded-[28px] border border-stone-900/10 bg-white/70 p-7 transition-all duration-500 ease-smooth hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(41,37,36,0.35)]">
        {children}
      </div>
    </Reveal>
  );
}

function GoalRing() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className="relative mx-auto mt-6 h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e7e5e4" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="#047857" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={inView ? c * 0.28 : c}
          className="transition-[stroke-dashoffset] duration-[1800ms] ease-smooth"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-serif text-4xl text-stone-900">72%</div>
          <div className="text-xs text-stone-500">Kyoto, 2027</div>
        </div>
      </div>
    </div>
  );
}

function MetalCard() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - b.top) / b.height - 0.5) * -14, y: ((e.clientX - b.left) / b.width - 0.5) * 14 });
  };
  return (
    <div className="mt-8 [perspective:1000px]" onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div
        className="relative mx-auto aspect-[1.586] w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-stone-800 via-stone-900 to-black p-6 text-[#f5f1ea] shadow-2xl transition-transform duration-200 ease-out"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
          style={{ background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, rgba(255,255,255,0.35), transparent 50%)` }}
        />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-serif text-2xl">Aurelia</span>
            <Wifi className="h-5 w-5 rotate-90 text-stone-400" />
          </div>
          <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 opacity-90" />
          <div className="flex items-end justify-between">
            <span className="font-mono text-sm tracking-[0.2em] text-stone-300">•••• 4821</span>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-400">Reserve</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const currencies = [
  { code: 'EUR', rate: '0.9213', delta: '+0.12%' },
  { code: 'GBP', rate: '0.7841', delta: '-0.04%' },
  { code: 'JPY', rate: '149.82', delta: '+0.31%' },
  { code: 'CHF', rate: '0.8812', delta: '+0.08%' },
];

function CurrencyTicker() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % currencies.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-6 space-y-1">
      {currencies.map((c, i) => (
        <div key={c.code} className={cn('flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-500', i === active ? 'bg-stone-900 text-[#f5f1ea]' : 'text-stone-700')}>
          <span className="font-medium">USD / {c.code}</span>
          <span className="flex gap-4 tabular-nums">
            <span>{c.rate}</span>
            <span className={cn(i === active ? 'text-orange-300' : c.delta.startsWith('+') ? 'text-emerald-700' : 'text-orange-700')}>{c.delta}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function BentoFeatures() {
  return (
    <section id="aurelia-invest" className="scroll-mt-24 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <Eyebrow>The studio</Eyebrow>
          <h2 className="mt-5 font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 md:text-6xl">
            Every part of your money, <em className="text-orange-700">considered.</em>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-6">
          <Tile className="md:col-span-4" delay={0}>
            <Sparkles className="h-5 w-5 text-orange-700" />
            <h3 className="mt-4 font-serif text-3xl text-stone-900">Portfolios that rebalance themselves</h3>
            <p className="mt-2 max-w-md text-stone-600">Built by our investment committee, tuned to your goals, and kept on course every single day.</p>
            <div className="mt-8 flex h-32 items-end gap-2">
              {[40, 64, 52, 78, 60, 88, 72, 96, 84, 100, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-stone-200 transition-colors duration-300 group-hover:bg-orange-200" style={{ height: `${h}%`, transitionDelay: `${i * 30}ms` }}>
                  <div className="h-1/3 rounded-t-md bg-orange-700/80" />
                </div>
              ))}
            </div>
          </Tile>
          <Tile className="md:col-span-2" delay={100}>
            <Target className="h-5 w-5 text-emerald-700" />
            <h3 className="mt-4 font-serif text-3xl text-stone-900">Goals with a horizon</h3>
            <GoalRing />
          </Tile>
          <Tile className="md:col-span-3" delay={150}>
            <h3 className="font-serif text-3xl text-stone-900" id="aurelia-card">The Reserve card</h3>
            <p className="mt-2 text-stone-600">18g of brushed steel. 1.5% back, invested automatically.</p>
            <MetalCard />
          </Tile>
          <Tile className="md:col-span-3" delay={200}>
            <Globe2 className="h-5 w-5 text-orange-700" />
            <h3 className="mt-4 font-serif text-3xl text-stone-900">Borderless by default</h3>
            <p className="mt-2 text-stone-600">Hold 40 currencies at the real exchange rate. No markups, ever.</p>
            <CurrencyTicker />
          </Tile>
          <Tile className="md:col-span-6" delay={250}>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-stone-900 text-[#f5f1ea]">
                  <Lock className="h-6 w-6" />
                  <span className="absolute inset-0 rounded-2xl ring-2 ring-orange-600/40 animate-pulse-ring" />
                </span>
                <div>
                  <h3 className="font-serif text-3xl text-stone-900">Vault-grade security</h3>
                  <p className="text-stone-600">SIPC + private insurance up to $2M. SOC 2 Type II. Biometric everything.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['256-bit AES', 'Hardware keys', 'Cold storage', 'Audit trail'].map((t) => (
                  <span key={t} className="rounded-full border border-stone-900/10 bg-[#f5f1ea] px-3.5 py-1.5 text-sm text-stone-700">{t}</span>
                ))}
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
