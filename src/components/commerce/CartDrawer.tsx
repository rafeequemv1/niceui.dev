import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Lock, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PRODUCTS, money, type Product } from './data';
import { Print } from './Print';

export type CartLine = { key: string; product: Product; frame: string; size: string; qty: number };

const FREE_SHIPPING = 150;

export type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  onChange: (lines: CartLine[]) => void;
  upsell?: Product;
  onCheckout?: () => void;
};

/** A cart drawer that slides over its nearest positioned parent. */
export function CartDrawer({ open, onClose, lines, onChange, upsell, onCheckout }: CartDrawerProps) {
  const [removed, setRemoved] = useState<{ line: CartLine; index: number } | null>(null);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const left = Math.max(0, FREE_SHIPPING - subtotal);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const setQty = (key: string, q: number) => onChange(lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(9, q)) } : l)));
  const remove = (key: string) => {
    const index = lines.findIndex((l) => l.key === key);
    setRemoved({ line: lines[index], index });
    onChange(lines.filter((l) => l.key !== key));
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRemoved(null), 5000);
  };
  const undo = () => {
    if (!removed) return;
    const next = [...lines];
    next.splice(removed.index, 0, removed.line);
    onChange(next);
    setRemoved(null);
  };
  const addUpsell = () => upsell && onChange([...lines, { key: `u${Date.now()}`, product: upsell, frame: upsell.swatches[0].name, size: 'A4', qty: 1 }]);

  return (
    <div className={cn('absolute inset-0 z-20', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div onClick={onClose} className={cn('absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} />
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={cn('absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col bg-ink-900 shadow-pop transition-transform duration-500 ease-smooth', open ? 'translate-x-0' : 'translate-x-full')}
      >
        <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h3 className="flex items-center gap-2 text-[15px] font-medium text-ink-50">
            Your cart <span className="rounded-full bg-white/5 px-2 font-mono text-[11px] tabular-nums text-ink-300">{count}</span>
          </h3>
          <button onClick={onClose} aria-label="Close cart" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-ink-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="border-b border-white/5 px-5 py-3">
          <p className="flex items-center gap-2 text-[12.5px] text-ink-300">
            <Truck className={cn('h-4 w-4', left ? 'text-ink-500' : 'text-emerald-400')} />
            {left ? <>You're <b className="font-medium text-ink-50">{money(left)}</b> away from free shipping</> : <span className="text-emerald-300">You've unlocked free shipping</span>}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div className={cn('h-full rounded-full transition-all duration-700 ease-smooth', left ? 'bg-brand-400' : 'bg-emerald-400')} style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
          </div>
        </div>

        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.02] animate-fade-in">
              <Print art={l.product.art[0]} frame={l.product.swatches.find((s) => s.name === l.frame)?.hex} className="h-20 w-16 shrink-0 rounded-lg" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-ink-50">{l.product.name}</p>
                    <p className="text-[11.5px] text-ink-500">{l.frame} frame · {l.size}</p>
                  </div>
                  <p className="shrink-0 text-[13px] tabular-nums text-ink-100">{money(l.product.price * l.qty)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg bg-white/5 shadow-hairline">
                    <button aria-label={`Decrease ${l.product.name}`} onClick={() => setQty(l.key, l.qty - 1)} className="focus-ring grid h-7 w-7 place-items-center text-ink-400 hover:text-ink-50"><Minus className="h-3 w-3" /></button>
                    <span className="w-5 text-center font-mono text-[12px] tabular-nums text-ink-100">{l.qty}</span>
                    <button aria-label={`Increase ${l.product.name}`} onClick={() => setQty(l.key, l.qty + 1)} className="focus-ring grid h-7 w-7 place-items-center text-ink-400 hover:text-ink-50"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => remove(l.key)} aria-label={`Remove ${l.product.name}`} className="focus-ring grid h-7 w-7 place-items-center rounded-lg text-ink-500 hover:bg-white/5 hover:text-rose-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {!lines.length && (
            <li className="grid place-items-center py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-ink-600" />
              <p className="mt-3 text-sm text-ink-300">Your cart is empty</p>
            </li>
          )}
          {removed && (
            <li className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-[12.5px] text-ink-300 animate-fade-up">
              Removed {removed.line.product.name}
              <button onClick={undo} className="focus-ring rounded-md px-2 py-0.5 font-medium text-brand-300 hover:bg-brand-500/10">Undo</button>
            </li>
          )}
        </ul>

        {upsell && !lines.some((l) => l.product.id === upsell.id) && (
          <div className="mx-5 mb-3 flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5 shadow-hairline">
            <Print art={upsell.art[0]} className="h-12 w-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-ink-500">Pairs well with your picks</p>
              <p className="truncate text-[13px] text-ink-100">{upsell.name} · {money(upsell.price)}</p>
            </div>
            <button onClick={addUpsell} className="focus-ring rounded-lg bg-white/10 px-2.5 py-1.5 text-[12px] font-medium text-ink-50 hover:bg-white/15">Add</button>
          </div>
        )}

        <footer className="border-t border-white/5 px-5 py-4">
          <div className="flex justify-between text-[13px] text-ink-400"><span>Subtotal</span><span className="tabular-nums text-ink-100">{money(subtotal)}</span></div>
          <div className="mt-1 flex justify-between text-[13px] text-ink-400"><span>Shipping</span><span className="text-ink-100">{left ? 'Calculated at checkout' : 'Free'}</span></div>
          <button
            onClick={onCheckout}
            disabled={!lines.length}
            className="focus-ring mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-400 text-sm font-medium text-ink-950 transition-all hover:bg-brand-300 active:scale-[0.98] disabled:opacity-40"
          >
            <Lock className="h-3.5 w-3.5" /> Checkout · {money(subtotal)} <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      </aside>
    </div>
  );
}

export function CartDrawerDemo() {
  const [open, setOpen] = useState(true);
  const [lines, setLines] = useState<CartLine[]>([
    { key: 'a', product: PRODUCTS[0], frame: 'Oak', size: 'A3', qty: 1 },
    { key: 'b', product: PRODUCTS[3], frame: 'Black', size: 'A4', qty: 1 },
  ]);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return (
    <div className="relative h-[540px] w-full overflow-hidden rounded-2xl bg-ink-950 shadow-card">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
        <span className="text-[15px] font-semibold tracking-tight text-ink-50">Fieldhouse</span>
        <button onClick={() => setOpen(true)} aria-label="Open cart" className="focus-ring relative grid h-9 w-9 place-items-center rounded-lg text-ink-200 hover:bg-white/5">
          <ShoppingBag className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-400 px-1 text-[10px] font-semibold text-ink-950">{count}</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 p-5 opacity-60">
        {PRODUCTS.slice(0, 3).map((p) => (
          <Print key={p.id} art={p.art[0]} className="aspect-[4/5] rounded-xl" />
        ))}
      </div>
      <CartDrawer open={open} onClose={() => setOpen(false)} lines={lines} onChange={setLines} upsell={PRODUCTS[4]} onCheckout={() => setOpen(false)} />
    </div>
  );
}
