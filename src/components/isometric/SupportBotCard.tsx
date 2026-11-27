import { Callout, IsoBox, IsoCard, IsoLine, IsoMetric, IsoPoly, IsoStats, IsoText, Pulse, iso, usePart, useReducedMotion, type CalloutData, type StatRow } from './IsoKit';

type Part = 'head' | 'antenna' | 'chats' | 'body';

const PARTS: Record<Part, CalloutData> = {
  head: { title: 'Intent model', code: 'IM-4', rows: [['Role', 'Understands asks'], ['Type', '42 intents'], ['Spec', '96% accuracy']] },
  antenna: { title: 'Channels', code: 'CH-3', rows: [['Role', 'Always on'], ['Type', 'Chat, email, WhatsApp'], ['Spec', '3 live · 0 down']] },
  chats: { title: 'Open chats', code: 'Q-12', rows: [['Role', 'Inbox'], ['Type', 'Order status, refunds'], ['Spec', '12 open · 2 waiting']] },
  body: { title: 'Knowledge', code: 'KB-214', rows: [['Role', 'Answers from docs'], ['Type', 'Help center'], ['Spec', '214 articles']] },
};

const O = [110, 188] as const;
const K = 1.05;

export type SupportBotCardProps = {
  title?: string;
  tag?: string;
  status?: string;
  action?: string;
  onAction?: () => void;
  accent?: string;
  firstReply?: string;
  stats?: StatRow[];
  className?: string;
};

/** An isometric support chatbot with its chat queue floating beside it. Hover the head, antenna, chats or body to inspect them. */
export function SupportBotCard({
  title = 'Support bot',
  tag = 'BOT-311',
  status = 'Storefront chat · 20:31',
  action = 'Take over chat',
  onAction,
  accent = '#ff6b35',
  firstReply = '1.2',
  stats = [
    { label: 'Resolved', value: '82%', pct: 0.82, strong: true },
    { label: 'Handoff', value: '11%', pct: 0.11 },
    { label: 'CSAT', value: '4.7 / 5', pct: 0.94 },
    { label: 'Deflected', value: '64%', pct: 0.64 },
  ],
  className,
}: SupportBotCardProps) {
  const [active, bind] = usePart<Part>('head');
  const reduce = useReducedMotion();
  const at = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso(x, y, z);
    return [O[0] + a * K, O[1] + b * K];
  };
  const TARGET: Record<Part, [number, number]> = { head: at(30, 60, 100), antenna: at(32, 28, 152), chats: at(118, 10, 108), body: at(36, 56, 30) };
  const bubble = (y: number, z: number, w: number, text: string, mine: boolean) => (
    <g>
      <IsoPoly points={[[118, y, z], [118, y - w, z], [118, y - w, z + 20], [118, y, z + 20]]} fill={mine ? `color-mix(in srgb, ${accent} 22%, #19191c)` : '#1d1d21'} stroke={mine ? accent : 'rgba(255,255,255,0.3)'} strokeWidth={1.2} />
      <IsoText at={[118, y - 6, z + 7]} plane="right" size={8} fill={mine ? '#fff' : 'rgba(255,255,255,0.8)'}>
        {text}
      </IsoText>
    </g>
  );

  return (
    <IsoCard title={title} tag={tag} status={status} action={action} onAction={onAction} accent={accent} className={className} label="Isometric support chatbot">
      <g transform={`translate(${O[0]} ${O[1]}) scale(${K})`}>
        {/* shadow */}
        <IsoPoly points={[[-6, -6, 0], [82, -6, 0], [82, 76, 0], [-6, 76, 0]]} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
        <g {...bind('body', 'Bot body')}>
          <IsoBox x={6} y={6} w={58} d={58} h={56} hot={active === 'body'} accent={accent} />
          <IsoText at={[14, 64, 34]} plane="left" size={10} fontWeight={700} letterSpacing={1} fill="rgba(255,255,255,0.75)">
            HELP
          </IsoText>
        </g>
        <IsoBox x={24} y={24} z={56} w={22} d={22} h={8} />
        <g {...bind('head', 'Bot head')}>
          <IsoBox x={0} y={0} z={64} w={70} d={70} h={54} hot={active === 'head'} accent={accent} />
          {/* visor + eyes on the front-left face */}
          <IsoPoly points={[[10, 70, 76], [60, 70, 76], [60, 70, 106], [10, 70, 106]]} fill="#0d0d10" stroke="rgba(255,255,255,0.3)" strokeWidth={1.2} />
          {[22, 46].map((x) => (
            <IsoPoly key={x} points={[[x, 70, 86], [x + 7, 70, 86], [x + 7, 70, 96], [x, 70, 96]]} fill={accent}>
              {!reduce && <animate attributeName="opacity" values="1;1;0.1;1" keyTimes="0;0.9;0.95;1" dur="3.2s" repeatCount="indefinite" />}
            </IsoPoly>
          ))}
          {/* speaker grille on the right face */}
          {[0, 1, 2].map((k) => (
            <IsoLine key={k} from={[70, 16, 80 + k * 8]} to={[70, 54, 80 + k * 8]} stroke="rgba(255,255,255,0.22)" strokeWidth={1.4} />
          ))}
        </g>
        <g {...bind('antenna', 'Antenna')}>
          <IsoLine from={[32, 28, 118]} to={[32, 28, 146]} stroke={active === 'antenna' ? accent : 'rgba(255,255,255,0.5)'} strokeWidth={2} />
          {(() => {
            const [cx, cy] = iso(32, 28, 150);
            return <circle cx={cx} cy={cy} r={5} fill={active === 'antenna' ? accent : '#2a2a30'} stroke={active === 'antenna' ? accent : 'rgba(255,255,255,0.5)'} strokeWidth={1.4} />;
          })()}
        </g>
        {/* floating chat thread on a wall to the right */}
        <g {...bind('chats', 'Open chats')}>
          {bubble(52, 124, 74, 'Where is my order?', false)}
          {bubble(30, 98, 76, 'Ships Thursday', true)}
          {bubble(58, 72, 44, 'Thanks!', false)}
        </g>
      </g>
      <g transform="translate(232 322)">
        <IsoMetric at={[0, 0, 0]} value={firstReply} unit="s" caption="First reply, median" size={30} />
      </g>
      <g transform="translate(58 298)">
        <IsoStats at={[0, 0, 0]} rows={stats} length={104} gap={17} caption="Today, 1,482 chats" />
      </g>
      <Pulse cx={TARGET[active][0]} cy={TARGET[active][1]} color={accent} />
      <Callout x={186} y={0} data={PARTS[active]} target={TARGET[active]} side="left" accent={accent} />
    </IsoCard>
  );
}

export function SupportBotCardDemo() {
  return (
    <div className="flex min-h-[560px] items-center justify-center bg-black p-3 sm:p-6">
      <SupportBotCard />
    </div>
  );
}
