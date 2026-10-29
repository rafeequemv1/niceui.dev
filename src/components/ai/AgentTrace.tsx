import { useEffect, useRef, useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, Coins, Database, Loader2, RotateCcw, Sparkles, Timer, Wrench, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInView } from '@/pages/landing/shared/motion';

export type SpanKind = 'agent' | 'llm' | 'tool' | 'retrieval';
export type TraceSpan = {
  id: string;
  parent?: string;
  kind: SpanKind;
  name: string;
  start: number;
  end: number;
  status?: 'ok' | 'error';
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  input: unknown;
  output: unknown;
};

const KIND: Record<SpanKind, { icon: typeof Bot; tint: string; bar: string }> = {
  agent: { icon: Bot, tint: 'text-brand-300 bg-brand-500/15', bar: 'bg-brand-400/70' },
  llm: { icon: Sparkles, tint: 'text-violet-300 bg-violet-500/15', bar: 'bg-violet-400/70' },
  tool: { icon: Wrench, tint: 'text-amber-300 bg-amber-500/15', bar: 'bg-amber-400/70' },
  retrieval: { icon: Database, tint: 'text-teal-300 bg-teal-500/15', bar: 'bg-teal-400/70' },
};

export const DEMO_TRACE: TraceSpan[] = [
  { id: 'root', kind: 'agent', name: 'support-agent', start: 0, end: 6400, input: { ticket: 4821, message: 'My order never arrived, can I get a refund?' }, output: { resolved: true, refund: '$64.00' } },
  { id: 'plan', parent: 'root', kind: 'llm', name: 'plan', model: 'nova-pro', start: 80, end: 1220, tokensIn: 1240, tokensOut: 182, input: { system: 'You are a support agent…', tools: 4 }, output: { calls: ['search_orders', 'get_shipping_status'] } },
  { id: 'orders', parent: 'root', kind: 'tool', name: 'search_orders', start: 1280, end: 2020, input: { customer_id: 'cus_93f2' }, output: { orders: [{ id: 4821, total: 64, status: 'shipped' }] } },
  { id: 'ship', parent: 'root', kind: 'tool', name: 'get_shipping_status', start: 1300, end: 2380, input: { order_id: 4821 }, output: { carrier: 'UPS', status: 'lost_in_transit', days: 12 } },
  { id: 'reason', parent: 'root', kind: 'llm', name: 'decide', model: 'nova-pro', start: 2440, end: 3600, tokensIn: 2310, tokensOut: 240, input: { context: '2 tool results' }, output: { action: 'issue_refund', amount: 64 } },
  { id: 'kb', parent: 'reason', kind: 'retrieval', name: 'kb.search “refund policy”', start: 2600, end: 3040, input: { query: 'refund policy lost parcel', k: 4 }, output: { hits: 4, top: 'Lost parcels are refunded in full after 10 days.' } },
  { id: 'refund1', parent: 'root', kind: 'tool', name: 'issue_refund', status: 'error', start: 3680, end: 4120, input: { order_id: 4821, amount: 64 }, output: { error: 'Gateway timeout after 400 ms' } },
  { id: 'refund2', parent: 'root', kind: 'tool', name: 'issue_refund · retry', start: 4160, end: 4900, input: { order_id: 4821, amount: 64, idempotency_key: 'rf_4821' }, output: { refund_id: 're_7Hx2', status: 'succeeded' } },
  { id: 'reply', parent: 'root', kind: 'llm', name: 'respond', model: 'nova-mini', start: 4980, end: 6320, tokensIn: 1780, tokensOut: 156, input: { tone: 'warm, concise' }, output: { message: 'Sorry about that! I’ve refunded $64.00…' } },
];

const PRICE = { 'nova-pro': [3, 15], 'nova-mini': [1, 5] } as Record<string, [number, number]>;
const cost = (s: TraceSpan) => (s.model && PRICE[s.model] ? ((s.tokensIn ?? 0) * PRICE[s.model][0] + (s.tokensOut ?? 0) * PRICE[s.model][1]) / 1e6 : 0);

