import { useEffect, useRef, useState } from 'react';
import { BookOpenText, Check, FileText, Lightbulb, Loader2, PenLine, Play, RotateCcw, Search, Square, Telescope } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useInView } from '@/pages/landing/shared/motion';

export type ResearchPhase = 'plan' | 'search' | 'read' | 'write';

const PHASES: { id: ResearchPhase; label: string; icon: typeof Search; from: number; to: number }[] = [
  { id: 'plan', label: 'Plan', icon: Lightbulb, from: 0, to: 1200 },
  { id: 'search', label: 'Search', icon: Search, from: 1200, to: 3800 },
  { id: 'read', label: 'Read', icon: BookOpenText, from: 3800, to: 7200 },
  { id: 'write', label: 'Synthesize', icon: PenLine, from: 7200, to: 9200 },
];
const TOTAL = 9200;

const PLAN = ['Which obligations apply to general-purpose models, and when?', 'How do “systemic risk” thresholds change the duties?', 'What do providers need to publish, and to whom?'];
const QUERIES = ['EU AI Act GPAI obligations timeline', 'Article 53 technical documentation requirements', 'systemic risk 10^25 FLOPs threshold', 'GPAI code of practice August 2025', 'AI Office enforcement powers fines'];
const SOURCES = [
  { m: 'E', c: 'bg-sky-500', domain: 'eur-lex.europa.eu', title: 'Regulation (EU) 2024/1689, full text', snip: 'Providers of general-purpose AI models shall draw up and keep up to date the technical documentation…' },
  { m: 'A', c: 'bg-violet-500', domain: 'digital-strategy.ec.europa.eu', title: 'AI Office: GPAI code of practice', snip: 'The code details how providers can demonstrate compliance with transparency and copyright duties…' },
  { m: 'I', c: 'bg-emerald-500', domain: 'iapp.org', title: 'Timeline of AI Act application dates', snip: 'Obligations for GPAI models apply 12 months after entry into force, from 2 August 2025…' },
  { m: 'S', c: 'bg-amber-500', domain: 'stanford.edu', title: 'Compute thresholds and systemic risk', snip: 'A cumulative training compute above 10^25 FLOPs triggers a presumption of systemic risk…' },
  { m: 'L', c: 'bg-rose-500', domain: 'lexology.com', title: 'Penalties for GPAI providers explained', snip: 'Fines can reach 3% of worldwide annual turnover or €15 million, whichever is higher…' },
];
const REPORT = ['Executive summary', 'Timeline of obligations', 'What GPAI providers must publish', 'Systemic-risk duties', 'Open questions'];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function useReducedMotion() {
  const [reduce] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduce;
}

export type ResearchProgressProps = {
  question?: string;
  /** Real milliseconds are shown as research time multiplied by this factor. */
  timeScale?: number;
  className?: string;
};

