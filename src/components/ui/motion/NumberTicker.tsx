import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, Shuffle } from 'lucide-react';
import { cn } from '@/lib/cn';

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export type NumberTickerProps = {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
};

/** Animates from the previously rendered value to `value` with easeOutExpo. */
export function NumberTicker({ value, format = (n) => Math.round(n).toLocaleString('en-US'), duration = 1200, className }: NumberTickerProps) {
  const [display, setDisplay] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const from = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const v = from + (value - from) * easeOutExpo(p);
      current.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={cn('tabular-nums', className)}>{format(display)}</span>;
}

function Digit({ d, delay }: { d: number; delay: number }) {
  return (
    <span className="relative inline-block h-[1.1em] w-[0.62em] overflow-hidden">
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[900ms] ease-[cubic-bezier(0.34,1.36,0.64,1)]"
        style={{ transform: `translateY(${-d * 10}%)`, transitionDelay: `${delay}ms` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="flex h-[1.1em] items-center justify-center">{n}</span>
        ))}
      </span>
    </span>
  );
}

/** Rolling-digit odometer. Non-digit characters (commas, symbols) render statically. */
export function Odometer({ value, format = (n) => n.toLocaleString('en-US'), className }: { value: number; format?: (n: number) => string; className?: string }) {
  const chars = format(value).split('');
  let digitIndex = 0;
  return (
    <span className={cn('inline-flex items-center tabular-nums leading-none', className)} aria-label={format(value)}>
      {chars.map((c, i) => {
        if (/\d/.test(c)) {
          const idx = digitIndex++;
          return <Digit key={chars.length - i} d={Number(c)} delay={idx * 40} />;
        }
        return <span key={`${c}-${chars.length - i}`}>{c}</span>;
      })}
    </span>
  );
}

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function NumberTickerDemo() {
  const [seed, setSeed] = useState(0);
  const stats = [
    { label: 'Monthly revenue', value: [48290, 52817, 61044][seed % 3], format: usd, delta: '+12.4%' },
    { label: 'Active users', value: [12847, 13502, 14971][seed % 3], format: undefined, delta: '+5.1%' },
    { label: 'Conversion', value: [3.42, 3.87, 4.21][seed % 3], format: (n: number) => `${n.toFixed(2)}%`, delta: '+0.4pt' },
  ];
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 80}ms` }} className="surface animate-fade-up p-5">
            <p className="text-xs text-ink-400">{s.label}</p>
            <NumberTicker value={s.value} format={s.format} className="mt-2 block text-3xl font-semibold tracking-tight text-ink-50" />
            <p className="mt-1 text-xs font-medium text-emerald-400">{s.delta} vs last month</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => setSeed((n) => n + 1)}
        className="focus-ring mx-auto mt-5 flex items-center gap-2 rounded-lg bg-ink-850 px-3 py-1.5 text-xs font-medium text-ink-200 shadow-hairline transition hover:text-ink-50 active:scale-95"
      >
        <Shuffle className="h-3.5 w-3.5" /> Refresh data
      </button>
    </div>
  );
}

export function OdometerDemo() {
  const [value, setValue] = useState(128450);
  const step = (d: number) => setValue((v) => Math.max(0, v + d));
  const btn = 'focus-ring flex h-10 w-10 items-center justify-center rounded-xl bg-ink-850 text-ink-200 shadow-hairline transition hover:bg-ink-800 hover:text-ink-50 active:scale-90';
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-2xl bg-ink-900 px-8 py-6 shadow-card">
        <p className="mb-2 text-center text-xs text-ink-400">Total raised</p>
        <Odometer value={value} format={usd} className="text-5xl font-semibold tracking-tight text-ink-50" />
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Decrease" className={btn} onClick={() => step(-1250)}><Minus className="h-4 w-4" /></button>
        <button className="focus-ring h-10 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-400 active:scale-95" onClick={() => setValue(Math.round(Math.random() * 900000) + 10000)}>
          Randomize
        </button>
        <button aria-label="Increase" className={btn} onClick={() => step(4875)}><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