function useReducedMotion() {
  const [reduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduce;
}

function Json({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2);
  return (
    <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-ink-950/60 p-2.5 font-mono text-[11px] leading-relaxed text-ink-300 ring-1 ring-white/5">
      {text.split(/("(?:[^"\\]|\\.)*"(?=:)?|\b\d+(?:\.\d+)?\b|true|false)/g).map((part, i) =>
        /^".*"$/.test(part) ? (
          <span key={i} className={text.includes(part + ':') ? 'text-brand-300' : 'text-emerald-300'}>
            {part}
          </span>
        ) : /^(\d|true|false)/.test(part) ? (
          <span key={i} className="text-amber-300">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </pre>
  );
}

export type AgentTraceProps = {
  spans?: TraceSpan[];
  /** Replay the run live instead of showing it finished. */
  live?: boolean;
  className?: string;
};

/** A run inspector: span tree, waterfall timing, and per-span input, output, tokens and cost. */
export function AgentTrace({ spans = DEMO_TRACE, live = true, className }: AgentTraceProps) {
  const reduce = useReducedMotion();
  const total = Math.max(...spans.map((s) => s.end));
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [t, setT] = useState(live && !reduce ? 0 : total);
  const [run, setRun] = useState(0);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState('plan');

  useEffect(() => {
    if (!live || reduce || !inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now() - start;
      setT(Math.min(total, now));
      if (now < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, reduce, inView, run, total]);

  const childrenOf = (id?: string) => spans.filter((s) => s.parent === id);
  const depth = (s: TraceSpan): number => (s.parent ? 1 + depth(spans.find((p) => p.id === s.parent)!) : 0);
  const visible: TraceSpan[] = [];
  const walk = (id?: string) => {
    for (const s of childrenOf(id)) {
      if (s.start > t) continue;
      visible.push(s);
      if (!closed.has(s.id)) walk(s.id);
    }
  };
  walk(undefined);

  const started = spans.filter((s) => s.start <= t);
  const tokens = started.reduce((a, s) => a + (s.end <= t ? (s.tokensIn ?? 0) + (s.tokensOut ?? 0) : 0), 0);
  const usd = started.reduce((a, s) => a + (s.end <= t ? cost(s) : 0), 0);
  const done = t >= total;
  const selected = spans.find((s) => s.id === sel) ?? spans[0];
  const selDone = selected.end <= t;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={ref} className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 text-left shadow-card', className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/5 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2">
            {!done && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-400" />}
            <span className={cn('relative h-2 w-2 rounded-full', done ? 'bg-emerald-400' : 'bg-brand-400')} />
          </span>
          <span className="text-sm font-medium text-ink-100">Trace</span>
          <span className="truncate font-mono text-[11px] text-ink-500">run_8f3a2c</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-ink-400">
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3 text-ink-500" />
            {(t / 1000).toFixed(2)}s
          </span>
          <span>{tokens.toLocaleString()} tok</span>
          <span className="flex items-center gap-1">
            <Coins className="h-3 w-3 text-ink-500" />${usd.toFixed(4)}
          </span>
        </div>
        <button
          onClick={() => {
            setT(0);
            setRun((r) => r + 1);
          }}
          disabled={!done}
          aria-label="Replay the run"
          className="focus-ring ml-auto flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ink-400 transition hover:bg-white/5 hover:text-ink-100 disabled:opacity-30"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Replay
        </button>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0 border-white/5 md:border-r">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,42%)] items-end border-b border-white/5 px-3 py-1.5 font-mono text-[10px] text-ink-600">
            <span>Span</span>
            <span className="relative h-3">
              {ticks.map((k) => (
                <span key={k} className={cn('absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full', (k === 0.25 || k === 0.75) && 'hidden sm:inline')} style={{ left: `${k * 100}%` }}>
                  {((total * k) / 1000).toFixed(1)}s
                </span>
              ))}
            </span>
          </div>
          <ul className="py-1">
            {visible.map((s) => {
              const K = KIND[s.kind];
              const running = s.end > t;
              const kids = childrenOf(s.id).length > 0;
              const w = ((Math.min(t, s.end) - s.start) / total) * 100;
              return (
                <li key={s.id} className="animate-fade-in">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSel(s.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(s.id))}
                    aria-pressed={sel === s.id}
                    className={cn('focus-ring grid cursor-pointer grid-cols-[minmax(0,1fr)_minmax(0,42%)] items-center gap-2 px-3 py-1.5 transition-colors', sel === s.id ? 'bg-brand-500/[0.08]' : 'hover:bg-white/[0.03]')}
                  >
                    <span className="flex min-w-0 items-center gap-1.5" style={{ paddingLeft: depth(s) * 14 }}>
                      {kids ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setClosed((c) => {
                              const n = new Set(c);
                              if (n.has(s.id)) n.delete(s.id);
                              else n.add(s.id);
                              return n;
                            });
                          }}
                          aria-label={closed.has(s.id) ? `Expand ${s.name}` : `Collapse ${s.name}`}
                          className="grid h-4 w-4 shrink-0 place-items-center rounded text-ink-500 hover:bg-white/5 hover:text-ink-200"
                        >
                          <ChevronRight className={cn('h-3 w-3 transition-transform duration-200', !closed.has(s.id) && 'rotate-90')} />
                        </button>
                      ) : (
                        <span className="w-4 shrink-0" />
                      )}
                      <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-md', K.tint)}>
                        <K.icon className="h-3 w-3" />
                      </span>
                      <span className={cn('min-w-0 truncate font-mono text-[11.5px]', running ? 'shimmer-text' : 'text-ink-200')}>{s.name}</span>
                      {running ? <Loader2 className="h-3 w-3 shrink-0 animate-spin text-brand-300" /> : s.status === 'error' ? <XCircle className="h-3 w-3 shrink-0 text-rose-400" /> : null}
                    </span>
                    <span className="relative h-4">
                      <span
                        className={cn('absolute top-1/2 h-2 -translate-y-1/2 rounded-full', s.status === 'error' && !running ? 'bg-rose-400/80' : K.bar, running && 'animate-pulse')}
                        style={{ left: `${(s.start / total) * 100}%`, width: `max(${w}%, 3px)` }}
                      />
                      {!running && (
                        <span className="absolute top-1/2 -translate-y-1/2 pl-1 font-mono text-[9.5px] text-ink-500" style={{ left: `min(${((s.end / total) * 100).toFixed(1)}%, calc(100% - 34px))` }}>
                          {((s.end - s.start) / 1000).toFixed(2)}s
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div key={selected.id} className="min-w-0 space-y-3 border-t border-white/5 p-4 animate-fade-in md:border-t-0">
          <div className="flex items-center gap-2">
            <span className={cn('grid h-6 w-6 place-items-center rounded-md', KIND[selected.kind].tint)}>
              {(() => {
                const I = KIND[selected.kind].icon;
                return <I className="h-3.5 w-3.5" />;
              })()}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink-50">{selected.name}</span>
            {!selDone ? (
              <span className="flex items-center gap-1 text-[11px] text-brand-300">
                <Loader2 className="h-3 w-3 animate-spin" /> running
              </span>
            ) : selected.status === 'error' ? (
              <span className="flex items-center gap-1 text-[11px] text-rose-300">
                <XCircle className="h-3 w-3" /> error
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> ok
              </span>
            )}
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {[
              ['Latency', selDone ? `${(selected.end - selected.start).toLocaleString()} ms` : '…'],
              ['Tokens', selected.tokensIn ? `${selected.tokensIn.toLocaleString()} / ${selected.tokensOut}` : '—'],
              ['Cost', cost(selected) ? `$${cost(selected).toFixed(4)}` : '—'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/5">
                <dt className="text-[10px] uppercase tracking-wider text-ink-600">{k}</dt>
                <dd className="mt-0.5 truncate font-mono text-[11.5px] tabular-nums text-ink-100">{v}</dd>
              </div>
            ))}
          </dl>
          {selected.model && (
            <p className="font-mono text-[10.5px] text-ink-500">
              model <span className="text-ink-300">{selected.model}</span>
            </p>
          )}
          <div>
            <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wider text-ink-500">Input</p>
            <Json value={selected.input} />
          </div>
          <div>
            <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wider text-ink-500">Output</p>
            {selDone ? <Json value={selected.output} /> : <div className="h-10 rounded-lg bg-white/[0.03] ring-1 ring-white/5 shimmer-text" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentTraceDemo() {
  return <AgentTrace />;
}
