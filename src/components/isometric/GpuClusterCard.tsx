import { Callout, IsoBox, IsoCard, IsoCylinder, IsoLine, IsoMetric, IsoPoly, IsoStats, IsoText, Pulse, iso, usePart, useReducedMotion, type CalloutData, type StatRow } from './IsoKit';

type Part = 'gpu' | 'switch' | 'cooling' | 'storage';

const PARTS: Record<Part, CalloutData> = {
  gpu: { title: 'GPU 3', code: 'N4-G3', rows: [['Role', 'Node 4, slot 3'], ['Type', '80 GB accelerator'], ['Spec', '700 W · 81 °C']] },
  switch: { title: 'Top switch', code: 'SW-01', rows: [['Role', 'Rack 2 fabric'], ['Type', '400G InfiniBand'], ['Spec', '64 ports · 38% load']] },
  cooling: { title: 'Coolant loop', code: 'CL-2', rows: [['Role', 'Direct liquid'], ['Type', 'Closed loop'], ['Spec', '32 °C in · 41 °C out']] },
  storage: { title: 'Checkpoints', code: 'ST-9', rows: [['Role', 'Every 500 steps'], ['Type', 'NVMe array'], ['Spec', '1.8 TB · 12 saved']] },
};

const O = [118, 160] as const;
const K = 0.9;
const SLOTS = 7;

export type GpuClusterCardProps = {
  title?: string;
  tag?: string;
  status?: string;
  action?: string;
  onAction?: () => void;
  accent?: string;
  util?: number;
  stats?: StatRow[];
  className?: string;
};

/** An isometric GPU training cluster: two racks, a hot GPU blade, coolant and checkpoint storage. Hover a part to inspect it. */
export function GpuClusterCard({
  title = 'Training cluster',
  tag = 'GPU-NODE-4',
  status = 'us-east · epoch 42/60 · 09:18',
  action = 'Scale up',
  onAction,
  accent = '#ff6b35',
  util = 87,
  stats = [
    { label: 'GPU 0', value: '91%', pct: 0.91 },
    { label: 'GPU 1', value: '88%', pct: 0.88 },
    { label: 'GPU 2', value: '79%', pct: 0.79 },
    { label: 'GPU 3', value: '97% · hot', pct: 0.97, strong: true },
  ],
  className,
}: GpuClusterCardProps) {
  const [active, bind] = usePart<Part>('gpu');
  const reduce = useReducedMotion();
  const at = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso(x, y, z);
    return [O[0] + a * K, O[1] + b * K];
  };
  const slotZ = (i: number) => 18 + i * 19;
  const TARGET: Record<Part, [number, number]> = {
    gpu: at(60, 30, slotZ(3) + 8),
    switch: at(60, 100, slotZ(SLOTS - 1) + 8),
    cooling: at(118, 22, 58),
    storage: at(126, 110, 24),
  };

  const rack = (y: number, hotSlot: number | null, part: Part | null, label: string) => (
    <g>
      <IsoBox x={0} y={y} w={60} d={60} h={156} />
      {Array.from({ length: SLOTS }, (_, i) => {
        const z = slotZ(i);
        const isHot = hotSlot === i;
        const plate = (
          <g key={i}>
            <IsoPoly
              points={[[60, y + 5, z], [60, y + 55, z], [60, y + 55, z + 15], [60, y + 5, z + 15]]}
              fill={isHot ? `color-mix(in srgb, ${accent} 45%, #1c1c20)` : '#202024'}
              stroke={isHot ? accent : 'rgba(255,255,255,0.22)'}
              strokeWidth={1.2}
              style={isHot ? { filter: `drop-shadow(0 0 8px ${accent})` } : undefined}
            />
            {[0, 1, 2].map((k) => (
              <IsoLine key={k} from={[60, y + 9 + k * 4, z + 4]} to={[60, y + 9 + k * 4, z + 11]} stroke={isHot ? '#fff' : 'rgba(255,255,255,0.35)'} strokeWidth={1.2} />
            ))}
            <IsoLine from={[60, y + 46, z + 7.5]} to={[60, y + 50, z + 7.5]} stroke={isHot || (i + y) % 3 === 0 ? accent : 'rgba(255,255,255,0.3)'} strokeWidth={2.4} strokeLinecap="round">
              {!reduce && (isHot || (i + y) % 3 === 0) && <animate attributeName="opacity" values="1;0.25;1" dur={`${0.9 + i * 0.13}s`} repeatCount="indefinite" />}
            </IsoLine>
          </g>
        );
        return part && isHot ? <g key={i} {...bind(part, label)}>{plate}</g> : plate;
      })}
      <IsoText at={[8, y + 60, 150]} plane="left" size={9} fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace" letterSpacing={1}>
        {y === 0 ? 'RACK 1' : 'RACK 2'}
      </IsoText>
    </g>
  );

  return (
    <IsoCard title={title} tag={tag} status={status} action={action} onAction={onAction} accent={accent} className={className} label="Isometric GPU cluster with two racks">
      <g transform={`translate(${O[0]} ${O[1]}) scale(${K})`}>
        {/* coolant pipes on the floor */}
        <IsoLine from={[60, 22, 0]} to={[104, 22, 0]} stroke={accent} strokeOpacity={0.5} strokeWidth={3} strokeDasharray="6 5">
          {!reduce && <animate attributeName="stroke-dashoffset" values="22;0" dur="1.2s" repeatCount="indefinite" />}
        </IsoLine>
        {rack(0, 3, 'gpu', 'GPU 3 blade')}
        <g {...bind('cooling', 'Coolant loop')}>
          <IsoCylinder x={118} y={22} r={17} h={56} hot={active === 'cooling'} accent={accent} />
          <IsoText at={[108, 38, 24]} plane="left" size={8} fill="rgba(255,255,255,0.55)">
            CL-2
          </IsoText>
        </g>
        {rack(70, active === 'switch' ? SLOTS - 1 : null, 'switch', 'Top of rack switch')}
        {active !== 'switch' && <g {...bind('switch', 'Top of rack switch')}><IsoPoly points={[[60, 75, slotZ(SLOTS - 1)], [60, 125, slotZ(SLOTS - 1)], [60, 125, slotZ(SLOTS - 1) + 15], [60, 75, slotZ(SLOTS - 1) + 15]]} fill="transparent" /></g>}
        <g {...bind('storage', 'Checkpoint storage')}>
          <IsoBox x={108} y={96} w={36} d={30} h={24} hot={active === 'storage'} accent={accent} />
          {[0, 1, 2].map((k) => (
            <IsoLine key={k} from={[144, 101, 6 + k * 6]} to={[144, 121, 6 + k * 6]} stroke="rgba(255,255,255,0.3)" />
          ))}
        </g>
      </g>
      <g transform="translate(236 318)">
        <IsoMetric at={[0, 0, 0]} value={`${util}%`} caption="Cluster utilisation" size={30} />
      </g>
      <g transform="translate(58 296)">
        <IsoStats at={[0, 0, 0]} rows={stats} length={96} gap={17} caption="Per GPU, node 4" />
      </g>
      <Pulse cx={TARGET[active][0]} cy={TARGET[active][1]} color={accent} />
      <Callout x={186} y={0} data={PARTS[active]} target={TARGET[active]} side="left" accent={accent} />
    </IsoCard>
  );
}

export function GpuClusterCardDemo() {
  return (
    <div className="flex min-h-[560px] items-center justify-center bg-black p-3 sm:p-6">
      <GpuClusterCard />
    </div>
  );
}
