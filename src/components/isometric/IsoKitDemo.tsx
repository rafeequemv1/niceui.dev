import { Callout, IsoBox, IsoCard, IsoChevrons, IsoMetric, IsoStats, IsoText, Pulse, iso, usePart } from './IsoKit';

/* Build your own isometric card from the kit: boxes, floor text, stats,
   chevrons and a callout. This one shows an LLM request queue. */

type Part = 'queue' | 'worker';
const O = [120, 178] as const;

export function InferenceQueueCard() {
  const [active, bind] = usePart<Part>('queue');
  const at = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso(x, y, z);
    return [O[0] + a, O[1] + b];
  };
  const target = active === 'queue' ? at(16, 54, 74) : at(150, 30, 46);
  return (
    <IsoCard title="Inference queue" tag="Q-EU-1" status="eu-west · 13:02" action="Add worker" label="Isometric LLM request queue">
      <g transform={`translate(${O[0]} ${O[1]})`}>
        <g {...bind('queue', 'Request queue')}>
          {[0, 1, 2, 3, 4].map((i) => (
            <IsoBox key={i} x={0} y={30} z={i * 14} w={32} d={48} h={12} hot={active === 'queue' && i === 4} />
          ))}
          <IsoText at={[4, 78, 30]} plane="left" size={9} fill="rgba(255,255,255,0.55)">
            QUEUE
          </IsoText>
        </g>
        <IsoChevrons at={[52, 54, 0]} count={4} step={14} />
        <g {...bind('worker', 'Model worker')}>
          <IsoBox x={120} y={10} w={60} d={60} h={44} hot={active === 'worker'} />
          <IsoText at={[128, 52, 44]} size={13} fontWeight={700}>
            LLM
          </IsoText>
        </g>
      </g>
      <g transform="translate(222 300)">
        <IsoMetric at={[0, 0, 0]} value="38" unit="req/s" caption="Throughput" size={28} />
      </g>
      <g transform="translate(60 286)">
        <IsoStats
          at={[0, 0, 0]}
          caption="Last 5 min"
          rows={[
            { label: 'Waiting', value: '62', pct: 0.31 },
            { label: 'p95 TTFT', value: '640 ms', pct: 0.64, strong: true },
            { label: 'Errors', value: '0.2%', pct: 0.02 },
          ]}
        />
      </g>
      <Pulse cx={target[0]} cy={target[1]} />
      <Callout
        x={186}
        y={0}
        target={target}
        data={active === 'queue' ? { title: 'Queue', code: 'Q-EU-1', rows: [['Role', 'Buffer requests'], ['Type', 'Priority FIFO'], ['Spec', '62 waiting']] } : { title: 'Worker', code: 'W-03', rows: [['Role', 'Serves the model'], ['Type', '8B, 4-bit'], ['Spec', 'Batch 16 · 2 replicas']] }}
      />
    </IsoCard>
  );
}

export function IsoKitDemo() {
  return (
    <div className="flex min-h-[560px] items-center justify-center bg-black p-3 sm:p-6">
      <InferenceQueueCard />
    </div>
  );
}
