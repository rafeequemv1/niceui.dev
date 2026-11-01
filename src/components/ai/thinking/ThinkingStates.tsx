import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export type ThinkState = 'idle' | 'thinking' | 'tool' | 'done' | 'error';

const COLOR: Record<ThinkState, string> = {
  idle: '#5b6068',
  thinking: '#38bdf8',
  tool: '#a78bfa',
  done: '#34d399',
  error: '#fb7185',
};
const LABEL: Record<ThinkState, string> = { idle: 'Idle', thinking: 'Thinking', tool: 'Running a tool', done: 'Done', error: 'Failed' };

const css = `
@keyframes th-arc { to { transform: rotate(360deg) } }
@keyframes th-dash { 0% { stroke-dasharray: 1 60 } 50% { stroke-dasharray: 26 60 } 100% { stroke-dasharray: 1 60 } }
@keyframes th-orbit { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) { .th-states * { animation: none !important } }
`;

export type ThinkingStatesProps = { state: ThinkState; size?: number; className?: string };

/**
 * One indicator that morphs between states: a resting dot, a sweeping arc while thinking,
 * orbiting dots for tool calls, a drawn check when done and a cross on error.
 */
export function ThinkingStates({ state, size = 40, className }: ThinkingStatesProps) {
  const c = COLOR[state];
  const r = 9;
  const C = 2 * Math.PI * r;
  return (
    <span role="img" aria-label={LABEL[state]} className={cn('th-states relative inline-block shrink-0', className)} style={{ width: size, height: size }}>
      <style>{css}</style>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="overflow-visible">
        {/* track */}
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/[0.08]" />
        {/* progress ring: full when done/error, sweeping arc while thinking */}
        <g style={{ transformOrigin: '12px 12px', animation: state === 'thinking' ? 'th-arc 1.1s linear infinite' : 'none' }}>
          <circle
            cx="12"
            cy="12"
            r={r}
            fill="none"
            stroke={c}
            strokeWidth="1.8"
            strokeLinecap="round"
            transform="rotate(-90 12 12)"
            style={{
              strokeDasharray: state === 'thinking' ? undefined : `${state === 'done' || state === 'error' ? C : 0} ${C}`,
              animation: state === 'thinking' ? 'th-dash 1.4s ease-in-out infinite' : 'none',
              transition: 'stroke-dasharray .55s cubic-bezier(.16,1,.3,1), stroke .4s',
            }}
          />
        </g>
        {/* idle dot */}
        <circle cx="12" cy="12" r="2.6" fill={c} style={{ transformOrigin: '12px 12px', transform: state === 'idle' ? 'scale(1)' : 'scale(0)', transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)' }} />
        {/* tool: orbiting dots */}
        <g style={{ transformOrigin: '12px 12px', opacity: state === 'tool' ? 1 : 0, transition: 'opacity .3s', animation: 'th-orbit 1.2s linear infinite' }}>
          {[0, 120, 240].map((a) => (
            <circle key={a} cx={12 + 5.2 * Math.cos((a * Math.PI) / 180)} cy={12 + 5.2 * Math.sin((a * Math.PI) / 180)} r="1.6" fill={c} />
          ))}
        </g>
        {/* done: check draws in */}
        <path
          d="M8 12.4l2.7 2.6L16.2 9.4"
          fill="none"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: 12, strokeDashoffset: state === 'done' ? 0 : 12, transition: 'stroke-dashoffset .45s .15s cubic-bezier(.16,1,.3,1)' }}
        />
        {/* error: cross */}
        <g style={{ opacity: state === 'error' ? 1 : 0, transform: state === 'error' ? 'scale(1)' : 'scale(.4)', transformOrigin: '12px 12px', transition: 'all .35s cubic-bezier(.34,1.56,.64,1)' }}>
          <path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2" stroke={c} strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </span>
  );
}

const FLOW: ThinkState[] = ['idle', 'thinking', 'tool', 'thinking', 'done'];

export function ThinkingStatesDemo() {
  const [state, setState] = useState<ThinkState>('thinking');
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let k = 1;
    const id = window.setInterval(() => {
      k = (k + 1) % FLOW.length;
      setState(FLOW[k]);
    }, 1700);
    return () => clearInterval(id);
  }, [auto]);
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex items-center gap-4 rounded-2xl bg-ink-900 px-5 py-4 shadow-card">
        <ThinkingStates state={state} size={44} />
        <div>
          <p className="text-sm font-medium text-ink-50">Refactor checkout service</p>
          <p key={state} className="text-xs animate-fade-in" style={{ color: COLOR[state] }}>
            {LABEL[state]}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="State">
        {(['idle', 'thinking', 'tool', 'done', 'error'] as ThinkState[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setAuto(false);
              setState(s);
            }}
            aria-pressed={state === s}
            className={cn('focus-ring rounded-full px-2.5 py-1 text-xs capitalize transition-colors', state === s ? 'bg-white/10 text-ink-50' : 'text-ink-400 hover:bg-white/5 hover:text-ink-200')}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        {(['thinking', 'tool', 'done', 'error'] as ThinkState[]).map((s) => (
          <ThinkingStates key={s} state={s} size={20} />
        ))}
        <span className="text-xs text-ink-500">at 20px, inline</span>
      </div>
    </div>
  );
}
