import { useRef, useState } from 'react';
import { ArrowDownUp, Check, ChevronDown, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside, useEscape, usePresence } from '@/components/ui/motion/hooks';

export type Token = { symbol: string; name: string; chain: string; price: number; balance: number; color: string };

export const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ether', chain: 'Ethereum', price: 3421.18, balance: 2.4512, color: 'from-sky-300 to-brand-600' },
  { symbol: 'USDC', name: 'USD Coin', chain: 'Base', price: 1, balance: 8250.4, color: 'from-brand-400 to-brand-700' },
  { symbol: 'SOL', name: 'Solana', chain: 'Solana', price: 168.42, balance: 41.2, color: 'from-teal-300 to-emerald-600' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', chain: 'Arbitrum', price: 64210.5, balance: 0.0821, color: 'from-amber-300 to-orange-600' },
  { symbol: 'ARB', name: 'Arbitrum', chain: 'Arbitrum', price: 1.12, balance: 1520, color: 'from-sky-400 to-sky-700' },
];

const fmt = (n: number, d = 4) => (n === 0 ? '0' : n.toLocaleString('en-US', { maximumFractionDigits: d }));
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function TokenBadge({ t, size = 'h-7 w-7' }: { t: Token; size?: string }) {
  return <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-semibold text-white', t.color, size)}>{t.symbol.slice(0, 1)}</span>;
}

function TokenSelect({ value, onChange, exclude }: { value: Token; onChange: (t: Token) => void; exclude: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, visible } = usePresence(open, 180);
  useEscape(open, () => setOpen(false));
  useClickOutside([ref], open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="focus-ring flex items-center gap-2 rounded-full bg-ink-800 py-1 pl-1 pr-2.5 shadow-hairline transition-all hover:bg-ink-700 active:scale-95">
        <TokenBadge t={value} />
        <span className="text-left leading-tight">
          <span className="block text-sm font-medium text-ink-50">{value.symbol}</span>
          <span className="block text-[10px] text-ink-400">{value.chain}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-ink-400 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      {mounted && (
        <div className={cn('absolute right-0 top-full z-30 mt-2 w-56 origin-top-right rounded-xl bg-ink-850 p-1 shadow-pop transition-all duration-200 ease-smooth', visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0')}>
          {TOKENS.filter((t) => t.symbol !== exclude).map((t) => (
            <button key={t.symbol} onClick={() => { onChange(t); setOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5">
              <TokenBadge t={t} size="h-6 w-6" />
              <span className="flex-1 leading-tight">
                <span className="block text-sm text-ink-100">{t.symbol}</span>
                <span className="block text-[10px] text-ink-500">{t.name} · {t.chain}</span>
              </span>
              {t.symbol === value.symbol && <Check className="h-3.5 w-3.5 text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Status = 'idle' | 'swapping' | 'done';

export function MultichainSwap({ slippage = 0.5 }: { slippage?: number }) {
  const [from, setFrom] = useState(TOKENS[0]);
  const [to, setTo] = useState(TOKENS[2]);
  const [amount, setAmount] = useState('0.5');
  const [spin, setSpin] = useState(0);
  const [status, setStatus] = useState<Status>('idle');

  const value = parseFloat(amount) || 0;
  const rate = from.price / to.price;
  const crossChain = from.chain !== to.chain;
  const fee = value * from.price * 0.0015 + (crossChain ? 2.4 : 0.6);
  const out = Math.max(0, (value * from.price - fee) / to.price);
  const insufficient = value > from.balance;

  const flip = () => { setSpin((s) => s + 180); setFrom(to); setTo(from); setAmount(out ? out.toFixed(4) : ''); };
  const swap = () => {
    setStatus('swapping');
    window.setTimeout(() => setStatus('done'), 1600);
    window.setTimeout(() => setStatus('idle'), 3400);
  };

  const label = status === 'swapping' ? 'Swapping…' : status === 'done' ? 'Swap complete' : !value ? 'Enter an amount' : insufficient ? `Insufficient ${from.symbol}` : crossChain ? `Bridge & swap` : 'Swap';
  const disabled = status !== 'idle' || !value || insufficient;

  return (
    <div className="w-full max-w-sm rounded-3xl bg-ink-900 p-2 shadow-card">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium text-ink-50">Swap</span>
        <span className="rounded-full bg-ink-850 px-2 py-0.5 text-[11px] text-ink-400 shadow-hairline">{slippage}% slippage</span>
      </div>
      <div className="relative space-y-1">
        <div className="rounded-2xl bg-ink-850 p-4 shadow-hairline transition-shadow focus-within:shadow-glow">
          <p className="text-xs text-ink-400">You pay</p>
          <div className="mt-1 flex items-center gap-3">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
              placeholder="0"
              className={cn('min-w-0 flex-1 bg-transparent text-3xl font-medium tabular-nums outline-none placeholder:text-ink-600', insufficient ? 'text-rose-400' : 'text-ink-50')}
            />
            <TokenSelect value={from} onChange={setFrom} exclude={to.symbol} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-500">
            <span>{usd(value * from.price)}</span>
            <button onClick={() => setAmount(String(from.balance))} className="transition-colors hover:text-brand-300">Balance {fmt(from.balance)} · <span className="font-medium text-brand-400">Max</span></button>
          </div>
        </div>
        <button
          aria-label="Flip direction"
          onClick={flip}
          className="focus-ring absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-4 border-ink-900 bg-ink-800 text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50"
        >
          <ArrowDownUp className="h-4 w-4 transition-transform duration-500 ease-spring" style={{ transform: `rotate(${spin}deg)` }} />
        </button>
        <div className="rounded-2xl bg-ink-850/60 p-4 shadow-hairline">
          <p className="text-xs text-ink-400">You receive</p>
          <div className="mt-1 flex items-center gap-3">
            <span key={`${to.symbol}${out.toFixed(3)}`} className="min-w-0 flex-1 animate-fade-in truncate text-3xl font-medium tabular-nums text-ink-100">{fmt(out)}</span>
            <TokenSelect value={to} onChange={setTo} exclude={from.symbol} />
          </div>
          <p className="mt-2 text-xs text-ink-500">{usd(out * to.price)}</p>
        </div>
      </div>
      <div className={cn('grid transition-all duration-500 ease-smooth', value ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="space-y-1.5 px-3 py-3 text-xs">
            <div className="flex justify-between text-ink-400"><span>Rate</span><span className="text-ink-200">1 {from.symbol} = {fmt(rate, 6)} {to.symbol}</span></div>
            <div className="flex justify-between text-ink-400"><span>Network + protocol fee</span><span className="text-ink-200">{usd(fee)}</span></div>
            <div className="flex justify-between text-ink-400">
              <span>Route</span>
              <span className="flex items-center gap-1 text-ink-200">{crossChain && <Zap className="h-3 w-3 text-amber-400" />}{from.chain} → {to.chain} · ~{crossChain ? '45s' : '12s'}</span>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={swap}
        disabled={disabled}
        className={cn(
          'focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all duration-300 active:scale-[0.98]',
          status === 'done' ? 'bg-emerald-500 text-ink-950' : disabled && status === 'idle' ? 'cursor-not-allowed bg-ink-850 text-ink-500' : 'bg-brand-500 text-white hover:bg-brand-400',
        )}
      >
        {status === 'swapping' && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === 'done' && <Check className="h-4 w-4 animate-scale-in" />}
        <span key={label} className="animate-fade-in">{label}</span>
      </button>
    </div>
  );
}

export function MultichainSwapDemo() {
  return (
    <div className="flex justify-center">
      <MultichainSwap />
    </div>
  );
}
