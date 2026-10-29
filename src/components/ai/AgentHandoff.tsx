import { Fragment, useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronRight, CreditCard, RotateCcw, Route, Wrench } from 'lucide-react';
import { cn } from '@/lib/cn';

const TONE = {
  violet: { text: 'text-violet-300', bg: 'bg-violet-500/15', ring: 'ring-violet-400/40', dot: 'bg-violet-400' },
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-500/15', ring: 'ring-emerald-400/40', dot: 'bg-emerald-400' },
  sky: { text: 'text-brand-300', bg: 'bg-brand-500/15', ring: 'ring-brand-400/40', dot: 'bg-brand-400' },
  amber: { text: 'text-amber-300', bg: 'bg-amber-500/15', ring: 'ring-amber-400/40', dot: 'bg-amber-400' },
} as const;

export type HandoffAgent = { id: string; name: string; role: string; icon: typeof Route; tone: keyof typeof TONE };

export type HandoffEvent =
  | { type: 'user'; text: string }
  | { type: 'agent'; agent: string; text: string; tool?: { name: string; duration: string } }
  | { type: 'handoff'; from: string; to: string; reason: string; context: string[] };

export type AgentHandoffProps = {
  agents: HandoffAgent[];
  events: HandoffEvent[];
  /** Agent id currently composing a reply. */
  typing?: string | null;
  resolved?: boolean;
  onReplay?: () => void;
  className?: string;
};

function Avatar({ agent, size = 'md' }: { agent: HandoffAgent; size?: 'sm' | 'md' }) {
  const t = TONE[agent.tone];
  const Icon = agent.icon;
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-full ring-1', t.bg, t.ring, t.text, size === 'md' ? 'h-8 w-8' : 'h-5 w-5')}>
      <Icon className={size === 'md' ? 'h-4 w-4' : 'h-2.5 w-2.5'} />
    </span>
  );
}

