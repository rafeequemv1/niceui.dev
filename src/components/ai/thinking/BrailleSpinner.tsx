import { useState } from 'react';
import { Pills, TONES, usePrefersReducedMotion, useTick, type ThinkingState, type Tone } from './shared';

export const SPINNERS = {
  braille: { frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], fps: 12 },
  dots: { frames: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'], fps: 10 },
  line: { frames: ['-', '\\', '|', '/'], fps: 8 },
  arc: { frames: ['◜', '◠', '◝', '◞', '◡', '◟'], fps: 9 },
  star: { frames: ['✶', '✸', '✹', '✺', '✹', '✷'], fps: 8 },
} as const;
export type SpinnerKind = keyof typeof SPINNERS;

export type BrailleSpinnerProps = {
  kind?: SpinnerKind;
  /** Font size in px. */
  size?: number;
  tone?: Tone;
  state?: ThinkingState;
  label?: string;
  /** Show elapsed seconds after the label. */
  elapsed?: boolean;
  className?: string;
};

/** Unicode spinners in the style of command-line coding agents. */
export function BrailleSpinner({ kind = 'braille', size = 14, tone = 'sky', state = 'thinking', label, elapsed = false, className }: BrailleSpinnerProps) {
  const reduce = usePrefersReducedMotion();
  const spec = SPINNERS[kind];
  const running = state === 'thinking' && !reduce;
  const n = useTick(state === 'thinking', spec.fps);
  const c = TONES[tone];
  const glyph = state === 'done' ? '✓' : state === 'idle' ? '·' : running ? spec.frames[n % spec.frames.length] : spec.frames[0];
  return (
    <span role="status" aria-label={label ?? (state === 'thinking' ? 'Working' : state)} className={className} style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.6em', fontFamily: 'var(--font-mono, "Geist Mono", ui-monospace, monospace)', fontSize: size, lineHeight: 1.2 }}>
      <span aria-hidden style={{ color: state === 'idle' ? '#5a5f67' : c.soft, width: '1ch', display: 'inline-block', textAlign: 'center', textShadow: state === 'thinking' ? `0 0 8px ${c.main}88` : 'none' }}>
        {glyph}
      </span>
      {label && (
        <span style={{ color: state === 'done' ? '#a3a8b0' : '#e5e7eb' }}>
          {label}
          {elapsed && state === 'thinking' && <span style={{ color: '#6b7079' }}> ({(n / spec.fps).toFixed(0)}s · esc to interrupt)</span>}
        </span>
      )}
    </span>
  );
}

const KINDS = Object.keys(SPINNERS) as SpinnerKind[];

export function BrailleSpinnerDemo() {
  const [kind, setKind] = useState<SpinnerKind>('braille');
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <div className="flex justify-center">
        <Pills label="Spinner" value={kind} options={KINDS} onChange={setKind} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 rounded-2xl bg-ink-900/80 px-6 py-7 shadow-card">
        {KINDS.map((k, i) => (
          <div key={k} className="flex flex-col items-center gap-2">
            <BrailleSpinner kind={k} size={k === kind ? 28 : 20} tone={(['sky', 'violet', 'emerald', 'amber', 'white'] as Tone[])[i]} />
            <span className="font-mono text-[10px] text-ink-500">{k}</span>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl bg-[#07080a] shadow-card ring-1 ring-white/5">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
          {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/10" />)}
          <span className="ml-2 font-mono text-[10px] text-ink-500">agent — zsh</span>
        </div>
        <div className="space-y-2 p-4 font-mono text-[12.5px]">
          <p className="text-ink-500">› add rate limiting to /api/upload</p>
          <div><BrailleSpinner kind={kind} size={12.5} state="done" label="Read src/api/upload.ts" /></div>
          <div><BrailleSpinner kind={kind} size={12.5} state="done" label="Searched for “limiter”" /></div>
          <div><BrailleSpinner kind={kind} size={12.5} label="Editing middleware…" elapsed /></div>
          <div><BrailleSpinner kind={kind} size={12.5} state="idle" label="Run tests" /></div>
        </div>
      </div>
    </div>
  );
}
