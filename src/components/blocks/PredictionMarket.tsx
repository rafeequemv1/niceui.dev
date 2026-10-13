import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

function series(seed: number, n: number, end: number) {
  let v = end - 18;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.sin(i * 1.7 + seed) * 0.5 + Math.sin(i * 0.37 + seed * 2) * 0.5;
    v = Math.max(5, Math.min(95, v + r * 4 + (end - v) * 0.06));
    out.push(v);
  }
  out[n - 1] = end;
  return out;
}

export function Sparkline({ data, width = 320, height = 88, hover, onHover }: { data: number[]; width?: number; height?: number; hover: number | null; onHover: (i: number | null) => void }) {
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - (v / 100) * height] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const hp = hover !== null ? pts[hover] : null;
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div
      className="relative"
      style={{ height }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onHover(Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)))));
      }}
      onPointerLeave={() => onHover(null)}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pm-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" x2={width} y1={height / 2} y2={height / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
        <path d={`${line} L${width},${height} L0,${height} Z`} fill="url(#pm-fill)" className={cn('transition-opacity delay-300 duration-700', drawn ? 'opacity-100' : 'opacity-0')} />
        <path
          d={line}
          fill="none"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: drawn ? 0 : 1, transition: 'stroke-dashoffset 1200ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      {hp && (
        <>
          <span className="pointer-events-none absolute inset-y-0 w-px bg-white/15" style={{ left: `${(hp[0] / width) * 100}%` }} />
          <span
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 ring-2 ring-ink-900"
            style={{ left: `${(hp[0] / width) * 100}%`, top: hp[1] }}
          />
        </>
      )}
    </div>
  );
}

const RANGES = { '1D': 24, '1W': 42, '1M': 60, ALL: 90 } as const;
type Range = keyof typeof RANGES;

export function PredictionMarket({ question = 'Will ETH close above $4,000 on Dec 31?', initialYes = 64 }: { question?: string; initialYes?: number }) {
  const [yes, setYes] = useState(initialYes);
  const [range, setRange] = useState<Range>('1W');
  const [hover, setHover] = useState<number | null>(null);
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState(50);
  const [bought, setBought] = useState(false);
  const data = useMemo(() => series(RANGES[range], RANGES[range], yes), [range, yes]);

  const price = (side === 'yes' ? yes : 100 - yes) / 100;
  const shares = amount / price;
  const payout = shares;
  const ret = ((payout - amount) / Math.max(amount, 1)) * 100;
  const shown = hover !== null ? data[hover] : yes;

  const buy = () => {
    if (!amount) return;
    setBought(true);
    setYes((y) => Math.max(3, Math.min(97, y + (side === 'yes' ? 1 : -1) * Math.max(1, Math.round(amount / 60)))));
    window.setTimeout(() => setBought(false), 1800);
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-ink-900 p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300 to-brand-600 text-sm font-semibold text-white">Ξ</span>
        <div>
          <p className="text-sm font-medium leading-snug text-ink-50">{question}</p>
          <p className="mt-1 flex items-center gap-3 text-[11px] text-ink-500">
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />$2.4M vol</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />8,912</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Ends Dec 31</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <p className="text-3xl font-medium tabular-nums text-emerald-400">{Math.round(shown)}%<span className="ml-1.5 text-sm text-ink-400">chance</span></p>
        <div className="flex gap-0.5 rounded-lg bg-ink-950/60 p-0.5">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors', range === r ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-500 hover:text-ink-200')}>{r}</button>
          ))}
        </div>
      </div>
      <div className="mt-3" key={range}>
        <Sparkline data={data} hover={hover} onHover={setHover} />
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-ink-800">
        <div className="h-full bg-emerald-400 transition-[width] duration-700 ease-spring" style={{ width: `${yes}%` }} />
        <div className="h-full flex-1 bg-rose-400/80" />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] font-medium"><span className="text-emerald-400">Yes {yes}¢</span><span className="text-rose-400">No {100 - yes}¢</span></div>

      <div className="mt-4 rounded-xl bg-ink-850 p-3 shadow-hairline">
        <div className="relative grid grid-cols-2 rounded-lg bg-ink-950/60 p-0.5">
          <span className={cn('absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md transition-all duration-500 ease-spring', side === 'yes' ? 'translate-x-0 bg-emerald-500/20' : 'translate-x-full bg-rose-500/20')} />
          {(['yes', 'no'] as const).map((s) => (
            <button key={s} onClick={() => setSide(s)} className={cn('relative py-1.5 text-sm font-medium capitalize transition-colors', side === s ? (s === 'yes' ? 'text-emerald-300' : 'text-rose-300') : 'text-ink-400')}>
              Buy {s} · {s === 'yes' ? yes : 100 - yes}¢
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg bg-ink-950/60 px-3 shadow-hairline focus-within:shadow-glow">
            <span className="text-ink-500">$</span>
            <input value={amount || ''} placeholder="0" inputMode="numeric" onChange={(e) => setAmount(Math.min(100000, Number(e.target.value.replace(/\D/g, '')) || 0))} className="h-9 w-full bg-transparent pl-1 text-sm tabular-nums text-ink-50 outline-none" />
          </div>
          {[10, 50, 100].map((v) => (
            <button key={v} onClick={() => setAmount((a) => a + v)} className="h-9 rounded-lg bg-ink-800 px-2.5 text-xs font-medium text-ink-300 transition-all hover:text-ink-50 active:scale-95">+{v}</button>
          ))}
        </div>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between text-ink-400"><span>Shares</span><span className="tabular-nums text-ink-200">{shares.toFixed(2)}</span></div>
          <div className="flex justify-between text-ink-400">
            <span>Potential payout</span>
            <span className="tabular-nums font-medium text-emerald-400">${payout.toFixed(2)} <span className="text-ink-500">(+{ret.toFixed(0)}%)</span></span>
          </div>
        </div>
        <button
          onClick={buy}
          disabled={!amount}
          className={cn('mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40', bought ? 'bg-ink-50 text-ink-950' : side === 'yes' ? 'bg-emerald-500 text-ink-950 hover:bg-emerald-400' : 'bg-rose-500 text-white hover:bg-rose-400')}
        >
          {bought ? <><Check className="h-4 w-4 animate-scale-in" /> Order filled</> : `Buy ${side === 'yes' ? 'Yes' : 'No'} · $${amount}`}
        </button>
      </div>
    </div>
  );
}

export function PredictionMarketDemo() {
  return (
    <div className="flex justify-center">
      <PredictionMarket />
    </div>
  );
}
