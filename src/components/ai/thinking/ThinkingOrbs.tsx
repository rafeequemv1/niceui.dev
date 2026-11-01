import { useState, type CSSProperties } from 'react';
import { Pills, Showcase, Size, ThinkingLabel, TONES, type ThinkingState, type Tone } from './shared';

export type OrbVariant = 'breathing' | 'glass' | 'dithered' | 'blob';

export type ThinkingOrbProps = {
  size?: number;
  variant?: OrbVariant;
  tone?: Tone;
  state?: ThinkingState;
  className?: string;
};

const KEYFRAMES = `
@keyframes nui-orb-breathe { 0%,100% { transform: scale(.82); opacity: .75 } 50% { transform: scale(1); opacity: 1 } }
@keyframes nui-orb-spin { to { transform: rotate(360deg) } }
@keyframes nui-orb-blob {
  0%,100% { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; transform: rotate(0deg) }
  33% { border-radius: 63% 37% 41% 59% / 58% 36% 64% 42% }
  66% { border-radius: 38% 62% 53% 47% / 37% 61% 39% 63% }
  50% { transform: rotate(180deg) }
}
@media (prefers-reduced-motion: reduce) { .nui-orb * { animation: none !important } }
`;

export function ThinkingOrb({ size = 20, variant = 'breathing', tone = 'sky', state = 'thinking', className }: ThinkingOrbProps) {
  const c = TONES[tone];
  const on = state === 'thinking';
  const dur = (s: number) => (on ? `${s}s` : `${s * 3}s`);
  const play: CSSProperties['animationPlayState'] = state === 'idle' ? 'paused' : 'running';
  const box: CSSProperties = { position: 'relative', display: 'inline-block', width: size, height: size, flexShrink: 0 };
  const glow = state === 'done' ? `0 0 ${size * 0.35}px ${c.main}66` : on ? `0 0 ${size * 0.6}px ${c.main}88` : 'none';

  let inner;
  if (variant === 'breathing') {
    inner = (
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${c.soft}, ${c.main} 45%, ${c.deep} 100%)`,
          boxShadow: glow,
          animation: `nui-orb-breathe ${dur(1.8)} ease-in-out infinite`,
          animationPlayState: play,
          opacity: state === 'idle' ? 0.55 : 1,
        }}
      />
    );
  } else if (variant === 'glass') {
    inner = (
      <>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 50% 120%, ${c.main}cc, ${c.deep}55 60%, transparent 75%), rgba(255,255,255,.04)`, boxShadow: `inset 0 0 0 1px rgba(255,255,255,.18), ${glow}` }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', animation: `nui-orb-spin ${dur(2.4)} linear infinite`, animationPlayState: play }}>
          <span style={{ position: 'absolute', left: '18%', top: '10%', width: '38%', height: '26%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,.85), transparent)', filter: `blur(${Math.max(0.5, size / 40)}px)` }} />
        </span>
      </>
    );
  } else if (variant === 'dithered') {
    const dot = Math.max(2, size / 9);
    inner = (
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${c.soft}, ${c.deep}, ${c.main}, ${c.soft})`,
          WebkitMaskImage: `radial-gradient(circle, #000 ${dot * 0.32}px, transparent ${dot * 0.42}px)`,
          maskImage: `radial-gradient(circle, #000 ${dot * 0.32}px, transparent ${dot * 0.42}px)`,
          WebkitMaskSize: `${dot}px ${dot}px`,
          maskSize: `${dot}px ${dot}px`,
          animation: `nui-orb-spin ${dur(3)} linear infinite`,
          animationPlayState: play,
          filter: on ? `drop-shadow(0 0 ${size * 0.15}px ${c.main})` : undefined,
        }}
      />
    );
  } else {
    inner = (
      <span
        style={{
          position: 'absolute',
          inset: '4%',
          background: `linear-gradient(135deg, ${c.soft}, ${c.main} 45%, ${c.deep})`,
          boxShadow: glow,
          animation: `nui-orb-blob ${dur(4)} ease-in-out infinite`,
          animationPlayState: play,
        }}
      />
    );
  }

  return (
    <span role="img" aria-label={on ? 'Thinking' : state === 'done' ? 'Done' : 'Idle'} className={['nui-orb', className].filter(Boolean).join(' ')} style={box}>
      <style>{KEYFRAMES}</style>
      {inner}
    </span>
  );
}

const VARIANTS = ['breathing', 'glass', 'dithered', 'blob'] as const;
const STATES = ['idle', 'thinking', 'done'] as const;

export function ThinkingOrbsDemo() {
  const [variant, setVariant] = useState<OrbVariant>('glass');
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
          <Size px={14}><ThinkingOrb size={14} variant={variant} state={state} /></Size>
          <Size px={24}><ThinkingOrb size={24} variant={variant} state={state} tone="violet" /></Size>
          <Size px={40}><ThinkingOrb size={40} variant={variant} state={state} /></Size>
          <Size px={64}><ThinkingOrb size={64} variant={variant} state={state} tone="emerald" /></Size>
        </>
      }
      chat={
        <div className="flex items-center gap-2.5">
          <ThinkingOrb size={16} variant={variant} state={state} />
          {state === 'done' ? <span className="text-sm text-ink-300">Thought for 4s</span> : <ThinkingLabel>{state === 'idle' ? 'Ready when you are' : 'Thinking…'}</ThinkingLabel>}
        </div>
      }
    />
  );
}
