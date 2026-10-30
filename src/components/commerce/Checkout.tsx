import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, CreditCard, LoaderCircle, Lock, Tag, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PRODUCTS, money } from './data';
import { Print } from './Print';

type Brand = 'visa' | 'mastercard' | 'amex' | 'discover' | null;

export function detectBrand(num: string): Brand {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(011|5)/.test(n)) return 'discover';
  return null;
}

export function formatCard(v: string) {
  const n = v.replace(/\D/g, '');
  if (detectBrand(n) === 'amex') return n.slice(0, 15).replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
  return n.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

const BRAND_STYLE: Record<Exclude<Brand, null>, { label: string; bg: string }> = {
  visa: { label: 'VISA', bg: 'bg-[#1a1f71]' },
  mastercard: { label: 'MC', bg: 'bg-[#2b2b2b]' },
  amex: { label: 'AMEX', bg: 'bg-[#2e77bc]' },
  discover: { label: 'DISC', bg: 'bg-[#e0761a]' },
};

/** Generic card-network badge (text mark, no network logos). */
function BrandBadge({ brand }: { brand: Brand }) {
  if (!brand) return <CreditCard className="h-4 w-4 text-ink-500" />;
  const s = BRAND_STYLE[brand];
  return <span className={cn('rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white animate-scale-in', s.bg)}>{s.label}</span>;
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block min-w-0', className)}>
      <span className="mb-1.5 block text-[11.5px] text-ink-400">{label}</span>
      {children}
    </label>
  );
}

const input = 'focus-ring h-10 w-full rounded-lg border border-white/10 bg-ink-950/60 px-3 text-[13.5px] text-ink-50 outline-none transition-colors placeholder:text-ink-600 focus:border-brand-400/60';

const DELIVERY = [
  { id: 'standard', label: 'Standard', eta: '3–5 business days', price: 0 },
  { id: 'express', label: 'Express', eta: '1–2 business days', price: 18 },
  { id: 'white', label: 'White glove', eta: 'Delivered and hung', price: 65 },
];

const ITEMS = [
  { p: PRODUCTS[0], qty: 1, frame: 'Oak', size: 'A3' },
  { p: PRODUCTS[2], qty: 1, frame: 'Black', size: 'A2' },
];

