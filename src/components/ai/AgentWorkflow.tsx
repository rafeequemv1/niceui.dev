import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { Bot, RotateCcw, Search, Terminal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInView } from '@/pages/landing/shared/motion';

/* ─── AgentTerminal ────────────────────────────────────────────────── */

export type AgentTerminalProps = {
  command: string;
  lines: string[];
  /** Milliseconds between lines. */
  interval?: number;
  label?: string;
  className?: string;
};

/** A terminal that types out an agent's run log line by line once it scrolls into view. */
export function AgentTerminal({ command, lines, interval = 650, label = 'agent', className }: AgentTerminalProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || n >= lines.length) return;
    const t = setTimeout(() => setN((x) => x + 1), interval);
    return () => clearTimeout(t);
  }, [inView, n, lines.length, interval]);
  const done = n >= lines.length;
  return (
    <div ref={ref} className={cn('w-full overflow-hidden rounded-xl border border-white/10 bg-ink-900/80 shadow-pop', className)}>
      <div className="flex items-center gap-1.5 border-b border-white/[.07] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-300/10 px-2 py-0.5 text-[10px] text-brand-300">
          <Terminal className="h-3 w-3" /> {label}
        </span>
        {done && (
          <button onClick={() => setN(0)} aria-label="Replay" className="rounded-md p-1 text-ink-500 transition hover:bg-white/5 hover:text-ink-100">
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="min-h-[160px] space-y-1.5 p-4 text-left font-mono text-[12px] leading-relaxed">
        <p className="text-ink-200">
          <span className="text-brand-300">$</span> {command}
        </p>
        {lines.slice(0, n).map((l, i) => (
          <p key={i} className={cn('animate-fade-in', i === lines.length - 1 ? 'text-brand-300' : 'text-ink-400')}>
            {l}
          </p>
        ))}
        {!done && <span className="inline-block h-3.5 w-2 animate-blink bg-brand-300" />}
      </div>
    </div>
  );
}

/* ─── DiffSuggestion ───────────────────────────────────────────────── */

export type DiffSuggestionProps = {
  file: string;
  before: string[];
  after: string[];
  /** Context lines shown above and below the change. */
  head?: string;
  tail?: string;
  issue: string;
  onApply?: (applied: boolean) => void;
  className?: string;
};

/** An inline code-review suggestion that swaps removed lines for added lines when applied. */
export function DiffSuggestion({ file, before, after, head, tail, issue, onApply, className }: DiffSuggestionProps) {
  const [applied, setApplied] = useState(false);
  const toggle = () => {
    setApplied((a) => !a);
    onApply?.(!applied);
  };
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-white/10 bg-ink-900/80 text-left shadow-pop', className)}>
      <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-2.5 font-mono text-[11px] text-ink-500">
        {file}
        <span className="text-ink-400">
          <span className="text-emerald-300">+{after.length}</span> <span className="text-rose-300">−{before.length}</span>
        </span>
      </div>
      <div className="p-3 font-mono text-[11.5px] leading-6">
        {head && <p className="px-2 text-ink-400">{head}</p>}
        {(applied ? after : before).map((l, i) => (
          <p
            key={(applied ? 'a' : 'b') + i}
            className={cn('animate-fade-in px-2', applied ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300/90 line-through decoration-rose-300/40')}
          >
            {applied ? '+ ' : '- '}
            {l}
          </p>
        ))}
        {tail && <p className="px-2 text-ink-400">{tail}</p>}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/[.07] px-4 py-3">
        <span className="text-[12px] text-ink-400">{applied ? 'Suggestion applied' : issue}</span>
        <button
          onClick={toggle}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition',
            applied ? 'border border-white/15 text-ink-300 hover:border-white/30' : 'bg-brand-300 text-brand-950 shadow-glow hover:bg-brand-200',
          )}
        >
          {applied ? 'Undo' : 'Apply suggestion'}
        </button>
      </div>
    </div>
  );
}

/* ─── McpToolPicker ────────────────────────────────────────────────── */

export type McpTool = { name: string; installed?: boolean; hint?: string };

export type McpToolPickerProps = {
  tools: McpTool[];
  placeholder?: string;
  onChange?: (tools: McpTool[]) => void;
  className?: string;
};

