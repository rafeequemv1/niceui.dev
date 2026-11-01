import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Check, CornerDownLeft, LoaderCircle, RotateCcw, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type InlineEditProps = {
  /** Source lines shown in the editor. */
  lines: string[];
  /** Selected range (inclusive, 0-based) the edit applies to. */
  selection: [number, number];
  /** Returns the replacement lines for a prompt. `attempt` increments on Retry. */
  generate: (prompt: string, attempt: number) => string[];
  /** Opens the prompt and runs this instruction once on mount. */
  autoPrompt?: string;
  fileName?: string;
  className?: string;
};

type Phase = 'idle' | 'prompt' | 'streaming' | 'review';

const reduce = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function InlineAIEdit({ lines: initial, selection, generate, autoPrompt, fileName = 'rate-limit.ts', className }: InlineEditProps) {
  const [lines, setLines] = useState(initial);
  const [sel, setSel] = useState(selection);
  const [phase, setPhase] = useState<Phase>('idle');
  const [prompt, setPrompt] = useState('');
  const [next, setNext] = useState<string[]>([]);
  const [shown, setShown] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const later = (ms: number, f: () => void) => void timers.current.push(window.setTimeout(f, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    setPhase('prompt');
    later(30, () => input.current?.focus());
  };

  const run = (text: string, n: number) => {
    const out = generate(text, n);
    setNext(out);
    if (reduce()) {
      setShown(out.length);
      setPhase('review');
      return;
    }
    setShown(0);
    setPhase('streaming');
    out.forEach((_, i) => later(260 * (i + 1), () => setShown(i + 1)));
    later(260 * out.length + 200, () => setPhase('review'));
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    setAttempt(0);
    run(prompt, 0);
  };

  const accept = () => {
    const [a, b] = sel;
    setLines((l) => [...l.slice(0, a), ...next, ...l.slice(b + 1)]);
    setSel([a, a + next.length - 1]);
    setPhase('idle');
    setPrompt('');
  };
  const reject = () => {
    setPhase('idle');
    setNext([]);
  };
  const retry = () => {
    const n = attempt + 1;
    setAttempt(n);
    run(prompt, n);
  };

  // Demo autoplay: type the instruction, then generate.
  useEffect(() => {
    if (!autoPrompt) return;
    if (reduce()) {
      setPrompt(autoPrompt);
      run(autoPrompt, 0);
      return;
    }
    later(500, () => setPhase('prompt'));
    [...autoPrompt].forEach((_, i) => later(700 + i * 28, () => setPrompt(autoPrompt.slice(0, i + 1))));
    later(700 + autoPrompt.length * 28 + 300, () => run(autoPrompt, 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (phase === 'idle') open();
    }
    if (e.key === 'Escape' && phase !== 'idle') {
      e.preventDefault();
      reject();
    }
    if (phase === 'review' && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      accept();
    }
  };

  const [a, b] = sel;
  const diffing = phase === 'streaming' || phase === 'review';

  return (
    <div
      tabIndex={0}
      onKeyDown={onKey}
      aria-label="Code editor. Press Command K to edit the selected lines with AI."
      className={cn('focus-ring w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-3.5 py-2.5">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/10" />
          ))}
        </span>
        <span className="ml-1 truncate font-mono text-xs text-ink-400">{fileName}</span>
        <button
          onClick={() => phase === 'idle' && open()}
          disabled={phase !== 'idle'}
          className="focus-ring ml-auto flex h-7 shrink-0 items-center gap-1.5 rounded-md bg-white/5 px-2 text-xs text-ink-200 transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-300" /> Edit
          <kbd className="ml-0.5 hidden rounded border border-white/10 px-1 font-mono text-[10px] text-ink-400 sm:inline">⌘K</kbd>
        </button>
      </div>

      <div className="overflow-x-auto py-3 font-mono text-[12.5px] leading-6">
        {lines.map((line, i) => {
          if (i === a) {
            return (
              <div key={'blk' + i}>
                {phase !== 'idle' && (
                  <form onSubmit={submit} className="mx-3 my-1.5 flex items-center gap-2 rounded-xl border border-brand-400/30 bg-ink-950/80 px-2.5 py-1.5 shadow-glow animate-scale-in">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-300" />
                    <input
                      ref={input}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={phase !== 'prompt'}
                      placeholder="Describe the change…"
                      aria-label="Edit instruction"
                      className="min-w-0 flex-1 bg-transparent font-sans text-[13px] text-ink-50 outline-none placeholder:text-ink-500"
                    />
                    {phase === 'prompt' && (
                      <button type="submit" disabled={!prompt.trim()} className="focus-ring flex h-6 items-center gap-1 rounded-md bg-brand-500 px-2 font-sans text-[11px] font-medium text-white disabled:opacity-40">
                        Generate <CornerDownLeft className="h-3 w-3" />
                      </button>
                    )}
                    {phase === 'streaming' && <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-300" />}
                    {phase === 'review' && (
                      <span className="flex shrink-0 items-center gap-1 font-sans">
                        <button type="button" onClick={accept} className="focus-ring flex h-6 items-center gap-1 rounded-md bg-emerald-500/90 px-2 text-[11px] font-medium text-white hover:bg-emerald-500">
                          <Check className="h-3 w-3" /> Accept
                        </button>
                        <button type="button" onClick={reject} className="focus-ring flex h-6 items-center gap-1 rounded-md bg-white/5 px-2 text-[11px] text-ink-200 hover:bg-white/10">
                          <X className="h-3 w-3" /> Reject
                        </button>
                        <button type="button" onClick={retry} aria-label="Retry" className="focus-ring grid h-6 w-6 place-items-center rounded-md bg-white/5 text-ink-300 hover:bg-white/10">
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {phase === 'prompt' && (
                      <button type="button" onClick={reject} aria-label="Close" className="focus-ring grid h-6 w-6 place-items-center rounded-md text-ink-500 hover:text-ink-200">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </form>
                )}
                {lines.slice(a, b + 1).map((l, j) => (
                  <Line key={'s' + j} n={a + j + 1} text={l} tone={diffing ? 'removed' : 'selected'} />
                ))}
                {diffing && next.slice(0, shown).map((l, j) => <Line key={'n' + j + attempt} n={a + j + 1} text={l} tone="added" />)}
              </div>
            );
          }
          if (i > a && i <= b) return null;
          return <Line key={i} n={i + 1} text={line} />;
        })}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 px-3.5 py-2 text-[11px] text-ink-500">
        <span>
          Lines {a + 1}–{b + 1} selected
        </span>
        <span className="hidden sm:inline">{phase === 'review' ? '⌘↵ accept · Esc reject' : 'Esc to cancel'}</span>
      </div>
    </div>
  );
}

function Line({ n, text, tone }: { n: number; text: string; tone?: 'selected' | 'removed' | 'added' }) {
  return (
    <div
      className={cn(
        'flex min-w-max pr-4',
        tone === 'selected' && 'bg-brand-500/[0.07]',
        tone === 'removed' && 'bg-rose-500/[0.08] text-rose-200/70 line-through decoration-rose-400/40',
        tone === 'added' && 'bg-emerald-500/[0.09] text-emerald-100 animate-fade-in',
        !tone && 'text-ink-300',
        tone === 'selected' && 'text-ink-100',
      )}
    >
      <span className={cn('w-10 shrink-0 select-none pr-3 text-right tabular-nums', tone === 'added' ? 'text-emerald-400/70' : tone === 'removed' ? 'text-rose-400/60' : 'text-ink-600')}>
        {tone === 'added' ? '+' : tone === 'removed' ? '−' : n}
      </span>
      <span className="whitespace-pre">{text || ' '}</span>
    </div>
  );
}

const DEMO_LINES = [
  "import { redis } from './redis';",
  '',
  'export async function allow(key: string) {',
  '  const count = await redis.incr(key);',
  '  if (count === 1) await redis.expire(key, 60);',
  '  return count <= 100;',
  '}',
  '',
  "export const LIMIT_HEADER = 'x-ratelimit-remaining';",
];

const VARIANTS = [
  [
    'export async function allow(key: string, limit = 100, windowSec = 60) {',
    '  const [count] = await redis.multi().incr(key).expire(key, windowSec, "NX").exec();',
    '  return { ok: count <= limit, remaining: Math.max(0, limit - count) };',
    '}',
  ],
  [
    'export async function allow(key: string, limit = 100, windowSec = 60) {',
    '  const count = await redis.incr(key);',
    '  if (count === 1) await redis.expire(key, windowSec);',
    '  return { ok: count <= limit, remaining: Math.max(0, limit - count) };',
    '}',
  ],
];

export function InlineAIEditDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <InlineAIEdit
        lines={DEMO_LINES}
        selection={[2, 6]}
        autoPrompt="Make limit and window configurable, return remaining"
        generate={(_, attempt) => VARIANTS[attempt % VARIANTS.length]}
      />
    </div>
  );
}
