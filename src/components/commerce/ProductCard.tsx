import { useState } from 'react';
import { Check, Heart, Plus, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PRODUCTS, artistOf, money, type Product } from './data';
import { Print } from './Print';

export type ProductCardProps = { product: Product; onAdd?: (p: Product, size: string, frame: string) => void; className?: string };

export function ProductCard({ product: p, onAdd, className }: ProductCardProps) {
  const [frame, setFrame] = useState(p.swatches[0]);
  const [liked, setLiked] = useState(false);
  const [picking, setPicking] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const add = (size: string) => {
    setPicking(false);
    setAdded(size);
    onAdd?.(p, size, frame.name);
    window.setTimeout(() => setAdded(null), 1600);
  };

  return (
    <article className={cn('group flex min-w-0 flex-col', className)}>
      <div className="relative overflow-hidden rounded-2xl bg-ink-900 shadow-card">
        <div className="relative aspect-[4/5]">
          <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
            <Print art={p.art[0]} frame={frame.hex} className="h-full w-full" />
          </div>
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <Print art={p.art[1]} frame={frame.hex} zoom={1.06} className="h-full w-full" />
          </div>
        </div>
        {p.badge && (
          <span className={cn('absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10.5px] font-medium', p.badge === 'Sale' ? 'bg-rose-500 text-white' : p.badge === 'New' ? 'bg-brand-400 text-ink-950' : 'bg-white/90 text-ink-950')}>
            {p.badge}
          </span>
        )}
        <button
          onClick={() => setLiked((l) => !l)}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={liked}
          className="focus-ring absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-transform active:scale-90"
        >
          <Heart className={cn('h-4 w-4 transition-all duration-300 ease-spring', liked && 'scale-110 fill-rose-500 text-rose-500')} />
        </button>

        {/* quick add */}
        <div className={cn('absolute inset-x-3 bottom-3 transition-all duration-300 ease-smooth', picking || added ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100')}>
          {picking ? (
            <div className="flex gap-1 rounded-xl bg-ink-950/90 p-1 backdrop-blur animate-scale-in" role="group" aria-label="Choose a size">
              {p.sizes.map((s) => (
                <button
                  key={s.label}
                  disabled={!s.stock}
                  onClick={() => add(s.label)}
                  className="focus-ring flex-1 rounded-lg py-1.5 text-[12px] font-medium text-ink-100 transition-colors hover:bg-white/10 disabled:text-ink-600 disabled:line-through"
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setPicking(true)}
              className={cn('focus-ring flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium backdrop-blur transition-colors', added ? 'bg-emerald-500 text-white' : 'bg-white/90 text-ink-950 hover:bg-white')}
            >
              {added ? <><Check className="h-4 w-4" /> Added · {added}</> : <><Plus className="h-4 w-4" /> Quick add</>}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-medium text-ink-50">{p.name}</h3>
          <p className="truncate text-[12px] text-ink-500">{p.kind} · {artistOf(p)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn('text-[14px] font-medium tabular-nums', p.compareAt ? 'text-rose-300' : 'text-ink-50')}>{money(p.price)}</p>
          {p.compareAt && <p className="text-[11.5px] tabular-nums text-ink-500 line-through">{money(p.compareAt)}</p>}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Frame">
          {p.swatches.map((s) => (
            <button
              key={s.name}
              role="radio"
              aria-checked={frame.name === s.name}
              aria-label={`${s.name} frame`}
              onClick={() => setFrame(s)}
              className={cn('focus-ring h-4 w-4 rounded-full ring-1 ring-white/15 transition-all', frame.name === s.name && 'ring-2 ring-brand-300 ring-offset-2 ring-offset-ink-950')}
              style={{ background: s.hex }}
            />
          ))}
        </div>
        <span className="flex items-center gap-1 text-[11.5px] text-ink-400">
          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
          <span className="tabular-nums">{p.rating.toFixed(1)}</span>
          <span className="text-ink-600">({p.reviews})</span>
        </span>
      </div>
    </article>
  );
}

export function ProductCardDemo() {
  const [count, setCount] = useState(2);
  return (
    <div className="w-full max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-500">Fieldhouse · Prints</p>
          <h3 className="mt-1 text-lg font-medium text-ink-50">New this season</h3>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-ink-300 shadow-hairline">
          Cart <span className="ml-1 font-mono tabular-nums text-brand-300">{count}</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3">
        {PRODUCTS.slice(0, 6).map((p, i) => (
          <ProductCard key={p.id} product={p} onAdd={() => setCount((c) => c + 1)} className={i >= 4 ? 'hidden md:flex' : undefined} />
        ))}
      </div>
    </div>
  );
}
