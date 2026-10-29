import { useEffect, useId, useRef, useState } from 'react';
import { Bot, Brain, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Caret, Markdown, useStream } from './stream';

export type ReasoningProps = {
  /** Reasoning text streamed so far. */
  text: string;
  /** True while the model is still thinking: the panel stays open and shows a live timer. */
  thinking: boolean;
  /** Seconds spent thinking, shown once done. Measured live when omitted. */
  duration?: number;
  /** Controlled open state. Leave it undefined to open while thinking and collapse when done. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/** Collapsible chain-of-thought: streams while the model thinks, then folds into “Thought for 6s”. */
export function Reasoning({ text, thinking, duration, open: controlled, onOpenChange, className }: ReasoningProps) {
  const [auto, setAuto] = useState(thinking);
  const [secs, setSecs] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const touched = useRef(false);
  const body = useRef<HTMLDivElement>(null);
  const id = useId();
  const open = controlled ?? auto;

  useEffect(() => {
    if (!thinking) return;
    const start = performance.now();
    setSecs(0);
    const t = window.setInterval(() => setSecs((performance.now() - start) / 1000), 100);
    return () => window.clearInterval(t);
  }, [thinking]);

  // Open while thinking; fold away shortly after, unless the reader toggled it themselves.
  useEffect(() => {
    if (thinking) {
      touched.current = false;
      setAuto(true);
      return;
    }
    if (touched.current) return;
    const t = window.setTimeout(() => setAuto(false), 650);
    return () => window.clearTimeout(t);
  }, [thinking]);

  useEffect(() => {
    const el = body.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
    if (thinking) el.scrollTop = el.scrollHeight;
  }, [text, thinking]);

  const toggle = () => {
    touched.current = true;
    if (controlled === undefined) setAuto(!open);
    onOpenChange?.(!open);
  };

  const shown = duration ?? Math.max(1, Math.round(secs));

  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={id}
        className="focus-ring group -ml-1 flex max-w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-[13px] transition-colors"
      >
        <span
          className={cn(
            'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 transition-colors duration-500',
            thinking ? 'bg-brand-500/10 text-brand-300 ring-brand-400/25' : 'bg-white/[0.04] text-ink-400 ring-white/10 group-hover:text-ink-200',
          )}
        >
          <Brain className={cn('h-3.5 w-3.5', thinking && 'animate-pulse')} />
          {thinking && <span className="absolute inset-0 animate-pulse-ring rounded-md ring-1 ring-brand-400/40" />}
        </span>
        {thinking ? (
          <span className="flex items-baseline gap-2" role="status">
            <span className="shimmer-text font-medium">Thinking</span>
            <span className="font-mono text-[11px] tabular-nums text-ink-500">{secs.toFixed(1)}s</span>
          </span>
        ) : (
          <span className="truncate font-medium text-ink-300 transition-colors group-hover:text-ink-100">
            Thought for {shown} second{shown === 1 ? '' : 's'}
          </span>
        )}
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-ink-500 transition-transform duration-300 ease-spring', open && 'rotate-180')} />
      </button>

      <div
        id={id}
        className={cn('grid transition-[grid-template-rows,opacity] duration-500 ease-smooth', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
      >
        <div className="overflow-hidden">
          <div className="relative ml-3 mt-1 border-l border-white/10 pl-4">
            {thinking && <span className="absolute -left-px top-0 h-8 w-px animate-pulse bg-gradient-to-b from-brand-400 to-transparent" />}
            <div
              ref={body}
              className={cn(
                'overflow-y-auto pr-1 text-[13px] leading-relaxed text-ink-400 [scrollbar-width:none]',
                thinking ? 'max-h-40' : 'max-h-72',
                thinking && overflowing && '[mask-image:linear-gradient(to_bottom,transparent,black_30%)]',
              )}
            >
              <p className="whitespace-pre-wrap py-1">
                {text}
                {thinking && <Caret className="h-[0.95em] w-[5px] bg-ink-400" />}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const QUESTION = 'Why does my search list re-render on every keystroke, even though it’s wrapped in React.memo?';

const THOUGHTS = `The list is wrapped in memo, so if it still re-renders, one of its props must change identity on every keystroke.

The likely props: items comes from a filter() call in the parent, which returns a brand-new array each render. onSelect is an inline arrow function, so it is new every time too.

The input state lives in the same parent, so each keystroke re-renders the parent, recreates both props, and memo's shallow comparison fails.

Smallest fix: memoize the filtered array with useMemo keyed on the query and wrap onSelect in useCallback. For long lists it is worth deferring the query so typing stays instant. I'll lead with the cause, then the three fixes in order of effort.`;

const ANSWER = `## Why it happens
Your \`ResultsList\` is memoized, but two of its props get a **new identity** on every keystroke:
- \`items\` is created by \`filter()\` during render
- \`onSelect\` is an inline arrow function
## The fix
1. Wrap the filtered list in \`useMemo\`, keyed on the query
2. Wrap \`onSelect\` in \`useCallback\`
3. For long lists, render with \`useDeferredValue(query)\` so typing stays instant`;

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ReasoningDemo() {
  const [reduced] = useState(prefersReduced);
  const [phase, setPhase] = useState<'thinking' | 'answering' | 'done'>(reduced ? 'done' : 'thinking');
  const thoughts = useStream(THOUGHTS, { speed: 46, enabled: phase === 'thinking' });
  const answer = useStream(ANSWER, { speed: 30, enabled: phase === 'answering' });

  useEffect(() => {
    if (phase !== 'thinking' || !thoughts.done) return;
    const t = window.setTimeout(() => setPhase('answering'), 380);
    return () => window.clearTimeout(t);
  }, [phase, thoughts.done]);

  useEffect(() => {
    if (phase === 'answering' && answer.done) setPhase('done');
  }, [phase, answer.done]);

  const replay = () => {
    thoughts.restart();
    answer.restart();
    setPhase('thinking');
  };

  const thinking = phase === 'thinking';

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <div className="flex justify-end animate-fade-up">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-sm leading-relaxed text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">{QUESTION}</p>
      </div>
      <div className="flex gap-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
          <Bot className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <Reasoning text={reduced ? THOUGHTS : thoughts.output} thinking={thinking} duration={reduced ? 6 : undefined} />
          {!thinking && <Markdown text={reduced ? ANSWER : answer.output} caret={phase === 'answering'} className="animate-fade-in" />}
          <div className={cn('flex h-7 items-center gap-2 transition-opacity duration-300', phase === 'done' ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            <button
              type="button"
              onClick={replay}
              className="focus-ring group flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100"
            >
              <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
              Replay
            </button>
            <span className="text-xs text-ink-500">Open “Thought for” to read the reasoning.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
