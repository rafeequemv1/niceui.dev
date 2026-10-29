import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Bot, Check, Database, Globe, Loader2, PenLine, Play, RotateCcw, Send, Webhook } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInView } from '@/pages/landing/shared/motion';

/* The canvas is laid out in fixed units and scaled to fit; below MIN_SCALE it scrolls instead. */
const CW = 1010;
const CH = 360;
const NW = 168;
const NH = 70;
const MIN_SCALE = 0.62;

export type FlowNodeKind = 'trigger' | 'agent' | 'tool' | 'output';
export type FlowNode = { id: string; kind: FlowNodeKind; title: string; sub: string; x: number; y: number; icon: typeof Bot; result: string; start: number; end: number };
export type FlowEdge = { from: string; to: string; start: number; end: number };

const NODES: FlowNode[] = [
  { id: 'trigger', kind: 'trigger', title: 'New ticket', sub: 'Webhook', icon: Webhook, x: 16, y: 145, result: 'ticket #4821', start: 0, end: 500 },
  { id: 'router', kind: 'agent', title: 'Triage agent', sub: 'nova-pro · router', icon: Bot, x: 218, y: 145, result: 'intent: refund · 0.94', start: 1100, end: 2100 },
  { id: 'search', kind: 'tool', title: 'Web search', sub: 'Tool', icon: Globe, x: 420, y: 40, result: '3 policy pages', start: 2700, end: 3900 },
  { id: 'db', kind: 'tool', title: 'Orders DB', sub: 'Tool · Postgres', icon: Database, x: 420, y: 250, result: 'order found · $64', start: 2700, end: 3500 },
  { id: 'writer', kind: 'agent', title: 'Reply writer', sub: 'nova-mini · writer', icon: PenLine, x: 622, y: 145, result: '156 tokens', start: 4500, end: 5800 },
  { id: 'output', kind: 'output', title: 'Send reply', sub: 'Email', icon: Send, x: 824, y: 145, result: 'sent to customer', start: 6400, end: 6800 },
];
const EDGES: FlowEdge[] = [
  { from: 'trigger', to: 'router', start: 500, end: 1100 },
  { from: 'router', to: 'search', start: 2100, end: 2700 },
  { from: 'router', to: 'db', start: 2100, end: 2700 },
  { from: 'search', to: 'writer', start: 3900, end: 4500 },
  { from: 'db', to: 'writer', start: 3500, end: 4100 },
  { from: 'writer', to: 'output', start: 5800, end: 6400 },
];
const TOTAL = 6900;

const TINT: Record<FlowNodeKind, string> = {
  trigger: 'bg-amber-500/15 text-amber-300',
  agent: 'bg-brand-500/15 text-brand-300',
  tool: 'bg-violet-500/15 text-violet-300',
  output: 'bg-emerald-500/15 text-emerald-300',
};