/** A searchable list of MCP servers with one-click install toggles. */
export function McpToolPicker({ tools: initial, placeholder = 'Search MCP servers…', onChange, className }: McpToolPickerProps) {
  const [tools, setTools] = useState(initial);
  const [q, setQ] = useState('');
  const shown = tools.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (name: string) => {
    const next = tools.map((t) => (t.name === name ? { ...t, installed: !t.installed } : t));
    setTools(next);
    onChange?.(next);
  };
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-white/10 bg-ink-900/80 text-left shadow-pop', className)}>
      <div className="flex items-center gap-2 border-b border-white/[.07] px-3.5 py-3 text-ink-500">
        <Search className="h-3.5 w-3.5" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[13px] text-ink-100 outline-none placeholder:text-ink-500" />
        <span className="font-mono text-[10.5px] text-ink-500">{tools.filter((t) => t.installed).length} on</span>
      </div>
      <ul className="p-1.5">
        {shown.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-ink-500">No servers match “{q}”</li>}
        {shown.map((t) => (
          <li key={t.name} className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-ink-200 transition-colors hover:bg-white/[.03]">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-white/10 font-mono text-[10px] text-ink-400">{t.name[0]}</span>
              <span className="truncate">{t.name}</span>
              {t.hint && <span className="hidden truncate text-[11.5px] text-ink-500 sm:inline">{t.hint}</span>}
            </span>
            <button
              onClick={() => toggle(t.name)}
              className={cn(
                'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] transition',
                t.installed ? 'bg-brand-300/10 text-brand-300 ring-1 ring-brand-300/30' : 'text-ink-400 ring-1 ring-white/15 hover:text-ink-100',
              )}
            >
              {t.installed ? 'Installed' : 'Install'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── ParallelAgents ───────────────────────────────────────────────── */

export type AgentRun = { who: string; task: string; progress: number; tokens?: string };

/** Agents running side by side on a shared timeline, progress bars fill when in view. */
export function ParallelAgents({ agents, className }: { agents: AgentRun[]; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={cn('relative w-full space-y-3 text-left', className)}>
      <span aria-hidden className="absolute bottom-6 left-[22px] top-6 w-px bg-gradient-to-b from-brand-300/60 via-brand-300/20 to-transparent" />
      {agents.map((a, i) => (
        <div
          key={a.who}
          className={cn('relative ml-10 rounded-xl border border-white/10 bg-ink-900/80 p-3.5 shadow-pop transition-all duration-700 ease-smooth', inView ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0')}
          style={{ transitionDelay: `${i * 140}ms` }}
        >
          <span aria-hidden className="absolute -left-[26px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-brand-300 shadow-[0_0_10px_#7dd3fc]" />
          <div className="flex items-center justify-between gap-3 font-mono text-[11.5px]">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-ink-100">
              <Bot className="h-3.5 w-3.5 shrink-0 text-brand-300" /> {a.who}
            </span>
            {a.tokens && <span className="shrink-0 text-ink-500">{a.tokens} tokens</span>}
          </div>
          <p className="mt-1.5 text-[12px] text-ink-400">{a.task}…</p>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[.06]">
            <div className="h-full rounded-full bg-brand-300 transition-[width] duration-[1600ms] ease-smooth" style={{ width: inView ? `${a.progress}%` : '0%', transitionDelay: `${300 + i * 140}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── FeatureTabs ──────────────────────────────────────────────────── */

export type FeatureTab = { label: string; icon?: ComponentType<{ className?: string }>; title: string; body: string; content: ReactNode };

/** Auto-advancing feature tabs with a progress underline; click any tab to jump. */
export function FeatureTabs({ tabs, duration = 6000, className }: { tabs: FeatureTab[]; duration?: number; className?: string }) {
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setPct(p);
      if (p >= 100) setActive((a) => (a + 1) % tabs.length);
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, duration, tabs.length]);
  const tab = tabs[active];
  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-2 border-b border-white/[.07] md:grid-cols-4">
        {tabs.map((t, i) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={cn(
                'relative flex items-center justify-center gap-2 border-white/[.07] py-4 text-[13px] transition-colors [&:not(:last-child)]:border-r',
                i === active ? 'text-ink-50' : 'text-ink-500 hover:text-ink-300',
              )}
            >
              {Icon && <Icon className={cn('h-3.5 w-3.5', i === active && 'text-brand-300')} />}
              {t.label}
              <span className="absolute inset-x-0 bottom-0 h-px bg-white/[.04]">
                {i === active && <span className="block h-full bg-brand-300 shadow-[0_0_8px_#7dd3fc]" style={{ width: `${pct}%` }} />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid items-center gap-10 px-6 py-12 md:grid-cols-[1fr_1.4fr] md:px-10">
        <div key={tab.label} className="animate-fade-up text-left">
          <h3 className="text-2xl font-medium tracking-[-0.03em] text-ink-50">{tab.title}</h3>
          <p className="mt-3 max-w-sm text-[15px] text-ink-400">{tab.body}</p>
        </div>
        <div key={tab.label + '-content'} className="animate-fade-up">
          {tab.content}
        </div>
      </div>
    </div>
  );
}

/* ─── NetworkPulse ─────────────────────────────────────────────────── */

/** A hub-and-spoke constellation with pulses travelling from the core to each node. */
export function NetworkPulse({ nodes = 9, className }: { nodes?: number; className?: string }) {
  const points = Array.from({ length: nodes }, (_, i) => {
    const a = (i / nodes) * Math.PI * 2 + 0.3;
    const r = i % 2 ? 118 : 160;
    return { x: 200 + Math.cos(a) * r, y: 170 + Math.sin(a) * r * 0.78, d: i * 0.35 };
  });
  return (
    <svg viewBox="0 0 400 340" className={cn('w-full max-w-md', className)} aria-hidden>
      <defs>
        <radialGradient id="np-core">
          <stop offset="0" stopColor="#7dd3fc" stopOpacity=".55" />
          <stop offset="1" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="170" r="90" fill="url(#np-core)" />
      {points.map((n, i) => (
        <g key={i}>
          <line x1="200" y1="170" x2={n.x} y2={n.y} stroke="rgba(255,255,255,.12)" />
          <circle r="2" fill="#7dd3fc">
            <animateMotion dur={`${2.4 + (i % 3) * 0.6}s`} begin={`${n.d}s`} repeatCount="indefinite" path={`M200,170 L${n.x},${n.y}`} />
          </circle>
          <circle cx={n.x} cy={n.y} r="5.5" fill="#0b0c0e" stroke="rgba(125,211,252,.7)">
            <animate attributeName="r" values="5.5;7;5.5" dur="3s" begin={`${n.d}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      <circle cx="200" cy="170" r="11" fill="#0b0c0e" stroke="#7dd3fc" strokeWidth="1.5" />
      <circle cx="200" cy="170" r="3.5" fill="#7dd3fc" />
    </svg>
  );
}

/* ─── demos (used by the docs registry) ────────────────────────────── */

export const terminalDemoProps: AgentTerminalProps = {
  command: 'northstar run NS-482',
  lines: ['Reading ticket NS-482 …', 'Planning 3 components', 'Writing PricingCard.tsx', 'Running visual tests · 12/12', '✓ Opened PR #318 — ready for review'],
};
export const diffDemoProps: DiffSuggestionProps = {
  file: 'useCart.ts',
  head: 'export function useCart() {',
  tail: '}',
  before: ['const [items, setItems] = useState([])', 'useEffect(() => save(items))'],
  after: ['const [items, setItems] = useState<Item[]>(load)', 'useEffect(() => save(items), [items])'],
  issue: 'Missing dependency array',
};
export const toolDemo: McpTool[] = [
  { name: 'Figma', installed: true, hint: 'Design files' },
  { name: 'GitHub', installed: true, hint: 'Repos & PRs' },
  { name: 'Linear', hint: 'Issues' },
  { name: 'Storybook', installed: true, hint: 'Stories' },
  { name: 'Sentry', hint: 'Errors' },
];
export const agentsDemo: AgentRun[] = [
  { who: 'designer@team', task: 'Drafting variants', progress: 82, tokens: '18k' },
  { who: 'builder@team', task: 'Writing components', progress: 54, tokens: '31k' },
  { who: 'tester@team', task: 'Capturing screenshots', progress: 27, tokens: '6k' },
];

export const AgentTerminalDemo = () => (
  <div className="w-full max-w-md">
    <AgentTerminal {...terminalDemoProps} />
  </div>
);
export const DiffSuggestionDemo = () => (
  <div className="w-full max-w-md">
    <DiffSuggestion {...diffDemoProps} />
  </div>
);
export const McpToolPickerDemo = () => (
  <div className="w-full max-w-sm">
    <McpToolPicker tools={toolDemo} />
  </div>
);
export const ParallelAgentsDemo = () => (
  <div className="w-full max-w-md">
    <ParallelAgents agents={agentsDemo} />
  </div>
);
export const NetworkPulseDemo = () => <NetworkPulse />;
export const FeatureTabsDemo = () => (
  <div className="w-full overflow-hidden rounded-2xl border border-white/[.07] bg-ink-950">
    <FeatureTabs
      duration={5000}
      tabs={[
        { label: 'Generate', title: 'Components from a sentence', body: 'Describe the UI and get typed React with stories.', content: <AgentTerminal {...terminalDemoProps} /> },
        { label: 'Review', title: 'Reviews that read the diff', body: 'Line-level suggestions you can apply in one click.', content: <DiffSuggestion {...diffDemoProps} /> },
        { label: 'Integrate', title: 'Plug in every tool', body: 'Hundreds of MCP servers, one toggle away.', content: <McpToolPicker tools={toolDemo} /> },
        { label: 'Scale', title: 'Many agents, one queue', body: 'Parallel runs with live progress and token use.', content: <ParallelAgents agents={agentsDemo} /> },
      ]}
    />
  </div>
);
