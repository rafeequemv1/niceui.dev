import { ArrowDownRight, ArrowUpRight, Bell, DollarSign, Download, MoreHorizontal, Package, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CountUp } from './shared/charts';
import { AppShell, Avatar, Badge, Card, Delta, ProgressBar, SectionTitle, TopBar, avatarColors, type NavItem } from './shared/shell';

const nav: NavItem[] = [
  { id: 'commerce', label: 'Overview', icon: ShoppingBag },
  { id: 'orders', label: 'Orders', icon: Package, badge: 28 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'customers', label: 'Customers', icon: Star },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Bell },
];

const kpis = [
  { label: 'Revenue', value: 142800, prefix: '$', delta: 18.2, up: true },
  { label: 'Orders', value: 3284, delta: 9.4, up: true },
  { label: 'Avg. order', value: 43.5, prefix: '$', decimals: 2, delta: -2.1, up: false },
  { label: 'Conversion', value: 3.2, suffix: '%', decimals: 2, delta: 0.8, up: true },
];

const orders = [
  { id: '#10421', customer: 'Mira Chen', email: 'mira@acme.co', product: 'Aurora Headset', amount: 289, status: 'paid', color: 'azure' as const, date: 'Mar 30' },
  { id: '#10420', customer: 'Joon Sohn', email: 'joon@skyline.io', product: 'Nimbus Keyboard', amount: 159, status: 'shipped', color: 'emerald' as const, date: 'Mar 30' },
  { id: '#10419', customer: 'Lina Vega', email: 'lina@vega.studio', product: 'Orbit Mouse', amount: 79, status: 'pending', color: 'amber' as const, date: 'Mar 29' },
  { id: '#10418', customer: 'Ravi Desai', email: 'ravi@desai.dev', product: 'Aurora Headset', amount: 289, status: 'refunded', color: 'rose' as const, date: 'Mar 29' },
  { id: '#10417', customer: 'Maya Klein', email: 'maya@klein.design', product: 'Pulse Speaker', amount: 199, status: 'paid', color: 'sky' as const, date: 'Mar 28' },
];

const bestSellers = [
  { name: 'Aurora Headset', sku: 'AUR-001', sold: 1240, revenue: 358360, grad: 'from-brand-400 via-brand-600 to-brand-900' },
  { name: 'Nimbus Keyboard', sku: 'NIM-014', sold: 980, revenue: 155820, grad: 'from-emerald-300 via-teal-500 to-sky-700' },
  { name: 'Orbit Mouse', sku: 'ORB-008', sold: 842, revenue: 66518, grad: 'from-amber-400 via-orange-500 to-rose-600' },
  { name: 'Pulse Speaker', sku: 'PLS-022', sold: 514, revenue: 102286, grad: 'from-sky-400 via-sky-600 to-brand-900' },
];

const funnel = [
  { stage: 'Visitors', value: 84200, pct: 100, color: '#3396ff' },
  { stage: 'Product views', value: 41280, pct: 49, color: '#59b6ff' },
  { stage: 'Add to cart', value: 9840, pct: 11.7, color: '#8ed1ff' },
  { stage: 'Checkout', value: 4120, pct: 4.9, color: '#34d399' },
  { stage: 'Purchase', value: 3284, pct: 3.9, color: '#fbbf24' },
];

const reviews = [
  { who: 'Mira Chen', color: 'azure' as const, text: 'Best headset I have owned — sound is incredible.', stars: 5 },
  { who: 'Joon Sohn', color: 'emerald' as const, text: 'Keyboard feels premium, battery lasts forever.', stars: 5 },
  { who: 'Lina Vega', color: 'rose' as const, text: 'Great mouse, wish the cable was longer.', stars: 4 },
];

const inventory = [
  { name: 'Aurora Headset', stock: 240, level: 'ok' as const },
  { name: 'Nimbus Keyboard', stock: 38, level: 'low' as const },
  { name: 'Orbit Mouse', stock: 12, level: 'critical' as const },
  { name: 'Pulse Speaker', stock: 186, level: 'ok' as const },
];

const statusTone = { paid: 'success', shipped: 'sky', pending: 'warning', refunded: 'error' } as const;

