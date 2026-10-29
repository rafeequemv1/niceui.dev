import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { AudioLines, Check, Crop, Languages, MessageSquare, MousePointer2, Scissors, Sparkles, WandSparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { ACC, DitherCanvas, PAPER, SCREEN, clamp, ditherStill, hash, scenes, type Field, type SceneId } from './dither';
import { SectionHead, Serif } from './ui';

/* ——— shared bits ——— */

function useVisible<T extends Element>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, v];
}

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Seconds since mount, ticking at `fps` only while `active`. */
function useTicker(active: boolean, fps = 12) {
  const [t, setT] = useState(0);
  const acc = useRef(0);
  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now() - acc.current * 1000;
    const id = window.setInterval(() => {
      acc.current = (performance.now() - start) / 1000;
      setT(acc.current);
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [active, fps]);
  return t;
}

/** Wall clock in seconds since mount; frozen at `still` for visitors who prefer reduced motion. */
function useClockRef(still: number) {
  const t0 = useRef(performance.now());
  return useMemo(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return { now: () => still, live: false };
    return { now: () => (performance.now() - t0.current) / 1000, live: true };
  }, [still]);
}

function Card({ title, body, icon: Icon, className, children, delay = 0 }: { title: string; body: string; icon: typeof Scissors; className?: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay} className={cn('h-full', className)}>
      <div className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(24,24,27,0.25)]">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-zinc-100 bg-zinc-50/70">{children}</div>
        <div className="flex gap-3 px-4 pb-4 pt-4">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-zinc-950 text-white">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-zinc-950">{title}</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-zinc-500">{body}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Pill({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-all active:scale-95', on ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200 hover:text-zinc-950')}>
      {children}
    </button>
  );
}

const SRC = 16 / 9;
const crop = (scene: SceneId, focus: number): Field => (u, v, t, ar) => {
  const w = Math.min(1, ar / SRC);
  return scenes[scene](Math.min(1 - w, Math.max(0, focus - w / 2)) + u * w, v, t, SRC);
};

/* ——— 1 · Generative B-roll ——— */

const PROMPTS: { text: string; scene: SceneId }[] = [
  { text: 'Aerial coastline at dawn, slow push in', scene: 'coast' },
  { text: 'Neon city at night, drifting pan left', scene: 'city' },
  { text: 'Misty peaks, sun breaking through', scene: 'peaks' },
];
const CYCLE = 6.5;

