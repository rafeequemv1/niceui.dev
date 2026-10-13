import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Check, Copy, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NumberTicker } from '@/components/ui/motion/NumberTicker';

export type Asset = { symbol: string; name: string; amount: number; price: number; change: number; color: string };

const ASSETS: Asset[] = [
  { symbol: 'ETH', name: 'Ethereum', amount: 3.214, price: 3421.18, change: 2.4, color: 'from-sky-300 to-brand-600' },
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.1821, price: 64210.5, change: -0.8, color: 'from-amber-300 to-orange-600' },
  { symbol: 'SOL', name: 'Solana', amount: 41.2, price: 168.42, change: 6.1, color: 'from-teal-300 to-emerald-600' },
  { symbol: 'USDC', name: 'USD Coin', amount: 2480.5, price: 1, change: 0, color: 'from-brand-400 to-brand-700' },
];

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
type Panel = null | 'send' | 'receive';

export function WalletCard({ assets = ASSETS, address = '0x71C9…3f8A' }: { assets?: Asset[]; address?: string }) {
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [copied, setCopied] = useState(false);
  const [sendAmt, setSendAmt] = useState('');
  const [sending, setSending] = useState<'idle' | 'busy' | 'done'>('idle');
  const [list, setList] = useState(assets);
  const total = list.reduce((s, a) => s + a.amount * a.price, 0);
  const change = list.reduce((s, a) => s + a.amount * a.price * (a.change / 100), 0);

  const send = () => {
    const v = parseFloat(sendAmt);
    if (!v) return;
    setSending('busy');
    window.setTimeout(() => {
      setList((l) => l.map((a) => (a.symbol === 'USDC' ? { ...a, amount: Math.max(0, a.amount - v) } : a)));
      setSending('done');
      window.setTimeout(() => { setSending('idle'); setPanel(null); setSendAmt(''); }, 1200);
    }, 1200);
  };

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-ink-900 shadow-card">
      <div className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <span className="text-xs font-medium text-ink-400">Total balance</span>
          <button aria-label={hidden ? 'Show balance' : 'Hide balance'} onClick={() => setHidden((h) => !h)} className="focus-ring flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="relative mt-1 h-10 text-4xl font-medium tracking-tight text-ink-50">
          <span className={cn('absolute inset-0 transition-all duration-500 ease-smooth', hidden ? 'opacity-0 blur-md' : 'opacity-100 blur-0')}>
            <NumberTicker value={total} format={usd} />
          </span>
          <span className={cn('absolute inset-0 flex items-center gap-1.5 transition-all duration-500 ease-smooth', hidden ? 'opacity-100' : 'translate-y-2 opacity-0')}>
            {Array.from({ length: 6 }, (_, i) => <span key={i} className="h-3 w-3 rounded-full bg-ink-500" style={{ transitionDelay: `${i * 30}ms` }} />)}
          </span>
        </div>
        <p className={cn('relative mt-1 text-xs', change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
          {hidden ? '••••' : `${change >= 0 ? '+' : ''}${usd(change)}`} today
        </p>
        <div className="relative mt-5 grid grid-cols-2 gap-2">
          {(['send', 'receive'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPanel((x) => (x === p ? null : p))}
              className={cn('focus-ring flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium capitalize transition-all active:scale-[0.97]', panel === p ? 'bg-ink-50 text-ink-950' : p === 'send' ? 'bg-brand-500 text-white hover:bg-brand-400' : 'bg-ink-800 text-ink-100 shadow-hairline hover:bg-ink-700')}
            >
              {p === 'send' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />} {p}
            </button>
          ))}
        </div>
        <div className={cn('grid transition-all duration-500 ease-smooth', panel ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
          <div className="overflow-hidden">
            {panel === 'receive' && (
              <div className="flex animate-fade-up items-center gap-3 rounded-xl bg-ink-850 p-3 shadow-hairline">
                <div className="grid h-12 w-12 shrink-0 grid-cols-5 gap-px rounded-md bg-white p-1">
                  {Array.from({ length: 25 }, (_, i) => <span key={i} className={cn('rounded-[1px]', (i * 7) % 3 ? 'bg-ink-950' : 'bg-white')} />)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-ink-500">Your address · Ethereum</p>
                  <p className="font-mono text-sm text-ink-100">{address}</p>
                </div>
                <button aria-label="Copy address" onClick={() => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 hover:bg-white/5">
                  {copied ? <Check className="h-4 w-4 animate-scale-in text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            )}
            {panel === 'send' && (
              <div className="flex animate-fade-up items-center gap-2 rounded-xl bg-ink-850 p-2 shadow-hairline">
                <input autoFocus inputMode="decimal" value={sendAmt} onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setSendAmt(e.target.value)} placeholder="Amount in USDC" className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm tabular-nums text-ink-50 outline-none placeholder:text-ink-500" />
                <button onClick={send} disabled={!parseFloat(sendAmt) || sending !== 'idle'} className={cn('flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all disabled:opacity-50', sending === 'done' ? 'bg-emerald-500 text-ink-950' : 'bg-brand-500 text-white')}>
                  {sending === 'busy' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {sending === 'done' ? <><Check className="h-3.5 w-3.5" /> Sent</> : 'Send'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 p-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-ink-400">Assets</span>
          <button aria-label="Refresh" onClick={() => setList((l) => l.map((a) => ({ ...a, price: a.symbol === 'USDC' ? 1 : a.price * (1 + (Math.random() - 0.5) * 0.03) })))} className="group text-ink-500 hover:text-ink-200">
            <RefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-active:rotate-180" />
          </button>
        </div>
        {list.map((a, i) => (
          <div key={a.symbol} className="flex animate-fade-up items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/[0.03]" style={{ animationDelay: `${i * 50}ms` }}>
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white', a.color)}>{a.symbol[0]}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-100">{a.name}</p>
              <p className="text-xs text-ink-500">{hidden ? '••••' : `${a.amount.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${a.symbol}`}</p>
            </div>
            <div className="text-right">
              <p className="text-sm tabular-nums text-ink-100">{hidden ? '••••' : <NumberTicker value={a.amount * a.price} format={usd} duration={800} />}</p>
              <p className={cn('text-xs tabular-nums', a.change > 0 ? 'text-emerald-400' : a.change < 0 ? 'text-rose-400' : 'text-ink-500')}>{a.change > 0 ? '+' : ''}{a.change}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WalletCardDemo() {
  return (
    <div className="flex justify-center">
      <WalletCard />
    </div>
  );
}
