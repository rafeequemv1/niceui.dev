import { useEffect, useRef, useState } from 'react';
import { Brain, Circle, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

const CONFIG: Record<OrbState, { base: number; amp: number; speed: number }> = {
  idle: { base: 0.02, amp: 0.03, speed: 0.4 },
  listening: { base: 0.06, amp: 0.16, speed: 1.2 },
  thinking: { base: 0.03, amp: 0.04, speed: 3.6 },
  speaking: { base: 0.1, amp: 0.26, speed: 1.8 },
};

const LAYERS = [
  { bg: 'radial-gradient(circle at 35% 35%, #8ed1ff 0%, #3396ff 35%, transparent 70%)', k: 1.0, dir: 1, dur: '9s' },
  { bg: 'radial-gradient(circle at 65% 60%, #2dd4bf 0%, #0ea5e9 40%, transparent 72%)', k: 1.4, dir: -1, dur: '12s' },
  { bg: 'radial-gradient(circle at 50% 75%, #1461e1 0%, #174eb6 45%, transparent 75%)', k: 0.8, dir: 1, dur: '15s' },
  { bg: 'radial-gradient(circle at 40% 30%, #f7f7f8 0%, #bce2ff 18%, transparent 45%)', k: 1.8, dir: -1, dur: '7s' },
];

export type VoiceOrbProps = { state?: OrbState; size?: number; className?: string };

export function VoiceOrb({ state = 'idle', size = 200, className }: VoiceOrbProps) {
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let raf = 0;
    let amp = 0;
    let speed = 0.4;
    let rot = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      const t = now / 1000;
      const cfg = CONFIG[stateRef.current];
      // layered sines approximate organic voice noise
      const noise = (Math.sin(t * 7.3) + Math.sin(t * 13.1 + 1.7) * 0.6 + Math.sin(t * 23.7 + 0.4) * 0.35) / 1.95;
      const target = cfg.base + cfg.amp * (0.5 + noise * 0.5);
      amp += (target - amp) * Math.min(1, dt * 9);
      speed += (cfg.speed - speed) * Math.min(1, dt * 3);
      rot += speed * dt * 60;
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const l = LAYERS[i];
        const wobble = Math.sin(t * (1.3 + i * 0.4)) * 4;
        el.style.transform = `translate(${wobble}%, ${-wobble * 0.6}%) rotate(${rot * l.dir * (1 + i * 0.25)}deg) scale(${1 + amp * l.k})`;
      });
      if (glowRef.current) {
        glowRef.current.style.transform = `scale(${1 + amp * 1.2})`;
        glowRef.current.style.opacity = String(0.35 + amp * 2);
      }
      if (ringRef.current) ringRef.current.style.transform = `scale(${1.04 + amp * 0.5})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <div ref={glowRef} className="absolute inset-0 rounded-full bg-brand-500/60 blur-3xl" />
      <div ref={ringRef} className="absolute inset-0 rounded-full border border-brand-300/20" />
      <div className="absolute inset-0 overflow-hidden rounded-full bg-ink-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        {LAYERS.map((l, i) => (
          <div key={i} ref={(el) => (layerRefs.current[i] = el)} className="absolute inset-[-15%] will-change-transform">
            <div className="h-full w-full animate-blob blur-2xl" style={{ background: l.bg, animationDuration: l.dur }} />
          </div>
        ))}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_40%)]" />
        <div className="absolute inset-0 rounded-full shadow-[inset_0_-20px_40px_rgba(10,10,12,0.6)]" />
      </div>
    </div>
  );
}

const STATES: Array<{ id: OrbState; label: string; icon: typeof Mic; caption: string }> = [
  { id: 'idle', label: 'Idle', icon: Circle, caption: 'Tap to talk' },
  { id: 'listening', label: 'Listening', icon: Mic, caption: 'Listening…' },
  { id: 'thinking', label: 'Thinking', icon: Brain, caption: 'Thinking…' },
  { id: 'speaking', label: 'Speaking', icon: Volume2, caption: '“Your flight to Lisbon departs at 9:40.”' },
];

export function VoiceOrbDemo() {
  const [state, setState] = useState<OrbState>('listening');
  const index = STATES.findIndex((s) => s.id === state);
  const current = STATES[index];

  return (
    <div className="flex flex-col items-center gap-8">
      <button
        onClick={() => setState(state === 'idle' ? 'listening' : 'idle')}
        className="focus-ring rounded-full transition-transform duration-300 ease-spring active:scale-95"
        aria-label="Toggle voice"
      >
        <VoiceOrb state={state} size={180} />
      </button>
      <p key={state} className={cn('h-5 animate-fade-up text-sm', state === 'thinking' ? 'shimmer-text font-medium' : 'text-ink-300')}>
        {current.caption}
      </p>
      <div className="relative grid grid-cols-4 rounded-xl bg-ink-900 p-1 shadow-card">
        <span
          className="absolute inset-y-1 left-1 w-[calc((100%-8px)/4)] rounded-lg bg-ink-800 shadow-hairline transition-transform duration-500 ease-spring"
          style={{ transform: `translateX(${index * 100}%)` }}
        />
        {STATES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setState(id)}
            className={cn(
              'focus-ring relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4',
              state === id ? 'text-ink-50' : 'text-ink-400 hover:text-ink-200',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
