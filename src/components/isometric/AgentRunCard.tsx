import { Callout, IsoBox, IsoCard, IsoLine, IsoMetric, IsoStats, IsoText, Pulse, iso, usePart, useReducedMotion, type CalloutData, type StatRow } from './IsoKit';

type Tool = 'core' | 'search' | 'browser' | 'code' | 'mail';

const PARTS: Record<Tool, CalloutData> = {
  core: { title: 'Planner', code: 'AG-07', rows: [['Role', 'Orchestrator'], ['Type', 'Reasoning model'], ['Spec', '128k ctx · 14 steps']] },
  search: { title: 'Web search', code: 'TL-01', rows: [['Role', 'Step 3, done'], ['Type', 'Search API'], ['Spec', '12 results · 0.8 s']] },
  browser: { title: 'Browser', code: 'TL-02', rows: [['Role', 'Step 9 of 14'], ['Type', 'Headless Chromium'], ['Spec', '3 tabs · 41 s']] },
  code: { title: 'Code runner', code: 'TL-03', rows: [['Role', 'Step 6, done'], ['Type', 'Python sandbox'], ['Spec', '2 runs · 0 errors']] },
  mail: { title: 'Email', code: 'TL-04', rows: [['Role', 'Needs approval'], ['Type', 'Draft reply'], ['Spec', '1 draft · to CFO']] },
};

const TOOLS: Array<{ id: Exclude<Tool, 'core'>; label: string; y: number }> = [
  { id: 'search', label: 'Search', y: -20 },
  { id: 'browser', label: 'Browser', y: 16 },
  { id: 'code', label: 'Code', y: 52 },
  { id: 'mail', label: 'Mail', y: 88 },
];

const O = [146, 176] as const; // scene origin in the SVG
const K = 1.16; // scene scale

export type AgentRunCardProps = {
  title?: string;
  tag?: string;
  status?: string;
  action?: string;
  onAction?: () => void;
  accent?: string;
  stats?: StatRow[];
  step?: number;
  steps?: number;
  className?: string;
};

/** An isometric AI agent run: a planner core with tool modules plugged in. Hover a module to inspect it. */
export function AgentRunCard({
  title = 'Agent run',
  tag = 'RUN-2048',
  status = 'Vendor research · 11:42',
  action = 'Approve step',
  onAction,
  accent = '#ff6b35',
  step = 9,
  steps = 14,
  stats = [
    { label: 'Tokens', value: '48.2k / 128k', pct: 0.38 },
    { label: 'Tool calls', value: '9 of 20', pct: 0.45, strong: true },
    { label: 'Sources', value: '27 read', pct: 0.68 },
    { label: 'Cost', value: '$0.42', pct: 0.21 },
  ],
  className,
}: AgentRunCardProps) {
  const [active, bind] = usePart<Tool>('browser');
  const reduce = useReducedMotion();
  const at = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso(x, y, z);
    return [O[0] + a * K, O[1] + b * K];
  };
  const target = active === 'core' ? at(45, 45, 90) : at(140, TOOLS.find((t) => t.id === active)!.y + 15, 20);

  return (
    <IsoCard title={title} tag={tag} status={status} action={action} onAction={onAction} accent={accent} className={className} viewBox="0 0 360 400" label="Isometric AI agent with tool modules">
      <g transform={`translate(${O[0]} ${O[1]}) scale(${K})`}>
        {/* floor wiring from the core to each tool */}
        {TOOLS.map((t) => (
          <IsoLine key={t.id} from={[90, t.y + 15, 0]} to={[125, t.y + 15, 0]} stroke={active === t.id ? accent : 'rgba(255,255,255,0.22)'} strokeWidth={1.6} strokeDasharray="4 4">
            {active === t.id && !reduce && <animate attributeName="stroke-dashoffset" values="16;0" dur="0.8s" repeatCount="indefinite" />}
          </IsoLine>
        ))}

        {/* the planner core */}
        <g {...bind('core', 'Planner core')}>
          <IsoBox x={0} y={0} w={90} d={90} h={90} hot={active === 'core'} accent={accent} />
          <IsoText at={[14, 64, 90]} size={30} fontWeight={800} letterSpacing={-1}>
            AI
          </IsoText>
          {/* visor on the left face */}
          <g>
            {[0, 1, 2].map((i) => (
              <IsoBox key={i} x={16 + i * 22} y={90} z={46} w={14} d={0.01} h={14} faces={{ left: i === 1 ? accent : '#2a2a30' }} stroke="rgba(255,255,255,0.25)" />
            ))}
          </g>
          {/* status leds on the right face */}
          {[0, 1, 2, 3].map((i) => (
            <IsoLine key={i} from={[90, 14, 70 - i * 13]} to={[90, 76, 70 - i * 13]} stroke={i === 0 ? accent : 'rgba(255,255,255,0.18)'} strokeWidth={2} strokeLinecap="round" />
          ))}
        </g>

        {/* tool modules */}
        {TOOLS.map((t) => (
          <g key={t.id} {...bind(t.id, t.label + ' tool')}>
            <IsoBox x={125} y={t.y} w={30} d={30} h={20} hot={active === t.id} accent={accent} />
            <IsoText at={[129, t.y + 18, 20]} size={7.5} fontWeight={600} fill={active === t.id ? '#fff' : 'rgba(255,255,255,0.7)'}>
              {t.label}
            </IsoText>
          </g>
        ))}

        <IsoMetric at={[196, 136, 0]} value={String(step)} unit={`/ ${steps} steps`} caption="Live · step running" size={30} />
        <IsoStats at={[46, 140, 0]} rows={stats} length={100} gap={18} caption="Tokens, tools, spend" />
      </g>
      <Pulse cx={target[0]} cy={target[1]} color={accent} />
      <Callout x={186} y={0} data={PARTS[active]} target={target} side="left" accent={accent} />
    </IsoCard>
  );
}

export function AgentRunCardDemo() {
  return (
    <div className="flex min-h-[560px] items-center justify-center bg-black p-3 sm:p-6">
      <AgentRunCard />
    </div>
  );
}
