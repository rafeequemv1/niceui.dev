import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { BANDS, easer, rgb, useCanvasLoop, useVoice, type VoiceState } from './engine';
import { VoiceStage } from './VoiceStage';

const TARGET: Record<VoiceState, { spin: number; twist: number; bulge: number; pulse: number }> = {
  idle: { spin: 0.15, twist: 0, bulge: 0.2, pulse: 0 },
  listening: { spin: 0.25, twist: 0, bulge: 0.75, pulse: 0.6 },
  thinking: { spin: 0.9, twist: 1, bulge: 0.15, pulse: 0 },
  speaking: { spin: 0.35, twist: 0.1, bulge: 1, pulse: 1 },
};

const BUCKETS = 6;

export type GridOrbProps = {
  state?: VoiceState;
  mic?: boolean;
  /** Optional 0..1 loudness from your own audio pipeline. */
  level?: number;
  size?: number;
  /** Latitude rings and longitude meridians. */
  rings?: number;
  meridians?: number;
  color?: string;
  /** Show the floor reflection under the orb. */
  floor?: boolean;
  onMicError?: (message: string | null) => void;
  className?: string;
};

/** A shaded wireframe globe whose grid bulges, pulses and twists with the voice. */
export function GridOrb({ state = 'idle', mic, level, size = 300, rings = 11, meridians = 20, color = '#7dd3fc', floor = true, onMicError, className }: GridOrbProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const voice = useVoice(state, { mic, level });
  useEffect(() => onMicError?.(voice.micError), [voice.micError, onMicError]);
  const ease = useRef(easer());
  const clock = useRef({ last: 0, rot: 0, ph: 0 });
  const [cr, cg, cb] = rgb(color);
  const height = floor ? Math.round(size * 1.18) : size;

  // reusable depth-bucketed paths
  const paths = useRef<Path2D[]>([]);

  useCanvasLoop(ref, Math.max(size, height), (g, now, slow) => {
    const f = voice.sample(now);
    const c = clock.current;
    const dt = c.last ? Math.min(0.05, (now - c.last) / 1000) : 0.016;
    c.last = now;
    const tg = TARGET[f.state];
    const e = ease.current;
    const spin = e('spin', tg.spin, dt, 1.6);
    const twist = e('twist', tg.twist, dt, 2);
    const bulge = e('bulge', tg.bulge, dt, 3);
    const pulse = e('pulse', tg.pulse, dt, 3);
    c.rot += dt * spin * slow;
    c.ph += dt * (1.5 + f.level * 3) * slow;
    const L = f.level;
    const t = f.t;
    const W = Math.max(size, height);
    const cx = W / 2;
    const cy = size / 2 + (W - height) / 2;
    const R = size * 0.33 * (1 + L * 0.06 * pulse);
    const tilt = 0.42;
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);

    const project = (lat: number, lon: number) => {
      // twist: meridians wind around the axis while thinking
      const lo = lon + c.rot + twist * Math.sin(c.ph * 0.8) * lat * 1.4;
      const cl = Math.cos(lat);
      let x = cl * Math.cos(lo);
      let y = Math.sin(lat);
      let z = cl * Math.sin(lo);
      // voice: bands bulge the grid outward by latitude, strongest facing the viewer
      const bi = Math.min(BANDS - 1, Math.floor(((lat / Math.PI) + 0.5) * BANDS));
      const facing = Math.max(0, z);
      const k = 1 + bulge * (f.bands[bi] * 0.22 * (0.4 + facing * 0.9)) + Math.sin(lat * 5 - c.ph * 2) * 0.02 * pulse * L;
      x *= k;
      y *= k;
      z *= k;
      const y2 = y * ct - z * st;
      const z2 = y * st + z * ct;
      const p = 3.4 / (3.4 - z2);
      return [cx + x * R * p, cy + y2 * R * p, z2] as const;
    };

    g.clearRect(0, 0, W, W);

    // shaded core behind the grid
    const core = g.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.05, cx, cy, R * 1.15);
    core.addColorStop(0, `rgba(${cr},${cg},${cb},${0.22 + L * 0.25})`);
    core.addColorStop(0.55, `rgba(${cr * 0.25},${cg * 0.3},${cb * 0.45},0.35)`);
    core.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = core;
    g.beginPath();
    g.arc(cx, cy, R * 1.12, 0, Math.PI * 2);
    g.fill();

    // halo
    const halo = g.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.7);
    halo.addColorStop(0, `rgba(${cr},${cg},${cb},${0.1 + L * 0.3})`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = halo;
    g.fillRect(0, 0, W, W);

    // build depth buckets
    for (let b = 0; b < BUCKETS; b++) paths.current[b] = new Path2D();
    const seg = (a: readonly [number, number, number], b: readonly [number, number, number]) => {
      const d = ((a[2] + b[2]) / 2 + 1) / 2;
      const p = paths.current[Math.max(0, Math.min(BUCKETS - 1, Math.floor(d * BUCKETS)))];
      p.moveTo(a[0], a[1]);
      p.lineTo(b[0], b[1]);
    };
    const STEPS = 56;
    for (let i = 1; i < rings; i++) {
      const lat = -Math.PI / 2 + (i / rings) * Math.PI;
      let prev = project(lat, 0);
      for (let s = 1; s <= STEPS; s++) {
        const cur = project(lat, (s / STEPS) * Math.PI * 2);
        seg(prev, cur);
        prev = cur;
      }
    }
    for (let m = 0; m < meridians; m++) {
      const lon = (m / meridians) * Math.PI * 2;
      let prev = project(-Math.PI / 2, lon);
      for (let s = 1; s <= STEPS / 2; s++) {
        const cur = project(-Math.PI / 2 + (s / (STEPS / 2)) * Math.PI, lon);
        seg(prev, cur);
        prev = cur;
      }
    }

    g.lineCap = 'round';
    g.globalCompositeOperation = 'lighter';
    for (let b = 0; b < BUCKETS; b++) {
      const d = (b + 0.5) / BUCKETS;
      const a = 0.05 + Math.pow(d, 2.2) * (0.55 + L * 0.45);
      const w = (0.5 + d * 0.9) * Math.max(0.8, size / 300);
      const mix = Math.pow(d, 3) * (0.3 + L * 0.7);
      const r = cr + (255 - cr) * mix;
      const gg = cg + (255 - cg) * mix;
      const bl = cb + (255 - cb) * mix;
      g.strokeStyle = `rgba(${r | 0},${gg | 0},${bl | 0},${a})`;
      g.lineWidth = w;
      g.stroke(paths.current[b]);
    }

    // specular sheen
    const sheen = g.createRadialGradient(cx - R * 0.4, cy - R * 0.5, 0, cx - R * 0.4, cy - R * 0.5, R * 0.7);
    sheen.addColorStop(0, `rgba(255,255,255,${0.12 + L * 0.12})`);
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sheen;
    g.fillRect(0, 0, W, W);
    g.globalCompositeOperation = 'source-over';

    if (floor) {
      // a soft reflection pool and a perspective floor grid
      const fy = cy + R * 1.32;
      const pool = g.createRadialGradient(cx, fy, 0, cx, fy, R * 1.1);
      pool.addColorStop(0, `rgba(${cr},${cg},${cb},${0.16 + L * 0.3})`);
      pool.addColorStop(1, 'rgba(0,0,0,0)');
      g.save();
      g.translate(cx, fy);
      g.scale(1, 0.18);
      g.translate(-cx, -fy);
      g.fillStyle = pool;
      g.fillRect(cx - R * 1.2, fy - R * 1.2, R * 2.4, R * 2.4);
      g.restore();
      g.lineWidth = 0.6;
      for (let i = 1; i <= 4; i++) {
        const yy = fy + i * i * 1.6 * (size / 300);
        const half = R * (0.5 + i * 0.18);
        g.strokeStyle = `rgba(${cr},${cg},${cb},${0.11 - i * 0.02})`;
        g.beginPath();
        g.moveTo(cx - half, yy);
        g.lineTo(cx + half, yy);
        g.stroke();
      }
    }
  });

  const W = Math.max(size, height);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Voice assistant, ${voice.micLive ? 'listening to your microphone' : state}`}
      className={cn('block shrink-0', className)}
      style={{ width: W, height: W }}
    />
  );
}

export function GridOrbDemo() {
  return (
    <VoiceStage>
      {({ state, mic, setMicError, toggle }) => (
        <button onClick={toggle} aria-label="Toggle voice" className="focus-ring rounded-full transition-transform duration-300 ease-spring active:scale-95">
          <GridOrb state={state} mic={mic} onMicError={setMicError} size={280} />
        </button>
      )}
    </VoiceStage>
  );
}
