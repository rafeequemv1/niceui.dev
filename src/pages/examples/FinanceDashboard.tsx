import { ArrowDownRight, ArrowUpRight, CreditCard, DollarSign, Receipt, Wallet, Building2, Settings, Bell, PieChart, Repeat, Send } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { BarChart, CountUp } from './shared/charts';
import { AppShell, Avatar, Badge, Card, Delta, ProgressBar, SectionTitle, TopBar, avatarColors, type NavItem } from './shared/shell';

const nav: NavItem[] = [
  { id: 'finance', label: 'Overview', icon: DollarSign },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'cards', label: 'Cards', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: Repeat },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const monthly = [
  { label: 'Jan', values: { in: 38, out: 24 } }, { label: 'Feb', values: { in: 42, out: 28 } },
  { label: 'Mar', values: { in: 35, out: 31 } }, { label: 'Apr', values: { in: 48, out: 26 } },
  { label: 'May', values: { in: 52, out: 33 } }, { label: 'Jun', values: { in: 46, out: 29 } },
  { label: 'Jul', values: { in: 58, out: 35 } }, { label: 'Aug', values: { in: 61, out: 38 } },
  { label: 'Sep', values: { in: 54, out: 34 } }, { label: 'Oct', values: { in: 67, out: 41 } },
  { label: 'Nov', values: { in: 72, out: 39 } }, { label: 'Dec', values: { in: 81, out: 44 } },
];

const categories = [
  { label: 'Payroll', value: 48000, pct: 58, color: '#3396ff' },
  { label: 'Infrastructure', value: 18400, pct: 22, color: '#34d399' },
  { label: 'Marketing', value: 9600, pct: 12, color: '#fbbf24' },
  { label: 'Office', value: 4200, pct: 5, color: '#fb7185' },
  { label: 'Other', value: 2600, pct: 3, color: '#8a8a96' },
];

const txns = [
  { name: 'Stripe payout', sub: 'inbound transfer', amount: 18420, type: 'income', date: 'Mar 29', status: 'completed', who: 'SP' },
  { name: 'AWS Hosting', sub: 'invoice #INV-2041', amount: -3280, type: 'expense', date: 'Mar 28', status: 'completed', who: 'AW' },
  { name: 'Figma', sub: 'team subscription', amount: -540, type: 'expense', date: 'Mar 27', status: 'completed', who: 'FG' },
  { name: 'Notion Labs', sub: 'annual renewal', amount: -1200, type: 'expense', date: 'Mar 26', status: 'pending', who: 'NT' },
  { name: 'Acme Corp', sub: 'consulting retainer', amount: 9800, type: 'income', date: 'Mar 24', status: 'completed', who: 'AC' },
  { name: 'Glide Robotics', sub: 'contract NDA-118', amount: -2400, type: 'expense', date: 'Mar 22', status: 'failed', who: 'GR' },
];

const contacts = [
  { name: 'Mira Chen', handle: '@mira', color: 'azure' as const },
  { name: 'Joon Sohn', handle: '@joon', color: 'emerald' as const },
  { name: 'Lina Vega', handle: '@lina', color: 'rose' as const },
  { name: 'Ravi Desai', handle: '@ravi', color: 'amber' as const },
  { name: 'Maya Klein', handle: '@maya', color: 'sky' as const },
];

const bills = [
  { label: 'AWS Hosting', due: 'Apr 3', amount: 3280, color: 'amber' as const },
  { label: 'Office lease', due: 'Apr 5', amount: 8400, color: 'rose' as const },
  { label: 'Health benefits', due: 'Apr 9', amount: 4120, color: 'sky' as const },
];

const TABS = ['All', 'Income', 'Expense'] as const;