export function Checkout({ className }: { className?: string }) {
  const [email, setEmail] = useState('maya@halcyon.studio');
  const [card, setCard] = useState('4242 4242 4242');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [delivery, setDelivery] = useState('express');
  const [promo, setPromo] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);
  const [state, setState] = useState<'idle' | 'paying' | 'paid'>('idle');
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const brand = detectBrand(card);
  const subtotal = ITEMS.reduce((s, i) => s + i.p.price * i.qty, 0);
  const discount = applied ? Math.round(subtotal * 0.15) : 0;
  const ship = DELIVERY.find((d) => d.id === delivery)!.price;
  const tax = Math.round((subtotal - discount) * 0.08);
  const total = subtotal - discount + ship + tax;
  const cardDigits = card.replace(/\D/g, '').length;
  const valid = /\S+@\S+\.\S+/.test(email) && cardDigits >= (brand === 'amex' ? 15 : 16) && exp.length === 5 && cvc.length >= 3;

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'FIELD15') {
      setApplied('FIELD15');
      setPromoError(false);
      setPromo('');
    } else setPromoError(true);
  };
  const pay = () => {
    if (!valid || state !== 'idle') return;
    setState('paying');
    timer.current = window.setTimeout(() => setState('paid'), 1400);
  };

  if (state === 'paid')
    return (
      <div className={cn('grid w-full place-items-center rounded-2xl bg-ink-900 p-10 text-center shadow-card', className)}>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300 animate-scale-in">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-xl font-semibold text-ink-50">Order confirmed</h3>
        <p className="mt-1 text-sm text-ink-400">#FH-20481 · {money(total)} · receipt sent to {email}</p>
        <button onClick={() => setState('idle')} className="focus-ring mt-5 rounded-lg bg-white/5 px-3 py-1.5 text-[12.5px] text-ink-200 hover:bg-white/10">Back to checkout</button>
      </div>
    );

  return (
    <div className={cn('grid w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]', className)}>
      <form className="min-w-0 space-y-6 p-5 sm:p-6" onSubmit={(e) => (e.preventDefault(), pay())}>
        <section>
          <h4 className="text-[13px] font-medium text-ink-100">Contact</h4>
          <Field label="Email" className="mt-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} autoComplete="email" />
          </Field>
        </section>

        <section>
          <h4 className="text-[13px] font-medium text-ink-100">Shipping address</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="First name"><input defaultValue="Maya" className={input} /></Field>
            <Field label="Last name"><input defaultValue="Ocampo" className={input} /></Field>
            <Field label="Address" className="col-span-2"><input defaultValue="18 Rua das Flores" className={input} /></Field>
            <Field label="City"><input defaultValue="Lisbon" className={input} /></Field>
            <Field label="Postcode"><input defaultValue="1200-195" className={input} /></Field>
          </div>
        </section>

        <section>
          <h4 className="text-[13px] font-medium text-ink-100">Delivery</h4>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label="Delivery method">
            {DELIVERY.map((d) => (
              <button
                type="button"
                key={d.id}
                role="radio"
                aria-checked={delivery === d.id}
                onClick={() => setDelivery(d.id)}
                className={cn('focus-ring flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors', delivery === d.id ? 'border-brand-400/60 bg-brand-500/[0.07]' : 'border-white/10 hover:border-white/20')}
              >
                <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded-full border', delivery === d.id ? 'border-brand-300' : 'border-ink-500')}>
                  {delivery === d.id && <span className="h-2 w-2 rounded-full bg-brand-300 animate-scale-in" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-ink-50">{d.label}</span>
                  <span className="block text-[11.5px] text-ink-500">{d.eta}</span>
                </span>
                <span className="text-[13px] tabular-nums text-ink-200">{d.price ? money(d.price) : 'Free'}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h4 className="flex items-center gap-2 text-[13px] font-medium text-ink-100">Payment <Lock className="h-3 w-3 text-ink-500" /></h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Card number" className="col-span-2">
              <div className="relative">
                <input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={card}
                  onChange={(e) => setCard(formatCard(e.target.value))}
                  placeholder="1234 1234 1234 1234"
                  className={cn(input, 'pr-16 font-mono tracking-wide')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2"><BrandBadge brand={brand} /></span>
              </div>
            </Field>
            <Field label="Expiry">
              <input
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={exp}
                onChange={(e) => {
                  const n = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setExp(n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n);
                }}
                className={cn(input, 'font-mono')}
              />
            </Field>
            <Field label="CVC">
              <input inputMode="numeric" autoComplete="cc-csc" placeholder={brand === 'amex' ? '4 digits' : '3 digits'} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, brand === 'amex' ? 4 : 3))} className={cn(input, 'font-mono')} />
            </Field>
          </div>
          <p className="mt-2 text-[11.5px] text-ink-500">Try 4…, 5…, 34… or 6011… to see the card type change.</p>
        </section>

        <button
          type="submit"
          disabled={!valid}
          className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-400 text-sm font-medium text-ink-950 transition-all hover:bg-brand-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === 'paying' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <><Lock className="h-3.5 w-3.5" /> Pay {money(total)}</>}
        </button>
      </form>

      <aside className="min-w-0 border-t border-white/5 bg-white/[0.02] p-5 sm:p-6 md:border-l md:border-t-0">
        <h4 className="text-[13px] font-medium text-ink-100">Order summary</h4>
        <ul className="mt-4 space-y-3">
          {ITEMS.map(({ p, qty, frame, size }) => (
            <li key={p.id} className="flex items-center gap-3">
              <div className="relative">
                <Print art={p.art[0]} className="h-16 w-[52px] rounded-lg" />
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-700 text-[10px] font-medium text-ink-100">{qty}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-ink-50">{p.name}</p>
                <p className="text-[11.5px] text-ink-500">{frame} · {size}</p>
              </div>
              <span className="text-[13px] tabular-nums text-ink-200">{money(p.price * qty)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          {applied ? (
            <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2 text-[12.5px] text-emerald-300 animate-fade-in">
              <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> {applied} · 15% off</span>
              <button onClick={() => setApplied(null)} aria-label="Remove code" className="focus-ring rounded p-0.5 hover:bg-emerald-500/10"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input value={promo} onChange={(e) => (setPromo(e.target.value), setPromoError(false))} onKeyDown={(e) => e.key === 'Enter' && applyPromo()} placeholder="Gift card or code" aria-label="Promo code" className={cn(input, 'uppercase', promoError && 'border-rose-400/60')} />
                <button onClick={applyPromo} className="focus-ring shrink-0 rounded-lg bg-white/10 px-3 text-[12.5px] font-medium text-ink-50 hover:bg-white/15">Apply</button>
              </div>
              <p className={cn('mt-1.5 text-[11.5px]', promoError ? 'text-rose-300' : 'text-ink-500')}>{promoError ? 'That code isn’t valid.' : 'Try FIELD15'}</p>
            </div>
          )}
        </div>

        <dl className="mt-5 space-y-2 border-t border-white/5 pt-4 text-[13px]">
          <div className="flex justify-between text-ink-400"><dt>Subtotal</dt><dd className="tabular-nums text-ink-100">{money(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-emerald-300"><dt>Discount</dt><dd className="tabular-nums">−{money(discount)}</dd></div>}
          <div className="flex justify-between text-ink-400"><dt>Shipping</dt><dd className="tabular-nums text-ink-100">{ship ? money(ship) : 'Free'}</dd></div>
          <div className="flex justify-between text-ink-400"><dt>Tax</dt><dd className="tabular-nums text-ink-100">{money(tax)}</dd></div>
          <div className="flex justify-between border-t border-white/5 pt-3 text-[15px] font-medium text-ink-50"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}

export function CheckoutDemo() {
  return (
    <div className="w-full max-w-4xl">
      <Checkout />
    </div>
  );
}
