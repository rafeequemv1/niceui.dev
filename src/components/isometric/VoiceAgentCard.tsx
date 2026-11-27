import { useEffect, useState } from 'react';
import { Callout, IsoBox, IsoCard, IsoCylinder, IsoMetric, IsoStats, Pulse, iso, usePart, useReducedMotion, type CalloutData, type StatRow } from './IsoKit';

type Part = 'mics' | 'speaker' | 'wave';

const PARTS: Record<Part, CalloutData> = {
  mics: { title: 'Mic array', code: 'MA-6', rows: [['Role', 'Inbound calls'], ['Type', '6 mics · beamforming'], ['Spec', 'Barge-in on']] },
  speaker: { title: 'Voice', code: 'VX-2', rows: [['Role', 'Front desk agent'], ['Type', 'Neural voice · EN, ES'], ['Spec', '480 ms to speak']] },
  wave: { title: 'Live call', code: 'CALL-58', rows: [['Role', 'Booking a table'], ['Type', 'Caller +44 ••• 812'], ['Spec', '2:41 · on track']] },
};

const O = [110, 150] as const;
const K = 1.05;
const BARS = 14;

export type VoiceAgentCardProps = {
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

/** An isometric voice AI agent: a smart speaker with a live waveform on the floor. Hover the mics, the speaker or the call. */
export function VoiceAgentCard({
  title = 'Voice agent',
  tag = 'CALL-58',
  status = 'Front desk line · 19:07',
  action = 'Listen live',
  onAction,
  accent = '#ff6b35',
  latency = 480,
  stats = [
    { label: 'Calls today', value: '214', pct: 0.71 },
    { label: 'Booked', value: '61', pct: 0.29, strong: true },
    { label: 'Escalated', value: '9', pct: 0.04 },
    { label: 'Avg call', value: '4:12', pct: 0.42 },
  ],
  className,
}: VoiceAgentCardProps) {
  const [active, bind] = usePart<Part>('wave');
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setT((v) => v + 1), 140);
    return () => clearInterval(id);
  }, [reduce]);
  const at = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso(x, y, z);
    return [O[0] + a * K, O[1] + b * K];
  };
  const height = (i: number) => 6 + Math.abs(Math.sin(i * 0.9 + t * 0.55) * Math.cos(i * 0.37 - t * 0.21)) * 34;
  const TARGET: Record<Part, [number, number]> = { mics: at(40, 40, 96), speaker: at(58, 58, 48), wave: at(150, 104, 30) };
  const [rx, ry] = [30 * Math.SQRT2 * 0.866, 30 * Math.SQRT2 * 0.5];
  const [tx, ty] = iso(40, 40, 96);

  return (
    <IsoCard title={title} tag={tag} status={status} action={action} onAction={onAction} accent={accent} className={className} label="Isometric voice AI agent">
      <g transform={`translate(${O[0]} ${O[1]}) scale(${K})`}>
        <g {...bind('speaker', 'Speaker')}>
          <IsoCylinder x={40} y={40} r={30} h={96} hot={active === 'speaker'} accent={accent} />
          {/* fabric lines */}
          {[0, 1, 2, 3, 4].map((k) => {
            const [cx, cy] = iso(40, 40, 18 + k * 14);
            return <path key={k} d={`M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`} fill="none" stroke="rgba(255,255,255,0.12)" />;
          })}
        </g>
        <g {...bind('mics', 'Mic array')}>
          <ellipse cx={tx} cy={ty} rx={rx * 0.82} ry={ry * 0.82} fill="none" stroke={accent} strokeWidth={3} style={{ filter: `drop-shadow(0 0 8px ${accent})` }}>
            {!reduce && <animate attributeName="stroke-opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />}
          </ellipse>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return <circle key={i} cx={tx + Math.cos(a) * rx * 0.5} cy={ty + Math.sin(a) * ry * 0.5} r={1.6} fill="rgba(255,255,255,0.6)" />;
          })}
        </g>
        {/* waveform bars on the floor */}
        <g {...bind('wave', 'Live call waveform')}>
          {Array.from({ length: BARS }, (_, i) => (
            <IsoBox key={i} x={92 + i * 8} y={96} w={5} d={10} h={height(i)} hot={active === 'wave' && i % 4 === 1} accent={accent} faces={{ top: '#3a3a40' }} stroke="rgba(255,255,255,0.3)" />
          ))}
        </g>
      </g>
      <g transform="translate(240 334)">
        <IsoMetric at={[0, 0, 0]} value={String(latency)} unit="ms" caption="Voice-to-voice latency" size={28} />
      </g>
      <g transform="translate(58 300)">
        <IsoStats at={[0, 0, 0]} rows={stats} length={104} gap={17} caption="Today, front desk line" />
      </g>
      <Pulse cx={TARGET[active][0]} cy={TARGET[active][1]} color={accent} />
      <Callout x={186} y={0} data={PARTS[active]} target={TARGET[active]} side="left" accent={accent} />
    </IsoCard>
  );
}

export function VoiceAgentCardDemo() {
  return (
    <div className="flex min-h-[560px] items-center justify-center bg-black p-3 sm:p-6">
      <VoiceAgentCard />
    </div>
  );
}
