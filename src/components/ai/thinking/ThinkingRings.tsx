import { useState, type CSSProperties } from 'react';
import { Check } from 'lucide-react';
import { Pills, Showcase, Size, ThinkingLabel, TONES, type ThinkingState, type Tone } from './shared';

export type RingVariant = 'arc' | 'orbit' | 'halo' | 'sweep';

export type ThinkingRingProps = {
  size?: number;
  variant?: RingVariant;
  tone?: Tone;
  state?: ThinkingState;
  className?: string;
};

const KEYFRAMES = `
@keyframes nui-ring-spin { to { transform: rotate(360deg) } }
@keyframes nui-ring-halo { 0% { transform: scale(.55); opacity: .9 } 100% { transform: scale(1.15); opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .nui-ring * { animation: none !important } }
`;

export function ThinkingRing({ size = 20, variant = 'arc', tone = 'sky', state = 'thinking', className }: ThinkingRingProps) {
  const c = TONES[tone];
  const stroke = Math.max(1.5, size / 10);
  const box: CSSProperties = { position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 };
  const label = state === 'thinking' ? 'Thinking' : state === 'done' ? 'Done' : 'Idle';

  if (state === 'done') {
    return (
      <span role="img" aria-label={label} className={className} style={{ ...box, borderRadius: '50%', background: `${c.main}22`, boxShadow: `inset 0 0 0 ${stroke}px ${c.main}` }}>
        <Check style={{ width: size * 0.55, height: size * 0.55, color: c.soft }} strokeWidth={3} />
      </span>
    );
  }
  const play = state === 'idle' ? 'paused' : 'running';
  const track = <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 0 ${stroke}px rgba(255,255,255,.08)` }} />;

  let inner;
  if (variant === 'arc') {
    const mask = `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 calc(100% - ${stroke}px + .5px))`;
    inner = (
      <>
        {track}
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from 0deg, transparent 0 25%, ${c.deep} 55%, ${c.soft})`, WebkitMaskImage: mask, maskImage: mask, animation: 'nui-ring-spin .9s linear infinite', animationPlayState: play }} />
      </>
    );
  } else if (variant === 'orbit') {
    const dot = Math.max(2.5, size / 6);
    inner = (
      <>
        {track}
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ position: 'absolute', inset: 0, animation: `nui-ring-spin ${1.2 + i * 0.35}s cubic-bezier(.5,.1,.5,.9) infinite`, animationDelay: `${-i * 0.18}s`, animationPlayState: play }}>
            <span style={{ position: 'absolute', left: '50%', top: 0, width: dot, height: dot, marginLeft: -dot / 2, borderRadius: '50%', background: i ? c.main : c.soft, opacity: 1 - i * 0.28, boxShadow: `0 0 ${dot * 1.5}px ${c.main}` }} />
          </span>
        ))}
      </>
    );
  } else if (variant === 'halo') {
    inner = (
      <>
        {[0, 1].map((i) => (
          <span key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 0 ${stroke}px ${c.main}`, animation: 'nui-ring-halo 1.6s ease-out infinite', animationDelay: `${-i * 0.8}s`, animationPlayState: play }} />
        ))}
        <span style={{ width: size * 0.36, height: size * 0.36, borderRadius: '50%', background: c.soft, boxShadow: `0 0 ${size * 0.4}px ${c.main}` }} />
      </>
    );
  } else {
    inner = (
      <>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `${c.main}14`, boxShadow: `inset 0 0 0 1px ${c.main}44` }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from 0deg, transparent 0 70%, ${c.main}cc 96%, ${c.soft})`, animation: 'nui-ring-spin 1.4s linear infinite', animationPlayState: play }} />
        <span style={{ width: Math.max(2, size / 8), height: Math.max(2, size / 8), borderRadius: '50%', background: c.soft, position: 'relative' }} />
      </>
    );
  }

  return (
    <span role="img" aria-label={label} className={['nui-ring', className].filter(Boolean).join(' ')} style={{ ...box, opacity: state === 'idle' ? 0.5 : 1 }}>
      <style>{KEYFRAMES}</style>
      {inner}
    </span>
  );
}

const VARIANTS = ['arc', 'orbit', 'halo', 'sweep'] as const;
const STATES = ['idle', 'thinking', 'done'] as const;

export function ThinkingRingsDemo() {
  const [variant, setVariant] = useState<RingVariant>('arc');
  const [state, setState] = useState<ThinkingState>('thinking');
  return (
    <Showcase
      controls={
        <>
          <Pills label="Variant" value={variant} options={VARIANTS} onChange={setVariant} />
          <Pills label="State" value={state} options={STATES} onChange={setState} />
        </>
      }
      sizes={
        <>
          <Size px={14}><ThinkingRing size={14} variant={variant} state={state} /></Size>
          <Size px={24}><ThinkingRing size={24} variant={variant} state={state} tone="violet" /></Size>
          <Size px={40}><ThinkingRing size={40} variant={variant} state={state} /></Size>
          <Size px={60}><ThinkingRing size={60} variant={variant} state={state} tone="amber" /></Size>
        </>
      }
      chat={
        <div className="flex items-center gap-2.5">
          <ThinkingRing size={16} variant={variant} state={state} />
          {state === 'done' ? <span className="text-sm text-ink-300">Searched 12 sources</span> : <ThinkingLabel>Searching the web…</ThinkingLabel>}
        </div>
      }
    />
  );
}
