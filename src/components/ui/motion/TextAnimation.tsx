import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Words fade + unblur + rise in sequence. */
export function BlurInText({ text, stagger = 70, className }: { text: string; stagger?: number; className?: string }) {
  return (
    <span className={className}>
      <style>{'@keyframes blur-in{from{opacity:0;filter:blur(10px);transform:translateY(8px)}to{opacity:1;filter:blur(0);transform:none}}'}</style>
      {text.split(' ').map((w, i) => (
        <span
          key={i}
          className="inline-block"
          style={{ animation: `blur-in 700ms cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms both` }}
        >
          {w}&nbsp;
        </span>
      ))}
    </span>
  );
}

/** Types out each phrase, pauses, deletes, moves to the next. */
export function Typewriter({ words, speed = 55, pause = 1400, className }: { words: string[]; speed?: number; pause?: number; className?: string }) {
  const [i, setI] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[i % words.length];

  useEffect(() => {
    let t: number;
    if (!deleting && len < word.length) t = window.setTimeout(() => setLen(len + 1), speed + Math.random() * 40);
    else if (!deleting) t = window.setTimeout(() => setDeleting(true), pause);
    else if (len > 0) t = window.setTimeout(() => setLen(len - 1), speed / 2);
    else
      t = window.setTimeout(() => {
        setDeleting(false);
        setI((n) => n + 1);
      }, 200);
    return () => window.clearTimeout(t);
  }, [len, deleting, word, speed, pause]);

  return (
    <span className={className}>
      {word.slice(0, len)}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] animate-blink bg-brand-400" />
    </span>
  );
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';

/** Characters resolve from random glyphs left to right. */
export function ScrambleText({ text, duration = 1200, trigger = 0, className }: { text: string; duration?: number; trigger?: number; className?: string }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(p * text.length);
      setOut(
        text
          .split('')
          .map((c, idx) => (c === ' ' || idx < revealed ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, trigger]);
  return <span className={cn('font-mono', className)}>{out}</span>;
}

/** Cycles words with a vertical slide + blur, animating container width. */
export function RotatingWords({ words, interval = 2200, className }: { words: string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
  const [width, setWidth] = useState<number>();
  const measure = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => window.clearInterval(t);
  }, [words.length, interval]);
  useEffect(() => {
    if (measure.current) setWidth(measure.current.offsetWidth);
  }, [i]);

  return (
    <span className={cn('relative inline-flex h-[1.25em] overflow-hidden align-bottom transition-[width] duration-500 ease-smooth', className)} style={{ width }}>
      <span ref={measure} className="invisible absolute whitespace-nowrap">{words[i]}</span>
      {words.map((w, idx) => {
        const state = idx === i ? 'in' : idx === (i - 1 + words.length) % words.length ? 'out' : 'idle';
        return (
          <span
            key={w}
            className={cn(
              'absolute left-0 top-0 whitespace-nowrap transition-all duration-500 ease-smooth',
              state === 'in' && 'translate-y-0 opacity-100 blur-0',
              state === 'out' && '-translate-y-full opacity-0 blur-sm',
              state === 'idle' && 'translate-y-full opacity-0 blur-sm',
            )}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
}

/** A light sweep travelling across gradient text. */
export function GradientSweepText({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn('bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: 'linear-gradient(110deg, #3396ff 0%, #2dd4bf 30%, #f7f7f8 45%, #2dd4bf 60%, #3396ff 100%)',
        backgroundSize: '250% 100%',
        animation: 'shimmer 3.2s linear infinite',
      }}
    >
      {text}
    </span>
  );
}

export function TextAnimationDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 text-center">
      <h2 key={run} className="text-3xl font-semibold tracking-tight text-ink-50 sm:text-4xl">
        <BlurInText text="Interfaces that feel alive, not animated." />
      </h2>
      <p className="text-xl font-medium text-ink-300 sm:text-2xl">
        Build for <RotatingWords words={['designers', 'founders', 'engineers', 'everyone']} className="text-brand-300" />
      </p>
      <button
        onClick={() => setRun((r) => r + 1)}
        className="focus-ring flex items-center gap-2 rounded-lg bg-ink-850 px-3 py-1.5 text-xs font-medium text-ink-300 shadow-hairline transition hover:text-ink-50 active:scale-95"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Replay
      </button>
    </div>
  );
}

export function TextEffectsDemo() {
  const [n, setN] = useState(0);
  return (
    <div className="mx-auto grid w-full max-w-xl gap-3">
      <div className="surface-raised flex items-center justify-between gap-4 p-4">
        <span className="text-xs text-ink-500">Typewriter</span>
        <span className="font-mono text-sm text-ink-100">
          $ <Typewriter words={['npx lumen add dock', 'npx lumen add toast-stack', 'npx lumen init']} />
        </span>
      </div>
      <button onClick={() => setN((x) => x + 1)} className="surface-raised flex items-center justify-between gap-4 p-4 text-left transition hover:bg-ink-800">
        <span className="text-xs text-ink-500">Scramble · click</span>
        <ScrambleText text="ACCESS GRANTED · KEY 7F3A-91C2" trigger={n} className="text-sm text-emerald-300" />
      </button>
      <div className="surface-raised flex items-center justify-between gap-4 p-4">
        <span className="text-xs text-ink-500">Gradient sweep</span>
        <GradientSweepText text="Introducing Nice 2.0" className="text-lg font-semibold" />
      </div>
    </div>
  );
}
