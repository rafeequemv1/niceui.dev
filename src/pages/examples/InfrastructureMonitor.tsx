import { Activity, AlertTriangle, CheckCircle2, Cloud, Cpu, Database, Gauge, GitBranch, Server, Settings, Terminal, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { AreaChart } from './shared/charts';
import { AppShell, Avatar, Badge, Card, SectionTitle, TopBar, type NavItem } from './shared/shell';
import { useInterval } from './shared/hooks';

const nav: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'services', label: 'Services', icon: Server, badge: 2 },
  { id: 'deployments', label: 'Deployments', icon: GitBranch },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'logs', label: 'Logs', icon: Terminal },
  { id: 'regions', label: 'Regions', icon: Cloud },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const services = [
  { name: 'API Gateway', status: 'healthy', uptime: 99.98, color: 'emerald' as const },
  { name: 'Postgres Primary', status: 'healthy', uptime: 99.99, color: 'emerald' as const },
  { name: 'Redis Cache', status: 'healthy', uptime: 99.95, color: 'emerald' as const },
  { name: 'Auth Service', status: 'degraded', uptime: 98.21, color: 'amber' as const },
  { name: 'Webhooks', status: 'healthy', uptime: 99.87, color: 'emerald' as const },
  { name: 'Queue Worker', status: 'down', uptime: 92.14, color: 'rose' as const },
];

const deployments = [
  { hash: 'a1f9c2', branch: 'main', msg: 'feat: add webhook retries', who: 'MR', color: 'azure' as const, time: '2m ago', status: 'live' },
  { hash: '8e3b41', branch: 'main', msg: 'fix: race in queue worker', who: 'LV', color: 'rose' as const, time: '24m ago', status: 'live' },
  { hash: 'c4d8a0', branch: 'release/v2', msg: 'chore: bump deps', who: 'JS', color: 'emerald' as const, time: '1h ago', status: 'live' },
  { hash: '2b7e6f', branch: 'feat/auth', msg: 'refactor: token refresh', who: 'RD', color: 'amber' as const, time: '3h ago', status: 'reverted' },
];

const incidents = [
  { title: 'Queue worker backlog', sev: 'high', region: 'us-east-1', time: '12m ago', tone: 'error' as const },
  { title: 'Elevated auth latency', sev: 'medium', region: 'eu-west-2', time: '1h ago', tone: 'warning' as const },
  { title: 'DB failover completed', sev: 'low', region: 'us-west-2', time: '4h ago', tone: 'success' as const },
];

const regions = [
  { name: 'us-east-1', latency: 42, load: 64 },
  { name: 'us-west-2', latency: 58, load: 41 },
  { name: 'eu-west-2', latency: 89, load: 72 },
  { name: 'ap-southeast-1', latency: 134, load: 38 },
];

const SEED_LOGS = [
  'INFO  request_id=3f2a GET /api/v1/orders 200 12ms',
  'INFO  worker queue=emails processed=24 lag=0',
  'WARN  auth service latency=420ms threshold=300ms',
  'INFO  POST /api/v1/checkout 201 88ms',
  'ERROR queue worker timeout job=send_invoice id=8842',
];

const statusTone = { healthy: 'success', degraded: 'warning', down: 'error' } as const;

function roll(n: number) {
  return Array.from({ length: n }, (_, i) => ({ label: `${i}`, value: 30 + Math.random() * 50 }));
}