function BrollVisual() {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const { now, live } = useClockRef(3.6);
  useTicker(visible, 15);
  const t = now();
  const k = Math.floor(t / CYCLE) % PROMPTS.length;
  const local = t % CYCLE;
  const typed = PROMPTS[k].text.slice(0, Math.floor(clamp(local / 1.1) * PROMPTS[k].text.length));
  const p = clamp((local - 1.1) / 2.2);

  const field = useMemo<Field>(
    () => (u, v, time, ar) => {
      const i = Math.floor(time / CYCLE) % PROMPTS.length;
      const q = clamp(((time % CYCLE) - 1.1) / 2.2);
      const s = scenes[PROMPTS[i].scene](u, v, time, ar);
      if (q >= 1) return s;
      const acc = s >= ACC;
      const f = Math.floor(time * 14);
      const nz = hash(Math.floor(u * 509) + f * 37, Math.floor(v * 283) + f * 11);
      const m = (acc ? s - ACC : s) * q + nz * (1 - q) * 0.8;
      return acc && q > 0.7 ? ACC + m : m;
    },
    [],
  );

  return (
    <div ref={ref} className="grid h-full gap-4 p-4 sm:p-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
      <div className="space-y-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <WandSparkles className="h-3.5 w-3.5 text-[#ff4f1f]" /> Generate B-roll
          </p>
          <p className="mt-2 min-h-[2.8em] text-[15px] leading-snug text-zinc-900">
            {typed}
            <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-blink bg-[#ff4f1f]" />
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['4s · 24 fps', 'Matched grade', 'Royalty-free'].map((c) => (
            <span key={c} className="rounded-full bg-white px-2.5 py-1 font-mono text-[10.5px] text-zinc-500 ring-1 ring-zinc-200">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0d0d0e] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]">
        <DitherCanvas field={field} time={live ? now : undefined} still={3.6} pixel={2} ink={PAPER} bg={SCREEN} fps={24} className="absolute inset-0" />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[9.5px] text-white/80 backdrop-blur">
          {p < 1 ? `DENOISING · STEP ${Math.max(1, Math.round(p * 24))}/24` : 'GEN_0' + (k + 1) + ' · READY'}
        </span>
        <span className={cn('absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9.5px] transition-all', p >= 1 ? 'bg-[#ff4f1f] text-white' : 'bg-black/60 text-white/60')}>
          {p >= 1 ? <Check className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />} {p >= 1 ? 'Added to V2' : `${Math.round(p * 100)}%`}
        </span>
      </div>
    </div>
  );
}

/* ——— 2 · Studio Sound ——— */

function StudioVisual() {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const t = useTicker(visible, 14);
  const [manual, setManual] = useState<boolean | null>(null);
  const on = manual ?? Math.floor(t / 3.4) % 2 === 1;
  const N = 44;
  return (
    <div ref={ref} className="flex h-full flex-col justify-between gap-4 p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-zinc-400">A1 · Dialogue</span>
        <button role="switch" aria-checked={on} aria-label="Studio Sound" onClick={() => setManual(!on)} className="flex items-center gap-2 text-[12px] font-medium text-zinc-700">
          Studio Sound
          <span className={cn('relative h-5 w-9 rounded-full transition-colors duration-300', on ? 'bg-[#ff4f1f]' : 'bg-zinc-300')}>
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ease-spring', on ? 'left-[18px]' : 'left-0.5')} />
          </span>
        </button>
      </div>
      <div className="relative flex h-24 items-center justify-between">
        <span className={cn('absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 rounded-md transition-opacity duration-500', on ? 'opacity-0' : 'opacity-100')} style={{ background: 'repeating-linear-gradient(90deg, rgba(255,79,31,0.12) 0 2px, transparent 2px 4px)' }} />
        {Array.from({ length: N }, (_, i) => {
          const x = i * 0.19 + t * 2.6;
          const speech = Math.max(0, Math.sin(x) * 0.5 + 0.5) * Math.max(0, Math.sin(x * 0.41 + 1.3) * 0.5 + 0.5);
          const r = hash(i * 5 + Math.floor(t * 14), 17);
          const v = on ? speech * (0.7 + r * 0.3) : Math.min(1, speech * (0.6 + r * 0.4) + 0.16 + r * 0.16);
          return <span key={i} className={cn('relative w-[3px] rounded-full transition-[height] duration-150', on ? 'bg-zinc-900' : 'bg-zinc-500')} style={{ height: `${Math.max(4, v * 100)}%` }} />;
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Noise floor', on ? '−74 dB' : '−31 dB'],
          ['Voice clarity', on ? '98%' : '61%'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
            <p className="text-[10.5px] text-zinc-400">{k}</p>
            <p key={v} className={cn('font-mono text-[15px] tabular-nums animate-fade-in', on ? 'text-zinc-950' : 'text-zinc-500')}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ——— 3 · Captions ——— */

const CAP_STYLES = ['Karaoke', 'Pop', 'Serif', 'Minimal'] as const;
type CapStyle = (typeof CAP_STYLES)[number];
const CAP_LINES = [
  ['The', 'light'],
  ['never', 'waits'],
  ['for', 'you.'],
];

function CaptionsVisual() {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const t = useTicker(visible, 10);
  const [manual, setManual] = useState<CapStyle | null>(null);
  const style = manual ?? CAP_STYLES[Math.floor(t / 4) % CAP_STYLES.length];
  const step = Math.floor(t / 0.42);
  const line = CAP_LINES[Math.floor(step / 2) % CAP_LINES.length];
  const cur = step % 2;
  const field = useMemo(() => crop('portrait', 0.57), []);
  return (
    <div ref={ref} className="flex h-full items-center justify-center gap-4 p-5">
      <div className="relative aspect-[9/16] h-[232px] shrink-0 overflow-hidden rounded-[18px] bg-[#0d0d0e] ring-4 ring-zinc-950 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)]">
        <DitherCanvas field={field} pixel={2} ink={PAPER} bg={SCREEN} fps={20} className="absolute inset-0" />
        <span className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full bg-white/20" />
        <div className="absolute inset-x-2 bottom-[18%] flex justify-center">
          <p key={`${style}-${line[0]}`} className="flex gap-1 text-center animate-scale-in">
            {line.map((w, i) => (
              <span
                key={w}
                className={cn(
                  'rounded-[4px] px-1 transition-all duration-150',
                  style === 'Karaoke' && cn('text-[15px] font-semibold text-white [text-shadow:0_1px_2px_#000]', i === cur && 'bg-[#ff4f1f] [text-shadow:none]'),
                  style === 'Pop' && cn('text-[17px] font-black uppercase tracking-tight [text-shadow:0_2px_0_#000,0_0_8px_rgba(0,0,0,0.8)]', i === cur ? 'scale-110 text-[#ff4f1f]' : 'text-white'),
                  style === 'Serif' && cn('font-serif text-[21px] italic text-white', i === cur ? 'opacity-100' : 'opacity-50'),
                  style === 'Minimal' && cn('text-[12px] font-medium lowercase text-white/90', i === cur && 'underline decoration-[#ff4f1f] decoration-2 underline-offset-4'),
                )}
              >
                {w}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">Style</span>
        {CAP_STYLES.map((s) => (
          <Pill key={s} on={style === s} onClick={() => setManual(s)}>
            {s}
          </Pill>
        ))}
      </div>
    </div>
  );
}

/* ——— 4 · Smart reframe ——— */

const REFRAMES = { '9:16': 9 / 16, '1:1': 1, '4:5': 4 / 5 } as const;
type Reframe = keyof typeof REFRAMES;
const subjectShift = (t: number) => Math.sin(t * 0.6) * 0.17;

function ReframeVisual() {
  const [ratio, setRatio] = useState<Reframe>('9:16');
  const { now, live } = useClockRef(2);
  const box = useRef<HTMLDivElement>(null);
  const field = useMemo<Field>(() => (u, v, t, ar) => scenes.portrait(u - subjectShift(t), v, t, ar), []);
  const w = REFRAMES[ratio] / SRC;

  useEffect(() => {
    const place = () => {
      const c = 0.5 + 0.12 / SRC + subjectShift(now());
      if (box.current) box.current.style.left = `${Math.min(1 - w, Math.max(0, c - w / 2)) * 100}%`;
    };
    place();
    if (!live) return;
    let raf = 0;
    const loop = () => {
      place();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [now, live, w]);

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-5">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0d0d0e] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)]">
        <DitherCanvas field={field} time={live ? now : undefined} still={2} pixel={2} ink={PAPER} bg={SCREEN} fps={24} className="absolute inset-0" />
        <div ref={box} className="absolute inset-y-0 transition-[width] duration-500 ease-smooth" style={{ width: `${w * 100}%`, boxShadow: '0 0 0 999px rgba(9,9,11,0.62)' }}>
          <span className="absolute inset-0 border border-white/80" />
          {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-b-2 border-l-2', 'right-0 bottom-0 border-b-2 border-r-2'].map((c) => (
            <span key={c} className={cn('absolute h-2.5 w-2.5 border-[#ff4f1f]', c)} />
          ))}
          <span className="absolute left-1/2 top-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-[#ff4f1f] px-1 font-mono text-[8.5px] font-medium text-white">{ratio} · TRACKING</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(Object.keys(REFRAMES) as Reframe[]).map((r) => (
            <Pill key={r} on={ratio === r} onClick={() => setRatio(r)}>
              {r}
            </Pill>
          ))}
        </div>
        <span className="flex items-center gap-1 font-mono text-[10.5px] text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> 98% in frame
        </span>
      </div>
    </div>
  );
}

/* ——— 5 · Dubbing ——— */

const LANGS = [
  ['EN', 'English', 'The light never waits for you.'],
  ['ES', 'Español', 'La luz nunca te espera.'],
  ['JA', '日本語', '光は、決して待ってくれない。'],
  ['DE', 'Deutsch', 'Das Licht wartet nie auf dich.'],
  ['HI', 'हिन्दी', 'रोशनी कभी तुम्हारा इंतज़ार नहीं करती।'],
  ['FR', 'Français', 'La lumière ne t’attend jamais.'],
] as const;

function DubVisual() {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const t = useTicker(visible, 8);
  const [manual, setManual] = useState<number | null>(null);
  const k = manual ?? Math.floor(t / 2.6) % LANGS.length;
  const [code, name, line] = LANGS[k];
  return (
    <div ref={ref} className="flex h-full flex-col justify-between gap-4 p-5">
      <div className="flex flex-wrap gap-1">
        {LANGS.map(([c], i) => (
          <Pill key={c} on={i === k} onClick={() => setManual(i)}>
            {c}
          </Pill>
        ))}
      </div>
      <div key={code} className="animate-fade-up">
        <p className="font-mono text-[10.5px] uppercase tracking-wider text-zinc-400">{name} · Maya’s voice</p>
        <p className="mt-1.5 min-h-[2.6em] text-[19px] font-medium leading-snug tracking-[-0.01em] text-zinc-950">“{line}”</p>
        <div className="mt-3 flex h-9 items-center gap-[3px]">
          {Array.from({ length: 40 }, (_, i) => {
            const r = hash(i * 3 + k * 41, k * 7);
            const env = Math.sin((i / 39) * Math.PI);
            return <span key={i} className="w-[3px] shrink-0 rounded-full bg-zinc-900 animate-fade-in" style={{ height: `${(0.15 + env * r * 0.85) * 100}%`, animationDelay: `${i * 12}ms` }} />;
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {['Voice clone', 'Lip-sync', 'Timing kept'].map((c) => (
          <span key={c} className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] text-zinc-600 ring-1 ring-zinc-200">
            <Check className="h-3 w-3 text-[#ff4f1f]" /> {c}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ——— 6 · Clips ——— */

const MOMENTS: { at: number; title: string; score: number; scene: SceneId; len: string }[] = [
  { at: 0.2, title: 'Why the light never waits', score: 96, scene: 'coast', len: '0:42' },
  { at: 0.52, title: 'The night I almost quit', score: 91, scene: 'city', len: '0:37' },
  { at: 0.8, title: 'Editing in my sleep', score: 88, scene: 'portrait', len: '0:51' },
];
const STRIP: SceneId[] = ['portrait', 'coast', 'portrait', 'city', 'portrait', 'reel', 'peaks', 'portrait', 'coast', 'city', 'portrait', 'peaks'];

function ClipsVisual() {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const t = useTicker(visible, 20);
  const local = prefersReduced() ? 5 : t % 8;
  const scan = clamp(local / 4.6);
  const fading = local > 7.3;
  return (
    <div ref={ref} className="flex h-full flex-col gap-5 p-4 sm:p-5">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[10.5px] text-zinc-400">
          <span>PODCAST_EP42.MP4</span>
          <span>58:12 · 1 video in</span>
        </div>
        <div className="relative h-12 overflow-hidden rounded-lg ring-1 ring-zinc-200">
          <div className="absolute inset-0 flex">
            {STRIP.map((s, i) => (
              <div key={i} className="h-full flex-1 [image-rendering:pixelated]" style={{ backgroundImage: `url(${ditherStill(`strip-${s}`, scenes[s], 64, 36, 3)})`, backgroundSize: 'auto 100%' }} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 bg-white/55 transition-none" style={{ left: `${scan * 100}%`, right: 0 }} />
          {MOMENTS.map((m) => (
            <span key={m.at} className={cn('absolute inset-y-0 w-[7%] border-x-2 border-[#ff4f1f] bg-[#ff4f1f]/25 transition-opacity duration-300', scan >= m.at && !fading ? 'opacity-100' : 'opacity-0')} style={{ left: `${(m.at - 0.035) * 100}%` }} />
          ))}
          <span className="absolute inset-y-0 w-0.5 bg-[#ff4f1f] shadow-[0_0_12px_2px_rgba(255,79,31,0.6)]" style={{ left: `${scan * 100}%`, opacity: scan < 1 ? 1 : 0 }} />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-3">
        {MOMENTS.map((m) => {
          const on = scan >= m.at && !fading;
          return (
            <div key={m.title} className={cn('flex flex-col gap-2.5 rounded-2xl border p-2 transition-all duration-500 sm:flex-row sm:p-2.5', on ? 'border-zinc-200 bg-white shadow-[0_12px_24px_-16px_rgba(0,0,0,0.3)]' : 'border-dashed border-zinc-300 bg-transparent')}>
              <div className="relative aspect-[9/16] w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:w-[88px] sm:self-center">
                <div className={cn('absolute inset-0 transition-all duration-500 ease-smooth [image-rendering:pixelated]', on ? 'scale-100 opacity-100' : 'scale-110 opacity-0')} style={{ backgroundImage: `url(${ditherStill(`v-${m.scene}`, crop(m.scene, m.scene === 'portrait' ? 0.57 : 0.62), 54, 96, 3)})`, backgroundSize: 'cover' }} />
                {on ? <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 font-mono text-[8px] text-white">{m.len}</span> : <span className="absolute inset-0 grid place-items-center font-mono text-[9px] text-zinc-400">9:16</span>}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                {on ? (
                  <p className="text-[12px] font-medium leading-snug text-zinc-900 animate-fade-in sm:text-[13px]">{m.title}</p>
                ) : (
                  <span className="space-y-1.5 pt-1">
                    <span className="block h-2 w-full rounded-full bg-zinc-200/80" />
                    <span className="block h-2 w-2/3 rounded-full bg-zinc-200/80" />
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="relative grid h-8 w-8 place-items-center">
                    <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#e4e4e7" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#ff4f1f" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(on ? m.score / 100 : 0) * 94.2} 94.2`} className="transition-[stroke-dasharray] duration-1000 ease-smooth" />
                    </svg>
                    <span className="font-mono text-[9.5px] font-semibold text-zinc-900">{on ? m.score : '–'}</span>
                  </span>
                  <span className="hidden text-[10.5px] leading-tight text-zinc-400 sm:inline">hook
                    <br />
                    score</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ——— 7 · Review ——— */

function ReviewVisual() {
  const [ref, visible] = useVisible<HTMLDivElement>();
  const t = useTicker(visible, 20);
  const local = prefersReduced() ? 4.2 : t % 7;
  const move = clamp((local - 0.4) / 1.4);
  const ease = 1 - Math.pow(1 - move, 3);
  const pinned = local > 1.9;
  const replied = local > 3.6;
  const out = local > 6.5;
  const city = useMemo(() => ditherStill('still-city', scenes.city, 160, 90, 4), []);
  return (
    <div ref={ref} className="relative flex h-full flex-col justify-center gap-3 p-5">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0d0d0e] [image-rendering:pixelated]" style={{ backgroundImage: `url(${city})`, backgroundSize: 'cover' }}>
        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/80">00:00:14:06</span>
      </div>
      <div className="relative h-8 rounded-lg bg-white ring-1 ring-zinc-200">
        <div className="absolute inset-y-2 left-2 right-2 flex gap-0.5">
          {[0.22, 0.14, 0.28, 0.18, 0.18].map((f, i) => (
            <span key={i} className="h-full rounded-[3px] bg-zinc-800" style={{ flex: f, opacity: 0.85 - i * 0.08 }} />
          ))}
        </div>
        <span className={cn('absolute -top-2.5 grid h-5 w-5 place-items-center rounded-full rounded-bl-none bg-[#ff4f1f] text-white shadow transition-all duration-300 ease-spring', pinned && !out ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} style={{ left: '61%' }}>
          <MessageSquare className="h-2.5 w-2.5" />
        </span>
        <span className="absolute -top-2.5 left-[24%] grid h-5 w-5 place-items-center rounded-full rounded-bl-none bg-zinc-950 text-white">
          <Check className="h-2.5 w-2.5" />
        </span>
      </div>
      <div className="relative min-h-[76px]">
        <div className={cn('rounded-xl bg-white p-2.5 ring-1 ring-zinc-200 transition-all duration-300', pinned && !out ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')}>
          <p className="flex items-center gap-1.5 text-[11.5px]">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#ff4f1f] text-[8px] font-bold text-white">L</span>
            <b className="font-medium text-zinc-900">Leo</b>
            <span className="font-mono text-[10px] text-zinc-400">@ 14:06</span>
          </p>
          <p className="mt-1 text-[12.5px] text-zinc-700">Hold this shot 6 frames longer?</p>
          <p className={cn('mt-1.5 flex items-center gap-1 text-[11.5px] text-zinc-500 transition-all duration-300', replied ? 'opacity-100' : 'opacity-0')}>
            <Check className="h-3 w-3 text-emerald-600" /> Maya extended it · just now
          </p>
        </div>
      </div>
      <span className="pointer-events-none absolute flex items-center gap-1 transition-opacity duration-300" style={{ left: `${88 - ease * 30}%`, top: `${74 - ease * 16}%`, opacity: out ? 0 : 1 }}>
        <MousePointer2 className="h-4 w-4 fill-[#ff4f1f] text-[#ff4f1f]" />
        <span className="rounded-full bg-[#ff4f1f] px-1.5 py-px text-[10px] font-medium text-white">Leo</span>
      </span>
    </div>
  );
}

/* ——— Section ——— */

export function Bento() {
  return (
    <section id="rushes-features" className="relative scroll-mt-16 border-t border-zinc-100 bg-[#fafaf9] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead
            tag="Everything after the shoot"
            title={
              <>
                A post-production team,
                <br />
                <Serif>in one timeline.</Serif>
              </>
            }
          />
          <p className="max-w-sm text-[16px] leading-relaxed text-zinc-500 md:pb-2">
            Seven of the jobs that used to eat your week. Each card is live, so try them.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2" icon={WandSparkles} title="Generative B-roll" body="Describe the shot you didn’t get. Rushes generates it, matches your grade and drops it on V2.">
            <BrollVisual />
          </Card>
          <Card icon={AudioLines} title="Studio Sound" body="Kitchen, car or conference hall, it ends up sounding like a treated booth." delay={80}>
            <StudioVisual />
          </Card>
          <Card icon={Sparkles} title="Captions with taste" body="Word-timed captions in styles that look designed, not default." delay={40}>
            <CaptionsVisual />
          </Card>
          <Card icon={Crop} title="Smart reframe" body="One edit, every aspect ratio. Subject tracking keeps faces in frame." delay={120}>
            <ReframeVisual />
          </Card>
          <Card icon={Languages} title="Dub in 29 languages" body="Your voice, your timing, lip-synced. Publish to every market from one cut." delay={200}>
            <DubVisual />
          </Card>
          <Card className="md:col-span-2" icon={Scissors} title="One video in, ten shorts out" body="Rushes scores every moment for hook, clarity and pacing, then cuts vertical clips with captions." delay={40}>
            <ClipsVisual />
          </Card>
          <Card icon={MessageSquare} title="Frame-accurate review" body="Clients comment on the exact frame. You resolve it on the timeline." delay={120}>
            <ReviewVisual />
          </Card>
        </div>
      </div>
    </section>
  );
}