function useReducedMotion() {
  const [reduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduce;
}

type Pt = { x: number; y: number };
const curve = (a: Pt, b: Pt) => {
  const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
  return [a, { x: a.x + dx, y: a.y }, { x: b.x - dx, y: b.y }, b] as const;
};
const bez = (p: readonly Pt[], k: number): Pt => {
  const u = 1 - k;
  return {
    x: u * u * u * p[0].x + 3 * u * u * k * p[1].x + 3 * u * k * k * p[2].x + k * k * k * p[3].x,
    y: u * u * u * p[0].y + 3 * u * u * k * p[1].y + 3 * u * k * k * p[2].y + k * k * k * p[3].y,
  };
};

export type AgentFlowProps = {
  /** Run once when the canvas scrolls into view. */
  autoRun?: boolean;
  className?: string;
};

/** A workflow canvas: drag nodes around, then run it and watch data travel along the edges. */
export function AgentFlow({ autoRun = true, className }: AgentFlowProps) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [pos, setPos] = useState<Record<string, Pt>>(() => Object.fromEntries(NODES.map((n) => [n.id, { x: n.x, y: n.y }])));
  const [t, setT] = useState(reduce ? TOTAL : -1);
  const [run, setRun] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.max(MIN_SCALE, Math.min(1, el.clientWidth / CW))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !inView || (!autoRun && run === 0)) return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now() - start;
      setT(Math.min(TOTAL, now));
      if (now < TOTAL) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, inView, run, autoRun]);

  const running = t >= 0 && t < TOTAL;
  const done = t >= TOTAL;
  const state = (n: FlowNode) => (t < 0 || t < n.start ? 'idle' : t < n.end ? 'running' : 'done');

  const local = (e: PointerEvent) => {
    const r = frame.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left + frame.current!.scrollLeft) / scale, y: (e.clientY - r.top) / scale };
  };
  const onDown = (id: string) => (e: PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = local(e);
    drag.current = { id, dx: p.x - pos[id].x, dy: p.y - pos[id].y };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const p = local(e);
    const { id, dx, dy } = drag.current;
    setPos((s) => ({ ...s, [id]: { x: Math.max(0, Math.min(CW - NW, p.x - dx)), y: Math.max(0, Math.min(CH - NH, p.y - dy)) } }));
  };
  const onKey = (id: string) => (e: KeyboardEvent) => {
    const d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
    if (!d) return;
    e.preventDefault();
    setPos((s) => ({ ...s, [id]: { x: Math.max(0, Math.min(CW - NW, s[id].x + d[0])), y: Math.max(0, Math.min(CH - NH, s[id].y + d[1])) } }));
  };

  const ports = (e: FlowEdge) => {
    const a = pos[e.from];
    const b = pos[e.to];
    return curve({ x: a.x + NW, y: a.y + NH / 2 }, { x: b.x, y: b.y + NH / 2 });
  };

  return (
    <div ref={ref} className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 text-left shadow-card', className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/5 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-100">support-triage</p>
          <p className="text-xs text-ink-500">{running ? 'Running…' : done ? 'Last run 6.9s · 6 steps · $0.0041' : 'Drag nodes to rearrange, then run'}</p>
        </div>
        <button
          onClick={() => setPos(Object.fromEntries(NODES.map((n) => [n.id, { x: n.x, y: n.y }])))}
          className="focus-ring flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-ink-400 transition hover:bg-white/5 hover:text-ink-100"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset layout
        </button>
        <button
          onClick={() => {
            setT(0);
            setRun((r) => r + 1);
          }}
          disabled={running}
          className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-brand-300 px-3 text-xs font-medium text-brand-950 shadow-glow transition hover:bg-brand-200 active:scale-95 disabled:opacity-60"
        >
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          {running ? 'Running' : done ? 'Run again' : 'Run'}
        </button>
      </div>

      <div ref={frame} className="relative overflow-x-auto overflow-y-hidden" style={{ height: CH * scale }} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: CW, height: CH, transform: `scale(${scale})` }}>
          <div className="dot-bg absolute inset-0" />
          <svg className="absolute inset-0 overflow-visible" width={CW} height={CH} aria-hidden="true">
            <defs>
              <linearGradient id="flow-edge" x1="0" x2="1">
                <stop offset="0" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {EDGES.map((e) => {
              const p = ports(e);
              const d = `M${p[0].x},${p[0].y} C${p[1].x},${p[1].y} ${p[2].x},${p[2].y} ${p[3].x},${p[3].y}`;
              const lit = t >= e.start;
              const k = (t - e.start) / (e.end - e.start);
              const dot = k > 0 && k < 1 ? bez(p, k) : null;
              return (
                <g key={e.from + e.to}>
                  <path d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2} strokeDasharray="4 5" />
                  <path d={d} fill="none" stroke="url(#flow-edge)" strokeWidth={2} className="transition-opacity duration-500" opacity={lit ? 1 : 0} />
                  {dot && (
                    <g>
                      <circle cx={dot.x} cy={dot.y} r={9} fill="#38bdf8" opacity={0.18} />
                      <circle cx={dot.x} cy={dot.y} r={4} fill="#e0f2fe" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          {NODES.map((n) => {
            const s = state(n);
            const p = pos[n.id];
            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`${n.title} node, ${s}. Drag or use arrow keys to move.`}
                onPointerDown={onDown(n.id)}
                onKeyDown={onKey(n.id)}
                className={cn(
                  'focus-ring absolute flex cursor-grab touch-none select-none flex-col justify-center rounded-xl bg-ink-850 px-3 ring-1 transition-shadow duration-300 active:cursor-grabbing',
                  s === 'running' ? 'shadow-glow ring-brand-400/70' : s === 'done' ? 'ring-emerald-400/30' : 'shadow-card ring-white/10',
                )}
                style={{ left: p.x, top: p.y, width: NW, height: NH }}
              >
                <span className="absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-ink-700 ring-2 ring-ink-900" />
                <span className="absolute -right-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-ink-700 ring-2 ring-ink-900" />
                <span className="flex items-center gap-2">
                  <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', TINT[n.kind])}>
                    <n.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-ink-50">{n.title}</span>
                    <span className="block truncate font-mono text-[10px] text-ink-500">{n.sub}</span>
                  </span>
                  <span className="grid h-4 w-4 shrink-0 place-items-center">
                    {s === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-300" />}
                    {s === 'done' && <Check className="h-3.5 w-3.5 animate-scale-in text-emerald-400" />}
                    {s === 'idle' && <span className="h-1.5 w-1.5 rounded-full bg-ink-600" />}
                  </span>
                </span>
                <span className={cn('mt-1.5 truncate pl-9 font-mono text-[10px] transition-colors', s === 'done' ? 'text-emerald-300/80' : s === 'running' ? 'shimmer-text' : 'text-ink-600')}>
                  {s === 'idle' ? 'waiting' : s === 'running' ? 'working…' : n.result}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AgentFlowDemo() {
  return <AgentFlow />;
}
