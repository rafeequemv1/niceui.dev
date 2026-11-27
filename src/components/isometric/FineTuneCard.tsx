import { Callout, IsoBox, IsoCard, IsoLine, IsoMetric, IsoStats, IsoText, Pulse, iso, usePart, useReducedMotion, type CalloutData, type StatRow } from './IsoKit';

type Part = 'die' | 'memory' | 'curve';

const PARTS: Record<Part, CalloutData> = {
  die: { title: 'Compute die', code: 'NPU-1', rows: [['Role', 'Fine-tune run'], ['Type', 'LoRA · rank 16'], ['Spec', 'Epoch 3 of 4']] },
  memory: { title: 'Memory', code: 'HBM-2', rows: [['Role', 'Weights + optimizer'], ['Type', 'HBM stack × 2'], ['Spec', '61 of 80 GB']] },
  curve: { title: 'Loss curve', code: 'EV-3', rows: [['Role', 'Eval every 200 steps'], ['Type', 'Cross-entropy'], ['Spec', '0.214 · best so far']] },
};

const O = [168, 104] as const;
const K = 1;
const LOSS = [1.0, 0.72, 0.55, 0.46, 0.39, 0.34, 0.31, 0.29, 0.27, 0.255, 0.24, 0.232, 0.225, 0.219, 0.214];

export type FineTuneCardProps = {
  title?: string;
  tag?: string;
  status?: string;
  action?: string;
  onAction?: () => void;
  accent?: string;
  loss?: number[];
  stats?: StatRow[];
  className?: string;
};

/** An isometric AI chip running a fine-tune, with the loss curve drawn on the floor. Hover the die, memory or curve. */
export function FineTuneCard({
  title = 'Fine-tune',
  tag = 'FT-0931',
  status = 'Support tone v4 · 02:48',
  action = 'Stop & save',
  onAction,
  accent = '#ff6b35',
  loss = LOSS,
  stats = [
    { label: 'Steps', value: '2,140 / 2,800', pct: 0.76, strong: true },
    { label: 'Tokens', value: '41M', pct: 0.62 },
    { label: 'GPU mem', value: '61 GB', pct: 0.76 },
    { label: 'ETA', value: '18 min', pct: 0.24 },
  ],
  className,
}: FineTuneCardProps) {
  const [active, bind] = usePart<Part>('die');
  const reduce = useReducedMotion();
  const at = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso(x, y, z);
    return [O[0] + a * K, O[1] + b * K];
  };
  // loss curve on the floor: x is the step, the curve rises toward -y
  const cx0 = 6;
  const cy0 = 236;
  const span = 150;
  const curve = loss.map((v, i) => iso(cx0 + (i / (loss.length - 1)) * span, cy0 - v * 70, 0));
  const last = loss.length - 1;
  const TARGET: Record<Part, [number, number]> = { die: at(65, 65, 26), memory: at(112, 40, 20), curve: at(cx0 + span, cy0 - loss[last] * 70, 0) };
  const pinsX = Array.from({ length: 9 }, (_, i) => 12 + i * 13);

  return (
    <IsoCard title={title} tag={tag} status={status} action={action} onAction={onAction} accent={accent} className={className} label="Isometric AI chip with a loss curve">
      <g transform={`translate(${O[0]} ${O[1]}) scale(${K})`}>
        {/* pins */}
        {pinsX.map((p) => (
          <g key={p}>
            <IsoBox x={p} y={130} w={5} d={10} h={3} faces={{ top: '#3a3a40' }} stroke="rgba(255,255,255,0.25)" />
            <IsoBox x={130} y={p} w={10} d={5} h={3} faces={{ top: '#3a3a40' }} stroke="rgba(255,255,255,0.25)" />
          </g>
        ))}
        {/* package */}
        <IsoBox x={0} y={0} w={130} d={130} h={12} />
        {[0, 1, 2, 3].map((k) => (
          <IsoLine key={k} from={[10, 10 + k * 36, 12]} to={[120, 10 + k * 36, 12]} stroke="rgba(255,255,255,0.06)" />
        ))}
        <IsoText at={[10, 124, 12]} size={8} fill="rgba(255,255,255,0.45)" fontFamily="ui-monospace, monospace" letterSpacing={1}>
          NPU-1 · 4 nm
        </IsoText>
        <g {...bind('memory', 'Memory stacks')}>
          {[20, 68].map((y) => (
            <IsoBox key={y} x={100} y={y} z={12} w={18} d={36} h={14} hot={active === 'memory'} accent={accent} />
          ))}
        </g>
        <g {...bind('die', 'Compute die')}>
          <IsoBox x={30} y={30} z={12} w={62} d={62} h={12} hot={active === 'die'} accent={accent} />
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) => (
              <IsoBox key={`${r}-${c}`} x={36 + c * 14} y={36 + r * 14} z={24} w={10} d={10} h={2} faces={{ top: active === 'die' && (r + c) % 3 === 0 ? '#ffd3c2' : '#2c2c32' }} stroke="rgba(255,255,255,0.18)" />
            ))
          )}
        </g>
        {/* loss chart on the floor */}
        <g {...bind('curve', 'Loss curve')}>
          {[0, 0.5, 1].map((g) => (
            <IsoLine key={g} from={[cx0, cy0 - g * 70, 0]} to={[cx0 + span, cy0 - g * 70, 0]} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 4" />
          ))}
          <IsoLine from={[cx0, cy0, 0]} to={[cx0 + span, cy0, 0]} stroke="rgba(255,255,255,0.35)" />
          <polyline points={curve.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} fill="none" stroke={active === 'curve' ? accent : '#f4f4f5'} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="0">
            {!reduce && <animate attributeName="stroke-dashoffset" values="1;0" dur="1.6s" fill="freeze" />}
          </polyline>
          <IsoText at={[cx0, cy0 + 12, 0]} size={8.5} fill="rgba(255,255,255,0.5)" fontStyle="italic">
            step 0
          </IsoText>
          <IsoText at={[cx0 + span, cy0 + 12, 0]} size={8.5} textAnchor="end" fill="rgba(255,255,255,0.5)" fontStyle="italic">
            2,140
          </IsoText>
        </g>
      </g>
      <g transform="translate(204 262)">
        <IsoMetric at={[0, 0, 0]} value={loss[last].toFixed(3)} caption="Eval loss" size={26} />
      </g>
      <g transform="translate(182 312)">
        <IsoStats at={[0, 0, 0]} rows={stats} length={110} gap={17} caption="Run FT-0931" />
      </g>
      <Pulse cx={TARGET[active][0]} cy={TARGET[active][1]} color={accent} />
      <Callout x={8} y={0} data={PARTS[active]} target={TARGET[active]} side="right" accent={accent} />
    </IsoCard>
  );
}

export function FineTuneCardDemo() {
  return (
    <div className="flex min-h-[560px] items-center justify-center bg-black p-3 sm:p-6">
      <FineTuneCard />
    </div>
  );
}