export function FinanceDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [amount, setAmount] = useState('2,500');
  const [active, setActive] = useState('finance');
  const filtered = txns.filter((t) => tab === 'All' || t.type === tab.toLowerCase());
  return (
    <AppShell
      brand={<><span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300"><Wallet className="h-4 w-4" /></span><span className="text-sm font-semibold text-ink-50">Mercury</span></>}
      nav={nav}
      active={active}
      onNav={setActive}
      topbar={<TopBar dateLabel="Mar 2026" notif={2} initials="MC" color="emerald" />}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Balance hero */}
        <Card className="xl:col-span-2 overflow-hidden p-0" delay={0}>
          <div className="relative grid-bg p-6" style={{ background: 'linear-gradient(135deg, #1461e1 0%, #174eb6 45%, #0a0a0c 120%)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/70">Total balance</p>
                <div className="mt-1 text-4xl font-semibold text-white"><CountUp value={284932} prefix="$" /></div>
                <Delta value={12.4} className="text-white/80" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs text-white backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Checking · 4242</span>
            </div>
            <div className="mt-8 flex items-center justify-between font-mono text-lg tracking-[0.2em] text-white/90">
              <span>4242</span><span className="text-white/40">····</span><span className="text-white/40">····</span><span>1005</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
              <span>MIRA CHEN</span><span>VISA · 09/27</span>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/5">
            <div className="p-4"><p className="text-xs text-ink-500">Income</p><p className="mt-1 text-lg font-semibold text-emerald-400">$81.2k</p></div>
            <div className="p-4"><p className="text-xs text-ink-500">Expense</p><p className="mt-1 text-lg font-semibold text-rose-400">$44.1k</p></div>
            <div className="p-4"><p className="text-xs text-ink-500">Net</p><p className="mt-1 text-lg font-semibold text-ink-50">$37.1k</p></div>
          </div>
        </Card>

        {/* Quick transfer */}
        <Card delay={80}>
          <SectionTitle title="Quick transfer" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {contacts.map((c) => (
              <button key={c.handle} className="group flex shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-white/[0.03]">
                <Avatar initials={c.name.split(' ').map((w) => w[0]).join('')} color={c.color} ring />
                <span className="text-[11px] text-ink-300 group-hover:text-ink-50">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">$</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} className="focus-ring h-11 w-full rounded-xl bg-ink-850 pl-7 pr-3 text-lg font-medium text-ink-50 ring-1 ring-white/5 focus:ring-brand-500/40" />
            </div>
            <button className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-medium text-white transition hover:bg-brand-500 active:scale-95">
              <Send className="h-4 w-4" /> Send transfer
            </button>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={160}>
          <SectionTitle title="Income vs expense" sub="2026 · in thousands" />
          <BarChart
            height={240}
            groups={monthly}
            series={[{ key: 'in', label: 'Income', color: '#34d399' }, { key: 'out', label: 'Expense', color: '#fb7185' }]}
            format={(v) => `$${v}k`}
          />
        </Card>

        <Card delay={220}>
          <SectionTitle title="Spending categories" sub="This month" />
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-sm"><span className="text-ink-300">{c.label}</span><span className="text-ink-100">${(c.value / 1000).toFixed(1)}k</span></div>
                <ProgressBar value={c.pct} color={c.color} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={300}>
          <SectionTitle title="Transactions" action={
            <div className="flex rounded-lg bg-ink-850 p-0.5">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn('relative rounded-md px-3 py-1 text-xs font-medium transition-colors', tab === t ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200')}>
                  {tab === t && <span className="absolute inset-0 rounded-md bg-white/10 shadow-hairline" />}
                  <span className="relative">{t}</span>
                </button>
              ))}
            </div>
          } />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="text-xs text-ink-500"><th className="pb-2 font-medium">Merchant</th><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Status</th><th className="pb-2 text-right font-medium">Amount</th></tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.name + t.date} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="py-2.5"><div className="flex items-center gap-2.5"><Avatar initials={t.who} color={t.type === 'income' ? 'emerald' : 'rose'} size="sm" /><div><div className="text-ink-100">{t.name}</div><div className="text-xs text-ink-500">{t.sub}</div></div></div></td>
                    <td className="py-2.5 text-ink-400">{t.date}</td>
                    <td className="py-2.5"><Badge tone={t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'error'}>{t.status}</Badge></td>
                    <td className={cn('py-2.5 text-right font-medium', t.amount > 0 ? 'text-emerald-400' : 'text-ink-100')}>{t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card delay={360}>
          <SectionTitle title="Upcoming bills" sub="Next 14 days" />
          <div className="space-y-2">
            {bills.map((b, i) => (
              <div key={b.label} className="flex items-center gap-3 rounded-xl bg-ink-850 p-3 animate-fade-up" style={{ animationDelay: `${360 + i * 70}ms` }}>
                <span className={cn('grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white', avatarColors[b.color])}><Receipt className="h-4 w-4" /></span>
                <div><div className="text-sm text-ink-100">{b.label}</div><div className="text-xs text-ink-500">Due {b.due}</div></div>
                <span className="ml-auto font-semibold text-ink-50">${b.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
