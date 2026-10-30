import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Heart, Minus, Plus, Search, ShoppingBag, Star, Truck, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { artwork } from '@/components/gallery/art';

type Cat = 'All' | 'Outerwear' | 'Knitwear' | 'Bags' | 'Home';
type Product = { id: number; name: string; cat: Exclude<Cat, 'All'>; price: number; rating: number; colors: string[]; badge?: string; art: number };

const PRODUCTS: Product[] = [
  { id: 1, name: 'Harbour Field Jacket', cat: 'Outerwear', price: 248, rating: 4.8, colors: ['#3f4a3c', '#c8b79b'], badge: 'New', art: 5 },
  { id: 2, name: 'Merino Rib Crew', cat: 'Knitwear', price: 132, rating: 4.9, colors: ['#e8e1d4', '#2c3440'], art: 4 },
  { id: 3, name: 'Canvas Day Tote', cat: 'Bags', price: 88, rating: 4.7, colors: ['#d9c8a9', '#1f2328'], art: 3 },
  { id: 4, name: 'Stoneware Pour Set', cat: 'Home', price: 64, rating: 4.6, colors: ['#bfb6a8'], badge: 'Low stock', art: 10 },
  { id: 5, name: 'Wool Overshirt', cat: 'Outerwear', price: 196, rating: 4.8, colors: ['#5a3d2e', '#38424d'], art: 11 },
  { id: 6, name: 'Brushed Cashmere Scarf', cat: 'Knitwear', price: 158, rating: 5, colors: ['#9d8b7a', '#2b2b2b'], badge: 'Bestseller', art: 8 },
  { id: 7, name: 'Leather Weekender', cat: 'Bags', price: 395, rating: 4.9, colors: ['#6e4a2f'], art: 9 },
  { id: 8, name: 'Linen Throw', cat: 'Home', price: 120, rating: 4.7, colors: ['#e7ddcc', '#8a9a83'], art: 2 },
];
const CATS: Cat[] = ['All', 'Outerwear', 'Knitwear', 'Bags', 'Home'];
const money = (n: number) => `$${n.toLocaleString('en-US')}`;

