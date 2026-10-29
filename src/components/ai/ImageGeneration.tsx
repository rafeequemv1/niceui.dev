import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCw, Wand2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Palette = string[];

const PRESETS: Array<{ prompt: string; palettes: Palette[] }> = [
  {
    prompt: 'Aurora over a frozen fjord, long exposure',
    palettes: [
      ['#0b1d3a', '#2dd4bf', '#38bdf8', '#a7f3d0'],
      ['#06122b', '#5eead4', '#1461e1', '#e0f2fe'],
      ['#0a1a2f', '#34d399', '#0ea5e9', '#fef3c7'],
      ['#071426', '#99f6e4', '#7dd3fc', '#14b8a6'],
    ],
  },
  {
    prompt: 'Desert dunes at golden hour, soft haze',
    palettes: [
      ['#3b1d0b', '#f59e0b', '#fb7185', '#fde68a'],
      ['#2a1408', '#fbbf24', '#f97316', '#fecdd3'],
      ['#33150c', '#fcd34d', '#e11d48', '#fff7ed'],
      ['#2b1a0e', '#fdba74', '#f59e0b', '#fde047'],
    ],
  },
  {
    prompt: 'Neon city reflected in rain puddles',
    palettes: [
      ['#0a0a0c', '#f43f5e', '#0ea5e9', '#22d3ee'],
      ['#0c0a10', '#fb7185', '#38bdf8', '#fbbf24'],
      ['#08080c', '#e11d48', '#14b8a6', '#bae6fd'],
      ['#0a0b10', '#f472b6', '#0ea5e9', '#5eead4'],
    ],
  },
];

function mesh(p: Palette, seed: number) {
  const a = (n: number) => 15 + ((seed * 37 + n * 53) % 70);
  return {
    backgroundColor: p[0],
    backgroundImage: [
      `radial-gradient(at ${a(1)}% ${a(2)}%, ${p[1]} 0px, transparent 55%)`,
      `radial-gradient(at ${a(3)}% ${a(4)}%, ${p[2]} 0px, transparent 50%)`,
      `radial-gradient(at ${a(5)}% ${100 - a(6) / 2}%, ${p[3]} 0px, transparent 45%)`,
      `radial-gradient(at ${a(7)}% 100%, ${p[1]} 0px, transparent 50%)`,
      `linear-gradient(180deg, transparent 55%, ${p[0]} 100%)`,
    ].join(','),
  };
}

export type GeneratedImageProps = { palette: Palette; seed: number; progress: number; selected?: boolean; onSelect?: () => void };

export function GeneratedImage({ palette, seed, progress, selected, onSelect }: GeneratedImageProps) {
  const p = Math.min(1, Math.max(0, progress));
  const done = p >= 1;
  return (
    <button
      onClick={onSelect}
      disabled={!done}
      className={cn(
        'focus-ring group relative aspect-square overflow-hidden rounded-xl bg-ink-850 shadow-hairline transition-all duration-300 ease-spring',
        done && 'hover:scale-[1.02]',
        selected && 'ring-2 ring-brand-400 ring-offset-2 ring-offset-ink-900',
      )}
    >
      <div
        className="absolute inset-0 transition-[filter] duration-150"
        style={{ ...mesh(palette, seed), filter: `blur(${(1 - p) * 28}px) saturate(${0.4 + p * 0.6})`, transform: `scale(${1.15 - p * 0.15})` }}
      />
      <div className="absolute inset-0 mix-blend-overlay opacity-30 dot-bg" />
      {!done && (
        <>
          <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)] bg-[length:200%_100%]" />
          <span className="absolute bottom-2 left-2 rounded-md bg-ink-950/70 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-ink-100 backdrop-blur">
            {Math.round(p * 100)}%
          </span>
        </>
      )}
      {done && (
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950/60 text-ink-100 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Download className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

const DURATION = 4200;

export function ImageGenerationDemo() {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [job, setJob] = useState({ preset: 0, run: 0 });
  const [t, setT] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    const start = performance.now();
    setSelected(null);
    const tick = (now: number) => {
      const e = now - start;
      setT(e);
      if (e < DURATION + 800) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [job]);

  const generate = (text = prompt) => {
    const found = PRESETS.findIndex((p) => p.prompt === text);
    const hash = [...text].reduce((a, c) => a + c.charCodeAt(0), 0);
    setJob((j) => ({ preset: found >= 0 ? found : hash % PRESETS.length, run: j.run + 1 }));
  };
  const busy = t < DURATION + 600;
  const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl bg-ink-900 p-3 shadow-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
          className="flex items-center gap-2 rounded-xl bg-ink-950 p-1.5 pl-3 shadow-hairline focus-within:shadow-glow"
        >
          <Wand2 className="h-4 w-4 shrink-0 text-brand-300" />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink-50 outline-none placeholder:text-ink-500"
            placeholder="Describe an image…"
          />
          <button
            type="submit"
            disabled={busy}
            className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-xs font-medium text-white transition-all hover:bg-brand-400 active:scale-95 disabled:bg-ink-800 disabled:text-ink-400"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
            {busy ? 'Generating' : 'Generate'}
          </button>
        </form>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PRESETS[job.preset].palettes.map((pal, i) => (
            <GeneratedImage
              key={`${job.run}-${i}`}
              palette={pal}
              seed={job.run * 4 + i + 1}
              progress={ease((t - i * 250) / (DURATION - 750))}
              selected={selected === i}
              onSelect={() => setSelected(i)}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.prompt}
              disabled={busy}
              onClick={() => {
                setPrompt(p.prompt);
                generate(p.prompt);
              }}
              className="focus-ring rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-ink-400 transition-colors hover:bg-white/10 hover:text-ink-100 disabled:opacity-50"
            >
              {p.prompt.split(',')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
