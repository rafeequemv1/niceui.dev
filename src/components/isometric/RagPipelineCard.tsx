import { Callout, IsoBox, IsoCard, IsoChevrons, IsoCylinder, IsoMetric, IsoStats, IsoText, Pulse, iso, usePart, type CalloutData, type StatRow } from './IsoKit';

type Part = 'docs' | 'vector' | 'model';

const PARTS: Record<Part, CalloutData> = {
  docs: { title: 'Sources', code: 'SRC-3', rows: [['Role', 'Ingest'], ['Type', 'PDF, Notion, Slack'], ['Spec', '1,204 files · 2 h ago']] },
  vector: { title: 'Vector store', code: 'VS-01', rows: [['Role', 'Retrieval'], ['Type', 'pgvector · 1,536 d'], ['Spec', '12,480 chunks']] },
  model: { title: 'Answer model', code: 'LM-2', rows: [['Role', 'Grounded answers'], ['Type', 'Reasoning model'], ['Spec', 'Top 5 · cites sources']] },
};

const O = [92, 150] as const;
const K = 1.05;

export type RagPipelineCardProps = {
  title?: string;
  tag?: string;
  status?: string;
  action?: string;
  onAction?: () => void;
  accent?: string;
  latency?: number;
  stats?: StatRow[];
  className?: string;
};

/** An isometric RAG pipeline: documents flow into a vector store, then to the answer model. Hover a stage to inspect it. */
export function RagPipelineCard({
  title = 'Knowledge base',
  tag = 'RAG-12',
  status = 'Help center index · 16:05',
  action = 'Re-index',
  onAction,
  accent = '#ff6b35',
  latency = 142,
  stats = [
    { label: 'Indexed', value: '98%', pct: 0.98 },
    { label: 'Recall@5', value: '0.91', pct: 0.91, strong: true },
    { label: 'Hit rate', value: '87%', pct: 0.87 },
    { label: 'Stale docs', value: '24', pct: 0.12 },
  ],
  className,
}: RagPipelineCardProps) {
  const [active, bind] = usePart<Part>('vector');
  const at = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso(x, y, z);
    return [O[0] + a * K, O[1] + b * K];
  };
  const TARGET: Record<Part, [number, number]> = { docs: at(22, 30, 34), vector: at(105, 30, 76), model: at(190, 30, 34) };

  return (
    <IsoCard title={title} tag={tag} status={status} action={action} onAction={onAction} accent={accent} className={className} label="Isometric retrieval pipeline">
      <g transform={`translate(${O[0]} ${O[1]}) scale(${K})`}>
        {/* base plate */}
        <IsoBox x={-18} y={-6} w={240} d={74} h={6} faces={{ top: '#141416', left: '#101012', right: '#121214' }} stroke="rgba(255,255,255,0.18)" />
        {/* documents */}
        <g {...bind('docs', 'Source documents')}>
          {[0, 1, 2, 3].map((i) => (
            <IsoBox key={i} x={4 - i * 3} y={14 + i * 3} z={6 + i * 7} w={36} d={30} h={4} hot={active === 'docs' && i === 3} accent={accent} faces={{ top: '#2a2a2f' }} />
          ))}
          {[0, 1, 2].map((k) => (
            <line key={k} {...(() => { const [x1, y1] = iso(-2 + 6, 26 + k * 6, 34); const [x2, y2] = iso(-2 + 26, 26 + k * 6, 34); return { x1, y1, x2, y2 }; })()} stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} />
          ))}
        </g>
        <IsoChevrons at={[52, 30, 6]} count={3} step={10} />
        {/* vector store: stacked discs */}
        <g {...bind('vector', 'Vector store')}>
          {[0, 1, 2].map((i) => (
            <IsoCylinder key={i} x={105} y={30} z={6 + i * 22} r={24} h={18} hot={active === 'vector'} accent={accent} />
          ))}
          {[0, 1, 2].map((i) => {
            const [cx, cy] = iso(105, 30, 6 + i * 22 + 9);
            return <circle key={i} cx={cx + 22} cy={cy + 6} r={1.8} fill={active === 'vector' ? '#fff' : accent} />;
          })}
        </g>
        <IsoChevrons at={[140, 30, 6]} count={3} step={10} />
        {/* answer model chip */}
        <g {...bind('model', 'Answer model')}>
          <IsoBox x={172} y={12} z={6} w={38} d={38} h={16} hot={active === 'model'} accent={accent} />
          {[0, 1, 2, 3].map((k) => (
            <IsoBox key={k} x={176 + k * 9} y={50} z={6} w={4} d={6} h={4} faces={{ left: '#3a3a40' }} />
          ))}
          <IsoText at={[178, 36, 22]} size={10} fontWeight={700}>
            LLM
          </IsoText>
        </g>
      </g>
      <g transform="translate(222 326)">
        <IsoMetric at={[0, 0, 0]} value={String(latency)} unit="ms" caption="p50 retrieval" size={30} />
      </g>
      <g transform="translate(58 272)">
        <IsoStats at={[0, 0, 0]} rows={stats} length={110} gap={17} caption="Quality, last 24 h" />
      </g>
      <Pulse cx={TARGET[active][0]} cy={TARGET[active][1]} color={accent} />
      <Callout x={186} y={0} data={PARTS[active]} target={TARGET[active]} side="left" accent={accent} />
    </IsoCard>
  );
}

export function RagPipelineCardDemo() {
  return (
    <div className="flex min-h-[560px] items-center justify-center bg-black p-3 sm:p-6">
      <RagPipelineCard />
    </div>
  );
}