export function InfrastructureMonitor() {
  const [cpu, setCpu] = useState(() => roll(28));
  const [mem, setMem] = useState(() => roll(28));
  const [lat, setLat] = useState(() => roll(28));
  const [logs, setLogs] = useState(SEED_LOGS);
  const [active, setActive] = useState('overview');
  const logRef = useRef<HTMLDivElement>(null);

  useInterval(() => {
    setCpu((d) => [...d.slice(1), { label: '', value: 30 + Math.random() * 55 }]);
    setMem((d) => [...d.slice(1), { label: '', value: 45 + Math.random() * 35 }]);
    setLat((d) => [...d.slice(1), { label: '', value: 20 + Math.random() * 120 }]);
  }, 1500);

  useInterval(() => {
    const pool = ['GET /api/v1/users 200 8ms', 'POST /api/v1/webhooks 202 4ms', 'WARN redis eviction keys=128', 'INFO deploy queued commit=a1f9c2', 'ERROR 5xx upstream gateway', 'GET /healthz 200 1ms'];
    const lvl = ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)];
    const line = `${lvl}  ${pool[Math.floor(Math.random() * pool.length)]}`;
    setLogs((l) => [...l.slice(-40), line]);
  }, 2200);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const liveCards = [
    { label: 'CPU usage', value: cpu[cpu.length - 1]?.value ?? 0, unit: '%', data: cpu, color: '#38bdf8', icon: Cpu },
    { label: 'Memory', value: mem[mem.length - 1]?.value ?? 0, unit: '%', data: mem, color: '#34d399', icon: Database },
    { label: 'P95 latency', value: lat[lat.length - 1]?.value ?? 0, unit: 'ms', data: lat, color: '#fbbf24', icon: Zap },
  ];

  return (
    <AppShell
      brand={<><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-300"><Activity className="h-4 w-4" /></span><span className="text-sm font-semibold text-ink-50">Datadog</span></>}
      nav={nav}
      active={active}
      onNav={setActive}
      topbar={<TopBar dateLabel="Live · last 5 min" notif={5} initials="OP" color="sky" />}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-500/70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
        <span className="text-sm font-medium text-ink-100">All systems operational</span>
        <Badge tone="warning" className="ml-1">1 degraded</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {liveCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} delay={i * 70}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium text-ink-400"><Icon className="h-4 w-4 text-ink-500" />{c.label}</span>
                <span className="text-lg font-semibold text-ink-50 tabular-nums">{Math.round(c.value)}{c.unit}</span>
              </div>
              <div className="mt-2 h-16"><AreaChart data={c.data} height={64} color={c.color} format={(v) => `${Math.round(v)}${c.unit}`} /></div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={240}>
          <SectionTitle title="Service status" sub="6 services · 1 degraded · 1 down" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {services.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 rounded-xl bg-ink-850 p-3 animate-fade-up" style={{ animationDelay: `${240 + i * 60}ms` }}>
                <span className={cn('grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white', s.status === 'healthy' ? 'from-emerald-400 to-emerald-700' : s.status === 'degraded' ? 'from-amber-400 to-orange-600' : 'from-rose-400 to-rose-700')}>
                  {s.status === 'healthy' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1"><div className="truncate text-sm text-ink-100">{s.name}</div><div className="text-xs text-ink-500">{s.uptime}% uptime</div></div>
                <Badge tone={statusTone[s.status as 'healthy']}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={300}>
          <SectionTitle title="Region latency" />
          <div className="space-y-2">
            {regions.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${300 + i * 60}ms` }}>
                <span className="font-mono text-xs text-ink-400">{r.name}</span>
                <div className="flex-1"><div className="h-1.5 w-full rounded-full bg-white/5"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(r.latency / 200) * 100}%`, background: r.latency > 100 ? '#fb7185' : r.latency > 70 ? '#fbbf24' : '#34d399' }} /></div></div>
                <span className="w-12 text-right text-sm tabular-nums text-ink-100">{r.latency}ms</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card delay={380}>
          <SectionTitle title="Deployments" sub="Recent commits" />
          <div className="space-y-1">
            {deployments.map((d, i) => (
              <div key={d.hash} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.02] animate-fade-up" style={{ animationDelay: `${380 + i * 60}ms` }}>
                <Avatar initials={d.who} color={d.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink-100">{d.msg}</div>
                  <div className="flex items-center gap-2 text-xs text-ink-500"><GitBranch className="h-3 w-3" />{d.branch}<span className="font-mono">{d.hash}</span></div>
                </div>
                <Badge tone={d.status === 'live' ? 'success' : 'warning'}>{d.status}</Badge>
                <span className="text-xs text-ink-500">{d.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={440}>
          <SectionTitle title="Incidents" />
          <div className="space-y-2">
            {incidents.map((inc, i) => (
              <div key={inc.title} className="flex items-center gap-3 rounded-xl bg-ink-850 p-3 animate-fade-up" style={{ animationDelay: `${440 + i * 60}ms` }}>
                <Badge tone={inc.tone}>{inc.sev}</Badge>
                <div className="min-w-0 flex-1"><div className="truncate text-sm text-ink-100">{inc.title}</div><div className="text-xs text-ink-500">{inc.region} · {inc.time}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-0" delay={500}>
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5"><Terminal className="h-4 w-4 text-ink-500" /><span className="text-sm font-medium text-ink-200">Log stream</span><span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />live</span></div>
        <div ref={logRef} className="h-52 overflow-y-auto bg-ink-950/60 p-3 font-mono text-xs leading-relaxed">
          {logs.map((l, i) => (
            <div key={i} className={cn('animate-fade-in', l.startsWith('ERROR') ? 'text-rose-400' : l.startsWith('WARN') ? 'text-amber-400' : 'text-ink-300')}>
              <span className="text-ink-600">{String(i + 1).padStart(3, '0')} </span>{l}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
