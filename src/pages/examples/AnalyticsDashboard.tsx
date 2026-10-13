import { Activity, BarChart3, Globe, LayoutDashboard, PieChart, Settings, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { AreaChart, CountUp, DonutChart, Sparkline } from './shared/charts';
import { AppShell, Avatar, Badge, Card, Delta, ProgressBar, SectionTitle, TopBar, avatarColors, type NavItem } from './shared/shell';

const nav: NavItem[] = [
  { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users, badge: 12 },
  { id: 'traffic', label: 'Traffic', icon: Globe },
  { id: 'funnels', label: 'Funnels', icon: BarChart3 },
  { id: 'retention', label: 'Retention', icon: PieChart },
  { id: 'events', label: 'Live Events', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const kpis = [
  { label: 'Revenue', value: 284932, prefix: '$', delta: 12.4, spark: [12, 18, 14, 22, 19, 28, 24, 31, 27, 34], color: '#3396ff', icon: 'Revenue' },
  { label: 'Active Users', value: 48210, delta: 8.1, spark: [30, 32, 28, 35, 33, 40, 38, 44, 41, 47], color: '#34d399' },
  { label: 'Conversion', value: 4.82, suffix: '%', decimals: 2, delta: 2.3, spark: [3.1, 3.4, 3.2, 3.8, 4.0, 4.2, 4.1, 4.5, 4.6, 4.8], color: '#fbbf24' },
  { label: 'Churn', value: 1.92, suffix: '%', decimals: 2, delta: -0.6, spark: [2.4, 2.2, 2.3, 2.1, 2.0, 2.1, 1.9, 2.0, 1.95, 1.92], color: '#fb7185' },
];

function gen(days: number) {
  let v = 22000 + Math.random() * 4000;
  return Array.from({ length: days }, (_, i) => {
    v += (Math.random() - 0.45) * 2400;
    v = Math.max(14000, v);
    return { label: `D${i + 1}`, value: Math.round(v) };
  });
}

const traffic = [
  { label: 'Organic', value: 42, color: '#3396ff' },
  { label: 'Direct', value: 26, color: '#34d399' },
  { label: 'Referral', value: 18, color: '#fbbf24' },
  { label: 'Social', value: 14, color: '#fb7185' },
];

const topPages = [
  { path: '/pricing', views: 18420, conv: 7.4 },
  { path: '/features', views: 15320, conv: 5.1 },
  { path: '/blog/launch-week', views: 12104, conv: 9.2 },
  { path: '/docs/quickstart', views: 9880, conv: 3.4 },
  { path: '/changelog', views: 7612, conv: 6.0 },
];

const countries = [
  { flag: '🇺🇸', name: 'United States', visitors: 12480, color: 'azure' as const },
  { flag: '🇬🇧', name: 'United Kingdom', visitors: 6420, color: 'sky' as const },
  { flag: '🇩🇪', name: 'Germany', visitors: 5210, color: 'emerald' as const },
  { flag: '🇯🇵', name: 'Japan', visitors: 4380, color: 'rose' as const },
  { flag: '🇧🇷', name: 'Brazil', visitors: 3120, color: 'amber' as const },
];

const feed = [
  { who: 'AC', color: 'azure' as const, text: 'Acme Corp upgraded to Pro plan', time: '2m ago' },
  { who: 'JS', color: 'emerald' as const, text: 'Joon Sohn invited 3 teammates', time: '14m ago' },
  { who: 'LV', color: 'rose' as const, text: 'Lina Vega started a trial', time: '26m ago' },
  { who: 'RD', color: 'amber' as const, text: 'Ravi Desai connected Slack', time: '41m ago' },
  { who: 'MK', color: 'sky' as const, text: 'Maya Klein exported Q1 report', time: '1h ago' },
];

const RANGES = ['7D', '30D', '90D'] as const;

export function AnalyticsDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>('30D');
  const [data, setData] = useState(() => gen(30));
  const [active, setActive] = useState('analytics');
  const switchRange = (r: (typeof RANGES)[number]) => {
    setRange(r);
    const days = r === '7D' ? 7 : r === '30D' ? 30 : 90;
    setData(gen(days));
  };
  return (
    <AppShell
      brand={<><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-300"><Sparkles className="h-4 w-4" /></span><span className="text-sm font-semibold text-ink-50">NiceUI</span><Badge tone="brand" className="ml-1">Analytics</Badge></>}
      nav={nav}
      active={active}
      onNav={setActive}
      topbar={<TopBar dateLabel="Mar 1 – Mar 30, 2026" notif={3} initials="MK" color="azure" />}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-50">Analytics overview</h1>
          <p className="text-sm text-ink-400">Product performance for the last {range}.</p>
        </div>
        <Badge tone="brand"><span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> New</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={k.label} delay={i * 70}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-400">{k.label}</span>
              <Delta value={k.delta} />
            </div>
            <div className="mt-2 text-2xl font-semibold text-ink-50">
              <CountUp value={k.value} prefix={k.prefix ?? ''} suffix={k.suffix ?? ''} decimals={k.decimals ?? 0} />
            </div>
            <div className="mt-2"><Sparkline data={k.spark} color={k.color} width={200} height={32} className="w-full" /></div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={300}>
          <SectionTitle
            title="Revenue over time"
            action={
              <div className="flex rounded-lg bg-ink-850 p-0.5">
                {RANGES.map((r) => (
                  <button key={r} onClick={() => switchRange(r)} className={cn('relative rounded-md px-3 py-1 text-xs font-medium transition-colors', range === r ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200')}>
                    {range === r && <span className="absolute inset-0 rounded-md bg-white/10 shadow-hairline" />}
                    <span className="relative">{r}</span>
                  </button>
                ))}
              </div>
            }
          />
          <AreaChart data={data} height={260} format={(v) => `$${(v / 1000).toFixed(1)}k`} />
        </Card>

        <Card delay={360}>
          <SectionTitle title="Traffic sources" sub="Last 30 days" />
          <div className="flex items-center gap-5">
            <DonutChart data={traffic} center={<><span className="text-lg font-semibold text-ink-50">100%</span><span className="text-[10px] text-ink-500">sessions</span></>}>
            </DonutChart>
            <div className="flex-1 space-y-2.5">
              {traffic.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: t.color }} />
                  <span className="text-ink-300">{t.label}</span>
                  <span className="ml-auto font-medium text-ink-100">{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={420}>
          <SectionTitle title="Top pages" sub="By sessions" action={<button className="text-xs text-brand-300 hover:text-brand-200">View all</button>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead><tr className="text-xs text-ink-500"><th className="pb-2 font-medium">Page</th><th className="pb-2 text-right font-medium">Sessions</th><th className="pb-2 font-medium">Conv. rate</th></tr></thead>
              <tbody>
                {topPages.map((p) => (
                  <tr key={p.path} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="py-2.5 font-mono text-[13px] text-ink-100">{p.path}</td>
                    <td className="py-2.5 text-right text-ink-300">{p.views.toLocaleString()}</td>
                    <td className="py-2.5"><div className="flex items-center gap-2"><div className="w-24"><ProgressBar value={p.conv * 10} color="#3396ff" /></div><span className="text-xs text-ink-300">{p.conv}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card delay={480}>
          <SectionTitle title="Live visitors" action={<span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>{Math.floor(420 + Math.random() * 60)}</span>} />
          <div className="space-y-2">
            {countries.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${480 + i * 60}ms` }}>
                <span className="text-base">{c.flag}</span>
                <span className="text-sm text-ink-200">{c.name}</span>
                <span className="ml-auto text-xs text-ink-400">{c.visitors.toLocaleString()}</span>
                <span className={cn('h-1.5 w-12 rounded-full bg-gradient-to-r', avatarColors[c.color])} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4" delay={540}>
        <SectionTitle title="Recent activity" />
        <div className="space-y-1">
          {feed.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.02] animate-fade-up" style={{ animationDelay: `${540 + i * 60}ms` }}>
              <Avatar initials={f.who} color={f.color} size="sm" />
              <span className="text-sm text-ink-200">{f.text}</span>
              <span className="ml-auto text-xs text-ink-500">{f.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