/** A multi-agent thread where ownership passes between specialists, with the context each handoff carries. */
export function AgentHandoff({ agents, events, typing = null, resolved = false, onReplay, className }: AgentHandoffProps) {
  const byId = (id: string) => agents.find((a) => a.id === id) ?? agents[0];
  const owners = [agents[0].id, ...events.flatMap((e) => (e.type === 'handoff' ? [e.to] : []))];

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <header className="flex flex-wrap items-center gap-x-1.5 gap-y-2 border-b border-white/5 px-4 py-3">
        <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-ink-500">Owners</span>
        {owners.map((id, i) => {
          const a = byId(id);
          const current = i === owners.length - 1;
          return (
            <Fragment key={`${id}-${i}`}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-600" />}
              <span className={cn('flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 text-xs transition-all duration-500 animate-fade-in', current ? 'bg-white/[0.06] text-ink-100 ring-1 ring-white/10' : 'text-ink-500')}>
                <Avatar agent={a} size="sm" />
                {a.name}
              </span>
            </Fragment>
          );
        })}
        <span className="ml-auto flex items-center gap-2">
          <span className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', resolved ? 'bg-emerald-500/10 text-emerald-300' : 'bg-brand-500/10 text-brand-300')}>
            {resolved ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />}
            {resolved ? 'Resolved' : 'Live'}
          </span>
          {onReplay && resolved && (
            <button onClick={onReplay} aria-label="Replay conversation" className="focus-ring grid h-7 w-7 place-items-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </span>
      </header>

      <div className="space-y-4 px-4 py-4" aria-live="polite">
        {events.map((e, i) => {
          if (e.type === 'user')
            return (
              <div key={i} className="flex justify-end animate-fade-up">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-white/[0.07] px-3.5 py-2 text-sm leading-relaxed text-ink-100">{e.text}</p>
              </div>
            );
          if (e.type === 'agent') {
            const a = byId(e.agent);
            return (
              <div key={i} className="flex gap-3 animate-fade-up">
                <Avatar agent={a} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
                    <span className={cn('font-medium', TONE[a.tone].text)}>{a.name}</span>
                    <span className="text-ink-500">{a.role}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-200">{e.text}</p>
                  {e.tool && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-ink-400 ring-1 ring-white/5">
                      <Check className="h-3 w-3 text-emerald-400" />
                      {e.tool.name}
                      <span className="text-ink-600">·</span>
                      {e.tool.duration}
                    </span>
                  )}
                </div>
              </div>
            );
          }
          const from = byId(e.from);
          const to = byId(e.to);
          return (
            <div key={i} className="animate-fade-up py-1">
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <span className="flex items-center gap-1.5 rounded-full bg-ink-850 py-1 pl-1 pr-2.5 text-[11px] ring-1 ring-white/10">
                  <Avatar agent={from} size="sm" />
                  <ArrowRight className="h-3 w-3 text-ink-500" />
                  <Avatar agent={to} size="sm" />
                  <span className="text-ink-400">
                    Handed to <span className={cn('font-medium', TONE[to.tone].text)}>{to.name}</span>
                  </span>
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
              </div>
              <div className="mx-auto mt-2 max-w-md rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-2">
                <p className="text-[11px] text-ink-500">{e.reason}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {e.context.map((c) => (
                    <span key={c} className="rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10.5px] text-ink-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex items-center gap-3 animate-fade-in">
            <Avatar agent={byId(typing)} />
            <span className="flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-2">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-400" style={{ animationDelay: `${d * 160}ms` }} />
              ))}
            </span>
            <span className="text-xs text-ink-500">{byId(typing).name} is replying…</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— demo ——— */

const AGENTS: HandoffAgent[] = [
  { id: 'triage', name: 'Triage', role: 'Routes requests', icon: Route, tone: 'violet' },
  { id: 'billing', name: 'Billing', role: 'Refunds and invoices', icon: CreditCard, tone: 'emerald' },
  { id: 'tech', name: 'Technical', role: 'API and integrations', icon: Wrench, tone: 'sky' },
];

const SCRIPT: { at: number; typing?: string; event: HandoffEvent }[] = [
  { at: 0, event: { type: 'user', text: 'I was charged twice this month, and now the export API keeps returning 500 errors.' } },
  { at: 700, typing: 'triage', event: { type: 'agent', agent: 'triage', text: 'Two separate issues: a duplicate charge and an API failure. Sending you to Billing first, Technical is next.' } },
  { at: 1300, event: { type: 'handoff', from: 'triage', to: 'billing', reason: 'Context passed to Billing', context: ['Ana Ruiz · Pro plan', 'Duplicate charge · Oct 2', 'Invoice #4821', 'Open: export API 500'] } },
  { at: 2000, typing: 'billing', event: { type: 'agent', agent: 'billing', text: 'Found it. I refunded $49.00 for invoice #4821. It will land in 3 to 5 business days.', tool: { name: 'billing.refund', duration: '0.8s' } } },
  { at: 2900, event: { type: 'handoff', from: 'billing', to: 'tech', reason: 'Context passed to Technical', context: ['Refund issued', 'Export API 500 since 09:14', 'Workspace acme-prod'] } },
  { at: 3900, typing: 'tech', event: { type: 'agent', agent: 'tech', text: 'The export timed out on a 2 GB CSV. I re-ran it with streaming enabled and your file is ready to download.', tool: { name: 'exports.retry', duration: '2.4s' } } },
];

export function AgentHandoffDemo() {
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(SCRIPT.length);
      setTyping(null);
      return;
    }
    setShown(1);
    setTyping(null);
    const ids: number[] = [];
    SCRIPT.forEach((s, i) => {
      if (i === 0) return;
      const prev = SCRIPT[i - 1].at;
      if (s.typing) ids.push(window.setTimeout(() => setTyping(s.typing!), prev + 120));
      ids.push(
        window.setTimeout(() => {
          setTyping(null);
          setShown(i + 1);
        }, s.at),
      );
    });
    return () => ids.forEach(clearTimeout);
  }, [run]);

  return (
    <div className="mx-auto w-full max-w-xl">
      <AgentHandoff agents={AGENTS} events={SCRIPT.slice(0, shown).map((s) => s.event)} typing={typing} resolved={shown === SCRIPT.length} onReplay={() => setRun((r) => r + 1)} />
    </div>
  );
}
