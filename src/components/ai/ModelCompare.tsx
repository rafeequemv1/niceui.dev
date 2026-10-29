import { useEffect, useState } from 'react';
import { RotateCcw, Scale, ThumbsUp, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Markdown } from './stream';

export type CompareSide = {
  /** Revealed after the vote. */
  model: string;
  answer: string;
  /** Time to first token in ms. */
  ttft: number;
  /** Output speed in tokens per second. */
  tps: number;
  /** Price per 1M output tokens in USD. */
  price: number;
};
export type Vote = 'a' | 'b' | 'tie';

const CHARS_PER_TOKEN = 4.2;

function useStreamed(side: CompareSide, run: number) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(Infinity);
      return;
    }
    setT(0);
    const start = performance.now();
    let raf = 0;
    const total = side.ttft + ((side.answer.length / CHARS_PER_TOKEN) / side.tps) * 1000;
    const tick = () => {
      const e = performance.now() - start;
      setT(e);
      if (e < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [side, run]);
  const streaming = Math.max(0, t - side.ttft);
  const chars = Math.min(side.answer.length, Math.floor((streaming / 1000) * side.tps * CHARS_PER_TOKEN));
  return { text: side.answer.slice(0, chars), started: t >= side.ttft, done: chars >= side.answer.length, tokens: Math.round(chars / CHARS_PER_TOKEN), elapsed: Math.min(t, side.ttft + streaming) };
}

function Column({ label, side, run, revealed, winner, faster }: { label: string; side: CompareSide; run: number; revealed: boolean; winner: boolean; faster: boolean }) {
  const s = useStreamed(side, run);
  const tps = s.done ? side.tps : s.started && s.elapsed > side.ttft ? Math.min(side.tps, s.tokens / ((s.elapsed - side.ttft) / 1000)) : 0;
  return (
    <section className={cn('flex min-w-0 flex-col rounded-2xl bg-ink-900 shadow-card ring-1 transition-all duration-500', winner ? 'ring-brand-400/50' : 'ring-transparent')}>
      <header className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-white/[0.06] font-mono text-[11px] font-semibold text-ink-200">{label}</span>
        <span className="relative h-5 min-w-0 flex-1 overflow-hidden">
          <span className={cn('absolute inset-0 truncate text-sm text-ink-400 transition-all duration-500', revealed ? '-translate-y-full opacity-0' : 'translate-y-0')}>Model {label}</span>
          <span className={cn('absolute inset-0 truncate text-sm font-medium text-ink-50 transition-all duration-500', revealed ? 'translate-y-0' : 'translate-y-full opacity-0')}>{side.model}</span>
        </span>
        {winner && (
          <span className="flex items-center gap-1 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10.5px] font-medium text-brand-300 animate-scale-in">
            <Trophy className="h-3 w-3" /> Preferred
          </span>
        )}
        {faster && s.done && !winner && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-300 animate-scale-in">
            <Zap className="h-3 w-3" /> Faster
          </span>
        )}
      </header>
      <div className="min-h-[150px] flex-1 px-4 py-3">
        {s.started ? <Markdown text={s.text} caret={!s.done} className="text-[13px]" /> : <p className="shimmer-text text-[13px] font-medium">Waiting for first token…</p>}
      </div>
      <dl className="grid grid-cols-4 gap-1 border-t border-white/5 px-4 py-2.5 font-mono text-[10.5px] tabular-nums">
        {[
          ['TTFT', s.started ? `${side.ttft}ms` : '—'],
          ['Speed', tps ? `${Math.round(tps)} t/s` : '—'],
          ['Tokens', String(s.tokens)],
          ['Cost', `$${((s.tokens / 1e6) * side.price).toFixed(side.price < 1 ? 6 : 4)}`],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-ink-500">{k}</dt>
            <dd className="truncate text-ink-200">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export type ModelCompareProps = { prompt: string; a: CompareSide; b: CompareSide; className?: string };

/** Blind side-by-side comparison: two models stream the same prompt, you vote, then their names are revealed. */
export function ModelCompare({ prompt, a, b, className }: ModelCompareProps) {
  const [run, setRun] = useState(0);
  const [vote, setVote] = useState<Vote | null>(null);
  const rerun = () => {
    setVote(null);
    setRun((r) => r + 1);
  };
  const choices: { id: Vote; label: string }[] = [
    { id: 'a', label: 'A is better' },
    { id: 'tie', label: 'Tie' },
    { id: 'b', label: 'B is better' },
  ];

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex items-start gap-3 rounded-2xl bg-ink-900 px-4 py-3 shadow-card">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 text-ink-300">
          <Scale className="h-4 w-4" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-100">{prompt}</p>
        <button onClick={rerun} aria-label="Run again" className="focus-ring grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
        <Column label="A" side={a} run={run} revealed={!!vote} winner={vote === 'a'} faster={a.tps > b.tps} />
        <Column label="B" side={b} run={run} revealed={!!vote} winner={vote === 'b'} faster={b.tps > a.tps} />
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-ink-900 px-3 py-2.5 shadow-card">
        <span className="px-1 text-xs text-ink-400">{vote ? (vote === 'tie' ? 'Recorded a tie.' : `You preferred ${vote === 'a' ? a.model : b.model}.`) : 'Which answer is better?'}</span>
        <div className="ml-auto flex flex-wrap gap-1.5" role="group" aria-label="Vote">
          {choices.map((c) => (
            <button
              key={c.id}
              onClick={() => setVote(c.id)}
              disabled={!!vote}
              aria-pressed={vote === c.id}
              className={cn(
                'focus-ring flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all active:scale-[0.97]',
                vote === c.id ? 'bg-brand-500 text-white shadow-glow' : 'text-ink-200 ring-1 ring-white/10 hover:bg-white/5 disabled:opacity-40',
              )}
            >
              {c.id !== 'tie' && <ThumbsUp className="h-3.5 w-3.5" />}
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ——— demo ——— */

const A: CompareSide = {
  model: 'Atlas Reasoner',
  ttft: 520,
  tps: 58,
  price: 12,
  answer:
    '## In short\n- A vector database stores **embeddings**: lists of numbers that capture what text, images or audio mean.\n- It finds the closest matches by meaning, not keywords, so “cancel my plan” finds “end subscription”.\n- It powers smarter search, recommendations and AI answers grounded in your own docs.',
};
const B: CompareSide = {
  model: 'Nova Mini',
  ttft: 190,
  tps: 124,
  price: 0.6,
  answer:
    '- It turns content into **embeddings**, numbers that represent meaning.\n- It searches by similarity, so related ideas match even with different words.\n- Use it for semantic search, recommendations and retrieval for chatbots (`RAG`).',
};

export function ModelCompareDemo() {
  return <ModelCompare prompt="Explain vector databases to a product manager in three bullets." a={A} b={B} />;
}