export function CommerceDashboard() {
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState('commerce');
  return (
    <AppShell
      brand={<><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-300"><ShoppingBag className="h-4 w-4" /></span><span className="text-sm font-semibold text-ink-50">Shopify</span></>}
      nav={nav}
      active={active}
      onNav={setActive}
      topbar={<TopBar dateLabel="Mar 24 – Mar 30, 2026" notif={4} initials="AR" color="amber" />}
    >
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={k.label} delay={i * 60}>
            <span className="text-xs font-medium text-ink-400">{k.label}</span>
            <div className="mt-2 text-2xl font-semibold text-ink-50"><CountUp value={k.value} prefix={k.prefix ?? ''} suffix={k.suffix ?? ''} decimals={k.decimals ?? 0} /></div>
            <div className="mt-1.5 flex items-center gap-1 text-xs"><span className={cn('inline-flex items-center gap-0.5', k.up ? 'text-emerald-400' : 'text-rose-400')}>{k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{Math.abs(k.delta)}%</span><span className="text-ink-500">vs last week</span></div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={260}>
          <SectionTitle title="Recent orders" action={<button className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-brand-200"><Download className="h-3.5 w-3.5" />Export</button>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead><tr className="text-xs text-ink-500"><th className="pb-2 font-medium">Order</th><th className="pb-2 font-medium">Customer</th><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Status</th><th className="pb-2 text-right font-medium">Total</th><th className="pb-2"></th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="group border-t border-white/5 transition-colors hover:bg-white/[0.03]">
                    <td className="py-3 font-mono text-[13px] text-brand-300">{o.id}</td>
                    <td className="py-3"><div className="flex items-center gap-2.5"><Avatar initials={o.customer.split(' ').map((w) => w[0]).join('')} color={o.color} size="sm" /><div><div className="text-ink-100">{o.customer}</div><div className="text-xs text-ink-500">{o.email}</div></div></div></td>
                    <td className="py-3 text-ink-300">{o.product}</td>
                    <td className="py-3"><Badge tone={statusTone[o.status as 'paid']}>{o.status}</Badge></td>
                    <td className="py-3 text-right font-medium text-ink-100">${o.amount}</td>
                    <td className="py-3 text-right"><button className="opacity-0 transition-opacity group-hover:opacity-100"><MoreHorizontal className="h-4 w-4 text-ink-500 hover:text-ink-100" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card delay={320}>
          <SectionTitle title="Best sellers" sub="This month" />
          <div className="space-y-2">
            {bestSellers.map((b, i) => (
              <div key={b.sku} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.02] animate-fade-up" style={{ animationDelay: `${320 + i * 60}ms` }}>
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white', b.grad)}><Package className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm text-ink-100">{b.name}</div><div className="text-xs text-ink-500">{b.sold} sold</div></div>
                <span className="text-sm font-medium text-ink-100">${(b.revenue / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card delay={420}>
          <SectionTitle title="Conversion funnel" sub="Sessions → purchase" />
          <div className="space-y-2.5">
            {funnel.map((f, i) => (
              <div key={f.stage} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="animate-fade-up" style={{ animationDelay: `${420 + i * 70}ms` }}>
                <div className="flex items-center justify-between text-xs"><span className="text-ink-300">{f.stage}</span><span className="text-ink-500">{f.value.toLocaleString()} · {f.pct}%</span></div>
                <div className="mt-1 h-7 w-full overflow-hidden rounded-lg bg-white/5">
                  <div className="flex h-full items-center rounded-lg px-2 transition-all duration-700 ease-smooth" style={{ width: hover === i ? `${Math.max(f.pct, 12)}%` : `${f.pct}%`, background: f.color, transitionDelay: `${i * 80}ms` }}>
                    <span className="text-[10px] font-medium text-ink-950/70">{f.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={480}>
          <SectionTitle title="Customer reviews" sub="Last 7 days" />
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-xl bg-ink-850 p-3 animate-fade-up" style={{ animationDelay: `${480 + i * 70}ms` }}>
                <div className="flex items-center gap-2.5"><Avatar initials={r.who.split(' ').map((w) => w[0]).join('')} color={r.color} size="sm" /><span className="text-sm text-ink-100">{r.who}</span><span className="ml-auto flex gap-0.5">{Array.from({ length: 5 }, (_, s) => <Star key={s} className={cn('h-3 w-3', s < r.stars ? 'fill-amber-400 text-amber-400' : 'text-ink-700')} />)}</span></div>
                <p className="mt-2 text-xs text-ink-400">{r.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={540}>
          <SectionTitle title="Inventory alerts" sub="Low stock items" />
          <div className="space-y-2">
            {inventory.map((it, i) => (
              <div key={it.name} className="flex items-center gap-3 rounded-xl bg-ink-850 p-3 animate-fade-up" style={{ animationDelay: `${540 + i * 60}ms` }}>
                <span className={cn('grid h-9 w-9 place-items-center rounded-lg', it.level === 'ok' ? 'bg-emerald-500/10 text-emerald-300' : it.level === 'low' ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300')}><Package className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm text-ink-100">{it.name}</div><div className="mt-1"><ProgressBar value={Math.min(it.stock, 240) / 240 * 100} color={it.level === 'ok' ? '#34d399' : it.level === 'low' ? '#fbbf24' : '#fb7185'} /></div></div>
                <span className="text-sm font-medium text-ink-100">{it.stock}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
