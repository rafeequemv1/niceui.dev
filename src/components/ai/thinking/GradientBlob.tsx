import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export type BlobMode = 'idle' | 'thinking' | 'done';

const css = `
@keyframes th-blob-morph {
  0%, 100% { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; transform: rotate(0deg) scale(1) }
  33% { border-radius: 63% 37% 41% 59% / 58% 42% 58% 42%; transform: rotate(120deg) scale(1.04) }
  66% { border-radius: 37% 63% 52% 48% / 46% 61% 39% 54%; transform: rotate(240deg) scale(.97) }
}
@keyframes th-blob-hue { to { filter: hue-rotate(40deg) } }
@media (prefers-reduced-motion: reduce) { .th-blob * { animation: none !important } }
`;

export type GradientBlobProps = {
  mode?: BlobMode;
  size?: number;
  className?: string;
};

const PALETTE: Record<BlobMode, [string, string, string]> = {
  idle: ['#334155', '#475569', '#1e293b'],
  thinking: ['#38bdf8', '#818cf8', '#22d3ee'],
  done: ['#34d399', '#2dd4bf', '#a3e635'],
};

/** A soft morphing blob that speeds up while the agent thinks and settles when it's done. Works from 16 to 160px. */
export function GradientBlob({ mode = 'thinking', size = 96, className }: GradientBlobProps) {
  const [a, b, c] = PALETTE[mode];
  const speed = mode === 'thinking' ? 3.2 : mode === 'done' ? 14 : 9;
  const blur = Math.max(1, size / 22);
  return (
    <span role="img" aria-label={mode === 'thinking' ? 'Thinking' : mode === 'done' ? 'Done' : 'Idle'} className={cn('th-blob relative inline-block shrink-0', className)} style={{ width: size, height: size }}>
      <style>{css}</style>
      <span
        aria-hidden
        className="absolute inset-[8%] transition-[background] duration-700"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${a}, transparent 60%), radial-gradient(circle at 70% 65%, ${b}, transparent 62%), radial-gradient(circle at 50% 50%, ${c}, ${c})`,
          filter: `blur(${blur * 0.4}px)`,
          animation: `th-blob-morph ${speed}s ease-in-out infinite${mode === 'thinking' ? ', th-blob-hue 2.4s ease-in-out infinite alternate' : ''}`,
          boxShadow: mode === 'idle' ? 'none' : `0 0 ${size / 3}px ${a}55`,
        }}
      />
      <span
        aria-hidden
        className="absolute inset-[22%] rounded-full opacity-60 mix-blend-screen"
        style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.55), transparent 55%)', filter: `blur(${blur}px)` }}
      />
    </span>
  );
}

export function GradientBlobDemo() {
  const [mode, setMode] = useState<BlobMode>('thinking');
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const order: BlobMode[] = ['thinking', 'done', 'idle'];
    const id = window.setInterval(() => setMode((m) => order[(order.indexOf(m) + 1) % order.length]), 3200);
    return () => clearInterval(id);
  }, [auto]);
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <GradientBlob mode={mode} size={150} />
      <div className="flex gap-1.5" role="group" aria-label="Mode">
        {(['idle', 'thinking', 'done'] as BlobMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setAuto(false);
              setMode(m);
            }}
            aria-pressed={mode === m}
            className={cn('focus-ring rounded-full px-3 py-1 text-xs capitalize transition-colors', mode === m ? 'bg-white/10 text-ink-50' : 'text-ink-400 hover:bg-white/5 hover:text-ink-200')}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-full bg-ink-900 py-1.5 pl-1.5 pr-3 shadow-card">
        <GradientBlob mode={mode} size={22} />
        <span className="text-sm text-ink-200">{mode === 'thinking' ? 'Thinking…' : mode === 'done' ? 'Answer ready' : 'Ask me anything'}</span>
      </div>
      <div className="flex items-end gap-3">
        {[16, 24, 40, 64].map((s) => (
          <GradientBlob key={s} mode={mode} size={s} />
        ))}
      </div>
    </div>
  );
}
