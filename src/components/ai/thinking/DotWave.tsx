import { useState } from 'react';
import { Pills, Showcase, Size, ThinkingLabel, TONES, type ThinkingState, type Tone } from './shared';

export type WaveVariant = 'wave' | 'bounce' | 'fade' | 'bars';

export type DotWaveProps = {
  /** Height in px; width scales with the number of dots. */
  size?: number;
  variant?: WaveVariant;
  dots?: number;
  tone?: Tone;
  state?: ThinkingState;
  className?: string;
};

const KEYFRAMES = `
@keyframes nui-dw-wave { 0%,100% { transform: translateY(35%) } 50% { transform: translateY(-35%) } }
@keyframes nui-dw-bounce { 0%,60%,100% { transform: translateY(30%) scale(1) } 30% { transform: translateY(-45%) scale(1.15) } }
@keyframes nui-dw-fade { 0%,100% { opacity: .2; transform: scale(.75) } 50% { opacity: 1; transform: scale(1) } }
@keyframes nui-dw-bars { 0%,100% { transform: scaleY(.3) } 50% { transform: scaleY(1) } }
@media (prefers-reduced-motion: reduce) { .nui-dw * { animation: none !important } }
`;

export function DotWave({ size = 20, variant = 'wave', dots = 3, tone = 'sky', state = 'thinking', className }: DotWaveProps) {
  const c = TONES[tone];
  const bars = variant === 'bars';
  const d = bars ? Math.max(2, size / 5.5) : Math.max(3, size / 3.6);
  const gap = d * (bars ? 0.7 : 0.6);
  const anim = { wave: 'nui-dw-wave 1s ease-in-out infinite', bounce: 'nui-dw-bounce 1.2s ease-in-out infinite', fade: 'nui-dw-fade 1.1s ease-in-out infinite', bars: 'nui-dw-bars .9s ease-in-out infinite' }[variant];
  const running = state === 'thinking';
  return (
    <span
      role="img"
      aria-label={running ? 'Thinking' : state === 'done' ? 'Done' : 'Idle'}
      className={['nui-dw', className].filter(Boolean).join(' ')}
      style={{ display: 'inline-flex', alignItems: 'center', gap, height: size, flexShrink: 0 }}
    >
      <style>{KEYFRAMES}</style>
      {Array.from({ length: dots }, (_, i) => (
        <span
          key={i}
          style={{
            width: d,
            height: bars ? size : d,
            borderRadius: 999,
            background: state === 'done' ? c.soft : `linear-gradient(180deg, ${c.soft}, ${c.main})`,
            opacity: state === 'idle' ? 0.35 : 1,
            animation: running ? anim : 'none',
            animationDelay: `${(i * (variant === 'bars' ? 0.12 : 0.15)).toFixed(2)}s`,
            transform: !running && bars ? 'scaleY(.45)' : undefined,
            boxShadow: running ? `0 0 ${d}px ${c.main}66` : 'none',
          }}
        />
      ))}
    </span>
  );
}

const VARIANTS = ['wave', 'bounce', 'fade', 'bars'] as const;
const STATES = ['idle', 'thinking', 'done'] as const;

export function DotWaveDemo() {
  const [variant, setVariant] = useState<WaveVariant>('wave');
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
          <Size px={12}><DotWave size={12} variant={variant} state={state} /></Size>
          <Size px={20}><DotWave size={20} variant={variant} state={state} tone="violet" /></Size>
          <Size px={32}><DotWave size={32} variant={variant} state={state} dots={4} /></Size>
          <Size px={48}><DotWave size={48} variant={variant} state={state} dots={5} tone="emerald" /></Size>
        </>
      }
      chat={
        <div className="flex items-center gap-2.5">
          <span className="rounded-2xl rounded-tl-md bg-white/5 px-3 py-2">
            <DotWave size={10} variant={variant} state={state} />
          </span>
          {state !== 'done' && <ThinkingLabel>Writing a reply…</ThinkingLabel>}
        </div>
      }
    />
  );
}
