import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Check, ChevronDown, Database, FileCode2, FileSpreadsheet, FileText, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export type KbFile = {
  id: string;
  name: string;
  kind: 'pdf' | 'md' | 'csv' | 'doc';
  size: string;
  units: number;
  chunks: number;
  tokens: number;
  /** 0 → 4 through upload, parse, chunk, embed. 4 means ready. */
  stage: number;
};
export type KbChunk = { file: string; where: string; text: string };

const STAGES = ['Upload', 'Parse', 'Chunk', 'Embed'];
const ICON = { pdf: FileText, doc: FileText, md: FileCode2, csv: FileSpreadsheet };
const UNIT = { pdf: 'pages', doc: 'pages', md: 'sections', csv: 'rows' };
const STOP = new Set(['the', 'and', 'for', 'how', 'what', 'does', 'with', 'are', 'can', 'our', 'your', 'you', 'work', 'is', 'do']);

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));
const terms = (q: string) => q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.slice(0, 5));

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(\\b(?:${words.join('|')})[a-z]*)`, 'gi');
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded-[3px] bg-brand-400/20 px-0.5 text-brand-100">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function FileRow({ f }: { f: KbFile }) {
  const Icon = ICON[f.kind];
  const ready = f.stage >= 4;
  const k = Math.min(3, Math.floor(f.stage));
  const units = f.stage >= 2 ? f.units : 0;
  const chunks = f.chunks * Math.min(1, Math.max(0, f.stage - 2));
  const tokens = f.tokens * Math.min(1, Math.max(0, f.stage - 3));
  return (
    <li className="rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/5 animate-fade-up">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-ink-300">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink-100">{f.name}</span>
          <span className="block font-mono text-[11px] tabular-nums text-ink-500">
            {f.size} · {units ? `${units} ${UNIT[f.kind]}` : '—'} · {fmt(chunks)} chunks · {fmt(tokens)} tokens
          </span>
        </span>
        {ready ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            <Check className="h-3 w-3" /> Ready
          </span>
        ) : (
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-brand-300">{Math.round((f.stage / 4) * 100)}%</span>
        )}
      </div>
      {!ready && (
        <div className="mt-2.5">
          <div className="grid grid-cols-4 gap-1">
            {STAGES.map((s, i) => (
              <span key={s} className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span className={cn('block h-full rounded-full', i < k ? 'bg-brand-400/70' : 'bg-brand-400')} style={{ width: `${Math.min(1, Math.max(0, f.stage - i)) * 100}%` }} />
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-500">
            <span className="shimmer-text font-medium">{['Uploading', 'Parsing', 'Chunking', 'Embedding'][k]}…</span>
          </p>
        </div>
      )}
    </li>
  );
}

export type KnowledgeBaseProps = {
  name: string;
  files: KbFile[];
  chunks: KbChunk[];
  library?: KbFile[];
  examples?: string[];
  defaultQuery?: string;
  className?: string;
};

/** Sources indexed through upload, parse, chunk and embed, plus a retrieval tester that only searches ready files. */
export function KnowledgeBase({ name, files: initial, chunks, library = [], examples = [], defaultQuery = '', className }: KnowledgeBaseProps) {
  const [files, setFiles] = useState(initial);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState(defaultQuery);
  const [asked, setAsked] = useState(defaultQuery);
  const menuRef = useRef<HTMLDivElement>(null);
  const indexing = files.some((f) => f.stage < 4);

  useEffect(() => {
    if (!indexing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFiles((fs) => fs.map((f) => ({ ...f, stage: 4 })));
      return;
    }
    const id = window.setInterval(() => setFiles((fs) => fs.map((f) => (f.stage < 4 ? { ...f, stage: Math.min(4, f.stage + 0.045) } : f))), 50);
    return () => window.clearInterval(id);
  }, [indexing]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menu]);

  const ready = new Set(files.filter((f) => f.stage >= 4).map((f) => f.name));
  const words = terms(asked);
  const results = useMemo(() => {
    if (!words.length) return [];
    return chunks
      .filter((c) => ready.has(c.file))
      .map((c) => {
        const t = c.text.toLowerCase();
        const hits = words.reduce((n, w) => n + (t.match(new RegExp(`\\b${w}`, 'g'))?.length ?? 0), 0);
        const covered = words.filter((w) => new RegExp(`\\b${w}`).test(t)).length / words.length;
        return { c, score: hits ? 0.55 + covered * 0.33 + Math.min(0.09, hits * 0.02) : 0 };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked, chunks, files.filter((f) => f.stage >= 4).length]);

  const remaining = library.filter((l) => !files.some((f) => f.name === l.name));
  const total = files.reduce((a, f) => ({ chunks: a.chunks + (f.stage >= 4 ? f.chunks : 0), tokens: a.tokens + (f.stage >= 4 ? f.tokens : 0) }), { chunks: 0, tokens: 0 });

  const ask = (q: string) => {
    setQuery(q);
    setAsked(q);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAsked(query);
  };

  return (
    <div className={cn('grid w-full grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2', className)}>
      <section className="rounded-2xl bg-ink-900 p-4 shadow-card">
        <header className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-ink-200">
            <Database className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-50">{name}</p>
            <p className="font-mono text-[11px] tabular-nums text-ink-500">
              {files.length} sources · {fmt(total.chunks)} chunks · {fmt(total.tokens)} tokens
            </p>
          </div>
          <div ref={menuRef} className="relative shrink-0">
            <button onClick={() => setMenu((m) => !m)} disabled={!remaining.length} aria-expanded={menu} aria-haspopup="menu" className="focus-ring flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-ink-200 ring-1 ring-white/10 transition-colors hover:bg-white/5 disabled:opacity-40">
              <Plus className="h-3.5 w-3.5" /> Add
              <ChevronDown className={cn('h-3 w-3 transition-transform', menu && 'rotate-180')} />
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-20 w-56 rounded-xl bg-ink-850 p-1 shadow-pop animate-scale-in">
                {remaining.map((l) => {
                  const Icon = ICON[l.kind];
                  return (
                    <button
                      key={l.id}
                      role="menuitem"
                      onClick={() => {
                        setFiles((fs) => [...fs, { ...l, stage: 0 }]);
                        setMenu(false);
                      }}
                      className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-ink-200 hover:bg-white/5"
                    >
                      <Icon className="h-3.5 w-3.5 text-ink-400" />
                      <span className="min-w-0 flex-1 truncate">{l.name}</span>
                      <span className="font-mono text-[10px] text-ink-500">{l.size}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </header>
        <ul className="mt-3 space-y-2">
          {files.map((f) => (
            <FileRow key={f.id} f={f} />
          ))}
        </ul>
      </section>

      <section className="flex min-w-0 flex-col rounded-2xl bg-ink-900 p-4 shadow-card">
        <p className="text-sm font-medium text-ink-50">Test retrieval</p>
        <p className="text-xs text-ink-500">Searches only sources that finished indexing.</p>
        <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-xl bg-ink-950/60 px-3 ring-1 ring-white/10 transition-shadow focus-within:ring-brand-400/50">
          <Search className="h-4 w-4 shrink-0 text-ink-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask your knowledge base…" aria-label="Retrieval query" className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-600" />
          <kbd className="hidden rounded bg-white/5 px-1.5 font-mono text-[10px] text-ink-500 sm:block">↵</kbd>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {examples.map((q) => (
            <button key={q} onClick={() => ask(q)} className={cn('focus-ring rounded-full px-2.5 py-1 text-[11px] transition-colors', asked === q ? 'bg-brand-500/15 text-brand-200' : 'bg-white/[0.04] text-ink-400 hover:text-ink-100')}>
              {q}
            </button>
          ))}
        </div>
        <div className="mt-3 min-h-0 flex-1 space-y-2" aria-live="polite">
          {asked && (
            <p className="font-mono text-[11px] text-ink-500">
              {results.length ? `${results.length} chunks · ${42 + asked.length * 3}ms` : 'No matches in ready sources yet'}
            </p>
          )}
          {results.map(({ c, score }, i) => (
            <article key={`${asked}-${c.file}-${c.where}`} className="rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/5 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] tabular-nums text-brand-300">{score.toFixed(2)}</span>
                <span className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                  <span className="block h-full rounded-full bg-brand-400" style={{ width: `${score * 100}%` }} />
                </span>
                <span className="ml-auto truncate font-mono text-[10.5px] text-ink-500">
                  {c.file} · {c.where}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-300">
                <Highlight text={c.text} words={words} />
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ——— demo ——— */

const FILES: KbFile[] = [
  { id: 'f1', name: 'refund-policy.pdf', kind: 'pdf', size: '1.2 MB', units: 12, chunks: 48, tokens: 18200, stage: 4 },
  { id: 'f2', name: 'api-reference.md', kind: 'md', size: '340 KB', units: 34, chunks: 126, tokens: 51400, stage: 4 },
  { id: 'f3', name: 'pricing-2026.pdf', kind: 'pdf', size: '2.8 MB', units: 18, chunks: 64, tokens: 23900, stage: 1.6 },
];
const LIBRARY: KbFile[] = [
  { id: 'l1', name: 'support-macros.csv', kind: 'csv', size: '88 KB', units: 240, chunks: 31, tokens: 9800, stage: 0 },
  { id: 'l2', name: 'onboarding-guide.docx', kind: 'doc', size: '760 KB', units: 9, chunks: 27, tokens: 10400, stage: 0 },
];
const CHUNKS: KbChunk[] = [
  { file: 'refund-policy.pdf', where: 'p.4', text: 'Refunds are issued to the original payment method within 5 business days. Annual plans can be refunded in full within 30 days of purchase.' },
  { file: 'refund-policy.pdf', where: 'p.6', text: 'Duplicate charges are refunded automatically once billing confirms the second transaction. No ticket is needed.' },
  { file: 'api-reference.md', where: '§ Rate limits', text: 'The API allows 600 requests per minute per workspace. Exceeding the rate limit returns 429 with a Retry-After header.' },
  { file: 'api-reference.md', where: '§ Exports', text: 'Large exports run as background jobs. Poll the job endpoint or subscribe to the export.completed webhook.' },
  { file: 'pricing-2026.pdf', where: 'p.2', text: 'Enterprise pricing starts at 40 seats with SSO, audit logs and a dedicated success manager. Annual billing only.' },
  { file: 'pricing-2026.pdf', where: 'p.5', text: 'Seats can be added at any time and are prorated. Refunds for removed seats are applied as account credit.' },
  { file: 'support-macros.csv', where: 'row 112', text: 'Macro: double charge. Apologize, confirm the refund timeline of 5 business days, and link the refund policy.' },
  { file: 'onboarding-guide.docx', where: 'p.3', text: 'Invite teammates from Settings → Members. New members inherit the workspace rate limits and export permissions.' },
];

export function KnowledgeBaseDemo() {
  return (
    <KnowledgeBase
      name="Support knowledge"
      files={FILES}
      library={LIBRARY}
      chunks={CHUNKS}
      examples={['How do refunds work?', 'API rate limits', 'Enterprise pricing']}
      defaultQuery="How do refunds work?"
    />
  );
}
