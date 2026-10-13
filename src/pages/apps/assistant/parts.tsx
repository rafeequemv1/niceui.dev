import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, Brain, Check, ChevronDown, Clapperboard, Code2, Download, FileText, Globe, Loader2, Maximize2,
  Pause, Play, RotateCcw, Shuffle, Volume2, Wand2, X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Markdown } from '@/components/ai/stream';
import { Portal, useEscape } from '@/components/ui/motion/hooks';
import type { Artifact, Part } from './types';

type P<T extends Part['type']> = Extract<Part, { type: T }>;

export function ThinkingPart({ part }: { part: P<'thinking'> }) {
  const [open, setOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (part.done) {
      setOpen(false);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(id);
  }, [part.done]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px]">
        <Brain className={cn('h-4 w-4', part.done ? 'text-ink-400' : 'text-brand-400')} />
        {part.done ? (
          <span className="text-ink-300">Thought for {Math.max(1, Math.round(elapsed || part.seconds))}s</span>
        ) : (
          <span className="shimmer-text font-medium">Thinking… {elapsed.toFixed(1)}s</span>
        )}
        <ChevronDown className={cn('ml-auto h-4 w-4 text-ink-500 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div className={cn('grid transition-all duration-500 ease-smooth', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <p className="border-l-2 border-white/10 mx-3.5 mb-3 pl-3 text-[13px] italic leading-relaxed text-ink-400">{part.text.slice(0, part.shown)}</p>
        </div>
      </div>
    </div>
  );
}

const toolIcons: Record<string, typeof Globe> = { web_search: Globe, read_files: FileText, storyboard: Clapperboard };

export function ToolPart({ part }: { part: P<'tool'> }) {
  const Icon = toolIcons[part.name] ?? Wand2;
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
        <span className={cn('grid h-7 w-7 place-items-center rounded-lg', part.done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400')}>
          {part.done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className={cn('text-[13px] font-medium', part.done ? 'text-ink-200' : 'shimmer-text')}>{part.label}</div>
          <div className="truncate font-mono text-[11px] text-ink-500">{part.detail}</div>
        </div>
        {!part.done && <Loader2 className="h-4 w-4 animate-spin text-ink-500" />}
      </div>
      {part.sources && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {part.sources.map((s, i) => (
            <div key={s.title} className="group rounded-xl border border-white/[0.06] bg-ink-900/60 p-3 transition-colors hover:border-white/15 animate-fade-up" style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'both' }}>
              <div className="flex items-center gap-2 text-[11px] text-ink-500">
                <span className="grid h-4 w-4 place-items-center rounded bg-white/10 text-[9px] font-semibold text-ink-200">{i + 1}</span>
                {s.domain}
              </div>
              <div className="mt-1.5 line-clamp-1 text-[13px] font-medium text-ink-100">{s.title}</div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-400">{s.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TextPart({ part, caret }: { part: P<'text'>; caret: boolean }) {
  return <Markdown text={part.text.slice(0, part.shown)} caret={caret && part.shown < part.text.length} className="text-[15px] text-ink-200" />;
}

export function ArtifactCard({ part, onOpen, active }: { part: P<'artifact'>; onOpen: (a: Artifact) => void; active: boolean }) {
  const lines = part.artifact.code.split('\n').length;
  return (
    <button
      disabled={!part.done}
      onClick={() => onOpen(part.artifact)}
      className={cn(
        'group flex w-full max-w-md items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 animate-fade-up',
        active ? 'border-brand-500/50 bg-brand-500/[0.06]' : 'border-white/[0.08] bg-ink-900 hover:border-white/20',
      )}
    >
      <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-800 text-brand-300">
        <Code2 className="h-5 w-5" />
        {!part.done && <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink-50">{part.artifact.title}</span>
        <span className="block text-xs text-ink-500">{part.done ? `${part.artifact.language.toUpperCase()} · ${lines} lines · Click to open` : 'Writing code…'}</span>
      </span>
      {part.done ? (
        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-ink-300 transition-colors group-hover:bg-white/10 group-hover:text-white">Open</span>
      ) : (
        <Loader2 className="h-4 w-4 animate-spin text-ink-500" />
      )}
    </button>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEscape(true, onClose);
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-6 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <img src={src} alt={alt} className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()} />
        <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
      </div>
    </Portal>
  );
}

export function ImagePart({ part, onPrompt }: { part: P<'image'>; onPrompt: (text: string) => void }) {
  const [zoom, setZoom] = useState<string | null>(null);
  const done = part.progress >= 100;
  return (
    <div>
      <div className="grid max-w-xl grid-cols-2 gap-2">
        {part.urls.map((url, i) => {
          const local = Math.max(0, Math.min(100, part.progress * 1.15 - i * 5));
          return (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-800 animate-scale-in" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <img
                src={url} alt={part.prompt} loading="lazy"
                className="h-full w-full object-cover transition-[filter,transform] duration-300"
                style={{ filter: done ? 'none' : `blur(${24 - local * 0.22}px) saturate(${0.4 + local / 160})`, transform: done ? undefined : 'scale(1.1)' }}
              />
              {!done && (
                <>
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay dither-noise" />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur">{Math.round(local)}%</span>
                </>
              )}
              {done && (
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button onClick={() => onPrompt(`Create variations of image ${i + 1}: ${part.prompt}`)} className="flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-white/25">
                    <Shuffle className="h-3 w-3" /> Vary
                  </button>
                  <div className="flex gap-1">
                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Download" className="grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-white backdrop-blur hover:bg-white/25"><Download className="h-3.5 w-3.5" /></a>
                    <button onClick={() => setZoom(url)} aria-label="Expand" className="grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-white backdrop-blur hover:bg-white/25"><Maximize2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
        {done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {done ? '4 images · 1024 × 1024' : `Generating · step ${Math.round(part.progress * 0.5)}/50`}
      </div>
      {zoom && <Lightbox src={zoom} alt={part.prompt} onClose={() => setZoom(null)} />}
    </div>
  );
}

const videoStages = ['Composing keyframes', 'Simulating motion', 'Rendering frames', 'Color grading', 'Encoding'];

export function VideoPart({ part }: { part: P<'video'> }) {
  const done = part.progress >= 100;
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((v) => {
        const next = v + dt;
        if (next >= part.seconds) {
          setPlaying(false);
          return part.seconds;
        }
        return next;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, part.seconds]);

  const toggle = () => {
    if (t >= part.seconds) setT(0);
    setPlaying((p) => !p);
  };
  const frac = t / part.seconds;
  const stage = videoStages[Math.min(videoStages.length - 1, Math.floor(part.progress / (100 / videoStages.length)))];

  return (
    <div className="max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-black animate-scale-in">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={part.poster} alt={part.prompt}
          className="h-full w-full object-cover"
          style={{
            filter: done ? 'none' : `blur(${20 - part.progress * 0.16}px) grayscale(${1 - part.progress / 100})`,
            transform: `scale(${1.08 + frac * 0.14}) translate(${-frac * 3}%, ${frac * 1.5}%)`,
            transition: 'filter 300ms',
          }}
        />
        {!done && (
          <div className="absolute inset-0 grid place-items-center bg-black/30">
            <div className="text-center">
              <div className="font-mono text-3xl font-semibold tabular-nums text-white">{Math.round(part.progress)}%</div>
              <div className="mt-1 text-xs text-white/70">{stage}…</div>
            </div>
          </div>
        )}
        {done && !playing && (
          <button onClick={toggle} aria-label="Play" className="absolute inset-0 grid place-items-center bg-black/20 transition-colors hover:bg-black/10">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-ink-950 shadow-xl transition-transform hover:scale-110"><Play className="ml-0.5 h-6 w-6 fill-current" /></span>
          </button>
        )}
        {done && <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur">1080p · 24fps</span>}
      </div>
      <div className="flex items-center gap-3 bg-ink-900 px-3 py-2.5">
        {done ? (
          <>
            <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="text-ink-200 hover:text-white">
              {playing ? <Pause className="h-4 w-4" /> : t >= part.seconds ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <input
              type="range" min={0} max={part.seconds} step={0.01} value={t}
              onChange={(e) => setT(Number(e.target.value))}
              aria-label="Seek"
              className="h-1 flex-1 accent-brand-500"
            />
            <span className="font-mono text-[11px] tabular-nums text-ink-400">0:{String(Math.floor(t)).padStart(2, '0')} / 0:{String(part.seconds).padStart(2, '0')}</span>
            <Volume2 className="h-4 w-4 text-ink-500" />
          </>
        ) : (
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-300 transition-[width] duration-200" style={{ width: `${part.progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ErrorPart({ part, onRetry }: { part: P<'error'>; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-3.5 animate-fade-up">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
      <div className="flex-1">
        <div className="text-sm font-medium text-rose-200">Response interrupted</div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-rose-200/70">{part.message}</p>
      </div>
      <button onClick={onRetry} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-500/15 px-2.5 py-1.5 text-xs font-medium text-rose-100 transition-colors hover:bg-rose-500/25">
        <RotateCcw className="h-3.5 w-3.5" /> Retry
      </button>
    </div>
  );
}
