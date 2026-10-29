import { useEffect, useState, type ReactNode } from 'react';
import { Check, Code2, Copy, Download, Eye, FileCode2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ArtifactVersion = { id: string; prompt: string; summary: string; code: string; preview: ReactNode };

export type ArtifactPanelProps = {
  title: string;
  versions: ArtifactVersion[];
  /** Characters revealed per frame while the latest version streams in. */
  speed?: number;
  className?: string;
};

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tokens(line: string) {
  const out: ReactNode[] = [];
  const re = /("[^"]*"|'[^']*'|`[^`]*`)|(\b(?:export|function|return|const|import|from)\b)|(<\/?[A-Za-z][\w.]*|\/?>)|(\b[a-zA-Z]+(?==))|([{}()[\]])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? 'text-emerald-300' : m[2] ? 'text-rose-300' : m[3] ? 'text-sky-300' : m[4] ? 'text-amber-200' : 'text-ink-500';
    out.push(
      <span key={m.index} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function ArtifactPanel({ title, versions, speed = 6, className }: ArtifactPanelProps) {
  const latest = versions.length - 1;
  const [index, setIndex] = useState(latest);
  const [view, setView] = useState<'code' | 'preview'>('code');
  const [shown, setShown] = useState(() => (reducedMotion() ? versions[latest].code.length : 0));
  const [copied, setCopied] = useState(false);
  const v = versions[index];
  const streaming = index === latest && shown < v.code.length;

  useEffect(() => {
    if (index !== latest || shown >= versions[latest].code.length) return;
    let raf = 0;
    const tick = () => {
      setShown((s) => {
        const n = Math.min(versions[latest].code.length, s + speed);
        if (n < versions[latest].code.length) raf = requestAnimationFrame(tick);
        return n;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const prev = index > 0 ? new Set(versions[index - 1].code.split('\n').map((l) => l.trim())) : null;
  const text = index === latest ? v.code.slice(0, shown) : v.code;
  const lines = text.split('\n');
  const changed = v.code.split('\n').map((l) => !!prev && !!l.trim() && !prev.has(l.trim()));
  const changedCount = changed.filter(Boolean).length;

  const copy = () => {
    navigator.clipboard?.writeText(v.code).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([v.code], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('grid w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card md:grid-cols-[minmax(0,230px)_minmax(0,1fr)]', className)}>
      <div className="flex flex-col gap-2.5 border-b border-white/5 p-3 md:border-b-0 md:border-r">
        {versions.map((ver, i) => (
          <div key={ver.id} className="space-y-1.5">
            <p className="ml-auto w-fit max-w-[95%] rounded-2xl rounded-br-md bg-ink-800 px-3 py-1.5 text-[12.5px] leading-snug text-ink-100">{ver.prompt}</p>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'focus-ring flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all',
                i === index ? 'bg-brand-500/[0.08] shadow-[0_0_0_1px_rgba(56,189,248,0.4)]' : 'shadow-hairline hover:bg-white/[0.03]',
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-brand-300">
                <FileCode2 className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-ink-100">{title}</span>
                <span className="block truncate text-[11px] text-ink-500">{ver.summary}</span>
              </span>
              <span className="font-mono text-[10px] text-ink-500">v{i + 1}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 px-3 py-2">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-200">
            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-ink-400" />
            <span className="truncate font-mono">{title}</span>
          </span>
          <div className="flex items-center rounded-lg bg-ink-950/60 p-0.5" role="tablist" aria-label="Version">
            {versions.map((ver, i) => (
              <button
                key={ver.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={cn('focus-ring relative rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors', i === index ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-500 hover:text-ink-200')}
              >
                v{i + 1}
                {i === latest && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-brand-400" />}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="flex rounded-lg bg-ink-950/60 p-0.5">
              {(['code', 'preview'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setView(k)}
                  className={cn('focus-ring flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize transition-colors', view === k ? 'bg-ink-800 text-ink-50 shadow-hairline' : 'text-ink-500 hover:text-ink-200')}
                >
                  {k === 'code' ? <Code2 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {k}
                  {k === 'preview' && view === 'code' && !streaming && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
            <button type="button" onClick={copy} aria-label="Copy code" className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              {copied ? <Check className="h-3.5 w-3.5 animate-scale-in text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={download} aria-label="Download file" className="focus-ring flex h-7 w-7 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100">
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {view === 'code' ? (
          <pre className="min-h-[300px] flex-1 overflow-x-auto bg-ink-950/50 py-3 font-mono text-[12px] leading-[1.7]">
            {lines.map((l, i) => (
              <div key={i} className={cn('flex pr-4 transition-colors duration-700', changed[i] && !streaming ? 'bg-emerald-500/[0.08] shadow-[inset_2px_0_0_rgba(52,211,153,0.7)]' : '')}>
                <span className="w-10 shrink-0 select-none pr-3 text-right text-ink-600">{i + 1}</span>
                <span className="whitespace-pre text-ink-200">
                  {tokens(l)}
                  {streaming && i === lines.length - 1 && <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[2px] animate-blink bg-brand-400" />}
                </span>
              </div>
            ))}
          </pre>
        ) : (
          <div className="dot-bg flex min-h-[300px] flex-1 items-center justify-center bg-ink-950/50 p-6">
            <div key={v.id} className={cn(!reducedMotion() && 'animate-scale-in')}>
              {v.preview}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-white/5 px-3 py-2 text-[11px] text-ink-500">
          {streaming ? (
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-brand-300" /> <span className="shimmer-text">Writing v{index + 1}…</span>
            </span>
          ) : (
            <span>
              v{index + 1} · {v.code.split('\n').length} lines
              {index > 0 && <span className="text-emerald-400"> · {changedCount} changed</span>}
            </span>
          )}
          {index !== latest && (
            <button type="button" onClick={() => setIndex(latest)} className="focus-ring ml-auto rounded-md px-2 py-0.5 text-brand-300 transition-colors hover:bg-brand-500/10">
              Back to latest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ——— Demo: a pricing card that evolves over three prompts ——— */

function PricingPreview({ badge, yearlyToggle, accent }: { badge?: boolean; yearlyToggle?: boolean; accent?: boolean }) {
  const [yearly, setYearly] = useState(true);
  const price = yearlyToggle && yearly ? 19 : 24;
  return (
    <div className={cn('w-[230px] rounded-2xl bg-ink-900 p-5 transition-shadow', accent ? 'shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_16px_40px_-12px_rgba(56,189,248,0.35)]' : 'shadow-card')}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-100">Pro</p>
        {badge && <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-medium text-brand-300">Most popular</span>}
      </div>
      {yearlyToggle && (
        <div className="mt-3 flex rounded-lg bg-ink-950/70 p-0.5 text-[11px]">
          {['Monthly', 'Yearly −20%'].map((l, i) => (
            <button key={l} type="button" onClick={() => setYearly(i === 1)} className={cn('flex-1 rounded-md py-1 transition-colors', yearly === (i === 1) ? 'bg-ink-800 text-ink-50' : 'text-ink-500')}>
              {l}
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-semibold tracking-tight text-ink-50">${price}</span>
        <span className="pb-1 text-xs text-ink-500">/mo</span>
      </p>
      <ul className="mt-3 space-y-1.5">
        {['Unlimited projects', 'Priority support', 'Advanced analytics'].map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-ink-300">
            <Check className="h-3.5 w-3.5 text-brand-300" /> {f}
          </li>
        ))}
      </ul>
      <button type="button" className={cn('mt-4 w-full rounded-lg py-2 text-xs font-medium transition-colors', accent ? 'bg-brand-500 text-white hover:bg-brand-400' : 'bg-ink-50 text-ink-950 hover:bg-white')}>
        {accent ? 'Start free trial' : 'Get started'}
      </button>
    </div>
  );
}

const card = (o: { badge?: boolean; toggle?: boolean; accent?: boolean }) =>
  [
    'export function PricingCard() {',
    o.toggle ? '  const [yearly, setYearly] = useState(true);' : '',
    '  return (',
    `    <div className="${o.accent ? 'card card--featured' : 'card'}">`,
    '      <h3>Pro</h3>',
    o.badge ? '      <span className="badge">Most popular</span>' : '',
    o.toggle ? "      <Toggle options={['Monthly', 'Yearly −20%']} value={yearly} />" : '',
    `      <p className="price">${o.toggle ? '${yearly ? 19 : 24}' : '$24'}<span>/mo</span></p>`,
    '      <ul>',
    '        <li>Unlimited projects</li>',
    '        <li>Priority support</li>',
    '        <li>Advanced analytics</li>',
    '      </ul>',
    `      <button className="${o.accent ? 'cta cta--brand' : 'cta'}">${o.accent ? 'Start free trial' : 'Get started'}</button>`,
    '    </div>',
    '  );',
    '}',
  ]
    .filter(Boolean)
    .join('\n');

const VERSIONS: ArtifactVersion[] = [
  { id: 'v1', prompt: 'Make a pricing card for the Pro plan', summary: 'Pro plan card', code: card({}), preview: <PricingPreview /> },
  { id: 'v2', prompt: 'Add a “Most popular” badge and make it pop', summary: 'Badge and brand accent', code: card({ badge: true, accent: true }), preview: <PricingPreview badge accent /> },
  { id: 'v3', prompt: 'Add a yearly toggle with 20% off', summary: 'Monthly / yearly toggle', code: card({ badge: true, accent: true, toggle: true }), preview: <PricingPreview badge accent yearlyToggle /> },
];

export function ArtifactPanelDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <ArtifactPanel title="PricingCard.tsx" versions={VERSIONS} speed={5} />
    </div>
  );
}
