import { Activity, Bot, Cpu, Gauge, GitBranch, MessageSquare, Settings, Sparkles, Terminal, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { AreaChart, CountUp, DonutChart } from './shared/charts';
import { AppShell, Avatar, Badge, Card, ProgressBar, SectionTitle, TopBar, type NavItem } from './shared/shell';
import { useInterval } from './shared/hooks';

const nav: NavItem[] = [
  { id: 'console', label: 'Console', icon: Bot },
  { id: 'agents', label: 'Agents', icon: Sparkles, badge: 6 },
  { id: 'runs', label: 'Runs', icon: Activity },
  { id: 'traces', label: 'Traces', icon: GitBranch },
  { id: 'prompts', label: 'Evals', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const tokenData = Array.from({ length: 24 }, (_, i) => ({ label: `${i}h`, value: 12000 + Math.sin(i / 3) * 6000 + Math.random() * 4000 }));

const costBreakdown = [
  { label: 'GPT-4o', value: 1840, color: '#38bdf8' },
  { label: 'Claude 3.5', value: 1120, color: '#34d399' },
  { label: 'Embeddings', value: 420, color: '#fbbf24' },
  { label: 'Whisper', value: 180, color: '#fb7185' },
];

const runs = [
  { agent: 'support-triage', model: 'gpt-4o', status: 'completed', dur: '4.2s', tokens: 8420, who: 'ST', color: 'azure' as const },
  { agent: 'doc-summarizer', model: 'claude-3.5', status: 'running', dur: '2.1s', tokens: 3120, who: 'DS', color: 'emerald' as const },
  { agent: 'code-reviewer', model: 'gpt-4o', status: 'completed', dur: '6.8s', tokens: 14280, who: 'CR', color: 'amber' as const },
  { agent: 'email-classifier', model: 'gpt-4o-mini', status: 'failed', dur: '1.0s', tokens: 880, who: 'EC', color: 'rose' as const },
  { agent: 'schema-mapper', model: 'claude-3.5', status: 'completed', dur: '3.4s', tokens: 6240, who: 'SM', color: 'sky' as const },
];

const evals = [
  { label: 'Accuracy', score: 92, color: '#34d399' },
  { label: 'Helpfulness', score: 88, color: '#38bdf8' },
  { label: 'Safety', score: 96, color: '#fbbf24' },
  { label: 'Latency', score: 74, color: '#fb7185' },
  { label: 'Coherence', score: 90, color: '#bae6fd' },
];

const traceSteps = [
  { type: 'tool', text: 'search_kb("refund policy")', ms: 320 },
  { type: 'tool', text: 'fetch_order(order_id=8842)', ms: 180 },
  { type: 'llm', text: 'generate response · gpt-4o', ms: 1240 },
  { type: 'tool', text: 'validate_output(policy_match)', ms: 90 },
];

const statusTone = { completed: 'success', running: 'sky', failed: 'error' } as const;

export function AgentConsole() {
  const [active, setActive] = useState('console');
  const [steps, setSteps] = useState<typeof traceSteps>([]);
  const [done, setDone] = useState(false);
  const traceRef = useRef<HTMLDivElement>(null);

  useInterval(() => {
    setSteps((prev) => {
      if (prev.length >= traceSteps.length) {
        setDone(true);
        return prev;
      }
      return traceSteps.slice(0, prev.length + 1);
    });
  }, done ? null : 700);

  useEffect(() => {
    if (traceRef.current) traceRef.current.scrollTop = traceRef.current.scrollHeight;
  }, [steps]);

  // reset the trace loop every 6s for a fresh demo
  useInterval(() => { setSteps([]); setDone(false); }, 6000);

  const latency = [
    { label: 'P50 latency', value: 1.8, suffix: 's', decimals: 1, icon: Gauge },
    { label: 'P95 latency', value: 4.6, suffix: 's', decimals: 1, icon: Zap },
  ];

  return (
    <AppShell
      brand={<><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-300"><Bot className="h-4 w-4" /></span><span className="text-sm font-semibold text-ink-50">LangSmith</span></>}
      nav={nav}
      active={active}
      onNav={setActive}
      topbar={<TopBar dateLabel="Today" notif={6} initials="AI" color="azure" />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card delay={0}>
          <span className="text-xs font-medium text-ink-400">Token usage</span>
          <div className="mt-2 text-2xl font-semibold text-ink-50"><CountUp value={4820000} /></div>
          <span className="text-xs text-ink-500">tokens today</span>
        </Card>
        {latency.map((l, i) => {
          const Icon = l.icon;
          return (
            <Card key={l.label} delay={60 + i * 60}>
              <span className="flex items-center gap-2 text-xs font-medium text-ink-400"><Icon className="h-4 w-4 text-ink-500" />{l.label}</span>
              <div className="mt-2 text-2xl font-semibold text-ink-50"><CountUp value={l.value} suffix={l.suffix} decimals={l.decimals} /></div>
              <span className="text-xs text-emerald-400">▼ 0.3s</span>
            </Card>
          );
        })}
        <Card delay={180}>
          <span className="text-xs font-medium text-ink-400">Active agents</span>
          <div className="mt-2 text-2xl font-semibold text-ink-50"><CountUp value={6} /></div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />all healthy</span>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={260}>
          <SectionTitle title="Token usage" sub="Last 24 hours" action={<Badge tone="brand">gpt-4o</Badge>} />
          <AreaChart data={tokenData} height={220} color="#38bdf8" format={(v) => `${(v / 1000).toFixed(1)}k`} />
        </Card>

        <Card delay={320}>
          <SectionTitle title="Model cost" sub="Today" />
          <div className="flex items-center gap-4">
            <DonutChart data={costBreakdown} center={<><span className="text-lg font-semibold text-ink-50">$3.5k</span><span className="text-[10px] text-ink-500">total</span></>} />
            <div className="flex-1 space-y-2">
              {costBreakdown.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} /><span className="text-ink-300">{c.label}</span><span className="ml-auto text-ink-100">${(c.value).toLocaleString()}</span></div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" delay={400}>
          <SectionTitle title="Agent runs" action={<button className="text-xs text-brand-300 hover:text-brand-200">View all</button>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="text-xs text-ink-500"><th className="pb-2 font-medium">Agent</th><th className="pb-2 font-medium">Model</th><th className="pb-2 font-medium">Status</th><th className="pb-2 text-right font-medium">Duration</th><th className="pb-2 text-right font-medium">Tokens</th></tr></thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.agent} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="py-2.5"><div className="flex items-center gap-2.5"><Avatar initials={r.who} color={r.color} size="sm" /><span className="font-mono text-[13px] text-ink-100">{r.agent}</span></div></td>
                    <td className="py-2.5 text-ink-300">{r.model}</td>
                    <td className="py-2.5"><Badge tone={statusTone[r.status as 'completed']}>{r.status === 'running' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />}{r.status}</Badge></td>
                    <td className="py-2.5 text-right text-ink-300 tabular-nums">{r.dur}</td>
                    <td className="py-2.5 text-right text-ink-100 tabular-nums">{r.tokens.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card delay={460} className="p-0">
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5"><Terminal className="h-4 w-4 text-brand-300" /><span className="text-sm font-medium text-ink-200">Live run trace</span><span className="ml-auto flex items-center gap-1.5 text-xs text-sky-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />streaming</span></div>
          <div ref={traceRef} className="h-72 space-y-2 overflow-y-auto p-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 animate-fade-up">
                <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-semibold', s.type === 'tool' ? 'bg-brand-500/15 text-brand-300' : 'bg-emerald-500/15 text-emerald-300')}>{s.type === 'tool' ? <Cpu className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}</span>
                <div className="min-w-0 flex-1"><div className="font-mono text-xs text-ink-200">{s.text}</div><div className="text-[10px] text-ink-500">{s.ms}ms</div></div>
              </div>
            ))}
            {!done && <div className="flex items-center gap-2 pl-7 text-xs text-ink-500"><span className="h-3 w-1.5 animate-pulse bg-brand-400" /></div>}
          </div>
        </Card>
      </div>

      <Card className="mt-4" delay={520}>
        <SectionTitle title="Prompt evaluation scores" sub="Across 5 dimensions" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {evals.map((e, i) => (
            <div key={e.label} className="animate-fade-up" style={{ animationDelay: `${520 + i * 60}ms` }}>
              <div className="flex items-center justify-between text-sm"><span className="text-ink-300">{e.label}</span><span className="font-semibold text-ink-50">{e.score}</span></div>
              <ProgressBar value={e.score} color={e.color} className="mt-2" />
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
