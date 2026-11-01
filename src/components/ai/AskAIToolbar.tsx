import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowDownToLine, Check, Copy, Languages, LoaderCircle, MessageCircleQuestion, Replace, Scissors, Sparkles, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AskAction = 'improve' | 'shorten' | 'translate' | 'explain' | 'ask';
type Sel = { para: number; start: number; end: number };
type Pos = { x: number; y: number; yb: number };

export type AskAIToolbarProps = {
  paragraphs: string[];
  /** Returns the AI result for a selection and action (`question` is set for "Ask…"). */
  respond: (text: string, action: AskAction, question?: string) => string;
  /** Selection shown on mount, so the toolbar is visible right away. */
  initialSelection?: Sel;
  className?: string;
};

const ACTIONS: { id: AskAction; label: string; icon: typeof Wand2 }[] = [
  { id: 'improve', label: 'Improve', icon: Wand2 },
  { id: 'shorten', label: 'Shorten', icon: Scissors },
  { id: 'translate', label: 'Translate', icon: Languages },
  { id: 'explain', label: 'Explain', icon: MessageCircleQuestion },
];

const reduce = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AskAIToolbar({ paragraphs: initial, respond, initialSelection, className }: AskAIToolbarProps) {
  const [paras, setParas] = useState(initial);
  const [sel, setSel] = useState<Sel | null>(initialSelection ?? null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<{ action: AskAction; text: string; shown: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const selected = sel ? paras[sel.para].slice(sel.start, sel.end) : '';

  // Re-measure when the layout shifts (web fonts loading, resizes).
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const ro = new ResizeObserver(() => setTick((t) => t + 1));
    ro.observe(r);
    document.fonts?.ready.then(() => setTick((t) => t + 1));
    return () => ro.disconnect();
  }, []);

  // Position the toolbar above the highlighted text.
  useEffect(() => {
    const m = mark.current;
    const r = root.current;
    if (!sel || !m || !r) return setPos(null);
    const a = m.getBoundingClientRect();
    const b = r.getBoundingClientRect();
    const x = Math.min(Math.max(a.left - b.left + a.width / 2, 150), b.width - 150);
    setPos({ x, y: a.top - b.top, yb: a.bottom - b.top });
  }, [sel, paras, tick]);

  const capture = () => {
    const s = window.getSelection();
    const text = s?.toString() ?? '';
    if (!s || !text.trim() || !root.current) return;
    const node = s.anchorNode?.parentElement?.closest('[data-para]') as HTMLElement | null;
    if (!node || !root.current.contains(node)) return;
    const i = Number(node.dataset.para);
    const start = paras[i].indexOf(text.trim());
    if (start < 0) return;
    s.removeAllRanges();
    setResult(null);
    setAsking(false);
    setSel({ para: i, start, end: start + text.trim().length });
  };

  const run = (action: AskAction, q?: string) => {
    if (!sel) return;
    timers.current.forEach(clearTimeout);
    const text = respond(selected, action, q);
    setAsking(false);
    if (reduce()) return setResult({ action, text, shown: text.length });
    setResult({ action, text, shown: 0 });
    const words = text.split(/(?<=\s)/);
    let n = 0;
    words.forEach((w, i) =>
      timers.current.push(
        window.setTimeout(() => {
          n += w.length;
          const len = n;
          setResult((r) => (r ? { ...r, shown: len } : r));
        }, 300 + i * 45),
      ),
    );
  };

  const apply = (mode: 'replace' | 'insert') => {
    if (!sel || !result) return;
    setParas((p) => {
      const copy = [...p];
      const t = copy[sel.para];
      if (mode === 'replace') copy[sel.para] = t.slice(0, sel.start) + result.text + t.slice(sel.end);
      else copy.splice(sel.para + 1, 0, result.text);
      return copy;
    });
    setSel(null);
    setResult(null);
  };

  const close = () => {
    setSel(null);
    setResult(null);
    setAsking(false);
  };

  const ask = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim()) run('ask', question);
  };

  const done = result && result.shown >= result.text.length;

  return (
    <div
      ref={root}
      onMouseUp={capture}
      onKeyUp={(e) => e.shiftKey && capture()}
      onKeyDown={(e) => e.key === 'Escape' && close()}
      className={cn('relative w-full rounded-2xl bg-ink-900 px-5 pb-6 pt-16 shadow-card sm:px-8', className)}
    >
      <p className="absolute left-5 top-5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-500 sm:left-8">
        <Sparkles className="h-3 w-3 text-brand-300" /> Select any text
      </p>
      <h3 className="text-lg font-medium tracking-tight text-ink-50">Q3 product update</h3>
      <div className="mt-3 space-y-3 text-[14.5px] leading-7 text-ink-300">
        {paras.map((p, i) => (
          <p key={i} data-para={i}>
            {sel && sel.para === i ? (
              <>
                {p.slice(0, sel.start)}
                <mark ref={mark} className="rounded bg-brand-400/25 px-0.5 text-ink-50 ring-1 ring-brand-400/40">
                  {p.slice(sel.start, sel.end)}
                </mark>
                {p.slice(sel.end)}
              </>
            ) : (
              p
            )}
          </p>
        ))}
      </div>

      {sel && pos && !result && (
        <div
          role="toolbar"
          aria-label="Ask AI about the selection"
          className="absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] animate-scale-in"
          style={{ left: pos.x, top: pos.y }}
        >
          {asking ? (
            <form onSubmit={ask} className="flex w-[280px] items-center gap-1.5 rounded-xl border border-white/10 bg-ink-850 p-1.5 shadow-pop">
              <input
                autoFocus
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about this…"
                aria-label="Question about the selection"
                className="min-w-0 flex-1 bg-transparent px-2 text-[13px] text-ink-50 outline-none placeholder:text-ink-500"
              />
              <button type="submit" className="focus-ring h-7 rounded-lg bg-brand-500 px-2.5 text-xs font-medium text-white">Ask</button>
            </form>
          ) : (
            <div className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-ink-850 p-1 shadow-pop">
              {ACTIONS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => run(id)} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-ink-200 transition-colors hover:bg-white/5 hover:text-ink-50">
                  <Icon className="h-3.5 w-3.5 text-brand-300" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
              <span className="mx-0.5 h-5 w-px bg-white/10" />
              <button onClick={() => setAsking(true)} className="focus-ring flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-brand-200 hover:bg-brand-500/10">
                <Sparkles className="h-3.5 w-3.5" /> Ask…
              </button>
            </div>
          )}
        </div>
      )}

      {sel && pos && result && (
        <div className="absolute inset-x-4 z-10 animate-fade-up sm:inset-x-auto sm:left-[var(--x)] sm:w-[360px] sm:-translate-x-1/2" style={{ top: pos.yb + 10, '--x': `${pos.x}px` } as CSSProperties}>
          <div className="rounded-xl border border-white/10 bg-ink-850 p-3 shadow-pop">
            <div className="mb-2 flex items-center justify-between text-[11px] text-ink-500">
              <span className="flex items-center gap-1.5 capitalize">
                {done ? <Sparkles className="h-3 w-3 text-brand-300" /> : <LoaderCircle className="h-3 w-3 animate-spin text-brand-300" />}
                {result.action === 'ask' ? 'Answer' : result.action}
              </span>
              <button onClick={close} aria-label="Close" className="focus-ring rounded p-0.5 hover:text-ink-200">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[13.5px] leading-6 text-ink-100">{result.text.slice(0, result.shown)}</p>
            {done && (
              <div className="mt-3 flex flex-wrap gap-1.5 animate-fade-in">
                {result.action !== 'explain' && result.action !== 'ask' && (
                  <button onClick={() => apply('replace')} className="focus-ring flex h-7 items-center gap-1 rounded-md bg-brand-500 px-2.5 text-xs font-medium text-white hover:bg-brand-400">
                    <Replace className="h-3 w-3" /> Replace
                  </button>
                )}
                <button onClick={() => apply('insert')} className="focus-ring flex h-7 items-center gap-1 rounded-md bg-white/5 px-2.5 text-xs text-ink-200 hover:bg-white/10">
                  <ArrowDownToLine className="h-3 w-3" /> Insert below
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(result.text).catch(() => {});
                    setCopied(true);
                    timers.current.push(window.setTimeout(() => setCopied(false), 1400));
                  }}
                  className="focus-ring flex h-7 items-center gap-1 rounded-md bg-white/5 px-2.5 text-xs text-ink-200 hover:bg-white/10"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const DOC = [
  'This quarter was a quarter in which the team worked on a lot of different things across many different areas of the product, and we made progress on most of them.',
  'Weekly active teams grew 38% to 1,840, driven mostly by the new onboarding checklist and the integrations launch in August.',
  'Next quarter we will focus on reliability, because mistakes in the September billing migration meant some customers were double-charged for about four hours.',
];

export function askRespond(text: string, action: AskAction, q?: string) {
  if (action === 'improve') return 'This quarter we shipped across the whole product and moved most of our goals forward.';
  if (action === 'shorten') return 'We made progress on most goals this quarter.';
  if (action === 'translate') return 'Este trimestre el equipo avanzó en casi todas las áreas del producto.';
  if (action === 'explain') return 'It says the team spread effort across many areas and moved most of them forward — useful context, but vague. Readers will want one or two concrete wins.';
  return `Good question${q ? ` — "${q}"` : ''}. Based on the update, the biggest driver was the onboarding checklist, followed by the integration launch.`;
}

export function AskAIToolbarDemo() {
  const p = DOC[0];
  const start = p.indexOf('the team worked');
  return (
    <div className="mx-auto w-full max-w-2xl">
      <AskAIToolbar paragraphs={DOC} respond={askRespond} initialSelection={{ para: 0, start, end: p.length }} />
    </div>
  );
}