/** A deep-research run that plans, searches, reads and writes, with a live source count. */
export function ResearchProgress({ question = 'How are EU AI Act obligations phased in for general-purpose AI models?', timeScale = 16, className }: ResearchProgressProps) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [t, setT] = useState(reduce ? TOTAL : 0);
  const [stopped, setStopped] = useState(false);
  const [run, setRun] = useState(0);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (reduce || !inView || stopped || tRef.current >= TOTAL) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      const dt = Math.max(0, now - last);
      last = now;
      tRef.current = Math.min(TOTAL, tRef.current + dt);
      acc += dt;
      if (acc > 40 || tRef.current >= TOTAL) {
        acc = 0;
        setT(tRef.current);
      }
      if (tRef.current < TOTAL) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stopped, run, reduce]);

  const restart = () => {
    tRef.current = 0;
    setT(0);
    setStopped(false);
    setRun((r) => r + 1);
  };

  const done = t >= TOTAL;
  const phaseIdx = PHASES.reduce((a, p, i) => (t >= p.from ? i : a), 0);
  const found = Math.round(clamp01((t - 1300) / 2400) ** 0.8 * 52);
  const read = Math.round(clamp01((t - 3800) / 3300) * 18);
  const queries = QUERIES.filter((_, i) => t >= 1300 + i * 480);
  const reading = SOURCES.filter((_, i) => t >= 3900 + i * 620);
  const planShown = PLAN.filter((_, i) => t >= 150 + i * 330);
  const secs = Math.floor((t * timeScale) / 1000);
  const clock = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div ref={ref} className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 text-left shadow-card', className)}>
      <div className="flex flex-wrap items-start gap-3 border-b border-white/5 px-4 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
          <Telescope className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500">Deep research</p>
          <p className="mt-0.5 text-sm leading-snug text-ink-100">{question}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] tabular-nums text-ink-400">{clock}</span>
          {done || stopped ? (
            <button onClick={restart} aria-label="Run the research again" className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 text-xs font-medium text-ink-200 shadow-hairline transition hover:bg-white/[0.08]">
              {stopped ? <Play className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />} {stopped ? 'Restart' : 'Run again'}
            </button>
          ) : (
            <button onClick={() => setStopped(true)} aria-label="Stop research" className="focus-ring flex h-8 items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 text-xs font-medium text-ink-200 shadow-hairline transition hover:bg-rose-500/15 hover:text-rose-200">
              <Square className="h-3 w-3 fill-current" /> Stop
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 px-4 pt-4">
        {PHASES.map((p, i) => {
          const prog = clamp01((t - p.from) / (p.to - p.from));
          const state = prog >= 1 ? 'done' : i === phaseIdx ? 'active' : 'todo';
          return (
            <div key={p.id} className="min-w-0">
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={cn('h-full rounded-full transition-[width] duration-200', state === 'done' ? 'bg-emerald-400' : 'bg-brand-400')} style={{ width: `${prog * 100}%` }} />
              </div>
              <p className={cn('mt-2 flex items-center gap-1.5 text-[11.5px] font-medium', state === 'todo' ? 'text-ink-600' : state === 'active' ? 'text-ink-50' : 'text-ink-400')}>
                {state === 'done' ? <Check className="h-3 w-3 shrink-0 text-emerald-400" /> : <p.icon className={cn('h-3 w-3 shrink-0', state === 'active' && 'text-brand-300')} />}
                <span className="truncate">{p.label}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-3">
          <div className="rounded-xl bg-ink-850/60 p-3 ring-1 ring-white/5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-500">Plan</p>
            <ol className="space-y-1.5">
              {planShown.map((q, i) => (
                <li key={q} className="flex gap-2 text-[12px] leading-snug text-ink-300 animate-fade-in">
                  <span className="font-mono text-[10.5px] text-ink-600">{i + 1}</span>
                  {q}
                </li>
              ))}
              {planShown.length === 0 && <li className="shimmer-text text-[12px]">Breaking the question down…</li>}
            </ol>
          </div>
          <div className="rounded-xl bg-ink-850/60 p-3 ring-1 ring-white/5">
            <p className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-ink-500">
              Queries <span className="font-mono normal-case tracking-normal tabular-nums">{queries.length}</span>
            </p>
            <ul className="space-y-1">
              {queries.map((q, i) => {
                const settled = t >= 1300 + i * 480 + 700;
                return (
                  <li key={q} className="flex items-center gap-2 text-[12px] animate-fade-in">
                    <Search className={cn('h-3 w-3 shrink-0', settled ? 'text-ink-500' : 'text-brand-300')} />
                    <span className={cn('min-w-0 flex-1 truncate', settled ? 'text-ink-300' : 'shimmer-text')}>{q}</span>
                    {settled && <span className="font-mono text-[10px] tabular-nums text-ink-600">{8 + ((i * 7) % 9)}</span>}
                  </li>
                );
              })}
              {queries.length === 0 && <li className="text-[12px] text-ink-600">Waiting for the plan…</li>}
            </ul>
          </div>
        </div>

        <div className="min-w-0 rounded-xl bg-ink-850/60 p-3 ring-1 ring-white/5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {SOURCES.slice(0, Math.min(5, Math.ceil(found / 10))).map((s) => (
                <span key={s.m} className={cn('grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-ink-850 animate-scale-in', s.c)}>
                  {s.m}
                </span>
              ))}
            </div>
            <p className="text-[12px] text-ink-400">
              <b className="font-mono text-[15px] font-semibold tabular-nums text-ink-50">{found}</b> sources found
              {read > 0 && (
                <span>
                  {' '}
                  · <b className="font-mono font-medium tabular-nums text-ink-200">{read}</b> read
                </span>
              )}
            </p>
          </div>
          {done ? (
            <div className="rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/5 animate-fade-up">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ink-50">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-500/15 text-emerald-300">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                Report ready
                <span className="ml-auto font-mono text-[10.5px] font-normal text-ink-500">38 citations · 2,400 words</span>
              </p>
              <ol className="mt-3 space-y-1.5 border-l border-white/10 pl-3">
                {REPORT.map((r, i) => (
                  <li key={r} className="text-[12px] text-ink-300">
                    <span className="mr-2 font-mono text-[10.5px] text-ink-600">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex gap-2">
                <button className="focus-ring rounded-lg bg-brand-300 px-3 py-1.5 text-[12px] font-medium text-brand-950 transition hover:bg-brand-200">Open report</button>
                <button className="focus-ring rounded-lg px-3 py-1.5 text-[12px] text-ink-300 shadow-hairline transition hover:bg-white/5">Export PDF</button>
              </div>
            </div>
          ) : t >= 7200 ? (
            <div className="space-y-2 rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/5">
              <p className="flex items-center gap-2 text-[12px] text-ink-200">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-300" /> Writing the report from {read} sources
              </p>
              {[92, 78, 86, 54].map((w, i) => (
                <div key={i} className="h-2 rounded-full bg-white/[0.06]" style={{ width: `${w * clamp01((t - 7200 - i * 300) / 900)}%` }} />
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {(reading.length ? reading : SOURCES.slice(0, 2)).map((s, i) => {
                const pending = reading.length === 0;
                const prog = pending ? 0 : clamp01((t - 3900 - i * 620) / 1100);
                return (
                  <li key={s.domain} className={cn('rounded-lg bg-white/[0.03] p-2.5 ring-1 ring-white/5', pending ? 'opacity-40' : 'animate-fade-up')}>
                    <div className="flex items-center gap-2">
                      <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded-full text-[8px] font-bold text-white', s.c)}>{s.m}</span>
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-100">{s.title}</span>
                      {prog >= 1 ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <span className="font-mono text-[10px] tabular-nums text-ink-500">{Math.round(prog * 100)}%</span>}
                    </div>
                    <p className="mt-1 truncate text-[11px] text-ink-500">{s.domain}</p>
                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-ink-400">{s.snip}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {stopped && !done && <p className="border-t border-white/5 px-4 py-2.5 text-[12px] text-amber-200/80">Stopped. A partial report from {read} sources is available.</p>}
    </div>
  );
}

export function ResearchProgressDemo() {
  return <ResearchProgress />;
}
