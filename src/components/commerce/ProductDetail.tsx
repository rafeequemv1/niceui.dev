import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, LoaderCircle, Minus, Plus, RotateCcw, ShoppingBag, Star, Truck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PRODUCTS, artistOf, money, type Product } from './data';
import { Print } from './Print';

type AddState = 'idle' | 'adding' | 'added';

export type ProductDetailProps = { product: Product; onAdd?: (p: Product, opts: { frame: string; size: string; qty: number }) => void; className?: string };

function deliveryWindow() {
  const d = new Date();
  const from = new Date(d.getTime() + 3 * 864e5);
  const to = new Date(d.getTime() + 5 * 864e5);
  const f = (x: Date) => x.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${f(from)} – ${f(to)}`;
}

export function ProductDetail({ product: p, onAdd, className }: ProductDetailProps) {
  const shots = [p.art[0], p.art[1], (p.art[0] + 2) % 12, (p.art[1] + 3) % 12];
  const [shot, setShot] = useState(0);
  const [frame, setFrame] = useState(p.swatches[0]);
  const [size, setSize] = useState(p.sizes.find((s) => s.stock)!.label);
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<AddState>('idle');
  const [open, setOpen] = useState<string | null>('Details');
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const stock = p.sizes.find((s) => s.label === size)!.stock;
  const add = () => {
    if (state !== 'idle') return;
    setState('adding');
    timers.current.push(window.setTimeout(() => (setState('added'), onAdd?.(p, { frame: frame.name, size, qty })), 700));
    timers.current.push(window.setTimeout(() => setState('idle'), 2400));
  };

  const sections: [string, string][] = [
    ['Details', `Archival pigment print on 310gsm cotton rag. Signed and numbered by ${artistOf(p)}. Edition of 250.`],
    ['Framing', 'Solid timber frame, museum glass with 99% UV protection, acid-free mount. Arrives ready to hang.'],
    ['Shipping & returns', 'Free shipping over $150. Packed flat in a reinforced crate. Free returns within 30 days.'],
  ];

  return (
    <div className={cn('grid w-full gap-6 rounded-2xl bg-ink-900 p-4 shadow-card sm:p-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-8', className)}>
      {/* gallery */}
      <div className="min-w-0">
        <div
          className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-xl"
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse') return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onPointerLeave={() => setZoom(null)}
        >
          <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: zoom ? 'scale(1.9)' : 'scale(1)', transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : 'center' }}>
            <Print key={shots[shot]} art={shots[shot]} frame={frame.hex} className="h-full w-full animate-fade-in" />
          </div>
          {p.badge && <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2 py-0.5 text-[10.5px] font-medium text-white">{p.badge}</span>}
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur">Hover to zoom</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2" role="tablist" aria-label="Product images">
          {shots.map((a, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={shot === i}
              aria-label={`Image ${i + 1}`}
              onClick={() => setShot(i)}
              className={cn('focus-ring overflow-hidden rounded-lg ring-1 transition-all', shot === i ? 'ring-2 ring-brand-300' : 'opacity-60 ring-white/10 hover:opacity-100')}
            >
              <Print art={a} frame={frame.hex} className="aspect-square" />
            </button>
          ))}
        </div>
      </div>

      {/* info */}
      <div className="min-w-0">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-500">{p.kind} · {artistOf(p)}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink-50">{p.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px]">
          <span className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className={cn('h-3.5 w-3.5', i < Math.round(p.rating) ? 'fill-amber-300 text-amber-300' : 'text-ink-600')} />
            ))}
          </span>
          <span className="text-ink-400">{p.rating.toFixed(1)} · {p.reviews} reviews</span>
        </div>
        <p className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-medium tabular-nums text-ink-50">{money(p.price * qty)}</span>
          {p.compareAt && <span className="text-sm tabular-nums text-ink-500 line-through">{money(p.compareAt * qty)}</span>}
        </p>

        <fieldset className="mt-5">
          <legend className="text-[12px] text-ink-400">Frame · <span className="text-ink-100">{frame.name}</span></legend>
          <div className="mt-2 flex gap-2">
            {p.swatches.map((s) => (
              <button
                key={s.name}
                onClick={() => setFrame(s)}
                aria-pressed={frame.name === s.name}
                className={cn('focus-ring flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors', frame.name === s.name ? 'border-brand-400/60 bg-brand-500/10 text-ink-50' : 'border-white/10 text-ink-300 hover:border-white/20')}
              >
                <span className="h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: s.hex }} />
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-[12px] text-ink-400">Size</legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {p.sizes.map((s) => (
              <button
                key={s.label}
                disabled={!s.stock}
                onClick={() => setSize(s.label)}
                aria-pressed={size === s.label}
                className={cn(
                  'focus-ring relative rounded-lg border py-2 text-[13px] font-medium transition-colors',
                  size === s.label ? 'border-brand-400/60 bg-brand-500/10 text-ink-50' : 'border-white/10 text-ink-300 hover:border-white/20',
                  !s.stock && 'cursor-not-allowed text-ink-600 line-through hover:border-white/10',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className={cn('mt-2 text-[12px]', stock <= 4 ? 'text-amber-300' : 'text-emerald-300')}>{stock <= 4 ? `Only ${stock} left in ${size}` : 'In stock, ships today'}</p>
        </fieldset>

        <div className="mt-5 flex gap-2">
          <div className="flex items-center rounded-xl bg-white/5 shadow-hairline">
            <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="focus-ring grid h-11 w-10 place-items-center text-ink-300 hover:text-ink-50">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center font-mono text-sm tabular-nums text-ink-50" aria-live="polite">{qty}</span>
            <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(stock, q + 1))} className="focus-ring grid h-11 w-10 place-items-center text-ink-300 hover:text-ink-50">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={add}
            className={cn('focus-ring flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]', state === 'added' ? 'bg-emerald-500 text-white' : 'bg-brand-400 text-ink-950 hover:bg-brand-300')}
          >
            {state === 'adding' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : state === 'added' ? <><Check className="h-4 w-4" /> Added to cart</> : <><ShoppingBag className="h-4 w-4" /> Add to cart</>}
          </button>
        </div>

        <div className="mt-4 space-y-1.5 text-[12.5px] text-ink-400">
          <p className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-ink-500" /> Arrives <span className="text-ink-100">{deliveryWindow()}</span></p>
          <p className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-ink-500" /> Free 30-day returns</p>
        </div>

        <div className="mt-5 divide-y divide-white/5 border-y border-white/5">
          {sections.map(([title, body]) => {
            const on = open === title;
            return (
              <div key={title}>
                <button onClick={() => setOpen(on ? null : title)} aria-expanded={on} className="focus-ring flex w-full items-center justify-between py-3 text-left text-[13px] font-medium text-ink-100">
                  {title}
                  <ChevronDown className={cn('h-4 w-4 text-ink-500 transition-transform duration-300', on && 'rotate-180')} />
                </button>
                <div className={cn('grid transition-all duration-300 ease-smooth', on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <p className="overflow-hidden pb-3 text-[12.5px] leading-relaxed text-ink-400">{body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailDemo() {
  return (
    <div className="w-full max-w-4xl">
      <ProductDetail product={PRODUCTS[1]} />
    </div>
  );
}
