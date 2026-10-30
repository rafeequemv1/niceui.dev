import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export type NumberTickerProps = { value: number; prefix?: string; suffix?: string; decimals?: number; locale?: string; className?: string };

/** Each digit is a column 0–9 that rolls to its place when the number scrolls into view. */
export function NumberTicker({ value, prefix = '', suffix = '', decimals = 0, locale = 'en-US', className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const text = value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} aria-label={prefix + text + suffix} className={cn('inline-flex font-mono tabular-nums leading-none', className)}>
      <span aria-hidden>{prefix}</span>
      {text.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden">
            <span
              className="flex flex-col transition-transform duration-[1600ms] ease-smooth motion-reduce:transition-none"
              style={{ transform: `translateY(-${on ? +ch * 10 : 0}%)`, transitionDelay: `${i * 70}ms` }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="h-[1em]">{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden>{ch}</span>
        ),
      )}
      <span aria-hidden>{suffix}</span>
    </span>
  );
}

export function NumberTickerDemo() {
  const [k, setK] = useState(0);
  const stats = [
    { v: 1284930, p: '$', s: '', l: 'Revenue this quarter' },
    { v: 98.6, p: '', s: '%', d: 1, l: 'Uptime' },
    { v: 42150, p: '', s: '+', l: 'Developers' },
  ];
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div key={k} className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((x) => (
          <div key={x.l} className="rounded-2xl bg-ink-900 p-5 shadow-card">
            <NumberTicker value={x.v} prefix={x.p} suffix={x.s} decimals={x.d ?? 0} className="text-3xl font-semibold text-ink-50" />
            <p className="mt-2 text-xs text-ink-500">{x.l}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setK((n) => n + 1)} className="focus-ring rounded-full px-3 py-1.5 text-xs text-ink-400 ring-1 ring-white/10 hover:text-ink-100">
        Replay
      </button>
    </div>
  );
}