export function StoreApp() {
  const [cat, setCat] = useState<Cat>('All');
  const [sort, setSort] = useState<'featured' | 'low' | 'high' | 'rating'>('featured');
  const [q, setQ] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({ 2: 1 });
  const [wish, setWish] = useState<number[]>([6]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Product | null>(null);
  const [toast, setToast] = useState('');
  const top = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) => (cat === 'All' || p.cat === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price);
    if (sort === 'rating') l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [cat, sort, q]);

  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  const subtotal = Object.entries(cart).reduce((s, [id, n]) => s + (PRODUCTS.find((p) => p.id === +id)?.price ?? 0) * n, 0);
  const add = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }));
    setToast(`${p.name} added to bag`);
    window.setTimeout(() => setToast(''), 2200);
  };
  const qty = (id: number, d: number) =>
    setCart((c) => {
      const n = (c[id] ?? 0) + d;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  const openOverlay = (fn: () => void) => {
    fn();
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={top} className="relative min-h-screen bg-[#f7f5f0] font-sans text-stone-900 antialiased [color-scheme:light]">
      <div className="bg-stone-900 px-4 py-2 text-center text-[12.5px] text-stone-200">
        <Truck className="mr-1.5 inline h-3.5 w-3.5" /> Free carbon-neutral shipping over $150 · 60-day returns
      </div>
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f7f5f0]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <span className="font-serif text-[26px] italic tracking-tight">Fieldhouse</span>
          <nav className="ml-6 hidden gap-1 md:flex">
            {CATS.slice(1).map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn('rounded-full px-3 py-1.5 text-[13.5px] transition-colors', cat === c ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200/70')}>
                {c}
              </button>
            ))}
          </nav>
          <label className="ml-auto hidden h-9 items-center gap-2 rounded-full border border-stone-300 bg-white px-3 text-[13px] sm:flex">
            <Search className="h-3.5 w-3.5 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search products" className="w-36 bg-transparent outline-none placeholder:text-stone-400" />
          </label>
          <button onClick={() => openOverlay(() => setOpen(true))} aria-label={`Open bag, ${count} items`} className="relative ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-stone-200/70 sm:ml-0">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && <span key={count} className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#b5532c] px-1 text-[10px] font-semibold text-white animate-scale-in">{count}</span>}
          </button>
        </div>
      </header>

      {/* overlays live under the sticky header */}
      <div className="sticky top-16 z-40 h-0">
        {(open || view) && <div className="absolute inset-x-0 top-0 h-[640px] bg-stone-900/30 backdrop-blur-[2px] animate-fade-in" onClick={() => (setOpen(false), setView(null))} />}
        {open && (
          <aside role="dialog" aria-label="Shopping bag" className="absolute right-3 top-3 flex h-[600px] w-[min(380px,calc(100%-24px))] flex-col rounded-2xl bg-white shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <h2 className="text-[16px] font-semibold">Your bag · {count}</h2>
              <button onClick={() => setOpen(false)} aria-label="Close bag" className="grid h-8 w-8 place-items-center rounded-full hover:bg-stone-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {count === 0 && <p className="py-16 text-center text-[14px] text-stone-500">Your bag is empty.</p>}
              {Object.entries(cart).map(([id, n]) => {
                const p = PRODUCTS.find((x) => x.id === +id)!;
                return (
                  <div key={id} className="flex gap-3">
                    <img src={artwork(p.art, 240, 300)} alt="" className="h-24 w-20 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{p.name}</p>
                      <p className="text-[12.5px] text-stone-500">{p.cat}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-stone-200">
                          <button onClick={() => qty(p.id, -1)} aria-label="Decrease" className="grid h-7 w-7 place-items-center"><Minus className="h-3 w-3" /></button>
                          <span className="w-6 text-center text-[13px] tabular-nums">{n}</span>
                          <button onClick={() => qty(p.id, 1)} aria-label="Increase" className="grid h-7 w-7 place-items-center"><Plus className="h-3 w-3" /></button>
                        </div>
                        <span className="text-[14px] font-medium tabular-nums">{money(p.price * n)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-3 border-t border-stone-200 p-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-[#5c7a4f] transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / 150) * 100)}%` }} />
              </div>
              <p className="text-[12.5px] text-stone-500">{subtotal >= 150 ? 'You have free shipping.' : `${money(150 - subtotal)} away from free shipping.`}</p>
              <div className="flex justify-between text-[15px] font-semibold"><span>Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div>
              <button disabled={!count} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-stone-900 text-[14px] font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-40">Checkout <ArrowRight className="h-4 w-4" /></button>
            </div>
          </aside>
        )}
        {view && (
          <div className="absolute inset-x-0 top-6 flex justify-center px-3"><div role="dialog" aria-label={view.name} className="grid w-full max-w-[760px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in sm:grid-cols-2">
            <img src={artwork(view.art, 600, 720)} alt={view.name} className="h-56 w-full object-cover sm:h-full" />
            <div className="relative p-6">
              <button onClick={() => setView(null)} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full hover:bg-stone-100"><X className="h-4 w-4" /></button>
              <p className="text-[12px] uppercase tracking-[0.14em] text-stone-500">{view.cat}</p>
              <h2 className="mt-2 font-serif text-[30px] leading-tight">{view.name}</h2>
              <p className="mt-2 flex items-center gap-1 text-[13px] text-stone-600"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {view.rating} · 128 reviews</p>
              <p className="mt-4 text-[22px] font-semibold tabular-nums">{money(view.price)}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-stone-600">Made in small runs from traceable fibres, cut for everyday wear and finished by hand.</p>
              <div className="mt-4 flex gap-2">{view.colors.map((c) => <span key={c} className="h-6 w-6 rounded-full ring-2 ring-white ring-offset-1 ring-offset-stone-300" style={{ background: c }} />)}</div>
              <button onClick={() => (add(view), setView(null))} className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-stone-900 text-[14px] font-medium text-white hover:bg-stone-800">Add to bag · {money(view.price)}</button>
            </div>
          </div></div>
        )}
      </div>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-8 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#b5532c]">Autumn edit · 2026</p>
          <h1 className="mt-4 font-serif text-[48px] leading-[0.98] tracking-tight sm:text-[68px]">
            Made to be <em className="italic">worn in</em>, not worn out.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-stone-600">Quiet pieces in honest materials, designed to get better with every season.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#fh-shop" className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-6 text-[14px] font-medium text-white hover:bg-stone-800">Shop the edit <ArrowRight className="h-4 w-4" /></a>
            <button onClick={() => setCat('Knitwear')} className="inline-flex h-11 items-center rounded-full border border-stone-300 px-6 text-[14px] font-medium hover:bg-white">Knitwear</button>
          </div>
        </div>
        <div className="relative">
          <img src={artwork(3, 900, 1000)} alt="" className="aspect-[9/10] w-full rounded-3xl object-cover shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]" />
          <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 text-[13px] shadow-lg backdrop-blur">
            <p className="font-medium">Harbour Field Jacket</p>
            <p className="text-stone-500">Waxed cotton · {money(248)}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:px-6 md:grid-cols-4">
        {CATS.slice(1).map((c, i) => (
          <button key={c} onClick={() => setCat(c)} className="group relative aspect-[4/3] overflow-hidden rounded-2xl text-left">
            <img src={artwork([5, 4, 9, 10][i], 500, 380)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <span className="absolute bottom-3 left-3 text-[15px] font-medium text-white">{c}</span>
          </button>
        ))}
      </section>

      <section id="fh-shop" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-[34px] tracking-tight">{cat === 'All' ? 'All products' : cat}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {CATS.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={cn('rounded-full px-3 py-1.5 text-[12.5px] transition-colors', cat === c ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-300')}>
                  {c}
                </button>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort" className="h-8 rounded-full border border-stone-200 bg-white px-3 text-[12.5px]">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="group animate-fade-up">
              <div className="relative overflow-hidden rounded-2xl bg-stone-200">
                <button onClick={() => openOverlay(() => setView(p))} aria-label={`Quick view ${p.name}`} className="block w-full">
                  <img src={artwork(p.art, 480, 600)} alt="" className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </button>
                {p.badge && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium">{p.badge}</span>}
                <button onClick={() => setWish((w) => (w.includes(p.id) ? w.filter((x) => x !== p.id) : [...w, p.id]))} aria-label="Save" aria-pressed={wish.includes(p.id)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90">
                  <Heart className={cn('h-4 w-4 transition-colors', wish.includes(p.id) ? 'fill-[#b5532c] text-[#b5532c]' : 'text-stone-700')} />
                </button>
                <button onClick={() => add(p)} className="absolute inset-x-3 bottom-3 flex h-10 translate-y-2 items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-medium opacity-0 shadow transition-all group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100">
                  <Plus className="h-3.5 w-3.5" /> Add to bag
                </button>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-medium">{p.name}</h3>
                  <div className="mt-1 flex gap-1">{p.colors.map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ background: c }} />)}</div>
                </div>
                <span className="text-[14px] tabular-nums">{money(p.price)}</span>
              </div>
            </article>
          ))}
          {!list.length && <p className="col-span-full py-12 text-center text-stone-500">Nothing matches “{q}”.</p>}
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-[#efece5]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <span className="font-serif text-[24px] italic">Fieldhouse</span>
            <p className="mt-3 max-w-xs text-[13.5px] text-stone-600">Slow-made clothing and objects for the long haul.</p>
          </div>
          {[['Shop', ['New in', 'Outerwear', 'Knitwear', 'Home']], ['Help', ['Shipping', 'Returns', 'Size guide', 'Contact']], ['About', ['Our materials', 'Workshops', 'Journal']]].map(([h, l]) => (
            <div key={h as string}>
              <p className="text-[12px] uppercase tracking-[0.14em] text-stone-500">{h as string}</p>
              <ul className="mt-3 space-y-2 text-[13.5px]">{(l as string[]).map((x) => <li key={x}><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{x}</a></li>)}</ul>
            </div>
          ))}
        </div>
      </footer>

      {toast && (
        <div className="sticky bottom-4 z-50 mx-auto flex w-fit items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-[13px] text-white shadow-xl animate-fade-up" role="status">
          <Check className="h-4 w-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
