import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/cn';
import { BANDS, easer, mixRgb, rgb, useCanvasLoop, useVoice, type VoiceState } from './engine';
import { VoiceStage } from './VoiceStage';

const TARGET: Record<VoiceState, { spin: number; ripple: number; bands: number; scan: number; breathe: number }> = {
  idle: { spin: 0.12, ripple: 0, bands: 0, scan: 0, breathe: 1 },
  listening: { spin: 0.22, ripple: 1, bands: 0.2, scan: 0, breathe: 0.3 },
  thinking: { spin: 1.1, ripple: 0, bands: 0, scan: 1, breathe: 0.2 },
  speaking: { spin: 0.35, ripple: 0.25, bands: 1, scan: 0, breathe: 0.2 },
};

export type DotGlobeProps = {
  state?: VoiceState;
  mic?: boolean;
  /** Optional 0..1 loudness from your own audio pipeline. */
  level?: number;
  size?: number;
  /** Number of dots on the sphere. */
  dots?: number;
  /** Front-facing dot colour. */
  color?: string;
  /** Back-facing dot colour. */
  shade?: string;
  onMicError?: (message: string | null) => void;
  className?: string;
};

/** A rotating 3D globe of dots that ripples, bands and scans with the voice. */
export function DotGlobe({ state = 'idle', mic, level, size = 300, dots = 1400, color = '#e0f2fe', shade = '#0369a1', onMicError, className }: DotGlobeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const voice = useVoice(state, { mic, level });
  useEffect(() => onMicError?.(voice.micError), [voice.micError, onMicError]);

  // Fibonacci sphere: evenly spread unit vectors, plus latitude and longitude per dot
  const pts = useMemo(() => {
    const out = new Float32Array(dots * 5);
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < dots; i++) {
      const y = 1 - (i / (dots - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = ga * i;
      out.set([Math.cos(a) * r, y, Math.sin(a) * r, Math.asin(y), ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)], i * 5);
    }
    return out;
  }, [dots]);

  const ease = useRef(easer());
  const clock = useRef({ last: 0, rot: 0, phase: 0 });
  const front = rgb(color);
  const back = rgb(shade);
  const hot: [number, number, number] = [255, 255, 255];

  useCanvasLoop(ref, size, (g, now, slow) => {
    const f = voice.sample(now);
    const c = clock.current;
    const dt = c.last ? Math.min(0.05, (now - c.last) / 1000) : 0.016;
    c.last = now;
    const tg = TARGET[f.state];
    const e = ease.current;
    const spin = e('spin', tg.spin, dt, 1.6);
    const ripple = e('ripple', tg.ripple, dt, 3);
    const bandsK = e('bands', tg.bands, dt, 3);
    const scan = e('scan', tg.scan, dt, 3);
    const breathe = e('breathe', tg.breathe, dt, 2);
    c.rot += dt * spin * slow;
    c.phase += dt * (2 + f.level * 4) * slow;
    const t = f.t;
    const L = f.level;

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.34 * (1 + L * 0.05 + Math.sin(t * 1.6) * 0.012 * breathe);
    const tilt = 0.38;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const cr = Math.cos(c.rot);
    const sr = Math.sin(c.rot);
    const scanY = Math.sin(t * 1.7) * 0.95;

    g.clearRect(0, 0, size, size);
    // soft core glow
    const glow = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.45);
    glow.addColorStop(0, `rgba(${back[0]},${back[1]},${back[2]},${0.14 + L * 0.22})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, size, size);

    g.globalCompositeOperation = 'lighter';
    const dotR = Math.max(0.7, size / 300);
    for (let i = 0; i < dots; i++) {
      const o = i * 5;
      let x = pts[o];
      let y = pts[o + 1];
      let z = pts[o + 2];
      const lat = pts[o + 3];
      const lon = pts[o + 4];

      // rotate around Y, then tilt around X
      const x1 = x * cr + z * sr;
      const z1 = -x * sr + z * cr;
      const y2 = y * ct - z1 * st;
      const z2 = y * st + z1 * ct;
      x = x1;
      y = y2;
      z = z2;

      // displacement
      let disp = 0;
      // listening: rings travel outward from the point facing the viewer
      if (ripple > 0.01) {
        const ang = Math.acos(Math.max(-1, Math.min(1, z)));
        disp += ripple * Math.max(0, Math.sin(ang * 7 - c.phase * 2.2)) * (0.04 + L * 0.22) * Math.exp(-ang * 0.6);
      }
      // speaking: latitude rings pushed out by the frequency bands
      if (bandsK > 0.01) {
        const bi = Math.min(BANDS - 1, Math.floor(((lat / Math.PI) + 0.5) * BANDS));
        disp += bandsK * f.bands[bi] * 0.3 * (0.6 + 0.4 * Math.sin(lon * 3 + c.phase));
      }
      // idle: slow breathing waves
      disp += breathe * 0.015 * Math.sin(lat * 4 + t * 1.2);

      // thinking: a bright scanning band
      let lit = 0;
      if (scan > 0.01) {
        const dy = Math.abs(y - scanY);
        lit = scan * Math.max(0, 1 - dy * 6);
        disp += lit * 0.05;
      }

      const k = 1 + disp;
      const px = x * k;
      const py = y * k;
      const pz = z * k;
      const persp = 3.2 / (3.2 - pz);
      const sx = cx + px * R * persp;
      const sy = cy + py * R * persp;
      const depth = (pz + 1) / 2; // 0 back, 1 front

      const heat = Math.min(1, disp * 5 + lit);
      const col = mixRgb(mixRgb(back, front, Math.pow(depth, 1.4)), hot, heat * 0.7);
      const a = (0.08 + Math.pow(depth, 2.2) * 0.92) * (0.75 + heat * 0.25);
      const rr = dotR * (0.5 + depth * 1.05 + heat * 0.9) * persp;
      g.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a})`;
      g.beginPath();
      g.arc(sx, sy, rr, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  });

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Voice assistant, ${voice.micLive ? 'listening to your microphone' : state}`}
      className={cn('block shrink-0', className)}
      style={{ width: size, height: size }}
    />
  );
}

export function DotGlobeDemo() {
  return (
    <VoiceStage>
      {({ state, mic, setMicError, toggle }) => (
        <button onClick={toggle} aria-label="Toggle voice" className="focus-ring rounded-full transition-transform duration-300 ease-spring active:scale-95">
          <DotGlobe state={state} mic={mic} onMicError={setMicError} size={300} />
        </button>
      )}
    </VoiceStage>
  );
}

/** A compact globe inside a voice pill, as it would sit in a composer. */
export function DotGlobePillDemo() {
  const states: VoiceState[] = ['listening', 'thinking', 'speaking'];
  const labels = ['Listening', 'Working on it', 'Speaking'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {states.map((s, i) => (
        <div key={s} className="flex items-center gap-3 rounded-full bg-ink-900 py-1.5 pl-1.5 pr-5 shadow-card">
          <span className="rounded-full bg-ink-950">
            <DotGlobe state={s} size={44} dots={260} />
          </span>
          <span className={cn('text-sm', s === 'thinking' ? 'shimmer-text font-medium' : 'text-ink-200')}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
