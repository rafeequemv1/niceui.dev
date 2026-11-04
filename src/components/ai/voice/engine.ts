import { useEffect, useRef, useState, type RefObject } from 'react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

/** One frame of voice: overall loudness and 16 frequency bands, all 0..1. */
export type VoiceFrame = { level: number; bands: Float32Array; state: VoiceState; t: number };

export const BANDS = 16;

/** Smooth, speech-like loudness for each state when there is no live audio. */
function simulate(state: VoiceState, t: number) {
  const n = (Math.sin(t * 7.3) + Math.sin(t * 13.1 + 1.7) * 0.6 + Math.sin(t * 23.7 + 0.4) * 0.35) / 1.95;
  switch (state) {
    case 'speaking': {
      // syllables inside phrases, with short breaths between phrases
      const syl = Math.pow(Math.max(0, Math.sin(t * Math.PI * 4.1 + Math.sin(t * 1.3) * 2.2)), 0.55);
      const phrase = Math.sin(t * 0.72 + 0.4) > -0.55 ? 1 : 0.12;
      return (0.18 + syl * 0.72 + n * 0.1) * phrase;
    }
    case 'listening': {
      const syl = Math.pow(Math.max(0, Math.sin(t * Math.PI * 3.3 + Math.sin(t * 0.9) * 2.6)), 0.8);
      const phrase = Math.sin(t * 0.55 + 2) > -0.35 ? 1 : 0.2;
      return (0.1 + syl * 0.42 + n * 0.08) * phrase;
    }
    case 'thinking':
      return 0.16 + Math.sin(t * 3.2) * 0.06 + n * 0.03;
    default:
      return 0.06 + Math.sin(t * 1.3) * 0.03;
  }
}

/**
 * Drives an orb from a live microphone or a simulated voice.
 * `sample(now)` is cheap and meant to be called once per animation frame.
 */
export function useVoice(state: VoiceState, opts: { mic?: boolean; level?: number } = {}) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const levelRef = useRef(opts.level);
  levelRef.current = opts.level;
  const analyser = useRef<AnalyserNode | null>(null);
  const bins = useRef<Uint8Array | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [micLive, setMicLive] = useState(false);

  const frame = useRef<VoiceFrame>({ level: 0, bands: new Float32Array(BANDS), state, t: 0 });
  const raw = useRef(new Float32Array(BANDS));

  useEffect(() => {
    if (!opts.mic) return;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let cancelled = false;
    setMicError(null);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser has no microphone access.');
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        if (cancelled) return stream.getTracks().forEach((tr) => tr.stop());
        ctx = new AudioContext();
        const node = ctx.createAnalyser();
        node.fftSize = 512;
        node.smoothingTimeConstant = 0.6;
        ctx.createMediaStreamSource(stream).connect(node);
        analyser.current = node;
        bins.current = new Uint8Array(node.frequencyBinCount);
        setMicLive(true);
      } catch (e) {
        setMicError(e instanceof Error && e.name === 'NotAllowedError' ? 'Microphone permission was denied.' : e instanceof Error ? e.message : 'Microphone unavailable.');
      }
    })();
    return () => {
      cancelled = true;
      analyser.current = null;
      setMicLive(false);
      stream?.getTracks().forEach((tr) => tr.stop());
      ctx?.close().catch(() => {});
    };
  }, [opts.mic]);

  const last = useRef(0);
  const sample = (now: number): VoiceFrame => {
    const t = now / 1000;
    const dt = Math.min(0.05, last.current ? t - last.current : 0.016);
    last.current = t;
    const f = frame.current;
    const st = stateRef.current;
    const r = raw.current;
    let target: number;

    const node = analyser.current;
    if (node && bins.current) {
      node.getByteFrequencyData(bins.current as Uint8Array<ArrayBuffer>);
      const b = bins.current;
      // speech lives roughly in the first ~60 bins (0–5.5 kHz at 48 kHz / 512)
      let sum = 0;
      for (let i = 0; i < BANDS; i++) {
        const a = Math.floor(Math.pow(i / BANDS, 1.6) * 60) + 1;
        const z = Math.floor(Math.pow((i + 1) / BANDS, 1.6) * 60) + 2;
        let s = 0;
        for (let k = a; k < z; k++) s += b[k];
        r[i] = Math.min(1, (s / (z - a) / 255) * 1.5);
        sum += r[i];
      }
      target = Math.min(1, (sum / BANDS) * 1.9);
    } else {
      target = levelRef.current ?? simulate(st, t);
      for (let i = 0; i < BANDS; i++) {
        const shape = 1 - Math.abs(i / (BANDS - 1) - 0.32) * 0.9;
        r[i] = Math.max(0, target * shape * (0.55 + 0.45 * Math.sin(t * (3.1 + i * 0.83) + i * 1.9)));
      }
    }

    // fast attack, slower release, like a VU meter
    const k = target > f.level ? 18 : 5;
    f.level += (target - f.level) * Math.min(1, dt * k);
    for (let i = 0; i < BANDS; i++) {
      const kk = r[i] > f.bands[i] ? 20 : 6;
      f.bands[i] += (r[i] - f.bands[i]) * Math.min(1, dt * kk);
    }
    f.state = node ? 'listening' : st;
    f.t = t;
    return f;
  };

  return { sample, micError, micLive };
}

/**
 * A HiDPI canvas loop that pauses off-screen and slows for reduced motion.
 * `draw` receives the 2D context in CSS pixels and the frame time.
 */
export function useCanvasLoop(
  ref: RefObject<HTMLCanvasElement | null>,
  size: number,
  draw: (g: CanvasRenderingContext2D, now: number, slow: number) => void,
  opts: { dpr?: number } = {},
) {
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = opts.dpr ?? Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(size * dpr);
    c.height = Math.round(size * dpr);
    const g = c.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const slow = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0.35 : 1;
    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      drawRef.current(g, now, slow);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(c);
    raf = requestAnimationFrame(loop);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, size, opts.dpr]);
}

/** Hex → [r, g, b]. */
export function rgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Mix two RGB colours. */
export const mixRgb = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Smoothly eases a value toward the target for the current state, so state changes never snap. */
export function easer() {
  const vals: Record<string, number> = {};
  return (key: string, target: number, dt: number, rate = 3) => {
    const v = vals[key] ?? target;
    const n = v + (target - v) * Math.min(1, dt * rate);
    vals[key] = n;
    return n;
  };
}
