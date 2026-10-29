import { Fragment, useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, LoaderCircle, Play, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KW = /^(import|from|as|def|return|for|in|if|else|print|with|lambda|True|False|None)$/;

/** Tiny Python highlighter: keywords, strings, numbers, comments, calls. */
function Highlight({ line }: { line: string }) {
  if (line.trimStart().startsWith('#')) return <span className="text-ink-500">{line}</span>;
  return (
    <>
      {line.split(/("[^"]*"|'[^']*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*(?=\()|\b[A-Za-z_]\w*\b)/g).map((t, i) => {
        if (!t) return null;
        if (/^["']/.test(t)) return <span key={i} className="text-emerald-300">{t}</span>;
        if (/^\d/.test(t)) return <span key={i} className="text-amber-300">{t}</span>;
        if (KW.test(t)) return <span key={i} className="text-violet-300">{t}</span>;
        if (/^[A-Za-z_]\w*$/.test(t) && line.slice(line.indexOf(t) + t.length).startsWith('(')) return <span key={i} className="text-brand-300">{t}</span>;
        return <Fragment key={i}>{t}</Fragment>;
      })}
    </>
  );
}

const CODE = (bug: boolean) => `import pandas as pd

df = pd.read_csv("sessions.csv")
by_hour = df.groupby("hour")["${bug ? 'sesion_len' : 'session_len'}"].mean()
print(f"Loaded {len(df):,} rows")
print("Peak hour:", by_hour.idxmax())
by_hour.plot(kind="bar")
by_hour.to_csv("sessions_by_hour.csv")`;

const BARS = [3.1, 2.2, 1.6, 1.4, 2.0, 3.4, 4.8, 5.6, 6.1, 5.2, 6.6, 7.4];
const STDOUT = ['Loaded 12,480 rows', 'Peak hour: 19:00', 'Saved sessions_by_hour.csv (1.2 KB)'];

export type CodeInterpreterProps = { autoRun?: boolean; className?: string };

/** A notebook-style run cell: code → elapsed timer → stdout → chart and a downloadable file. */
export function CodeInterpreter({ autoRun = true, className }: CodeInterpreterProps) {
  const [bug, setBug] = useState(false);
  const [state, setState] = useState<'idle' | 'running' | 'ok' | 'error'>('idle');
  const [lines, setLines] = useState(0);
  const [ms, setMs] = useState(0);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!run) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const fast = reduced();
    setState('running');
    setLines(0);
    const t0 = performance.now();
    const tick = window.setInterval(() => setMs(performance.now() - t0), 60);
    const end = (s: 'ok' | 'error', after: number) =>
      timers.current.push(
        window.setTimeout(() => {
          clearInterval(tick);
          setMs(fast ? 1240 : performance.now() - t0);
          setState(s);
        }, after),
      );
    if (bug) end('error', fast ? 0 : 900);
    else {
      STDOUT.forEach((_, i) => timers.current.push(window.setTimeout(() => setLines(i + 1), fast ? 0 : 420 + i * 380)));
      end('ok', fast ? 0 : 1500);
    }
    return () => clearInterval(tick);
  }, [run, bug]);

  useEffect(() => {
    if (!autoRun) return;
    const id = window.setTimeout(() => setRun((r) => r + 1), 300);
    return () => clearTimeout(id);
  }, [autoRun]);

  const download = () => {
    const csv = 'hour,session_len\n' + BARS.map((b, i) => `${i * 2}:00,${b.toFixed(1)}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sessions_by_hour.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const code = CODE(bug).split('\n');
  const max = Math.max(...BARS);

  return (
    <div className={cn('w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card', className)}>
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
        <span className="font-mono text-[11px] text-ink-500">[{state === 'idle' ? ' ' : state === 'running' ? '*' : run}]</span>
        <span className="min-w-0 truncate text-sm text-ink-200">analysis.py</span>
        <span className="hidden rounded bg-white/[0.05] px-1.5 py-px font-mono text-[10px] text-ink-500 sm:inline">Python 3.12</span>
        <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap text-[11px] text-ink-500">
          <input type="checkbox" checked={bug} onChange={(e) => setBug(e.target.checked)} className="peer sr-only" />
          <span className="relative h-4 w-7 rounded-full bg-white/10 transition-colors peer-checked:bg-rose-500/60 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/60">
            <span className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all', bug ? 'left-3.5' : 'left-0.5')} />
          </span>
          <span className="hidden sm:inline">Error variant</span>
          <span className="sm:hidden">Error</span>
        </label>
        <button
          onClick={() => setRun((r) => r + 1)}
          disabled={state === 'running'}
          className="focus-ring flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-500 px-2.5 text-xs font-medium text-white transition-all hover:bg-brand-400 active:scale-95 disabled:opacity-60"
        >
          {state === 'running' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : state === 'idle' ? <Play className="h-3.5 w-3.5 fill-current" /> : <RotateCcw className="h-3.5 w-3.5" />}
          {state === 'idle' ? 'Run' : state === 'running' ? 'Running' : 'Re-run'}
        </button>
      </div>

      <pre className="overflow-x-auto px-3 py-3 font-mono text-[12px] leading-[1.7] text-ink-200 [scrollbar-width:thin]">
        {code.map((l, i) => (
          <div key={i} className={cn('flex', bug && l.includes('sesion_len') && 'bg-rose-500/10')}>
            <span className="w-6 shrink-0 select-none pr-2 text-right text-ink-600">{i + 1}</span>
            <span className="whitespace-pre">
              <Highlight line={l} />
            </span>
          </div>
        ))}
      </pre>

      {state !== 'idle' && (
        <div className="space-y-3 border-t border-white/5 bg-ink-950/40 px-3 py-3">
          <p className="flex items-center gap-2 font-mono text-[11px] text-ink-500">
            <span className={cn('h-1.5 w-1.5 rounded-full', state === 'running' ? 'animate-pulse bg-amber-400' : state === 'ok' ? 'bg-emerald-400' : 'bg-rose-400')} />
            {state === 'running' ? 'Running' : state === 'ok' ? 'Finished' : 'Failed'} · <span className="tabular-nums">{(ms / 1000).toFixed(2)}s</span>
          </p>
          {state === 'error' ? (
            <div className="rounded-xl bg-rose-500/[0.07] p-3 ring-1 ring-rose-400/20 animate-fade-in">
              <p className="flex items-center gap-1.5 font-mono text-[12px] text-rose-300">
                <TriangleAlert className="h-3.5 w-3.5" /> KeyError: 'sesion_len'
              </p>
              <p className="mt-1 font-mono text-[11px] text-ink-500">line 4, did you mean 'session_len'?</p>
              <button onClick={() => setBug(false)} className="focus-ring mt-2.5 flex h-7 items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 text-xs text-ink-100 transition-colors hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5 text-brand-400" /> Fix and re-run
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-0.5 font-mono text-[12px] text-ink-300">
                {STDOUT.slice(0, lines).map((l) => (
                  <p key={l} className="animate-fade-in">{l}</p>
                ))}
              </div>
              {state === 'ok' && (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">
                    <p className="mb-2 text-[11px] text-ink-500">Avg session length by hour (min)</p>
                    <svg viewBox="0 0 240 90" className="h-24 w-full" role="img" aria-label="Bar chart of session length by hour">
                      {BARS.map((b, i) => {
                        const h = (b / max) * 74;
                        return <rect key={i} x={i * 20 + 3} y={82 - h} width="14" height={h} rx="2.5" className={cn('origin-bottom transition-all', i === 11 ? 'fill-brand-400' : 'fill-white/20')} style={{ transformBox: 'fill-box', animation: reduced() ? undefined : `ci-grow 700ms ${i * 40}ms cubic-bezier(0.16,1,0.3,1) both` }} />;
                      })}
                      <line x1="0" x2="240" y1="82.5" y2="82.5" stroke="rgba(255,255,255,0.1)" />
                    </svg>
                    <style>{'@keyframes ci-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}'}</style>
                  </div>
                  <button onClick={download} className="focus-ring flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5 text-left ring-1 ring-white/5 transition-colors hover:bg-white/[0.06] animate-fade-up">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                    <span>
                      <span className="block text-xs text-ink-100">sessions_by_hour.csv</span>
                      <span className="block font-mono text-[10px] text-ink-500">1.2 KB · CSV</span>
                    </span>
                    <Download className="ml-2 h-4 w-4 text-ink-400" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CodeInterpreterDemo() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <CodeInterpreter />
    </div>
  );
}
