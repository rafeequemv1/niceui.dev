import { Fragment, useEffect, useState } from 'react';
import { CornerDownRight, Layers, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AnswerSource = { title: string; domain: string; color: string };
export type AnswerData = { query: string; sources: AnswerSource[]; answer: string; related: string[] };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Renders **bold** and [n] citation chips; hovering a chip highlights its source. */
function Rich({ text, onCite }: { text: string; onCite: (n: number | null) => void }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
        const cite = part.match(/^\[(\d+)\]$/);
        if (cite)
          return (
            <button
              key={i}
              onMouseEnter={() => onCite(+cite[1])}
              onMouseLeave={() => onCite(null)}
              onFocus={() => onCite(+cite[1])}
              onBlur={() => onCite(null)}
              aria-label={`Source ${cite[1]}`}
              className="focus-ring mx-0.5 inline-flex h-4 min-w-4 -translate-y-px items-center justify-center rounded bg-brand-500/15 px-1 align-middle font-mono text-[10px] font-medium text-brand-200 transition-colors hover:bg-brand-500/30"
            >
              {cite[1]}
            </button>
          );
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i} className="font-medium text-ink-50">{part.slice(2, -2)}</strong>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

export type AnswerEngineProps = { data: AnswerData; onAsk?: (question: string) => void; className?: string };

/** Search-style answer: sources first, then a streamed answer with inline citations and related questions. */
export function AnswerEngine({ data, onAsk, className }: AnswerEngineProps) {
  const [phase, setPhase] = useState<'search' | 'answer' | 'done'>('search');
  const [shown, setShown] = useState(0);
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const tokens = data.answer.split(/(\s+)/).filter(Boolean);

  useEffect(() => {
    if (reduced()) {
      setShown(data.sources.length);
      setCount(Infinity);
      setPhase('done');
      return;
    }
    setPhase('search');
    setShown(0);
    setCount(0);
    const ids = data.sources.map((_, i) => window.setTimeout(() => setShown(i + 1), 180 + i * 190));
    ids.push(window.setTimeout(() => setPhase('answer'), 260 + data.sources.length * 190));
    return () => ids.forEach(clearTimeout);
  }, [data]);

  useEffect(() => {
    if (phase !== 'answer') return;
    if (count >= tokens.length) {
      setPhase('done');
      return;
    }
    const id = window.setTimeout(() => setCount((c) => c + 2), 22 + Math.random() * 30);
    return () => clearTimeout(id);
  }, [phase, count, tokens.length]);

  const text = tokens.slice(0, count).join('');

  return (
    <div className={cn('w-full rounded-2xl bg-ink-900 p-5 shadow-card', className)}>
      <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-ink-50">{data.query}</h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-500">
        <Layers className="h-3.5 w-3.5" />
        {phase === 'search' ? <span className="shimmer-text">Searching {data.sources.length} sources…</span> : <span>{data.sources.length} sources</span>}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.sources.map((s, i) => (
          <a
            key={s.domain}
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              'focus-ring group min-w-0 rounded-xl p-2.5 ring-1 transition-all duration-300',
              i < shown ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
              hover === i + 1 ? 'bg-brand-500/10 ring-brand-400/40' : 'bg-white/[0.03] ring-white/5 hover:bg-white/[0.05]',
            )}
          >
            <span className="flex items-center gap-1.5">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded text-[9px] font-semibold text-ink-950" style={{ background: s.color }}>
                {s.domain[0].toUpperCase()}
              </span>
              <span className="truncate text-[11px] text-ink-500">{s.domain}</span>
              <span className="ml-auto font-mono text-[10px] text-ink-600">{i + 1}</span>
            </span>
            <span className="mt-1.5 line-clamp-2 block text-xs leading-snug text-ink-200">{s.title}</span>
          </a>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-ink-300">
        <Sparkles className="h-3.5 w-3.5 text-brand-400" /> Answer
      </div>
      <div className="mt-2 min-h-[96px] text-sm leading-relaxed text-ink-300">
        {phase === 'search' ? (
          <div className="space-y-2 pt-1">
            {[92, 100, 74].map((w) => (
              <div key={w} className="h-2.5 animate-pulse rounded-full bg-white/[0.05]" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <p>
            <Rich text={text} onCite={setHover} />
            {phase === 'answer' && <span aria-hidden className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[3px] animate-blink rounded-[2px] bg-brand-400" />}
          </p>
        )}
      </div>

      <div className={cn('grid transition-all duration-500 ease-smooth', phase === 'done' ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
        <div className="mt-4 border-t border-white/5 pt-3">
        <p className="mb-1 text-xs font-medium text-ink-400">Related</p>
        {data.related.map((q) => (
          <button key={q} onClick={() => onAsk?.(q)} className="focus-ring group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink-300 transition-colors hover:bg-white/[0.04] hover:text-ink-50">
            <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-ink-600 transition-colors group-hover:text-brand-400" />
            <span className="min-w-0 flex-1 truncate">{q}</span>
          </button>
        ))}
        </div>
        </div>
      </div>
    </div>
  );
}

const SOURCES: AnswerSource[][] = [
  [
    { title: 'Why ceramic electrolytes crack at scale', domain: 'voltreview.io', color: '#7dd3fc' },
    { title: 'Inside a pilot line for solid-state cells', domain: 'gridnotes.dev', color: '#fcd34d' },
    { title: 'Dendrites, explained with pictures', domain: 'cellmath.org', color: '#86efac' },
    { title: 'The cost curve nobody talks about', domain: 'kilowatt.news', color: '#f9a8d4' },
  ],
  [
    { title: 'Who ships solid-state cells first?', domain: 'kilowatt.news', color: '#f9a8d4' },
    { title: 'Pilot lines, by the numbers', domain: 'gridnotes.dev', color: '#fcd34d' },
    { title: 'Automaker battery roadmaps compared', domain: 'drivetrain.fyi', color: '#c4b5fd' },
    { title: 'What “sample B” cells really mean', domain: 'voltreview.io', color: '#7dd3fc' },
  ],
];

const DATA: AnswerData[] = [
  {
    query: 'Why are solid-state batteries so hard to manufacture?',
    sources: SOURCES[0],
    answer:
      'Solid-state cells replace the liquid electrolyte with a **ceramic or polymer layer** [1], which is safer and denser but far less forgiving. Every layer has to stay in perfect contact while the cell swells and shrinks, and microscopic gaps let **lithium dendrites** grow [3]. Thin ceramic sheets also crack when stacked at speed [2], so yields on pilot lines stay low and costs stay high [4].',
    related: ['Which companies are closest to mass production?', 'How long do solid-state batteries last?', 'Are they actually safer than lithium-ion?'],
  },
  {
    query: 'Which companies are closest to mass production?',
    sources: SOURCES[1],
    answer:
      'A handful of cell makers now ship **B-sample cells** to automakers for road testing [4], the step before production tooling [2]. Most roadmaps point to limited production runs first, usually in premium models [3], with broad rollout only once yields and costs improve [1].',
    related: ['Why are solid-state batteries so hard to manufacture?', 'What is a B-sample cell?', 'How much would a solid-state car cost?'],
  },
];

export function AnswerEngineDemo() {
  const [i, setI] = useState(0);
  const ask = (q: string) => setI(DATA.findIndex((d) => d.query === q) >= 0 ? DATA.findIndex((d) => d.query === q) : (i + 1) % DATA.length);
  return (
    <div className="mx-auto w-full max-w-2xl space-y-3">
      <AnswerEngine data={DATA[i]} onAsk={ask} />
      <button onClick={() => setI((n) => (n + 1) % DATA.length)} className="focus-ring mx-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
        <RotateCcw className="h-3.5 w-3.5" /> Ask another
      </button>
    </div>
  );
}
