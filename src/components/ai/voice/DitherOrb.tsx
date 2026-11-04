import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { easer, mixRgb, rgb, useCanvasLoop, useVoice, type VoiceState } from './engine';
import { VoiceStage } from './VoiceStage';

// 8×8 Bayer matrix, normalised to 0..1
const BAYER = (() => {
  const m = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
  return Float32Array.from(m, (v) => (v + 0.5) / 64);
})();

const TARGET: Record<VoiceState, { spin: number; swirl: number; wobble: number; glow: number }> = {
  idle: { spin: 0.25, swirl: 0.25, wobble: 0.15, glow: 0.25 },
  listening: { spin: 0.5, swirl: 0.5, wobble: 0.75, glow: 0.55 },
  thinking: { spin: 2.6, swirl: 0.9, wobble: 0.25, glow: 0.4 },
  speaking: { spin: 0.8, swirl: 0.7, wobble: 1, glow: 0.8 },
};

export type DitherOrbProps = {
  /** What the assistant is doing. Ignored while `mic` is on. */
  state?: VoiceState;
  /** Drive the orb from the user's microphone. */
  mic?: boolean;
  /** Optional 0..1 loudness from your own audio pipeline (e.g. TTS output). */
  level?: number;
  size?: number;
  /** Size of one dither cell in CSS pixels. */
  pixel?: number;
  /** Highlight colour; the four darker tones are mixed from it. */
  color?: string;
  onMicError?: (message: string | null) => void;
  className?: string;
};

/** A 1-bit-style voice orb: a lit, liquid sphere quantised to five tones with ordered dithering. */
export function DitherOrb({ state = 'idle', mic, level, size = 280, pixel = 3, color = '#7dd3fc', onMicError, className }: DitherOrbProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const voice = useVoice(state, { mic, level });
  useEffect(() => onMicError?.(voice.micError), [voice.micError, onMicError]);

  const res = Math.max(24, Math.round(size / pixel));
  const buf = useRef<{ img: ImageData; off: HTMLCanvasElement } | null>(null);
  const ease = useRef(easer());
  const clock = useRef({ last: 0, spin: 0, flow: 0 });

  // five tones, dark → light; index 0 is transparent
  const hi = rgb(color);
  const tones = [
    [0, 0, 0],
    mixRgb(hi, [2, 6, 23], 0.82),
    mixRgb(hi, [2, 6, 23], 0.55),
    hi,
    mixRgb(hi, [255, 255, 255], 0.75),
  ];

  useCanvasLoop(ref, size, (g, now, slow) => {
    if (!buf.current || buf.current.img.width !== res) {
      const off = document.createElement('canvas');
      off.width = off.height = res;
      buf.current = { img: new ImageData(res, res), off };
    }
    const { img, off } = buf.current;
    const d = img.data;
    const f = voice.sample(now);
    const c = clock.current;
    const dt = c.last ? Math.min(0.05, (now - c.last) / 1000) : 0.016;
    c.last = now;
    const tg = TARGET[f.state];
    const e = ease.current;
    const spin = e('spin', tg.spin, dt, 2);
    const swirl = e('swirl', tg.swirl, dt, 2);
    const wobble = e('wobble', tg.wobble, dt, 3);
    const glow = e('glow', tg.glow, dt, 3);
    c.spin += dt * spin * slow;
    c.flow += dt * (0.6 + f.level * 2.2) * slow;
    const L = f.level;
    const t = c.flow;

    // light circles the orb; while thinking it sweeps fast
    const la = c.spin * 1.4;
    const lx = Math.cos(la) * 0.62;
    const ly = -0.5 + Math.sin(la * 0.7) * 0.2;
    const lz = 0.62;
    const ln = Math.hypot(lx, ly, lz);

    const R0 = 0.6 * (1 + L * 0.09);
    const amp = L * wobble * 0.12;
    const b = f.bands;

    for (let y = 0; y < res; y++) {
      const ny = (y + 0.5) / res * 2 - 1;
      for (let x = 0; x < res; x++) {
        const nx = (x + 0.5) / res * 2 - 1;
        const r = Math.hypot(nx, ny);
        const th = Math.atan2(ny, nx);
        // the rim ripples with the voice bands
        const bi = Math.floor(((th + Math.PI) / (Math.PI * 2)) * 8) % 8;
        const R = R0 * (1 + amp * (Math.sin(th * 3 + t * 1.7) * 0.5 + Math.sin(th * 5 - t * 2.3) * 0.3 + (b[bi * 2] - 0.3) * 0.9));
        let v: number;
        if (r < R) {
          const u = nx / R;
          const w = ny / R;
          const z = Math.sqrt(Math.max(0, 1 - u * u - w * w));
          // liquid bands flowing over the surface
          const flow = Math.sin(u * 4.2 + t + Math.sin(w * 3.1 - t * 0.8) * 1.6) * Math.cos(w * 3.6 - t * 0.6 + z * 2);
          const nxx = u + flow * 0.18 * swirl;
          const nyy = w + flow * 0.12 * swirl;
          const diff = Math.max(0, (nxx * lx + nyy * ly + z * lz) / ln);
          const spec = Math.pow(diff, 18) * (0.5 + L * 0.8);
          const rim = Math.pow(1 - z, 3) * (0.25 + L * 0.9);
          v = 0.1 + diff * 0.62 + spec + rim * 0.6 + flow * 0.06 * swirl;
        } else {
          // dithered halo
          const k = (r - R) / (0.42 - L * 0.1);
          v = k < 1 ? Math.pow(1 - k, 2.4) * (0.22 + glow * L * 0.9) : 0;
        }
        // ordered dither into 5 tones
        const q = Math.max(0, Math.min(4, v * 4));
        const lo = Math.floor(q);
        const idx = Math.min(4, q - lo > BAYER[(y & 7) * 8 + (x & 7)] ? lo + 1 : lo);
        const o = (y * res + x) * 4;
        const tc = tones[idx];
        d[o] = tc[0];
        d[o + 1] = tc[1];
        d[o + 2] = tc[2];
        d[o + 3] = idx === 0 ? 0 : 255;
      }
    }
    off.getContext('2d')!.putImageData(img, 0, 0);
    g.clearRect(0, 0, size, size);
    g.imageSmoothingEnabled = false;
    g.drawImage(off, 0, 0, size, size);
  });

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Voice assistant, ${voice.micLive ? 'listening to your microphone' : state}`}
      className={cn('block shrink-0', className)}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    />
  );
}

export function DitherOrbDemo() {
  return (
    <VoiceStage>
      {({ state, mic, setMicError, toggle }) => (
        <button onClick={toggle} aria-label="Toggle voice" className="focus-ring rounded-full transition-transform duration-300 ease-spring active:scale-95">
          <DitherOrb state={state} mic={mic} onMicError={setMicError} size={260} />
        </button>
      )}
    </VoiceStage>
  );
}

export function DitherOrbPaletteDemo() {
  const colors = ['#7dd3fc', '#f9a8d4', '#fcd34d', '#a7f3d0'];
  const states: VoiceState[] = ['speaking', 'listening', 'thinking', 'idle'];
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {colors.map((c, i) => (
        <div key={c} className="flex flex-col items-center gap-3">
          <DitherOrb color={c} state={states[i]} size={120} pixel={2.5} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-400">{states[i]}</span>
        </div>
      ))}
    </div>
  );
}
